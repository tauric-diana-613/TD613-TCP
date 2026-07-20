import { compileAshCustodyPedagogueScene } from '../engine/ash-pedagogue-adapter.js';
import {
  ASH_LIVE_AIA_ROUTES,
  compileAshLiveActionPlan,
  compileAshLiveActionReceipt,
  compileAshLiveRenderReceipt,
  deriveAshLiveAnimationPlan,
  verifyAshLivePresentationBoundary
} from '../engine/ash-live-aia.js';

const LEGACY = new URLSearchParams(location.search).get('presentation') === 'legacy';
const ROUTE_KEY = 'td613:ash-keep:aia-route:v0.1';
const RECEIPT_KEY = 'td613:ash-keep:aia-receipts:v0.1';
const STYLE_URL = '/dome-world/ash-keep-aia.css?v=20260720-ak-aia-2-rescue';
const GOVERNED = new Set([
  'compileQuickScan', 'registerCustodyRoot', 'bindCustodyRoot', 'newCase', 'startDemo',
  'runTest', 'loadSeed', 'keepDraft', 'reviewDraft', 'approveRelease', 'makeSave'
]);
const ALIASES = Object.freeze({ loadSeed: 'runTest', startDemo: 'newCase' });
const TASKS = Object.freeze([
  ['setup', 'Set up workspace', 'Choose a profile, create a case, or open a saved case.'],
  ['document', 'Open a local document', 'Choose a local text file. Its bytes stay in this browser.'],
  ['custody', 'Keep and check', 'Create and verify a custody reference through an explicit gesture.'],
  ['work', 'Map, test, review, save', 'Use the exact Ash workspaces while consequence guidance stays visible.']
]);

