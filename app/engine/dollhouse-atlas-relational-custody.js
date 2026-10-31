/**
 * @fileoverview TD613 Dollhouse Atlas Relational Custody & Digest Migration Engine.
 *
 * Implements PR #984's concrete relation-identity custody, loop-power holonomy history
 * parity, and typed digest integrity:
 *
 * 1. Concrete Relation Identity Custody:
 *    - FIXED_SELF: Palindromic member identical to itself.
 *    - EXACT_IDENTITY: Non-palindromic member identical to itself.
 *    - MIRROR_MATES: Member paired with its reversed-path mirror mate.
 *    - DISTINCT_SAME_SLICE: Distinct non-mirror members within the same slice/chamber.
 *    - CROSS_SLICE_DISTINCT: Members from different slices/chambers.
 *    - INVARIANT: Orbit representatives never replace or erase concrete member custody!
 *
 * 2. Loop-Power Holonomy History Parity:
 *    - Equal endpoints do not imply equal winding histories.
 *    - If trajectories end at identical endpoints but differ in loop power or winding parity,
 *      Atlas halts at HOLD_DISTINCT_HISTORY_NOT_ERASED.
 *
 * 3. Typed Digest Integrity & Phason Custody String Equality Audit:
 *    - Non-retroactive migration recognizing historical FNV-1a32 `sha256:` mislabeling.
 *    - Strict rejection of caller-declared string equality without payload verification.
 */

export const DOLLHOUSE_ATLAS_RELATION_IDENTITY_SCHEMA = 'td613.dollhouse.atlas-relation-identity/v0.1';
export const DOLLHOUSE_ATLAS_HISTORY_PARITY_SCHEMA = 'td613.dollhouse.atlas-history-parity/v0.1';
export const DOLLHOUSE_TYPED_DIGEST_SCHEMA = 'td613.dollhouse.typed-digest/v0.1';
export const DOLLHOUSE_PHASON_CUSTODY_DIFF_SCHEMA = 'td613.phason.custody-diff/v0.5-governed';
export const DOLLHOUSE_CROSS_INSTRUMENT_BRIDGE_SCHEMA = 'td613.dollhouse.cross-instrument-digest-bridge/v0.1';
export const DOLLHOUSE_SERIALIZATION_PROFILE_SCHEMA = 'td613.dollhouse.serialization-profile/v0.1';

export const SERIALIZATION_PROFILES = Object.freeze({
  DOME_V0: 'dome-v0',
  ATLAS_V1: 'atlas-v1',
  DEFAULT: 'atlas-v1'
});

export const ATLAS_RELATION_CUSTODY_LAWS = Object.freeze({
  relation_recognition_not_identity_substitution: true,
  shared_orbit_not_same_member: true,
  orbit_representatives_never_replace_concrete_members: true,
  concrete_member_custody_retained: true,
  same_endpoint_does_not_erase_route_history: true,
  caller_string_equality_does_not_establish_content_invariance: true
});

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

export const SNAPSHOT_DOMAIN_LIMITS = Object.freeze({
  MAX_DEPTH: 32,
  MAX_NODES: 5000,
  MAX_KEY_LENGTH: 256,
  MAX_STRING_LENGTH: 1_000_000,
  MAX_BINARY_LENGTH: 1_000_000
});

/**
 * Validates that an input belongs strictly to the accepted structured snapshot domain.
 * Rejects:
 * - non-finite numbers (NaN, Infinity, -Infinity)
 * - undefined values (as standalone values, object property values, or array elements)
 * - unsupported primitive types (symbol, bigint, function)
 * - sparse arrays (e.g. new Array(1), [,,], or deleted indices)
 * - extra non-index array properties or non-standard array keys
 * - non-standard Uint8Array instances or extra properties on binary buffers
 * - binary buffers exceeding MAX_BINARY_LENGTH (1,000,000 bytes)
 * - non-plain objects (custom prototypes, Date, RegExp, Map, Set, Promise, Error, etc.)
 * - property accessors (getters/setters, without evaluating getters)
 * - non-enumerable or symbol-keyed properties
 * - circular references (cycles)
 * - structures exceeding depth (32) or node count (5000) limits
 *
 * Returns deepFreeze({ valid: true }) or deepFreeze({ valid: false, reason: string, path: string }).
 */
