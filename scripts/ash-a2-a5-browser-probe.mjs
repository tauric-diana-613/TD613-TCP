import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const browserName = process.env.TD613_BROWSER || 'chromium';
const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/+$/, '');
const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || `artifacts/ash-a2-a6-${browserName}`);
const engine = { chromium, firefox, webkit }[browserName];
const canonicalInspectionSelector = '.ash-flowcore-field:not(.ash-flowcore-field--proxy):not([hidden]) [data-flowcore-channel="inspection"]';
if (!engine) throw new Error(`Unsupported browser: ${browserName}`);

await fs.mkdir(artifactDir, { recursive:true });
const browser = await engine.launch({ headless:true });
const context = await browser.newContext({
  viewport:browserName === 'webkit' ? { width:390, height:844 } : { width:1365, height:900 },
  reducedMotion:'no-preference'
});
const page = await context.newPage();
const report = {
  schema:'td613.ash.a2-a6-browser-observation/v0.1',
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

  await page.waitForFunction(() => {
    const field = document.querySelector('#ashAiaMembrane .ash-flowcore-field:not(.ash-flowcore-field--proxy):not([hidden])');
    if (!field) return false;
    const style = getComputedStyle(field);
    const rect = field.getBoundingClientRect();
    return Boolean(window.__td613AshWholeInstrument?.version)
      && Boolean(window.__td613AshLiveAIA?.version)
      && Boolean(window.__td613AshA6Affordances?.version)
      && style.display !== 'none'
      && style.visibility !== 'hidden'
      && Number(style.opacity) > 0
      && rect.width > 0
      && rect.height > 0
      && document.getElementById('premiumPrimaryDock')
      && document.getElementById('ashA6LocalDocumentSurface')
      && document.getElementById('ashA6DraftSurface');
  }, null, { timeout:90000 });

  report.observations.boot = await page.evaluate(() => ({
    whole_instrument_api:window.__td613AshWholeInstrument?.version || null,
    live_aia_api:window.__td613AshLiveAIA?.version || null,
    a6_affordance_api:window.__td613AshA6Affordances?.version || null,
    consequence_field_owner:document.documentElement.dataset.ashConsequenceFieldOwner || null,
    a6_state:document.documentElement.dataset.ashA6AffordanceRepair || null
  }));

  const field = await page.evaluate(() => {
    const rendered = node => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden'
        && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
    };
    const all = [...document.querySelectorAll('.ash-flowcore-field')];
    const shown = all.filter(rendered);
    const node = shown[0];
    const phase = node?.querySelector('[data-flowcore-phase-label]')?.getBoundingClientRect();
    const header = node?.querySelector('.ash-flowcore-field__header')?.getBoundingClientRect();
    return {
      visible_count:shown.length,
      proxies_quarantined:all.filter(item => item.classList.contains('ash-flowcore-field--proxy'))
        .every(item => item.hidden && item.inert && item.getAttribute('aria-hidden') === 'true' && !rendered(item)),
      play_count:node?.querySelectorAll('[data-aia-play]').length || 0,
      generated_play_count:node?.querySelectorAll('[data-flowcore-ingress-play]').length || 0,
      play_text:node?.querySelector('[data-aia-play]')?.textContent?.trim(),
      phase_top_right:Boolean(phase && header && phase.right <= header.right + 1 && phase.top >= header.top - 1),
      channels:[...node?.querySelectorAll('[data-flowcore-channel]') || []].map(item => item.dataset.flowcoreChannel),
      disclosure:node?.querySelector('.ash-channel-disclosure summary')?.textContent?.trim(),
      static_truth:node?.querySelector('#ashWholeInstrumentStaticTruth')?.textContent?.trim()
    };
  });
  if (field.visible_count !== 1 || !field.proxies_quarantined) throw new Error('Canonical field ownership failed.');
  if (field.play_count !== 1 || field.generated_play_count !== 0 || field.play_text !== '▶ Play Consequence Field') throw new Error('Explicit Play ownership failed.');
  if (!field.phase_top_right) throw new Error('Phase chip left the field-header state position.');
  for (const channel of ['glyph','motion','shape','language','inspection']) if (!field.channels.includes(channel)) throw new Error(`Missing channel: ${channel}`);
  if (field.disclosure !== 'How this scene is speaking' || !/Claim ceiling:/i.test(field.static_truth || '')) throw new Error('Field disclosure or static truth drifted.');
  report.observations.field = field;

  const routes = {};
  for (const [route,label] of [['EXPERIENTIAL','Learn by doing'],['CUSTODIAL','Protect the source'],['AUDIT','Check the evidence'],['IMPLEMENTATION','Inspect the machinery']]) {
    const button = page.locator(`[data-aia-route="${route}"]`);
    if ((await button.textContent())?.trim() !== label) throw new Error(`${route} route label drifted.`);
    await button.click();
    await page.waitForFunction(expected => document.querySelector('[data-ash-route-surface]')?.dataset.route === expected, route);
    routes[route] = (await page.locator('[data-ash-route-surface]').textContent()) || '';
    if (!/Preserved exactly/i.test(routes[route])) throw new Error(`${route} omitted preserved invariants.`);
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
  if (!/Cases & profiles/i.test((await page.locator('[data-command-action="profile"]').textContent()) || '')) throw new Error('Cases & profiles label drifted.');
  await page.keyboard.press('Escape');

  await page.evaluate(async () => {
    const draft = document.getElementById('draftBody');
    if (draft) {
      draft.value = '';
      draft.dispatchEvent(new InputEvent('input', { bubbles:true, inputType:'deleteContent', data:null }));
    }
    await window.__td613AshLiveAIA?.refresh?.();
    window.__td613AshA6Affordances?.refresh?.('WITNESS_DOCUMENT_POSTURE');
  });
  await page.waitForFunction(() => window.__td613AshLiveAIA?.current?.()?.task === 'document'
    && document.querySelector('[data-aia-primary-task]')?.textContent?.trim() === 'Open Local Document'
    && document.querySelector('[data-aia-open-workspace]')?.textContent?.trim() === 'Open Draft Workspace');

  const primary = page.locator('[data-aia-primary-task]');
  const exact = page.locator('[data-aia-open-workspace]');
  await primary.click();
  await page.waitForFunction(() => {
    const current = window.__td613AshA6Affordances?.current?.();
    return current?.last_navigation_receipt?.source_control === 'openLocalDocument'
      && current.last_navigation_receipt.destination_workspace === 'work'
      && document.activeElement?.id === 'ashA6ChooseLocalDocument';
  });
  const localDocumentReceipt = await page.evaluate(() => window.__td613AshA6Affordances.current().last_navigation_receipt);
  if (localDocumentReceipt.destination_anchor !== 'ashA6LocalDocumentSurface') throw new Error('Open Local Document missed its Work anchor.');

  await exact.click();
  await page.waitForFunction(() => {
    const current = window.__td613AshA6Affordances?.current?.();
    return current?.last_navigation_receipt?.source_control === 'openDraftWorkspace'
      && current.last_navigation_receipt.destination_workspace === 'work'
      && document.activeElement?.id === 'ashA6DraftBody';
  });
  const draftReceipt = await page.evaluate(() => window.__td613AshA6Affordances.current().last_navigation_receipt);
  if (draftReceipt.destination_anchor !== 'ashA6DraftSurface') throw new Error('Open Draft Workspace missed its Work anchor.');

  const draftText = 'A6 browser-local draft witness. No transport occurred.';
  await page.locator('#ashA6DraftBody').fill(draftText);
  await page.waitForFunction(expected => document.getElementById('draftBody')?.value === expected, draftText);
  const draftState = await page.evaluate(() => ({
    proxy:document.getElementById('ashA6DraftBody')?.value,
    exact:document.getElementById('draftBody')?.value,
    world_answer:window.__td613AshA6Affordances?.current?.()?.last_world_answer,
    workspace:document.documentElement.dataset.ashPremiumWorkspace
  }));
  if (draftState.proxy !== draftText || draftState.exact !== draftText || draftState.workspace !== 'work') throw new Error('Local draft surface lost exact parity or Work ownership.');
  if (draftState.world_answer?.source_bytes_moved !== false || draftState.world_answer?.authority_changed !== false) throw new Error('Local draft world answer widened authority or transport.');

  for (let index = 0; index < 4; index += 1) {
    const previous = page.locator('[data-aia-previous]');
    if (await previous.isDisabled()) break;
    await previous.click();
  }
  const lessonBefore = await page.evaluate(() => ({
    frame:document.querySelector('[data-aia-stage]')?.dataset.frame,
    previous_disabled:document.querySelector('[data-aia-previous]')?.disabled,
    previous_description:document.getElementById(document.querySelector('[data-aia-previous]')?.getAttribute('aria-describedby') || '')?.textContent || ''
  }));
  if (lessonBefore.frame !== 'setup' || !lessonBefore.previous_disabled || !/already first|earlier lesson/i.test(lessonBefore.previous_description)) throw new Error('Previous Lesson did not truthfully hold at the first scene.');

  await page.locator('[data-aia-next]').click();
  await page.waitForFunction(() => document.querySelector('[data-aia-stage]')?.dataset.frame === 'document');
  const lessonAfter = await page.evaluate(() => ({
    frame:document.querySelector('[data-aia-stage]')?.dataset.frame,
    status:document.getElementById('ashA6LessonStatus')?.textContent || ''
  }));
  if (!/Lesson 2 of 4/i.test(lessonAfter.status)) throw new Error('Next Lesson produced no visible world answer.');

  await page.locator('[data-aia-exact]').evaluate(node => { node.open = false; });
  const lifecycleBeforeRest = await page.evaluate(() => window.__td613AshLiveAIA?.current?.()?.lifecycle_state || null);
  await page.locator('[data-aia-rest]').click();
  await page.waitForFunction(() => document.body.dataset.ashAiaResting === 'true'
    && document.documentElement.dataset.ashA6Rest === 'STRUCTURAL_REST');
  const restBeforeInspection = await page.evaluate(selector => ({
    play_disabled:document.querySelector('[data-aia-play]')?.disabled,
    next_disabled:document.querySelector('[data-aia-next]')?.disabled,
    task_disabled:[...document.querySelectorAll('[data-aia-task]')].every(button => button.disabled),
    inspection_disabled:document.querySelector(selector)?.disabled || false,
    status:document.getElementById('ashA6LessonStatus')?.textContent || '',
    lifecycle:window.__td613AshLiveAIA?.current?.()?.lifecycle_state || null
  }), canonicalInspectionSelector);
  if (!restBeforeInspection.play_disabled || !restBeforeInspection.next_disabled || !restBeforeInspection.task_disabled) throw new Error('Structural Rest left a fresh demand control active.');
  if (restBeforeInspection.inspection_disabled) throw new Error('Structural Rest disabled Inspection.');
  if (!/current consequence|Structural Rest/i.test(restBeforeInspection.status)) throw new Error('Structural Rest lacked a visible world answer.');
  if (restBeforeInspection.lifecycle !== lifecycleBeforeRest) throw new Error('Structural Rest mutated lifecycle state.');

  await page.locator(canonicalInspectionSelector).click();
  await page.waitForFunction(() => document.querySelector('[data-aia-exact]')?.open === true);
  const restState = { ...restBeforeInspection, exact_opened_during_rest:true };

  await page.locator('[data-aia-return]').click();
  await page.waitForFunction(() => document.body.dataset.ashAiaResting === 'false'
    && document.documentElement.dataset.ashA6Rest === 'AVAILABLE');
  if (await page.locator('[data-aia-next]').isDisabled()) throw new Error('Return failed to restore the next lesson control.');
  await page.locator('[data-aia-previous]').click();
  await page.waitForFunction(() => document.querySelector('[data-aia-stage]')?.dataset.frame === 'setup');

  const a6 = await page.evaluate(() => {
    const roots = [...document.querySelectorAll('#ashAiaMembrane,#workspace-home,#workspace-work,#workspace-choir,#workspace-capsule,#premiumCommandSheet')];
    const rendered = node => {
      const style = getComputedStyle(node); const rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
    };
    const disabledVisible = roots.flatMap(root => [...root.querySelectorAll('button:disabled')]).filter(rendered).map(node => ({
      id:node.id || node.dataset.aiaTask || node.textContent?.trim(),
      state:node.dataset.ashAffordanceState || null,
      described_by:node.getAttribute('aria-describedby'),
      description:document.getElementById(node.getAttribute('aria-describedby') || '')?.textContent?.trim() || ''
    }));
    const emptyDetails = roots.flatMap(root => [...root.querySelectorAll('details')]).filter(details => {
      const content = [...details.children].filter(child => child.tagName !== 'SUMMARY');
      return !content.some(child => child.textContent?.trim() || child.querySelector('input,button,textarea,select,pre,table,svg'));
    }).map(details => details.querySelector('summary')?.textContent?.trim() || 'unnamed');
    return {
      api:window.__td613AshA6Affordances?.current?.(),
      disabled_visible:disabledVisible,
      empty_details:emptyDetails,
      transition_intro:document.querySelector('.ash-a6-transition-intro')?.textContent?.trim() || '',
      legend_states:[...document.querySelectorAll('[data-flowcore-channel]:not(button)')].map(node => node.dataset.ashAffordanceState),
      global_status:document.getElementById('ashA6GlobalStatus')?.textContent?.trim() || ''
    };
  });
  for (const control of a6.disabled_visible) if (control.state !== 'HELD_WITH_EXPLANATION' || !control.description) throw new Error(`Visible held control lacked a complete explanation: ${control.id}`);
  if (a6.empty_details.length) throw new Error(`Empty disclosure bodies survived A6: ${a6.empty_details.join(', ')}`);
  if (!/You changed how Ash explains this case/i.test(a6.transition_intro)
    || !/underlying case state did not change/i.test(a6.transition_intro)) throw new Error('Transition-delta drawer omitted the invariant answer.');
  if (!a6.legend_states.length || a6.legend_states.some(state => state !== 'LEGEND_ONLY')) throw new Error('Decorative channel tokens retained pseudo-control semantics.');
  if (a6.api?.authority_changed !== false || a6.api?.source_bytes_moved !== false
    || a6.api?.custody_changed !== false || a6.api?.release_posture_changed !== false
    || a6.api?.closure_changed !== false || a6.api?.human_closure_required !== true) throw new Error('A6 API widened the constitutional boundary.');

  report.observations.a6 = {
    local_document_receipt:localDocumentReceipt,
    draft_receipt:draftReceipt,
    draft_state:draftState,
    lesson_before:lessonBefore,
    lesson_after:lessonAfter,
    rest:restState,
    closure:a6
  };

  await page.setViewportSize({ width:390, height:844 });
  await page.waitForTimeout(180);
  const mobile = await page.evaluate(() => {
    const local = document.getElementById('ashA6LocalDocumentSurface')?.getBoundingClientRect();
    const draft = document.getElementById('ashA6DraftSurface')?.getBoundingClientRect();
    const rendered = node => {
      const style = getComputedStyle(node); const rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
    };
    return {
      width:innerWidth,
      scroll_width:document.documentElement.scrollWidth,
      overflow:document.documentElement.scrollWidth > innerWidth + 2,
      visible_field_count:[...document.querySelectorAll('.ash-flowcore-field')].filter(rendered).length,
      local_document_width:local?.width || 0,
      draft_width:draft?.width || 0,
      a6_surfaces_stacked:Boolean(local && draft && Math.abs(local.left - draft.left) < 2 && draft.top > local.top)
    };
  });
  if (mobile.overflow || mobile.visible_field_count !== 1) throw new Error('A6 mobile presentation overflowed or duplicated the field.');
  if (!mobile.a6_surfaces_stacked || mobile.local_document_width > mobile.width || mobile.draft_width > mobile.width) throw new Error('A6 Work surfaces failed mobile reflow.');
  report.observations.mobile = mobile;

  await page.screenshot({ path:path.join(artifactDir, `${browserName}-a2-a6.png`), fullPage:true });
  report.status = 'PASS';
} catch (error) {
  report.error = { message:error.message, stack:error.stack };
  await page.screenshot({ path:path.join(artifactDir, `${browserName}-a2-a6-failure.png`), fullPage:true }).catch(() => {});
  throw error;
} finally {
  await fs.writeFile(path.join(artifactDir, 'ash-a2-a6-browser-observation.json'), `${JSON.stringify(report, null, 2)}\n`);
  await browser.close();
}
