// TD613 Sequence 5.5 Pilot V4.1R Recovery Runner.
// Bound to receiver-clean stimulus files in 05-PILOT_V4_FIXTURES/
// Prohibits research manifest metadata from entering receiver prompt.
// Enforces raw manifest privacy: omits verdict, accuracy, winners, and pair transitions.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import handler from '../../api/sequence-55-pilot-v4-1r.js';

const ROOT = process.env.TD613_ROOT || process.cwd();
const BASE = path.join(ROOT, 'research/sequence-5.5-closure-chamber');
const BINDING_MANIFEST = JSON.parse(fs.readFileSync(path.join(BASE, '34-PILOT_V4_1R_EXECUTION_BINDING_MANIFEST.json'), 'utf8'));
const RECEIPT_SCHEMA = JSON.parse(fs.readFileSync(path.join(BASE, '34-PILOT_V4_1R_RECEIPT_SCHEMA.json'), 'utf8'));
const OUT = path.join(BASE, '35-PILOT_V4_1R_RAW_OUTPUTS');
const RECEIPTS = path.join(BASE, '35-PILOT_V4_1R_RECEIPTS');
const MANIFEST_PATH = path.join(BASE, '35-PILOT_V4_1R_RAW_OUTPUTS_MANIFEST.json');
const MODEL = 'gemini-3.8-flash';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent';
const EXPECTED_FP = '51efc3d87cdffc4fb2869519ff4fa12b10ce179ba79d3976f6094cf741681c39';
const EPISODE = 'EPISODE_SACRIFICIAL_PILOT_V4_1R';

const isVerifyOnly = process.argv.includes('--verify-only');

function sha256(val) {
  return crypto.createHash('sha256').update(val).digest('hex');
}

// Pre-call immutability guard: verifies all frozen stimulus and research objects match the design freeze
export function verifyImmutabilityGuard() {
  const guard = BINDING_MANIFEST.immutability_guard;

  // 1. Verify gate spec
  const gateSpecText = fs.readFileSync(path.join(BASE, '33-PILOT_V4_1R_DIFFICULTY_GATE_SPEC.json'), 'utf8');
  const gateSpecSha = sha256(gateSpecText);
  if (gateSpecSha !== guard.frozen_design_sha256.gate_spec) {
    throw new Error(`STOP · FROZEN_OBJECT_DRIFT: Gate spec drift detected (expected ${guard.frozen_design_sha256.gate_spec}, got ${gateSpecSha})`);
  }

  // 2. Verify research manifest
  const researchManifestText = fs.readFileSync(path.join(BASE, '33-PILOT_V4_1R_RESEARCH_MANIFEST.json'), 'utf8');
  const researchManifestSha = sha256(researchManifestText);
  if (researchManifestSha !== guard.frozen_design_sha256.research_manifest) {
    throw new Error(`STOP · FROZEN_OBJECT_DRIFT: Research manifest drift detected (expected ${guard.frozen_design_sha256.research_manifest}, got ${researchManifestSha})`);
  }

  // 3. Verify key commitment
  const keyCommitmentText = fs.readFileSync(path.join(BASE, '33-PILOT_V4_1R_CALIBRATION_KEY_COMMITMENT.sha256'), 'utf8').trim();
  const keyCommitmentSha = keyCommitmentText.split(/\s+/)[0];
  if (keyCommitmentSha !== BINDING_MANIFEST.pilot_calibration_key_commitment_sha256) {
    throw new Error(`STOP · FROZEN_OBJECT_DRIFT: Key commitment drift detected (expected ${BINDING_MANIFEST.pilot_calibration_key_commitment_sha256}, got ${keyCommitmentSha})`);
  }

  // 4. Verify output schema
  const schemaText = fs.readFileSync(path.join(BASE, '10-RECEIVER_OUTPUT_SCHEMA.json'), 'utf8');
  const schemaSha = sha256(schemaText);
  if (schemaSha !== guard.frozen_design_sha256.receiver_output_schema) {
    throw new Error(`STOP · FROZEN_OBJECT_DRIFT: Receiver output schema drift detected (expected ${guard.frozen_design_sha256.receiver_output_schema}, got ${schemaSha})`);
  }

  // 5. Verify all 5 treatment packets
  for (const [arm, expectedSha] of Object.entries(guard.treatments)) {
    const tText = fs.readFileSync(path.join(BASE, `02-TREATMENT_PACKETS/packet-${arm}.md`), 'utf8');
    const tSha = sha256(tText);
    if (tSha !== expectedSha) {
      throw new Error(`STOP · FROZEN_OBJECT_DRIFT: Treatment ${arm} drift detected (expected ${expectedSha}, got ${tSha})`);
    }
  }

  // 6. Verify all 10 fixtures
  for (const [fixtureId, expectedSha] of Object.entries(guard.fixtures)) {
    const fText = fs.readFileSync(path.join(BASE, `05-PILOT_V4_FIXTURES/${fixtureId}.md`), 'utf8');
    const fSha = sha256(fText);
    if (fSha !== expectedSha) {
      throw new Error(`STOP · FROZEN_OBJECT_DRIFT: Fixture ${fixtureId} drift detected (expected ${expectedSha}, got ${fSha})`);
    }
  }

  return true;
}

