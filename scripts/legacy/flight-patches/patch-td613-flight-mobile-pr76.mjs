import fs from 'fs';

const path = 'app/safe-harbor/td613-flight.html';
let html = fs.readFileSync(path, 'utf8');

// Remove the capture-phase transform handlers that were fighting native iOS scroll.
html = html.replace(/\n?<script id="td613-flight-pr71-mobile-polish-script">[\s\S]*?<\/script>/g, '');
html = html.replace(/\n?<script id="td613-flight-pr74-mobile-lane-rescue-script">[\s\S]*?<\/script>/g, '');
html = html.replace(/\n?<script id="td613-flight-pr75-mobile-lane-recovery-script">[\s\S]*?<\/script>/g, '');

const css = `
/* === TD613 Flight PR76 native mobile lane repair === */
@media (max-width: 820px) {
  html,
  body {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    overflow: hidden !important;
  }

  .page-wrap {
    width: 100vw !important;
    max-width: 100vw !important;
    min-width: 0 !important;
    height: 100dvh !important;
    overflow: hidden !important;
    padding: .42rem !important;
  }

  .grid,
  body.flight-output-active .grid,
  html[data-flight-mobile-lane="output"] .grid,
  html[data-flight-mobile-lane="prompt"] .grid {
    display: flex !important;
    flex-direction: row !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    height: 100% !important;
    min-height: 0 !important;
    gap: 0 !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    scroll-snap-type: x mandatory !important;
    scroll-behavior: smooth !important;
    -webkit-overflow-scrolling: touch !important;
    touch-action: pan-x pan-y !important;
    transform: none !important;
    transition: none !important;
    will-change: auto !important;
  }

  .grid > .flight-lane,
  body.flight-output-active .grid > .flight-lane,
  html[data-flight-mobile-lane="output"] .grid > .flight-lane,
  html[data-flight-mobile-lane="prompt"] .grid > .flight-lane {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
    scroll-snap-align: start !important;
    flex: 0 0 100% !important;
    width: 100% !important;
    min-width: 100% !important;
    max-width: 100% !important;
    height: 100% !important;
    min-height: 0 !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    padding: .16rem .5rem 4.2rem !important;
    box-sizing: border-box !important;
    -webkit-overflow-scrolling: touch !important;
  }

  .grid > :not(.flight-lane-prompt):not(.flight-lane-output) {
    display: none !important;
  }

  .flight-lane > .card,
  .flight-lane > .dev-drawer,
  .flight-lane > .dev-divider,
  .flight-lane > .mobile-prompt-rail,
  .flight-lane-output > .output-card,
  .flight-lane-output > .seal-card,
  .flight-lane-output > .copy-bin-card {
    max-width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
  }

  .card {
    padding: .58rem .56rem .62rem .86rem !important;
  }

  .checkbox-row,
  .radio-row,
  .copy-grid,
  .row {
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
  }

  .checkbox-row label,
  .radio-row label,
  .copy-chip,
  .row .btn {
    flex: 0 1 auto !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: 100% !important;
    min-height: 1.14rem !important;
    padding: .18rem .38rem !important;
    border-radius: 999px !important;
    font-size: .42rem !important;
    line-height: 1.05 !important;
    overflow-wrap: anywhere !important;
    justify-content: flex-start !important;
  }

  .checkbox-row label:has(input[type="text"]),
  .radio-row label:has(input[type="text"]) {
    flex: 1 1 10rem !important;
    max-width: 100% !important;
  }

  .checkbox-row label input[type="text"],
  .radio-row label input[type="text"] {
    width: 4.6rem !important;
    max-width: 46vw !important;
    font-size: 16px !important;
    zoom: .68 !important;
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

  .dev-drawer {
    margin-top: .4rem !important;
    margin-bottom: .7rem !important;
  }

  .output-toolbar {
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
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

  .mobile-output-return {
    display: inline-flex !important;
  }
}
`;

