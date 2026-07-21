import assert from 'node:assert/strict';
import fs from 'node:fs';
import { webcrypto } from 'node:crypto';
if (!globalThis.crypto) globalThis.crypto = webcrypto;

import { compileCaseMap, compileRoomRules, compileRouteMemory, verifyCaseMap, verifyRoomRules, verifyRouteMemory } from '../app/engine/ash-keep-core.js';
import { ASH_LEGAL_DEMO_VERSION, buildLegalMatterDemoFixture } from '../app/dome-world/ash-legal-profile-demo.js';

const read = path => fs.readFileSync(path, 'utf8');
const legalSource = read('app/dome-world/ash-legal-profile-demo.js');
const rescueSource = read('app/dome-world/ash-ui-ux-rescue.js');
const flickerSource = read('app/dome-world/ash-flicker-hardening.js');
const lifecycleSource = read('app/dome-world/ash-lifecycle.js');
const compositionSource = read('app/dome-world/ash-aia3-composition.js');
const bridgeSource = read('app/dome-world/ash-workspace-bridge.js');
const facadeSource = read('app/dome-world/ash-profile-demo-hydration.js');
const browserProbe = read('scripts/ash-legal-ux-browser-probe.mjs');

assert.equal(ASH_LEGAL_DEMO_VERSION, 'td613.ash.legal-demo/v0.1-matter-workspace');
const fixture = buildLegalMatterDemoFixture();
assert.equal(fixture.profile, 'legal');
assert.equal(fixture.label, 'Legal matter');
assert.match(fixture.title, /Cedar House Housing Matter/);
assert.equal(fixture.rooms.length, 8);
assert.equal(fixture.nodes.length, 16);
assert.equal(fixture.relationships.length, 12);
assert.equal(fixture.rules.length, 3);
assert.equal(fixture.routes.length, 3);
assert.match(fixture.defaults.research_notes, /No legal advice/);
assert.match(legalSource, /no legal advice, guilt, liability, merits, privilege waiver, or outcome prediction/i);
assert.match(legalSource, /stopImmediatePropagation/);
assert.match(legalSource, /profile-demo-hydrated/);
assert.match(facadeSource, /ash-legal-profile-demo\.js/);
assert.match(bridgeSource, /ash-ui-ux-rescue\.js/);

const roomIds = new Set(fixture.rooms.map(room => room.id));
const nodeIds = new Set(fixture.nodes.map(node => node.id));
const edgeIds = new Set(fixture.relationships.map(edge => edge.id));
assert.equal(roomIds.size, fixture.rooms.length);
assert.equal(nodeIds.size, fixture.nodes.length);
assert.equal(edgeIds.size, fixture.relationships.length);
for (const node of fixture.nodes) assert(roomIds.has(node.room_id), `Unknown legal Room: ${node.id}`);
for (const edge of fixture.relationships) { assert(nodeIds.has(edge.from), `Unknown legal edge source: ${edge.id}`); assert(nodeIds.has(edge.to), `Unknown legal edge target: ${edge.id}`); }
for (const rule of fixture.rules) { for (const roomId of rule.allowed_room_ids) assert(roomIds.has(roomId), `Unknown rule Room: ${roomId}`); for (const edgeId of rule.local_link_keys) assert(edgeIds.has(edgeId), `Unknown rule edge: ${edgeId}`); }
for (const route of fixture.routes) { assert.match(route.draft_digest, /^sha256:[0-9a-f]{64}$/); for (const ref of route.disclosed_opaque_references) assert(nodeIds.has(ref), `Unknown route reference: ${ref}`); }

const caseMap = await compileCaseMap({ profile:'legal', caseId:'case_demo_legal_matter', title:fixture.title, rooms:fixture.rooms, nodes:fixture.nodes, relationships:fixture.relationships, privateChronology:['scope frozen', 'deadline verified', 'human review remains open'], intendedActions:fixture.nodes.filter(node => node.type === 'intended-action').map(node => node.label), sourceStatus:'SIMULATED', evidenceBasis:['synthetic Legal matter test fixture'], operatorNotes:['demo_profile:legal'] });
const roomRules = await compileRoomRules({ caseId:caseMap.case_id, rules:fixture.rules, sourceStatus:'SIMULATED' });
const routeMemory = await compileRouteMemory({ caseId:caseMap.case_id, entries:fixture.routes, sourceStatus:'SIMULATED' });
assert.equal(await verifyCaseMap(caseMap), true);
assert.equal(await verifyRoomRules(roomRules), true);
assert.equal(await verifyRouteMemory(routeMemory), true);

assert.match(lifecycleSource, /data-ash-composition-hydrating/);
assert.match(lifecycleSource, /Preparing Ash Keep · preserving local cases/);
assert.match(lifecycleSource, /html\[data-ash-composition-hydrating="true"\] body\{opacity:0!important;pointer-events:none!important;user-select:none!important\}/);
assert(lifecycleSource.indexOf('td613-ash-composition-veil-style') < lifecycleSource.indexOf('dataset.ashCompositionHydrating'), 'Veil CSS must exist before hydration state becomes observable.');
assert.doesNotMatch(lifecycleSource, /data-ash-composition-hydrating="true"\] body>\*\{visibility:hidden/);
assert.match(lifecycleSource, /v0\.5-human-profile-choice/);
assert.match(compositionSource, /REQUIRED_ROUTE_COUNT = 4/);
assert.match(compositionSource, /REQUIRED_TASK_COUNT = 4/);
assert.match(compositionSource, /WAITING_LIFECYCLE_STATE/);
assert.match(compositionSource, /WAITING_COMPLETE_ROUTE_TASK_GRAPH/);
assert.match(compositionSource, /setExactWork\(open && ready\)/);
assert.match(compositionSource, /dataset\.ashAia3ReadinessHold/);
assert.match(compositionSource, /ashAia3DefaultApplied/);
assert.match(compositionSource, /ashAia3SelectedProfile/);
assert.doesNotMatch(compositionSource, /if \(select\.value !== DEFAULT_PROFILE\)/);

