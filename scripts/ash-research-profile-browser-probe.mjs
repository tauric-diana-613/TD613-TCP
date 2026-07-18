import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const base = process.env.TD613_BASE_URL || 'http://127.0.0.1:6130';
const out = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-research-hydration';
await fs.mkdir(out, { recursive: true });

const engines = { chromium, firefox, webkit };
const viewports = [
  { name:'wide-1080', width:1920, height:1080, expect:'centered' },
  { name:'standard-864', width:1536, height:864, expect:'centered-or-scroll' },
  { name:'compact-768', width:1366, height:768, expect:'centered-or-scroll' },
  { name:'short-700', width:1440, height:700, expect:'scroll' },
  { name:'short-600', width:1280, height:600, expect:'scroll' },
  { name:'narrow-desktop', width:1024, height:768, expect:'centered-or-scroll' }
];

const report = {
  schema:'td613.ash.research-hydration-browser-observation/v0.1',
  source_status:'LOCAL_VALIDATION',
  base,
  engines:{},
  external_requests:[],
  console_errors:[],
  universal_cache_eviction_claim:false,
  research_assurance_ceiling:'PA2'
};

for (const [engineName, launcher] of Object.entries(engines)) {
  const browser = await launcher.launch({ headless:true });
  const context = await browser.newContext({ viewport:{ width:1920, height:1080 } });
  const page = await context.newPage();
  const external = [];
  const errors = [];
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.origin !== new URL(base).origin) external.push(request.url());
  });
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', error => errors.push(error.message));

  await page.goto(`${base}/dome-world/ash-keep.html?arrival=cleared`, { waitUntil:'domcontentloaded', timeout:60000 });
  await page.waitForFunction(() => document.documentElement.dataset.ashResearchHydration?.includes('2026-07-17-v1'), null, { timeout:60000 });
  await page.waitForSelector('#launch:not(.hidden)', { state:'visible', timeout:60000 });
  await page.waitForFunction(() => document.querySelector('#newProfile option[value="research"]'));

  const engineReport = { viewports:{}, cache_receipt:null, research:null };
  engineReport.cache_receipt = await page.evaluate(() => {
    try { return JSON.parse(sessionStorage.getItem('td613.ash.cache-flush.receipt') || 'null'); }
    catch { return null; }
  });
  if (!engineReport.cache_receipt?.preserves_case_storage) throw new Error(`${engineName}: cache receipt missing case-storage preservation.`);
  if (engineReport.cache_receipt?.clears_http_cache_universally !== false) throw new Error(`${engineName}: cache receipt overclaimed universal HTTP-cache eviction.`);

  for (const viewport of viewports) {
    await page.setViewportSize({ width:viewport.width, height:viewport.height });
    await page.evaluate(() => { const launch=document.getElementById('launch'); launch.scrollTop=0; });
    const layout = await page.evaluate(() => {
      const launch = document.getElementById('launch');
      const panel = launch.querySelector('.launch-panel');
      const actions = panel.querySelector('.actions');
      const lr = launch.getBoundingClientRect();
      const pr = panel.getBoundingClientRect();
      const ar = actions.getBoundingClientRect();
      const fits = panel.scrollHeight <= launch.clientHeight;
      const panelCenter = pr.top + pr.height / 2;
      const launchCenter = lr.top + lr.height / 2;
      return {
        launch_client_height:launch.clientHeight,
        launch_scroll_height:launch.scrollHeight,
        launch_overflow_y:getComputedStyle(launch).overflowY,
        launch_scrollbar_gutter:getComputedStyle(launch).scrollbarGutter,
        panel_top:pr.top,
        panel_bottom:pr.bottom,
        panel_height:pr.height,
        fits,
        center_delta:Math.abs(panelCenter-launchCenter),
        actions_initially_visible:ar.top >= lr.top && ar.bottom <= lr.bottom
      };
    });
    if (layout.launch_overflow_y !== 'auto' && layout.launch_overflow_y !== 'scroll') {
      throw new Error(`${engineName}/${viewport.name}: ingress is not vertically scrollable.`);
    }
    if (layout.fits && layout.center_delta > 28) {
      throw new Error(`${engineName}/${viewport.name}: fitting ingress is not centered (${layout.center_delta}px).`);
    }
    if (!layout.fits) {
      await page.evaluate(() => { const launch=document.getElementById('launch'); launch.scrollTop=launch.scrollHeight; });
      const bottom = await page.evaluate(() => {
        const launch=document.getElementById('launch');
        const actions=launch.querySelector('.launch-panel .actions').getBoundingClientRect();
        const rect=launch.getBoundingClientRect();
        return { scroll_top:launch.scrollTop, scroll_max:launch.scrollHeight-launch.clientHeight, actions_bottom:actions.bottom, viewport_bottom:rect.bottom };
      });
      if (bottom.scroll_top < bottom.scroll_max - 2 || bottom.actions_bottom > bottom.viewport_bottom + 2) {
        throw new Error(`${engineName}/${viewport.name}: ingress actions remain unreachable after scroll.`);
      }
      layout.bottom_reachability = bottom;
    }
    engineReport.viewports[viewport.name] = layout;
  }

  await page.setViewportSize({ width:1366, height:768 });
  await page.evaluate(() => { document.getElementById('launch').scrollTop=0; });
  await page.selectOption('#newProfile','research');
  await page.waitForFunction(() => /Research qualification demo/.test(document.getElementById('startDemo')?.textContent || '') && !document.getElementById('startDemo')?.disabled);
  await page.click('#startDemo');
  await page.waitForFunction(() => document.documentElement.dataset.ashDemoProfile === 'research'
    && document.getElementById('researchHydrationAudit')?.dataset.profile === 'research', null, { timeout:60000 });
  engineReport.research = await page.evaluate(() => ({
    profile:document.documentElement.dataset.ashDemoProfile,
    demo_id:document.documentElement.dataset.ashDemoId,
    hydration_version:document.documentElement.dataset.ashResearchHydration,
    ingress_version:document.documentElement.dataset.ashIngressMembrane,
    title:document.getElementById('caseTitle')?.textContent,
    rooms:Number(document.getElementById('roomCount')?.textContent || 0),
    objects:Number(document.getElementById('nodeCount')?.textContent || 0),
    relations:Number(document.getElementById('edgeCount')?.textContent || 0),
    audit_class:document.getElementById('researchHydrationAudit')?.dataset.hydrationClass,
    audit_text:document.getElementById('researchHydrationAudit')?.textContent
  }));
  if (engineReport.research.rooms < 10 || engineReport.research.objects < 40 || engineReport.research.relations < 40) {
    throw new Error(`${engineName}: Research qualification fixture hydrated below its structural floor.`);
  }
  if (!/PA2/.test(engineReport.research.audit_text || '')) throw new Error(`${engineName}: Research audit omitted its PA2 ceiling.`);
  await page.screenshot({ path:path.join(out,`${engineName}-research.png`), fullPage:true });

  report.engines[engineName] = engineReport;
  report.external_requests.push(...external.map(url => ({ engine:engineName, url })));
  report.console_errors.push(...errors.map(error => ({ engine:engineName, error })));
  await browser.close();
}

await fs.writeFile(path.join(out,'observation.json'), JSON.stringify(report,null,2));
if (report.external_requests.length) throw new Error(`External requests observed: ${JSON.stringify(report.external_requests)}`);
if (report.console_errors.length) throw new Error(`Console errors observed: ${JSON.stringify(report.console_errors)}`);
console.log(JSON.stringify(report));