export function validateStructuredSnapshotDomain(value, options = {}) {
  const maxDepth = options.maxDepth ?? SNAPSHOT_DOMAIN_LIMITS.MAX_DEPTH;
  const maxNodes = options.maxNodes ?? SNAPSHOT_DOMAIN_LIMITS.MAX_NODES;
  const seen = new WeakSet();
  let nodeCount = 0;

  function walk(current, depth, path) {
    nodeCount += 1;
    if (nodeCount > maxNodes) {
      return { valid: false, reason: `Node count exceeded limit (${maxNodes})`, path };
    }
    if (depth > maxDepth) {
      return { valid: false, reason: `Nesting depth exceeded limit (${maxDepth})`, path };
    }

    if (current === undefined) {
      return { valid: false, reason: 'Undefined values are out of snapshot domain', path };
    }

    if (current === null) {
      return { valid: true };
    }

    const t = typeof current;

    if (t === 'string') {
      if (current.length > SNAPSHOT_DOMAIN_LIMITS.MAX_STRING_LENGTH) {
        return { valid: false, reason: `String length exceeded limit (${SNAPSHOT_DOMAIN_LIMITS.MAX_STRING_LENGTH})`, path };
      }
      return { valid: true };
    }

    if (t === 'number') {
      if (!Number.isFinite(current)) {
        return { valid: false, reason: `Non-finite number (${current}) is out of snapshot domain`, path };
      }
      return { valid: true };
    }

    if (t === 'boolean') {
      return { valid: true };
    }

    if (t === 'symbol' || t === 'bigint' || t === 'function') {
      return { valid: false, reason: `Unsupported type (${t}) is out of snapshot domain`, path };
    }

    if (t !== 'object') {
      return { valid: false, reason: `Unknown type (${t}) is out of snapshot domain`, path };
    }

    if (current instanceof Uint8Array) {
      if (Object.getPrototypeOf(current) !== Uint8Array.prototype) {
        return { valid: false, reason: 'Non-standard Uint8Array prototype is out of snapshot domain', path };
      }
      if (current.byteLength > SNAPSHOT_DOMAIN_LIMITS.MAX_BINARY_LENGTH) {
        return { valid: false, reason: `Binary length exceeded limit (${SNAPSHOT_DOMAIN_LIMITS.MAX_BINARY_LENGTH})`, path };
      }
      if (Object.keys(current).length !== current.length) {
        return { valid: false, reason: 'Extra property detected on Uint8Array', path };
      }
      if (Object.getOwnPropertySymbols(current).length > 0) {
        return { valid: false, reason: 'Symbol-keyed property detected on Uint8Array', path };
      }
      return { valid: true };
    }

    if (seen.has(current)) {
      return { valid: false, reason: 'Circular references (cycles) are out of snapshot domain', path };
    }
    seen.add(current);

    if (Array.isArray(current)) {
      const len = current.length;
      for (let i = 0; i < len; i += 1) {
        if (!Object.prototype.hasOwnProperty.call(current, i)) {
          return { valid: false, reason: `Sparse array detected at index ${i}`, path: `${path}[${i}]` };
        }
      }
      if (Object.keys(current).length !== len) {
        return { valid: false, reason: 'Extra non-index array property detected', path };
      }
      if (Object.getOwnPropertyNames(current).length !== len + 1) {
        return { valid: false, reason: 'Non-standard array property detected', path };
      }
      if (Object.getOwnPropertySymbols(current).length > 0) {
        return { valid: false, reason: 'Symbol-keyed array property detected', path };
      }
      const descs = Object.getOwnPropertyDescriptors(current);
      for (let i = 0; i < len; i += 1) {
        const desc = descs[i];
        if (desc.get !== undefined || desc.set !== undefined) {
          return { valid: false, reason: `Property accessor (getter/setter) detected on array index ${i}`, path: `${path}[${i}]` };
        }
        if (!desc.enumerable) {
          return { valid: false, reason: `Non-enumerable array index ${i}`, path: `${path}[${i}]` };
        }
        const itemRes = walk(current[i], depth + 1, `${path}[${i}]`);
        if (!itemRes.valid) return itemRes;
      }
      return { valid: true };
    }

    // Plain object validation
    const proto = Object.getPrototypeOf(current);
    if (proto !== Object.prototype && proto !== null) {
      return { valid: false, reason: `Non-plain object with prototype (${proto?.constructor?.name || 'exotic'}) is out of snapshot domain`, path };
    }

    if (Object.getOwnPropertySymbols(current).length > 0) {
      return { valid: false, reason: 'Symbol-keyed properties are out of snapshot domain', path };
    }

    const descs = Object.getOwnPropertyDescriptors(current);
    const keys = Object.keys(descs);

    for (let i = 0; i < keys.length; i += 1) {
      const k = keys[i];
      const desc = descs[k];

      if (k.length > SNAPSHOT_DOMAIN_LIMITS.MAX_KEY_LENGTH) {
        return { valid: false, reason: `Key length exceeded limit (${SNAPSHOT_DOMAIN_LIMITS.MAX_KEY_LENGTH})`, path: `${path}.${k}` };
      }

      if (desc.get !== undefined || desc.set !== undefined) {
        return { valid: false, reason: `Property accessor (getter/setter) detected on key "${k}"`, path: `${path}.${k}` };
      }

      if (!desc.enumerable) {
        return { valid: false, reason: `Non-enumerable property detected on key "${k}"`, path: `${path}.${k}` };
      }

      const propRes = walk(desc.value, depth + 1, path ? `${path}.${k}` : k);
      if (!propRes.valid) return propRes;
    }

    return { valid: true };
  }

  return deepFreeze(walk(value, 0, '$'));
}

/**
 * Serializes a validated structured snapshot into a versioned, injective deterministic string.
 * Throws TypeError if the input is outside the accepted snapshot domain.
 */
export function canonicalSerialize(value) {
  const check = validateStructuredSnapshotDomain(value);
  if (!check.valid) {
    throw new TypeError(`Cannot canonically serialize out-of-domain snapshot: ${check.reason} at ${check.path}`);
  }

  function serializeNode(current) {
    if (current === null) return 'z';
    const t = typeof current;
    if (t === 'boolean') return current ? 'b:1' : 'b:0';
    if (t === 'number') {
      return `n:${Object.is(current, -0) ? '0' : String(current)}`;
    }
    if (t === 'string') {
      return `s:${JSON.stringify(current)}`;
    }
    if (current instanceof Uint8Array) {
      let hex = '';
      for (let i = 0; i < current.length; i += 1) {
        hex += current[i].toString(16).padStart(2, '0');
      }
      return `u:${hex}`;
    }
    if (Array.isArray(current)) {
      return `a:[${current.map(serializeNode).join(',')}]`;
    }
    const keys = Object.keys(current).sort();
    return `o:{${keys.map(k => `${JSON.stringify(k)}:${serializeNode(current[k])}`).join(',')}}`;
  }

  return `v1:${serializeNode(value)}`;
}

