import fs from 'node:fs';

const INGRESS_PATH = 'app/dome-world/ash-ingress-layout-hydration.js';
const LIVE_TEST_PATH = 'tests/ash-live-ingress-demos-cache.test.mjs';
const LIVE_PROBE_PATH = 'scripts/ash-live-release-browser-probe.mjs';
const CLOSURE_PROBE_PATH = 'scripts/ash-keep-production-probe.mjs';
const CLOSURE_CONTRACT_PATH = 'tests/ash-keep-production-closure-contract.test.mjs';
const SELF_PATH = 'scripts/recover-ash-final-cut.mjs';
const WORKFLOW_PATH = '.github/workflows/recover-ash-final-cut.yml';

function replaceOnce(source, from, to, label) {
  const count = source.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one replacement seam, observed ${count}.`);
  return source.replace(from, to);
}

let ingress = fs.readFileSync(INGRESS_PATH, 'utf8');
ingress = replaceOnce(
  ingress,
  "export const ASH_INGRESS_LAYOUT_VERSION = 'td613.ash.ingress-layout/v0.3-live-release';",
  "export const ASH_INGRESS_LAYOUT_VERSION = 'td613.ash.ingress-layout/v0.4-final-cut';",
  'ingress version'
);
ingress = replaceOnce(
  ingress,
  "const STYLE_ID = 'td613-ash-ingress-scroll-membrane';",
  "const STYLE_ID = 'td613-ash-ingress-scroll-membrane';\nconst SCROLLBAR_ACTIVE_CLASS = 'ash-scrollbar-active';\nconst SCROLLBAR_FADE_DELAY = 760;\nconst scrollbarTimers = new WeakMap();",
  'scrollbar constants'
);
ingress = replaceOnce(
  ingress,
  `    #launch .launch-panel:focus-within{outline:1px solid rgba(118,234,212,.28);outline-offset:3px}\n`,
  `    #launch.launch,\n    #launch .launch-panel{\n      scrollbar-width:thin;\n      scrollbar-color:transparent transparent;\n    }\n    #launch.launch::-webkit-scrollbar,\n    #launch .launch-panel::-webkit-scrollbar{width:7px;height:7px}\n    #launch.launch::-webkit-scrollbar-track,\n    #launch .launch-panel::-webkit-scrollbar-track{background:transparent}\n    #launch.launch::-webkit-scrollbar-thumb,\n    #launch .launch-panel::-webkit-scrollbar-thumb{\n      background-color:transparent;\n      background-clip:padding-box;\n      border:2px solid transparent;\n      border-radius:999px;\n      transition:background-color .18s ease;\n    }\n    #launch.launch.ash-scrollbar-active,\n    #launch .launch-panel.ash-scrollbar-active,\n    #launch.launch:hover,\n    #launch .launch-panel:hover,\n    #launch.launch:focus-within,\n    #launch .launch-panel:focus-within{\n      scrollbar-color:rgba(118,234,212,.48) transparent;\n    }\n    #launch.launch.ash-scrollbar-active::-webkit-scrollbar-thumb,\n    #launch .launch-panel.ash-scrollbar-active::-webkit-scrollbar-thumb,\n    #launch.launch:hover::-webkit-scrollbar-thumb,\n    #launch .launch-panel:hover::-webkit-scrollbar-thumb,\n    #launch.launch:focus-within::-webkit-scrollbar-thumb,\n    #launch .launch-panel:focus-within::-webkit-scrollbar-thumb{background-color:rgba(118,234,212,.48)}\n    #launch .launch-panel:focus-within{outline:1px solid rgba(118,234,212,.28);outline-offset:3px}\n    @media (prefers-reduced-motion:reduce){\n      #launch.launch::-webkit-scrollbar-thumb,\n      #launch .launch-panel::-webkit-scrollbar-thumb{transition:none}\n    }\n`,
  'thin fading scrollbar styles'
);
ingress = replaceOnce(
  ingress,
  `export function measureAshIngress(host = window) {`,
  `function installScrollbarFade(node, host = window) {\n  if (!node || node.dataset.ashScrollbarFade === 'true') return false;\n  node.dataset.ashScrollbarFade = 'true';\n  const reveal = () => {\n    node.classList.add(SCROLLBAR_ACTIVE_CLASS);\n    const prior = scrollbarTimers.get(node);\n    if (prior) host.clearTimeout(prior);\n    const timer = host.setTimeout(() => {\n      node.classList.remove(SCROLLBAR_ACTIVE_CLASS);\n      scrollbarTimers.delete(node);\n    }, SCROLLBAR_FADE_DELAY);\n    scrollbarTimers.set(node, timer);\n  };\n  node.addEventListener('scroll', reveal, { passive:true });\n  node.addEventListener('pointerenter', reveal, { passive:true });\n  node.addEventListener('focusin', reveal);\n  return true;\n}\n\nexport function measureAshIngress(host = window) {`,
  'scrollbar fade installer'
);
ingress = replaceOnce(
  ingress,
  `    horizontal_overflow:Math.max(0, host.document.documentElement.scrollWidth - viewport.width)\n`,
  `    scrollbar:{\n      width:getComputedStyle(panel).scrollbarWidth || 'auto',\n      active:panel.classList.contains(SCROLLBAR_ACTIVE_CLASS),\n      fade_delay_ms:SCROLLBAR_FADE_DELAY\n    },\n    horizontal_overflow:Math.max(0, host.document.documentElement.scrollWidth - viewport.width)\n`,
  'scrollbar measurement receipt'
);
ingress = replaceOnce(
  ingress,
  `  const panel = doc.querySelector('#launch .launch-panel');\n  if (panel) {\n    panel.setAttribute('tabindex','-1');\n    panel.dataset.ashScrollMembrane = 'true';\n  }`,
  `  const membrane = doc.getElementById('launch');\n  const panel = doc.querySelector('#launch .launch-panel');\n  if (panel) {\n    panel.setAttribute('tabindex','-1');\n    panel.dataset.ashScrollMembrane = 'true';\n  }\n  installScrollbarFade(membrane, host);\n  installScrollbarFade(panel, host);`,
  'scrollbar runtime binding'
);
fs.writeFileSync(INGRESS_PATH, ingress);

