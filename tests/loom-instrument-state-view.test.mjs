import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { webcrypto } from 'node:crypto';
import { JSDOM } from 'jsdom';
import {
  compileLoomInstrumentStateView, projectLoomInstrumentStateFrame,
  mountLoomInstrumentStateView, LOOM_INSTRUMENT_STATE_VIEW_SCHEMA
} from '../app/dome-world/holonomy-loom/instrument-state-view.js';
import { FLOWCORE_GLYPH_REGISTRY } from '../app/dome-world/data/flowcore-glyph-semantics-v01.js';
import { compareAIAViews } from '../app/engine/flowcore-pedagogue-aia.js';

const SHA = '9824dfa0f427c8b944ff5c7fdfd43719b2b41418';
function packet(phase = 'pending', extra = {}) {
  const returned = ['received', 'completed'].includes(phase);
  return {
    phase, at: '2026-10-02T10:00:00.000Z', request_id: 'request-one',
    shared: 2, local: 1, selected_document_ids: ['brief', 'offer'],
    scene: { id: `ai-${phase}`, rules_count: 3 },
    outbound_submitted: ['pending', 'received', 'completed'].includes(phase),
    response_received: returned, binding_verified: !['prepared', 'checking'].includes(phase),
    ...(phase === 'completed' ? { used_document_ids: ['offer'], missing_information: ['A source date is missing.'], aia: { fadt_admission: true, projection_family_verified: { all_invariants_preserved: true } } } : {}),
    ...extra
  };
}
const compile = (input, options = {}) => compileLoomInstrumentStateView(input, {
  sourceRevision: SHA, cryptoImpl: webcrypto, ...options
});

test('actual event metadata uses the canonical scene, transition, graph and four non-equivalent AIA compilers', async () => {
  const input = packet();
  input.raw_answer = 'RAW ANSWER MUST NOT ENTER';
  input.local_receipt = { local_file_name: 'PRIVATE FILE MUST NOT ENTER', raw_body: 'PRIVATE BODY MUST NOT ENTER' };
  input.scene.documents = [{ id: 'local', name: 'PRIVATE NAME MUST NOT ENTER', text: 'PRIVATE TEXT MUST NOT ENTER', share: false }];
  const before = JSON.stringify(input);
  const view = await compile(input, { route: 'AUDIT' });
  assert.equal(view.schema, LOOM_INSTRUMENT_STATE_VIEW_SCHEMA);
  assert.equal(view.scene.schema, 'td613.flowcore.pedagogical-scene/v0.1');
  assert.equal(view.transition.schema, 'td613.flowcore.pedagogical-transition/v0.1');
  assert.equal(view.route_graph.schema, 'td613.flowcore.route-graph/v0.1');
  assert.match(view.route_graph.graph_digest, /^sha256:[a-f0-9]{64}$/);
  assert.deepEqual(Object.keys(view.aia_views), ['EXPERIENTIAL', 'CUSTODIAL', 'AUDIT', 'IMPLEMENTATION']);
  assert.equal(view.aia_invariant_report.all_invariants_preserved, true);
  assert.equal(view.selected_aia_view.route, 'AUDIT');
  const comparison = compareAIAViews(view.aia_views.EXPERIENTIAL, view.aia_views.AUDIT);
  assert.equal(comparison.invariants_preserved, true);
  assert.equal(comparison.surfaces_non_equivalent, true);
  assert.equal(JSON.stringify(input), before);
  assert.doesNotMatch(JSON.stringify(view), /MUST NOT ENTER/);
  assert.deepEqual(view, await compile(input, { route: 'AUDIT' }));
  assert.ok(Object.isFrozen(view.event_history[0]));
  assert.ok(Object.isFrozen(view.relations.gathering));
});