// Verification function: checks prompt assembly and absence of leaked metadata
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
    
    // Safety check: verify no leaked ontology words exist in the fixture (using word boundary checks)
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
      const rx = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (rx.test(fixture)) {
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
    if (rc[k] === undefined) errors.push(`Missing top-level property '${k}'`);
  }

  if (rc.schema !== 'td613.sequence5.5.execution-receipt/v4.1r') errors.push(`Invalid schema: ${rc.schema}`);
  if (rc.episode_id !== EPISODE) errors.push(`Invalid episode_id: ${rc.episode_id}`);

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
  // Step 1: Pre-call immutability guard
  verifyImmutabilityGuard();

  // Step 2: Verification of prompt assembly and zero metadata leakage
  const verifiedCount = verifyPromptAssembly();
  if (verifiedCount !== 50) {
    throw new Error(`PRE-EXECUTION GATE FAILED: Expected 50 verified units, got ${verifiedCount}`);
  }

  if (isVerifyOnly) {
    console.log(`[VERIFY-ONLY] Immutability guard PASSED.`);
    console.log(`[VERIFY-ONLY] Successfully verified ${verifiedCount} / 50 receiver-clean execution units.`);
    process.exit(0);
  }

  const KEY = process.env.GEMINI_API_KEY || '';
  if (!KEY) throw new Error('GEMINI_API_KEY must be supplied by the execution environment.');
  const fp = sha256(Buffer.from(KEY, 'utf8'));
  if (fp !== EXPECTED_FP) throw new Error(`Credential fingerprint mismatch: expected ${EXPECTED_FP}, got ${fp}`);

  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(RECEIPTS, { recursive: true });

  // Privacy-enforcing raw manifest: omits verdict, accuracy, winners, and pair transitions
  const manifest = {
    schema: 'td613.sequence5.5.pilot-v4-1r-raw-outputs-manifest/v1.0',
    episode_id: EPISODE,
    canonical_branch: 'research/sequence-5.5-amari-closure-20261006',
    governing_privacy_law: 'RAW_FREEZE_AUDITABILITY_EXCLUDES_OUTCOME_DISCLOSURE',
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
        console.log(`  SUCCESS on attempt ${attempts}.`);
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
    // PRIVACY ENFORCEMENT: Only execution integrity metadata recorded in manifest.
    // Verdicts, scores, accuracy, and pair transitions are strictly omitted.
    manifest.unit_results.push({
      unit_id: unitId,
      status: 'COMPLETED',
      attempts: attempts + 1,
      http_status: lastResult.receipt?.provider_receipt?.status_code ?? 200,
      parsing_validation_status: lastResult.receipt?.output_provenance?.parsing_validation_status ?? 'VALID',
      raw_response_sha256: lastResult.receipt?.output_provenance?.raw_response_sha256,
      parsed_response_sha256: lastResult.receipt?.output_provenance?.parsed_response_sha256,
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
