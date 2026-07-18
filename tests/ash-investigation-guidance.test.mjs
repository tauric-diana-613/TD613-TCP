import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import {
  ASH_TRUST_BOUNDARY_COURT_VERSION,
  installAshTrustBoundaryCourt
} from '../app/dome-world/ash-guided-trust-boundary-court.js';
import {
  ASH_INVESTIGATION_APEQ_PAIA_VERSION,
  buildApeqPaiaProfileFixture
} from '../app/dome-world/ash-apeq-paia-profile-demos.js';

const read = path => fs.readFileSync(path, 'utf8');
const fixture = buildApeqPaiaProfileFixture('investigation');
const hydration = read('app/dome-world/ash-investigation-demo-hydration.js');
const runtime = read('app/dome-world/ash-apeq-paia-profile-demos.js');
const specs = read('app/dome-world/ash-apeq-paia-profile-specs.js');
const guidance = read('app/dome-world/ash-guided-operator-ui.js');
const boundaryCourt = read('app/dome-world/ash-guided-trust-boundary-court.js');
const css = read('app/dome-world/ash-guided-operator-ui.css');
const bridge = read('app/dome-world/ash-workspace-bridge.js');
const probe = read('scripts/ash-investigation-guidance-browser-probe.mjs');

assert.equal(ASH_INVESTIGATION_APEQ_PAIA_VERSION, 'td613.ash.investigation-demo/v0.2-apeq-paia');
assert.equal(fixture.profile.id, 'investigation');
assert.equal(fixture.rooms.length, 14);
assert.equal(fixture.nodes.length, 72);
assert.equal(fixture.relationships.length, 112);
assert.equal(fixture.rules.length, 8);
assert.equal(fixture.routes.entries.length, 6);
assert.equal(fixture.assay.controls.length, 12);
assert.equal(fixture.assay.held_outs.length, 8);
assert.equal(fixture.assay.strata.length, 10);
assert.equal(fixture.assay.joining_keys.length, 8);
assert.equal(fixture.assay.maximum_assurance, 'PA2_LOCALLY_EXECUTED');
assert.equal(fixture.assay.unknown_readers, 'UNMEASURED');
assert.equal(fixture.assay.universal_secrecy, false);
assert.equal(fixture.assay.automatic_release, false);
assert.equal(fixture.assay.human_review_required, true);
assert.match(fixture.assay.claim_ceiling, /NO_IDENTITY_INTENT_GUILT_AUTHORSHIP_SURVEILLANCE_OR_TRUTH_FINDING/);
assert.ok(fixture.rooms.some(room => room.id === 'room_ai'));
assert.ok(fixture.rooms.some(room => room.id === 'room_safety'));
assert.ok(fixture.rooms.some(room => room.id === 'room_provenance'));
assert.ok(fixture.rooms.some(room => room.id === 'room_findings'));
assert.ok(fixture.nodes.some(node => node.id === 'node_ai_copied_instruction_risk'));
assert.ok(fixture.nodes.some(node => node.id === 'node_ai_rare_fact_linkage_risk'));
assert.ok(fixture.nodes.some(node => node.id === 'node_next_run_rebuild_test_before_ai'));
assert.equal(fixture.defaults.route.id, 'route_llm_analysis');
assert.equal(fixture.defaults.draft.route, 'route_llm_analysis');
assert.match(fixture.defaults.draft.body, /observable differences and unresolved provenance gaps/i);
assert.match(fixture.defaults.provider_task, /bounded comparison/i);
assert.match(fixture.defaults.protected_literals.join(' '), /protected source alias/i);
assert.equal(fixture.defaults.tradeoff.utility, 7);
assert.match(hydration, /ash-apeq-paia-profile-demos\.js/);
assert.match(runtime, /Joining-key registry/);
assert.match(runtime, /Heterostratigraphic field/);
assert.match(runtime, /PA2 ceiling/);
assert.doesNotMatch(runtime, /fetch\(/);
assert.match(specs, /Glass Meridian Vendor Integrity Inquiry/);
assert.match(bridge, /ash-investigation-demo-hydration\.js/);
assert.match(bridge, /ash-guided-operator-ui\.js/);
assert.match(bridge, /ash-guided-trust-boundary-court\.js\?v=20260717-trust-boundary-v1/);

const roomIds = new Set(fixture.rooms.map(room => room.id));
const nodeIds = new Set(fixture.nodes.map(node => node.id));
const edgeIds = new Set(fixture.relationships.map(edge => edge.id));
for (const node of fixture.nodes) assert.ok(roomIds.has(node.room_id), `${node.id} references an unknown Room`);
for (const edge of fixture.relationships) {
  assert.ok(nodeIds.has(edge.from), `${edge.id} has an unknown source`);
  assert.ok(nodeIds.has(edge.to), `${edge.id} has an unknown target`);
}
for (const rule of fixture.rules) {
  for (const roomId of rule.allowed_room_ids) assert.ok(roomIds.has(roomId), `${rule.route_id} has an unknown Room`);
  for (const edgeId of rule.local_link_keys) assert.ok(edgeIds.has(edgeId), `${rule.route_id} has an unknown local link`);
}
for (const reference of [
  ...fixture.defaults.test_refs,
  ...fixture.defaults.route.refs,
  ...fixture.defaults.draft.refs,
  ...fixture.routes.entries.flatMap(entry => entry.disclosed_opaque_references)
]) assert.ok(nodeIds.has(reference), `Unknown method reference ${reference}`);

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
]) assert.doesNotMatch(runtime + specs + guidance + boundaryCourt, forbidden);

console.log('ash-investigation-guidance.test.mjs passed');
