import fs from 'node:fs';

const htmlPath = 'app/safe-harbor/td613-flight.html';
const pr85Path = 'scripts/patch-td613-flight-mobile-pr85-final.mjs';
const marker = '/* PR100_SENTINEL TD613 Flight native lane touch repair */';

const css = `
${marker}
@media (max-width: 820px) {
  html,
  body,
  html[data-flight-shi-cached="true"] body.flight-locked,
  body.flight-locked {
    touch-action: pan-x pan-y pinch-zoom !important;
    overscroll-behavior-x: contain !important;
  }

  .grid {
    overflow-x: auto !important;
    overflow-y: hidden !important;
    scroll-snap-type: x proximity !important;
    scroll-behavior: auto !important;
    touch-action: pan-x pan-y pinch-zoom !important;
    overscroll-behavior-x: contain !important;
    -webkit-overflow-scrolling: touch !important;
  }

  .grid > div:first-child,
  .grid > div:last-child {
    scroll-snap-align: start !important;
    scroll-snap-stop: normal !important;
    touch-action: pan-x pan-y pinch-zoom !important;
  }
}
`;

const runtime = `<script id="td613-pr100-lane-tabs">
(function () {
  function bindLaneTabs() {
    const grid = document.querySelector('.grid');
    const tabs = Array.from(document.querySelectorAll('[data-flight-lane-target]'));
    if (!grid || !tabs.length || grid.dataset.td613Pr100LaneTabs === 'bound') return;
    grid.dataset.td613Pr100LaneTabs = 'bound';

    function laneIndex(target) {
      return target === 'output' ? 1 : 0;
    }

    function setActive(target) {
      tabs.forEach(function (tab) {
        const active = tab.dataset.flightLaneTarget === target;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      document.documentElement.dataset.td613Lane = target;
    }

    function goToLane(target) {
      const width = grid.clientWidth || window.innerWidth || 0;
      const left = laneIndex(target) * width;
      grid.scrollTo({ left: left, behavior: 'smooth' });
      setActive(target);
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        goToLane(tab.dataset.flightLaneTarget || 'prompt');
      });
    });

    grid.addEventListener('scroll', function () {
      window.requestAnimationFrame(function () {
        const width = grid.clientWidth || 1;
        const lane = Math.round(grid.scrollLeft / width) >= 1 ? 'output' : 'prompt';
        setActive(lane);
      });
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindLaneTabs);
  } else {
    bindLaneTabs();
  }
  window.setTimeout(bindLaneTabs, 120);
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
    if (!candidates.length) throw new Error('Could not find end of PR100 CSS block');
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
    if (!out.includes('</style>')) throw new Error('Missing CSS injection point for PR100');
    out = out.replace('</style>', `${css}\n</style>`);
  }
  if (!out.includes(marker)) throw new Error('PR100 CSS injection failed');
  if (!out.includes('touch-action: pan-x pan-y pinch-zoom !important;')) throw new Error('PR100 touch-action repair missing');
  return out;
}

function injectRuntime(source) {
  let out = source.replace(/\n?<script id="td613-pr100-lane-tabs">[\s\S]*?<\/script>/g, '');
  if (!out.includes('</body>')) throw new Error('Missing </body> for PR100 runtime');
  out = out.replace('</body>', `${runtime}\n</body>`);
  if (!out.includes('td613-pr100-lane-tabs')) throw new Error('PR100 runtime missing');
  return out;
}

fs.writeFileSync(htmlPath, injectRuntime(injectCss(fs.readFileSync(htmlPath, 'utf8'))));
fs.writeFileSync(pr85Path, injectCss(fs.readFileSync(pr85Path, 'utf8')));

console.log('Applied TD613 Flight PR100: native horizontal touch restored and click-only lane tabs bound.');