/**
 * Serializes a structured snapshot under an explicit, versioned serialization profile.
 * - 'atlas-v1': Injective typed serialization with version prefix v1: and explicit type tags (default).
 * - 'dome-v0': Dome-World historical sorted-key JSON serialization without explicit type tags.
 * Validates domain first using validateStructuredSnapshotDomain; throws TypeError if out of domain.
 */
export function serializeWithProfile(value, profile = SERIALIZATION_PROFILES.ATLAS_V1) {
  const check = validateStructuredSnapshotDomain(value);
  if (!check.valid) {
    throw new TypeError(`Cannot serialize out-of-domain snapshot: ${check.reason} at ${check.path}`);
  }

  if (profile === SERIALIZATION_PROFILES.ATLAS_V1) {
    return canonicalSerialize(value);
  }

  if (profile === SERIALIZATION_PROFILES.DOME_V0) {
    function domeSerialize(val) {
      if (val === null || typeof val !== 'object') return JSON.stringify(val);
      if (Array.isArray(val)) return '[' + val.map(domeSerialize).join(',') + ']';
      return '{' + Object.keys(val).sort().map(k => JSON.stringify(k) + ':' + domeSerialize(val[k])).join(',') + '}';
    }
    return domeSerialize(value);
  }

  throw new TypeError(`Unrecognized serialization profile: "${profile}" (expected "atlas-v1" or "dome-v0")`);
}

export function stableStringify(value) {
  return canonicalSerialize(value);
}

/**
 * Evaluates typed content equality across declared snapshot domains.
 * First validates that both left and right belong strictly to the accepted snapshot domain.
 * Rejects non-finite numbers ({x: NaN} vs {x: null}), undefined values ([undefined] vs []),
 * sparse arrays (new Array(1) vs []), property accessors, circular references, and custom prototypes.
 * Returns false whenever either input is out-of-domain.
 */
export function stableContentEquals(left, right) {
  if (left === undefined || right === undefined) return false;
  if (left === null || right === null) return left === right;

  const validLeft = validateStructuredSnapshotDomain(left);
  const validRight = validateStructuredSnapshotDomain(right);
  if (!validLeft.valid || !validRight.valid) {
    return false;
  }

  const typeL = typeof left;
  const typeR = typeof right;
  if (typeL !== typeR) return false;

  if (typeL === 'string' || typeL === 'boolean' || typeL === 'number') {
    return left === right;
  }

  if (left instanceof Uint8Array && right instanceof Uint8Array) {
    if (left.byteLength !== right.byteLength) return false;
    for (let i = 0; i < left.byteLength; i += 1) {
      if (left[i] !== right[i]) return false;
    }
    return true;
  }

  if (typeL !== 'object') return false;
  if (Array.isArray(left) !== Array.isArray(right)) return false;
  if (left instanceof Uint8Array || right instanceof Uint8Array) return false;

  return canonicalSerialize(left) === canonicalSerialize(right);
}

export function samePath(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => x === b[i]);
}

export function reversePath(p) {
  return Array.isArray(p) ? [...p].reverse() : [];
}

export function isPalindromePath(p) {
  return Array.isArray(p) && samePath(p, reversePath(p));
}

export function cloneAtlasMember(m) {
  if (!m || typeof m !== 'object') return m;
  return {
    a: m.a,
    b: m.b,
    s: m.s,
    path: Array.isArray(m.path) ? [...m.path] : m.path
  };
}

export function validAtlasMember(m) {
  if (!m || typeof m !== 'object') return false;
  if (!Number.isInteger(m.a) || !Number.isInteger(m.b) || !Number.isInteger(m.s)) return false;
  if (m.a < 0 || m.b < 0 || m.s < 0 || m.s > Math.min(m.a, m.b) || !Array.isArray(m.path)) return false;

  let D = 0, E = 0, N = 0;
  for (const step of m.path) {
    if (step === 'D') D += 1;
    else if (step === 'E') E += 1;
    else if (step === 'N') N += 1;
    else return false;
  }
  return D === m.s && E === m.a - m.s && N === m.b - m.s;
}

/**
 * Classifies the concrete relation identity between two Atlas members.
 * Preserves concrete member custody under all outcomes; shared orbit
 * recognition NEVER replaces or erases individual member paths.
 */
