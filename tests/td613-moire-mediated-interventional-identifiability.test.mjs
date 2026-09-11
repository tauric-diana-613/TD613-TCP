import assert from 'node:assert/strict';
import {
  BOUNDED_SIGMA_MAX,
  BOUNDED_SIGMA_MIN,
  LAYER_A,
  LAYER_B,
  MEDIATOR_VECTOR,
  MOIRE_MEDIATED_IDENTIFIABILITY_SCHEMA,
  PROCESS_IDS,
  buildMediatedIdentifiabilityCertificate,
  directOverlay,
  morphology,
  observeSyntheticProcess,
  pairInteractionResidue,
  registryScore4,
  selectLocalRegistry,
} from '../app/dome-world/previews/a15-r0/moire-mediated-interventional-identifiability.js';

const add = (left, right) => left.map((value, index) => value + right[index]);
const scale = (scalar, vector) => vector.map(value => scalar * value);
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);

assert.deepEqual(LAYER_A, [2, -1, 1]);
assert.deepEqual(LAYER_B, [-1, 2, 1]);
assert.deepEqual(MEDIATOR_VECTOR, [1, -1, 2]);
assert.deepEqual(directOverlay(), [1, 1, 2]);
assert.equal(BOUNDED_SIGMA_MIN, -7);
assert.equal(BOUNDED_SIGMA_MAX, 7);

let passiveComparisons = 0;
let interventionComparisons = 0;

for (const g of [-1, 1]) {
  const expectedPassive = add([1, 1, 2], scale(g, MEDIATOR_VECTOR));
  const h0Passive = observeSyntheticProcess(PROCESS_IDS.OVERLAY_NUISANCE, { g, mediatorPresent: true });
  const h1Passive = observeSyntheticProcess(PROCESS_IDS.MEDIATED, { g, mediatorPresent: true });
  const h0Ablated = observeSyntheticProcess(PROCESS_IDS.OVERLAY_NUISANCE, { g, mediatorPresent: false });
  const h1Ablated = observeSyntheticProcess(PROCESS_IDS.MEDIATED, { g, mediatorPresent: false });

  assert.equal(h0Passive.schema, MOIRE_MEDIATED_IDENTIFIABILITY_SCHEMA);
  assert.deepEqual(h0Passive.output, expectedPassive);
  assert.deepEqual(h1Passive.output, expectedPassive);
  assert.deepEqual(pairInteractionResidue(h0Passive.output), scale(g, MEDIATOR_VECTOR));
  assert.deepEqual(pairInteractionResidue(h1Passive.output), scale(g, MEDIATOR_VECTOR));
  assert.ok(same(h0Passive.output, h1Passive.output), 'passive candidate processes must be observationally equivalent');
  passiveComparisons += 1;

  assert.deepEqual(h0Ablated.output, expectedPassive, 'H0 nuisance must survive mediator ablation');
  assert.deepEqual(h1Ablated.output, [1, 1, 2], 'H1 declared mediator effect must disappear under ablation');
  assert.deepEqual(pairInteractionResidue(h0Ablated.output), scale(g, MEDIATOR_VECTOR));
  assert.deepEqual(pairInteractionResidue(h1Ablated.output), [0, 0, 0]);
  assert.ok(!same(h0Ablated.output, h1Ablated.output), 'mediator ablation must separate the candidate processes');
  interventionComparisons += 1;
}

assert.equal(passiveComparisons, 2);
assert.equal(interventionComparisons, 2);

