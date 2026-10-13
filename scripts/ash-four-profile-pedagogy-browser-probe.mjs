import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const engines = { chromium, firefox, webkit };
const browserName = process.env.TD613_BROWSER || 'chromium';
const engine = engines[browserName];
if (!engine) throw new Error(`Unsupported browser: ${browserName}`);
const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/$/, '');
const out = path.resolve(process.env.TD613_ARTIFACT_DIR || `artifacts/ash-four-profile-pedagogy-${browserName}`);
const EPOCH = '20260721-legal-demo-ux-v1';
const assert = (value, message) => { if (!value) throw new Error(message); };

const profiles = Object.freeze({
  investigation:{ entry:'home', tasks:['Preserve source','Map contradictions','Test alternatives','Human-review finding'] },
  political_campaign:{ entry:'map', tasks:['Confirm mandate','Split public and private','Route launch work','Human-review claim'] },
  fundraiser:{ entry:'work', tasks:['State the gap','Protect relationship joins','Route asks + stewardship','Human-review ask'] },
  research:{ entry:'work', tasks:['Frame the question','Inspect method + provenance','Test + reproduce','Human-review publication'] }
});

async function waitIngress(page) {
  await page.waitForFunction(epoch => {
    const composition = window.__td613AshAia3Composition?.current?.() || null;
    return location.search.includes(`ash_epoch=${epoch}`)
      && document.documentElement.dataset.ashCompositionStable?.includes('stable-navigation-motion')
      && document.documentElement.dataset.ashCompositionRelease === 'READY_TWO_CONSECUTIVE_FRAMES'
      && document.documentElement.dataset.ashPremiumReady === 'true'
      && document.documentElement.dataset.ashDemoPedagogy
      && window.__td613AshDemoPedagogy?.version
      && window.__td613AshDemoEntryConvergence?.version
      && window.__td613AshUiUxRescue?.version
      && composition?.membrane_ready === true
      && composition?.hold == null;
  }, EPOCH, { timeout:60_000 });
}

async function waitHydrated(page, profile, entry) {
  await page.waitForFunction(({ value, expectedEntry }) => {
    const composition = window.__td613AshAia3Composition?.current?.() || null;
    const premium = window.__td613AshPremiumUI?.snapshot?.() || null;
    const pedagogy = window.__td613AshDemoPedagogy?.current?.() || null;
    const convergence = window.__td613AshDemoEntryConvergence?.current?.() || null;
    const routebar = document.getElementById('ashDemoPedagogyRouteBar');
    const active = document.documentElement.dataset.ashPremiumWorkspace || null;
    return document.documentElement.dataset.ashDemoProfile === value
      && document.documentElement.dataset.ashPedagogyProfile === value
      && document.documentElement.dataset.ashDemoEntryReady === `${value}:${expectedEntry}`
      && document.documentElement.dataset.ashDemoEntryHydrating !== 'true'
      && !document.documentElement.dataset.ashDemoEntryHold
      && premium?.profile === value
      && pedagogy?.profile === value
      && convergence?.profile === value
      && convergence?.workspace === expectedEntry
      && convergence?.posture === 'READY'
      && active === expectedEntry
      && composition?.membrane_ready === true
      && Boolean(composition?.lifecycle_state)
      && composition?.route_count >= 4
      && composition?.task_count >= 4
      && document.getElementById('ashDemoPedagogyLedger')?.dataset.profile === value
      && routebar?.dataset.profile === value
      && routebar.querySelectorAll('[data-demo-pedagogy-workspace]').length === 4
      && document.getElementById(`workspace-${active}`)?.classList.contains('active');
  }, { value:profile, expectedEntry:entry }, { timeout:90_000 });
}

