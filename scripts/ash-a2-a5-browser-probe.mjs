import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const browserName = process.env.TD613_BROWSER || 'chromium';
const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/+$/, '');
const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || `artifacts/ash-a2-a5-${browserName}`);
const engine = { chromium, firefox, webkit }[browserName];
if (!engine) throw new Error(`Unsupported browser: ${browserName}`);

await fs.mkdir(artifactDir, { recursive:true });
const browser = await engine.launch({ headless:true });
const context = await browser.newContext({
  viewport:browserName === 'webkit' ? { width:390, height:844 } : { width:1365, height:900 },
  reducedMotion:'no-preference'
});
const page = await context.newPage();
const report = {
  schema:'td613.ash.a2-a5-browser-observation/v0.1',
  browser:browserName,
  base_url:base,
  status:'HOLD_FOR_REPAIR',
  observations:{},
  authority:{ counts_as_human_evidence:false, authorizes_public_route_promotion:false, authorizes_release:false, closes_program:false }
};

try {
  await page.goto(`${base}/dome-world/ash-keep.html`, { waitUntil:'domcontentloaded', timeout:90000 });
  await page.waitForFunction(() => Boolean(window.__td613AshKeep?.version)
    && document.getElementById('newProfile')
    && document.getElementById('startDemo'), null, { timeout:60000 });
  await page.locator('#newProfile').selectOption('political_campaign');
  await page.waitForFunction(() => !document.getElementById('startDemo')?.disabled, null, { timeout:60000 });
  await page.locator('#startDemo').click();

  // Observe the rendered/API state directly. Dataset receipts remain diagnostics rather than
  // prerequisites because WebKit may settle the compiled surface before the inherited token.
  await page.waitForFunction(() => {
    const field = document.querySelector('#ashAiaMembrane .ash-flowcore-field:not(.ash-flowcore-field--proxy):not([hidden])');
    if (!field) return false;
    const style = getComputedStyle(field);
    const rect = field.getBoundingClientRect();
    return Boolean(window.__td613AshWholeInstrument?.version)
      && Boolean(window.__td613AshLiveAIA?.version)
      && field.getAttribute('aria-hidden') !== 'true'
      && !field.inert
      && style.display !== 'none'
      && style.visibility !== 'hidden'
      && Number(style.opacity) > 0
      && rect.width > 0
      && rect.height > 0
      && field.querySelectorAll('[data-aia-play]').length === 1
      && !field.querySelector('[data-flowcore-ingress-play]')
      && document.getElementById('premiumPrimaryDock')
      && document.querySelector('[data-ash-route-surface]');
  }, null, { timeout:90000 });

  report.observations.boot = await page.evaluate(() => ({
    whole_instrument_api:window.__td613AshWholeInstrument?.version || null,
    live_aia_api:window.__td613AshLiveAIA?.version || null,
    whole_instrument_dataset:document.documentElement.dataset.ashWholeInstrumentPedagogy || null,
    aia_ready_dataset:document.documentElement.dataset.ashAiaReady || null,
    consequence_field_owner:document.documentElement.dataset.ashConsequenceFieldOwner || null,
    post_ingress_motion:document.documentElement.dataset.ashPostIngressMotion || null
  }));

  const field = await page.evaluate(() => {
    const rendered = node => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden'
        && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
    };
    const all = [...document.querySelectorAll('.ash-flowcore-field')];
    const visible = all.filter(rendered);
    const node = visible[0];
    const proxies = all.filter(item => item.classList.contains('ash-flowcore-field--proxy'));
    const phase = node?.querySelector('[data-flowcore-phase-label]')?.getBoundingClientRect();
    const header = node?.querySelector('.ash-flowcore-field__header')?.getBoundingClientRect();
    return {
      visible_count:visible.length,
      proxy_count:proxies.length,
      proxies_quarantined:proxies.every(item => item.hidden && item.inert
        && item.getAttribute('aria-hidden') === 'true' && !rendered(item)),
      play_count:node?.querySelectorAll('[data-aia-play]').length || 0,
      generated_play_count:node?.querySelectorAll('[data-flowcore-ingress-play]').length || 0,
      play_text:node?.querySelector('[data-aia-play]')?.textContent?.trim(),
      phase_top_right:Boolean(phase && header && phase.right <= header.right + 1 && phase.top >= header.top - 1),
      channels:[...node?.querySelectorAll('[data-flowcore-channel]') || []].map(item => item.dataset.flowcoreChannel),
      disclosure:node?.querySelector('.ash-channel-disclosure summary')?.textContent?.trim(),
      static_truth:node?.querySelector('#ashWholeInstrumentStaticTruth')?.textContent?.trim(),
      scene:node?.dataset.ashWorkspaceScene
    };
  });
  report.observations.field = field;
  if (field.visible_count !== 1) throw new Error(`Expected one visible canonical field; observed ${field.visible_count}.`);
  if (field.proxy_count && !field.proxies_quarantined) throw new Error('Synchronization proxy became presentational.');
  if (field.play_count !== 1 || field.generated_play_count !== 0) throw new Error('Expected one explicit Play gesture.');
  if (field.play_text !== '▶ Play Consequence Field') throw new Error(`Unexpected Play label: ${field.play_text}`);
  if (!field.phase_top_right) throw new Error('Phase chip left the field-header state position.');
  for (const channel of ['glyph','motion','shape','language','inspection']) {
    if (!field.channels.includes(channel)) throw new Error(`Missing channel: ${channel}`);
  }
  if (field.disclosure !== 'How this scene is speaking') throw new Error('Channel disclosure label drifted.');
  if (!/Claim ceiling:/i.test(field.static_truth || '')) throw new Error('Static truth omitted the claim ceiling.');

  await page.locator('.ash-flowcore-field:not(.ash-flowcore-field--proxy) [data-flowcore-channel="inspection"]').click();
  if (!await page.locator('[data-aia-exact]').evaluate(node => node.open)) throw new Error('Inspection did not open exact state.');
  report.observations.inspection_only_exact_descent = true;

  const routes = {};
  for (const [route,label] of [['EXPERIENTIAL','Learn by doing'],['CUSTODIAL','Protect the source'],['AUDIT','Check the evidence'],['IMPLEMENTATION','Inspect the machinery']]) {
    const button = page.locator(`[data-aia-route="${route}"]`);
    if ((await button.textContent())?.trim() !== label) throw new Error(`${route} route label drifted.`);
    await button.click();
    await page.waitForFunction(expected => document.querySelector('[data-ash-route-surface]')?.dataset.route === expected, route);
    routes[route] = await page.locator('[data-ash-route-surface]').textContent();
    if (!/Preserved exactly/i.test(routes[route] || '')) throw new Error(`${route} omitted preserved invariants.`);
  }
  if (new Set(Object.values(routes)).size !== 4) throw new Error('Route presentations were not visibly distinct.');
  report.observations.routes = routes;

  const navigation = {};
  for (const destination of ['home','map','work','choir','capsule']) {
    await page.locator(`[data-premium-workspace="${destination}"]`).click();
    await page.waitForFunction(expected => window.__td613AshWholeInstrument?.current?.()?.navigation_receipt?.destination_workspace === expected, destination);
    const receipt = await page.evaluate(() => window.__td613AshWholeInstrument.current().navigation_receipt);
    if (receipt.result !== 'ARRIVED' || !receipt.destination_heading || !receipt.destination_anchor) throw new Error(`${destination} navigation held.`);
    navigation[destination] = receipt;
  }
  report.observations.navigation = navigation;

  await page.locator('#premiumMenuButton').click();
  await page.waitForFunction(() => document.getElementById('premiumMenuButton')?.classList.contains('ash-command-discovered'));
  await page.keyboard.press('Escape');
  report.observations.command_discovery = { discovered:true, static_halo:true };

  await page.setViewportSize({ width:390, height:844 });
  await page.waitForTimeout(150);
  const mobile = await page.evaluate(() => ({
    width:innerWidth,
    scroll_width:document.documentElement.scrollWidth,
    overflow:document.documentElement.scrollWidth > innerWidth + 2,
    visible_field_count:[...document.querySelectorAll('.ash-flowcore-field')].filter(node => {
      const style = getComputedStyle(node); const rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
    }).length
  }));
  if (mobile.overflow) throw new Error(`Mobile overflow: ${mobile.scroll_width} > ${mobile.width}.`);
  if (mobile.visible_field_count !== 1) throw new Error('Mobile duplicated the visible canonical field.');
  report.observations.mobile = mobile;

  await page.screenshot({ path:path.join(artifactDir, `${browserName}-a2-a5.png`), fullPage:true });
  report.status = 'PASS';
} catch (error) {
  report.error = { message:error.message, stack:error.stack };
  await page.screenshot({ path:path.join(artifactDir, `${browserName}-a2-a5-failure.png`), fullPage:true }).catch(() => {});
  throw error;
} finally {
  await fs.writeFile(path.join(artifactDir, 'ash-a2-a5-browser-observation.json'), `${JSON.stringify(report, null, 2)}\n`);
  await browser.close();
}
