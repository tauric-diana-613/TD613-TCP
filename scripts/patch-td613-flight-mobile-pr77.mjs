import fs from 'fs';

const path = 'app/safe-harbor/td613-flight.html';
let html = fs.readFileSync(path, 'utf8');

// PR77 is the final mobile authority. Remove older lane scripts so only one
// runtime owns lane state and horizontal drag.
html = html.replace(/\n?<script id="td613-flight-pr71-mobile-polish-script">[\s\S]*?<\/script>/g, '');
html = html.replace(/\n?<script id="td613-flight-pr74-mobile-lane-rescue-script">[\s\S]*?<\/script>/g, '');
html = html.replace(/\n?<script id="td613-flight-pr75-mobile-lane-recovery-script">[\s\S]*?<\/script>/g, '');
html = html.replace(/\n?<script id="td613-flight-pr76-native-mobile-lane-script">[\s\S]*?<\/script>/g, '');

const css = `
/* === TD613 Flight PR77 final mobile lane stabilization === */
@media (max-width: 820px) {
  html,
  body {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    overflow: hidden !important;
  }

  body {
    overscroll-behavior: none !important;
    touch-action: pan-y !important;
  }

  .page-wrap {
    display: grid !important;
    grid-template-rows: auto auto minmax(0, 1fr) !important;
    width: 100vw !important;
    max-width: 100vw !important;
    min-width: 0 !important;
    height: 100dvh !important;
    min-height: 0 !important;
    padding: .42rem !important;
    gap: .34rem !important;
    overflow: hidden !important;
  }

  header,
  .mobile-flight-switcher,
  .grid,
  .flight-lane,
  .card,
  .dev-drawer,
  .output-card,
  .seal-card,
  .copy-bin-card {
    max-width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
  }

  header {
    overflow: hidden !important;
    padding: .58rem .58rem .56rem !important;
  }

  .pill-row,
  .flight-quick-nav {
    max-width: 100% !important;
    overflow: hidden !important;
  }

  .mobile-flight-switcher {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    width: 100% !important;
  }

  .grid,
  body.flight-output-active .grid,
  html[data-flight-mobile-lane="output"] .grid,
  html[data-flight-mobile-lane="prompt"] .grid {
    --td613-pr77-lane-x: 0px;
    display: flex !important;
    flex-direction: row !important;
    align-items: stretch !important;
    gap: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    height: 100% !important;
    min-height: 0 !important;
    overflow: hidden !important;
    scroll-snap-type: none !important;
    scroll-behavior: auto !important;
    -webkit-overflow-scrolling: auto !important;
    transform: translate3d(var(--td613-pr77-lane-x), 0, 0) !important;
    transition: transform .34s cubic-bezier(.18,.82,.16,1) !important;
    will-change: transform !important;
    touch-action: pan-y !important;
  }

  html[data-flight-mobile-lane="output"] .grid,
  body.flight-output-active .grid {
    --td613-pr77-lane-x: -100%;
  }

  body.flight-dragging .grid {
    transition: none !important;
  }

  .grid > .flight-lane,
  body.flight-output-active .grid > .flight-lane,
  html[data-flight-mobile-lane="output"] .grid > .flight-lane,
  html[data-flight-mobile-lane="prompt"] .grid > .flight-lane {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    flex: 0 0 100% !important;
    width: 100% !important;
    min-width: 100% !important;
    max-width: 100% !important;
    height: 100% !important;
    min-height: 0 !important;
    padding: .14rem .46rem 4.2rem !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    scroll-snap-align: none !important;
    transform: none !important;
    transition: none !important;
    -webkit-overflow-scrolling: touch !important;
  }

  .grid > :not(.flight-lane-prompt):not(.flight-lane-output) {
    display: none !important;
  }

  .flight-lane * {
    max-width: 100% !important;
    box-sizing: border-box !important;
  }

  .card,
  .dev-drawer,
  .output-card,
  .seal-card,
  .copy-bin-card {
    width: 100% !important;
    overflow: hidden !important;
    padding: .58rem .56rem .62rem .86rem !important;
    margin-bottom: .48rem !important;
  }

  .checkbox-row,
  .radio-row,
  .copy-grid,
  .row,
  .seal-card .radio-row,
  .seal-card .checkbox-row {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: wrap !important;
    align-items: flex-start !important;
    justify-content: flex-start !important;
    gap: .22rem .26rem !important;
    grid-template-columns: none !important;
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    overflow: hidden !important;
  }

  .checkbox-row label,
  .radio-row label,
  .copy-chip,
  .row .btn,
  .seal-card .radio-row label,
  .seal-card .checkbox-row label {
    flex: 0 1 auto !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: 100% !important;
    min-height: 1.22rem !important;
    padding: .2rem .42rem !important;
    border-radius: 999px !important;
    font-size: .44rem !important;
    line-height: 1.08 !important;
    white-space: normal !important;
    overflow-wrap: anywhere !important;
    text-align: left !important;
    justify-content: flex-start !important;
  }

  .checkbox-row input[type="checkbox"],
  .radio-row input[type="radio"] {
    flex: 0 0 .48rem !important;
    width: .48rem !important;
    min-width: .48rem !important;
    height: .48rem !important;
    margin: 0 .18rem 0 0 !important;
  }

  .checkbox-row label:has(input[type="text"]),
  .radio-row label:has(input[type="text"]) {
    flex: 1 1 9rem !important;
    max-width: 100% !important;
  }

  .checkbox-row label input[type="text"],
  .radio-row label input[type="text"] {
    width: 4.6rem !important;
    max-width: 46vw !important;
    font-size: 16px !important;
    zoom: .68 !important;
  }

  textarea,
  input,
  select,
  .output,
  #taskText {
    max-width: 100% !important;
    font-size: 16px !important;
    line-height: 1.2 !important;
  }

  #taskText,
  .output {
    min-height: 5.65rem !important;
    height: clamp(5.8rem, 18dvh, 7.2rem) !important;
    max-height: 20dvh !important;
    padding: .58rem .62rem !important;
  }

  .output-toolbar {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: .2rem !important;
    width: 100% !important;
  }

  .output-toolbar .row {
    width: auto !important;
    flex: 0 1 auto !important;
  }

  .output-toolbar .row .btn {
    flex: 0 0 auto !important;
  }

  .payload-stepper {
    align-self: center !important;
    margin-left: auto !important;
  }

  .mobile-prompt-rail,
  .mobile-prompt-rail.mobile-prompt-rail-top,
  .mobile-prompt-rail.is-docked {
    position: static !important;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-end !important;
    width: max-content !important;
    max-width: 100% !important;
    min-height: 1.22rem !important;
    margin: .64rem 0 .64rem auto !important;
    padding: .3rem .42rem .3rem .62rem !important;
    border-radius: 999px !important;
    gap: .36rem !important;
    float: none !important;
    text-align: right !important;
  }

  .mobile-prompt-rail:not(.mobile-prompt-rail-top) {
    display: none !important;
  }

  html[data-flight-mobile-lane="output"] .mobile-prompt-rail,
  body.flight-output-active .mobile-prompt-rail {
    display: none !important;
  }

  .mobile-prompt-rail span:first-child {
    font-size: .44rem !important;
    white-space: nowrap !important;
  }

  .mobile-prompt-rail-pill {
    font-size: .32rem !important;
    padding: .12rem .24rem !important;
    white-space: nowrap !important;
  }

  .mobile-output-return {
    display: inline-flex !important;
  }

  .dev-drawer {
    margin-top: .42rem !important;
    margin-bottom: .72rem !important;
  }
}
`;

