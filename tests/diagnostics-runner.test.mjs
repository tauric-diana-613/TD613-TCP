import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const diagnosticsScript = path.join(repoRoot, 'scripts', 'run-diagnostics-battery.mjs');
const reportsDir = path.join(repoRoot, 'reports', 'diagnostics');
const stageDir = path.join(reportsDir, '.staging');
const activeManifestPath = path.join(stageDir, 'active-run.json');
const latestJsonPath = path.join(reportsDir, 'latest.json');
const latestMdPath = path.join(reportsDir, 'latest.md');

function runDiagnostics(args = []) {
  return spawnSync(process.execPath, [diagnosticsScript, ...args], {
    cwd: repoRoot,
    encoding: 'utf8'
  });
}

const latestJsonBefore = fs.readFileSync(latestJsonPath, 'utf8');
const latestMdBefore = fs.readFileSync(latestMdPath, 'utf8');

fs.rmSync(stageDir, { recursive: true, force: true });

try {
  const stagedSampleAudit = runDiagnostics(['--fresh', '--section=sampleAudit']);
  assert.equal(stagedSampleAudit.status, 0, `sampleAudit staging exits cleanly: ${stagedSampleAudit.stderr || stagedSampleAudit.stdout}`);
  assert.ok(fs.existsSync(activeManifestPath), 'staging writes an active run manifest');

  const activeManifest = JSON.parse(fs.readFileSync(activeManifestPath, 'utf8'));
  const sampleAuditSnapshotPath = path.join(stageDir, activeManifest.runId, 'sampleAudit.json');
  assert.ok(fs.existsSync(sampleAuditSnapshotPath), 'sampleAudit section snapshot is written');
  assert.equal(fs.readFileSync(latestJsonPath, 'utf8'), latestJsonBefore, 'section-only staging does not overwrite latest.json');
  assert.equal(fs.readFileSync(latestMdPath, 'utf8'), latestMdBefore, 'section-only staging does not overwrite latest.md');

  const assembleOnlyFailure = runDiagnostics(['--assemble-only']);
  assert.notEqual(assembleOnlyFailure.status, 0, 'assemble-only fails when required staged sections are missing');
  const assembleFailureOutput = `${assembleOnlyFailure.stderr}\n${assembleOnlyFailure.stdout}`;
  assert.match(assembleFailureOutput, /missing or stale sections/i, 'assemble-only failure explains the missing staged sections');

  const stagedPersonaAudit = runDiagnostics(['--section=personaAudit']);
  assert.equal(stagedPersonaAudit.status, 0, `personaAudit staging exits cleanly: ${stagedPersonaAudit.stderr || stagedPersonaAudit.stdout}`);
  const resumedManifest = JSON.parse(fs.readFileSync(activeManifestPath, 'utf8'));
  assert.equal(resumedManifest.runId, activeManifest.runId, 'section staging reuses the active run when the fingerprint is unchanged');
  assert.ok(fs.existsSync(path.join(stageDir, resumedManifest.runId, 'personaAudit.json')), 'personaAudit section snapshot is written into the active run');

  console.log('diagnostics-runner.test.mjs passed');
} finally {
  fs.rmSync(stageDir, { recursive: true, force: true });
}
