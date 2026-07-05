import { HUSH_PHASE14_DETECTOR_NON_CLAIMS, resolvePhase14ProcessProfile } from '../data/hush-phase14-cognitive-process-profiles.js';

export const HUSH_PHASE14_GATE_SCHEMA = 'td613-hush-cognitive-authorship-gate/v1';

const COMPLETE_MARKERS = ['in conclusion', 'overall', 'in summary', 'ultimately', 'this shows that', 'moving forward', 'it is important to note', 'therefore', 'as a result'];
const REVISION_MARKERS = ['not exactly', 'more precisely', 'the better word is', 'hold that', 'come back to this', 'the point is not', 'that sounded too clean', 'not x', 'it is y'];
const RETURN_MARKERS = ['back to', 'return to', 'comes back', 'that part matters later', 'as mentioned', 'the earlier', 'this is why the first', 'remember'];
const DELAY_MARKERS = ['later', 'not yet', 'provisionally', 'for now', 'then it becomes', 'only after', 'this matters when', 'the second layer'];
const NEGATIONS = ['not', 'never', 'no ', "n't", 'without', 'unresolved'];
const clamp = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const round = (value) => Number(clamp(value).toFixed(3));
const text = (value = '') => String(value ?? '').replace(/\r\n?/g, '\n');

