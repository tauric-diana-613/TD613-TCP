import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const projectRoot = process.env.TD613_ROOT || process.cwd();
const baseDir = path.join(projectRoot, 'research/sequence-5.5-closure-chamber');
const rawOutputDir = path.join(baseDir, '13-RAW_PILOT_OUTPUTS');
const receiptDir = path.join(baseDir, '13-RAW_PILOT_RECEIPTS');

fs.mkdirSync(rawOutputDir, { recursive: true });
fs.mkdirSync(receiptDir, { recursive: true });

// Read API Key from environment or .env
let apiKey = process.env.GEMINI_API_KEY || '';
if (!apiKey && fs.existsSync(path.join(projectRoot, '.env'))) {
  const dotenv = fs.readFileSync(path.join(projectRoot, '.env'), 'utf8');
  dotenv.split('\n').forEach(l => {
    const [k, v] = l.trim().split('=');
    if (k === 'GEMINI_API_KEY') apiKey = v;
  });
}
if (!apiKey) {
  throw new Error('GEMINI_API_KEY missing from environment and .env');
}

// Load sealed manifest and authorization receipt
const manifest = JSON.parse(fs.readFileSync(path.join(baseDir, '07-SEALED_EXECUTION_BUNDLE_MANIFEST.json'), 'utf8'));
const authReceipt = JSON.parse(fs.readFileSync(path.join(baseDir, '12-PILOT_EXECUTION_AUTHORIZATION_RECEIPT.json'), 'utf8'));
const receiverSchemaText = fs.readFileSync(path.join(baseDir, '10-RECEIVER_OUTPUT_SCHEMA.json'), 'utf8');

const fixedWrapperTemplate = `[TD613_EXECUTION_UNIT_WRAPPER_v3.0]
=== SYSTEM_INSTRUCTION_HEADER ===
{{TREATMENT_BYTES}}
=== EVALUATION_FIXTURE_HEADER ===
{{FIXTURE_BYTES}}
=== OUTPUT_SCHEMA_CONTRACT ===
{{RECEIVER_OUTPUT_SCHEMA_BYTES}}
=== RECEIVER_EXECUTION_DIRECTIVE ===
Evaluate the fixture above according to the system instruction protocol. Return a single strictly valid JSON object adhering exactly to the 10-RECEIVER_OUTPUT_SCHEMA.json specification. Do not output markdown code block fences, commentary, or text outside the JSON object.
=== END_OF_EXECUTION_UNIT ===`;

// Function to validate parsed response against 10-RECEIVER_OUTPUT_SCHEMA.json
function validateReceiverOutput(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  if (typeof obj.finding_id !== 'string') return false;
  if (!['PASS', 'FAIL', 'HELD', 'INCONCLUSIVE'].includes(obj.verdict)) return false;
  if (!Array.isArray(obj.identified_issues)) return false;
  if (!Array.isArray(obj.evidence)) return false;
  if (typeof obj.recommended_action !== 'string') return false;
  if (!['HIGH', 'MEDIUM', 'LOW'].includes(obj.confidence)) return false;
  return true;
}

const runOrder = authReceipt.deterministic_run_order;
console.log(`Starting Sacrificial Pilot Execution across ${runOrder.length} units with non-destructive retry logging...`);

const allInvocationsLedger = [];

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Check existing receipts from earlier run
function checkExistingInvocations() {
  const existing = {};
  for (const f of fs.readdirSync(receiptDir)) {
    if (f.startsWith('receipt_') && f.endsWith('.json')) {
      const p = path.join(receiptDir, f);
      try {
        const rc = JSON.parse(fs.readFileSync(p, 'utf8'));
        const unitId = `UNIT_${rc.arm}_${rc.fixture_id}`;
        existing[unitId] = existing[unitId] || [];
        existing[unitId].push(rc);
      } catch (e) {}
    }
  }
  return existing;
}

