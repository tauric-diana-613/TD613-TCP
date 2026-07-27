import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const corePath = path.join(scriptsDir, 'ash-a12-browser-probe-stable-entry.mjs');
const tempPath = path.join(scriptsDir, `.ash-a12-browser-probe-present-state-${process.pid}.mjs`);

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
      entry_convergence_rebind:window.__td613A12EntryConvergenceRebind || null`,
  'A12 rebind diagnostic projection'
);

source = source
  .replaceAll('td613.ash.a12-entry-preflight/v0.1-stable-case-command-surface', 'td613.ash.a12-entry-preflight/v0.2-present-state-convergence')
  .replaceAll('td613.ash.a12-browser-witness/v1.0-a15-stable-entry', 'td613.ash.a12-browser-witness/v1.1-a15-present-state-convergence');

if (!source.includes('entry_convergence_rebind')
  || !source.includes("convergence.begin({ detail:{ case_id:current.case_id, profile:'investigation' } })")
  || !source.includes('td613.ash.a12-present-state-convergence-rebind/v0.1')
  || !source.includes('entry_convergence_rebind:window.__td613A12EntryConvergenceRebind || null')
  || !source.includes('td613.ash.a12-entry-preflight/v0.2-present-state-convergence')
  || !source.includes('td613.ash.a12-browser-witness/v1.1-a15-present-state-convergence')) {
  throw new Error('A12 present-state convergence observer adapter failed to compile.');
}

try {
  await fs.writeFile(tempPath, source, 'utf8');
  await import(`${pathToFileURL(tempPath).href}?a12_present_state=${Date.now()}`);
} finally {
  await fs.rm(tempPath, { force:true });
}
