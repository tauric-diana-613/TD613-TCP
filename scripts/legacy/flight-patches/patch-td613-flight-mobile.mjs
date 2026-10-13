import fs from 'fs';

const path = 'app/safe-harbor/td613-flight.html';
let html = fs.readFileSync(path, 'utf8');

const oldCssMarkers = [
  'TD613 Flight direct mobile layout fix',
  'TD613 Flight mobile lane access override',
  'TD613 Flight PR71 mobile polish',
  'TD613 Flight PR73 mobile finale',
  'TD613 Flight PR74 mobile lane rescue',
  'TD613 Flight PR75 mobile lane recovery',
  'TD613 Flight PR76 native mobile lane repair',
  'TD613 Flight PR77 final mobile lane stabilization',
  'TD613 Flight PR78 absolute mobile lanes'
];

function stripCssBlock(source, marker) {
  let out = source;
  const needle = `/* === ${marker}`;
  while (out.includes(needle)) {
    const start = out.indexOf(needle);
    const styleEnd = out.indexOf('</style>', start);
    const nextMarkers = ['\n/* === TD613 Flight', '\n@media (prefers-reduced-motion: reduce)', '\n</style>']
      .map(token => out.indexOf(token, start + 1))
      .filter(index => index !== -1);
    const end = nextMarkers.length ? Math.min(...nextMarkers) : styleEnd;
    if (end === -1 || end <= start) break;
    out = out.slice(0, start) + out.slice(end);
  }
  return out;
}

for (const marker of oldCssMarkers) html = stripCssBlock(html, marker);

html = html.replace(/\n?<script id="td613-flight-pr71-mobile-polish-script">[\s\S]*?<\/script>/g, '');
html = html.replace(/\n?<script id="td613-flight-pr73-mobile-finale-script">[\s\S]*?<\/script>/g, '');
html = html.replace(/\n?<script id="td613-flight-pr74-mobile-lane-rescue-script">[\s\S]*?<\/script>/g, '');
html = html.replace(/\n?<script id="td613-flight-pr75-mobile-lane-recovery-script">[\s\S]*?<\/script>/g, '');
html = html.replace(/\n?<script id="td613-flight-pr76-native-mobile-lane-script">[\s\S]*?<\/script>/g, '');
html = html.replace(/\n?<script id="td613-flight-pr77-final-mobile-lane-script">[\s\S]*?<\/script>/g, '');
html = html.replace(/\n?<script id="td613-flight-pr78-absolute-mobile-lane-script">[\s\S]*?<\/script>/g, '');

const viewport = '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />';
if (html.includes('<meta name="viewport"')) html = html.replace(/<meta name="viewport"[^>]*>/i, viewport);
else html = html.replace('<head>', `<head>\n${viewport}`);

html = html
  .replace(/>\s*Copy from output\s*<\/button>/gi, '>Copy</button>')
  .replace(/>\s*Clear output\s*<\/button>/gi, '>Clear</button>')
  .replaceAll('Copy from output', 'Copy')
  .replaceAll('COPY FROM OUTPUT', 'Copy')
  .replaceAll('Clear output', 'Clear')
  .replaceAll('CLEAR OUTPUT', 'Clear');

