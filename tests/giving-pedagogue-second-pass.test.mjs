import assert from 'node:assert/strict';
import fs from 'node:fs';
import { compilePedagogueDesignReview } from '../app/engine/pedagogue-design-gate.js';

const fixture = JSON.parse(fs.readFileSync('tests/fixtures/pedagogue/giving-discovery-handoff-design.json', 'utf8'));
const review = await compilePedagogueDesignReview(fixture);

for (const [gate, held] of Object.entries(review.design_gate)) {
  assert.equal(held, true, `Pedagogue second-pass gate must hold ${gate}`);
}
assert.equal(review.surface_reference, 'Giving/Individual Contributor prepared handoff');
assert.equal(review.design_gate.consequence_before_ontology, true);
assert.equal(review.design_gate.rest_and_exit_preserved, true);
assert.equal(review.design_gate.aia_invariants_preserved, true);
assert.equal(review.design_gate.aia_surface_bound, true);
assert.equal(review.design_gate.route_history_explicit, true);
assert.equal(review.design_gate.route_burden_non_worsening, true);
assert.equal(review.design_gate.automatic_redesign_forbidden, true);
assert.equal(review.design_gate.human_closure_required, true);
assert.ok(review.burden_comparison.improved_model_count >= 1, 'prepared route-memory design should improve at least one comparative burden model');
assert.ok(Object.values(review.burden_comparison.delta_millipoints).every((value) => value <= 0), 'prepared route-memory design may not worsen any burden model');

const handoff = fs.readFileSync('app/giving/history/giving-contributor-handoff.js', 'utf8');
const handoffCss = fs.readFileSync('app/giving/history/giving-contributor-handoff.css', 'utf8');
assert.match(handoff, /PREPARED ROUTE/);
assert.match(handoff, /nothing searched by this handoff/);
assert.match(handoff, /SEARCH started by explicit operator gesture/);
assert.match(handoff, /if \(prepared && current !== prepared\) clearPreparedRoute\(\)/, 'editing away from the prepared contributor must remove stale route origin');
assert.match(handoff, /retrieval_started: false/);
assert.match(handoff, /exact_match_changed: false/);
assert.match(handoffCss, /\.giving-prepared-handoff/);

console.log(JSON.stringify({
  schema: 'td613.pedagogue-second-pass-receipt/v0.1',
  design_id: review.design_id,
  surface_reference: review.surface_reference,
  phases: review.phases,
  burden_delta_millipoints: review.burden_comparison.delta_millipoints,
  improved_model_count: review.burden_comparison.improved_model_count,
  route_history_explicit: review.design_gate.route_history_explicit,
  aia_invariants_preserved: review.design_gate.aia_invariants_preserved,
  authority_transferred: review.aia_surface_family_report.authority_transferred,
  automatic_redesign_forbidden: review.design_gate.automatic_redesign_forbidden,
  human_closure_required: review.design_gate.human_closure_required,
  status: 'PASS'
}, null, 2));