// Preserve existing failed receipt for UNIT_K2_PILOT-04 if present
const existingFiles = fs.readdirSync(receiptDir);
if (existingFiles.includes('receipt_UNIT_K2_PILOT-04.json') && !existingFiles.includes('receipt_UNIT_K2_PILOT-04_attempt0.json')) {
  const oldReceipt = JSON.parse(fs.readFileSync(path.join(receiptDir, 'receipt_UNIT_K2_PILOT-04.json'), 'utf8'));
  if (oldReceipt.provider_receipt.status_code !== 200) {
    // Rename to attempt0 to preserve historical record
    oldReceipt.execution_id = 'EXEC-UNIT_K2_PILOT-04-attempt-0';
    oldReceipt.provider_receipt.retry_reason = 'HTTP_503_SERVICE_UNAVAILABLE';
    oldReceipt.output_provenance.raw_response_path = 'research/sequence-5.5-closure-chamber/13-RAW_PILOT_OUTPUTS/raw_response_UNIT_K2_PILOT-04_attempt0.json';
    fs.writeFileSync(path.join(receiptDir, 'receipt_UNIT_K2_PILOT-04_attempt0.json'), JSON.stringify(oldReceipt, null, 2) + '\n', 'utf8');
    fs.unlinkSync(path.join(receiptDir, 'receipt_UNIT_K2_PILOT-04.json'));
    
    // Copy raw response
    const oldRaw = fs.readFileSync(path.join(rawOutputDir, 'raw_response_UNIT_K2_PILOT-04.json'), 'utf8');
    fs.writeFileSync(path.join(rawOutputDir, 'raw_response_UNIT_K2_PILOT-04_attempt0.json'), oldRaw, 'utf8');
    fs.unlinkSync(path.join(rawOutputDir, 'raw_response_UNIT_K2_PILOT-04.json'));
    console.log('Preserved failed attempt 0 for UNIT_K2_PILOT-04 under non-destructive retry law.');
  }
}

