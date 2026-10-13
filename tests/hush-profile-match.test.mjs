import assert from 'assert';
import { extractCadenceProfile } from '../app/engine/stylometry.js';
import {
  HUSH_PROFILE_MATCH_VERSION,
  buildProfileMatch,
  summarizeProfileMatch,
  classifyProfileMatch,
  detectProfileMatchWarnings
} from '../app/engine/hush-profile-match.js';
import { detectForbiddenClaims } from '../app/engine/claim-ladder.js';

assert.equal(HUSH_PROFILE_MATCH_VERSION, 'phase-11');

const maskText = 'File attached. Date visible. Label unchanged. Keep together.';
const outputText = 'File attached. EXHIBIT-42 date visible. Label unchanged. Keep together.';
const sourceText = 'Please preserve EXHIBIT-42 and explain that the file name and date should remain attached to the record.';

const maskProfile = extractCadenceProfile(maskText);
const outputProfile = extractCadenceProfile(outputText);
const match = buildProfileMatch({
  sourceText,
  outputText,
  maskProfile,
  outputProfile,
  protectedLiterals: ['EXHIBIT-42'],
  escapeVector: { scores: { semanticFidelity: 0.92, sourceResidualRisk: 0.34 } }
});

assert.equal(match.version, 'phase-11');
assert(Number.isFinite(match.matchScore));
assert(match.matchScore >= 0);
assert(match.dimensionScores);
for (const key of ['sentenceLength', 'punctuation', 'contractions', 'recurrence', 'abstraction', 'modifiers', 'compression']) {
  assert(Object.prototype.hasOwnProperty.call(match.dimensionScores, key), `missing dimension ${key}`);
}
assert(['no-signal', 'outside-band', 'partial', 'strong', 'overfit-risk'].includes(match.toleranceStatus));
assert.equal(match.protectedLiteralStatus, 'preserved');
assert.equal(match.protectedLiteralScore, 1);

const summary = summarizeProfileMatch(match);
assert.equal(summary.version, 'phase-11');
assert.equal(summary.protectedLiteralStatus, 'preserved');

assert.equal(classifyProfileMatch({ matchScore: 0.01 }), 'no-signal');
assert.equal(classifyProfileMatch({ matchScore: 0.5 }), 'partial');
assert.equal(classifyProfileMatch({ matchScore: 0.95 }), 'overfit-risk');

const dropped = buildProfileMatch({
  sourceText,
  outputText: 'File attached. Date visible. Label unchanged.',
  maskProfile,
  protectedLiterals: ['EXHIBIT-42'],
  escapeVector: { scores: { semanticFidelity: 0.92, sourceResidualRisk: 0.21 } }
});
assert.equal(dropped.protectedLiteralStatus, 'missing-protected-literals');
assert(dropped.warnings.includes('protected-literal-drop'));

const meaningDrift = buildProfileMatch({
  sourceText,
  outputText,
  maskProfile,
  protectedLiterals: ['EXHIBIT-42'],
  escapeVector: { scores: { semanticFidelity: 0.22, sourceResidualRisk: 0.7 } }
});
assert(meaningDrift.warnings.includes('meaning-drift'));
assert(meaningDrift.warnings.includes('source-residual-high'));

const shortOutput = buildProfileMatch({ sourceText, outputText: 'EXHIBIT-42.', maskProfile, protectedLiterals: ['EXHIBIT-42'] });
assert(shortOutput.warnings.includes('short-output'));

const hot = detectProfileMatchWarnings({ matchScore: 0.8, toleranceStatus: 'strong', semanticFidelity: 0.9, protectedLiteralStatus: 'preserved', sourceResidualRisk: 0.2, recognitionPressure: 0.8, outputWordCount: 20 });
assert(hot.includes('context-pressure-hot'));

assert.equal(detectForbiddenClaims(JSON.stringify(match)).hasForbiddenClaim, false);

console.log('hush-profile-match tests passed');