test('all eight exact glyphs retain registry grammar; only evidenced relations may activate', async () => {
  const view = await compile(packet('prepared'));
  assert.deepEqual(Object.values(view.relations).map(item => item.glyph), ['米', 'à', '出', '上', '下', 'cōl', 'hõt', '𝄐']);
  for (const [key, descriptor] of Object.entries(view.relations)) {
    assert.equal(descriptor.semantic_relation, FLOWCORE_GLYPH_REGISTRY.entries[key].semantic_relation);
    assert.deepEqual(descriptor.static_equivalent, FLOWCORE_GLYPH_REGISTRY.entries[key].static_equivalent);
    assert.deepEqual(descriptor.inspection_grammar, FLOWCORE_GLYPH_REGISTRY.entries[key].inspection_grammar);
    assert.deepEqual(descriptor.motion_grammar, FLOWCORE_GLYPH_REGISTRY.entries[key].motion_grammar);
  }
  assert.equal(view.active_relation, 'gathering');
  assert.equal(view.relations.release.evidenced, false);
  assert.equal(view.relations.released_tendency.evidenced, false);
  assert.equal(view.relations.bounded_emergence.evidenced, false);
  const empty = await compile(packet('prepared', { shared: 0, local: 0, selected_document_ids: [], scene: { rules_count: 0 } }));
  assert.equal(empty.active_relation, null);
  assert.ok(Object.values(empty.relations).every(item => item.evidenced === false));
});

test('binding verified before submission means readiness, never response validation or custody admission', async () => {
  const ready = await compile(packet('checking', { binding_verified: true }));
  assert.equal(ready.active_relation, 'created_potential');
  assert.equal(ready.state.local_task_binding_verified, true);
  assert.equal(ready.state.answer_observed, false);
  assert.equal(ready.state.local_return_review_completed, false);
  const pending = await compile(packet());
  assert.equal(pending.active_relation, 'release');
  assert.equal(pending.relations.created_potential.evidenced, true);
  assert.equal(pending.relations.released_tendency.evidenced, false);
  assert.equal(pending.state.provider_internal_activity, 'UNOBSERVED');
  assert.equal(pending.model_reports.status, 'NOT_ADMITTED_FROM_THIS_EVENT');
  assert.equal(pending.state.custody_admitted, false);
  assert.equal(pending.custody_admission_credit, 0);
  assert.equal(pending.empirical_credit, 0);
});

test('received reports remain unvalidated; completed local checks remain separate from new custody', async () => {
  const received = await compile(packet('received', { used_document_ids: ['offer'], missing_information: ['Unconfirmed report.'] }));
  assert.equal(received.active_relation, 'released_tendency');
  assert.equal(received.model_reports.status, 'UNVALIDATED_MODEL_REPORT');
  assert.equal(received.state.local_return_review_completed, false);
  assert.equal(received.relations.bounded_emergence.evidenced, false);
  const completed = await compile(packet('completed'));
  assert.equal(completed.active_relation, 'bounded_emergence');
  assert.equal(completed.model_reports.status, 'LOCALLY_REVIEWED_MODEL_REPORT');
  assert.deepEqual(completed.model_reports.source_references, ['offer']);
  assert.equal(completed.model_reports.establishes_actual_source_use, false);
  assert.equal(completed.scene.causal_structure.local_checks.fadt_task_authorization, true);
  assert.equal(completed.scene.causal_structure.local_checks.aia_projection_family, true);
  assert.equal(completed.state.local_return_review_completed, true);
  assert.equal(completed.state.custody_admitted, false);
  assert.equal(completed.authority.custody_admission_authorized, false);
});

test('a returned provider failure receipt does not become a model answer', async () => {
  const view = await compile(packet('held', {
    outbound_submitted: true, response_received: true, binding_verified: true,
    used_document_ids: ['offer'], missing_information: ['Unadmitted failure content.'],
    provider_failure: { diagnostic: { stage: 'provider-transport' } }
  }));
  assert.equal(view.state.response_body_received, true);
  assert.equal(view.state.answer_observed, false);
  assert.equal(view.relations.release.evidenced, true);
  assert.equal(view.relations.released_tendency.evidenced, false);
  assert.equal(view.model_reports.status, 'NOT_ADMITTED_FROM_THIS_EVENT');
  assert.equal(view.model_reports.missing_information, null);
  assert.equal(view.active_relation, 'structural_rest');
  assert.match(view.copy.now, /provider route failed/);
});