html = html.replace(/\n\/\* === TD613 Flight PR76 native mobile lane repair === \*\/[\s\S]*?(?=\n@media \(prefers-reduced-motion: reduce\)|\n<\/style>)/m, '');
html = html.replace('</style>', `${css}\n</style>`);

const js = `
<script id="td613-flight-pr76-native-mobile-lane-script">
(function () {
  function mobile() { return window.matchMedia && window.matchMedia('(max-width: 820px)').matches; }
  function grid() { return document.querySelector('.grid'); }
  function laneWidth() { var g = grid(); return g ? g.clientWidth : window.innerWidth; }
  function syncTabs(target) {
    document.documentElement.dataset.flightMobileLane = target;
    document.body.classList.toggle('flight-output-active', target === 'output');
    document.querySelectorAll('[data-flight-lane-target]').forEach(function (el) {
      var on = el.getAttribute('data-flight-lane-target') === target;
      el.classList.toggle('is-active', on);
      if (el.classList.contains('mobile-lane-tab')) el.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }
  function setLane(target, instant) {
    target = target === 'output' ? 'output' : 'prompt';
    syncTabs(target);
    var g = grid();
    if (!g || !mobile()) return;
    g.scrollTo({ left: target === 'output' ? laneWidth() : 0, top: 0, behavior: instant ? 'auto' : 'smooth' });
  }
  function currentFromScroll() {
    var g = grid();
    if (!g) return 'prompt';
    return g.scrollLeft >= laneWidth() * 0.5 ? 'output' : 'prompt';
  }
  var timer = 0;
  function onScroll() {
    if (!mobile()) return;
    window.clearTimeout(timer);
    timer = window.setTimeout(function () { syncTabs(currentFromScroll()); }, 80);
  }
  document.addEventListener('DOMContentLoaded', function () {
    var g = grid();
    if (g) g.addEventListener('scroll', onScroll, { passive: true });
    setLane(document.documentElement.dataset.flightMobileLane === 'output' ? 'output' : 'prompt', true);
  });
  window.addEventListener('resize', function () {
    if (mobile()) setLane(document.documentElement.dataset.flightMobileLane === 'output' ? 'output' : 'prompt', true);
  }, { passive: true });
  document.addEventListener('click', function (event) {
    var trigger = event.target && event.target.closest && event.target.closest('[data-flight-lane-target]');
    if (!trigger) return;
    var target = trigger.getAttribute('data-flight-lane-target');
    if (target !== 'prompt' && target !== 'output') return;
    event.preventDefault();
    event.stopPropagation();
    setLane(target, false);
  }, true);
  window.TD613FlightSetLane = setLane;
  window.snapFlightLane = setLane;
  window.syncMobileFlightLane = function () { setLane(currentFromScroll(), true); };
})();
</script>`;

html = html.replace(/\n?<script id="td613-flight-pr76-native-mobile-lane-script">[\s\S]*?<\/script>/g, '');
html = html.replace('</body>', `${js}\n</body>`);

if (!html.includes('TD613 Flight PR76 native mobile lane repair')) throw new Error('PR76 CSS missing');
if (!html.includes('overflow-x: auto !important')) throw new Error('PR76 native horizontal scroll missing');
if (!html.includes('transform: none !important')) throw new Error('PR76 transform neutralizer missing');
if (!html.includes('g.scrollTo({ left: target ===')) throw new Error('PR76 lane setter missing');
if (!html.includes('td613-flight-pr76-native-mobile-lane-script')) throw new Error('PR76 script missing');
if (html.includes('td613-flight-pr71-mobile-polish-script')) throw new Error('old PR71 script remained');
if (html.includes('td613-flight-pr74-mobile-lane-rescue-script')) throw new Error('old PR74 script remained');
if (html.includes('td613-flight-pr75-mobile-lane-recovery-script')) throw new Error('old PR75 script remained');
if (html.includes('Loading TD613 Flight') || html.includes('td613-flight-legacy.html') || html.includes('<iframe')) throw new Error('wrapper regression detected');

fs.writeFileSync(path, html);
console.log('patched TD613 Flight PR76 native mobile lane repair');
