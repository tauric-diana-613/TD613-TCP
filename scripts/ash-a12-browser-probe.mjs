import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const corePath = path.join(scriptsDir, 'ash-a12-browser-probe-v943-core.mjs');
const tempPath = path.join(scriptsDir, `.ash-a12-browser-probe-closed-case-${process.pid}.mjs`);

const REQUIRED_A12_STATIC_MARKERS = Object.freeze([
  'ash-a12-browser-probe-stable-entry.mjs',
  'POST_CLICK_CASE_QUIET_MS = 220',
  'async function waitForPostClickCaseSettlement(page, attempt)',
  'window.__td613A12PostClickCaseStability',
  'pointer === current.case_id',
  "profile === 'investigation'",
  'post_click_case = await waitForPostClickCaseSettlement(page, attempt)',
  'td613.ash.a12-present-state-convergence-rebind/v0.2-post-click-settled',
  'post_click_case:postClickCase',
  "convergence.begin({ detail:{ case_id:current.case_id, profile:'investigation' } })",
  'pointer_concordant:pointer === current.case_id',
  'const already_converged = terminalReady(before);',
  'const convergence_in_flight = inFlight(before);',
  'rebind_required:!already_converged && !convergence_in_flight',
  'convergence_in_flight,',
  'rebind_admitted,',
  'const terminal_convergence_handle = await page.waitForFunction',
  "state?.posture === 'READY'",
  "state?.phase === 'VISIBLE'",
  'Number(state?.stable_frames || 0) >= 2',
  "? 'ALREADY_READY'",
  "? 'EXISTING_CYCLE_COMPLETED'",
  "? 'REBIND_COMPLETED'",
  "'CONCURRENT_CYCLE_COMPLETED'",
  'entry_convergence_rebind.terminal_satisfied = true',
  'ENTRY_FIELD_QUIET_MS = 220',
  'async function canonicalFieldDiagnostic(page, label, error)',
  'td613.ash.a12-canonical-field-diagnostic/v0.1',
  'window.__td613AshFlowcoreIngressPortal?.current?.()',
  'window.__td613AshFlowcoreWorkspaceRemount?.current?.()',
  'async function waitForCanonicalField(page, label)',
  'ash-flowcore-field:not(.ash-flowcore-field--proxy):not([hidden])',
  'visible.length !== 1',
  "waitForCanonicalField(page, 'entry-preflight-capsule')",
  "route:['choir','capsule']",
  "waitForCanonicalField(page, 'full-witness-capsule')",
  'td613.ash.a12-entry-preflight/v0.5-post-click-settled-canonical-field',
  'td613.ash.a12-browser-witness/v1.4-a15-post-click-settled-canonical-field'
]);

function replaceExactly(source, marker, replacement, label) {
  const count = source.split(marker).length - 1;
  if (count !== 1) throw new Error(`${label} expected exactly one marker; observed ${count}`);
  return source.replace(marker, replacement);
}

let source = await fs.readFile(corePath, 'utf8');
const oldCondition = `if (!existing.case_id || existing.pointer !== existing.case_id || existing.profile !== 'investigation') {`;
const newCondition = `if (!existing.case_id || existing.pointer !== existing.case_id || existing.profile !== 'investigation' || existing.case_closed === true) {`;
source = source.replaceAll(oldCondition, newCondition);
source = replaceExactly(
  source,
  `let source = await fs.readFile(corePath, 'utf8');`,
  `let source = await fs.readFile(corePath, 'utf8');

source = replaceExactly(
  source,
  \`      const existing = await page.evaluate(() => ({
        case_id:window.__td613AshKeep?.current?.()?.case_id || null,
        pointer:localStorage.getItem('td613.ash-keep.current-case'),
        profile:document.documentElement.dataset.ashDemoProfile
          || document.documentElement.dataset.ashDemoRegistryProfile
          || null
      }));\`,
  \`      const existing = await page.evaluate(() => ({
        case_id:window.__td613AshKeep?.current?.()?.case_id || null,
        pointer:localStorage.getItem('td613.ash-keep.current-case'),
        profile:document.documentElement.dataset.ashDemoProfile
          || document.documentElement.dataset.ashDemoRegistryProfile
          || null,
        case_closed:document.body.dataset.ashCaseClosed === 'true'
      }));\`,
  'A12 closed Investigation case visibility'
);
source = replaceExactly(
  source,
  \`      if (!existing.case_id || existing.pointer !== existing.case_id || existing.profile !== 'investigation') {\`,
  \`      if (!existing.case_id || existing.pointer !== existing.case_id || existing.profile !== 'investigation' || existing.case_closed === true) {\`,
  'A12 closed Investigation case reactivation'
);`,
  'A12 closed-case source transform injection'
);

