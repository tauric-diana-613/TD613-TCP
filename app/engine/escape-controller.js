export const DEFAULT_CONTROLLER_BANDS = Object.freeze({
  neutralize: { sourceResidualMax: 0.42, maskFitMin: 0.45, maskDeltaMin: 0.15, semanticFidelityMin: 0.82, linkabilityMin: null, linkabilityMax: 0.72, bwcMin: 0.55, ingestionFrictionMax: 0.62, apertureRecaptureMax: 0.50 },
  'stable-pseudonym': { sourceResidualMax: 0.42, maskFitMin: 0.58, maskDeltaMin: 0.15, semanticFidelityMin: 0.82, linkabilityMin: 0.25, linkabilityMax: 0.72, bwcMin: 0.62, ingestionFrictionMax: 0.62, apertureRecaptureMax: 0.50 },
  'rotating-mask': { sourceResidualMax: 0.38, maskFitMin: 0.48, maskDeltaMin: 0.18, semanticFidelityMin: 0.82, linkabilityMin: null, linkabilityMax: 0.38, bwcMin: 0.52, ingestionFrictionMax: 0.58, apertureRecaptureMax: 0.46 },
  'hostile-pipeline-compression': { sourceResidualMax: 0.36, maskFitMin: 0.35, maskDeltaMin: 0.12, semanticFidelityMin: 0.90, linkabilityMin: null, linkabilityMax: 0.68, bwcMin: 0.45, ingestionFrictionMax: 0.35, apertureRecaptureMax: 0.42 }
});

const WEIGHTS = { sourceResidual: 0.22, semantic: 0.20, maskDelta: 0.16, maskFit: 0.12, ingestion: 0.10, recapture: 0.10, bwc: 0.06, linkability: 0.04 };
const MODE_WEIGHTS = {
  'hostile-pipeline-compression': { sourceResidual: 0.18, semantic: 0.28, maskDelta: 0.12, maskFit: 0.08, ingestion: 0.18, recapture: 0.08, bwc: 0.04, linkability: 0.04 },
  'rotating-mask': { sourceResidual: 0.20, semantic: 0.18, maskDelta: 0.14, maskFit: 0.10, ingestion: 0.10, recapture: 0.10, bwc: 0.06, linkability: 0.12 }
};
const REQUIRED = ['missing-protected-baseline', 'missing-mask', 'missing-output'];
const SEMANTIC = ['semantic-fidelity-low', 'protected-literal-missing', 'protected-literal-broken', 'anchor-drift'];
const clamp = (n) => Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : null;
const round = (n) => Number.isFinite(n) ? Number(n.toFixed(6)) : null;
const score = (v, k) => Number.isFinite(v?.scores?.[k]) ? v.scores[k] : null;
const warningsOf = (v) => Array.isArray(v?.diagnostics?.warnings) ? v.diagnostics.warnings : [];
const anyWarn = (v, list) => list.some((w) => warningsOf(v).includes(w));
const unique = (...x) => [...new Set(x.flat().filter(Boolean))];

function weighted(parts, weights) {
  let total = 0; let weight = 0;
  for (const [key, value] of Object.entries(parts)) {
    if (!Number.isFinite(value) || !Number.isFinite(weights[key]) || weights[key] <= 0) continue;
    total += value * weights[key]; weight += weights[key];
  }
  return weight ? clamp(total / weight) : 0;
}
function gap(n, max) { return Number.isFinite(n) && Number.isFinite(max) ? Math.max(0, n - max) : 0; }
function shortfall(n, min) { return Number.isFinite(n) && Number.isFinite(min) ? Math.max(0, min - n) : 0; }

export function normalizeControllerInput(input = {}) {
  const vector = input.vector || input.escapeVector || {};
  const mode = input.mode || vector.mode || 'neutralize';
  return {
    vector,
    mode,
    operatorIntent: input.operatorIntent || {},
    iterationContext: { iteration: 0, maxIterations: 6, previousState: '', priorDecisions: [], lastAction: '', ...(input.iterationContext || {}) },
    thresholds: input.thresholds || {}
  };
}

