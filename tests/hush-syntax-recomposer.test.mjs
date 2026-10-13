import assert from 'assert';
import {
  HUSH_SYNTAX_RECOMPOSER_VERSION,
  applySyntaxOperation,
  diversifySyntaxPlans,
  generateSyntaxRecomposerCandidates,
  recomposeSyntaxCandidate
} from '../app/engine/hush-syntax-recomposer.js';
import { buildMeaningPlan } from '../app/engine/hush-meaning-plan.js';
import { buildClaimRoleMap } from '../app/engine/hush-claim-roles.js';
import { buildLiteralPlacementMap } from '../app/engine/hush-literal-placement.js';
import { buildSyntaxPlan } from '../app/engine/hush-syntax-plan.js';
import { buildSyntaxShift } from '../app/engine/hush-syntax-shift.js';
import { verifyClaimIntegrity } from '../app/engine/hush-claim-integrity.js';
import { buildPayloadMap } from '../app/engine/hush-payload-map.js';
import { buildPayloadBindingMap } from '../app/engine/hush-payload-binding.js';
import { verifyPayloadIntegrity } from '../app/engine/hush-payload-integrity.js';

assert.equal(HUSH_SYNTAX_RECOMPOSER_VERSION, 'phase-21.2-source-detached-families');

const sourceText = 'Please keep DOC-613 with the note from 6/13. I did not change it.';
const protectedLiterals = ['DOC-613', '6/13'];
const meaningPlan = buildMeaningPlan({ sourceText, protectedLiterals });
const payloadMap = buildPayloadMap({ sourceText, meaningPlan, protectedLiterals });
const payloadBindingMap = buildPayloadBindingMap({ sourceText, payloadMap, meaningPlan, protectedLiterals });
const claimRoleMap = buildClaimRoleMap({ sourceText, meaningPlan, protectedLiterals });
const literalPlacementMap = buildLiteralPlacementMap({ sourceText, meaningPlan, claimRoleMap, protectedLiterals });
const syntaxPlan = buildSyntaxPlan({ sourceText, meaningPlan, claimRoleMap, literalPlacementMap, protectedLiterals });

const families = diversifySyntaxPlans({ candidateCount: 14 });
assert(families.length >= 14);
assert(new Set(families).size >= 4);

const text = applySyntaxOperation({ family: 'record-first', sourceText, meaningPlan, payloadMap, payloadBindingMap, syntaxPlan });
assert(text.includes('DOC-613'));
assert(text.includes('6/13'));
assert(/not|No extra claim|review|stay|together/i.test(text));

const candidate = recomposeSyntaxCandidate({ id: 'syntax-one', family: 'caveat-first', sourceText, meaningPlan, payloadMap, payloadBindingMap, syntaxPlan });
assert.equal(candidate.id, 'syntax-one');
assert.equal(candidate.family, 'caveat-first');
assert(candidate.operations.includes('payload-aware-recompose'));
assert(candidate.text.includes('DOC-613'));

const bundle = generateSyntaxRecomposerCandidates({ sourceText, meaningPlan, payloadMap, payloadBindingMap, claimRoleMap, literalPlacementMap, syntaxPlan, protectedLiterals, candidateCount: 18 });
assert.equal(bundle.version, 'phase-21.2-source-detached-families');
assert(bundle.candidates.length >= 12);
assert(bundle.candidates.every((item) => item.text.includes('DOC-613') && item.text.includes('6/13')));
assert(new Set(bundle.candidates.map((item) => item.family)).size >= 4);
assert(bundle.candidates.some((item) => buildSyntaxShift({ sourceText, outputText: item.text }).metrics.sentenceCountDelta > 0 || buildSyntaxShift({ sourceText, outputText: item.text }).metrics.openingShapeShift > 0));
assert(bundle.candidates.some((item) => buildSyntaxShift({ sourceText, outputText: item.text }).metrics.clauseOrderShift > 0));
assert(bundle.candidates.filter((item) => item.text.toLowerCase().startsWith('for reference')).length < bundle.candidates.length / 2);
assert(bundle.candidates.every((item) => verifyClaimIntegrity({ sourceText, outputText: item.text, protectedLiterals, meaningPlan }).passed));
assert(bundle.candidates.every((item) => verifyPayloadIntegrity({ sourceText, outputText: item.text, payloadMap, payloadBindingMap, protectedLiterals }).passed));

const liveSource = 'The vendor called twice after lunch. I logged INV-440 at 2:18 and told Jordan not to resend the spreadsheet until we know which version finance kept.';
const livePlan = buildMeaningPlan({ sourceText: liveSource });
const livePayload = buildPayloadMap({ sourceText: liveSource, meaningPlan: livePlan, protectedLiterals: livePlan.protectedLiterals });
const liveBindings = buildPayloadBindingMap({ sourceText: liveSource, payloadMap: livePayload, meaningPlan: livePlan });
const liveBundle = generateSyntaxRecomposerCandidates({ sourceText: liveSource, meaningPlan: livePlan, payloadMap: livePayload, payloadBindingMap: liveBindings, protectedLiterals: livePlan.protectedLiterals, candidateCount: 14 });
assert(liveBundle.candidates.every((item) => item.text.includes('INV-440')));
assert(liveBundle.candidates.every((item) => item.text.includes('2:18')));
assert(liveBundle.candidates.every((item) => item.text.includes('Jordan')));
assert(liveBundle.candidates.every((item) => /finance/i.test(item.text)));
assert(liveBundle.candidates.every((item) => /version/i.test(item.text)));

console.log('hush-syntax-recomposer tests passed');
