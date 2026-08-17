import crypto from 'node:crypto';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const GIVING_RELEASE_CONTENT_SCHEMA = 'td613.giving.production-content-observation/v0.1-practice-critical';
export const GIVING_PRACTICE_CRITICAL_ASSETS = Object.freeze([
  'app/giving/history/index.html',
  'app/giving/history/giving-bootstrap.js',
  'app/giving/history/giving-ux-resilience-shell.js',
  'app/giving/history/giving-ux-resilience.css',
  'app/giving/history/giving-contact-queue-v2.js',
  'app/giving/history/giving-app.js',
  'app/giving/history/giving-search-controls.js',
  'app/giving/history/giving-dossier-help.js'
]);

const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export function extractBootstrapReference(indexSource) {
  const source = String(indexSource);
  const match = source.match(/<script\b[^>]*\btype=["']module["'][^>]*\bsrc=["']([^"']*giving-bootstrap\.js[^"']*)["'][^>]*>/i) ||
    source.match(/<script\b[^>]*\bsrc=["']([^"']*giving-bootstrap\.js[^"']*)["'][^>]*\btype=["']module["'][^>]*>/i);
  if (!match?.[1]) throw new Error('Giving index does not declare the module bootstrap.');
  return match[1];
}

export function extractAssetEpoch(bootstrapSource) {
  const match = String(bootstrapSource).match(/GIVING_ASSET_EPOCH\s*=\s*['"]([^'"]+)['"]/);
  if (!match?.[1]) throw new Error('Giving bootstrap does not declare GIVING_ASSET_EPOCH.');
  return match[1];
}

export function remotePathFor(localPath, { bootstrapReference, assetEpoch } = {}) {
  if (localPath === 'app/giving/history/index.html') return '/giving/history/';
  if (localPath === 'app/giving/history/giving-bootstrap.js') {
    const reference = String(bootstrapReference || '').trim();
    if (!reference) throw new Error('Giving bootstrap reference is required.');
    const url = new URL(reference, 'https://td613.invalid/giving/history/');
    return `${url.pathname}${url.search}`;
  }
  const relative = localPath.slice('app/giving/history/'.length);
  if (!relative || relative === localPath) throw new Error(`No Giving production route for ${localPath}.`);
  return `/giving/history/${relative}?v=${encodeURIComponent(assetEpoch)}`;
}

async function localManifest() {
  const indexBytes = await fsp.readFile('app/giving/history/index.html');
  const bootstrapBytes = await fsp.readFile('app/giving/history/giving-bootstrap.js');
  const indexSource = indexBytes.toString('utf8');
  const bootstrapSource = bootstrapBytes.toString('utf8');
  const bootstrapReference = extractBootstrapReference(indexSource);
  const assetEpoch = extractAssetEpoch(bootstrapSource);

  const assets = [];
  for (const localPath of GIVING_PRACTICE_CRITICAL_ASSETS) {
    const bytes = localPath === 'app/giving/history/index.html'
      ? indexBytes
      : localPath === 'app/giving/history/giving-bootstrap.js'
        ? bootstrapBytes
        : await fsp.readFile(localPath);
    assets.push({
      local_path: localPath,
      remote_path: remotePathFor(localPath, { bootstrapReference, assetEpoch }),
      sha256: sha256(bytes),
      size: bytes.length
    });
  }
  return { bootstrapReference, assetEpoch, assets };
}

async function observeOnce({ baseUrl, sourcePacketCommit, manifest, attempt }) {
  const remote = [];
  for (const item of manifest.assets) {
    const url = new URL(item.remote_path, `${baseUrl}/`);
    url.searchParams.set('td613_source_packet', sourcePacketCommit);
    url.searchParams.set('td613_giving_probe_attempt', String(attempt));
    const response = await fetch(url, {
      headers: { 'cache-control': 'no-cache' },
      redirect: 'follow'
    });
    if (!response.ok) throw new Error(`${url.pathname} returned ${response.status}.`);
    const bytes = Buffer.from(await response.arrayBuffer());
    const digest = sha256(bytes);
    if (digest !== item.sha256) {
      throw new Error(`${item.remote_path} digest ${digest} does not match source ${item.sha256}.`);
    }
    remote.push({
      local_path: item.local_path,
      remote_path: item.remote_path,
      final_url: response.url,
      sha256: digest,
      size: bytes.length,
      status: response.status
    });
  }
  return remote;
}