const railMarkup = '<button class="mobile-prompt-rail mobile-prompt-rail-top" data-flight-lane-target="output" type="button"><span>Seal payload to begin Flight</span><span class="mobile-prompt-rail-pill">Sealed Output &rarr;</span></button>';
html = html.replace(/<button class="mobile-prompt-rail[\s\S]*?<\/button>/g, '');
const devIndex = html.indexOf('<details class="dev-drawer" id="devSettingsDrawer"');
if (devIndex !== -1) {
  const dividerIndex = html.lastIndexOf('<div class="dev-divider"', devIndex);
  const insertAt = dividerIndex !== -1 && devIndex - dividerIndex < 500 ? dividerIndex : devIndex;
  html = html.slice(0, insertAt) + railMarkup + '\n' + html.slice(insertAt);
}

const css = `
/* === TD613 Flight PR78 absolute mobile lanes === */
@media (max-width: 820px) {
  html,
  body {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    overflow: hidden !important;
    -webkit-text-size-adjust: 100% !important;
    overscroll-behavior: none !important;
  }

  body { touch-action: pan-y !important; }

  .page-wrap {
    display: grid !important;
    grid-template-rows: auto auto minmax(0, 1fr) !important;
    width: 100vw !important;
    max-width: 100vw !important;
    min-width: 0 !important;
    height: 100dvh !important;
    min-height: 0 !important;
    overflow: hidden !important;
    padding: .42rem !important;
    gap: .34rem !important;
  }

  header,
  .mobile-flight-switcher,
  .grid,
  .flight-lane,
  .card,
  .dev-drawer,
  .output-card,
  .seal-card,
  .copy-bin-card,
  .pill-row,
  .flight-quick-nav {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
  }

  header {
    overflow: hidden !important;
    padding: .58rem .58rem .56rem !important;
    border-radius: 18px !important;
  }

  .pill-row,
  .flight-quick-nav { overflow: hidden !important; }

  .mobile-flight-switcher {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: .28rem !important;
  }

  .mobile-lane-tab {
    min-width: 0 !important;
    min-height: 1.62rem !important;
    padding: .18rem .3rem !important;
    border-radius: 999px !important;
  }

  .grid,
  body.flight-output-active .grid,
  html[data-flight-mobile-lane="output"] .grid,
  html[data-flight-mobile-lane="prompt"] .grid {
    position: relative !important;
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    height: 100% !important;
    min-height: 0 !important;
    overflow: hidden !important;
    transform: none !important;
    transition: none !important;
    touch-action: pan-y !important;
  }

  .grid > .flight-lane,
  body.flight-output-active .grid > .flight-lane,
  html[data-flight-mobile-lane="output"] .grid > .flight-lane,
  html[data-flight-mobile-lane="prompt"] .grid > .flight-lane {
    position: absolute !important;
    inset: 0 !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    height: 100% !important;
    min-height: 0 !important;
    padding: .14rem .46rem 4.2rem !important;
    box-sizing: border-box !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch !important;
    scroll-snap-align: none !important;
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
  .flight-lane * { max-width: 100% !important; box-sizing: border-box !important; }

  .card,
  .dev-drawer,
  .output-card,
  .seal-card,
  .copy-bin-card {
    overflow: hidden !important;
    padding: .58rem .56rem .62rem .86rem !important;
    margin-bottom: .48rem !important;
    border-radius: 16px !important;
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
  .radio-row label:has(input[type="text"]) { flex: 1 1 9rem !important; }

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

  .output-toolbar .row { width: auto !important; flex: 0 1 auto !important; }
  .output-toolbar .row .btn { flex: 0 0 auto !important; }
  .payload-stepper { align-self: center !important; margin-left: auto !important; }

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

  .mobile-prompt-rail:not(.mobile-prompt-rail-top) { display: none !important; }
  html[data-flight-mobile-lane="output"] .mobile-prompt-rail,
  body.flight-output-active .mobile-prompt-rail { display: none !important; }
  .mobile-prompt-rail span:first-child { font-size: .44rem !important; white-space: nowrap !important; }
  .mobile-prompt-rail-pill { font-size: .32rem !important; padding: .12rem .24rem !important; white-space: nowrap !important; }
  .mobile-output-return { display: inline-flex !important; }
  .dev-drawer { margin-top: .42rem !important; margin-bottom: .72rem !important; }
}
`;
html = html.replace('</style>', `${css}\n</style>`);

const js = `
<script id="td613-flight-pr78-absolute-mobile-lane-script">
(function () {
  function mobile() { return window.matchMedia && window.matchMedia('(max-width: 820px)').matches; }
  function q(s) { return document.querySelector(s); }
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
  function setTransforms(promptX, outputX) {
    var p = q('.flight-lane-prompt');
    var o = q('.flight-lane-output');
    if (p) p.style.setProperty('transform', 'translate3d(' + promptX + 'px,0,0)', 'important');
    if (o) o.style.setProperty('transform', 'translate3d(' + outputX + 'px,0,0)', 'important');
  }
  function clearTransforms() {
    var p = q('.flight-lane-prompt');
    var o = q('.flight-lane-output');
    if (p) p.style.removeProperty('transform');
    if (o) o.style.removeProperty('transform');
  }
  function width() { var g = q('.grid'); return g ? g.clientWidth : window.innerWidth; }
  function setLane(target, currentDx) {
    target = target === 'output' ? 'output' : 'prompt';
    document.body.classList.remove('flight-dragging');
    if (Number.isFinite(currentDx)) {
      var w = width();
      var baseP = lane() === 'output' ? -w : 0;
      var baseO = lane() === 'output' ? 0 : w;
      setTransforms(baseP + currentDx, baseO + currentDx);
      window.requestAnimationFrame(function () { syncTabs(target); clearTransforms(); });
    } else {
      syncTabs(target); clearTransforms();
    }
  }
  function interactive(target) {
    return Boolean(target && target.closest && target.closest('textarea, input, select, button, label, [contenteditable="true"], .copy-grid, .payload-stepper'));
  }
  var sx = 0, sy = 0, active = false, ignored = false;
  document.addEventListener('DOMContentLoaded', function () { syncTabs(lane()); clearTransforms(); });
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
    var w = width();
    dx = Math.max(-w, Math.min(w, dx));
    var baseP = lane() === 'output' ? -w : 0;
    var baseO = lane() === 'output' ? 0 : w;
    setTransforms(baseP + dx, baseO + dx);
  }, { capture: true, passive: false });
  document.addEventListener('touchend', function (event) {
    if (!mobile()) return;
    if (ignored) { ignored = false; return; }
    var touch = event.changedTouches && event.changedTouches[0];
    document.body.classList.remove('flight-dragging');
    if (!touch) return;
    var dx = touch.clientX - sx;
    var dy = touch.clientY - sy;
    if (!active || Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy) * 1.2) { setLane(lane(), dx); return; }
    event.stopImmediatePropagation();
    setLane(dx < 0 ? 'output' : 'prompt', dx);
  }, { capture: true, passive: true });
  window.TD613FlightSetLane = setLane;
  window.snapFlightLane = setLane;
  window.syncMobileFlightLane = function () { setLane(lane()); };
})();
</script>`;
html = html.replace('</body>', `${js}\n</body>`);

if (!html.includes('TD613 Flight PR78 absolute mobile lanes')) throw new Error('PR78 CSS missing');
if (!html.includes('td613-flight-pr78-absolute-mobile-lane-script')) throw new Error('PR78 script missing');
if (!html.includes('position: absolute !important')) throw new Error('PR78 absolute lane missing');
if (!html.includes('event.stopImmediatePropagation()')) throw new Error('PR78 capture guard missing');
if (html.includes('td613-flight-pr71-mobile-polish-script')) throw new Error('old PR71 script remained');
if (html.includes('td613-flight-pr73-mobile-finale-script')) throw new Error('old PR73 script remained');
if (html.includes('td613-flight-pr74-mobile-lane-rescue-script')) throw new Error('old PR74 script remained');
if (html.includes('td613-flight-pr75-mobile-lane-recovery-script')) throw new Error('old PR75 script remained');
if (html.includes('td613-flight-pr76-native-mobile-lane-script')) throw new Error('old PR76 script remained');
if (html.includes('td613-flight-pr77-final-mobile-lane-script')) throw new Error('old PR77 script remained');
if (html.includes('Loading TD613 Flight') || html.includes('td613-flight-legacy.html') || html.includes('<iframe')) throw new Error('wrapper regression detected');

fs.writeFileSync(path, html);
console.log('patched TD613 Flight PR78 absolute mobile lanes');
await import('./patch-td613-flight-mobile-pr79.mjs');
