import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  APERTURE_PEDAGOGUE_REPLAY_ENVELOPE_CONSEQUENCE_SCHEMA,
  runAperturePedagogueReplayEnvelopeConsequenceAssay
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-replay-envelope-consequence.js';
import {
  APERTURE_V32_REPLAY_STABILITY
} from '../app/engine/aperture-v32-typed-epistemic-deficit.js';

const receipt = runAperturePedagogueReplayEnvelopeConsequenceAssay();

assert.equal(receipt.schema, APERTURE_PEDAGOGUE_REPLAY_ENVELOPE_CONSEQUENCE_SCHEMA);
assert.equal(receipt.source_status, 'SIMULATED');
assert.equal(receipt.authority_class, 'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional, true);
assert.equal(receipt.experiment_host, 'DOME_WORLD_A15_R0');

const sigma = receipt.boundary_map.sigma_floor;
assert.equal(sigma.analytic_boundary, 0.25);
assert.equal(sigma.expected_boundary_exposed, true);
assert.deepEqual(sigma.replays.map(item=>item.deficit_class), [
  'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT',
  'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT',
  'NUMERICAL_STABILITY_DEFICIT'
]);

const noise = receipt.boundary_map.correlated_noise_diagnostic;
assert.equal(noise.raw_operator_unchanged, true);
assert.equal(noise.analytic_fraction, '99/101');
assert.ok(Math.abs(noise.analytic_boundary - 99/101) < 1e-12);
assert.equal(noise.expected_boundary_exposed, true);
assert.equal(noise.replays[0].deficit_class, 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT');
assert.equal(noise.replays[2].deficit_class, 'NUMERICAL_STABILITY_DEFICIT');
assert.ok(noise.replays[0].condition_number < 10);
assert.ok(noise.replays[2].condition_number > 10);

const question = receipt.boundary_map.question_selection;
assert.deepEqual(question.seed_interval, [0.545,0.547]);
assert.equal(question.bracket_valid, true);
assert.ok(question.lower > 0.545);
assert.ok(question.upper < 0.547);
assert.ok(question.width < 1e-8);
assert.equal(question.lower_selected_probe_id, 'P_ORTH');
assert.equal(question.upper_selected_probe_id, 'P_DIAG');

const consequence = receipt.held_out_consequence;
assert.equal(consequence.candidate_continuity.P_ORTH.locally_smooth, true);
assert.equal(consequence.candidate_continuity.P_DIAG.locally_smooth, true);
assert.equal(consequence.functional_winners_stable_across_neighborhood, true);
assert.equal(consequence.mixed_functional_winners, true);
assert.equal(consequence.selected_question_flips, true);
assert.equal(consequence.no_scalar_aggregation, true);
assert.equal(consequence.held_out_used_for_selection, false);

const left = consequence.evaluations.find(item=>item.point_id === 'LEFT');
const right = consequence.evaluations.find(item=>item.point_id === 'RIGHT');
assert.equal(left.selected_probe_id, 'P_ORTH');
assert.equal(right.selected_probe_id, 'P_DIAG');
assert.deepEqual(left.functional_winners, right.functional_winners);
assert.ok(Object.values(left.functional_winners).includes('P_ORTH'));
assert.ok(Object.values(left.functional_winners).includes('P_DIAG'));
assert.equal(left.functional_winners.H_Y, 'P_ORTH');
assert.equal(left.functional_winners.H_DIFF, 'P_ORTH');
assert.equal(left.functional_winners.H_SUM, 'P_DIAG');

assert.ok(receipt.bounded_results.includes('CANDIDATE_HELD_OUT_CONSEQUENCE_SURFACES_REMAIN_LOCAL_SMOOTH_ACROSS_SELECTION_SWITCH'));
assert.ok(receipt.anti_equivalences.includes('categorical decision boundary != physical/performance cliff'));
assert.ok(receipt.anti_equivalences.includes('question selected by one declared criterion != universally best question'));
assert.equal(receipt.no_scalar_crown, true);
assert.equal(receipt.installed_aperture_replay_flag_mutated, false);
assert.equal(receipt.installed_aperture_replay_flag_expected, 'HELD_NOT_YET_WITNESSED');
assert.equal(APERTURE_V32_REPLAY_STABILITY, 'HELD_NOT_YET_WITNESSED');
assert.equal(receipt.promotion_authority, false);
assert.equal(receipt.automatic_execution, false);
assert.equal(receipt.production_mutated, false);
assert.equal(receipt.standalone_aperture_ui_mutated, false);
assert.equal(receipt.human_closure_required, true);
for (const claim of Object.values(receipt.claims)) assert.equal(claim, false);

const spec = fs.readFileSync(
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_REPLAY_ENVELOPE_CONSEQUENCE_SPEC_V0_1.md',
  'utf8'
);
assert.match(spec, /rho\* = \(c\^2 - 1\) \/ \(c\^2 \+ 1\) = 99\/101/);
assert.match(spec, /categorical decision boundary != physical\/performance cliff/);
assert.match(spec, /question selected by one declared criterion != universally best question/);
assert.match(spec, /No held-out functional participates in question selection/);
assert.match(spec, /installed Aperture replay flag remains `HELD_NOT_YET_WITNESSED`/);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  sigma_boundary:sigma.analytic_boundary,
  correlated_noise_boundary:noise.analytic_boundary,
  question_selection_boundary:{
    lower:question.lower,
    upper:question.upper,
    width:question.width
  },
  left_selected:left.selected_probe_id,
  right_selected:right.selected_probe_id,
  held_out_winners:left.functional_winners,
  selected_policy_boundary_jump_vector:consequence.selected_policy_boundary_jump_vector,
  no_scalar_crown:receipt.no_scalar_crown,
  installed_replay_flag:APERTURE_V32_REPLAY_STABILITY,
  next_learning_action:receipt.next_learning_action,
  promotion_authority:receipt.promotion_authority
}, null, 2));
