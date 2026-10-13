import assert from 'node:assert/strict';
import { buildPhase13FidelityAudit } from '../scripts/run-hush-phase13-fidelity-audit.mjs';

const audit = await buildPhase13FidelityAudit();
assert.equal(audit.schema, 'td613-hush-phase13-fidelity-audit/v1');
assert.equal(audit.phase, 13);
assert.equal(audit.status, 'pass');
assert.ok(audit.profile_count >= 13);
assert.equal(audit.selector.selected_candidate_id, 'rough-faithful');
assert.equal(audit.failures.length, 0);
assert.ok(audit.non_claims.includes('perfect voice match'));

console.log('hush-phase13-audit-runner: ok');
