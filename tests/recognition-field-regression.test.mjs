import assert from 'assert';
import { detectForbiddenClaims } from '../app/engine/claim-ladder.js';
import { buildReportPayload, exportReportJson, exportReportMarkdown } from '../app/engine/report-export.js';
import { buildContextProfile } from '../app/engine/context-profile.js';
import { buildRecognitionField } from '../app/engine/recognition-field.js';

const escapeVector = {
  scores: {
    sourceResidualRisk: 0.36,
    maskFit: 0.64,
    maskDeltaSafe: 0.28,
    semanticFidelity: 0.88,
    belongingWithoutCollapse: 0.7,
    ingestionFriction: 0.24,
    apertureRecaptureRisk: 0.22,
    maskLinkability: 0.36,
    maskDrift: 0.28
  }
};

const base = {
  protectedBaselineText: 'The archive keeps circling EXHIBIT-42 with a witness note, a 6/13 date, and a private cadence that should not become the public surface.',
  maskReferenceText: 'Hey team, quick note. Keep the exhibit attached and keep the thread practical.',
  messageDraftText: 'Please keep EXHIBIT-42 attached and confirm 6/13 in the note.',
  protectedOutputText: 'Hey team, quick note: please keep EXHIBIT-42 attached and confirm 6/13 in the note.',
  protectedLiterals: ['EXHIBIT-42', '6/13'],
  escapeVector,
  ingestionAudit: { ingestionFriction: 0.24, glyphIntegrity: 'preserved' },
  controllerDecision: { state: 'continue', action: 'continue-steering' },
  personaSummary: { personaId: 'persona-warm', label: 'Warm Persona', acceptedCount: 4, entryCount: 4, field: { meanLinkability: 0.34 } },
  iterationLedger: { accepted: { iterationIds: ['a','b','c'] }, rows: [{}, {}, {}] },
  claimCeiling: { level: 6, id: 'reduced-source-linkage-candidate', label: 'Reduced source-linkage candidate', allowedClaim: 'The output qualifies as a local reduced source-linkage candidate.', reasons: [], limitations: [], warnings: [] }
};

function fieldFor(contextType, intendedMode = 'neutralize', exposureDuration = 'single-use', audienceSize = '') {
  const contextProfile = buildContextProfile({ ...base, contextType, intendedMode, exposureDuration, audienceSize });
  return buildRecognitionField({ ...base, contextProfile, options: { contextType, intendedMode, exposureDuration, audienceSize } });
}

const groupPrivate = fieldFor('group-chat', 'neutralize', 'single-use', 'private');
const publicComment = fieldFor('public-comment', 'neutralize', 'long-running', 'public');
assert(publicComment.summary.recognitionPressure >= groupPrivate.summary.recognitionPressure, 'public comment should not carry less recognition pressure than private group chat under the same text');
assert(['public-index-risk', 'thread-risk', 'single-use'].includes(publicComment.classifications.exposurePosture));

const stable = fieldFor('forum-post', 'stable-pseudonym', 'recurring', 'semi-public');
const rotating = fieldFor('forum-post', 'rotating-mask', 'recurring', 'semi-public');
assert(rotating.summary.personaContinuityPressure >= stable.summary.personaContinuityPressure, 'rotating masks should penalize continuity more than stable pseudonym mode');
assert(rotating.summary.recognitionPressure >= stable.summary.recognitionPressure - 0.08, 'rotating mode should not erase continuity pressure');

const legal = fieldFor('legal-intake', 'hostile-pipeline-compression', 'single-use', 'private');
assert(legal.limitations.some((item) => item.includes('hidden platform classifiers')));
assert(legal.limitations.some((item) => item.includes('does not predict platform outcome')));

const sterileGroupContext = buildContextProfile({
  ...base,
  contextType: 'group-chat',
  intendedMode: 'neutralize',
  protectedOutputText: 'Pursuant to compliance review, EXHIBIT-42 shall be preserved for evidentiary tracking and internal jurisdictional handling.'
});
const warmGroupContext = buildContextProfile({ ...base, contextType: 'group-chat', intendedMode: 'neutralize' });
assert(sterileGroupContext.registerFit.score <= warmGroupContext.registerFit.score, 'group chat should penalize sterile over-polish');

const entityField = fieldFor('document-handoff', 'neutralize', 'single-use', 'private');
assert(entityField.components.entityLeakage.requiredEntities.includes('EXHIBIT-42'));
assert(Number.isFinite(entityField.summary.entityLeakage));
assert(entityField.limitations.length);

const highFriction = buildRecognitionField({
  ...base,
  protectedOutputText: '𝌋 TD613-Binding:#9B07D8B / Khona\u200Clit-po / EXHIBIT-42 ⟐ ⟐ 𝌋',
  ingestionAudit: { ingestionFriction: 0.82, glyphIntegrity: 'preserved' },
  escapeVector: { scores: { ...escapeVector.scores, ingestionFriction: 0.82 } },
  contextProfile: buildContextProfile({ ...base, contextType: 'public-comment', protectedOutputText: '𝌋 TD613-Binding:#9B07D8B / Khona\u200Clit-po / EXHIBIT-42 ⟐ ⟐ 𝌋' }),
  options: { contextType: 'public-comment', intendedMode: 'neutralize', exposureDuration: 'short-thread', audienceSize: 'public' }
});
assert(highFriction.summary.indexability >= groupPrivate.summary.indexability, 'glyph-heavy field should show indexability pressure');
assert(highFriction.limitations.length);

const reportPayload = buildReportPayload({ ...base, recognitionField: publicComment, options: { includeTexts: false, includePrivateText: false } });
assert(reportPayload.recognitionField);
assert.equal(reportPayload.recognitionField.contextType, 'public-comment');
assert.equal(reportPayload.reproducibility.sourceTextIncluded, false);
assert.equal(reportPayload.reproducibility.outputTextIncluded, false);
const reportJson = exportReportJson(reportPayload);
assert(reportJson.includes('recognitionField'));
assert(!reportJson.includes(base.protectedBaselineText));
assert(!reportJson.includes(base.protectedOutputText));
assert.equal(detectForbiddenClaims(reportJson).hasForbiddenClaim, false);
const reportMarkdown = exportReportMarkdown(reportPayload);
assert(reportMarkdown.includes('## Recognition Field'));
assert(reportMarkdown.includes('recognitionPressure'));
assert(!reportMarkdown.includes(base.protectedBaselineText));
assert.equal(detectForbiddenClaims(reportMarkdown).hasForbiddenClaim, false);

for (const field of [groupPrivate, publicComment, stable, rotating, legal, entityField, highFriction]) {
  const text = JSON.stringify(field);
  assert.equal(detectForbiddenClaims(text).hasForbiddenClaim, false, `forbidden positive claim in ${field.contextType}`);
  assert(field.limitations.some((item) => item.includes('hidden platform classifiers')));
}

console.log('recognition-field-regression tests passed');