export async function waitForGivingReleaseContent({
  baseUrl,
  sourcePacketCommit,
  artifactDir = 'artifacts/giving-exact-source',
  attempts = 72,
  delayMs = 5000,
  onAttempt = null
} = {}) {
  const normalizedBase = String(baseUrl || '').replace(/\/$/, '');
  const normalizedCommit = String(sourcePacketCommit || '').trim();
  const normalizedAttempts = Number(attempts);
  const normalizedDelayMs = Number(delayMs);
  const out = path.resolve(artifactDir);

  if (!normalizedBase) throw new Error('Giving exact-source observation requires baseUrl.');
  if (!/^[0-9a-f]{40}$/.test(normalizedCommit)) throw new Error('Giving exact-source observation requires an exact 40-character source SHA.');
  if (!Number.isSafeInteger(normalizedAttempts) || normalizedAttempts < 1 || normalizedAttempts > 120) throw new Error('Giving content probe attempts must be 1..120.');
  if (!Number.isSafeInteger(normalizedDelayMs) || normalizedDelayMs < 0 || normalizedDelayMs > 60000) throw new Error('Giving content probe delay must be 0..60000ms.');

  await fsp.mkdir(out, { recursive: true });
  const manifest = await localManifest();
  let remote = null;
  let lastError = null;
  let passedAttempt = null;

  for (let attempt = 1; attempt <= normalizedAttempts; attempt += 1) {
    try {
      remote = await observeOnce({
        baseUrl: normalizedBase,
        sourcePacketCommit: normalizedCommit,
        manifest,
        attempt
      });
      passedAttempt = attempt;
      if (typeof onAttempt === 'function') onAttempt({ attempt, attempts: normalizedAttempts, ready: true, observation: 'practice-critical Giving bytes match source' });
      break;
    } catch (error) {
      lastError = error;
      if (typeof onAttempt === 'function') onAttempt({ attempt, attempts: normalizedAttempts, ready: false, observation: error.message });
      if (attempt < normalizedAttempts) await sleep(normalizedDelayMs);
    }
  }

  const observation = remote
    ? {
        schema: GIVING_RELEASE_CONTENT_SCHEMA,
        status: 'PASS',
        source_packet_commit: normalizedCommit,
        production_base_url: normalizedBase,
        practice_critical_surface_exact_source: true,
        bootstrap_reference: manifest.bootstrapReference,
        bootstrap_asset_epoch: manifest.assetEpoch,
        dependency_count: manifest.assets.length,
        attempt: passedAttempt,
        local: manifest.assets,
        remote,
        observed_at: new Date().toISOString(),
        authority: {
          authorizes_public_route_promotion: false,
          counts_as_human_evidence: false,
          closes_program: false
        }
      }
    : {
        schema: GIVING_RELEASE_CONTENT_SCHEMA,
        status: 'HELD',
        source_packet_commit: normalizedCommit,
        production_base_url: normalizedBase,
        practice_critical_surface_exact_source: false,
        bootstrap_reference: manifest.bootstrapReference,
        bootstrap_asset_epoch: manifest.assetEpoch,
        dependency_count: manifest.assets.length,
        attempts: normalizedAttempts,
        hold_reason: lastError?.message || 'Giving practice-critical content was not observed.',
        local: manifest.assets,
        observed_at: new Date().toISOString()
      };

  const artifactPath = path.join(out, 'giving-production-content-observation.json');
  await fsp.writeFile(artifactPath, `${JSON.stringify(observation, null, 2)}\n`, 'utf8');
  if (observation.status !== 'PASS') throw new Error(observation.hold_reason);
  return Object.freeze({ ...observation, artifact: artifactPath });
}

async function main() {
  const observation = await waitForGivingReleaseContent({
    baseUrl: process.env.TD613_BASE_URL,
    sourcePacketCommit: process.env.TD613_SOURCE_PACKET_COMMIT,
    artifactDir: process.env.TD613_ARTIFACT_DIR || 'artifacts/giving-exact-source',
    attempts: process.env.TD613_GIVING_CONTENT_PROBE_ATTEMPTS || process.env.TD613_PROBE_ATTEMPTS || 72,
    delayMs: process.env.TD613_GIVING_CONTENT_PROBE_DELAY_MS || process.env.TD613_PROBE_DELAY_MS || 5000
  });
  console.log(JSON.stringify({
    status: observation.status,
    source_packet_commit: observation.source_packet_commit,
    artifact: observation.artifact,
    dependency_count: observation.dependency_count,
    bootstrap_reference: observation.bootstrap_reference,
    bootstrap_asset_epoch: observation.bootstrap_asset_epoch
  }, null, 2));
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) await main();
