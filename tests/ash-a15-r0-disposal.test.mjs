import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createAshKernelAdapter } from '../app/dome-world/previews/a15-r0/ash-kernel-adapter.js';

const fixture = JSON.parse(fs.readFileSync('app/dome-world/fixtures/a15-r0/governed-task-fixture-v01.json', 'utf8'));
const adapter = await createAshKernelAdapter(fixture);
await adapter.bindReference();
const disposal = await adapter.dispose();

assert.deepEqual(disposal, {
  schema: 'td613.ash.a15-r0.preview-disposal-receipt/v0.1',
  fixture_id: fixture.fixture_id,
  preview_memory_released: true,
  case_migration_required: false,
  indexeddb_mutated: false,
  caches_mutated: false,
  workers_mutated: false,
  release_rollback_required: false,
  deployment_required: false,
  external_erasure_claimed: false,
  human_closure_required: true
});
await assert.rejects(() => adapter.snapshot(), /disposed/);

const previewDir = 'app/dome-world/previews/a15-r0';
const sources = fs.readdirSync(previewDir)
  .filter(name => /\.(?:js|html|css)$/.test(name))
  .map(name => [name, fs.readFileSync(path.join(previewDir, name), 'utf8')]);
const adapterFamily = sources
  .filter(([name]) => name !== 'a15-r0-harness.js')
  .map(([, source]) => source)
  .join('\n');
for (const pattern of [
  /indexedDB/,
  /localStorage/,
  /sessionStorage/,
  /caches\./,
  /serviceWorker/,
  /deleteDatabase/,
  /unregister\s*\(/,
  /sendBeacon/,
  /XMLHttpRequest/,
  /new\s+(?:Worker|SharedWorker)/
]) assert.doesNotMatch(adapterFamily, pattern);

const productionFiles = [
  'app/dome-world/ash-keep.html',
  'app/dome-world/ash-lifecycle.js',
  'app/dome-world/ash-cache-eviction-aia3.js',
  'app/dome-world/ash-cache-flush.js',
  'api/dome-world-shell.js',
  'lib/dome-world-shell-core.js',
  'vercel.json'
];
for (const file of productionFiles) {
  assert.equal(fs.readFileSync(file, 'utf8').includes('previews/a15-r0'), false, `${file} imports the disposable preview.`);
}

console.log(JSON.stringify({
  ok: true,
  schema: disposal.schema,
  preview_memory_released: true,
  case_migration_required: false,
  production_storage_mutated: false,
  cache_eviction_required: false,
  worker_mutation_required: false,
  deployment_required: false,
  external_erasure_claimed: false
}, null, 2));
