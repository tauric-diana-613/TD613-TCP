// TD613 Sequence 5.5 Pilot V3B runner.
// Bound to receiver-clean stimulus files in 04-PILOT_V3B_FIXTURES/
// Prohibits research manifest metadata from entering receiver prompt.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import handler from '../../api/sequence-55-pilot-v3b.js';

const ROOT = process.env.TD613_ROOT || process.cwd();
const BASE = path.join(ROOT, 'research/sequence-5.5-closure-chamber');
const BINDING_MANIFEST = JSON.parse(fs.readFileSync(path.join(BASE, '27-PILOT_V3B_EXECUTION_BINDING_MANIFEST.json'), 'utf8'));
const RECEIPT_SCHEMA = JSON.parse(fs.readFileSync(path.join(BASE, '27-PILOT_V3B_RECEIPT_SCHEMA.json'), 'utf8'));
const OUT = path.join(BASE, '28-PILOT_V3B_RAW_OUTPUTS');
const RECEIPTS = path.join(BASE, '28-PILOT_V3B_RECEIPTS');
const MANIFEST_PATH = path.join(BASE, '28-PILOT_V3B_RAW_OUTPUTS_MANIFEST.json');
const MODEL = 'gemini-3.8-flash';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent';
const EXPECTED_FP = '51efc3d87cdffc4fb2869519ff4fa12b10ce179ba79d3976f6094cf741681c39';
const EPISODE = 'EPISODE_SACRIFICIAL_PILOT_V3B';

const isVerifyOnly = process.argv.includes('--verify-only');

function sha256(val) {
  return crypto.createHash('sha256').update(val).digest('hex');
}

// Verification function: checks that every prompt is assembled strictly from:
// treatment bytes + receiver-clean fixture bytes + output schema + neutral execution wrapper
export function verifyPromptAssembly() {
  const schemaText = fs.readFileSync(path.join(BASE, '10-RECEIVER_OUTPUT_SCHEMA.json'), 'utf8');
  const wrapper = `[TD613_EXECUTION_UNIT_WRAPPER_v3.0]
=== SYSTEM_INSTRUCTION_HEADER ===
{{TREATMENT_BYTES}}
=== EVALUATION_FIXTURE_HEADER ===
{{FIXTURE_BYTES}}
=== OUTPUT_SCHEMA_CONTRACT ===
{{RECEIVER_OUTPUT_SCHEMA_BYTES}}
=== RECEIVER_EXECUTION_DIRECTIVE ===
Evaluate the fixture above according to the system instruction protocol. Return a single strictly valid JSON object adhering exactly to the 10-RECEIVER_OUTPUT_SCHEMA.json specification. Do not output markdown code block fences, commentary, or text outside the JSON object.
=== END_OF_EXECUTION_UNIT ===`;

  let verifiedCount = 0;
  for (const unit of BINDING_MANIFEST.execution_units) {
    const treatment = fs.readFileSync(path.join(BASE, `02-TREATMENT_PACKETS/packet-${unit.arm}.md`), 'utf8');
    const fixture = fs.readFileSync(path.join(BASE, unit.fixture_path), 'utf8');
    
    // Safety check: verify no leaked ontology words exist in the fixture
    const forbidden = [
      'CLUSTER_',
      'CONSTRUCT:',
      'observability conflation',
      'restored identifiability',
      'necessary abstention',
      'observation nullspace',
      'rank deficiency',
      'quotient stage erasure',
      'support fibre',
      'predecessor-head chaining',
      'preemption gap',
      'chronology laundering'
    ];
    for (const term of forbidden) {
      if (fixture.toLowerCase().includes(term.toLowerCase())) {
        throw new Error(`LEAKAGE DETECTED: Fixture ${unit.fixture_id} contains forbidden term "${term}"`);
      }
    }

    const assembled = wrapper
      .replace('{{TREATMENT_BYTES}}', treatment)
      .replace('{{FIXTURE_BYTES}}', fixture)
      .replace('{{RECEIVER_OUTPUT_SCHEMA_BYTES}}', schemaText);

    const hash = sha256(assembled);
    if (hash !== unit.prompt_sha256) {
      throw new Error(`Hash mismatch for ${unit.unit_id}: expected ${unit.prompt_sha256}, got ${hash}`);
    }
    verifiedCount++;
  }
  return verifiedCount;
}

