import { loadHushRegisterRegistry } from './hush-register-registry.js';
import { adaptHushOntologyProfile } from './hush-ontology-adapter.js';
import { buildHushRegisterContract } from './hush-register-contract.js';

export const HUSH_DIALECT_CUSTODY_VERSION = 'phase-27';

const textOf = (value) => String(value ?? '').toLowerCase();
const arr = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const uniq = (value) => [...new Set(arr(value))];

function present(text = '', features = []) {
  const value = textOf(text);
  return arr(features).filter((feature) => value.includes(String(feature).toLowerCase()));
}

export function evaluateDialectCustody(input = {}) {
  const registry = input.registry || loadHushRegisterRegistry();
  const profile = adaptHushOntologyProfile(registry.profiles?.aave || {});
  const contract = input.contract || buildHushRegisterContract(input);
  const sourceFeatures = present(input.sourceText || '', profile.features);
  const outputFeatures = present(input.outputText || '', profile.features);
  const droppedFeatures = sourceFeatures.filter((feature) => !outputFeatures.includes(feature));
  const addedFeatures = outputFeatures.filter((feature) => !sourceFeatures.includes(feature));
  const hardFailures = [];
  const reviewWarnings = [];

  if (contract.registerMode === 'preserve-source' && droppedFeatures.length) hardFailures.push('register-feature-erased');
  if (contract.registerMode === 'formalize-source' && sourceFeatures.length && !arr(input.warnings).includes('register-formalized')) reviewWarnings.push('formalization-warning-required');
  if (contract.registerMode === 'transform-to-aave' && !addedFeatures.length && !outputFeatures.length) reviewWarnings.push('target-register-not-visible');
  const whiteningRisk = contract.preserveSource && sourceFeatures.length && droppedFeatures.length ? Number((droppedFeatures.length / sourceFeatures.length).toFixed(4)) : 0;

  return {
    version: HUSH_DIALECT_CUSTODY_VERSION,
    passed: hardFailures.length === 0,
    sourceFeatures,
    retainedFeatures: sourceFeatures.filter((feature) => outputFeatures.includes(feature)),
    droppedFeatures: uniq(droppedFeatures),
    addedFeatures: uniq(addedFeatures),
    whiteningRisk,
    hardFailures: uniq(hardFailures),
    reviewWarnings: uniq(reviewWarnings)
  };
}

export function summarizeDialectCustody(result = {}) {
  return {
    version: result.version || HUSH_DIALECT_CUSTODY_VERSION,
    passed: result.passed !== false,
    sourceFeatureCount: arr(result.sourceFeatures).length,
    retainedCount: arr(result.retainedFeatures).length,
    droppedFeatures: arr(result.droppedFeatures),
    addedFeatures: arr(result.addedFeatures),
    whiteningRisk: result.whiteningRisk ?? 0,
    hardFailures: arr(result.hardFailures),
    reviewWarnings: arr(result.reviewWarnings)
  };
}