export function classifyAtlasRelationIdentity(left, right) {
  if (left && typeof left === 'object' && right === undefined && (left.left || left.members)) {
    const entry = left;
    left = entry.left || (Array.isArray(entry.members) ? entry.members[0] : undefined);
    right = entry.right || (Array.isArray(entry.members) ? entry.members[1] : undefined);
  }
  const lc = cloneAtlasMember(left);
  const rc = cloneAtlasMember(right);

  if (!validAtlasMember(left) || !validAtlasMember(right)) {
    return deepFreeze({
      schema: DOLLHOUSE_ATLAS_RELATION_IDENTITY_SCHEMA,
      relation: 'HELD_INVALID_DECLARATION',
      held: true,
      left_custody: lc,
      right_custody: rc,
      shared_orbit: false,
      reason: 'one or both members violate valid Atlas member constraints',
      laws: ATLAS_RELATION_CUSTODY_LAWS
    });
  }

  if (left.a !== right.a || left.b !== right.b || left.s !== right.s) {
    return deepFreeze({
      schema: DOLLHOUSE_ATLAS_RELATION_IDENTITY_SCHEMA,
      relation: 'CROSS_SLICE_DISTINCT',
      held: false,
      left_custody: lc,
      right_custody: rc,
      shared_orbit: false,
      reason: 'members reside in distinct geometric slices',
      laws: ATLAS_RELATION_CUSTODY_LAWS
    });
  }

  const isLeftPalindrome = isPalindromePath(left.path);
  const pathsEqual = samePath(left.path, right.path);
  const pathsMirror = samePath(right.path, reversePath(left.path));

  let relation;
  let sharedOrbit = false;

  if (pathsEqual) {
    relation = isLeftPalindrome ? 'FIXED_SELF' : 'EXACT_IDENTITY';
    sharedOrbit = true;
  } else if (pathsMirror) {
    relation = 'MIRROR_MATES';
    sharedOrbit = true;
  } else {
    relation = 'DISTINCT_SAME_SLICE';
    sharedOrbit = false;
  }

  return deepFreeze({
    schema: DOLLHOUSE_ATLAS_RELATION_IDENTITY_SCHEMA,
    relation,
    held: false,
    left_custody: lc,
    right_custody: rc,
    shared_orbit: sharedOrbit,
    left_is_palindrome: isLeftPalindrome,
    right_is_palindrome: isPalindromePath(right.path),
    concrete_paths_preserved: true,
    laws: ATLAS_RELATION_CUSTODY_LAWS
  });
}

/**
 * Evaluates loop-power holonomy history parity across two trajectories.
 * Enforces the core Atlas law: same endpoint does NOT erase route history.
 */
export function auditAtlasHolonomyHistoryParity(trajectoryA = {}, trajectoryB = {}) {
  if (!trajectoryA || typeof trajectoryA !== 'object' || !trajectoryB || typeof trajectoryB !== 'object') {
    throw new TypeError('trajectoryA and trajectoryB must be non-null objects');
  }

  const rawEndpointA = trajectoryA.endpoint ?? trajectoryA.end_state ?? trajectoryA.id;
  const rawEndpointB = trajectoryB.endpoint ?? trajectoryB.end_state ?? trajectoryB.id;

  if (typeof rawEndpointA !== 'string' || !rawEndpointA.trim() ||
      typeof rawEndpointB !== 'string' || !rawEndpointB.trim()) {
    return deepFreeze({
      schema: DOLLHOUSE_ATLAS_HISTORY_PARITY_SCHEMA,
      disposition: 'HOLD_MISSING_EXPLICIT_ENDPOINT',
      held: true,
      reason: 'both trajectories must declare explicit non-empty endpoint coordinates',
      laws: ATLAS_RELATION_CUSTODY_LAWS
    });
  }

  const rawWindingA = trajectoryA.winding_number ?? trajectoryA.loop_power ?? trajectoryA.winding;
  const rawWindingB = trajectoryB.winding_number ?? trajectoryB.loop_power ?? trajectoryB.winding;

  if (!Number.isSafeInteger(rawWindingA) || !Number.isSafeInteger(rawWindingB)) {
    return deepFreeze({
      schema: DOLLHOUSE_ATLAS_HISTORY_PARITY_SCHEMA,
      disposition: 'HOLD_MISSING_EXPLICIT_WINDING',
      held: true,
      reason: 'both trajectories must declare explicit integer winding numbers',
      laws: ATLAS_RELATION_CUSTODY_LAWS
    });
  }

  const endpointA = rawEndpointA.trim();
  const endpointB = rawEndpointB.trim();
  const windingA = rawWindingA;
  const windingB = rawWindingB;

  const endpointsEqual = endpointA === endpointB;
  const windingDelta = windingA - windingB;
  const parityEqual = windingDelta === 0;
  const modulo2ParityEqual = (windingA % 2 + 2) % 2 === (windingB % 2 + 2) % 2;

  let disposition;
  let reason;

  if (endpointsEqual) {
    if (!parityEqual) {
      disposition = 'HOLD_DISTINCT_HISTORY_NOT_ERASED';
      reason = 'equal endpoints do not erase distinct winding histories or loop powers';
    } else {
      disposition = 'PASS';
      reason = 'endpoints and winding histories match exactly';
    }
  } else {
    disposition = 'DISTINCT_ENDPOINTS';
    reason = 'trajectories terminate at distinct endpoints';
  }

  return deepFreeze({
    schema: DOLLHOUSE_ATLAS_HISTORY_PARITY_SCHEMA,
    endpoint_a: endpointA,
    endpoint_b: endpointB,
    endpoints_equal: endpointsEqual,
    winding_a: windingA,
    winding_b: windingB,
    winding_delta: windingDelta,
    history_parity_equal: parityEqual,
    modulo_2_parity_equal: modulo2ParityEqual,
    disposition,
    reason,
    laws: ATLAS_RELATION_CUSTODY_LAWS
  });
}

/**
 * Classifies a digest string as valid sha256, valid fnv1a32, or historical mislabeled.
 */