async function snapshot(page, profile) {
  return page.evaluate(value => {
    const visible = node => {
      if (!node) return false;
      const style = getComputedStyle(node), rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
    };
    const current = window.__td613AshDemoPedagogy?.current?.() || null;
    const entry = window.__td613AshDemoEntryConvergence?.current?.() || null;
    const activeWorkspace = document.documentElement.dataset.ashPremiumWorkspace || null;
    const ledger = document.getElementById('ashDemoPedagogyLedger');
    return {
      profile:value,
      case_profile:window.__td613AshPremiumUI?.snapshot?.()?.profile || null,
      case_title:document.getElementById('caseTitle')?.textContent || window.__td613AshPremiumUI?.snapshot?.()?.title || null,
      pedagogy_profile:current?.profile || null,
      entry,
      entry_receipt:document.documentElement.dataset.ashDemoEntryReady || null,
      entry_hold:document.documentElement.dataset.ashDemoEntryHold || null,
      audit:current?.audit || null,
      task_labels:[...document.querySelectorAll('#ashDemoPedagogyLedger [data-demo-pedagogy-workspace] strong')].map(node => node.textContent.trim()),
      task_workspaces:[...document.querySelectorAll('#ashDemoPedagogyLedger [data-demo-pedagogy-workspace]')].map(node => node.dataset.demoPedagogyWorkspace),
      routebar_labels:[...document.querySelectorAll('#ashDemoPedagogyRouteBar [data-demo-pedagogy-workspace] span')].map(node => node.textContent.trim().replace(/^\d+ · /, '')),
      routebar_visible:visible(document.getElementById('ashDemoPedagogyRouteBar')),
      motion_labels:[...document.querySelectorAll('.ash-ux-motion-node b')].map(node => node.textContent.trim()),
      root_visible:visible(document.getElementById('ashAiaMembrane')),
      ledger_attached:Boolean(ledger),
      ledger_visible:visible(ledger),
      active_workspace:activeWorkspace,
      active_workspace_visible:visible(activeWorkspace ? document.getElementById(`workspace-${activeWorkspace}`) : null),
      main_visible:visible(document.querySelector('body > main')),
      rail_visible:visible(document.querySelector('body > .workspace-rail')),
      dormant:{
        provider_checked:Boolean(document.getElementById('providerApproval')?.checked),
        release_disabled:Boolean(document.getElementById('approveRelease')?.disabled),
        unexpected:String(document.getElementById('unexpectedText')?.value || '').trim(),
        imported:String(document.getElementById('importedReaderOutput')?.value || '').trim(),
        passphrase:String((document.querySelector('#premiumCapsulePassphrase, #capsulePassphrase'))?.value || '').trim()
      },
      overflow:Math.max(0, document.documentElement.scrollWidth - innerWidth),
      clipped:[...document.querySelectorAll('button,input,select,textarea,a')].filter(node => {
        if (!visible(node)) return false;
        const rect = node.getBoundingClientRect();
        return rect.left < -1 || rect.right > innerWidth + 1;
      }).map(node => node.id || node.textContent?.trim().slice(0,40))
    };
  }, profile);
}

