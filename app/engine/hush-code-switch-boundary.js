import { buildHushRegisterContract } from './hush-register-contract.js';

export const HUSH_CODE_SWITCH_BOUNDARY_VERSION = 'phase-27';

const textOf = (value) => String(value ?? '').toLowerCase();
const arr = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

function hasBoundary(text = '') {
  const value = textOf(text);
  return (value.includes('girl') || value.includes('sis') || value.includes('bruh') || value.includes('idk') || value.includes('bc')) && value.includes('for the record');
}

export function evaluateCodeSwitchBoundaries(input = {}) {
  const contract = input.contract || buildHushRegisterContract(input);
  const sourceBoundary = hasBoundary(input.sourceText || '');
  const outputBoundary = hasBoundary(input.outputText || '');
  const hardFailures = [];
  const warnings = [];
  if (sourceBoundary && contract.codeSwitchPolicy === 'preserve-boundaries' && !outputBoundary) hardFailures.push('code-switch-boundary-erased');
  if (sourceBoundary && contract.codeSwitchPolicy === 'normalize-with-warning' && !arr(input.warnings).includes('register-formalized')) warnings.push('boundary-normalization-warning-required');
  return { version: HUSH_CODE_SWITCH_BOUNDARY_VERSION, passed: hardFailures.length === 0, boundaries: sourceBoundary ? ['relational-to-record'] : [], preservedBoundaries: sourceBoundary && outputBoundary ? ['relational-to-record'] : [], erasedBoundaries: sourceBoundary && !outputBoundary ? ['relational-to-record'] : [], warnings, hardFailures };
}

export function summarizeCodeSwitchBoundaries(result = {}) {
  return { version: result.version || HUSH_CODE_SWITCH_BOUNDARY_VERSION, passed: result.passed !== false, boundaries: arr(result.boundaries), preservedBoundaries: arr(result.preservedBoundaries), erasedBoundaries: arr(result.erasedBoundaries), warnings: arr(result.warnings), hardFailures: arr(result.hardFailures) };
}
