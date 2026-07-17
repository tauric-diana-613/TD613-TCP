import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import {
  ASH_TRUST_BOUNDARY_COURT_VERSION,
  installAshTrustBoundaryCourt
} from '../app/dome-world/ash-guided-trust-boundary-court.js';

const read = path => fs.readFileSync(path, 'utf8');
const json = path => JSON.parse(read(path));
const root = 'app/dome-world/fixtures';
const profile = json(`${root}/ash-investigation-profile.json`);
const rooms = json(`${root}/ash-investigation-rooms.json`);
const nodes = [1, 2, 3, 4].flatMap(number => json(`${root}/ash-investigation-nodes-${number}.json`));
const relationships = [1, 2, 3].flatMap(number => json(`${root}/ash-investigation-relations-${number}.json`));
const rules = ['llm', 'counsel', 'source', 'records', 'internal', 'capsule']
  .map(name => json(`${root}/ash-investigation-rule-${name}.json`));
const disclosure = json(`${root}/ash-investigation-disclosure.json`);
const defaultsCore = json(`${root}/ash-investigation-defaults-core.json`);
const defaultsContinuity = json(`${root}/ash-investigation-defaults-continuity.json`);
const hydration = read('app/dome-world/ash-investigation-demo-hydration.js');
const guidance = read('app/dome-world/ash-guided-operator-ui.js');
const boundaryCourt = read('app/dome-world/ash-guided-trust-boundary-court.js');
const css = read('app/dome-world/ash-guided-operator-ui.css');
const bridge = read('app/dome-world/ash-workspace-bridge.js');
const probe = read('scripts/ash-investigation-guidance-browser-probe.mjs');

assert.equal(profile.profile, 'investigation');
assert.equal(profile.source_status, 'SIMULATED');
assert.equal(rooms.length, 12);
assert.equal(nodes.length, 56);
assert.equal(relationships.length, 72);
assert.equal(rules.length, 6);
assert.ok(disclosure.disclosure_sequence.length >= 10);
assert.ok(profile.stress_targets.some(value => /AI-sharing guidance/i.test(value)));
assert.ok(profile.stress_targets.some(value => /Choir/i.test(value)));
assert.ok(profile.stress_targets.some(value => /Capsule/i.test(value)));
assert.ok(rooms.some(room => room.id === 'room_ai'));
assert.ok(rooms.some(room => room.id === 'room_safety'));
assert.ok(nodes.some(node => node.id === 'node_prompt_risk'));
assert.ok(nodes.some(node => node.id === 'node_linkage_risk'));
assert.ok(nodes.some(node => node.id === 'node_action_ai_packet'));
assert.equal(defaultsCore.route.id, 'route_llm_analysis');
assert.equal(defaultsCore.draft.route, 'route_llm_analysis');
assert.equal(defaultsContinuity.tradeoff.utility, 7);

const roomIds = new Set(rooms.map(room => room.id));
const nodeIds = new Set(nodes.map(node => node.id));
const edgeIds = new Set(relationships.map(edge => edge.id));
assert.equal(roomIds.size, rooms.length);
assert.equal(nodeIds.size, nodes.length);
assert.equal(edgeIds.size, relationships.length);
for (const node of nodes) assert.ok(roomIds.has(node.room_id), `${node.id} references an unknown Room`);
for (const edge of relationships) {
  assert.ok(nodeIds.has(edge.from), `${edge.id} has an unknown source`);
  assert.ok(nodeIds.has(edge.to), `${edge.id} has an unknown target`);
}
for (const rule of rules) {
  for (const roomId of rule.allowed_room_ids) assert.ok(roomIds.has(roomId), `${rule.route_id} has an unknown Room`);
  for (const edgeId of rule.local_link_keys) assert.ok(edgeIds.has(edgeId), `${rule.route_id} has an unknown local link`);
}
for (const reference of [
  ...defaultsCore.test_refs,
  ...defaultsCore.route.refs,
  ...defaultsCore.draft.refs,
  ...disclosure.disclosure_sequence.flat()
]) assert.ok(nodeIds.has(reference), `Unknown default reference ${reference}`);

