#!/usr/bin/env node
/**
 * 𝌋 TD613 · THE ACCIDENT OF INHERITANCE (Palace of Unborn Futures, Act II)
 * Clean-Commit Five-Specialist + Orchestrator Dollhouse Audit Runner
 *
 * Invokes `runDollhouseSkillAudit` per `.agents/skills/dollhouse-audit/SKILL.md`
 * across PEDAGOGUE, APERTURE, ATLAS, FADT, TEMPORAL_CUSTODIAN, and ORCHESTRATOR
 * against the exact committed `git rev-parse HEAD` (remediating PR #1699 Review Finding #8
 * by enforcing `worktree_cleanliness_verified === true` and `exact_checkout_verified === true`).
 *
 * Governance Law:
 *   SHARED_ACQUISITION != INDEPENDENT_REPLICATION (`additional_empirical_replication_credit === 0`).
 *   `release_authority === false`, `deployment_authority === false`, `human_closure_required === true`.
 *
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runDollhouseSkillAudit } from '../../../app/engine/dollhouse-skill-dispatcher.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(PKG_ROOT, '..', '..');
const SPEC_PATH = path.join(PKG_ROOT, 'receipts', 'dollhouse-audit-spec-act2.json');
const OUT_JSON_PATH = path.join(PKG_ROOT, 'receipts', 'dollhouse-audit-receipt-act2.json');

const currentHead = execSync('git rev-parse HEAD', { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
const spec = JSON.parse(fs.readFileSync(SPEC_PATH, 'utf8'));

const result = await runDollhouseSkillAudit({
  ...spec,
  source_revision: currentHead,
  options: {
    ...(spec.options || {}),
    strict_provenance: true,
  },
});

console.log(result.human_receipt);
if (result.exit_code !== 0) {
  console.error(`Dollhouse audit returned non-zero exit_code=${result.exit_code}`);
  process.exit(result.exit_code);
}

if (!result.machine_receipt?.provenance?.worktree_cleanliness_verified) {
  console.error(
    `[CLEAN_WORKTREE_REQUIRED] Dollhouse audit must run against a clean committed tree! Got: ${JSON.stringify(
      result.machine_receipt?.provenance?.executing_source_cleanliness
    )}`
  );
  process.exit(1);
}

fs.writeFileSync(OUT_JSON_PATH, `${JSON.stringify(result.machine_receipt, null, 2)}\n`, 'utf8');
console.log(`\nWrote machine receipt -> ${OUT_JSON_PATH} (source_revision=${currentHead}, exit_code=${result.exit_code})`);
