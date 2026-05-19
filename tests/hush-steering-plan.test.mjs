import assert from 'assert';
import { extractCadenceProfile } from '../app/engine/stylometry.js';
import { buildResidualVector } from '../app/engine/hush-residual-vector.js';
import { buildProtectedLiteralLockbox } from '../app/engine/hush-protected-literal-lockbox.js';
import {
  HUSH_STEERING_PLAN_VERSION,
  MODE_WEIGHT_PROFILES,
  getHushWeightProfile,
  scoreCandidateWithSteering,
  buildSteeringPlan,
  summarizeSteeringPlan
} from '../app/engine/hush-steering-plan.js';

assert.equal(HUSH_STEERING_PLAN_VERSION, 'phase-17');
assert(MODE_WEIGHT_PROFILES.neutralize);
assert(MODE_WEIGHT_PROFILES['legal-intake']);

const legal = getHushWeightProfile('neutralize', 'legal-intake');
assert.equal(legal.minProtectedLiteralScore, 1);
assert(legal.semanticFidelity > legal.maskMatch);

const neutralScore = scoreCandidateWithSteering({ maskMatch: 0.8, semanticFidelity: 0.7, protectedLiteralScore: 1, sourceReductionScore: 0.5, contextSafetyScore: 0.5, operatorMode: 'neutralize' });
assert(Number.isFinite(neutralScore.finalScore));
assert.equal(neutralScore.vetoes.length, 0);
assert(Array.isArray(neutralScore.reviewWarnings));

const legalBad = scoreCandidateWithSteering({ maskMatch: 0.95, semanticFidelity: 0.7, protectedLiteralScore: 0.9, sourceReductionScore: 0.9, contextSafetyScore: 0.9, contextType: 'legal-intake' });
assert(legalBad.finalScore < neutralScore.finalScore);
assert(legalBad.vetoes.includes('semantic-fidelity-below-mode-floor'));
assert(legalBad.vetoes.includes('protected-literal-score-below-mode-floor'));

const sourceText = 'I write in long recursive sentences, looping through the same idea with recurring pressure, visible rhythm, and too many clauses that stay close to the protected baseline.';
const maskText = 'File attached. Date visible. Label unchanged. Keep together.';
const outputText = 'I write in long recursive sentences, looping through EXHIBIT-42 with recurring pressure and too many clauses.';
const lockbox = buildProtectedLiteralLockbox({ sourceText: `${sourceText} EXHIBIT-42`, manualLiterals: ['EXHIBIT-42'] });
const residualVector = buildResidualVector({ sourceText, outputText, maskProfile: extractCadenceProfile(maskText) });
const residualScore = scoreCandidateWithSteering({ maskMatch: 0.8, semanticFidelity: 0.9, protectedLiteralScore: 1, sourceReductionScore: 0.1, contextSafetyScore: 0.8, residualVector });
assert.equal(residualScore.vetoes.includes('critical-residual-dimension-hot'), false);
assert(residualScore.reviewWarnings.length >= 1);

const plan = buildSteeringPlan({ sourceText, outputText, maskProfile: extractCadenceProfile(maskText), residualVector, lockbox });
assert.equal(plan.version, 'phase-17');
assert(['targeted-rewrite', 'seal-review'].includes(plan.route));
assert(plan.steps.length >= 1);
assert(plan.residualSummary);
assert(plan.lockboxSummary);

const summary = summarizeSteeringPlan(plan);
assert.equal(summary.version, 'phase-17');
assert(summary.stepCount >= 1);
assert(summary.firstStep);

const missingPlan = buildSteeringPlan({ sourceText, outputText: 'No marker remains here.', maskProfile: extractCadenceProfile(maskText), lockbox });
assert(missingPlan.steps.some((step) => step.code === 'restore-literals'));

console.log('hush-steering-plan tests passed');
