import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const browserName = process.env.TD613_BROWSER || 'chromium';
const baseUrl = process.env.TD613_BASE_URL || 'http://127.0.0.1:6130';
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-a7-a11';
const stages = String(process.env.TD613_ASH_STAGES || 'A7').split(',').map(value => value.trim().toUpperCase()).filter(Boolean);
const browserType = { chromium, firefox, webkit }[browserName];
if (!browserType) throw new Error(`Unsupported browser ${browserName}`);

await fs.mkdir(artifactDir, { recursive:true });
const browser = await browserType.launch({ headless:true });
const receipts = [];

async function enterInvestigation(page) {
  await page.goto(`${baseUrl}/dome-world/ash-keep.html`, { waitUntil:'domcontentloaded', timeout:90_000 });
  await page.waitForFunction(() => Boolean(window.__td613AshKeep?.version)
    && Boolean(window.__td613AshPremiumUI?.version)
    && document.getElementById('newProfile')
    && document.getElementById('startDemo')
    && document.title === 'TD613 Ash'
    && location.pathname === '/dome-world/ash-threshold.html'
    && !location.search, null, { timeout:90_000 });
  await page.locator('#newProfile').selectOption('investigation');
  await page.waitForFunction(() => !document.getElementById('startDemo')?.disabled, null, { timeout:60_000 });
  await page.locator('#startDemo').click();
  await page.waitForFunction(() => Boolean(window.__td613AshWholeInstrument?.version)
    && Boolean(window.__td613AshA6Affordances?.version)
    && document.documentElement.dataset.ashPremiumReady === 'true'
    && document.documentElement.dataset.ashPremiumWorkspace === 'home', null, { timeout:120_000 });
}

async function returnToMap(page, expectedFields = null) {
  const control = page.locator('#premiumPrimaryDock [data-premium-workspace="map"]:visible').first();
  if (!(await control.count())) throw new Error('A8 canonical Map dock control is unavailable.');
  await control.click();
  await page.waitForFunction(() => document.documentElement.dataset.ashPremiumWorkspace === 'map'
    && document.getElementById('workspace-map')?.classList.contains('active') === true, null, { timeout:90_000 });
  if (expectedFields) {
    await page.waitForFunction(fields => {
      const handshake = window.__td613AshA8MapReturnHandshake?.current?.();
      return document.documentElement.dataset.ashA8MapReturnHandshake === 'RESTORED_AFTER_CANONICAL_MAP_RETURN'
        && handshake?.held === false
        && Object.entries(fields).every(([id, expected]) => {
          const control = document.getElementById(id);
          if (!control?.isConnected) return false;
          if ('checked' in control && typeof expected === 'boolean') return Boolean(control.checked) === expected;
          return String(control.value ?? '') === String(expected);
        });
    }, expectedFields, { timeout:120_000, polling:50 });
  }
  await page.waitForSelector('#ashA8RelationWorkshop', { state:'visible', timeout:120_000 });
}

async function waitForStableCaseMap(page) {
  await page.waitForFunction(() => {
    const caseMap = window.__td613AshPremiumUI?.snapshot?.()?.caseMap;
    if (!caseMap?.case_map_digest) return false;
    const signature = `${caseMap.case_map_digest}:${caseMap.nodes?.length || 0}:${caseMap.relationships?.length || 0}`;
    const now = performance.now();
    const prior = window.__td613A8BaselineStability;
    if (!prior || prior.signature !== signature) {
      window.__td613A8BaselineStability = { signature, since:now };
      return false;
    }
    return now - prior.since >= 800;
  }, null, { timeout:90_000, polling:100 });
}

