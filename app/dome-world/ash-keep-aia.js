import { compileAshCustodyPedagogueScene } from '../engine/ash-pedagogue-adapter.js';
import {
  ASH_LIVE_AIA_ROUTES,
  compileAshLiveActionPlan,
  compileAshLiveActionReceipt,
  compileAshLiveRenderReceipt,
  deriveAshLiveAnimationPlan,
  verifyAshLivePresentationBoundary
} from '../engine/ash-live-aia.js';

const ROUTE_KEY = 'td613:ash-keep:aia-route:v0.1';
const RECEIPT_KEY = 'td613:ash-keep:aia-receipts:v0.1';
const GOVERNED_BUTTONS = new Set([
  'compileQuickScan', 'registerCustodyRoot', 'bindCustodyRoot', 'newCase', 'startDemo',
  'runTest', 'loadSeed', 'keepDraft', 'reviewDraft', 'approveRelease', 'makeSave'
]);
const ACTION_ALIASES = Object.freeze({ loadSeed: 'runTest', startDemo: 'newCase' });
const PORTAL_SELECTOR = Object.freeze({
  CLEAR_ASH_THRESHOLD: '#compileQuickScan',
  REGISTER_CUSTODY_ROOT: '#registerCustodyRoot',
  VERIFY_CUSTODY_DIGEST_SPINE: '#registerCustodyRoot',
  CREATE_CASE: '#newCase',
  BIND_CUSTODY_ROOT_TO_CASE: '#bindCustodyRoot',
  RUN_CURRENT_REBUILD_TEST: '#runTest',
  KEEP_CUSTODY_BOUND_DRAFT: '#keepDraft',
  REVIEW_EXACT_DRAFT: '#reviewDraft',
  KEEP_RELEASE_RECEIPT: '#approveRelease',
  SEAL_CONTINUITY: '#makeSave'
});

const state = {
  route: readRoute(), packageView: null, lifecycleReceipt: null, previousLifecycle: null,
  actionPlan: null, animationPlan: null, latestActionReceipt: null, latestRenderReceipt: null,
  pendingAction: null, pendingTimer: 0, resting: false, playing: false, refreshToken: 0,
  reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  bypass: new WeakSet(), portalMoves: []
};

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const safeJson = value => JSON.stringify(value, null, 2);
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);

function readRoute() {
  if (new URLSearchParams(location.search).get('presentation') === 'legacy') return 'IMPLEMENTATION';
  const stored = sessionStorage.getItem(ROUTE_KEY);
  return ASH_LIVE_AIA_ROUTES.includes(stored) ? stored : 'EXPERIENTIAL';
}