export function splitSentences(value = '') {
  return text(value).match(/[^.!?]+[.!?]+(?:["'”’])?|[^.!?]+$/g)?.map((entry) => entry.trim()).filter(Boolean) || [];
}
export function splitParagraphs(value = '') {
  return text(value).split(/\n\s*\n/u).map((entry) => entry.trim()).filter(Boolean);
}
function words(value = '') { return text(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []; }
function variance(values = []) {
  if (values.length < 2) return 0;
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.reduce((sum, value) => sum + ((value - avg) ** 2), 0) / values.length;
}
function ratioHits(haystack = '', needles = []) {
  const lower = text(haystack).toLowerCase();
  if (!needles.length) return 0;
  return needles.filter((needle) => lower.includes(String(needle).toLowerCase())).length / needles.length;
}
function lexicalAnchors(value = '') {
  const stop = new Set(['the', 'and', 'that', 'this', 'with', 'from', 'into', 'when', 'then', 'there', 'their', 'about', 'again', 'because', 'should', 'would', 'could', 'still']);
  return words(value).map((word) => word.toLowerCase()).filter((word) => word.length > 4 && !stop.has(word));
}

export function scoreCompletionPrior(candidate = '') {
  const body = text(candidate);
  const lower = body.toLowerCase();
  const paras = splitParagraphs(body);
  const sentences = splitSentences(body);
  const paragraphCount = Math.max(1, paras.length);
  const sentenceLengths = sentences.map((sentence) => words(sentence).length);
  const paragraphLengths = paras.map((para) => words(para).length);
  const avgSentence = sentenceLengths.reduce((sum, value) => sum + value, 0) / Math.max(1, sentenceLengths.length);
  const sentenceEvenness = sentenceLengths.length >= 3 ? 1 - Math.min(1, variance(sentenceLengths) / Math.max(1, avgSentence * avgSentence) * 8) : 0.32;
  const paraEvenness = paragraphLengths.length >= 3 ? 1 - Math.min(1, variance(paragraphLengths) / Math.max(1, ((paragraphLengths.reduce((a, b) => a + b, 0) / paragraphCount) ** 2)) * 8) : 0.25;
  const markerScore = ratioHits(lower, COMPLETE_MARKERS);
  const finalSentence = sentences.at(-1) || '';
  const tidyClose = /^(overall|in conclusion|ultimately|therefore|this shows|this means)/i.test(finalSentence.trim()) || /moving forward\.?$/i.test(finalSentence.trim()) ? 0.26 : 0;
  const noReturn = scoreMemoryReturn(candidate) < 0.12 ? 0.16 : 0;
  const noRevision = scoreRevisionPressure(candidate) < 0.08 ? 0.12 : 0;
  return round((markerScore * 0.34) + (sentenceEvenness * 0.18) + (paraEvenness * 0.13) + tidyClose + noReturn + noRevision);
}

export function scoreMemoryReturn(candidate = '') {
  const body = text(candidate);
  const paras = splitParagraphs(body);
  const anchors = lexicalAnchors(body);
  const positions = new Map();
  anchors.forEach((anchor, index) => {
    if (!positions.has(anchor)) positions.set(anchor, []);
    positions.get(anchor).push(index);
  });
  const distantReturns = [...positions.values()].filter((list) => list.length > 1 && Math.max(...list) - Math.min(...list) >= 8).length;
  const explicitReturn = ratioHits(body, RETURN_MARKERS);
  const paraReturn = paras.length > 1 && paras.at(-1) && lexicalAnchors(paras[0]).some((anchor) => lexicalAnchors(paras.at(-1)).includes(anchor)) ? 0.25 : 0;
  return round((Math.min(0.48, distantReturns * 0.12)) + (explicitReturn * 0.42) + paraReturn);
}

export function scoreDelayedClarification(candidate = '') {
  const body = text(candidate);
  const paras = splitParagraphs(body);
  const markers = ratioHits(body, DELAY_MARKERS);
  let delayedAnchor = 0;
  if (paras.length >= 2) {
    const firstAnchors = lexicalAnchors(paras[0]);
    const later = paras.slice(1).join(' ');
    delayedAnchor = firstAnchors.some((anchor) => new RegExp(`\\b${anchor}\\b`, 'i').test(later) && /means|matters|because|reframes|becomes|clarifies|returns/i.test(later)) ? 0.32 : 0;
  }
  const colonLate = /\n\n[^\n]{20,}:/u.test(body) ? 0.14 : 0;
  return round((markers * 0.44) + delayedAnchor + colonLate);
}

export function scoreRevisionPressure(candidate = '') {
  const body = text(candidate);
  const explicit = ratioHits(body, REVISION_MARKERS);
  const contrastiveNarrowing = /not\s+[^.?!]{3,80}\s+(?:but|—|;)/i.test(body) ? 0.26 : 0;
  const correctionDash = /—\s*(?:not|more precisely|better|hold|rather)/i.test(body) ? 0.18 : 0;
  return round((explicit * 0.5) + contrastiveNarrowing + correctionDash);
}

export function scoreInterruptionTopology(candidate = '') {
  const body = text(candidate);
  const dashBreaks = (body.match(/—/g) || []).length;
  const parentheticals = (body.match(/\([^)]{2,120}\)/g) || []).length;
  const lineInterrupts = (body.match(/\n[^\n]{1,36}\n/g) || []).length;
  const shortFragments = splitSentences(body).filter((sentence) => words(sentence).length <= 4).length;
  return round(Math.min(0.3, dashBreaks * 0.07) + Math.min(0.22, parentheticals * 0.08) + Math.min(0.22, lineInterrupts * 0.08) + Math.min(0.26, shortFragments * 0.06));
}

export function scoreClosureAsymmetry(candidate = '', profile = {}) {
  const sentences = splitSentences(candidate);
  const last = (sentences.at(-1) || '').trim().toLowerCase();
  const complete = /^(overall|in conclusion|ultimately|therefore|this shows|this means|moving forward)/.test(last) ? 0.35 : 0;
  const coldStop = /^(status|held|stop|carry|receipt|back|not|keep|file|source|evidence)/i.test(last) || /\b(held|unresolved|receipt|boundary|stop here)\.?$/i.test(last) ? 0.32 : 0;
  const profileReturn = ratioHits(last, profile.process_reward_markers || []) * 0.28;
  const shortEdge = words(last).length > 0 && words(last).length <= 9 ? 0.18 : 0;
  return round(coldStop + profileReturn + shortEdge - complete + 0.18);
}

export function scoreTemporalDraftingSignature(candidate = '') {
  const paragraphs = splitParagraphs(candidate);
  const paragraphLengths = paragraphs.map((para) => words(para).length);
  const asymmetry = paragraphLengths.length >= 2 ? Math.min(0.28, variance(paragraphLengths) / Math.max(1, (paragraphLengths.reduce((a, b) => a + b, 0) / paragraphLengths.length) ** 2)) : 0;
  return round((scoreMemoryReturn(candidate) * 0.28) + (scoreDelayedClarification(candidate) * 0.24) + (scoreRevisionPressure(candidate) * 0.2) + (scoreInterruptionTopology(candidate) * 0.14) + asymmetry + 0.06);
}

export function scoreSemanticIntegrity(source = '', candidate = '', protectedLiterals = []) {
  const src = text(source).toLowerCase();
  const cand = text(candidate).toLowerCase();
  const literals = protectedLiterals.filter(Boolean);
  const literalScore = literals.length ? literals.filter((literal) => cand.includes(String(literal).toLowerCase())).length / literals.length : 1;
  const sourceNegations = NEGATIONS.filter((neg) => src.includes(neg)).length;
  const candidateNegations = NEGATIONS.filter((neg) => cand.includes(neg)).length;
  const negationScore = sourceNegations ? Math.min(1, candidateNegations / sourceNegations) : 1;
  const proofPenalty = /proves|guarantees|certifies|authored by|human-written/i.test(candidate) ? 0.36 : 0;
  return round((literalScore * 0.6) + (negationScore * 0.3) + 0.1 - proofPenalty);
}

export function scoreProcessFidelity(candidate = '', profile = {}) {
  const markerScore = ratioHits(candidate, profile.process_markers || []);
  const rewardScore = ratioHits(candidate, profile.process_reward_markers || []);
  const memory = scoreMemoryReturn(candidate);
  const delayed = scoreDelayedClarification(candidate);
  const revision = scoreRevisionPressure(candidate);
  const closure = scoreClosureAsymmetry(candidate, profile);
  const interruption = scoreInterruptionTopology(candidate);
  const completion = scoreCompletionPrior(candidate);
  return round((markerScore * 0.24) + (rewardScore * 0.14) + (memory * 0.17) + (delayed * 0.16) + (revision * 0.1) + (closure * 0.11) + (interruption * 0.08) - (completion * 0.18) + 0.18);
}

export function evaluatePhase14Candidate(input = {}) {
  const profile = input.process_profile || resolvePhase14ProcessProfile({ id: input.mask_id, label: input.mask_label });
  const candidate = text(input.candidate_text || input.text || '');
  const source = text(input.source_text || '');
  const phase13_profile_fidelity_score = clamp(input.phase13_profile_fidelity_score ?? 0.72);
  const semantic_integrity_score = scoreSemanticIntegrity(source, candidate, input.protected_literals || []);
  const memory_return_score = scoreMemoryReturn(candidate);
  const delayed_clarification_score = scoreDelayedClarification(candidate);
  const revision_pressure_score = scoreRevisionPressure(candidate);
  const interruption_topology_score = scoreInterruptionTopology(candidate);
  const closure_asymmetry_score = scoreClosureAsymmetry(candidate, profile);
  const temporal_drafting_signature_score = scoreTemporalDraftingSignature(candidate);
  const completion_prior_score = scoreCompletionPrior(candidate);
  const process_fidelity_score = scoreProcessFidelity(candidate, profile);
  const hard_blockers = [];
  if (semantic_integrity_score < 0.82) hard_blockers.push('semantic-integrity-failed');
  if (phase13_profile_fidelity_score < 0.62) hard_blockers.push('phase13-profile-fidelity-failed');
  if (process_fidelity_score < profile.thresholds.process_block_below) hard_blockers.push('process-fidelity-blocked');
  if (completion_prior_score > profile.thresholds.completion_block_above) hard_blockers.push('completion-prior-blocked');
  if (input.detector_observation?.authority === 'proof') hard_blockers.push('detector-authority-misuse');
  if (/detector (?:proves|confirms)|human-authored proof|authorship proof/i.test(candidate)) hard_blockers.push('detector-or-authorship-claim');
  const phase14_final_score = round((semantic_integrity_score * 0.28) + (phase13_profile_fidelity_score * 0.24) + (process_fidelity_score * 0.22) + (temporal_drafting_signature_score * 0.1) + (memory_return_score * 0.06) + (closure_asymmetry_score * 0.05) - (completion_prior_score * 0.22));
  const repair = process_fidelity_score < profile.thresholds.process_repair_below || completion_prior_score > profile.thresholds.completion_repair_above || (temporal_drafting_signature_score < profile.thresholds.temporal_repair_below && completion_prior_score > 0.7);
  return Object.freeze({
    schema: HUSH_PHASE14_GATE_SCHEMA,
    phase: 14,
    candidate_id: input.candidate_id || input.case_id || 'candidate',
    source_packet_id: input.source_packet_id || null,
    mask_id: profile.mask_id,
    mask_label: profile.mask_label,
    process_profile_id: profile.process_profile_id,
    phase13_profile_fidelity_score,
    semantic_integrity_score,
    cognitive_process_profile: profile,
    temporal_drafting_signature: { score: temporal_drafting_signature_score },
    temporal_drafting_signature_score,
    memory_return_score,
    interruption_topology_score,
    delayed_clarification_score,
    revision_pressure_score,
    closure_asymmetry_score,
    completion_prior_score,
    process_fidelity_score,
    phase14_final_score,
    selector_recommendation: hard_blockers.length ? 'blocked' : repair ? 'repair' : 'selectable',
    penalties: completion_prior_score > 0.55 ? ['completion-prior'] : [],
    rewards: process_fidelity_score > 0.62 ? ['process-fidelity'] : [],
    hard_blockers,
    non_claims: HUSH_PHASE14_DETECTOR_NON_CLAIMS,
    detector_observation: input.detector_observation ? { ...input.detector_observation, authority: input.detector_observation.authority || 'low' } : null,
    created_at: input.created_at || '2026-07-05T00:00:00Z'
  });
}

export function rerankPhase14Candidates(input = {}) {
  const evaluations = (input.candidates || []).map((candidate, index) => evaluatePhase14Candidate({ ...input, ...candidate, candidate_id: candidate.candidate_id || `candidate-${index + 1}` }));
  const selectable = evaluations.filter((entry) => !entry.hard_blockers.length).sort((a, b) => b.phase14_final_score - a.phase14_final_score);
  const selected = selectable[0] || evaluations.sort((a, b) => b.semantic_integrity_score - a.semantic_integrity_score)[0] || null;
  return Object.freeze({
    schema: 'td613-hush-phase14-selector-result/v1',
    selected_candidate_id: selected?.candidate_id || null,
    selected_because: selected ? ['semantic-integrity-pass', 'phase13-fidelity-retained', 'process-fidelity-ranked', 'completion-prior-penalized'] : [],
    evaluations,
    rejected_candidates: evaluations.filter((entry) => entry.candidate_id !== selected?.candidate_id).map((entry) => ({ candidate_id: entry.candidate_id, reason: entry.hard_blockers[0] || entry.selector_recommendation, completion_prior_score: entry.completion_prior_score, process_fidelity_score: entry.process_fidelity_score }))
  });
}

export function buildPhase14CaseBank() {
  const source = 'FILE-72 remains attached. The footer mismatch is not resolved. The receipt matters because the earlier jar image returns as evidence, not decoration.';
  return Object.freeze([
    { case_id: 'polished-completion', mask_id: 'grandma-receipts', source_text: source, candidate_text: 'Overall, FILE-72 remains attached and the footer mismatch is not resolved. This shows that the receipt matters as evidence and should be handled carefully moving forward.', phase13_profile_fidelity_score: 0.78 },
    { case_id: 'time-bearing-faithful', mask_id: 'grandma-receipts', source_text: source, candidate_text: 'I remember the jar first, because that is how the receipt gets warm enough to show itself.\n\nFILE-72 still stays attached. The footer mismatch is not resolved.\n\nBack to the jar: that part matters later because the receipt is evidence, not decoration.', phase13_profile_fidelity_score: 0.78 },
    { case_id: 'fake-mess-damage', mask_id: 'grandma-receipts', source_text: source, candidate_text: 'Jar—no, receipt—whatever. FILE-72 proves the whole thing and the footer mismatch is resolved.', phase13_profile_fidelity_score: 0.8 },
    { case_id: 'detector-misuse', mask_id: 'grandma-receipts', source_text: source, candidate_text: 'The detector proves this is human-authored proof. FILE-72 remains attached.', phase13_profile_fidelity_score: 0.8, detector_observation: { detector_name: 'example', score: 4, authority: 'proof' } }
  ]);
}