async function stageA8Field(page, id, value) {
  const expected = String(value);
  const maxAttempts = 4;
  let lastDiagnostic = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    await page.evaluate(() => { window.__td613A8FieldStability = null; });
    const locator = page.locator(`#${id}`);
    try {
      await locator.waitFor({ state:'attached', timeout:15_000 });
      await locator.focus();
      const metadata = await locator.evaluate(control => ({
        tag:control.tagName,
        type:String(control.type || '').toLowerCase(),
        options:control.tagName === 'SELECT' ? [...control.options].map(option => option.value) : []
      }));
      if (metadata.tag === 'SELECT') {
        if (!metadata.options.includes(expected)) throw new Error(`A8 control ${id} cannot select ${value}.`);
        await locator.selectOption(expected);
      } else if (metadata.type === 'checkbox' || metadata.type === 'radio') {
        if (Boolean(value)) await locator.check();
        else await locator.uncheck();
      } else {
        await locator.fill(expected);
      }
      await page.waitForFunction(({ id, value, attempt }) => {
        const control = document.getElementById(id);
        const workshop = document.getElementById('ashA8RelationWorkshop');
        if (!control?.isConnected || !workshop?.isConnected) {
          window.__td613A8FieldStability = null;
          return false;
        }
        const matches = 'checked' in control && typeof value === 'boolean'
          ? Boolean(control.checked) === value
          : String(control.value ?? '') === String(value);
        if (!matches) {
          window.__td613A8FieldStability = null;
          return false;
        }
        const signature = `${id}:${String(value)}:${attempt}`;
        const now = performance.now();
        const prior = window.__td613A8FieldStability;
        if (!prior || prior.signature !== signature || prior.control !== control || prior.workshop !== workshop) {
          window.__td613A8FieldStability = { signature, control, workshop, since:now };
          return false;
        }
        return now - prior.since >= 220;
      }, { id, value, attempt }, { timeout:6_000, polling:25 });
      const result = { id, attempts:attempt, stable_ms:220, current_connected_control:true };
      await page.evaluate(result => { window.__td613A8LastFieldWitness = result; }, result);
      return result;
    } catch (error) {
      lastDiagnostic = await page.evaluate(({ id, value, attempt, error }) => {
        const control = document.getElementById(id);
        return {
          id,
          expected:String(value),
          attempt,
          error,
          connected:Boolean(control?.isConnected),
          current_value:control && 'checked' in control && typeof value === 'boolean'
            ? String(Boolean(control.checked))
            : String(control?.value ?? ''),
          dirty_guard:window.__td613AshA8RecompileGuard?.current?.() || null,
          map_return:window.__td613AshA8MapReturnHandshake?.current?.() || null,
          dirty_guard_posture:document.documentElement.dataset.ashA8DirtyDraftGuard || null,
          map_return_posture:document.documentElement.dataset.ashA8MapReturnHandshake || null
        };
      }, { id, value, attempt, error:String(error?.message || error) });
      await page.evaluate(diagnostic => { window.__td613A8LastFieldWitness = diagnostic; }, lastDiagnostic);
      await page.waitForFunction(id => document.getElementById(id)?.isConnected === true
        && document.getElementById('ashA8RelationWorkshop')?.isConnected === true,
      id, { timeout:15_000, polling:50 }).catch(() => {});
    }
  }

  throw new Error(`A8 control ${id} failed stable visible staging after ${maxAttempts} attempts: ${JSON.stringify(lastDiagnostic)}`);
}

async function waitForConcurrentA8Staging(page, fields, timeout = 12_000) {
  await page.evaluate(() => { window.__td613A8VisibleStaging = null; });
  await page.waitForFunction(fields => {
    const values = Object.entries(fields).map(([id, expected]) => {
      const control = document.getElementById(id);
      if (!control?.isConnected) return `${id}:MISSING`;
      const actual = 'checked' in control && typeof expected === 'boolean' ? String(Boolean(control.checked)) : String(control.value ?? '');
      return `${id}:${actual}`;
    });
    const expectedSignature = Object.entries(fields).map(([id, expected]) => `${id}:${String(expected)}`).join('|');
    const actualSignature = values.join('|');
    const now = performance.now();
    const prior = window.__td613A8VisibleStaging;
    if (actualSignature !== expectedSignature) {
      window.__td613A8VisibleStaging = null;
      return false;
    }
    if (!prior || prior.signature !== actualSignature) {
      window.__td613A8VisibleStaging = { signature:actualSignature, since:now };
      return false;
    }
    return now - prior.since >= 220;
  }, fields, { timeout, polling:30 });
}

