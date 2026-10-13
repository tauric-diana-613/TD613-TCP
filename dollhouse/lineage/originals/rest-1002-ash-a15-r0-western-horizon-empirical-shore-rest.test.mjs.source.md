import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  WESTERN_HORIZON_EMPIRICAL_SHORE_REST_CERTIFICATE as R,
  WESTERN_HORIZON_EMPIRICAL_SHORE_REST_PARENT
} from '../app/dome-world/previews/a15-r0/western-horizon-empirical-shore-rest.js';
import { GOLDEN_EGG_EXTERIORITY_CONVERGENCE_CERTIFICATE as C } from '../app/dome-world/previews/a15-r0/golden-egg-exteriority-convergence.js';

assert.equal(WESTERN_HORIZON_EMPIRICAL_SHORE_REST_PARENT,'6c78f43adbbe28143d6114824cc9396dff48dcab');
assert.equal(C.passed,true,'#1001 exteriority convergence must remain earned.');
assert.equal(C.golden_egg_earned,false);
assert.equal(C.next_earned_frontier,'INDEPENDENT_EXOGENOUS_EMPIRICAL_WITNESS_ADMISSION');

assert.equal(R.passed,true);
assert.equal(R.status,'OFFICIAL_RESEARCH_REST');
assert.equal(R.rest_symbol,'𝄐');
assert.equal(R.rest_official,true);
assert.equal(R.rest_is_completion,false);
assert.equal(R.rest_is_abandonment,false);
assert.equal(R.sequence_authority,false);
assert.equal(R.next_stage,null);
assert.deepEqual(R.stage_unlocks,[]);
assert.equal(R.closed_system_successor_authority,false);
assert.equal(R.additional_internal_bookkeeping_authority,false);
assert.equal(R.materially_new_evidentiary_substrate_required,true);
assert.equal(R.reopen_condition,'INDEPENDENT_EXOGENOUS_EMPIRICAL_WITNESS_ADMISSION');
assert.equal(R.exogenous_witness_acquired,false);
assert.equal(R.actual_empirical_matched_return_acquired,false);
assert.equal(R.empirical_credit_from_rest,0);
assert.equal(R.golden_egg_earned,false);
assert.equal(R.live_loom_mutated,false);
assert.equal(R.loom_rename_authority,false);
assert.equal(R.a16_authority,false);
assert.equal(R.merge_authority,false);
assert.equal(R.production_authority,false);
assert.equal(R.deployment_authority,false);
assert.equal(R.publication_authority,false);
assert.equal(R.vercel_authority,false);

const historicalRest=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/ASH_KEEP_A15_R0_OPEN_RESEARCH_FIELD_RECEIPT_V0_4.md','utf8');
assert.match(historicalRest,/sequence_authority = false/);
assert.match(historicalRest,/next_stage = null/);
assert.match(historicalRest,/stage_unlocks = \[\]/);
assert.match(historicalRest,/materially new evidentiary substrate/i);

const convergenceFreeze=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/GOLDEN_EGG_EXTERIORITY_CONVERGENCE_FREEZE_V0_1.md','utf8');
assert.match(convergenceFreeze,/stop condition for further closed-system bookkeeping/i);
assert.match(convergenceFreeze,/INDEPENDENT_EXOGENOUS_EMPIRICAL_WITNESS_ADMISSION/);

const receipt=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/WESTERN_HORIZON_EMPIRICAL_SHORE_REST_RECEIPT_V0_1.md','utf8');
assert.match(receipt,/OFFICIAL 𝄐 EFFECTIVE ONLY ON EXACT-HEAD GREEN/);
assert.match(receipt,/REST != COMPLETION/);
assert.match(receipt,/OFFICIAL_𝄐 != MERGE_AUTHORITY/);

const expectations=JSON.parse(fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/WESTERN_HORIZON_EMPIRICAL_SHORE_REST_EXPECTATIONS_V0_1.json','utf8'));
assert.equal(expectations.exact_parent,WESTERN_HORIZON_EMPIRICAL_SHORE_REST_PARENT);
assert.equal(expectations.required_state.rest_symbol,'𝄐');
assert.equal(expectations.required_state.next_stage,null);
assert.equal(expectations.required_state.reopen_condition,'INDEPENDENT_EXOGENOUS_EMPIRICAL_WITNESS_ADMISSION');
assert.equal(expectations.empirical_credit_from_rest,0);

console.log('A15-R0 Western Horizon empirical-shore official rest-state tests passed.');
