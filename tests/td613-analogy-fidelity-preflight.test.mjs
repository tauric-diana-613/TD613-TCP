import assert from 'node:assert/strict';
import fs from 'node:fs';

const fixtureUrl = new URL('./fixtures/pedagogue/td613-analogy-fidelity-preflight-v01.json', import.meta.url);
const ledger = JSON.parse(fs.readFileSync(fixtureUrl, 'utf8'));

assert.equal(ledger.schema, 'td613.analogy-fidelity-preflight/v0.1');
assert.equal(ledger.state, 'BOUNDED_INTERNAL_PREFLIGHT');
assert.equal(ledger.authority.external_convergence_promoted, false);
assert.equal(ledger.authority.donor_corpus_admitted, false);
assert.equal(ledger.authority.automatic_ontology_deletion, false);
assert.equal(ledger.authority.automatic_analogy_promotion, false);
assert.equal(ledger.authority.physical_realization_authority, false);
assert.equal(ledger.authority.human_closure_required, true);

const laws = new Set(ledger.laws);
for (const law of [
  'TERM_PROVENANCE != CONSTRUCT_NOVELTY',
  'CONSTRUCT_NOVELTY != ANALOGY_FIDELITY',
  'NOMENCLATURE_AUDIT != ONTOLOGY_DELETION',
  'KNOWN_COMPONENT != REDUNDANT_COMPOSITION',
  'ANALOGICAL_BORROWING != FAILED_ANALOGY',
  'EXTERNAL_CONVERGENCE != RETROACTIVE_ORIGIN_PROOF',
  'FAMILIAR_TERM != INVALID_TD613_USE',
  'DEMYSTIFICATION != DEMOBILIZATION'
]) assert.ok(laws.has(law), `missing analogy-fidelity law: ${law}`);

const allowed = new Set(ledger.allowed_fidelity_states);
const byId = new Map(ledger.entries.map(entry => [entry.id, entry]));
assert.equal(byId.size, ledger.entries.length, 'entry IDs must be unique');

for (const entry of ledger.entries) {
  assert.ok(entry.term);
  assert.ok(Array.isArray(entry.source_refs) && entry.source_refs.length > 0);
  assert.ok(allowed.has(entry.fidelity_state), `${entry.id}: unsupported fidelity state`);
  assert.ok(Array.isArray(entry.operative_structure_present));
  assert.ok(Array.isArray(entry.missing_for_stronger_domain_claim));
  assert.ok(entry.bounded_claim);
  assert.ok(entry.forbidden_upgrade);
}

const moire = byId.get('MOIRE_STRATIGRAPHY_PAIRWISE_CHOIR');
assert.equal(moire.fidelity_state, 'PARTIAL_ANALOGY_SUPPORTED');
assert.ok(moire.operative_structure_present.includes('pair-emergent residue after removing baseline and singleton recoveries'));
assert.ok(moire.missing_for_stronger_domain_claim.includes('physical interference intensity'));
assert.match(moire.forbidden_upgrade, /PHYSICAL_MOIRE_FIELD/);

const tomography = byId.get('TOMOGRAPHY_PR800');
assert.equal(tomography.fidelity_state, 'STRUCTURE_PRESERVING_ANALOGY_SUPPORTED');
for (const witness of [
  'declared forward observation map',
  'observation matrix',
  'exact inverse in identifiable schedule',
  'singular hostile schedule',
  'explicit collision under nonidentifiability'
]) assert.ok(tomography.operative_structure_present.includes(witness), `tomography missing witness: ${witness}`);
assert.match(tomography.forbidden_upgrade, /CONTINUUM_OR_PHYSICAL_TOMOGRAPHY/);

const earlyHolonomy = byId.get('HOLONOMY_ORDER_DEFECT_PR800');
const discreteHolonomy = byId.get('HOLONOMY_DISCRETE_TRANSPORT_PR906');
assert.equal(earlyHolonomy.fidelity_state, 'PARTIAL_ANALOGY_SUPPORTED');
assert.equal(discreteHolonomy.fidelity_state, 'STRUCTURE_PRESERVING_ANALOGY_SUPPORTED');
for (const missing of [
  'declared base loop',
  'declared fiber',
  'invertible edge transport assignment',
  'same-basepoint return',
  'induced nonidentity fiber automorphism'
]) assert.ok(earlyHolonomy.missing_for_stronger_domain_claim.includes(missing));
for (const gained of [
  'declared base cycle',
  'fiber Xi = F2^2',
  'invertible edge transports',
  'based commutator loop',
  'return to same basepoint',
  'nonidentity induced fiber automorphism'
]) assert.ok(discreteHolonomy.operative_structure_present.includes(gained));
assert.match(discreteHolonomy.forbidden_upgrade, /GEOMETRIC_OR_PHYSICAL_HOLONOMY/);

for (const heldId of ['PHASON', 'CUPOLA']) {
  assert.equal(
    byId.get(heldId).fidelity_state,
    'HELD_FOR_STRUCTURE_PRESERVING_ANALOGY_AUDIT',
    `${heldId} must remain held until its dedicated source-domain audit`
  );
}

assert.equal(ledger.external_convergence_candidate.status, 'HELD_FOR_EXTERNAL_SOURCE_BINDING');
assert.equal(ledger.external_convergence_candidate.source_bound, false);
assert.equal(ledger.external_convergence_candidate.publication_time_bound, false);
assert.ok(ledger.external_convergence_candidate.permitted_future_outcomes.includes('PRODUCTIVE_ANACHRONISTIC_CONVERGENCE'));
for (const forbidden of ['prediction', 'causal influence', 'priority over external work', 'external validation of Eclipse-Omega']) {
  assert.ok(ledger.external_convergence_candidate.forbidden_inferences.includes(forbidden));
}

assert.deepEqual(
  ledger.chronology_invariant.sequence,
  [
    'EARLY_PARTIAL_ANALOGY',
    'MISSING_STRUCTURE_IDENTIFIED',
    'NEW_FINITE_TRANSPORT_CHAMBER',
    'STRONGER_ANALOGY_EARNED'
  ]
);
assert.equal(ledger.chronology_invariant.retroactive_upgrade_forbidden, true);
assert.equal(ledger.chronology_invariant.retroactive_demotion_from_later_nomenclature_forbidden, true);

assert.deepEqual(
  ledger.repair_route,
  [
    'RECOGNIZE_TERM',
    'BIND_NATIVE_OPERATOR',
    'NAME_CONVENTIONAL_NEIGHBOR',
    'TEST_OPERATOR_FIDELITY',
    'RECORD_MISSING_STRUCTURE',
    'RETAIN_REFINE_RENAME_OR_DISCARD',
    'BIND_EXTERNAL_CONVERGENCE_IF_AVAILABLE',
    'PRESERVE_CHRONOLOGY',
    'RETURN_CONTROL_TO_HUMAN'
  ]
);

console.log('TD613 analogy-fidelity anti-burial preflight passed.');
