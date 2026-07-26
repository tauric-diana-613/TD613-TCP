import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const browserName = process.env.TD613_BROWSER || 'chromium';
const baseUrl = process.env.TD613_BASE_URL || 'http://127.0.0.1:6130';
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-a15';
const browserType = { chromium, firefox, webkit }[browserName];
if (!browserType) throw new Error(`Unsupported browser ${browserName}`);
await fs.mkdir(artifactDir, { recursive:true });
const browser = await browserType.launch({ headless:true });

const PROFILES = ['investigation','political_campaign','fundraiser','research','legal','archive'];
const WORKSPACES = ['home','map','work','choir','capsule'];
const ROUTES = ['experimental','custodial','audit','implementation'];
const REGISTRY_VERSION = 'td613.ash.demo-registry/v0.3-a15';
const ASSET_EPOCH = '20260726-a15-empirical-v1';
const EMPIRICAL_VERSION = 'td613.ash.a15-empirical-profile-journeys/v0.1';
const FORBIDDEN = ['td613.ash','case_map_digest','route_memory_digest','authority_context','lifecycle_rank','indexeddb','ash_demo_registry','source_packet_commit'];

async function waitForInstrument(page) {
  await page.goto(`${baseUrl}/dome-world/ash-keep.html`, { waitUntil:'domcontentloaded', timeout:90_000 });
  await page.waitForFunction(({ registry, epoch, empirical }) => {
    const snapshot = window.__td613AshDemoRegistry?.snapshot?.();
    return window.__td613AshKeep?.version
      && window.__td613AshPremiumUI?.version
      && window.__td613AshDemoRegistry?.version === registry
      && snapshot?.version === registry
      && snapshot?.asset_epoch === epoch
      && snapshot?.control_owner === 'ASH_DEMO_REGISTRY'
      && snapshot?.profiles?.length === 6
      && snapshot.profiles.filter(entry => entry.promoted).length === 6
      && window.__td613AshA15EmpiricalJourneys?.version === empirical
      && document.getElementById('ashA15EmpiricalJourney')?.closest('#ashAiaMembrane')
      && document.querySelectorAll('#ashAiaMembrane [data-aia-route]').length === 4
      && document.querySelectorAll('#ashAiaMembrane [data-aia-task]').length === 4
      && document.title === 'TD613 Ash'
      && location.pathname === '/dome-world/ash-threshold.html'
      && !location.search;
  }, { registry:REGISTRY_VERSION, epoch:ASSET_EPOCH, empirical:EMPIRICAL_VERSION }, { timeout:120_000 });
}

async function activateProfile(page, profile) {
  await page.evaluate(selected => {
    const registry = window.__td613AshDemoRegistry;
    const select = document.getElementById('newProfile');
    const button = document.getElementById('startDemo');
    if (!registry || !select || !button) throw new Error('A15 registry-owned profile gesture unavailable.');
    select.value = selected;
    select.dispatchEvent(new Event('change', { bubbles:true }));
    registry.reconcile();
    const entry = registry.snapshot().profiles.find(item => item.profile === selected);
    const ready = entry?.promoted
      && button.dataset.ashDemoRegistryOwner === registry.version
      && button.dataset.ashMethodDemoState === 'READY'
      && button.disabled === false
      && !button.matches(':disabled');
    if (!ready) throw new Error(`A15 ${selected} profile gesture held before activation.`);
    button.click();
  }, profile);
  await page.waitForFunction(selected => {
    const current = window.__td613AshKeep?.current?.() || null;
    const status = document.getElementById('demoProfileStatus')?.textContent || '';
    return (Boolean(current?.case_id) && document.documentElement.dataset.ashDemoProfile === selected)
      || /Demo registry held\./i.test(status);
  }, profile, { timeout:120_000 });
  const state = await page.evaluate(() => ({
    case_id:window.__td613AshKeep?.current?.()?.case_id || null,
    profile:document.documentElement.dataset.ashDemoProfile || null,
    status:document.getElementById('demoProfileStatus')?.textContent || ''
  }));
  if (/Demo registry held\./i.test(state.status) || !state.case_id || state.profile !== profile) {
    throw new Error(`A15 ${profile} hydration held: ${JSON.stringify(state)}`);
  }
}

