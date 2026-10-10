import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { validateAssayPolicy, requireThat, sha256, canonicalJson } from '../../server/loom-assay-contract.js';
import { loadServerManifest } from './server-client.mjs';

// Produces inert parameterized enrollment material only. No database or provider calls.
try {
  const [policyFile, capabilityDigest, newFile] = process.argv.slice(2);
  requireThat(policyFile && /^[a-f0-9]{64}$/.test(capabilityDigest || '') && newFile && !existsSync(newFile), 'ASSAY_ENROLLMENT_ARGUMENTS');
  const policy = validateAssayPolicy(JSON.parse(readFileSync(policyFile)));
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  requireThat(head === policy.protocol_commit, 'ASSAY_ENROLLMENT_SOURCE_MISMATCH');
  const { manifest } = loadServerManifest(process.cwd(), policy.run_id);
  requireThat(manifest.artifact_sha256 === policy.artifact_sha256, 'ASSAY_ENROLLMENT_ARTIFACT_MISMATCH');
  const proposal = { status: 'PREPARED_NOT_APPLIED', source_commit: head, policy_sha256: sha256(canonicalJson(policy)),
    sql: 'INSERT INTO td613_assay_runs(run_id,credential_sha256,policy,policy_sha256,status) VALUES ($1,$2,$3,$4,$5)',
    params: [policy.run_id, capabilityDigest, policy, sha256(canonicalJson(policy)), 'ACTIVE'],
    authority: 'Requires exact artifact, financial and deployment authorization; this file creates none' };
  writeFileSync(newFile, JSON.stringify(proposal, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ status: proposal.status, source_commit: head, policy_sha256: proposal.policy_sha256 }));
} catch (e) { console.error(JSON.stringify({ status: 'HELD', error: e.message })); process.exitCode = 2; }
