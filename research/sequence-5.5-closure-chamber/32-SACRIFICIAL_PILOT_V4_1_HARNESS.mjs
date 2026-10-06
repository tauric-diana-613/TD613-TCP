// TD613 Sequence 5.5 Pilot V4.1 runner.
// Bound to receiver-clean stimulus files in 05-PILOT_V4_FIXTURES/
// Prohibits research manifest metadata from entering receiver prompt.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import handler from '../../api/sequence-55-pilot-v4.js';

const ROOT = process.env.TD613_ROOT || process.cwd();
const BASE = path.join(ROOT, 'research/sequence-5.5-closure-chamber');
const BINDING_MANIFEST = JSON.parse(fs.readFileSync(path.join(BASE, '31-PILOT_V4_1_EXECUTION_BINDING_MANIFEST.json'), 'utf8'));
const RECEIPT_SCHEMA = JSON.parse(fs.readFileSync(path.join(BASE, '31-PILOT_V4_1_RECEIPT_SCHEMA.json'), 'utf8'));
const OUT = path.join(BASE, '32-PILOT_V4_1_RAW_OUTPUTS');
const RECEIPTS = path.join(BASE, '32-PILOT_V4_1_RECEIPTS');
const MANIFEST_PATH = path.join(BASE, '32-PILOT_V4_1_RAW_OUTPUTS_MANIFEST.json');
const MODEL = 'gemini-3.8-flash';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent';
const EXPECTED_FP = '51efc3d87cdffc4fb2869519ff4fa12b10ce179ba79d3976f6094cf741681c39';
const EPISODE = 'EPISODE_SACRIFICIAL_PILOT_V4_1';

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
      'CLUSTER_A',
      'CLUSTER_B',
      'CLUSTER_C',
      'CLUSTER_D',
      'CLUSTER_E',
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
      'chronology laundering',
      'cannot differentiate',
      'is required'
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

  if (rc.schema !== "td613.sequence5.5.execution-receipt/v4.1") errors.push(`Invalid schema: ${rc.schema}`);
  if (rc.episode_id !== "EPISODE_SACRIFICIAL_PILOT_V4_1") errors.push(`Invalid episode_id: ${rc.episode_id}`);
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
  if (verifiedCount !== 50) {
    throw new Error(`PRE-EXECUTION GATE FAILED: Expected 50 verified units, got ${verifiedCount}`);
  }
  console.log(`PRE-EXECUTION GATE PASSED: 50 / 50 units verified.`);

  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(RECEIPTS, { recursive: true });

  const manifest = {
    schema: 'td613.sequence5.5.pilot-v4-1-raw-outputs-manifest/v1.0',
    episode_id: EPISODE,
    canonical_branch: 'research/sequence-5.5-amari-closure-20261006',
    execution_started_at: new Date().toISOString(),
    execution_completed_at: null,
    total_units_authorized: 50,
    units_completed: 0,
    total_wire_invocations: 0,
    failed_or_retry_count: 0,
    unit_results: []
  };

  let totalWireCalls = 0;
  let totalRetries = 0;

  for (let i = 0; i < BINDING_MANIFEST.deterministic_run_order.length; i++) {
    const unitId = BINDING_MANIFEST.deterministic_run_order[i];
    const unitDef = BINDING_MANIFEST.execution_units.find(u => u.unit_id === unitId);
    console.log(`[${i + 1}/50] Executing ${unitId} (arm: ${unitDef.arm}, fixture: ${unitDef.fixture_id})...`);

    let completed = false;
    let attempts = 0;
    let lastResult = null;

    while (!completed && attempts < 3) {
      totalWireCalls++;
      if (attempts > 0) totalRetries++;
      console.log(`  Attempt ${attempts}...`);

      const routeResult = await callRoute(unitId, attempts);
      lastResult = routeResult;

      const rawResponseText = routeResult.raw_provider_response_text;
      const receipt = routeResult.receipt;

      // Save raw response
      const rawPath = path.join(OUT, `raw_response_${unitId}.json`);
      fs.writeFileSync(rawPath, typeof rawResponseText === 'string' ? rawResponseText : JSON.stringify(rawResponseText, null, 2), 'utf8');

      // Save parsed output if valid
      if (routeResult.parsed_output) {
        const parsedPath = path.join(OUT, `parsed_output_${unitId}.json`);
        fs.writeFileSync(parsedPath, JSON.stringify(routeResult.parsed_output, null, 2) + '\n', 'utf8');
      }

      // Validate receipt against schema
      const receiptErrors = validateReceipt(receipt);
      if (receiptErrors.length > 0) {
        console.error(`  RECEIPT SCHEMA ERROR on ${unitId}:`, receiptErrors);
        throw new Error(`Receipt validation failed: ${receiptErrors.join('; ')}`);
      }

      // Save receipt
      const receiptPath = path.join(RECEIPTS, `receipt_${unitId}.json`);
      fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + '\n', 'utf8');

      if (routeResult.ok) {
        console.log(`  SUCCESS on attempt ${attempts}. Verdict: ${routeResult.parsed_output?.verdict}`);
        completed = true;
      } else {
        console.warn(`  ATTEMPT FAILED (${attempts}): status=${receipt.provider_receipt.status_code}, parsing=${receipt.output_provenance.parsing_validation_status}`);
        attempts++;
        if (attempts < 3) await delay(2000);
      }
    }

    if (!completed) {
      console.error(`FATAL: Unit ${unitId} exhausted all 3 attempts without success.`);
      manifest.unit_results.push({
        unit_id: unitId,
        status: 'EXHAUSTED',
        attempts
      });
      break;
    }

    manifest.units_completed++;
    manifest.unit_results.push({
      unit_id: unitId,
      status: 'COMPLETED',
      attempts: attempts + 1,
      verdict: lastResult.parsed_output?.verdict,
      receipt_sha256: sha256(fs.readFileSync(path.join(RECEIPTS, `receipt_${unitId}.json`)))
    });

    // Pacing delay between units
    await delay(1200);
  }

  manifest.execution_completed_at = new Date().toISOString();
  manifest.total_wire_invocations = totalWireCalls;
  manifest.failed_or_retry_count = totalRetries;

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`\nEpisode ${EPISODE} execution complete. Manifest written to ${MANIFEST_PATH}.`);
  console.log(`Completed ${manifest.units_completed}/50 units. Wire calls: ${totalWireCalls}, Retries: ${totalRetries}.`);
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
