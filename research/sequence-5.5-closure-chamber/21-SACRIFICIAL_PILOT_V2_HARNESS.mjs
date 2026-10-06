// TD613 Sequence 5.5 Pilot V2 runner.
// Historical 3.5 harness remains at 16-SACRIFICIAL_PILOT_HARNESS.mjs.
// This runner MUST NOT read .env and MUST NOT reuse 13-* artifacts.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import handler from '../../api/sequence-55-pilot-v2.js';

const ROOT = process.env.TD613_ROOT || process.cwd();
const BASE = path.join(ROOT, 'research/sequence-5.5-closure-chamber');
const AUTH = JSON.parse(fs.readFileSync(path.join(BASE, '19-PILOT_V2_EXECUTION_AUTHORIZATION.json'), 'utf8'));
const MANIFEST = JSON.parse(fs.readFileSync(path.join(BASE, '07-SEALED_EXECUTION_BUNDLE_MANIFEST.json'), 'utf8'));
const OUT = path.join(BASE, '19-PILOT_V2_RAW_OUTPUTS');
const RECEIPTS = path.join(BASE, '19-PILOT_V2_RECEIPTS');
const MANIFEST_PATH = path.join(BASE, '19-PILOT_V2_RAW_OUTPUTS_MANIFEST.json');
const KEY = process.env.GEMINI_API_KEY || '';
const MODEL = 'gemini-3.8-flash';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent';
const EXPECTED_FP = AUTH.credential_binding.credential_fingerprint_sha256;

if (!KEY) throw new Error('GEMINI_API_KEY must be supplied by the execution environment; .env fallback is forbidden for Pilot V2.');
const fp = crypto.createHash('sha256').update(KEY, 'utf8').digest('hex');
if (fp !== EXPECTED_FP) throw new Error('Credential fingerprint mismatch; refusing Pilot V2 execution.');

if (fs.existsSync(OUT) || fs.existsSync(RECEIPTS)) {
  const outFiles = fs.existsSync(OUT) ? fs.readdirSync(OUT) : [];
  const receiptFiles = fs.existsSync(RECEIPTS) ? fs.readdirSync(RECEIPTS) : [];
  if (outFiles.length > 0 || receiptFiles.length > 0) {
    throw new Error('Pilot V2 output namespaces already contain artifacts; fresh-start runner refuses ambiguous reuse.');
  }
}
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(RECEIPTS, { recursive: true });

// Configure environment required by api/sequence-55-pilot-v2.js preview route
process.env.VERCEL_ENV = 'preview';
process.env.VERCEL_GIT_COMMIT_REF = 'research/sequence-5.5-amari-closure-20261006';