function ensureSurface() {
  if (!document.querySelector('link[data-ash-live-aia]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/dome-world/ash-keep-aia.css?v=20260720-ak-aia-1';
    link.dataset.ashLiveAia = 'true';
    document.head.append(link);
  }
  if ($('#ashAiaMembrane')) return;
  const root = document.createElement('section');
  root.id = 'ashAiaMembrane';
  root.className = 'ash-aia';
  root.dataset.ashAia = '';
  root.setAttribute('aria-labelledby', 'ashAiaTitle');
  root.innerHTML = `
    <header class="ash-aia__header">
      <div><p class="ash-aia__eyebrow">U+10D613 · AK-AIA-1 · Child-legible Anisotropic Information Architecture</p>
      <h2 id="ashAiaTitle">Ash tells you what changed before naming the machinery.</h2>
      <p class="ash-aia__posture">Child-legible design · adult human evidence absent · child study locked · no telemetry</p></div>
      <div class="ash-aia__state"><span data-aia-state>Waiting for exact Ash state…</span><span>Human closure open</span></div>
    </header>
    <nav class="ash-aia__routes" aria-label="Ash presentation routes">${ASH_LIVE_AIA_ROUTES.map(route => `<button type="button" data-aia-route="${route}" aria-pressed="false">${route[0] + route.slice(1).toLowerCase()}</button>`).join('')}</nav>
    <div class="ash-aia__progress" data-aia-progress aria-label="Ash lifecycle progress"></div>
    <div class="ash-aia__layout">
      <section class="ash-aia__stage-card"><div class="ash-aia__stage-head"><div><p class="ash-aia__step-label">Now</p><h3 data-aia-consequence>Reading the exact local state…</h3></div><button type="button" data-aia-play>Play explanation</button></div><div class="ash-aia__stage" data-aia-stage></div><p class="ash-aia__live" role="status" aria-live="polite" data-aia-live>Flow-Core is waiting for Ash to answer.</p></section>
      <aside class="ash-aia__next"><p class="ash-aia__step-label">Next lawful action</p><h3 data-aia-action-label>Wait for Ash</h3><p data-aia-action-purpose></p><p class="ash-aia__expected" data-aia-action-consequence></p><div class="ash-aia__portal" data-aia-portal></div><div class="ash-aia__next-controls"><button type="button" data-aia-open-workspace>Open exact workspace</button><button type="button" data-aia-rest>𝄐 Rest</button><button type="button" data-aia-return hidden>Return</button></div></aside>
    </div>
    <section class="ash-aia__five" data-aia-five aria-label="Five-part custody consequence"></section>
    <div class="ash-aia__depths">
      <details data-aia-why><summary>Why did Ash do that?</summary><div data-aia-why-body></div></details>
      <details data-aia-exact><summary>Exact state, receipts, digest, and rule</summary><div class="ash-aia__exact-grid"><section><h3>Lifecycle</h3><pre data-aia-lifecycle></pre></section><section><h3>Latest action receipt</h3><pre data-aia-action-receipt>No action receipt yet.</pre></section><section><h3>Latest render receipt</h3><pre data-aia-render-receipt>No render receipt yet.</pre></section><section><h3>Pedagogue package</h3><pre data-aia-package></pre></section></div></details>
    </div>
    <section class="ash-aia__holds" data-aia-holds hidden></section>
    <dialog class="ash-aia__confirm" data-aia-confirm><form method="dialog"><p class="ash-aia__step-label">Before Ash acts</p><h2 data-confirm-title>Confirm exact action</h2><p data-confirm-purpose></p><div class="ash-aia__confirm-grid"><section><h3>Expected consequence</h3><p data-confirm-consequence></p></section><section><h3>Still unauthorized</h3><ul data-confirm-nonauthority></ul></section></div><p class="ash-aia__confirm-note">The animation explains Ash’s observed answer. It does not perform, predict, or certify that answer.</p><div class="ash-aia__dialog-actions"><button value="cancel">Return</button><button value="confirm" class="primary">Confirm this exact gesture</button></div></form></dialog>`;
  ($('.workspace-rail') || document.querySelector('main')).before(root);
}

function parseLifecycleReceipt() {
  try {
    const value = JSON.parse($('#lifecycleReceipt')?.textContent || 'null');
    return value?.lifecycle?.schema === 'td613.ash.lifecycle/v0.1' ? value : null;
  } catch { return null; }
}

function remember(receipt) {
  if (!receipt) return;
  try {
    const list = JSON.parse(sessionStorage.getItem(RECEIPT_KEY) || '[]');
    list.push(receipt);
    sessionStorage.setItem(RECEIPT_KEY, JSON.stringify(list.slice(-40)));
  } catch { /* visible receipts remain available */ }
}

function restorePortal() {
  for (const move of state.portalMoves.splice(0)) if (move.placeholder.isConnected) move.placeholder.replaceWith(move.node);
  $('[data-aia-portal]')?.replaceChildren();
}

function portalAction(plan) {
  restorePortal();
  if (!['EXPERIENTIAL', 'CUSTODIAL'].includes(state.route) || state.resting) return;
  const selector = PORTAL_SELECTOR[plan.lifecycle_next_action];
  const control = selector ? document.querySelector(selector) : null;
  if (!control) return;
  const node = control.closest('.custody-card, .tool-section, .launch-panel');
  if (!node || node.closest('#ashAiaMembrane')) return;
  if (node.classList.contains('launch-panel')) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'ash-aia__launch-button'; button.textContent = 'Open local case setup';
    button.onclick = () => { $('#launch')?.classList.remove('hidden'); $('#newTitle')?.focus(); };
    $('[data-aia-portal]').append(button); return;
  }
  const placeholder = document.createComment(`ash-aia-portal:${selector}`);
  node.before(placeholder); state.portalMoves.push({ node, placeholder }); $('[data-aia-portal]').append(node);
}

