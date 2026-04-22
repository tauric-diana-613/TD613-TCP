import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import * as engine from '../app/engine/stylometry.js';
import personas from '../app/data/personas.js';
import { buildAnnexDiagnostics, buildAnnexMarkdown } from './lib/annex-diagnostics.mjs';
import {
  DECK_RANDOMIZER_SAMPLE_LIBRARY,
  DIAGNOSTIC_BATTERY,
  DIAGNOSTIC_CORPUS,
  DIAGNOSTIC_CORPUS_BY_ID,
  DIAGNOSTIC_SAMPLE_LIBRARY
} from '../app/data/diagnostics.js';
import {
  buildCadenceLockRecord,
  buildMaskTransformationResult,
  resolvePersonaCatalog
} from '../app/toys/persona-gallery/model.js';
import { buildCorpusExtraction } from '../app/toys/persona-trainer/extractor.js';
import { validateCandidateAgainstFingerprint } from '../app/toys/persona-trainer/validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const reportsDir = path.join(repoRoot, 'reports', 'diagnostics');
const latestJsonPath = path.join(reportsDir, 'latest.json');
const latestMdPath = path.join(reportsDir, 'latest.md');
const diagnosticsStageDir = path.join(reportsDir, '.staging');
const activeStageManifestPath = path.join(diagnosticsStageDir, 'active-run.json');
const CASE_SECTION_IDS = Object.freeze([
  'swapPairs',
  'maskCases',
  'trainerCases',
  'retrievalCases',
  'falseNeighborCases',
  'generatorTransferCases',
  'generatorMaskCases'
]);
const AUX_SECTION_IDS = Object.freeze([
  'sampleAudit',
  'personaAudit',
  'annexDiagnostics'
]);
const SECTION_IDS = Object.freeze([
  ...AUX_SECTION_IDS,
  ...CASE_SECTION_IDS
]);
const RUN_FINGERPRINT_INPUTS = Object.freeze([
  __filename,
  path.join(repoRoot, 'app', 'engine', 'stylometry.js'),
  path.join(repoRoot, 'app', 'data', 'diagnostics.js'),
  path.join(repoRoot, 'app', 'data', 'personas.js'),
  path.join(repoRoot, 'scripts', 'lib', 'annex-diagnostics.mjs'),
  path.join(repoRoot, 'app', 'aperture', 'index.html')
]);

const FAILURE_BUCKETS = Object.freeze([
  'punctuation_only_shift',
  'surface_close_under_large_gap',
  'semantic_drift',
  'anchor_break',
  'generator_hold',
  'generator_unbounded_semantics',
  'one_sided_swap',
  'both_rejected_swap',
  'trainer_retrieval_fail',
  'mask_near_home_hold',
  'false_neighbor_convergence',
  'over_flattened_output',
  'register_miss',
  'sentence_span_miss'
]);
const PRIVATE_EORFD_REPRESENTATIVE_ANCHORS = Object.freeze([
  'building-access-rushed-mobile',
  'benefits-appeal-professional-message',
  'municipal-zoning-formal-record',
  'adversarial-hearing-rushed-mobile',
  'museum-fog-alarm-professional-message',
  'model-safety-rushed-mobile'
]);

const PERSONA_LIBRARY = resolvePersonaCatalog(engine, personas, DIAGNOSTIC_SAMPLE_LIBRARY);
const PERSONA_BY_ID = Object.freeze(Object.fromEntries(PERSONA_LIBRARY.map((persona) => [persona.id, persona])));
const TOOLABILITY_MAJOR_PERSONA_IDS = Object.freeze(['spark', 'matron', 'undertow', 'archivist', 'cross-examiner']);
const TOOLABILITY_REFLECTIVE_PROBE = `I am pretty content in life. Don't worry about where you came from. Keep doing what you're doing.

Don't stop doing martial arts. I needed that. I got into a lot of trouble without martial arts. And I blame mom for taking that away from me.

I want to say hi to him. Call him. Meet him I guess is what I'm trying to say. "Tell me more about yourself" lol is what I would say, you know? That's someone you should get more familiar with. It's an everchasing experience. We have amnesia as people.`;
const TOOLABILITY_NARRATIVE_PROBE = `I must keep reminding myself that this will work. Nobody I've ever shared the same room with has ever seen Cheers! Things are moving too fast to dissuade myself of this. On the ready, I pull out the next pack of Crushes, turn them over and spank its bottom like a bad boy. Twirl of the plastic, and bite of the tip, with an excited thumb that sparks but keeps missing the gas pedal. Two gulps: from the nerves, and, to placate them, from the coffee. The wall breaks with a shuddering, misanthropic swing. It's the middle of the night, and suddenly, I'm not alone.`;

function ensureDir(targetPath) {
  fs.mkdirSync(targetPath, { recursive: true });
}

function atomicWriteFile(targetPath, contents) {
  ensureDir(path.dirname(targetPath));
  const tempPath = path.join(
    path.dirname(targetPath),
    `${path.basename(targetPath)}.${process.pid}.${Date.now()}.tmp`
  );
  fs.writeFileSync(tempPath, contents, 'utf8');
  try {
    fs.renameSync(tempPath, targetPath);
    return;
  } catch (error) {
    if (!['EPERM', 'EEXIST'].includes(error?.code || '')) {
      try {
        fs.rmSync(tempPath, { force: true });
      } catch {
        // best-effort cleanup only
      }
      throw error;
    }
  }

  // OneDrive-backed Windows worktrees can refuse atomic rename replacement.
  // Fall back to replace-in-place while still preserving the temp-write staging.
  fs.copyFileSync(tempPath, targetPath);
  fs.rmSync(tempPath, { force: true });
}