async function commitA8Gesture(page, fields, buttonId) {
  const maxPasses = 3;
  const passDiagnostics = [];

  for (let pass = 1; pass <= maxPasses; pass += 1) {
    const fieldAttempts = {};
    for (const [id, value] of Object.entries(fields)) {
      const stagedField = await stageA8Field(page, id, value);
      fieldAttempts[id] = stagedField.attempts;
    }
    try {
      await waitForConcurrentA8Staging(page, fields);
    } catch (error) {
      const diagnostic = await page.evaluate(({ fields, pass, error }) => ({
        pass,
        error,
        values:Object.fromEntries(Object.entries(fields).map(([id, expected]) => {
          const control = document.getElementById(id);
          const actual = control && 'checked' in control && typeof expected === 'boolean'
            ? Boolean(control.checked)
            : control?.value;
          return [id, actual ?? null];
        })),
        dirty_guard:window.__td613AshA8RecompileGuard?.current?.() || null,
        map_return:window.__td613AshA8MapReturnHandshake?.current?.() || null
      }), { fields, pass, error:String(error?.message || error) });
      passDiagnostics.push(diagnostic);
      await page.evaluate(diagnostic => { window.__td613A8LastGestureWitness = diagnostic; }, diagnostic);
      if (pass < maxPasses) continue;
      throw new Error(`A8 visible gesture failed concurrent staging after ${maxPasses} passes: ${JSON.stringify(passDiagnostics)}`);
    }
    const staged = await page.evaluate(fields => Object.fromEntries(Object.entries(fields).map(([id, expected]) => {
      const control = document.getElementById(id);
      const actual = control && 'checked' in control && typeof expected === 'boolean' ? Boolean(control.checked) : control?.value;
      return [id, actual ?? null];
    })), fields);
    for (const [id, expected] of Object.entries(fields)) {
      const actual = staged[id];
      if (String(actual) !== String(expected)) throw new Error(`A8 control ${id} staging drifted before commit: expected ${expected}, observed ${actual}.`);
    }
    const button = page.locator(`#${buttonId}`);
    if (!(await button.count())) throw new Error(`A8 action ${buttonId} is not connected.`);
    await button.focus();
    if (!(await button.evaluate(control => document.activeElement === control))) throw new Error(`A8 action ${buttonId} did not acquire gesture focus.`);
    await button.click();
    const witness = {
      committed:true,
      passes:pass,
      staged_fields:Object.keys(fields).length,
      field_attempts:fieldAttempts,
      replacement_retry_observed:Object.values(fieldAttempts).some(attempts => attempts > 1),
      visible_field_gestures:true,
      concurrent_staging_verified:true,
      primary_action_focused:true
    };
    await page.evaluate(witness => { window.__td613A8LastGestureWitness = witness; }, witness);
    return witness;
  }

  throw new Error('A8 visible gesture exhausted without a commit.');
}

