/**
 * 𝌋 TD613 · THE PALACE OF UNBORN FUTURES
 * Five-Specialist + Orchestrator Dollhouse Audit Runner (Programmatic Dispatcher API)
 *
 * Invokes `runDollhouseSkillAudit` per `.agents/skills/dollhouse-audit/SKILL.md`
 * across PEDAGOGUE, APERTURE, ATLAS, FADT, TEMPORAL_CUSTODIAN, and ORCHESTRATOR,
 * recording the machine receipt inside the isolated Palace research package.
 *
 * Governance Law:
 *   SHARED_ACQUISITION != INDEPENDENT_REPLICATION (additional_empirical_replication_credit === 0).
 *   release_authority === false, deployment_authority === false, human_closure_required === true.
 *
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runDollhouseSkillAudit } from '../../../app/engine/dollhouse-skill-dispatcher.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const SPEC_PATH = path.join(PKG_ROOT, 'receipts', 'dollhouse-audit-spec-palace.json');
const OUT_JSON_PATH = path.join(PKG_ROOT, 'receipts', 'dollhouse-audit-receipt-palace.json');

const spec = JSON.parse(fs.readFileSync(SPEC_PATH, 'utf8'));
const result = await runDollhouseSkillAudit({
  ...spec,
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

fs.writeFileSync(OUT_JSON_PATH, `${JSON.stringify(result.machine_receipt, null, 2)}\n`, 'utf8');
console.log(`\nWrote machine receipt -> ${OUT_JSON_PATH} (exit_code=${result.exit_code})`);
