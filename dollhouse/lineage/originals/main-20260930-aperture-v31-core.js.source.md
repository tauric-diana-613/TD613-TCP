import { canonicalDigest } from '../dome-world/ash/canonical-json.js';

export const SHA256 = /^sha256:[0-9a-f]{64}$/;

export const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
export const freeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
};
export const text = (value, label) => {
  const output = String(value || '').trim();
  if (!output) throw new Error(`${label} is required.`);
  return output;
};
export const digest = (value, label) => {
  const output = String(value || '');
  if (!SHA256.test(output)) throw new Error(`${label} must be SHA-256.`);
  return output;
};
export const integer = (value, label, { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } = {}) => {
  if (!Number.isSafeInteger(value) || value < min || value > max) throw new Error(`${label} must be a safe integer from ${min} through ${max}.`);
  return value;
};
export const uniqueStrings = values => [...new Set((values || []).map(value => text(value, 'Array value')))];
export const randomId = (prefix, cryptoImpl = globalThis.crypto) => {
  if (!cryptoImpl?.getRandomValues) throw new Error('Secure random values are unavailable.');
  const bytes = new Uint8Array(10); cryptoImpl.getRandomValues(bytes);
  return `${prefix}${Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')}`;
};
export const without = (value, field) => { const output = clone(value); delete output[field]; return output; };
export const sign = value => value > 0 ? 'POSITIVE' : value < 0 ? 'NEGATIVE' : 'ZERO';
export const ratio = (numerator, denominator) => ({
  numerator: integer(numerator, 'Ratio numerator'),
  denominator: integer(denominator, 'Ratio denominator', { min: 1 }),
  decimal_display: (numerator / denominator).toFixed(6)
});
export const recordDigest = (domain, value, field, options = {}) => canonicalDigest(domain, without(value, field), options);
export const verifyRecord = async (domain, value, field, schema, options = {}) => Boolean(value && value.schema === schema && value[field] === await recordDigest(domain, value, field, options));
