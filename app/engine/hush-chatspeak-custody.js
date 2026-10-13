import { loadHushRegisterRegistry } from './hush-register-registry.js';
import { adaptHushOntologyProfile } from './hush-ontology-adapter.js';
import { buildHushRegisterContract } from './hush-register-contract.js';

export const HUSH_CHATSPEAK_CUSTODY_VERSION = 'phase-27';

const textOf = (value) => String(value ?? '').toLowerCase();
const arr = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const uniq = (value) => [...new Set(arr(value))];

function present(text = '', features = []) {
  const value = textOf(text);
  return arr(features).filter((feature) => value.includes(String(feature).toLowerCase()));
}

function affectSignals(text = '') {
  const raw = String(text || '');
  return raw.match(/[!?]{2,}|😭|💀|lol|lmao|fr|ngl|idk/gi) || [];
}

export function evaluateChatspeakCustody(input = {}) {
  const registry = input.registry || loadHushRegisterRegistry();
  const profile = adaptHushOntologyProfile(registry.profiles?.chatspeak || {});
  const contract = input.contract || buildHushRegisterContract(input);
  const sourceFeatures = uniq([...present(input.sourceText || '', profile.features), ...affectSignals(input.sourceText || '')]);
  const outputFeatures = uniq([...present(input.outputText || '', profile.features), ...affectSignals(input.outputText || '')]);
  const droppedFeatures = sourceFeatures.filter((feature) => !outputFeatures.some((out) => String(out).toLowerCase() === String(feature).toLowerCase()));
  const hardFailures = [];
  const reviewWarnings = [];
  if (contract.chatspeakPolicy === 'preserve' && droppedFeatures.length && sourceFeatures.length) hardFailures.push('chatspeak-feature-erased');
  if (contract.registerMode === 'formalize-source' && sourceFeatures.length && !arr(input.warnings).includes('register-formalized')) reviewWarnings.push('chat-formalization-warning-required');
  const affectLossScore = sourceFeatures.length ? Number((droppedFeatures.length / sourceFeatures.length).toFixed(4)) : 0;
  return { version: HUSH_CHATSPEAK_CUSTODY_VERSION, passed: hardFailures.length === 0, sourceSignals: sourceFeatures, outputSignals: outputFeatures, droppedSignals: droppedFeatures, affectLossScore, hardFailures, reviewWarnings };
}

export function summarizeChatspeakCustody(result = {}) {
  return { version: result.version || HUSH_CHATSPEAK_CUSTODY_VERSION, passed: result.passed !== false, sourceSignalCount: arr(result.sourceSignals).length, outputSignalCount: arr(result.outputSignals).length, droppedSignals: arr(result.droppedSignals), affectLossScore: result.affectLossScore ?? 0, hardFailures: arr(result.hardFailures), reviewWarnings: arr(result.reviewWarnings) };
}
