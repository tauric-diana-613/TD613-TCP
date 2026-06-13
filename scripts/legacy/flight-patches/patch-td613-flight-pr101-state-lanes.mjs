import fs from 'node:fs';

const htmlPath = 'app/safe-harbor/td613-flight.html';
const pr85Path = 'scripts/patch-td613-flight-mobile-pr85-final.mjs';
const marker = '/* PR101_SENTINEL TD613 Flight mobile state lanes no horizontal trap */';

const css = `
${marker}
@media (max-width: 820px) {
  .grid {
    display: block !important;
    width: 100% !important;
    min-width: 0 !important;
    height: 100% !important;
    overflow-x: hidden !important;
    overflow-y: hidden !important;
    scroll-snap-type: none !important;
    scroll-behavior: auto !important;
    touch-action: pan-y pinch-zoom !important;
    -webkit-overflow-scrolling: auto !important;
  }

  .grid > div:first-child,
  .grid > div:last-child {
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    height: 100% !important;
    min-height: 0 !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    scroll-snap-align: none !important;
    scroll-snap-stop: normal !important;
    touch-action: pan-y pinch-zoom !important;
    -webkit-overflow-scrolling: touch !important;
  }

  html[data-td613-lane="prompt"] .grid > div:first-child,
  html:not([data-td613-lane]) .grid > div:first-child {
    display: block !important;
  }

  html[data-td613-lane="prompt"] .grid > div:last-child,
  html:not([data-td613-lane]) .grid > div:last-child {
    display: none !important;
  }

  html[data-td613-lane="output"] .grid > div:first-child {
    display: none !important;
  }

  html[data-td613-lane="output"] .grid > div:last-child {
    display: block !important;
  }

  html[data-td613-lane="prompt"] [data-flight-lane-target="prompt"],
  html:not([data-td613-lane]) [data-flight-lane-target="prompt"],
  html[data-td613-lane="output"] [data-flight-lane-target="output"] {
    border-color: rgba(49,255,138,0.55) !important;
    color: var(--lux-cream) !important;
    background:
      linear-gradient(180deg, rgba(24,77,54,0.58), rgba(2,13,10,0.92)),
      radial-gradient(circle at 50% 0%, rgba(49,255,138,0.22), transparent 66%) !important;
    box-shadow: 0 0 24px rgba(49,255,138,0.15), inset 0 1px 0 rgba(245,255,246,0.08) !important;
  }

  html[data-td613-lane="prompt"] [data-flight-lane-target="output"],
  html:not([data-td613-lane]) [data-flight-lane-target="output"],
  html[data-td613-lane="output"] [data-flight-lane-target="prompt"] {
    border-color: rgba(137,255,240,0.16) !important;
    color: rgba(245,255,246,0.74) !important;
    background: rgba(2,13,14,0.68) !important;
    box-shadow: none !important;
  }
}
`;

const runtime = `<script id="td613-pr101-state-lanes">
(function () {
  function bindStateLanes() {
    const root = document.documentElement;
    const grid = document.querySelector('.grid');
    const tabs = Array.from(document.querySelectorAll('[data-flight-lane-target]'));
    const rails = Array.from(document.querySelectorAll('.mobile-prompt-rail, .mobile-output-return'));
    if (!grid || grid.dataset.td613Pr101StateLanes === 'bound') return;
    grid.dataset.td613Pr101StateLanes = 'bound';

    function setLane(target, options) {
      const lane = target === 'output' ? 'output' : 'prompt';
      root.dataset.td613Lane = lane;
      tabs.forEach(function (tab) {
        const active = tab.dataset.flightLaneTarget === lane;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      if (!options || options.scroll !== false) {
        grid.scrollTop = 0;
        const visibleLane = lane === 'output' ? grid.children[1] : grid.children[0];
        if (visibleLane) visibleLane.scrollTop = 0;
      }
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function (event) {
        event.preventDefault();
        setLane(tab.dataset.flightLaneTarget || 'prompt');
      });
    });

    rails.forEach(function (rail) {
      rail.addEventListener('click', function (event) {
        event.preventDefault();
        const isReturn = rail.classList.contains('mobile-output-return') || /prompt/i.test(rail.textContent || '');
        setLane(isReturn ? 'prompt' : 'output');
      });
    });

    window.td613SetFlightLane = setLane;
    setLane(root.dataset.td613Lane === 'output' ? 'output' : 'prompt', { scroll: false });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindStateLanes);
  } else {
    bindStateLanes();
  }
  window.setTimeout(bindStateLanes, 120);
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
    if (!candidates.length) throw new Error('Could not find end of PR101 CSS block');
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
    if (!out.includes('</style>')) throw new Error('Missing CSS injection point for PR101');
    out = out.replace('</style>', `${css}\n</style>`);
  }
  if (!out.includes(marker)) throw new Error('PR101 CSS injection failed');
  if (!out.includes('scroll-snap-type: none !important;')) throw new Error('PR101 no-horizontal-snap rule missing');
  if (!out.includes('html[data-td613-lane="output"] .grid > div:last-child')) throw new Error('PR101 output lane selector missing');
  return out;
}

function injectRuntime(source) {
  let out = source.replace(/\n?<script id="td613-pr101-state-lanes">[\s\S]*?<\/script>/g, '');
  if (!out.includes('</body>')) throw new Error('Missing </body> for PR101 runtime');
  out = out.replace('</body>', `${runtime}\n</body>`);
  if (!out.includes('td613-pr101-state-lanes')) throw new Error('PR101 runtime missing');
  return out;
}

fs.writeFileSync(htmlPath, injectRuntime(injectCss(fs.readFileSync(htmlPath, 'utf8'))));
fs.writeFileSync(pr85Path, injectCss(fs.readFileSync(pr85Path, 'utf8')));

console.log('Applied TD613 Flight PR101: mobile state lanes replace horizontal scroll trap.');