const state = {
  route: readRoute(), packageView: null, lifecycleReceipt: null, previousLifecycle: null,
  actionPlan: null, animationPlan: null, latestActionReceipt: null, latestRenderReceipt: null,
  pendingAction: null, pendingTimer: 0, resting: false, playing: false, frame: 0,
  frameTimer: 0, refreshToken: 0, reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  bypass: new WeakSet()
};
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
const json = value => JSON.stringify(value, null, 2);
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function readRoute() {
  if (LEGACY) return 'IMPLEMENTATION';
  try {
    const stored = sessionStorage.getItem(ROUTE_KEY);
    return ASH_LIVE_AIA_ROUTES.includes(stored) ? stored : 'EXPERIENTIAL';
  } catch { return 'EXPERIENTIAL'; }
}
function caseOpen() {
  try { return Boolean(window.__td613AshKeep?.current?.().case_id || localStorage.getItem('td613.ash-keep.current-case')); }
  catch { return Boolean(window.__td613AshKeep?.current?.().case_id); }
}
function documentOpen() { return Boolean($('#draftBody')?.value?.trim() || $('#localTextFile')?.files?.length); }
function parseLifecycleReceipt() {
  try {
    const receipt = JSON.parse($('#lifecycleReceipt')?.textContent || 'null');
    return receipt?.lifecycle?.schema === 'td613.ash.lifecycle/v0.1' ? receipt : null;
  } catch { return null; }
}
function remember(receipt) {
  if (!receipt) return;
  try {
    const list = JSON.parse(sessionStorage.getItem(RECEIPT_KEY) || '[]');
    list.push(receipt);
    sessionStorage.setItem(RECEIPT_KEY, JSON.stringify(list.slice(-40)));
  } catch {}
}
async function ensureStylesheet() {
  let link = document.querySelector('link[data-ash-live-aia]');
  if (link?.sheet) return;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = STYLE_URL; link.dataset.ashLiveAia = 'true';
    document.head.append(link);
  }
  await Promise.race([
    new Promise((resolve, reject) => {
      if (link.sheet) return resolve();
      link.addEventListener('load', resolve, { once: true });
      link.addEventListener('error', () => reject(new Error('Ash AIA stylesheet failed to load.')), { once: true });
    }),
    delay(8000).then(() => { throw new Error('Ash AIA stylesheet timed out.'); })
  ]);
}
function ensureSurface() {
  if ($('#ashAiaMembrane')) return;
  const root = document.createElement('section');
  root.id = 'ashAiaMembrane'; root.className = 'ash-aia'; root.dataset.ashAia = 'task-continuity';
  root.setAttribute('aria-labelledby', 'ashAiaTitle');
  root.innerHTML = `
    <header class="ash-aia__header"><div><p class="ash-aia__eyebrow">U+10D613 · AK-AIA-2 · Child-legible Anisotropic Information Architecture</p><h2 id="ashAiaTitle">Start with the work. Ash explains each consequence as you go.</h2><p class="ash-aia__posture">Local-first · explicit gestures · no route inference · no telemetry · child study locked</p></div><div class="ash-aia__state"><span data-aia-state>Reading Ash…</span><span data-aia-session>No case open</span></div></header>
    <nav class="ash-aia__routes" aria-label="Explanation depth">${ASH_LIVE_AIA_ROUTES.map(route => `<button type="button" data-aia-route="${route}" aria-pressed="false">${route[0] + route.slice(1).toLowerCase()}</button>`).join('')}</nav>
    <ol class="ash-aia__tasks" aria-label="Ash Keep task path">${TASKS.map(([id, label, detail], index) => `<li><button type="button" data-aia-task="${id}" aria-current="false"><span>${index + 1}</span><strong>${label}</strong><small>${detail}</small></button></li>`).join('')}</ol>
    <div class="ash-aia__body">
      <section class="ash-aia__guide" aria-labelledby="ashAiaNow"><div class="ash-aia__guide-head"><div><p class="ash-aia__step-label">Now</p><h3 id="ashAiaNow" data-aia-consequence>Preparing the task path…</h3></div><button type="button" data-aia-play>Play explanation</button></div><div class="ash-aia__stage" data-aia-stage></div><p class="ash-aia__live" role="status" aria-live="polite" data-aia-live>Ash is preparing a stable explanation.</p><div class="ash-aia__lesson-controls"><button type="button" data-aia-previous>Previous lesson</button><button type="button" data-aia-next>Next lesson</button><button type="button" data-aia-rest>𝄐 Rest</button><button type="button" data-aia-return hidden>Return</button></div></section>
      <aside class="ash-aia__work" aria-labelledby="ashAiaWork"><p class="ash-aia__step-label">Do the work here</p><h3 id="ashAiaWork" data-aia-action-label>Set up a private workspace</h3><p data-aia-action-purpose>Choose a profile and create or open a case.</p><p class="ash-aia__expected" data-aia-action-consequence>Workspace setup changes local case structure only.</p><div class="ash-aia__ingress-slot" data-aia-ingress-slot></div><div class="ash-aia__action-controls"><button type="button" data-aia-primary-task>Set up workspace</button><button type="button" data-aia-open-workspace hidden>Open exact workspace</button></div><p class="ash-aia__boundary">The exact Ash control performs the action. This guide only explains, focuses, and witnesses it.</p></aside>
    </div>
    <details class="ash-aia__consequences" open><summary>What changed—and what did not</summary><section class="ash-aia__five" data-aia-five></section></details>
    <div class="ash-aia__depths"><details data-aia-why><summary>Why did Ash do that?</summary><div data-aia-why-body></div></details><details data-aia-exact><summary>Exact state, receipts, digest, and rule</summary><div class="ash-aia__exact-grid"><section><h3>Lifecycle</h3><pre data-aia-lifecycle></pre></section><section><h3>Latest action receipt</h3><pre data-aia-action-receipt>No action receipt yet.</pre></section><section><h3>Latest render receipt</h3><pre data-aia-render-receipt>No render receipt yet.</pre></section><section><h3>Pedagogue package</h3><pre data-aia-package></pre></section></div></details></div>
    <section class="ash-aia__holds" data-aia-holds hidden></section>
    <dialog class="ash-aia__confirm" data-aia-confirm><form method="dialog"><p class="ash-aia__step-label">Before Ash acts</p><h2 data-confirm-title>Confirm exact action</h2><p data-confirm-purpose></p><div class="ash-aia__confirm-grid"><section><h3>Expected consequence</h3><p data-confirm-consequence></p></section><section><h3>Still unauthorized</h3><ul data-confirm-nonauthority></ul></section></div><p>The explanation witnesses Ash’s answer. It never performs or certifies the action.</p><div class="ash-aia__dialog-actions"><button value="cancel">Return</button><button value="confirm" class="primary">Confirm this exact gesture</button></div></form></dialog>`;
  ($('.workspace-rail') || $('main') || document.body.firstChild).before(root);
}
function setRoute(route) {
  if (!ASH_LIVE_AIA_ROUTES.includes(route)) return;
  state.route = route; state.resting = false;
  try { sessionStorage.setItem(ROUTE_KEY, route); } catch {}
  document.body.dataset.ashAiaRoute = route;
  $$('[data-aia-route]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.aiaRoute === route)));
  if (state.packageView) compileCurrent('ROUTE_CHANGED').catch(hold);
}
function activeTask() {
  if (!caseOpen()) return 'setup';
  if (!documentOpen()) return 'document';
  const order = ['ARRIVAL_UNPERSISTED', 'READINESS_OBSERVED', 'CUSTODY_ROOT_PROVISIONAL', 'CUSTODY_ROOT_VERIFIED'];
  return order.includes(state.packageView?.lifecycle?.state) ? 'custody' : 'work';
}
function workspaceForTask(task = activeTask()) {
  if (task === 'document') return 'draft';
  if (task === 'custody') return state.actionPlan?.workspace || 'map';
  if (task === 'work') return state.actionPlan?.workspace || (state.packageView?.lifecycle?.state === 'REBUILD_ELIGIBLE' ? 'test' : 'map');
  return 'map';
}
function openExactWorkspace(name, focusSelector = null) {
  const open = window.__td613OpenAshWorkspace || window.__td613AshKeep?.openWorkspace;
  if (typeof open !== 'function') return hold(new Error('Exact Ash workspace API is not available yet.'));
  open(name);
  document.querySelector(`#workspace-${name}`)?.scrollIntoView({ block: 'start', behavior: state.reducedMotion ? 'auto' : 'smooth' });
  if (focusSelector) setTimeout(() => $(focusSelector)?.focus(), state.reducedMotion ? 0 : 300);
}
function performTask(task = activeTask()) {
  if (task === 'setup') {
    window.__td613AshAIAIngress?.show?.();
    $('[data-aia-ingress-slot]')?.scrollIntoView({ block: 'center', behavior: state.reducedMotion ? 'auto' : 'smooth' });
  } else if (task === 'document') {
    openExactWorkspace('draft', '#localTextFile');
  } else if (task === 'custody') {
    const control = state.actionPlan?.command_id ? document.getElementById(state.actionPlan.command_id) : null;
    const workspace = control?.closest('.workspace')?.id?.replace('workspace-', '') || workspaceForTask(task);
    openExactWorkspace(workspace);
    control?.scrollIntoView({ block: 'center', behavior: state.reducedMotion ? 'auto' : 'smooth' });
    setTimeout(() => control?.focus(), state.reducedMotion ? 0 : 300);
  } else openExactWorkspace(workspaceForTask(task));
}
function frames() {
  const lifecycle = state.packageView?.lifecycle;
  const next = lifecycle?.next_action?.replaceAll('_', ' ').toLowerCase() || 'wait for Ash';
  return TASKS.map(([id, label, detail], index) => ({ id, label, detail: id === 'custody' && lifecycle ? `Exact state: ${lifecycle.state.replaceAll('_', ' ').toLowerCase()}. Next lawful action: ${next}.` : detail, index }));
}
function renderTutorial() {
  const host = $('[data-aia-stage]'); if (!host || !state.packageView) return;
  const items = frames(); const current = items[Math.max(0, Math.min(state.frame, items.length - 1))];
  host.dataset.playing = String(state.playing && !state.reducedMotion); host.dataset.frame = current.id;
  const complete = id => id === 'setup' ? caseOpen() : id === 'document' ? documentOpen() : false;
  host.innerHTML = `<div class="ash-aia__frame-copy"><span>Lesson ${current.index + 1} of ${items.length}</span><h4>${esc(current.label)}</h4><p>${esc(current.detail)}</p></div><svg viewBox="0 0 720 220" role="img" aria-labelledby="aiaTitle aiaDesc"><title id="aiaTitle">Ash Keep task and custody explanation</title><desc id="aiaDesc">A workspace is chosen, a local document remains on this device, a separate custody reference may be created, and exact Ash workspaces remain available.</desc>${items.map((item, index) => `<g class="aia-step ${complete(item.id) ? 'is-complete' : ''} ${item.id === current.id ? 'is-current' : ''}" transform="translate(${24 + index * 180} 46)"><rect width="142" height="118" rx="18"/><text x="71" y="42" text-anchor="middle">${esc(item.label.toUpperCase())}</text><text x="71" y="72" text-anchor="middle">${index === 1 ? 'bytes stay local' : index === 2 ? 'reference ≠ artifact' : index === 3 ? 'same exact Ash' : 'human gesture'}</text></g>${index < 3 ? `<path class="aia-link ${(index === 0 && caseOpen()) || (index === 1 && documentOpen()) ? 'is-active' : ''}" d="M${166 + index * 180} 105H${204 + index * 180}"/>` : ''}`).join('')}</svg><ol class="ash-aia__static-sequence">${items.map((item, index) => `<li class="${item.id === current.id ? 'current' : ''}"><span>${index + 1}</span><div><strong>${esc(item.label)}</strong><p>${esc(item.detail)}</p></div></li>`).join('')}</ol>`;
}
function card(title, text, cls = '') { return `<article class="ash-aia__five-card ${cls}"><h3>${esc(title)}</h3><p>${esc(text)}</p></article>`; }
function renderFive(p) {
  const c = p.comprehension_contract;
  $('[data-aia-five]').innerHTML = [card('What stayed local', c.what_stayed_local), card('What Ash created', c.what_ash_created), card('What changed', c.what_changed_in_case), card('What stayed unauthorized', c.what_remains_unauthorized, 'nonclaim'), card('What may happen next', c.what_may_happen_next)].join('');
}
function renderWhy(p) {
  const view = p.aia_views[state.route];
  $('[data-aia-why-body]').innerHTML = `<section><h3>Causal trace</h3><ol>${p.world_delta.causal_trace.map(item => `<li>${esc(item)}</li>`).join('')}</ol></section><section><h3>Route order</h3><ol>${view.surface.order.map(item => `<li>${esc(item)}</li>`).join('')}</ol></section><section><h3>Claim ceiling</h3><p>${esc(view.claim_ceiling.allowed_claims.join(' · '))}</p><p>Forbidden: ${esc(view.claim_ceiling.forbidden_claims.join(' · '))}</p></section>`;
}
function renderHolds(p) {
  const host = $('[data-aia-holds]'); const holds = p.hold_scenes || [];
  host.hidden = holds.length === 0;
  host.innerHTML = holds.map(item => `<article><h3>${esc(item.code.replaceAll('_', ' '))}</h3><p>${esc(item.consequence)}</p><p><strong>Recovery:</strong> ${esc(item.recovery)}</p><p>Rest and exit remain available. No blame or increased recovery cost.</p></article>`).join('');
}
function renderExact(p) {
  $('[data-aia-lifecycle]').textContent = json({ lifecycle_receipt: state.lifecycleReceipt, action_plan: state.actionPlan, animation_plan: state.animationPlan });
  $('[data-aia-action-receipt]').textContent = state.latestActionReceipt ? json(state.latestActionReceipt) : 'No explicit action receipt yet.';
  $('[data-aia-render-receipt]').textContent = state.latestRenderReceipt ? json(state.latestRenderReceipt) : 'No render receipt yet.';
  $('[data-aia-package]').textContent = json({ package_id: p.package_id, package_digest: p.package_digest, lifecycle: p.lifecycle, world_delta: p.world_delta, authority: p.authority, closure: p.closure });
}
function renderAction() {
  const task = activeTask(); const primary = $('[data-aia-primary-task]'); const exact = $('[data-aia-open-workspace]');
  if (task === 'setup') {
    $('[data-aia-action-label]').textContent = 'Set up a private workspace';
    $('[data-aia-action-purpose]').textContent = 'Choose a workspace profile, create a new case, run the synthetic tutorial, or open a saved case.';
    $('[data-aia-action-consequence]').textContent = 'Workspace setup changes local case structure only. No artifact enters custody and no transport occurs.';
    primary.textContent = 'Set up workspace'; exact.hidden = true;
  } else if (task === 'document') {
    $('[data-aia-action-label]').textContent = 'Open a local document';
    $('[data-aia-action-purpose]').textContent = 'Open the Draft workspace and choose a local text document or paste a selected excerpt.';
    $('[data-aia-action-consequence]').textContent = 'The selected bytes remain local. Choosing a file does not upload, release, or send it.';
    primary.textContent = 'Open local document'; exact.textContent = 'Open Draft workspace'; exact.hidden = false;
  } else {
    const plan = state.actionPlan;
    $('[data-aia-action-label]').textContent = plan.label;
    $('[data-aia-action-purpose]').textContent = plan.purpose;
    $('[data-aia-action-consequence]').textContent = plan.expected_consequence;
    primary.textContent = task === 'custody' ? 'Continue custody path' : 'Continue exact work';
    exact.textContent = `Open ${workspaceForTask(task)} workspace`; exact.hidden = false;
  }
  primary.onclick = () => performTask(task); exact.onclick = () => performTask(task);
  $$('[data-aia-task]').forEach(button => button.setAttribute('aria-current', button.dataset.aiaTask === task ? 'step' : 'false'));
}
function render() {
  if (!state.packageView || LEGACY) return;
  const p = state.packageView;
  document.body.dataset.ashAiaRoute = state.route; document.body.dataset.ashAiaResting = String(state.resting); document.body.dataset.ashAiaCaseOpen = String(caseOpen());
  $$('[data-aia-route]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.aiaRoute === state.route)));
  $('[data-aia-state]').textContent = `${p.lifecycle.state.replaceAll('_', ' ')} · ${TASKS.find(([id]) => id === activeTask())?.[1]}`;
  $('[data-aia-session]').textContent = caseOpen() ? 'Private case open' : 'No case open';
  $('[data-aia-consequence]').textContent = state.resting ? 'Demand stops. The exact state, return, recovery, and exit remain available.' : (activeTask() === 'setup' ? 'Begin with a private workspace—not a technical threshold.' : activeTask() === 'document' ? 'Bring one local document into view without sending it anywhere.' : p.world_delta.primary_consequence);
  $('[data-aia-live]').textContent = state.resting ? '𝄐 Rest holds the current exact consequence. Nothing advances.' : `${p.lifecycle.state.replaceAll('_', ' ')} · task ${TASKS.findIndex(([id]) => id === activeTask()) + 1} of ${TASKS.length}.`;
  $('[data-aia-rest]').hidden = state.resting; $('[data-aia-return]').hidden = !state.resting;
  renderTutorial(); renderFive(p); renderWhy(p); renderHolds(p); renderExact(p); renderAction();
  window.__td613AshAIAIngress?.refresh?.();
}
async function compileCurrent(trigger = 'STATE_OBSERVED') {
  const token = ++state.refreshToken; const receipt = parseLifecycleReceipt(); if (!receipt) return;
  const lifecycle = receipt.lifecycle; const presentationOnly = ['ROUTE_CHANGED', 'EXPLICIT_REPLAY', 'MOTION_PREFERENCE_CHANGED', 'TASK_CHANGED'].includes(trigger);
  const same = state.lifecycleReceipt?.lifecycle_digest === receipt.lifecycle_digest;
  const frozenClock = receipt.observed_at || new Date().toISOString();
  const seed = receipt.lifecycle_digest || `${lifecycle.state}:${lifecycle.references?.case_map_digest || 'unbound'}`;
  const before = presentationOnly ? lifecycle : state.previousLifecycle;
  const packageView = presentationOnly && same && state.packageView ? state.packageView : await compileAshCustodyPedagogueScene({ lifecycle }, {
    frozenClock, idSeed: `ash-live-aia:${seed}`, cryptoImpl: globalThis.crypto, beforeSnapshot: before ? { lifecycle: before } : null,
    desktopViewport: { width: 1120, height: 760, devicePixelRatio: devicePixelRatio || 1 },
    mobileViewport: { width: 390, height: 844, devicePixelRatio: Math.min(devicePixelRatio || 1, 2) }
  });
  if (token !== state.refreshToken) return;
  state.lifecycleReceipt = receipt; state.packageView = packageView;
  state.actionPlan = compileAshLiveActionPlan(lifecycle, { adultHumanEvidencePresent: false });
  state.animationPlan = deriveAshLiveAnimationPlan(before, lifecycle, state.route, state.reducedMotion);
  state.latestRenderReceipt = await compileAshLiveRenderReceipt({ packageView, route: state.route, animationPlan: state.animationPlan }, { frozenClock, idSeed: `ash-live-aia-render:${seed}:${state.route}`, cryptoImpl: globalThis.crypto });
  if (!verifyAshLivePresentationBoundary(state.latestRenderReceipt).valid) throw new Error('Live AIA render boundary verification failed.');
  remember(state.latestRenderReceipt);
  if (state.pendingAction) {
    clearTimeout(state.pendingTimer); const pending = state.pendingAction; state.pendingAction = null;
    state.latestActionReceipt = await compileAshLiveActionReceipt({ beforeLifecycle: pending.beforeLifecycle, afterLifecycle: lifecycle, actionPlan: pending.actionPlan, gesture: pending.gesture, outcome: 'OBSERVED_AFTER_EXPLICIT_GESTURE' }, { frozenClock, idSeed: `ash-live-aia-action:${pending.idSeed}:${receipt.lifecycle_digest}`, cryptoImpl: globalThis.crypto });
    if (!verifyAshLivePresentationBoundary(state.latestActionReceipt).valid) throw new Error('Live AIA action boundary verification failed.');
    remember(state.latestActionReceipt);
  }
  if (!presentationOnly) state.previousLifecycle = structuredClone(lifecycle);
  render();
}
function confirmAction(target) {
  const plan = state.actionPlan;
  if (!plan || (ALIASES[target.id] || target.id) !== plan.command_id) return Promise.resolve(true);
  const dialog = $('[data-aia-confirm]');
  $('[data-confirm-title]').textContent = plan.label; $('[data-confirm-purpose]').textContent = plan.purpose; $('[data-confirm-consequence]').textContent = plan.expected_consequence;
  $('[data-confirm-nonauthority]').innerHTML = plan.visible_non_authority.map(item => `<li>${esc(item)}</li>`).join('');
  return new Promise(resolve => {
    const close = () => { dialog.removeEventListener('close', close); resolve(dialog.returnValue === 'confirm'); };
    dialog.addEventListener('close', close); dialog.showModal();
  });
}
async function interceptAction(event) {
  if (LEGACY || !['EXPERIENTIAL', 'CUSTODIAL'].includes(state.route) || state.resting) return;
  const target = event.target.closest('button');
  if (!target || !GOVERNED.has(target.id) || state.bypass.has(target)) return;
  if (!state.packageView || (ALIASES[target.id] || target.id) !== state.actionPlan?.command_id) return;
  event.preventDefault(); event.stopImmediatePropagation();
  if (!(await confirmAction(target))) return;
  const beforeLifecycle = structuredClone(state.packageView.lifecycle);
  const idSeed = state.lifecycleReceipt?.lifecycle_digest || `${beforeLifecycle.state}:${Date.now()}`;
  state.pendingAction = { beforeLifecycle, actionPlan: state.actionPlan, gesture: { type: 'button', target_id: target.id, confirmed: true }, idSeed };
  state.pendingTimer = setTimeout(async () => {
    if (!state.pendingAction) return;
    const pending = state.pendingAction; state.pendingAction = null; const receipt = parseLifecycleReceipt(); if (!receipt) return;
    state.latestActionReceipt = await compileAshLiveActionReceipt({ beforeLifecycle: pending.beforeLifecycle, afterLifecycle: receipt.lifecycle, actionPlan: pending.actionPlan, gesture: pending.gesture, outcome: 'HELD_NO_NEW_LIFECYCLE_RECEIPT_WITHIN_WINDOW' }, { frozenClock: new Date().toISOString(), idSeed: `ash-live-aia-held:${pending.idSeed}`, cryptoImpl: globalThis.crypto });
    remember(state.latestActionReceipt); $('[data-aia-live]').textContent = 'Ash published no new lifecycle receipt inside the observation window. No success is inferred.'; renderExact(state.packageView);
  }, 12000);
  state.bypass.add(target); target.click(); queueMicrotask(() => state.bypass.delete(target));
}
function playExplanation() {
  clearTimeout(state.frameTimer); state.frame = 0;
  if (state.reducedMotion) { state.playing = false; renderTutorial(); $('[data-aia-live]').textContent = 'Reduced motion: all four deterministic lesson frames remain visible in order.'; return; }
  state.playing = true;
  const advance = () => {
    renderTutorial(); $('[data-aia-live]').textContent = `Lesson ${state.frame + 1}: ${TASKS[state.frame][1]}. No Ash action is performed.`;
    if (state.frame < TASKS.length - 1) { state.frame += 1; state.frameTimer = setTimeout(advance, 720); }
    else state.frameTimer = setTimeout(() => { state.playing = false; renderTutorial(); }, 720);
  };
  advance();
}
function bind() {
  $$('[data-aia-route]').forEach(button => button.onclick = () => setRoute(button.dataset.aiaRoute));
  $$('[data-aia-task]').forEach(button => button.onclick = () => performTask(button.dataset.aiaTask));
  $('[data-aia-rest]').onclick = () => { state.resting = true; render(); };
  $('[data-aia-return]').onclick = () => { state.resting = false; render(); };
  $('[data-aia-play]').onclick = playExplanation;
  $('[data-aia-previous]').onclick = () => { state.frame = Math.max(0, state.frame - 1); renderTutorial(); };
  $('[data-aia-next]').onclick = () => { state.frame = Math.min(TASKS.length - 1, state.frame + 1); renderTutorial(); };
  document.addEventListener('click', event => interceptAction(event).catch(hold), true);
  window.addEventListener('td613:ash:lifecycle-updated', () => compileCurrent().catch(hold));
  for (const type of ['case-opened', 'case-created', 'profile-demo-hydrated', 'capsule-opened', 'core-ready']) window.addEventListener(`td613:ash:${type}`, () => setTimeout(() => compileCurrent('TASK_CHANGED').catch(hold), 0));
  $('#localTextFile')?.addEventListener('change', () => setTimeout(() => compileCurrent('TASK_CHANGED').catch(hold), 0));
  $('#draftBody')?.addEventListener('input', () => renderAction());
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  motion.addEventListener?.('change', event => { state.reducedMotion = event.matches; compileCurrent('MOTION_PREFERENCE_CHANGED').catch(hold); });
}
function hold(error) {
  console.error('Ash live AIA held:', error);
  if ($('[data-aia-live]')) $('[data-aia-live]').textContent = `Presentation held without Ash mutation: ${error.message}`;
  document.body.dataset.ashAiaHeld = 'true';
}
async function waitForExactAsh() {
  for (let attempt = 0; attempt < 160; attempt += 1) {
    if (parseLifecycleReceipt() && typeof (window.__td613OpenAshWorkspace || window.__td613AshKeep?.openWorkspace) === 'function' && window.__td613AshKeep) return true;
    await delay(50);
  }
  return false;
}
function exposeApi() {
  window.__td613AshLiveAIA = Object.freeze({
    version: 'td613.ash.live-aia-browser/v0.2-task-continuity',
    current: () => ({ route: state.route, lifecycle_state: state.packageView?.lifecycle?.state || null, lifecycle_next_action: state.packageView?.lifecycle?.next_action || null, task: activeTask(), package_digest: state.packageView?.package_digest || null, latest_action_receipt: state.latestActionReceipt?.receipt_id || null, latest_render_receipt: state.latestRenderReceipt?.receipt_id || null, resting: state.resting, child_study_authorized: false, telemetry_present: false, task_continuity_required: true }),
    replay: playExplanation, setRoute, openWorkspace: openExactWorkspace, performTask, refresh: () => compileCurrent('EXPLICIT_REFRESH')
  });
}
async function boot() {
  exposeApi();
  if (LEGACY) { document.documentElement.dataset.ashAiaLegacy = 'true'; return; }
  await ensureStylesheet();
  ensureSurface(); bind(); setRoute(state.route);
  if (!(await waitForExactAsh())) throw new Error('Exact Ash lifecycle or workspace API did not become available.');
  await compileCurrent('BOOT');
  document.documentElement.dataset.ashAiaReady = 'true';
  window.dispatchEvent(new CustomEvent('td613:ash:aia-ready', { detail: window.__td613AshLiveAIA.current() }));
}
boot().catch(hold);
