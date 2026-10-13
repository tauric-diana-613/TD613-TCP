import fs from 'fs';

const path = 'app/safe-harbor/td613-flight.html';
let html = fs.readFileSync(path, 'utf8');

const css = `
/* === TD613 Flight PR74 mobile lane rescue === */
@media (max-width: 820px) {
  html,
  body {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    overflow-x: hidden !important;
  }

  .page-wrap {
    width: 100vw !important;
    max-width: 100vw !important;
    min-width: 0 !important;
    overflow: hidden !important;
  }

  .grid {
    --td613-flight-lane-x: 0px;
    display: flex !important;
    flex-direction: row !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    overflow: hidden !important;
    scroll-snap-type: none !important;
    scroll-behavior: auto !important;
    -webkit-overflow-scrolling: auto !important;
    touch-action: pan-y !important;
    transform: translate3d(var(--td613-flight-lane-x), 0, 0) !important;
    transition: transform .32s cubic-bezier(.18,.78,.2,1) !important;
    will-change: transform !important;
  }

  html[data-flight-mobile-lane="output"] .grid {
    --td613-flight-lane-x: -100vw;
  }

  body.flight-dragging .grid {
    transition: none !important;
  }

  .grid > .flight-lane-prompt,
  .grid > .flight-lane-output {
    flex: 0 0 100% !important;
    width: 100% !important;
    min-width: 100% !important;
    max-width: 100% !important;
    height: 100% !important;
    min-height: 0 !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    transform: none !important;
    scroll-snap-align: none !important;
    padding: .2rem .18rem 4.9rem !important;
    -webkit-overflow-scrolling: touch !important;
  }

  .grid > :not(.flight-lane-prompt):not(.flight-lane-output) {
    display: none !important;
  }

  .grid > .flight-lane::before,
  .grid > div:first-child::before,
  .grid > div:last-child::before {
    display: none !important;
  }

  .row,
  .checkbox-row,
  .radio-row,
  .copy-grid {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: wrap !important;
    align-items: flex-start !important;
    justify-content: flex-start !important;
    gap: .22rem .26rem !important;
    grid-template-columns: none !important;
    width: 100% !important;
  }

  .row .btn,
  .checkbox-row label,
  .radio-row label,
  .copy-chip {
    flex: 0 1 auto !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: min(12.25rem, 100%) !important;
    min-height: 1.16rem !important;
    padding: .18rem .38rem !important;
    border-radius: 999px !important;
    font-size: .42rem !important;
    line-height: 1.05 !important;
    text-align: left !important;
    justify-content: flex-start !important;
    align-items: center !important;
  }

  .checkbox-row input[type="checkbox"],
  .radio-row input[type="radio"] {
    flex: 0 0 .48rem !important;
    width: .48rem !important;
    min-width: .48rem !important;
    height: .48rem !important;
    margin: 0 .18rem 0 0 !important;
    zoom: 1 !important;
  }

  .checkbox-row label:has(input[type="text"]),
  .radio-row label:has(input[type="text"]) {
    flex: 0 1 min(13rem, 100%) !important;
    max-width: min(13rem, 100%) !important;
  }

  .checkbox-row label input[type="text"],
  .radio-row label input[type="text"] {
    width: 4.6rem !important;
    max-width: 4.6rem !important;
    font-size: 16px !important;
    zoom: .68 !important;
  }

  .card {
    padding: .64rem .66rem .72rem .9rem !important;
    margin-bottom: .48rem !important;
    border-radius: 16px !important;
  }

  .output-toolbar {
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: .2rem !important;
  }

  .output-toolbar .row {
    width: auto !important;
    flex: 0 1 auto !important;
  }

  .output-toolbar .row .btn {
    flex: 0 0 auto !important;
    width: auto !important;
  }

  .payload-stepper {
    align-self: center !important;
    margin-left: auto !important;
    padding: .06rem .18rem !important;
    gap: .04rem !important;
  }

  .payload-stepper-label {
    display: none !important;
  }

  .mobile-prompt-rail {
    position: fixed !important;
    right: calc(env(safe-area-inset-right, 0px) + .78rem) !important;
    bottom: calc(env(safe-area-inset-bottom, 0px) + .72rem) !important;
    left: auto !important;
    z-index: 2147483646 !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: flex-end !important;
    width: auto !important;
    max-width: min(21rem, calc(100vw - 1.4rem)) !important;
    margin: 0 !important;
    padding: .3rem .38rem .3rem .54rem !important;
    border-radius: 999px !important;
    gap: .34rem !important;
    text-align: right !important;
    box-shadow: 0 12px 38px rgba(0,0,0,.62), 0 0 18px rgba(255,193,90,.12), inset 0 1px 0 rgba(255,239,196,.08) !important;
  }

  .mobile-prompt-rail:not(.mobile-prompt-rail-top) {
    display: none !important;
  }

  .mobile-prompt-rail.is-docked {
    position: fixed !important;
    right: calc(env(safe-area-inset-right, 0px) + .78rem) !important;
    bottom: calc(env(safe-area-inset-bottom, 0px) + .72rem) !important;
    left: auto !important;
    margin: 0 !important;
    float: none !important;
  }

  html[data-flight-mobile-lane="output"] .mobile-prompt-rail,
  body.flight-output-active .mobile-prompt-rail {
    display: none !important;
  }

  .mobile-prompt-rail span:first-child {
    font-size: .38rem !important;
    white-space: nowrap !important;
    text-align: right !important;
  }

  .mobile-prompt-rail-pill {
    padding: .14rem .28rem !important;
    font-size: .3rem !important;
    white-space: nowrap !important;
  }

  .dev-drawer {
    margin-bottom: 4.8rem !important;
  }
}
`;