export function deriveControllerBands(input = {}) {
  const mode = input.mode || input.vector?.mode || 'neutralize';
  return { ...(DEFAULT_CONTROLLER_BANDS[mode] || DEFAULT_CONTROLLER_BANDS.neutralize), ...(input.thresholds || input.operatorIntent?.thresholds || {}) };
}

function linkabilityError(vector, bands, mode) {
  const l = score(vector, 'maskLinkability');
  if (!Number.isFinite(l)) return 0;
  if (mode === 'stable-pseudonym') return clamp(Math.max(Number.isFinite(bands.linkabilityMin) ? bands.linkabilityMin - l : 0, Number.isFinite(bands.linkabilityMax) ? l - bands.linkabilityMax : 0));
  return Number.isFinite(bands.linkabilityMax) ? clamp(Math.max(0, l - bands.linkabilityMax)) : 0;
}

export function computeControlError(vector = {}, bands = {}, mode = vector.mode || 'neutralize') {
  const delta = score(vector, 'maskDeltaSafe') ?? score(vector, 'maskDeltaRaw');
  const parts = {
    sourceResidual: gap(score(vector, 'sourceResidualRisk'), bands.sourceResidualMax),
    maskFit: shortfall(score(vector, 'maskFit'), bands.maskFitMin),
    maskDelta: shortfall(delta, bands.maskDeltaMin),
    semantic: shortfall(score(vector, 'semanticFidelity'), bands.semanticFidelityMin),
    linkability: linkabilityError(vector, bands, mode),
    bwc: shortfall(score(vector, 'belongingWithoutCollapse'), bands.bwcMin),
    ingestion: gap(score(vector, 'ingestionFriction'), bands.ingestionFrictionMax),
    recapture: gap(score(vector, 'apertureRecaptureRisk'), bands.apertureRecaptureMax)
  };
  const weights = { ...WEIGHTS, ...(MODE_WEIGHTS[mode] || {}) };
  return Object.fromEntries([...Object.entries(parts).map(([k, v]) => [k, round(v)]), ['total', round(weighted(parts, weights))]]);
}

function makeAction(code, priority, targetMetric, rationale) { return { code, priority, targetMetric, rationale }; }

export function deriveSteeringActions(input = {}) {
  const vector = input.vector || {};
  const mode = input.mode || vector.mode || 'neutralize';
  const bands = input.bands || deriveControllerBands({ ...input, mode, vector });
  const e = input.controlError || computeControlError(vector, bands, mode);
  const actions = [];
  const w = warningsOf(vector);
  if (anyWarn(vector, SEMANTIC) || e.semantic > 0) {
    actions.push(makeAction('restore-protected-literals', 'critical', 'semanticFidelity', 'Restore literals, dates, numbers, and anchors before changing cadence further.'));
    actions.push(makeAction('repair-semantics', 'critical', 'semanticFidelity', 'Meaning preservation is weaker than the current style movement.'));
  }
  if (e.sourceResidual > 0) {
    actions.push(makeAction('dampen-source-connectors', 'high', 'sourceResidualRisk', 'Source residual risk exceeds the allowed band.'));
    actions.push(makeAction('dampen-source-punctuation', 'medium', 'sourceResidualRisk', 'Shift punctuation density and finish away from the protected baseline.'));
  }
  if (e.maskDelta > 0 || e.maskFit > 0) actions.push(makeAction('increase-mask-pressure', e.maskDelta > 0 ? 'high' : 'medium', 'maskDeltaSafe', 'Move sentence length, connector stance, contraction posture, and punctuation finish toward the selected Persona field.'));
  if (mode === 'rotating-mask' && e.linkability > 0) actions.push(makeAction('rotate-persona', 'high', 'maskLinkability', 'Current Persona surface is becoming too indexable for rotating-mask mode.'));
  if (e.ingestion > 0 || w.some((x) => ['normalization-mutates-text', 'nfkc-mutates-text', 'high-ingestion-friction'].includes(x))) actions.push(makeAction('lower-ingestion-risk', mode === 'hostile-pipeline-compression' ? 'high' : 'medium', 'ingestionFriction', 'Reduce normalization-sensitive marks or parser-sensitive spans unless intentionally required.'));
  if (e.recapture > 0) actions.push(makeAction('reduce-recapture-pressure', 'high', 'apertureRecaptureRisk', 'Aperture recapture pressure exceeds the allowed band.'));
  if (e.bwc > 0) actions.push(makeAction('improve-bwc', 'medium', 'belongingWithoutCollapse', 'Improve situated legibility without collapsing into the protected baseline.'));
  return actions.length ? actions : [makeAction('seal-output', 'low', 'all', 'All available bands are satisfied under bounded local assumptions.')];
}

