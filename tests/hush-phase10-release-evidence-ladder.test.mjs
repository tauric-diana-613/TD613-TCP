import assert from 'node:assert/strict';
import { HUSH_RELEASE_EVIDENCE_LADDER, evidenceLadderLevelExists } from '../app/data/hush-phase10-release-statuses.js';
import { buildPhase10FixturePacket } from '../app/engine/hush-phase10-release-discipline.js';

assert.equal(HUSH_RELEASE_EVIDENCE_LADDER.length, 10);
for (let level = 0; level <= 9; level += 1) assert.equal(evidenceLadderLevelExists(level), true);

const draft = buildPhase10FixturePacket({ local_validation: { pass: false } });
assert.equal(draft.evidence_ladder_level, 0);
assert.equal(draft.release_status, 'draft');

const clean = buildPhase10FixturePacket();
assert.ok(clean.evidence_ladder_level >= 4);
assert.notEqual(clean.release_status, 'runtime-flight-pass');

console.log('hush-phase10-release-evidence-ladder: ok');
