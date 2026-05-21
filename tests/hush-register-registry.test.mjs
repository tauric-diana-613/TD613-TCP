import assert from 'assert';
import { loadHushRegisterRegistry } from '../app/engine/hush-register-registry.js';
import { adaptBlipPersona, adaptHushOntologyProfile } from '../app/engine/hush-ontology-adapter.js';

const registry = loadHushRegisterRegistry();
assert.equal(registry.loaded, true);
assert(registry.profiles.aave, 'AAVE register profile missing');
assert(registry.profiles.chatspeak, 'chatspeak register profile missing');
assert(registry.profiles.blip, 'Blip persona missing');
assert.equal(registry.profiles.blip.id, 'blip');

const aave = adaptHushOntologyProfile(registry.profiles.aave);
const chatspeak = adaptHushOntologyProfile(registry.profiles.chatspeak);
const blip = adaptBlipPersona(registry.profiles.blip);
assert(aave.features.includes('finna'));
assert(chatspeak.features.includes('idk'));
assert(blip.traits.includes('shorthand relay'));

console.log('hush-register-registry tests passed');
