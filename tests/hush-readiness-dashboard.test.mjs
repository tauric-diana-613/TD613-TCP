import assert from 'assert';
import { buildHushReadinessDashboard, summarizeHushReadinessDashboard } from '../app/engine/hush-readiness-dashboard.js';

const dashboard = buildHushReadinessDashboard({
  phase24: { readiness: { coherentToJagged: true, jaggedToCoherent: true } },
  phase25: { readiness: { hardCustomizer: true } },
  phase27: { readiness: { messyNotes: true, chatspeak: true, dialectPreservation: true, codeSwitching: true } },
  phase28: { readiness: { overall: false } },
  exportReady: true,
  operatorReady: true
});

assert.equal(dashboard.version, 'phase-29');
assert.equal(Object.keys(dashboard.surfaces).length, 10);
assert.equal(dashboard.surfaces.targetRegister.status, 'red');
assert(dashboard.blockers.includes('target-register-not-ready'));
assert(dashboard.warnings.includes('live-whistleblower-use-still-human-review-required'));

const summary = summarizeHushReadinessDashboard(dashboard);
assert.equal(summary.surfaceCount, 10);
assert.equal(summary.readiness.targetRegisterReady, false);

console.log('hush-readiness-dashboard tests passed');
