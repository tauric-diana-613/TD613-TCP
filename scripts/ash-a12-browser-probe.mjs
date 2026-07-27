import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const corePath = path.join(scriptsDir, 'ash-a12-browser-probe-stable-entry.mjs');
const tempPath = path.join(scriptsDir, `.ash-a12-browser-probe-present-state-field-${process.pid}.mjs`);

function replaceExactly(source, marker, replacement, label) {
  const count = source.split(marker).length - 1;
  if (count !== 1) throw new Error(`${label} expected exactly one marker; observed ${count}`);
  return source.replace(marker, replacement);
}

let source = await fs.readFile(corePath, 'utf8');

source = replaceExactly(
  source,
  `      if (!existing.case_id || existing.pointer !== existing.case_id || existing.profile !== 'investigation') {
        await activateInvestigationDemo(page);
      }
      await waitForStableInvestigationEntry(page, attempt);
      return attempt;`,
  `      if (!existing.case_id || existing.pointer !== existing.case_id || existing.profile !== 'investigation') {
        await activateInvestigationDemo(page);
      }
      const entry_convergence_rebind = await page.evaluate(() => {
        const current = window.__td613AshKeep?.current?.() || null;
        const pointer = localStorage.getItem('td613.ash-keep.current-case');
        const convergence = window.__td613AshDemoEntryConvergence;
        if (!current?.case_id || pointer !== current.case_id || typeof convergence?.begin !== 'function') {
          throw new Error('A12 present-state convergence owner unavailable after case settlement.');
        }
        const before = convergence.current?.() || null;
        const began = convergence.begin({ detail:{ case_id:current.case_id, profile:'investigation' } });
        const after = convergence.current?.() || null;
        const receipt = Object.freeze({
          schema:'td613.ash.a12-present-state-convergence-rebind/v0.1',
          case_id:current.case_id,
          profile:'investigation',
          pointer_concordant:pointer === current.case_id,
          before,
          begin_invoked:Boolean(began),
          after,
          authority_changed:false,
          source_bytes_moved:false,
          case_data_preserved:true,
          profile_inferred:false,
          human_closure_required:true
        });
        window.__td613A12EntryConvergenceRebind = receipt;
        return receipt;
      });
      if (!entry_convergence_rebind.begin_invoked) throw new Error('A12 present-state convergence rebind was not admitted.');
      await waitForStableInvestigationEntry(page, attempt);
      return attempt;`,
  'A12 present-state entry convergence rebind'
);

source = replaceExactly(
  source,
  `      registry_status:document.getElementById('demoProfileStatus')?.textContent || ''`,
  `      registry_status:document.getElementById('demoProfileStatus')?.textContent || '',
      entry_convergence_rebind:window.__td613A12EntryConvergenceRebind || null,
      canonical_field_stability:window.__td613A12CanonicalFieldStability ? {
        signature:window.__td613A12CanonicalFieldStability.signature,
        since:window.__td613A12CanonicalFieldStability.since,
        label:window.__td613A12CanonicalFieldStability.label
      } : null`,
  'A12 rebind and field diagnostic projection'
);

