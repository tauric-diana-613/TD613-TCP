import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const GIVING_PREFIXES = Object.freeze([
  'app/giving/history/',
  'server/giving/',
  'api/giving/',
  'scripts/giving-'
]);

const GIVING_EXACT = new Set([
  'api/giving.js',
  'docs/GIVING_HISTORY_ENGINE.md',
  'docs/GIVING_UX_RESILIENCE_ROADMAP.md',
  'docs/CAMPAIGN_DEPUTY_API_KEY_SETUP.md',
  'package.json',
  'package-lock.json',
  'tests/aperture-patch-bay.test.mjs',
  'tests/giving-client-preview-server.mjs',
  'vercel.json'
]);

const PRACTICE_EXACT = new Set([
  'AGENTS.md',
  'PEDAGOGUE.md',
  'app/engine/pedagogue-practice-fixture.js',
  'app/engine/flowcore-observation-aperture.js',
  'app/dome-world/docs/ash/experiments/tomography/ASH_KEEP_LOOM_TOMOGRAPHY_CALIBRATION_PHANTOM_V0_1.md',
  'docs/CANONICAL_PRACTICE_FIXTURE.md',
  'scripts/giving-practice-fixture-browser-assay.mjs',
  'tests/fixtures/pedagogue/giving-bikini-bottom-practice.json',
  'tests/fixtures/pedagogue/giving-discovery-handoff-design.json',
  'tests/fixtures/pedagogue/ash-tomography-calibration-phantom-v01.json',
  'tests/flowcore-observation-aperture.test.mjs',
  'tests/pedagogue-practice-fixture.test.mjs'
]);

const SCOPE_NEUTRAL = new Set([
  '.github/workflows/td613-ci.yml',
  '.github/workflows/vercel-operator-release.yml',
  '.github/workflows/vercel-relock-safety.yml',
  'docs/STRATEGIC_VERCEL_DEPLOYMENT_LAW.md',
  'docs/PEDAGOGUE_DESIGN_GATE.md',
  'docs/AIA_CISTERN_LAW.md',
  'docs/pedagogue/GIVING_12_STEP_REPO_TRANSFER_AUDIT.md',
  'scripts/classify-validation-scope.mjs',
  'scripts/configure-git-hooks.mjs',
  'scripts/flowcore-release-content-probe.mjs',
  'scripts/giving-browser-probe.mjs',
  'scripts/run-pedagogue-design-gate.mjs',
  'tests/giving-validation-scope.test.mjs',
  'tests/pedagogue-design-gate.test.mjs',
  'tests/release-plumbing.test.mjs',
  'tests/vercel-operator-release-gate.test.mjs',
  'tests/workflow-estate.test.mjs',
  'app/engine/pedagogue-design-gate.js',
  'app/engine/pedagogue-interface-diagnosis.js',
  'app/engine/aia-cistern-law.js',
  'tests/fixtures/pedagogue/giving-vault-design.json',
  'tests/fixtures/pedagogue/giving-research-dossier-design.json',
  'tests/fixtures/pedagogue/giving-12-step-evidence-workflow.json',
  'tests/fixtures/pedagogue/cistern-boundary-design.json'
]);

function normalizedPath(value) {
  return String(value || '').trim().replaceAll('\\', '/').replace(/^\.\//, '');
}

function isGivingPath(file) {
  return GIVING_EXACT.has(file) ||
    GIVING_PREFIXES.some((prefix) => file.startsWith(prefix)) ||
    /^tests\/giving-[^/]+\.test\.mjs$/.test(file) ||
    /^docs\/CAMPAIGN_DEPUTY_GIVING_HISTORY[^/]*\.md$/.test(file);
}

function isPracticePath(file) {
  return PRACTICE_EXACT.has(file);
}

export function classifyValidationScope(inputFiles = []) {
  const files = [...new Set(inputFiles.map(normalizedPath).filter(Boolean))];
  let givingFileCount = 0;
  let practiceFileCount = 0;
  const fullScopeFiles = [];
  for (const file of files) {
    if (isPracticePath(file)) {
      practiceFileCount += 1;
      continue;
    }
    if (isGivingPath(file)) {
      givingFileCount += 1;
      continue;
    }
    if (SCOPE_NEUTRAL.has(file)) continue;
    fullScopeFiles.push(file);
  }
  const scope = fullScopeFiles.length > 0
    ? 'full'
    : practiceFileCount > 0
      ? 'practice'
      : givingFileCount > 0
        ? 'giving'
        : 'full';
  return {
    scope,
    files,
    giving_file_count: givingFileCount,
    practice_file_count: practiceFileCount,
    practice_fixture_changed: practiceFileCount > 0,
    full_scope_files: fullScopeFiles
  };
}

function parseInput(raw) {
  return raw.includes('\0') ? raw.split('\0') : raw.split(/\r?\n/);
}

async function main() {
  const raw = fs.readFileSync(0, 'utf8');
  const result = classifyValidationScope(parseInput(raw));
  const outputIndex = process.argv.indexOf('--github-output');
  if (outputIndex >= 0) {
    const outputPath = process.argv[outputIndex + 1];
    if (!outputPath) throw new Error('--github-output requires a path');
    fs.appendFileSync(outputPath, `validation_scope=${result.scope}\n`);
    fs.appendFileSync(outputPath, `giving_file_count=${result.giving_file_count}\n`);
    fs.appendFileSync(outputPath, `practice_file_count=${result.practice_file_count}\n`);
    fs.appendFileSync(outputPath, `practice_fixture_changed=${result.practice_fixture_changed ? 'true' : 'false'}\n`);
  }
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) await main();

export const _validationScopeInternals = Object.freeze({
  GIVING_PREFIXES,
  GIVING_EXACT,
  PRACTICE_EXACT,
  SCOPE_NEUTRAL,
  normalizedPath,
  isGivingPath,
  isPracticePath
});