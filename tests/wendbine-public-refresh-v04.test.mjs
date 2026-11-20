import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('packages/dome_world_exact/fixtures/a15-r0/WENDBINE');
const hydration=JSON.parse(fs.readFileSync(path.join(root,'01-MANIFESTS/public-reddit-hydration-20260916-v04.json'),'utf8'));
const receipt=JSON.parse(fs.readFileSync(path.join(root,'04-RECEIPTS/intake/2026-09-16-public-reddit-refresh-current-burst-unbound.json'),'utf8'));

assert.equal(hydration.schema,'wendbine-public-hydration/v0.4');
assert.equal(hydration.atelier_id,'WENDBINE');
assert.equal(hydration.hydrated_public_source_count,35);
assert.equal(hydration.newly_admitted_public_source_count,0);
assert.equal(hydration.refresh.target_handle,'u/Upset-Ratio502');
assert.equal(hydration.refresh.state,'PUBLIC_SEARCH_CURRENT_BURST_UNBOUND');
assert.match(hydration.refresh.known_missingness,/NOT_RETRIEVED != DID_NOT_EXIST/);
assert.match(hydration.refresh.known_missingness,/STALE_INDEX != CURRENT_STREAM/);
assert.equal(hydration.hydration_policy.no_source_record_without_source_binding,true);
assert.equal(hydration.hydration_policy.stale_public_index_may_not_be_relabelled_as_current,true);
assert.equal(hydration.hydration_policy.human_report_may_define_search_target_but_not_source_fact,true);
assert.equal(hydration.next_required_event,'FRESH_PUBLIC_SOURCE_BINDING_FOR_SEPT16_POSTS');
assert.equal(hydration.merge_authority,false);
assert.equal(hydration.deployment_authority,false);
assert.equal(hydration.scientific_promotion_authority,false);
for (const membrane of [
  'PUBLIC_SEARCH_CURRENT_BURST_UNBOUND != NO_NEW_POST_EXISTED',
  'HUMAN_REPORTED_ACTIVITY != SOURCE_BOUND_CORPUS_DELTA',
  'STALE_INDEX != CURRENT_STREAM',
  'NOT_RETRIEVED != DID_NOT_EXIST'
]) assert.ok(hydration.claim_ceiling.includes(membrane),`missing refresh membrane: ${membrane}`);

assert.equal(receipt.schema,'wendbine-public-refresh-receipt/v0.1');
assert.equal(receipt.state,'HELD_PUBLIC_INDEX_STALE_RELATIVE_TO_REPORTED_ACTIVITY');
assert.equal(receipt.prior_hydrated_public_source_count,35);
assert.equal(receipt.newly_admitted_public_source_count,0);
assert.equal(receipt.route_state.fresh_public_search_capture,'EXECUTED');
assert.equal(receipt.route_state.source_registry,'HELD_NO_FRESH_SOURCE_BINDING');
assert.equal(receipt.route_state.typed_relation_registry,'HELD_NO_FRESH_SOURCE_BINDING');
assert.equal(receipt.route_state.deterministic_compiler,'NO_CORPUS_DELTA_TO_COMPILE');
assert.equal(receipt.route_state.topology,'NO_CORPUS_DELTA_TO_PROMOTE');
assert.equal(receipt.route_state.exact_head_ci,'PENDING');
assert.ok(receipt.membranes.includes('NO_SOURCE_BINDING => NO_TYPED_RELATION_PROMOTION'));
assert.ok(receipt.membranes.includes('NO_TYPED_RELATION_PROMOTION => NO_TOPOLOGY_PROMOTION'));
assert.equal(receipt.merge_authority,false);
assert.equal(receipt.deployment_authority,false);

console.log('Wendbine Sept 16 public refresh HOLD regression passed.');
