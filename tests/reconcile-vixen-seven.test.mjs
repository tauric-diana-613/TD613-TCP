import test from 'node:test';
import assert from 'node:assert/strict';
import {reconcileSeven,compareManifestStates,parseBundle,PRE_REMOVAL} from '../scripts/reconcile-vixen-seven.mjs';
import {execFileSync} from 'node:child_process';
const source='app/encyclopedia/vix-cyb.html';
const get=r=>parseBundle(execFileSync('git',['show',r+':'+source],{encoding:'utf8',maxBuffer:30*1024*1024}));
test('seven historical source identities are exact and absent from current A0, without mutating corpus',()=>{
 const x=reconcileSeven({includeIndexAudit:false});
 assert.equal(x.state,'RECONCILED_HISTORICAL_METADATA_ONLY');
 assert.equal(x.docket.entries.length,7);
 assert.equal(x.baseline_delta.works_manifestations,0);
 assert.equal(x.baseline_delta.batch_b_registrations,-7);
 assert.equal(x.corruption_claim,'NOT_ESTABLISHED');
});
test('missing record or changes to source clocks must fail closed',()=>{
 const pre=get(PRE_REMOVAL),current=get('HEAD');
 const x=reconcileSeven({includeIndexAudit:false}).docket;
 const corrupt=structuredClone(x);corrupt.entries[0].declared_historical_identity.source_clock='BACKFILLED';
 assert.throws(()=>compareManifestStates(pre,current,corrupt),/DRIFT/);
});
test('read-only index comparison reports exact text occurrence without claiming search ranking',()=>{
 const x=reconcileSeven();
 assert.equal(x.index_comparison.source_identity_occurrences.length,7);
 assert.match(x.index_comparison.index_effects_interpretation,/TEXT_OCCURRENCE_ONLY/);
 assert.equal(x.docket.operator_human_compose_closure,'RESERVED');
});