test('event history preserves request, time and selection; replay cannot borrow later response evidence', async () => {
  const prepared = packet('prepared', { request_id: null, at: '2026-10-02T09:59:58.000Z' });
  const pending = packet();
  const received = packet('received', { at: '2026-10-02T10:00:02.000Z' });
  const complete = packet('completed', { at: '2026-10-02T10:00:04.000Z' });
  const full = await compile(complete, { eventHistory: [prepared, pending, received, complete] });
  assert.deepEqual(full.event_history.map(item => item.phase), ['prepared', 'pending', 'received', 'completed']);
  assert.deepEqual(full.event_relation_history.map(item => item.glyph), ['à', '出', '下', 'hõt'], 'cinematic history may repeat only relations evidenced by the recorded route');
  assert.equal(full.event_history[0].request_id, null);
  assert.equal(full.event_history.at(-1).at, complete.at);
  assert.equal(full.route_graph.nodes.length, 4);
  assert.deepEqual(full.phase_sequence.map(item => item.phase), ['NOTICE', 'NOTICE', 'NOTICE', 'NOTICE']);
  assert.equal(full.operator_gesture_trace_captured, false);
  assert.equal(full.relations.recurrence.evidenced, true);
  const replay = await compile(pending, { eventHistory: [prepared, pending, received, complete], replay: true });
  assert.deepEqual(replay.event_history.map(item => item.phase), ['prepared', 'pending']);
  assert.equal(replay.state.answer_observed, false);
  assert.equal(replay.model_reports.source_references, null);
  assert.equal(replay.relations.released_tendency.evidenced, false);
  assert.equal(replay.replay, true);
  assert.equal(replay.active_relation, 'release', 'an unassigned draft is not evidence of recurrence in this assigned request');
  const returnedReplay = await compile(received, { eventHistory: [pending, received, complete], replay: true });
  assert.equal(returnedReplay.active_relation, 'recurrence');
  assert.equal(returnedReplay.state.local_return_review_completed, false);
  assert.equal(returnedReplay.model_reports.status, 'UNVALIDATED_MODEL_REPORT');
});

test('explicit conflicting flags hold the implied relation and retain the disagreement', async () => {
  const view = await compile(packet('received', { outbound_submitted: false, response_received: false }));
  assert.equal(view.active_relation, null);
  assert.equal(view.state.submitted, false);
  assert.equal(view.state.answer_observed, false);
  assert.equal(view.scene.observation_status, 'CONTRADICTORY');
  assert.equal(view.scene.contradictions.length, 2);
  assert.match(view.copy.now, /records disagree/);
});

test('scene decoration and display rest cannot manufacture a duplicate client observation', async () => {
  const raw = packet('completed');
  delete raw.scene;
  const decorated = { ...raw, scene: { id: 'ai-completed', rules_count: 3 }, geometry: { rest: false } };
  const view = await compile(decorated, { eventHistory: [packet(), raw] });
  assert.deepEqual(view.event_history.map(item => item.phase), ['pending', 'completed']);
  assert.equal(view.event_history.at(-1).rules_count, 3);
  assert.equal(view.route_graph.nodes.length, 2);
});

test('missing time and source drift remain explicit; no synthetic observation time or source authentication', async () => {
  const noTime = packet();
  delete noTime.at;
  const view = await compile(noTime, { sourceRevision: 'working-tree' });
  assert.equal(view.event.at, null);
  assert.equal(view.clock_basis, 'FIXED_DIGEST_EPOCH_NOT_OBSERVATION_TIME');
  assert.match(view.scene.missingness.join(' '), /not an observation timestamp/);
  assert.equal(view.source_revision_authenticated, false);
  const browserSource = await compile(packet('completed'), { sourceRevision: 'browser-unpinned' });
  assert.equal(browserSource.phase, 'completed');
  assert.equal(browserSource.source_revision, 'browser-unpinned');
  assert.equal(browserSource.source_revision_status, 'UNPINNED_BROWSER_SOURCE');
  assert.equal(browserSource.source_revision_authenticated, false);
  assert.match(browserSource.scene.missingness.join(' '), /no exact commit pin/);
  const drift = await compile(packet('pending', { source: { revision: 'a'.repeat(40) } }));
  assert.equal(drift.event.declared_source_revision, 'a'.repeat(40));
  assert.equal(drift.source_revision, SHA);
  assert.match(drift.scene.missingness.join(' '), /differs/);
  assert.equal(drift.selected_route, null);
  assert.equal(drift.selected_aia_view, null);
  assert.equal(drift.route_inference_performed, false);
});

