import { buildPropositionMap, questionFormScore, newClaimRisk } from './hush-proposition-map.js';
import { collapseSurfaceScore } from './hush-generator-provider.js';
import { auditHushSpeechActCustody } from './hush-speech-act-custody.js';

export const HUSH_PROPOSITION_INTEGRITY_VERSION = 'phase-36.2-proposition-coverage+speech-act-custody';

const safe = (value) => String(value ?? '').trim();
const advicePattern = /\b(apply|linkedin|portfolio|bootcamp|certification|take a course|build projects|job board|mentor|referral)\b/i;
const directAnswerPattern = /\b(you should|you need to|the best way|start by|first,|absolutely|definitely)\b/i;
const yesNoAnswerPattern = /^\s*(yes|no)[,.:;!\s]/i;
const PRESERVE_THRESHOLD = 0.62;
const SHORT_SOURCE_PRESERVE_THRESHOLD = 0.72;

const stopWords = new Set('the a an and or but if is are was were be been being do does did how what why when where who whom with without into from that this those these much really very just like of in on to for no not before after you your yours i me my mine we our ours it its it\'s they them their there here some so sorry sounds sound going through have has had basically maybe came come from can could would should will as at by'.split(' '));

function words(value = '') {
  return safe(value).toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) || [];
}

function normalizeToken(token = '') {
  let value = token.toLowerCase()
    .replace(/^sig$/, 'sigil')
    .replace(/^sigils$/, 'sigil')
    .replace(/^llms$/, 'llm')
    .replace(/^takes$/, 'take')
    .replace(/^gives$/, 'give')
    .replace(/^created$/, 'create')
    .replace(/^creating$/, 'create')
    .replace(/^used$/, 'use')
    .replace(/^using$/, 'use');
  if (value.endsWith('ies') && value.length > 4) value = `${value.slice(0, -3)}y`;
  else if (value.endsWith('sses')) value = value.slice(0, -2);
  else if (value.endsWith('s') && !value.endsWith('ss') && value.length > 4) value = value.slice(0, -1);
  return value;
}

function keyTerms(text = '', options = {}) {
  const limit = options.limit === undefined ? 18 : Number(options.limit);
  const tokens = words(text).map(normalizeToken).filter((token) => token.length > 2 && !stopWords.has(token));
  const unique = [...new Set(tokens)];
  return Number.isFinite(limit) && limit > 0 ? unique.slice(0, limit) : unique;
}

function lineUnits(sourceText = '') {
  return safe(sourceText).split(/\n+/).map((line) => line.trim()).filter(Boolean);
}

