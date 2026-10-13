import assert from 'assert';
import { detectForbiddenClaims } from '../app/engine/claim-ladder.js';
import { buildContextProfile } from '../app/engine/context-profile.js';
import {
  RECOGNITION_FIELD_VERSION,
  buildRecognitionField,
  buildRecognitionWarnings,
  scoreContextLegibility,
  scoreEntityLeakage,
  scoreIndexability,
  scoreMaskOverusePressure,
  scorePersonaContinuityPressure,
  scoreRecognitionRecapture,
  scoreTopicLeakage,
  summarizeRecognitionField
} from '../app/engine/recognition-field.js';

const escapeVector = {
  scores: {
    sourceResidualRisk: 0.31,
    maskFit: 0.68,
    maskDeltaSafe: 0.37,
    semanticFidelity: 0.91,
    belongingWithoutCollapse: 0.78,
    ingestionFriction: 0.22,
    apertureRecaptureRisk: 0.24,
    maskLinkability: 0.42,
    maskDrift: 0.24
  }
};

const baseInput = {
  protectedBaselineText: 'The archive keeps circling EXHIBIT-42 with a high-heat witness note and a 6/13 custody marker.',
  maskReferenceText: 'Hey team, quick note. Keep the exhibit attached, confirm the date, and keep the thread practical.',
  messageDraftText: 'Please keep EXHIBIT-42 attached and confirm 6/13 in the group thread.',
  protectedOutputText: 'Hey team, quick note: please keep EXHIBIT-42 attached and confirm 6/13 in the thread.',
  protectedLiterals: ['EXHIBIT-42', '6/13'],
  escapeVector,
  ingestionAudit: { ingestionFriction: 0.22, warnings: [] },
  controllerDecision: { state: 'continue' },
  personaSummary: { acceptedCount: 4, entryCount: 4, field: { meanLinkability: 0.32 } },
  iterationLedger: { accepted: { iterationIds: ['a', 'b', 'c'] }, rows: [{}, {}, {}] },
  claimCeiling: { level: 6 }
};

assert.equal(RECOGNITION_FIELD_VERSION, 'phase-9');

const contextProfile = buildContextProfile({ ...baseInput, contextType: 'group-chat', intendedMode: 'stable-pseudonym', exposureDuration: 'short-thread' });
const field = buildRecognitionField({ ...baseInput, contextProfile, options: { contextType: 'group-chat', intendedMode: 'stable-pseudonym', exposureDuration: 'short-thread' } });
assert.equal(field.version, 'phase-9');
assert.equal(field.contextType, 'group-chat');
assert.equal(field.intendedMode, 'stable-pseudonym');
assert(Number.isFinite(field.summary.recognitionPressure));
assert(Number.isFinite(field.summary.contextLegibility));
assert(Number.isFinite(field.summary.indexability));
assert(Number.isFinite(field.summary.topicLeakage));
assert(Number.isFinite(field.summary.entityLeakage));
assert(Number.isFinite(field.summary.personaContinuityPressure));
assert(Number.isFinite(field.summary.maskOverusePressure));
assert(Number.isFinite(field.summary.recapturePressure));
assert(['reviewable', 'warm', 'caution', 'hot', 'hold'].includes(field.classifications.route));
assert(field.limitations.some((line) => line.includes('hidden platform classifiers')));
assert(field.limitations.some((line) => line.includes('does not predict platform outcome')));
assert.equal(detectForbiddenClaims(JSON.stringify(field)).hasForbiddenClaim, false);

const indexability = scoreIndexability({ ...baseInput, contextProfile, options: { audienceSize: 'public' } });
assert(Number.isFinite(indexability.score));
assert(indexability.components.publicness >= 0.36);

const topicLeakage = scoreTopicLeakage({ ...baseInput, contextProfile });
assert(topicLeakage.sharedTerms.some((term) => term.includes('exhibit')));
assert(Number.isFinite(topicLeakage.score));

const entityLeakage = scoreEntityLeakage({ ...baseInput, contextProfile });
assert(entityLeakage.repeatedEntities.includes('EXHIBIT-42'));
assert(entityLeakage.requiredEntities.includes('EXHIBIT-42'));
assert(Number.isFinite(entityLeakage.score));

const stableContinuity = scorePersonaContinuityPressure({ ...baseInput, contextProfile, options: { intendedMode: 'stable-pseudonym' } });
const rotatingContinuity = scorePersonaContinuityPressure({ ...baseInput, contextProfile, options: { intendedMode: 'rotating-mask' } });
assert(rotatingContinuity.score >= stableContinuity.score, 'rotating masks should treat continuity pressure as more risky');

const maskOveruse = scoreMaskOverusePressure({
  ...baseInput,
  escapeVector: { scores: { ...escapeVector.scores, maskLinkability: 0.82, maskDrift: 0.08 } },
  personaSummary: { acceptedCount: 12, entryCount: 12, field: { meanLinkability: 0.82 } },
  iterationLedger: { accepted: { iterationIds: ['a','b','c','d','e'] }, rows: new Array(12).fill({}) },
  contextProfile,
  options: { intendedMode: 'rotating-mask' }
});
assert(maskOveruse.score > 0.5);
assert(['indexable', 'overfit-risk', 'quarantine-risk'].includes(maskOveruse.status));

const legibility = scoreContextLegibility({ ...baseInput, contextProfile, options: { intendedMode: 'stable-pseudonym' } });
assert(Number.isFinite(legibility.score));
assert(['misfit', 'readable', 'strong-fit', 'overfit'].includes(legibility.status));

const hotRecapture = scoreRecognitionRecapture({
  ...baseInput,
  escapeVector: { scores: { ...escapeVector.scores, sourceResidualRisk: 0.9, apertureRecaptureRisk: 0.8, ingestionFriction: 0.5 } },
  contextProfile,
  topicLeakage: { score: 0.76 },
  entityLeakage: { score: 0.72 },
  maskOveruse: { score: 0.68 }
});
assert(hotRecapture.score > 0.6);
assert(['hot', 'hold'].includes(hotRecapture.route));

const warnings = buildRecognitionWarnings({
  indexability: { warnings: ['indexability-elevated'] },
  topicLeakage: { warnings: ['topic-leakage-elevated'] },
  entityLeakage: { warnings: [] },
  personaContinuity: { score: 0.7, warnings: [] },
  maskOveruse: { warnings: ['mask-overuse-pressure-elevated'] },
  contextLegibility: { penalties: [] },
  recapture: { reasons: [] },
  contextProfile: { warnings: [] },
  options: { intendedMode: 'rotating-mask', audienceSize: 'public' }
});
assert(warnings.includes('rotate-mask-continuity-warning'));

const summary = summarizeRecognitionField(field);
assert.equal(summary.contextType, 'group-chat');
assert.equal(summary.intendedMode, 'stable-pseudonym');
assert(Number.isFinite(summary.recognitionPressure));
assert(summary.limitations.length);

console.log('recognition-field tests passed');
