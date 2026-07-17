export const R02_COMMON_VERSION = 'td613.ash.r02-common/v0.1';

function assertScalarString(value, path) {
  if (typeof value !== 'string') throw new TypeError(`${path} must be a string.`);
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(i + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) throw new TypeError(`${path} has an unpaired surrogate.`);
      i += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) throw new TypeError(`${path} has an unpaired surrogate.`);
  }
  return value;
}

function normalize(value, path = '$') {
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'string') return assertScalarString(value, path);
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || Object.is(value, -0)) throw new TypeError(`${path} must be finite and may not be -0.`);
    return value;
  }
  if (Array.isArray(value)) return value.map((item, index) => normalize(item, `${path}[${index}]`));
  if (typeof value === 'object') {
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) throw new TypeError(`${path} must be a plain object.`);
    const out = {};
    for (const key of Object.keys(value).sort()) {
      if (typeof value[key] === 'undefined') throw new TypeError(`${path}.${key} contains undefined.`);
      out[key] = normalize(value[key], `${path}.${key}`);
    }
    return out;
  }
  throw new TypeError(`${path} contains unsupported data.`);
}

export function canonicalJson(value) {
  return JSON.stringify(normalize(value));
}

export function bytesToHex(buffer) {
  return Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function digestRecord(domain, value, cryptoImpl = globalThis.crypto) {
  if (!cryptoImpl?.subtle?.digest) throw new Error('Web Crypto SHA-256 is unavailable.');
  const bytes = new TextEncoder().encode(`${domain}\n${canonicalJson(value)}`);
  return `sha256:${bytesToHex(await cryptoImpl.subtle.digest('SHA-256', bytes))}`;
}

export function withoutKeys(value, keys) {
  return Object.fromEntries(Object.entries(value || {}).filter(([key]) => !keys.includes(key)));
}

export function nowIso(now = () => new Date()) {
  return now().toISOString();
}

export function uniqueStrings(values = []) {
  return [...new Set(values.filter(value => typeof value === 'string' && value.trim()).map(value => value.trim()))].sort();
}

export function assertNoArtifactContent(value, path = '$') {
  const forbidden = /(?:artifact_bytes|raw_bytes|raw_content|plaintext_content|capsule_plaintext|complete_case_map|room_keys|private_aliases|full_chronolog(?:y|ies)|decryption_key|source_identit(?:y|ies)|hidden_provider_state)/i;
  const walk = (item, cursor) => {
    if (Array.isArray(item)) return item.forEach((entry, index) => walk(entry, `${cursor}[${index}]`));
    if (!item || typeof item !== 'object') return;
    for (const [key, entry] of Object.entries(item)) {
      if (forbidden.test(key)) throw new TypeError(`${cursor}.${key} crosses the artifact-blind boundary.`);
      walk(entry, `${cursor}.${key}`);
    }
  };
  walk(value, path);
}

export function stateFromScore(score, bands) {
  for (const [limit, state] of bands) if (score <= limit) return state;
  return bands.at(-1)[1];
}

export function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}
