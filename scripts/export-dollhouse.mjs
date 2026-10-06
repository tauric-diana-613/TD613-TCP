#!/usr/bin/env node
import { readFile, writeFile, mkdir, lstat, realpath, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { isBuiltin } from 'node:module';

export const DOLLHOUSE_KIT_SCHEMA = 'td613.dollhouse.export-kit/v0.1';
export const DOLLHOUSE_SOURCE_RECORDS_SCHEMA = 'td613.dollhouse.source-records/v0.1';
export const DOLLHOUSE_KIT_BOUNDS = Object.freeze({ max_files: 2048, max_total_bytes: 32_000_000, max_file_bytes: 2_000_000 });
export const DOLLHOUSE_KIT_ENTRYPOINTS = Object.freeze([
  'AGENTS.md', 'DOLLHOUSE.md', 'PEDAGOGUE.md', 'APERTURE.md', 'ATLAS.md', 'FADT.md', 'TEMPORAL_CUSTODIAN.md',
  'dollhouse/README.md',
  'dollhouse/lineage/README.md',
  'dollhouse/lineage/aperture-mathematical-cradle.md',
  'dollhouse/lineage/source-records.json',
  'scripts/export-dollhouse.mjs',
  'scripts/run-dollhouse-agent-audit.mjs',
  'scripts/run-dollhouse-portable-roundtrip.mjs',
  'scripts/run-pedagogue-design-gate.mjs',
  'app/engine/dollhouse-agent-registry.js',
  'app/engine/dollhouse-atlas-fadt.js',
  'app/engine/dollhouse-portable-aia-roundtrip.js',
  'app/engine/marrowline-dollhouse-audit.js',
  'app/engine/aperture-v32-typed-epistemic-deficit.js',
  'app/engine/pedagogue-gesture-consequence.js',
  'app/engine/dollhouse-continuity-audit.js',
  'app/engine/dollhouse-witness-plan.js',
  'app/engine/dollhouse-case-dossier.js',
  'app/engine/dollhouse-temporal-custodian.js'
]);

const manifestName = 'dollhouse-kit.manifest.json';
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const gitBlobSha = bytes => createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
const canonical = value => Array.isArray(value) ? `[${value.map(canonical).join(',')}]`
  : value && typeof value === 'object' ? `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`
    : JSON.stringify(value);
const hold = message => { throw new Error(`Dollhouse export HOLD: ${message}`); };
const runtimeAllowed = relative => /^app\/engine\/[a-z0-9-]+\.js$/.test(relative)
  || /^app\/dome-world\/(?:holonomy-loom|data)\/[a-z0-9-]+\.js$/.test(relative)
  || relative === 'app/dome-world/ash/canonical-json.js';
const entrypointSet = new Set(DOLLHOUSE_KIT_ENTRYPOINTS);
const cataloguePath = 'dollhouse/lineage/source-records.json';
const originalAllowed = relative => /^dollhouse\/lineage\/originals\/[a-z0-9][a-z0-9._-]*\.source\.md$/.test(relative);

function safeRelative(relative) {
  if (typeof relative !== 'string' || !relative || path.posix.isAbsolute(relative)
    || /[\\\x00%?#]/.test(relative) || relative.split('/').some(segment => !segment || segment === '.' || segment === '..')
    || relative.split('/').some(segment => /^(?:\.git|node_modules|\.env.*)$/.test(segment))) hold(`unsafe path ${JSON.stringify(relative)}`);
  return relative;
}

async function noSymlinkPath(absolute) {
  const resolved = path.resolve(absolute);
  const parsed = path.parse(resolved);
  let cursor = parsed.root;
  for (const segment of resolved.slice(parsed.root.length).split(path.sep).filter(Boolean)) {
    cursor = path.join(cursor, segment);
    let info;
    try { info = await lstat(cursor); } catch (error) {
      if (error.code === 'ENOENT') hold(`missing path ${cursor}`);
      throw error;
    }
    if (info.isSymbolicLink()) hold(`symlink path ${cursor}`);
  }
  return resolved;
}

async function sourceBytes(root, relative, archivedPaths = new Set()) {
  safeRelative(relative);
  if (!entrypointSet.has(relative) && !runtimeAllowed(relative) && !(originalAllowed(relative) && archivedPaths.has(relative))) hold(`dependency outside allowed runtime estate: ${relative}`);
  const absolute = path.resolve(root, relative);
  if (!absolute.startsWith(`${root}${path.sep}`)) hold(`path escapes source root: ${relative}`);
  await noSymlinkPath(absolute);
  const info = await lstat(absolute);
  if (!info.isFile()) hold(`source is not a regular file: ${relative}`);
  if (info.size > DOLLHOUSE_KIT_BOUNDS.max_file_bytes) hold(`oversized source file: ${relative}`);
  const bytes = await readFile(absolute);
  if (bytes.length > DOLLHOUSE_KIT_BOUNDS.max_file_bytes) hold(`oversized source file: ${relative}`);
  return bytes;
}

function pinnedSourceUrl(record, snapshot, repository) {
  let url;
  try { url = new URL(record.source_url); } catch { hold(`invalid pinned source URL: ${record.id}`); }
  const prefix = `/${repository}/blob/${snapshot.commit}/`;
  let sourcePath;
  try { sourcePath = decodeURIComponent(url.pathname.slice(prefix.length)); } catch { hold(`invalid encoded source URL: ${record.id}`); }
  if (url.protocol !== 'https:' || url.hostname !== 'github.com' || url.username || url.password || url.port || url.search || url.hash
    || !url.pathname.startsWith(prefix) || sourcePath !== record.source_path) hold(`source URL is not bound to declared snapshot/path: ${record.id}`);
}

export function validateDollhouseSourceCatalogue(bytes) {
  let catalogue;
  try { catalogue = JSON.parse(bytes.toString('utf8')); } catch { hold('lineage source catalogue must be JSON'); }
  if (catalogue?.schema !== DOLLHOUSE_SOURCE_RECORDS_SCHEMA || catalogue.repository !== 'tauric-diana-613/TD613-TCP'
    || catalogue.archival_status !== 'SOURCE_REFERENCES_AND_EXACT_DOCUMENT_COPIES_ONLY'
    || !Array.isArray(catalogue.snapshots) || !catalogue.snapshots.length || catalogue.snapshots.length > 128
    || !Array.isArray(catalogue.records) || !catalogue.records.length || catalogue.records.length > 2000
    || !Array.isArray(catalogue.selection_scope) || !catalogue.selection_scope.every(item => typeof item === 'string' && item.trim())) hold('invalid lineage source catalogue contract');
  const snapshots = new Map();
  for (const snapshot of catalogue.snapshots) {
    if (!snapshot || typeof snapshot.id !== 'string' || !snapshot.id || snapshots.has(snapshot.id)
      || !/^[0-9a-f]{40}$/.test(snapshot.commit) || typeof snapshot.merged !== 'boolean'
      || typeof snapshot.pr_state !== 'string' || !snapshot.pr_state
      || typeof snapshot.source_role !== 'string' || !snapshot.source_role
      || (snapshot.pr_number !== null && (!Number.isInteger(snapshot.pr_number) || snapshot.pr_number < 1))) hold('invalid or duplicate lineage snapshot');
    const expectedArchive = `https://github.com/${catalogue.repository}/archive/${snapshot.commit}`;
    if (![`${expectedArchive}.zip`, `${expectedArchive}.tar.gz`].includes(snapshot.archive_url)) hold(`archive URL lacks immutable commit binding: ${snapshot.id}`);
    snapshots.set(snapshot.id, snapshot);
  }
  const ids = new Set();
  const archives = new Map();
  let referenceOnly = 0;
  for (const record of catalogue.records) {
    if (!record || typeof record.id !== 'string' || !record.id || ids.has(record.id)
      || typeof record.source_path !== 'string' || !record.source_path || record.source_path.includes('\0')
      || path.posix.isAbsolute(record.source_path) || record.source_path.split('/').some(segment => !segment || segment === '.' || segment === '..')
      || !/^[0-9a-f]{40}$/.test(record.source_blob_sha) || !snapshots.has(record.snapshot_id)) hold('invalid or duplicate pinned lineage record');
    ids.add(record.id);
    const snapshot = snapshots.get(record.snapshot_id);
    pinnedSourceUrl(record, snapshot, catalogue.repository);
    if (record.local_path === null && record.sha256 === null && record.bytes === null) { referenceOnly += 1; continue; }
    safeRelative(record.local_path);
    if (!originalAllowed(record.local_path) || archives.has(record.local_path)
      || !/^[0-9a-f]{64}$/.test(record.sha256) || !Number.isInteger(record.bytes) || record.bytes < 0 || record.bytes > DOLLHOUSE_KIT_BOUNDS.max_file_bytes) hold(`invalid archived original record: ${record.id}`);
    archives.set(record.local_path, { record, snapshot });
  }
  return {
    archives,
    summary: {
      catalogue_schema: DOLLHOUSE_SOURCE_RECORDS_SCHEMA,
      archived_original_count: archives.size,
      pinned_reference_only_count: referenceOnly,
      archived_original_paths: [...archives.keys()].sort(),
      integrity_basis: 'DECLARED_SHA256_AND_GIT_BLOB_OBJECT_ID',
      upstream_authenticity_established: false,
      full_research_archives_included: false,
      research_execution: false,
      merged_history_changed: false
    }
  };
}

function verifyOriginalBytes(relative, bytes, declared) {
  const { record, snapshot } = declared;
  if (bytes.length !== record.bytes || sha256(bytes) !== record.sha256 || gitBlobSha(bytes) !== record.source_blob_sha) hold(`archived original byte/hash identity mismatch: ${relative}`);
  return {
    record_id: record.id, snapshot_id: record.snapshot_id, source_commit: snapshot.commit,
    source_path: record.source_path, source_blob_sha: record.source_blob_sha,
    research_merged: snapshot.merged, upstream_authenticity_established: false
  };
}

// V8 parses static imports without evaluating repository code. The scanner is
// deliberately conservative: dependency-bearing dynamic/CommonJS syntax holds,
// even inside a documentation string, rather than guessing a runtime closure.
export function staticModuleDependencies(source, relative) {
  const gap = '(?:\\s|/\\*[\\s\\S]*?\\*/|//[^\\n\\r\\u2028\\u2029]*(?:[\\n\\r\\u2028\\u2029]|$))*';
  if (new RegExp(`\\b(?:import|require)${gap}\\(`).test(source)
    || /\b(?:createRequire|eval)\s*\(/.test(source)) hold(`dynamic dependency syntax in ${relative}`);
  const parser = `import{readFileSync}from'node:fs';import{SourceTextModule}from'node:vm';const input=JSON.parse(readFileSync(0,'utf8'));const mod=new SourceTextModule(input.source,{identifier:input.path});process.stdout.write(JSON.stringify(mod.dependencySpecifiers));`;
  try {
    return JSON.parse(execFileSync(process.execPath, ['--experimental-vm-modules', '--input-type=module', '-e', parser], {
      input: JSON.stringify({ source, path: relative }), encoding: 'utf8', maxBuffer: 3_000_000,
      stdio: ['pipe', 'pipe', 'pipe']
    }));
  } catch { hold(`unparseable static ES module ${relative}`); }
}

function resolveDependency(importer, specifier) {
  if (specifier.startsWith('node:') && isBuiltin(specifier)) return { builtin: specifier };
  if (!specifier.startsWith('./') && !specifier.startsWith('../')) hold(`external dependency ${specifier} in ${importer}`);
  if (/[\\\x00%?#]/.test(specifier)) hold(`unsafe import ${specifier} in ${importer}`);
  const relative = path.posix.normalize(path.posix.join(path.posix.dirname(importer), specifier));
  safeRelative(relative);
  if (!runtimeAllowed(relative)) hold(`dependency outside allowed runtime estate: ${relative}`);
  return { relative };
}

export async function collectDollhouseSources(sourceRoot) {
  const root = await noSymlinkPath(path.resolve(sourceRoot));
  if (await realpath(root) !== root) hold('source root realpath mismatch');
  const collected = new Map();
  const lineage = validateDollhouseSourceCatalogue(await sourceBytes(root, cataloguePath));
  const archivedPaths = new Set(lineage.archives.keys());
  // The isolated parser uses only these fixed Node builtins; repository source
  // text is its data input and is never evaluated as child-process code.
  const builtins = new Set(['node:fs', 'node:vm']);
  const pending = [...DOLLHOUSE_KIT_ENTRYPOINTS, ...archivedPaths];
  let totalBytes = 0;
  while (pending.length) {
    const relative = pending.shift();
    if (collected.has(relative)) continue;
    const bytes = await sourceBytes(root, relative, archivedPaths);
    totalBytes += bytes.length;
    if (collected.size + 2 >= DOLLHOUSE_KIT_BOUNDS.max_files || totalBytes > DOLLHOUSE_KIT_BOUNDS.max_total_bytes) hold('source closure exceeds kit file/byte bounds');
    const dependencies = [];
    if (/\.m?js$/.test(relative)) {
      for (const specifier of staticModuleDependencies(bytes.toString('utf8'), relative)) {
        const dependency = resolveDependency(relative, specifier);
        if (dependency.builtin) builtins.add(dependency.builtin);
        else { dependencies.push(dependency.relative); pending.push(dependency.relative); }
      }
    }
    const original = lineage.archives.has(relative) ? verifyOriginalBytes(relative, bytes, lineage.archives.get(relative)) : null;
    collected.set(relative, { bytes, imports: [...new Set(dependencies)].sort(), ...(original ? { lineage: original } : {}) });
  }
  return { root, collected, builtins: [...builtins].sort(), lineage: lineage.summary, archivedPaths };
}

function git(root, ...args) {
  try { return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 3_000_000 }).trim(); }
  catch { hold('source must be a Git repository with an inspectable HEAD'); }
}

function sourceIdentity(root, collected, allowWorkingTree) {
  const revision = git(root, 'rev-parse', '--verify', 'HEAD');
  const tree = git(root, 'rev-parse', 'HEAD^{tree}');
  if (!/^[0-9a-f]{40,64}$/.test(revision) || !/^[0-9a-f]{40,64}$/.test(tree)) hold('invalid source revision/tree identity');
  const modifiedPaths = [];
  for (const [relative, { bytes }] of collected) {
    let committed;
    try { committed = execFileSync('git', ['-C', root, 'show', `${revision}:${relative}`], { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 3_000_000 }); }
    catch { modifiedPaths.push(relative); continue; }
    if (!bytes.equals(committed)) modifiedPaths.push(relative);
  }
  if (modifiedPaths.length && !allowWorkingTree) hold('bundled bytes differ from HEAD; commit them or explicitly use --allow-working-tree');
  return {
    revision, tree,
    provenance: modifiedPaths.length ? 'WORKING_TREE_CANDIDATE' : 'EXACT_COMMITTED_BUNDLED_BYTES',
    modified_bundled_paths: modifiedPaths.sort(),
    scope: 'SHA256 manifest binds bundled bytes; Git HEAD/tree anchors are local references, not authenticated origin.'
  };
}

export async function exportDollhouseKit({ sourceRoot, outputDirectory, allowWorkingTree = false }) {
  if (!outputDirectory || typeof outputDirectory !== 'string') hold('operator-chosen new output directory is required');
  const { root, collected, builtins, lineage, archivedPaths } = await collectDollhouseSources(sourceRoot);
  const source = sourceIdentity(root, collected, allowWorkingTree);
  const output = path.resolve(outputDirectory);
  if (output === root || output.startsWith(`${root}${path.sep}`) || root.startsWith(`${output}${path.sep}`) || output === path.parse(output).root) hold('choose a new output directory outside the repository and its ancestor roots');
  await noSymlinkPath(path.dirname(output));
  try { await lstat(output); hold('output directory already exists; nothing was overwritten'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }

  const packageBytes = Buffer.from(`${JSON.stringify({ name: 'td613-dollhouse-kit', private: true, type: 'module' }, null, 2)}\n`);
  collected.set('package.json', { bytes: packageBytes, imports: [], generated: true });
  const files = [...collected].sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0).map(([relative, record]) => ({
    path: relative, bytes: record.bytes.length, sha256: sha256(record.bytes), imports: record.imports,
    source: record.generated ? 'GENERATED_NO_INSTALL_SCRIPTS_OR_DEPENDENCIES' : record.lineage ? 'DECLARED_PINNED_ORIGINAL_DOCUMENT_BYTES' : 'CANONICAL_REPOSITORY_BYTES',
    ...(record.lineage ? { lineage: record.lineage } : {})
  }));
  const payload = {
    schema: DOLLHOUSE_KIT_SCHEMA, source, entrypoints: [...DOLLHOUSE_KIT_ENTRYPOINTS],
    packaging_bounds: DOLLHOUSE_KIT_BOUNDS,
    research_lineage: lineage,
    dependency_closure: { method: 'V8_STATIC_ESM_NO_EXECUTION', complete_for_declared_entrypoints: true, dynamic_imports: 'HOLD', external_packages: 'HOLD', node_builtins: builtins },
    authority: { provider_execution: false, experiment_execution: false, merge: false, deployment: false, human_closure_required: true, empirical_credit: 0 },
    files
  };
  const manifest = { ...payload, manifest_sha256: sha256(canonical(payload)) };
  const manifestBytes = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`);
  const totalBytes = [...collected.values()].reduce((total, record) => total + record.bytes.length, manifestBytes.length);
  if (collected.size + 1 > DOLLHOUSE_KIT_BOUNDS.max_files || manifestBytes.length > DOLLHOUSE_KIT_BOUNDS.max_file_bytes || totalBytes > DOLLHOUSE_KIT_BOUNDS.max_total_bytes) hold('final kit exceeds file/byte bounds');
  // Source may change while closure is collected. Re-read each exact file before
  // creating anything so an interrupted work session cannot seal mixed bytes.
  for (const [relative, record] of collected) {
    if (!record.generated && !(await sourceBytes(root, relative, archivedPaths)).equals(record.bytes)) hold(`source changed during collection: ${relative}`);
  }
  if (git(root, 'rev-parse', '--verify', 'HEAD') !== source.revision) hold('source HEAD changed during collection');
  await mkdir(output);
  for (const [relative, record] of collected) {
    const target = path.join(output, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, record.bytes, { flag: 'wx', mode: 0o600 });
  }
  await writeFile(path.join(output, manifestName), manifestBytes, { flag: 'wx', mode: 0o600 });
  await verifyDollhouseKit(output);
  return { output_directory: output, manifest };
}

export async function verifyDollhouseKit(directory) {
  const root = await noSymlinkPath(path.resolve(directory));
  await noSymlinkPath(path.join(root, manifestName));
  const manifestSize = (await lstat(path.join(root, manifestName))).size;
  if (manifestSize > DOLLHOUSE_KIT_BOUNDS.max_file_bytes) hold('oversized kit manifest');
  const manifest = JSON.parse(await readFile(path.join(root, manifestName), 'utf8'));
  const { manifest_sha256: digest, ...payload } = manifest;
  if (manifest.schema !== DOLLHOUSE_KIT_SCHEMA || sha256(canonical(payload)) !== digest) hold('manifest integrity mismatch');
  if (canonical(manifest.entrypoints) !== canonical(DOLLHOUSE_KIT_ENTRYPOINTS)) hold('entrypoint allowlist mismatch');
  if (canonical(manifest.packaging_bounds) !== canonical(DOLLHOUSE_KIT_BOUNDS)) hold('packaging bound mismatch');
  if (!Array.isArray(manifest.files) || !manifest.files.length || manifest.files.length + 1 > DOLLHOUSE_KIT_BOUNDS.max_files) hold('manifest file count is empty or exceeds bounds');
  await noSymlinkPath(path.join(root, cataloguePath));
  if ((await lstat(path.join(root, cataloguePath))).size > DOLLHOUSE_KIT_BOUNDS.max_file_bytes) hold('oversized lineage catalogue');
  const lineage = validateDollhouseSourceCatalogue(await readFile(path.join(root, cataloguePath)));
  if (canonical(manifest.research_lineage) !== canonical(lineage.summary)) hold('research lineage manifest mismatch');
  const declared = new Set([manifestName]);
  const records = new Map();
  let totalBytes = manifestSize;
  for (const record of manifest.files) {
    safeRelative(record.path);
    if (!entrypointSet.has(record.path) && !runtimeAllowed(record.path) && record.path !== 'package.json' && !lineage.archives.has(record.path)) hold(`undeclared source estate: ${record.path}`);
    if (declared.has(record.path)) hold(`duplicate manifest path: ${record.path}`);
    declared.add(record.path);
    await noSymlinkPath(path.join(root, record.path));
    const info = await lstat(path.join(root, record.path));
    if (!info.isFile()) hold(`kit member is not a file: ${record.path}`);
    totalBytes += info.size;
    if (info.size > DOLLHOUSE_KIT_BOUNDS.max_file_bytes || totalBytes > DOLLHOUSE_KIT_BOUNDS.max_total_bytes) hold('kit member exceeds file/byte bounds');
    const bytes = await readFile(path.join(root, record.path));
    if (bytes.length !== record.bytes || sha256(bytes) !== record.sha256) hold(`modified kit bytes: ${record.path}`);
    if (lineage.archives.has(record.path) && canonical(record.lineage) !== canonical(verifyOriginalBytes(record.path, bytes, lineage.archives.get(record.path)))) hold(`archived lineage manifest mismatch: ${record.path}`);
    records.set(record.path, { ...record, content: bytes.toString('utf8') });
  }
  const walk = async (base, prefix = '') => {
    for (const item of await readdir(base, { withFileTypes: true })) {
      const relative = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.isSymbolicLink()) hold(`symlink kit member: ${relative}`);
      if (item.isDirectory()) await walk(path.join(base, item.name), relative);
      else if (!declared.has(relative)) hold(`undeclared kit member: ${relative}`);
    }
  };
  await walk(root);
  for (const entrypoint of DOLLHOUSE_KIT_ENTRYPOINTS) {
    if (!records.has(entrypoint)) hold(`missing entrypoint: ${entrypoint}`);
  }
  for (const original of lineage.archives.keys()) {
    if (!records.has(original)) hold(`missing declared archived original: ${original}`);
  }
  for (const [relative, record] of records) {
    for (const dependency of record.imports) {
      if (!records.has(dependency)) hold(`missing declared import ${dependency} in ${relative}`);
    }
    if (/\.m?js$/.test(relative)) {
      const imports = staticModuleDependencies(record.content, relative).map(specifier => resolveDependency(relative, specifier)).filter(dependency => dependency.relative).map(dependency => dependency.relative);
      if (canonical([...new Set(imports)].sort()) !== canonical(record.imports)) hold(`import manifest mismatch: ${relative}`);
    }
  }
  return { status: 'INTEGRITY_VERIFIED', manifest_sha256: digest, file_count: records.size, total_bytes: totalBytes,
    archived_original_count: lineage.summary.archived_original_count, upstream_authenticity_established: false, empirical_credit: 0 };
}

const invoked = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (invoked === import.meta.url) {
  try {
    const args = process.argv.slice(2);
    let result;
    if (args.length === 2 && args[0] === '--verify') result = await verifyDollhouseKit(args[1]);
    else if (args.length === 1 || (args.length === 2 && args[1] === '--allow-working-tree')) {
      result = await exportDollhouseKit({ sourceRoot: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), outputDirectory: args[0], allowWorkingTree: args.includes('--allow-working-tree') });
    } else hold('Usage: node scripts/export-dollhouse.mjs <new-output-directory> [--allow-working-tree] | --verify <kit-directory>');
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }
}
