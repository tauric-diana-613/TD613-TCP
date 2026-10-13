export const HUSH_ONTOLOGY_ADAPTER_VERSION = 'phase-27';

const obj = (value) => value && typeof value === 'object' ? value : {};
const arr = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

export function adaptHushOntologyProfile(rawProfile = {}) {
  const source = obj(rawProfile);
  const featureSets = obj(source.featureSets);
  return {
    version: HUSH_ONTOLOGY_ADAPTER_VERSION,
    id: source.id || 'unknown',
    label: source.label || source.name || source.id || 'Unknown Register Profile',
    featureSets,
    features: Object.values(featureSets).flatMap((value) => arr(value)),
    preserveRules: arr(source.preserveRules),
    transformWarnings: arr(source.transformWarnings),
    examples: arr(source.examples),
    limitations: arr(source.limitations)
  };
}

export function adaptBlipPersona(persona = {}) {
  const source = obj(persona);
  return {
    version: HUSH_ONTOLOGY_ADAPTER_VERSION,
    id: source.id || 'blip',
    label: source.name || 'Blip',
    role: source.family || 'Shorthand relay',
    traits: arr(source.chips),
    voicePromise: source.voicePromise || '',
    fieldUse: source.fieldUse || '',
    riskTell: source.riskTell || '',
    maskAffinity: ['chatspeak', 'shorthand', 'compact-signal'],
    examples: []
  };
}
