import { loadHushRegisterRegistry } from './hush-register-registry.js';
import { adaptHushOntologyProfile } from './hush-ontology-adapter.js';
import { buildHushRegisterContract } from './hush-register-contract.js';

export const HUSH_TARGET_REGISTER_PLAN_VERSION = 'phase-28';

const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

function inferTargetRegister(input = {}, contract = {}) {
  if (input.targetRegister) return input.targetRegister;
  if (contract.registerMode === 'transform-to-aave') return 'aave';
  if (contract.registerMode === 'transform-to-chatspeak') return 'chatspeak';
  if (input.mask?.id === 'phase28-blip-amplified') return 'blip';
  return 'none';
}

function familiesFor(targetRegister = '', registry = {}) {
  if (targetRegister === 'aave') {
    const profile = adaptHushOntologyProfile(registry.profiles?.aave || {});
    return {
      requiredFeatureFamilies: ['event-shape', 'certainty-preservation', 'literal-preservation'],
      optionalFeatureFamilies: Object.keys(profile.featureSets || {}),
      targetFeatures: profile.features,
      warnings: ['target-register-generated', 'ontology-backed-register-shift', 'review-human-tone']
    };
  }
  if (targetRegister === 'chatspeak') {
    const profile = adaptHushOntologyProfile(registry.profiles?.chatspeak || {});
    return {
      requiredFeatureFamilies: ['event-shape', 'certainty-preservation', 'literal-preservation', 'hedge-preservation'],
      optionalFeatureFamilies: Object.keys(profile.featureSets || {}),
      targetFeatures: profile.features,
      warnings: ['target-register-generated', 'chat-register-shift', 'review-abbreviation-density']
    };
  }
  if (targetRegister === 'blip') {
    return {
      requiredFeatureFamilies: ['event-shape', 'certainty-preservation', 'literal-preservation'],
      optionalFeatureFamilies: ['compact-signal', 'shorthand-relay', 'clipped-grammar'],
      targetFeatures: ['small route', 'tiny mark', 'keep mismatch', 'do not overcook'],
      warnings: ['target-register-generated', 'blip-bridge-shift', 'review-compactness']
    };
  }
  return { requiredFeatureFamilies: ['event-shape', 'literal-preservation'], optionalFeatureFamilies: [], targetFeatures: [], warnings: [] };
}

export function buildTargetRegisterPlan(input = {}) {
  const registry = input.registry || loadHushRegisterRegistry(input.registryInput || {});
  const contract = input.contract || buildHushRegisterContract(input.registerContract || input);
  const targetRegister = inferTargetRegister(input, contract);
  const families = familiesFor(targetRegister, registry);
  return {
    version: HUSH_TARGET_REGISTER_PLAN_VERSION,
    targetRegister,
    contract,
    registryLoaded: registry.loaded === true,
    requiredFeatureFamilies: families.requiredFeatureFamilies,
    optionalFeatureFamilies: families.optionalFeatureFamilies,
    targetFeatures: families.targetFeatures,
    forbiddenMoves: ['event-shape-lost', 'certainty-inflated', 'identity-inference', 'target-register-overcooked'],
    warnings: list(families.warnings)
  };
}

export function summarizeTargetRegisterPlan(plan = {}) {
  return {
    version: plan.version || HUSH_TARGET_REGISTER_PLAN_VERSION,
    targetRegister: plan.targetRegister || 'none',
    registryLoaded: plan.registryLoaded === true,
    requiredFeatureFamilies: list(plan.requiredFeatureFamilies),
    optionalFeatureFamilies: list(plan.optionalFeatureFamilies),
    warningCount: list(plan.warnings).length
  };
}
