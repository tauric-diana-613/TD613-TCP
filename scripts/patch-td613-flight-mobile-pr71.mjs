import fs from 'fs';

const path = 'app/safe-harbor/td613-flight.html';
let html = fs.readFileSync(path, 'utf8');

html = html.replace(/<div class="mobile-swipe-overlay"[\s\S]*?<\/div>/g, '<div class="mobile-swipe-overlay" id="mobileSwipeOverlay" aria-hidden="true"><strong>⟵⟵ swipe</strong></div>');

const css = `
/* === TD613 Flight PR71 mobile polish === */
@media (max-width: 820px) {
  .grid {
    --flight-lane-x: 0px;
    transform: translate3d(var(--flight-lane-x), 0, 0) !important;
    transition: transform .34s cubic-bezier(.16,.84,.21,1) !important;
  }
  body.flight-output-active .grid { --flight-lane-x: -100%; }
  body.flight-dragging .grid { transition: none !important; }
  .mobile-swipe-overlay {
    z-index: 2147483647 !important;
    display: grid !important;
    place-content: center !important;
    pointer-events: none !important;
    background: radial-gradient(circle at 50% 50%, rgba(125,255,225,.14), rgba(0,0,0,0) 42%) !important;
    mix-blend-mode: screen !important;
    animation: mobileSwipeOverlayExit 3.8s ease forwards !important;
  }
  .mobile-swipe-overlay span { display: none !important; }
  .mobile-swipe-overlay strong {
    font-family: Orbitron, Eurostile, Audiowide, 'Share Tech Mono', 'IBM Plex Mono', var(--font-mono), monospace !important;
    font-size: clamp(1.65rem, 12vw, 3.45rem) !important;
    line-height: .86 !important;
    color: rgba(184,255,229,.96) !important;
    letter-spacing: .18em !important;
    text-transform: uppercase !important;
    white-space: nowrap !important;
    text-shadow: 0 0 18px rgba(49,255,138,.88), 0 0 52px rgba(118,255,235,.45), 0 0 104px rgba(49,255,138,.26) !important;
    animation: pr71SwipeTextDrift .95s ease-in-out 4 !important;
  }
  textarea,
  input,
  select,
  .output,
  #taskText {
    font-size: 14px !important;
    line-height: 1.28 !important;
  }
  textarea,
  input,
  select {
    touch-action: manipulation !important;
  }
}
@keyframes pr71SwipeTextDrift { 0%,100% { transform: translateX(0) skewX(-2deg); } 50% { transform: translateX(-22px) skewX(-7deg); } }
`;

if (!html.includes('TD613 Flight PR71 mobile polish')) {
  html = html.replace('</style>', `${css}\n</style>`);
}

const js = `
<script id="td613-flight-pr71-mobile-polish-script">
(function () {
  var startX = 0;
  var startY = 0;
  var startTime = 0;
  var active = false;
  var ignored = false;
  function interactive(target) {
    return Boolean(target && target.closest && target.closest('textarea, input, select, button, label, [contenteditable="true"], .output, #taskText, .output-card, .copy-grid, .payload-stepper'));
  }
  function width() {
    var grid = document.querySelector('.grid');
    return grid ? grid.clientWidth : window.innerWidth;
  }
  function base() {
    return document.body.classList.contains('flight-output-active') ? -width() : 0;
  }
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }
  function expireCue() {
    document.body.classList.add('flight-mobile-cue-expired');
    var overlay = document.getElementById('mobileSwipeOverlay');
    if (overlay) overlay.remove();
  }
  function setLane(target) {
    var output = target === 'output';
    var grid = document.querySelector('.grid');
    if (grid) grid.style.removeProperty('--flight-lane-x');
    document.body.classList.remove('flight-dragging');
    document.body.classList.toggle('flight-output-active', output);
    document.querySelectorAll('[data-flight-lane-target]').forEach(function (el) {
      var isActive = el.getAttribute('data-flight-lane-target') === target;
      el.classList.toggle('is-active', isActive);
      if (el.classList.contains('mobile-lane-tab')) el.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }
  document.addEventListener('DOMContentLoaded', function () {
    var overlay = document.getElementById('mobileSwipeOverlay');
    if (overlay && overlay.parentElement !== document.body) document.body.appendChild(overlay);
    window.setTimeout(expireCue, 3900);
  });
  document.addEventListener('click', function (event) {
    var trigger = event.target.closest('[data-flight-lane-target]');
    if (!trigger) return;
    var target = trigger.getAttribute('data-flight-lane-target');
    if (target !== 'prompt' && target !== 'output') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    expireCue();
    setLane(target);
  }, true);
  document.addEventListener('touchstart', function (event) {
    ignored = interactive(event.target);
    if (ignored) return;
    if (!event.touches || !event.touches[0]) return;
    event.stopImmediatePropagation();
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
    startTime = Date.now();
    active = false;
  }, true);
  document.addEventListener('touchmove', function (event) {
    if (ignored) return;
    var touch = event.touches && event.touches[0];
    var grid = document.querySelector('.grid');
    if (!touch || !grid) return;
    var dx = touch.clientX - startX;
    var dy = touch.clientY - startY;
    if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy) * 1.12) return;
    event.stopImmediatePropagation();
    if (event.cancelable) event.preventDefault();
    active = true;
    expireCue();
    document.body.classList.add('flight-dragging');
    var w = width();
    var next = clamp(base() + dx, -w, 0);
    grid.style.setProperty('--flight-lane-x', next + 'px');
  }, { capture: true, passive: false });
  document.addEventListener('touchend', function (event) {
    if (ignored) { ignored = false; return; }
    var touch = event.changedTouches && event.changedTouches[0];
    var grid = document.querySelector('.grid');
    if (!touch || !grid) return;
    event.stopImmediatePropagation();
    var dx = touch.clientX - startX;
    var dy = touch.clientY - startY;
    var quick = Date.now() - startTime < 950;
    document.body.classList.remove('flight-dragging');
    grid.style.removeProperty('--flight-lane-x');
    if (!active && (!quick || Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.3)) return;
    if (dx < -42) setLane('output');
    else if (dx > 42) setLane('prompt');
  }, true);
  window.TD613FlightSetLane = setLane;
})();
</script>`;

html = html.replace(/<script id="td613-flight-pr71-mobile-polish-script">[\s\S]*?<\/script>/g, '');
html = html.replace('</body>', `${js}\n</body>`);

if (!html.includes('⟵⟵ swipe')) throw new Error('PR71 overlay text missing');
if (!html.includes('Orbitron, Eurostile, Audiowide')) throw new Error('PR71 alien font stack missing');
if (!html.includes('--flight-lane-x')) throw new Error('PR71 live drag CSS variable missing');
if (!html.includes('grid.style.setProperty(\'--flight-lane-x\'')) throw new Error('PR71 live drag setter missing');
if (html.includes('grid.scrollIntoView')) throw new Error('auto-scroll must not remain');
if (!html.includes('event.stopImmediatePropagation()')) throw new Error('PR71 capture guard missing');
if (!html.includes('textarea, input, select')) throw new Error('PR71 interactive immunity missing');
if (!html.includes('font-size: 14px !important')) throw new Error('PR71 smaller text field font missing');
if (html.includes('Loading TD613 Flight') || html.includes('td613-flight-legacy.html') || html.includes('<iframe')) throw new Error('wrapper regression detected');

fs.writeFileSync(path, html);
console.log('patched TD613 Flight PR71 mobile polish');
