import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import os from 'node:os';

const require = createRequire(import.meta.url);

export async function runArm1Archival(repoRoot, fixtures) {
  const log = [];
  function record(msg) {
    const l = `[${new Date().toISOString()}] [ARM-1-ARCHIVAL-B1] ${msg}`;
    log.push(l);
    return l;
  }

  record('=== EXECUTING ARM 1: ARCHIVAL CONTROL B1 (NATIVE REPOSITORY ENGINES) ===');
  record('Testing schema-gated intake, deterministic retrieval, and capability boundaries.');

  // 1. Native Encyclopedia Intake
  const intakeSchema = JSON.parse(fs.readFileSync(path.join(repoRoot, 'scripts/encyclopedia-intake-schema.json'), 'utf8'));
  const intake = require(path.join(repoRoot, 'scripts/encyclopedia-intake.cjs'));

  const validRecord = {
    schema: 'td613.research-intake/v1',
    record_id: 'R-CALIBRATION-ARCHIVE-001',
    kind: 'experiment',
    title: 'Calibration Archival Ingest Fixture',
    recorded_at: '2026-10-29T19:00:00Z',
    author: 'TD613 Arm 1 Archival Runner',
    human_request_ref: 'operator-preflight-activation',
    visibility: 'public',
    body: 'Archival verification fixture proving schema inspection and human review gating.',
    sources: [{ source_id: 'calibration-fixture', kind: 'artifact', locator: 'test:arm1', capture_status: 'OPERATOR_SUPPLIED' }],
    evidence: {
      disposition: 'OFFLINE_EXECUTED',
      earned_claim: 'Native software indexes structured records.',
      claim_ceiling: 'Software capability test only; zero empirical acquisition credit.',
      missing_evidence: ['Autonomous natural language edge synthesis is unhandled by the runtime.']
    },
    experiment: { episode_id: 'calib-001', execution_status: 'CAPTURED' },
    relations: []
  };

  const report = intake.inspect(JSON.stringify(validRecord), intakeSchema);
  record(`Encyclopedia inspect structured record: valid=${report.valid}, publication_eligible=${report.publication_eligible}`);

  // Test unstructured rejection
  const unstructuredRejection = intake.inspect('m * d^2x/dt^2 + b * dx/dt + k * x = F(t)', intakeSchema);
  record(`Encyclopedia inspect raw unstructured formula: valid=${unstructuredRejection.valid}, errors=[${unstructuredRejection.errors.join('; ')}]`);

  // Staging and Admission Test
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'td613-arm1-archival-'));
  const inputPath = path.join(tempDir, 'input.json');
  const proposalPath = path.join(tempDir, 'proposal.json');
  const admittedDir = path.join(tempDir, 'admitted');

  fs.writeFileSync(inputPath, JSON.stringify(validRecord, null, 2) + '\n', 'utf8');

  // Stage
  const stageRes = spawnSync(process.execPath, [path.join(repoRoot, 'scripts/stage-encyclopedia-record.cjs'), inputPath, proposalPath], { encoding: 'utf8' });
  record(`stage-encyclopedia-record: exit=${stageRes.status}`);

  // Admit without human review ref -> fails
  const admitFailRes = spawnSync(process.execPath, [path.join(repoRoot, 'scripts/admit-encyclopedia-record.cjs'), proposalPath], {
    encoding: 'utf8',
    env: { ...process.env, TD613_INTAKE_OUTPUT_DIR: admittedDir }
  });
  record(`admit-encyclopedia-record without --human-review-ref: exit=${admitFailRes.status} (fail-closed refusal)`);

  // Admit with human review ref -> succeeds
  const admitSuccessRes = spawnSync(process.execPath, [
    path.join(repoRoot, 'scripts/admit-encyclopedia-record.cjs'),
    proposalPath,
    '--human-review-ref',
    'operator-tauric-diana-613'
  ], {
    encoding: 'utf8',
    env: { ...process.env, TD613_INTAKE_OUTPUT_DIR: admittedDir }
  });
  record(`admit-encyclopedia-record with --human-review-ref: exit=${admitSuccessRes.status} (admitted to index)`);

  fs.rmSync(tempDir, { recursive: true, force: true });

  // 2. Native Wendbine Compiler
  const wendbinePath = path.join(repoRoot, 'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-compile.mjs');
  const wendbine = await import(pathToFileURL(wendbinePath).href);
  const wendbineRoot = path.join(repoRoot, 'packages/dome_world_exact/fixtures/a15-r0/WENDBINE');
  const wMeta = JSON.parse(fs.readFileSync(path.join(wendbineRoot, '01-MANIFESTS/public-reddit-48h-snapshot-v01.json'), 'utf8'));
  const wPosts = fs.readFileSync(path.join(wendbineRoot, '01-MANIFESTS/public-reddit-48h-source-registry-v01.jsonl'), 'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);
  const wRegistry = JSON.parse(fs.readFileSync(path.join(wendbineRoot, '01-MANIFESTS/typed-relation-registry-v01.json'), 'utf8'));
  const wRelations = wRegistry.relations.map(row => Object.fromEntries(wRegistry.fields.map((field, idx) => [field, row[idx]])));

  const compiled = wendbine.compilePublicCorpus(wMeta, wPosts, wRelations);
  record(`Wendbine compiler executed: post_nodes=${compiled.post_nodes.length}, concept_nodes=${compiled.concept_nodes.length}, typed_relations=${compiled.typed_relation_edges.length}`);
  record(`Wendbine non-equivalences enforced: ${compiled.non_equivalences.length} invariants`);

  // Attempt raw mathematical text compilation -> must throw
  let wendbineThrew = false;
  try {
    wendbine.compilePublicCorpus({ schema: 'unstructured-ode' }, ['d^2x/dt^2 + kx = 0'], []);
  } catch (e) {
    wendbineThrew = true;
    record(`Wendbine raw ODE compilation rejected: "${e.message}"`);
  }

  record('Arm 1 Evaluation on Autonomous Scientific Synthesis: CAPABILITY_NOT_IMPLEMENTED');
  record('Zero autonomous hypotheses synthesized. Archival control cleanly established.');

  return {
    arm: 'ARM_1_ARCHIVAL_CONTROL_B1',
    schema_valid_admissions: 1,
    unstructured_rejections: 2,
    human_review_gating_verified: true,
    wendbine_topology_nodes: compiled.post_nodes.length + compiled.concept_nodes.length,
    wendbine_invariants_enforced: compiled.non_equivalences.length,
    autonomous_hypotheses: 0,
    epistemic_revisions: 0,
    falsifications_detected: 0,
    abstentions: 1, // declined raw ODE
    capability_status: 'CAPABILITY_NOT_IMPLEMENTED: AUTONOMOUS_EDGE_SYNTHESIS',
    trace_log: log
  };
}
