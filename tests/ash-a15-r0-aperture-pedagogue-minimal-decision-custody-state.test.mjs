import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  MINIMAL_DECISION_CUSTODY_STATE_SCHEMA,
  buildOuterStates,
  buildCentralStates,
  selectByRepresentation,
  runMinimalDecisionCustodyStateGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-minimal-decision-custody-state.js';

const outer=buildOuterStates();
assert.equal(outer.length,6);
for (const magnitude of [0.0008,0.001,0.0012]) {
  const pos=outer.find(state=>state.sign===1 && state.magnitude===magnitude);
  const neg=outer.find(state=>state.sign===-1 && state.magnitude===magnitude);
  assert.equal(pos.aperture.deficit_class,'NUMERICAL_STABILITY_DEFICIT');
  assert.equal(neg.aperture.deficit_class,'NUMERICAL_STABILITY_DEFICIT');
  assert.equal(pos.aperture.disposition,'PROPOSE');
  assert.equal(neg.aperture.disposition,'PROPOSE');
  assert.ok(Math.abs(pos.scalar_geometry.sigma_min-neg.scalar_geometry.sigma_min) <= 1e-12);
  assert.ok(Math.abs(pos.scalar_geometry.sigma_max-neg.scalar_geometry.sigma_max) <= 1e-12);
  assert.ok(Math.abs(pos.scalar_geometry.condition_number-neg.scalar_geometry.condition_number) <= 1e-9);
  assert.equal(pos.post_action_replay.Q_PLUS_REPAIR.closure,true);
  assert.equal(pos.post_action_replay.Q_MINUS_REPAIR.closure,false);
  assert.equal(neg.post_action_replay.Q_PLUS_REPAIR.closure,false);
  assert.equal(neg.post_action_replay.Q_MINUS_REPAIR.closure,true);
}

const samplePos=outer.find(state=>state.sign===1 && state.magnitude===0.001);
const sampleNeg=outer.find(state=>state.sign===-1 && state.magnitude===0.001);
assert.equal(selectByRepresentation(samplePos,'D0_DEFICIT_CLASS_ONLY').action,'Q_PLUS_REPAIR');
assert.equal(selectByRepresentation(sampleNeg,'D0_DEFICIT_CLASS_ONLY').action,'Q_PLUS_REPAIR');
assert.equal(selectByRepresentation(samplePos,'D2_DEFICIT_PLUS_SIGNED_ORIENTATION').action,'Q_PLUS_REPAIR');
assert.equal(selectByRepresentation(sampleNeg,'D2_DEFICIT_PLUS_SIGNED_ORIENTATION').action,'Q_MINUS_REPAIR');
assert.equal(selectByRepresentation(samplePos,'D3_DEFICIT_PLUS_ROUTE_PROVENANCE').action,'Q_PLUS_REPAIR');
assert.equal(selectByRepresentation(sampleNeg,'D3_DEFICIT_PLUS_ROUTE_PROVENANCE').action,'Q_MINUS_REPAIR');
assert.throws(()=>selectByRepresentation(samplePos,'D9_MAGIC'),/Unknown decision representation/);

const corrupt=buildOuterStates({corruptRoute:true});
assert.ok(corrupt.every(state=>state.provenance_corrupted===true));
assert.ok(corrupt.every(state=>state.route_provenance!==state.true_route));

const central=buildCentralStates();
assert.equal(central.length,5);
for (const state of central) {
  assert.equal(state.post_action_replay.Q_PLUS_REPAIR.closure,true);
  assert.equal(state.post_action_replay.Q_MINUS_REPAIR.closure,true);
  assert.equal(state.post_action_replay.Q_PLUS_REPAIR.observation_executed,false);
  assert.equal(state.post_action_replay.Q_MINUS_REPAIR.observation_executed,false);
}

const receipt=runMinimalDecisionCustodyStateGauntlet();
assert.equal(receipt.schema,MINIMAL_DECISION_CUSTODY_STATE_SCHEMA);
assert.equal(receipt.source_status,'SIMULATED');
assert.equal(receipt.authority_class,'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional,true);
assert.ok(receipt.outer_scalar_pair_witness.every(pair=>pair.scalar_matched && pair.opposite_orientation));
assert.equal(receipt.decision_representations.d0.closure_count,3);
assert.equal(receipt.decision_representations.d1.closure_count,3);
assert.equal(receipt.decision_representations.d2.closure_count,6);
assert.equal(receipt.decision_representations.d3.closure_count,6);
assert.equal(receipt.route_corruption_control.signed_orientation.closure_count,6);
assert.equal(receipt.route_corruption_control.route_provenance.closure_count,0);
assert.equal(receipt.central_decision_equivalence_band.states.length,5);
assert.equal(receipt.central_decision_equivalence_band.both_repairs_close,true);
assert.equal(receipt.custody_packet_retained,true);
assert.equal(receipt.decision_state_is_projection_of_custody,true);
assert.equal(receipt.gauntlet_status,'LOCAL_DECISION_STATE_CUSTODY_STATE_SEPARATION_WITNESSED_IN_BOUNDED_SYNTHETIC_FIXTURE');
assert.ok(receipt.anti_equivalences.includes('decision state != custody state'));
assert.ok(receipt.anti_equivalences.includes('provenance not needed by selector != provenance not needed by system'));
assert.match(receipt.next_learning_action,/NOISY_ORIENTATION_ESTIMATION/);
assert.equal(receipt.claims.sufficient_statistic_theorem,false);
assert.equal(receipt.claims.provenance_unnecessary,false);
assert.equal(receipt.claims.active_learning,false);
assert.equal(receipt.claims.holonomy,false);
assert.equal(receipt.claims.production_authority,false);
assert.equal(receipt.claims.vercel_authority,false);
assert.equal(receipt.installed_aperture_mutated,false);
assert.equal(receipt.pedagogue_law_promoted,false);
assert.equal(receipt.automatic_execution,false);
assert.equal(receipt.production_mutated,false);
assert.equal(receipt.promotion_authority,false);
assert.equal(receipt.human_closure_required,true);

const spec=fs.readFileSync(
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_MINIMAL_DECISION_STATE_CUSTODY_SEPARATION_GAUNTLET_SPEC_V0_1.md','utf8'
);
assert.match(spec,/minimal decision state != minimal evidentiary receipt/);
assert.match(spec,/decision-equivalence band/);
assert.match(spec,/route-label corruption/);
assert.match(spec,/TEST_DECISION_STATE_CUSTODY_STATE_SEPARATION_UNDER_NOISY_ORIENTATION_ESTIMATION/);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  d0_closure:receipt.decision_representations.d0.closure_count,
  d1_closure:receipt.decision_representations.d1.closure_count,
  d2_closure:receipt.decision_representations.d2.closure_count,
  d3_closure:receipt.decision_representations.d3.closure_count,
  corrupted_orientation_closure:receipt.route_corruption_control.signed_orientation.closure_count,
  corrupted_route_closure:receipt.route_corruption_control.route_provenance.closure_count,
  central_band_both_repairs_close:receipt.central_decision_equivalence_band.both_repairs_close,
  next_learning_action:receipt.next_learning_action,
  promotion_authority:receipt.promotion_authority
},null,2));