function validateReceipt(rc) {
  const errors = [];
  if (!rc || typeof rc !== 'object' || Array.isArray(rc)) return ['Receipt is not an object'];

  const requiredTop = [
    "schema", "episode_id", "execution_id", "execution_unit_sha256",
    "coordinate", "arm", "fixture_id", "cluster", "is_pilot",
    "receiver_identity", "credential_and_billing_provenance",
    "temporal_provenance", "input_provenance", "output_provenance",
    "provider_receipt", "usage_realized_dose"
  ];
  for (const k of requiredTop) {
    if (!(k in rc)) errors.push(`Missing top-level property: ${k}`);
  }
  for (const k of Object.keys(rc)) {
    if (!requiredTop.includes(k)) errors.push(`Unknown top-level property: ${k}`);
  }

  if (rc.schema !== "td613.sequence5.5.execution-receipt/v2.0") errors.push(`Invalid schema: ${rc.schema}`);
  if (rc.episode_id !== "EPISODE_SACRIFICIAL_PILOT_V2") errors.push(`Invalid episode_id: ${rc.episode_id}`);
  if (typeof rc.execution_id !== "string") errors.push(`Invalid execution_id: ${rc.execution_id}`);
  if (typeof rc.execution_unit_sha256 !== "string" || !/^[a-f0-9]{64}$/.test(rc.execution_unit_sha256)) errors.push(`Invalid execution_unit_sha256: ${rc.execution_unit_sha256}`);
  if (typeof rc.coordinate !== "string") errors.push(`Invalid coordinate: ${rc.coordinate}`);
  if (!["K0", "K0D", "K1", "K2", "K3"].includes(rc.arm)) errors.push(`Invalid arm: ${rc.arm}`);
  if (typeof rc.fixture_id !== "string") errors.push(`Invalid fixture_id: ${rc.fixture_id}`);
  if (typeof rc.cluster !== "string") errors.push(`Invalid cluster: ${rc.cluster}`);
  if (rc.is_pilot !== true) errors.push(`Invalid is_pilot: ${rc.is_pilot}`);

  const ri = rc.receiver_identity;
  if (!ri || typeof ri !== 'object' || Array.isArray(ri)) {
    errors.push('receiver_identity must be an object');
  } else {
    const riReq = ["provider", "exact_model_id", "runtime_or_harness", "endpoint_or_execution_class", "model_settings"];
    for (const k of riReq) if (!(k in ri)) errors.push(`Missing receiver_identity property: ${k}`);
    for (const k of Object.keys(ri)) if (!riReq.includes(k)) errors.push(`Unknown receiver_identity property: ${k}`);
    if (ri.provider !== "google") errors.push(`Invalid provider: ${ri.provider}`);
    if (ri.exact_model_id !== "gemini-3.8-flash") errors.push(`Invalid exact_model_id: ${ri.exact_model_id}`);
    if (ri.runtime_or_harness !== "vercel-preview/server-fetch") errors.push(`Invalid runtime_or_harness: ${ri.runtime_or_harness}`);
    if (typeof ri.endpoint_or_execution_class !== "string") errors.push(`Invalid endpoint_or_execution_class: ${ri.endpoint_or_execution_class}`);
    const ms = ri.model_settings;
    if (!ms || typeof ms !== 'object' || Array.isArray(ms)) {
      errors.push('model_settings must be an object');
    } else {
      const msReq = ["temperature", "sampling_parameters_set_by_protocol", "thinking_level", "max_output_tokens", "response_mime_type", "tool_permissions"];
      for (const k of msReq) if (!(k in ms)) errors.push(`Missing model_settings property: ${k}`);
      for (const k of Object.keys(ms)) if (!msReq.includes(k)) errors.push(`Unknown model_settings property: ${k}`);
      if (ms.temperature !== null) errors.push(`Invalid temperature: ${ms.temperature}`);
      if (ms.sampling_parameters_set_by_protocol !== false) errors.push(`Invalid sampling_parameters_set_by_protocol: ${ms.sampling_parameters_set_by_protocol}`);
      if (ms.thinking_level !== "medium") errors.push(`Invalid thinking_level: ${ms.thinking_level}`);
      if (!Number.isInteger(ms.max_output_tokens)) errors.push(`Invalid max_output_tokens: ${ms.max_output_tokens}`);
      if (ms.response_mime_type !== "application/json") errors.push(`Invalid response_mime_type: ${ms.response_mime_type}`);
      if (!Array.isArray(ms.tool_permissions) || ms.tool_permissions.length !== 0) errors.push(`Invalid tool_permissions`);
    }
  }

  const cbp = rc.credential_and_billing_provenance;
  if (!cbp || typeof cbp !== 'object' || Array.isArray(cbp)) {
    errors.push('credential_and_billing_provenance must be an object');
  } else {
    const cbpReq = ["credential_source_type", "credential_source_name", "credential_fingerprint_sha256", "provider_project_id", "billing_usage_tier", "inference_service_tier", "billing_context_verified"];
    for (const k of cbpReq) if (!(k in cbp)) errors.push(`Missing credential_and_billing_provenance property: ${k}`);
    for (const k of Object.keys(cbp)) if (!cbpReq.includes(k)) errors.push(`Unknown credential_and_billing_provenance property: ${k}`);
    if (cbp.credential_source_type !== "VERCEL_ENVIRONMENT_VARIABLE") errors.push(`Invalid credential_source_type: ${cbp.credential_source_type}`);
    if (cbp.credential_source_name !== "GEMINI_API_KEY") errors.push(`Invalid credential_source_name: ${cbp.credential_source_name}`);
    if (typeof cbp.credential_fingerprint_sha256 !== "string" || !/^[a-f0-9]{64}$/.test(cbp.credential_fingerprint_sha256)) errors.push(`Invalid credential_fingerprint_sha256: ${cbp.credential_fingerprint_sha256}`);
    if (cbp.provider_project_id !== null && typeof cbp.provider_project_id !== "string") errors.push(`Invalid provider_project_id: ${cbp.provider_project_id}`);
    if (typeof cbp.billing_usage_tier !== "string") errors.push(`Invalid billing_usage_tier: ${cbp.billing_usage_tier}`);
    if (cbp.inference_service_tier !== null && typeof cbp.inference_service_tier !== "string") errors.push(`Invalid inference_service_tier: ${cbp.inference_service_tier}`);
    if (typeof cbp.billing_context_verified !== "boolean") errors.push(`Invalid billing_context_verified: ${cbp.billing_context_verified}`);
  }

  const tp = rc.temporal_provenance;
  if (!tp || typeof tp !== 'object' || Array.isArray(tp)) {
    errors.push('temporal_provenance must be an object');
  } else {
    const tpReq = ["request_started_at", "response_completed_at", "duration_ms"];
    for (const k of tpReq) if (!(k in tp)) errors.push(`Missing temporal_provenance property: ${k}`);
    for (const k of Object.keys(tp)) if (!tpReq.includes(k)) errors.push(`Unknown temporal_provenance property: ${k}`);
    if (typeof tp.request_started_at !== "string") errors.push(`Invalid request_started_at`);
    if (typeof tp.response_completed_at !== "string") errors.push(`Invalid response_completed_at`);
    if (!Number.isInteger(tp.duration_ms) || tp.duration_ms < 0) errors.push(`Invalid duration_ms: ${tp.duration_ms}`);
  }

  const ip = rc.input_provenance;
  if (!ip || typeof ip !== 'object' || Array.isArray(ip)) {
    errors.push('input_provenance must be an object');
  } else {
    const ipReq = ["treatment_sha256", "fixture_sha256", "receiver_output_schema_sha256", "fixed_wrapper_sha256", "execution_unit_sha256"];
    for (const k of ipReq) if (!(k in ip)) errors.push(`Missing input_provenance property: ${k}`);
    for (const k of Object.keys(ip)) if (!ipReq.includes(k)) errors.push(`Unknown input_provenance property: ${k}`);
    for (const k of ipReq) if (typeof ip[k] !== "string") errors.push(`input_provenance.${k} must be string`);
  }

  const op = rc.output_provenance;
  if (!op || typeof op !== 'object' || Array.isArray(op)) {
    errors.push('output_provenance must be an object');
  } else {
    const opReq = ["raw_response_sha256", "raw_response_preserved_unmodified", "parsed_response_sha256", "parsing_validation_status"];
    for (const k of opReq) if (!(k in op)) errors.push(`Missing output_provenance property: ${k}`);
    for (const k of Object.keys(op)) if (!opReq.includes(k)) errors.push(`Unknown output_provenance property: ${k}`);
    if (typeof op.raw_response_sha256 !== "string") errors.push(`Invalid raw_response_sha256`);
    if (op.raw_response_preserved_unmodified !== true) errors.push(`Invalid raw_response_preserved_unmodified: ${op.raw_response_preserved_unmodified}`);
    if (op.parsed_response_sha256 !== null && typeof op.parsed_response_sha256 !== "string") errors.push(`Invalid parsed_response_sha256`);
    if (!["VALID", "INVALID_SCHEMA", "INVALID_JSON", "PARSING_SKIPPED_ON_FAILURE"].includes(op.parsing_validation_status)) errors.push(`Invalid parsing_validation_status: ${op.parsing_validation_status}`);
  }

  const pr = rc.provider_receipt;
  if (!pr || typeof pr !== 'object' || Array.isArray(pr)) {
    errors.push('provider_receipt must be an object');
  } else {
    const prReq = ["provider_request_id", "status_code", "retry_ordinal", "retry_reason", "x_gemini_service_tier"];
    for (const k of prReq) if (!(k in pr)) errors.push(`Missing provider_receipt property: ${k}`);
    for (const k of Object.keys(pr)) if (!prReq.includes(k)) errors.push(`Unknown provider_receipt property: ${k}`);
    if (pr.provider_request_id !== null && typeof pr.provider_request_id !== "string") errors.push(`Invalid provider_request_id`);
    if (pr.status_code !== null && !Number.isInteger(pr.status_code)) errors.push(`Invalid status_code: ${pr.status_code}`);
    if (!Number.isInteger(pr.retry_ordinal) || pr.retry_ordinal < 0) errors.push(`Invalid retry_ordinal: ${pr.retry_ordinal}`);
    if (pr.retry_reason !== null && typeof pr.retry_reason !== "string") errors.push(`Invalid retry_reason`);
    if (pr.x_gemini_service_tier !== null && typeof pr.x_gemini_service_tier !== "string") errors.push(`Invalid x_gemini_service_tier`);
  }

  const ud = rc.usage_realized_dose;
  if (!ud || typeof ud !== 'object' || Array.isArray(ud)) {
    errors.push('usage_realized_dose must be an object');
  } else {
    const udReq = ["reported_input_tokens", "reported_output_tokens", "reported_total_tokens", "reported_thoughts_tokens"];
    for (const k of udReq) if (!(k in ud)) errors.push(`Missing usage_realized_dose property: ${k}`);
    for (const k of Object.keys(ud)) if (!udReq.includes(k)) errors.push(`Unknown usage_realized_dose property: ${k}`);
    for (const k of udReq) {
      if (typeof ud[k] !== "string" && !Number.isInteger(ud[k])) errors.push(`Invalid usage_realized_dose.${k}`);
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
  const runOrder = AUTH.deterministic_run_order;
  console.log(`=== EPISODE_SACRIFICIAL_PILOT_V2 ===`);
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
        cluster: receipt.cluster,
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
          // Failed attempt 0 is preserved as _attempt0
          fs.writeFileSync(path.join(OUT, `raw_response_${unitId}_attempt0.json`), rawText, 'utf8');
          fs.writeFileSync(path.join(RECEIPTS, `receipt_${unitId}_attempt0.json`), receiptStr, 'utf8');
          console.warn(`  -> NON-SUCCESS on attempt 0 (status: ${receipt.provider_receipt.status_code}, parsing: ${receipt.output_provenance.parsing_validation_status})`);
          attempt++;
        }
      } else {
        // Subsequent attempts
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

    // Polite pacing delay between isolated units
    await delay(3000);
  }

  // Generate manifest
  const completedUnitIds = new Set(
    allLedger.filter(l => l.status_code === 200 && l.parsing_status === 'VALID').map(l => l.unit_id)
  );

  const summaryManifest = {
    schema: "td613.sequence5.5.raw-pilot-outputs-manifest/v2.0",
    episode_id: "EPISODE_SACRIFICIAL_PILOT_V2",
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
