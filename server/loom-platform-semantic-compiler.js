export const LOOM_PLATFORM_SEMANTIC_VOCABULARY = Object.freeze({
  sp: 'source provenance',
  pp: 'path provenance',
  sb: 'system boundary',
  ob: 'observation boundary',
  dp: 'data plane',
  cp: 'control plane',
  os: 'observed state',
  es: 'estimated state',
  us: 'unknown state',
  rr: 'recovery and revalidation'
});

export const LOOM_PLATFORM_PROFILES = Object.freeze({
  quick: Object.freeze({ machine_code: 'q', human_label: 'Quick weave', reasoning_effort: 'low' }),
  deep: Object.freeze({ machine_code: 'd', human_label: 'Deep weave', reasoning_effort: 'high' })
});

const VOCABULARY_CODES = Object.freeze(Object.keys(LOOM_PLATFORM_SEMANTIC_VOCABULARY));
const VOCABULARY_BY_LENGTH = Object.freeze(
  Object.entries(LOOM_PLATFORM_SEMANTIC_VOCABULARY).sort((a, b) => b[1].length - a[1].length)
);

function encodeText(value) {
  let encoded = String(value).replaceAll('~', '~~');
  for (const [code, term] of VOCABULARY_BY_LENGTH) encoded = encoded.replaceAll(term, `~${code}`);
  return encoded;
}

function decodeText(value) {
  const input = String(value);
  let decoded = '';
  for (let index = 0; index < input.length;) {
    if (input[index] !== '~') {
      decoded += input[index];
      index += 1;
      continue;
    }
    if (input[index + 1] === '~') {
      decoded += '~';
      index += 2;
      continue;
    }
    const code = input.slice(index + 1, index + 3);
    const term = LOOM_PLATFORM_SEMANTIC_VOCABULARY[code];
    if (term) {
      decoded += term;
      index += 3;
      continue;
    }
    decoded += '~';
    index += 1;
  }
  return decoded;
}

function requireCanonicalEnvelope(canonical) {
  if (!canonical || typeof canonical !== 'object' || Array.isArray(canonical)
    || typeof canonical.task !== 'string' || !Array.isArray(canonical.documents) || !Array.isArray(canonical.rules)) {
    throw new TypeError('canonical Loom semantic envelope is required');
  }
  if (!canonical.documents.every(document => document && typeof document === 'object'
    && typeof document.id === 'string' && typeof document.name === 'string' && typeof document.text === 'string')
    || !canonical.rules.every(rule => typeof rule === 'string')) {
    throw new TypeError('canonical Loom semantic envelope contains invalid text fields');
  }
}

export function compileLoomPlatformEnvelope(canonical, options = {}) {
  requireCanonicalEnvelope(canonical);
  const profileName = options?.profile;
  if (!profileName) throw new TypeError('platform profile is required');
  const profile = LOOM_PLATFORM_PROFILES[profileName];
  if (!profile) throw new TypeError(`unsupported platform profile: ${String(profileName)}`);
  return {
    m: profile.machine_code,
    t: encodeText(canonical.task),
    d: canonical.documents.map(document => ({
      i: encodeText(document.id),
      n: encodeText(document.name),
      x: encodeText(document.text)
    })),
    r: canonical.rules.map(encodeText),
    v: [...VOCABULARY_CODES]
  };
}

export function expandLoomPlatformEnvelope(compact) {
  if (!compact || typeof compact !== 'object' || Array.isArray(compact)
    || !Array.isArray(compact.d) || !Array.isArray(compact.r)) {
    throw new TypeError('compact Loom platform envelope is required');
  }
  return {
    task: decodeText(compact.t),
    documents: compact.d.map(document => ({
      id: decodeText(document.i),
      name: decodeText(document.n),
      text: decodeText(document.x)
    })),
    rules: compact.r.map(decodeText)
  };
}

export function measureLoomPlatformEnvelope(canonical, compact) {
  requireCanonicalEnvelope(canonical);
  const canonicalCharacters = JSON.stringify(canonical).length;
  const compactCharacters = JSON.stringify(compact).length;
  const expanded = expandLoomPlatformEnvelope(compact);
  return {
    canonical_characters: canonicalCharacters,
    compact_characters: compactCharacters,
    reduction_ratio: canonicalCharacters === 0 ? 0 : (canonicalCharacters - compactCharacters) / canonicalCharacters,
    roundtrip_equal: JSON.stringify(expanded) === JSON.stringify(canonical)
  };
}
