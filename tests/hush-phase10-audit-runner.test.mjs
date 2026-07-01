import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { buildHushPhase10ReleaseAudit } from '../scripts/run-hush-phase10-release-audit.mjs';

const audit = await buildHushPhase10ReleaseAudit();
assert.equal(audit.status, 'pass', audit.audit_failures.join('\n'));
assert.deepEqual(audit.audit_failures, []);
assert.equal(audit.representative_packet.release_status, 'blocked');
assert.ok(audit.representative_packet.hard_blockers.includes('collision severity 3'));

const output = execFileSync(process.execPath, ['scripts/run-hush-phase10-release-audit.mjs'], {
  encoding: 'utf8'
});
const receipt = JSON.parse(output);
assert.equal(receipt.status, 'pass');
assert.equal(receipt.representative_status, 'blocked');
assert.deepEqual(receipt.audit_failures, []);
assert.equal(receipt.docs_written, false);

console.log('hush-phase10-audit-runner: ok');
