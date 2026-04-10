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

const generated = [
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

fs.writeFileSync(browserEnginePath, generated, 'utf8');
console.log('browser-engine.js regenerated from engine modules');
