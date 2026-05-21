import personas from '../data/personas.js';
import registerProfiles from '../data/hush-phase27-ontologies.js';

export const HUSH_REGISTER_REGISTRY_VERSION = 'phase-27';

const arr = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

export function loadHushRegisterRegistry(input = {}) {
  const registryPersonas = arr(input.personaRegistry || personas);
  const blip = input.blipPersona || registryPersonas.find((persona) => persona.id === 'blip') || null;
  const profiles = {
    aave: input.aave || registerProfiles.aave || null,
    chatspeak: input.chatspeak || registerProfiles.chatspeak || null,
    blip
  };
  const missing = Object.entries(profiles).filter((entry) => !entry[1]).map((entry) => entry[0]);
  return {
    version: HUSH_REGISTER_REGISTRY_VERSION,
    loaded: missing.length === 0,
    profiles,
    sources: {
      aave: profiles.aave ? 'app/data/hush-phase27-ontologies.js#aave' : '',
      chatspeak: profiles.chatspeak ? 'app/data/hush-phase27-ontologies.js#chatspeak' : '',
      blip: profiles.blip ? 'app/data/personas.js#blip' : ''
    },
    missing
  };
}

export function summarizeHushRegisterRegistry(registry = {}) {
  return {
    version: registry.version || HUSH_REGISTER_REGISTRY_VERSION,
    loaded: registry.loaded === true,
    aaveLoaded: Boolean(registry.profiles?.aave),
    chatspeakLoaded: Boolean(registry.profiles?.chatspeak),
    blipLoaded: Boolean(registry.profiles?.blip),
    missing: arr(registry.missing),
    sources: registry.sources || {}
  };
}
