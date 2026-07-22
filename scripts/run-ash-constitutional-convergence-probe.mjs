import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-constitutional-convergence');
const serializedSourceUrl = new URL('./ash-five-demo-convergence-compiler.source.txt', import.meta.url);
const compilerPath = path.join(artifactDir, 'ash-constitutional-convergence-probe.runtime.mjs');
const serializedQuoteSeam = `dataset.ashPremiumWorkspace === 'test""`;
const canonicalQuote = `dataset.ashPremiumWorkspace === 'test'"`;

const requiredMarkers = Object.freeze([
  'ash-constitutional-convergence-probe.runtime.mjs',
  'expected one case-selection seam',
  "select.dispatchEvent(new Event('change', { bubbles: true }))",
  'remove?.disabled !== false',
  'window.__td613AshPremiumUI?.open',
  "open('test')",
  "open('map')",
  'workspace-test',
  'workspace-map',
  'guided workspace migration was not materialized',
  "selectOption('political_campaign')",
  'Harbor City Mayoral Campaign',
  'profile_selected_explicitly: true',
  'profile_demo_registry_deferred_until_selection: true',
  'demo_entry_convergence_deferred_until_case_hydration: true',
  'demo_entry_api_ready_after_hydration: true',
  'convergenceApi?.version',
  'window.__td613AshProfileDemos?.profiles?.includes',
  'explicit profile and deferred entry-readiness gate was not materialized',
  "waitUntil: 'domcontentloaded'",
  'TD613AshConvergence?.withOperation',
  'TD613AshConvergence?.runDryCompatibilityAudit',
  'demo_click_deferred_until_ready: true',
  'timeout: 60000',
  'window.__td613AshKeep?.version'
]);

await fs.mkdir(artifactDir, { recursive: true });
let compiler = await fs.readFile(serializedSourceUrl, 'utf8');
const seamCount = compiler.split(serializedQuoteSeam).length - 1;
if (seamCount !== 1) {
  throw new Error(`Five-demo convergence compiler expected one serialized quote seam; observed ${seamCount}.`);
}
compiler = compiler.replace(serializedQuoteSeam, canonicalQuote);
if (compiler.includes(serializedQuoteSeam)) {
  throw new Error('Five-demo convergence compiler retained the serialized quote seam.');
}
for (const marker of requiredMarkers) {
  if (!compiler.includes(marker)) throw new Error(`Five-demo convergence compiler omitted ${marker}.`);
}
await fs.writeFile(compilerPath, compiler, 'utf8');
await import(`${pathToFileURL(compilerPath).href}?five_demo_aftercare=${Date.now()}`);
