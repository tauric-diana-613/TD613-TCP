import assert from 'assert';
import {
  analyzeKhonaLitPoIntegrity,
  analyzeNormalizationDelta,
  analyzeProtectedLiteralIntegrity,
  analyzeTokenizerDivergence,
  analyzeUnicodeSurface,
  buildIngestionFrictionAudit
} from '../app/engine/ingestion-friction.js';
import { buildEscapeVector } from '../app/engine/escape-vector.js';

assert.equal(typeof buildIngestionFrictionAudit, 'function');
assert.equal(typeof analyzeUnicodeSurface, 'function');
assert.equal(typeof analyzeKhonaLitPoIntegrity, 'function');

const plain = buildIngestionFrictionAudit({ text: 'This is a plain sentence with simple punctuation.' });
assert.equal(typeof plain.ingestionFriction, 'number');
assert.equal(plain.unicodeSurface.hiddenMarkCount, 0);
assert.equal(plain.unicodeSurface.zwnjCount, 0);
assert.equal(plain.normalization.nfkcChanged, false);
assert(!plain.warnings.includes('high-ingestion-friction'));

const canonical = buildIngestionFrictionAudit({ text: 'Khona\u200Clit-po' });
assert(canonical.unicodeSurface.zwnjCount >= 1);
assert.equal(canonical.khonaLitPo.status, 'intact');
assert(canonical.warnings.includes('zwnj-present'));

assert.equal(analyzeKhonaLitPoIntegrity('Khonalit-po').status, 'normalized');
assert(['normalized', 'broken'].includes(analyzeKhonaLitPoIntegrity('Khona lit-po').status));
assert.equal(analyzeKhonaLitPoIntegrity('Khona po lit').status, 'broken');

const hidden = buildIngestionFrictionAudit({ text: 'alpha\u200Bbeta and gamma\u2060delta' });
assert(hidden.unicodeSurface.hiddenMarkCount >= 2);
assert(hidden.warnings.includes('hidden-marks-present'));

const puaGlyph = buildIngestionFrictionAudit({
  text: 'Private mark \uE000 and glyph 𝌋 appear here.',
  canonicalTokens: { glyphs: ['𝌋'], badgeStrings: [] }
});
assert(puaGlyph.unicodeSurface.puaCount >= 1);
assert(puaGlyph.unicodeSurface.glyphsObserved.includes('𝌋'));

const fullWidth = analyzeNormalizationDelta('ＡＢＣ １２３');
assert.equal(fullWidth.nfkcChanged, true);
assert(fullWidth.nfkcDelta > 0);
const fullWidthAudit = buildIngestionFrictionAudit({ text: 'ＡＢＣ １２３' });
assert(fullWidthAudit.warnings.includes('nfkc-mutates-text'));

const literalAudit = buildIngestionFrictionAudit({
  text: 'This note omits the protected marker.',
  protectedLiterals: ['EXHIBIT-42']
});
assert(['partial', 'broken'].includes(literalAudit.protectedLiterals.status));
assert(literalAudit.protectedLiterals.missing.includes('EXHIBIT-42'));
assert(literalAudit.warnings.includes('protected-literal-broken'));

const plainTokens = analyzeTokenizerDivergence('alpha beta gamma');
const hiddenTokens = analyzeTokenizerDivergence('alpha\u200B beta gamma');
assert(hiddenTokens.tokenizerDivergence >= plainTokens.tokenizerDivergence);

const surface = analyzeUnicodeSurface('hello 𝌋', { glyphs: ['𝌋'], badgeStrings: [] });
assert(surface.glyphsObserved.includes('𝌋'));

const vector = buildEscapeVector({
  protectedBaselineText: 'I kept circling the room because the story needed its ache and all the clauses kept returning to the same witness surface.',
  maskText: 'Need the bag. Knock twice. Keep it simple. Say less. Move fast and stay near the back door.',
  draftText: 'Please preserve EXHIBIT-42 while routing the message through a shorter field voice.',
  outputText: 'Need the bag. Knock twice. Keep it simple. EXHIBIT-42 stays in the note. Move fast.',
  protectedLiterals: ['EXHIBIT-42'],
  options: { thresholds: { minWords: 5 }, targetContext: 'secure group chat' }
});
assert.equal(typeof vector.scores.ingestionFriction, 'number');
assert.equal(vector.diagnostics.ingestionStatus, 'measured');
assert(!vector.diagnostics.warnings.includes('ingestion-friction-pending-phase-2'));

console.log('ingestion-friction tests passed');