function hashString(value = '') {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function readFileIfPresent(targetPath) {
  return fs.existsSync(targetPath) ? fs.readFileSync(targetPath, 'utf8') : '';
}

function stageRunManifestPath(runId = '') {
  return path.join(diagnosticsStageDir, runId, 'run-manifest.json');
}

function stageSectionSnapshotPath(runId = '', sectionId = '') {
  return path.join(diagnosticsStageDir, runId, `${sectionId}.json`);
}

function parseDiagnosticsArgs(argv = process.argv.slice(2)) {
  const parsed = {
    fresh: false,
    assembleOnly: false,
    sections: null
  };

  argv.forEach((arg) => {
    if (arg === '--fresh') {
      parsed.fresh = true;
      return;
    }
    if (arg === '--assemble-only') {
      parsed.assembleOnly = true;
      return;
    }
    if (arg.startsWith('--section=')) {
      const rawSections = arg.split('=')[1] || '';
      parsed.sections = sortUnique(rawSections.split(',').map((value) => value.trim()).filter(Boolean));
      return;
    }
    throw new Error(`Unknown diagnostics battery argument: ${arg}`);
  });

  if (parsed.sections) {
    const unknown = parsed.sections.filter((sectionId) => !SECTION_IDS.includes(sectionId));
    if (unknown.length) {
      throw new Error(`Unknown diagnostics battery section(s): ${unknown.join(', ')}`);
    }
  }

  if (parsed.assembleOnly && parsed.sections) {
    throw new Error('Use either --assemble-only or --section=..., not both together.');
  }

  return parsed;
}

function computeRunFingerprint() {
  const fingerprintLines = RUN_FINGERPRINT_INPUTS.map((targetPath) => {
    const relativePath = path.relative(repoRoot, targetPath).replace(/\\/g, '/');
    return `${relativePath}:${hashString(readFileIfPresent(targetPath))}`;
  });
  return hashString(fingerprintLines.join('\n'));
}

function loadJsonFile(targetPath) {
  if (!fs.existsSync(targetPath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  } catch {
    return null;
  }
}

function createStageManifest(fingerprint = '') {
  const createdAt = new Date().toISOString();
  const runId = `${createdAt.replace(/[-:TZ.]/g, '').slice(0, 14)}-${fingerprint.slice(0, 12)}`;
  return {
    runId,
    fingerprint,
    createdAt,
    updatedAt: createdAt,
    sections: Object.fromEntries(SECTION_IDS.map((sectionId) => [
      sectionId,
      {
        status: 'pending',
        generatedAt: null
      }
    ]))
  };
}

function persistStageManifest(manifest = {}) {
  const nextManifest = {
    ...manifest,
    updatedAt: new Date().toISOString()
  };
  atomicWriteFile(stageRunManifestPath(nextManifest.runId), `${JSON.stringify(nextManifest, null, 2)}\n`);
  atomicWriteFile(
    activeStageManifestPath,
    `${JSON.stringify({
      runId: nextManifest.runId,
      fingerprint: nextManifest.fingerprint,
      updatedAt: nextManifest.updatedAt
    }, null, 2)}\n`
  );
  return nextManifest;
}

function loadActiveStageManifest(expectedFingerprint = '', { fresh = false } = {}) {
  ensureDir(diagnosticsStageDir);

  if (!fresh) {
    const activePointer = loadJsonFile(activeStageManifestPath);
    if (activePointer?.runId && activePointer.fingerprint === expectedFingerprint) {
      const existingManifest = loadJsonFile(stageRunManifestPath(activePointer.runId));
      if (existingManifest?.runId === activePointer.runId && existingManifest.fingerprint === expectedFingerprint) {
        return existingManifest;
      }
    }
  }

  return persistStageManifest(createStageManifest(expectedFingerprint));
}

function readStageSnapshot(manifest = {}, sectionId = '') {
  const snapshot = loadJsonFile(stageSectionSnapshotPath(manifest.runId, sectionId));
  if (!snapshot) {
    return null;
  }
  if (snapshot.runId !== manifest.runId || snapshot.fingerprint !== manifest.fingerprint || snapshot.sectionId !== sectionId) {
    return null;
  }
  return snapshot;
}

function stageSectionComplete(manifest = {}, sectionId = '') {
  return Boolean(readStageSnapshot(manifest, sectionId));
}

function persistStageSnapshot(manifest = {}, sectionId = '', data = null) {
  const generatedAt = new Date().toISOString();
  const snapshot = {
    runId: manifest.runId,
    fingerprint: manifest.fingerprint,
    sectionId,
    generatedAt,
    data
  };
  atomicWriteFile(stageSectionSnapshotPath(manifest.runId, sectionId), `${JSON.stringify(snapshot, null, 2)}\n`);
  return persistStageManifest({
    ...manifest,
    sections: {
      ...(manifest.sections || {}),
      [sectionId]: {
        status: 'complete',
        generatedAt
      }
    }
  });
}

function missingStageSections(manifest = {}) {
  return SECTION_IDS.filter((sectionId) => !stageSectionComplete(manifest, sectionId));
}

function round(value, digits = 4) {
  return Number(Number(value || 0).toFixed(digits));
}

function sortUnique(values = []) {
  return [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function profileKey(profile = {}) {
  return JSON.stringify(profile || {});
}

const HEATMAP_MATRIX_CACHE = new Map();
const PAIR_METRICS_CACHE = new Map();

function cachedHeatmapMatrix(text = '') {
  const key = String(text || '');
  if (!HEATMAP_MATRIX_CACHE.has(key)) {
    HEATMAP_MATRIX_CACHE.set(key, engine.cadenceHeatmap(key).matrix || []);
  }
  return HEATMAP_MATRIX_CACHE.get(key);
}

function itemCacheKey(item, getProfile = (value) => value.profile, getText = (value) => value.text || value.diagnosticSpecimen?.text || '') {
  if (item?.id) {
    return String(item.id);
  }
  return `${profileKey(getProfile(item))}::${String(getText(item) || '')}`;
}

function profileDistance(fit = {}) {
  return round(
    (fit.sentenceDistance || 0) +
    (fit.spreadDistance || 0) +
    (fit.punctDistance || 0) +
    (fit.contractionDistance || 0) +
    (fit.recurrenceDistance || 0) +
    (fit.directnessDistance || 0) +
    (fit.abstractionDistance || 0) +
    (fit.registerDistance || 0),
    4
  );
}

function axisDistance(profileA = {}, profileB = {}) {
  const axesA = engine.cadenceAxisVector(profileA);
  const axesB = engine.cadenceAxisVector(profileB);
  return round(axesA.reduce((sum, axis, index) =>
    sum + Math.abs(Number(axis.normalized || 0) - Number(axesB[index]?.normalized || 0)),
  0), 4);
}

function heatmapDistance(textA = '', textB = '') {
  const matrixA = cachedHeatmapMatrix(textA);
  const matrixB = cachedHeatmapMatrix(textB);
  let total = 0;
  for (let rowIndex = 0; rowIndex < Math.max(matrixA.length, matrixB.length); rowIndex += 1) {
    const rowA = Array.isArray(matrixA[rowIndex]) ? matrixA[rowIndex] : [];
    const rowB = Array.isArray(matrixB[rowIndex]) ? matrixB[rowIndex] : [];
    for (let colIndex = 0; colIndex < Math.max(rowA.length, rowB.length); colIndex += 1) {
      total += Math.abs(Number(rowA[colIndex] || 0) - Number(rowB[colIndex] || 0));
    }
  }
  return round(total, 4);
}

function pairMetricsBetweenItems(
  left,
  right,
  getProfile = (item) => item.profile,
  getText = (item) => item.text || item.diagnosticSpecimen?.text || ''
) {
  const leftKey = itemCacheKey(left, getProfile, getText);
  const rightKey = itemCacheKey(right, getProfile, getText);
  const cacheKey = [leftKey, rightKey].sort((a, b) => a.localeCompare(b)).join('::');
  if (!PAIR_METRICS_CACHE.has(cacheKey)) {
    const leftProfile = getProfile(left);
    const rightProfile = getProfile(right);
    const fit = engine.compareTexts('', '', {
      profileA: leftProfile,
      profileB: rightProfile
    });
    const profileDistanceValue = profileDistance(fit);
    const axisDistanceValue = axisDistance(leftProfile, rightProfile);
    const heatmapDistanceValue = heatmapDistance(getText(left), getText(right));
    PAIR_METRICS_CACHE.set(cacheKey, {
      profileDistance: profileDistanceValue,
      axisDistance: axisDistanceValue,
      heatmapDistance: heatmapDistanceValue,
      distance: round(profileDistanceValue + axisDistanceValue + heatmapDistanceValue, 4),
      similarity: round(fit.similarity || 0, 4),
      traceability: round(fit.traceability || 0, 4)
    });
  }
  return PAIR_METRICS_CACHE.get(cacheKey);
}

function buildClosestProfilePairs(
  items = [],
  getProfile = (item) => item.profile,
  getText = (item) => item.text || item.diagnosticSpecimen?.text || '',
  limit = 6
) {
  const pairs = [];
  for (let leftIndex = 0; leftIndex < items.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < items.length; rightIndex += 1) {
      const left = items[leftIndex];
      const right = items[rightIndex];
      const leftProfile = getProfile(left);
      const rightProfile = getProfile(right);
      if (!leftProfile || !rightProfile) {
        continue;
      }
      const metrics = pairMetricsBetweenItems(left, right, getProfile, getText);
      pairs.push({
        leftId: left.id,
        leftName: left.name || left.id,
        rightId: right.id,
        rightName: right.name || right.id,
        distance: metrics.distance,
        profileDistance: metrics.profileDistance,
        axisDistance: metrics.axisDistance,
        heatmapDistance: metrics.heatmapDistance,
        similarity: metrics.similarity,
        traceability: metrics.traceability,
        sameFamily: left.familyId ? left.familyId === right.familyId : false,
        sameVariant: left.variant ? left.variant === right.variant : false
      });
    }
  }
  return pairs
    .sort((left, right) =>
      left.distance - right.distance ||
      left.heatmapDistance - right.heatmapDistance ||
      right.similarity - left.similarity ||
      left.leftId.localeCompare(right.leftId) ||
      left.rightId.localeCompare(right.rightId)
    )
    .slice(0, limit);
}

function buildNearestFieldSummary(
  items = [],
  getProfile = (item) => item.profile,
  getText = (item) => item.text || item.diagnosticSpecimen?.text || ''
) {
  if (items.length <= 1) {
    return {
      averageNearestFieldDistance: 0,
      minNearestFieldDistance: 0
    };
  }
  const nearestDistances = items.map((left, leftIndex) => {
    const leftProfile = getProfile(left);
    const leftText = getText(left);
    let nearest = Infinity;
    for (let rightIndex = 0; rightIndex < items.length; rightIndex += 1) {
      if (leftIndex === rightIndex) {
        continue;
      }
      const right = items[rightIndex];
      nearest = Math.min(nearest, pairMetricsBetweenItems(left, right, getProfile, getText).distance);
    }
    return nearest;
  });
  return {
    averageNearestFieldDistance: round(
      nearestDistances.reduce((sum, value) => sum + value, 0) / nearestDistances.length,
      4
    ),
    minNearestFieldDistance: round(Math.min(...nearestDistances), 4)
  };
}

function fieldDistanceBetweenItems(
  left,
  right,
  getProfile = (item) => item.profile,
  getText = (item) => item.text || item.diagnosticSpecimen?.text || ''
) {
  return pairMetricsBetweenItems(left, right, getProfile, getText).distance;
}

function buildWideFieldSubset(
  items = [],
  limit = 16,
  getProfile = (item) => item.profile,
  getText = (item) => item.text || item.diagnosticSpecimen?.text || ''
) {
  if (items.length <= limit) {
    return items;
  }

  const working = [...items];
  const seed = working
    .map((item) => ({
      item,
      meanDistance:
        working
          .filter((other) => other !== item)
          .reduce((sum, other) => sum + fieldDistanceBetweenItems(item, other, getProfile, getText), 0) /
        Math.max(1, working.length - 1)
    }))
    .sort((left, right) =>
      right.meanDistance - left.meanDistance ||
      String(left.item.id || '').localeCompare(String(right.item.id || ''))
    )[0]?.item;

  const chosen = seed ? [seed] : [working[0]];
  const remaining = working.filter((item) => item !== chosen[0]);

  while (chosen.length < limit && remaining.length) {
    remaining.sort((left, right) => {
      const leftMin = Math.min(...chosen.map((picked) => fieldDistanceBetweenItems(left, picked, getProfile, getText)));
      const rightMin = Math.min(...chosen.map((picked) => fieldDistanceBetweenItems(right, picked, getProfile, getText)));
      const leftMean =
        chosen.reduce((sum, picked) => sum + fieldDistanceBetweenItems(left, picked, getProfile, getText), 0) /
        Math.max(1, chosen.length);
      const rightMean =
        chosen.reduce((sum, picked) => sum + fieldDistanceBetweenItems(right, picked, getProfile, getText), 0) /
        Math.max(1, chosen.length);
      return (
        rightMin - leftMin ||
        rightMean - leftMean ||
        String(left.id || '').localeCompare(String(right.id || ''))
      );
    });
    chosen.push(remaining.shift());
  }

  return chosen;
}

function buildExactProfileCollisions(items = [], getProfile = (item) => item.profile) {
  const groups = new Map();
  items.forEach((item) => {
    const key = profileKey(getProfile(item));
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push({
      id: item.id,
      name: item.name || item.id
    });
  });
  return [...groups.values()]
    .filter((group) => group.length > 1)
    .map((group) => ({
      ids: group.map((entry) => entry.id),
      names: group.map((entry) => entry.name)
    }));
}

function donorDistance(value, donorProfile) {
  const profile = typeof value === 'string' ? engine.extractCadenceProfile(value) : value;
  const fit = engine.compareTexts('', '', {
    profileA: profile,
    profileB: donorProfile
  });
  return round(
    (fit.sentenceDistance || 0) +
    (fit.functionWordDistance || 0) +
    (fit.contractionDistance || 0) +
    (fit.punctShapeDistance || 0) +
    (fit.registerDistance || 0),
    3
  );
}

function hasSentenceDimension(changedDimensions = []) {
  return changedDimensions.some((dimension) => /^sentence-/.test(dimension));
}

function hasRegisterDimension(changedDimensions = []) {
  return changedDimensions.some((dimension) =>
    dimension === 'lexical-register' ||
    dimension === 'content-word-complexity' ||
    dimension === 'modifier-density' ||
    dimension === 'directness' ||
    dimension === 'abstraction-posture'
  );
}

function semanticSummary(result = {}) {
  return {
    propositionCoverage: round(result.semanticAudit?.propositionCoverage ?? 1),
    actorCoverage: round(result.semanticAudit?.actorCoverage ?? 1),
    actionCoverage: round(result.semanticAudit?.actionCoverage ?? 1),
    objectCoverage: round(result.semanticAudit?.objectCoverage ?? 1),
    polarityMismatches: result.semanticAudit?.polarityMismatches ?? 0,
    tenseMismatches: result.semanticAudit?.tenseMismatches ?? 0
  };
}

function protectedAnchorIntegrity(result = {}) {
  return round(result.protectedAnchorAudit?.protectedAnchorIntegrity ?? 1);
}

function semanticBounded(semanticAudit = {}) {
  const propositionCoverage = Number(semanticAudit?.propositionCoverage ?? 1);
  const actorCoverage = Number(semanticAudit?.actorCoverage ?? 1);
  const actionCoverage = Number(semanticAudit?.actionCoverage ?? 1);
  const objectCoverage = Number(semanticAudit?.objectCoverage ?? 1);
  const polarityMismatches = Number(semanticAudit?.polarityMismatches ?? 0);
  const tenseMismatches = Number(semanticAudit?.tenseMismatches ?? 0);
  const clauseCount = Math.max(
    1,
    Number(semanticAudit?.sourceClauseCount ?? 0),
    Number(semanticAudit?.outputClauseCount ?? 0)
  );
  const polarityRate = polarityMismatches / clauseCount;
  const tenseRate = tenseMismatches / clauseCount;
  const strongCoverage =
    propositionCoverage >= 0.9 &&
    actorCoverage >= 0.9 &&
    actionCoverage >= 0.9 &&
    objectCoverage >= 0.9;

  const polarityBounded =
    polarityMismatches <= 1 ||
    (strongCoverage && polarityMismatches <= 2 && polarityRate <= 0.18);
  // Match the live generator's boundedness floor for strong-coverage rewrites.
  const tenseBounded =
    tenseMismatches <= 1 ||
    (strongCoverage && tenseMismatches <= 2 && tenseRate <= 0.23);

  return polarityBounded && tenseBounded;
}

function incrementCounter(acc, key) {
  const resolvedKey = key || 'unknown';
  acc[resolvedKey] = (acc[resolvedKey] || 0) + 1;
  return acc;
}

function selectedCandidateFromLedger(candidateLedger = []) {
  return (candidateLedger || []).find((entry) => entry.status === 'selected') || null;
}

function normalizeComparable(text = '') {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function hasToolabilityArtifactLeak(text = '') {
  return /(?:^|[.!?]\s+)[a-z]/.test(String(text || '')) ||
    /\b(?:and and|while while|while and|and while|but but|because because|since since|then then|yet yet)\b/i.test(String(text || '')) ||
    /;\s+[A-Z]/.test(String(text || '')) ||
    /\b(?:I|It|That|You|We|They|Don|Can|Won)\s*;\s*[A-Za-z]+\b/.test(String(text || ''));
}

function generatorSourceClass(result = {}, fallback = 'unknown') {
  return (
    result.sourceClass ||
    result.retrievalTrace?.planSummary?.relationInventory?.sourceClass ||
    fallback
  );
}

function generatorSourceRegisterLane(result = {}, fallback = 'unknown') {
  return (
    result.sourceRegisterLane ||
    result.ontologyAudit?.sourceRegisterLane ||
    result.retrievalTrace?.sourceRegisterLane ||
    result.retrievalTrace?.planSummary?.relationInventory?.sourceRegisterLane ||
    fallback
  );
}

function realizedNonPunctuationDimensions(entry = {}) {
  return [...new Set(entry.changedDimensions || [])].filter((dimension) => dimension !== 'punctuation-shape');
}

function structuralRealizationCount(entry = {}) {
  const structuralDimensions = new Set([
    'sentence-mean',
    'sentence-count',
    'sentence-spread',
    'connector-stance',
    'directness',
    'abstraction-posture',
    'lexical-register'
  ]);
  return realizedNonPunctuationDimensions(entry).filter((dimension) => structuralDimensions.has(dimension)).length;
}

function driftSeverityRank(driftClass = 'none') {
  if (driftClass === 'severe') return 3;
  if (driftClass === 'active') return 2;
  if (driftClass === 'watch') return 1;
  return 0;
}

function candidateRoutePressure(entry = {}) {
  return Number(entry.ontologyAudit?.selectiveAdmissibilityDrift?.routePressure || 0);
}

function candidateProtectedAnchorIntegrity(entry = {}) {
  return Number(entry.ontologyAudit?.anchorIntegrity?.protectedAnchorIntegrity ?? 1);
}

function candidateSurfaceRichness(entry = {}) {
  return realizedNonPunctuationDimensions(entry).length + Number(entry.lexemeSwapCount || 0);
}

function mildArtifactOnly(entry = {}) {
  const flags = Array.isArray(entry.artifactFlags) ? entry.artifactFlags : [];
  if (!flags.length) {
    return false;
  }
  return flags.every((flag) => [
    'artifact:clause-join',
    'artifact:sentence-fracture',
    'artifact:connector-stack'
  ].includes(flag));
}

function buildGeneratorAuditCase({
  id = '',
  laneKind = 'transfer',
  sourceId = '',
  donorId = '',
  personaId = '',
  result = {},
  sourceClass = 'unknown',
  expectedSourceRegisterLane = '',
  registeredTransformClass = '',
  apertureOutcome = ''
} = {}) {
  const candidateLedger = Array.isArray(result.candidateLedger) ? result.candidateLedger : [];
  const selectedCandidate = selectedCandidateFromLedger(candidateLedger);
  const docket = result.generationDocket || null;
  const semanticAudit = result.semanticAudit || {};
  const bounded = semanticBounded(semanticAudit);
  const toolabilityAudit = result.toolabilityAudit || {};
  const personaSeparationAudit = result.personaSeparationAudit || {};
  const ontologyAudit =
    result.ontologyAudit ||
    selectedCandidate?.ontologyAudit ||
    docket?.ontologyRoutePressure ||
    result.retrievalTrace?.ontologyAudit ||
    null;
  const semanticCoverage = ontologyAudit?.semanticCoverage || {};
  const anchorIntegrity = ontologyAudit?.anchorIntegrity || {};
  const aperture = ontologyAudit?.aperture || {};
  const drift = ontologyAudit?.selectiveAdmissibilityDrift || {};
  const toolabilityWinner = [...candidateLedger]
    .sort((left, right) =>
      Number(right.toolabilityScore || 0) - Number(left.toolabilityScore || 0) ||
      Number(right.score || 0) - Number(left.score || 0) ||
      String(left.id || '').localeCompare(String(right.id || ''))
    )[0] || null;
  const selectedCandidateId = selectedCandidate?.id || docket?.winningCandidateId || null;
  const toolabilityWinnerId = toolabilityWinner?.id || null;
  const relationInventorySourceClass = String(ontologyAudit?.relationInventory?.sourceClass || sourceClass || 'unknown');
  const sourceClassMismatch = Boolean(
    relationInventorySourceClass &&
    sourceClass &&
    relationInventorySourceClass !== String(sourceClass)
  );
  const sourceRegisterLane = String(generatorSourceRegisterLane(result, expectedSourceRegisterLane || 'unknown'));
  const relationInventorySourceRegisterLane = String(
    ontologyAudit?.relationInventory?.sourceRegisterLane ||
    result.retrievalTrace?.planSummary?.relationInventory?.sourceRegisterLane ||
    sourceRegisterLane ||
    'unknown'
  );
  const sourceRegisterLaneInference = String(
    ontologyAudit?.relationInventory?.sourceRegisterLaneInference ||
    result.retrievalTrace?.planSummary?.relationInventory?.sourceRegisterLaneInference ||
    'unknown'
  );
  const sourceRegisterLaneFallback = Boolean(
    ontologyAudit?.relationInventory?.sourceRegisterLaneFallback ??
    result.retrievalTrace?.planSummary?.relationInventory?.sourceRegisterLaneFallback ??
    false
  );
  const sourceRegisterLaneMismatch = Boolean(
    expectedSourceRegisterLane &&
    sourceRegisterLane &&
    sourceRegisterLane !== String(expectedSourceRegisterLane)
  );
  const targetRegisterLane = String(
    result.targetRegisterLane ||
    selectedCandidate?.targetRegisterLane ||
    'unknown'
  );
  const changedDimensions = [...new Set(
    result.changedDimensions ||
    selectedCandidate?.changedDimensions ||
    []
  )];
  const profileShiftDimensions = [...new Set(
    result.profileShiftDimensions ||
    selectedCandidate?.profileShiftDimensions ||
    []
  )];
  const lexemeSwapCount = Number(result.lexemeSwaps?.length || selectedCandidate?.lexemeSwapCount || 0);
  const artifactRepairApplied = Boolean(result.artifactRepairApplied || selectedCandidate?.artifactRepairApplied);
  const selectedCandidateFamily = selectedCandidate?.family || docket?.winningCandidateFamily || null;
  const suppressedRicherCandidate = [...candidateLedger]
    .filter((entry) => entry.id !== selectedCandidateId)
    .filter((entry) => candidateSurfaceRichness(entry) > candidateSurfaceRichness(selectedCandidate || {}))
    .sort((left, right) =>
      driftSeverityRank(String(left.ontologyAudit?.selectiveAdmissibilityDrift?.driftClass || 'none')) -
        driftSeverityRank(String(right.ontologyAudit?.selectiveAdmissibilityDrift?.driftClass || 'none')) ||
      candidateRoutePressure(left) - candidateRoutePressure(right) ||
      candidateProtectedAnchorIntegrity(right) - candidateProtectedAnchorIntegrity(left) ||
      Number(mildArtifactOnly(left)) - Number(mildArtifactOnly(right)) ||
      candidateSurfaceRichness(right) - candidateSurfaceRichness(left) ||
      String(left.id || '').localeCompare(String(right.id || ''))
    )[0] || null;
  const syntaxOnlyWinner = Boolean(
    selectedCandidateId &&
    suppressedRicherCandidate &&
    realizedNonPunctuationDimensions({ changedDimensions }).length === 0 &&
    lexemeSwapCount === 0
  );
  const lexicalRegisterFalsePositive = changedDimensions.includes('lexical-register') && lexemeSwapCount === 0;
  const surfaceMovementOverstated = Boolean(
    lexicalRegisterFalsePositive ||
    (realizedNonPunctuationDimensions({ changedDimensions }).length === 0 &&
      lexemeSwapCount === 0 &&
      profileShiftDimensions.length > 0)
  );

  return {
    id,
    laneKind,
    sourceId,
    donorId,
    personaId,
    sourceClass,
    expectedSourceRegisterLane: expectedSourceRegisterLane || '',
    sourceRegisterLane,
    relationInventorySourceRegisterLane,
    sourceRegisterLaneInference,
    sourceRegisterLaneFallback,
    sourceRegisterLaneMismatch,
    targetRegisterLane,
    generatorVersion: result.generatorVersion || 'unknown',
    transferClass: result.transferClass || 'native',
    registeredTransformClass: registeredTransformClass || result.registeredTransformClass || '',
    holdStatus: result.holdStatus || (docket?.status === 'held' ? 'held' : 'landed'),
    holdClass: docket?.holdClass || null,
    apertureOutcome: apertureOutcome || result.apertureOutcome || result.apertureProtocol?.outcome || '',
    visibleShift: Boolean(result.visibleShift),
    nonTrivialShift: Boolean(result.nonTrivialShift),
    semanticBounded: bounded,
    candidateCount: candidateLedger.length,
    selectedCandidateId,
    selectedCandidateScore: round(selectedCandidate?.score ?? 0),
    selectedCandidateToolabilityScore: round(selectedCandidate?.toolabilityScore ?? toolabilityAudit?.toolabilityScore ?? 0),
    selectedCandidateTransferClass: selectedCandidate?.transferClass || result.transferClass || 'native',
    toolabilityWinnerId,
    apertureChangedRoute: Boolean(selectedCandidateId && toolabilityWinnerId && selectedCandidateId !== toolabilityWinnerId),
    toolabilityScore: round(toolabilityAudit?.toolabilityScore ?? 0),
    readability: round(toolabilityAudit?.readability ?? 0),
    sentenceIntegrity: round(toolabilityAudit?.sentenceIntegrity ?? 0),
    movementQuality: round(toolabilityAudit?.movementQuality ?? 0),
    personaDistinctness: round(toolabilityAudit?.personaDistinctness ?? 0),
    personaSeparationScore: round(personaSeparationAudit?.score ?? 0),
    selectedCandidateFamily,
    suppressedRicherCandidateFamily: suppressedRicherCandidate?.family || null,
    changedDimensions,
    profileShiftDimensions,
    lexemeSwapCount,
    artifactRepairApplied,
    syntaxOnlyWinner,
    lexicalRegisterFalsePositive,
    surfaceMovementOverstated,
    ontologyAudit,
    temporalPosture: String(aperture?.temporalPosture || 'unknown'),
    closureClass: String(aperture?.closureClass || 'unknown'),
    closureScore: round(aperture?.closureScore ?? 0),
    historicalCrease: round(aperture?.historicalCrease ?? 0),
    unfoldingEnergy: round(aperture?.unfoldingEnergy ?? 0),
    beaconStatus: String(aperture?.beaconStatus || 'beacon-idle'),
    driftClass: String(drift?.driftClass || 'none'),
    driftReasons: Array.isArray(drift?.driftReasons) ? drift.driftReasons : [],
    routeFloor: String(drift?.routeFloor || 'play'),
    routePressure: round(drift?.routePressure ?? 0),
    relationInventorySourceClass,
    sourceClassMismatch,
    protectedAnchorIntegrity: round(anchorIntegrity?.protectedAnchorIntegrity ?? result.protectedAnchorAudit?.protectedAnchorIntegrity ?? semanticAudit?.protectedAnchorIntegrity ?? 1),
    anchorLossCount: Number(anchorIntegrity?.missingAnchors ?? 0),
    propositionCoverage: round(semanticCoverage?.propositionCoverage ?? semanticAudit?.propositionCoverage ?? 1),
    actorCoverage: round(semanticCoverage?.actorCoverage ?? semanticAudit?.actorCoverage ?? 1),
    actionCoverage: round(semanticCoverage?.actionCoverage ?? semanticAudit?.actionCoverage ?? 1),
    objectCoverage: round(semanticCoverage?.objectCoverage ?? semanticAudit?.objectCoverage ?? 1),
    polarityMismatches: Number(semanticCoverage?.polarityMismatches ?? semanticAudit?.polarityMismatches ?? 0),
    tenseMismatches: Number(semanticCoverage?.tenseMismatches ?? semanticAudit?.tenseMismatches ?? 0),
    toolabilityWarnings: sortUnique([
      ...(result.toolabilityWarnings || []),
      ...(selectedCandidate?.toolabilityWarnings || [])
    ]),
    artifactFlags: sortUnique([
      ...(selectedCandidate?.artifactFlags || [])
    ]),
    notes: sortUnique([
      ...(result.notes || []),
      ...(docket?.headline ? [docket.headline] : [])
    ])
  };
}

function visibleMovement(changedDimensions = [], lexemeSwaps = []) {
  if (!changedDimensions.length && !lexemeSwaps.length) {
    return false;
  }
  if (changedDimensions.every((dimension) => dimension === 'punctuation-shape') && !lexemeSwaps.length) {
    return false;
  }
  return true;
}

function bucketIf(condition, bucket, collection) {
  if (condition) {
    collection.push(bucket);
  }
}

function buildCaseNote(buckets = [], fallback) {
  return buckets.length ? `Buckets: ${buckets.join(', ')}.` : fallback;
}

function buildBorrowedShellFromProfile(profile, fromSlot = 'B', registerLane = null) {
  return {
    mode: 'borrowed',
    label: `borrowed ${fromSlot} cadence`,
    mod: engine.cadenceModFromProfile(profile),
    profile: { ...profile },
    source: 'swapped',
    fromSlot,
    registerLane,
    strength: 0.82
  };
}

function swapCadenceScoreLane(result = {}, sourceText = '') {
  let score = 0;
  const changed = result.text !== sourceText;

  if (result.transferClass === 'structural') {
    score += 5;
  } else if (result.transferClass === 'weak' && changed) {
    score += 3;
  } else if (result.transferClass === 'rejected') {
    score -= 4;
  }

  if (changed) {
    score += 2;
  }
  if (result.realizationTier === 'lexical-structural') {
    score += 2;
  }
  if ((result.semanticAudit?.propositionCoverage ?? 1) >= 0.85) {
    score += 1;
  }
  if ((result.semanticAudit?.polarityMismatches ?? 0) > 0) {
    score -= 2;
  }

  return score;
}

function evaluateSwapCadencePairing(referenceText = '', probeText = '', {
  referenceRegisterLane = null,
  probeRegisterLane = null
} = {}) {
  if (!referenceText.trim() || !probeText.trim()) {
    return {
      score: 0,
      bilateralVisible: false,
      bilateralNonTrivial: false,
      engagedLaneCount: 0,
      rejectedLaneCount: 0,
      laneOutcomes: [],
      laneTransferClasses: [],
      minProtectedAnchorIntegrity: 1,
      minPropositionCoverage: 1
    };
  }

  const referenceProfile = engine.extractCadenceProfile(referenceText);
  const probeProfile = engine.extractCadenceProfile(probeText);
  const laneA = engine.buildCadenceTransfer(
    referenceText,
    buildBorrowedShellFromProfile(probeProfile, 'B', probeRegisterLane),
    { retrieval: true, sourceRegisterLane: referenceRegisterLane || undefined }
  );
  const laneB = engine.buildCadenceTransfer(
    probeText,
    buildBorrowedShellFromProfile(referenceProfile, 'A', referenceRegisterLane),
    { retrieval: true, sourceRegisterLane: probeRegisterLane || undefined }
  );
  const laneOutcomes = [
    laneA.borrowedShellOutcome || laneA.transferClass,
    laneB.borrowedShellOutcome || laneB.transferClass
  ];
  const engagedLaneCount = laneOutcomes.filter((outcome) => ['structural', 'partial'].includes(outcome)).length;
  const rejectedLaneCount = laneOutcomes.filter((outcome) => outcome === 'rejected').length;
  const bilateralVisible = Boolean(laneA.visibleShift) && Boolean(laneB.visibleShift);
  const bilateralNonTrivial = Boolean(laneA.nonTrivialShift) && Boolean(laneB.nonTrivialShift);
  let score = swapCadenceScoreLane(laneA, referenceText) + swapCadenceScoreLane(laneB, probeText);

  if (bilateralVisible) {
    score += 4;
  }
  if (bilateralNonTrivial) {
    score += 6;
  }
  score += engagedLaneCount * 3;
  score -= rejectedLaneCount * 4;

  return {
    score,
    bilateralVisible,
    bilateralNonTrivial,
    engagedLaneCount,
    rejectedLaneCount,
    laneOutcomes,
    laneTransferClasses: [laneA.transferClass, laneB.transferClass],
    minProtectedAnchorIntegrity: round(Math.min(protectedAnchorIntegrity(laneA), protectedAnchorIntegrity(laneB))),
    minPropositionCoverage: round(Math.min(
      laneA.semanticAudit?.propositionCoverage ?? 1,
      laneB.semanticAudit?.propositionCoverage ?? 1
    ))
  };
}

function compareSwapCadencePairings(left = {}, right = {}) {
  return (
    Number(Boolean(right.bilateralNonTrivial)) - Number(Boolean(left.bilateralNonTrivial)) ||
    Number(Boolean(right.bilateralVisible)) - Number(Boolean(left.bilateralVisible)) ||
    Number(right.engagedLaneCount || 0) - Number(left.engagedLaneCount || 0) ||
    Number(left.rejectedLaneCount || 0) - Number(right.rejectedLaneCount || 0) ||
    Number(right.score || 0) - Number(left.score || 0) ||
    Number(right.minProtectedAnchorIntegrity ?? 1) - Number(left.minProtectedAnchorIntegrity ?? 1) ||
    Number(right.minPropositionCoverage ?? 1) - Number(left.minPropositionCoverage ?? 1)
  );
}

function evaluateRepresentativeSwapPair(sourceSample, donorSample) {
  const evaluation = evaluateSwapCadencePairing(sourceSample.text, donorSample.text, {
    referenceRegisterLane: sourceSample.variant || null,
    probeRegisterLane: donorSample.variant || null
  });

  return {
    anchorId: sourceSample.id,
    candidateId: donorSample.id,
    ...evaluation
  };
}

function buildRepresentativeSwapSelections(sampleLibrary = DECK_RANDOMIZER_SAMPLE_LIBRARY, anchorIds = PRIVATE_EORFD_REPRESENTATIVE_ANCHORS) {
  const sampleById = Object.fromEntries(sampleLibrary.map((sample) => [sample.id, sample]));

  return anchorIds.map((anchorId) => {
    const anchor = sampleById[anchorId];
    if (!anchor) {
      return null;
    }

    let best = null;
    for (const candidate of sampleLibrary) {
      if (candidate.id === anchor.id) {
        continue;
      }
      const evaluation = evaluateRepresentativeSwapPair(anchor, candidate);
      if (
        !best ||
        compareSwapCadencePairings(evaluation, best) < 0 ||
        (compareSwapCadencePairings(evaluation, best) === 0 && candidate.id.localeCompare(best.candidateId) < 0)
      ) {
        best = evaluation;
      }
    }
    return best;
  }).filter(Boolean);
}

function summarizeRepresentativeSwapSelections(selections = []) {
  const count = selections.length;
  const bilateralVisibleCount = selections.filter((entry) => entry.bilateralVisible).length;
  const bilateralNonTrivialCount = selections.filter((entry) => entry.bilateralNonTrivial).length;

  return {
    count,
    bilateralVisibleCount,
    bilateralNonTrivialCount,
    bilateralVisibleRate: count ? round(bilateralVisibleCount / count) : 0,
    bilateralNonTrivialRate: count ? round(bilateralNonTrivialCount / count) : 0,
    averageScore: count ? round(selections.reduce((sum, entry) => sum + Number(entry.score || 0), 0) / count, 2) : 0,
    minProtectedAnchorIntegrity: count ? round(Math.min(...selections.map((entry) => entry.minProtectedAnchorIntegrity ?? 1))) : 1,
    minPropositionCoverage: count ? round(Math.min(...selections.map((entry) => entry.minPropositionCoverage ?? 1))) : 1,
    selections
  };
}

function buildPrivateWorkingDoctrine(summary, swapMatrix, representativePairs) {
  const bucketCounts = summary.failureBucketCounts || {};
  const topWitnessBuckets = {
    semantic_drift: bucketCounts.semantic_drift || 0,
    over_flattened_output: bucketCounts.over_flattened_output || 0,
    one_sided_swap: bucketCounts.one_sided_swap || 0
  };
  const witnessBurdenCount = Object.values(topWitnessBuckets).reduce((sum, value) => sum + value, 0);
  const witnessBurdenRatio = round(witnessBurdenCount / Math.max(summary.totalCases || 1, 1));
  const swapSummary = swapMatrix.summary || {};
  const oneSidedRate = round((swapSummary.oneSided || 0) / Math.max(swapSummary.caseCount || 1, 1));
  const donorPressureReal = (swapSummary.bilateralEngaged || 0) >= 24 || (representativePairs.averageScore || 0) >= 12;
  const witnessPressureRising =
    witnessBurdenRatio >= 0.5 ||
    (bucketCounts.register_miss || 0) >= 18 ||
    (bucketCounts.sentence_span_miss || 0) >= 18;
  const realizedPassageWeak =
    !swapSummary.flagshipAllPassed ||
    oneSidedRate >= 0.3 ||
    witnessBurdenRatio >= 0.65;
  const provenanceMaintained =
    (bucketCounts.anchor_break || 0) === 0 &&
    (representativePairs.minProtectedAnchorIntegrity || 1) >= 1;

  let state = 'playable';
  if (donorPressureReal && (!swapSummary.flagshipAllPassed || oneSidedRate >= 0.18 || witnessBurdenRatio >= 0.4)) {
    state = 'warning';
  }
  if (donorPressureReal && witnessPressureRising && realizedPassageWeak && provenanceMaintained) {
    state = 'buffered';
  }
  if (state === 'buffered' && (representativePairs.bilateralNonTrivialRate || 0) < 0.5) {
    state = 'harbor-eligible';
  }

  const blockedGenerativePassage = state === 'buffered' || state === 'harbor-eligible';
  const guidance = blockedGenerativePassage
    ? [
        'prioritize buildCadenceTransfer(...) and pairing logic before new witness/law surface work',
        'defer explanatory or aftermath expansions unless a debugging need is explicit',
        'require before/after comparison on representative pairs, swap flight, and diagnostics buckets'
      ]
    : [
        'maintain retrieval safety floors while tracking whether vitality remains stable'
      ];

  return {
    state,
    blockedGenerativePassage,
    actionBias: blockedGenerativePassage ? 'loosen-exploration-first' : 'hold-current-boundary',
    donorPressure: {
      status: donorPressureReal ? 'real' : 'latent',
      bilateralEngaged: swapSummary.bilateralEngaged || 0,
      representativeAverageScore: representativePairs.averageScore || 0
    },
    witnessPressure: {
      status: witnessPressureRising ? 'rising' : 'contained',
      witnessBurdenCount,
      witnessBurdenRatio,
      topWitnessBuckets
    },
    realizedPassage: {
      status: realizedPassageWeak ? 'weak' : 'landing',
      oneSidedRate,
      flagshipAllPassed: Boolean(swapSummary.flagshipAllPassed)
    },
    provenanceFloor: {
      status: provenanceMaintained ? 'maintained' : 'degraded',
      anchorBreakCount: bucketCounts.anchor_break || 0,
      minProtectedAnchorIntegrity: representativePairs.minProtectedAnchorIntegrity || 1
    },
    swapMatrix: {
      caseCount: swapSummary.caseCount || 0,
      bilateralEngaged: swapSummary.bilateralEngaged || 0,
      oneSided: swapSummary.oneSided || 0,
      bothRejected: swapSummary.bothRejected || 0,
      flagshipPassCount: swapSummary.flagshipPassCount || 0,
      flagshipCaseCount: swapSummary.flagshipCaseCount || 0,
      flagshipAllPassed: Boolean(swapSummary.flagshipAllPassed)
    },
    representativePairs,
    guidance
  };
}

function evaluateSwapCase(caseSpec, report) {
  const sourceSample = DIAGNOSTIC_CORPUS_BY_ID[caseSpec.sourceId];
  const donorSample = DIAGNOSTIC_CORPUS_BY_ID[caseSpec.donorId];
  const lane = report.laneA;
  const donorProfile = engine.extractCadenceProfile(donorSample.text);
  const sourceProfile = engine.extractCadenceProfile(sourceSample.text);
  const outputProfile = engine.extractCadenceProfile(lane.text);
  const sourceDistance = donorDistance(sourceProfile, donorProfile);
  const outputDistance = donorDistance(outputProfile, donorProfile);
  const buckets = [];

  bucketIf(
    lane.changedDimensions.length > 0 &&
      lane.changedDimensions.every((dimension) => dimension === 'punctuation-shape') &&
      lane.lexemeSwapFamilies.length === 0,
    'punctuation_only_shift',
    buckets
  );
  bucketIf(
    caseSpec.expectedPressure === 'same-fact-high' &&
      lane.nonTrivialShift === false &&
      Math.abs((sourceProfile.avgSentenceLength || 0) - (donorProfile.avgSentenceLength || 0)) >= 6,
    'surface_close_under_large_gap',
    buckets
  );
  bucketIf(
    lane.propositionCoverage < 0.85 ||
      lane.actorCoverage < 0.75 ||
      lane.actionCoverage < 0.75 ||
      lane.objectCoverage < 0.65 ||
      lane.polarityMismatches > 0,
    'semantic_drift',
    buckets
  );
  bucketIf(lane.protectedAnchorIntegrity < 1, 'anchor_break', buckets);
  bucketIf(report.pairAudit.oneSided, 'one_sided_swap', buckets);
  bucketIf(report.pairAudit.bothRejected, 'both_rejected_swap', buckets);
  bucketIf(caseSpec.mode === 'false-neighbor' && lane.transferClass === 'structural', 'false_neighbor_convergence', buckets);
  bucketIf(!visibleMovement(lane.changedDimensions, lane.lexemeSwapFamilies), 'over_flattened_output', buckets);
  bucketIf(
    Math.abs((sourceProfile.avgSentenceLength || 0) - (donorProfile.avgSentenceLength || 0)) >= 6 &&
      !hasSentenceDimension(lane.changedDimensions),
    'sentence_span_miss',
    buckets
  );
  bucketIf(
    sourceProfile.registerMode !== donorProfile.registerMode &&
      !hasRegisterDimension(lane.changedDimensions) &&
      lane.lexemeSwapFamilies.length === 0,
    'register_miss',
    buckets
  );

  return {
    id: caseSpec.id,
    familyId: sourceSample.familyId,
    sourceId: caseSpec.sourceId,
    donorId: caseSpec.donorId,
    mode: caseSpec.mode,
    expectedPressure: caseSpec.expectedPressure,
    transferClass: lane.transferClass,
    realizationTier: lane.realizationTier,
    changedDimensions: lane.changedDimensions,
    visibleShift: lane.visibleShift,
    nonTrivialShift: lane.nonTrivialShift,
    donorDistance: {
      source: sourceDistance,
      output: outputDistance,
      improved: outputDistance < sourceDistance
    },
    semanticAudit: semanticSummary({
      semanticAudit: {
        propositionCoverage: lane.propositionCoverage,
        actorCoverage: lane.actorCoverage,
        actionCoverage: lane.actionCoverage,
        objectCoverage: lane.objectCoverage,
        polarityMismatches: lane.polarityMismatches,
        tenseMismatches: lane.tenseMismatches
      }
    }),
    protectedAnchorIntegrity: lane.protectedAnchorIntegrity,
    pairClassification: report.pairAudit.classification,
    changedDimensionsLabel: lane.changedDimensions.join(', '),
    failureBuckets: sortUnique(buckets),
    notes: buildCaseNote(sortUnique(buckets), caseSpec.notes)
  };
}

function selectTrainerCandidate(sourceText, extraction, personaName) {
  const shell = {
    mode: 'persona',
    label: personaName,
    profile: { ...extraction.targetProfile },
    mod: engine.cadenceModFromProfile(extraction.targetProfile),
    strength: 0.84,
    source: 'trainer'
  };
  const strengths = [0.84, 0.72, 0.6];
  const candidates = [];

  for (const strength of strengths) {
    const transfer = engine.buildCadenceTransfer(sourceText, shell, { retrieval: true, strength });
    const candidateText = String(transfer.text || transfer.internalText || '').trim();
    const validation = validateCandidateAgainstFingerprint(engine, candidateText, extraction, {
      personaName,
      sampleLibrary: DIAGNOSTIC_SAMPLE_LIBRARY
    });
    candidates.push({
      text: candidateText,
      transfer,
      validation,
      score:
        (validation.pass ? 1000 : 0) +
        (validation.retrievalContract.retrievalPass ? 400 : 0) +
        ((validation.scalarSummary.aggregate || 0) * 100) +
        (transfer.nonTrivialShift ? 20 : transfer.visibleShift ? 8 : 0) +
        ((transfer.changedDimensions || []).length * 2)
    });
  }

  candidates.sort((left, right) => right.score - left.score);
  return candidates[0];
}

function evaluateMaskCase(caseSpec) {
  const sourceSample = DIAGNOSTIC_CORPUS_BY_ID[caseSpec.sourceId];
  const lockText = caseSpec.lockIds.map((id) => DIAGNOSTIC_CORPUS_BY_ID[id].text).join('\n\n');
  const persona = PERSONA_BY_ID[caseSpec.personaId];
  const lock = buildCadenceLockRecord(engine, {
    name: `${caseSpec.id} lock`,
    corpusText: lockText
  });
  const result = buildMaskTransformationResult(engine, {
    comparisonText: sourceSample.text,
    lock,
    persona
  });
  const sourceProfile = engine.extractCadenceProfile(sourceSample.text);
  const lockProfile = lock.profile;
  const buckets = [];

  bucketIf(
    (result.transfer.changedDimensions || []).length > 0 &&
      (result.transfer.changedDimensions || []).every((dimension) => dimension === 'punctuation-shape') &&
      (result.transfer.lexemeSwaps || []).length === 0,
    'punctuation_only_shift',
    buckets
  );
  bucketIf(
    result.contactSummary.fieldEffect === 'neither',
    'mask_near_home_hold',
    buckets
  );
  bucketIf(
    Math.abs((sourceProfile.avgSentenceLength || 0) - (lockProfile.avgSentenceLength || 0)) >= 6 &&
      result.contactSummary.fieldEffect === 'neither',
    'surface_close_under_large_gap',
    buckets
  );
  bucketIf(
    (result.transfer.semanticAudit?.propositionCoverage ?? 1) < 0.85 ||
      (result.transfer.semanticAudit?.actionCoverage ?? 1) < 0.75 ||
      (result.transfer.semanticAudit?.polarityMismatches ?? 0) > 0,
    'semantic_drift',
    buckets
  );
  bucketIf(protectedAnchorIntegrity(result.transfer) < 1, 'anchor_break', buckets);
  bucketIf(!visibleMovement(result.transfer.changedDimensions || [], result.transfer.lexemeSwaps || []), 'over_flattened_output', buckets);
  bucketIf(
    Math.abs((sourceProfile.avgSentenceLength || 0) - (lockProfile.avgSentenceLength || 0)) >= 6 &&
      !hasSentenceDimension(result.transfer.changedDimensions || []),
    'sentence_span_miss',
    buckets
  );
  bucketIf(
    sourceProfile.registerMode !== persona.profile.registerMode &&
      !hasRegisterDimension(result.transfer.changedDimensions || []) &&
      (result.transfer.lexemeSwaps || []).length === 0,
    'register_miss',
    buckets
  );

  return {
    id: caseSpec.id,
    familyId: caseSpec.sourceFamilyId,
    sourceId: caseSpec.sourceId,
    lockIds: caseSpec.lockIds,
    personaId: caseSpec.personaId,
    mode: caseSpec.mode,
    expectedPressure: caseSpec.expectedPressure,
    transferClass: result.transfer.transferClass,
    realizationTier: result.transfer.realizationTier,
    changedDimensions: result.transfer.changedDimensions || [],
    visibleShift: Boolean(result.transfer.visibleShift),
    nonTrivialShift: Boolean(result.transfer.nonTrivialShift),
    donorDistance: {
      source: round(result.rawToLock?.meanTraceability || 0),
      output: round(result.maskedToLock?.meanTraceability || 0),
      improved: (result.deltaToLock?.traceability || 0) > 0
    },
    semanticAudit: semanticSummary(result.transfer),
    protectedAnchorIntegrity: protectedAnchorIntegrity(result.transfer),
    trainerValidation: null,
    pairClassification: result.contactSummary.contactClass,
    whatMoved: result.whatMovedSummary,
    failureBuckets: sortUnique(buckets),
    notes: buildCaseNote(sortUnique(buckets), result.contactSummary.line)
  };
}

function evaluateTrainerCase(caseSpec) {
  const extractionText = caseSpec.extractionIds.map((id) => DIAGNOSTIC_CORPUS_BY_ID[id].text).join('\n\n');
  const extraction = buildCorpusExtraction(engine, extractionText);
  const sourceSample = DIAGNOSTIC_CORPUS_BY_ID[caseSpec.sourceId];
  const chosen = selectTrainerCandidate(sourceSample.text, extraction, caseSpec.id);
  const transfer = chosen.transfer;
  const validation = chosen.validation;
  const sourceProfile = engine.extractCadenceProfile(sourceSample.text);
  const targetProfile = extraction.targetProfile;
  const buckets = [];

  bucketIf(!validation.retrievalContract.retrievalPass, 'trainer_retrieval_fail', buckets);
  bucketIf(
    (transfer.changedDimensions || []).length > 0 &&
      (transfer.changedDimensions || []).every((dimension) => dimension === 'punctuation-shape') &&
      (transfer.lexemeSwaps || []).length === 0,
    'punctuation_only_shift',
    buckets
  );
  bucketIf(
    caseSpec.expectedPressure === 'trainer-false-neighbor' &&
      validation.retrievalContract.retrievalPass &&
      (validation.scalarSummary.aggregate || 0) >= 0.72,
    'false_neighbor_convergence',
    buckets
  );
  bucketIf(
    (validation.semanticAuditSummary?.propositionCoverageMin ?? 1) < 0.85 ||
      (validation.semanticAuditSummary?.actionCoverageMin ?? 1) < 0.75,
    'semantic_drift',
    buckets
  );
  bucketIf((validation.protectedAnchorSummary?.integrityMin ?? 1) < 1, 'anchor_break', buckets);
  bucketIf(!visibleMovement(transfer.changedDimensions || [], transfer.lexemeSwaps || []), 'over_flattened_output', buckets);
  bucketIf(
    Math.abs((sourceProfile.avgSentenceLength || 0) - (targetProfile.avgSentenceLength || 0)) >= 6 &&
      !hasSentenceDimension(transfer.changedDimensions || []),
    'sentence_span_miss',
    buckets
  );
  bucketIf(
    sourceProfile.registerMode !== targetProfile.registerMode &&
      !hasRegisterDimension(transfer.changedDimensions || []) &&
      (transfer.lexemeSwaps || []).length === 0,
    'register_miss',
    buckets
  );

  return {
    id: caseSpec.id,
    familyId: caseSpec.familyId,
    sourceId: caseSpec.sourceId,
    donorId: '',
    lockIds: caseSpec.extractionIds,
    mode: caseSpec.mode,
    expectedPressure: caseSpec.expectedPressure,
    transferClass: transfer.transferClass,
    realizationTier: transfer.realizationTier,
    changedDimensions: transfer.changedDimensions || [],
    visibleShift: Boolean(transfer.visibleShift),
    nonTrivialShift: Boolean(transfer.nonTrivialShift),
    donorDistance: {
      source: donorDistance(sourceProfile, targetProfile),
      output: donorDistance(chosen.text, targetProfile),
      improved: donorDistance(chosen.text, targetProfile) < donorDistance(sourceProfile, targetProfile)
    },
    semanticAudit: semanticSummary(transfer),
    protectedAnchorIntegrity: protectedAnchorIntegrity(transfer),
    trainerValidation: {
      pass: Boolean(validation.pass),
      retrievalPass: Boolean(validation.retrievalContract.retrievalPass),
      scalarAggregate: round(validation.scalarSummary.aggregate || 0),
      meanAgreement: round(validation.retrievalContract.meanAgreement || 0),
      status: validation.status
    },
    pairClassification: '',
    failureBuckets: sortUnique(buckets),
    notes: buildCaseNote(sortUnique(buckets), caseSpec.notes)
  };
}

function evaluateRetrievalCase(caseSpec) {
  const sourceSample = DIAGNOSTIC_CORPUS_BY_ID[caseSpec.sourceId];
  const donorSample = DIAGNOSTIC_CORPUS_BY_ID[caseSpec.donorId];
  const result = engine.buildCadenceTransfer(sourceSample.text, {
    mode: 'borrowed',
    profile: engine.extractCadenceProfile(donorSample.text),
    registerLane: donorSample.variant || null,
    strength: Number(caseSpec.strength || 0.88)
  }, { retrieval: true, sourceRegisterLane: sourceSample.variant || undefined });
  const donorProfile = engine.extractCadenceProfile(donorSample.text);
  const sourceProfile = engine.extractCadenceProfile(sourceSample.text);
  const outputProfile = engine.extractCadenceProfile(result.text);
  const buckets = [];

  bucketIf(
    (result.changedDimensions || []).length > 0 &&
      (result.changedDimensions || []).every((dimension) => dimension === 'punctuation-shape') &&
      (result.lexemeSwaps || []).length === 0,
    'punctuation_only_shift',
    buckets
  );
  bucketIf(
    (result.semanticAudit?.propositionCoverage ?? 1) < 0.85 ||
      (result.semanticAudit?.actionCoverage ?? 1) < 0.75 ||
      (result.semanticAudit?.polarityMismatches ?? 0) > 0,
    'semantic_drift',
    buckets
  );
  bucketIf(protectedAnchorIntegrity(result) < 1, 'anchor_break', buckets);
  bucketIf(!visibleMovement(result.changedDimensions || [], result.lexemeSwaps || []), 'over_flattened_output', buckets);
  bucketIf(
    Math.abs((sourceProfile.avgSentenceLength || 0) - (donorProfile.avgSentenceLength || 0)) >= 6 &&
      !hasSentenceDimension(result.changedDimensions || []),
    'sentence_span_miss',
    buckets
  );
  bucketIf(
    sourceProfile.registerMode !== donorProfile.registerMode &&
      !hasRegisterDimension(result.changedDimensions || []) &&
      (result.lexemeSwaps || []).length === 0,
    'register_miss',
    buckets
  );

  return {
    id: caseSpec.id,
    familyId: caseSpec.familyId,
    sourceId: caseSpec.sourceId,
    donorId: caseSpec.donorId,
    mode: caseSpec.mode,
    expectedPressure: caseSpec.expectedPressure,
    transferClass: result.transferClass,
    realizationTier: result.realizationTier,
    changedDimensions: result.changedDimensions || [],
    visibleShift: Boolean(result.visibleShift),
    nonTrivialShift: Boolean(result.nonTrivialShift),
    donorDistance: {
      source: donorDistance(sourceProfile, donorProfile),
      output: donorDistance(outputProfile, donorProfile),
      improved: donorDistance(outputProfile, donorProfile) < donorDistance(sourceProfile, donorProfile)
    },
    semanticAudit: semanticSummary(result),
    protectedAnchorIntegrity: protectedAnchorIntegrity(result),
    trainerValidation: null,
    pairClassification: '',
    failureBuckets: sortUnique(buckets),
    notes: buildCaseNote(sortUnique(buckets), caseSpec.notes)
  };
}

function evaluateGeneratorTransferCase(caseSpec) {
  const sourceSample = DIAGNOSTIC_CORPUS_BY_ID[caseSpec.sourceId];
  const donorSample = DIAGNOSTIC_CORPUS_BY_ID[caseSpec.donorId];
  const result = engine.buildCadenceTransfer(sourceSample.text, {
    mode: 'borrowed',
    profile: engine.extractCadenceProfile(donorSample.text),
    registerLane: donorSample.variant || null,
    strength: Number(caseSpec.strength || 0.88),
    source: 'diagnostics'
  }, { retrieval: true, sourceRegisterLane: sourceSample.variant || undefined });
  const record = buildGeneratorAuditCase({
    id: caseSpec.id,
    laneKind: 'transfer',
    sourceId: caseSpec.sourceId,
    donorId: caseSpec.donorId,
    result,
    sourceClass: generatorSourceClass(result, sourceSample.familyId || 'unknown'),
    expectedSourceRegisterLane: sourceSample.variant || ''
  });
  const buckets = [];
  bucketIf(record.holdStatus === 'held', 'generator_hold', buckets);
  bucketIf(!record.semanticBounded, 'generator_unbounded_semantics', buckets);
  return {
    ...record,
    expectedPressure: caseSpec.expectedPressure,
    failureBuckets: sortUnique(buckets),
    notes: buildCaseNote(sortUnique(buckets), caseSpec.notes)
  };
}

function evaluateGeneratorMaskCase(caseSpec) {
  const sourceSample = DIAGNOSTIC_CORPUS_BY_ID[caseSpec.sourceId];
  const lockText = caseSpec.lockIds.map((id) => DIAGNOSTIC_CORPUS_BY_ID[id].text).join('\n\n');
  const persona = PERSONA_BY_ID[caseSpec.personaId];
  const lock = buildCadenceLockRecord(engine, {
    name: `${caseSpec.id} generator lock`,
    corpusText: lockText
  });
  const maskResult = buildMaskTransformationResult(engine, {
    comparisonText: sourceSample.text,
    lock,
    persona
  });
  const result = maskResult.transfer || {};
  const record = buildGeneratorAuditCase({
    id: caseSpec.id,
    laneKind: 'mask',
    sourceId: caseSpec.sourceId,
    personaId: caseSpec.personaId,
    result,
    sourceClass: maskResult.sourceClass || generatorSourceClass(result, caseSpec.sourceFamilyId || 'unknown'),
    expectedSourceRegisterLane: sourceSample.variant || '',
    registeredTransformClass: maskResult.registeredTransformClass,
    apertureOutcome: maskResult.apertureOutcome
  });
  const buckets = [];
  bucketIf(record.holdStatus === 'held', 'generator_hold', buckets);
  bucketIf(!record.semanticBounded, 'generator_unbounded_semantics', buckets);
  return {
    ...record,
    expectedPressure: caseSpec.expectedPressure,
    failureBuckets: sortUnique(buckets),
    notes: buildCaseNote(sortUnique(buckets), maskResult.contactSummary?.line || caseSpec.notes)
  };
}

function buildGeneratorAudit(sectionResults = {}) {
  const cases = [
    ...(sectionResults.generatorTransferCases || []),
    ...(sectionResults.generatorMaskCases || [])
  ];
  const generatorVersionCounts = cases.reduce((acc, item) => incrementCounter(acc, item.generatorVersion), {});
  const sourceClassCounts = cases.reduce((acc, item) => incrementCounter(acc, item.sourceClass), {});
  const laneKindCounts = cases.reduce((acc, item) => incrementCounter(acc, item.laneKind), {});
  const holdClassCounts = cases
    .filter((item) => item.holdClass)
    .reduce((acc, item) => incrementCounter(acc, item.holdClass), {});
  const landedCases = cases.filter((item) => item.holdStatus !== 'held');
  const heldCases = cases.filter((item) => item.holdStatus === 'held');
  const boundedCases = cases.filter((item) => item.semanticBounded);
  const structuralCases = landedCases.filter((item) =>
    item.transferClass === 'structural' ||
    item.registeredTransformClass === 'strong-rewrite' ||
    item.registeredTransformClass === 'cadence-rewrite'
  );
  const surfaceCases = landedCases.filter((item) =>
    item.transferClass === 'surface' ||
    item.registeredTransformClass === 'surface-only'
  );
  const unsafeStructuralCases = structuralCases.filter((item) => !item.semanticBounded);
  const candidateTotal = cases.reduce((sum, item) => sum + Number(item.candidateCount || 0), 0);
  const selectedScoreTotal = cases.reduce((sum, item) => sum + Number(item.selectedCandidateScore || 0), 0);
  const topMisses = [...cases]
    .filter((item) => item.holdStatus === 'held' || !item.semanticBounded || item.transferClass === 'surface')
    .sort((left, right) =>
      Number(right.holdStatus === 'held') - Number(left.holdStatus === 'held') ||
      Number(left.semanticBounded) - Number(right.semanticBounded) ||
      Number(left.selectedCandidateScore || 0) - Number(right.selectedCandidateScore || 0) ||
      String(left.id || '').localeCompare(String(right.id || ''))
    )
    .slice(0, 12)
    .map((item) => ({
      id: item.id,
      laneKind: item.laneKind,
      sourceClass: item.sourceClass,
      transferClass: item.transferClass,
      registeredTransformClass: item.registeredTransformClass,
      holdStatus: item.holdStatus,
      holdClass: item.holdClass,
      semanticBounded: item.semanticBounded,
      selectedCandidateScore: item.selectedCandidateScore
    }));

  return {
    caseCount: cases.length,
    generatorVersionCounts,
    sourceClassCounts,
    laneKindCounts,
    holdClassCounts,
    landedCount: landedCases.length,
    heldCount: heldCases.length,
    structuralCount: structuralCases.length,
    surfaceCount: surfaceCases.length,
    nonTrivialCount: cases.filter((item) => item.nonTrivialShift).length,
    visibleShiftCount: cases.filter((item) => item.visibleShift).length,
    semanticBoundedCount: boundedCases.length,
    semanticBoundedRate: cases.length ? round(boundedCases.length / cases.length) : 0,
    unsafeStructuralCount: unsafeStructuralCases.length,
    protectedAnchorIntegrityMin: cases.length ? round(Math.min(...cases.map((item) => item.protectedAnchorIntegrity ?? 1))) : 1,
    averageCandidateCount: cases.length ? round(candidateTotal / cases.length) : 0,
    averageSelectedCandidateScore: cases.length ? round(selectedScoreTotal / cases.length) : 0,
    topMisses,
    cases
  };
}

function buildOntologyIntegrityReport(sectionResults = {}) {
  const cases = [
    ...(sectionResults.generatorTransferCases || []),
    ...(sectionResults.generatorMaskCases || [])
  ];
  const temporalPostureCounts = cases.reduce((acc, item) => incrementCounter(acc, item.temporalPosture), {});
  const closureClassCounts = cases.reduce((acc, item) => incrementCounter(acc, item.closureClass), {});
  const driftClassCounts = cases.reduce((acc, item) => incrementCounter(acc, item.driftClass), {});
  const routeFloorCounts = cases.reduce((acc, item) => incrementCounter(acc, item.routeFloor), {});
  const highHistoricalCreaseCount = cases.filter((item) => Number(item.historicalCrease || 0) >= 0.55).length;
  const highUnfoldingEnergyCount = cases.filter((item) => Number(item.unfoldingEnergy || 0) >= 0.60).length;
  const beaconActiveSustainedCount = cases.filter((item) => item.beaconStatus === 'beacon-active').length;
  const heldByApertureRoutePressureCount = cases.filter((item) => item.holdClass === 'aperture-route-pressure').length;
  const sourceClassMismatchCount = cases.filter((item) => item.sourceClassMismatch).length;
  const anchorLossCount = cases.filter((item) => Number(item.anchorLossCount || 0) > 0).length;
  const propositionCoverageFloorFailures = cases.filter((item) => Number(item.propositionCoverage || 0) < 0.82).length;
  const actionCoverageFloorFailures = cases.filter((item) => Number(item.actionCoverage || 0) < 0.75).length;
  const apertureChangedRouteCount = cases.filter((item) => item.apertureChangedRoute).length;
  const representativeCases = [...cases]
    .filter((item) =>
      item.holdClass === 'aperture-route-pressure' ||
      item.apertureChangedRoute ||
      item.driftClass !== 'none' ||
      item.sourceClassMismatch ||
      Number(item.anchorLossCount || 0) > 0
    )
    .sort((left, right) =>
      Number(right.holdClass === 'aperture-route-pressure') - Number(left.holdClass === 'aperture-route-pressure') ||
      Number(right.apertureChangedRoute) - Number(left.apertureChangedRoute) ||
      Number(right.routePressure || 0) - Number(left.routePressure || 0) ||
      String(left.id || '').localeCompare(String(right.id || ''))
    )
    .slice(0, 12)
    .map((item) => ({
      id: item.id,
      laneKind: item.laneKind,
      sourceClass: item.sourceClass,
      relationInventorySourceClass: item.relationInventorySourceClass,
      temporalPosture: item.temporalPosture,
      closureClass: item.closureClass,
      driftClass: item.driftClass,
      routeFloor: item.routeFloor,
      routePressure: item.routePressure,
      protectedAnchorIntegrity: item.protectedAnchorIntegrity,
      propositionCoverage: item.propositionCoverage,
      actionCoverage: item.actionCoverage,
      historicalCrease: item.historicalCrease,
      unfoldingEnergy: item.unfoldingEnergy,
      beaconStatus: item.beaconStatus,
      apertureChangedRoute: item.apertureChangedRoute,
      holdClass: item.holdClass,
      driftReasons: item.driftReasons
    }));

  return {
    caseCount: cases.length,
    temporalPostureCounts,
    closureClassCounts,
    driftClassCounts,
    routeFloorCounts,
    highHistoricalCreaseCount,
    highHistoricalCreaseRate: cases.length ? round(highHistoricalCreaseCount / cases.length) : 0,
    highUnfoldingEnergyCount,
    highUnfoldingEnergyRate: cases.length ? round(highUnfoldingEnergyCount / cases.length) : 0,
    beaconActiveSustainedCount,
    beaconActiveSustainedRate: cases.length ? round(beaconActiveSustainedCount / cases.length) : 0,
    heldByApertureRoutePressureCount,
    sourceClassMismatchCount,
    anchorLossCount,
    propositionCoverageFloorFailures,
    actionCoverageFloorFailures,
    apertureChangedRouteCount,
    representativeCases,
    cases
  };
}

function buildCadenceDuelIntegrityReport(sectionResults = {}) {
  const cases = [...(sectionResults.generatorTransferCases || [])];
  const lanePairBuckets = new Map();
  const realizedCase = (item) =>
    item.holdStatus !== 'held' &&
    (realizedNonPunctuationDimensions(item).length > 0 || Number(item.lexemeSwapCount || 0) > 0);
  const pushLanePair = (item) => {
    const key = `${item.sourceRegisterLane || 'unknown'}->${item.targetRegisterLane || 'unknown'}`;
    const bucket = lanePairBuckets.get(key) || {
      caseCount: 0,
      lexicalSwapTotal: 0,
      structuralOpTotal: 0
    };
    bucket.caseCount += 1;
    bucket.lexicalSwapTotal += Number(item.lexemeSwapCount || 0);
    bucket.structuralOpTotal += structuralRealizationCount(item);
    lanePairBuckets.set(key, bucket);
  };

  cases.forEach(pushLanePair);

  const referenceToRushed = cases.filter((item) =>
    item.expectedSourceRegisterLane === 'formal-record' &&
    item.targetRegisterLane === 'rushed-mobile'
  );
  const probeToFormal = cases.filter((item) =>
    item.expectedSourceRegisterLane === 'rushed-mobile' &&
    item.targetRegisterLane === 'formal-record'
  );
  const representativeCases = [...cases]
    .filter((item) =>
      item.sourceRegisterLaneFallback ||
      item.sourceRegisterLaneMismatch ||
      item.syntaxOnlyWinner ||
      item.lexicalRegisterFalsePositive ||
      item.artifactRepairApplied ||
      item.surfaceMovementOverstated ||
      item.id.includes('package-handoff')
    )
    .sort((left, right) =>
      Number(right.id.includes('package-handoff')) - Number(left.id.includes('package-handoff')) ||
      Number(right.syntaxOnlyWinner) - Number(left.syntaxOnlyWinner) ||
      Number(right.artifactRepairApplied) - Number(left.artifactRepairApplied) ||
      Number(right.surfaceMovementOverstated) - Number(left.surfaceMovementOverstated) ||
      String(left.id || '').localeCompare(String(right.id || ''))
    )
    .slice(0, 12)
    .map((item) => ({
      id: item.id,
      sourceRegisterLane: item.sourceRegisterLane,
      targetRegisterLane: item.targetRegisterLane,
      selectedCandidateFamily: item.selectedCandidateFamily,
      suppressedRicherCandidateFamily: item.suppressedRicherCandidateFamily,
      artifactRepairApplied: item.artifactRepairApplied,
      syntaxOnlyWinner: item.syntaxOnlyWinner,
      lexicalRegisterFalsePositive: item.lexicalRegisterFalsePositive,
      surfaceMovementOverstated: item.surfaceMovementOverstated
    }));

  return {
    caseCount: cases.length,
    laneMisclassificationCount: cases.filter((item) => item.sourceRegisterLaneFallback || item.sourceRegisterLaneMismatch).length,
    syntaxOnlyWinnerCount: cases.filter((item) => item.syntaxOnlyWinner).length,
    lexicalRegisterFalsePositiveCount: cases.filter((item) => item.lexicalRegisterFalsePositive).length,
    artifactRepairRescueCount: cases.filter((item) => item.artifactRepairApplied).length,
    referenceToRushedLandedRate: referenceToRushed.length ? round(referenceToRushed.filter(realizedCase).length / referenceToRushed.length) : 0,
    probeToFormalLandedRate: probeToFormal.length ? round(probeToFormal.filter(realizedCase).length / probeToFormal.length) : 0,
    averageRealizedLexicalSwapCountByLanePair: Object.fromEntries(
      [...lanePairBuckets.entries()].map(([key, bucket]) => [
        key,
        bucket.caseCount ? round(bucket.lexicalSwapTotal / bucket.caseCount, 2) : 0
      ])
    ),
    averageRealizedStructuralOpCountByLanePair: Object.fromEntries(
      [...lanePairBuckets.entries()].map(([key, bucket]) => [
        key,
        bucket.caseCount ? round(bucket.structuralOpTotal / bucket.caseCount, 2) : 0
      ])
    ),
    representativeCases,
    cases
  };
}

function buildToolabilityProbe(id = '', comparisonText = '', lock = null) {
  const personas = TOOLABILITY_MAJOR_PERSONA_IDS
    .map((personaId) => PERSONA_BY_ID[personaId])
    .filter(Boolean);
  const results = personas.map((persona) => buildMaskTransformationResult(engine, {
    comparisonText,
    lock,
    persona
  }));
  const landed = results.filter((result) => result?.registeredTransformClass !== 'generator-hold' && result?.registeredTransformClass !== 'generator-fault');
  const distinctCount = new Set(landed.map((result) => normalizeComparable(result.maskedText))).size;
  const pairTotal = (landed.length * Math.max(landed.length - 1, 0)) / 2;
  let convergencePairs = 0;
  for (let leftIndex = 0; leftIndex < landed.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < landed.length; rightIndex += 1) {
      if (normalizeComparable(landed[leftIndex].maskedText) === normalizeComparable(landed[rightIndex].maskedText)) {
        convergencePairs += 1;
      }
    }
  }
  const previewHonestCount = results.filter((result) =>
    result.previewAlignment?.reason === 'shown'
      ? (result.shiftPreview || []).length > 0
      : (result.shiftPreview || []).length === 0
  ).length;
  const artifactCount = landed.filter((result) =>
    hasToolabilityArtifactLeak(result.maskedText) ||
    (result.toolabilityWarnings || []).some((warning) => String(warning || '').startsWith('artifact:'))
  ).length;

  return {
    id,
    landedCount: landed.length,
    holdCount: results.length - landed.length,
    distinctCount,
    distinctnessRate: results.length ? round(distinctCount / results.length) : 0,
    convergencePairs,
    convergenceRate: pairTotal ? round(convergencePairs / pairTotal) : 0,
    artifactRate: landed.length ? round(artifactCount / landed.length) : 0,
    previewHonestyRate: results.length ? round(previewHonestCount / results.length) : 0
  };
}

function buildToolabilityReport(sectionResults = {}) {
  const expectedCases = (sectionResults.generatorMaskCases || []).filter((item) =>
    ['procedural-record', 'formal-correspondence', 'reflective-prose', 'narrative-scene'].includes(item.sourceClass)
  );
  const landedCases = expectedCases.filter((item) => item.holdStatus !== 'held');
  const heldCases = expectedCases.filter((item) => item.holdStatus === 'held');
  const artifactCases = landedCases.filter((item) =>
    (item.artifactFlags || []).length > 0 ||
    (item.toolabilityWarnings || []).some((warning) => String(warning || '').startsWith('artifact:'))
  );
  const weakMovementCases = landedCases.filter((item) =>
    item.transferClass !== 'structural' &&
    item.registeredTransformClass !== 'strong-rewrite' &&
    item.registeredTransformClass !== 'cadence-rewrite'
  );
  const lock = buildCadenceLockRecord(engine, {
    name: 'toolability-diagnostics-lock',
    corpusText: [
      DIAGNOSTIC_CORPUS_BY_ID['overwork-debrief-professional-message']?.text || '',
      DIAGNOSTIC_CORPUS_BY_ID['package-handoff-formal-record']?.text || ''
    ].join('\n\n').trim()
  });
  const probes = [
    buildToolabilityProbe('reflective-live', TOOLABILITY_REFLECTIVE_PROBE, lock),
    buildToolabilityProbe('narrative-live', TOOLABILITY_NARRATIVE_PROBE, lock)
  ];
  const probeCount = Math.max(probes.length, 1);

  return {
    expectedCaseCount: expectedCases.length,
    landedRate: expectedCases.length ? round(landedCases.length / expectedCases.length) : 0,
    holdRate: expectedCases.length ? round(heldCases.length / expectedCases.length) : 0,
    artifactRate: landedCases.length ? round(artifactCases.length / landedCases.length) : 0,
    weakMovementRate: landedCases.length ? round(weakMovementCases.length / landedCases.length) : 0,
    distinctnessRate: round(probes.reduce((sum, probe) => sum + Number(probe.distinctnessRate || 0), 0) / probeCount),
    convergenceRate: round(probes.reduce((sum, probe) => sum + Number(probe.convergenceRate || 0), 0) / probeCount),
    previewHonestyRate: round(probes.reduce((sum, probe) => sum + Number(probe.previewHonestyRate || 0), 0) / probeCount),
    repeatedFlightStabilityRate: round(probes.reduce((sum, probe) => sum + Number((probe.landedCount >= 4 && probe.distinctCount >= 4) ? 1 : 0), 0) / probeCount),
    probes
  };
}

function summarize(sectionResults = {}) {
  const allCases = Object.values(sectionResults).flat();
  const failureBucketCounts = allCases.reduce((acc, item) => {
    for (const bucket of item.failureBuckets || []) {
      acc[bucket] = (acc[bucket] || 0) + 1;
    }
    return acc;
  }, {});
  FAILURE_BUCKETS.forEach((bucket) => {
    failureBucketCounts[bucket] = failureBucketCounts[bucket] || 0;
  });
  const familyPressure = allCases.reduce((acc, item) => {
    const familyId = item.familyId || 'shared';
    acc[familyId] = (acc[familyId] || 0) + (item.failureBuckets?.length || 0);
    return acc;
  }, {});
  const worstFamilies = Object.entries(familyPressure)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 8)
    .map(([familyId, score]) => ({ familyId, score }));
  const worstCases = [...allCases]
    .sort((left, right) => (right.failureBuckets?.length || 0) - (left.failureBuckets?.length || 0))
    .slice(0, 12)
    .map((item) => ({
      id: item.id,
      familyId: item.familyId || 'shared',
      failureBuckets: item.failureBuckets,
      notes: item.notes
    }));

  return {
    corpusVersion: DIAGNOSTIC_CORPUS.version,
    familyCount: DIAGNOSTIC_CORPUS.families.length,
    sampleCount: DIAGNOSTIC_CORPUS.samples.length,
    promotedDeckCount: DIAGNOSTIC_CORPUS.promotedSampleIds.length,
    totalCases: allCases.length,
    failureBucketCounts,
    worstFamilies,
    worstCases
  };
}

function buildSampleAudit(sampleLibrary = DIAGNOSTIC_SAMPLE_LIBRARY) {
  const resolvedSamples = sampleLibrary.map((sample) => ({
    ...sample,
    profile: engine.extractCadenceProfile(sample.text)
  }));
  const resolvedDeckSamples = DECK_RANDOMIZER_SAMPLE_LIBRARY.map((sample) => ({
    ...sample,
    profile: engine.extractCadenceProfile(sample.text)
  }));
  const pairedFamilyCount = [...DECK_RANDOMIZER_SAMPLE_LIBRARY.reduce((acc, sample) => {
    const variants = acc.get(sample.familyId) || new Set();
    variants.add(sample.variant);
    acc.set(sample.familyId, variants);
    return acc;
  }, new Map()).values()].filter((variants) => variants.size >= 2).length;
  const fullDeckFieldSummary = buildNearestFieldSummary(
    resolvedDeckSamples,
    (sample) => sample.profile,
    (sample) => sample.text
  );
  const deckWideSubset = buildWideFieldSubset(
    resolvedDeckSamples,
    Math.min(16, resolvedDeckSamples.length),
    (sample) => sample.profile,
    (sample) => sample.text
  );
  return {
    randomizerCorpusSize: sampleLibrary.length,
    uniqueResolvedProfileCount: new Set(resolvedSamples.map((sample) => profileKey(sample.profile))).size,
    closestPairs: buildClosestProfilePairs(resolvedSamples, (sample) => sample.profile, (sample) => sample.text),
    exactProfileCollisions: buildExactProfileCollisions(resolvedSamples, (sample) => sample.profile),
    deckRandomizerSize: DECK_RANDOMIZER_SAMPLE_LIBRARY.length,
    deckRandomizerFamilyCount: new Set(DECK_RANDOMIZER_SAMPLE_LIBRARY.map((sample) => sample.familyId)).size,
    deckRandomizerPairedFamilyCount: pairedFamilyCount,
    deckRandomizerWideSubsetSize: deckWideSubset.length,
    deckRandomizerWideSubsetIds: deckWideSubset.map((sample) => sample.id),
    deckRandomizerLibraryAverageNearestFieldDistance: fullDeckFieldSummary.averageNearestFieldDistance,
    deckRandomizerLibraryMinNearestFieldDistance: fullDeckFieldSummary.minNearestFieldDistance,
    ...buildNearestFieldSummary(deckWideSubset, (sample) => sample.profile, (sample) => sample.text)
  };
}

function buildPersonaAudit(personaLibrary = PERSONA_LIBRARY) {
  const resolvedPersonas = personaLibrary.filter((persona) => persona.profile);
  const comparisonSampleId = 'customer-support-formal-record';
  const comparisonText = DIAGNOSTIC_CORPUS_BY_ID[comparisonSampleId]?.text || DIAGNOSTIC_SAMPLE_LIBRARY[0]?.text || '';
  const lock = buildCadenceLockRecord(engine, {
    name: 'persona-audit-lock',
    corpusText: [
      DIAGNOSTIC_CORPUS_BY_ID['overwork-debrief-professional-message']?.text || '',
      DIAGNOSTIC_CORPUS_BY_ID['package-handoff-formal-record']?.text || ''
    ].join('\n\n').trim()
  });
  const renderedOutputs = resolvedPersonas.map((persona) => {
    const result = buildMaskTransformationResult(engine, {
      comparisonText,
      lock,
      persona
    });
    return result?.maskedText || result?.internalMaskedText || '';
  });
  const distinctOutputCount = new Set(renderedOutputs).size;
  const missingRecipeSampleIds = personaLibrary.flatMap((persona) =>
    (persona.recipeResolution?.missingSampleIds || []).map((sampleId) => ({
      personaId: persona.id,
      sampleId
    }))
  );

  return {
    resolvedPersonaCount: personaLibrary.length,
    uniqueResolvedProfileCount: new Set(resolvedPersonas.map((persona) => profileKey(persona.profile))).size,
    missingRecipeSampleIds,
    closestPairs: buildClosestProfilePairs(
      resolvedPersonas,
      (persona) => persona.profile,
      (persona) => persona.diagnosticSpecimen?.text || ''
    ),
    ...buildNearestFieldSummary(
      resolvedPersonas,
      (persona) => persona.profile,
      (persona) => persona.diagnosticSpecimen?.text || ''
    ),
    distinctOutputCheck: {
      comparisonSampleId,
      resolvedPersonaCount: resolvedPersonas.length,
      distinctOutputCount,
      allDistinct: distinctOutputCount === resolvedPersonas.length
    }
  };
}

function evaluateSwapCaseCollection(caseSpecs = []) {
  const swapMatrix = engine.buildSwapCadenceMatrix(DIAGNOSTIC_SAMPLE_LIBRARY, {
    orderedPairs: caseSpecs,
    flagshipPairs: [],
    strength: 0.82
  });
  const swapReportById = Object.fromEntries(swapMatrix.fullMatrix.map((report) => [report.id, report]));
  return caseSpecs.map((caseSpec) =>
    evaluateSwapCase(caseSpec, swapReportById[`${caseSpec.sourceId}__${caseSpec.donorId}`])
  );
}

function buildSectionData(sectionId = '') {
  switch (sectionId) {
    case 'sampleAudit':
      return buildSampleAudit(DIAGNOSTIC_SAMPLE_LIBRARY);
    case 'personaAudit':
      return buildPersonaAudit(PERSONA_LIBRARY);
    case 'swapPairs':
      return evaluateSwapCaseCollection(DIAGNOSTIC_BATTERY.swapPairs);
    case 'maskCases':
      return DIAGNOSTIC_BATTERY.maskCases.map(evaluateMaskCase);
    case 'trainerCases':
      return DIAGNOSTIC_BATTERY.trainerCases.map(evaluateTrainerCase);
    case 'retrievalCases':
      return DIAGNOSTIC_BATTERY.retrievalCases.map(evaluateRetrievalCase);
    case 'falseNeighborCases':
      return evaluateSwapCaseCollection(DIAGNOSTIC_BATTERY.falseNeighborCases);
    case 'generatorTransferCases':
      return DIAGNOSTIC_BATTERY.retrievalCases.map(evaluateGeneratorTransferCase);
    case 'generatorMaskCases':
      return DIAGNOSTIC_BATTERY.maskCases.map(evaluateGeneratorMaskCase);
    case 'annexDiagnostics':
      return buildAnnexDiagnostics(repoRoot);
    default:
      throw new Error(`Unsupported diagnostics section: ${sectionId}`);
  }
}

function buildMarkdownReport(report) {
  const lines = [
    '# Diagnostics Battery',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    `Corpus: ${report.summary.sampleCount} samples across ${report.summary.familyCount} families`,
    `Promoted deck subset: ${report.summary.promotedDeckCount} samples`,
    `Total diagnostics cases: ${report.summary.totalCases}`,
    '',
    '## Failure Buckets',
    ''
  ];

  Object.entries(report.summary.failureBucketCounts)
    .sort((left, right) => right[1] - left[1])
    .forEach(([bucket, count]) => {
      lines.push(`- ${bucket}: ${count}`);
    });

  lines.push('', '## Worst Families', '');
  report.summary.worstFamilies.forEach((entry) => {
    lines.push(`- ${entry.familyId}: ${entry.score}`);
  });

  lines.push('', '## Worst Cases', '');
  report.summary.worstCases.forEach((entry) => {
    lines.push(`- ${entry.id}: ${entry.failureBuckets.join(', ') || 'none'} // ${entry.notes}`);
  });

  if (report.generatorAudit) {
    lines.push('', '## Generator Audit', '');
    lines.push(`- case_count: ${report.generatorAudit.caseCount}`);
    lines.push(`- landed_count: ${report.generatorAudit.landedCount}`);
    lines.push(`- held_count: ${report.generatorAudit.heldCount}`);
    lines.push(`- structural_count: ${report.generatorAudit.structuralCount}`);
    lines.push(`- surface_count: ${report.generatorAudit.surfaceCount}`);
    lines.push(`- semantic_bounded_rate: ${report.generatorAudit.semanticBoundedRate}`);
    lines.push(`- unsafe_structural_count: ${report.generatorAudit.unsafeStructuralCount}`);
    lines.push(`- protected_anchor_integrity_min: ${report.generatorAudit.protectedAnchorIntegrityMin}`);
    lines.push(`- average_candidate_count: ${report.generatorAudit.averageCandidateCount}`);
    lines.push(`- average_selected_candidate_score: ${report.generatorAudit.averageSelectedCandidateScore}`);
    lines.push(`- generator_versions: ${Object.entries(report.generatorAudit.generatorVersionCounts || {}).map(([key, value]) => `${key}:${value}`).join(', ') || 'none'}`);
    lines.push(`- source_classes: ${Object.entries(report.generatorAudit.sourceClassCounts || {}).map(([key, value]) => `${key}:${value}`).join(', ') || 'none'}`);
    lines.push(`- hold_classes: ${Object.entries(report.generatorAudit.holdClassCounts || {}).map(([key, value]) => `${key}:${value}`).join(', ') || 'none'}`);
    lines.push('', '### Generator Misses', '');
    report.generatorAudit.topMisses.forEach((entry) => {
      lines.push(`- ${entry.id}: ${entry.laneKind}, ${entry.sourceClass}, transfer ${entry.transferClass}, registered ${entry.registeredTransformClass || 'n/a'}, hold ${entry.holdStatus}/${entry.holdClass || 'none'}, bounded ${entry.semanticBounded ? 'yes' : 'no'}, selected score ${entry.selectedCandidateScore}`);
      });
    }

  if (report.ontologyIntegrity) {
    lines.push('', '## Ontology Integrity', '');
    lines.push(`- case_count: ${report.ontologyIntegrity.caseCount}`);
    lines.push(`- temporal_postures: ${Object.entries(report.ontologyIntegrity.temporalPostureCounts || {}).map(([key, value]) => `${key}:${value}`).join(', ') || 'none'}`);
    lines.push(`- closure_classes: ${Object.entries(report.ontologyIntegrity.closureClassCounts || {}).map(([key, value]) => `${key}:${value}`).join(', ') || 'none'}`);
    lines.push(`- drift_classes: ${Object.entries(report.ontologyIntegrity.driftClassCounts || {}).map(([key, value]) => `${key}:${value}`).join(', ') || 'none'}`);
    lines.push(`- route_floors: ${Object.entries(report.ontologyIntegrity.routeFloorCounts || {}).map(([key, value]) => `${key}:${value}`).join(', ') || 'none'}`);
    lines.push(`- high_historical_crease_rate: ${report.ontologyIntegrity.highHistoricalCreaseRate}`);
    lines.push(`- high_unfolding_energy_rate: ${report.ontologyIntegrity.highUnfoldingEnergyRate}`);
    lines.push(`- beacon_active_sustained_rate: ${report.ontologyIntegrity.beaconActiveSustainedRate}`);
    lines.push(`- held_by_aperture_route_pressure_count: ${report.ontologyIntegrity.heldByApertureRoutePressureCount}`);
    lines.push(`- source_class_mismatch_count: ${report.ontologyIntegrity.sourceClassMismatchCount}`);
    lines.push(`- anchor_loss_count: ${report.ontologyIntegrity.anchorLossCount}`);
    lines.push(`- proposition_coverage_floor_failures: ${report.ontologyIntegrity.propositionCoverageFloorFailures}`);
    lines.push(`- action_coverage_floor_failures: ${report.ontologyIntegrity.actionCoverageFloorFailures}`);
    lines.push(`- aperture_changed_route_count: ${report.ontologyIntegrity.apertureChangedRouteCount}`);
    lines.push('', '### Ontology Pressure Cases', '');
    report.ontologyIntegrity.representativeCases.forEach((entry) => {
      lines.push(`- ${entry.id}: ${entry.laneKind}, ${entry.sourceClass} -> ${entry.relationInventorySourceClass}, posture ${entry.temporalPosture}, closure ${entry.closureClass}, drift ${entry.driftClass}, route ${entry.routeFloor}/${entry.routePressure}, anchors ${entry.protectedAnchorIntegrity}, proposition ${entry.propositionCoverage}, action ${entry.actionCoverage}, crease ${entry.historicalCrease}, unfold ${entry.unfoldingEnergy}, beacon ${entry.beaconStatus}, route-shift ${entry.apertureChangedRoute ? 'yes' : 'no'}, hold ${entry.holdClass || 'none'}`);
    });
  }

  if (report.cadenceDuelIntegrity) {
    lines.push('', '## Cadence Duel Integrity', '');
    lines.push(`- case_count: ${report.cadenceDuelIntegrity.caseCount}`);
    lines.push(`- lane_misclassification_count: ${report.cadenceDuelIntegrity.laneMisclassificationCount}`);
    lines.push(`- syntax_only_winner_count: ${report.cadenceDuelIntegrity.syntaxOnlyWinnerCount}`);
    lines.push(`- lexical_register_false_positive_count: ${report.cadenceDuelIntegrity.lexicalRegisterFalsePositiveCount}`);
    lines.push(`- artifact_repair_rescue_count: ${report.cadenceDuelIntegrity.artifactRepairRescueCount}`);
    lines.push(`- reference_to_rushed_landed_rate: ${report.cadenceDuelIntegrity.referenceToRushedLandedRate}`);
    lines.push(`- probe_to_formal_landed_rate: ${report.cadenceDuelIntegrity.probeToFormalLandedRate}`);
    lines.push(`- average_realized_lexical_swap_count_by_lane_pair: ${Object.entries(report.cadenceDuelIntegrity.averageRealizedLexicalSwapCountByLanePair || {}).map(([key, value]) => `${key}:${value}`).join(', ') || 'none'}`);
    lines.push(`- average_realized_structural_op_count_by_lane_pair: ${Object.entries(report.cadenceDuelIntegrity.averageRealizedStructuralOpCountByLanePair || {}).map(([key, value]) => `${key}:${value}`).join(', ') || 'none'}`);
    lines.push('', '### Cadence Duel Cases', '');
    report.cadenceDuelIntegrity.representativeCases.forEach((entry) => {
      lines.push(`- ${entry.id}: ${entry.sourceRegisterLane} -> ${entry.targetRegisterLane}, selected ${entry.selectedCandidateFamily || 'none'}, suppressed ${entry.suppressedRicherCandidateFamily || 'none'}, repaired ${entry.artifactRepairApplied ? 'yes' : 'no'}, syntax-only ${entry.syntaxOnlyWinner ? 'yes' : 'no'}, lexical-register-fp ${entry.lexicalRegisterFalsePositive ? 'yes' : 'no'}, overstated ${entry.surfaceMovementOverstated ? 'yes' : 'no'}`);
    });
  }

  if (report.toolability) {
    lines.push('', '## Toolability', '');
    lines.push(`- expected_case_count: ${report.toolability.expectedCaseCount}`);
    lines.push(`- landed_rate: ${report.toolability.landedRate}`);
    lines.push(`- hold_rate: ${report.toolability.holdRate}`);
    lines.push(`- artifact_rate: ${report.toolability.artifactRate}`);
    lines.push(`- weak_movement_rate: ${report.toolability.weakMovementRate}`);
    lines.push(`- distinctness_rate: ${report.toolability.distinctnessRate}`);
    lines.push(`- convergence_rate: ${report.toolability.convergenceRate}`);
    lines.push(`- preview_honesty_rate: ${report.toolability.previewHonestyRate}`);
    lines.push(`- repeated_flight_stability_rate: ${report.toolability.repeatedFlightStabilityRate}`);
    lines.push('', '### Toolability Probes', '');
    report.toolability.probes.forEach((probe) => {
      lines.push(`- ${probe.id}: landed ${probe.landedCount}, holds ${probe.holdCount}, distinct ${probe.distinctCount}, convergence ${probe.convergenceRate}, artifacts ${probe.artifactRate}, preview honesty ${probe.previewHonestyRate}`);
    });
  }

  if (report.sampleAudit) {
    lines.push('', '## Sample Audit', '');
    lines.push(`- randomizer_corpus_size: ${report.sampleAudit.randomizerCorpusSize}`);
    lines.push(`- unique_resolved_sample_profile_count: ${report.sampleAudit.uniqueResolvedProfileCount}`);
    lines.push(`- deck_randomizer_size: ${report.sampleAudit.deckRandomizerSize}`);
    lines.push(`- deck_randomizer_family_count: ${report.sampleAudit.deckRandomizerFamilyCount}`);
    lines.push(`- deck_randomizer_paired_family_count: ${report.sampleAudit.deckRandomizerPairedFamilyCount}`);
    lines.push(`- deck_randomizer_wide_subset_size: ${report.sampleAudit.deckRandomizerWideSubsetSize}`);
    lines.push(`- average_nearest_field_distance: ${report.sampleAudit.averageNearestFieldDistance}`);
    lines.push(`- min_nearest_field_distance: ${report.sampleAudit.minNearestFieldDistance}`);
    lines.push(`- deck_randomizer_library_average_nearest_field_distance: ${report.sampleAudit.deckRandomizerLibraryAverageNearestFieldDistance}`);
    lines.push(`- deck_randomizer_library_min_nearest_field_distance: ${report.sampleAudit.deckRandomizerLibraryMinNearestFieldDistance}`);
    lines.push(`- exact_profile_collisions: ${report.sampleAudit.exactProfileCollisions.length ? report.sampleAudit.exactProfileCollisions.map((entry) => entry.ids.join(', ')).join(' | ') : 'none'}`);
    lines.push('', '### Closest Sample Pairs', '');
    report.sampleAudit.closestPairs.forEach((entry) => {
      lines.push(`- ${entry.leftId} <-> ${entry.rightId}: field distance ${entry.distance}, profile ${entry.profileDistance}, heatmap ${entry.heatmapDistance}, traceability ${entry.traceability}`);
    });
  }

  if (report.personaAudit) {
    lines.push('', '## Persona Audit', '');
    lines.push(`- resolved_persona_count: ${report.personaAudit.resolvedPersonaCount}`);
    lines.push(`- unique_resolved_persona_profile_count: ${report.personaAudit.uniqueResolvedProfileCount}`);
    lines.push(`- average_nearest_field_distance: ${report.personaAudit.averageNearestFieldDistance}`);
    lines.push(`- min_nearest_field_distance: ${report.personaAudit.minNearestFieldDistance}`);
    lines.push(`- missing_recipe_sample_ids: ${report.personaAudit.missingRecipeSampleIds.length ? report.personaAudit.missingRecipeSampleIds.map((entry) => `${entry.personaId}:${entry.sampleId}`).join(', ') : 'none'}`);
    lines.push(`- distinct_output_check: ${report.personaAudit.distinctOutputCheck.distinctOutputCount}/${report.personaAudit.distinctOutputCheck.resolvedPersonaCount} distinct on ${report.personaAudit.distinctOutputCheck.comparisonSampleId}`);
    lines.push('', '### Closest Persona Pairs', '');
    report.personaAudit.closestPairs.forEach((entry) => {
      lines.push(`- ${entry.leftId} <-> ${entry.rightId}: field distance ${entry.distance}, profile ${entry.profileDistance}, heatmap ${entry.heatmapDistance}, traceability ${entry.traceability}`);
    });
  }

  if (report.workingDoctrine) {
    const doctrine = report.workingDoctrine;
    lines.push('', '## Private TD613 Aperture Working State', '');
    lines.push(`- state: ${doctrine.state}`);
    lines.push(`- blocked_generative_passage: ${doctrine.blockedGenerativePassage ? 'yes' : 'no'}`);
    lines.push(`- donor_pressure: ${doctrine.donorPressure?.status || 'unknown'}`);
    lines.push(`- witness_pressure: ${doctrine.witnessPressure?.status || 'unknown'}`);
    lines.push(`- realized_passage: ${doctrine.realizedPassage?.status || 'unknown'}`);
    lines.push(`- provenance_floor: ${doctrine.provenanceFloor?.status || 'unknown'}`);
    lines.push(`- swap_matrix: bilateral ${doctrine.swapMatrix?.bilateralEngaged || 0}/${doctrine.swapMatrix?.caseCount || 0}, one-sided ${doctrine.swapMatrix?.oneSided || 0}/${doctrine.swapMatrix?.caseCount || 0}, flagship ${doctrine.swapMatrix?.flagshipPassCount || 0}/${doctrine.swapMatrix?.flagshipCaseCount || 0}`);
    lines.push(`- representative_pairs: bilateral visible ${doctrine.representativePairs?.bilateralVisibleCount || 0}/${doctrine.representativePairs?.count || 0}, bilateral non-trivial ${doctrine.representativePairs?.bilateralNonTrivialCount || 0}/${doctrine.representativePairs?.count || 0}, average score ${doctrine.representativePairs?.averageScore || 0}`);
    lines.push('', '## Private TD613 Aperture Representative Pairs', '');
    (doctrine.representativePairs?.selections || []).forEach((entry) => {
      lines.push(`- ${entry.anchorId} -> ${entry.candidateId}: score ${entry.score}, outcomes ${entry.laneOutcomes.join(' / ')}, bilateral visible ${entry.bilateralVisible ? 'yes' : 'no'}, bilateral non-trivial ${entry.bilateralNonTrivial ? 'yes' : 'no'}`);
    });
  }

  const annexEntries = Object.values(report.annexes || {});
  if (annexEntries.length) {
    lines.push('', '## Annex Diagnostics', '');
    annexEntries.forEach((entry) => {
      lines.push(`### ${entry.label}`);
      lines.push('');
      lines.push(`- status: ${entry.passed ? 'passed' : 'failed'}`);
      lines.push(`- version: ${entry.version || 'unknown'}`);
      lines.push(`- source: ${entry.file}`);
      if (entry.fingerprint) {
        lines.push(`- content_hash_sha256: ${entry.fingerprint.contentHashSha256}`);
        lines.push(`- inline_script_count: ${entry.fingerprint.inlineScriptCount}`);
      }
      const failedChecks = (entry.failedChecks || []).map((check) => check.label);
      lines.push(`- failed_checks: ${failedChecks.length ? failedChecks.join(', ') : 'none'}`);
      lines.push('');
    });
  }

  return `${lines.join('\n')}\n`;
}

function buildReportFromStageManifest(manifest = {}) {
  const staged = Object.fromEntries(SECTION_IDS.map((sectionId) => {
    const snapshot = readStageSnapshot(manifest, sectionId);
    if (!snapshot) {
      throw new Error(`Cannot assemble diagnostics report: missing or stale section "${sectionId}" for run ${manifest.runId}.`);
    }
    return [sectionId, snapshot.data];
  }));

  const sectionResults = {
    swapPairs: staged.swapPairs,
    maskCases: staged.maskCases,
    trainerCases: staged.trainerCases,
    retrievalCases: staged.retrievalCases,
    falseNeighborCases: staged.falseNeighborCases,
    generatorTransferCases: staged.generatorTransferCases,
    generatorMaskCases: staged.generatorMaskCases
  };
  const swapMatrix = engine.buildSwapCadenceMatrix(DIAGNOSTIC_SAMPLE_LIBRARY, {
    orderedPairs: DIAGNOSTIC_BATTERY.swapPairs,
    flagshipPairs: engine.SWAP_CADENCE_FLAGSHIP_PAIRS,
    strength: 0.82
  });
  const representativePairs = summarizeRepresentativeSwapSelections(buildRepresentativeSwapSelections());
  const generatorAudit = buildGeneratorAudit(sectionResults);
  const ontologyIntegrity = buildOntologyIntegrityReport(sectionResults);
  const cadenceDuelIntegrity = buildCadenceDuelIntegrityReport(sectionResults);
  const toolability = buildToolabilityReport(sectionResults);
  const report = {
    generatedAt: new Date().toISOString(),
    runMetadata: {
      runId: manifest.runId,
      fingerprint: manifest.fingerprint,
      sectionIds: [...SECTION_IDS]
    },
    summary: summarize(sectionResults),
    sections: sectionResults,
    generatorAudit,
    ontologyIntegrity,
    cadenceDuelIntegrity,
    toolability,
    sampleAudit: staged.sampleAudit,
    personaAudit: staged.personaAudit,
    workingDoctrine: null,
    annexes: staged.annexDiagnostics
  };

  report.workingDoctrine = buildPrivateWorkingDoctrine(report.summary, swapMatrix, representativePairs);
  report.summary.generatorCaseCount = generatorAudit.caseCount;
  report.summary.generatorHeldCount = generatorAudit.heldCount;
  report.summary.generatorUnsafeStructuralCount = generatorAudit.unsafeStructuralCount;
  report.summary.ontologyPressureHeldCount = ontologyIntegrity.heldByApertureRoutePressureCount;
  report.summary.cadenceDuelSyntaxOnlyWinnerCount = cadenceDuelIntegrity.syntaxOnlyWinnerCount;
  report.summary.toolabilityLandedRate = toolability.landedRate;
  report.summary.toolabilityDistinctnessRate = toolability.distinctnessRate;
  report.summary.annexCount = Object.keys(report.annexes || {}).length;
  report.summary.annexPassedCount = Object.values(report.annexes || {}).filter((entry) => entry.passed).length;

  return report;
}

function publishDiagnosticsReport(report = {}) {
  ensureDir(reportsDir);
  atomicWriteFile(latestJsonPath, `${JSON.stringify(report, null, 2)}\n`);
  atomicWriteFile(latestMdPath, buildMarkdownReport(report));
  Object.values(report.annexes || {}).forEach((entry) => {
    atomicWriteFile(path.join(reportsDir, `${entry.id}.latest.json`), `${JSON.stringify(entry, null, 2)}\n`);
    atomicWriteFile(path.join(reportsDir, `${entry.id}.latest.md`), buildAnnexMarkdown(entry));
  });
}

function runDiagnosticsSections(manifest = {}, sectionIds = []) {
  let nextManifest = manifest;
  sectionIds.forEach((sectionId) => {
    if (stageSectionComplete(nextManifest, sectionId)) {
      console.log(`diagnostics section reused: ${sectionId}`);
      return;
    }
    console.log(`diagnostics section running: ${sectionId}`);
    nextManifest = persistStageSnapshot(nextManifest, sectionId, buildSectionData(sectionId));
  });
  return nextManifest;
}

async function main() {
  const args = parseDiagnosticsArgs();
  const fingerprint = computeRunFingerprint();
  let manifest = loadActiveStageManifest(fingerprint, { fresh: args.fresh });

  if (args.assembleOnly) {
    const missing = missingStageSections(manifest);
    if (missing.length) {
      throw new Error(`Cannot assemble diagnostics report: missing or stale sections ${missing.join(', ')}.`);
    }
    const report = buildReportFromStageManifest(manifest);
    publishDiagnosticsReport(report);
    console.log(`diagnostics battery assembled (${report.summary.totalCases} cases)`);
    console.log(`worst buckets: ${JSON.stringify(report.summary.failureBucketCounts)}`);
    return;
  }

  if (args.sections?.length) {
    manifest = runDiagnosticsSections(manifest, args.sections);
    console.log(`diagnostics battery staged sections complete (${args.sections.join(', ')})`);
    return;
  }

  const missing = missingStageSections(manifest);
  manifest = runDiagnosticsSections(manifest, missing);
  const report = buildReportFromStageManifest(manifest);
  publishDiagnosticsReport(report);
  console.log(`diagnostics battery complete (${report.summary.totalCases} cases)`);
  console.log(`worst buckets: ${JSON.stringify(report.summary.failureBucketCounts)}`);
}

await main();
