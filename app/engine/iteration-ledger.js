const HASH_ALGORITHM = 'fnv1a-32-local';
const CANONICAL_TOKENS = Object.freeze({ khonaLitPo: 'Khona\u200Clit-po', glyphs: ['𝌋', '⟐'] });

const asArray = (value) => Array.isArray(value) ? [...value] : [];
const clone = (value) => value && typeof value === 'object' ? JSON.parse(JSON.stringify(value)) : value;
const unique = (...groups) => [...new Set(groups.flat().filter(Boolean))];
const safeString = (value) => value == null ? '' : String(value);
const score = (vector = {}, key) => Number.isFinite(vector?.scores?.[key]) ? vector.scores[key] : null;

export function hashLedgerText(text = '') {
  // Local deterministic row hash, not a custody signature.
  let hash = 2166136261;
  for (const char of safeString(text)) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function buildReproducibilityMetadata(input = {}) {
  return {
    environment: input.environment || (typeof window === 'undefined' ? 'node' : 'browser'),
    engineVersion: 'phase-6',
    localOnly: true,
    generatedAt: input.generatedAt ?? null,
    sourceTextIncluded: Boolean(input.includeTexts || input.includeProtectedBaseline),
    outputTextIncluded: Boolean(input.includeTexts || input.includeProtectedOutput),
    hashAlgorithm: HASH_ALGORITHM,
    selectedMode: input.mode || input.context?.mode || 'neutralize',
    selectedPersonaId: input.selectedPersonaId || input.context?.selectedPersonaId || '',
    selectedPersonaLabel: input.selectedPersonaLabel || input.context?.selectedPersonaLabel || '',
    canonicalTokens: clone(input.canonicalTokens || CANONICAL_TOKENS),
    note: 'Local hashes support reproducibility and row identity only.'
  };
}

function diagnosticsFor(ledger = {}) {
  const rows = asArray(ledger.rows);
  const acceptedIds = asArray(ledger.accepted?.iterationIds);
  const warnings = [];
  if (rows.some((row) => Object.values(row.textIncluded || {}).some(Boolean))) warnings.push('private-text-included');
  return { rowCount: rows.length, acceptedCount: acceptedIds.length, warnings };
}

export function createIterationLedger(input = {}) {
  const context = {
    benchVersion: input.context?.benchVersion || 'phase-5',
    mode: input.context?.mode || input.mode || 'neutralize',
    selectedPersonaId: input.context?.selectedPersonaId || input.selectedPersonaId || '',
    selectedPersonaLabel: input.context?.selectedPersonaLabel || input.selectedPersonaLabel || '',
    targetContext: input.context?.targetContext || input.targetContext || '',
    operatorIntent: input.context?.operatorIntent || input.operatorIntent || ''
  };
  const ledger = {
    version: 'phase-6',
    ledgerId: input.ledgerId || `ledger-${hashLedgerText(JSON.stringify(context))}`,
    createdAt: input.createdAt ?? null,
    updatedAt: input.updatedAt ?? null,
    context,
    reproducibility: buildReproducibilityMetadata({ ...input, context }),
    rows: [],
    accepted: { iterationIds: [], latestAcceptedIterationId: null },
    diagnostics: { rowCount: 0, acceptedCount: 0, warnings: [] }
  };
  return normalizeIterationLedger(ledger);
}

export function normalizeIterationLedger(ledger = {}) {
  if (!ledger.version) return createIterationLedger(ledger);
  const normalized = clone(ledger);
  normalized.version = 'phase-6';
  normalized.context = { benchVersion: 'phase-5', mode: 'neutralize', selectedPersonaId: '', selectedPersonaLabel: '', targetContext: '', operatorIntent: '', ...(normalized.context || {}) };
  normalized.ledgerId = normalized.ledgerId || `ledger-${hashLedgerText(JSON.stringify(normalized.context))}`;
  normalized.reproducibility = { ...buildReproducibilityMetadata({ context: normalized.context }), ...(normalized.reproducibility || {}) };
  normalized.rows = asArray(normalized.rows);
  normalized.accepted = { iterationIds: asArray(normalized.accepted?.iterationIds), latestAcceptedIterationId: normalized.accepted?.latestAcceptedIterationId || null };
  normalized.diagnostics = diagnosticsFor(normalized);
  return normalized;
}

export function deriveChangedDimensions(input = {}) {
  const vector = input.escapeVector || {};
  const ingestion = input.ingestionAudit || {};
  const decision = input.controllerDecision || {};
  const out = [];
  if (score(vector, 'sourceResidualRisk') >= 0.55) out.push('source-residual-high');
  if (score(vector, 'maskFit') >= 0.6) out.push('mask-fit-improved');
  if (score(vector, 'semanticFidelity') !== null && score(vector, 'semanticFidelity') < 0.82) out.push('semantic-fidelity-low');
  if (score(vector, 'ingestionFriction') >= 0.55 || ingestion.ingestionFriction >= 0.55) out.push('ingestion-friction-high');
  if (score(vector, 'apertureRecaptureRisk') >= 0.5) out.push('aperture-recapture-high');
  if (score(vector, 'maskLinkability') >= 0.72) out.push('mask-linkability-high');
  if (score(vector, 'maskDrift') >= 0.55) out.push('mask-drift-high');
  if (score(vector, 'belongingWithoutCollapse') !== null && score(vector, 'belongingWithoutCollapse') < 0.5) out.push('bwc-low');
  if (decision.state === 'hold') out.push('controller-hold');
  if (decision.state === 'restore') out.push('controller-restore');
  if (decision.state === 'seal') out.push('controller-seal');
  return unique(out);
}

function includeFlag(input, flag) { return Boolean(input.includeTexts || input[flag]); }

export function createIterationRow(input = {}) {
  const t = Number.isFinite(input.t) ? input.t : 0;
  const baseline = safeString(input.protectedBaselineText);
  const mask = safeString(input.maskReferenceText);
  const draft = safeString(input.messageDraftText);
  const output = safeString(input.protectedOutputText);
  const vector = input.escapeVector || {};
  const decision = input.controllerDecision || {};
  const personaSummary = input.personaSummary || {};
  const personaField = input.personaField || {};
  const textIncluded = {
    protectedBaseline: includeFlag(input, 'includeProtectedBaseline'),
    maskReference: includeFlag(input, 'includeMaskReference'),
    messageDraft: includeFlag(input, 'includeMessageDraft'),
    protectedOutput: includeFlag(input, 'includeProtectedOutput')
  };
  const state = decision.state || 'unknown';
  return {
    id: input.id || `iter-${hashLedgerText([t, baseline, mask, draft, output, state, decision.action || ''].join('|'))}`,
    t,
    createdAt: input.createdAt ?? null,
    hashes: { inputHash: hashLedgerText([baseline, mask, draft].join('|')), draftHash: hashLedgerText(draft), outputHash: hashLedgerText(output), baselineHash: hashLedgerText(baseline), maskHash: hashLedgerText(mask) },
    textIncluded,
    texts: { protectedBaseline: textIncluded.protectedBaseline ? baseline : null, maskReference: textIncluded.maskReference ? mask : null, messageDraft: textIncluded.messageDraft ? draft : null, protectedOutput: textIncluded.protectedOutput ? output : null },
    persona: { personaId: personaField.personaId || personaSummary.personaId || '', label: personaField.label || personaSummary.label || '', memoryStatus: personaSummary.status || personaField.diagnostics?.status || '', acceptedCount: Number.isFinite(personaSummary.acceptedCount) ? personaSummary.acceptedCount : null, linkabilityStatus: personaSummary.field?.linkabilityStatus || personaField.maskField?.linkability?.status || '' },
    scores: { sourceResidualRisk: score(vector, 'sourceResidualRisk'), maskFit: score(vector, 'maskFit'), maskDeltaSafe: score(vector, 'maskDeltaSafe'), semanticFidelity: score(vector, 'semanticFidelity'), belongingWithoutCollapse: score(vector, 'belongingWithoutCollapse'), ingestionFriction: score(vector, 'ingestionFriction') ?? input.ingestionAudit?.ingestionFriction ?? null, apertureRecaptureRisk: score(vector, 'apertureRecaptureRisk'), maskLinkability: score(vector, 'maskLinkability'), maskDrift: score(vector, 'maskDrift') },
    controller: { state, action: decision.action || '', confidence: Number.isFinite(decision.confidence) ? decision.confidence : null, reasons: asArray(decision.reasons), warnings: asArray(decision.warnings), steeringActions: clone(asArray(decision.steeringActions)), nextInstruction: decision.steeringPacket?.nextInstruction || '' },
    changedDimensions: deriveChangedDimensions(input),
    status: { held: state === 'hold', sealed: state === 'seal', accepted: false, acceptEligible: ['seal', 'continue'].includes(state) },
    references: { escapeVectorId: vector.id || null, ingestionAuditId: input.ingestionAudit?.id || null, controllerDecisionId: decision.id || null, personaMemoryEntryId: null }
  };
}

export function appendIterationRow(ledger = {}, rowInput = {}) {
  const base = normalizeIterationLedger(ledger);
  const row = createIterationRow({ ...rowInput, t: Number.isFinite(rowInput.t) ? rowInput.t : base.rows.length });
  const next = clone(base);
  next.rows = [...base.rows, row];
  next.updatedAt = row.createdAt ?? base.updatedAt;
  next.diagnostics = diagnosticsFor(next);
  return next;
}

export function linkAcceptedOutputToIteration(ledger = {}, input = {}) {
  const base = normalizeIterationLedger(ledger);
  if (!input.iterationId) return { ...base, diagnostics: { ...base.diagnostics, warnings: unique(base.diagnostics.warnings, ['accepted-iteration-id-missing']) } };
  let found = false;
  const rows = base.rows.map((row) => {
    if (row.id !== input.iterationId) return row;
    found = true;
    return { ...row, status: { ...row.status, accepted: true }, acceptedAt: input.acceptedAt ?? null, references: { ...row.references, personaMemoryEntryId: input.personaMemoryEntryId || null } };
  });
  const next = { ...base, rows };
  next.accepted = { iterationIds: found ? unique(base.accepted.iterationIds, [input.iterationId]) : base.accepted.iterationIds, latestAcceptedIterationId: found ? input.iterationId : base.accepted.latestAcceptedIterationId };
  next.diagnostics = diagnosticsFor(next);
  if (!found) next.diagnostics.warnings = unique(next.diagnostics.warnings, ['accepted-iteration-not-found']);
  return next;
}

export function summarizeIterationLedger(ledger = {}) {
  const normalized = normalizeIterationLedger(ledger);
  const latest = normalized.rows[normalized.rows.length - 1] || null;
  return { ledgerId: normalized.ledgerId, rowCount: normalized.rows.length, acceptedCount: normalized.accepted.iterationIds.length, latestState: latest?.controller?.state || 'none', latestOutputHash: latest?.hashes?.outputHash || null, latestAcceptedIterationId: normalized.accepted.latestAcceptedIterationId, textExport: normalized.rows.some((row) => Object.values(row.textIncluded || {}).some(Boolean)) ? 'on' : 'off', warnings: normalized.diagnostics.warnings };
}

export function findIterationById(ledger = {}, id = '') { return normalizeIterationLedger(ledger).rows.find((row) => row.id === id) || null; }
export function redactIterationRow(row = {}, options = {}) { const includeTexts = Boolean(options.includeTexts); return { ...clone(row), texts: includeTexts ? clone(row.texts) : { protectedBaseline: null, maskReference: null, messageDraft: null, protectedOutput: null }, textIncluded: includeTexts ? { protectedBaseline: true, maskReference: true, messageDraft: true, protectedOutput: true } : { protectedBaseline: false, maskReference: false, messageDraft: false, protectedOutput: false } }; }
export function exportIterationLedgerJson(ledger = {}, options = {}) { const normalized = normalizeIterationLedger(ledger); const includeTexts = Boolean(options.includeTexts); const payload = { ...normalized, reproducibility: { ...normalized.reproducibility, sourceTextIncluded: includeTexts, outputTextIncluded: includeTexts, textInclusion: includeTexts ? 'explicit' : 'excluded-by-default' }, rows: normalized.rows.map((row) => redactIterationRow(row, { includeTexts })) }; return JSON.stringify(payload, null, options.pretty === false ? 0 : 2); }
export function computeLedgerHash(ledger = {}, options = {}) { return hashLedgerText(exportIterationLedgerJson(ledger, { ...options, includeTexts: false, pretty: false })); }
export function validateIterationLedger(ledger = {}) { const normalized = normalizeIterationLedger(ledger); return { valid: normalized.version === 'phase-6' && Array.isArray(normalized.rows), diagnostics: normalized.diagnostics }; }