assert.match(hydration, /td613\.ash\.investigation-demo\/v0\.1-glass-meridian/);
assert.equal((hydration.match(/entry_id: 'routeentry_investigation_/g) || []).length, 4);
assert.match(hydration, /configured-llm-provider/);
assert.match(hydration, /demo_profile:investigation/);
assert.match(hydration, /automatic_action_authorized: false/);
assert.match(hydration, /prediction_authorized: false/);
assert.match(bridge, /ash-investigation-demo-hydration\.js/);
assert.match(bridge, /ash-guided-operator-ui\.js/);
assert.match(bridge, /ash-guided-trust-boundary-court\.js\?v=20260717-trust-boundary-v1/);
assert.match(guidance, /Protect → Map → Test → Share → Seal/);
assert.match(guidance, /Send the question, not the whole investigation/);
assert.match(guidance, /Early warning ≠ guilt/);
assert.match(guidance, /View exact Rebuild receipt/);
assert.match(guidance, /guidedMapZoomIn/);
assert.match(guidance, /guidedMapFocus/);
assert.match(guidance, /Provider boundary/);
assert.match(guidance, /compressCrossingTimeline/);
assert.match(guidance, /function collapseLegacyRails/);
assert.match(guidance, /style\.setProperty\('display', 'none', 'important'\)/);
assert.match(guidance, /setAttribute\('inert', ''\)/);
assert.match(guidance, /ash-guided-operator-ui\.css\?v=20260717-investigation-v3/);
assert.match(guidance, /setAttribute\('data-ash-guided-ui', ASH_GUIDED_OPERATOR_UI_VERSION\)/);
assert.match(guidance, /removeAttribute\('data-ash-guided-u-i'\)/);
assert.doesNotMatch(guidance, /dataset\.ashGuidedUI\s*=/);
assert.match(css, /guided-dome-drift/);
assert.match(css, /Iowan Old Style/);
assert.match(css, /workspace-rail,\s*\nhtml\[data-ash-guided-ui\] \.ash-lifecycle-rail/);
assert.match(css, /clip-path:inset\(50%\)!important/);
assert.match(css, /map-stage[^\{]*\{[^}]*min-height:68vh/);
assert.match(css, /guided-receipt/);
assert.match(css, /guided-crossing-history/);
assert.match(css, /#workspace-map\.guided-map-focus>\.workspace-head\{display:none!important\}/);
assert.match(css, /html:has\(#workspace-map\.guided-map-focus\) \.premium-primary-dock/);
assert.match(css, /pointer-events:none/);
assert.match(css, /guided-spine-steps button:nth-child\(5\)/);
assert.match(css, /premium-hero h3\{font-size:1\.18rem/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
assert.match(probe, /legacyRailReceipt/);
assert.match(probe, /visible layout beneath the guided command surface/);
assert.match(probe, /Primary dock remained visible over focused tomography/);
assert.match(probe, /Mobile hero title remained oversized/);
assert.match(probe, /investigation-guided-flight\/v0\.3/);

assert.equal(ASH_TRUST_BOUNDARY_COURT_VERSION, 'td613.ash.trust-boundary-court/v0.1');
for (const required of [
  'A local app cannot make a cloud upload local.',
  'Never upload a full case because a receipt cannot un-send it.',
  'original scans or photographs of handwriting',
  'Provider/platform retention, governance, logging, and operator access',
  'Employer or public-sector managed AI',
  'Unknown, elite-access, or future Readers remain unmeasured.',
  'What the receipt can prove',
  'What the receipt cannot prove',
  'ashCourtExcerptAttestation',
  'ashCourtOriginalAttestation',
  'stopImmediatePropagation',
  'prefers-reduced-motion:reduce'
]) assert.ok(boundaryCourt.includes(required), `Missing Ash Court contract: ${required}`);
assert.doesNotMatch(boundaryCourt, /guaranteed safe|zero risk|fully anonymous|cannot be reconstructed/i);
assert.doesNotMatch(boundaryCourt, /fetch\(|indexedDB|localStorage/, 'The trust-boundary layer must not acquire storage or network authority.');

const courtDom = new JSDOM(`<!doctype html><html><head></head><body>
  <section id="investigationAiShareGuide"><div class="guided-action-row"></div></section>
  <section class="tool-section"><div class="field-grid">
    <label><input id="providerScreenReview" type="checkbox"></label>
    <label><input id="providerApproval" type="checkbox"></label>
  </div><button id="screenProvider" type="button">Screen</button><button id="askHush" type="button">Send</button><p id="providerStatus"></p></section>
  <textarea id="draftBody"></textarea><input id="localTextFile" type="file">
</body></html>`, { pretendToBeVisual: true, url: 'https://td613.test/dome-world/ash-keep.html' });
assert.equal(installAshTrustBoundaryCourt(courtDom.window.document, courtDom.window), true);
assert.equal(installAshTrustBoundaryCourt(courtDom.window.document, courtDom.window), false);
await new Promise(resolve => courtDom.window.setTimeout(resolve, 80));
assert.ok(courtDom.window.document.getElementById('ashTrustBoundaryCourt'));
assert.ok(courtDom.window.document.getElementById('ashCourtProviderGate'));
assert.equal(courtDom.window.document.documentElement.getAttribute('data-ash-trust-boundary-court'), ASH_TRUST_BOUNDARY_COURT_VERSION);
let providerAttempts = 0;
courtDom.window.document.getElementById('askHush').addEventListener('click', () => { providerAttempts += 1; });
const held = new courtDom.window.MouseEvent('click', { bubbles: true, cancelable: true });
assert.equal(courtDom.window.document.getElementById('askHush').dispatchEvent(held), false);
assert.equal(providerAttempts, 0);
assert.match(courtDom.window.document.getElementById('ashCourtGateStatus').textContent, /Held at Ash Court/);
for (const id of ['ashCourtExcerptAttestation', 'ashCourtOriginalAttestation']) {
  const input = courtDom.window.document.getElementById(id);
  input.checked = true;
  input.dispatchEvent(new courtDom.window.Event('change', { bubbles: true }));
}
const allowed = new courtDom.window.MouseEvent('click', { bubbles: true, cancelable: true });
assert.equal(courtDom.window.document.getElementById('askHush').dispatchEvent(allowed), true);
assert.equal(providerAttempts, 1);
await new Promise(resolve => courtDom.window.setTimeout(resolve, 5));
assert.equal(courtDom.window.document.getElementById('ashCourtExcerptAttestation').checked, false);
assert.equal(courtDom.window.document.getElementById('ashCourtOriginalAttestation').checked, false);
courtDom.window.close();

for (const forbidden of [
  /attribution_established\s*:\s*true/,
  /identity_established\s*:\s*true/,
  /prediction_authorized\s*:\s*true/,
  /automatic_action_authorized\s*:\s*true/,
  /surveillance_probability\s*:\s*[01]/
]) assert.doesNotMatch(hydration + guidance + boundaryCourt, forbidden);

console.log('ash-investigation-guidance.test.mjs passed');
