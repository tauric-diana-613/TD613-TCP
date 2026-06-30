import assert from 'node:assert/strict';
import { buildPhase9Audit } from '../scripts/run-hush-phase9-audit.mjs';

const audit = await buildPhase9Audit();
const report = audit.export_policy_report;

assert.equal(report.status, 'pass');
assert.equal(report.public_default_allowed, false);
assert.equal(report.raw_sample_export_allowed, false);
assert.equal(report.raw_candidate_export_allowed, false);
assert.ok(audit.non_claims.includes('Aperture override'));
assert.ok(audit.non_claims.includes('Safe Harbor override'));
assert.ok(audit.non_claims.includes('safe public release'));

for (const row of report.rows) {
  assert.equal(row.public_default_status, 'false', `${row.display_label} public default must remain false`);
  assert.equal(row.raw_sample_exclusion, true, `${row.display_label} raw sample must remain excluded`);
  assert.equal(row.raw_candidate_exclusion, true, `${row.display_label} raw candidate must remain excluded`);
  assert.ok(row.non_claims_boundary.includes('validator bypass'), `${row.display_label} missing validator-bypass non-claim`);
}

console.log('hush-phase9-policy-parity: ok');
