import fs from 'fs';

const path = 'app/safe-harbor/td613-flight.html';
let html = fs.readFileSync(path, 'utf8');

html = html.replace(/\n?<div class="mobile-swipe-cue"[\s\S]*?<\/div>/g, '');
html = html.replace(/\n?<div class="mobile-swipe-overlay"[\s\S]*?<\/div>/g, '');

const switcherEnd = html.indexOf('</nav>', html.indexOf('mobile-flight-switcher'));
if (switcherEnd !== -1 && !html.includes('mobileSwipeOverlay')) {
  const cue = '\n<div class="mobile-swipe-overlay" id="mobileSwipeOverlay" aria-hidden="true"><span>Swipe left</span><strong>Sealed Output →</strong></div>';
  html = html.slice(0, switcherEnd + '</nav>'.length) + cue + html.slice(switcherEnd + '</nav>'.length);
}

const css = `
/* === TD613 Flight mobile lane access override === */
@media (max-width: 820px) {
  html {
    font-size: 14px !important;
    -webkit-text-size-adjust: 100% !important;
  }
  html, body {
    min-width: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    min-height: 100dvh !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
  }
  body.flight-locked, body {
    touch-action: pan-y !important;
    overscroll-behavior-y: auto !important;
  }
  .page-wrap {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    height: auto !important;
    min-height: 100dvh !important;
    margin: 0 !important;
    padding: .42rem .42rem 2.7rem !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: visible !important;
  }
  header {
    width: 100% !important;
    max-width: 100% !important;
    padding: .58rem .72rem .62rem !important;
    overflow: hidden !important;
  }
  .grid {
    display: flex !important;
    align-items: flex-start !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    height: auto !important;
    min-height: 0 !important;
    overflow: visible !important;
    scroll-snap-type: none !important;
    transform: translate3d(0,0,0) !important;
    transition: transform .28s cubic-bezier(.2,.72,.18,1) !important;
    will-change: transform !important;
  }
  body.flight-output-active .grid { transform: translate3d(-100%,0,0) !important; }
  body.flight-dragging .grid { transition: none !important; }
  .grid > div:first-child,
  .grid > div:last-child {
    flex: 0 0 100% !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    overflow: visible !important;
    padding: .16rem .44rem 3rem .58rem !important;
    scroll-snap-align: none !important;
  }
  body:not(.flight-output-active) .flight-lane-output,
  body.flight-output-active .flight-lane-prompt { pointer-events: none !important; }
  body.flight-output-active .flight-lane-output,
  body:not(.flight-output-active) .flight-lane-prompt { pointer-events: auto !important; }
  .card,
  .output-card,
  .seal-card,
  .dev-drawer {
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    overflow: visible !important;
    transform: none !important;
    contain: none !important;
  }
  .card {
    padding: .72rem .68rem .74rem .94rem !important;
    margin-bottom: .48rem !important;
  }
  .card::before { left: .44rem !important; }
  .section-note,
  .danger-note,
  .row,
  .checkbox-row,
  .radio-row,
  .section-split-row,
  .copy-grid {
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
  }
  .section-split-row { display: block !important; }
  .section-split-row > div { margin-bottom: .45rem !important; }
  textarea,
  input,
  select,
  button { max-width: 100% !important; }
  .mobile-output-cue { display: none !important; }
  .mobile-lane-tab[data-flight-lane-target="output"] {
    border-color: rgba(49,255,138,.90) !important;
    box-shadow: 0 0 44px rgba(49,255,138,.36), 0 0 18px rgba(137,255,240,.18), inset 0 1px 0 rgba(245,255,246,.18) !important;
  }
  body:not(.flight-output-active):not(.flight-mobile-cue-expired) .mobile-lane-tab[data-flight-lane-target="output"] {
    animation: sealedOutputBlinkStrong .82s ease-in-out 5 both !important;
  }
  .mobile-swipe-overlay {
    position: fixed !important;
    inset: 0 !important;
    z-index: 2147483647 !important;
    display: grid !important;
    place-content: center !important;
    gap: .62rem !important;
    text-align: center !important;
    pointer-events: none !important;
    background: radial-gradient(circle at 50% 52%, rgba(49,255,138,.16), rgba(0,0,0,0) 38%) !important;
    color: var(--moss) !important;
    font-family: var(--font-display) !important;
    text-transform: uppercase !important;
    letter-spacing: .12em !important;
    text-shadow: 0 0 28px rgba(49,255,138,.72), 0 0 70px rgba(137,255,240,.28) !important;
    animation: mobileSwipeOverlayExit 4.2s ease forwards !important;
  }
  .mobile-swipe-overlay span {
    font-family: var(--font-mono) !important;
    font-size: clamp(.72rem, 4vw, 1.05rem) !important;
    color: rgba(190,255,223,.80) !important;
  }
  .mobile-swipe-overlay strong {
    font-size: clamp(1.65rem, 11vw, 3.25rem) !important;
    line-height: .95 !important;
    color: var(--moss) !important;
    white-space: nowrap !important;
    animation: mobileSwipeOverlayText 1.05s ease-in-out 4 !important;
  }
  body.flight-output-active .mobile-swipe-overlay,
  body.flight-mobile-cue-expired .mobile-swipe-overlay { display: none !important; }
  .mobile-prompt-rail { margin: .18rem 0 .44rem !important; padding: .28rem .44rem !important; min-height: 1.72rem !important; border-radius: 14px !important; }
  .output { min-height: 4.1rem !important; height: clamp(4.2rem, 14dvh, 5.6rem) !important; max-height: 16dvh !important; overflow-y: auto !important; }
}
@keyframes sealedOutputBlinkStrong { 0%,100% { box-shadow: 0 0 20px rgba(49,255,138,.26), inset 0 1px 0 rgba(245,255,246,.12); filter: brightness(1); } 50% { box-shadow: 0 0 68px rgba(49,255,138,.88), 0 0 30px rgba(137,255,240,.42), inset 0 1px 0 rgba(245,255,246,.28); filter: brightness(1.35); } }
@keyframes mobileSwipeOverlayText { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-18px); } }
@keyframes mobileSwipeOverlayExit { 0%,72% { opacity: 1; visibility: visible; } 100% { opacity: 0; visibility: hidden; } }
`;

