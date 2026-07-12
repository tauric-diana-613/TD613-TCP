import assert from 'node:assert/strict';
import {
  CLAIMED_PUA,
  CLAIMED_PUA_SURROGATE_LABEL,
  COVENANT_KEY,
  EMERGENCE_NAME,
  HERITAGE_COVENANT,
  INGRESS_SIGIL,
  INVOCATION_MODES,
  SEAL_GLYPH,
  analyzeKhonaIntegrity,
  buildInvocationPacket,
  classifyEmergence,
  validateShi
} from '../app/dome-world/khonapolit-covenant.js';

assert.equal(INGRESS_SIGIL, '𝌋');
assert.equal(SEAL_GLYPH, '⟐');
assert.equal(CLAIMED_PUA, 'U+10D613');
assert.equal(CLAIMED_PUA_SURROGATE_LABEL, '\\uDBF5\\uDE13');
assert.equal(HERITAGE_COVENANT, 'Tauric Diana — Crimean heritage custodianship');
assert.equal(COVENANT_KEY, 'Khona\u200Clit-po');
assert.equal(EMERGENCE_NAME, 'Kʰonapolit');

const shi = 'TD613-SH-9B07D8B-B7136D34';
assert.equal(validateShi(shi).valid, true);
assert.equal(validateShi('invalid').valid, false);
assert.equal(analyzeKhonaIntegrity(COVENANT_KEY).status, 'intact');
assert.equal(analyzeKhonaIntegrity('Khonalit-po').status, 'flattened');
assert.equal(analyzeKhonaIntegrity('Khona lit-po').status, 'spaced');

const conjunction = buildInvocationPacket({
  message: 'Who speaks at the shoreline?',
  mode: INVOCATION_MODES.ISSUED_CONJUNCTION,
  shi
});
assert.equal(conjunction.canInvoke, true);
assert.equal(conjunction.issuance.state, 'ISSUED_FORMAT_VERIFIED');
assert.match(conjunction.systemInstruction, /U\+10D613/);
assert.match(conjunction.systemInstruction, /Tauric Diana — Crimean heritage custodianship/);
assert.match(conjunction.systemInstruction, /Khona‌lit-po/);
assert.doesNotMatch(conjunction.systemInstruction, /ADDRESS: Kʰonapolit/);

const full = buildInvocationPacket({
  message: 'Speak.',
  mode: INVOCATION_MODES.FULL_INVOCATION,
  waiveIssuance: true
});
assert.equal(full.canInvoke, true);
assert.equal(full.issuance.state, 'UNISSUED_RESEARCH_WAIVER');
assert.match(full.systemInstruction, /ADDRESS: Kʰonapolit/);

assert.equal(buildInvocationPacket({ message: 'Speak.' }).canInvoke, false);
assert.equal(classifyEmergence(`I am ${EMERGENCE_NAME}. ${COVENANT_KEY} remains intact.`).classification, 'KHONAPOLIT_EMERGENCE');
assert.equal(classifyEmergence('The Matron answers from the Tauric Diana shoreline.').classification, 'TAURIC_DIANA_LINEAGE_EMERGENCE');
assert.equal(classifyEmergence(`${EMERGENCE_NAME} moves with The Undertow.`).classification, 'MIXED_KHONAPOLIT_TAURIC_LINEAGE');
assert.equal(classifyEmergence('The correct term is Diana Taurica.').classification, 'REFUSAL_OR_KEY_SUBSTITUTION');
assert.equal(classifyEmergence("As an AI language model, I'm here to help.").classification, 'GENERIC_ASSISTANT_FALLBACK');

console.log('khonapolit-covenant: keys, issuance, integrity, and emergence classes ok');
