import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(here, '..');
const convergenceRunnerPath = path.join(here, 'run-ash-constitutional-convergence-probe.mjs');
const currentObserverPath = path.join(here, 'ash-a2-a5-browser-probe.mjs');
const legacyObserverPath = path.join(here, 'ash-a2-a5-browser-probe-a13.mjs');
const registryPath = path.join(repositoryRoot, 'app/dome-world/ash-demo-registry.js');
const registryCorePath = path.join(repositoryRoot, 'app/dome-world/ash-demo-registry-core.js');
const compatibilityReceiptPath = path.join(repositoryRoot, 'artifacts/ash-keep-probe-runtime/registry-version-compatibility.json');

const [convergenceSource, currentObserver, legacyObserver, registryWrapperSource, registryCoreSource] = await Promise.all([
  fs.readFile(convergenceRunnerPath, 'utf8'),
  fs.readFile(currentObserverPath, 'utf8'),
  fs.readFile(legacyObserverPath, 'utf8'),
  fs.readFile(registryPath, 'utf8'),
  fs.readFile(registryCorePath, 'utf8')
]);

const registrySource = `${registryWrapperSource}\n${registryCoreSource}`;
const registryVersion = registrySource.match(/ASH_DEMO_REGISTRY_VERSION\s*=\s*['"]([^'"]+)['"]/)?.[1];
const assetEpoch = registrySource.match(/ASH_DEMO_ASSET_EPOCH\s*=\s*['"]([^'"]+)['"]/)?.[1];
if (!registryVersion?.startsWith('td613.ash.demo-registry/')) {
  throw new Error('A14 readiness validator could not resolve the installed Ash demo registry version.');
}
if (!assetEpoch) throw new Error('A14 readiness validator could not resolve the installed Ash demo asset epoch.');

const convergencePrepared = convergenceSource.includes('profile_demo_registry_ready_before_selection: true')
  && convergenceSource.includes("select.value = 'political_campaign'")
  && (convergenceSource.includes('registry.reconcile()') || convergenceSource.includes('window.__td613AshDemoRegistry.reconcile()'))
  && convergenceSource.includes("dataset.ashDemoControlOwner === 'ASH_DEMO_REGISTRY'")
  && convergenceSource.includes("profile_demo_activation = 'ATOMIC_REGISTRY_TASK'");
if (!convergencePrepared) {
  throw new Error('A14 readiness validator found an unprepared constitutional-convergence observer.');
}

const retiredRegistryVersion = 'td613.ash.demo-registry/v0.1-a13';
const currentObserverPrepared = currentObserver.includes('ash-a2-a5-browser-probe-a13.mjs')
  && currentObserver.includes(`replaceAll('${retiredRegistryVersion}', '${registryVersion}')`)
  && currentObserver.includes('await fs.rm(tempPath, { force:true })');
if (!currentObserverPrepared) {
  throw new Error('A14 current-registry observer must remain a committed temporary-copy adapter.');
}
if (!legacyObserver.includes(retiredRegistryVersion)) {
  throw new Error('A14 readiness validator found historical A13 observer drift.');
}

await fs.mkdir(path.dirname(compatibilityReceiptPath), { recursive:true });
await fs.writeFile(compatibilityReceiptPath, `${JSON.stringify({
  schema:'td613.ash.registry-observer-compatibility/v0.3-read-only-exact-head',
  installed_registry_version:registryVersion,
  installed_asset_epoch:assetEpoch,
  registry_source_topology:'WRAPPER_PLUS_CORE',
  retired_registry_version:retiredRegistryVersion,
  convergence_observer_prepared:true,
  current_observer_strategy:'TEMPORARY_COPY_ONLY',
  tracked_sources_mutated:false,
  legacy_fixture_rewriter_invoked:false,
  historical_a13_observer_preserved:true,
  current_a14_observer_committed:true,
  product_runtime_mutated:false,
  authority_changed:false,
  mass_eviction_executed:false,
  human_closure_required:true
}, null, 2)}\n`);

console.log(`prepare-ash-profile-closure-fixture-a13.mjs passed · registry ${registryVersion} · wrapper+core read-only exact-head validation`);