let boundedRegistryChecks = 0;
let morphologySeparationChecks = 0;
for (const g of [-1, 1]) {
  const output = observeSyntheticProcess(PROCESS_IDS.MEDIATED, { g, mediatorPresent: true }).output;
  const morphology0 = morphology(output, 0);
  for (let sigma = BOUNDED_SIGMA_MIN; sigma <= BOUNDED_SIGMA_MAX; sigma += 1) {
    const withMediator = selectLocalRegistry({ g, mediatorPresent: true, sigma });
    const withoutMediator = selectLocalRegistry({ g, mediatorPresent: false, sigma });
    assert.equal(withMediator.unique, true);
    assert.equal(withMediator.selected_registry, g, `registry must remain g for g=${g}, sigma=${sigma}`);
    assert.equal(withoutMediator.unique, false);
    assert.equal(withoutMediator.selected_registry, null);
    assert.equal(withoutMediator.state, 'AMBIGUOUS');
    const winner = registryScore4(g, { g, mediatorPresent: true, sigma });
    const loser = registryScore4(-g, { g, mediatorPresent: true, sigma });
    assert.ok(winner < loser, `bounded registry separation lost for g=${g}, sigma=${sigma}`);
    if (sigma !== 0) {
      assert.ok(!same(morphology(output, sigma), morphology0), 'nonzero perturbation must alter morphology');
      assert.equal(withMediator.selected_registry, g, 'morphology change must not silently imply relation-class change');
      morphologySeparationChecks += 1;
    }
    boundedRegistryChecks += 1;
  }
}
assert.equal(boundedRegistryChecks, 30);
assert.equal(morphologySeparationChecks, 28);

const hostilePositive = selectLocalRegistry({ g: 1, mediatorPresent: true, sigma: 9 });
const hostileNegative = selectLocalRegistry({ g: -1, mediatorPresent: true, sigma: -9 });
assert.equal(hostilePositive.selected_registry, -1, 'positive out-of-window hostile must break g=+1 persistence');
assert.equal(hostileNegative.selected_registry, 1, 'negative out-of-window hostile must break g=-1 persistence');

for (const badCall of [
  () => observeSyntheticProcess(PROCESS_IDS.MEDIATED, { g: 0, mediatorPresent: true }),
  () => observeSyntheticProcess('UNKNOWN', { g: 1, mediatorPresent: true }),
  () => registryScore4(0, { g: 1, mediatorPresent: true, sigma: 0 }),
  () => registryScore4(1, { g: 1, mediatorPresent: true, sigma: 0.5 }),
]) assert.throws(badCall);

const certificate = buildMediatedIdentifiabilityCertificate();
assert.equal(certificate.passed, true);
assert.equal(certificate.passive_observational_equivalence, true);
assert.equal(certificate.passive_pair_residue_equivalence, true);
assert.equal(certificate.mediator_ablation_separates_processes, true);
assert.equal(certificate.mediated_ablation_clears_declared_interaction_residue, true);
assert.equal(certificate.nuisance_model_unaffected_by_mediator_switch, true);
assert.equal(certificate.bounded_registry_stable, true);
assert.equal(certificate.absent_mediator_registry_ambiguous, true);
assert.equal(certificate.morphology_changes_without_registry_change, true);
assert.equal(certificate.hostile_out_of_window.breaks_universal_invariance, true);
assert.equal(certificate.bounded_registry_cases, 30);
assert.equal(certificate.bounded_registry.length, 30);
assert.equal(certificate.exact_integer_arithmetic, true);
assert.equal(certificate.source_provenance.external_source, 'arXiv:2607.02822');
assert.equal(certificate.source_provenance.prepublication_td613_possession_claim, false);
assert.match(certificate.classification, /MEDIATOR_ABLATION_BREAKS_PASSIVE_PROCESS_EQUIVALENCE/);
assert.match(certificate.relation_classification, /BOUNDED_PERTURBATION_STABLE_LOCAL_RELATION_CLASS/);
for (const key of [
  'physical_moire', 'external_causation', 'universal_identifiability',
  'publication_priority', 'knowledge_transfer', 'release', 'production',
]) assert.equal(certificate.authority[key], false, `authority widened at ${key}`);
for (const scar of [
  'SYNTHETIC_MEDIATOR_ABLATION != REAL_WORLD_CAUSAL_INTERVENTION',
  'PAIR_RESIDUE != MEDIATOR_CAUSATION',
  'SOURCE_A_DERIVED_REPAIR != TD613_PREPUBLICATION_POSSESSION',
  'BOUNDED_SYNTHETIC_IDENTIFIABILITY != UNIVERSAL_IDENTIFIABILITY',
]) assert.ok(certificate.scars.includes(scar), `missing scar: ${scar}`);

console.log('TD613 fresh-main mediator interventional-identifiability hostile contract passed.');
