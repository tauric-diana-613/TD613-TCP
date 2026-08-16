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
  'package.json',
  'package-lock.json',
  'tests/aperture-patch-bay.test.mjs',
  'tests/giving-client-preview-server.mjs'
]);

const SCOPE_NEUTRAL = new Set([
  '.github/workflows/td613-ci.yml',
  '.github/workflows/vercel-operator-release.yml',
  'docs/STRATEGIC_VERCEL_DEPLOYMENT_LAW.md',
  'docs/PEDAGOGUE_DESIGN_GATE.md',
  'scripts/classify-validation-scope.mjs',
  'scripts/giving-browser-probe.mjs',
  'scripts/run-pedagogue-design-gate.mjs',
  'tests/giving-validation-scope.test.mjs',
  'tests/pedagogue-design-gate.test.mjs',
  'tests/vercel-operator-release-gate.test.mjs',
  'tests/workflow-estate.test.mjs',
  'app/engine/pedagogue-design-gate.js',
  'app/engine/aia-cistern-law.js',
  'tests/fixtures/pedagogue/giving-vault-design.json',
  'tests/fixtures/pedagogue/giving-research-dossier-design.json'
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

export function classifyValidationScope(inputFiles = []) {
  const files = [...new Set(inputFiles.map(normalizedPath).filter(Boolean))];
  let givingFileCount = 0;
  const fullScopeFiles = [];
  for (const file of files) {
    if (isGivingPath(file)) {
      givingFileCount += 1;
      continue;
    }
    if (SCOPE_NEUTRAL.has(file)) continue;
    fullScopeFiles.push(file);
  }
  const scope = givingFileCount > 0 && fullScopeFiles.length === 0 ? 'giving' : 'full';
  return { scope, files, giving_file_count: givingFileCount, full_scope_files: fullScopeFiles };
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
  }
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) await main();

export const _validationScopeInternals = Object.freeze({ GIVING_PREFIXES, GIVING_EXACT, SCOPE_NEUTRAL, normalizedPath, isGivingPath });