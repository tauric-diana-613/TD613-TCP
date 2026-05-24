import fs from 'fs';

const path = 'app/safe-harbor/td613-flight.html';
let html = fs.readFileSync(path, 'utf8');

const marker = 'PR82_SENTINEL TD613 Flight unsticky page and textarea zoom repair';
html = html.replace(/\n\/\* PR82_SENTINEL TD613 Flight unsticky page and textarea zoom repair \*\/[\s\S]*?(?=\n<\/style>)/m, '');
html = html.replace(/\n?<script id="td613-flight-pr78-absolute-mobile-lane-script">[\s\S]*?<\/script>/g, '');
html = html.replace(/\n?<script id="td613-flight-pr80-mobile-header-collapse-script">[\s\S]*?<\/script>/g, '');
html = html.replace(/\n?<script id="td613-flight-pr80-swipe-cue-script">[\s\S]*?<\/script>/g, '');
html = html.replace(/\n?<script id="td613-flight-pr81-gesture-repair-script">[\s\S]*?<\/script>/g, '');
html = html.replace(/\n?<script id="td613-flight-pr82-unsticky-zoom-script">[\s\S]*?<\/script>/g, '');

const viewport = '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />';
if (html.includes('<meta name="viewport"')) html = html.replace(/<meta name="viewport"[^>]*>/i, viewport);
else html = html.replace('<head>', `<head>\n${viewport}`);

