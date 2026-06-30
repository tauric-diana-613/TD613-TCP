import assert from 'node:assert/strict';
import { buildPhase9Audit } from '../scripts/run-hush-phase9-audit.mjs';

const audit = await buildPhase9Audit();

assert.equal(audit.runtime_execution_status, 'not run — environment limitation');
assert.ok(audit.provider_execution_status.includes('fixture-only'));
assert.ok(audit.release_recommendation.includes('deferred'));
assert.ok(audit.non_claims.includes('Aperture override'));
assert.equal(audit.full_collision_cell_count, 169);

console.log('hush-phase9-runtime-log-schema: ok');
