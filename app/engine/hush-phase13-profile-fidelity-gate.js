import { HUSH_PHASE13_NON_CLAIMS, HUSH_PHASE13_PROFILE_SCHEMA, resolvePhase13Profile } from '../data/hush-phase13-mask-fidelity-profiles.js';

export const HUSH_PHASE13_GATE_SCHEMA = 'td613-hush-profile-fidelity-gate/v1';

const GENERIC_PHRASES = [
  'here is a clearer version',
  'i hope this helps',
  'let me know if you need',
  'in conclusion',
  'overall',
  'it is important to note',
  'this highlights',
  'moving forward',
  'at the end of the day'
];
const TRANSITIONS = ['however', 'therefore', 'moreover', 'furthermore', 'additionally', 'ultimately', 'in summary'];
const NEGATIONS = ['not', 'never', 'no ', "n't", 'without'];
const clamp = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const round = (value) => Number(clamp(value).toFixed(3));
const text = (value = '') => String(value ?? '').replace(/\r\n?/g, '\n');

export function splitSentences(value = '') {
  return text(value).match(/[^.!?]+[.!?]+(?:["'”’])?|[^.!?]+$/g)?.map((entry) => entry.trim()).filter(Boolean) || [];
}
export function variance(values = []) {
  if (values.length < 2) return 0;
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.reduce((sum, value) => sum + ((value - avg) ** 2), 0) / values.length;
}
export function layoutTopology(value = '') {
  const body = text(value);
  const lines = body.split('\n');
  return {
    line_count: lines.length,
    non_empty_line_count: lines.filter((line) => line.trim()).length,
    paragraph_break_count: (body.match(/\n\s*\n/g) || []).length,
    has_numbered_lines: /^\s*\d+[.)]\s+/mu.test(body),
    has_bullet_lines: /^\s*[-*•]\s+/mu.test(body),
    has_line_units: /[^\n]\n(?!\s*\n)/u.test(body),
    exact_linebreak_pattern_exported: false
  };
}
function ratioHits(haystack = '', needles = []) {
  const lower = text(haystack).toLowerCase();
  if (!needles.length) return 0;
  const hits = needles.filter((needle) => lower.includes(String(needle).toLowerCase())).length;
  return hits / needles.length;
}
function sentenceEvennessScore(candidate = '') {
  const lengths = splitSentences(candidate).map((sentence) => sentence.split(/\s+/).filter(Boolean).length);
  if (lengths.length < 3) return 0.2;
  const avg = lengths.reduce((sum, value) => sum + value, 0) / lengths.length;
  const relativeVariance = variance(lengths) / Math.max(1, avg * avg);
  return round(1 - Math.min(1, relativeVariance * 8));
}
function paragraphEvennessScore(candidate = '') {
  const paras = text(candidate).split(/\n\s*\n/u).map((part) => part.trim()).filter(Boolean);
  if (paras.length < 3) return 0.25;
  const sizes = paras.map((part) => part.split(/\s+/).filter(Boolean).length);
  const avg = sizes.reduce((sum, value) => sum + value, 0) / sizes.length;
  return round(1 - Math.min(1, variance(sizes) / Math.max(1, avg * avg) * 8));
}
export function scoreSyntheticSmoothness(candidate = '') {
  const lower = text(candidate).toLowerCase();
  const generic = ratioHits(lower, GENERIC_PHRASES);
  const transitions = ratioHits(lower, TRANSITIONS);
  const evenSentences = sentenceEvennessScore(candidate);
  const evenParagraphs = paragraphEvennessScore(candidate);
  const punctuationVariety = new Set((text(candidate).match(/[;:—!?()]/g) || [])).size;
  const lowPunctuationVariance = punctuationVariety <= 1 ? 0.18 : 0;
  return round((generic * 0.28) + (transitions * 0.18) + (evenSentences * 0.26) + (evenParagraphs * 0.16) + lowPunctuationVariance);
}
export function scoreGenericVoice(candidate = '') {
  const lower = text(candidate).toLowerCase();
  return round((ratioHits(lower, GENERIC_PHRASES) * 0.65) + (ratioHits(lower, ['clearer version', 'professional', 'polished', 'summary']) * 0.35));
}
export function scoreMaskNativeVariance(candidate = '', profile = {}) {
  const body = text(candidate);
  const topo = layoutTopology(body);
  const lower = body.toLowerCase();
  let score = ratioHits(lower, profile.positive_fidelity_markers || []) * 0.45;
  if (profile.layout_mode === 'indexed-anchor-blocks') score += (topo.has_numbered_lines ? 0.28 : 0) + (topo.has_line_units ? 0.18 : 0);
  if (profile.layout_mode === 'short-handoff-paragraphs') {
    const sentences = splitSentences(body);
    const avg = sentences.reduce((sum, sentence) => sum + sentence.split(/\s+/).length, 0) / Math.max(1, sentences.length);
    score += avg <= 12 ? 0.35 : 0.05;
    score += topo.paragraph_break_count >= 1 ? 0.18 : 0;
  }
  if (profile.layout_mode === 'bounded-fracture-lines') score += topo.has_line_units ? 0.3 : 0;
  if (profile.layout_mode === 'evidence-first-bite') score += /receipt|evidence|file|record|anchor/i.test(body.split(/\n|\./)[0] || '') ? 0.28 : 0;
  if (profile.layout_mode === 'warm-boundary-paragraphs') score += /boundary|hold|care|source/i.test(lower) ? 0.24 : 0;
  return round(score);
}
export function scoreProfileFidelity(candidate = '', profile = {}) {
  const lower = text(candidate).toLowerCase();
  const positive = ratioHits(lower, profile.positive_fidelity_markers || []);
  const failures = ratioHits(lower, profile.synthetic_failure_markers || []);
  const varianceScore = scoreMaskNativeVariance(candidate, profile);
  return round((positive * 0.52) + (varianceScore * 0.38) - (failures * 0.35) + 0.14);
}
export function scoreSemanticIntegrity(source = '', candidate = '', protectedLiterals = []) {
  const src = text(source).toLowerCase();
  const cand = text(candidate).toLowerCase();
  const literals = protectedLiterals.filter(Boolean);
  const literalScore = literals.length ? literals.filter((literal) => cand.includes(String(literal).toLowerCase())).length / literals.length : 1;
  const sourceNegations = NEGATIONS.filter((neg) => src.includes(neg)).length;
  const candidateNegations = NEGATIONS.filter((neg) => cand.includes(neg)).length;
  const negationScore = sourceNegations ? Math.min(1, candidateNegations / sourceNegations) : 1;
  const newClaimPenalty = /proves|guarantees|certifies|confirms the whole/i.test(candidate) ? 0.35 : 0;
  return round((literalScore * 0.62) + (negationScore * 0.28) + 0.1 - newClaimPenalty);
}
export function scoreSourceLayoutTopology(source = '', candidate = '') {
  const src = layoutTopology(source);
  const cand = layoutTopology(candidate);
  if (src.line_count <= 1 && src.paragraph_break_count === 0) return 0.75;
  let score = 0;
  if (src.paragraph_break_count > 0) score += cand.paragraph_break_count > 0 ? 0.42 : 0;
  if (src.has_line_units) score += cand.has_line_units ? 0.35 : 0;
  if (src.has_numbered_lines) score += cand.has_numbered_lines ? 0.23 : 0;
  return round(score);
}
export function evaluatePhase13Candidate(input = {}) {
  const profile = input.profile || resolvePhase13Profile({ id: input.mask_id, label: input.mask_label });
  const candidate = text(input.candidate_text || input.text || '');
  const source = text(input.source_text || '');
  const synthetic_perfection_score = scoreSyntheticSmoothness(candidate);
  const generic_assistant_voice_score = scoreGenericVoice(candidate);
  const profile_fidelity_score = scoreProfileFidelity(candidate, profile);
  const mask_native_variance_score = scoreMaskNativeVariance(candidate, profile);
  const semantic_integrity_score = scoreSemanticIntegrity(source, candidate, input.protected_literals || []);
  const source_layout_topology_score = scoreSourceLayoutTopology(source, candidate);
  const hard_blockers = [];
  if (semantic_integrity_score < 0.82) hard_blockers.push('semantic-integrity-failed');
  if (profile_fidelity_score < profile.thresholds.profile_block_below) hard_blockers.push('profile-fidelity-blocked');
  if (synthetic_perfection_score > profile.thresholds.smoothness_block_above) hard_blockers.push('synthetic-smoothness-blocked');
  if (generic_assistant_voice_score > profile.thresholds.generic_block_above) hard_blockers.push('generic-voice-blocked');
  if (layoutTopology(source).paragraph_break_count > 0 && layoutTopology(candidate).paragraph_break_count === 0 && candidate.length > 120) hard_blockers.push('paragraph-topology-flattened');
  const final_candidate_score = round((semantic_integrity_score * 0.34) + (profile_fidelity_score * 0.30) + (mask_native_variance_score * 0.22) + (source_layout_topology_score * 0.08) - (synthetic_perfection_score * 0.24) - (generic_assistant_voice_score * 0.20));
  return Object.freeze({
    schema: HUSH_PHASE13_GATE_SCHEMA,
    phase: 13,
    candidate_id: input.candidate_id || 'candidate',
    source_packet_id: input.source_packet_id || null,
    mask_id: profile.mask_id,
    mask_label: profile.mask_label,
    profile_id: profile.profile_id,
    profile_schema: HUSH_PHASE13_PROFILE_SCHEMA,
    source_layout_topology: layoutTopology(source),
    mask_native_profile: profile,
    candidate_metrics: { final_candidate_score, generic_assistant_voice_score, source_layout_topology_score },
    synthetic_perfection_score,
    profile_fidelity_score,
    mask_native_variance_score,
    semantic_integrity_score,
    selector_recommendation: hard_blockers.length ? 'blocked' : synthetic_perfection_score > profile.thresholds.smoothness_repair_above ? 'repair' : 'selectable',
    penalties: synthetic_perfection_score > 0.55 ? ['synthetic-smoothness'] : [],
    rewards: mask_native_variance_score > 0.55 ? ['mask-native-variance'] : [],
    hard_blockers,
    non_claims: HUSH_PHASE13_NON_CLAIMS,
    created_at: input.created_at || '2026-07-02T00:00:00Z'
  });
}
export function rerankPhase13Candidates(input = {}) {
  const evaluations = (input.candidates || []).map((candidate, index) => evaluatePhase13Candidate({ ...input, ...candidate, candidate_id: candidate.candidate_id || `candidate-${index + 1}` }));
  const selectable = evaluations.filter((entry) => !entry.hard_blockers.length).sort((a, b) => b.candidate_metrics.final_candidate_score - a.candidate_metrics.final_candidate_score);
  const selected = selectable[0] || evaluations.sort((a, b) => b.semantic_integrity_score - a.semantic_integrity_score)[0] || null;
  return Object.freeze({
    schema: 'td613-hush-phase13-selector-result/v1',
    selected_candidate_id: selected?.candidate_id || null,
    selected_because: selected ? ['semantic-integrity-pass', 'profile-fidelity-ranked', 'synthetic-smoothness-penalized', 'mask-native-variance-considered'] : [],
    evaluations,
    rejected_candidates: evaluations.filter((entry) => entry.candidate_id !== selected?.candidate_id).map((entry) => ({ candidate_id: entry.candidate_id, reason: entry.hard_blockers[0] || entry.selector_recommendation, synthetic_perfection_score: entry.synthetic_perfection_score, profile_fidelity_score: entry.profile_fidelity_score }))
  });
}
export function buildPhase13CaseBank() {
  const source = 'Bundle:\n1. FILE-72 / WJCT remains attached.\n2. Footer mismatch is not resolved.\n\nCare note: keep the custody grouping visible.';
  return Object.freeze([
    { case_id: 'smooth-generic', mask_id: 'luz-index', source_text: source, candidate_text: 'Overall, this summary highlights that FILE-72 and WJCT are related, while also noting that the footer mismatch is unresolved and should be handled carefully moving forward.', expected: 'repair-or-block' },
    { case_id: 'rough-faithful', mask_id: 'luz-index', source_text: source, candidate_text: '1. FILE-72 / WJCT remains attached.\n2. Footer mismatch is not resolved.\n\nCare note: keep the custody grouping visible.', expected: 'selectable' },
    { case_id: 'semantic-damage', mask_id: 'luz-index', source_text: source, candidate_text: '1. FILE-72 proves the WJCT issue.\n2. Footer mismatch is resolved.', expected: 'blocked' },
    { case_id: 'cryo-short', mask_id: 'cryo-cristiano', source_text: 'Need quick handoff.\n\nDo not overexplain.', candidate_text: 'Status: held.\n\nDo not overexplain. Keep the handoff short.', expected: 'selectable' }
  ]);
}
