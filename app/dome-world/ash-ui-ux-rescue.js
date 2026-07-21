export const ASH_UI_UX_RESCUE_VERSION = 'td613.ash.ui-ux-rescue/v0.2-stable-navigation-motion-ready-frames';

const host = globalThis.window;
const doc = globalThis.document;
const REDUCED = () => host?.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
const DESTINATION_SELECTOR = '[data-premium-workspace],[data-route-workspace],[data-command-workspace]';
let releaseTimer = 0;
let releaseFrame = 0;
let animationTimer = 0;
let animationToken = 0;

const byId = id => doc?.getElementById(id);

function visibleHeight(selector) {
  const node = doc.querySelector(selector);
  if (!node) return 0;
  const style = getComputedStyle(node);
  const rect = node.getBoundingClientRect();
  return style.display === 'none' || style.visibility === 'hidden' ? 0 : Math.max(0, rect.height);
}

function stickyOffset() {
  return visibleHeight('.mast') + visibleHeight('.premium-context-bar') + visibleHeight('body > .workspace-rail') + 14;
}

function scrollToWorkspace(name) {
  const panel = byId(`workspace-${name}`);
  if (!panel) return false;
  const top = Math.max(0, panel.getBoundingClientRect().top + host.scrollY - stickyOffset());
  host.scrollTo({ top, behavior: REDUCED() ? 'auto' : 'smooth' });
  panel.setAttribute('tabindex', '-1');
  panel.focus({ preventScroll: true });
  doc.documentElement.dataset.ashUxScrollTarget = name;
  return true;
}

function openWorkspace(name) {
  const open = host.__td613OpenAshWorkspace || host.__td613AshKeep?.openWorkspace;
  if (typeof open !== 'function') return false;
  open(name);
  doc.querySelectorAll('[data-premium-workspace]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.premiumWorkspace === name));
  });
  doc.documentElement.dataset.ashPremiumWorkspace = name;
  byId('premiumCommandSheet')?.close?.();
  if (['home', 'work', 'choir', 'capsule'].includes(name)) host.__td613AshPremiumUI?.refresh?.();
  host.requestAnimationFrame(() => host.requestAnimationFrame(() => scrollToWorkspace(name)));
  host.dispatchEvent(new CustomEvent('td613:ash:ux-workspace-opened', { detail: { workspace: name } }));
  return true;
}

function installNavigationRepair() {
  doc.addEventListener('click', event => {
    const destination = event.target?.closest?.(DESTINATION_SELECTOR);
    const home = event.target?.closest?.('#premiumReturnHome');
    const capsule = event.target?.closest?.('#premiumContinuityButton');
    const name = destination?.dataset?.premiumWorkspace
      || destination?.dataset?.routeWorkspace
      || destination?.dataset?.commandWorkspace
      || (home ? 'home' : capsule ? 'capsule' : null);
    if (!name) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openWorkspace(name);
  }, true);
}

function ensureMotionStyles() {
  if (byId('td613-ash-ux-motion-css')) return;
  const style = doc.createElement('style');
  style.id = 'td613-ash-ux-motion-css';
  style.textContent = `
    .ash-ux-motion-track{position:absolute;left:16px;right:16px;bottom:14px;z-index:5;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;pointer-events:none}
    .ash-ux-motion-track::before{content:"";position:absolute;left:7%;right:7%;top:13px;height:2px;background:rgba(118,234,212,.18)}
    .ash-ux-motion-node{position:relative;display:grid;justify-items:center;gap:5px;color:var(--aia-muted,#a8beb5);font:700 .54rem/1.2 var(--mono,ui-monospace,monospace);text-transform:uppercase;text-align:center}
    .ash-ux-motion-node i{position:relative;z-index:2;width:27px;height:27px;border:1px solid rgba(118,234,212,.28);border-radius:50%;background:#020806;box-shadow:0 0 0 0 rgba(118,234,212,0)}
    .ash-ux-motion-node[data-active="true"]{color:var(--aia-paper,#fff8da)}
    .ash-ux-motion-node[data-active="true"] i{border-color:var(--aia-gold,#e4c66c);background:rgba(228,198,108,.13);animation:ash-ux-node-pulse 620ms ease both}
    .ash-ux-motion-node[data-complete="true"] i{border-color:var(--aia-mint,#76ead4);background:rgba(118,234,212,.11)}
    .ash-ux-motion-cursor{position:absolute;z-index:4;top:8px;left:7%;width:11px;height:11px;border-radius:50%;background:var(--aia-gold,#e4c66c);box-shadow:0 0 18px rgba(228,198,108,.85);transform:translateX(-50%);transition:left 560ms cubic-bezier(.2,.8,.2,1)}
    .ash-ux-motion-track[data-step="1"] .ash-ux-motion-cursor{left:35.5%}
    .ash-ux-motion-track[data-step="2"] .ash-ux-motion-cursor{left:64.5%}
    .ash-ux-motion-track[data-step="3"] .ash-ux-motion-cursor{left:93%}
    @keyframes ash-ux-node-pulse{0%{transform:scale(.72);box-shadow:0 0 0 0 rgba(228,198,108,.45)}60%{transform:scale(1.14);box-shadow:0 0 0 12px rgba(228,198,108,0)}100%{transform:scale(1)}}
    @media(prefers-reduced-motion:reduce){.ash-ux-motion-cursor{display:none}.ash-ux-motion-node i{animation:none!important}.ash-ux-motion-track{position:relative;left:auto;right:auto;bottom:auto;margin:10px 12px 12px}.ash-ux-motion-node i{background:rgba(118,234,212,.11);border-color:var(--aia-mint,#76ead4)}}
  `;
  doc.head.append(style);
}