async function runProfile(browser, profile, spec, report) {
  const context = await browser.newContext({ viewport:{ width:1440, height:1000 }, locale:'en-US', reducedMotion:'no-preference' });
  const page = await context.newPage();
  page.setDefaultTimeout(90_000);
  const errors = [], httpErrors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400 && !/favicon\.ico/.test(response.url())) httpErrors.push(`${response.status()} ${response.url()}`); });
  try {
    await page.goto(`${base}/dome-world/ash-keep.html?presentation=aia&profile=${profile}&nonce=${Date.now()}`, { waitUntil:'domcontentloaded' });
    await waitIngress(page);
    assert(await page.locator('#launch').isVisible(), `${profile}: ingress unavailable.`);
    await page.locator('#newProfile').selectOption(profile);
    await page.waitForFunction(value => {
      const button = document.getElementById('startDemo');
      return document.getElementById('newProfile')?.value === value && button && !button.disabled && button.getAttribute('aria-busy') !== 'true';
    }, profile);
    await page.locator('#startDemo').click();
    await waitHydrated(page, profile, spec.entry);
    const initial = await snapshot(page, profile);
    assert(initial.case_profile === profile, `${profile}: premium case profile drifted.`);
    assert(initial.pedagogy_profile === profile, `${profile}: pedagogy profile drifted.`);
    assert(initial.entry_receipt === `${profile}:${spec.entry}` && initial.entry?.posture === 'READY' && !initial.entry_hold, `${profile}: entry convergence receipt drifted.`);
    assert(initial.active_workspace === spec.entry, `${profile}: expected ${spec.entry} entry, got ${initial.active_workspace}.`);
    assert(initial.root_visible && initial.ledger_attached && initial.routebar_visible && initial.main_visible && initial.rail_visible && initial.active_workspace_visible, `${profile}: coherent active work surface missing.`);
    assert(initial.audit?.missing?.length === 0, `${profile}: missing surfaces ${JSON.stringify(initial.audit?.missing)}.`);
    assert(initial.audit?.drift?.length === 0, `${profile}: dormant/separate surface drift ${JSON.stringify(initial.audit?.drift)}.`);
    assert(JSON.stringify(initial.task_labels) === JSON.stringify(spec.tasks), `${profile}: task spine drifted ${JSON.stringify(initial.task_labels)}.`);
    assert(JSON.stringify(initial.routebar_labels) === JSON.stringify(spec.tasks), `${profile}: persistent route labels drifted ${JSON.stringify(initial.routebar_labels)}.`);
    assert(JSON.stringify(initial.motion_labels) === JSON.stringify(spec.tasks), `${profile}: motion grammar drifted ${JSON.stringify(initial.motion_labels)}.`);
    assert(initial.dormant.provider_checked === false && initial.dormant.release_disabled === true && !initial.dormant.unexpected && !initial.dormant.imported && !initial.dormant.passphrase, `${profile}: intentionally dormant surfaces were over-hydrated.`);

    const routes = [];
    const routebar = page.locator('#ashDemoPedagogyRouteBar [data-demo-pedagogy-workspace]');
    assert(await routebar.count() === 4, `${profile}: persistent routebar does not contain four steps.`);
    for (let index = 0; index < 4; index += 1) {
      const button = routebar.nth(index);
      const workspace = await button.getAttribute('data-demo-pedagogy-workspace');
      await button.click();
      await page.waitForFunction(value => document.documentElement.dataset.ashPremiumWorkspace === value && document.getElementById(`workspace-${value}`)?.classList.contains('active'), workspace);
      assert(await page.locator('#ashDemoPedagogyRouteBar').isVisible(), `${profile}: routebar disappeared in ${workspace}.`);
      routes.push(workspace);
    }
    assert(new Set(routes).size === 4, `${profile}: profile route did not exercise four distinct workspaces.`);

    const play = page.locator('[data-aia-play]');
    await play.scrollIntoViewIfNeeded();
    await play.click();
    await page.waitForFunction(() => document.documentElement.dataset.ashExplanationMotion === 'COMPLETE', null, { timeout:15_000 });
    const trace = await page.evaluate(() => JSON.parse(document.documentElement.dataset.ashExplanationTrace || '[]'));
    assert([0,1,2,3].every(value => trace.includes(value)), `${profile}: finite explanation trace incomplete ${JSON.stringify(trace)}.`);

    await page.setViewportSize({ width:390, height:844 });
    await page.locator('[data-premium-workspace="home"]').click();
    await page.waitForFunction(() => document.documentElement.dataset.ashPremiumWorkspace === 'home');
    const mobile = await snapshot(page, profile);
    assert(mobile.ledger_visible, `${profile}: full hydration ledger did not return in Home.`);
    assert(mobile.overflow === 0, `${profile}: mobile overflow ${mobile.overflow}.`);
    assert(mobile.clipped.length === 0, `${profile}: clipped controls ${mobile.clipped.join(', ')}.`);
    assert(await page.locator('#ashDemoPedagogyRouteBar').isVisible(), `${profile}: persistent routebar disappeared on mobile.`);
    await page.screenshot({ path:path.join(out, `${browserName}-${profile}.png`), fullPage:true });
    assert(errors.length === 0, `${profile}: browser errors ${errors.join(' | ')}`);
    assert(httpErrors.length === 0, `${profile}: HTTP errors ${httpErrors.join(' | ')}`);
    report.profiles[profile] = { status:'PASS', initial, routes, animation_trace:trace, mobile };
  } catch (error) {
    report.profiles[profile] = { status:'HOLD', message:error.message, stack:error.stack, errors, http_errors:httpErrors };
    try { await page.screenshot({ path:path.join(out, `${browserName}-${profile}-held.png`), fullPage:true }); } catch {}
    throw error;
  } finally {
    await context.close();
  }
}

await fs.mkdir(out, { recursive:true });
const browser = await engine.launch({ headless:true });
const report = { schema:'td613.ash.four-profile-pedagogy-browser/v0.4-entry-converged', browser:browserName, status:'RUNNING', profiles:{}, authority:{ counts_as_human_evidence:false, child_study_authorized:false, transport_authorized:false, closes_program:false } };
let terminal = null;
try {
  for (const [profile, spec] of Object.entries(profiles)) await runProfile(browser, profile, spec, report);
  report.status = 'PASS';
} catch (error) {
  terminal = error;
  report.status = 'HOLD';
  report.hold_reason = error.message;
} finally {
  await browser.close();
  report.completed_at = new Date().toISOString();
  await fs.writeFile(path.join(out, 'ash-four-profile-pedagogy-browser.json'), `${JSON.stringify(report, null, 2)}\n`);
}
if (terminal) throw terminal;
console.log(JSON.stringify({ status:report.status, browser:browserName, profiles:Object.keys(report.profiles) }, null, 2));
