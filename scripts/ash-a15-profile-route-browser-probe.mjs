import fs from 'node:fs';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const baseUrl = process.env.TD613_BASE_URL || 'http://127.0.0.1:6130';
const browserName = process.env.TD613_BROWSER || 'chromium';
const artifactDir = process.env.TD613_ARTIFACT_DIR || `artifacts/ash-a15-${browserName}`;
const browserType = { chromium, firefox, webkit }[browserName];
if (!browserType) throw new Error(`Unsupported browser ${browserName}`);
fs.mkdirSync(artifactDir, { recursive:true });

const browser = await browserType.launch({ headless:true });
try {
  for (const reducedMotion of [false, true]) {
    const context = await browser.newContext({
      viewport:{ width:reducedMotion ? 390 : 1440, height:reducedMotion ? 844 : 1000 },
      reducedMotion:reducedMotion ? 'reduce' : 'no-preference'
    });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/dome-world/ash-keep.html`, { waitUntil:'domcontentloaded', timeout:90_000 });
    const receipt = await page.evaluate(async () => {
      const mod = await import('/dome-world/ash-a15-profile-route-stress.js');
      const matrix = mod.compileA15StressMatrix('same-action');
      const receipt = mod.verifyA15StressMatrix(matrix);
      return {
        receipt,
        sample:matrix.map(({ profile, workspace, route, message, profile_language, route_posture }) => ({ profile, workspace, route, message, profile_language, route_posture })),
        globalVersion:window.__td613AshA15ProfileRouteStress?.version || null,
        registryVersion:window.__td613AshA15ProfileRouteStress?.registry_version || null
      };
    });
    if (!receipt.receipt?.ok || receipt.receipt.journeys !== 120) throw new Error('A15 browser matrix did not seal 120 journeys.');
    if (receipt.globalVersion !== 'td613.ash.a15-profile-route-stress/v0.1') throw new Error('A15 browser global owner missing.');
    if (receipt.registryVersion !== 'td613.ash.demo-registry/v0.3-a15') throw new Error('A15 registry version mismatch.');
    if (new Set(receipt.sample.map(item => item.message)).size !== 120) throw new Error('A15 world answers collapsed across journeys.');
    const mode = reducedMotion ? 'mobile-reduced' : 'desktop';
    fs.writeFileSync(path.join(artifactDir, `${mode}.json`), `${JSON.stringify(receipt, null, 2)}\n`);
    await page.screenshot({ path:path.join(artifactDir, `${mode}.png`), fullPage:true });
    await context.close();
  }
} finally {
  await browser.close();
}
console.log(JSON.stringify({ ok:true, schema:'td613.ash.a15-browser-receipt/v0.1', browser:browserName, journeys:120, desktop:true, mobile_reduced:true, authority_changed:false, source_bytes_moved:false, human_review_required:true }, null, 2));