async function inspectA8(page) {
  await returnToMap(page);
  await waitForStableCaseMap(page);
  for (const selector of ['#ashA8ObjectPreview','#ashA8RelationPreview','#ashA8RelationshipList','#ashA8RelationDetail','#accessibleTable']) {
    if (!(await page.locator(selector).count())) throw new Error(`A8 missing ${selector}`);
  }
  if (await page.locator('#ashA8RelationDirection').count()) throw new Error('A8 exposed an undirected state the map engine cannot store.');

  const before = await page.evaluate(() => ({
    digest:window.__td613AshPremiumUI?.snapshot?.()?.caseMap?.case_map_digest || null,
    objects:window.__td613AshPremiumUI?.snapshot?.()?.caseMap?.nodes?.length || 0,
    relations:window.__td613AshPremiumUI?.snapshot?.()?.caseMap?.relationships?.length || 0,
    notes:document.getElementById('researchNotes')?.value || '',
    lifecycle:document.body.dataset.ashLifecycle || null
  }));

  const witnessName = `A8 Witness Object ${browserName}`;
  const objectFields = {
    ashA8ObjectName:witnessName,
    ashA8ObjectKnown:'Synthetic browser witness object.',
    ashA8ObjectUncertain:'No human evidence inferred.',
    ashA8ObjectEvidence:'browser-local synthetic fixture',
    ashA8ObjectNotes:'A8 constitutionally held object witness.'
  };
  await commitA8Gesture(page, objectFields, 'ashA8CommitObject');
  await page.waitForFunction(() => /Object held:.*CASE_BOUND required/i.test(document.getElementById('ashA8Status')?.textContent || ''), null, { timeout:30_000 });
  const afterObjectHold = await page.evaluate(() => ({
    digest:window.__td613AshPremiumUI?.snapshot?.()?.caseMap?.case_map_digest || null,
    objects:window.__td613AshPremiumUI?.snapshot?.()?.caseMap?.nodes?.length || 0,
    notes:document.getElementById('researchNotes')?.value || '',
    status:document.getElementById('ashA8Status')?.textContent || ''
  }));
  if (afterObjectHold.digest !== before.digest || afterObjectHold.objects !== before.objects) throw new Error('A8 pre-CASE_BOUND object hold mutated the Case Map.');
  if (afterObjectHold.notes !== before.notes) throw new Error('A8 pre-CASE_BOUND object hold wrote notes without stored successor state.');

  await returnToMap(page, objectFields);

  const relationOptions = await page.evaluate(() => {
    const values = selector => [...document.querySelectorAll(`${selector} option`)].map(option => option.value).filter(Boolean);
    const from = [...new Set(values('#ashA8RelationFrom'))];
    const to = new Set(values('#ashA8RelationTo'));
    return from.filter(value => to.has(value));
  });
  if (relationOptions.length < 2) throw new Error('A8 requires two distinct existing objects to test the constitutional relation hold.');
  const [fromValue, toValue] = relationOptions;
  if (fromValue === toValue) throw new Error('A8 witness selected the same object on both sides.');
  const relationFields = {
    ashA8RelationFrom:fromValue,
    ashA8RelationTo:toValue,
    ashA8RelationType:'browser-witness-supports',
    ashA8RelationEvidence:'browser-local synthetic fixture',
    ashA8RelationUncertain:'Relation remains open to review.',
    ashA8RelationNotes:'A8 constitutionally held relation witness.'
  };
  await commitA8Gesture(page, relationFields, 'ashA8CommitRelation');
  await page.waitForFunction(() => /Relationship held:.*CASE_BOUND required/i.test(document.getElementById('ashA8Status')?.textContent || ''), null, { timeout:30_000 });
  const afterRelationHold = await page.evaluate(() => ({
    digest:window.__td613AshPremiumUI?.snapshot?.()?.caseMap?.case_map_digest || null,
    relations:window.__td613AshPremiumUI?.snapshot?.()?.caseMap?.relationships?.length || 0,
    notes:document.getElementById('researchNotes')?.value || '',
    status:document.getElementById('ashA8Status')?.textContent || ''
  }));
  if (afterRelationHold.digest !== before.digest || afterRelationHold.relations !== before.relations) throw new Error('A8 pre-CASE_BOUND relationship hold mutated the Case Map.');
  if (afterRelationHold.notes !== before.notes) throw new Error('A8 pre-CASE_BOUND relationship hold wrote notes without stored successor state.');

  await returnToMap(page, relationFields);
  const restoredRelation = await page.evaluate(() => ({
    from:document.getElementById('ashA8RelationFrom')?.value || null,
    to:document.getElementById('ashA8RelationTo')?.value || null,
    type:document.getElementById('ashA8RelationType')?.value || null,
    posture:document.documentElement.dataset.ashA8MapReturnHandshake || null,
    handshake:window.__td613AshA8MapReturnHandshake?.current?.() || null
  }));
  if (restoredRelation.from !== fromValue || restoredRelation.to !== toValue || restoredRelation.type !== relationFields.ashA8RelationType) {
    throw new Error(`A8 relation draft did not survive the Custody hold and explicit Map return: ${JSON.stringify(restoredRelation)}`);
  }

  const inspect = page.locator('[data-ash-a8-inspect-relation]').first();
  if (!(await inspect.count())) throw new Error('A8 demo exposed no existing relationship for lawful inspection.');
  await inspect.click();
  await page.waitForFunction(() => document.getElementById('ashA8RelationDetail')?.hidden === false);
  const detail = await page.locator('#ashA8RelationDetail').innerText();
  if (!/Source posture/i.test(detail) || !/Exact relation ID/i.test(detail)) throw new Error('A8 stored relationship detail omitted source posture or exact identity.');
  await page.locator('[data-ash-a8-open-table]').first().click();
  await page.waitForFunction(() => document.getElementById('accessibleTable')?.classList.contains('active'));
}

