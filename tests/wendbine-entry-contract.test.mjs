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
assert.equal(profile.verbatim_original_title_body_pairs_custodied, 60);
assert.equal(profile.verbatim_originals_state, 'ALL_60_OF_60_ARCHIVED_TITLE_AND_SELFTEXT_FIELDS_PRIVATE_HASH_VERIFIED_58_TEXT_2_EMPTY_MEDIA');
assert.equal(profile.deep_source_topology_status, 'ALL_60_ARCHIVED_SOURCE_FIELDS_RECOVERED_SOURCE_LED_ANALYSIS_PENDING');
for (const surface of [readme, connector]) {
  assert.match(surface, /CURRENT 60\/60/, 'Canonical entry must lead with current complete 60-source acquisition.');
  assert.match(surface, /WENDBINE_VERBATIM_ORIGINALS_ACQUISITION_V0_1/, 'Future sessions must see the authentic-originals recovery route.');
}


assert.equal(profile.foundation_source_acquisition_runner, '99-ADMIN/wendbine-reddit-oauth-rescue.mjs');
assert.equal(profile.prior_chat_exact_message_rescue_runner, '99-ADMIN/wendbine-chat-export-rescue.mjs');
assert.equal(profile.private_originals_lexical_query, '99-ADMIN/wendbine-private-originals-query.mjs');
assert.equal(profile.foundation_originals_exact_title_body_pairs_custodied, 33);
assert.equal(profile.pending_full_text_source_count, 0);
assert.equal(profile.pending_media_attachment_source_count, 2);
assert.equal(profile.total_individually_source_bound_post_ids, 60);
const recovered = JSON.parse(fs.readFileSync(path.join(root, profile.public_archive_source_field_receipts), 'utf8'));
assert.equal(recovered.source_count, 33);
assert.equal(recovered.records.length, 33);
assert.equal(new Set(recovered.records.map(x=>x.source_id)).size, 33);
assert.equal(recovered.raw_http_payload_sha256, profile.public_archive_raw_response_sha256);
assert.deepEqual(recovered.records.reduce((count,x)=>(count[x.reddit_title_exact]=(count[x.reddit_title_exact]||0)+1,count), {}), {Wendbine:32,Wensbine:1});
assert.ok(recovered.records.every(x=>x.body_sha256_utf8&&x.title_sha256_utf8&&!('selftext' in x)));
assert.equal(profile.private_archived_source_query, '99-ADMIN/wendbine-private-p0-source-query.mjs');
const secondary = JSON.parse(fs.readFileSync(path.join(root, profile.secondary_archive_source_field_receipts), 'utf8'));
assert.equal(secondary.source_count, 27);
assert.equal(secondary.records.length, 27);
assert.equal(new Set(secondary.records.map(x=>x.source_id)).size, 27);
assert.equal(secondary.nonempty_archived_text_bodies, 25);
assert.equal(secondary.verified_empty_media_or_link_selftext, 2);
assert.equal(secondary.media_attachment_binaries_custodied, 0);
assert.equal(secondary.raw_http_payload_sha256, profile.secondary_archive_raw_response_sha256);
assert.equal(secondary.unified_corpus.indexed_source_objects, 60);
assert.equal(secondary.unified_corpus.nonempty_archived_text_bodies, 58);
assert.equal(new Set([...secondary.records,...recovered.records].map(x=>x.source_id)).size, 60);
assert.equal(profile.private_secondary_restore_entry, '99-ADMIN/wendbine-private-secondary-restore.mjs');
assert.ok(!profile.negative_states.includes('SEPTEMBER_13_AND_LATER_27_SOURCE_BODIES_UNCUSTODIED'));
assert.ok(profile.negative_states.includes('TWO_MEDIA_ATTACHMENT_BINARIES_NOT_CUSTODIED'));
for(const surface of [readme, connector]){
 assert.match(surface,/p1p2-archived-source-field-receipts-20260922-v07\.json/,
  'Canonical entry must cite the second raw/hash verified capture.');
 assert.match(surface,/58 nonempty bodies|58 text bodies/,
  'Current entry must preserve 58 text vs 2 empty-media distinction.');
}


assert.match(profile.foundation_live_authenticated_source_capture, /^NOT_EXECUTED/);
for (const surface of [readme, connector]) {
  assert.match(surface, /wendbine-reddit-oauth-rescue\.mjs/, 'Future sessions must find executable 33-source authorized acquisition.');
  assert.match(surface, /wendbine-chat-export-rescue\.mjs/, 'Future sessions must find private old-chat source rescue.');
  assert.match(surface, /wendbine-private-originals-query\.mjs/, 'Future sessions must distinguish source text search from derivative search.');
  assert.match(surface, /SOURCE_FETCHER_READY != SOURCE_FETCH_SUCCEEDED/, 'Green implementation must not be confused with live original-text capture.');
}

console.log('Wendbine README, connector entry, and Atelier profile current-state contract passed.');
