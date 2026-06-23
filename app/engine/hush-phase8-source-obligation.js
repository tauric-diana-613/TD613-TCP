import { stableStringify, sha256Text } from './hush-customizer-packet.js';

export const HUSH_SOURCE_OBLIGATION_SCHEMA = 'td613.hush.phase8.source-obligation-set/v1';
export const HUSH_SOURCE_RETENTION_SCHEMA = 'td613.hush.phase8.source-retention-score/v1';

const HEDGE = /\b(may|might|could|appears|suggests|likely|possible|possibly|seems|unless|if)\b/giu;
const CONTRAST = /\b(but|however|although|while|whereas|instead|rather than|notwithstanding)\b/giu;
const CAUSAL = /\b(because|therefore|so|since|as a result|which means|led to|caused)\b/giu;
const SEQUENCE = /\b(first|then|next|after|before|finally|while|during|later|earlier)\b/giu;

function text(value) { return String(value || ''); }
function tokens(value) { return text(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []; }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function rate(n, d) { return d ? Number(Math.max(0, Math.min(1, n / d)).toFixed(4)) : 0; }
function hits(re, value) { return text(value).match(re) || []; }
function anchorTerms(value) { return unique(tokens(value).filter((token) => token.length >= 4 && !/^(this|that|with|from|have|will|they|them|there|where|when|what|into|about)$/iu.test(token)).map((token) => token.toLowerCase())).slice(0, 24); }
async function hashObject(value) { return sha256Text(stableStringify(value == null ? null : value)); }

export async function extractSourceObligationSet(sourceTextOrSummary = '', options = {}) {
  const value = text(sourceTextOrSummary || options.summary || '');
  const anchorLimit = options.anchorLimit ?? options.anchor_limit ?? 10;
  const derived = options.derive_source_anchors === false ? [] : anchorTerms(value);
  const mandatoryDerived = derived.slice(0, anchorLimit);
  const optionalStart = anchorLimit;
  const optionalEnd = optionalStart + (options.optionalAnchorLimit ?? options.optional_anchor_limit ?? 8);
  const obligations = {
    schema: HUSH_SOURCE_OBLIGATION_SCHEMA,
    source_hash_sha256: value ? await sha256Text(value) : null,
    raw_source_included: false,
    mandatory_anchors: Object.freeze(unique([...(options.mandatory_anchors || options.mandatoryAnchors || []), ...mandatoryDerived])),
    optional_anchors: Object.freeze(unique([...(options.optional_anchors || options.optionalAnchors || []), ...derived.slice(optionalStart, optionalEnd)])),
    hedges: Object.freeze(unique(hits(HEDGE, value).map((item) => item.toLowerCase()))),
    sequence_relations: Object.freeze(unique(hits(SEQUENCE, value).map((item) => item.toLowerCase()))),
    contrast_relations: Object.freeze(unique(hits(CONTRAST, value).map((item) => item.toLowerCase()))),
    causal_relations: Object.freeze(unique(hits(CAUSAL, value).map((item) => item.toLowerCase()))),
    must_preserve_score_floor: options.must_preserve_score_floor ?? 1.0
  };
  return Object.freeze({ ...obligations, obligation_hash_sha256: await hashObject(obligations) });
}

function retained(items = [], candidate = '') {
  const lower = text(candidate).toLowerCase();
  return items.filter((item) => lower.includes(String(item).toLowerCase())).length;
}

export function scoreSourceObligationRetention(sourceObligations = {}, candidateText = '', options = {}) {
  const mandatory = sourceObligations.mandatory_anchors || [];
  const optional = sourceObligations.optional_anchors || [];
  const hedge = sourceObligations.hedges || [];
  const sequence = sourceObligations.sequence_relations || [];
  const contrast = sourceObligations.contrast_relations || [];
  const causal = sourceObligations.causal_relations || [];
  const mandatoryScore = rate(retained(mandatory, candidateText), mandatory.length || 1);
  const optionalScore = optional.length ? rate(retained(optional, candidateText), optional.length) : 1;
  const hedgeScore = hedge.length ? rate(retained(hedge, candidateText), hedge.length) : 1;
  const sequenceScore = sequence.length ? rate(retained(sequence, candidateText), sequence.length) : 1;
  const contrastScore = contrast.length ? rate(retained(contrast, candidateText), contrast.length) : 1;
  const causalScore = causal.length ? rate(retained(causal, candidateText), causal.length) : 1;
  const coverage = Number(((mandatoryScore * 0.55) + (optionalScore * 0.15) + (hedgeScore * 0.1) + (sequenceScore * 0.08) + (contrastScore * 0.06) + (causalScore * 0.06)).toFixed(4));
  return Object.freeze({
    schema: HUSH_SOURCE_RETENTION_SCHEMA,
    mandatory_anchor_retention: mandatoryScore,
    optional_anchor_retention: optionalScore,
    hedge_retention: hedgeScore,
    sequence_relation_retention: sequenceScore,
    contrast_relation_retention: contrastScore,
    causal_relation_retention: causalScore,
    source_unit_coverage: coverage,
    factual_damage_risk: options.factual_damage_risk ?? 0,
    compression_loss_rate: options.compression_loss_rate ?? Number(Math.max(0, 1 - coverage).toFixed(4)),
    source_retention_status: mandatoryScore < (sourceObligations.must_preserve_score_floor ?? 1) ? 'blocked' : coverage < 0.85 ? 'repair_required' : 'passed'
  });
}