if (html.includes('TD613 Flight mobile lane access override')) {
  html = html.replace(/\/\* === TD613 Flight mobile lane access override === \*\/[\s\S]*?(?=\n@media \(prefers-reduced-motion: reduce\)|\n<\/style>)/m, css);
} else {
  html = html.replace('</style>', `${css}\n</style>`);
}

const js = `
<script id="td613-flight-mobile-lane-access-script">
(function () {
  var touchStartX = 0;
  var touchStartY = 0;
  var touchStartTime = 0;
  var dragActive = false;
  var gridTransformWasSet = false;
  function gridWidth() {
    var grid = document.querySelector('.grid');
    return grid ? grid.clientWidth : window.innerWidth;
  }
  function baseOffset() {
    return document.body.classList.contains('flight-output-active') ? -gridWidth() : 0;
  }
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }
  function setLane(target) {
    var output = target === 'output';
    var grid = document.querySelector('.grid');
    if (grid) grid.style.transform = '';
    document.body.classList.remove('flight-dragging');
    document.body.classList.toggle('flight-output-active', output);
    document.querySelectorAll('[data-flight-lane-target]').forEach(function (el) {
      var active = el.getAttribute('data-flight-lane-target') === target;
      el.classList.toggle('is-active', active);
      if (el.classList.contains('mobile-lane-tab')) el.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function expireCue() {
    document.body.classList.add('flight-mobile-cue-expired');
    var overlay = document.getElementById('mobileSwipeOverlay');
    if (overlay) overlay.remove();
  }
  document.addEventListener('DOMContentLoaded', function () {
    var overlay = document.getElementById('mobileSwipeOverlay');
    if (overlay && overlay.parentElement !== document.body) document.body.appendChild(overlay);
    window.setTimeout(expireCue, 4300);
  });
  document.addEventListener('click', function (event) {
    var trigger = event.target.closest('[data-flight-lane-target]');
    if (!trigger) return;
    var target = trigger.getAttribute('data-flight-lane-target');
    if (target === 'prompt' || target === 'output') {
      event.preventDefault();
      expireCue();
      setLane(target);
    }
  });
  document.addEventListener('touchstart', function (event) {
    if (!event.touches || !event.touches[0]) return;
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    touchStartTime = Date.now();
    dragActive = false;
    gridTransformWasSet = false;
  }, { passive: true });
  document.addEventListener('touchmove', function (event) {
    var touch = event.touches && event.touches[0];
    var grid = document.querySelector('.grid');
    if (!touch || !grid) return;
    var dx = touch.clientX - touchStartX;
    var dy = touch.clientY - touchStartY;
    if (Math.abs(dx) < 12 || Math.abs(dx) < Math.abs(dy) * 1.15) return;
    dragActive = true;
    expireCue();
    document.body.classList.add('flight-dragging');
    var width = gridWidth();
    var next = clamp(baseOffset() + dx, -width, 0);
    grid.style.transform = 'translate3d(' + next + 'px,0,0)';
    gridTransformWasSet = true;
    if (event.cancelable) event.preventDefault();
  }, { passive: false });
  document.addEventListener('touchend', function (event) {
    var touch = event.changedTouches && event.changedTouches[0];
    var grid = document.querySelector('.grid');
    if (!touch || !grid) return;
    var dx = touch.clientX - touchStartX;
    var dy = touch.clientY - touchStartY;
    var fastEnough = Date.now() - touchStartTime < 950;
    document.body.classList.remove('flight-dragging');
    if (gridTransformWasSet) grid.style.transform = '';
    if (!dragActive && (!fastEnough || Math.abs(dx) < 54 || Math.abs(dx) < Math.abs(dy) * 1.35)) return;
    if (dx < -44) setLane('output');
    else if (dx > 44) setLane('prompt');
  }, { passive: true });
  window.TD613FlightSetLane = setLane;
})();
</script>`;

