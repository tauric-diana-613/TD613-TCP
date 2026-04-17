import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const browserEnginePath = path.join(repoRoot, 'app', 'browser-engine.js');

const ENGINE_SOURCES = [
  'app/engine/td613-aperture.js',
  'app/engine/stylometry.js',
  'app/engine/generator-v2.js',
  'app/engine/formulas.js',
  'app/engine/harbor.js'
];

function transformModule(source = '') {
  return source
    .replace(/^\s*import\s*\{[\s\S]*?\}\s*from\s*['"][^'"]+['"];\s*$/gm, '')
    .replace(/^\s*import\s+.+?;\s*$/gm, '')
    .replace(/^export\s+/gm, '')
    .trimEnd();
}

const expected = [
  '(function () {',
  '// GENERATED FROM TCP ENGINE MODULES BY scripts/generate-browser-engine.mjs',
  ...ENGINE_SOURCES.map((relativePath) => {
    const absolutePath = path.join(repoRoot, relativePath);
    const moduleSource = fs.readFileSync(absolutePath, 'utf8');
    return `// SOURCE: ${relativePath}\n${transformModule(moduleSource)}`;
  }),
  '',
  'window.TCP_ENGINE = Object.assign(window.TCP_ENGINE || {}, {',
  '  TD613_APERTURE_PROTOCOL,',
  '  TD613_APERTURE_ENFORCEMENT_TERMS,',
  '  buildTD613GovernedExposureSchema,',
  '  buildTD613ApertureContext,',
  '  selectTD613ApertureDecision,',
  '  selectTD613ApertureHarbor,',
  '  reviewTD613ApertureTransfer,',
  '  solveQuadratic,',
  '  cadenceCoherence,',
  '  cadenceResonance,',
  '  branchDynamics,',
  '  routePressure,',
  '  computeRoutePressure,',
  '  fieldPotential,',
  '  waveStats,',
  '  custodyThreshold,',
  '  criticalityIndex,',
  '  providerDecision,',
  '  HARBOR_LIBRARY,',
  '  chooseHarbor,',
  '  buildLedgerRow,',
  '  computeReuseGain,',
  '  estimateWitnessLoad,',
  '  normalizeText,',
  '  extractCadenceProfile,',
  '  compareTexts,',
  '  buildCadenceTransfer,',
  '  buildCadenceTransferLegacy,',
  '  buildCadenceTransferTrace,',
  '  buildCadenceTransferTraceLegacy,',
  '  buildCadenceSignature,',
  '  applyCadenceShell,',
  '  applyCadenceToText,',
  '  applyCadenceToTextLegacy,',
  '  transformText,',
  '  functionWordProfile,',
  '  charTrigramProfile,',
  '  recurrencePressure,',
  '  sentenceSplit,',
  '  segmentTextToIR,',
  '  buildOpportunityProfileFromIR,',
  '  buildTransferPlanFromIR,',
  '  beamSearchTransfer,',
  '  buildSwapCadenceMatrix,',
  '  cadenceModFromProfile,',
  '  SWAP_CADENCE_FLAGSHIP_PAIRS',
  '});',
  '})();',
  ''
].join('\n');

let actual;
try {
  actual = fs.readFileSync(browserEnginePath, 'utf8');
} catch {
  console.error('ERROR: app/browser-engine.js not found. Run: npm run sync:browser-engine');
  process.exit(1);
}

if (expected === actual) {
  console.log('check-engine-sync.mjs passed');
  process.exit(0);
}

function parseSections(content) {
  const sections = {};
  const pattern = /\/\/ SOURCE: ([^\n]+)\n/g;
  const matches = [...content.matchAll(pattern)];
  for (let i = 0; i < matches.length; i++) {
    const name = matches[i][1];
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : content.indexOf('\nwindow.TCP_ENGINE');
    sections[name] = content.slice(start, end < 0 ? content.length : end);
  }
  return sections;
}

function firstDiffLine(a, b) {
  const aLines = a.split('\n');
  const bLines = b.split('\n');
  for (let i = 0; i < Math.max(aLines.length, bLines.length); i++) {
    if (aLines[i] !== bLines[i]) {
      return {
        lineNumber: i + 1,
        expected: (aLines[i] ?? '').slice(0, 120),
        actual: (bLines[i] ?? '').slice(0, 120)
      };
    }
  }
  return null;
}

let driftFound = false;
const expectedSections = parseSections(expected);
const actualSections = parseSections(actual);

for (const relativePath of ENGINE_SOURCES) {
  const exp = expectedSections[relativePath];
  const act = actualSections[relativePath];
  if (act === undefined) {
    console.error(`DRIFT: section for '${relativePath}' is missing from browser-engine.js`);
    driftFound = true;
    continue;
  }
  if (exp !== act) {
    const diff = firstDiffLine(exp, act);
    console.error(`DRIFT: ${relativePath} has diverged from browser-engine.js`);
    if (diff) {
      console.error(`  section line ${diff.lineNumber}:`);
      console.error(`  expected: ${JSON.stringify(diff.expected)}`);
      console.error(`  actual:   ${JSON.stringify(diff.actual)}`);
    }
    driftFound = true;
  }
}

const expExport = expected.slice(expected.indexOf('\nwindow.TCP_ENGINE'));
const actExport = actual.slice(actual.indexOf('\nwindow.TCP_ENGINE'));
if (expExport !== actExport) {
  const diff = firstDiffLine(expExport, actExport);
  console.error('DRIFT: window.TCP_ENGINE export block has diverged');
  if (diff) {
    console.error(`  line ${diff.lineNumber}:`);
    console.error(`  expected: ${JSON.stringify(diff.expected)}`);
    console.error(`  actual:   ${JSON.stringify(diff.actual)}`);
  }
  driftFound = true;
}

if (driftFound) {
  console.error('\nbrowser-engine.js is out of sync. Run: npm run sync:browser-engine');
  process.exit(1);
}
