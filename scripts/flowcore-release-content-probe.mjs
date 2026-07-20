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

const surfaces = Object.freeze([
  ['app/dome-world/information-dome-pedagogue.html', '/dome-world/information-dome-pedagogue.html'],
  ['app/dome-world/information-dome-pedagogue-page.js', '/dome-world/information-dome-pedagogue-page.js'],
  ['app/dome-world/route-burden-observatory.html', '/dome-world/route-burden-observatory.html'],
  ['app/dome-world/ash-custody-pedagogue.html', '/dome-world/ash-custody-pedagogue.html'],
  ['app/dome-world/station-propagation-observatory.html', '/dome-world/station-propagation-observatory.html'],
  ['app/dome-world/physical-flowcore.html', '/dome-world/physical-flowcore.html'],
  ['app/dome-world/flowcore-validation-lab.html', '/dome-world/flowcore-validation-lab.html'],
  ['app/dome-world/flowcore-promotion-dashboard.html', '/dome-world/flowcore-promotion-dashboard.html'],
  ['app/dome-world/fixtures/pedagogue/flowcore-promotion-evidence.json', '/dome-world/fixtures/pedagogue/flowcore-promotion-evidence.json']
]);

const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

await fsp.mkdir(out, { recursive: true });
const local = [];
for (const [localPath, remotePath] of surfaces) {
  const bytes = await fsp.readFile(localPath);
  local.push({ local_path: localPath, remote_path: remotePath, sha256: sha256(bytes), size: bytes.length });
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
      if (digest !== item.sha256) throw new Error(`${item.remote_path} digest ${digest} does not match source ${item.sha256}.`);
      remote.push({ remote_path: item.remote_path, final_url: response.url, sha256: digest, size: bytes.length, status: response.status });
    }
    observation = {
      schema: 'td613.flowcore.production-content-observation/v0.1',
      status: 'PASS',
      source_packet_commit: sourcePacketCommit,
      production_base_url: base,
      exact_source_content_verified: true,
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
    schema: 'td613.flowcore.production-content-observation/v0.1',
    status: 'HELD',
    source_packet_commit: sourcePacketCommit,
    production_base_url: base,
    exact_source_content_verified: false,
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
console.log(JSON.stringify({ status: observation.status, source_packet_commit: sourcePacketCommit, artifact: artifactPath, surfaces: local.length }, null, 2));