function bandsSatisfied(vector, bands, mode) {
  const e = computeControlError(vector, bands, mode);
  const delta = score(vector, 'maskDeltaSafe') ?? score(vector, 'maskDeltaRaw');
  return Number.isFinite(score(vector, 'sourceResidualRisk')) && score(vector, 'sourceResidualRisk') <= bands.sourceResidualMax
    && Number.isFinite(score(vector, 'maskFit')) && score(vector, 'maskFit') >= bands.maskFitMin
    && Number.isFinite(delta) && delta >= bands.maskDeltaMin
    && Number.isFinite(score(vector, 'semanticFidelity')) && score(vector, 'semanticFidelity') >= bands.semanticFidelityMin
    && (!Number.isFinite(score(vector, 'belongingWithoutCollapse')) || score(vector, 'belongingWithoutCollapse') >= bands.bwcMin)
    && (!Number.isFinite(score(vector, 'ingestionFriction')) || score(vector, 'ingestionFriction') <= bands.ingestionFrictionMax)
    && (!Number.isFinite(score(vector, 'apertureRecaptureRisk')) || score(vector, 'apertureRecaptureRisk') <= bands.apertureRecaptureMax)
    && e.linkability === 0;
}

export function summarizeControllerReasons(input = {}) {
  const vector = input.vector || {};
  const mode = input.mode || vector.mode || 'neutralize';
  const bands = input.bands || deriveControllerBands({ ...input, mode, vector });
  const e = input.controlError || computeControlError(vector, bands, mode);
  const state = input.state || '';
  const reasons = [];
  if (anyWarn(vector, REQUIRED) || vector?.diagnostics?.sampleSufficiency === 'unavailable') reasons.push('required-surface-missing');
  if (vector?.diagnostics?.sampleSufficiency === 'weak') reasons.push('sample-sufficiency-weak');
  if (anyWarn(vector, SEMANTIC) || e.semantic > 0) reasons.push('semantic-repair-required');
  if (e.sourceResidual > 0) reasons.push('source-residual-above-band');
  if (e.maskDelta > 0) reasons.push('mask-delta-below-band');
  if (e.maskFit > 0) reasons.push('mask-fit-below-band');
  if (mode === 'rotating-mask' && e.linkability > 0) reasons.push('mask-linkability-above-rotating-band');
  if (mode === 'stable-pseudonym' && e.linkability > 0) reasons.push('mask-linkability-outside-stable-band');
  if (e.ingestion > 0) reasons.push('ingestion-friction-above-band');
  if (e.recapture > 0) reasons.push('aperture-recapture-above-band');
  if (e.bwc > 0) reasons.push('belonging-without-collapse-below-band');
  if (state === 'seal') reasons.push('all-controller-bands-satisfied');
  return unique(reasons);
}

