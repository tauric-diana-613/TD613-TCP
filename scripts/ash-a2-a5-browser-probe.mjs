import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const browserName = process.env.TD613_BROWSER || 'chromium';
const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/+$/, '');
const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || `artifacts/ash-a2-a5-${browserName}`);
const engines = { chromium, firefox, webkit };
const engine = engines[browserName];
if (!engine) throw new Error(`Unsupported browser: ${browserName}`);

await fs.mkdir(artifactDir, { recursive: true });
const browser = await engine.launch({ headless:true });
const context = await browser.newContext({
  viewport: browserName === 'webkit' ? { width:390, height:844 } : { width:1365, height:900 },
  reducedMotion: 'no-preference'
});
const page = await context.newPage();
const report = {
  schema:'td613.ash.a2-a5-browser-observation/v0.1',
  browser:browserName,
  base_url:base,
  status:'HOLD_FOR_REPAIR',
  observations:{},
  authority:{
    counts_as_human_evidence:false,
    authorizes_public_route_promotion:false,
    authorizes_release:false,
    closes_program:false
  }
};

try {
  await page.goto(`${base}/dome-world/ash-keep.html`, { waitUntil:'domcontentloaded', timeout:90000 });
  await page.waitForFunction(() => Boolean(window.__td613AshKeep?.version)
    && document.getElementById('newProfile')
    && document.getElementById('startDemo'), null, { timeout:60000 });

  await page.locator('#newProfile').selectOption('political_campaign');
  await page.waitForFunction(() => !document.getElementById('startDemo')?.disabled, null, { timeout:60000 });
  await page.locator('#startDemo').click();
  await page.waitForFunction(() => document.documentElement.dataset.ashWholeInstrumentPedagogy
    && document.documentElement.dataset.ashAiaReady === 'true'
    && document.querySelector('.ash-flowcore-field:not(.ash-flowcore-field--proxy)')
    && document.getElementById('premiumPrimaryDock'), null, { timeout:90000 });

  const field = await page.evaluate(() => {
    const all = [...document.querySelectorAll('.ash-flowcore-field')];
    const visible = all.filter(item => {
      if (item.hidden || item.classList.contains('ash-flowcore-field--proxy')) return false;
      const style = getComputedStyle(item);
      const rect = item.getBoundingClientRect();
      return style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number(style.opacity) > 0
        && rect.width > 0
        && rect.height > 0;
    });
    const proxies = all.filter(item => item.classList.contains('ash-flowcore-field--proxy'));
    const proxyPostures = proxies.map(item => {
      const style = getComputedStyle(item);
      const rect = item.getBoundingClientRect();
      return {
        hidden:item.hidden,
        inert:item.inert,
        aria_hidden:item.getAttribute('aria-hidden'),
        display:style.display,
        visibility:style.visibility,
        opacity:style.opacity,
        width:rect.width,
        height:rect.height,
        pointer_events:style.pointerEvents
      };
    });
    const node = visible[0] || null;
    const phase = node?.querySelector('[data-flowcore-phase-label]')?.getBoundingClientRect();
    const header = node?.querySelector('.ash-flowcore-field__header')?.getBoundingClientRect();
    const play = node?.querySelector('[data-aia-play]');
    const channels = [...node?.querySelectorAll('[data-flowcore-channel]') || []].map(item => ({
      name:item.dataset.flowcoreChannel,
      active:item.dataset.channelActive
    }));
    return {
      dom_count:all.length,
      visible_count:visible.length,
      proxy_count:proxies.length,
      proxies_quarantined:proxyPostures.every(item => item.hidden
        && item.inert
        && item.aria_hidden === 'true'
        && item.display === 'none'
        && item.visibility === 'hidden'
        && Number(item.opacity) === 0
        && item.width === 0
        && item.height === 0
        && item.pointer_events === 'none'),
      proxy_postures:proxyPostures,
      play_text:play?.textContent?.trim(),
      phase_top_right:Boolean(phase && header && phase.right <= header.right + 1 && phase.top >= header.top - 1),
      channel_names:channels.map(item => item.name),
      active_channels:channels.filter(item => item.active === 'true').map(item => item.name),
      disclosure:node?.querySelector('.ash-channel-disclosure summary')?.textContent?.trim(),
      static_truth:node?.querySelector('#ashWholeInstrumentStaticTruth')?.textContent?.trim(),
      scene:node?.dataset.ashWorkspaceScene
    };
  });
  if (field.visible_count !== 1) throw new Error(`Expected one visible canonical field; observed ${field.visible_count}.`);
  if (field.proxy_count && !field.proxies_quarantined) throw new Error('Flow-Core synchronization proxy became presentational.');
  if (field.play_text !== '▶ Play Consequence Field') throw new Error(`Unexpected Play label: ${field.play_text}`);
  if (!field.phase_top_right) throw new Error('Phase chip did not occupy the field-header state position.');
  for (const name of ['glyph','motion','shape','language','inspection']) {
    if (!field.channel_names.includes(name)) throw new Error(`Missing channel: ${name}`);
  }
  if (field.disclosure !== 'How this scene is speaking') throw new Error('Channel disclosure label drifted.');
  if (!/Claim ceiling:/i.test(field.static_truth || '')) throw new Error('Static truth omitted the claim ceiling.');
  report.observations.field = field;

  await page.locator('.ash-flowcore-field:not(.ash-flowcore-field--proxy) [data-flowcore-channel="inspection"]').click();
  const inspectionOpen = await page.locator('[data-aia-exact]').evaluate(node => node.open);
  if (!inspectionOpen) throw new Error('Inspection did not open exact technical state.');
  report.observations.inspection_only_exact_descent = true;

  const routeResults = {};
  for (const [route, label] of [
    ['EXPERIENTIAL','Learn by doing'],
    ['CUSTODIAL','Protect the source'],
    ['AUDIT','Check the evidence'],
    ['IMPLEMENTATION','Inspect the machinery']
  ]) {
    const button = page.locator(`[data-aia-route="${route}"]`);
    if ((await button.textContent())?.trim() !== label) throw new Error(`${route} route label drifted.`);
    await button.click();
    await page.waitForFunction(expected => document.querySelector('[data-ash-route-surface]')?.dataset.route === expected, route);
    routeResults[route] = await page.evaluate(() => ({
      text:document.querySelector('[data-ash-route-surface]')?.textContent?.trim(),
      delta:document.documentElement.dataset.ashRouteDelta,
      route:document.documentElement.dataset.ashAiaHumanRoute
    }));
    if (!/Preserved exactly/i.test(routeResults[route].text || '')) throw new Error(`${route} omitted preserved invariants.`);
  }
  const distinct = new Set(Object.values(routeResults).map(item => item.text));
  if (distinct.size !== 4) throw new Error(`Expected four visibly distinct route surfaces; observed ${distinct.size}.`);
  report.observations.routes = routeResults;

  const navigation = {};
  for (const destination of ['home','map','work','choir','capsule']) {
    await page.locator(`[data-premium-workspace="${destination}"]`).click();
    await page.waitForFunction(expected => window.__td613AshWholeInstrument?.current?.()?.navigation_receipt?.destination_workspace === expected, destination);
    navigation[destination] = await page.evaluate(() => window.__td613AshWholeInstrument.current().navigation_receipt);
    if (navigation[destination].result !== 'ARRIVED') throw new Error(`${destination} navigation held.`);
    if (!navigation[destination].destination_heading) throw new Error(`${destination} navigation omitted heading.`);
    if (!navigation[destination].destination_anchor) throw new Error(`${destination} navigation omitted anchor.`);
  }
  report.observations.navigation = navigation;

  await page.locator('#premiumMenuButton').click();
  await page.waitForFunction(() => document.getElementById('premiumMenuButton')?.classList.contains('ash-command-discovered'));
  report.observations.command_discovery = {
    discovered:true,
    static_halo:true
  };
  await page.keyboard.press('Escape');

  await page.setViewportSize({ width:390, height:844 });
  await page.waitForTimeout(120);
  const mobile = await page.evaluate(() => {
    const visibleFields = [...document.querySelectorAll('.ash-flowcore-field')].filter(item => {
      if (item.hidden || item.classList.contains('ash-flowcore-field--proxy')) return false;
      const style = getComputedStyle(item);
      const rect = item.getBoundingClientRect();
      return style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number(style.opacity) > 0
        && rect.width > 0
        && rect.height > 0;
    });
    return {
      width:innerWidth,
      scroll_width:document.documentElement.scrollWidth,
      overflow:document.documentElement.scrollWidth > innerWidth + 2,
      visible_field_count:visibleFields.length,
      proxy_count:document.querySelectorAll('.ash-flowcore-field--proxy').length,
      route_surface_width:document.querySelector('[data-ash-route-surface]')?.getBoundingClientRect().width || 0
    };
  });
  if (mobile.overflow) throw new Error(`Mobile horizontal overflow: ${mobile.scroll_width} > ${mobile.width}.`);
  if (mobile.visible_field_count !== 1) throw new Error('Mobile layout duplicated the visible canonical field.');
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
