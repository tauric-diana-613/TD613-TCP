import assert from 'node:assert/strict';
import fs from 'node:fs';

const receiptPath = 'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/04-RECEIPTS/assays/2026-09-11-td613-residual-literature-sieve-v02.json';
const supplementPath = 'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/04-RECEIPTS/assays/2026-09-11-residual-sieve-source-supplement-v01.json';
const sieve = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
const supplement = JSON.parse(fs.readFileSync(supplementPath, 'utf8'));

assert.equal(sieve.schema, 'td613.residual-literature-sieve/v0.2');
assert.equal(sieve.state, 'SOURCE_BOUND_TAXONOMY_NO_SCIENTIFIC_PROMOTION');
assert.equal(sieve.authority.legal_prior_art_search, false);
assert.equal(sieve.authority.exhaustive_literature_review, false);
assert.equal(sieve.authority.automatic_novelty_promotion, false);
assert.equal(sieve.authority.automatic_ontology_deletion, false);
assert.equal(sieve.authority.private_wendbine_material_admitted, false);
assert.equal(sieve.authority.historical_wendbine_expansion, false);
assert.equal(sieve.authority.merge, false);
assert.equal(sieve.authority.deployment, false);
assert.equal(sieve.authority.vercel, false);
assert.equal(sieve.authority.human_closure_required, true);

for (const law of [
  'FAIL_TO_FIND_PRIOR_ART != NOVELTY',
  'FIND_PRIOR_ART != USELESSNESS',
  'KNOWN_THEOREM != KNOWN_APPLICATION',
  'KNOWN_COMPONENTS != REDUNDANT_COMPOSITION',
  'DOMAIN_SPECIFIC_REFRAMING != NEW_MATHEMATICS',
  'STANDARD_TERM_COLLISION_REQUIRES_CORRECTION',
  'FOUND_PARENT != BURY_COMPOSITION',
]) assert.ok(sieve.laws.includes(law), `missing sieve law: ${law}`);

