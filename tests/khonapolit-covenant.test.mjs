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
  MARROWLINE_USER_INGRESS,
  MARROWLINE_USER_CLOSURE,
  frameMarrowlineUserTurn,
  analyzeKhonaIntegrity,
  buildInvocationPacket,
  KHONAPOLIT_HISTORY_MAX_UTF8_BYTES,
  classifyEmergence,
  validateShi
} from '../app/dome-world/khonapolit-covenant.js';

assert.equal(INGRESS_SIGIL, '𝌋');
assert.equal(SEAL_GLYPH, '⟐');
assert.equal(MARROWLINE_USER_INGRESS, '𝌋‌ ');
assert.equal(MARROWLINE_USER_CLOSURE, '\n\nSealed ⟐');
const originalRedDeerInput = 'Tell me about the grove.';
const sealedProviderInput = frameMarrowlineUserTurn(originalRedDeerInput);
assert.equal(sealedProviderInput, '𝌋‌ Tell me about the grove.\n\nSealed ⟐');
assert.equal(frameMarrowlineUserTurn(sealedProviderInput), sealedProviderInput, 'provider ingress/closure must not duplicate');
assert.equal(frameMarrowlineUserTurn(sealedProviderInput + '\n'), sealedProviderInput, 'trailing whitespace cannot multiply seals');
assert.equal(originalRedDeerInput, 'Tell me about the grove.', 'visible authored text remains unmodified');

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

const lateConstraint = 'A'.repeat(6000) + ' NEVER DISCLOSE THE LINKAGE';
const longPrompt = buildInvocationPacket({ message: lateConstraint, waiveIssuance: true });
assert.equal(longPrompt.canInvoke, false);
assert.equal(longPrompt.inputError.code, 'message-too-long');
assert.equal(longPrompt.message, lateConstraint, 'reject the oversized input rather than dropping its final constraint');
const longHistory = buildInvocationPacket({ message: 'Continue.', history: [{ role: 'user', text: lateConstraint }], waiveIssuance: true });
assert.equal(longHistory.canInvoke, false);
assert.equal(longHistory.inputError.code, 'history-entry-too-long');
assert.equal(longHistory.history[0].text, lateConstraint);
assert.equal(buildInvocationPacket({ message: 'A'.repeat(6000), waiveIssuance: true }).canInvoke, true);
// The 6,000-unit composer limit must never constrain a successful model return.
for (const count of [6000, 6001, 12000, 50000]) {
  const native = '\n ' + 'A\u0301\u0316'.repeat(count) + ' \n'; // Preserve provider-authored outer whitespace, too.
  const packet = buildInvocationPacket({ message: 'Continue.', history: [{ role: 'model', text: native }], waiveIssuance: true });
  assert.equal(packet.canInvoke, true, 'provider-authored history of ' + count + ' marked graphemes must be retained');
  assert.equal(packet.history[0].text, native, 'no Unicode marks or tail bytes may be clipped');
}
const boundedHistory = 'A\u0301\u0316'.repeat(700000);
const boundedPacket = buildInvocationPacket({ message: 'Continue.', history: [{ role: 'model', text: boundedHistory }], waiveIssuance: true });
assert.equal(boundedPacket.canInvoke, false);
assert.equal(boundedPacket.inputError.code, 'history-budget-exceeded');
assert.equal(boundedPacket.inputError.limit, KHONAPOLIT_HISTORY_MAX_UTF8_BYTES);
assert.ok(boundedPacket.inputError.actual > KHONAPOLIT_HISTORY_MAX_UTF8_BYTES);
assert.equal(boundedPacket.history[0].text, boundedHistory, 'aggregate budget refusal never shortens the stored answer');
// Two individually admissible model turns can exceed the aggregate budget together.
const oneLongModelTurn = 'A\u0301\u0316'.repeat(320000);
assert.equal(buildInvocationPacket({ message: 'Continue.', history: [{ role: 'model', text: oneLongModelTurn }], waiveIssuance: true }).canInvoke, true);
const joinedHistory = buildInvocationPacket({ message: 'Continue.', history: [
  { role: 'model', text: oneLongModelTurn },
  { role: 'model', text: oneLongModelTurn }
], waiveIssuance: true });
assert.equal(joinedHistory.canInvoke, false);
assert.equal(joinedHistory.inputError.code, 'history-budget-exceeded');
assert.equal(joinedHistory.history.length, 2);
assert.equal(joinedHistory.history[0].text, oneLongModelTurn);
assert.equal(joinedHistory.history[1].text, oneLongModelTurn);


console.log('khonapolit-covenant: keys, issuance, integrity, and emergence classes ok');
