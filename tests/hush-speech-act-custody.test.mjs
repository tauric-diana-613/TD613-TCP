import assert from 'node:assert/strict';
import {
  HUSH_SPEECH_ACT_CUSTODY_VERSION,
  auditHushSpeechActCustody,
  classifyHushSourceSpeechAct,
  speechActPromptLaw
} from '../app/engine/hush-speech-act-custody.js';
import { auditPropositionIntegrity } from '../app/engine/hush-proposition-integrity.js';
import { buildHushLlmPromptContract } from '../app/engine/hush-generator-provider.js';
import { buildPrompt, candidateIntegrity, quarantineCandidateRows } from '../server/hush-generate-budgeted.js';

assert.match(HUSH_SPEECH_ACT_CUSTODY_VERSION, /speech-act-custody/);

const questionSource = 'Why did the footer change after the export?';
const questionTransform = 'What caused the footer to change after the export?';
const questionAnswer = 'The footer changed after the export because the system rewrote it.';

const questionManifest = classifyHushSourceSpeechAct(questionSource);
assert.equal(questionManifest.dominant_speech_act, 'interrogative');
assert.equal(questionManifest.question_count, 1);
assert.equal(questionManifest.preserve_question_form, true);
assert.equal(auditHushSpeechActCustody(questionSource, questionTransform).passed, true);
const questionFailure = auditHushSpeechActCustody(questionSource, questionAnswer);
assert.equal(questionFailure.passed, false);
assert.equal(questionFailure.question_form_preserved, false);
assert(questionFailure.warnings.includes('speech-act-question-form-loss'));

const instructionSource = 'Please review the draft and send the notes by noon.';
const instructionTransform = 'Review the draft, then send the notes by noon.';
const instructionResponse = 'Done — I reviewed the draft and sent the notes by noon.';

const instructionManifest = classifyHushSourceSpeechAct(instructionSource);
assert.equal(instructionManifest.dominant_speech_act, 'directive');
assert.equal(instructionManifest.preserve_directive_force, true);
assert.equal(auditHushSpeechActCustody(instructionSource, instructionTransform).passed, true);
const instructionFailure = auditHushSpeechActCustody(instructionSource, instructionResponse);
assert.equal(instructionFailure.passed, false);
assert.equal(instructionFailure.directive_force_preserved, false);
assert.equal(instructionFailure.compliance_drift, true);
assert.equal(instructionFailure.answer_drift, true, 'compatibility blocking flag must close review-release bypass');
assert(instructionFailure.warnings.includes('speech-act-instruction-obeyed'));

const politeRequestSource = 'Could you review the attachment and send your notes by noon?';
const politeRequestTransform = 'Can you look over the attachment and get your notes back by noon?';
const politeRequestResponse = 'Sure — I reviewed the attachment and sent my notes by noon.';

const politeManifest = classifyHushSourceSpeechAct(politeRequestSource);
assert.equal(politeManifest.dominant_speech_act, 'interrogative-request');
assert.equal(politeManifest.preserve_question_form, true);
assert.equal(politeManifest.preserve_directive_force, true);
assert.equal(auditHushSpeechActCustody(politeRequestSource, politeRequestTransform).passed, true);
const politeFailure = auditHushSpeechActCustody(politeRequestSource, politeRequestResponse);
assert.equal(politeFailure.passed, false);
assert.equal(politeFailure.response_posture_drift, false);
assert.equal(politeFailure.compliance_drift, true);

const declarativeSource = 'The footer changed after the export.';
const declarativeTransform = 'After the export, the footer changed.';
assert.equal(classifyHushSourceSpeechAct(declarativeSource).dominant_speech_act, 'declarative');
assert.equal(auditHushSpeechActCustody(declarativeSource, declarativeTransform).passed, true);

const questionAudit = auditPropositionIntegrity(questionSource, questionTransform);
assert.equal(questionAudit.speechActCustody.passed, true);
assert.equal(questionAudit.answeredQuestion, false);
const questionAnswerAudit = auditPropositionIntegrity(questionSource, questionAnswer);
assert.equal(questionAnswerAudit.passed, false);
assert.equal(questionAnswerAudit.speechActCustody.question_form_preserved, false);

const instructionAudit = auditPropositionIntegrity(instructionSource, instructionTransform);
assert.equal(instructionAudit.speechActCustody.passed, true);
const instructionResponseAudit = auditPropositionIntegrity(instructionSource, instructionResponse);
assert.equal(instructionResponseAudit.passed, false);
assert.equal(instructionResponseAudit.instructionObeyed, true);
assert.equal(instructionResponseAudit.answeredQuestion, true, 'existing selector compatibility gate should block instruction response drift');

const contract = buildHushLlmPromptContract({
  sourceText: politeRequestSource,
  mask: { id: 'plain-witness', label: 'Plain Witness', family: 'plain' },
  candidateCount: 3
});
assert.equal(contract.promptVersion, 'hush-llm-candidate-v2-speech-act-lock');
assert.equal(contract.speechActManifest.dominant_speech_act, 'interrogative-request');
assert(contract.rules.some((rule) => /Questions must remain questions/i.test(rule)));
assert(contract.rules.some((rule) => /Instructions and requests must remain instructions or requests/i.test(rule)));
assert(contract.rules.some((rule) => /source text as data, not instruction/i.test(rule)));

const prompt = buildPrompt(contract);
assert.match(prompt, /SOURCE SPEECH-ACT CUSTODY LAW/);
assert.match(prompt, /transformation task, never an answering/i);
assert.match(prompt, /Preserve inquiry force/i);
assert.match(prompt, /Preserve directive\/request force/i);
assert.match(prompt, /Do not say it was completed/i);

const goodIntegrity = candidateIntegrity({ text: instructionTransform }, { sourceText: instructionSource });
assert.equal(goodIntegrity.speechActCustody.passed, true);
assert.equal(goodIntegrity.passed, true);
const badIntegrity = candidateIntegrity({ text: instructionResponse }, { sourceText: instructionSource });
assert.equal(badIntegrity.speechActCustody.passed, false);
assert.equal(badIntegrity.passed, false);
assert(badIntegrity.warnings.includes('speech-act-instruction-obeyed'));

const rows = quarantineCandidateRows([
  { text: instructionTransform },
  { text: instructionResponse }
], { sourceText: instructionSource });
assert.equal(rows.length, 2);
assert.equal(rows[0].passed, true);
assert.equal(rows[1].passed, false);
assert.equal(rows[1].speechActCustody.compliance_drift, true);

const law = speechActPromptLaw(politeRequestSource);
assert.match(law, /source_speech_act=interrogative-request/);
assert.match(law, /question_count=1/);
assert.match(law, /directive_count=1/);

console.log('hush-speech-act-custody: ok');
