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
const normalizedFiles = [];
for (const entry of await fs.readdir(here, { withFileTypes:true })) {
  if (!entry.isFile() || !entry.name.endsWith('.mjs') || entry.name === path.basename(fileURLToPath(import.meta.url))) continue;
  const targetPath = path.join(here, entry.name);
  const source = await fs.readFile(targetPath, 'utf8');
  const occurrences = source.split(staleRegistryVersion).length - 1;
  if (!occurrences || registryVersion === staleRegistryVersion) continue;
  await fs.writeFile(targetPath, source.split(staleRegistryVersion).join(registryVersion), 'utf8');
  normalizedFiles.push({ file:entry.name, occurrences });
}

await fs.mkdir(path.dirname(compatibilityReceiptPath), { recursive:true });
await fs.writeFile(compatibilityReceiptPath, `${JSON.stringify({
  schema:'td613.ash.registry-observer-compatibility/v0.1',
  installed_registry_version:registryVersion,
  retired_registry_version:staleRegistryVersion,
  normalized_files:normalizedFiles,
  ephemeral_checkout_only:true,
  product_runtime_mutated:false,
  repository_source_persisted:false,
  authority_changed:false,
  mass_eviction_executed:false,
  human_closure_required:true
}, null, 2)}\n`);

console.log(`prepare-ash-profile-closure-fixture-a13.mjs passed · registry ${registryVersion} · ${normalizedFiles.length} inherited observer files normalized`);
