import { loadHushRegisterRegistry } from './hush-register-registry.js';
import { adaptHushOntologyProfile } from './hush-ontology-adapter.js';

export const HUSH_REGISTER_CLASSIFIER_VERSION = 'phase-27';

const textOf = (value) => String(value ?? '').toLowerCase();
const arr = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

function countFeatures(text = '', features = []) {
  const value = textOf(text);
  return arr(features).filter((feature) => value.includes(String(feature).toLowerCase())).length;
}

function punctuationBurstCount(text = '') {
  return (String(text || '').match(/[!?]{2,}|\/{1,}|😭|💀/g) || []).length;
}

export function classifyHushRegister(input = {}) {
  const registry = input.registry || loadHushRegisterRegistry();
  const aave = adaptHushOntologyProfile(registry.profiles?.aave || {});
  const chatspeak = adaptHushOntologyProfile(registry.profiles?.chatspeak || {});
  const sourceText = String(input.sourceText ?? '');
  const outputText = String(input.outputText ?? '');
  const sourceLower = textOf(sourceText);
  const sourceAave = countFeatures(sourceText, aave.features);
  const sourceChat = countFeatures(sourceText, chatspeak.features) + punctuationBurstCount(sourceText);
  const outputAave = countFeatures(outputText, aave.features);
  const outputChat = countFeatures(outputText, chatspeak.features) + punctuationBurstCount(outputText);
  const features = [];
  if (sourceAave) features.push('aave-marked');
  if (sourceChat) features.push('chatspeak');
  if (sourceLower.includes('for the record') && (sourceAave || sourceChat)) features.push('code-switched');
  if (punctuationBurstCount(sourceText)) features.push('punctuation-heavy');
  if (sourceLower.includes('maybe') || sourceLower.includes('idk')) features.push('hedged');
  return {
    version: HUSH_REGISTER_CLASSIFIER_VERSION,
    sourceRegister: sourceAave ? 'aave-marked' : sourceChat ? 'chatspeak' : sourceLower.includes('for the record') ? 'plain-record' : 'plain-witness',
    outputRegister: outputAave ? 'aave-marked' : outputChat ? 'chatspeak' : textOf(outputText).includes('for the record') ? 'plain-record' : 'plain-witness',
    features,
    metrics: { sourceAave, sourceChat, outputAave, outputChat, sourcePunctuationBursts: punctuationBurstCount(sourceText), outputPunctuationBursts: punctuationBurstCount(outputText) },
    risks: [],
    confidence: Math.min(1, Number(((sourceAave + sourceChat + 1) / 8).toFixed(4)))
  };
}