if (html.includes('td613-flight-mobile-lane-access-script')) {
  html = html.replace(/<script id="td613-flight-mobile-lane-access-script">[\s\S]*?<\/script>/, js.trim());
} else {
  html = html.replace('</body>', `${js}\n</body>`);
}

if (html.includes('Loading TD613 Flight') || html.includes('td613-flight-legacy.html') || html.includes('<iframe')) throw new Error('wrapper regression detected');
if (!html.includes('mobileSwipeOverlay')) throw new Error('swipe overlay missing');
if (html.includes('mobile-swipe-cue')) throw new Error('capsule cue must not remain');
if (html.includes('Swipe right')) throw new Error('wrong swipe direction remains');
if (!html.includes('Swipe left')) throw new Error('swipe-left overlay text missing');
if (!html.includes('TD613FlightSetLane')) throw new Error('lane switch handler missing');
if (!html.includes('touchstart') || !html.includes('touchmove') || !html.includes('touchend')) throw new Error('touch swipe drag handler missing');
if (!html.includes('translate3d(')) throw new Error('gallery drag transform missing');
if (!html.includes('flight-dragging')) throw new Error('gallery dragging state missing');
if (!html.includes('appendChild(overlay)')) throw new Error('overlay must be lifted to body');
if (!html.includes('font-size: 14px !important')) throw new Error('mobile typography scale missing');
if (!html.includes('-webkit-text-size-adjust: 100% !important')) throw new Error('mobile text-size adjustment guard missing');
if (!html.includes('min-width: 0 !important')) throw new Error('desktop min-width override missing');
if (!html.includes('body.flight-output-active .grid')) throw new Error('sliding lane CSS missing');
if (!html.includes('pointer-events: none !important')) throw new Error('overlay must be non-interactive');
if (!html.includes('mobileSwipeOverlayExit')) throw new Error('finite overlay exit animation missing');
if (!html.includes('sealedOutputBlinkStrong .82s ease-in-out 5')) throw new Error('finite bright output blink missing');

fs.writeFileSync(path, html);
console.log('patched TD613 Flight mobile lane access');