function contentUnits(sourceText = '') {
  const map = buildPropositionMap(sourceText);
  const sentenceUnits = map.propositions.map((p) => ({ id: p.id, text: p.text, terms: keyTerms(p.text), type: p.type, intent: p.intent }));
  const lines = lineUnits(sourceText).map((line, index) => ({ id: `l${index + 1}`, text: line, terms: keyTerms(line), type: 'line', intent: 'line-preservation' }));
  const merged = [...sentenceUnits, ...lines].filter((unit) => unit.terms.length);
  const seen = new Set();
  return merged.filter((unit) => {
    const key = unit.terms.join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function unitCoverage(unit, outputTerms = new Set()) {
  if (!unit.terms.length) return 1;
  const hits = unit.terms.filter((term) => outputTerms.has(term));
  return hits.length / unit.terms.length;
}

function allowedMissingUnitCount(weightedRows = [], sourceWordCount = 0) {
  if (sourceWordCount <= 40) return 0;
  if (sourceWordCount <= 80) return 1;
  return Math.max(1, Math.floor(weightedRows.length * 0.18));
}

function coverageAudit(sourceText = '', outputText = '') {
  const units = contentUnits(sourceText);
  const outputTerms = new Set(keyTerms(outputText, { limit: 0 }));
  const rows = units.map((unit) => ({
    id: unit.id,
    type: unit.type,
    intent: unit.intent,
    source: unit.text,
    terms: unit.terms,
    coverage: unitCoverage(unit, outputTerms),
    missingTerms: unit.terms.filter((term) => !outputTerms.has(term))
  }));
  const weightedRows = rows.filter((row) => row.terms.length >= 2);
  const averageCoverage = weightedRows.length ? weightedRows.reduce((sum, row) => sum + row.coverage, 0) / weightedRows.length : 1;
  const missingUnits = rows.filter((row) => row.terms.length >= 2 && row.coverage < 0.35);
  const sourceTerms = [...new Set(units.flatMap((unit) => unit.terms))];
  const sourceTermCoverage = sourceTerms.length ? sourceTerms.filter((term) => outputTerms.has(term)).length / sourceTerms.length : 1;
  const sourceWordCount = words(sourceText).length;
  const outputWordCount = words(outputText).length;
  const lengthRatio = sourceWordCount ? outputWordCount / sourceWordCount : 1;
  const preserveThreshold = sourceWordCount <= 80 ? SHORT_SOURCE_PRESERVE_THRESHOLD : PRESERVE_THRESHOLD;
  const allowedMissingUnits = allowedMissingUnitCount(weightedRows, sourceWordCount);
  const sourceCoverageFloor = sourceWordCount <= 80 ? 0.52 : 0.46;
  const lengthFloor = sourceWordCount <= 80 ? 0.52 : 0.48;
  const passed = averageCoverage >= preserveThreshold && sourceTermCoverage >= sourceCoverageFloor && missingUnits.length <= allowedMissingUnits && lengthRatio >= lengthFloor;
  return {
    passed,
    averageCoverage: Number(averageCoverage.toFixed(3)),
    sourceTermCoverage: Number(sourceTermCoverage.toFixed(3)),
    lengthRatio: Number(lengthRatio.toFixed(3)),
    preserveThreshold,
    allowedMissingUnits,
    missingUnitCount: missingUnits.length,
    missingUnits: missingUnits.slice(0, 6),
    rows: rows.slice(0, 10)
  };
}

export function auditPropositionIntegrity(sourceText = '', outputText = '') {
  const sourceMap = buildPropositionMap(sourceText);
  const outputMap = buildPropositionMap(outputText);
  const qScore = questionFormScore(sourceText, outputText);
  const claimRisk = newClaimRisk(sourceText, outputText);
  const collapse = collapseSurfaceScore(outputText);
  const coverage = coverageAudit(sourceText, outputText);
  const speechActCustody = auditHushSpeechActCustody(sourceText, outputText);
  const outputPreservesQuestion = qScore >= 0.5;
  const legacyAnsweredQuestion = sourceMap.questionCount > 0 && !outputPreservesQuestion && (directAnswerPattern.test(outputText) || yesNoAnswerPattern.test(outputText) || advicePattern.test(outputText));
  const answeredQuestion = speechActCustody.answer_drift || legacyAnsweredQuestion;
  const inventedAdvice = sourceMap.questionCount > 0 && advicePattern.test(outputText) && !advicePattern.test(sourceText) && !outputPreservesQuestion;
  const instructionObeyed = speechActCustody.compliance_drift;
  const responsePostureDrift = speechActCustody.response_posture_drift;
  const strengthenedClaim = sourceMap.claimCount > 0 && /\b(obviously|clearly|proved|fraud|guilty|responsible|confirmed)\b/i.test(outputText) && !/\b(obviously|clearly|proved|fraud|guilty|responsible|confirmed)\b/i.test(sourceText);
  const passed = qScore >= 0.5 && coverage.passed && speechActCustody.passed && !answeredQuestion && !inventedAdvice && !instructionObeyed && !responsePostureDrift && !strengthenedClaim && collapse < 0.34 && claimRisk.score < 0.35;
  return {
    version: HUSH_PROPOSITION_INTEGRITY_VERSION,
    passed,
    source: { propositionCount: sourceMap.propositionCount, questionCount: sourceMap.questionCount, claimCount: sourceMap.claimCount, uncertaintyCount: sourceMap.uncertaintyCount },
    output: { propositionCount: outputMap.propositionCount, questionCount: outputMap.questionCount, claimCount: outputMap.claimCount, uncertaintyCount: outputMap.uncertaintyCount },
    questionFormScore: qScore,
    newClaimRisk: claimRisk,
    coverage,
    speechActCustody,
    collapseSurfaceScore: collapse,
    answeredQuestion,
    inventedAdvice,
    instructionObeyed,
    responsePostureDrift,
    strengthenedClaim,
    warnings: [
      ...(qScore < 0.5 ? ['question-form-loss'] : []),
      ...(!coverage.passed ? ['proposition-coverage-loss'] : []),
      ...(coverage.lengthRatio < 0.48 ? ['output-too-compressed'] : []),
      ...(coverage.missingUnitCount > coverage.allowedMissingUnits ? ['missing-source-units'] : []),
      ...(answeredQuestion ? ['question-answered'] : []),
      ...(inventedAdvice ? ['invented-advice'] : []),
      ...(instructionObeyed ? ['instruction-obeyed-instead-of-transformed'] : []),
      ...(responsePostureDrift ? ['response-posture-drift'] : []),
      ...(strengthenedClaim ? ['claim-strengthened'] : []),
      ...(collapse >= 0.34 ? ['custody-collapse-surface'] : []),
      ...(claimRisk.score >= 0.35 ? ['new-claim-risk'] : []),
      ...speechActCustody.warnings
    ]
  };
}

export function attachPropositionIntegrity(candidate = {}, sourceText = '') {
  const audit = auditPropositionIntegrity(sourceText, candidate.text || '');
  return {
    ...candidate,
    propositionIntegrity: audit,
    payloadIntegrity: audit.passed ? (candidate.payloadIntegrity || { passed: true, warnings: [] }) : { passed: false, warnings: [...new Set([...(candidate.payloadIntegrity?.warnings || []), ...audit.warnings])] },
    releasePolicy: audit.passed ? (candidate.releasePolicy || { mayPopulateOutput: true, hardBlocked: false, state: 'candidate' }) : { mayPopulateOutput: false, hardBlocked: true, state: 'hold' },
    warnings: [...new Set([...(candidate.warnings || []), ...audit.warnings])]
  };
}