const css = `
/* PR82_SENTINEL TD613 Flight unsticky page and textarea zoom repair */
@media (max-width: 820px) {
  html,
  body {
    height: auto !important;
    max-height: none !important;
    min-height: 100dvh !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    -webkit-text-size-adjust: 100% !important;
    text-size-adjust: 100% !important;
    overscroll-behavior-y: auto !important;
    touch-action: pan-y !important;
  }

  html body .page-wrap {
    display: block !important;
    width: 100vw !important;
    max-width: 100vw !important;
    min-width: 0 !important;
    height: auto !important;
    min-height: 100dvh !important;
    max-height: none !important;
    overflow: visible !important;
    padding: .42rem !important;
  }

  html body .page-wrap header,
  html body .mobile-flight-switcher {
    position: relative !important;
    top: auto !important;
    inset: auto !important;
    z-index: auto !important;
    transform: none !important;
    transition: none !important;
    opacity: 1 !important;
    pointer-events: auto !important;
  }

  html body .page-wrap header {
    display: grid !important;
    grid-template-areas: "title" "nav" "text" "tags" "howto" !important;
    grid-template-columns: minmax(0, 1fr) !important;
    gap: 8px !important;
    padding: 14px 14px 12px !important;
    margin-bottom: 10px !important;
    overflow: hidden !important;
    max-height: none !important;
    height: auto !important;
  }

  html body .mobile-flight-switcher {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: .28rem !important;
    margin: 0 0 8px !important;
    overflow: visible !important;
  }

  html body .mobile-flight-switcher::after { content: none !important; }

  html body .grid,
  html[data-flight-mobile-lane="output"] body .grid,
  html[data-flight-mobile-lane="prompt"] body .grid,
  html body.flight-output-active .grid {
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

  html body .grid > .flight-lane,
  html[data-flight-mobile-lane="output"] body .grid > .flight-lane,
  html[data-flight-mobile-lane="prompt"] body .grid > .flight-lane,
  html body.flight-output-active .grid > .flight-lane {
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

  html body .grid > .flight-lane-prompt { transform: translate3d(0, 0, 0) !important; }
  html body .grid > .flight-lane-output { transform: translate3d(100%, 0, 0) !important; }
  html[data-flight-mobile-lane="output"] body .grid > .flight-lane-prompt,
  html body.flight-output-active .grid > .flight-lane-prompt { transform: translate3d(-100%, 0, 0) !important; }
  html[data-flight-mobile-lane="output"] body .grid > .flight-lane-output,
  html body.flight-output-active .grid > .flight-lane-output { transform: translate3d(0, 0, 0) !important; }
  html body.flight-dragging .grid > .flight-lane { transition: none !important; }

  html body .grid > :not(.flight-lane-prompt):not(.flight-lane-output) { display: none !important; }

  html body .flight-lane .checkbox-row,
  html body .flight-lane .radio-row,
  html body .flight-lane .copy-grid,
  html body .flight-lane .seal-lozenge-row,
  html body .flight-lane .row {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: wrap !important;
    align-items: flex-start !important;
    align-content: flex-start !important;
    justify-content: flex-start !important;
    gap: 4px 5px !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
    grid-template-columns: none !important;
  }

  html body .flight-lane .checkbox-row > label,
  html body .flight-lane .radio-row > label,
  html body .flight-lane .copy-chip,
  html body .flight-lane .row > .btn,
  html body .flight-lane .row > button,
  html body .flight-lane button.btn,
  html body .flight-lane button.primary,
  html body .flight-lane button.secondary,
  html body .flight-lane button.ghost {
    display: inline-flex !important;
    flex: 0 1 auto !important;
    align-items: center !important;
    justify-content: flex-start !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: 100% !important;
    min-height: 18px !important;
    max-height: none !important;
    padding: 3px 7px !important;
    border-radius: 999px !important;
    font-size: 7px !important;
    line-height: 1.06 !important;
    letter-spacing: .025em !important;
    white-space: normal !important;
    overflow: hidden !important;
    overflow-wrap: anywhere !important;
    text-align: left !important;
  }

  html body .flight-lane .danger-note {
    font-size: 5px !important;
    line-height: 1.15 !important;
    letter-spacing: .03em !important;
    padding: 5px 7px !important;
    min-height: 0 !important;
    border-radius: 8px !important;
  }

  html body .flight-lane textarea,
  html body .flight-lane .output,
  html body .flight-lane #taskText,
  html body .flight-lane .code-output,
  html body .flight-lane .json-output {
    font-size: 16px !important;
    line-height: 1.2 !important;
    width: 177.7778% !important;
    max-width: 177.7778% !important;
    min-width: 177.7778% !important;
    transform: scale(.5625) !important;
    transform-origin: top left !important;
    -webkit-overflow-scrolling: touch !important;
    overflow-y: auto !important;
    overscroll-behavior: contain !important;
    touch-action: pan-y !important;
    resize: vertical !important;
  }

  html body .flight-lane #taskText,
  html body .flight-lane .output {
    min-height: 132px !important;
    height: 132px !important;
    max-height: 180px !important;
    margin-right: -77.7778% !important;
    margin-bottom: -56px !important;
    padding: 14px 16px !important;
  }

  html body .flight-lane input[type="text"],
  html body .flight-lane input[type="number"],
  html body .flight-lane input[type="date"],
  html body .flight-lane select {
    font-size: 16px !important;
    line-height: 1.12 !important;
  }

  html body .output-auth-toggle,
  html body .payload-stepper,
  html body .payload-stepper-label,
  html body .payload-stepper-value,
  html body .payload-stepper-btn {
    font-size: 7px !important;
    line-height: 1.05 !important;
    letter-spacing: .08em !important;
  }

  html body .payload-stepper {
    padding: 3px 7px !important;
    gap: 5px !important;
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
<script id="td613-flight-pr82-unsticky-zoom-script">
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

if (!html.includes(marker)) throw new Error('PR82 CSS missing');
if (!html.includes('maximum-scale=1, user-scalable=no')) throw new Error('PR82 viewport zoom guard missing');
if (!html.includes('td613-flight-pr82-unsticky-zoom-script')) throw new Error('PR82 script missing');
if (!html.includes('height: auto !important')) throw new Error('PR82 unsticky page height missing');
if (!html.includes('font-size: 16px !important')) throw new Error('PR82 textarea 16px anti-zoom base missing');
if (!html.includes('transform: scale(.5625) !important')) throw new Error('PR82 visual small textarea scale missing');
if (!html.includes('syncGridHeight')) throw new Error('PR82 active lane height sync missing');
if (!html.includes("cue.textContent = '← ← SWIPE'")) throw new Error('PR82 centered one-shot swipe cue missing');
if (html.includes('SWIPE → →')) throw new Error('reverse swipe cue remained');
if (html.includes('td613-flight-pr81-gesture-repair-script')) throw new Error('PR81 script remained');
if (html.includes('td613-flight-pr78-absolute-mobile-lane-script')) throw new Error('PR78 script remained');

fs.writeFileSync(path, html);
console.log('patched TD613 Flight PR82 unsticky page, no textarea click-zoom, and unified swipe');