source = replaceExactly(
  source,
  `        const before = convergence.current?.() || null;
        const began = convergence.begin({ detail:{ case_id:current.case_id, profile:'investigation' } });
        const after = convergence.current?.() || null;`,
  `        const terminalReady = state => Boolean(
          state?.case_id === current.case_id
          && state?.profile === 'investigation'
          && state?.workspace === 'home'
          && state?.posture === 'READY'
          && state?.phase === 'VISIBLE'
          && Number(state?.stable_frames || 0) >= 2
        );
        const inFlight = state => Boolean(
          state?.case_id === current.case_id
          && state?.profile === 'investigation'
          && state?.workspace === 'home'
          && ['OPENING','REVEALING'].includes(state?.posture)
        );
        const before = convergence.current?.() || null;
        const already_converged = terminalReady(before);
        const convergence_in_flight = inFlight(before);
        const began = already_converged || convergence_in_flight
          ? false
          : convergence.begin({ detail:{ case_id:current.case_id, profile:'investigation' } });
        const after = convergence.current?.() || null;
        const after_converged = terminalReady(after);
        const rebind_admitted = Boolean(began);`,
  'A12 bounded convergence admission'
);
source = replaceExactly(
  source,
  `          begin_invoked:Boolean(began),
          after,`,
  `          begin_invoked:Boolean(began),
          rebind_required:!already_converged && !convergence_in_flight,
          already_converged,
          convergence_in_flight,
          after_converged,
          rebind_admitted,
          after,`,
  'A12 convergence admission receipt'
);
source = replaceExactly(
  source,
  `      if (!entry_convergence_rebind.begin_invoked) throw new Error('A12 present-state convergence rebind was not admitted.');
      await waitForStableInvestigationEntry(page, attempt);`,
  `      const terminal_convergence_handle = await page.waitForFunction(({ caseId }) => {
        const state = window.__td613AshDemoEntryConvergence?.current?.() || null;
        return state?.case_id === caseId
          && state?.profile === 'investigation'
          && state?.workspace === 'home'
          && state?.posture === 'READY'
          && state?.phase === 'VISIBLE'
          && Number(state?.stable_frames || 0) >= 2
          ? state
          : false;
      }, { caseId:post_click_case.case_id }, { timeout:45_000, polling:25 });
      const terminal_convergence = await terminal_convergence_handle.jsonValue();
      entry_convergence_rebind.terminal_satisfied = true;
      entry_convergence_rebind.terminal = terminal_convergence;
      entry_convergence_rebind.satisfaction_basis = entry_convergence_rebind.already_converged
        ? 'ALREADY_READY'
        : entry_convergence_rebind.convergence_in_flight
          ? 'EXISTING_CYCLE_COMPLETED'
          : entry_convergence_rebind.rebind_admitted
            ? 'REBIND_COMPLETED'
            : 'CONCURRENT_CYCLE_COMPLETED';
      await waitForStableInvestigationEntry(page, attempt);`,
  'A12 bounded terminal convergence gate'
);

for (const marker of REQUIRED_A12_STATIC_MARKERS) {
  if (!source.includes(marker)) throw new Error(`A12 historical wrapper law missing after closed-case/in-flight hardening: ${marker}`);
}
if (!source.includes('existing.case_closed === true') || !source.includes("case_closed:document.body.dataset.ashCaseClosed === 'true'")) {
  throw new Error('A12 closed-case reactivation hardening did not compile into the wrapper.');
}
if (source.includes("throw new Error('A12 present-state convergence rebind was not admitted.')")) {
  throw new Error('A12 in-flight convergence hardening left the obsolete immediate begin() failure gate in generated witness source.');
}

await fs.writeFile(tempPath, source, 'utf8');
try {
  await import(`${pathToFileURL(tempPath).href}?td613_a12_closed_case=${Date.now()}`);
} finally {
  await fs.unlink(tempPath).catch(() => {});
}
