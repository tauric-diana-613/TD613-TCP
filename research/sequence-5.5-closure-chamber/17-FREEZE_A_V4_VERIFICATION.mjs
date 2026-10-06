import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

const baseDir = 'research/sequence-5.5-closure-chamber';

console.log('=== 1. CRLF CHECK ===');
function checkCrlf(dir) {
  let count = 0;
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      count += checkCrlf(p);
    } else {
      const txt = fs.readFileSync(p, 'utf8');
      if (txt.includes('\r\n')) {
        console.error('CRLF found in:', p);
        count++;
      }
    }
  }
  return count;
}
const crlfErrors = checkCrlf(baseDir);
console.log('CRLF errors:', crlfErrors);

console.log('\n=== 2. PILOT FIXTURE HASH RECONCILIATION ===');
const pilotManifest = JSON.parse(fs.readFileSync(path.join(baseDir, '05-PILOT_FIXTURE_MANIFEST.json'), 'utf8'));
const bundleManifest = JSON.parse(fs.readFileSync(path.join(baseDir, '07-SEALED_EXECUTION_BUNDLE_MANIFEST.json'), 'utf8'));

const pilotTable = [];
let pilotErrors = 0;
for (let i = 1; i <= 5; i++) {
  const id = `PILOT-0${i}`;
  const fileRel = `04-PILOT_FIXTURES/${id}.md`;
  const fullPath = path.join(baseDir, fileRel);
  const buf = fs.readFileSync(fullPath);
  const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
  const gitBlob = execSync(`git hash-object ${fullPath}`).toString().trim();
  
  const pMan = pilotManifest.fixtures.find(f => f.id === id);
  const bMan = bundleManifest.pilot_fixtures[id];
  
  const matchP = pMan && pMan.sha256 === sha256;
  const matchB = bMan && bMan.sha256 === sha256;
  const allMatch = matchP && matchB;
  if (!allMatch) pilotErrors++;
  
  pilotTable.push({
    fixture_id: id,
    git_blob_sha: gitBlob,
    utf8_bytes: buf.length,
    sha256: sha256,
    manifest_match: allMatch
  });
}
console.table(pilotTable);
console.log('Pilot errors:', pilotErrors);

console.log('\n=== 3. MAIN BATTERY HASH RECONCILIATION ===');
let batErrors = 0;
for (let i = 1; i <= 16; i++) {
  const id = `BAT-${String(i).padStart(2, '0')}`;
  const fileRel = `04-BATTERY_FIXTURES/${id}.md`;
  const fullPath = path.join(baseDir, fileRel);
  const buf = fs.readFileSync(fullPath);
  const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
  
  const bMan = bundleManifest.main_battery_fixtures[id];
  if (!bMan || bMan.sha256 !== sha256) {
    console.error('Mismatch for main battery:', id);
    batErrors++;
  }
}
console.log('Main battery errors:', batErrors);

console.log('\n=== 4. TREATMENT PACKET STATS & DOSE MATCHING ===');
const impRegex = /\b(review|evaluate|check|inspect|verify|identify|formulate|ensure|apply|trace|analyze|document|choose|synthesize|specify|detail|provide|re-run|capture|update|hold|reject|enforce|measure|map|re-instrument|revert|record|audit)\b/gi;

