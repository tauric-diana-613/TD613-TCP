import { evaluatePhase14Candidate } from './hush-phase14-cognitive-authorship-gate.js';

export const HUSH_APERTURE_REPAIR_PASS_VERSION = 'aperture-hush-repair-pass/v1-runtime-interdiction';

const safe = (value = '') => String(value ?? '');
const lower = (value = '') => safe(value).toLowerCase();
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const round4 = (value) => Number.isFinite(Number(value)) ? Number(Number(value).toFixed(4)) : 0;

const QUEENIE_DOMESTIC_MOTIF_PATTERNS = [
  /\bcracked?\s+jars?\b/i,
  /\bjars?\s+(?:cracked?|finally|under|on)\b/i,
  /\bmason\s+jars?\b/i,
  /\bcanning\b/i,
  /\bpreserves?\b/i,
  /\bkitchen\s+(?:smell|smelled|memory|table|stove)\b/i,
  /\bstove\s+(?:heat|top|fire)\b/i,
  /\bpantry\s+shelf\b/i,
  /\bgrandma(?:'s)?\s+kitchen\b/i
];
const RECEIPT_NATIVE_TERMS = ['receipt', 'record', 'paper trail', 'file', 'evidence', 'who said what', 'what changed', 'what got left out', 'the part they thought nobody saved'];
const OVERCOMPLETION_PATTERNS = [/\boverall\b/i, /\bin conclusion\b/i, /\bultimately\b/i, /\bmoving forward\b/i, /\bthis shows that\b/i, /\bclear and professional\b/i, /\bhandled carefully\b/i, /\bsupportive close\b/i, /\bempowerment\b/i];

function maskSurface(input = {}) {
  const mask = input.mask || {};
  const flight = input.phase37Telemetry?.flightPacket || {};
  const kernel = input.authorshipKernel || input.phase37Telemetry?.authorshipKernel || flight.authorship_kernel || {};
  return lower([
    mask.id, mask.label, mask.name, mask.family,
    flight.mask_id, flight.mask_label, flight.mask_context?.maskId, flight.mask_context?.mask_label,
    kernel.mask_id, kernel.display_name,
    input.maskId, input.maskLabel
  ].filter(Boolean).join(' '));
}
export function identifyApertureMask(input = {}) {
  const surface = maskSurface(input);
  return {
    raw: surface,
    isQueenie: /grandma-receipts|receipts\s+queenie|queenie/.test(surface),
    isCryo: /cryo|cristiano|handoff/.test(surface),
    isSheree: /blackstar|sheree|shereé/.test(surface),
    isLuz: /luz|clipboard|index|custodial/.test(surface),
    isRex: /rex|fractura|jagged/.test(surface)
  };
}
function motifHits(value = '') { return QUEENIE_DOMESTIC_MOTIF_PATTERNS.filter((re) => re.test(value)).map((re) => String(re)); }
function outputHasNativeReceiptTerms(value = '') { const body = lower(value); return RECEIPT_NATIVE_TERMS.some((term) => body.includes(term)); }
function completionMarkerHits(value = '') { return OVERCOMPLETION_PATTERNS.filter((re) => re.test(value)).map((re) => String(re)); }

export function evaluateApertureRepairCandidate(candidate = {}, sourceText = '', input = {}) {
  const candidateText = safe(candidate.text || '');
  const mask = identifyApertureMask(input);
  const candidateMotifs = motifHits(candidateText);
  const sourceMotifs = motifHits(sourceText);
  const queenieMotifLeak = mask.isQueenie && candidateMotifs.length > 0 && sourceMotifs.length === 0;
  const phase14 = evaluatePhase14Candidate({
    mask_id: mask.isQueenie ? 'grandma-receipts' : mask.isCryo ? 'cryo-cristiano' : mask.isSheree ? 'blackstar-sheree' : input.mask?.id || input.maskId || '',
    mask_label: input.mask?.label || input.mask?.name || input.maskLabel || '',
    source_text: sourceText,
    candidate_text: candidateText,
    phase13_profile_fidelity_score: 0.74
  });
  const completionHits = completionMarkerHits(candidateText);
  const maskCompletionSensitive = mask.isCryo || mask.isSheree;
  const overcompletion = maskCompletionSensitive && (phase14.completion_prior_score >= 0.68 || completionHits.length >= 1) && phase14.process_fidelity_score < 0.74;
  const weakQueenie = mask.isQueenie && !outputHasNativeReceiptTerms(candidateText);
  const hardBlockReasons = [];
  if (queenieMotifLeak) hardBlockReasons.push('aperture-queenie-domestic-motif-leak');
  if (maskCompletionSensitive && phase14.completion_prior_score > 0.86 && phase14.process_fidelity_score < 0.58) hardBlockReasons.push('aperture-mask-overcompletion-block');
  const penalty = round4((queenieMotifLeak ? 3.5 : 0) + (weakQueenie ? 0.45 : 0) + (overcompletion ? Math.min(0.95, 0.36 + phase14.completion_prior_score * 0.42 + completionHits.length * 0.08) : Math.min(0.32, phase14.completion_prior_score * 0.16)));
  const bonus = round4(Math.min(0.42, phase14.process_fidelity_score * 0.22 + phase14.memory_return_score * 0.08 + phase14.closure_asymmetry_score * 0.07));
  return Object.freeze({
    schema: 'td613-hush-aperture-repair-pass/v1',
    version: HUSH_APERTURE_REPAIR_PASS_VERSION,
    route: ['runtime_spine', 'phason_seam', 'moire_scan', 'grade_gate', 'sigma_receipt_ledger'],
    mask,
    motif: { queenieMotifLeak, candidateMotifs, sourceMotifs, weakQueenie },
    completion: { maskCompletionSensitive, overcompletion, completionHits, completion_prior_score: phase14.completion_prior_score, process_fidelity_score: phase14.process_fidelity_score },
    phase14,
    hardBlocked: hardBlockReasons.length > 0,
    hardBlockReasons,
    penalty,
    bonus,
    selectorDelta: round4(bonus - penalty),
    warnings: [...hardBlockReasons, ...(overcompletion ? ['aperture-mask-overcompletion-penalty'] : []), ...(weakQueenie ? ['aperture-queenie-receipt-native-terms-low'] : [])]
  });
}

export function applyApertureRepairPolicy(candidate = {}, sourceText = '', input = {}) {
  const receipt = evaluateApertureRepairCandidate(candidate, sourceText, input);
  if (!receipt.hardBlocked) return { ...candidate, apertureRepair: receipt, warnings: [...new Set([...asArray(candidate.warnings), ...receipt.warnings])] };
  const warnings = [...new Set([...asArray(candidate.warnings), ...receipt.warnings])];
  return {
    ...candidate,
    apertureRepair: receipt,
    warnings,
    payloadIntegrity: { ...(candidate.payloadIntegrity || {}), passed: false, warnings: [...new Set([...asArray(candidate.payloadIntegrity?.warnings), ...warnings])] },
    releasePolicy: { ...(candidate.releasePolicy || {}), mayPopulateOutput: false, hardBlocked: true, state: 'hold', apertureRepairBlocked: true }
  };
}
