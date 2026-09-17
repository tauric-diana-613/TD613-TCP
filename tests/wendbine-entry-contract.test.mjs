import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('packages/dome_world_exact/fixtures/a15-r0/WENDBINE');
const connector = fs.readFileSync(path.join(root, 'CONNECTOR_ENTRY.md'), 'utf8');
const profile = JSON.parse(fs.readFileSync(path.join(root, 'ATELIER_PROFILE.json'), 'utf8'));

assert.match(connector, /source_bound_public_reddit_posts = 35/, 'Connector entry must expose the current source-bound corpus rather than the stale 33-post base only.');
assert.match(connector, /wendbine-query\.mjs/, 'Connector entry must route future sessions to the unified read-only query surface.');
assert.match(connector, /WENDBINE_SYNC_CAPTURE_CONTRACT_V0_1\.md/, 'Connector entry must route future syncs through the capture reconciliation contract.');
assert.match(connector, /ARCHIVAL_DEBT_EXPLICIT_PER_CARD_PAYLOAD_NOT_PERSISTED/, 'Connector entry must expose the Sept16 capture scar rather than hide it behind aggregate hydration state.');
assert.match(connector, /observed_card_count\s*=\s*persisted_per_card_observations\s*\+\s*explicitly_receipted_capture_failures/s, 'Connector entry must preserve observed-card custody reconciliation.');

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

console.log('Wendbine connector entry and Atelier profile current-state contract passed.');
