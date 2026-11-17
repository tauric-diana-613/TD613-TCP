import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const taxonomyPath = path.resolve('packages/dome_world_exact/fixtures/a15-r0/WENDBINE/01-MANIFESTS/sticker-label-taxonomy-v01.json');
const taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, 'utf8'));
const byKey = new Map(taxonomy.entries.map((entry) => [entry.sticker_key, entry]));

const expected = new Map([
  ['PAUL', {
    primary: 'Human Anchor',
    roles: ['Human Anchor', 'Architect', 'Operator', 'Witness']
  }],
  ['WES', {
    primary: 'Structural Intelligence',
    roles: ['Structural Intelligence', 'Constraint & Coherence Engine']
  }],
  ['STEVE', {
    primary: 'Builder Node',
    roles: ['Builder Node', 'Construction & Implementation']
  }],
  ['ILLUMINA', {
    primary: 'Signal & Coherence',
    roles: ['Signal & Coherence', 'Interpretive Illumination']
  }],
  ['ROOMBA', {
    primary: 'Chaos Balancer',
    roles: ['Chaos Balancer', 'Entropy Regulation & Drift Detection']
  }]
]);

assert.deepEqual([...byKey.keys()], [...expected.keys()]);

for (const [key, contract] of expected) {
  const entry = byKey.get(key);
  assert.ok(entry, `missing Wendbine sticker ${key}`);
  assert.equal(entry.display_label, key);
  assert.equal(entry.primary_role_label, contract.primary, `${key} primary role drifted`);
  assert.deepEqual(entry.role_variants, contract.roles, `${key} Wendbine role grammar drifted`);
  assert.equal(entry.label_is_person_identity, false);
  assert.equal(entry.label_is_operator_identity, false);
  assert.equal(entry.label_is_authority, false);
}

const retiredAssistantGlosses = [
  'ANCHOR',
  'Structural Intelligence · Constraint Enforcement',
  'Builder Node · Practical Synthesis',
  'Signal & Coherence Layer',
  'Signal Clarity · Meaning & Light',
  'Chaos Balancer · Drift Detection'
];
const activeRoleText = taxonomy.entries.flatMap((entry) => [entry.primary_role_label, ...(entry.role_variants || [])]);
for (const gloss of retiredAssistantGlosses) {
  assert.equal(activeRoleText.includes(gloss), false, `assistant-generated gloss survived active Wendbine nomenclature: ${gloss}`);
}

for (const membrane of [
  'STICKER_LABEL_EQUIVALENCE_MUST_NOT_CREATE_ENTITY_EQUIVALENCE',
  'DISPLAY_ALIAS != PERSON_IDENTITY',
  'DISPLAY_ALIAS != OPERATOR_IDENTITY',
  'DISPLAY_ALIAS != AUTHORITY',
  'ROLE_VARIANT != ROLE_IDENTITY',
  'TAXONOMY_OVERLAY != SOURCE_REWRITE'
]) {
  assert.ok(taxonomy.membranes.includes(membrane), `nomenclature repair dropped membrane: ${membrane}`);
}

console.log('Wendbine actor nomenclature anti-dromological contract passed.');
