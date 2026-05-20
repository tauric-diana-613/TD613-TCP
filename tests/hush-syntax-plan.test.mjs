import assert from 'assert';
import {
  HUSH_SYNTAX_PLAN_VERSION,
  buildSyntaxPlan,
  detectSourceSyntaxSkeleton,
  proposeSyntaxOperations,
  summarizeSyntaxPlan
} from '../app/engine/hush-syntax-plan.js';
import { buildMeaningPlan } from '../app/engine/hush-meaning-plan.js';
import { buildClaimRoleMap } from '../app/engine/hush-claim-roles.js';
import { buildLiteralPlacementMap } from '../app/engine/hush-literal-placement.js';
import { buildRealizationPlan } from '../app/engine/hush-realization-plan.js';

assert.equal(HUSH_SYNTAX_PLAN_VERSION, 'phase-19');

const sourceText = 'Please keep DOC-613 with the note from 6/13, because I did not change the attachment.';
const protectedLiterals = ['DOC-613', '6/13'];
const meaningPlan = buildMeaningPlan({ sourceText, protectedLiterals });
const claimRoleMap = buildClaimRoleMap({ sourceText, meaningPlan, protectedLiterals });
const literalPlacementMap = buildLiteralPlacementMap({ sourceText, meaningPlan, claimRoleMap, protectedLiterals });
const realizationPlan = buildRealizationPlan({ mask: { id: 'procedural-neutral', label: 'Procedural Neutral', writingTraits: { sentenceLength: 'medium', punctuationStyle: 'minimal', paragraphShape: 'memo' } } });

const skeleton = detectSourceSyntaxSkeleton({ sourceText, protectedLiterals });
assert(skeleton.sentenceCount >= 1);
assert(skeleton.clauseCount >= 2);
assert(skeleton.openingShape.includes('please keep'));
assert(skeleton.closingShape.includes('attachment'));
assert(skeleton.punctuationSkeleton.includes(','));
assert(skeleton.clauseOrder.includes('evidence'));
assert(skeleton.literalPositions.some((item) => item.literal === 'DOC-613'));

const operations = proposeSyntaxOperations({ sourceText, sourceSkeleton: skeleton, claimRoleMap, realizationPlan });
assert(operations.length >= 3);
assert(operations.some((op) => op.code === 'front-load-evidence'));
assert(operations.some((op) => op.code === 'replace-opening-frame'));

const plan = buildSyntaxPlan({ sourceText, meaningPlan, claimRoleMap, literalPlacementMap, realizationPlan, protectedLiterals });
assert.equal(plan.version, 'phase-19');
assert(plan.operations.length >= 3);
assert(plan.forbiddenOperations.includes('separate-negation-from-action'));
assert(plan.forbiddenOperations.includes('separate-date-from-event'));
assert(plan.forbiddenOperations.includes('separate-doc-id-from-noun'));
assert(plan.targetSyntax.openingStrategy);
assert.equal(plan.targetSyntax.literalPlacementStrategy, 'in-unit');

const summary = summarizeSyntaxPlan(plan);
assert.equal(summary.version, 'phase-19');
assert(summary.operationCount >= 3);
assert(summary.forbiddenCount >= 3);
assert(summary.targetSentenceCount >= 1);

console.log('hush-syntax-plan tests passed');
