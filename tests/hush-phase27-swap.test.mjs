import assert from 'assert';
import { getHushMask } from '../app/engine/hush-mask-studio.js';
import { buildPhase27HushSwap } from '../app/engine/hush-phase27-swap.js';

const preserve = getHushMask('phase27-register-preserve');
const chat = getHushMask('phase27-chat-custody');
const blip = getHushMask('phase27-blip-bridge');
assert(preserve, 'phase27-register-preserve mask missing');
assert(chat, 'phase27-chat-custody mask missing');
assert(blip, 'phase27-blip-bridge mask missing');

const sourceText = 'idk bc FILE-72 same minute but one copy got footer and one dont?? maybe template lol but keep mismatch fr';
const result = buildPhase27HushSwap({
  sourceText,
  mask: chat,
  maskProfile: chat.profile,
  registerMode: 'preserve-source',
  options: { candidateCount: 24 }
});

assert.equal(result.version, 'phase-27');
assert.equal(result.phase25Version, 'phase-25');
assert(result.registerRegistrySummary?.aaveLoaded, 'AAVE register profile missing from summary');
assert(result.registerRegistrySummary?.chatspeakLoaded, 'chatspeak profile missing from summary');
assert(result.registerRegistrySummary?.blipLoaded, 'Blip missing from summary');
assert.equal(result.registerContract.registerMode, 'preserve-source');
assert(result.registerClassification, 'missing register classification');
assert(result.dialectCustodySummary, 'missing dialect custody summary');
assert(result.chatspeakCustodySummary, 'missing chatspeak custody summary');
assert(result.codeSwitchBoundarySummary, 'missing code-switch boundary summary');
assert(Number.isFinite(result.phase27.score), 'missing Phase 27 score');

console.log('hush-phase27-swap tests passed');