html = html.replace(/\n\/\* === TD613 Flight PR77 final mobile lane stabilization === \*\/[\s\S]*?(?=\n@media \(prefers-reduced-motion: reduce\)|\n<\/style>)/m, '');
html = html.replace('</style>', `${css}\n</style>`);

const js = `
<script id="td613-flight-pr77-final-mobile-lane-script">
(function () {
  function mobile() { return window.matchMedia && window.matchMedia('(max-width: 820px)').matches; }
  function grid() { return document.querySelector('.grid'); }
  function width() { var g = grid(); return g ? g.clientWidth : window.innerWidth; }
  function lane() { return document.documentElement.dataset.flightMobileLane === 'output' ? 'output' : 'prompt'; }
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
  function setX(px) {
    var g = grid();
    if (g) g.style.setProperty('--td613-pr77-lane-x', px + 'px');
  }
  function clearX() {
    var g = grid();
    if (g) g.style.removeProperty('--td613-pr77-lane-x');
  }
  function setLane(target, currentPx) {
    target = target === 'output' ? 'output' : 'prompt';
    document.body.classList.remove('flight-dragging');
    if (Number.isFinite(currentPx)) setX(currentPx);
    syncTabs(target);
    window.setTimeout(clearX, 380);
  }
  function interactive(target) {
    return Boolean(target && target.closest && target.closest('textarea, input, select, button, label, [contenteditable="true"], .copy-grid, .payload-stepper'));
  }
  var sx = 0, sy = 0, active = false, ignored = false;
  document.addEventListener('DOMContentLoaded', function () { syncTabs(lane()); clearX(); });
  window.addEventListener('resize', function () { if (mobile()) setLane(lane()); }, { passive: true });
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
    ignored = interactive(event.target);
    if (ignored) return;
    sx = event.touches[0].clientX;
    sy = event.touches[0].clientY;
    active = false;
  }, { capture: true, passive: true });
  document.addEventListener('touchmove', function (event) {
    if (!mobile() || ignored) return;
    var touch = event.touches && event.touches[0];
    if (!touch) return;
    var dx = touch.clientX - sx;
    var dy = touch.clientY - sy;
    if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy) * 1.08) return;
    active = true;
    if (event.cancelable) event.preventDefault();
    event.stopImmediatePropagation();
    document.body.classList.add('flight-dragging');
    var base = lane() === 'output' ? -width() : 0;
    var next = Math.max(-width(), Math.min(0, base + dx));
    setX(next);
  }, { capture: true, passive: false });
  document.addEventListener('touchend', function (event) {
    if (!mobile()) return;
    if (ignored) { ignored = false; return; }
    var touch = event.changedTouches && event.changedTouches[0];
    document.body.classList.remove('flight-dragging');
    if (!touch) return;
    var dx = touch.clientX - sx;
    var dy = touch.clientY - sy;
    var base = lane() === 'output' ? -width() : 0;
    var current = base + dx;
    if (!active || Math.abs(dx) < 38 || Math.abs(dx) < Math.abs(dy) * 1.2) {
      setLane(lane(), current);
      return;
    }
    event.stopImmediatePropagation();
    setLane(dx < 0 ? 'output' : 'prompt', current);
  }, { capture: true, passive: true });
  window.TD613FlightSetLane = setLane;
  window.snapFlightLane = setLane;
  window.syncMobileFlightLane = function () { setLane(lane()); };
})();
</script>`;