assert.match(rescueSource, /v0\.5-remount-stable-explanation/);
assert.match(rescueSource, /scrollToWorkspace/);
assert.match(rescueSource, /stickyOffset/);
assert.match(rescueSource, /desiredWorkspaceScroll/);
assert.match(rescueSource, /settleWorkspaceScroll/);
assert.match(rescueSource, /publishWorkspaceAlignment/);
assert.match(rescueSource, /ashUxScrollPending/);
assert.match(rescueSource, /SCROLLING_TO_DESTINATION/);
assert.match(rescueSource, /SETTLED_EXACT_ALIGNMENT/);
assert.match(rescueSource, /FORCED_EXACT_ALIGNMENT/);
assert.match(rescueSource, /CLAMPED_DOCUMENT_END/);
assert.match(rescueSource, /ALIGNMENT_DEADLINE_MS = 1400/);
assert.match(rescueSource, /td613:ash:ux-workspace-aligned/);
assert.match(rescueSource, /function scrollToWorkspace\(name\)[\s\S]*?dataset\.ashUxScrollPending = name[\s\S]*?settleWorkspaceScroll/);
assert.match(rescueSource, /function publishWorkspaceAlignment\([\s\S]*?delete doc\.documentElement\.dataset\.ashUxScrollPending[\s\S]*?dataset\.ashUxScrollTarget = name/);
assert.match(rescueSource, /resetMotionTrace/);
assert.match(rescueSource, /recordMotionStep/);
assert.match(rescueSource, /dataset\.ashExplanationTrace/);
assert.match(rescueSource, /td613:ash:explanation-frame/);
assert.match(rescueSource, /currentMotionLabels/);
assert.match(rescueSource, /applyMotionVisual/);
assert.match(rescueSource, /inheritedMotionStep/);
assert.match(rescueSource, /td613:ash:motion-track-mounted/);
assert.match(rescueSource, /\['COMPLETE','STATIC_COMPLETE'\]\.includes\(doc\.documentElement\.dataset\.ashExplanationMotion\)/);
assert.match(rescueSource, /applyMotionVisual\(ensureMotionTrack\(\), 3\)/);
assert.match(rescueSource, /for \(const step of \[0, 1, 2, 3\]\) recordMotionStep\(step\)/);
assert.match(rescueSource, /stopImmediatePropagation/);
assert.match(rescueSource, /ash-ux-motion-track/);
assert.match(rescueSource, /dataset\.ashExplanationMotion/);
assert.match(rescueSource, /READY_TWO_CONSECUTIVE_FRAMES/);
assert.match(rescueSource, /consecutiveReadyFrames/);
assert.match(flickerSource, /cancelRunawayAnimations/);
assert.match(flickerSource, /iterations === Infinity/);
assert.doesNotMatch(flickerSource, /html\[data-ash-flicker-hardening\] \*,[\s\S]*animation:none!important/);

assert.match(browserProbe, /presentation=aia&profile=legal&nonce=\$\{Date\.now\(\)\}/);
assert.match(browserProbe, /location\.search\.includes\(`ash_epoch=\$\{epoch\}`\)/);
assert.match(browserProbe, /composition\?\.lifecycle_state/);
assert.match(browserProbe, /composition\?\.route_count >= 4/);
assert.match(browserProbe, /composition\?\.task_count >= 4/);
assert.match(browserProbe, /body_composed_visible/);
assert.match(browserProbe, /body_opacity/);
assert.match(browserProbe, /v0\.5-traced-finite-explanation/);
assert.match(browserProbe, /ashExplanationTrace/);
assert.match(browserProbe, /new Set\(partialAnimationTrace\)\.size >= 2/);
assert.match(browserProbe, /\[0, 1, 2, 3\]\.every\(step => animationTrace\.includes\(step\)\)/);
assert.match(browserProbe, /docket\.waitFor\(\{ state:'attached' \}\)/);
assert.match(browserProbe, /data-premium-workspace="map"/);
assert.match(browserProbe, /docket\.waitFor\(\{ state:'visible' \}\)/);
assert(browserProbe.indexOf("docket.waitFor({ state:'attached' })") < browserProbe.indexOf('data-premium-workspace="map"'), 'Legal docket must be attached before Map is opened.');
assert(browserProbe.indexOf('data-premium-workspace="map"') < browserProbe.indexOf("docket.waitFor({ state:'visible' })"), 'Legal docket visibility must be asserted only after Map opens.');
assert.doesNotMatch(browserProbe, /waitForTimeout\(900\)/);
assert.doesNotMatch(browserProbe, /ash-keep\.html\?ash_epoch=20260721-legal-demo-ux-v1/);
assert.doesNotMatch(rescueSource + legalSource, /transport_authorized:\s*true|legal_advice_provided:\s*true|child_study_authorized:\s*true/);

console.log('ash-legal-ux.test.mjs passed');
