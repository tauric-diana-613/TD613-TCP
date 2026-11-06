#!/usr/bin/env node
/**
 * 𝌋 TD613 · THE ACCIDENT OF INHERITANCE (Palace of Unborn Futures, Act II)
 * Builds `preregistration/frozen-confirmatory-lock-act2.json` BEFORE Commit 1 & Confirmatory Run.
 *
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(PKG_ROOT, '..', '..');

const RELATIVE_LOCKED_FILES = [
  'packages/accident_of_inheritance/preregistration/preregistration-manifest-act2-v1.json',
  'packages/accident_of_inheritance/schemas/temporal-and-authority-schemas.json',
  'packages/accident_of_inheritance/receipts/pilot-48-receipt.json',
  'packages/accident_of_inheritance/src/prng.mjs',
  'packages/accident_of_inheritance/src/temporal-lattice.mjs',
  'packages/accident_of_inheritance/src/grid-definitions.mjs',
  'packages/accident_of_inheritance/src/world-generator.mjs',
  'packages/accident_of_inheritance/src/authority-policies.mjs',
  'packages/accident_of_inheritance/src/evaluator-and-stats.mjs',
  'packages/accident_of_inheritance/src/source-standing-factorial.mjs',
  'packages/accident_of_inheritance/src/dead-civilization-wing.mjs',
  'packages/accident_of_inheritance/src/adversarial-counterexamples.mjs',
  'packages/accident_of_inheritance/scripts/run-pilot-48.mjs',
  'packages/accident_of_inheritance/scripts/run-confirmatory-192.mjs',
];

const lockedFiles = RELATIVE_LOCKED_FILES.map(rel => {
  const abs = path.resolve(REPO_ROOT, rel);
  const buf = fs.readFileSync(abs);
  return {
    path: rel,
    bytes: buf.length,
    sha256: crypto.createHash('sha256').update(buf).digest('hex'),
  };
});

const manifest = {
  schema: 'td613.accident-of-inheritance.frozen-confirmatory-lock/v1.0',
  experiment_id: 'TD613-PALACE-ACT2-ACCIDENT-OF-INHERITANCE-20261105',
  covenant: 'Khona‌lit-po',
  authorization_ref: 'SAC[X6ZNK5NO51]',
  predecessor_base_commit: 'fb47927c3c7cd5264a3cf9900e90e24868e5c0bb',
  supervision_classification: 'INTERNALLY_SEPARATED_SINGLE_SUPERVISING_MODEL',
  chronological_lock_rule:
    'Committed in Git BEFORE generating or scoring ACT2_CONFIRMATORY_192. Explicitly locks all src/*.mjs modules AND scripts/run-confirmatory-192.mjs itself (remediating PR #1699 Review Finding #2).',
  locked_files_count: lockedFiles.length,
  locked_files: lockedFiles,
};

const outPath = path.join(PKG_ROOT, 'preregistration', 'frozen-confirmatory-lock-act2.json');
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`Wrote frozen lock manifest (${lockedFiles.length} files) to ${outPath}`);
