import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, readFile, writeFile, rm, symlink, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import {
  DOLLHOUSE_KIT_ENTRYPOINTS, DOLLHOUSE_KIT_BOUNDS, collectDollhouseSources, exportDollhouseKit,
  staticModuleDependencies, verifyDollhouseKit, validateDollhouseSourceCatalogue
} from '../scripts/export-dollhouse.mjs';

const sha256 = value => createHash('sha256').update(value).digest('hex');
const gitBlobSha = bytes => createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
const canonical = value => Array.isArray(value) ? `[${value.map(canonical).join(',')}]`
  : value && typeof value === 'object' ? `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`
    : JSON.stringify(value);

async function fixture(t) {
  const temporary = await mkdtemp(path.join(tmpdir(), 'td613-dollhouse-kit-'));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const source = path.join(temporary, 'source');
  await mkdir(source);
  for (const relative of DOLLHOUSE_KIT_ENTRYPOINTS) {
    await mkdir(path.dirname(path.join(source, relative)), { recursive: true });
    await writeFile(path.join(source, relative), /\.m?js$/.test(relative) ? 'export const fixture = "fictional";\n' : '# Fictional kit fixture\n');
  }
  const dependency = 'app/dome-world/holonomy-loom/semantic-field.js';
  await mkdir(path.dirname(path.join(source, dependency)), { recursive: true });
  await writeFile(path.join(source, dependency), 'export const value = 42;\n');
  await writeFile(path.join(source, 'app/engine/dollhouse-atlas-fadt.js'), 'import { value } from "../dome-world/holonomy-loom/semantic-field.js"; export const result = value;\n');
  const originalPath = 'dollhouse/lineage/originals/fictional-fadt.source.md';
  const originalBytes = Buffer.from('# Exact fictional original\n\nThis is test data, not research evidence.\n');
  await mkdir(path.dirname(path.join(source, originalPath)), { recursive: true });
  await writeFile(path.join(source, originalPath), originalBytes);
  const sourceCommit = 'a'.repeat(40);
  const catalogue = {
    schema: 'td613.dollhouse.source-records/v0.1', repository: 'tauric-diana-613/TD613-TCP',
    archival_status: 'SOURCE_REFERENCES_AND_EXACT_DOCUMENT_COPIES_ONLY',
    snapshots: [{ id: 'fictional-fadt', commit: sourceCommit, pr_number: 752, pr_state: 'OPEN', merged: false,
      source_role: 'FICTIONAL_TEST_LINEAGE', archive_url: `https://github.com/tauric-diana-613/TD613-TCP/archive/${sourceCommit}.zip` }],
    selection_scope: ['Fictional original bytes and reference-only fixture; no upstream authentication.'],
    records: [{ id: 'original', snapshot_id: 'fictional-fadt', source_path: 'research/fictional-original.md', source_blob_sha: gitBlobSha(originalBytes),
      source_url: `https://github.com/tauric-diana-613/TD613-TCP/blob/${sourceCommit}/research/fictional-original.md`, local_path: originalPath, sha256: sha256(originalBytes), bytes: originalBytes.length },
    { id: 'reference', snapshot_id: 'fictional-fadt', source_path: 'research/fictional-reference.md', source_blob_sha: 'b'.repeat(40),
      source_url: `https://github.com/tauric-diana-613/TD613-TCP/blob/${sourceCommit}/research/fictional-reference.md`, local_path: null, sha256: null, bytes: null }]
  };
  await writeFile(path.join(source, 'dollhouse/lineage/source-records.json'), `${JSON.stringify(catalogue, null, 2)}\n`);
  const git = (...args) => execFileSync('git', ['-C', source, '-c', 'core.hooksPath=/dev/null', ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
  git('init', '--quiet');
  git('config', 'user.name', 'Fictional fixture');
  git('config', 'user.email', 'fixture@example.invalid');
  git('add', '.');
  git('commit', '--quiet', '-m', 'Fictional source fixture');
  return { source, temporary, originalPath, originalBytes, catalogue, output: name => path.join(temporary, name) };
}

test('manifest is deterministic, closure is explicit and exported ESM imports resolve', async t => {
  const f = await fixture(t);
  const first = await exportDollhouseKit({ sourceRoot: f.source, outputDirectory: f.output('first') });
  const second = await exportDollhouseKit({ sourceRoot: f.source, outputDirectory: f.output('second') });
  assert.deepEqual(first.manifest, second.manifest);
  assert.equal(first.manifest.source.provenance, 'EXACT_COMMITTED_BUNDLED_BYTES');
  assert.match(first.manifest.source.revision, /^[0-9a-f]{40}$/);
  assert.match(first.manifest.source.tree, /^[0-9a-f]{40}$/);
  assert.equal(first.manifest.authority.deployment, false);
  assert.equal(first.manifest.research_lineage.archived_original_count, 1);
  assert.equal(first.manifest.research_lineage.pinned_reference_only_count, 1);
  assert.equal(first.manifest.research_lineage.upstream_authenticity_established, false);
  const originalRecord = first.manifest.files.find(file => file.path === f.originalPath);
  assert.equal(originalRecord.source, 'DECLARED_PINNED_ORIGINAL_DOCUMENT_BYTES');
  assert.equal(originalRecord.lineage.research_merged, false);
  assert.equal(originalRecord.lineage.source_blob_sha, f.catalogue.records[0].source_blob_sha);
  assert.ok((await readFile(path.join(first.output_directory, f.originalPath))).equals(f.originalBytes));
  const record = first.manifest.files.find(file => file.path === 'app/engine/dollhouse-atlas-fadt.js');
  assert.deepEqual(record.imports, ['app/dome-world/holonomy-loom/semantic-field.js']);
  assert.equal((await import(pathToFileURL(path.join(first.output_directory, record.path)))).result, 42);
  const packageRecord = JSON.parse(await readFile(path.join(first.output_directory, 'package.json'), 'utf8'));
  assert.equal(packageRecord.type, 'module');
  assert.equal(Object.hasOwn(packageRecord, 'dependencies'), false);
  assert.equal(Object.hasOwn(packageRecord, 'scripts'), false);
  assert.equal((await verifyDollhouseKit(first.output_directory)).status, 'INTEGRITY_VERIFIED');
});

test('changed source holds committed export and explicit candidate names exact drift', async t => {
  const f = await fixture(t);
  await writeFile(path.join(f.source, 'ATLAS.md'), '# Changed fictional source\n');
  await assert.rejects(exportDollhouseKit({ sourceRoot: f.source, outputDirectory: f.output('held') }), /bundled bytes differ from HEAD/);
  await assert.rejects(access(f.output('held')));
  const candidate = await exportDollhouseKit({ sourceRoot: f.source, outputDirectory: f.output('candidate'), allowWorkingTree: true });
  assert.equal(candidate.manifest.source.provenance, 'WORKING_TREE_CANDIDATE');
  assert.deepEqual(candidate.manifest.source.modified_bundled_paths, ['ATLAS.md']);
});

test('tampered kit bytes and additional undeclared records are held', async t => {
  const f = await fixture(t);
  const output = f.output('kit');
  await exportDollhouseKit({ sourceRoot: f.source, outputDirectory: output });
  await writeFile(path.join(output, 'ATLAS.md'), 'tampered\n');
  await assert.rejects(verifyDollhouseKit(output), /modified kit bytes/);
  await writeFile(path.join(output, 'ATLAS.md'), '# Fictional kit fixture\n');
  await writeFile(path.join(output, 'undeclared-user-record.json'), '{}');
  await assert.rejects(verifyDollhouseKit(output), /undeclared kit member/);
});

test('missing source and source-file or intermediate-directory symlinks hold', async t => {
  const f = await fixture(t);
  const atlas = path.join(f.source, 'ATLAS.md');
  await rm(atlas);
  await assert.rejects(collectDollhouseSources(f.source), /missing path/);
  const external = f.output('external.md');
  await writeFile(external, 'outside\n');
  await symlink(external, atlas);
  await assert.rejects(collectDollhouseSources(f.source), /symlink path/);
  await rm(atlas);
  await writeFile(atlas, '# Fictional kit fixture\n');
  await rm(path.join(f.source, 'dollhouse'), { recursive: true });
  const elsewhere = f.output('elsewhere');
  await mkdir(elsewhere);
  await writeFile(path.join(elsewhere, 'README.md'), '# outside\n');
  await symlink(elsewhere, path.join(f.source, 'dollhouse'));
  await assert.rejects(collectDollhouseSources(f.source), /symlink path/);
});

test('external, dynamic, escaped and secret-path dependencies hold', async t => {
  const f = await fixture(t);
  const entrypoint = path.join(f.source, 'app/engine/dollhouse-atlas-fadt.js');
  for (const source of [
    'import x from "uninstalled-package";',
    'export {x} from "https://example.invalid/remote.js";',
    'import("./unknown.js");',
    'import /* comment */ ("./unknown.js");',
    'import // comment\u2028 ("./unknown.js");',
    'export const x = `${import("./unknown.js")}`;',
    'import "../../../../outside.js";',
    'import "../.env";',
    'import "./x%2fsecret.js";',
    'import "./x.js?secret=1";',
    'const x = require("./unknown.js");'
  ]) {
    await writeFile(entrypoint, source);
    await assert.rejects(collectDollhouseSources(f.source), /Dollhouse export HOLD/);
  }
  assert.deepEqual(staticModuleDependencies('export {x} from "./relative.js";', 'test.js'), ['./relative.js']);
});

test('existing output, repository output and symlink parent never overwrite', async t => {
  const f = await fixture(t);
  const output = f.output('existing');
  await mkdir(output);
  await writeFile(path.join(output, 'keep.txt'), 'keep this\n');
  await assert.rejects(exportDollhouseKit({ sourceRoot: f.source, outputDirectory: output }), /already exists/);
  assert.equal(await readFile(path.join(output, 'keep.txt'), 'utf8'), 'keep this\n');
  await assert.rejects(exportDollhouseKit({ sourceRoot: f.source, outputDirectory: path.join(f.source, 'kit') }), /outside the repository/);
  const alias = f.output('alias');
  await symlink(output, alias);
  await assert.rejects(exportDollhouseKit({ sourceRoot: f.source, outputDirectory: path.join(alias, 'kit') }), /symlink path/);
});

test('manifest path escape and symlink kit member hold even with recalculated hash', async t => {
  const f = await fixture(t);
  const output = f.output('kit');
  await exportDollhouseKit({ sourceRoot: f.source, outputDirectory: output });
  const manifestPath = path.join(output, 'dollhouse-kit.manifest.json');
  const original = await readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(original);
  manifest.files[0].path = '../outside.md';
  const { manifest_sha256, ...payload } = manifest;
  manifest.manifest_sha256 = sha256(canonical(payload));
  await writeFile(manifestPath, JSON.stringify(manifest));
  await assert.rejects(verifyDollhouseKit(output), /unsafe path/);
  await writeFile(manifestPath, original);
  await rm(path.join(output, 'ATLAS.md'));
  await symlink(path.join(f.source, 'ATLAS.md'), path.join(output, 'ATLAS.md'));
  await assert.rejects(verifyDollhouseKit(output), /symlink path/);
});

test('declared original requires exact SHA256 and Git blob identity, including final newline', async t => {
  const f = await fixture(t);
  const cataloguePath = path.join(f.source, 'dollhouse/lineage/source-records.json');
  const modifiedBytes = Buffer.from(f.originalBytes.toString('utf8').trimEnd());
  await writeFile(path.join(f.source, f.originalPath), modifiedBytes);
  await assert.rejects(collectDollhouseSources(f.source), /archived original byte\/hash identity mismatch/);
  // Rewriting only the SHA256/length still cannot excuse source Git blob drift.
  f.catalogue.records[0].sha256 = sha256(modifiedBytes);
  f.catalogue.records[0].bytes = modifiedBytes.length;
  await writeFile(cataloguePath, JSON.stringify(f.catalogue));
  await assert.rejects(collectDollhouseSources(f.source), /archived original byte\/hash identity mismatch/);
});

test('catalogue holds malformed, mutable, malicious and partially declared archive records', async t => {
  const f = await fixture(t);
  for (const mutate of [
    catalogue => { catalogue.records[0].local_path = '../outside.source.md'; },
    catalogue => { catalogue.records[0].local_path = 'app/engine/secret.js'; },
    catalogue => { catalogue.records[0].local_path = 'dollhouse/lineage/originals/subdir/source.source.md'; },
    catalogue => { catalogue.records[0].local_path = 'dollhouse/lineage/originals/a%2fsecret.source.md'; },
    catalogue => { catalogue.records[0].local_path = 'dollhouse/lineage/originals/../../outside.source.md'; },
    catalogue => { catalogue.records[0].sha256 = null; },
    catalogue => { catalogue.records[1].bytes = 0; },
    catalogue => { catalogue.records[0].source_blob_sha = 'invalid'; },
    catalogue => { catalogue.records[0].source_url = catalogue.records[0].source_url.replace('a'.repeat(40), 'main'); },
    catalogue => { catalogue.snapshots[0].archive_url = 'https://github.com/tauric-diana-613/TD613-TCP/archive/main.zip'; },
    catalogue => { catalogue.records.push({ ...catalogue.records[0], id: 'duplicate-path' }); }
  ]) {
    const altered = structuredClone(f.catalogue);
    mutate(altered);
    assert.throws(() => validateDollhouseSourceCatalogue(Buffer.from(JSON.stringify(altered))), /Dollhouse export HOLD/);
  }
});

test('declared missing and symlink archived originals hold before creating output', async t => {
  const f = await fixture(t);
  const original = path.join(f.source, f.originalPath);
  await rm(original);
  await assert.rejects(exportDollhouseKit({ sourceRoot: f.source, outputDirectory: f.output('missing'), allowWorkingTree: true }), /missing path/);
  await assert.rejects(access(f.output('missing')));
  const outside = f.output('original.source.md');
  await writeFile(outside, f.originalBytes);
  await symlink(outside, original);
  await assert.rejects(exportDollhouseKit({ sourceRoot: f.source, outputDirectory: f.output('symlink'), allowWorkingTree: true }), /symlink path/);
  await assert.rejects(access(f.output('symlink')));
});

test('seven-megabyte 700-original archive remains bounded inert text without research execution', async t => {
  const f = await fixture(t);
  const prefix = 'globalThis.__dollhouseArchivedResearchExecuted = true; import("https://example.invalid/never-fetch.js");\n// à ';
  const originalBytes = Buffer.from(`${prefix}${'x'.repeat(10_000 - Buffer.byteLength(prefix) - 1)}\n`);
  assert.equal(originalBytes.length, 10_000);
  f.catalogue.records = [f.catalogue.records[1]];
  const commit = f.catalogue.snapshots[0].commit;
  for (let index = 0; index < 700; index++) {
    const label = `support-${String(index).padStart(4, '0')}`;
    const localPath = `dollhouse/lineage/originals/${label}.source.md`;
    await writeFile(path.join(f.source, localPath), originalBytes);
    f.catalogue.records.push({
      id: label, snapshot_id: 'fictional-fadt', source_path: `research/${label}.js`, source_blob_sha: gitBlobSha(originalBytes),
      source_url: `https://github.com/tauric-diana-613/TD613-TCP/blob/${commit}/research/${label}.js`,
      local_path: localPath, sha256: sha256(originalBytes), bytes: originalBytes.length
    });
  }
  await writeFile(path.join(f.source, 'dollhouse/lineage/source-records.json'), `${JSON.stringify(f.catalogue, null, 2)}\n`);
  const result = await exportDollhouseKit({ sourceRoot: f.source, outputDirectory: f.output('large-inert-kit'), allowWorkingTree: true });
  assert.equal(result.manifest.research_lineage.archived_original_count, 700);
  assert.equal(result.manifest.research_lineage.pinned_reference_only_count, 1);
  assert.equal(result.manifest.research_lineage.research_execution, false);
  assert.equal(result.manifest.authority.empirical_credit, 0);
  assert.ok(result.manifest.files.length < DOLLHOUSE_KIT_BOUNDS.max_files);
  assert.equal(result.manifest.files.filter(file => file.lineage).reduce((sum, file) => sum + file.bytes, 0), 7_000_000);
  assert.equal(globalThis.__dollhouseArchivedResearchExecuted, undefined);
  const receipt = await verifyDollhouseKit(result.output_directory);
  assert.equal(receipt.archived_original_count, 700);
  assert.ok(receipt.total_bytes < DOLLHOUSE_KIT_BOUNDS.max_total_bytes);
});
