import { compareTexts, extractCadenceProfile } from './stylometry.js';
import { analyzeKhonaLitPoIntegrity } from './ingestion-friction.js';

const TOKEN_RE = /[\p{L}\p{N}'’-]+/gu;
const DEFAULT_MAX_ENTRIES = 24;
const DEFAULT_PROHIBITED_USES = Object.freeze([
  'impersonation',
  'identity proof',
  'anonymity guarantee',
  'platform-proof claim',
  'nonconsensual style cloning'
]);
const DEFAULT_MODE_AFFINITY = Object.freeze([
  'neutralize',
  'stable-pseudonym',
  'rotating-mask',
  'hostile-pipeline-compression'
]);
const KNOWN_GLYPHS = Object.freeze(['𝌋', '⟐']);

const round = (n, d = 6) => Number.isFinite(n) ? Number(n.toFixed(d)) : null;
const clip = (n, min = 0, max = 1) => Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : null;
const unique = (...groups) => [...new Set(groups.flat().filter(Boolean))];
const asArray = (value) => Array.isArray(value) ? [...value] : [];
const clone = (obj) => obj && typeof obj === 'object' ? JSON.parse(JSON.stringify(obj)) : obj;
const nowNull = (value) => value === undefined ? null : value;

export function stablePersonaHash(text = '') {
  // Deterministic local identity only; not a cryptographic custody proof.
  let h = 2166136261;
  for (const char of String(text || '')) {
    h ^= char.codePointAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

function safeProfile(text, profile) {
  if (profile && typeof profile === 'object') return clone(profile);
  if (!text || !String(text).trim()) return null;
  try { return extractCadenceProfile(String(text)); } catch { return null; }
}

function flattenNumeric(obj = {}, prefix = '', out = {}) {
  if (!obj || typeof obj !== 'object') return out;
  for (const [key, value] of Object.entries(obj)) {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (Number.isFinite(value)) out[nextKey] = value;
    else if (value && typeof value === 'object' && !Array.isArray(value)) flattenNumeric(value, nextKey, out);
  }
  return out;
}

function compareEntryTexts(a = {}, b = {}) {
  if (!a.text || !b.text) return null;
  try {
    const cmp = compareTexts(a.text, b.text);
    return Number.isFinite(cmp?.similarity) ? cmp.similarity : Number.isFinite(cmp?.traceability) ? cmp.traceability : null;
  } catch { return null; }
}

function defaultMemoryStatus(entries = [], linkability = null) {
  if (!entries.length) return 'empty';
  if (entries.length < 3) return 'underfit';
  if (linkability?.status === 'overfit-risk') return 'overfit-risk';
  return 'usable';
}

export function createPersonaMemory(input = {}) {
  const personaId = String(input.personaId || input.id || input.label || 'persona').trim() || 'persona';
  const label = String(input.label || input.displayName || personaId);
  const displayName = String(input.displayName || label);
  const surface = {
    avatar: input.surface?.avatar || '',
    description: input.surface?.description || '',
    tags: asArray(input.surface?.tags),
    modeAffinity: asArray(input.surface?.modeAffinity).length ? asArray(input.surface.modeAffinity) : [...DEFAULT_MODE_AFFINITY]
  };
  const ontology = {
    role: input.ontology?.role || '',
    targetContexts: asArray(input.ontology?.targetContexts),
    registerHints: asArray(input.ontology?.registerHints),
    belongingNotes: asArray(input.ontology?.belongingNotes),
    prohibitedUses: unique(DEFAULT_PROHIBITED_USES, asArray(input.ontology?.prohibitedUses))
  };
  const ritualSurface = {
    requiredMarkers: asArray(input.ritualSurface?.requiredMarkers),
    optionalMarkers: asArray(input.ritualSurface?.optionalMarkers),
    protectedLiterals: asArray(input.ritualSurface?.protectedLiterals),
    glyphs: asArray(input.ritualSurface?.glyphs).length ? asArray(input.ritualSurface.glyphs) : [...KNOWN_GLYPHS],
    khonaLitPoRequired: Boolean(input.ritualSurface?.khonaLitPoRequired),
    notes: asArray(input.ritualSurface?.notes)
  };
  const memory = {
    entries: [],
    maxEntries: Number.isFinite(input.memory?.maxEntries) ? input.memory.maxEntries : Number.isFinite(input.maxEntries) ? input.maxEntries : DEFAULT_MAX_ENTRIES,
    acceptedCount: 0,
    rejectedCount: Number.isFinite(input.memory?.rejectedCount) ? input.memory.rejectedCount : 0,
    lastAcceptedAt: null
  };
  return normalizePersonaMemory({ version: 'phase-4', personaId, label, displayName, surface, ontology, ritualSurface, memory, field: {}, diagnostics: {} });
}

export function normalizePersonaMemory(memory = {}) {
  const created = memory.version ? clone(memory) : createPersonaMemory(memory);
  created.version = 'phase-4';
  created.personaId = String(created.personaId || 'persona');
  created.label = String(created.label || created.personaId);
  created.displayName = String(created.displayName || created.label);
  created.surface = {
    avatar: created.surface?.avatar || '',
    description: created.surface?.description || '',
    tags: asArray(created.surface?.tags),
    modeAffinity: asArray(created.surface?.modeAffinity).length ? asArray(created.surface.modeAffinity) : [...DEFAULT_MODE_AFFINITY]
  };
  created.ontology = {
    role: created.ontology?.role || '',
    targetContexts: asArray(created.ontology?.targetContexts),
    registerHints: asArray(created.ontology?.registerHints),
    belongingNotes: asArray(created.ontology?.belongingNotes),
    prohibitedUses: unique(DEFAULT_PROHIBITED_USES, asArray(created.ontology?.prohibitedUses))
  };
  created.ritualSurface = {
    requiredMarkers: asArray(created.ritualSurface?.requiredMarkers),
    optionalMarkers: asArray(created.ritualSurface?.optionalMarkers),
    protectedLiterals: asArray(created.ritualSurface?.protectedLiterals),
    glyphs: asArray(created.ritualSurface?.glyphs).length ? asArray(created.ritualSurface.glyphs) : [...KNOWN_GLYPHS],
    khonaLitPoRequired: Boolean(created.ritualSurface?.khonaLitPoRequired),
    notes: asArray(created.ritualSurface?.notes)
  };
  const rawEntries = asArray(created.memory?.entries);
  created.memory = {
    entries: rawEntries.map((entry) => normalizePersonaEntry(entry, created)),
    maxEntries: Number.isFinite(created.memory?.maxEntries) ? created.memory.maxEntries : DEFAULT_MAX_ENTRIES,
    acceptedCount: Number.isFinite(created.memory?.acceptedCount) ? created.memory.acceptedCount : rawEntries.length,
    rejectedCount: Number.isFinite(created.memory?.rejectedCount) ? created.memory.rejectedCount : 0,
    lastAcceptedAt: created.memory?.lastAcceptedAt || null
  };
  created.memory.entries = prunePersonaHistory(created.memory.entries, { maxEntries: created.memory.maxEntries });
  created.field = deriveInternalField(created);
  created.diagnostics = buildPersonaDiagnostics(created);
  return created;
}

export function normalizePersonaEntry(entry = {}, memory = {}) {
  const text = String(entry.text ?? entry.outputText ?? entry.content ?? '');
  const profile = safeProfile(text, entry.profile ?? entry.outputProfile);
  const scores = {
    sourceResidualRisk: nowNull(entry.scores?.sourceResidualRisk ?? entry.escapeVector?.scores?.sourceResidualRisk),
    maskFit: nowNull(entry.scores?.maskFit ?? entry.escapeVector?.scores?.maskFit),
    maskDeltaSafe: nowNull(entry.scores?.maskDeltaSafe ?? entry.escapeVector?.scores?.maskDeltaSafe),
    semanticFidelity: nowNull(entry.scores?.semanticFidelity ?? entry.escapeVector?.scores?.semanticFidelity),
    maskLinkability: nowNull(entry.scores?.maskLinkability ?? entry.escapeVector?.scores?.maskLinkability),
    belongingWithoutCollapse: nowNull(entry.scores?.belongingWithoutCollapse ?? entry.escapeVector?.scores?.belongingWithoutCollapse),
    ingestionFriction: nowNull(entry.scores?.ingestionFriction ?? entry.escapeVector?.scores?.ingestionFriction ?? entry.ingestionAudit?.ingestionFriction),
    apertureRecaptureRisk: nowNull(entry.scores?.apertureRecaptureRisk ?? entry.escapeVector?.scores?.apertureRecaptureRisk)
  };
  const glyphs = asArray(memory.ritualSurface?.glyphs).filter((g) => g && text.includes(g));
  const protectedLiterals = asArray(memory.ritualSurface?.protectedLiterals);
  const protectedLiteralsPresent = protectedLiterals.filter((literal) => literal && text.includes(literal));
  const khona = entry.markers?.khonaLitPoStatus || entry.ingestionAudit?.khonaLitPo?.status || analyzeKhonaLitPoIntegrity(text).status || 'unknown';
  const id = entry.id || stablePersonaHash([memory.personaId || '', text, entry.createdAt || '', entry.acceptance?.reason || ''].join('|'));
  return {
    id,
    text,
    createdAt: entry.createdAt || null,
    profile,
    escapeVector: clone(entry.escapeVector || {}),
    ingestionAudit: clone(entry.ingestionAudit || entry.escapeVector?.ingestionAudit || {}),
    controllerDecision: clone(entry.controllerDecision || {}),
    scores,
    markers: {
      protectedLiteralsPresent: asArray(entry.markers?.protectedLiteralsPresent).length ? asArray(entry.markers.protectedLiteralsPresent) : protectedLiteralsPresent,
      glyphsObserved: unique(asArray(entry.markers?.glyphsObserved), glyphs),
      khonaLitPoStatus: khona
    },
    acceptance: {
      acceptedBy: entry.acceptance?.acceptedBy || entry.acceptedBy || 'operator',
      reason: entry.acceptance?.reason || entry.reason || '',
      stateAtAcceptance: entry.acceptance?.stateAtAcceptance || entry.controllerDecision?.state || 'unknown'
    }
  };
}

export function prunePersonaHistory(entries = [], options = {}) {
  const maxEntries = Number.isFinite(options.maxEntries) ? options.maxEntries : DEFAULT_MAX_ENTRIES;
  return entries.slice(Math.max(0, entries.length - maxEntries));
}

export function computePersonaCentroid(entries = []) {
  const numericProfiles = entries.map((entry) => flattenNumeric(entry.profile || {}));
  const sums = {};
  const counts = {};
  for (const flat of numericProfiles) {
    for (const [key, value] of Object.entries(flat)) {
      if (!Number.isFinite(value)) continue;
      sums[key] = (sums[key] || 0) + value;
      counts[key] = (counts[key] || 0) + 1;
    }
  }
  const values = {};
  for (const [key, sum] of Object.entries(sums)) values[key] = round(sum / counts[key]);
  const featureCount = Object.keys(values).length;
  return featureCount ? { entryCount: entries.length, featureCount, values } : null;
}

export function computePersonaVariance(entries = [], centroid = null) {
  if (!centroid?.values) return null;
  const values = {};
  for (const [key, mean] of Object.entries(centroid.values)) {
    const observed = entries.map((entry) => flattenNumeric(entry.profile || {})[key]).filter(Number.isFinite);
    if (!observed.length) continue;
    const variance = observed.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / observed.length;
    const stdev = Math.sqrt(variance);
    values[key] = { mean: round(mean), variance: round(variance), stdev: round(stdev), min: round(Math.min(...observed)), max: round(Math.max(...observed)), count: observed.length };
  }
  return { entryCount: entries.length, values };
}

function computeTolerance(variance = null) {
  if (!variance?.values) return null;
  const tolerance = {};
  for (const [key, stat] of Object.entries(variance.values)) tolerance[key] = { low: round(stat.mean - (1.5 * stat.stdev)), high: round(stat.mean + (1.5 * stat.stdev)) };
  return tolerance;
}

export function computeRitualSurface(entries = [], memory = {}) {
  const ritual = memory.ritualSurface || {};
  const required = asArray(ritual.requiredMarkers);
  const optional = asArray(ritual.optionalMarkers);
  const protectedLiterals = asArray(ritual.protectedLiterals);
  const glyphs = asArray(ritual.glyphs);
  const warnings = [];
  const hasAll = (text, list) => !list.length ? true : list.every((item) => text.includes(item));
  const requiredHits = entries.filter((entry) => hasAll(entry.text, required)).length;
  const optionalHits = entries.filter((entry) => optional.some((item) => entry.text.includes(item))).length;
  const protectedHits = entries.reduce((sum, entry) => sum + protectedLiterals.filter((literal) => literal && entry.text.includes(literal)).length, 0);
  const protectedPossible = Math.max(protectedLiterals.length * entries.length, 1);
  const glyphsObserved = unique(entries.flatMap((entry) => glyphs.filter((glyph) => glyph && entry.text.includes(glyph))), entries.flatMap((entry) => entry.markers?.glyphsObserved || []));
  const khonaLitPo = { intact: 0, normalized: 0, broken: 0, absent: 0 };
  for (const entry of entries) {
    const status = entry.markers?.khonaLitPoStatus || analyzeKhonaLitPoIntegrity(entry.text).status;
    if (khonaLitPo[status] !== undefined) khonaLitPo[status] += 1;
  }
  const requiredMarkerRate = entries.length && required.length ? requiredHits / entries.length : required.length ? 0 : 1;
  const optionalMarkerRate = entries.length && optional.length ? optionalHits / entries.length : optional.length ? 0 : 1;
  const protectedLiteralRate = protectedLiterals.length ? protectedHits / protectedPossible : 1;
  if (required.length && requiredMarkerRate < 1) warnings.push('required-marker-missing');
  if (protectedLiterals.length && protectedLiteralRate < 0.9) warnings.push('protected-literal-memory-drift');
  if (ritual.khonaLitPoRequired && (khonaLitPo.broken > 0 || khonaLitPo.normalized > 0 || khonaLitPo.absent > 0)) warnings.push('khona-lit-po-memory-drift');
  if (glyphs.length && entries.length && glyphsObserved.length === 0) warnings.push('glyph-surface-unstable');
  return { requiredMarkerRate: round(requiredMarkerRate), optionalMarkerRate: round(optionalMarkerRate), protectedLiteralRate: round(protectedLiteralRate), glyphsObserved, khonaLitPo, warnings };
}

export function computeIngestionPosture(entries = []) {
  const audits = entries.map((entry) => entry.ingestionAudit || {}).filter((audit) => Object.keys(audit).length);
  if (!audits.length) return { meanIngestionFriction: null, maxIngestionFriction: null, normalizationMutationRate: 0, hiddenMarkRate: 0, zwnjRate: 0, puaRate: 0, parserSensitiveMean: 0, highFrictionCount: 0, warnings: [] };
  const frictions = audits.map((audit) => audit.ingestionFriction).filter(Number.isFinite);
  const mean = frictions.length ? frictions.reduce((a, b) => a + b, 0) / frictions.length : null;
  const max = frictions.length ? Math.max(...frictions) : null;
  const n = audits.length;
  const normalizationMutationRate = audits.filter((audit) => audit.normalization?.nfcChanged || audit.normalization?.nfkcChanged).length / n;
  const hiddenMarkRate = audits.filter((audit) => (audit.unicodeSurface?.hiddenMarkCount || 0) > 0).length / n;
  const zwnjRate = audits.filter((audit) => (audit.unicodeSurface?.zwnjCount || 0) > 0).length / n;
  const puaRate = audits.filter((audit) => (audit.unicodeSurface?.puaCount || audit.unicodeSurface?.astralSymbolCount || 0) > 0).length / n;
  const parserSensitiveMean = audits.reduce((sum, audit) => sum + (audit.parserSensitive?.spanCount || 0), 0) / n;
  const highFrictionCount = frictions.filter((value) => value >= 0.55).length;
  const warnings = [];
  if ((Number.isFinite(mean) && mean >= 0.45) || highFrictionCount > 0) warnings.push('persona-ingestion-friction-high');
  if (normalizationMutationRate >= 0.34) warnings.push('persona-normalization-instability');
  if (parserSensitiveMean >= 2) warnings.push('persona-parser-sensitive-density-high');
  return { meanIngestionFriction: round(mean), maxIngestionFriction: round(max), normalizationMutationRate: round(normalizationMutationRate), hiddenMarkRate: round(hiddenMarkRate), zwnjRate: round(zwnjRate), puaRate: round(puaRate), parserSensitiveMean: round(parserSensitiveMean), highFrictionCount, warnings };
}

export function computePersonaLinkabilityState(memory = {}) {
  const entries = asArray(memory.memory?.entries || memory.entries);
  if (!entries.length) return { entryCount: 0, meanPairwiseSimilarity: null, maxPairwiseSimilarity: null, recentCentroidFit: null, overuseRisk: 0, status: 'empty', warnings: [] };
  if (entries.length < 3) return { entryCount: entries.length, meanPairwiseSimilarity: null, maxPairwiseSimilarity: null, recentCentroidFit: null, overuseRisk: 0, status: 'underfit', warnings: ['persona-history-underfit'] };
  const pairs = [];
  for (let i = 0; i < entries.length; i += 1) for (let j = i + 1; j < entries.length; j += 1) {
    const sim = compareEntryTexts(entries[i], entries[j]);
    if (Number.isFinite(sim)) pairs.push(sim);
  }
  const meanPairwiseSimilarity = pairs.length ? pairs.reduce((a, b) => a + b, 0) / pairs.length : null;
  const maxPairwiseSimilarity = pairs.length ? Math.max(...pairs) : null;
  const recent = entries[entries.length - 1];
  const prior = entries.slice(0, -1);
  const recentScores = prior.map((entry) => compareEntryTexts(recent, entry)).filter(Number.isFinite);
  const recentCentroidFit = recentScores.length ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length : null;
  const overuseRisk = clip((0.45 * (meanPairwiseSimilarity || 0)) + (0.35 * (maxPairwiseSimilarity || 0)) + (0.20 * (recentCentroidFit || 0)));
  const warnings = [];
  if (overuseRisk >= 0.72 || (maxPairwiseSimilarity || 0) >= 0.88) warnings.push('persona-overfit-risk', 'persona-linkability-high', 'persona-rotation-recommended');
  const status = warnings.includes('persona-overfit-risk') ? 'overfit-risk' : 'usable';
  return { entryCount: entries.length, meanPairwiseSimilarity: round(meanPairwiseSimilarity), maxPairwiseSimilarity: round(maxPairwiseSimilarity), recentCentroidFit: round(recentCentroidFit), overuseRisk: round(overuseRisk), status, warnings: unique(warnings) };
}

export function computeOntologyField(memory = {}) {
  const ontology = memory.ontology || {};
  return { role: ontology.role || '', targetContexts: asArray(ontology.targetContexts), registerHints: asArray(ontology.registerHints), belongingNotes: asArray(ontology.belongingNotes), prohibitedUses: unique(DEFAULT_PROHIBITED_USES, asArray(ontology.prohibitedUses)), modeAffinity: asArray(memory.surface?.modeAffinity).length ? asArray(memory.surface.modeAffinity) : [...DEFAULT_MODE_AFFINITY] };
}

function deriveInternalField(memory) {
  const entries = memory.memory?.entries || [];
  const centroid = computePersonaCentroid(entries);
  const variance = computePersonaVariance(entries, centroid);
  const tolerance = computeTolerance(variance);
  const ritual = computeRitualSurface(entries, memory);
  const ingestion = computeIngestionPosture(entries);
  const linkability = computePersonaLinkabilityState({ ...memory, memory: { ...memory.memory, entries } });
  const ontology = computeOntologyField(memory);
  const history = entries.map((entry) => ({ id: entry.id, text: entry.text, profile: entry.profile, scores: entry.scores, markers: entry.markers, createdAt: entry.createdAt }));
  return { centroid, variance, tolerance, history, ritual, ingestion, linkability, ontology };
}

function buildPersonaDiagnostics(memory) {
  const entries = memory.memory?.entries || [];
  const link = memory.field?.linkability || computePersonaLinkabilityState(memory);
  const warnings = unique(entries.length && entries.length < 3 ? ['persona-history-underfit'] : [], memory.field?.ritual?.warnings || [], memory.field?.ingestion?.warnings || [], link?.warnings || []);
  return { status: defaultMemoryStatus(entries, link), warnings };
}

export function appendAcceptedOutput(memory = {}, accepted = {}) {
  const base = normalizePersonaMemory(memory);
  const entry = normalizePersonaEntry(accepted, base);
  if (!entry.text && !entry.profile) return base;
  const entries = prunePersonaHistory([...base.memory.entries, entry], { maxEntries: base.memory.maxEntries });
  const next = clone(base);
  next.memory.entries = entries;
  next.memory.acceptedCount = (base.memory.acceptedCount || 0) + 1;
  next.memory.lastAcceptedAt = entry.createdAt;
  next.field = deriveInternalField(next);
  next.diagnostics = buildPersonaDiagnostics(next);
  return next;
}

export function derivePersonaField(memory = {}) {
  const normalized = normalizePersonaMemory(memory);
  return {
    personaId: normalized.personaId,
    label: normalized.label,
    displayName: normalized.displayName,
    maskProfile: normalized.field.centroid,
    maskHistory: normalized.field.history,
    maskField: { centroid: normalized.field.centroid, variance: normalized.field.variance, tolerance: normalized.field.tolerance, ritual: normalized.field.ritual, ingestion: normalized.field.ingestion, linkability: normalized.field.linkability, ontology: normalized.field.ontology },
    diagnostics: normalized.diagnostics
  };
}

export function summarizePersonaMemory(memory = {}) {
  const normalized = normalizePersonaMemory(memory);
  return { personaId: normalized.personaId, label: normalized.label, displayName: normalized.displayName, acceptedCount: normalized.memory.acceptedCount, entryCount: normalized.memory.entries.length, status: normalized.diagnostics.status, warnings: normalized.diagnostics.warnings, field: { centroidFeatureCount: normalized.field.centroid?.featureCount || 0, linkabilityStatus: normalized.field.linkability?.status || 'empty', meanIngestionFriction: normalized.field.ingestion?.meanIngestionFriction ?? null } };
}

export function validatePersonaMemory(memory = {}) {
  const normalized = normalizePersonaMemory(memory);
  return { valid: Boolean(normalized.personaId && normalized.version === 'phase-4'), diagnostics: normalized.diagnostics };
}