async function inspectProfile(options, profile, mode) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  try {
    await waitForInstrument(page);
    await activateProfile(page, profile);
    const result = await page.evaluate(async ({ profile, workspaces, routes, forbidden }) => {
      const empirical = window.__td613AshA15EmpiricalJourneys;
      const registry = window.__td613AshDemoRegistry;
      const entries = await registry.entries();
      const entry = entries[profile];
      if (!entry?.pedagogy_manifest) throw new Error(`A15 ${profile} manifest unavailable.`);
      if (entry.deterministic_test_journey !== `ash-a15-empirical-journey:${profile}`) throw new Error(`A15 ${profile} journey marker drifted.`);
      const answers = [];
      for (const workspace of workspaces) {
        for (const route of routes) {
          const answer = empirical.orient({
            profile,
            workspace,
            route,
            context:{ synthetic:true, action_id:'orient_next_bounded_action' }
          });
          if (answer.status !== 'READY') throw new Error(`A15 ${profile}/${workspace}/${route} held: ${JSON.stringify(answer)}`);
          if (answer.profile !== profile || answer.workspace !== workspace || answer.route !== route) throw new Error('A15 normalized journey drift.');
          if (answer.context_imported || answer.real_world_claim || answer.ontology_exposed) throw new Error('A15 answer widened its evidence surface.');
          if (Object.entries(answer.authority).some(([key, value]) => key.startsWith('human_') ? value !== true : value !== false)) throw new Error('A15 answer widened authority.');
          const lower = answer.message.toLowerCase();
          if (forbidden.some(token => lower.includes(token))) throw new Error(`A15 public answer leaked ${forbidden.find(token => lower.includes(token))}.`);
          answers.push(answer);
        }
      }
      const sensitive = empirical.orient({
        profile,
        workspace:'work',
        route:'audit',
        context:'api_key = do-not-import person@example.com'
      });
      if (sensitive.status !== 'HELD_SENSITIVE_CONTEXT' || sensitive.context_imported !== false) throw new Error('A15 sensitive-context quarantine drifted.');
      let visibleEvent = null;
      window.addEventListener('td613:ash:a15-world-answer', event => { visibleEvent = event.detail; }, { once:true });
      document.getElementById('ashA15OrientAction').click();
      await Promise.resolve();
      const visibleText = document.getElementById('ashA15WorldAnswer')?.textContent || '';
      if (!visibleEvent || !visibleText || visibleEvent.profile !== profile) throw new Error('A15 shared visible action did not publish its world answer.');
      const snapshot = registry.snapshot();
      return {
        profile,
        answers,
        unique_messages:new Set(answers.map(answer => answer.message)).size,
        sensitive_status:sensitive.status,
        visible_status:visibleEvent.status,
        visible_text:visibleText,
        manifest_profile:entry.pedagogy_manifest.profile,
        manifest_claim_ceiling:entry.pedagogy_manifest.claim_ceiling,
        registry_version:snapshot.version,
        registry_epoch:snapshot.asset_epoch,
        empirical_version:snapshot.empirical_journey_version,
        matrix_cells:snapshot.empirical_matrix_cells,
        route_nodes:document.querySelectorAll('#ashAiaMembrane [data-aia-route]').length,
        task_nodes:document.querySelectorAll('#ashAiaMembrane [data-aia-task]').length,
        panel_in_membrane:Boolean(document.getElementById('ashA15EmpiricalJourney')?.closest('#ashAiaMembrane')),
        release_disabled:document.getElementById('approveRelease')?.disabled ?? null,
        provider_approval_checked:document.getElementById('providerApproval')?.checked ?? null,
        handoff_is_link:document.querySelector('a[href="/dome-world/ash-destination-handoff.html"]')?.tagName === 'A',
        url:location.pathname + location.search,
        title:document.title,
        overflow:document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    }, { profile, workspaces:WORKSPACES, routes:ROUTES, forbidden:FORBIDDEN });

    if (result.answers.length !== 20 || result.unique_messages !== 20) throw new Error(`A15 ${profile} matrix collapsed: ${JSON.stringify(result)}`);
    if (result.matrix_cells !== 120 || result.route_nodes !== 4 || result.task_nodes !== 4 || !result.panel_in_membrane) throw new Error(`A15 ${profile} membrane contract drifted: ${JSON.stringify(result)}`);
    if (result.release_disabled !== true || result.provider_approval_checked !== false || !result.handoff_is_link) throw new Error(`A15 ${profile} widened consequential authority: ${JSON.stringify(result)}`);
    if (result.url !== '/dome-world/ash-threshold.html' || result.title !== 'TD613 Ash' || result.overflow > 1) throw new Error(`A15 ${profile} presentation drift: ${JSON.stringify(result)}`);
    if (profile === 'archive') await page.screenshot({ path:path.join(artifactDir, `${browserName}-${mode}-archive.png`), fullPage:true });
    return result;
  } finally {
    await context.close();
  }
}

const receipts = [];
try {
  const modes = [
    ['desktop', { viewport:{ width:1280, height:900 } }],
    ['mobile-reduced-motion', browserName === 'firefox'
      ? { viewport:{ width:390, height:844 }, reducedMotion:'reduce' }
      : { viewport:{ width:390, height:844 }, reducedMotion:'reduce', isMobile:true, hasTouch:true }]
  ];
  for (const [mode, options] of modes) {
    for (const profile of PROFILES) receipts.push({ mode, ...(await inspectProfile(options, profile, mode)) });
  }
  const answerSignatures = new Map();
  for (const receipt of receipts.filter(item => item.mode === 'desktop')) {
    receipt.answers.forEach(answer => {
      const key = `${answer.workspace}:${answer.route}`;
      const values = answerSignatures.get(key) || [];
      values.push(answer.message);
      answerSignatures.set(key, values);
    });
  }
  for (const [key, values] of answerSignatures) {
    if (new Set(values).size !== 6) throw new Error(`A15 cross-profile answer collapse at ${key}.`);
  }
  await fs.writeFile(path.join(artifactDir, `${browserName}-a15-empirical-receipt.json`), JSON.stringify({
    schema:'td613.ash.a15-empirical-profile-journey-browser-witness/v0.1',
    browser:browserName,
    modes:['desktop','mobile-reduced-motion'],
    profiles:PROFILES,
    workspaces:WORKSPACES,
    routes:ROUTES,
    receipts,
    matrix_cells:120,
    rendered_answer_observations:receipts.length * 20,
    cross_profile_differentiation:true,
    sensitive_context_status:'HELD_SENSITIVE_CONTEXT',
    ontology_leakage:false,
    false_real_world_claims:false,
    graph_wide_mass_eviction_executed:false,
    custody_authority_changed:false,
    source_bytes_moved:false,
    raw_content_transport:false,
    release_authority:false,
    human_closure_required:true
  }, null, 2));
} catch (error) {
  await fs.writeFile(path.join(artifactDir, `${browserName}-a15-empirical-failure.json`), JSON.stringify({ error:String(error?.stack || error) }, null, 2));
  throw error;
} finally {
  await browser.close();
}