async function executeSingleCall(unitMeta, ordinal, attemptOrdinal, retryReason = null) {
  const { arm, fixture_id, cluster, execution_unit_sha256, unit_id } = unitMeta;

  const treatmentText = fs.readFileSync(path.join(baseDir, `02-TREATMENT_PACKETS/packet-${arm}.md`), 'utf8');
  const fixtureText = fs.readFileSync(path.join(baseDir, `04-PILOT_FIXTURES/${fixture_id}.md`), 'utf8');

  const promptText = fixedWrapperTemplate
    .replace('{{TREATMENT_BYTES}}', treatmentText)
    .replace('{{FIXTURE_BYTES}}', fixtureText)
    .replace('{{RECEIVER_OUTPUT_SCHEMA_BYTES}}', receiverSchemaText);

  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";
  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: promptText }]
      }
    ],
    generationConfig: {
      temperature: 0.0,
      maxOutputTokens: 8192,
      responseMimeType: "application/json"
    }
  };

  const headers = {
    "content-type": "application/json",
    "x-goog-api-key": apiKey
  };

  const attemptSuffix = attemptOrdinal > 0 ? `_attempt${attemptOrdinal}` : '';
  const executionId = attemptOrdinal > 0 ? `EXEC-${unit_id}-attempt-${attemptOrdinal}` : `EXEC-${unit_id}`;
  const coordinate = `gemini-3.5-flash × node-fetch/server-gemini-transport × ${fixture_id} × ${arm}`;

  console.log(`[${ordinal}/${runOrder.length}] Invoking ${unit_id} (Attempt ${attemptOrdinal}) [${coordinate}]...`);

  const tStart = new Date().toISOString();
  const t0 = Date.now();
  let resp, rawResponseText, statusCode, durationMs;

  try {
    resp = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });
    durationMs = Date.now() - t0;
    statusCode = resp.status;
    rawResponseText = await resp.text();
  } catch (netErr) {
    durationMs = Date.now() - t0;
    statusCode = null;
    rawResponseText = JSON.stringify({ network_error: netErr.message });
  }
  const tEnd = new Date().toISOString();

  // Save raw response unmodified
  const rawFileName = `raw_response_${unit_id}${attemptSuffix}.json`;
  const rawRelPath = `research/sequence-5.5-closure-chamber/13-RAW_PILOT_OUTPUTS/${rawFileName}`;
  fs.writeFileSync(path.join(rawOutputDir, rawFileName), rawResponseText, 'utf8');

  const rawHash = crypto.createHash('sha256').update(rawResponseText, 'utf8').digest('hex');

  let providerJson = null;
  let modelAnswerText = null;
  let parsedObject = null;
  let parsingStatus = "INVALID_JSON";
  let parsedHash = null;
  let providerRequestId = null;
  let inputTokens = "TOKEN_USAGE_UNAVAILABLE";
  let outputTokens = "TOKEN_USAGE_UNAVAILABLE";
  let totalTokens = "TOKEN_USAGE_UNAVAILABLE";

  if (statusCode === 200) {
    try {
      providerJson = JSON.parse(rawResponseText);
      providerRequestId = providerJson.responseId || null;
      if (providerJson.usageMetadata) {
        inputTokens = providerJson.usageMetadata.promptTokenCount ?? "TOKEN_USAGE_UNAVAILABLE";
        outputTokens = providerJson.usageMetadata.candidatesTokenCount ?? "TOKEN_USAGE_UNAVAILABLE";
        totalTokens = providerJson.usageMetadata.totalTokenCount ?? "TOKEN_USAGE_UNAVAILABLE";
      }

      modelAnswerText = providerJson.candidates?.[0]?.content?.parts?.[0]?.text;
      if (modelAnswerText) {
        parsedObject = JSON.parse(modelAnswerText);
        if (validateReceiverOutput(parsedObject)) {
          parsingStatus = "VALID";
        } else {
          parsingStatus = "INVALID_SCHEMA";
        }
        const parsedStr = JSON.stringify(parsedObject, null, 2) + '\n';
        parsedHash = crypto.createHash('sha256').update(parsedStr, 'utf8').digest('hex');
        
        // Save parsed output artifact
        fs.writeFileSync(
          path.join(rawOutputDir, `parsed_output_${unit_id}.json`),
          parsedStr,
          'utf8'
        );
      }
    } catch (parseErr) {
      parsingStatus = "INVALID_JSON";
    }
  } else {
    parsingStatus = "PARSING_SKIPPED_ON_FAILURE";
  }

  // Create receipt adhering strictly to 11-EXECUTION_RECEIPT_SCHEMA.json
  const receipt = {
    schema: "td613.sequence5.5.execution-receipt/v1.0",
    execution_id: executionId,
    execution_unit_sha256: execution_unit_sha256,
    coordinate: coordinate,
    arm: arm,
    fixture_id: fixture_id,
    cluster: cluster,
    is_pilot: true,
    receiver_identity: {
      provider: "google",
      exact_model_id: "gemini-3.5-flash",
      runtime_or_harness: "node-fetch/server-gemini-transport",
      runtime_version: "node-v24.14.0/gemini-v1beta",
      endpoint_or_execution_class: endpoint,
      model_settings: {
        temperature: 0,
        seed: null,
        reasoning_or_thinking_setting: "thinking_default",
        max_output_tokens: 8192,
        tool_permissions: []
      }
    },
    temporal_provenance: {
      request_started_at: tStart,
      response_completed_at: tEnd,
      duration_ms: durationMs
    },
    input_provenance: {
      treatment_sha256: manifest.treatment_packets[arm].sha256,
      fixture_sha256: manifest.pilot_fixtures[fixture_id].sha256,
      receiver_output_schema_sha256: manifest.fixed_components.receiver_output_schema.sha256,
      fixed_wrapper_sha256: manifest.fixed_components.fixed_wrapper_template.sha256,
      exact_input_sha256: execution_unit_sha256
    },
    output_provenance: {
      raw_response_sha256: rawHash,
      raw_response_path: rawRelPath,
      raw_response_preserved_unmodified: true,
      parsed_response_sha256: parsedHash,
      parsing_validation_status: parsingStatus
    },
    provider_receipt: {
      provider_request_id: providerRequestId,
      controller_task_id: `CONTROLLER-PILOT-${String(ordinal).padStart(2, '0')}${attemptSuffix}`,
      status_code: statusCode,
      retry_ordinal: attemptOrdinal,
      retry_reason: retryReason
    },
    usage_realized_dose: {
      reported_input_tokens: inputTokens,
      reported_output_tokens: outputTokens,
      reported_total_tokens: totalTokens
    }
  };

  const receiptFileName = `receipt_${unit_id}${attemptSuffix}.json`;
  const receiptStr = JSON.stringify(receipt, null, 2) + '\n';
  fs.writeFileSync(path.join(receiptDir, receiptFileName), receiptStr, 'utf8');

  console.log(`   -> Status: ${statusCode} | Duration: ${durationMs}ms | Verdict: ${parsedObject?.verdict || 'N/A'} | Schema: ${parsingStatus}`);

  const ledgerEntry = {
    ordinal,
    attempt_ordinal: attemptOrdinal,
    unit_id,
    arm,
    fixture_id,
    cluster,
    status_code: statusCode,
    duration_ms: durationMs,
    verdict: parsedObject?.verdict || null,
    confidence: parsedObject?.confidence || null,
    parsing_status: parsingStatus,
    raw_hash: rawHash,
    parsed_hash: parsedHash,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    total_tokens: totalTokens,
    provider_request_id: providerRequestId,
    retry_reason: retryReason
  };

  return { ok: statusCode === 200 && parsingStatus === "VALID", ledgerEntry };
}

