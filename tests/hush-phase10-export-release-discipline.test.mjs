import assert from 'node:assert/strict';
import { buildPhase10FixturePacket } from '../app/engine/hush-phase10-release-discipline.js';

const clean = buildPhase10FixturePacket();
assert.equal(clean.release_status, 'fixture-provider-pass');
assert.equal(clean.export_policy_validation.public_default_allowed, false);

const rawCandidate = buildPhase10FixturePacket({
  export_policy_validation: { pass: false, public_default_allowed: false, raw_sample_export_allowed: false, raw_candidate_export_allowed: true, raw_candidate_exported: true }
});
assert.equal(rawCandidate.release_status, 'blocked');
assert.ok(rawCandidate.hard_blockers.includes('raw candidate exported'));

const publicUndefined = buildPhase10FixturePacket({
  export_policy_validation: { pass: false, raw_sample_export_allowed: false, raw_candidate_export_allowed: false }
});
assert.equal(publicUndefined.release_status, 'blocked');
assert.ok(publicUndefined.hard_blockers.includes('public_default_allowed undefined'));

console.log('hush-phase10-export-release-discipline: ok');
