import { buildPropositionMap, questionFormScore, newClaimRisk } from './hush-proposition-map.js';
import { collapseSurfaceScore } from './hush-generator-provider.js';

export const HUSH_PROPOSITION_INTEGRITY_VERSION = 'phase-35-proposition-integrity';

const safe = (value) => String(value ?? '').trim();
const advicePattern = /\b(apply|resume|linkedin|portfolio|bootcamp|certification|network|learn|take a course|build projects|job board|mentor|referral)\b/i;
const answerPattern = /\b(you should|you need to|the best way|start by|first,|yes,|no,|absolutely|definitely)\b/i;

export function auditPropositionIntegrity(sourceText = '', outputText = '') {
  const sourceMap = buildPropositionMap(sourceText);
  const outputMap = buildPropositionMap(outputText);
  const qScore = questionFormScore(sourceText, outputText);
  const claimRisk = newClaimRisk(sourceText, outputText);
  const collapse = collapseSurfaceScore(outputText);
  const answeredQuestion = sourceMap.questionCount > 0 && (answerPattern.test(outputText) || advicePattern.test(outputText));
  const inventedAdvice = sourceMap.questionCount > 0 && advicePattern.test(outputText) && !advicePattern.test(sourceText);
  const strengthenedClaim = sourceMap.claimCount > 0 && /\b(obviously|clearly|proved|fraud|guilty|responsible|confirmed)\b/i.test(outputText) && !/\b(obviously|clearly|proved|fraud|guilty|responsible|confirmed)\b/i.test(sourceText);
  const passed = qScore >= 1 && !answeredQuestion && !inventedAdvice && !strengthenedClaim && collapse < 0.34 && claimRisk.score < 0.25;
  return {
    version: HUSH_PROPOSITION_INTEGRITY_VERSION,
    passed,
    source: { propositionCount: sourceMap.propositionCount, questionCount: sourceMap.questionCount, claimCount: sourceMap.claimCount, uncertaintyCount: sourceMap.uncertaintyCount },
    output: { propositionCount: outputMap.propositionCount, questionCount: outputMap.questionCount, claimCount: outputMap.claimCount, uncertaintyCount: outputMap.uncertaintyCount },
    questionFormScore: qScore,
    newClaimRisk: claimRisk,
    collapseSurfaceScore: collapse,
    answeredQuestion,
    inventedAdvice,
    strengthenedClaim,
    warnings: [
      ...(qScore < 1 ? ['question-form-loss'] : []),
      ...(answeredQuestion ? ['question-answered'] : []),
      ...(inventedAdvice ? ['invented-advice'] : []),
      ...(strengthenedClaim ? ['claim-strengthened'] : []),
      ...(collapse >= 0.34 ? ['custody-collapse-surface'] : []),
      ...(claimRisk.score >= 0.25 ? ['new-claim-risk'] : [])
    ]
  };
}

export function attachPropositionIntegrity(candidate = {}, sourceText = '') {
  const audit = auditPropositionIntegrity(sourceText, candidate.text || '');
  return {
    ...candidate,
    propositionIntegrity: audit,
    warnings: [...new Set([...(candidate.warnings || []), ...audit.warnings])]
  };
}