source = replaceExactly(
  source,
  `async function inspectEntryPreflight(page, label) {`,
  `const ENTRY_FIELD_QUIET_MS = 220;

async function canonicalFieldDiagnostic(page, label, error) {
  return page.evaluate(({ label, error }) => {
    const stage = document.querySelector('#ashAiaMembrane [data-aia-stage], .ash-aia__stage');
    const describe = field => {
      const style = field ? getComputedStyle(field) : null;
      const rect = field?.getBoundingClientRect();
      return {
        connected:Boolean(field?.isConnected),
        class_name:field?.className || null,
        hidden:field?.hidden ?? null,
        inert:field?.inert ?? null,
        aria_hidden:field?.getAttribute?.('aria-hidden') || null,
        display:style?.display || null,
        visibility:style?.visibility || null,
        opacity:style?.opacity || null,
        width:rect?.width || 0,
        height:rect?.height || 0,
        parent_id:field?.parentElement?.id || null,
        parent_class:field?.parentElement?.className || null,
        flowcore_host:field?.dataset?.flowcoreHost || null,
        phase:field?.dataset?.flowcorePhaseName || null,
        id_count:field?.querySelectorAll?.('[id]')?.length || 0
      };
    };
    return {
      schema:'td613.ash.a12-canonical-field-diagnostic/v0.1',
      label,
      error,
      workspace:document.documentElement.dataset.ashPremiumWorkspace || null,
      session_open:document.documentElement.dataset.ashSessionOpen || null,
      case_pointer:localStorage.getItem('td613.ash-keep.current-case'),
      visible_host:document.documentElement.dataset.ashFlowcoreVisibleHost || null,
      workspace_remount:document.documentElement.dataset.ashFlowcoreWorkspaceRemount || null,
      workspace_remount_reason:document.documentElement.dataset.ashFlowcoreWorkspaceRemountReason || null,
      stage:{
        connected:Boolean(stage?.isConnected),
        child_count:stage?.children?.length || 0,
        field_count:stage?.querySelectorAll?.(':scope > .ash-flowcore-field')?.length || 0,
        html_prefix:stage?.innerHTML?.slice?.(0, 280) || ''
      },
      fields:[...document.querySelectorAll('.ash-flowcore-field')].map(describe),
      portal_loader:window.__td613AshFlowcoreIngressPortalLoader || null,
      portal:window.__td613AshFlowcoreIngressPortal?.current?.() || null,
      remount:window.__td613AshFlowcoreWorkspaceRemount?.current?.() || null,
      field_owner:window.__td613AshFlowcoreField?.current?.() || null,
      whole_instrument:window.__td613AshWholeInstrument?.current?.() || null,
      a12_stability:window.__td613A12CanonicalFieldStability ? {
        signature:window.__td613A12CanonicalFieldStability.signature,
        since:window.__td613A12CanonicalFieldStability.since,
        label:window.__td613A12CanonicalFieldStability.label
      } : null,
      authority_changed:false,
      source_bytes_moved:false,
      human_closure_required:true
    };
  }, { label, error });
}

async function waitForCanonicalField(page, label) {
  await page.evaluate(() => { window.__td613A12CanonicalFieldStability = null; });
  let handle;
  try {
    handle = await page.waitForFunction(({ label, quietMs }) => {
      const candidates = [...document.querySelectorAll('.ash-flowcore-field:not(.ash-flowcore-field--proxy):not([hidden])')];
      const visible = candidates.filter(field => {
        if (!field?.isConnected) return false;
        const style = getComputedStyle(field);
        const rect = field.getBoundingClientRect();
        return style.display !== 'none'
          && style.visibility !== 'hidden'
          && Number(style.opacity) > 0
          && rect.width > 0
          && rect.height > 0;
      });
      if (visible.length !== 1) {
        window.__td613A12CanonicalFieldStability = null;
        return false;
      }
      const field = visible[0];
      const signature = [
        label,
        document.documentElement.dataset.ashPremiumWorkspace || '',
        field.dataset.flowcorePhaseName || '',
        field.parentElement?.id || '',
        candidates.length,
        visible.length
      ].join(':');
      const now = performance.now();
      const prior = window.__td613A12CanonicalFieldStability;
      if (!prior || prior.signature !== signature || prior.field !== field) {
        window.__td613A12CanonicalFieldStability = { signature, field, since:now, label };
        return false;
      }
      if (now - prior.since < quietMs) return false;
      return {
        label,
        candidate_count:candidates.length,
        visible_count:visible.length,
        workspace:document.documentElement.dataset.ashPremiumWorkspace || null,
        phase:field.dataset.flowcorePhaseName || null,
        parent_id:field.parentElement?.id || null,
        width:field.getBoundingClientRect().width,
        height:field.getBoundingClientRect().height,
        quiet_window_ms:quietMs,
        connected:true
      };
    }, { label, quietMs:ENTRY_FIELD_QUIET_MS }, { timeout:60_000, polling:25 });
  } catch (error) {
    const diagnostic = await canonicalFieldDiagnostic(page, label, String(error?.message || error)).catch(diagnosticError => ({
      schema:'td613.ash.a12-canonical-field-diagnostic/v0.1',
      label,
      error:String(error?.message || error),
      diagnostic_error:String(diagnosticError?.message || diagnosticError),
      authority_changed:false,
      source_bytes_moved:false,
      human_closure_required:true
    }));
    throw new Error('A12 canonical field failed to settle: ' + JSON.stringify(diagnostic));
  }
  return handle.jsonValue();
}

async function inspectEntryPreflight(page, label) {`,
  'A12 canonical field stability helper'
);