test('bounded metadata rejects malformed identities, accessors and inferred routes without touching payloads', async () => {
  await assert.rejects(compile(packet('unknown')));
  await assert.rejects(compile(packet(), { sourceRevision: 'A'.repeat(40) }));
  await assert.rejects(compile(packet(), { route: 'child' }));
  await assert.rejects(compile(packet(), { replay: 'yes' }));
  await assert.rejects(compile(packet(), { eventHistory: new Array(2) }));
  await assert.rejects(compile(packet(), { eventHistory: Array.from({ length: 31 }, () => packet()) }));
  await assert.rejects(compile(packet('pending', { selected_document_ids: ['brief', 'brief'] })));
  await assert.rejects(compile(packet('completed', { used_document_ids: ['private-local'] })));
  await assert.rejects(compile(packet('pending', { outbound_submitted: 'true' })));
  await assert.rejects(compile(packet('pending', { at: 'now' })));
  await assert.rejects(compile(packet('pending', { at: '2026-02-30T10:00:00Z' })));
  const accessorPacket = packet();
  Object.defineProperty(accessorPacket, 'phase', { get() { throw new Error('ACCESSOR EXECUTED'); } });
  await assert.rejects(compile(accessorPacket), error => !error.message.includes('ACCESSOR EXECUTED'));
  const getterHistory = [];
  Object.defineProperty(getterHistory, '0', { enumerable: true, get() { throw new Error('HISTORY GETTER EXECUTED'); } });
  await assert.rejects(compile(packet(), { eventHistory: getterHistory }), error => !error.message.includes('HISTORY GETTER EXECUTED'));
  const ignoredPayload = packet();
  Object.defineProperty(ignoredPayload, 'raw_answer', { get() { throw new Error('PAYLOAD READ'); } });
  assert.equal((await compile(ignoredPayload)).phase, 'pending');
});

test('pure coordinator frames retain static meaning and do not change request or admission state', async () => {
  const view = await compile(packet('completed'));
  const before = JSON.stringify(view);
  const a = projectLoomInstrumentStateFrame(view, { progress: 0, timeMs: 0, viewport: { width: 390, height: 844, dpr: 1 } });
  const b = projectLoomInstrumentStateFrame(view, { progress: 1, timeMs: 4000, viewport: { width: 390, height: 844, dpr: 1 } });
  assert.equal(a.relation_key, b.relation_key);
  assert.equal(a.descriptor.glyph, 'hõt');
  assert.deepEqual(a.endpoints, b.endpoints);
  assert.deepEqual(a.canonical_frame.static_equivalent, b.canonical_frame.static_equivalent);
  assert.equal(a.canonical_frame.viewport.layout, 'SINGLE_COLUMN_390');
  assert.equal(a.canonical_frame.scheduler.owns_animation_loop, false);
  const still = projectLoomInstrumentStateFrame(view, { progress: 0, reducedMotion: true });
  assert.equal(still.reduced_motion, true);
  assert.equal(still.canonical_frame.channels.motion.mode, 'SIMULTANEOUS_CAUSAL_FRAME');
  assert.deepEqual(still.glyph_transform, { x: 0, y: 0, scale: 1 });
  const paused = projectLoomInstrumentStateFrame(await compile(packet()), { rest: true, progress: 0 });
  assert.equal(paused.phase, 'pending');
  assert.equal(paused.relation_key, 'release');
  assert.equal(paused.display_rest_only, true);
  assert.equal(paused.custody_admitted, false);
  assert.equal(JSON.stringify(view), before);
});

