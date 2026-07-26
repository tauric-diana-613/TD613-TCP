import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const legacyPath = path.join(scriptsDir, 'ash-a2-a5-browser-probe-a13.mjs');
const tempPath = path.join(scriptsDir, `.ash-a2-a5-browser-probe-a14-${process.pid}.mjs`);

function replaceExactly(source, marker, replacement, label) {
  const count = source.split(marker).length - 1;
  if (count !== 1) throw new Error(`${label} expected exactly one marker; observed ${count}`);
  return source.replace(marker, replacement);
}

let source = await fs.readFile(legacyPath, 'utf8');
source = source
  .replaceAll('td613.ash.demo-registry/v0.1-a13', 'td613.ash.demo-registry/v0.2-a14')
  .replace('td613.ash.a2-a6-browser-observation/v0.2-a13-registry-settled-play', 'td613.ash.a2-a6-browser-observation/v0.3-a14-registry-settled-play');

source = replaceExactly(
  source,
  "  await page.locator('#startDemo').click();\n\n  await page.waitForFunction(() => {",
  "  await page.locator('#startDemo').click();\n\n  await page.waitForFunction(() => {\n    const caseId = localStorage.getItem('td613.ash-keep.current-case');\n    return Boolean(caseId)\n      && document.documentElement.dataset.ashDemoProfile === 'political_campaign'\n      && /Harbor City Mayoral Campaign/.test(document.getElementById('caseTitle')?.textContent || '')\n      && document.documentElement.dataset.ashPremiumReady === 'true'\n      && Boolean(window.__td613AshWholeInstrument?.version)\n      && Boolean(window.__td613AshLiveAIA?.version)\n      && Boolean(window.__td613AshA6Affordances?.version)\n      && Boolean(window.__td613AshDemoEntryConvergence?.version);\n  }, null, { timeout:120000 });\n  report.observations.entry_exact_case_rebind = await page.evaluate(() => {\n    const caseId = localStorage.getItem('td613.ash-keep.current-case');\n    const convergence = window.__td613AshDemoEntryConvergence;\n    if (!caseId || typeof convergence?.begin !== 'function') throw new Error('A14 A2-A6 exact-case convergence owner unavailable.');\n    const before = convergence.current?.() || null;\n    const began = convergence.begin({ detail:{ case_id:caseId, profile:'political_campaign' } });\n    return { case_id:caseId, before, begin_invoked:Boolean(began), after:convergence.current?.() || null };\n  });\n\n  await page.waitForFunction(() => {",
  'post-hydration exact-case convergence rebind'
);

if (source.includes('td613.ash.demo-registry/v0.1-a13')) {
  throw new Error('A14 current-registry observer adapter left a retired A13 registry token.');
}
if (!source.includes('entry_exact_case_rebind')
  || !source.includes("convergence.begin({ detail:{ case_id:caseId, profile:'political_campaign' } })")
  || !source.includes("dataset.ashPremiumReady === 'true'")) {
  throw new Error('A14 A2-A6 exact-case convergence adapter failed to compile.');
}

try {
  await fs.writeFile(tempPath, source, 'utf8');
  await import(`${pathToFileURL(tempPath).href}?a14=${Date.now()}`);
} finally {
  await fs.rm(tempPath, { force:true });
}