assert.ok(sieve.source_bank.length >= 10, 'sieve must bind a multi-family external source bank');
assert.ok(new Set(sieve.source_bank.map(source => source.family)).size >= 8, 'source bank must span multiple independent disciplinary families');
for (const source of sieve.source_bank) {
  assert.match(source.url, /^https:\/\//, `source ${source.id} must have a public https URL`);
  assert.ok(source.bounded_use.length > 20, `source ${source.id} must state its bounded use`);
}

assert.equal(supplement.schema, 'td613.residual-literature-sieve-source-supplement/v0.1');
assert.equal(supplement.state, 'SOURCE_BINDING_CORRECTION');
assert.equal(supplement.amends, '2026-09-11-td613-residual-literature-sieve-v02.json');
assert.equal(supplement.authority.changes_verdicts, false);
assert.equal(supplement.authority.promotes_novelty, false);
assert.equal(supplement.authority.expands_private_corpus, false);
assert.equal(supplement.authority.merge, false);
assert.equal(supplement.authority.deployment, false);
assert.equal(supplement.authority.human_closure_required, true);
const supplementalSources = new Map(supplement.sources.map(source => [source.id, source]));
for (const id of ['I2_STATISTICAL_IDENTIFIABILITY', 'I3_MIT_DATA_PROCESSING', 'C2_SELECTIVE_CLASSIFICATION']) {
  assert.ok(supplementalSources.has(id), `missing source-binding supplement: ${id}`);
  assert.match(supplementalSources.get(id).url, /^https:\/\//);
}
assert.deepEqual(supplement.applies_to.WESTERN_HORIZON, ['I2_STATISTICAL_IDENTIFIABILITY', 'I3_MIT_DATA_PROCESSING']);
assert.deepEqual(supplement.applies_to.PRCS_A, ['C2_SELECTIVE_CLASSIFICATION']);

const rows = new Map(sieve.verdicts.map(row => [row.id, row]));
assert.equal(rows.size, 7);

assert.equal(rows.get('FADT').new_status, 'NEW_THEOREM_CLAIM_REJECTED_RETAIN_AS_AUDIT_LEMMA');
assert.match(rows.get('FADT').ordinary_terms.join(' '), /quotient factorization/i);
assert.match(rows.get('FADT').retained_value, /audit/i);
assert.equal(rows.get('FADT').scar, 'FADT != PAWLAK_ROUGH_SET_THEORY');

assert.equal(rows.get('WESTERN_HORIZON').new_status, 'NEW_THEOREM_CLAIM_REJECTED_RETAIN_AS_FORENSIC_STOPPING_RULE');
assert.match(rows.get('WESTERN_HORIZON').ordinary_terms.join(' '), /non-identifiability/i);
assert.match(rows.get('WESTERN_HORIZON').terminology_correction, /target-informative auxiliary witness/i);

assert.equal(rows.get('VCPL').new_status, 'KNOWN_COMPONENTS_RETAIN_AS_CROSS_DISCIPLINARY_FORENSIC_TAXONOMY');
assert.equal(rows.get('VCPL').secondary_status, 'STANDARD_TERM_COLLISION_REQUIRES_ALIAS');
assert.match(rows.get('VCPL').terminology_correction, /observability/i);
assert.match(rows.get('VCPL').ordinary_terms.join(' '), /trace visibility/i);
assert.match(rows.get('VCPL').ordinary_terms.join(' '), /state observability/i);

assert.equal(rows.get('AIA').new_status, 'KNOWN_MULTI_VIEW_IFC_COMPOSITION_WITH_GOVERNANCE_RESIDUAL');
assert.match(rows.get('AIA').ordinary_terms.join(' '), /secure multi-execution/i);
assert.match(rows.get('AIA').retained_value, /authority non-transfer/i);

assert.equal(rows.get('PRCS_A').new_status, 'KNOWN_COMPONENTS_HELD_COMPOSITION');
assert.match(rows.get('PRCS_A').ordinary_terms.join(' '), /coarsening/i);
assert.match(rows.get('PRCS_A').retained_value, /exact ordered composition/i);

assert.equal(rows.get('HOLONOMY_LOOM').new_status, 'KNOWN_ARCHITECTURAL_COMPOSITION_RETAIN_BOUNDED_USE');
assert.match(rows.get('HOLONOMY_LOOM').ordinary_terms.join(' '), /event sourcing/i);
assert.match(rows.get('HOLONOMY_LOOM').ordinary_terms.join(' '), /proof-carrying authorization/i);
assert.match(rows.get('HOLONOMY_LOOM').terminology_correction, /Reserve holonomy/i);

assert.equal(rows.get('SAFE_HARBOR_RIGHT_OF_RESIGNATION').new_status, 'GOVERNANCE_SYNTHESIS_WITH_PRIOR_NEIGHBORS');
assert.match(rows.get('SAFE_HARBOR_RIGHT_OF_RESIGNATION').ordinary_terms.join(' '), /withdrawal/i);
assert.match(rows.get('SAFE_HARBOR_RIGHT_OF_RESIGNATION').retained_value, /after the custodian ceases participation/i);

assert.equal(sieve.counts.verdict_rows, 7);
assert.equal(sieve.counts.new_theorem_claims_rejected, 2);
assert.equal(sieve.counts.standard_term_collisions_requiring_correction, 1);
assert.equal(sieve.counts.residual_novelty_candidates_promoted, 0);
assert.ok(sieve.retained_residue.length >= 7);
assert.ok(sieve.next_attacks.length >= 5);

assert.equal(sieve.branch_posture.main_observed_at_sieve_start, '103afff8b76ca2977dd50eb6498df639b280d1fa');
assert.equal(sieve.branch_posture.research_branch_was_behind_current_main, true);
assert.equal(sieve.branch_posture.rebase_performed, false);
assert.equal(sieve.branch_posture.merge_performed, false);
assert.equal(sieve.branch_posture.deploy_performed, false);

console.log('TD613 residual literature sieve v0.2 passed: broad novelty claims can die without deleting bounded research value.');
