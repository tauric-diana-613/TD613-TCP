// TD613 Sequence 5.5 Pilot V3B runner.
// Bound to receiver-clean stimulus files in 04-PILOT_V3B_FIXTURES/
// Prohibits research manifest metadata from entering receiver prompt.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = process.env.TD613_ROOT || process.cwd();
const BASE = path.join(ROOT, 'research/sequence-5.5-closure-chamber');
const BINDING_MANIFEST = JSON.parse(fs.readFileSync(path.join(BASE, '27-PILOT_V3B_EXECUTION_BINDING_MANIFEST.json'), 'utf8'));
const OUT = path.join(BASE, '28-PILOT_V3B_RAW_OUTPUTS');
const RECEIPTS = path.join(BASE, '28-PILOT_V3B_RECEIPTS');
const MANIFEST_PATH = path.join(BASE, '28-PILOT_V3B_RAW_OUTPUTS_MANIFEST.json');
const MODEL = 'gemini-3.8-flash';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent';
const EXPECTED_FP = '51efc3d87cdffc4fb2869519ff4fa12b10ce179ba79d3976f6094cf741681c39';

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

if (isVerifyOnly) {
  const count = verifyPromptAssembly();
  console.log(`[VERIFY-ONLY] Successfully verified ${count} receiver-clean execution units.`);
  process.exit(0);
}

// Execution branch remains closed until explicit operator execution authorization
console.log('Pilot V3B Harness initialized. Execution is on HOLD pending operator authorization.');
