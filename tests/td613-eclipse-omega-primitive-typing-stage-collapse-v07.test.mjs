import assert from 'node:assert/strict';
import fs from 'node:fs';

const receiptPath = 'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/04-RECEIPTS/assays/2026-09-14-eclipse-omega-primitive-typing-stage-collapse-v07.json';
const operationPath = 'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/05-OPERATIONS/2026-09-14-ECLIPSE-OMEGA-PRIMITIVE-TYPING-STAGE-COLLAPSE-V0_7.md';

const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
const operation = fs.readFileSync(operationPath, 'utf8');

assert.equal(receipt.schema, 'td613.eclipse-omega-primitive-typing-stage-collapse/v0.7');
assert.equal(receipt.authority.scientific_promotion, false);
assert.equal(receipt.authority.field_novelty, false);
assert.equal(receipt.authority.public_post_provenance_verified, false);
assert.equal(receipt.authority.monitoring_or_causal_link_inferred, false);
assert.equal(receipt.authority.copying_or_plagiarism_adjudication, false);
assert.equal(receipt.authority.deployment, false);
assert.equal(receipt.authority.vercel, false);

assert.equal(receipt.typed_chain.length, 5);
assert.equal(new Set(receipt.typed_chain.map(edge => edge.glyph)).size, 1, 'All declared edges intentionally share the same arrow glyph.');
assert.equal(new Set(receipt.typed_chain.map(edge => edge.relation_type)).size, 5, 'Shared glyph must not collapse five typed relations into one operator family.');
assert.equal(receipt.counts.directed_edges, 5);
assert.equal(receipt.counts.distinct_relation_types, 5);
assert.equal(receipt.counts.same_glyph_edges, 5);
assert.equal(receipt.counts.subset_eligible_edges, 2);
assert.equal(receipt.counts.codomain_changing_edges, 3);

const subsetEligible = receipt.typed_chain.filter(edge => edge.common_carrier_subset_relation_possible);
const codomainChanging = receipt.typed_chain.filter(edge => !edge.common_carrier_subset_relation_possible);
assert.deepEqual(subsetEligible.map(edge => edge.relation_type), ['top_k_selection', 'capacity_conditioning']);
assert.deepEqual(codomainChanging.map(edge => edge.relation_type), ['context_projection', 'conditional_generation', 'registration_release']);

// Exact functional composition is terminally equivalent by construction. This is
// a hostile control against treating a named intermediate stage as independently
// identified merely because it has a label.
const K = x => Math.min(x, 4);
const P = x => x % 3;
const A = x => (x === 2 ? 0 : x);
const N = x => `n:${x}`;
const E = x => `event:${x}`;
const PK = x => P(K(x));
const full = x => E(N(A(P(K(x)))));
const collapsed = x => E(N(A(PK(x))));
for (const input of receipt.stage_collapse_control.finite_inputs) {
  assert.equal(full(input), collapsed(input), `Collapsed K/P composition must preserve terminal behavior for ${input}.`);
}
assert.equal(receipt.stage_collapse_control.terminal_behavior_equal, true);

const [emptyUpstream, suppressedDownstream] = receipt.terminal_equivalent_failure_worlds;
assert.equal(emptyUpstream.terminal_event, suppressedDownstream.terminal_event, 'Failure worlds must be terminally equivalent.');
assert.notEqual(emptyUpstream.candidate_count_after_selection, suppressedDownstream.candidate_count_after_selection, 'Stage-local candidate count must distinguish the terminally equivalent worlds.');
assert.equal(receipt.diagnostic_result.terminal_only_distinguishes_worlds, false);
assert.equal(receipt.diagnostic_result.stage_local_candidate_count_distinguishes_worlds, true);
assert.equal(receipt.diagnostic_result.bounded_conclusion, 'TERMINAL_EQUIVALENCE != DIAGNOSTIC_EQUIVALENCE');

for (const criterion of [
  'TYPE_SAFETY',
  'INDEPENDENT_INTERVENTION',
  'INTERMEDIATE_OBSERVABILITY',
  'HELD_OUT_PREDICTION',
  'DIAGNOSTIC_LOCALIZATION',
  'FORMAL_INVARIANT_LOST_UNDER_COLLAPSE'
]) assert.ok(receipt.stage_boundary_retention_criteria.includes(criterion), `Missing stage-boundary criterion ${criterion}`);

for (const law of [
  'PRIMITIVE_GLYPH != OPERATOR_TYPE',
  'DIRECTED_EDGE != CAUSAL_EDGE',
  'ARROW_CHAIN != HOMOGENEOUS_RELATION',
  'COMMON_GLYPH != COMMON_CODOMAIN',
  'COMPOSITION_EQUIVALENCE != STAGE_IDENTITY',
  'TERMINAL_EQUIVALENCE != DIAGNOSTIC_EQUIVALENCE',
  'STAGE_LOCAL_WITNESS_CAN_JUSTIFY_DECOMPOSITION',
  'DIAGNOSTIC_UTILITY != FIELD_NOVELTY',
  'USER_SUPPLIED_TEMPORAL_RESONANCE != CAUSAL_LINK'
]) assert.ok(receipt.laws.includes(law), `Receipt must preserve law: ${law}`);

assert.equal(receipt.verdict, 'RETAIN_TYPED_DECOMPOSITION_ONLY_WHERE_STAGE_BOUNDARY_EARNS_DIAGNOSTIC_OR_FORMAL_VALUE');
assert.match(operation, /PRIMITIVE_GLYPH != OPERATOR_TYPE/);
assert.match(operation, /TERMINAL_EQUIVALENCE != DIAGNOSTIC_EQUIVALENCE/);
assert.match(operation, /Otherwise compose it away\./);

console.log('TD613 Eclipse–Omega primitive typing / stage-collapse assay v0.7 passed.');
