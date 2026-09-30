import assert from 'node:assert/strict';
import { evaluateGoldenEggEvidenceClosure } from '../app/dome-world/previews/a15-r0/golden-egg-evidence-closure-nogo.js';

const s=(name,e,value)=>({name,episode_id:e,value,measured:true});
const empirical=(id,e,surfaces)=>({source_id:id,episode_id:e,evidence_class:'PUBLIC_EMPIRICAL_CASE',surfaces});

{
  const e='positive-e1';
  const c=evaluateGoldenEggEvidenceClosure([
    empirical('A',e,[s('observer',e,0.1),s('reconstruction',e,0.1)]),
    empirical('B',e,[s('joining',e,0.05),s('geometry',e,1),s('matched_return',e,1)])
  ]);
  assert.equal(c.empirical_episode_count,1);
  assert.equal(c.counts.core_joint_realized_episodes,1);
  assert.equal(c.counts.geometric_joint_realized_episodes,1);
  assert.equal(c.counts.operational_return_eligible_episodes,1);
  assert.equal(c.episodes[0].source_ids.length,2);
}

{
  const values={observer:0.1,reconstruction:0.1,joining:0.05,geometry:1,matched_return:1};
  const packets=Object.entries(values).map(([name,value],i)=>empirical(`F${i}`,`frankenstein-e${i}`,[s(name,`frankenstein-e${i}`,value)]));
  const c=evaluateGoldenEggEvidenceClosure(packets);
  assert.equal(c.all_class_operational_marginal_support.length,5);
  assert.equal(c.empirical_operational_marginal_support.length,5);
  assert.equal(c.counts.operational_return_eligible_episodes,0);
  assert.equal(c.empirical_episode_count,5);
}

{
  const e='mixed-e1';
  const c=evaluateGoldenEggEvidenceClosure([
    {source_id:'SYNTH',episode_id:e,evidence_class:'SIMULATED_FACTORIZED_PRODUCT_SPACE',surfaces:[s('observer',e,0.1),s('reconstruction',e,0.1),s('joining',e,0.05)]},
    empirical('EMP',e,[s('geometry',e,1),s('matched_return',e,1)])
  ]);
  assert.equal(c.all_class_operational_marginal_support.length,5);
  assert.deepEqual(c.empirical_operational_marginal_support,['geometry','matched_return']);
  assert.equal(c.counts.core_joint_realized_episodes,0);
  assert.equal(c.counts.operational_return_eligible_episodes,0);
}

{
  const e='proxy-e1';
  const c=evaluateGoldenEggEvidenceClosure([empirical('PROXY',e,[s('observer',e,0.1),s('reconstruction',e,0.1),s('joining',e,0.05),s('geometry',e,1),s('matched_reader_validation',e,1)])]);
  assert.equal(c.counts.geometric_joint_realized_episodes,1);
  assert.equal(c.counts.operational_return_eligible_episodes,0);
  assert.deepEqual(c.episodes[0].operational_missing,['matched_return']);
}

{
  const e='threshold-e1';
  const c=evaluateGoldenEggEvidenceClosure([empirical('THRESHOLD',e,[s('observer',e,0.9),s('reconstruction',e,0.1),s('joining',e,0.05),s('geometry',e,1),s('matched_return',e,1)])]);
  assert.deepEqual(c.empirical_operational_marginal_support,['observer','reconstruction','joining','geometry','matched_return']);
  assert.equal(c.episodes[0].thresholds_pass,false);
  assert.equal(c.counts.core_joint_realized_episodes,0);
  assert.equal(c.counts.operational_return_eligible_episodes,0);
}

{
  const e='conflict-e1';
  const c=evaluateGoldenEggEvidenceClosure([
    empirical('C1',e,[s('observer',e,0.1),s('reconstruction',e,0.1),s('joining',e,0.05)]),
    empirical('C2',e,[s('observer',e,0.2),s('geometry',e,1),s('matched_return',e,1)])
  ]);
  assert.deepEqual(c.episodes[0].required_conflicts,['observer']);
  assert.equal(c.episodes[0].thresholds_pass,false);
  assert.equal(c.counts.operational_return_eligible_episodes,0);
}

console.log('Ash A15-R0 Golden Egg evidence-closure no-go hostile tests passed.');
