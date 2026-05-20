import { buildCadenceTransfer, extractCadenceProfile } from './stylometry.js';
import { buildEscapeVector } from './escape-vector.js';
import { buildIngestionFrictionAudit } from './ingestion-friction.js';
import { buildEscapeControllerDecision } from './escape-controller.js';
import { evaluateClaimCeiling } from './claim-ladder.js';
import { buildContextProfile } from './context-profile.js';
import { buildRecognitionField } from './recognition-field.js';
import { buildProfileMatch, summarizeProfileMatch } from './hush-profile-match.js';
import { buildResidualVector, summarizeResidualVector } from './hush-residual-vector.js';
import { buildProtectedLiteralLockbox, verifyProtectedLiteralLockbox, summarizeProtectedLiteralLockbox } from './hush-protected-literal-lockbox.js';
import { buildSteeringPlan, scoreCandidateWithSteering, summarizeSteeringPlan } from './hush-steering-plan.js';
import { buildMaskLifecycle, summarizeMaskLifecycle } from './hush-mask-lifecycle.js';
import { exportHushPolicyJson } from './hush-export-policy.js';
import { buildMeaningPlan } from './hush-meaning-plan.js';
import { buildRealizationPlan } from './hush-realization-plan.js';
import { generateMaskWriterCandidates } from './hush-mask-writer.js';
import { scoreNaturalness, summarizeNaturalness } from './hush-naturalness.js';
import { cleanHushCandidates, summarizeCleanroom } from './hush-candidate-cleanroom.js';
import { buildReleasePolicy, summarizeReleasePolicy } from './hush-release-policy.js';
import { buildSourceResidue, scoreSourceResidue, summarizeSourceResidue } from './hush-source-residue.js';
import { buildClaimRoleMap, summarizeClaimRoleMap } from './hush-claim-roles.js';
import { buildLiteralPlacementMap, repairLiteralPlacement, summarizeLiteralPlacement } from './hush-literal-placement.js';
import { buildSyntaxPlan, summarizeSyntaxPlan } from './hush-syntax-plan.js';
import { generateSyntaxRecomposerCandidates } from './hush-syntax-recomposer.js';
import { buildSyntaxShift, scoreSyntaxShift, summarizeSyntaxShift } from './hush-syntax-shift.js';
import { verifyClaimIntegrity, summarizeClaimIntegrity } from './hush-claim-integrity.js';

export const HUSH_SWAP_VERSION = 'phase-19';

const safeText = (value) => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? [...value] : [];
const clamp = (value, min = 0, max = 1) => Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : 0;
const round = (value, digits = 4) => Number.isFinite(value) ? Number(value.toFixed(digits)) : 0;
const unique = (values = []) => [...new Set(asArray(values).filter(Boolean))];

