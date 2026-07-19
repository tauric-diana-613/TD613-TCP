import assert from 'node:assert/strict';
import fs from 'node:fs';
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
const css = read('app/dome-world/ash-guided-operator-ui.css');
const bridge = read('app/dome-world/ash-workspace-bridge.js');
const hardening = read('app/dome-world/ash-flicker-hardening.js');
const emergency = read('app/dome-world/ash-emergency-stability-contract.js');
const closeRepair = read('app/dome-world/ash-case-close-repair.js');
const cacheFlush = read('app/dome-world/ash-cache-flush.js');
const lifecycle = read('app/dome-world/ash-lifecycle.js');
const ingress = read('app/dome-world/ash-ingress-layout-hydration.js');
const navigation = read('app/dome-world/ash-workspace-navigation.js');
const deliveryTransform = read('app/dome-world/ash-keep-delivery-transform.js');
const probe = read('scripts/ash-investigation-guidance-browser-probe.mjs');

assert.equal(ASH_INVESTIGATION_APEQ_PAIA_VERSION, 'td613.ash.investigation-demo/v0.2-apeq-paia');
assert.equal(fixture.profile.id, 'investigation');
assert.deepEqual(fixture.counts, { rooms:14, nodes:72, relationships:112, rules:8, routes:6, controls:12, held_outs:8, strata:10, joining_keys:8 });
assert.equal(fixture.assay.maximum_assurance, 'PA2_LOCALLY_EXECUTED');
assert.equal(fixture.assay.unknown_readers, 'UNMEASURED');
assert.equal(fixture.assay.universal_secrecy, false);
assert.equal(fixture.assay.automatic_release, false);
assert.equal(fixture.assay.human_review_required, true);
assert.match(fixture.assay.claim_ceiling, /NO_IDENTITY_INTENT_GUILT_AUTHORSHIP_SURVEILLANCE_OR_TRUTH_FINDING/);
for (const roomId of ['room_ai','room_safety','room_provenance','room_findings']) assert(fixture.rooms.some(room => room.id === roomId));
for (const nodeId of ['node_ai_copied_instruction_risk','node_ai_rare_fact_linkage_risk','node_next_run_rebuild_test_before_ai']) assert(fixture.nodes.some(node => node.id === nodeId));
assert.equal(fixture.defaults.route.id, 'route_llm_analysis');
assert.equal(fixture.defaults.draft.route, 'route_llm_analysis');
assert.match(fixture.defaults.draft.body, /observable differences and unresolved provenance gaps/i);
assert.match(fixture.defaults.provider_task, /bounded comparison/i);
assert.match(fixture.defaults.protected_literals.join(' '), /protected source alias/i);
assert.match(hydration, /ash-apeq-paia-profile-demos\.js/);
assert.match(runtime, /Joining-key registry/);
assert.match(runtime, /Heterostratigraphic field/);
assert.match(runtime, /PA2 ceiling/);
assert.doesNotMatch(runtime, /fetch\(/);
assert.match(specs, /Glass Meridian Vendor Integrity Inquiry/);
for (const module of ['ash-investigation-demo-hydration','ash-guided-operator-ui','ash-flicker-hardening','ash-emergency-stability-contract']) {
  assert.match(bridge, new RegExp(`${module}\\.js\\?v=20260718-canonical-membrane-v6`));
}
assert.match(bridge, /ash-case-close-repair\.js\?v=20260719-ingress-readiness-boundary-v1/);
assert(bridge.indexOf('ash-flicker-hardening.js') < bridge.indexOf('ash-premium-ui.js'), 'Static compositor must install before Premium composition.');
assert(bridge.indexOf('ash-case-close-repair.js') < bridge.indexOf('ash-premium-ui.js'), 'Close logout must install before Premium composition.');
assert(bridge.indexOf('ash-emergency-stability-contract.js') > bridge.indexOf('ash-workspace-navigation.js'), 'Membrane reveal must run after final composition.');

const roomIds = new Set(fixture.rooms.map(room => room.id));
const nodeIds = new Set(fixture.nodes.map(node => node.id));
const edgeIds = new Set(fixture.relationships.map(edge => edge.id));
for (const node of fixture.nodes) assert(roomIds.has(node.room_id), `${node.id} references an unknown Room`);
for (const edge of fixture.relationships) { assert(nodeIds.has(edge.from)); assert(nodeIds.has(edge.to)); }
for (const rule of fixture.rules) { for (const roomId of rule.allowed_room_ids) assert(roomIds.has(roomId)); for (const edgeId of rule.local_link_keys) assert(edgeIds.has(edgeId)); }
for (const reference of [...fixture.defaults.test_refs,...fixture.defaults.route.refs,...fixture.defaults.draft.refs,...fixture.routes.entries.flatMap(entry => entry.disclosed_opaque_references)]) assert(nodeIds.has(reference), `Unknown method reference ${reference}`);

for (const token of ['Protect → Map → Test → Share → Seal','Send the question, not the whole investigation','Early warning ≠ guilt','View exact Rebuild receipt','guidedMapControlLegend','guidedMapZoomIn','guidedMapFocus','Provider boundary','compressCrossingTimeline','function collapseLegacyRails']) assert(guidance.includes(token), `Guidance omitted ${token}`);
assert.match(guidance, /style\.setProperty\('display', 'none', 'important'\)/);
assert.match(guidance, /setAttribute\('inert', ''\)/);
assert.match(guidance, /ash-guided-operator-ui\.css\?v=20260718-stable-membrane-v4/);
assert.doesNotMatch(css, /guided-dome-drift/);
assert.match(css, /guided-map-control-legend/);
assert.match(css, /Iowan Old Style/);
assert.match(css, /guided-map-focus/);
assert.match(css, /prefers-reduced-motion:reduce/);

assert.match(hardening, /td613\.ash\.flicker-hardening\/v0\.3-emergency-static-surface/);
assert.match(hardening, /td613\.ash\.flicker-hardening\/v1\.0-native-compositor/);
assert.match(hardening, /body::after/);
assert.match(hardening, /content:none!important/);
assert.match(hardening, /animation-name:none!important/);
assert.match(hardening, /transition:none!important/);
assert.match(hardening, /backdrop-filter:none!important/);
assert.match(hardening, /cancelDocumentAnimations/);
assert.match(hardening, /touch-action:pan-y pinch-zoom!important/);
assert.doesNotMatch(hardening, /host\.requestAnimationFrame\s*=/);
assert.doesNotMatch(hardening, /Object\.defineProperty\(host, 'MutationObserver'/);
assert.doesNotMatch(hardening, /contain:layout paint style/);

assert.match(deliveryTransform, /v1\.0-event-driven-map/);
assert.match(deliveryTransform, /EVENT_DRIVEN_COALESCED/);
assert.match(deliveryTransform, /function requestMapDraw\(\)/);
assert.match(deliveryTransform, /ash-keep-perpetual-recursion-survived/);
assert.doesNotMatch(deliveryTransform, /globalThis\.requestAnimationFrame\s*=/);

assert.match(emergency, /td613\.ash\.emergency-stability\/2026-07-18-v6-canonical-membrane/);
assert.match(emergency, /STATIC_SURFACE_NATIVE_SCROLL/);
assert.match(emergency, /HIDDEN_UNTIL_FINAL_COMPOSITION/);
assert.match(emergency, /SAVE_CLEAR_SESSION_RETURN_UNSELECTED_TO_MEMBRANE/);
assert.match(emergency, /REQUIRED_MEMBRANE_IDS/);
assert.match(closeRepair, /v1\.3-ingress-readiness-boundary/);
assert.match(closeRepair, /saveBeforeClose/);
assert.match(closeRepair, /validThresholdReadiness/);
assert.match(closeRepair, /clearAshSessionStorage/);
assert.match(closeRepair, /preserveReadiness:true/);
assert.match(closeRepair, /localStorage\.removeItem\(POINTER_KEY\)/);
assert.match(closeRepair, /localStorage\.removeItem\(SESSION_EPOCH_KEY\)/);
assert.match(closeRepair, /launch\?\.classList\.remove\('hidden'\)/);
assert.match(closeRepair, /automatic-close-boundary/);
assert.match(closeRepair, /operator-closed-current-case-session-logout/);
assert.match(closeRepair, /session_logged_out:true/);
assert.match(closeRepair, /select\.value = ''/);
assert.match(closeRepair, /async function closeToMembrane\(\)[\s\S]*?exposeMembrane\(\);/);
assert.doesNotMatch(closeRepair, /retainClosedSelection/);
assert.match(cacheFlush, /2026-07-18-canonical-membrane-v7/);
assert.match(cacheFlush, /v0\.7-readiness-boundary/);
assert.match(cacheFlush, /unregisterSameOriginWorkers/);
assert.match(cacheFlush, /cache:'no-store'/);
assert.match(cacheFlush, /local_case_pointer_preserved:false/);
assert.match(cacheFlush, /active_session_reset:true/);
assert.match(lifecycle, /ash-cache-flush\.js\?v=20260718-canonical-membrane-v7-readiness-boundary/);
assert.doesNotMatch(cacheFlush, /2026-07-18-(?:live-ingress-v3|emergency-stability-v5)/);

assert.match(ingress, /td613\.ash\.ingress-layout\/v1\.0-canonical-native-scroll/);
assert.match(ingress, /panel_nested_scroll:false/);
assert.match(ingress, /touch-action:pan-y pinch-zoom!important/);
assert.doesNotMatch(ingress, /installScrollbarFade|SCROLLBAR_FADE_DELAY/);
assert.doesNotMatch(navigation, /new host\.MutationObserver/);

assert.match(probe, /legacyRailReceipt/);
assert.match(probe, /Primary dock remained visible over focused tomography/);
assert.match(probe, /Mobile hero title remained oversized/);
assert.match(probe, /Map control legend escaped the bottom-left corner/);
assert.match(probe, /EVENT_DRIVEN_COALESCED/);
assert.match(probe, /Ash map retained a pending frame while idle/);
assert.match(probe, /Ash command membrane mutated while idle/);

for (const forbidden of [/attribution_established\s*:\s*true/,/identity_established\s*:\s*true/,/prediction_authorized\s*:\s*true/,/automatic_action_authorized\s*:\s*true/,/surveillance_probability\s*:\s*[01]/]) assert.doesNotMatch(runtime + specs + guidance, forbidden);

console.log('ash-investigation-guidance.test.mjs passed');
