export const ASH_REVIEWABILITY_REPAIR_VERSION = 'td613.ash.reviewability/v0.1-native-scroll-live-setup-descenders';

const host = globalThis.window;
const doc = globalThis.document;
const POINTER_KEY = 'td613.ash-keep.current-case';
const GESTURE_WINDOW_MS = 2600;

let nativeScrollTo = null;
let viewportOwnedByUser = false;
let gestureDeadline = 0;
let blockedScrolls = 0;
let lastBlockedScroll = null;

const now = () => host?.performance?.now?.() || Date.now();
const byId = id => doc?.getElementById(id);

function installStyles() {
  if (!doc?.head || byId('td613-ash-reviewability-repair-css')) return;
  const style = doc.createElement('style');
  style.id = 'td613-ash-reviewability-repair-css';
  style.textContent = `
    #ashAiaMembrane .ash-aia__body{
      align-items:start!important;
    }
    #ashAiaMembrane .ash-aia__work{
      align-self:start!important;
      height:auto!important;
      min-height:0!important;
      max-height:none!important;
      overflow:visible!important;
    }
    #ashAiaMembrane .ash-aia__work[data-ash-reviewability-posture="SETUP_READY"]{
      padding-bottom:14px!important;
    }
    .ash-reviewability-setup-note{
      margin:2px 0 8px!important;
      padding:10px 11px;
      border:1px solid rgba(118,234,212,.18);
      border-left:2px solid var(--aia-mint,#76ead4);
      background:rgba(118,234,212,.045);
      color:var(--aia-muted,#a8beb5)!important;
      font:600 .68rem/1.5 var(--mono,ui-monospace,monospace);
    }
    #ashAiaTitle,
    #ashDemoPedagogyLedger h3{
      line-height:1.18!important;
      padding-bottom:.16em!important;
      overflow:visible!important;
    }
    #ashAiaMembrane .ash-aia__header,
    #ashDemoPedagogyLedger header{
      overflow:visible!important;
    }
    .ash-flowcore-mounted>.ash-ux-motion-track{
      min-height:60px!important;
      padding-bottom:6px!important;
    }
    .ash-ux-motion-node b{
      display:block!important;
      line-height:1.35!important;
      padding-bottom:.16em!important;
      overflow:visible!important;
    }
  `;
  doc.head.append(style);
}

function caseOpen() {
  try { return Boolean(host?.localStorage?.getItem(POINTER_KEY)); }
  catch { return false; }
}

function scrollTopFromArgs(args) {
  if (!args?.length) return null;
  const first = args[0];
  if (typeof first === 'number') return Number(args[1] ?? 0);
  if (first && typeof first === 'object' && 'top' in first) return Number(first.top);
  return null;
}

function publishScrollReceipt(posture, requestedTop = null) {
  if (!doc?.documentElement) return;
  doc.documentElement.dataset.ashViewportOwner = viewportOwnedByUser ? 'ENTRANT' : 'ASH_GESTURE';
  doc.documentElement.dataset.ashScrollPosture = posture;
  host?.dispatchEvent?.(new CustomEvent('td613:ash:reviewability-scroll', {
    detail:{
      version:ASH_REVIEWABILITY_REPAIR_VERSION,
      posture,
      viewport_owner:viewportOwnedByUser ? 'ENTRANT' : 'ASH_GESTURE',
      requested_top:requestedTop,
      current_top:Math.round(host.scrollY || 0),
      blocked_scrolls:blockedScrolls
    }
  }));
}

function markManualViewportOwnership(reason) {
  viewportOwnedByUser = true;
  gestureDeadline = 0;
  publishScrollReceipt(`USER_${reason}`);
}

function markDeliberateGesture(event) {
  if (event?.isTrusted === false) return;
  const target = event?.target?.closest?.('button,a,input,select,textarea,summary,[role="button"],[tabindex]');
  if (!target) return;
  viewportOwnedByUser = false;
  gestureDeadline = now() + GESTURE_WINDOW_MS;
  publishScrollReceipt('DELIBERATE_GESTURE');
}

