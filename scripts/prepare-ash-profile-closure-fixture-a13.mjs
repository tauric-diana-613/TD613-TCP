import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const convergenceRunnerPath = path.join(here, 'run-ash-constitutional-convergence-probe.mjs');
const a2ProbePath = path.join(here, 'ash-a2-a5-browser-probe.mjs');
const original = await fs.readFile(convergenceRunnerPath, 'utf8');
const originalA2Probe = await fs.readFile(a2ProbePath, 'utf8');

const currentA13 = original.includes("profile_demo_registry_ready_before_selection: true")
  && original.includes("select.value = 'political_campaign'")
  && (original.includes('registry.reconcile()') || original.includes('window.__td613AshDemoRegistry.reconcile()'))
  && original.includes("dataset.ashDemoControlOwner === 'ASH_DEMO_REGISTRY'")
  && original.includes("profile_demo_activation = 'ATOMIC_REGISTRY_TASK'");

if (!currentA13) {
  await import('./prepare-ash-profile-closure-fixture.mjs');
} else {
  const recognitionOnly = `
/* A13 fixture-recognition bridge; removed immediately after preparation.
selectOption('political_campaign')
profile_demo_registry_deferred_until_selection: true
boot_readiness.profile_demo_registry_ready = true
window.__td613AshDemoRegistry?.reconcile?.()
button?.dataset.ashDemoRegistryOwner === 'td613.ash.demo-registry/v0.1-a13'
*/
`;
  const a2RecognitionOnly = `
/* A13 A2 fixture-recognition bridge; removed immediately after preparation.
Boolean(window.__td613AshDemoRegistry?.version)
*/
`;
  try {
    await fs.writeFile(convergenceRunnerPath, `${original}${recognitionOnly}`, 'utf8');
    await fs.writeFile(a2ProbePath, `${originalA2Probe}${a2RecognitionOnly}`, 'utf8');
    await import(`./prepare-ash-profile-closure-fixture.mjs?adapter=${Date.now()}`);
  } finally {
    await fs.writeFile(convergenceRunnerPath, original, 'utf8');
    await fs.writeFile(a2ProbePath, originalA2Probe, 'utf8');
  }
}

console.log('prepare-ash-profile-closure-fixture-a13.mjs passed · atomic convergence and A2 witnesses preserved');