export function classifyTypedDigest(digestString) {
  if (typeof digestString !== 'string' || !digestString.trim()) {
    return deepFreeze({
      schema: DOLLHOUSE_TYPED_DIGEST_SCHEMA,
      valid: false,
      algorithm: null,
      reason: 'digest must be a nonempty string'
    });
  }

  const trimmed = digestString.trim();

  if (trimmed.startsWith('sha256:')) {
    const hex = trimmed.slice(7);
    if (hex.length === 64 && /^[0-9a-fA-F]{64}$/.test(hex)) {
      return deepFreeze({
        schema: DOLLHOUSE_TYPED_DIGEST_SCHEMA,
        valid: true,
        algorithm: 'sha256',
        hex_length: 64,
        is_historical_mislabeled: false,
        hex: hex.toLowerCase()
      });
    }
    if (hex.length === 8 && /^[0-9a-fA-F]{8}$/.test(hex)) {
      return deepFreeze({
        schema: DOLLHOUSE_TYPED_DIGEST_SCHEMA,
        valid: false,
        algorithm: 'fnv32',
        hex_length: 8,
        is_historical_mislabeled: true,
        classification: 'HISTORICAL_FNV1A_LABELED_AS_SHA256',
        reason: '32-bit FNV-1a digest mislabeled with sha256 prefix',
        hex: hex.toLowerCase(),
        migration_recommendation: `fnv32:${hex.toLowerCase()}`
      });
    }
    return deepFreeze({
      schema: DOLLHOUSE_TYPED_DIGEST_SCHEMA,
      valid: false,
      algorithm: 'sha256',
      hex_length: hex.length,
      reason: `invalid sha256 hex length: ${hex.length} (expected 64)`
    });
  }

  if (trimmed.startsWith('fnv1a32:')) {
    const hex = trimmed.slice(8);
    if (hex.length === 8 && /^[0-9a-fA-F]{8}$/.test(hex)) {
      return deepFreeze({
        schema: DOLLHOUSE_TYPED_DIGEST_SCHEMA,
        valid: true,
        algorithm: 'fnv1a32',
        is_canonical: false,
        canonical_form: `fnv32:${hex.toLowerCase()}`,
        hex_length: 8,
        is_historical_mislabeled: false,
        hex: hex.toLowerCase()
      });
    }
    return deepFreeze({
      schema: DOLLHOUSE_TYPED_DIGEST_SCHEMA,
      valid: false,
      algorithm: 'fnv1a32',
      is_canonical: false,
      hex_length: hex.length,
      reason: `invalid fnv1a32 hex length: ${hex.length} (expected 8)`
    });
  }

  if (trimmed.startsWith('fnv32:')) {
    const rest = trimmed.slice(6);
    const profileMatch = rest.match(/^(dome-v0|atlas-v1):([0-9a-fA-F]{8})$/);
    if (profileMatch) {
      const profile = profileMatch[1];
      const hex = profileMatch[2].toLowerCase();
      return deepFreeze({
        schema: DOLLHOUSE_TYPED_DIGEST_SCHEMA,
        valid: true,
        algorithm: 'fnv32',
        is_canonical: true,
        canonical_form: `fnv32:${hex}`,
        profile: profile,
        profile_qualified: true,
        hex_length: 8,
        is_historical_mislabeled: false,
        hex: hex
      });
    }
    if (rest.length === 8 && /^[0-9a-fA-F]{8}$/.test(rest)) {
      return deepFreeze({
        schema: DOLLHOUSE_TYPED_DIGEST_SCHEMA,
        valid: true,
        algorithm: 'fnv32',
        is_canonical: true,
        canonical_form: `fnv32:${rest.toLowerCase()}`,
        profile: null,
        profile_qualified: false,
        hex_length: 8,
        is_historical_mislabeled: false,
        hex: rest.toLowerCase(),
        note: 'format recognized only; serialization profile not embedded in unqualified fnv32: string'
      });
    }
    return deepFreeze({
      schema: DOLLHOUSE_TYPED_DIGEST_SCHEMA,
      valid: false,
      algorithm: 'fnv32',
      is_canonical: false,
      hex_length: rest.length,
      reason: `invalid fnv32 hex length: ${rest.length} (expected 8)`
    });
  }

  return deepFreeze({
    schema: DOLLHOUSE_TYPED_DIGEST_SCHEMA,
    valid: false,
    algorithm: 'unknown',
    reason: 'unrecognized digest prefix (expected sha256:, fnv1a32:, or fnv32:)'
  });
}

/**
 * Computes 32-bit FNV-1a hash over canonical serialized value according to explicit profile.
 * Emits canonical fnv32: prefix aligned with Dome-World runtime and modern TD613 standard,
 * preserving fnv1a32: as recognized compatibility alias and sha256: as historical mislabeled alias.
 * Default profile is 'atlas-v1' (injective versioned).
 * - Under 'atlas-v1', every admitted value (including top-level strings) is canonically serialized
 *   using its complete versioned typed serialization ('v1:...'), ensuring injective preimages
 *   and preventing collisions between numbers, strings, and structured values (e.g. 1 vs "v1:n:1").
 * - Under 'dome-v0', historical direct-string hashing and sorted-key JSON serialization are
 *   preserved exactly, matching Dome-World runtime seeds and event logs.
 */