function ensureMotionTrack() {
  const stage = doc.querySelector('#ashAiaMembrane [data-aia-stage], .ash-aia__stage');
  if (!stage) return null;
  let track = stage.querySelector('.ash-ux-motion-track');
  if (track) return track;
  track = doc.createElement('div');
  track.className = 'ash-ux-motion-track';
  track.dataset.step = '0';
  track.setAttribute('aria-hidden', 'true');
  track.innerHTML = '<span class="ash-ux-motion-cursor"></span>'
    + ['Set up', 'Open local', 'Keep + check', 'Exact work'].map((label, index) => `<span class="ash-ux-motion-node" data-index="${index}" data-active="${index === 0}" data-complete="false"><i></i><b>${label}</b></span>`).join('');
  stage.append(track);
  return track;
}

function paintMotionStep(track, step) {
  track.dataset.step = String(step);
  track.querySelectorAll('.ash-ux-motion-node').forEach((node, index) => {
    node.dataset.active = String(index === step);
    node.dataset.complete = String(index < step);
  });
  doc.documentElement.dataset.ashExplanationFrame = String(step + 1);
}

function startVisibleExplanation() {
  clearTimeout(animationTimer);
  const token = ++animationToken;
  const track = ensureMotionTrack();
  if (!track) return false;
  if (REDUCED()) {
    track.dataset.step = '3';
    track.querySelectorAll('.ash-ux-motion-node').forEach(node => {
      node.dataset.active = 'false';
      node.dataset.complete = 'true';
    });
    doc.documentElement.dataset.ashExplanationMotion = 'STATIC_COMPLETE';
    return true;
  }
  doc.documentElement.dataset.ashExplanationMotion = 'PLAYING';
  let step = 0;
  const advance = () => {
    if (token !== animationToken) return;
    paintMotionStep(track, step);
    if (step < 3) {
      step += 1;
      animationTimer = host.setTimeout(advance, 680);
    } else {
      animationTimer = host.setTimeout(() => {
        if (token !== animationToken) return;
        doc.documentElement.dataset.ashExplanationMotion = 'COMPLETE';
      }, 680);
    }
  };
  advance();
  return true;
}

function installExplanationRepair() {
  doc.addEventListener('click', event => {
    if (!event.target?.closest?.('[data-aia-play]')) return;
    host.requestAnimationFrame(startVisibleExplanation);
  }, true);
  const observer = new MutationObserver(() => ensureMotionTrack());
  observer.observe(doc.body, { childList: true, subtree: true });
  ensureMotionTrack();
}

function compositionReady() {
  return doc.documentElement.dataset.ashAia3Ready === 'true'
    && doc.documentElement.dataset.ashMembraneReady === 'true'
    && Boolean(host.__td613AshLiveAIA)
    && Boolean(host.__td613AshPremiumUI)
    && doc.documentElement.dataset.ashPremiumReady === 'true';
}

function releaseCompositionVeil(reason = 'READY') {
  if (doc.documentElement.dataset.ashCompositionStable) return;
  clearTimeout(releaseTimer);
  if (releaseFrame) host.cancelAnimationFrame(releaseFrame);
  delete doc.documentElement.dataset.ashCompositionHydrating;
  doc.documentElement.dataset.ashCompositionStable = ASH_UI_UX_RESCUE_VERSION;
  doc.documentElement.dataset.ashCompositionRelease = reason;
  byId('td613AshCompositionVeil')?.remove();
  host.dispatchEvent(new CustomEvent('td613:ash:composition-stable', { detail: { reason, version: ASH_UI_UX_RESCUE_VERSION } }));
}

function installCompositionRelease() {
  let consecutiveReadyFrames = 0;
  const checkFrame = () => {
    if (doc.documentElement.dataset.ashCompositionStable) return;
    consecutiveReadyFrames = compositionReady() ? consecutiveReadyFrames + 1 : 0;
    if (consecutiveReadyFrames >= 2) {
      releaseCompositionVeil('READY_TWO_CONSECUTIVE_FRAMES');
      return;
    }
    releaseFrame = host.requestAnimationFrame(checkFrame);
  };
  releaseTimer = host.setTimeout(() => releaseCompositionVeil('TIMEOUT_FAIL_OPEN'), 9000);
  releaseFrame = host.requestAnimationFrame(checkFrame);
}

export function installAshUiUxRescue() {
  if (!host || !doc?.body || host.__td613AshUiUxRescue) return false;
  ensureMotionStyles();
  installNavigationRepair();
  installExplanationRepair();
  installCompositionRelease();
  host.__td613AshUiUxRescue = Object.freeze({
    version: ASH_UI_UX_RESCUE_VERSION,
    open: openWorkspace,
    scrollTo: scrollToWorkspace,
    play: startVisibleExplanation,
    current: () => Object.freeze({
      workspace: doc.documentElement.dataset.ashPremiumWorkspace || null,
      scroll_target: doc.documentElement.dataset.ashUxScrollTarget || null,
      explanation_motion: doc.documentElement.dataset.ashExplanationMotion || null,
      composition_release: doc.documentElement.dataset.ashCompositionRelease || null
    })
  });
  doc.documentElement.dataset.ashUiUxRescue = ASH_UI_UX_RESCUE_VERSION;
  return true;
}

if (host && doc) installAshUiUxRescue();