test('DOM renders one relation, retains drawer/focus across ticks and never creates another clock', async () => {
  const dom = new JSDOM('<main><div id="instrument"></div></main>');
  const root = dom.window.document.querySelector('#instrument');
  const unexpected = () => { throw new Error('Renderer created a clock'); };
  dom.window.requestAnimationFrame = unexpected;
  dom.window.setTimeout = unexpected;
  dom.window.setInterval = unexpected;
  const ui = mountLoomInstrumentStateView(root);
  const view = await compile(packet('received'));
  ui.update(view, { progress: 0, viewport: { width: 390, height: 844, dpr: 1 } });
  assert.equal(root.querySelectorAll('[data-instrument-active-glyph]').length, 1);
  assert.equal(root.querySelector('[data-instrument-active-glyph]').textContent, '下');
  assert.equal(dom.window.document.documentElement.dataset.loomRelation, 'released_tendency');
  assert.ok(root.querySelectorAll('.loom-field-flight text[data-flight-relation]').length > 0, 'evidenced route relations populate the shared-clock cinematic strata');
  assert.match(root.textContent, /return checks are pending/);
  assert.match(root.textContent, /UNVALIDATED_MODEL_REPORT/);
  assert.match(root.textContent, /no custody admission/);
  assert.equal(root.querySelector('.loom-instrument-state-endpoints').textContent, 'Response body → Local return checks');
  assert.equal(root.querySelector('.loom-instrument-state-endpoints').style.fontSize, '13px');
  const details = root.querySelector('details');
  details.open = true;
  const summary = details.querySelector('summary');
  summary.focus();
  ui.update(view, { progress: .5 });
  assert.equal(root.querySelector('details'), details);
  assert.equal(details.open, true);
  assert.equal(dom.window.document.activeElement, summary);
  const completed = await compile(packet('completed'));
  ui.update(completed, { reducedMotion: true, progress: 0 });
  assert.equal(root.querySelector('[data-instrument-active-glyph]').textContent, 'hõt');
  assert.equal(details.open, true);
  const staticText = root.textContent;
  ui.update(completed, { reducedMotion: true, progress: 1 });
  assert.equal(root.textContent, staticText);
  assert.equal(ui.inspect().owns_animation_loop, false);
  const source = fs.readFileSync(new URL('../app/dome-world/holonomy-loom/instrument-state-view.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /\b(requestAnimationFrame|setInterval|setTimeout|Date\.now|performance\.now|fetch)\s*\(/);
  ui.destroy();
  assert.equal(dom.window.document.documentElement.dataset.loomRelation, undefined);
  assert.equal(root.childElementCount, 0);
  assert.equal(ui.inspect().destroyed, true);
  assert.throws(() => ui.update(view));
});

test('explicit inspection routes render their distinct canonical surfaces after the shared consequence', async () => {
  const dom = new JSDOM('<div id="instrument"></div>');
  const root = dom.window.document.querySelector('#instrument');
  const ui = mountLoomInstrumentStateView(root);
  const input = packet('completed');
  const views = await Promise.all(['EXPERIENTIAL', 'CUSTODIAL', 'AUDIT', 'IMPLEMENTATION'].map(route => compile(input, { route })));
  const surfaces = [];
  for (const view of views) {
    ui.update(view, { reducedMotion: true });
    assert.equal(root.querySelector('h3').textContent, view.copy.now);
    assert.equal(root.querySelector('.loom-instrument-state-projection').hidden, false);
    surfaces.push(root.querySelector('.loom-instrument-state-projection').textContent);
  }
  assert.equal(new Set(surfaces).size, 4);
  assert.match(surfaces[0], /visible condition/);
  assert.match(surfaces[1], /custody posture/);
  assert.match(surfaces[2], /residuals/);
  assert.match(surfaces[3], /schemas/);
  ui.update(await compile(input));
  assert.equal(root.querySelector('.loom-instrument-state-projection').hidden, true);
});
