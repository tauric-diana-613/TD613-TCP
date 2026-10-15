import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildGoldenEggFeasibleRegion } from '../app/dome-world/previews/a15-r0/golden-egg-feasible-region.js';
import { evaluateGoldenEggEpisodeCandidate } from '../app/engine/dollhouse-claim-lift-runtime.js';
import { buildPortableLoomResearchMathContract, evaluatePortableLoomResearchEpisode } from '../app/engine/portable-loom-research-math.js';

test('standard artifact math comes from both executable kernels, not prose constants',()=>{
  const kernel=buildGoldenEggFeasibleRegion();
  const math=buildPortableLoomResearchMathContract();
  const evaluator=evaluateGoldenEggEpisodeCandidate({});
  assert.deepEqual(math.thresholds,evaluator.thresholds);
  assert.equal(math.thresholds.L_max,kernel.thresholds.observer_leakage_bits);
  assert.equal(math.thresholds.R_max,kernel.thresholds.reconstruction_distance);
  assert.equal(math.thresholds.J_max,kernel.thresholds.joining_synergy_bits);
  assert.equal(math.calculated_synthetic_region.formal_candidate_count,kernel.formal_candidate_count);
  assert.equal(math.calculated_synthetic_region.feasible_candidate_count,kernel.feasible_candidate_count);
  assert.equal(math.calculated_synthetic_region.pareto_candidate_count,kernel.pareto_candidate_count);
  assert.deepEqual(math.calculated_synthetic_region.failure_vectors,kernel.failure_vectors);
  assert.deepEqual(math.surfaces,['L','R','J','G','C']);
  assert.match(math.equations.J,/I\(H;X,Y\) - I\(H;X\) - I\(H;Y\)/);
});

test('zero acquisition earns zero empirical credit or recipient authority',()=>{
  const math=buildPortableLoomResearchMathContract();
  assert.equal(math.calculated_synthetic_region.source_status,'SIMULATED_FACTORIZED_PRODUCT_SPACE');
  assert.equal(math.calculated_synthetic_region.joint_realizability,'UNMEASURED');
  assert.equal(math.calculated_synthetic_region.empirical_candidate_count,0);
  assert.equal(math.measured_surface_count,0);
  assert.equal(math.episode_evaluation_status,'NOT_RUN');
  assert.equal(math.earned_empirical_result,false);
  assert.equal(math.authority_transferred,false);
  assert.equal(math.receiver_math_is_declaration_only,true);
  assert.equal(evaluatePortableLoomResearchEpisode({}).status,'INADMISSIBLE');
});

test('standard export embeds derived mathematical annex beside, never inside, root packet',()=>{
  const source=readFileSync(new URL('../scripts/export-standard-portable-loom.mjs',import.meta.url),'utf8');
  assert.match(source,/research_math_contract: buildPortableLoomResearchMathContract\(\)/);
  assert.match(source,/createPortableLoomSessionExport\(session, packet, environment\)/);
  assert.match(source,/episode_evaluation_status !== 'NOT_RUN'/);
  assert.match(source,/research_math_schema: artifact.research_math_contract.schema/);
});
