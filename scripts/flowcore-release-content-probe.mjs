import crypto from 'node:crypto';
import fsp from 'node:fs/promises';
import path from 'node:path';

const base = String(process.env.TD613_BASE_URL || '').replace(/\/$/, '');
const out = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/flowcore-production-observation');
const sourcePacketCommit = String(process.env.TD613_SOURCE_PACKET_COMMIT || '').trim();
const attempts = Number(process.env.TD613_PROBE_ATTEMPTS || 72);
const delayMs = Number(process.env.TD613_PROBE_DELAY_MS || 5000);

if (!base) throw new Error('TD613_BASE_URL is required.');
if (!/^[0-9a-f]{40}$/.test(sourcePacketCommit)) throw new Error('TD613_SOURCE_PACKET_COMMIT must be an exact 40-character SHA.');

const entrypoints = Object.freeze([
  'app/dome-world/information-dome-pedagogue.html',
  'app/dome-world/route-burden-observatory.html',
  'app/dome-world/ash-custody-pedagogue.html',
  'app/dome-world/station-propagation-observatory.html',
  'app/dome-world/physical-flowcore.html',
  'app/dome-world/flowcore-validation-lab.html',
  'app/dome-world/flowcore-promotion-dashboard.html'
]);

const allowedExtensions = new Set(['.html', '.js', '.mjs', '.css', '.json', '.svg']);
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const vercelConfig = JSON.parse(await fsp.readFile('vercel.json', 'utf8'));

function localToRemote(localPath) {
  const normalized = localPath.replaceAll('\\', '/');
  if (normalized.startsWith('app/dome-world/')) return `/dome-world/${normalized.slice('app/dome-world/'.length)}`;
  if (normalized.startsWith('app/engine/')) return `/engine/${normalized.slice('app/engine/'.length)}`;
  throw new Error(`No governed production route for ${localPath}.`);
}

function remoteToLocal(reference) {
  if (reference.startsWith('/dome-world/')) return `app/dome-world/${reference.slice('/dome-world/'.length)}`;
  if (reference.startsWith('/engine/')) return `app/engine/${reference.slice('/engine/'.length)}`;
  if (reference.startsWith('/app/dome-world/')) return reference.slice(1);
  if (reference.startsWith('/app/engine/')) return reference.slice(1);
  return null;
}

function exactStaticRewrite(remotePath) {
  const rewrite = (vercelConfig.rewrites || []).find(candidate => candidate?.source === remotePath);
  if (!rewrite) return null;
  const destination = String(rewrite.destination || '').split('?', 1)[0];
  const localPath = remoteToLocal(destination);
  return localPath && allowedExtensions.has(path.extname(localPath).toLowerCase())
    ? { source: remotePath, destination, local_path: localPath }
    : null;
}