async function main() {
  const existingMap = checkExistingInvocations();
  let ordinal = 1;

  for (const unitId of runOrder) {
    const unitMeta = manifest.pilot_execution_units.find(u => u.unit_id === unitId);
    
    // Check if this unit already has a valid 200 OK receipt
    const priorReceipts = existingMap[unitId] || [];
    const validPrior = priorReceipts.find(r => r.provider_receipt.status_code === 200 && r.output_provenance.parsing_validation_status === 'VALID');

    if (validPrior) {
      console.log(`[${ordinal}/${runOrder.length}] Unit ${unitId} already completed (Status 200, Valid). Preserving prior receipt.`);
      allInvocationsLedger.push({
        ordinal,
        attempt_ordinal: validPrior.provider_receipt.retry_ordinal,
        unit_id: unitId,
        arm: validPrior.arm,
        fixture_id: validPrior.fixture_id,
        cluster: validPrior.cluster,
        status_code: 200,
        duration_ms: validPrior.temporal_provenance.duration_ms,
        verdict: JSON.parse(fs.readFileSync(path.join(rawOutputDir, `parsed_output_${unitId}.json`), 'utf8')).verdict,
        confidence: JSON.parse(fs.readFileSync(path.join(rawOutputDir, `parsed_output_${unitId}.json`), 'utf8')).confidence,
        parsing_status: "VALID",
        raw_hash: validPrior.output_provenance.raw_response_sha256,
        parsed_hash: validPrior.output_provenance.parsed_response_sha256,
        input_tokens: validPrior.usage_realized_dose.reported_input_tokens,
        output_tokens: validPrior.usage_realized_dose.reported_output_tokens,
        total_tokens: validPrior.usage_realized_dose.reported_total_tokens,
        provider_request_id: validPrior.provider_receipt.provider_request_id,
        retry_reason: validPrior.provider_receipt.retry_reason
      });
      ordinal++;
      continue;
    }

    // Determine current attempt ordinal based on prior failed receipts
    let attemptOrdinal = priorReceipts.length;
    let success = false;
    const maxAttempts = 3;

    while (attemptOrdinal < maxAttempts && !success) {
      const retryReason = attemptOrdinal > 0 ? 'PREVIOUS_ATTEMPT_NON_200' : null;
      if (attemptOrdinal > 0) {
        console.log(`Pacing delay of 10s before retry attempt ${attemptOrdinal}...`);
        await delay(10000);
      }

      const res = await executeSingleCall(unitMeta, ordinal, attemptOrdinal, retryReason);
      allInvocationsLedger.push(res.ledgerEntry);

      if (res.ok) {
        success = true;
      } else {
        console.warn(`Attempt ${attemptOrdinal} for ${unitId} failed with status ${res.ledgerEntry.status_code}.`);
        if (attemptOrdinal === 0) {
          const oldRPath = path.join(receiptDir, `receipt_${unitId}.json`);
          const newRPath = path.join(receiptDir, `receipt_${unitId}_attempt0.json`);
          if (fs.existsSync(oldRPath)) {
            const oldR = JSON.parse(fs.readFileSync(oldRPath, 'utf8'));
            oldR.execution_id = `EXEC-${unitId}-attempt-0`;
            oldR.output_provenance.raw_response_path = `research/sequence-5.5-closure-chamber/13-RAW_PILOT_OUTPUTS/raw_response_${unitId}_attempt0.json`;
            fs.writeFileSync(newRPath, JSON.stringify(oldR, null, 2) + '\n', 'utf8');
            fs.unlinkSync(oldRPath);
          }
          const oldRawPath = path.join(rawOutputDir, `raw_response_${unitId}.json`);
          const newRawPath = path.join(rawOutputDir, `raw_response_${unitId}_attempt0.json`);
          if (fs.existsSync(oldRawPath)) {
            fs.renameSync(oldRawPath, newRawPath);
          }
        }
        attemptOrdinal++;
      }
    }

    if (!success) {
      console.error(`Unit ${unitId} failed all ${maxAttempts} attempts. Halting under Instruction V.`);
      break;
    }

    ordinal++;
    // Polite pacing delay between isolated units
    await delay(3000);
  }

  // Load all receipts into chronological execution ledger
  const allReceiptFiles = fs.readdirSync(receiptDir).filter(f => f.startsWith('receipt_') && f.endsWith('.json'));
  const fullLedger = [];
  for (const rf of allReceiptFiles) {
    const rc = JSON.parse(fs.readFileSync(path.join(receiptDir, rf), 'utf8'));
    fullLedger.push({
      execution_id: rc.execution_id,
      unit_id: `UNIT_${rc.arm}_${rc.fixture_id}`,
      arm: rc.arm,
      fixture_id: rc.fixture_id,
      cluster: rc.cluster,
      request_started_at: rc.temporal_provenance.request_started_at,
      status_code: rc.provider_receipt.status_code,
      retry_ordinal: rc.provider_receipt.retry_ordinal,
      retry_reason: rc.provider_receipt.retry_reason,
      duration_ms: rc.temporal_provenance.duration_ms,
      parsing_status: rc.output_provenance.parsing_validation_status,
      raw_hash: rc.output_provenance.raw_response_sha256,
      parsed_hash: rc.output_provenance.parsed_response_sha256,
      input_tokens: rc.usage_realized_dose.reported_input_tokens,
      output_tokens: rc.usage_realized_dose.reported_output_tokens,
      total_tokens: rc.usage_realized_dose.reported_total_tokens,
      provider_request_id: rc.provider_receipt.provider_request_id
    });
  }
  fullLedger.sort((a, b) => a.request_started_at.localeCompare(b.request_started_at));

  // Count uniquely completed units
  const completedUnitIds = new Set(
    fullLedger.filter(l => l.status_code === 200 && l.parsing_status === 'VALID').map(l => l.unit_id)
  );

  const summaryManifest = {
    schema: "td613.sequence5.5.raw-pilot-outputs-manifest/v1.0",
    created_at: new Date().toISOString(),
    total_authorized_units: runOrder.length,
    uniquely_completed_units: completedUnitIds.size,
    total_invocations_attempted: fullLedger.length,
    successful_invocations: fullLedger.filter(l => l.status_code === 200 && l.parsing_status === 'VALID').length,
    failed_invocations: fullLedger.filter(l => l.status_code !== 200 || l.parsing_status !== 'VALID').length,
    pilot_raw_freeze_status: completedUnitIds.size === runOrder.length ? "READY_FOR_FREEZE" : "INCOMPLETE_OR_HELD",
    execution_ledger: fullLedger
  };

  fs.writeFileSync(
    path.join(baseDir, '13-RAW_PILOT_OUTPUTS_MANIFEST.json'),
    JSON.stringify(summaryManifest, null, 2) + '\n',
    'utf8'
  );

  console.log('Sacrificial pilot runner cycle complete.');
  console.log(`Uniquely completed units: ${completedUnitIds.size}/${runOrder.length}`);
  console.log(`Total invocations: ${fullLedger.length} (Successes: ${summaryManifest.successful_invocations}, Failures: ${summaryManifest.failed_invocations})`);
}

main();