function validateReceipt(rc) {
  const errors = [];
  if (!rc || typeof rc !== 'object' || Array.isArray(rc)) return ['Receipt is not an object'];

  const requiredTop = [
    "schema", "episode_id", "execution_id", "unit_id", "arm", "fixture_id", "is_pilot",
    "receiver_identity", "credential_and_billing_provenance", "temporal_provenance",
    "input_provenance", "output_provenance", "provider_receipt", "usage_realized_dose"
  ];
  for (const k of requiredTop) {
    if (!(k in rc)) errors.push(`Missing top-level property: ${k}`);
  }
  for (const k of Object.keys(rc)) {
    if (!requiredTop.includes(k)) errors.push(`Unknown top-level property: ${k}`);
  }

  if (rc.schema !== "td613.sequence5.5.execution-receipt/v3b.0") errors.push(`Invalid schema: ${rc.schema}`);
  if (rc.episode_id !== "EPISODE_SACRIFICIAL_PILOT_V3B") errors.push(`Invalid episode_id: ${rc.episode_id}`);
  if (typeof rc.execution_id !== "string") errors.push(`Invalid execution_id: ${rc.execution_id}`);
  if (typeof rc.unit_id !== "string") errors.push(`Invalid unit_id: ${rc.unit_id}`);
  if (!["K0", "K0D", "K1", "K2", "K3"].includes(rc.arm)) errors.push(`Invalid arm: ${rc.arm}`);
  if (typeof rc.fixture_id !== "string") errors.push(`Invalid fixture_id: ${rc.fixture_id}`);
  if (rc.is_pilot !== true) errors.push(`Invalid is_pilot: ${rc.is_pilot}`);

  const ri = rc.receiver_identity;
  if (!ri || typeof ri !== 'object' || Array.isArray(ri)) {
    errors.push('receiver_identity must be an object');
  } else {
    if (ri.provider !== "google") errors.push(`Invalid provider: ${ri.provider}`);
    if (ri.exact_model_id !== "gemini-3.8-flash") errors.push(`Invalid exact_model_id: ${ri.exact_model_id}`);
    if (ri.runtime_or_harness !== "vercel-preview/server-fetch") errors.push(`Invalid runtime_or_harness: ${ri.runtime_or_harness}`);
    const ms = ri.model_settings;
    if (ms) {
      if (ms.temperature !== null) errors.push(`Invalid temperature: ${ms.temperature}`);
      if (ms.sampling_parameters_set_by_protocol !== false) errors.push(`Invalid sampling_parameters_set_by_protocol: ${ms.sampling_parameters_set_by_protocol}`);
      if (ms.thinking_level !== "medium") errors.push(`Invalid thinking_level: ${ms.thinking_level}`);
      if (!Number.isInteger(ms.max_output_tokens)) errors.push(`Invalid max_output_tokens: ${ms.max_output_tokens}`);
      if (ms.response_mime_type !== "application/json") errors.push(`Invalid response_mime_type: ${ms.response_mime_type}`);
    }
  }

  const cbp = rc.credential_and_billing_provenance;
  if (!cbp || typeof cbp !== 'object') {
    errors.push('credential_and_billing_provenance must be an object');
  } else {
    if (cbp.credential_source_name !== "GEMINI_API_KEY") errors.push(`Invalid credential_source_name: ${cbp.credential_source_name}`);
    if (cbp.credential_fingerprint_sha256 !== EXPECTED_FP) errors.push(`Invalid credential fingerprint: ${cbp.credential_fingerprint_sha256}`);
  }

  const tp = rc.temporal_provenance;
  if (!tp || typeof tp !== 'object') {
    errors.push('temporal_provenance must be an object');
  } else {
    if (typeof tp.request_started_at !== "string") errors.push(`Invalid request_started_at`);
    if (typeof tp.response_completed_at !== "string") errors.push(`Invalid response_completed_at`);
    if (!Number.isInteger(tp.duration_ms) || tp.duration_ms < 0) errors.push(`Invalid duration_ms: ${tp.duration_ms}`);
  }

  const ip = rc.input_provenance;
  if (!ip || typeof ip !== 'object') {
    errors.push('input_provenance must be an object');
  } else {
    if (typeof ip.treatment_sha256 !== "string") errors.push('Missing treatment_sha256');
    if (typeof ip.fixture_sha256 !== "string") errors.push('Missing fixture_sha256');
    if (typeof ip.bound_prompt_sha256 !== "string") errors.push('Missing bound_prompt_sha256');
    if (typeof ip.receiver_output_schema_sha256 !== "string") errors.push('Missing receiver_output_schema_sha256');
    if (typeof ip.fixed_wrapper_sha256 !== "string") errors.push('Missing fixed_wrapper_sha256');
  }

  const op = rc.output_provenance;
  if (!op || typeof op !== 'object') {
    errors.push('output_provenance must be an object');
  } else {
    if (typeof op.raw_response_sha256 !== "string") errors.push('Missing raw_response_sha256');
    if (op.raw_response_preserved_unmodified !== true) errors.push('raw_response_preserved_unmodified must be true');
    if (!["VALID", "INVALID_JSON", "INVALID_SCHEMA", "PARSING_SKIPPED_ON_FAILURE"].includes(op.parsing_validation_status)) {
      errors.push(`Invalid parsing_validation_status: ${op.parsing_validation_status}`);
    }
  }

  return errors;
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function callRoute(unitId, attempt) {
  let responsePayload = null;
  const req = {
    method: 'GET',
    query: { unit: unitId, attempt }
  };
  const res = {
    setHeader: () => {},
    statusCode: 200,
    end: (str) => {
      responsePayload = JSON.parse(str);
    }
  };
  await handler(req, res);
  return responsePayload;
}

async function main() {
  if (isVerifyOnly) {
    const count = verifyPromptAssembly();
    console.log(`[VERIFY-ONLY] Successfully verified ${count} receiver-clean execution units.`);
    process.exit(0);
  }

  const KEY = process.env.GEMINI_API_KEY || '';
  if (!KEY) throw new Error('GEMINI_API_KEY must be supplied by the execution environment.');
  const fp = sha256(Buffer.from(KEY, 'utf8'));
  if (fp !== EXPECTED_FP) throw new Error(`Credential fingerprint mismatch: expected ${EXPECTED_FP}, got ${fp}`);

  // Step 1: Verification gate before first execution
  console.log('Running pre-execution prompt assembly verification gate...');
  const verifiedCount = verifyPromptAssembly();
  if (verifiedCount !== 25) {
    throw new Error(`Pre-execution verification failed: expected 25 units, got ${verifiedCount}`);
  }
  console.log(`Pre-execution prompt assembly gate: ${verifiedCount}/25 VERIFIED.`);

  // Step 2: Ensure clean output directories
  if (fs.existsSync(OUT) || fs.existsSync(RECEIPTS)) {
    const outFiles = fs.existsSync(OUT) ? fs.readdirSync(OUT) : [];
    const receiptFiles = fs.existsSync(RECEIPTS) ? fs.readdirSync(RECEIPTS) : [];
    if (outFiles.length > 0 || receiptFiles.length > 0) {
      throw new Error('Pilot V3B output namespaces already contain artifacts; fresh-start runner refuses ambiguous reuse.');
    }
  }
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(RECEIPTS, { recursive: true });

  // Configure environment required by api/sequence-55-pilot-v3b.js preview route
  process.env.VERCEL_ENV = 'preview';
  process.env.VERCEL_GIT_COMMIT_REF = 'research/sequence-5.5-amari-closure-20261006';

  const runOrder = BINDING_MANIFEST.deterministic_run_order;
  console.log(`\n=== ${EPISODE} ===`);
  console.log(`Receiver: ${MODEL} (thinking: medium)`);
  console.log(`Deterministic run order: ${runOrder.length} units`);
  console.log(`Credential fingerprint verified: ${fp}`);

  const allLedger = [];
  let unitIndex = 0;
  let allCompleted = true;

  for (const unitId of runOrder) {
    unitIndex++;
    console.log(`\n[${unitIndex}/${runOrder.length}] Unit: ${unitId}`);
    let attempt = 0;
    let unitSuccess = false;
    const maxAttempts = 3;

    while (attempt < maxAttempts && !unitSuccess) {
      if (attempt > 0) {
        const backoffMs = attempt === 1 ? 10000 : 15000;
        console.log(`  Pacing backoff: waiting ${backoffMs}ms before attempt ${attempt}...`);
        await delay(backoffMs);
      }

      console.log(`  Invoking ${unitId} (Attempt ${attempt})...`);
      const payload = await callRoute(unitId, attempt);
      const receipt = payload.receipt;

      // Strict validation of the generated receipt against schema
      const schemaErrors = validateReceipt(receipt);
      if (schemaErrors.length > 0) {
        console.error(`FATAL: Receipt schema validation failed for ${unitId} attempt ${attempt}:`, schemaErrors);
        throw new Error(`Receipt schema validation failed: ${schemaErrors.join('; ')}`);
      }

      const receiptStr = JSON.stringify(receipt, null, 2) + '\n';
      const rawText = payload.raw_provider_response_text;

      const ledgerEntry = {
        execution_id: receipt.execution_id,
        unit_id: unitId,
        arm: receipt.arm,
        fixture_id: receipt.fixture_id,
        request_started_at: receipt.temporal_provenance.request_started_at,
        status_code: receipt.provider_receipt.status_code,
        retry_ordinal: attempt,
        retry_reason: receipt.provider_receipt.retry_reason,
        duration_ms: receipt.temporal_provenance.duration_ms,
        parsing_status: receipt.output_provenance.parsing_validation_status,
        raw_hash: receipt.output_provenance.raw_response_sha256,
        parsed_hash: receipt.output_provenance.parsed_response_sha256,
        input_tokens: receipt.usage_realized_dose.reported_input_tokens,
        output_tokens: receipt.usage_realized_dose.reported_output_tokens,
        total_tokens: receipt.usage_realized_dose.reported_total_tokens,
        provider_request_id: receipt.provider_receipt.provider_request_id
      };
      allLedger.push(ledgerEntry);

      if (attempt === 0) {
        if (payload.ok) {
          fs.writeFileSync(path.join(OUT, `raw_response_${unitId}.json`), rawText, 'utf8');
          fs.writeFileSync(path.join(RECEIPTS, `receipt_${unitId}.json`), receiptStr, 'utf8');
          fs.writeFileSync(path.join(OUT, `parsed_output_${unitId}.json`), JSON.stringify(payload.parsed_output, null, 2) + '\n', 'utf8');
          unitSuccess = true;
          console.log(`  -> SUCCESS (status: ${receipt.provider_receipt.status_code}, verdict: ${payload.parsed_output?.verdict}, parsing: ${receipt.output_provenance.parsing_validation_status}, tier: ${receipt.provider_receipt.x_gemini_service_tier || 'N/A'})`);
        } else {
          fs.writeFileSync(path.join(OUT, `raw_response_${unitId}_attempt0.json`), rawText, 'utf8');
          fs.writeFileSync(path.join(RECEIPTS, `receipt_${unitId}_attempt0.json`), receiptStr, 'utf8');
          console.warn(`  -> NON-SUCCESS on attempt 0 (status: ${receipt.provider_receipt.status_code}, parsing: ${receipt.output_provenance.parsing_validation_status})`);
          attempt++;
        }
      } else {
        fs.writeFileSync(path.join(OUT, `raw_response_${unitId}_attempt${attempt}.json`), rawText, 'utf8');
        fs.writeFileSync(path.join(RECEIPTS, `receipt_${unitId}_attempt${attempt}.json`), receiptStr, 'utf8');
        if (payload.ok) {
          fs.writeFileSync(path.join(OUT, `parsed_output_${unitId}.json`), JSON.stringify(payload.parsed_output, null, 2) + '\n', 'utf8');
          unitSuccess = true;
          console.log(`  -> SUCCESS on retry ${attempt} (status: ${receipt.provider_receipt.status_code}, verdict: ${payload.parsed_output?.verdict}, parsing: ${receipt.output_provenance.parsing_validation_status}, tier: ${receipt.provider_receipt.x_gemini_service_tier || 'N/A'})`);
        } else {
          console.warn(`  -> NON-SUCCESS on attempt ${attempt} (status: ${receipt.provider_receipt.status_code}, parsing: ${receipt.output_provenance.parsing_validation_status})`);
          attempt++;
        }
      }
    }

    if (!unitSuccess) {
      console.error(`FATAL: Unit ${unitId} failed all ${maxAttempts} attempts. Halting episode.`);
      allCompleted = false;
      break;
    }

    // Pacing delay between isolated units
    await delay(3000);
  }

  // Generate raw outputs manifest
  const completedUnitIds = new Set(
    allLedger.filter(l => l.status_code === 200 && l.parsing_status === 'VALID').map(l => l.unit_id)
  );

  const summaryManifest = {
    schema: "td613.sequence5.5.raw-pilot-outputs-manifest/v3b.0",
    episode_id: EPISODE,
    created_at: new Date().toISOString(),
    total_authorized_units: runOrder.length,
    uniquely_completed_units: completedUnitIds.size,
    total_invocations_attempted: allLedger.length,
    successful_invocations: allLedger.filter(l => l.status_code === 200 && l.parsing_status === 'VALID').length,
    failed_invocations: allLedger.filter(l => l.status_code !== 200 || l.parsing_status !== 'VALID').length,
    pilot_raw_freeze_status: completedUnitIds.size === runOrder.length ? "READY_FOR_FREEZE" : "INCOMPLETE_OR_HELD",
    execution_ledger: allLedger
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(summaryManifest, null, 2) + '\n', 'utf8');

  console.log(`\n=== EXECUTION RUN COMPLETED ===`);
  console.log(`Uniquely completed units: ${completedUnitIds.size}/${runOrder.length}`);
  console.log(`Total wire invocations: ${allLedger.length}`);
  console.log(`Status: ${summaryManifest.pilot_raw_freeze_status}`);

  if (!allCompleted) {
    process.exitCode = 1;
  }
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exitCode = 1;
});
