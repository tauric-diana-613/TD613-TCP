import assert from 'node:assert/strict';
import fs from 'node:fs';

const fixtureUrl = new URL('./fixtures/pedagogue/td613-moire-moire-convergence-assay-a-v01.json', import.meta.url);
const assay = JSON.parse(fs.readFileSync(fixtureUrl, 'utf8'));

assert.equal(assay.schema, 'td613.moire-moire-convergence-assay-a/v0.1');
assert.equal(assay.state, 'SOURCE_BOUND_CHRONOLOGY_BOUND_PARTIAL_OPERATOR_CONVERGENCE');
assert.equal(assay.authority.donor_corpus_admitted, false);
assert.equal(assay.authority.physical_moire_claim, false);
assert.equal(assay.authority.prediction_claim, false);
assert.equal(assay.authority.publication_priority_claim, false);
assert.equal(assay.authority.knowledge_transfer_claim, false);
assert.equal(assay.authority.runtime_mutation_authorized, false);
assert.equal(assay.authority.human_closure_required, true);

const laws = new Set(assay.laws);
for (const law of [
  'EXTERNAL_LITERATURE_SOURCE != DONOR_CORPUS',
  'LATER_PUBLICATION != RETROACTIVE_TD613_ORIGIN',
  'EARLIER_TD613_LABEL != PREDICTION_OF_LATER_PAPER',
  'STRUCTURAL_OVERLAP != MECHANISM_IDENTITY',
  'POST_PUBLICATION_TD613_OPERATOR != PREPUBLICATION_EVIDENCE',
  'VISUAL_BEAT_FIELD != RELAXATION_MEDIATED_MOIRE_MOIRE_RECONSTRUCTION',
  'DIRECT_OVERLAY != MEDIATED_COUPLING'
]) assert.ok(laws.has(law), `missing convergence law: ${law}`);

assert.equal(assay.external_source.identifier, 'arXiv:2607.02822');
assert.equal(assay.external_source.first_public_submission_utc, '2026-07-02T23:22:45Z');
assert.match(assay.external_source.local_snapshot_sha256, /^[0-9a-f]{64}$/);
assert.equal(assay.external_source.snapshot_equals_arxiv_v1_bytes_claimed, false);
for (const claim of [
  'two distinct moiré structures coexist',
  'collective moiré–moiré reconstruction occurs across multiple length scales',
  'shared graphene layer mediates coupling through rotational relaxation',
  'global twist configuration selects local stacking registry'
]) assert.ok(assay.external_source.bounded_source_claims.includes(claim), `missing Source A claim: ${claim}`);

assert.equal(assay.prepublication_td613.length, 2);
const a0 = assay.prepublication_td613.find(item => item.id === 'A0_GATEWAY_LABEL');
const a1 = assay.prepublication_td613.find(item => item.id === 'A1_GATEWAY_RENDERER');
assert.equal(a0.commit_sha, '75a533076638b0e76ed00abc187bc8933a8f0e17');
assert.ok(new Date(a0.commit_time_utc) < new Date(assay.external_source.first_public_submission_utc));
assert.ok(a0.present.includes('Moiré stratigraphy / entrainment cartography label'));
assert.ok(a0.present.includes('explicit speculative-not-evidentiary ceiling'));
assert.ok(a0.absent_or_unestablished.includes('pairwise reconstruction operator'));

assert.equal(a1.commit_sha, '3997627eba409426d7d5f9b1933676de6e397e33');
assert.ok(new Date(a1.commit_time_utc) < new Date(assay.external_source.first_public_submission_utc));
for (const witness of [
  'two layered lattice-like fields',
  'nonidentical spacing or detuning',
  'relative phase and shear perturbation',
  'pair-visible beat or interference rendering'
]) assert.ok(a1.present.includes(witness), `A1 missing witness: ${witness}`);
assert.ok(a1.absent_or_unestablished.includes('shared mediator layer'));

assert.equal(assay.postpublication_nonretroactivity.merge_sha, '1a01181cea77590ad3067ebd27da4518511dac5f');
assert.ok(new Date(assay.postpublication_nonretroactivity.merge_time_utc) > new Date(assay.external_source.first_public_submission_utc));
assert.equal(assay.postpublication_nonretroactivity.may_support_present_comparison, true);
assert.equal(assay.postpublication_nonretroactivity.may_support_prepublication_precedence, false);

const axes = new Map(assay.comparison_axes.map(axis => [axis.axis, axis]));
assert.equal(axes.get('multiple structured patterns coexist').verdict, 'BROAD_STRUCTURAL_MATCH');
assert.equal(axes.get('detuning or mismatch matters').verdict, 'PARTIAL_STRUCTURAL_MATCH');
assert.equal(axes.get('pair-level structure exceeds isolated layers').verdict, 'PARTIAL_STRUCTURAL_MATCH');
for (const sourceOnly of [
  'global configuration selects local registry',
  'shared mediator couples layers',
  'perturbation changes morphology while relation persists',
  'dynamic boundaries or sliding'
]) assert.equal(axes.get(sourceOnly).verdict, 'SOURCE_A_ONLY', `${sourceOnly} must not be back-projected into prepublication TD613`);

assert.equal(assay.result.classification, 'CHRONOLOGY_BOUND_PARTIAL_OPERATOR_CONVERGENCE_SUPPORTED');
assert.equal(assay.result.productive_anachronistic_convergence, 'HELD_FOR_REFINEMENT');

assert.deepEqual(
  assay.next_repair_assay.conditions,
  [
    'C0_SINGLETON_NO_PAIR_INTERACTION',
    'C1_DIRECT_PAIR_OVERLAY_NO_MEDIATOR',
    'C2_PAIR_WITH_DECLARED_MEDIATOR'
  ]
);
for (const burden of [
  'reconstruction observable must distinguish C2 from C1',
  'ablation of mediator must remove any mediator-attributed effect',
  'existing Choir pair residue remains a comparator not automatic proof'
]) assert.ok(assay.next_repair_assay.required_tests.includes(burden), `missing next-assay burden: ${burden}`);
assert.match(assay.next_repair_assay.discard_rule, /discard the imported analogy extension/i);

console.log('TD613 Moiré–Moiré reconstruction convergence assay A passed.');
