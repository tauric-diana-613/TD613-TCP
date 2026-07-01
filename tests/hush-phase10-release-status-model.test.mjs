import assert from 'node:assert/strict';
import { HUSH_RELEASE_STATUSES, isKnownHushReleaseStatus } from '../app/data/hush-phase10-release-statuses.js';
import { buildPhase10FixturePacket } from '../app/engine/hush-phase10-release-discipline.js';

const expected = ['draft','local-pass','fixture-provider-pass','runtime-flight-pending','runtime-flight-pass','release-candidate','harbor-eligible','sealed','blocked','revoked'];
assert.deepEqual(HUSH_RELEASE_STATUSES, expected);
for (const status of expected) assert.equal(isKnownHushReleaseStatus(status), true);

const clean = buildPhase10FixturePacket();
assert.notEqual(clean.release_status, 'sealed');
assert.equal(clean.release_status, 'fixture-provider-pass');
assert.equal(clean.schema, 'td613-hush-release-discipline/v1');

console.log('hush-phase10-release-status-model: ok');
