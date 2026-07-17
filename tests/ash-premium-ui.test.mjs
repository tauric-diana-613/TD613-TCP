import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  ASH_PREMIUM_UI_VERSION,
  derivePremiumSnapshot,
  humanLifecycle
} from '../app/dome-world/ash-premium-ui.js';

const read = path => fs.readFileSync(path, 'utf8');
const source = read('app/dome-world/ash-premium-ui.js');
const css = read('app/dome-world/ash-premium-ui.css');
const bridge = read('app/dome-world/ash-workspace-bridge.js');

assert.equal(ASH_PREMIUM_UI_VERSION, 'td613.ash.premium-ui/v0.1-command-instrument');
assert.match(bridge, /import '\.\/ash-premium-ui\.js';/);

for (const destination of ['Home', 'Map', 'Work', 'Choir', 'Capsule']) {
  assert.ok(source.includes(`'${destination}'`), `Premium primary destination omitted ${destination}`);
}
for (const command of ['Custody', 'Rooms', 'Routes', 'Draft & Hush', 'Safe Harbor ingress', 'Destination handoff', 'Receipts', 'Cases & profile']) {
  assert.ok(source.includes(command), `Premium command sheet omitted ${command}`);
}
for (const exact of ['ARRIVAL_UNPERSISTED', 'CASE_BOUND', 'REBUILD_ELIGIBLE', 'RELEASE_ELIGIBLE', 'CONTINUITY_SEALED']) {
  assert.ok(source.includes(exact), `Paired lifecycle language omitted ${exact}`);
}
for (const group of ['Custody and integrity', 'People and confidentiality', 'Route and metadata', 'Reconstruction and Choir', 'Final exact-draft confirmation']) {
  assert.ok(source.includes(group), `Review grouping omitted ${group}`);
}
for (const token of [
  'runDeterministicMoireAssay',
  'verifyMoireRebuildAssay',
  'replayMoireRebuildAssay',
  'verifyMoireRebuildReplay',
  'Pairwise residue ≠ intent',
  'surveillance probability',
  'automatic_ash_action',
  'transport_authorized: false'
]) {
  assert.ok(source.includes(token), `Choir premium surface omitted ${token}`);
}
for (const token of [
  '/safe-harbor/index.html',
  '/dome-world/ash-destination-handoff.html',
  'premiumPrimaryDock',
  'premiumContinuityButton',
  'premiumReceiptInventory',
  'premiumCapsulePassphrase'
]) {
  assert.ok(source.includes(token), `Integrated crossing or continuity surface omitted ${token}`);
}

assert.match(css, /grid-template-columns:repeat\(5,1fr\)/);
assert.match(css, /min-height:52px/);
assert.match(css, /min-height:48px/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
assert.match(css, /--premium-ivory:#f5ecd0/);
assert.match(css, /--premium-brass:#c8a95a/);
assert.match(css, /--premium-violet:#d9a1ff/);
assert.doesNotMatch(css, /animation:[^;]*(infinite|linear\s+infinite)/);

assert.deepEqual(humanLifecycle('CASE_BOUND'), {
  exact: 'CASE_BOUND',
  posture: 'Case protected',
  next: 'Run a Rebuild Test before drafting'
});
assert.deepEqual(humanLifecycle('CONTINUITY_SEALED'), {
  exact: 'CONTINUITY_SEALED',
  posture: 'Continuity protected',
  next: 'Resume from the current Save Point'
});

const snapshot = derivePremiumSnapshot({
  caseMap: {
    case_id: 'case_demo',
    profile: 'political_campaign',
    title: 'Synthetic campaign',
    case_map_digest: `sha256:${'a'.repeat(64)}`,
    rooms: [{ id: 'room_one' }],
    nodes: [
      { id: 'node_action', type: 'intended-action', label: 'Approve response', confidence_posture: 'OPEN' },
      { id: 'node_gap', type: 'evidence-gap', label: 'Missing approval', confidence_posture: 'OPEN' }
    ],
    relationships: [],
    source_status: 'SIMULATED'
  },
  routeMemory: {
    entries: [{ entry_id: 'route_one', route_id: 'route_press', purpose: 'answer', recipient_class: 'reporter', disclosed_opaque_references: [] }]
  },
  tests: [{ test_id: 'test_one' }],
  drafts: [{ draft_id: 'draft_one' }],
  reviews: [{ review_id: 'review_one' }],
  releases: [{ receipt_id: 'release_one' }],
  savePoints: [{
    save_point_id: 'save_one',
    case_map_digest: `sha256:${'b'.repeat(64)}`
  }],
  lifecycle: { lifecycle_state: 'RELEASE_ELIGIBLE' },
  custodyReceipts: [{ receipt_id: 'custody_one' }]
});

assert.equal(snapshot.profile, 'political_campaign');
assert.equal(snapshot.counts.openActions, 1);
assert.equal(snapshot.counts.gaps, 1);
assert.equal(snapshot.counts.routes, 1);
assert.equal(snapshot.currentPriority.id, 'node_action');
assert.equal(snapshot.continuityChanged, true);
assert.equal(snapshot.lifecycle.posture, 'Exact release may be sealed');
assert.deepEqual(snapshot.receipts, ['test_one', 'review_one', 'release_one', 'save_one', 'custody_one']);

assert.doesNotMatch(source, /recipient_transport\s*:\s*true/);
assert.doesNotMatch(source, /automatic_ash_action\s*:\s*true/);
assert.doesNotMatch(source, /production_status:\s*['"]IMPLEMENTED_PRODUCTION_DEMONSTRATED/);
assert.doesNotMatch(source, /Cinder authority|automatic Cinder/i);

console.log('ash-premium-ui.test.mjs passed');