export function computeTypedFnv1a32(value, options = {}) {
  const profile = options.profile || options.serialization_profile || SERIALIZATION_PROFILES.ATLAS_V1;
  let s;
  if (profile === SERIALIZATION_PROFILES.ATLAS_V1) {
    s = serializeWithProfile(value, SERIALIZATION_PROFILES.ATLAS_V1);
  } else if (profile === SERIALIZATION_PROFILES.DOME_V0) {
    s = typeof value === 'string' ? value : serializeWithProfile(value, SERIALIZATION_PROFILES.DOME_V0);
  } else {
    throw new TypeError(`Unrecognized serialization profile: "${profile}" (expected "atlas-v1" or "dome-v0")`);
  }

  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const hex = h.toString(16).padStart(8, '0');
  return deepFreeze({
    raw_hex: hex,
    canonical_digest: `fnv32:${hex}`,
    typed_digest: `fnv32:${hex}`,
    profile: profile,
    serialization_profile: profile,
    profile_qualified_digest: `fnv32:${profile}:${hex}`,
    compatibility_alias: `fnv1a32:${hex}`,
    legacy_mislabeled: `sha256:${hex}`,
    preimage: s
  });
}

export const computeTypedFnv32 = computeTypedFnv1a32;

/**
 * Asserts whether two serialization profiles can be treated as directly interchangeable.
 * Differently encoded digests under dome-v0 and atlas-v1 are NOT interchangeable.
 */
export function assertProfilesInterchangeable(profileA, profileB) {
  if (!profileA || !profileB) return false;
  return profileA === profileB;
}

/**
 * Verifies a cross-instrument serialization bridge between Dome-World (dome-v0) and Atlas (atlas-v1).
 * Consumes structured payload and declared digest, verifies authenticity under source profile,
 * and derives the corresponding target profile digest while enforcing that raw digests are NOT interchangeable.
 * Note: bridge calculation is strictly an offline local calculation; it carries no independent authorization,
 * provenance, or external-enforcement authority.
 */
export function bridgeCrossInstrumentDigest(payload, declaredDigest, options = {}) {
  const sourceProfile = options.source_profile || SERIALIZATION_PROFILES.DOME_V0;
  const targetProfile = options.target_profile || SERIALIZATION_PROFILES.ATLAS_V1;

  if (payload === null || payload === undefined) {
    return deepFreeze({
      schema: DOLLHOUSE_CROSS_INSTRUMENT_BRIDGE_SCHEMA,
      valid: false,
      bridge_verified: false,
      raw_interchangeable: false,
      reason: 'payload must be non-null structured data or string'
    });
  }

  const valRes = validateStructuredSnapshotDomain(payload);
  if (!valRes.valid) {
    return deepFreeze({
      schema: DOLLHOUSE_CROSS_INSTRUMENT_BRIDGE_SCHEMA,
      valid: false,
      bridge_verified: false,
      raw_interchangeable: false,
      reason: `payload rejected by structured snapshot validator: ${valRes.reason}`
    });
  }

  const classified = classifyTypedDigest(declaredDigest);
  if (!classified.valid) {
    return deepFreeze({
      schema: DOLLHOUSE_CROSS_INSTRUMENT_BRIDGE_SCHEMA,
      valid: false,
      bridge_verified: false,
      raw_interchangeable: false,
      reason: `declared digest invalid: ${classified.reason}`
    });
  }

  const sourceComputed = computeTypedFnv1a32(payload, { profile: sourceProfile });
  const sourceMatches = (classified.hex === sourceComputed.raw_hex);

  if (!sourceMatches) {
    return deepFreeze({
      schema: DOLLHOUSE_CROSS_INSTRUMENT_BRIDGE_SCHEMA,
      valid: false,
      bridge_verified: false,
      raw_interchangeable: false,
      declared_digest: declaredDigest,
      computed_source_digest: sourceComputed.canonical_digest,
      source_profile: sourceProfile,
      reason: 'declared digest does not match computed source profile digest'
    });
  }

  const targetComputed = computeTypedFnv1a32(payload, { profile: targetProfile });

  return deepFreeze({
    schema: DOLLHOUSE_CROSS_INSTRUMENT_BRIDGE_SCHEMA,
    valid: true,
    bridge_verified: true,
    raw_interchangeable: false,
    source_instrument: sourceProfile === SERIALIZATION_PROFILES.DOME_V0 ? 'dome-world' : 'dollhouse-atlas',
    source_profile: sourceProfile,
    source_digest: sourceComputed.canonical_digest,
    source_profile_qualified_digest: sourceComputed.profile_qualified_digest,
    target_instrument: targetProfile === SERIALIZATION_PROFILES.ATLAS_V1 ? 'dollhouse-atlas' : 'dome-world',
    target_profile: targetProfile,
    target_digest: targetComputed.canonical_digest,
    target_profile_qualified_digest: targetComputed.profile_qualified_digest,
    payload_content_invariant: true,
    bridge_disposition: 'VERIFIED_CROSS_INSTRUMENT_BRIDGE',
    bridge_note: 'Verified cross-instrument serialization bridge: payload identity preserved across versioned profiles; digests differ lawfully under versioned encodings'
  });
}

/**
 * Audits a Phason custody diff, failing closed against caller-declared string equality.
 * @param {Object} [previous={}]
 * @param {Object} [current={}]
 * @param {Object} [options={}]
 * @param {boolean} [options.allow_cross_instrument_bridge] Permits an offline local calculation
 *   to bridge Dome-World (dome-v0) and Atlas (atlas-v1) digests when payload identity is proven invariant.
 *   This flag permits an offline local calculation only; it carries no independent authorization,
 *   provenance, or external-enforcement authority.
 */