function referencesFor(filePath, source) {
  const extension = path.extname(filePath).toLowerCase();
  const references = [];
  const collect = expression => {
    for (const match of source.matchAll(expression)) if (match[1]) references.push(match[1]);
  };
  if (extension === '.html') {
    collect(/\bsrc\s*=\s*["']([^"'#?]+)["']/gi);
    collect(/<link\b[^>]*\bhref\s*=\s*["']([^"'#?]+)["'][^>]*>/gi);
  }
  if (extension === '.js' || extension === '.mjs') {
    collect(/(?:import\s+(?:[^"']+?\s+from\s+)?|export\s+[^"']*?\s+from\s+|import\s*\()\s*["']([^"']+)["']/g);
    collect(/fetch\s*\(\s*["']([^"']+)["']/g);
  }
  if (extension === '.css') collect(/url\(\s*["']?([^"')]+)["']?\s*\)/g);
  return references;
}

async function resolveReference(fromPath, reference) {
  const clean = String(reference).split(/[?#]/, 1)[0].trim();
  if (!clean || /^(?:data:|https?:|mailto:|tel:|#)/i.test(clean)) return null;
  const rooted = remoteToLocal(clean);
  const candidate = path.normalize(rooted || path.resolve(path.dirname(fromPath), clean));
  const relative = path.relative(process.cwd(), candidate).replaceAll('\\', '/');
  if (relative.startsWith('../') || path.isAbsolute(relative)) return null;
  if (!allowedExtensions.has(path.extname(relative).toLowerCase())) return null;
  try {
    const stat = await fsp.stat(relative);
    return stat.isFile() ? relative : null;
  } catch {
    return null;
  }
}

async function discoverRuntimeClosure() {
  const queue = entrypoints.map(file => ({ file, discovered_from: 'entrypoint' }));
  const found = new Map();
  while (queue.length) {
    const next = queue.shift();
    if (found.has(next.file)) continue;
    const bytes = await fsp.readFile(next.file);
    found.set(next.file, { bytes, discovered_from: next.discovered_from });
    const source = bytes.toString('utf8');
    for (const reference of referencesFor(next.file, source)) {
      const resolved = await resolveReference(next.file, reference);
      if (resolved && !found.has(resolved)) queue.push({ file: resolved, discovered_from: next.file });
    }
  }
  return [...found.entries()].sort(([left], [right]) => left.localeCompare(right));
}

await fsp.mkdir(out, { recursive: true });
const closure = await discoverRuntimeClosure();
const local = await Promise.all(closure.map(async ([localPath, value]) => {
  const remotePath = localToRemote(localPath);
  const rewrite = exactStaticRewrite(remotePath);
  const expectedLocalPath = rewrite?.local_path || localPath;
  const expectedBytes = expectedLocalPath === localPath ? value.bytes : await fsp.readFile(expectedLocalPath);
  return {
    local_path: localPath,
    expected_local_path: expectedLocalPath,
    remote_path: remotePath,
    declared_rewrite: rewrite,
    discovered_from: value.discovered_from,
    sha256: sha256(expectedBytes),
    size: expectedBytes.length
  };
}));

for (const required of [
  'app/dome-world/station-propagation-observatory.js',
  'app/engine/flowcore-station-propagation.js',
  'app/dome-world/fixtures/pedagogue/cross-station-propagation.json'
]) {
  if (!local.some(item => item.local_path === required)) throw new Error(`Runtime dependency closure omitted ${required}.`);
}
if (local.length < 20) throw new Error(`Runtime dependency closure is unexpectedly small (${local.length}).`);
if (local.some(item => item.discovered_from !== 'entrypoint' && item.local_path.endsWith('.html'))) {
  throw new Error('Runtime dependency closure followed a navigational HTML document.');
}

let observation = null;
let lastError = null;
for (let attempt = 1; attempt <= attempts; attempt += 1) {
  try {
    const remote = [];
    for (const item of local) {
      const url = new URL(item.remote_path, `${base}/`);
      url.searchParams.set('td613_source_packet', sourcePacketCommit);
      url.searchParams.set('td613_probe_attempt', String(attempt));
      const response = await fetch(url, { headers: { 'cache-control': 'no-cache' }, redirect: 'follow' });
      if (!response.ok) throw new Error(`${item.remote_path} returned ${response.status}.`);
      const bytes = Buffer.from(await response.arrayBuffer());
      const digest = sha256(bytes);
      if (digest !== item.sha256) {
        const rewriteDetail = item.declared_rewrite ? ` after declared rewrite to ${item.declared_rewrite.destination}` : '';
        throw new Error(`${item.remote_path} digest ${digest} does not match source ${item.sha256}${rewriteDetail}.`);
      }
      remote.push({
        remote_path: item.remote_path,
        expected_local_path: item.expected_local_path,
        declared_rewrite: item.declared_rewrite,
        final_url: response.url,
        sha256: digest,
        size: bytes.length,
        status: response.status
      });
    }
    observation = {
      schema: 'td613.flowcore.production-content-observation/v0.3-rewrite-aware-asset-closure',
      status: 'PASS',
      source_packet_commit: sourcePacketCommit,
      production_base_url: base,
      exact_source_content_verified: true,
      dependency_closure_verified: true,
      navigation_links_excluded: true,
      declared_static_rewrites_resolved: true,
      dependency_count: local.length,
      application_tree_drift: 'none',
      attempt,
      local,
      remote,
      observed_at: new Date().toISOString(),
      authority: {
        authorizes_public_route_promotion: false,
        counts_as_human_evidence: false,
        closes_program: false
      }
    };
    break;
  } catch (error) {
    lastError = error;
    if (attempt < attempts) await sleep(delayMs);
  }
}

if (!observation) {
  observation = {
    schema: 'td613.flowcore.production-content-observation/v0.3-rewrite-aware-asset-closure',
    status: 'HELD',
    source_packet_commit: sourcePacketCommit,
    production_base_url: base,
    exact_source_content_verified: false,
    dependency_closure_verified: false,
    navigation_links_excluded: true,
    declared_static_rewrites_resolved: true,
    dependency_count: local.length,
    application_tree_drift: 'UNRESOLVED',
    hold_reason: lastError?.message || 'Production content was not observed.',
    attempts,
    local,
    observed_at: new Date().toISOString()
  };
}

const artifactPath = path.join(out, 'flowcore-production-content-observation.json');
await fsp.writeFile(artifactPath, `${JSON.stringify(observation, null, 2)}\n`, 'utf8');
if (observation.status !== 'PASS') throw new Error(observation.hold_reason);
console.log(JSON.stringify({
  status: observation.status,
  source_packet_commit: sourcePacketCommit,
  artifact: artifactPath,
  dependency_count: local.length
}, null, 2));
