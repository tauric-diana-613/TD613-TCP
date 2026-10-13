import fs from 'fs';

const path = 'app/safe-harbor/td613-flight.html';
let html = fs.readFileSync(path, 'utf8');

const marker = 'PR81_SENTINEL TD613 Flight mobile zoom and gesture repair';
html = html.replace(/\n\/\* PR81_SENTINEL TD613 Flight mobile zoom and gesture repair \*\/[\s\S]*?(?=\n<\/style>)/m, '');
html = html.replace(/\n?<script id="td613-flight-pr81-gesture-repair-script">[\s\S]*?<\/script>/g, '');

const viewport = '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />';
if (html.includes('<meta name="viewport"')) {
  html = html.replace(/<meta name="viewport"[^>]*>/i, viewport);
} else {
  html = html.replace('<head>', `<head>\n${viewport}`);
}

const css = `
/* PR81_SENTINEL TD613 Flight mobile zoom and gesture repair */
@media (max-width: 820px) {
  html,
  body {
    -webkit-text-size-adjust: 100% !important;
    text-size-adjust: 100% !important;
    touch-action: pan-y !important;
  }

  html body .mobile-flight-switcher {
    position: relative !important;
    top: auto !important;
  }

  html body .mobile-flight-switcher::after {
    content: none !important;
  }

  html body .flight-lane-prompt .checkbox-row > label,
  html body .flight-lane-prompt .radio-row > label {
    flex: 0 1 auto !important;
    width: auto !important;
    max-width: 100% !important;
  }

  html body .flight-lane .checkbox-row,
  html body .flight-lane .radio-row,
  html body .flight-lane .copy-grid,
  html body .flight-lane .seal-lozenge-row,
  html body .flight-lane .row {
    align-content: flex-start !important;
    justify-content: flex-start !important;
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
    -webkit-overflow-scrolling: touch !important;
    overflow-y: auto !important;
    overscroll-behavior: contain !important;
    touch-action: pan-y !important;
    resize: vertical !important;
  }

  html body .flight-lane textarea,
  html body .flight-lane .output,
  html body .flight-lane #taskText {
    font-size: 9px !important;
    line-height: 1.18 !important;
  }

  html body .flight-lane input[type="text"],
  html body .flight-lane input[type="number"],
  html body .flight-lane input[type="date"],
  html body .flight-lane select {
    font-size: 9px !important;
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
}

@media (max-width: 820px) {
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
<script id="td613-flight-pr81-gesture-repair-script">
(function () {
  function mobile() { return window.matchMedia && window.matchMedia('(max-width: 820px)').matches; }
  function currentLane() { return document.documentElement.dataset.flightMobileLane === 'output' ? 'output' : 'prompt'; }
  function q(sel) { return document.querySelector(sel); }
  function width() { var g = q('.grid'); return g ? g.clientWidth : window.innerWidth; }
  function setTransforms(promptX, outputX) {
    var p = q('.flight-lane-prompt');
    var o = q('.flight-lane-output');
    if (p) p.style.setProperty('transform', 'translate3d(' + promptX + 'px,0,0)', 'important');
    if (o) o.style.setProperty('transform', 'translate3d(' + outputX + 'px,0,0)', 'important');
  }
  function setLane(target, dx) {
    target = target === 'output' ? 'output' : 'prompt';
    document.body.classList.remove('flight-dragging');
    if (typeof window.TD613FlightSetLane === 'function') {
      window.TD613FlightSetLane(target, Number.isFinite(dx) ? dx : undefined);
      return;
    }
    document.documentElement.dataset.flightMobileLane = target;
    document.body.classList.toggle('flight-output-active', target === 'output');
    var p = q('.flight-lane-prompt');
    var o = q('.flight-lane-output');
    if (p) p.style.removeProperty('transform');
    if (o) o.style.removeProperty('transform');
  }
  function blocksLaneDrag(target) {
    return Boolean(target && target.closest && target.closest('textarea, input[type="text"], input[type="number"], input[type="date"], select, [contenteditable="true"]'));
  }
  function textareaTarget(target) {
    return target && target.closest && target.closest('textarea, .output, #taskText, .code-output, .json-output');
  }

  var swipe = { tracking: false, active: false, sx: 0, sy: 0 };
  var textScroll = { el: null, sx: 0, sy: 0, top: 0 };

  function showIntro() {
    if (!mobile() || document.querySelector('.td613-swipe-intro')) return;
    var cue = document.createElement('div');
    cue.className = 'td613-swipe-intro';
    cue.textContent = '← ← SWIPE';
    document.body.appendChild(cue);
    window.setTimeout(function () { cue.remove(); }, 2450);
  }

  document.addEventListener('DOMContentLoaded', showIntro, { once: true });
  if (document.readyState !== 'loading') showIntro();

  document.addEventListener('touchstart', function (event) {
    if (!mobile() || !event.touches || event.touches.length !== 1) return;
    var t = event.touches[0];
    var scrollEl = textareaTarget(event.target);
    if (scrollEl) {
      textScroll.el = scrollEl;
      textScroll.sx = t.clientX;
      textScroll.sy = t.clientY;
      textScroll.top = scrollEl.scrollTop || 0;
      swipe.tracking = false;
      return;
    }
    if (blocksLaneDrag(event.target)) return;
    swipe.tracking = true;
    swipe.active = false;
    swipe.sx = t.clientX;
    swipe.sy = t.clientY;
  }, { capture: true, passive: true });

  document.addEventListener('touchmove', function (event) {
    if (!mobile()) return;
    var touch = event.touches && event.touches[0];
    if (!touch) return;

    if (textScroll.el) {
      var tx = touch.clientX - textScroll.sx;
      var ty = touch.clientY - textScroll.sy;
      if (Math.abs(ty) > 4 && Math.abs(ty) >= Math.abs(tx)) {
        textScroll.el.scrollTop = textScroll.top - ty;
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
    var w = width();
    dx = Math.max(-w, Math.min(w, dx));
    var baseP = currentLane() === 'output' ? -w : 0;
    var baseO = currentLane() === 'output' ? 0 : w;
    setTransforms(baseP + dx, baseO + dx);
  }, { capture: true, passive: false });

  document.addEventListener('touchend', function (event) {
    if (!mobile()) return;
    if (textScroll.el) {
      textScroll.el = null;
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
      return;
    }
    event.stopImmediatePropagation();
    setLane(dx < 0 ? 'output' : 'prompt', dx);
    swipe.active = false;
  }, { capture: true, passive: true });
})();
</script>`;

html = html.replace('</style>', `${css}\n</style>`);
html = html.replace('</body>', `${js}\n</body>`);

if (!html.includes(marker)) throw new Error('PR81 CSS missing');
if (!html.includes('maximum-scale=1, user-scalable=no')) throw new Error('PR81 viewport zoom guard missing');
if (!html.includes('td613-flight-pr81-gesture-repair-script')) throw new Error('PR81 gesture script missing');
if (!html.includes("cue.textContent = '← ← SWIPE'")) throw new Error('PR81 centered one-shot swipe cue missing');
if (html.includes('SWIPE → →')) throw new Error('reverse swipe cue remained');
if (!html.includes('textScroll.el.scrollTop = textScroll.top - ty')) throw new Error('textarea drag scroll missing');
if (!html.includes('font-size: 5px !important')) throw new Error('danger note shrink missing');

fs.writeFileSync(path, html);
console.log('patched TD613 Flight PR81 mobile zoom, textarea scroll, and chip-swipe repair');