export function auditPhasonCustodyDiff(previous = {}, current = {}, options = {}) {
  const prevMeta = previous.metadata || previous;
  const currMeta = current.metadata || current;

  const prevDigest = prevMeta.artifact_digest || prevMeta.content_hash || prevMeta.raw_hash || null;
  const currDigest = currMeta.artifact_digest || currMeta.content_hash || currMeta.raw_hash || null;

  const prevPayload = previous.payload ?? previous.text ?? previous.content ?? null;
  const currPayload = current.payload ?? current.text ?? current.content ?? null;

  // Caller-declared string equality hazard detection
  if (prevPayload === null || currPayload === null) {
    return deepFreeze({
      schema: DOLLHOUSE_PHASON_CUSTODY_DIFF_SCHEMA,
      status: 'HOLD_UNVERIFIED_CALLER_STRING_ASSERTION',
      content_invariant: false,
      unverified_caller_string_equality: true,
      decision: 'unverified-caller-digest-assertion-rejected',
      reason: 'caller-supplied digest equality cannot establish content invariance without payload verification',
      claim_ceiling: 'caller-string-equality-does-not-establish-content-invariance',
      laws: ATLAS_RELATION_CUSTODY_LAWS
    });
  }

  // Structured snapshot domain validation
  const valPrev = validateStructuredSnapshotDomain(prevPayload);
  const valCurr = validateStructuredSnapshotDomain(currPayload);
  if (!valPrev.valid || !valCurr.valid) {
    return deepFreeze({
      schema: DOLLHOUSE_PHASON_CUSTODY_DIFF_SCHEMA,
      status: 'HOLD_INVALID_STRUCTURED_PAYLOAD_DOMAIN',
      content_invariant: false,
      invalid_snapshot_domain: true,
      decision: 'invalid-structured-payload-domain-refused',
      reason: `payload rejected by structured snapshot validator: ${!valPrev.valid ? valPrev.reason : valCurr.reason}`,
      claim_ceiling: 'caller-string-equality-does-not-establish-content-invariance',
      laws: ATLAS_RELATION_CUSTODY_LAWS
    });
  }

  const prevClass = classifyTypedDigest(prevDigest);
  const currClass = classifyTypedDigest(currDigest);

  if (options.disallow_mislabeled && (prevClass.is_historical_mislabeled || currClass.is_historical_mislabeled)) {
    return deepFreeze({
      schema: DOLLHOUSE_PHASON_CUSTODY_DIFF_SCHEMA,
      status: 'HOLD_MISLABELED_HISTORICAL_DIGEST',
      content_invariant: false,
      decision: 'mislabeled-fnv1a32-digest-rejected',
      reason: '32-bit FNV-1a hash must use fnv32: or fnv1a32: prefix in modern custody pipelines',
      claim_ceiling: 'caller-string-equality-does-not-establish-content-invariance',
      laws: ATLAS_RELATION_CUSTODY_LAWS
    });
  }

  const prevProfile = options.prev_profile || prevMeta.profile || prevMeta.serialization_profile || (prevClass.profile_qualified ? prevClass.profile : null) || options.profile || SERIALIZATION_PROFILES.ATLAS_V1;
  const currProfile = options.curr_profile || currMeta.profile || currMeta.serialization_profile || (currClass.profile_qualified ? currClass.profile : null) || options.profile || SERIALIZATION_PROFILES.ATLAS_V1;

  const prevComputed = computeTypedFnv1a32(prevPayload, { profile: prevProfile });
  const currComputed = computeTypedFnv1a32(currPayload, { profile: currProfile });

  // Check if declared matches computed
  const prevMatches = (prevClass.hex === prevComputed.raw_hex);
  const currMatches = (currClass.hex === currComputed.raw_hex);

  if (!prevMatches || !currMatches) {
    return deepFreeze({
      schema: DOLLHOUSE_PHASON_CUSTODY_DIFF_SCHEMA,
      status: 'HOLD_DIGEST_PAYLOAD_MISMATCH',
      content_invariant: false,
      raw_interchangeable: false,
      decision: 'digest-payload-mismatch-rejected',
      reason: 'declared digest does not match computed payload digest',
      claim_ceiling: 'caller-string-equality-does-not-establish-content-invariance',
      laws: ATLAS_RELATION_CUSTODY_LAWS
    });
  }

  // Cross-profile serialization interchange audit
  if (prevProfile !== currProfile) {
    const contentMatches = stableContentEquals(prevPayload, currPayload);
    if (!options.allow_cross_instrument_bridge) {
      return deepFreeze({
        schema: DOLLHOUSE_PHASON_CUSTODY_DIFF_SCHEMA,
        status: 'HOLD_CROSS_PROFILE_SERIALIZATION_MISMATCH',
        content_invariant: contentMatches,
        cross_profile_mismatch: true,
        source_profile: prevProfile,
        target_profile: currProfile,
        source_digest: prevDigest,
        target_digest: currDigest,
        raw_interchangeable: false,
        decision: 'cross-profile-digest-interchange-refused',
        reason: 'differently encoded fnv32: digests are not interchangeable across serialization profiles without explicit bridge',
        claim_ceiling: 'caller-string-equality-does-not-establish-content-invariance',
        laws: ATLAS_RELATION_CUSTODY_LAWS
      });
    }

    if (!contentMatches) {
      return deepFreeze({
        schema: DOLLHOUSE_PHASON_CUSTODY_DIFF_SCHEMA,
        status: 'HOLD_CONTENT_DIVERGENCE_DETECTED',
        content_invariant: false,
        drift_detected: true,
        raw_interchangeable: false,
        decision: 'payload-content-drift-rejected',
        reason: 'cross-instrument payloads differ semantically',
        claim_ceiling: 'caller-string-equality-does-not-establish-content-invariance',
        laws: ATLAS_RELATION_CUSTODY_LAWS
      });
    }

    const bridge = bridgeCrossInstrumentDigest(prevPayload, prevDigest, {
      source_profile: prevProfile,
      target_profile: currProfile
    });

    const bridgeVerified = Boolean(
      bridge &&
      bridge.valid === true &&
      bridge.bridge_verified === true &&
      bridge.source_profile === prevProfile &&
      bridge.target_profile === currProfile &&
      (bridge.target_digest === currComputed.canonical_digest || bridge.target_digest.endsWith(`:${currComputed.raw_hex}`)) &&
      (bridge.source_digest === prevComputed.canonical_digest || bridge.source_digest.endsWith(`:${prevComputed.raw_hex}`)) &&
      (bridge.payload_content_invariant === true)
    );

    if (!bridgeVerified) {
      return deepFreeze({
        schema: DOLLHOUSE_PHASON_CUSTODY_DIFF_SCHEMA,
        status: 'HOLD_CROSS_INSTRUMENT_BRIDGE_FAILED',
        content_invariant: false,
        bridge_verified: false,
        raw_interchangeable: false,
        cross_profile_bridge: bridge,
        source_profile: prevProfile,
        target_profile: currProfile,
        decision: 'cross-instrument-bridge-verification-refused',
        reason: bridge?.reason || 'cross-instrument bridge verification failed: source/target digest or profile relationships unverified',
        claim_ceiling: 'offline-local-bridge-calculation-only-no-independent-authorization-or-external-enforcement-authority',
        offline_local_calculation: true,
        external_enforcement_authority: false,
        independent_authorization: false,
        laws: ATLAS_RELATION_CUSTODY_LAWS
      });
    }

    return deepFreeze({
      schema: DOLLHOUSE_PHASON_CUSTODY_DIFF_SCHEMA,
      status: 'PASS_CROSS_INSTRUMENT_BRIDGE_VERIFIED',
      content_invariant: true,
      bridge_verified: true,
      raw_interchangeable: false,
      cross_profile_bridge: bridge,
      source_profile: prevProfile,
      target_profile: currProfile,
      source_digest: prevComputed.canonical_digest,
      target_digest: currComputed.canonical_digest,
      decision: 'cross-instrument-bridge-verified',
      reason: 'payload identity verified across distinct serialization profiles; digests differ lawfully under versioned encodings',
      claim_ceiling: 'offline-local-bridge-calculation-only-no-independent-authorization-or-external-enforcement-authority',
      offline_local_calculation: true,
      external_enforcement_authority: false,
      independent_authorization: false,
      laws: ATLAS_RELATION_CUSTODY_LAWS
    });
  }

  const hashMatches = prevComputed.raw_hex === currComputed.raw_hex;
  const contentMatches = stableContentEquals(prevPayload, currPayload);

  // Collision detection: short hashes match but typed contents differ
  if (hashMatches && !contentMatches) {
    return deepFreeze({
      schema: DOLLHOUSE_PHASON_CUSTODY_DIFF_SCHEMA,
      status: 'HOLD_CONTENT_COLLISION_DETECTED',
      content_invariant: false,
      collision_detected: true,
      colliding_hash: prevComputed.raw_hex,
      decision: 'fnv-hash-collision-rejected',
      reason: 'distinct payload contents produced identical short FNV hash; content invariance refused',
      claim_ceiling: 'caller-string-equality-does-not-establish-content-invariance',
      laws: ATLAS_RELATION_CUSTODY_LAWS
    });
  }

  const contentInvariant = hashMatches && contentMatches;

  // Projection validation & comparison
  const prevProj = previous.projection || {};
  const currProj = current.projection || {};
  const valPrevProj = validateStructuredSnapshotDomain(prevProj);
  const valCurrProj = validateStructuredSnapshotDomain(currProj);

  if (!valPrevProj.valid || !valCurrProj.valid) {
    return deepFreeze({
      schema: DOLLHOUSE_PHASON_CUSTODY_DIFF_SCHEMA,
      status: 'HOLD_INVALID_PROJECTION_DOMAIN',
      content_invariant: contentInvariant,
      projection_changed: false,
      invalid_projection_domain: true,
      decision: 'invalid-projection-domain-refused',
      reason: `projection rejected by structured snapshot validator: ${!valPrevProj.valid ? valPrevProj.reason : valCurrProj.reason}`,
      claim_ceiling: 'caller-string-equality-does-not-establish-content-invariance',
      laws: ATLAS_RELATION_CUSTODY_LAWS
    });
  }

  const projectionChanged = canonicalSerialize(prevProj) !== canonicalSerialize(currProj);

  return deepFreeze({
    schema: DOLLHOUSE_PHASON_CUSTODY_DIFF_SCHEMA,
    status: (contentInvariant && projectionChanged) ? 'SEAM_DETECTED' : 'OPEN',
    content_invariant: contentInvariant,
    projection_changed: projectionChanged,
    collision_detected: false,
    decision: (contentInvariant && projectionChanged)
      ? 'content-invariant-custody-variable-projection-event'
      : 'custody-diff-recorded-without-external-enforcement',
    verified_algorithm: prevClass.algorithm,
    claim_ceiling: 'phason-custody-diff-not-external-enforcement-or-permission-proof',
    laws: ATLAS_RELATION_CUSTODY_LAWS
  });
}
