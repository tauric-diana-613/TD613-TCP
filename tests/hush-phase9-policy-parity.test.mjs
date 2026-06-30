import assert from 'node:assert/strict';
import { buildPhase9Audit } from '../scripts/run-hush-phase9-audit.mjs';

const audit = await buildPhase9Audit();
const report = audit.export_policy_report;
assert.equal(report.status, 'pass');
assert.equal(report.public_default_allowed, false);
for (const row of report.rows) assert.equal(row.public_default_status, 'false');
console.log('hush-phase9-policy-parity: ok');
