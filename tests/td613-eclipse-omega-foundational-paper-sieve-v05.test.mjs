import assert from 'node:assert/strict';
import fs from 'node:fs';

const receiptPath = 'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/04-RECEIPTS/assays/2026-09-11-eclipse-omega-foundational-paper-sieve-v05.json';
const correctionPath = 'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/04-RECEIPTS/assays/2026-09-11-eclipse-omega-foundational-paper-sieve-v05-count-correction.json';
const operationPath = 'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/05-OPERATIONS/2026-09-11-ECLIPSE-OMEGA-FOUNDATIONAL-PAPER-SIEVE-V0_5.md';
const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
const correction = JSON.parse(fs.readFileSync(correctionPath, 'utf8'));
const operation = fs.readFileSync(operationPath, 'utf8');

assert.equal(receipt.schema, 'td613.eclipse-omega-foundational-paper-sieve/v0.5');
assert.equal(receipt.authority.scientific_promotion, false);
assert.equal(receipt.authority.copying_or_plagiarism_adjudication, false);
assert.equal(receipt.authority.private_wendbine_material_admitted, false);
assert.equal(receipt.counts.novelty_promotions, 0);
assert.equal(receipt.claim_matrix.length, 23);
assert.equal(correction.schema, 'td613.eclipse-omega-foundational-paper-sieve-count-correction/v0.5.1');
assert.equal(correction.correction.recorded_value, receipt.counts.claim_rows);
assert.equal(correction.correction.correct_value, receipt.claim_matrix.length);
assert.equal(correction.authority.claim_verdict_change, false);

const byId = new Map(receipt.claim_matrix.map(row => [row.id, row]));
assert.equal(byId.get('NARROWING_CHAIN')?.verdict, 'FORMALLY_INVALID_AS_UNIVERSAL_NESTED_SET_CHAIN');
assert.equal(byId.get('MONOTONE_NARROWING')?.verdict, 'REJECTED_AS_UNIVERSAL');
assert.equal(byId.get('ZERO_BOUNCE')?.verdict, 'UNDERDETERMINED_WITHOUT_INDEPENDENT_INTERACTION_WITNESS');
assert.equal(byId.get('CONTROLLED_REALITY_SURFACE')?.verdict, 'TD613_COINAGE_WITH_KNOWN_COMPONENTS_NO_FIELD_NOVELTY_CREDIT');
assert.match(operation, /NESTED_SET_CHAIN_REQUIRES_COMMON_CODOMAIN/);
assert.match(operation, /ZERO_REGISTERED_EVENTS != INTERNAL_INTERACTION_WITNESS/);
assert.match(operation, /TEXTUAL_REFUSAL != EXECUTABLE_CONSTRAINT/);
assert.match(operation, /CONSTRUCT_NOVELTY != TEXTUAL_PROVENANCE != COPYING/);

// Hostile control 1: the paper's intuitive narrowing chain becomes type-unsafe
// once generation/registration leave the document universe.
const D = new Set(['doc:a', 'doc:b', 'doc:c']);
const Ck = new Set(['doc:a', 'doc:b']);
const Ckappa = new Set(['doc:a']);
const CB = new Set(['doc:a']);
const Y = 'generated answer text';
const E = { type: 'registered_event', output: Y };

for (const x of Ck) assert.ok(D.has(x), 'Ck must remain a subset of the document universe in this control.');
for (const x of Ckappa) assert.ok(Ck.has(x), 'Ckappa must remain a subset of Ck in this control.');
for (const x of CB) assert.ok(Ckappa.has(x), 'CB must remain a subset of Ckappa in this control.');
assert.equal(D.has(Y), false, 'Generated answer text is not automatically an element of the document universe.');
assert.equal(D.has(E), false, 'Registered event objects are not automatically elements of the document universe.');