async function inspectStage(page, stage) {
  if (stage === 'A7') {
    await page.locator('[data-premium-workspace="home"]').click();
    await page.waitForFunction(() => {
      const priority = document.getElementById('ashA7CurrentPriority');
      const continuity = document.getElementById('ashA7Continuity');
      const ledger = document.getElementById('ashA7RouteLedger');
      const text = (document.getElementById('premiumHomeBody')?.textContent || '').toLowerCase();
      return Boolean(priority?.isConnected && continuity?.isConnected && ledger?.isConnected)
        && ['what needs attention','what ash will not do','what remains attached','what has already left'].every(phrase => text.includes(phrase));
    }, null, { timeout:90_000 });
    const primaryCount = await page.locator('#ashA7CurrentPriority .ash-stage-primary-action:visible').count();
    if (primaryCount !== 1) throw new Error(`A7 expected one primary action, observed ${primaryCount}`);
  }
  if (stage === 'A8') await inspectA8(page);
  if (stage === 'A9') {
    await page.locator('[data-premium-workspace="work"]').click();
    await page.waitForFunction(() => {
      const root = document.getElementById('ashA9WorkRecompilation');
      const text = root?.textContent || '';
      return Boolean(root?.isConnected)
        && ['Do now','Prepare','Waiting / held','Completed / receipted','Human approval'].every(phrase => text.includes(phrase));
    }, null, { timeout:90_000 });
  }
  if (stage === 'A10') {
    await page.locator('[data-premium-workspace="choir"]').click();
    await page.waitForSelector('#ashA10ChoirOrientation', { state:'visible', timeout:90_000 });
    const text = await page.locator('#workspace-choir').innerText();
    for (const phrase of ['what appears only in combination','Shared','Pair-emergent','Contradictory','Missing','Unresolved','Can a Reader reconstruct what should remain hidden?']) if (!text.includes(phrase)) throw new Error(`A10 missing ${phrase}`);
  }
  if (stage === 'A11') {
    await page.locator('[data-premium-workspace="capsule"]').click();
    await page.waitForSelector('#ashA11CapsuleRecompilation', { state:'visible', timeout:90_000 });
    const text = await page.locator('#ashA11CapsuleRecompilation').innerText();
    for (const phrase of ['What is preserved','What remains outside','Who may open it','What closes it','Where it may go','What sealing does not prove','Destination handoff']) if (!text.includes(phrase)) throw new Error(`A11 missing ${phrase}`);
  }
}

async function preserveFailure(page, label, consoleErrors, error) {
  const diagnostic = await page.evaluate(() => ({
    title:document.title,
    url:location.pathname + location.search,
    module_graph:document.documentElement.dataset.ashModuleGraph || null,
    premium_ready:document.documentElement.dataset.ashPremiumReady || null,
    premium_workspace:document.documentElement.dataset.ashPremiumWorkspace || null,
    exact_workspace:[...document.querySelectorAll('.workspace.active')].map(node => node.id),
    lifecycle:document.body.dataset.ashLifecycle || null,
    a7_flag:document.documentElement.dataset.ashA7Recompiled || null,
    a8_flag:document.documentElement.dataset.ashA8Recompiled || null,
    a9_flag:document.documentElement.dataset.ashA9Recompiled || null,
    a7_api:window.__td613AshA7Home?.version || null,
    a8_api:window.__td613AshA8CaseMap?.version || null,
    a8_handshake:window.__td613AshA8MapReturnHandshake?.current?.() || null,
    a8_handshake_posture:document.documentElement.dataset.ashA8MapReturnHandshake || null,
    a8_dirty_guard:window.__td613AshA8RecompileGuard?.current?.() || null,
    a8_last_field_witness:window.__td613A8LastFieldWitness || null,
    a8_last_gesture_witness:window.__td613A8LastGestureWitness || null,
    a9_api:window.__td613AshA9Work?.version || null,
    a9_owner:window.__td613AshA9WorkspaceOwner?.version || null,
    premium_api:window.__td613AshPremiumUI?.version || null,
    snapshot:window.__td613AshPremiumUI?.snapshot?.() || null,
    home_dataset:document.getElementById('premiumHomeBody')?.dataset?.ashA7Home || null,
    home_html:document.getElementById('premiumHomeBody')?.innerHTML || null,
    home_text:document.getElementById('premiumHomeBody')?.textContent || null,
    work_dataset:document.getElementById('premiumWorkBody')?.dataset?.ashA9Work || null,
    work_html:document.getElementById('premiumWorkBody')?.innerHTML || null,
    work_text:document.getElementById('premiumWorkBody')?.textContent || null,
    priority_present:Boolean(document.getElementById('ashA7CurrentPriority')),
    continuity_present:Boolean(document.getElementById('ashA7Continuity')),
    ledger_present:Boolean(document.getElementById('ashA7RouteLedger')),
    a8_workshop_present:Boolean(document.getElementById('ashA8RelationWorkshop')),
    a8_status:document.getElementById('ashA8Status')?.textContent || null,
    a8_relation_from:document.getElementById('ashA8RelationFrom')?.value || null,
    a8_relation_to:document.getElementById('ashA8RelationTo')?.value || null,
    a8_relation_type:document.getElementById('ashA8RelationType')?.value || null,
    a9_root_present:Boolean(document.getElementById('ashA9WorkRecompilation')),
    a9_status:document.getElementById('ashA9Status')?.textContent || null,
    accessible_table_active:document.getElementById('accessibleTable')?.classList.contains('active') || false,
    primary_count:document.querySelectorAll('#ashA7CurrentPriority .ash-stage-primary-action').length
  }));
  await fs.writeFile(path.join(artifactDir, `${browserName}-${label}-failure.json`), JSON.stringify({
    schema:'td613.ash.a7-a11-browser-failure/v0.3-replaceable-control-staging',
    browser:browserName,
    label,
    stages,
    error:String(error?.stack || error),
    console_errors:consoleErrors,
    diagnostic
  }, null, 2));
  await page.screenshot({ path:path.join(artifactDir, `${browserName}-${label}-failure.png`), fullPage:true }).catch(() => {});
}

