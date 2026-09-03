import assert from 'node:assert/strict';
import {
  canonicalLoomRouteContextRecord,
  bindLoomRouteContext
} from '../app/dome-world/previews/a15-r0/loom-route-context-noncredit-adapter.js';
import { canonicalLoomGoldenEggEpisode } from '../app/dome-world/previews/a15-r0/loom-golden-egg-same-episode-acquisition.js';

const episode=canonicalLoomGoldenEggEpisode({includeReturn:false});
const base=canonicalLoomRouteContextRecord(episode,{record_type:'motif-return'});
const hostileCases=[
  ['cross episode',{...base,episode_id:'another-journey'},'LOOM_CONTEXT_EPISODE_MISMATCH'],
  ['cross custody',{...base,custody_id:'other-custody'},'LOOM_CONTEXT_CUSTODY_MISMATCH'],
  ['cross departure',{...base,departure_id:'other-departure'},'LOOM_CONTEXT_DEPARTURE_MISMATCH'],
  ['unknown route',{...base,route_id:'route-x'},'LOOM_CONTEXT_ROUTE_NOT_IN_EPISODE'],
  ['source drift',{...base,source_custody:{...base.source_custody,blob:'deadbeef'}},'LOOM_SOURCE_CUSTODY_MISMATCH'],
  ['claim ceiling drift',{...base,claim_ceiling:'truth-proof'},'LOOM_CLAIM_CEILING_MISMATCH'],
  ['empirical class',{...base,evidence_class:'PUBLIC_EMPIRICAL_CASE'},'LOOM_CONTEXT_CANNOT_USE_EMPIRICAL_EVIDENCE_CLASS'],
  ['empirical credit',{...base,empirical_credit:1},'LOOM_CONTEXT_EMPIRICAL_CREDIT_MUST_BE_ZERO'],
  ['measurement laundering',{...base,measurements:[{name:'matched_return',episode_id:episode.episode_id,value:1,measured:true}]},'LOOM_CONTEXT_CANNOT_DECLARE_MEASUREMENTS'],
  ['surface laundering',{...base,surfaces:[{name:'geometry',episode_id:episode.episode_id,value:1,measured:true}]},'LOOM_CONTEXT_CANNOT_DECLARE_OPERATIONAL_SURFACES'],
  ['authorship inflation',{...base,claim:'authorship-proof-claim'},'LOOM_CONTEXT_FORBIDDEN_AUTHORITY_CLAIM'],
  ['causal inflation',{...base,claim:'causal-proof-claim'},'LOOM_CONTEXT_FORBIDDEN_AUTHORITY_CLAIM']
];

for(const [label,record,expected] of hostileCases){
  const result=bindLoomRouteContext(episode,[record]);
  assert.equal(result.context_status,'INADMISSIBLE',`${label} must fail closed.`);
  assert.ok(result.errors.includes(expected),`${label} must report ${expected}.`);
  assert.equal(result.parent_status_before,'HELD');
  assert.equal(result.parent_status_after,'HELD','Hostile Loom context must not modify acquisition state.');
  assert.equal(result.acquisition_credit,0);
  assert.deepEqual(result.empirical_surfaces_added,[]);
  assert.equal(result.golden_egg_earned,false);
}

const duplicate=bindLoomRouteContext(episode,[base,{...base}]);
assert.equal(duplicate.context_status,'INADMISSIBLE');
assert.ok(duplicate.errors.includes('DUPLICATE_LOOM_RECORD_ID'));

const unknown=bindLoomRouteContext(episode,[{...base,record_type:'reader-validation'}]);
assert.equal(unknown.context_status,'INADMISSIBLE');
assert.ok(unknown.errors.includes('UNRECOGNIZED_LOOM_RECORD_TYPE'));

console.log('A15-R0 Loom route-context non-credit adapter hostile tests passed.');
