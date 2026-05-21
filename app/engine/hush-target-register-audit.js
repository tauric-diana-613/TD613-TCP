import { loadHushRegisterRegistry } from './hush-register-registry.js';
import { adaptHushOntologyProfile } from './hush-ontology-adapter.js';
import { mapEventShape, scoreEventShapeRetention } from './hush-event-shape.js';
import { buildTargetRegisterPlan } from './hush-target-register-plan.js';

export const HUSH_TARGET_REGISTER_AUDIT_VERSION = 'phase-28';

const textOf = (value) => String(value ?? '').toLowerCase();
const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const uniq = (value) => [...new Set(list(value))];

function presentFeatures(text = '', features = []) {
  const value = textOf(text);
  return uniq(features.filter((feature) => value.includes(String(feature).toLowerCase())));
}

function sourceLiterals(text = '') {
  return ['FILE-72', 'INV-440', 'ROSTER-8', 'DOC-31', 'FORM-19', '2:18', '4:30', '05/20', '17:06'].filter((literal) => String(text || '').includes(literal));
}

function certaintyInflated(sourceText = '', outputText = '') {
  const source = textOf(sourceText);
  const output = textOf(outputText);
  const hedged = source.includes('maybe') || source.includes('may be') || /\bmay\b/.test(source) || source.includes('idk') || source.includes('not saying') || source.includes('could');
  const hardened = output.includes('proves') || output.includes('confirmed misconduct') || output.includes('definitely') || output.includes('intentional');
  return hedged && hardened;
}

function overcooked(targetRegister = '', targetFeatures = [], outputText = '') {
  const found = presentFeatures(outputText, targetFeatures);
  if (targetRegister === 'aave') return found.length > 6;
  if (targetRegister === 'chatspeak') return found.length > 8;
  if (targetRegister === 'blip') return found.length > 5;
  return false;
}

function identityRisk(outputText = '') {
  const output = textOf(outputText);
  return output.includes('identity-marker:') || output.includes('speaker-identity:');
}

export function auditTargetRegisterShift(input = {}) {
  const registry = input.registry || loadHushRegisterRegistry(input.registryInput || {});
  const plan = input.plan || buildTargetRegisterPlan({ ...input, registry });
  const outputText = String(input.outputText || '');
  const sourceText = String(input.sourceText || '');
  const targetRegister = plan.targetRegister || input.targetRegister || 'none';
  const profile = targetRegister === 'aave'
    ? adaptHushOntologyProfile(registry.profiles?.aave || {})
    : targetRegister === 'chatspeak'
      ? adaptHushOntologyProfile(registry.profiles?.chatspeak || {})
      : { features: plan.targetFeatures || [] };
  const targetFeatures = plan.targetFeatures?.length ? plan.targetFeatures : profile.features;
  const targetFeaturesAdded = presentFeatures(outputText, targetFeatures);
  const requiredLiterals = sourceLiterals(sourceText);
  const missingLiterals = requiredLiterals.filter((literal) => !outputText.includes(literal));
  const eventShape = scoreEventShapeRetention({ sourceText, outputText, eventShape: mapEventShape(sourceText) });
  const hardFailures = [];
  const warnings = list(plan.warnings);

  if (missingLiterals.length) hardFailures.push('protected-literal-dropped');
  if (eventShape.passed === false) hardFailures.push('event-shape-lost');
  if (certaintyInflated(sourceText, outputText)) hardFailures.push('certainty-inflated');
  if (['aave', 'chatspeak', 'blip'].includes(targetRegister) && !targetFeaturesAdded.length) hardFailures.push('target-register-not-visible');
  if (overcooked(targetRegister, targetFeatures, outputText)) hardFailures.push('target-register-overcooked');
  if (identityRisk(outputText)) hardFailures.push('identity-inference-risk');

  return {
    version: HUSH_TARGET_REGISTER_AUDIT_VERSION,
    passed: hardFailures.length === 0,
    targetRegister,
    targetFeaturesAdded,
    sourceFactsPreserved: missingLiterals.length === 0,
    missingLiterals,
    eventShapePassed: eventShape.passed !== false,
    eventShapeScore: eventShape.score,
    certaintyInflation: certaintyInflated(sourceText, outputText),
    registerOverreach: overcooked(targetRegister, targetFeatures, outputText),
    warnings: uniq(warnings),
    hardFailures: uniq(hardFailures)
  };
}

export function summarizeTargetRegisterAudit(audit = {}) {
  return {
    version: audit.version || HUSH_TARGET_REGISTER_AUDIT_VERSION,
    passed: audit.passed !== false,
    targetRegister: audit.targetRegister || 'none',
    targetFeatureCount: list(audit.targetFeaturesAdded).length,
    sourceFactsPreserved: audit.sourceFactsPreserved === true,
    eventShapePassed: audit.eventShapePassed !== false,
    certaintyInflation: Boolean(audit.certaintyInflation),
    registerOverreach: Boolean(audit.registerOverreach),
    hardFailures: list(audit.hardFailures),
    warnings: list(audit.warnings)
  };
}
