import assert from 'assert';
import { evaluateChatspeakCustody } from '../app/engine/hush-chatspeak-custody.js';
import { buildHushRegisterContract } from '../app/engine/hush-register-contract.js';

const source = 'idk bc FILE-72 same minute one footer one not?? maybe template lol but keep mismatch fr';
const kept = evaluateChatspeakCustody({ sourceText: source, outputText: 'idk bc FILE-72 same minute one footer one not?? maybe template lol keep mismatch fr', contract: buildHushRegisterContract({ registerMode: 'preserve-source' }) });
assert.equal(kept.passed, true);
assert.equal(kept.droppedSignals.length, 0);

const dropped = evaluateChatspeakCustody({ sourceText: source, outputText: 'FILE-72 had a footer mismatch.', contract: buildHushRegisterContract({ registerMode: 'preserve-source' }) });
assert.equal(dropped.passed, false);
assert(dropped.hardFailures.includes('chatspeak-feature-erased'));

const formal = evaluateChatspeakCustody({ sourceText: source, outputText: 'FILE-72 had a footer mismatch.', contract: buildHushRegisterContract({ registerMode: 'formalize-source' }) });
assert.equal(formal.passed, true);
assert(formal.reviewWarnings.includes('chat-formalization-warning-required'));

console.log('hush-chatspeak-custody tests passed');