html = html.replace(/\n\/\* === TD613 Flight PR74 mobile lane rescue === \*\/[\s\S]*?(?=\n@media \(prefers-reduced-motion: reduce\)|\n<\/style>)/m, '');
html = html.replace('</style>', `${css}\n</style>`);

const script = `
<script id="td613-flight-pr74-mobile-lane-rescue-script">
(function () {
  function mobile() {
    return window.matchMedia && window.matchMedia('(max-width: 820px)').matches;
  }
  function grid() {
    return document.querySelector('.grid');
  }
  function lanes() {
    return {
      prompt: document.querySelector('.flight-lane-prompt'),
      output: document.querySelector('.flight-lane-output')
    };
  }
  function width() {
    return window.innerWidth || document.documentElement.clientWidth || 0;
  }
  function interactive(target) {
    return Boolean(target && target.closest && target.closest('textarea, input, select, button, label, [contenteditable="true"], .output, .copy-grid, .payload-stepper'));
  }
  function normalizeRails() {
    var rails = Array.from(document.querySelectorAll('.mobile-prompt-rail'));
    if (!rails.length) return;
    var keeper = document.querySelector('.mobile-prompt-rail-top') || rails[0];
    keeper.classList.add('mobile-prompt-rail-top');
    rails.forEach(function (rail) {
      if (rail !== keeper) rail.remove();
    });
    keeper.classList.remove('is-docked');
  }
  function syncTabs(target) {
    document.querySelectorAll('[data-flight-lane-target]').forEach(function (el) {
      var active = el.getAttribute('data-flight-lane-target') === target;
      el.classList.toggle('is-active', active);
      if (el.classList.contains('mobile-lane-tab')) el.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }
  function setLane(target, px) {
    target = target === 'output' ? 'output' : 'prompt';
    normalizeRails();
    var g = grid();
    var destination = target === 'output' ? -width() : 0;
    document.documentElement.dataset.flightMobileLane = target;
    document.body.classList.toggle('flight-output-active', target === 'output');
    document.body.classList.remove('flight-dragging');
    syncTabs(target);
    if (g) {
      if (Number.isFinite(px)) g.style.setProperty('--td613-flight-lane-x', px + 'px');
      window.requestAnimationFrame(function () { g.style.setProperty('--td613-flight-lane-x', destination + 'px'); });
      window.setTimeout(function () {
        if (document.documentElement.dataset.flightMobileLane === target) {
          g.style.setProperty('--td613-flight-lane-x', destination + 'px');
        }
      }, 360);
    }
  }
  function hydrate() {
    normalizeRails();
    document.querySelectorAll('.grid > :not(.flight-lane-prompt):not(.flight-lane-output)').forEach(function (node) {
      node.setAttribute('aria-hidden', 'true');
    });
    if (!document.documentElement.dataset.flightMobileLane) document.documentElement.dataset.flightMobileLane = 'prompt';
    setLane(document.documentElement.dataset.flightMobileLane === 'output' ? 'output' : 'prompt');
  }

  var startX = 0;
  var startY = 0;
  var active = false;
  var ignored = false;

  document.addEventListener('DOMContentLoaded', hydrate);
  window.addEventListener('resize', function () {
    if (mobile()) setLane(document.documentElement.dataset.flightMobileLane === 'output' ? 'output' : 'prompt');
  }, { passive: true });
  window.addEventListener('scroll', normalizeRails, { passive: true });

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
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
    active = false;
  }, { capture: true, passive: true });

  document.addEventListener('touchmove', function (event) {
    if (!mobile() || ignored) return;
    var touch = event.touches && event.touches[0];
    var g = grid();
    if (!touch || !g) return;
    var dx = touch.clientX - startX;
    var dy = touch.clientY - startY;
    if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy) * 1.08) return;
    active = true;
    event.stopImmediatePropagation();
    if (event.cancelable) event.preventDefault();
    document.body.classList.add('flight-dragging');
    var onOutput = document.documentElement.dataset.flightMobileLane === 'output';
    var base = onOutput ? -width() : 0;
    var min = onOutput ? -width() : -width();
    var max = onOutput ? 0 : 0;
    var next = Math.max(min, Math.min(max, base + dx));
    g.style.setProperty('--td613-flight-lane-x', next + 'px');
  }, { capture: true, passive: false });

  document.addEventListener('touchend', function (event) {
    if (!mobile()) return;
    if (ignored) { ignored = false; return; }
    var touch = event.changedTouches && event.changedTouches[0];
    if (!touch) return;
    var dx = touch.clientX - startX;
    var dy = touch.clientY - startY;
    document.body.classList.remove('flight-dragging');
    if (!active || Math.abs(dx) < 38 || Math.abs(dx) < Math.abs(dy) * 1.2) {
      setLane(document.documentElement.dataset.flightMobileLane === 'output' ? 'output' : 'prompt');
      return;
    }
    event.stopImmediatePropagation();
    var current = (document.documentElement.dataset.flightMobileLane === 'output' ? -width() : 0) + dx;
    if (document.documentElement.dataset.flightMobileLane === 'output') {
      setLane('prompt', current);
    } else {
      setLane(dx < 0 ? 'output' : 'prompt', current);
    }
  }, { capture: true, passive: true });

  window.TD613FlightSetLane = setLane;
  window.snapFlightLane = setLane;
  window.syncMobileFlightLane = function () {
    setLane(document.documentElement.dataset.flightMobileLane === 'output' ? 'output' : 'prompt');
  };
  window.updateMobilePromptRailDock = normalizeRails;
})();
</script>`;