function setRoute(route) {
  if (!ASH_LIVE_AIA_ROUTES.includes(route)) return;
  restorePortal(); state.route = route; state.resting = false;
  sessionStorage.setItem(ROUTE_KEY, route); document.body.dataset.ashAiaRoute = route;
  $$('[data-aia-route]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.aiaRoute === route)));
  if (state.packageView) compileCurrent('ROUTE_CHANGED').catch(hold);
}

const STAGES = Object.freeze([
  ['ARRIVAL_UNPERSISTED', 'Arrive'], ['READINESS_OBSERVED', 'Notice'], ['CUSTODY_ROOT_PROVISIONAL', 'Hold'],
  ['CUSTODY_ROOT_VERIFIED', 'Check'], ['CASE_BOUND', 'Anchor'], ['REBUILD_ELIGIBLE', 'Test'],
  ['RELEASE_ELIGIBLE', 'Review'], ['CONTINUITY_SEALED', 'Rest']
]);

function renderProgress(lifecycle) {
  const rank = Object.fromEntries(STAGES.map(([id], index) => [id, index]));
  const current = rank[lifecycle.state] ?? 0;
  $('[data-aia-progress]').innerHTML = STAGES.map(([id, label], index) => `<div class="ash-aia__progress-step ${index <= current ? 'complete' : ''} ${id === lifecycle.state ? 'current' : ''} ${id === lifecycle.state && lifecycle.holds.length ? 'held' : ''}" aria-current="${id === lifecycle.state ? 'step' : 'false'}"><span>${label}</span><small>${id.replaceAll('_', ' ')}</small></div>`).join('');
}

function renderStage(packageView) {
  const lifecycle = packageView.lifecycle, refs = lifecycle.references || {}, plan = state.animationPlan;
  const caseOpen = Boolean(refs.case_id && refs.case_map_digest), currentWork = Boolean(refs.rebuild_test), release = Boolean(refs.release_receipt), continuity = Boolean(refs.save_point);
  const host = $('[data-aia-stage]'); host.dataset.playing = String(state.playing && !state.reducedMotion);
  host.innerHTML = `<svg viewBox="0 0 800 330" role="img" aria-labelledby="aiaTitle aiaDesc"><title id="aiaTitle">Ash custody lifecycle causal exhibit</title><desc id="aiaDesc">The source stays local. A separate custody reference may be verified, bound to a case, tested, reviewed, and sealed through explicit human actions.</desc><defs><marker id="aiaArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z"/></marker></defs><g class="aia-zone"><rect x="28" y="54" width="190" height="220" rx="24"/><text x="52" y="86">THIS DEVICE</text><g class="aia-source"><rect x="70" y="126" width="106" height="76" rx="12"/><path d="M92 152h62M92 170h46M92 188h55"/><text x="123" y="226" text-anchor="middle">local source</text></g></g><line class="aia-boundary" x1="254" y1="42" x2="254" y2="290"/><text x="268" y="66">RAW BYTES DO NOT CROSS</text><path class="aia-causal-line ${refs.custody_receipt ? 'is-active' : ''}" d="M218 164C294 164 300 116 360 116" marker-end="url(#aiaArrow)"/><g class="aia-reference ${refs.custody_receipt ? 'is-complete' : ''}"><circle cx="404" cy="116" r="42"/><text x="404" y="112" text-anchor="middle">REFERENCE</text><text x="404" y="130" text-anchor="middle">≠ ARTIFACT</text></g><path class="aia-causal-line ${caseOpen ? 'is-active' : ''}" d="M446 136C490 158 492 188 526 196" marker-end="url(#aiaArrow)"/><g class="aia-case ${caseOpen ? 'is-complete' : ''}"><path d="M550 112L686 112L730 162L708 254L578 272L520 214Z"/><circle cx="620" cy="190" r="20" class="aia-root"/><circle cx="574" cy="148" r="11"/><circle cx="682" cy="160" r="11"/><circle cx="674" cy="232" r="11"/><circle cx="564" cy="232" r="11"/><path d="M620 190L574 148M620 190L682 160M620 190L674 232M620 190L564 232"/><text x="620" y="307" text-anchor="middle">CASE MAP ROOT</text></g><g class="aia-gates"><rect x="322" y="238" width="76" height="34" rx="17" class="${caseOpen ? 'is-open' : ''}"/><text x="360" y="260" text-anchor="middle">ROOMS</text><rect x="406" y="238" width="76" height="34" rx="17" class="${currentWork ? 'is-open' : ''}"/><text x="444" y="260" text-anchor="middle">TEST</text><rect x="490" y="286" width="88" height="34" rx="17" class="${release ? 'is-open' : ''}"/><text x="534" y="308" text-anchor="middle">RELEASE</text><rect x="588" y="286" width="104" height="34" rx="17" class="${continuity ? 'is-open' : ''}"/><text x="640" y="308" text-anchor="middle">CONTINUITY</text></g></svg><ol class="ash-aia__static-sequence">${plan.steps.map((item, index) => `<li class="${item.complete ? 'complete' : ''} ${item.current ? 'current' : ''} ${item.held ? 'held' : ''}"><span>${index + 1}</span><div><strong>${escapeHtml(item.label)}</strong><p>${escapeHtml(item.detail)}</p></div></li>`).join('')}</ol>`;
}

function consequenceCard(title, text, className = '') { return `<article class="ash-aia__five-card ${className}"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`; }

function renderFive(packageView) {
  const c = packageView.comprehension_contract;
  $('[data-aia-five]').innerHTML = [
    consequenceCard('What stayed local', c.what_stayed_local), consequenceCard('What Ash created', c.what_ash_created),
    consequenceCard('What changed', c.what_changed_in_case), consequenceCard('What stayed unauthorized', c.what_remains_unauthorized, 'nonclaim'),
    consequenceCard('What may happen next', c.what_may_happen_next)
  ].join('');
}

function renderWhy(packageView) {
  const view = packageView.aia_views[state.route];
  $('[data-aia-why-body]').innerHTML = `<section><h3>Causal trace</h3><ol>${packageView.world_delta.causal_trace.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ol></section><section><h3>Route order</h3><ol>${view.surface.order.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ol></section><section><h3>Contradictions remain visible</h3><ul>${view.invariants.contradictions.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section><section><h3>Claim ceiling</h3><p>${escapeHtml(view.claim_ceiling.allowed_claims.join(' · '))}</p><p class="nonclaim">Forbidden: ${escapeHtml(view.claim_ceiling.forbidden_claims.join(' · '))}</p></section>`;
}

function renderHolds(packageView) {
  const host = $('[data-aia-holds]'), holds = packageView.hold_scenes || [];
  host.hidden = holds.length === 0;
  host.innerHTML = holds.map(item => `<article><h3>${escapeHtml(item.code.replaceAll('_', ' '))}</h3><p>${escapeHtml(item.consequence)}</p><p><strong>Recovery:</strong> ${escapeHtml(item.recovery)}</p><p>Rest and exit remain available. No blame or increased recovery cost.</p></article>`).join('');
}

function renderExact(packageView) {
  $('[data-aia-lifecycle]').textContent = safeJson({ lifecycle_receipt: state.lifecycleReceipt, action_plan: state.actionPlan, animation_plan: state.animationPlan });
  $('[data-aia-action-receipt]').textContent = state.latestActionReceipt ? safeJson(state.latestActionReceipt) : 'No explicit action receipt yet.';
  $('[data-aia-render-receipt]').textContent = state.latestRenderReceipt ? safeJson(state.latestRenderReceipt) : 'No render receipt yet.';
  $('[data-aia-package]').textContent = safeJson({ package_id: packageView.package_id, package_digest: packageView.package_digest, lifecycle: packageView.lifecycle, world_delta: packageView.world_delta, authority: packageView.authority, closure: packageView.closure });
}

function renderAction() {
  const plan = state.actionPlan;
  $('[data-aia-action-label]').textContent = plan.label; $('[data-aia-action-purpose]').textContent = plan.purpose; $('[data-aia-action-consequence]').textContent = plan.expected_consequence;
  const open = $('[data-aia-open-workspace]'); open.textContent = `Open exact ${plan.workspace} workspace`;
  open.onclick = () => { restorePortal(); window.__td613OpenAshWorkspace?.(plan.workspace); setRoute('AUDIT'); document.querySelector(`#workspace-${plan.workspace}`)?.scrollIntoView({ block: 'start' }); };
  portalAction(plan);
}

function render() {
  if (!state.packageView) return;
  const p = state.packageView;
  document.body.dataset.ashAiaRoute = state.route; document.body.dataset.ashAiaResting = String(state.resting);
  $$('[data-aia-route]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.aiaRoute === state.route)));
  $('[data-aia-state]').textContent = p.lifecycle.state.replaceAll('_', ' ');
  $('[data-aia-consequence]').textContent = state.resting ? 'Demand stops. The exact state, return, recovery, and exit remain available.' : p.world_delta.primary_consequence;
  $('[data-aia-live]').textContent = state.resting ? '𝄐 Rest holds the current exact consequence. Nothing advances.' : `${p.lifecycle.state.replaceAll('_', ' ')} · next: ${p.lifecycle.next_action.replaceAll('_', ' ').toLowerCase()}.`;
  $('[data-aia-rest]').hidden = state.resting; $('[data-aia-return]').hidden = !state.resting;
  renderProgress(p.lifecycle); renderStage(p); renderFive(p); renderWhy(p); renderHolds(p); renderExact(p); renderAction();
}

async function compileCurrent(trigger = 'STATE_OBSERVED') {
  const token = ++state.refreshToken, receipt = parseLifecycleReceipt(); if (!receipt) return;
  const lifecycle = receipt.lifecycle, before = state.previousLifecycle, frozenClock = receipt.observed_at || new Date().toISOString();
  const seed = receipt.lifecycle_digest || `${lifecycle.state}:${lifecycle.references?.case_map_digest || 'unbound'}`;
  const packageView = await compileAshCustodyPedagogueScene({ lifecycle }, {
    frozenClock, idSeed: `ash-live-aia:${seed}`, cryptoImpl: globalThis.crypto,
    beforeSnapshot: before ? { lifecycle: before } : null,
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
    remember(state.latestActionReceipt); state.playing = !state.reducedMotion;
  } else if (trigger === 'EXPLICIT_REPLAY') state.playing = !state.reducedMotion;
  if (state.playing) setTimeout(() => { state.playing = false; $('[data-aia-stage]')?.setAttribute('data-playing', 'false'); }, state.animationPlan.duration_ms + 120);
  state.previousLifecycle = structuredClone(lifecycle); render();
}

function confirmAction(target) {
  const plan = state.actionPlan;
  if (!plan || (ACTION_ALIASES[target.id] || target.id) !== plan.command_id) return Promise.resolve(true);
  const dialog = $('[data-aia-confirm]'); $('[data-confirm-title]').textContent = plan.label; $('[data-confirm-purpose]').textContent = plan.purpose; $('[data-confirm-consequence]').textContent = plan.expected_consequence;
  $('[data-confirm-nonauthority]').innerHTML = plan.visible_non_authority.map(item => `<li>${escapeHtml(item)}</li>`).join('');
  return new Promise(resolve => { const close = () => { dialog.removeEventListener('close', close); resolve(dialog.returnValue === 'confirm'); }; dialog.addEventListener('close', close); dialog.showModal(); });
}

async function interceptAction(event) {
  if (!['EXPERIENTIAL', 'CUSTODIAL'].includes(state.route) || state.resting) return;
  const target = event.target.closest('button'); if (!target || !GOVERNED_BUTTONS.has(target.id) || state.bypass.has(target)) return;
  if (!state.packageView || (ACTION_ALIASES[target.id] || target.id) !== state.actionPlan?.command_id) return;
  event.preventDefault(); event.stopImmediatePropagation(); if (!(await confirmAction(target))) return;
  const beforeLifecycle = structuredClone(state.packageView.lifecycle), idSeed = state.lifecycleReceipt?.lifecycle_digest || `${beforeLifecycle.state}:${Date.now()}`;
  state.pendingAction = { beforeLifecycle, actionPlan: state.actionPlan, gesture: { type: 'button', target_id: target.id, confirmed: true }, idSeed };
  state.pendingTimer = setTimeout(async () => {
    if (!state.pendingAction) return; const pending = state.pendingAction; state.pendingAction = null; const receipt = parseLifecycleReceipt(); if (!receipt) return;
    state.latestActionReceipt = await compileAshLiveActionReceipt({ beforeLifecycle: pending.beforeLifecycle, afterLifecycle: receipt.lifecycle, actionPlan: pending.actionPlan, gesture: pending.gesture, outcome: 'HELD_NO_NEW_LIFECYCLE_RECEIPT_WITHIN_WINDOW' }, { frozenClock: new Date().toISOString(), idSeed: `ash-live-aia-held:${pending.idSeed}`, cryptoImpl: globalThis.crypto });
    remember(state.latestActionReceipt); $('[data-aia-live]').textContent = 'Ash did not publish a new lifecycle receipt within the observation window. No success is inferred.'; renderExact(state.packageView);
  }, 12000);
  state.bypass.add(target); target.click(); queueMicrotask(() => state.bypass.delete(target));
}

function bind() {
  $$('[data-aia-route]').forEach(button => button.onclick = () => setRoute(button.dataset.aiaRoute));
  $('[data-aia-rest]').onclick = () => { restorePortal(); state.resting = true; render(); };
  $('[data-aia-return]').onclick = () => { state.resting = false; render(); };
  $('[data-aia-play]').onclick = () => compileCurrent('EXPLICIT_REPLAY').catch(hold);
  document.addEventListener('click', event => interceptAction(event).catch(hold), true);
  window.addEventListener('td613:ash:lifecycle-updated', () => compileCurrent().catch(hold));
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  motion.addEventListener?.('change', event => { state.reducedMotion = event.matches; compileCurrent('MOTION_PREFERENCE_CHANGED').catch(hold); });
}

function hold(error) { console.error('Ash live AIA held:', error); if ($('[data-aia-live]')) $('[data-aia-live]').textContent = `Presentation held without Ash mutation: ${error.message}`; document.body.dataset.ashAiaHeld = 'true'; }
async function waitForLifecycle() { for (let i = 0; i < 80; i += 1) { if (parseLifecycleReceipt()) return true; await new Promise(resolve => setTimeout(resolve, 75)); } return false; }

async function boot() {
  ensureSurface(); bind(); setRoute(state.route); if (!(await waitForLifecycle())) throw new Error('Exact Ash lifecycle did not become available.'); await compileCurrent('BOOT');
  window.__td613AshLiveAIA = Object.freeze({
    version: 'td613.ash.live-aia-browser/v0.1',
    current: () => ({ route: state.route, lifecycle_state: state.packageView?.lifecycle?.state || null, lifecycle_next_action: state.packageView?.lifecycle?.next_action || null, package_digest: state.packageView?.package_digest || null, latest_action_receipt: state.latestActionReceipt?.receipt_id || null, latest_render_receipt: state.latestRenderReceipt?.receipt_id || null, resting: state.resting, child_study_authorized: false, telemetry_present: false }),
    replay: () => compileCurrent('EXPLICIT_REPLAY'), setRoute, refresh: () => compileCurrent('EXPLICIT_REFRESH')
  });
}

boot().catch(hold);