function installScrollGuard() {
  if (!host?.scrollTo || host.__td613AshNativeScrollGuard === ASH_REVIEWABILITY_REPAIR_VERSION) return false;
  nativeScrollTo = host.scrollTo.bind(host);
  const guardedScrollTo = (...args) => {
    const requestedTop = scrollTopFromArgs(args);
    const materiallyDifferent = Number.isFinite(requestedTop) && Math.abs(requestedTop - (host.scrollY || 0)) > 12;
    const backgroundRequest = viewportOwnedByUser && now() > gestureDeadline;
    if (materiallyDifferent && backgroundRequest) {
      blockedScrolls += 1;
      lastBlockedScroll = Object.freeze({ requested_top:requestedTop, observed_top:host.scrollY || 0, at:new Date().toISOString() });
      publishScrollReceipt('BACKGROUND_SCROLL_HELD', requestedTop);
      return undefined;
    }
    const result = nativeScrollTo(...args);
    publishScrollReceipt('PROGRAMMATIC_SCROLL_ADMITTED', requestedTop);
    return result;
  };
  try {
    host.scrollTo = guardedScrollTo;
  } catch {
    Object.defineProperty(host, 'scrollTo', { configurable:true, writable:true, value:guardedScrollTo });
  }
  host.__td613AshNativeScrollGuard = ASH_REVIEWABILITY_REPAIR_VERSION;
  host.addEventListener('wheel', () => markManualViewportOwnership('WHEEL'), { passive:true, capture:true });
  host.addEventListener('touchmove', () => markManualViewportOwnership('TOUCH'), { passive:true, capture:true });
  doc.addEventListener('click', markDeliberateGesture, true);
  doc.addEventListener('keydown', event => {
    if (['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)) markManualViewportOwnership('KEYBOARD');
  }, true);
  publishScrollReceipt('GUARD_INSTALLED');
  return true;
}

function setupNote(slot) {
  let note = slot?.querySelector?.('.ash-reviewability-setup-note');
  if (!slot || note) return note;
  note = doc.createElement('p');
  note.className = 'ash-reviewability-setup-note';
  note.textContent = 'Choose a profile in the ingress controls, then deliberately start a demo or create a new local case. This panel mirrors no hidden form.';
  slot.append(note);
  return note;
}

function setText(node, value) {
  if (node && node.textContent !== value) node.textContent = value;
}

function fallbackTask() {
  const observed = host?.__td613AshLiveAIA?.current?.()?.task;
  if (observed && observed !== 'setup') return observed;
  return caseOpen() ? 'document' : 'setup';
}

function openFallbackTask(task) {
  if (task === 'setup' || !caseOpen()) {
    host?.__td613AshAIAIngress?.show?.();
    const launch = byId('launch');
    launch?.classList.remove('hidden');
    host?.requestAnimationFrame?.(() => {
      launch?.scrollIntoView?.({ block:'start', behavior:host.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      byId('newProfile')?.focus?.({ preventScroll:true });
    });
    return true;
  }
  const workspace = task === 'document' ? 'draft'
    : task === 'custody' ? 'map'
      : (doc.documentElement.dataset.ashPremiumWorkspace || 'home');
  const open = host?.__td613AshUiUxRescue?.open
    || host?.__td613AshPremiumUI?.open
    || host?.__td613OpenAshWorkspace
    || host?.__td613AshKeep?.openWorkspace;
  if (typeof open !== 'function') return false;
  open(workspace);
  return true;
}

function panelNodes() {
  const work = doc?.querySelector('#ashAiaMembrane .ash-aia__work');
  return {
    work,
    title:work?.querySelector('[data-aia-action-label]'),
    purpose:work?.querySelector('[data-aia-action-purpose]'),
    expected:work?.querySelector('[data-aia-action-consequence]'),
    slot:work?.querySelector('[data-aia-ingress-slot]'),
    primary:work?.querySelector('[data-aia-primary-task]'),
    exact:work?.querySelector('[data-aia-open-workspace]')
  };
}

function reconcileSetupPanel(reason = 'OBSERVED') {
  const nodes = panelNodes();
  const { work, title, purpose, expected, slot, primary, exact } = nodes;
  if (!work || !title || !purpose || !expected || !primary) return false;
  const open = caseOpen();
  const task = fallbackTask();
  work.dataset.ashReviewabilityPosture = open ? 'CASE_ACTIVE' : 'SETUP_READY';
  work.dataset.ashReviewabilityTask = task;
  work.dataset.ashReviewabilityReason = reason;

  if (!open) {
    setText(title, 'Set up a private workspace');
    setText(purpose, 'Choose a workspace profile, then start a synthetic demo or create a new local case.');
    setText(expected, 'Setup changes local case structure only. No artifact enters custody and no transport occurs.');
    setupNote(slot);
    setText(primary, 'Open workspace setup');
    primary.disabled = false;
    primary.setAttribute('aria-disabled', 'false');
    primary.dataset.ashReviewabilityFallback = 'setup';
    if (exact) {
      exact.hidden = true;
      exact.removeAttribute('data-ash-reviewability-fallback');
    }
    return true;
  }

  slot?.querySelector?.('.ash-reviewability-setup-note')?.remove();
  const staleSetup = /^Set up\b/i.test(title.textContent.trim())
    || /^Set up\b/i.test(primary.textContent.trim())
    || primary.disabled
    || primary.getAttribute('aria-disabled') === 'true';
  if (!staleSetup) {
    primary.removeAttribute('data-ash-reviewability-fallback');
    exact?.removeAttribute('data-ash-reviewability-fallback');
    return true;
  }

  if (task === 'document') {
    setText(title, 'Open a local document');
    setText(purpose, 'Choose a local text document or paste a selected excerpt in the Draft workspace.');
    setText(expected, 'The selected bytes remain local. Opening a document does not upload, release, or send it.');
    setText(primary, 'Open local document');
    primary.dataset.ashReviewabilityFallback = 'document';
    if (exact) {
      setText(exact, 'Open Draft workspace');
      exact.hidden = false;
      exact.disabled = false;
      exact.setAttribute('aria-disabled', 'false');
      exact.dataset.ashReviewabilityFallback = 'document';
    }
  } else {
    setText(title, 'Continue the active private case');
    setText(purpose, 'The case is already open. Continue through the current Ash workspace without reopening setup.');
    setText(expected, 'Navigation changes the visible local workspace only. It performs no custody, transport, release, or closure.');
    setText(primary, 'Open current workspace');
    primary.dataset.ashReviewabilityFallback = task;
    if (exact) exact.hidden = true;
  }
  primary.disabled = false;
  primary.setAttribute('aria-disabled', 'false');
  return true;
}

function textClearance(node) {
  if (!node) return null;
  const style = getComputedStyle(node);
  const fontSize = parseFloat(style.fontSize) || 0;
  const lineHeight = parseFloat(style.lineHeight) || 0;
  return Object.freeze({
    text:node.textContent.trim(),
    font_size:fontSize,
    line_height:lineHeight,
    padding_bottom:parseFloat(style.paddingBottom) || 0,
    client_height:node.clientHeight,
    scroll_height:node.scrollHeight,
    clipped:node.scrollHeight > node.clientHeight + 1
  });
}

function panelUnusedSpace(work) {
  if (!work) return null;
  const rect = work.getBoundingClientRect();
  const visibleChildren = [...work.children].filter(node => {
    const style = getComputedStyle(node);
    const child = node.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && child.height > 0;
  });
  const bottom = visibleChildren.length ? Math.max(...visibleChildren.map(node => node.getBoundingClientRect().bottom)) : rect.top;
  return Math.max(0, Math.round(rect.bottom - bottom));
}

function measure() {
  const { work, title, primary } = panelNodes();
  const aiaTitle = byId('ashAiaTitle');
  const pedagogyTitle = doc?.querySelector('#ashDemoPedagogyLedger h3');
  return Object.freeze({
    version:ASH_REVIEWABILITY_REPAIR_VERSION,
    available:Boolean(work && title && primary),
    viewport_owner:viewportOwnedByUser ? 'ENTRANT' : 'ASH_GESTURE',
    blocked_scrolls:blockedScrolls,
    last_blocked_scroll:lastBlockedScroll,
    case_open:caseOpen(),
    panel_posture:work?.dataset.ashReviewabilityPosture || null,
    panel_task:work?.dataset.ashReviewabilityTask || null,
    panel_title:title?.textContent?.trim() || null,
    panel_button:primary?.textContent?.trim() || null,
    panel_button_actionable:Boolean(primary && !primary.disabled && primary.getAttribute('aria-disabled') !== 'true'),
    panel_unused_space:panelUnusedSpace(work),
    aia_title:textClearance(aiaTitle),
    pedagogy_title:textClearance(pedagogyTitle)
  });
}

function publish(reason = 'INSTALL') {
  installStyles();
  reconcileSetupPanel(reason);
  const receipt = measure();
  if (doc?.documentElement) {
    doc.documentElement.dataset.ashReviewability = receipt.panel_button_actionable
      && receipt.aia_title?.clipped !== true
      ? 'REVIEWABLE'
      : 'HELD';
  }
  host?.dispatchEvent?.(new CustomEvent('td613:ash:reviewability-ready', { detail:{ ...receipt, reason } }));
  return receipt;
}

function installPanelEvents() {
  doc.addEventListener('click', event => {
    const button = event.target?.closest?.('[data-ash-reviewability-fallback]');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openFallbackTask(button.dataset.ashReviewabilityFallback || fallbackTask());
  }, true);
  for (const type of [
    'aia-ready','composition-stable','premium-ready','case-opened','case-created',
    'profile-demo-hydrated','capsule-opened','lifecycle-updated','post-ingress-motion',
    'demo-pedagogy-hydrated','ux-workspace-opened'
  ]) {
    host.addEventListener(`td613:ash:${type}`, () => queueMicrotask(() => publish(type.toUpperCase())));
  }
}

export function installAshReviewabilityRepair() {
  if (!host || !doc?.documentElement || host.__td613AshReviewability) return false;
  installStyles();
  installScrollGuard();
  installPanelEvents();
  host.__td613AshReviewability = Object.freeze({
    version:ASH_REVIEWABILITY_REPAIR_VERSION,
    current:measure,
    refresh:() => publish('EXPLICIT_REFRESH'),
    claimViewport:reason => markManualViewportOwnership(reason || 'EXPLICIT'),
    openTask:openFallbackTask
  });
  queueMicrotask(() => publish('INSTALL'));
  host.setTimeout(() => publish('LATE_COMPOSITION'), 240);
  return true;
}

installAshReviewabilityRepair();