source = replaceExactly(
  source,
  `async function inspectEntryPreflight(page, label) {
  const entryAttempt = await enterInvestigation(page);
  await ensureCommandSheetOpen(page);
  const entry = await entryDiagnostic(page, entryAttempt);
  if (!entry.current_case
    || entry.local_pointer !== entry.current_case
    || entry.entry_posture !== 'READY'
    || entry.entry_phase !== 'VISIBLE'
    || !entry.menu_connected
    || !entry.menu_visible
    || !entry.sheet_connected
    || !entry.sheet_open) {
    throw new Error(\`A12 entry preflight did not remain stable: \${JSON.stringify(entry)}\`);
  }
  await page.screenshot({ path:path.join(artifactDir, browserName + '-' + label + '.png'), fullPage:true });
  return { entry_attempt:entryAttempt, entry };
}`,
  `async function inspectEntryPreflight(page, label) {
  const entryAttempt = await enterInvestigation(page);
  await ensureCommandSheetOpen(page);
  await page.locator('[data-a12-command="test"]').click();
  await settleWorkspace(page, 'choir');
  await ensureCommandSheetOpen(page);
  await page.locator('[data-a12-command="save"]').click();
  await settleWorkspace(page, 'capsule');
  const canonicalField = await waitForCanonicalField(page, 'entry-preflight-capsule');
  const entry = await entryDiagnostic(page, entryAttempt);
  if (!entry.current_case
    || entry.local_pointer !== entry.current_case
    || entry.entry_posture !== 'READY'
    || entry.entry_phase !== 'VISIBLE'
    || !entry.menu_connected
    || !entry.menu_visible
    || !entry.sheet_connected
    || canonicalField.visible_count !== 1) {
    throw new Error(\`A12 entry-field preflight did not remain stable: \${JSON.stringify({ entry, canonicalField })}\`);
  }
  await page.screenshot({ path:path.join(artifactDir, browserName + '-' + label + '.png'), fullPage:true });
  return {
    entry_attempt:entryAttempt,
    entry,
    route:['choir','capsule'],
    canonical_field:canonicalField
  };
}`,
  'A12 entry-field preflight route'
);

source = replaceExactly(
  source,
  `  await page.locator('[data-a12-command="save"]').click();
  await settleWorkspace(page, 'capsule');

  const routeDelta =`,
  `  await page.locator('[data-a12-command="save"]').click();
  await settleWorkspace(page, 'capsule');
  const canonicalField = await waitForCanonicalField(page, 'full-witness-capsule');

  const routeDelta =`,
  'A12 full-witness canonical field settlement'
);

source = replaceExactly(
  source,
  `  if (beforeSwitch.fields !== 1) throw new Error('Expected one canonical field, observed ' + beforeSwitch.fields);`,
  `  if (canonicalField.visible_count !== 1 || beforeSwitch.fields !== 1) throw new Error('Expected one stable canonical field: ' + JSON.stringify({ canonicalField, beforeSwitch }));`,
  'A12 canonical field assertion'
);

source = source
  .replaceAll('td613.ash.a12-entry-preflight/v0.1-stable-case-command-surface', 'td613.ash.a12-entry-preflight/v0.4-present-state-canonical-field-diagnostic')
  .replaceAll('td613.ash.a12-browser-witness/v1.0-a15-stable-entry', 'td613.ash.a12-browser-witness/v1.3-a15-present-state-canonical-field-diagnostic');

if (!source.includes('entry_convergence_rebind')
  || !source.includes("convergence.begin({ detail:{ case_id:current.case_id, profile:'investigation' } })")
  || !source.includes('td613.ash.a12-present-state-convergence-rebind/v0.1')
  || !source.includes('ENTRY_FIELD_QUIET_MS = 220')
  || !source.includes('canonicalFieldDiagnostic(page, label, error)')
  || !source.includes('td613.ash.a12-canonical-field-diagnostic/v0.1')
  || !source.includes('window.__td613AshFlowcoreIngressPortal?.current?.()')
  || !source.includes('window.__td613AshFlowcoreWorkspaceRemount?.current?.()')
  || !source.includes('waitForCanonicalField(page, label)')
  || !source.includes("route:['choir','capsule']")
  || !source.includes("waitForCanonicalField(page, 'full-witness-capsule')")
  || !source.includes('td613.ash.a12-entry-preflight/v0.4-present-state-canonical-field-diagnostic')
  || !source.includes('td613.ash.a12-browser-witness/v1.3-a15-present-state-canonical-field-diagnostic')) {
  throw new Error('A12 present-state canonical-field diagnostic observer adapter failed to compile.');
}

try {
  await fs.writeFile(tempPath, source, 'utf8');
  await import(`${pathToFileURL(tempPath).href}?a12_present_state_field=${Date.now()}`);
} finally {
  await fs.rm(tempPath, { force:true });
}