html = html.replace(/\n?<script id="td613-flight-pr77-final-mobile-lane-script">[\s\S]*?<\/script>/g, '');
html = html.replace('</body>', `${js}\n</body>`);

if (!html.includes('TD613 Flight PR77 final mobile lane stabilization')) throw new Error('PR77 CSS missing');
if (!html.includes('--td613-pr77-lane-x')) throw new Error('PR77 lane variable missing');
if (!html.includes('td613-flight-pr77-final-mobile-lane-script')) throw new Error('PR77 script missing');
if (!html.includes('event.stopImmediatePropagation()')) throw new Error('PR77 capture guard missing');
if (html.includes('td613-flight-pr71-mobile-polish-script')) throw new Error('old PR71 script remained');
if (html.includes('td613-flight-pr74-mobile-lane-rescue-script')) throw new Error('old PR74 script remained');
if (html.includes('td613-flight-pr75-mobile-lane-recovery-script')) throw new Error('old PR75 script remained');
if (html.includes('td613-flight-pr76-native-mobile-lane-script')) throw new Error('old PR76 script remained');
if (html.includes('Loading TD613 Flight') || html.includes('td613-flight-legacy.html') || html.includes('<iframe')) throw new Error('wrapper regression detected');

fs.writeFileSync(path, html);
console.log('patched TD613 Flight PR77 final mobile lane stabilization');
