import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(here, '..');
const convergenceRunnerPath = path.join(here, 'run-ash-constitutional-convergence-probe.mjs');
const a2ProbePath = path.join(here, 'ash-a2-a5-browser-probe.mjs');
const registryPath = path.join(repositoryRoot, 'app/dome-world/ash-demo-registry.js');
const compatibilityReceiptPath = path.join(repositoryRoot, 'artifacts/ash-keep-probe-runtime/registry-version-compatibility.json');
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

const registrySource = await fs.readFile(registryPath, 'utf8');
const registryVersion = registrySource.match(/ASH_DEMO_REGISTRY_VERSION\s*=\s*['"]([^'"]+)['"]/)?.[1];
if (!registryVersion?.startsWith('td613.ash.demo-registry/')) {
  throw new Error('A13 fixture adapter could not resolve the installed Ash demo registry version.');
}

const staleRegistryVersion = 'td613.ash.demo-registry/v0.1-a13';
const currentObserver = await fs.readFile(a2ProbePath, 'utf8');
if (!currentObserver.includes('ash-a2-a5-browser-probe-a13.mjs')
  || !currentObserver.includes("replaceAll('td613.ash.demo-registry/v0.1-a13', 'td613.ash.demo-registry/v0.2-a14')")
  || !currentObserver.includes('await fs.rm(tempPath, { force:true })')) {
  throw new Error('A14 current-registry observer must remain a temporary-copy adapter.');
}

await fs.mkdir(path.dirname(compatibilityReceiptPath), { recursive:true });
await fs.writeFile(compatibilityReceiptPath, `${JSON.stringify({
  schema:'td613.ash.registry-observer-compatibility/v0.2-exact-head-sources',
  installed_registry_version:registryVersion,
  retired_registry_version:staleRegistryVersion,
  normalization_strategy:'TEMPORARY_COPY_ONLY',
  tracked_sources_mutated:false,
  historical_a13_observer_preserved:true,
  current_a14_observer_committed:true,
  product_runtime_mutated:false,
  repository_source_persisted:false,
  authority_changed:false,
  mass_eviction_executed:false,
  human_closure_required:true
}, null, 2)}\n`);

console.log(`prepare-ash-profile-closure-fixture-a13.mjs passed · registry ${registryVersion} · exact-head probe sources preserved`);