const treatTable = [];
for (const arm of ['K0', 'K0D', 'K1', 'K2', 'K3']) {
  const fileRel = `02-TREATMENT_PACKETS/packet-${arm}.md`;
  const fullPath = path.join(baseDir, fileRel);
  const txt = fs.readFileSync(fullPath, 'utf8');
  const buf = Buffer.from(txt, 'utf8');
  const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
  const words = txt.trim().split(/\s+/).filter(Boolean).length;
  const tokens = (txt.match(/[\w]+|[^\s\w]/g) || []).length;
  const imperatives = (txt.match(impRegex) || []).length;
  const sections = (txt.match(/^#{1,4}\s+/gm) || []).length;
  const examples = (txt.match(/####\s+Example/g) || []).length;
  
  treatTable.push({
    arm,
    words,
    utf8_bytes: buf.length,
    sections,
    examples,
    imperatives,
    tokens,
    sha256
  });
}
console.table(treatTable);

const struct = treatTable.filter(t => t.arm !== 'K0');
const minTok = Math.min(...struct.map(s => s.tokens));
const maxTok = Math.max(...struct.map(s => s.tokens));
const maxTokDev = ((maxTok - minTok) / minTok) * 100;

const minWords = Math.min(...struct.map(s => s.words));
const maxWords = Math.max(...struct.map(s => s.words));
const maxWordDev = ((maxWords - minWords) / minWords) * 100;

const minImp = Math.min(...struct.map(s => s.imperatives));
const maxImp = Math.max(...struct.map(s => s.imperatives));
const maxImpDev = ((maxImp - minImp) / minImp) * 100;

console.log(`Max Token Deviation: ${maxTokDev.toFixed(2)}% (target <= 5%)`);
console.log(`Max Word Deviation:  ${maxWordDev.toFixed(2)}% (target <= 5%)`);
console.log(`Max Imperative Dev:  ${maxImpDev.toFixed(2)}% (target <= 10%)`);

console.log('\n=== 5. FIXED SCHEMAS & BUNDLE BINDING ===');
const receiverSchemaPath = path.join(baseDir, '10-RECEIVER_OUTPUT_SCHEMA.json');
const receiverSchemaBuf = fs.readFileSync(receiverSchemaPath);
const receiverSchemaHash = crypto.createHash('sha256').update(receiverSchemaBuf).digest('hex');
console.log('10-RECEIVER_OUTPUT_SCHEMA.json:');
console.log('  bytes: ', receiverSchemaBuf.length);
console.log('  sha256:', receiverSchemaHash);
console.log('  manifest match:', bundleManifest.fixed_components.receiver_output_schema.sha256 === receiverSchemaHash);

const receiptSchemaPath = path.join(baseDir, '11-EXECUTION_RECEIPT_SCHEMA.json');
const receiptSchemaBuf = fs.readFileSync(receiptSchemaPath);
const receiptSchemaHash = crypto.createHash('sha256').update(receiptSchemaBuf).digest('hex');
console.log('11-EXECUTION_RECEIPT_SCHEMA.json:');
console.log('  bytes: ', receiptSchemaBuf.length);
console.log('  sha256:', receiptSchemaHash);
console.log('  manifest match:', bundleManifest.fixed_components.execution_provenance_receipt_schema.sha256 === receiptSchemaHash);

console.log('\n=== 6. EXECUTION UNITS VERIFICATION (105 UNITS) ===');
function lengthPrefixed(buf) {
  const lenBuf = Buffer.alloc(8);
  lenBuf.writeBigUInt64BE(BigInt(buf.length));
  return Buffer.concat([lenBuf, buf]);
}

const fixedWrapperBuffer = Buffer.from(
`[TD613_EXECUTION_UNIT_WRAPPER_v3.0]
=== SYSTEM_INSTRUCTION_HEADER ===
{{TREATMENT_BYTES}}
=== EVALUATION_FIXTURE_HEADER ===
{{FIXTURE_BYTES}}
=== OUTPUT_SCHEMA_CONTRACT ===
{{RECEIVER_OUTPUT_SCHEMA_BYTES}}
=== RECEIVER_EXECUTION_DIRECTIVE ===
Evaluate the fixture above according to the system instruction protocol. Return a single strictly valid JSON object adhering exactly to the 10-RECEIVER_OUTPUT_SCHEMA.json specification. Do not output markdown code block fences, commentary, or text outside the JSON object.
=== END_OF_EXECUTION_UNIT ===`,
  'utf8'
);

function computeExecutionUnitHash(arm, fixtureId, fixtureBuffer, cluster, isPilot) {
  const metadataJson = JSON.stringify({
    arm,
    cluster,
    fixture_id: fixtureId,
    is_pilot: isPilot,
    schema_version: 'v3.0'
  });
  const metadataBuffer = Buffer.from(metadataJson, 'utf8');
  
  const treatmentBuf = fs.readFileSync(path.join(baseDir, `02-TREATMENT_PACKETS/packet-${arm}.md`));
  const payload = Buffer.concat([
    lengthPrefixed(treatmentBuf),
    lengthPrefixed(fixtureBuffer),
    lengthPrefixed(receiverSchemaBuf),
    lengthPrefixed(fixedWrapperBuffer),
    lengthPrefixed(metadataBuffer)
  ]);
  
  return crypto.createHash('sha256').update(payload).digest('hex');
}

let unitErrors = 0;
for (const u of bundleManifest.pilot_execution_units) {
  const pBuf = fs.readFileSync(path.join(baseDir, `04-PILOT_FIXTURES/${u.fixture_id}.md`));
  const expected = computeExecutionUnitHash(u.arm, u.fixture_id, pBuf, u.cluster, true);
  if (expected !== u.execution_unit_sha256) {
    console.error(`Pilot unit mismatch: ${u.unit_id}`);
    unitErrors++;
  }
}
for (const u of bundleManifest.main_execution_units) {
  const bBuf = fs.readFileSync(path.join(baseDir, `04-BATTERY_FIXTURES/${u.fixture_id}.md`));
  const expected = computeExecutionUnitHash(u.arm, u.fixture_id, bBuf, u.cluster, false);
  if (expected !== u.execution_unit_sha256) {
    console.error(`Main unit mismatch: ${u.unit_id}`);
    unitErrors++;
  }
}
console.log('Total execution units checked: 105. Errors:', unitErrors);

console.log('\n=== 7. SEALED BUNDLE MANIFEST SELF-HASH ===');
const manifestCopy = { ...bundleManifest };
delete manifestCopy.sealed_execution_bundle_manifest_sha256;
const jsonWithoutSelf = JSON.stringify(manifestCopy, null, 2) + '\n';
const computedManifestHash = crypto.createHash('sha256').update(jsonWithoutSelf, 'utf8').digest('hex');
console.log('Computed manifest SHA-256:', computedManifestHash);
console.log('Declared in manifest:     ', bundleManifest.sealed_execution_bundle_manifest_sha256);
console.log('Self-hash match:          ', computedManifestHash === bundleManifest.sealed_execution_bundle_manifest_sha256);

console.log('\n=== 8. COMMITMENTS ===');
const mainKeyCommitment = fs.readFileSync(path.join(baseDir, '06-HIDDEN_ANSWER_KEY_COMMITMENT.sha256'), 'utf8').trim();
const pilotKeyCommitment = fs.readFileSync(path.join(baseDir, '08-PILOT_CALIBRATION_KEY_COMMITMENT.sha256'), 'utf8').trim();
console.log('Main key commitment: ', mainKeyCommitment);
console.log('Pilot key commitment:', pilotKeyCommitment);
