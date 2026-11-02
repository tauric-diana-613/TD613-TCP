import { digest } from '../experiment-b-resumable/journal.mjs';

const hold = code => { throw Object.assign(Error(code), {code}); };
const natural = value => Number.isSafeInteger(value) && value >= 0;
const sha = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);

/** No model-specific tokenizer or native envelope limit is presumed here.
 * The byte bound is eligible ONLY when an independently accepted byte-level
 * tokenization mapping and a finite complete envelope bound are supplied.
 * Evidence digests identify the acceptance record; they do not authenticate it.
 */
export function conservativeInputMeasurement(text, policy) {
  if (typeof text !== 'string' || !text.isWellFormed()) hold('TEXT_ONLY_WELL_FORMED_UTF8_REQUIRED');
  const p = policy ?? {};
  if (p.model !== 'gpt-6.1-sol' || p.algorithm !== 'UTF8_BYTES_PLUS_ENVELOPE_BOUND_V1' ||
      p.tokenizer?.property !== 'NONEMPTY_BYTE_TOKENS_WITH_NO_TEXT_EXPANSION' ||
      !p.tokenizer.implementation || !p.tokenizer.version || !p.tokenizer.modelMapping ||
      !sha(p.tokenizer.mappingEvidenceDigest) || !sha(p.envelopeEvidenceDigest) ||
      !sha(p.acceptanceDigest) || !natural(p.envelopeUpperBoundTokens)) hold('D04_TOKENIZER_OR_COMPLETE_ENVELOPE_BOUND_REQUIRED');
  const scopes=['native_instructions','tool_definitions','bounded_tool_exchanges','structural_tokens','provider_transforms'];
  if(!Array.isArray(p.envelopeScopes)||!scopes.every(scope=>p.envelopeScopes.includes(scope)))hold('D04_COMPLETE_ENVELOPE_SCOPES_REQUIRED');
  if (!Array.isArray(p.overheadAssumptions) || !p.overheadAssumptions.length ||
      p.overheadAssumptions.some(v => typeof v !== 'string' || !v)) hold('D04_OVERHEAD_ASSUMPTIONS_REQUIRED');
  const payloadBytes = Buffer.byteLength(text, 'utf8');
  const upperBound = payloadBytes + p.envelopeUpperBoundTokens;
  if (!natural(upperBound)) hold('D04_BOUND_OVERFLOW');
  return Object.freeze({kind:'CONSERVATIVE_UPPER_BOUND', upperBound, measuredTokens:null,
    providerReportedTokens:null, unknownOverhead:false, promptSHA256:digest(Buffer.from(text)),
    payloadBytes, algorithm:p.algorithm, tokenizer:structuredClone(p.tokenizer),
    envelopeUpperBoundTokens:p.envelopeUpperBoundTokens,
    envelopeScopes:[...p.envelopeScopes],countingScope:'ONE_SERIALIZATION_INCLUSIVE_CONTEXT',
    overheadAssumptions:[...p.overheadAssumptions], evidenceDigest:digest(p),
    acceptanceDigest:p.acceptanceDigest});
}

export function compareInputUsage(measurement,reported,semantics='UNAVAILABLE'){
  const tokens=natural(reported)?reported:null;
  const comparable=semantics==='ONE_SERIALIZATION_INCLUSIVE_CONTEXT'&&tokens!==null&&
    ['CONSERVATIVE_UPPER_BOUND','EXACT_SERIALIZATION_INCLUSIVE'].includes(measurement?.kind);
  const predicted=measurement?.kind==='CONSERVATIVE_UPPER_BOUND'?measurement.upperBound:measurement?.measuredTokens;
  return {providerReportedTokens:tokens,providerCountingSemantics:semantics,
    comparison:!comparable?'UNAVAILABLE_OR_NONCOMPARABLE':tokens>predicted?'PREDICTION_EXCEEDED':'WITHIN_PREDICTION',
    // Turn-aggregate subscription/account usage is a separate coordinate from
    // any one context. Unknown semantics are never silently made comparable.
    predictedContextTokens:predicted??null};
}

/** Normalize without relabeling a bound as an exact measurement. The legacy
 * scalar path remains explicitly a caller counter, not native token evidence.
 */
export function normalizeInputMeasurement(value, prompt) {
  if (natural(value)) return {kind:'LEGACY_CALLER_COUNTER', guardTokens:value,
    measuredTokens:null, upperBound:null, callerCounter:value, providerReportedTokens:null,
    unknownOverhead:true, promptSHA256:digest(Buffer.from(prompt))};
  if (!value || value.promptSHA256 !== digest(Buffer.from(prompt)) || value.unknownOverhead !== false ||
      !sha(value.evidenceDigest)) hold('D04_COMPLETE_MEASUREMENT_REQUIRED');
  if (value.kind === 'CONSERVATIVE_UPPER_BOUND' && natural(value.upperBound) && value.measuredTokens === null)
    return {...value, guardTokens:value.upperBound};
  if (value.kind === 'EXACT_SERIALIZATION_INCLUSIVE' && natural(value.measuredTokens) &&
      value.upperBound === null && value.tokenizer?.implementation && value.tokenizer?.version)
    return {...value, guardTokens:value.measuredTokens};
  hold('D04_MEASUREMENT_CLASS_REJECTED');
}

export function validateEffectiveLimits(limits) {
  if (!limits || !natural(limits.contextTokens) || !limits.contextTokens ||
      !natural(limits.outputAndReasoningTokens) || !limits.outputAndReasoningTokens ||
      limits.outputAndReasoningTokens >= limits.contextTokens ||
      limits.includesHiddenReasoningAndFormatting !== true ||
      !sha(limits.nativeRouteEvidenceDigest) || !sha(limits.operatorPolicyDigest))
    hold('D04_NATIVE_LIMIT_AND_NUMERICAL_POLICY_ACCEPTANCE_REQUIRED');
  return structuredClone(limits);
}

export function quotaWindowCommitment(q){
  const windows=['primary','secondary'].map(k=>q?.[k]).filter(Boolean);
  if(!windows.length||windows.some(w=>!natural(w.resetsAt)||!natural(w.windowDurationMins)||!w.windowDurationMins))
    hold('OBSERVED_PROVIDER_QUOTA_WINDOW_REQUIRED');
  return 'native-quota-'+digest(windows.map(w=>({resetsAt:w.resetsAt,windowDurationMins:w.windowDurationMins})));
}