html = html.replace(/\n?<script id="td613-flight-pr74-mobile-lane-rescue-script">[\s\S]*?<\/script>/g, '');
html = html.replace('</body>', `${script}\n</body>`);

if (!html.includes('TD613 Flight PR74 mobile lane rescue')) throw new Error('PR74 rescue CSS missing');
if (!html.includes('td613-flight-pr74-mobile-lane-rescue-script')) throw new Error('PR74 rescue script missing');
if (!html.includes('grid > :not(.flight-lane-prompt):not(.flight-lane-output)')) throw new Error('PR74 third-lane guard missing');
if (!html.includes('html[data-flight-mobile-lane="output"] .grid')) throw new Error('PR74 canonical output lane CSS missing');
if (!html.includes('document.documentElement.dataset.flightMobileLane')) throw new Error('PR74 canonical lane state missing');
if (!html.includes('setLane(\'prompt\', current)')) throw new Error('PR74 output escape swipe missing');
if (!html.includes('normalizeRails')) throw new Error('PR74 rail normalization missing');
if (html.includes('Loading TD613 Flight') || html.includes('td613-flight-legacy.html') || html.includes('<iframe')) throw new Error('wrapper regression detected');

fs.writeFileSync(path, html);
console.log('patched TD613 Flight PR74 mobile lane rescue');
