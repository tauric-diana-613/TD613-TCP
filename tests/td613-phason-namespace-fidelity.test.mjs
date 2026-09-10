import assert from 'node:assert/strict';
import fs from 'node:fs';

const fixtureUrl = new URL('./fixtures/pedagogue/td613-phason-namespace-fidelity-v01.json', import.meta.url);
const ledger = JSON.parse(fs.readFileSync(fixtureUrl, 'utf8'));

assert.equal(ledger.schema, 'td613.phason-namespace-fidelity/v0.1');
assert.equal(ledger.state, 'BOUNDED_SOURCE_DOMAIN_CROSSWALK');
assert.equal(ledger.authority.physical_quasicrystal_claim, false);
assert.equal(ledger.authority.runtime_rename_authorized, false);
assert.equal(ledger.authority.donor_corpus_admitted, false);
assert.equal(ledger.authority.external_causation_claim, false);
assert.equal(ledger.authority.human_closure_required, true);

const laws = new Set(ledger.laws);
for (const law of [
  'SAME_TOKEN != SAME_OPERATOR',
  'TERM_FAMILY != UNIFORM_ANALOGY_FIDELITY',
  'STRUCTURE_PRESERVING_USE_IN_ONE_MODULE != RETROACTIVE_LICENSE_FOR_ALL_HOMONYMOUS_USES',
  'ANALOGY_FIDELITY_IS_BOUND_TO_TERM_OPERATOR_VERSION_SCOPE',
  'NEIGHBORING_MATHEMATICS_DOES_NOT_TRANSFER_ANALOGY_FIDELITY_AUTOMATICALLY'
]) assert.ok(laws.has(law), `missing namespace-fidelity law: ${law}`);

assert.ok(Array.isArray(ledger.source_domain_anchors) && ledger.source_domain_anchors.length >= 4);
for (const source of ledger.source_domain_anchors) {
  assert.ok(source.id);
  assert.ok(source.title);
  assert.match(source.url, /^https:\/\//);
  assert.ok(Array.isArray(source.supports) && source.supports.length > 0);
}

const allowed = new Set(ledger.allowed_fidelity_states);
const byId = new Map(ledger.entries.map(entry => [entry.id, entry]));
assert.equal(byId.size, ledger.entries.length, 'namespace entry IDs must be unique');

for (const entry of ledger.entries) {
  assert.ok(entry.term);
  assert.ok(Array.isArray(entry.source_refs) && entry.source_refs.length > 0);
  assert.ok(allowed.has(entry.fidelity_state), `${entry.id}: unsupported fidelity state`);
  assert.ok(entry.conventional_alias);
  assert.ok(Array.isArray(entry.operative_structure_present));
  assert.ok(Array.isArray(entry.missing_for_stronger_domain_claim));
  assert.ok(entry.forbidden_upgrade);
}

const exactGate = byId.get('PHASON_GATE_EXACT');
assert.equal(exactGate.fidelity_state, 'STRUCTURE_PRESERVING_ANALOGY_SUPPORTED');
for (const witness of [
  'parallel and perpendicular projections',
  'exact perpendicular-space coordinate',
  'bounded acceptance window',
  'declared internal-space shift',
  'exact inside-outside decision'
]) assert.ok(exactGate.operative_structure_present.includes(witness), `exact gate missing: ${witness}`);
assert.equal(exactGate.conventional_alias, 'CUT_AND_PROJECT_ACCEPTANCE_WINDOW_SHIFT_GATE');
assert.match(exactGate.forbidden_upgrade, /PHYSICAL_QUASICRYSTAL_PHASON_DYNAMICS/);

const scene = byId.get('CONTENT_INVARIANT_PHASON_SCENE');
assert.equal(scene.fidelity_state, 'STRUCTURE_PRESERVING_ANALOGY_SUPPORTED');
assert.ok(scene.operative_structure_present.includes('fixed source anchor'));
assert.ok(scene.operative_structure_present.includes('acceptance window'));
assert.ok(scene.operative_structure_present.includes('changed projection'));

const pr800 = byId.get('PR800_ICOSAHEDRAL_PHASON_STRATUM');
assert.equal(pr800.fidelity_state, 'METAPHOR_ONLY_SUPPORTED');
assert.equal(pr800.conventional_alias, 'THIRD_SYNTHETIC_STRATUM');
for (const missing of [
  'perpendicular-space coordinate',
  'acceptance window',
  'cut-and-project selection',
  'phason field'
]) assert.ok(pr800.missing_for_stronger_domain_claim.includes(missing), `PR800 phason missing debt: ${missing}`);

const susceptibility = byId.get('APERTURE_V31_PHASON_SUSCEPTIBILITY');
assert.equal(susceptibility.fidelity_state, 'PARTIAL_ANALOGY_SUPPORTED');
assert.equal(
  susceptibility.conventional_alias,
  'FINITE_DIFFERENCE_PERTURBATION_RESPONSE_GAIN_WITH_REVERSAL_AND_HYSTERESIS_FLAG'
);
assert.ok(susceptibility.missing_for_stronger_domain_claim.includes('linearity regression or residual'));
assert.match(susceptibility.forbidden_upgrade, /DEMONSTRATED_LINEAR_RESPONSE/);
assert.ok(susceptibility.nomenclature_debt.includes('SUSCEPTIBILITY_RATIO != PHASON_ELASTIC_SUSCEPTIBILITY'));

const relationLedger = byId.get('PHASE5_PHASON_RELATION_LEDGER');
assert.equal(relationLedger.fidelity_state, 'METAPHOR_ONLY_SUPPORTED');
assert.equal(relationLedger.conventional_alias, 'HASH_CHAINED_RELATION_LIFECYCLE_EVENT_LEDGER');
assert.ok(relationLedger.operative_structure_present.includes('fork detection'));
assert.ok(relationLedger.missing_for_stronger_domain_claim.includes('acceptance window'));
assert.match(relationLedger.forbidden_upgrade, /EVENT_SOURCING_FORK/);

const cupola = byId.get('CUPOLA_PR800');
assert.equal(cupola.fidelity_state, 'METAPHOR_ONLY_SUPPORTED');
assert.equal(cupola.conventional_alias, 'BOUNDED_MULTI_STRATUM_CONTAINER');
assert.ok(cupola.missing_for_stronger_domain_claim.includes('geometric cupola embedding'));

assert.equal(ledger.umbrella_disposition.phason, 'UNRESOLVED_AS_GLOBAL_TOKEN_RESOLVED_BY_NAMESPACE');
assert.equal(ledger.umbrella_disposition.cupola, 'METAPHOR_ONLY_SUPPORTED');
assert.equal(ledger.runtime_policy.legacy_names_may_remain_for_compatibility, true);
assert.equal(ledger.runtime_policy.scientific_facing_aliases_required_when_source_domain_structure_is_absent, true);
assert.equal(ledger.runtime_policy.automatic_api_rename, false);

const states = new Set(ledger.entries.map(entry => entry.fidelity_state));
for (const required of [
  'STRUCTURE_PRESERVING_ANALOGY_SUPPORTED',
  'PARTIAL_ANALOGY_SUPPORTED',
  'METAPHOR_ONLY_SUPPORTED'
]) assert.ok(states.has(required), `audit must be capable of mixed verdicts; missing ${required}`);

console.log('TD613 Phason namespace fidelity audit passed.');
