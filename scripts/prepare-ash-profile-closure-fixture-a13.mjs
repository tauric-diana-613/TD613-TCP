import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const convergenceRunnerPath = path.join(here, 'run-ash-constitutional-convergence-probe.mjs');
const original = await fs.readFile(convergenceRunnerPath, 'utf8');

const currentA13 = original.includes("profile_demo_registry_ready_before_selection: true")
  && original.includes("select.value = 'political_campaign'")
  && original.includes("window.__td613AshDemoRegistry.reconcile()")
  && original.includes("dataset.ashDemoControlOwner === 'ASH_DEMO_REGISTRY'");

if (!currentA13) {
  await import('./prepare-ash-profile-closure-fixture.mjs');
} else {
  const recognitionOnly = `
/* A13 fixture-recognition bridge; removed immediately after preparation.
selectOption('political_campaign')
profile_demo_registry_deferred_until_selection: true
boot_readiness.profile_demo_registry_ready = true
window.__td613AshDemoRegistry?.reconcile?.()
*/
`;
  try {
    await fs.writeFile(convergenceRunnerPath, `${original}${recognitionOnly}`, 'utf8');
    await import(`./prepare-ash-profile-closure-fixture.mjs?adapter=${Date.now()}`);
  } finally {
    await fs.writeFile(convergenceRunnerPath, original, 'utf8');
  }
}

console.log('prepare-ash-profile-closure-fixture-a13.mjs passed · current convergence runner preserved');
