import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('packages/dome_world_exact/fixtures/a15-r0/WENDBINE');
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
const connector = fs.readFileSync(path.join(root, 'CONNECTOR_ENTRY.md'), 'utf8');
const profile = JSON.parse(fs.readFileSync(path.join(root, 'ATELIER_PROFILE.json'), 'utf8'));

for (const surface of [readme, connector]) {
  assert.match(surface, /source[-_ ]bound[-_ ]public[-_ ]reddit[-_ ](?:corpus|posts).*35/is, 'Canonical Wendbine entry surfaces must expose the current 35-post source-bound corpus rather than the stale 33-post base only.');
  assert.match(surface, /wendbine-query\.mjs/, 'Canonical Wendbine entry surfaces must route future sessions to the unified read-only query surface.');
  assert.match(surface, /WENDBINE_SYNC_CAPTURE_CONTRACT_V0_1\.md/, 'Canonical Wendbine entry surfaces must route future syncs through the capture reconciliation contract.');
  assert.match(surface, /ARCHIVAL_DEBT_EXPLICIT_PER_CARD_PAYLOAD_NOT_PERSISTED/, 'Canonical Wendbine entry surfaces must expose the Sept16 capture scar rather than hide it behind aggregate hydration state.');
  assert.match(surface, /observed_card_count\s*=\s*persisted_per_card_observations\s*\+\s*explicitly_receipted_capture_failures/s, 'Canonical Wendbine entry surfaces must preserve observed-card custody reconciliation.');
}

assert.equal(profile.current_source_bound_public_reddit_count, 35);
assert.equal(profile.query_model, 'READ_ONLY_UNIFIED_LEXICAL_AND_CONCEPT_RELATIONAL_RETRIEVAL');
assert.equal(profile.query_entry, '99-ADMIN/wendbine-query.mjs');
assert.equal(profile.capture_contract, '06-INSTRUMENTS/WENDBINE_SYNC_CAPTURE_CONTRACT_V0_1.md');
assert.ok(profile.distinctive_strengths.includes('READ_ONLY_UNIFIED_QUERY_SURFACE'));
assert.ok(profile.distinctive_strengths.includes('OBSERVED_CARD_CAPTURE_RECONCILIATION'));
assert.ok(profile.distinctive_strengths.includes('QUERYABLE_ARCHIVAL_DEBT'));
assert.ok(profile.negative_states.includes('ARCHIVAL_DEBT_EXPLICIT_PER_CARD_PAYLOAD_NOT_PERSISTED'));
assert.ok(profile.negative_states.includes('FAILED_CAPTURE_RECONCILIATION'));
assert.deepEqual(profile.known_archival_debt, [{
  snapshot_id: 'wendbine-public-reddit-profile-delta-20260916-v04',
  observed_cards: 25,
  persisted_per_card_records_at_original_capture: 0,
  explicit_capture_debt: 25,
  receipt: '04-RECEIPTS/2026-09-16-public-profile-card-loss-ledger-v01.json',
  state: 'ARCHIVAL_DEBT_EXPLICIT_PER_CARD_PAYLOAD_NOT_PERSISTED'
}]);


const ledger = JSON.parse(fs.readFileSync(path.join(root, '04-RECEIPTS/2026-09-22-verbatim-originals-gap-ledger-v01.json'), 'utf8'));
assert.equal(ledger.records.length, 60, 'Every previously indexed post must appear individually in the verbatim custody audit.');
assert.equal(ledger.scope.verbatim_title_and_body_custodied, 0, 'Do not upgrade summaries into full-text originals.');
assert.equal(profile.verbatim_original_source_record_count, 60);
assert.equal(profile.verbatim_original_title_body_pairs_custodied, 0);
assert.equal(profile.verbatim_originals_state, 'HELD_SOURCE_TEXT_FIELDS_NOT_CUSTODIED');
assert.equal(profile.deep_source_topology_status, 'PROVISIONAL_DERIVATIVES_PENDING_VERBATIM_ORIGINALS');
for (const surface of [readme, connector]) {
  assert.match(surface, /0\/60/, 'Current source entry must expose the exact full-text custody gap.');
  assert.match(surface, /WENDBINE_VERBATIM_ORIGINALS_ACQUISITION_V0_1/, 'Future sessions must see the authentic-originals recovery route.');
}


assert.equal(profile.foundation_source_acquisition_runner, '99-ADMIN/wendbine-reddit-oauth-rescue.mjs');
assert.equal(profile.prior_chat_exact_message_rescue_runner, '99-ADMIN/wendbine-chat-export-rescue.mjs');
assert.equal(profile.private_originals_lexical_query, '99-ADMIN/wendbine-private-originals-query.mjs');
assert.equal(profile.foundation_originals_exact_title_body_pairs_custodied, 0);
assert.match(profile.foundation_live_authenticated_source_capture, /^NOT_EXECUTED/);
for (const surface of [readme, connector]) {
  assert.match(surface, /wendbine-reddit-oauth-rescue\.mjs/, 'Future sessions must find executable 33-source authorized acquisition.');
  assert.match(surface, /wendbine-chat-export-rescue\.mjs/, 'Future sessions must find private old-chat source rescue.');
  assert.match(surface, /wendbine-private-originals-query\.mjs/, 'Future sessions must distinguish source text search from derivative search.');
  assert.match(surface, /SOURCE_FETCHER_READY != SOURCE_FETCH_SUCCEEDED/, 'Green implementation must not be confused with live original-text capture.');
}

console.log('Wendbine README, connector entry, and Atelier profile current-state contract passed.');
