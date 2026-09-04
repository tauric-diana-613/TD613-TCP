import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const corePath = path.join(testsDir, 'ash-a15-r0-review-hardening-core.test.mjs');
const tempPath = path.join(testsDir, `.ash-a15-r0-review-hardening-sharded-${process.pid}.mjs`);
let source = await fs.readFile(corePath, 'utf8');

const startMarker = "const consolidatedWorkflow = fs.readFileSync('.github/workflows/td613-ci.yml', 'utf8');";
const endMarker = "\n\nfor (const requiredField of ['action_times', 'route_observations']) {";
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker, start);
if (start < 0 || end < 0) throw new Error('A15-R0 sharded hardening could not locate the historical workflow-topology block.');

const shardedTopologyLaw = `const consolidatedWorkflow = fs.readFileSync('.github/workflows/td613-ci.yml', 'utf8');
const shardedAshWitnessChamber = consolidatedWorkflow.match(
  /\\n  ash_browser_shard:[\\s\\S]*?\\n  ash_browser:/
)?.[0] || '';
assert.ok(shardedAshWitnessChamber, 'The sharded inherited Ash browser chamber must remain discoverable.');
assert.match(shardedAshWitnessChamber, /browser: \\[chromium, firefox, webkit\\]/, 'Every front-line engine remains independently witnessed.');
assert.match(shardedAshWitnessChamber, /max-parallel: 3/, 'The three-engine shard topology remains bounded and explicit.');
assert.match(shardedAshWitnessChamber, /Calibrate A15-R0 and transition ordering for this engine[\\s\\S]*Run front-line A8 A12 and lifecycle preflight for this engine/, 'A15-R0 measurement must precede inherited promotion gating inside every engine shard.');

const canonicalAshLane = shardedAshWitnessChamber.match(
  /- name: Run core extended and Flow-Core lanes in parallel[\\s\\S]*?- name: Stop isolated runtimes/
)?.[0] || '';
assert.ok(canonicalAshLane, 'The complete inherited Ash lane must remain discoverable inside each engine shard.');
for (const probe of [
  'ash-a2-a5-browser-probe.mjs',
  'ash-a7-a11-browser-probe.mjs',
  'ash-a12-browser-probe.mjs',
  'ash-research-ux-browser-probe.mjs',
  'ash-reviewability-browser-probe.mjs',
  'ash-ingress-polish-browser-probe.mjs',
  'ash-a15-empirical-profile-journeys-browser-probe.mjs',
  'ash-a13-demo-registry-browser-probe.mjs',
  'ash-a14-archive-browser-probe.mjs',
  'run-ash-flowcore-live-field-browser-probe.mjs'
]) {
  const commandLine = canonicalAshLane.split('\\n').find(line => line.includes('node scripts/' + probe)) || '';
  assert.ok(commandLine, probe + ' must remain present in the canonical sharded Ash lane.');
  assert.match(commandLine, /timeout --signal=INT --kill-after=/, probe + ' must remain in a timeout-owned process group.');
  assert.doesNotMatch(commandLine, /--foreground/, probe + ' may not restore foreground timeout semantics.');
}
assert.match(
  shardedAshWitnessChamber,
  /Run front-line A8 A12 and lifecycle preflight for this engine[\\s\\S]*timeout --foreground --signal=INT --kill-after=15s 420s node scripts\\/run-ash-keep-a1-production-probe\\.mjs/,
  'The lifecycle closure preflight keeps its constitutionally declared foreground timeout topology.'
);
assert.match(
  shardedAshWitnessChamber,
  /Calibrate A15-R0 and transition ordering for this engine[\\s\\S]*timeout --signal=INT --kill-after=15s 360s node scripts\\/ash-a15-r0-preview-probe\\.mjs[\\s\\S]*timeout --signal=INT --kill-after=15s 420s node scripts\\/ash-a15-transition-trace-browser-probe\\.mjs/,
  'A15-R0 calibration probes remain independently timeout-owned before inherited gating.'
);`;

source = source.slice(0, start) + shardedTopologyLaw + source.slice(end);
await fs.writeFile(tempPath, source, 'utf8');
try {
  await import(`${pathToFileURL(tempPath).href}?sharded=${Date.now()}`);
} finally {
  await fs.rm(tempPath, { force:true });
}

await import('./pedagogue-research-hydration.test.mjs');
await import('./pedagogue-research-hydration-temporal.test.mjs');
await import('./pedagogue-research-hydration-observability.test.mjs');
await import('./pedagogue-research-hydration-identifiability-scope.test.mjs');
await import('./pedagogue-research-assay-witness.test.mjs');
await import('./pedagogue-order-identifiability-refinement.test.mjs');
await import('./ash-a15-r0-moss-lantern-reference-identifiability.test.mjs');
await import('./ash-a15-r0-moss-lantern-temporal-order.test.mjs');
await import('./ash-a15-r0-moss-lantern-aliasing-discriminator.test.mjs');
await import('./ash-a15-r0-moss-lantern-stochastic-boundary.test.mjs');
await import('./ash-a15-r0-self-calibrating-joint-state-operator.test.mjs');
await import('./ash-a15-r0-identifiability-deficit-targeting.test.mjs');
await import('./ash-a15-r0-aperture-conditioning-aware-widening.test.mjs');
await import('./ash-a15-r0-aperture-covariance-whitened-widening.test.mjs');
await import('./ash-a15-r0-aperture-correlated-noise-geometry.test.mjs');
await import('./ash-a15-r0-aperture-experiment-design-state.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-replay-stability.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-replay-envelope-consequence.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-consequence-conditioned-selection.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-decision-loss-replay-map.test.mjs');
await import('./giving-pedagogue-independent-order.test.mjs');
await import('./ash-a15-r0-holonomy-loom-child-legible-preflight.test.mjs');
