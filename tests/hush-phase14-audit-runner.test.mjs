import assert from 'node:assert/strict';
import { buildPhase14CognitiveAudit } from '../scripts/run-hush-phase14-cognitive-audit.mjs';

const audit = await buildPhase14CognitiveAudit();
assert.equal(audit.schema, 'td613-hush-phase14-cognitive-audit/v1');
assert.equal(audit.phase, 14);
assert.equal(audit.status, 'pass');
assert.ok(audit.profile_count >= 13);
assert.equal(audit.selector.selected_candidate_id, 'time-bearing-faithful');
assert.equal(audit.failures.length, 0);
assert.ok(audit.detector_non_claims.includes('detector result does not prove authorship'));

console.log('hush-phase14-audit-runner: ok');