export function classifyControllerState(input = {}) {
  const vector = input.vector || {};
  const mode = input.mode || vector.mode || 'neutralize';
  const bands = input.bands || deriveControllerBands({ ...input, mode, vector });
  const e = input.controlError || computeControlError(vector, bands, mode);
  const ctx = input.iterationContext || {};
  const intent = input.operatorIntent || {};
  if (anyWarn(vector, REQUIRED) || vector?.diagnostics?.sampleSufficiency === 'unavailable' || (ctx.iteration ?? 0) >= (ctx.maxIterations ?? 6)) return { state: 'hold', action: 'hold-for-review' };
  if (vector?.diagnostics?.sampleSufficiency === 'weak' && e.total > 0.10) return { state: 'hold', action: 'hold-for-review' };
  if (anyWarn(vector, SEMANTIC) || e.semantic > 0) return { state: 'restore', action: 'repair-semantics' };
  if (mode === 'rotating-mask' && e.linkability > 0) return { state: 'rotate', action: 'rotate-persona' };
  if (e.recapture >= 0.16) return { state: 'hold', action: 'hold-for-review' };
  if (e.ingestion >= 0.24 && !intent.allowHighFriction) return { state: 'hold', action: 'hold-for-review' };
  if (bandsSatisfied(vector, bands, mode)) return { state: 'seal', action: 'seal-output' };
  if (e.sourceResidual > 0) return { state: 'continue', action: 'neutralize-source' };
  if (e.maskDelta > 0 || e.maskFit > 0) return { state: 'continue', action: 'increase-mask-pressure' };
  if (e.ingestion > 0) return { state: 'continue', action: 'lower-ingestion-risk' };
  if (e.recapture > 0) return { state: 'continue', action: 'reduce-recapture-pressure' };
  if (e.bwc > 0) return { state: 'continue', action: 'improve-bwc' };
  return { state: 'hold', action: 'hold-for-review' };
}

function instructionFor(action) {
  return {
    'repair-semantics': 'Restore protected literals, dates, numbers, named anchors, and claim meaning before further style movement.',
    'neutralize-source': 'Dampen protected-baseline connector habits, sentence rhythm, and punctuation finish while preserving content.',
    'increase-mask-pressure': 'Increase Persona-field pressure on sentence length, connector stance, contraction posture, and punctuation finish.',
    'lower-ingestion-risk': 'Reduce normalization-sensitive marks, unstable glyph boundaries, or parser-sensitive spans unless intentionally required.',
    'rotate-persona': 'Rotate Persona field before continuing. Current mask surface is becoming too indexable for this mode.',
    'reduce-recapture-pressure': 'Reduce closure pressure and route through a lower-recapture posture before continuing.',
    'seal-output': 'Hold this output as locally sealable under bounded assumptions and preserve non-guarantee language.',
    'hold-for-review': 'Hold for operator review before further transformation.'
  }[action] || 'Hold for operator review before further transformation.';
}

export function buildSteeringPacket(decision = {}) {
  const state = decision.state || 'hold';
  const action = decision.action || 'hold-for-review';
  const reasons = Array.isArray(decision.reasons) ? decision.reasons : [];
  return {
    summary: `${state}: ${reasons.length ? reasons.join(', ') : 'controller decision requires operator review'}.`,
    nextInstruction: instructionFor(action),
    constraints: [
      'Preserve protected literals, dates, numbers, and named anchors.',
      'Keep semantic fidelity above the active mode floor.',
      'Treat local scores as bounded measurements, not certainty claims.'
    ],
    forbiddenMoves: [
      'Do not erase facts to improve Persona fit.',
      'Do not treat high ingestion friction as safety by itself.',
      'Do not infer identity from style contact.',
      'Do not promise platform behavior from local measurements.'
    ]
  };
}

export function buildEscapeControllerDecision(input = {}) {
  const normalized = normalizeControllerInput(input);
  const bands = deriveControllerBands(normalized);
  const controlError = computeControlError(normalized.vector, bands, normalized.mode);
  const classified = classifyControllerState({ ...normalized, bands, controlError });
  const reasons = summarizeControllerReasons({ ...normalized, bands, controlError, state: classified.state });
  const steeringActions = deriveSteeringActions({ ...normalized, bands, controlError });
  const warnings = unique(
    warningsOf(normalized.vector).filter((w) => w.includes('missing') || w.includes('low') || w.includes('high') || w.includes('mutates') || w.includes('friction') || w.includes('recapture')),
    classified.state === 'hold' ? ['controller-hold'] : [],
    classified.state === 'restore' ? ['controller-restore'] : [],
    classified.state === 'rotate' ? ['controller-rotate'] : []
  );
  const decision = {
    version: 'phase-3',
    state: classified.state,
    action: classified.action,
    confidence: round(1 - (controlError.total || 0)),
    controlError,
    bands,
    reasons,
    warnings,
    steeringActions
  };
  return { ...decision, steeringPacket: buildSteeringPacket(decision) };
}