// Hostile control 2: ontology-conditioned transformation need not monotonically narrow.
function ontologyExpand(candidates, inferred) {
  return new Set([...candidates, ...inferred]);
}
const baseCandidates = new Set(['doc:a']);
const expandedCandidates = ontologyExpand(baseCandidates, ['doc:b']);
assert.equal(baseCandidates.size, 1);
assert.equal(expandedCandidates.size, 2, 'A valid ontology/query-expansion stage can increase candidate cardinality.');

// Hostile control 3: registered zero does not identify hidden interaction.
const noInteractionWorld = { internalInteraction: false, registeredBounces: 0 };
const unregisteredInteractionWorld = { internalInteraction: true, registeredBounces: 0 };
function observeBounceLedger(world) {
  return { registeredBounces: world.registeredBounces };
}
assert.deepEqual(
  observeBounceLedger(noInteractionWorld),
  observeBounceLedger(unregisteredInteractionWorld),
  'The terminal zero-bounce ledger must remain compatible with both hidden worlds.'
);
assert.notEqual(
  noInteractionWorld.internalInteraction,
  unregisteredInteractionWorld.internalInteraction,
  'The hidden interaction states must differ despite identical terminal registration.'
);

// Hostile control 4: non-injectivity is an implementation property, not an automatic consequence of calling a map a projection.
const lossyProjection = x => x % 2;
const injectiveProjectionOnDeclaredDomain = x => x;
assert.equal(lossyProjection(1), lossyProjection(3), 'Lossy control demonstrates an actual collision witness.');
assert.notEqual(
  injectiveProjectionOnDeclaredDomain(1),
  injectiveProjectionOnDeclaredDomain(3),
  'Injective control shows that projection naming alone does not imply non-injectivity.'
);

// Hostile control 5: glyph difference does not force route difference when an implementation normalizes the variants.
function normalizeDashName(value) {
  return value.replaceAll('–', '-').replaceAll('—', '-');
}
function normalizedRoute(value) {
  return `route:${normalizeDashName(value).toLowerCase()}`;
}
assert.equal(normalizedRoute('Eclipse–Omega'), normalizedRoute('Eclipse—Omega'));
assert.equal(normalizedRoute('Eclipse–Omega'), normalizedRoute('Eclipse-Omega'));

// Hostile control 6: prose can declare a rule without enforcing it.
const antiEquivalenceText = 'containment != healing';
const uncheckedRecord = { containment: true, healing: true };
assert.match(antiEquivalenceText, /!=/);
assert.equal(uncheckedRecord.containment && uncheckedRecord.healing, true, 'Text alone does not reject a violating record.');
function enforceAntiEquivalence(record) {
  if (record.containment && record.healing) throw new Error('anti-equivalence violation');
  return record;
}
assert.throws(() => enforceAntiEquivalence(uncheckedRecord), /anti-equivalence violation/);

for (const law of [
  'NESTED_SET_CHAIN_REQUIRES_COMMON_CODOMAIN',
  'FINAL_GENERATED_EVENT != RETRIEVED_DOCUMENT_SUBSET',
  'ZERO_REGISTERED_EVENTS != INTERNAL_INTERACTION_WITNESS',
  'TEXTUAL_REFUSAL != EXECUTABLE_CONSTRAINT',
  'GLYPH_DIFFERENCE != ROUTE_DIFFERENCE_WITHOUT_IMPLEMENTATION',
  'ONTOLOGY_TRANSFORMATION != MONOTONE_NARROWING',
  'NONINJECTIVE_PROJECTION_REQUIRES_DEMONSTRATION',
  'CONSTRUCT_NOVELTY != TEXTUAL_PROVENANCE != COPYING'
]) {
  assert.ok(receipt.laws.includes(law), `Receipt must preserve anti-overclaim law: ${law}`);
}

for (const law of [
  'RECEIPT_ERROR != SCIENTIFIC_RESULT',
  'CORRECTION_SHOULD_PRESERVE_AUDIT_TRAIL',
  'FAILED_ASSERTION != CLAIM_FAILURE'
]) {
  assert.ok(correction.laws.includes(law), `Correction receipt must preserve audit law: ${law}`);
}

console.log('TD613 Eclipse–Omega foundational paper sieve v0.5 passed.');
