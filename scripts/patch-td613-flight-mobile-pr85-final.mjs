import fs from 'fs';

const path = 'app/safe-harbor/td613-flight.html';
let html = fs.readFileSync(path, 'utf8');

const marker = 'PR85_FINAL_SENTINEL TD613 Flight mobile repair';

const viewport = '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />';
const viewportMeta = /\n?<meta\b(?=[^>]*\bname=["']viewport["'])[^>]*>/gi;
html = html.replace(viewportMeta, '');
html = html.replace(/<head>/i, `<head>\n${viewport}`);

const cssMarkers = [
  'PR80_SENTINEL TD613 Flight PR80 mobile chrome restoration',
  'PR81_SENTINEL TD613 Flight mobile zoom and gesture repair',
  'PR82_SENTINEL TD613 Flight unsticky page and textarea zoom repair',
  'PR83_SENTINEL TD613 Flight compact chips and mobile field scale repair',
  'PR84_FINAL_CHIP_REPAIR',
  marker
];
for (const cssMarker of cssMarkers) {
  const escaped = cssMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  html = html.replace(new RegExp('\\n?\\/\\* ' + escaped + ' \\*\\/[\\s\\S]*?(?=\\n<\\/style>|\\n\\/\\*)', 'g'), '');
}

const oldScriptIds = [
  'td613-flight-pr78-absolute-mobile-lane-script',
  'td613-flight-pr80-mobile-header-collapse-script',
  'td613-flight-pr80-swipe-cue-script',
  'td613-flight-pr81-gesture-repair-script',
  'td613-flight-pr82-unsticky-zoom-script',
  'td613-flight-pr84-clean-script',
  'td613-flight-pr85-final-script'
];
for (const id of oldScriptIds) {
  html = html.replace(new RegExp('\\n?<script id="' + id + '">[\\s\\S]*?<\\/script>', 'g'), '');
}

const css = `

/* PR88_SENTINEL TD613 Flight focus stability micro patch */
@media (hover: none), (pointer: coarse), (max-width: 820px) {
  .flight-lane textarea,
  .flight-lane #taskText,
  .flight-lane #outputText {
    width: 100% !important;
    max-width: 100% !important;
    min-height: 74px !important;
    height: 86px !important;
    max-height: 150px !important;
    margin: 0 !important;
    font-size: 9px !important;
    line-height: 1.18 !important;
    transform: none !important;
    -webkit-transform: none !important;
    transform-origin: initial !important;
    -webkit-transform-origin: initial !important;
    -webkit-text-size-adjust: 100% !important;
    text-size-adjust: 100% !important;
  }

  .flight-lane textarea:focus,
  .flight-lane #taskText:focus,
  .flight-lane #outputText:focus {
    font-size: 9px !important;
    transform: none !important;
    -webkit-transform: none !important;
  }

  .payload-stepper {
    flex: 0 0 auto !important;
    min-height: 24px !important;
    height: 24px !important;
    padding: 2px 5px !important;
    gap: 5px !important;
    transform: none !important;
    -webkit-transform: none !important;
  }

  .payload-stepper-label {
    font-size: 6px !important;
    line-height: 1 !important;
    letter-spacing: .08em !important;
  }

  .payload-stepper-value {
    font-size: 8px !important;
    line-height: 1 !important;
    min-width: .85rem !important;
  }

  .payload-stepper-btn {
    width: 18px !important;
    min-width: 18px !important;
    height: 18px !important;
    min-height: 18px !important;
    padding: 0 !important;
    font-size: 10px !important;
    line-height: 1 !important;
  }
}



/* PR85_FINAL_SENTINEL TD613 Flight mobile repair */
@media (max-width: 820px) {
  html,
  body {
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    min-height: 100dvh !important;
    max-height: none !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    -webkit-text-size-adjust: 100% !important;
    text-size-adjust: 100% !important;
    touch-action: pan-y !important;
  }

  body { touch-action: pan-y !important; }

  .page-wrap {
    display: block !important;
    width: 100vw !important;
    max-width: 100vw !important;
    height: auto !important;
    min-height: 100dvh !important;
    max-height: none !important;
    overflow: visible !important;
    padding: .42rem !important;
  }

  header,
  .mobile-flight-switcher {
    position: relative !important;
    top: auto !important;
    inset: auto !important;
    z-index: auto !important;
    transform: none !important;
    transition: none !important;
  }

  header {
    display: grid !important;
    grid-template-areas: "title" "nav" "text" "tags" "howto" !important;
    grid-template-columns: minmax(0, 1fr) !important;
    gap: 8px !important;
    padding: 14px 14px 12px !important;
    margin-bottom: 10px !important;
    height: auto !important;
    max-height: none !important;
    overflow: hidden !important;
  }

  header h1 {
    grid-area: title !important;
    font-size: clamp(26px, 7.2vw, 38px) !important;
    line-height: .98 !important;
    margin: 0 !important;
  }

  header h1::after {
    content: "SAFE HARBOR ISSUE" !important;
    display: block !important;
    font-size: 8px !important;
    line-height: 1.25 !important;
    letter-spacing: .18em !important;
    margin-top: 6px !important;
  }

  header .flight-quick-nav {
    grid-area: nav !important;
    position: static !important;
    display: flex !important;
    flex-wrap: nowrap !important;
    justify-content: flex-end !important;
    align-items: center !important;
    gap: 5px !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
    margin: -2px 0 0 auto !important;
    padding: 0 !important;
  }

  header .flight-quick-nav > a,
  header .flight-quick-nav > button {
    flex: 0 0 auto !important;
    width: auto !important;
    min-height: 18px !important;
    height: 18px !important;
    padding: 3px 8px !important;
    font-size: 7px !important;
    line-height: 1 !important;
    white-space: nowrap !important;
  }

  header .flight-quick-nav > .flight-nav-signout,
  header .flight-quick-nav > button.flight-nav-signout {
    height: auto !important;
    min-height: 0 !important;
    padding: 2px !important;
    border: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
    font-size: 6px !important;
  }

  header .subtitle {
    grid-area: text !important;
    padding-top: 0 !important;
    padding-left: 12px !important;
    font-size: 10px !important;
    line-height: 1.25 !important;
  }

  header .pill-row {
    grid-area: tags !important;
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 3px 8px !important;
    overflow: visible !important;
    padding: 0 0 3px !important;
  }

  header .pill-row > *,
  header .pill-row .pill {
    width: auto !important;
    min-width: 0 !important;
    min-height: 0 !important;
    padding: 0 8px 0 0 !important;
    border: 0 !important;
    border-right: 1px solid rgba(137,255,240,.25) !important;
    border-radius: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
    font-size: 6px !important;
    line-height: 1.1 !important;
    white-space: nowrap !important;
  }

  header details.howto { grid-area: howto !important; }

  .mobile-flight-switcher {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: .28rem !important;
    margin: 0 0 8px !important;
    overflow: visible !important;
  }

  .mobile-flight-switcher::after { content: none !important; }

  .mobile-lane-tab {
    min-width: 0 !important;
    min-height: 24px !important;
    padding: 3px 8px !important;
    font-size: 8px !important;
  }
  .mobile-lane-tab span { font-size: 8px !important; }
  .mobile-lane-tab small { font-size: 5px !important; }

  .grid {
    position: relative !important;
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    min-height: 0 !important;
    overflow: hidden !important;
    transform: none !important;
    transition: height .18s ease !important;
    touch-action: pan-y !important;
  }

  .grid > .flight-lane {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: auto !important;
    bottom: auto !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    padding: .14rem .46rem 4.2rem !important;
    box-sizing: border-box !important;
    overflow: visible !important;
    -webkit-overflow-scrolling: auto !important;
    transition: transform .34s cubic-bezier(.18,.82,.16,1) !important;
    will-change: transform !important;
  }

  .grid > .flight-lane-prompt { transform: translate3d(0, 0, 0) !important; }
  .grid > .flight-lane-output { transform: translate3d(100%, 0, 0) !important; }
  html[data-flight-mobile-lane="output"] .grid > .flight-lane-prompt,
  body.flight-output-active .grid > .flight-lane-prompt { transform: translate3d(-100%, 0, 0) !important; }
  html[data-flight-mobile-lane="output"] .grid > .flight-lane-output,
  body.flight-output-active .grid > .flight-lane-output { transform: translate3d(0, 0, 0) !important; }
  body.flight-dragging .grid > .flight-lane { transition: none !important; }
  .grid > :not(.flight-lane-prompt):not(.flight-lane-output) { display: none !important; }

  .card,
  .dev-drawer,
  .output-card,
  .seal-card,
  .copy-bin-card {
    overflow: hidden !important;
    padding: 10px 10px 11px 16px !important;
    margin-bottom: 9px !important;
    border-radius: 16px !important;
  }

  .card h2,
  .output-card h2,
  .seal-card h2,
  .dev-drawer h2 {
    font-size: 17px !important;
    line-height: 1.05 !important;
    letter-spacing: .12em !important;
  }

  .flight-lane p,
  .flight-lane .muted,
  .flight-lane .help,
  .flight-lane .note,
  .flight-lane .warning,
  .section-note {
    font-size: 11px !important;
    line-height: 1.24 !important;
  }

  .flight-lane .checkbox-row,
  .flight-lane .radio-row,
  .flight-lane .copy-grid,
  .flight-lane .row,
  .flight-lane .seal-lozenge-row {
    display: flex !important;
    flex-flow: row wrap !important;
    align-items: flex-start !important;
    align-content: flex-start !important;
    justify-content: flex-start !important;
    gap: 4px 5px !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
    grid-template-columns: none !important;
  }

  .flight-lane .checkbox-row > label,
  .flight-lane .radio-row > label,
  .flight-lane .copy-chip,
  .flight-lane .row > button,
  .flight-lane .row > .btn,
  .flight-lane button.btn,
  .flight-lane button.primary,
  .flight-lane button.secondary,
  .flight-lane button.ghost {
    display: inline-flex !important;
    flex: 0 1 auto !important;
    align-items: center !important;
    justify-content: flex-start !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: calc(100% - 8px) !important;
    min-height: 15px !important;
    height: auto !important;
    max-height: none !important;
    padding: 2px 6px !important;
    border-radius: 999px !important;
    font-size: 6px !important;
    line-height: 1.08 !important;
    white-space: normal !important;
    overflow: visible !important;
    overflow-wrap: anywhere !important;
    text-overflow: clip !important;
    text-align: left !important;
  }

  .flight-lane input[type="checkbox"],
  .flight-lane input[type="radio"] {
    flex: 0 0 8px !important;
    width: 8px !important;
    min-width: 8px !important;
    height: 8px !important;
    margin: 0 4px 0 0 !important;
  }

  .flight-lane label input[type="text"],
  .flight-lane label input[type="number"],
  .flight-lane label input[type="date"] {
    width: clamp(4rem, 16vw, 6.2rem) !important;
    min-width: 0 !important;
    max-width: clamp(4rem, 16vw, 6.2rem) !important;
    height: 14px !important;
    min-height: 14px !important;
    padding: 1px 5px !important;
    font-size: 7px !important;
    line-height: 1 !important;
  }

  .flight-lane textarea,
  .flight-lane .output,
  .flight-lane #taskText,
  .flight-lane .code-output,
  .flight-lane .json-output {
    display: block !important;
    box-sizing: border-box !important;
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    min-height: 74px !important;
    height: 86px !important;
    max-height: 150px !important;
    margin: 0 !important;
    padding: 8px 9px !important;
    font-size: 9px !important;
    line-height: 1.18 !important;
    letter-spacing: .004em !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    overscroll-behavior: contain !important;
    touch-action: pan-y !important;
    resize: vertical !important;
    -webkit-overflow-scrolling: touch !important;
  }

  .flight-lane .dev-drawer textarea,
  .flight-lane .dev-drawer .code-output,
  .flight-lane .dev-drawer .json-output {
    min-height: 54px !important;
    height: 62px !important;
    max-height: 112px !important;
    font-size: 8px !important;
    line-height: 1.12 !important;
  }

  .flight-lane input[type="text"],
  .flight-lane input[type="number"],
  .flight-lane input[type="date"],
  .flight-lane select {
    box-sizing: border-box !important;
    width: clamp(8rem, 42vw, 18rem) !important;
    min-width: 0 !important;
    max-width: clamp(8rem, 42vw, 18rem) !important;
    height: 18px !important;
    min-height: 18px !important;
    padding: 3px 6px !important;
    font-size: 9px !important;
    line-height: 1.05 !important;
  }

  .flight-lane .danger-note {
    font-size: 5px !important;
    line-height: 1.15 !important;
    padding: 5px 7px !important;
    min-height: 0 !important;
  }

  .output-auth-toggle,
  .payload-stepper,
  .payload-stepper-label,
  .payload-stepper-value,
  .payload-stepper-btn {
    font-size: 7px !important;
    line-height: 1.05 !important;
    letter-spacing: .08em !important;
  }

  .td613-swipe-intro {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    color: rgba(49,255,138,.92);
    font-size: clamp(24px, 10vw, 48px);
    line-height: 1;
    letter-spacing: .16em;
    text-shadow: 0 0 10px rgba(49,255,138,.72), 0 0 26px rgba(49,255,138,.35);
    animation: td613SwipeIntro 2.35s ease-out forwards;
  }

  @keyframes td613SwipeIntro {
    0% { opacity: 0; transform: translateX(18px); }
    12% { opacity: 1; transform: translateX(0); }
    28% { opacity: .28; transform: translateX(-14px); }
    44% { opacity: 1; transform: translateX(0); }
    60% { opacity: .28; transform: translateX(-14px); }
    76% { opacity: 1; transform: translateX(0); }
    100% { opacity: 0; transform: translateX(-28px); }
  }
}
`;

const js = `
<script id="td613-flight-pr85-final-script">
(function () {
  function mobile() { return window.matchMedia && window.matchMedia('(max-width: 820px)').matches; }
  function q(sel) { return document.querySelector(sel); }
  function laneName() { return document.documentElement.dataset.flightMobileLane === 'output' ? 'output' : 'prompt'; }
  function activeLane() { return q(laneName() === 'output' ? '.flight-lane-output' : '.flight-lane-prompt'); }
  function gridWidth() { var grid = q('.grid'); return grid ? grid.clientWidth : window.innerWidth; }

  function syncTabs(target) {
    target = target === 'output' ? 'output' : 'prompt';
    document.documentElement.dataset.flightMobileLane = target;
    document.body.classList.toggle('flight-output-active', target === 'output');
    document.querySelectorAll('[data-flight-lane-target]').forEach(function (el) {
      var on = el.getAttribute('data-flight-lane-target') === target;
      el.classList.toggle('is-active', on);
      if (el.classList.contains('mobile-lane-tab')) el.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }

  function syncGridHeight() {
    if (!mobile()) return;
    var grid = q('.grid');
    var lane = activeLane();
    if (!grid || !lane) return;
    var height = Math.max(lane.scrollHeight, lane.offsetHeight, window.innerHeight * 0.55);
    grid.style.setProperty('height', Math.ceil(height) + 'px', 'important');
  }

  function clearTransforms() {
    var p = q('.flight-lane-prompt');
    var o = q('.flight-lane-output');
    if (p) p.style.removeProperty('transform');
    if (o) o.style.removeProperty('transform');
  }

  function setTransforms(promptX, outputX) {
    var p = q('.flight-lane-prompt');
    var o = q('.flight-lane-output');
    if (p) p.style.setProperty('transform', 'translate3d(' + promptX + 'px,0,0)', 'important');
    if (o) o.style.setProperty('transform', 'translate3d(' + outputX + 'px,0,0)', 'important');
  }

  function setLane(target, dx) {
    target = target === 'output' ? 'output' : 'prompt';
    document.body.classList.remove('flight-dragging');
    if (Number.isFinite(dx)) {
      var w = gridWidth();
      var baseP = laneName() === 'output' ? -w : 0;
      var baseO = laneName() === 'output' ? 0 : w;
      setTransforms(baseP + dx, baseO + dx);
      requestAnimationFrame(function () {
        syncTabs(target);
        clearTransforms();
        syncGridHeight();
      });
    } else {
      syncTabs(target);
      clearTransforms();
      syncGridHeight();
    }
  }

  function textScrollTarget(target) {
    return target && target.closest && target.closest('textarea, .output, #taskText, .code-output, .json-output');
  }

  function blocksSwipe(target) {
    return Boolean(target && target.closest && target.closest('textarea, input[type="text"], input[type="number"], input[type="date"], select, [contenteditable="true"]'));
  }


  function showIntro() {
    if (!mobile() || document.querySelector('.td613-swipe-intro')) return;
    var cue = document.createElement('div');
    cue.className = 'td613-swipe-intro';
    cue.textContent = '← ← SWIPE';
    document.body.appendChild(cue);
    window.setTimeout(function () { cue.remove(); }, 2450);
  }

  var swipe = { tracking: false, active: false, sx: 0, sy: 0 };
  var text = { el: null, sx: 0, sy: 0, top: 0 };

  function init() {
    syncTabs(laneName());
    clearTransforms();
    syncGridHeight();
    showIntro();
    var observer = new MutationObserver(syncGridHeight);
    var grid = q('.grid');
    if (grid) observer.observe(grid, { childList: true, subtree: true, attributes: true, characterData: true });
    document.addEventListener('input', syncGridHeight, true);
    window.addEventListener('resize', syncGridHeight, { passive: true });
    window.addEventListener('orientationchange', syncGridHeight, { passive: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();



  document.addEventListener('click', function (event) {
    var trigger = event.target && event.target.closest && event.target.closest('[data-flight-lane-target]');
    if (!trigger) return;
    var target = trigger.getAttribute('data-flight-lane-target');
    if (target !== 'prompt' && target !== 'output') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    setLane(target);
  }, true);

  document.addEventListener('touchstart', function (event) {
    if (!mobile() || !event.touches || event.touches.length !== 1) return;
    var t = event.touches[0];
    var scrollEl = textScrollTarget(event.target);
    if (scrollEl) {
      text.el = scrollEl;
      text.sx = t.clientX;
      text.sy = t.clientY;
      text.top = scrollEl.scrollTop || 0;
      swipe.tracking = false;
      return;
    }
    if (blocksSwipe(event.target)) return;
    swipe.tracking = true;
    swipe.active = false;
    swipe.sx = t.clientX;
    swipe.sy = t.clientY;
  }, { capture: true, passive: true });

  document.addEventListener('touchmove', function (event) {
    if (!mobile()) return;
    var touch = event.touches && event.touches[0];
    if (!touch) return;

    if (text.el) {
      var tx = touch.clientX - text.sx;
      var ty = touch.clientY - text.sy;
      if (Math.abs(ty) > 4 && Math.abs(ty) >= Math.abs(tx)) {
        text.el.scrollTop = text.top - ty;
        if (event.cancelable) event.preventDefault();
        event.stopImmediatePropagation();
      }
      return;
    }

    if (!swipe.tracking) return;
    var dx = touch.clientX - swipe.sx;
    var dy = touch.clientY - swipe.sy;
    if (Math.abs(dx) < 12 || Math.abs(dx) < Math.abs(dy) * 1.08) return;
    swipe.active = true;
    if (event.cancelable) event.preventDefault();
    event.stopImmediatePropagation();
    document.body.classList.add('flight-dragging');
    var w = gridWidth();
    dx = Math.max(-w, Math.min(w, dx));
    var baseP = laneName() === 'output' ? -w : 0;
    var baseO = laneName() === 'output' ? 0 : w;
    setTransforms(baseP + dx, baseO + dx);
  }, { capture: true, passive: false });

  document.addEventListener('touchend', function (event) {
    if (!mobile()) return;
    if (text.el) {
      text.el = null;
      return;
    }
    if (!swipe.tracking) return;
    var touch = event.changedTouches && event.changedTouches[0];
    document.body.classList.remove('flight-dragging');
    swipe.tracking = false;
    if (!touch) return;
    var dx = touch.clientX - swipe.sx;
    var dy = touch.clientY - swipe.sy;
    if (!swipe.active || Math.abs(dx) < 44 || Math.abs(dx) < Math.abs(dy) * 1.15) {
      swipe.active = false;
      setLane(laneName(), dx);
      return;
    }
    event.stopImmediatePropagation();
    setLane(dx < 0 ? 'output' : 'prompt', dx);
    swipe.active = false;
  }, { capture: true, passive: true });

  window.TD613FlightSetLane = setLane;
  window.snapFlightLane = setLane;
  window.syncMobileFlightLane = function () { setLane(laneName()); };
})();
</script>`;

html = html.replace('</style>', `${css}\n</style>`);
html = html.replace('</body>', `${js}\n</body>`);

if (!html.includes(marker)) throw new Error('PR85 CSS missing');
if (!html.includes('td613-flight-pr85-final-script')) throw new Error('PR85 script missing');
if (html.includes('td613-flight-pr78-absolute-mobile-lane-script')) throw new Error('old PR78 script remained');
if (html.includes('td613-flight-pr82-unsticky-zoom-script')) throw new Error('old PR82 script remained');
if (!html.includes("cue.textContent = '← ← SWIPE'")) throw new Error('PR85 swipe cue missing');
if (!html.includes('prepNoZoom')) throw new Error('PR85 no-zoom focus guard missing');
if (!html.includes('font-size: 9px !important')) throw new Error('PR85 compact textarea size missing');

fs.writeFileSync(path, html);
console.log('patched TD613 Flight PR85 final mobile repair');
