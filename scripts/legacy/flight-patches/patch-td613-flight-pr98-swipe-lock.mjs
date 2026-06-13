import fs from 'node:fs';

const htmlPath = 'app/safe-harbor/td613-flight.html';
const pr85Path = 'scripts/patch-td613-flight-mobile-pr85-final.mjs';
const marker = '/* PR98_SENTINEL TD613 Flight symmetric lane swipe lock */';

const css = `
${marker}
@media (max-width: 820px) {
  html,
  body,
  .page-wrap {
    max-width: 100vw !important;
    overflow-x: hidden !important;
    overscroll-behavior-x: none !important;
  }

  .grid {
    overflow-x: auto !important;
    overflow-y: hidden !important;
    overscroll-behavior-x: contain !important;
    overscroll-behavior-y: contain !important;
    scroll-snap-type: x mandatory !important;
    scroll-padding-inline: 0 !important;
    scroll-behavior: auto !important;
    touch-action: pan-x pan-y !important;
    -webkit-overflow-scrolling: touch !important;
    contain: layout paint !important;
  }

  .grid > div:first-child,
  .grid > div:last-child {
    scroll-snap-align: start !important;
    scroll-snap-stop: always !important;
    flex-basis: 100% !important;
    min-width: 100% !important;
    max-width: 100% !important;
    transform: translateZ(0) !important;
    -webkit-transform: translateZ(0) !important;
  }

  body.td613-lane-snapping .grid {
    scroll-snap-type: x mandatory !important;
  }
}
`;

const runtime = `<script id="td613-pr98-swipe-lock">
(function () {
  const threshold = 8;
  let snapTimer = 0;
  let lastLane = -1;

  function getGrid() {
    return document.querySelector('.grid');
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function snapGrid(behavior) {
    const grid = getGrid();
    if (!grid || !grid.clientWidth) return;
    const laneWidth = grid.clientWidth;
    const maxLeft = Math.max(0, grid.scrollWidth - laneWidth);
    const lane = clamp(Math.round(grid.scrollLeft / laneWidth), 0, 1);
    const target = clamp(lane * laneWidth, 0, maxLeft);
    if (Math.abs(grid.scrollLeft - target) > 1) {
      document.body.classList.add('td613-lane-snapping');
      grid.scrollTo({ left: target, behavior: behavior || 'auto' });
      window.setTimeout(function () {
        document.body.classList.remove('td613-lane-snapping');
      }, 180);
    }
    if (lane !== lastLane) {
      lastLane = lane;
      document.documentElement.dataset.td613Lane = lane === 0 ? 'prompt' : 'output';
    }
  }

  function scheduleSnap(delay, behavior) {
    window.clearTimeout(snapTimer);
    snapTimer = window.setTimeout(function () { snapGrid(behavior); }, delay || 80);
  }

  function bind() {
    const grid = getGrid();
    if (!grid || grid.dataset.td613Pr98SwipeLock === 'bound') return;
    grid.dataset.td613Pr98SwipeLock = 'bound';
    grid.addEventListener('scroll', function () {
      scheduleSnap(120, 'smooth');
    }, { passive: true });
    grid.addEventListener('touchend', function () {
      scheduleSnap(40, 'smooth');
    }, { passive: true });
    grid.addEventListener('touchcancel', function () {
      scheduleSnap(40, 'smooth');
    }, { passive: true });
    grid.addEventListener('scrollend', function () {
      scheduleSnap(0, 'auto');
    }, { passive: true });
    window.addEventListener('resize', function () {
      scheduleSnap(20, 'auto');
    }, { passive: true });
    scheduleSnap(40, 'auto');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
  window.setTimeout(bind, 120);
})();
</script>`;

function stripPriorCss(source) {
  let out = source;
  while (out.includes(marker)) {
    const start = out.indexOf(marker);
    const nextPr = out.indexOf('\n/* PR', start + marker.length);
    const styleEnd = out.indexOf('\n</style>', start + marker.length);
    const templateEnd = out.indexOf('\n`;', start + marker.length);
    const candidates = [nextPr, styleEnd, templateEnd].filter((value) => value > start);
    if (!candidates.length) throw new Error('Could not find end of PR98 CSS block');
    const end = Math.min(...candidates);
    out = out.slice(0, start) + out.slice(end);
  }
  return out;
}

function injectCss(source) {
  let out = stripPriorCss(source);
  const cssInjectionPoint = 'const css = `\n';
  if (out.includes(cssInjectionPoint)) {
    out = out.replace(cssInjectionPoint, `${cssInjectionPoint}${css}\n`);
  } else {
    if (!out.includes('</style>')) throw new Error('Missing CSS injection point for PR98');
    out = out.replace('</style>', `${css}\n</style>`);
  }
  if (!out.includes(marker)) throw new Error('PR98 CSS injection failed');
  if (!out.includes('scroll-snap-type: x mandatory !important;')) throw new Error('PR98 mandatory snap missing');
  if (!out.includes('overscroll-behavior-x: contain !important;')) throw new Error('PR98 horizontal overscroll containment missing');
  return out;
}

function injectRuntime(source) {
  let out = source.replace(/\n?<script id="td613-pr98-swipe-lock">[\s\S]*?<\/script>/g, '');
  if (!out.includes('</body>')) throw new Error('Missing </body> for PR98 runtime');
  out = out.replace('</body>', `${runtime}\n</body>`);
  if (!out.includes('td613-pr98-swipe-lock')) throw new Error('PR98 runtime injection failed');
  return out;
}

fs.writeFileSync(htmlPath, injectRuntime(injectCss(fs.readFileSync(htmlPath, 'utf8'))));
fs.writeFileSync(pr85Path, injectCss(fs.readFileSync(pr85Path, 'utf8')));

console.log('Applied TD613 Flight PR98: symmetric mobile lane swipe lock.');