let liveTest = fs.readFileSync(LIVE_TEST_PATH, 'utf8');
liveTest = replaceOnce(
  liveTest,
  `for (const token of ['width:min(780px', 'max-height:calc(100dvh - 32px)', 'overflow-y:auto!important', 'scrollbar-gutter:stable']) {`,
  `for (const token of ['td613.ash.ingress-layout/v0.4-final-cut', 'width:min(780px', 'max-height:calc(100dvh - 32px)', 'overflow-y:auto!important', 'scrollbar-gutter:stable', 'scrollbar-width:thin', '::-webkit-scrollbar', 'ash-scrollbar-active', 'SCROLLBAR_FADE_DELAY = 760', 'installScrollbarFade(membrane, host)', 'installScrollbarFade(panel, host)']) {`,
  'live ingress visual contract'
);
fs.writeFileSync(LIVE_TEST_PATH, liveTest);

let liveProbe = fs.readFileSync(LIVE_PROBE_PATH, 'utf8');
liveProbe = replaceOnce(
  liveProbe,
  `    && window.__td613AshIngressLayout?.version==='td613.ash.ingress-layout/v0.3-live-release'`,
  `    && window.__td613AshIngressLayout?.version==='td613.ash.ingress-layout/v0.4-final-cut'`,
  'browser ingress version'
);
liveProbe = replaceOnce(
  liveProbe,
  `    await page.locator('#launch .launch-panel').evaluate(node=>node.scrollTo({top:node.scrollHeight,behavior:'auto'}));\n    assert(await page.locator('#startDemo').isVisible(),'Demo action is unreachable after ingress scroll.');`,
  `    await page.locator('#launch .launch-panel').evaluate(node=>node.scrollTo({top:node.scrollHeight,behavior:'auto'}));\n    await page.waitForFunction(() => document.querySelector('#launch .launch-panel')?.classList.contains('ash-scrollbar-active'));\n    assert(await page.locator('#launch .launch-panel').evaluate(node=>node.classList.contains('ash-scrollbar-active')),'Thin scrollbar did not reveal during scroll.');\n    await page.waitForTimeout(900);\n    assert(!(await page.locator('#launch .launch-panel').evaluate(node=>node.classList.contains('ash-scrollbar-active'))),'Thin scrollbar did not fade after rest.');\n    assert(await page.locator('#startDemo').isVisible(),'Demo action is unreachable after ingress scroll.');`,
  'browser scrollbar reveal and fade'
);
fs.writeFileSync(LIVE_PROBE_PATH, liveProbe);

let closureProbe = fs.readFileSync(CLOSURE_PROBE_PATH, 'utf8');
closureProbe = replaceOnce(
  closureProbe,
  `  await page.goto(keepUrl, { waitUntil: 'networkidle', timeout: 60_000 });\n  await page.locator('h1').waitFor({ state: 'visible' });`,
  `  await page.goto(keepUrl, { waitUntil: 'networkidle', timeout: 60_000 });\n  // ASH_CACHE_EPOCH_STABLE: the one-time eviction may navigate after first paint.\n  await page.waitForURL(url => url.searchParams.has('ash_flush'), { timeout: 60_000 });\n  await page.waitForLoadState('networkidle');\n  await page.waitForFunction(() => {\n    const epoch = localStorage.getItem('td613.ash.cache-flush.epoch');\n    const url = new URL(location.href);\n    return Boolean(epoch)\n      && url.searchParams.get('ash_flush') === epoch\n      && window.__td613AshCacheTransition?.epoch === epoch;\n  }, { timeout: 60_000 });\n  await page.locator('h1').waitFor({ state: 'visible' });`,
  'closure epoch navigation barrier'
);
fs.writeFileSync(CLOSURE_PROBE_PATH, closureProbe);

let closureContract = fs.readFileSync(CLOSURE_CONTRACT_PATH, 'utf8');
closureContract = replaceOnce(
  closureContract,
  `  'wrong_passphrase_hold', 'tamper_hold', 'mobile_portrait', 'mobile_landscape', 'evidence-manifest.json'`,
  `  'wrong_passphrase_hold', 'tamper_hold', 'mobile_portrait', 'mobile_landscape', 'evidence-manifest.json', 'ASH_CACHE_EPOCH_STABLE'`,
  'closure epoch barrier contract'
);
fs.writeFileSync(CLOSURE_CONTRACT_PATH, closureContract);

for (const path of [SELF_PATH, WORKFLOW_PATH]) {
  if (fs.existsSync(path)) fs.rmSync(path);
}

console.log('Ash final-cut recovery applied: membrane geometry, fading scrollbar, cache-epoch barrier, and contracts converged.');