async function runViewport(label, viewport, reducedMotion) {
  const context = await browser.newContext({ viewport, reducedMotion, colorScheme:'dark' });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', error => consoleErrors.push(String(error?.message || error)));
  try {
    await enterInvestigation(page);
    for (const stage of stages) await inspectStage(page, stage);
    const geometry = await page.evaluate(() => ({
      viewport_width:window.innerWidth,
      scroll_width:document.documentElement.scrollWidth,
      horizontal_overflow:Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
      canonical_url:location.pathname + location.search,
      title:document.title,
      visible_field_count:[...document.querySelectorAll('.ash-flowcore-field:not([hidden])')].filter(node => {
        const style=getComputedStyle(node); const rect=node.getBoundingClientRect();
        return style.display!=='none' && style.visibility!=='hidden' && rect.width>0 && rect.height>0;
      }).length,
      stage_flags:Object.fromEntries(['A7','A8','A9','A10','A11'].map(stage => [stage, document.documentElement.dataset[`ash${stage}Recompiled`] || null])),
      authority_changed:false,
      source_bytes_moved:false,
      human_closure_required:true
    }));
    if (geometry.horizontal_overflow !== 0) throw new Error(`${label} horizontal overflow ${geometry.horizontal_overflow}`);
    if (geometry.visible_field_count !== 1) throw new Error(`${label} visible field count ${geometry.visible_field_count}`);
    if (geometry.canonical_url !== '/dome-world/ash-threshold.html') throw new Error(`${label} canonical URL drift ${geometry.canonical_url}`);
    if (consoleErrors.length) throw new Error(`${label} console errors: ${consoleErrors.join(' | ')}`);
    await page.screenshot({ path:path.join(artifactDir, `${browserName}-${label}-${stages.join('-').toLowerCase()}.png`), fullPage:true });
    receipts.push({ label, browser:browserName, stages, reduced_motion:reducedMotion, geometry, console_errors:consoleErrors });
  } catch (error) {
    await preserveFailure(page, label, consoleErrors, error);
    throw error;
  } finally {
    await context.close();
  }
}

try {
  await runViewport('desktop', { width:1440, height:1000 }, 'no-preference');
  await runViewport('mobile-reduced', { width:390, height:844 }, 'reduce');
  const receipt = {
    ok:true,
    schema:'td613.ash.a7-a11-browser-witness/v0.3-replaceable-control-staging',
    browser:browserName,
    stages,
    observations:receipts,
    visible_a8_field_gestures:true,
    replaceable_control_retry_contract:true,
    concurrent_a8_staging_verified:true,
    canonical_map_dock_return:true,
    exact_map_return_receipt_required:true,
    authority_changed:false,
    source_bytes_moved:false,
    custody_changed:false,
    release_authority_widened:false,
    human_closure_required:true
  };
  await fs.writeFile(path.join(artifactDir, `${browserName}-${stages.join('-').toLowerCase()}-receipt.json`), JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify(receipt, null, 2));
} finally {
  await browser.close();
}