function extractProtectedLiterals(text = '') {
  return [...new Set([
    ...(safeText(text).match(/\b(?:EXHIBIT|DOC|CASE|ID|REF|TD613|SHI|SAC)[A-Z0-9:_#\/-]*\b/g) || []),
    ...(safeText(text).match(/\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/g) || []),
    ...(safeText(text).match(/\b\d{4}-\d{2}-\d{2}\b/g) || []),
    ...(safeText(text).match(/\b\d{2,}(?:[\-/:.]\d+)*\b/g) || [])
  ])].slice(0, 32);
}

function literalScore(outputText = '', protectedLiterals = []) {
  const required = asArray(protectedLiterals).filter(Boolean);
  if (!required.length) return 1;
  const kept = required.filter((literal) => safeText(outputText).includes(literal)).length;
  return clamp(kept / required.length);
}

function mutateCandidate(text = '', index = 0, mask = {}, steeringPlan = null) {
  const value = safeText(text).trim();
  if (!value) return '';
  const hot = asArray(steeringPlan?.targetDimensions).map((dim) => dim.key);
  if (index === 1 || hot.includes('avgSentenceLength')) return value.replace(/\s+/g, ' ').replace(/,\s+/g, '. ');
  if (index === 2 || hot.includes('recurrencePressure')) return value.replace(/\b(please|actually|really|just)\b/gi, '').replace(/\s+/g, ' ').trim();
  if (index === 3 || hot.includes('contractionDensity')) return value.replace(/\bI\s+am\b/g, "I'm").replace(/\bdo not\b/gi, "don't").replace(/\bdoes not\b/gi, "doesn't");
  if (index === 4 || hot.includes('lexicalDensity')) return value.replace(/\bI'm\b/gi, 'I am').replace(/\bdon't\b/gi, 'do not').replace(/\bdoesn't\b/gi, 'does not');
  return value;
}

function buildPhase19Plans(input = {}) {
  const sourceText = safeText(input.sourceText);
  const protectedLiterals = asArray(input.protectedLiterals).length ? asArray(input.protectedLiterals) : extractProtectedLiterals(sourceText);
  const meaningPlan = input.meaningPlan || buildMeaningPlan({ sourceText, protectedLiterals });
  const claimRoleMap = input.claimRoleMap || buildClaimRoleMap({ sourceText, meaningPlan, protectedLiterals });
  const literalPlacementMap = input.literalPlacementMap || buildLiteralPlacementMap({ sourceText, meaningPlan, claimRoleMap, protectedLiterals });
  const realizationPlan = input.realizationPlan || buildRealizationPlan({ mask: input.mask || {}, maskProfile: input.maskProfile || input.mask?.profile || {} });
  const seedResidue = input.sourceResidue || buildSourceResidue({ sourceText, outputText: sourceText, protectedLiterals });
  const syntaxPlan = input.syntaxPlan || buildSyntaxPlan({ sourceText, meaningPlan, claimRoleMap, literalPlacementMap, realizationPlan, sourceResidue: seedResidue, mask: input.mask || {} });
  return { protectedLiterals, meaningPlan, claimRoleMap, literalPlacementMap, realizationPlan, syntaxPlan, seedResidue };
}

function mergeCandidatePools(...pools) {
  const seen = new Set();
  const merged = [];
  for (const candidate of pools.flatMap((pool) => asArray(pool))) {
    const text = safeText(candidate.text).replace(/\s+/g, ' ').trim();
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push({ ...candidate, text });
  }
  return merged;
}

function prepareCandidatePool(input = {}) {
  const plans = buildPhase19Plans(input);
  const count = Number(input.count || input.candidateCount || 24);
  const writerCount = Math.max(8, Math.floor(count * 0.45));
  const syntaxCount = Math.max(12, count - writerCount);
  const writerBundle = generateMaskWriterCandidates({ ...input, ...plans, candidateCount: writerCount });
  const syntaxBundle = generateSyntaxRecomposerCandidates({ ...input, ...plans, candidateCount: syntaxCount });
  const raw = mergeCandidatePools(
    asArray(writerBundle.candidates).map((candidate) => ({ ...candidate, source: 'mask-writer' })),
    asArray(syntaxBundle.candidates).map((candidate) => ({ ...candidate, source: 'syntax-recomposer' }))
  );
  const placementRepaired = raw.map((candidate) => {
    const repaired = repairLiteralPlacement({ text: candidate.text, literalPlacementMap: plans.literalPlacementMap, protectedLiterals: plans.protectedLiterals });
    return {
      ...candidate,
      text: repaired.text,
      literalPlacement: repaired,
      operations: unique([...asArray(candidate.operations), ...asArray(repaired.operations)]),
      warnings: unique([...asArray(candidate.warnings), ...asArray(repaired.warnings)])
    };
  });
  const cleanroom = cleanHushCandidates({ candidates: placementRepaired, meaningPlan: plans.meaningPlan, realizationPlan: plans.realizationPlan, protectedLiterals: plans.protectedLiterals, mask: input.mask, literalPlacementMap: plans.literalPlacementMap });
  return { ...plans, writerBundle, syntaxBundle, cleanroom, candidates: asArray(cleanroom.candidates) };
}

export function generateHushSwapCandidate(input = {}) {
  const sourceText = safeText(input.sourceText);
  const writerCandidate = input.writerCandidate || null;
  const mask = input.mask || {};
  const maskProfile = input.maskProfile || mask.profile || {};
  const index = Number(input.index || 0);
  let candidateText = writerCandidate?.text || (index === 0 ? sourceText : mutateCandidate(sourceText, index, mask, input.steeringPlan));
  if (!writerCandidate) {
    try {
      const transfer = buildCadenceTransfer(candidateText, {
        mode: 'persona',
        profile: maskProfile,
        personaId: mask.id || 'hush-mask',
        label: mask.label || 'Hush Mask',
        strength: Math.max(0.70, (mask.strength || 0.9) - (index * 0.035)),
        mod: mask.mod || null
      });
      candidateText = transfer?.text || candidateText;
    } catch {
      // keep candidate text
    }
  }
  return {
    id: writerCandidate?.id || `candidate-${index + 1}`,
    text: candidateText,
    strategy: writerCandidate?.strategy || writerCandidate?.family || `legacy-${index}`,
    family: writerCandidate?.family || writerCandidate?.strategy || `legacy-${index}`,
    source: writerCandidate?.source || 'legacy-transfer',
    operations: asArray(writerCandidate?.operations),
    writerNaturalness: writerCandidate?.naturalness || null,
    writerWarnings: asArray(writerCandidate?.warnings),
    cleanroom: writerCandidate?.cleanroom || null,
    literalPlacement: writerCandidate?.literalPlacement || null,
    profile: extractCadenceProfile(candidateText)
  };
}

export function scoreHushSwapCandidate(input = {}) {
  const candidate = input.candidate || {};
  const outputText = safeText(candidate.text);
  const sourceText = safeText(input.sourceText);
  const maskProfile = input.maskProfile || input.mask?.profile || {};
  const protectedLiterals = asArray(input.protectedLiterals).length ? asArray(input.protectedLiterals) : extractProtectedLiterals(sourceText);
  const lockbox = input.lockbox || buildProtectedLiteralLockbox({ sourceText, baselineText: input.protectedBaselineText, maskReferenceText: input.maskReferenceText, manualLiterals: protectedLiterals });
  const lockboxVerification = verifyProtectedLiteralLockbox(lockbox, outputText);
  const ingestionAudit = buildIngestionFrictionAudit({ text: outputText, protectedLiterals });
  const outputProfile = candidate.profile || extractCadenceProfile(outputText);
  const escapeVector = buildEscapeVector({
    protectedBaselineText: input.protectedBaselineText || sourceText,
    maskText: input.maskReferenceText || input.mask?.sampleSeed || input.mask?.description || '',
    maskProfile,
    maskHistory: input.maskHistory || [],
    draftText: sourceText,
    outputText,
    outputProfile,
    protectedLiterals,
    ingestionAudit,
    options: { mode: input.operatorMode || 'neutralize', thresholds: { minWords: 5 } }
  });
  const contextProfile = buildContextProfile({
    contextType: input.contextType || 'group-chat',
    intendedMode: input.operatorMode || 'neutralize',
    exposureDuration: input.exposureDuration || 'single-use',
    protectedBaselineText: input.protectedBaselineText || sourceText,
    maskReferenceText: input.maskReferenceText || input.mask?.sampleSeed || '',
    messageDraftText: sourceText,
    protectedOutputText: outputText,
    protectedLiterals
  });
  const controllerDecision = buildEscapeControllerDecision({ vector: escapeVector, mode: input.operatorMode || 'neutralize', operatorIntent: { priority: 'source-reduction', targetContext: 'TD613 Hush' } });
  const recognitionField = buildRecognitionField({
    protectedBaselineText: input.protectedBaselineText || sourceText,
    maskReferenceText: input.maskReferenceText || input.mask?.sampleSeed || '',
    messageDraftText: sourceText,
    protectedOutputText: outputText,
    protectedLiterals,
    escapeVector,
    ingestionAudit,
    controllerDecision,
    personaSummary: input.personaSummary || {},
    iterationLedger: input.iterationLedger || {},
    contextProfile,
    options: { contextType: input.contextType || 'group-chat', intendedMode: input.operatorMode || 'neutralize', exposureDuration: input.exposureDuration || 'single-use' }
  });
  const match = buildProfileMatch({ sourceText, outputText, maskProfile, sourceProfile: extractCadenceProfile(sourceText), outputProfile, protectedLiterals, escapeVector, ingestionAudit, recognitionField });
  const residualVector = buildResidualVector({ sourceText, outputText, maskProfile, outputProfile });
  const steeringPlan = buildSteeringPlan({ sourceText, outputText, maskProfile, outputProfile, residualVector, lockbox });
  const sourceResidue = buildSourceResidue({ sourceText, outputText, protectedLiterals });
  const sourceResidueScore = scoreSourceResidue(sourceResidue);
  const sourceResidueSummary = summarizeSourceResidue(sourceResidue);
  const syntaxShift = candidate.syntaxShift || buildSyntaxShift({ sourceText, outputText, sourceResidue });
  const syntaxShiftScore = scoreSyntaxShift(syntaxShift);
  const syntaxShiftSummary = summarizeSyntaxShift(syntaxShift);
  const claimIntegrity = candidate.claimIntegrity || verifyClaimIntegrity({ sourceText, outputText, protectedLiterals, meaningPlan: input.meaningPlan });
  const claimIntegritySummary = summarizeClaimIntegrity(claimIntegrity);
  const literalPlacementSummary = summarizeLiteralPlacement(candidate.literalPlacement || input.literalPlacementMap || {});
  const naturalness = candidate.writerNaturalness || scoreNaturalness({ text: outputText, mask: input.mask, realizationPlan: input.realizationPlan });
  const naturalnessSummary = summarizeNaturalness(naturalness);
  const scores = escapeVector.scores || {};
  const protectedLiteralScore = Math.min(literalScore(outputText, protectedLiterals), lockboxVerification.preservationScore ?? 1);
  const steeringScore = scoreCandidateWithSteering({
    operatorMode: input.operatorMode || 'neutralize',
    contextType: input.contextType || 'group-chat',
    maskMatch: match.matchScore || 0,
    semanticFidelity: scores.semanticFidelity ?? 0,
    protectedLiteralScore,
    sourceReductionScore: clamp(1 - (scores.sourceResidualRisk ?? 1)),
    contextSafetyScore: clamp(1 - (recognitionField.summary?.recognitionPressure ?? 0)),
    residualVector
  });
  const naturalnessScore = naturalness.naturalnessScore ?? 0;
  const sourceScore = sourceResidueScore.sourceResidueScore ?? 0;
  const syntaxScore = syntaxShiftScore.syntaxShiftScore ?? syntaxShift.metrics?.syntaxShiftScore ?? 0;
  const claimScore = claimIntegrity.score ?? (claimIntegrity.passed ? 1 : 0);
  const naturalnessHardBlocks = naturalnessScore < 0.34 ? ['naturalness-catastrophic'] : [];
  const finalScore = round((steeringScore.finalScore * 0.44) + (naturalnessScore * 0.14) + (sourceScore * 0.18) + (syntaxScore * 0.18) + (claimScore * 0.06));
  const hardVetoes = [...asArray(steeringScore.vetoes), ...naturalnessHardBlocks, ...asArray(claimIntegrity.hardFailures).map(() => 'claim-integrity-failed')];
  const reviewWarnings = unique([
    ...asArray(steeringScore.reviewWarnings),
    ...asArray(steeringPlan.warnings),
    ...asArray(candidate.writerWarnings),
    ...asArray(match.warnings),
    ...asArray(naturalness.fluencyWarnings),
    ...asArray(sourceResidue.warnings),
    ...asArray(syntaxShift.warnings),
    ...asArray(claimIntegrity.reviewWarnings),
    ...asArray(candidate.literalPlacement?.warnings)
  ]);
  const releasePolicy = buildReleasePolicy({
    candidate: { ...candidate, text: outputText, vetoes: hardVetoes, warnings: reviewWarnings, scoreBreakdown: { ...steeringScore.scoreBreakdown, naturalness: naturalnessScore, sourceResidueScore: sourceScore, syntaxShiftScore: syntaxScore, claimIntegrity: claimScore }, weightProfile: steeringScore.weightProfile, naturalness, escapeVector, lockboxVerification, sourceResidue, sourceResidueScore: sourceScore, syntaxShift, claimIntegrity, match },
    outputText,
    protectedLiterals,
    semanticFidelity: scores.semanticFidelity ?? 0,
    protectedLiteralScore,
    naturalnessScore,
    sourceResidue,
    sourceResidueScore: sourceScore,
    syntaxShift,
    syntaxShiftScore: syntaxScore,
    claimIntegrity,
    maskMatch: match.matchScore || 0
  });
  return {
    ...candidate,
    finalScore,
    scoreBreakdown: { ...steeringScore.scoreBreakdown, naturalness: naturalnessScore, sourceResidueScore: sourceScore, sourceResidueRisk: sourceResidueScore.sourceResidueRisk, syntaxShiftScore: syntaxScore, claimIntegrity: claimScore },
    weightProfile: { ...steeringScore.weightProfile, naturalness: 0.14, sourceResidueScore: 0.18, syntaxShiftScore: 0.18, claimIntegrity: 0.06 },
    vetoes: unique(hardVetoes),
    reviewWarnings,
    releasePolicy,
    releaseSummary: summarizeReleasePolicy(releasePolicy),
    sourceResidue,
    sourceResidueSummary,
    sourceResidueScore,
    syntaxShift,
    syntaxShiftSummary,
    syntaxShiftScore,
    claimIntegrity,
    claimIntegritySummary,
    literalPlacementSummary,
    naturalness,
    naturalnessSummary,
    match,
    matchSummary: summarizeProfileMatch(match),
    residualVector,
    residualSummary: summarizeResidualVector(residualVector),
    lockbox,
    lockboxVerification,
    lockboxSummary: summarizeProtectedLiteralLockbox(lockbox, lockboxVerification),
    steeringPlan,
    steeringSummary: summarizeSteeringPlan(steeringPlan),
    escapeVector,
    ingestionAudit,
    controllerDecision,
    contextProfile,
    recognitionField,
    warnings: unique([...reviewWarnings, ...hardVetoes])
  };
}

export function chooseBestHushSwapCandidate(candidates = [], options = {}) {
  const threshold = Number(options.minFinalScore ?? 0.42);
  const scored = candidates.filter(Boolean).sort((left, right) => {
    const leftBlocked = left.releasePolicy?.hardBlocked ? 1 : 0;
    const rightBlocked = right.releasePolicy?.hardBlocked ? 1 : 0;
    if (leftBlocked !== rightBlocked) return leftBlocked - rightBlocked;
    const leftWrapper = asArray(left.syntaxShift?.warnings).includes('wrapper-only-transform') ? 1 : 0;
    const rightWrapper = asArray(right.syntaxShift?.warnings).includes('wrapper-only-transform') ? 1 : 0;
    if (leftWrapper !== rightWrapper) return leftWrapper - rightWrapper;
    return (right.finalScore || 0) - (left.finalScore || 0);
  });
  const best = scored[0] || null;
  if (!best) return null;
  return { ...best, belowViabilityThreshold: (best.finalScore || 0) < threshold };
}

export function buildHushSwap(input = {}) {
  const sourceText = safeText(input.sourceText);
  const protectedLiterals = asArray(input.protectedLiterals).length ? asArray(input.protectedLiterals) : extractProtectedLiterals(sourceText);
  const lockbox = input.lockbox || buildProtectedLiteralLockbox({ sourceText, baselineText: input.protectedBaselineText, maskReferenceText: input.maskReferenceText, manualLiterals: protectedLiterals });
  const seedPlan = buildSteeringPlan({ sourceText, outputText: sourceText, maskProfile: input.maskProfile || input.mask?.profile || {}, lockbox });
  const requestedCount = Number(input.options?.candidateCount || input.candidateCount || 24);
  const count = Math.max(24, Math.min(36, Number.isFinite(requestedCount) && requestedCount > 0 ? requestedCount : 24));
  const phase19 = prepareCandidatePool({ ...input, sourceText, protectedLiterals, lockbox, count, candidateCount: count });
  const writerCandidates = asArray(phase19.candidates);
  const rawCandidates = writerCandidates.length
    ? writerCandidates.map((writerCandidate, index) => generateHushSwapCandidate({ ...input, protectedLiterals, lockbox, steeringPlan: seedPlan, index, writerCandidate }))
    : Array.from({ length: Math.min(8, count) }, (_, index) => generateHushSwapCandidate({ ...input, protectedLiterals, lockbox, steeringPlan: seedPlan, index }));
  const candidates = rawCandidates.map((candidate) => scoreHushSwapCandidate({ ...input, protectedLiterals, lockbox, meaningPlan: phase19.meaningPlan, realizationPlan: phase19.realizationPlan, literalPlacementMap: phase19.literalPlacementMap, candidate }));
  const selected = chooseBestHushSwapCandidate(candidates, { minFinalScore: input.options?.minFinalScore ?? 0.42 }) || candidates[0] || null;
  const allCandidatesFailed = Boolean(!selected || selected.releasePolicy?.hardBlocked);
  const releasePolicy = selected?.releasePolicy || buildReleasePolicy({ outputText: '' });
  const claimCeiling = selected ? evaluateClaimCeiling({ escapeVector: selected.escapeVector, ingestionAudit: selected.ingestionAudit, controllerDecision: selected.controllerDecision, personaSummary: input.personaSummary || {}, iterationLedger: input.iterationLedger || {}, reportIntent: 'local-review' }) : null;
  const maskLifecycle = buildMaskLifecycle({ mask: input.mask, personaSummary: input.personaSummary, recognitionField: selected?.recognitionField, escapeVector: selected?.escapeVector, missingLiteralPressure: selected?.lockboxVerification?.missingCount || 0 });
  return {
    version: HUSH_SWAP_VERSION,
    selectedOutput: releasePolicy.mayPopulateOutput ? selected?.text || '' : '',
    candidates,
    writer: {
      meaningPlan: phase19.meaningPlan,
      realizationPlan: phase19.realizationPlan,
      claimRoleMap: phase19.claimRoleMap,
      claimRoleSummary: summarizeClaimRoleMap(phase19.claimRoleMap),
      literalPlacementMap: phase19.literalPlacementMap,
      literalPlacementSummary: summarizeLiteralPlacement(phase19.literalPlacementMap),
      syntaxPlan: phase19.syntaxPlan,
      syntaxPlanSummary: summarizeSyntaxPlan(phase19.syntaxPlan),
      syntaxBundle: { version: phase19.syntaxBundle?.version, count: asArray(phase19.syntaxBundle?.candidates).length, warnings: asArray(phase19.syntaxBundle?.warnings) },
      maskWriterBundle: { version: phase19.writerBundle?.version, count: asArray(phase19.writerBundle?.candidates).length, warnings: asArray(phase19.writerBundle?.warnings) },
      cleanroom: summarizeCleanroom(phase19.cleanroom),
      warnings: unique([...asArray(phase19.writerBundle?.warnings), ...asArray(phase19.syntaxBundle?.warnings), ...asArray(phase19.cleanroom?.warnings)])
    },
    selectedCandidateId: selected?.id || '',
    allCandidatesFailed,
    failureReason: allCandidatesFailed ? 'Every candidate failed hard release policy. Review meaning, literals, naturalness, syntax shift, source residue, and claim discipline.' : '',
    releasePolicy,
    releaseSummary: summarizeReleasePolicy(releasePolicy),
    sourceResidue: selected?.sourceResidue || null,
    sourceResidueSummary: selected?.sourceResidueSummary || null,
    sourceResidueScore: selected?.sourceResidueScore || null,
    syntaxShift: selected?.syntaxShift || null,
    syntaxShiftSummary: selected?.syntaxShiftSummary || null,
    syntaxShiftScore: selected?.syntaxShiftScore || null,
    claimIntegrity: selected?.claimIntegrity || null,
    claimIntegritySummary: selected?.claimIntegritySummary || null,
    literalPlacementSummary: selected?.literalPlacementSummary || null,
    match: selected?.match || null,
    matchSummary: selected?.matchSummary || null,
    naturalness: selected?.naturalness || null,
    naturalnessSummary: selected?.naturalnessSummary || null,
    residualVector: selected?.residualVector || null,
    residualSummary: selected?.residualSummary || null,
    steeringPlan: selected?.steeringPlan || null,
    steeringSummary: selected?.steeringSummary || null,
    lockbox,
    lockboxVerification: selected?.lockboxVerification || null,
    lockboxSummary: selected?.lockboxSummary || summarizeProtectedLiteralLockbox(lockbox),
    maskLifecycle,
    maskLifecycleSummary: summarizeMaskLifecycle(maskLifecycle),
    escapeVector: selected?.escapeVector || null,
    ingestionAudit: selected?.ingestionAudit || null,
    controllerDecision: selected?.controllerDecision || null,
    claimCeiling,
    recognitionField: selected?.recognitionField || null,
    warnings: unique([...asArray(phase19.writerBundle?.warnings), ...asArray(phase19.syntaxBundle?.warnings), ...asArray(phase19.cleanroom?.operations), ...candidates.flatMap((candidate) => asArray(candidate.warnings)), ...(allCandidatesFailed ? ['all-candidates-failed'] : [])]),
    limitations: ['Hush swap is a local candidate selection workflow, not an external recognition outcome.', 'Preserve the claim before chasing the mask.']
  };
}

export function exportHushSwapJson(result = {}, options = {}) {
  return exportHushPolicyJson(result, { mode: options.mode || (options.includePrivateText ? 'private-full-export' : 'share-export'), pretty: options.pretty, includePrivateText: options.includePrivateText });
}
