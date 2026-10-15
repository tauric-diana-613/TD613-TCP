import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createPortableLoomGoldenEggKernel,
  evaluatePortableLoomGoldenEggEvidence
} from '../app/engine/portable-loom-golden-egg-kernel.js';
import { getObserverCase } from '../app/dome-world/holonomy-loom/observer-cases.js';

test('portable research export carries the exact five-surface target with no invented measurement', () => {
  const contract=createPortableLoomGoldenEggKernel();
  assert.deepEqual(contract.mathematical_target.surfaces,['L','R','J','G','C']);
  assert.deepEqual(Object.values(contract.observation),[null,null,null,null,null]);
  assert.deepEqual(contract.mathematical_target.thresholds,{
    leakage_bits_max:0.5,reconstruction_distance_max:0.2,joining_synergy_bits_max:0.1
  });
  assert.equal(contract.mathematical_target.same_immutable_episode_required,true);
  assert.equal(contract.mathematical_target.distinct_observed_matched_returns_required,true);
  assert.equal(contract.empirical_credit,0);
  assert.equal(contract.golden_egg_earned,false);
  assert.equal(Object.isFrozen(contract.mathematical_target),true);
});

test('finite parity computes real signed joining information but never earns empirical credit', () => {
  const result=evaluatePortableLoomGoldenEggEvidence({
    finite_channel_model:getObserverCase('parity'),
    selected_channels:['first','second','third']
  });
  assert.equal(result.status,'HELD_NO_EMPIRICAL_EPISODE');
  assert.equal(result.finite_synthetic_calculation.status,'SYNTHETIC_CALCULATED');
  assert.ok(Math.abs(result.finite_synthetic_calculation.routes.control.signed_excess_bits-1)<1e-12);
  assert.equal(result.finite_synthetic_calculation.routes.control.authorized_accuracy,1);
  assert.equal(result.empirical_credit,0);
  assert.equal(result.golden_egg_earned,false);
  assert.equal(result.five_surface_empirical_observation,null);
});

test('negative redundancy stays signed and cannot be treated as privacy',()=>{
  const result=evaluatePortableLoomGoldenEggEvidence({
    finite_channel_model:getObserverCase('redundancy'),selected_channels:['first','second']
  });
  assert.ok(result.finite_synthetic_calculation.routes.control.signed_excess_bits < -0.99);
  assert.ok(result.finite_synthetic_calculation.routes.control.selected_view.total_recovery > 0.99);
  assert.equal(result.golden_egg_earned,false);
});

test('uncaptured observer channels stay held, with no silently filled zero',()=>{
  const result=evaluatePortableLoomGoldenEggEvidence({
    finite_channel_model:getObserverCase('missing'),selected_channels:['reply','error']
  });
  assert.equal(result.finite_synthetic_calculation.status,'HELD_MISSING_CHANNELS');
  assert.equal(result.finite_synthetic_calculation.routes.protected.selected_view,null);
  assert.equal(result.empirical_credit,0);
});

test('unsupported empirical declaration cannot become an earned Golden Egg through local evaluation',()=>{
  const result=evaluatePortableLoomGoldenEggEvidence({
    empirical_episode:{episode_id:'claimed',immutable_episode:true}
  });
  assert.ok(['INADMISSIBLE','HELD'].includes(result.status));
  assert.equal(result.local_episode_evaluation.empirical_candidate_qualified,false);
  assert.equal(result.golden_egg_earned,false);
});
