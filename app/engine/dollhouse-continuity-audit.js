import { runFadtAgent } from './dollhouse-atlas-fadt.js';

export const ATLAS_CONTINUITY_AUDIT_SCHEMA = 'td613.dollhouse.atlas-continuity-audit/v0.1';
export const FADT_STAGE_AUDIT_SCHEMA = 'td613.dollhouse.fadt-stage-audit/v0.1';

const COORDINATES = Object.freeze([
  'source_revision', 'original_ref', 'current_ref', 'predecessor_ref',
  'selected_commitments', 'policy_commitment', 'missingness', 'claim_ceiling'
]);
const INVARIANTS = Object.freeze([
  'source_revision', 'original_ref', 'selected_commitments', 'policy_commitment', 'claim_ceiling'
]);
const MAX_ITEMS = 128;

function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function record(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) {
    throw new TypeError(`${label} must be a plain data object.`);
  }
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== 'string') throw new TypeError(`${label} cannot contain symbol keys.`);
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor.get || descriptor.set) throw new TypeError(`${label} cannot contain accessors.`);
    if (!descriptor.enumerable) throw new TypeError(`${label} cannot contain hidden fields.`);
  }
  return value;
}

function exactKeys(value, allowed, label) {
  record(value, label);
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) throw new TypeError(`${label} has an unsupported field: ${key}.`);
  }
  return value;
}

function text(value, label) {
  if (typeof value !== 'string' || !value.trim() || value.length > 512) {
    throw new TypeError(`${label} must be a nonempty string of at most 512 characters.`);
  }
  return value;
}

function array(value, label) {
  if (!Array.isArray(value) || value.length > MAX_ITEMS) {
    throw new TypeError(`${label} must be an array of at most ${MAX_ITEMS} entries.`);
  }
  for (let index = 0; index < value.length; index += 1) {
    if (!Object.hasOwn(value, index)) throw new TypeError(`${label} cannot contain missing entries.`);
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (descriptor.get || descriptor.set) throw new TypeError(`${label} cannot contain accessors.`);
  }
  if (Reflect.ownKeys(value).length !== value.length + 1) throw new TypeError(`${label} cannot contain extra fields.`);
  return value;
}

function stringSet(value, label) {
  const entries = array(value, label).map((item, index) => text(item, `${label}[${index}]`));
  if (new Set(entries).size !== entries.length) throw new TypeError(`${label} cannot contain duplicate entries.`);
  return [...entries].sort();
}

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function coordinate(snapshot, key, label) {
  if (!Object.hasOwn(snapshot, key)) return { state: 'UNKNOWN', value: null };
  const value = snapshot[key];
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    record(value, `${label}.${key}`);
    if (value.withheld === true) {
      exactKeys(value, ['withheld', 'reason'], `${label}.${key}`);
      return { state: 'WITHHELD', value: null, reason: text(value.reason, `${label}.${key}.reason`) };
    }
  }
  if (key === 'selected_commitments') {
    const ids = new Set();
    const commitments = array(value, `${label}.${key}`).map((item, index) => {
      exactKeys(item, ['id', 'commitment'], `${label}.${key}[${index}]`);
      const id = text(item.id, `${label}.${key}[${index}].id`);
      if (ids.has(id)) throw new TypeError(`${label}.${key} contains duplicate id: ${id}.`);
      ids.add(id);
      return { id, commitment: text(item.commitment, `${label}.${key}[${index}].commitment`) };
    });
    commitments.sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0);
    return { state: 'DECLARED', value: commitments };
  }
  if (key === 'missingness' || key === 'claim_ceiling') {
    return { state: 'DECLARED', value: stringSet(value, `${label}.${key}`) };
  }
  // A declared null predecessor explicitly marks a root; a missing field stays UNKNOWN.
  if (key === 'predecessor_ref' && value === null) return { state: 'DECLARED', value: null };
  return { state: 'DECLARED', value: text(value, `${label}.${key}`) };
}

function snapshot(value, label) {
  exactKeys(value, ['id', ...COORDINATES], label);
  return {
    id: text(value.id, `${label}.id`),
    coordinates: Object.fromEntries(COORDINATES.map(key => [key, coordinate(value, key, label)]))
  };
}

function difference(before, after, keys = COORDINATES) {
  return keys.map(key => {
    const from = before.coordinates[key];
    const to = after.coordinates[key];
    const state = from.state === 'WITHHELD' || to.state === 'WITHHELD' ? 'WITHHELD'
      : from.state === 'UNKNOWN' || to.state === 'UNKNOWN' ? 'UNKNOWN'
        : canonical(from.value) === canonical(to.value) ? 'PRESERVED' : 'CHANGED';
    return { coordinate: key, state, from, to };
  });
}

function declaredLink(previous, current) {
  const oldCurrent = previous.coordinates.current_ref;
  const newCurrent = current.coordinates.current_ref;
  const newPredecessor = current.coordinates.predecessor_ref;
  const oldPredecessor = previous.coordinates.predecessor_ref;
  const relevant = [oldCurrent, newCurrent, newPredecessor, oldPredecessor];
  if (relevant.some(item => item.state === 'WITHHELD')) return 'WITHHELD';
  if (relevant.some(item => item.state === 'UNKNOWN')) return 'UNKNOWN';
  if (oldCurrent.value === newCurrent.value) {
    return oldPredecessor.value === newPredecessor.value ? 'PRESERVED' : 'MISMATCH';
  }
  return newPredecessor.value === oldCurrent.value ? 'DECLARED_LINK' : 'MISMATCH';
}

/**
 * Pure comparison of caller-declared continuity references and controls.
 * Equality and a matching predecessor are consistency observations, never authenticated admission.
 * Receiver presentation bytes are intentionally outside this bounded control comparison.
 */
export function runAtlasContinuityAudit(input) {
  exactKeys(input, ['origin', 'previous', 'current', 'presentations'], 'Atlas continuity input');
  const origin = snapshot(input.origin, 'origin');
  const previous = snapshot(input.previous, 'previous');
  const current = snapshot(input.current, 'current');
  const presentations = array(Object.hasOwn(input, 'presentations') ? input.presentations : [], 'presentations')
    .map((item, index) => snapshot(item, `presentations[${index}]`));
  const receiverIds = presentations.map(item => item.id);
  if (new Set(receiverIds).size !== receiverIds.length) throw new TypeError('Receiver presentation ids must be unique.');
  const originBinding = difference(origin, current, INVARIANTS);
  const previousBinding = difference(origin, previous, INVARIANTS);
  const receiverComparisons = presentations.map(item => ({ receiver: item.id, differences: difference(current, item) }));
  const changes = difference(previous, current);
  const predecessorLink = declaredLink(previous, current);
  const originRootConsistent = origin.coordinates.original_ref.state === 'DECLARED'
    && origin.coordinates.current_ref.state === 'DECLARED'
    && origin.coordinates.predecessor_ref.state === 'DECLARED'
    && origin.coordinates.original_ref.value === origin.coordinates.current_ref.value
    && origin.coordinates.predecessor_ref.value === null;
  const coordinatesComplete = [origin, previous, current, ...presentations]
    .every(item => COORDINATES.every(key => item.coordinates[key].state === 'DECLARED'));
  const invariantsPreserved = [...originBinding, ...previousBinding].every(item => item.state === 'PRESERVED');
  const receiverControlsPreserved = receiverComparisons.every(item => item.differences.every(change => change.state === 'PRESERVED'));
  const consistent = originRootConsistent && coordinatesComplete && invariantsPreserved && receiverControlsPreserved
    && ['PRESERVED', 'DECLARED_LINK'].includes(predecessorLink);
  return freeze({
    schema: ATLAS_CONTINUITY_AUDIT_SCHEMA,
    agent: 'ATLAS',
    compared: { origin: origin.id, previous: previous.id, current: current.id },
    differences: changes,
    origin_binding: originBinding,
    previous_origin_binding: previousBinding,
    receiver_comparisons: receiverComparisons,
    audit: {
      coordinates_complete: coordinatesComplete,
      origin_root_consistent: originRootConsistent,
      origin_controls_preserved: invariantsPreserved,
      receiver_controls_preserved: receiverControlsPreserved,
      predecessor_link: predecessorLink,
      verdict: consistent ? 'DECLARED_CONSISTENCY' : 'HOLD'
    },
    evidence_boundary: {
      commitments_authenticated: false,
      source_revision_authenticated: false,
      result_admission_verified: false,
      signature_verification_performed: false,
      global_latest_established: false,
      fork_exclusion_established: false,
      replay_exclusion_established: false,
      authority_transferred: false,
      human_closure_required: true
    },
    claim_ceiling: [
      'declared continuity comparison only; matching references can be fabricated together',
      'a caller-declared chain, including a chain described as signed, does not establish authenticated admission',
      'authenticated parent linkage alone would not establish global latest state or exclude forks and replay',
      'changed missingness remains a declaration rather than a newly verified origin fact',
      'no provider release merge deployment or empirical exteriority authority'
    ]
  });
}

/**
 * Groups occupied declared states by a proposed retained projection, then invokes exact finite FADT.
 * A consistent support report describes the supplied finite set; it never executes or authorizes an action.
 */
export function runFadtStageAudit(input) {
  exactKeys(input, ['states', 'retain'], 'FADT stage input');
  const retained = stringSet(input.retain, 'retain');
  const values = array(input.states, 'states');
  if (values.length === 0) throw new TypeError('FADT stage audit requires occupied declared states.');
  const ids = new Set();
  let keys;
  const states = values.map((value, index) => {
    exactKeys(value, ['id', 'conditioning', 'support'], `states[${index}]`);
    const id = text(value.id, `states[${index}].id`);
    if (ids.has(id)) throw new TypeError(`Duplicate declared state id: ${id}.`);
    ids.add(id);
    record(value.conditioning, `states[${index}].conditioning`);
    const currentKeys = Object.keys(value.conditioning).sort();
    if (currentKeys.length === 0 || currentKeys.length > 16) throw new TypeError('Conditioning must contain between 1 and 16 coordinates.');
    currentKeys.forEach(key => text(key, `states[${index}] conditioning key`));
    if (keys && canonical(keys) !== canonical(currentKeys)) throw new TypeError('All occupied states must explicitly declare the same conditioning coordinates.');
    keys = currentKeys;
    const conditioning = Object.fromEntries(currentKeys.map(key => [key, text(value.conditioning[key], `states[${index}].conditioning.${key}`)]));
    return { id, conditioning, support: stringSet(value.support, `states[${index}].support`) };
  });
  if (retained.some(key => !keys.includes(key))) throw new TypeError('Every retained coordinate must be declared by all occupied states.');
  const groups = new Map();
  for (const state of states) {
    const projection = Object.fromEntries(retained.map(key => [key, state.conditioning[key]]));
    const key = canonical(projection);
    if (!groups.has(key)) groups.set(key, { projection, antecedents: [] });
    groups.get(key).antecedents.push({ id: state.id, support: state.support });
  }
  const grouped = [...groups.entries()].sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([, group], index) => ({
      id: `occupied-fibre-${index}`,
      projection: group.projection,
      antecedents: group.antecedents.sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0)
    }));
  const fadt = runFadtAgent({ fibres: grouped.map(({ id, antecedents }) => ({ id, antecedents })) });
  return freeze({
    schema: FADT_STAGE_AUDIT_SCHEMA,
    agent: 'FADT',
    retained_coordinates: retained,
    erased_coordinates: keys.filter(key => !retained.includes(key)),
    occupied_states: [...states].sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0),
    projections: grouped.map(({ id, projection }) => ({ fibre_id: id, projection })),
    finite_audit: fadt,
    verdict: fadt.all_fibres_exact ? 'CONSISTENT_DECLARATIONS' : 'HOLD',
    evidence_boundary: {
      support_authenticated: false,
      stage_admission_verified: false,
      actions_executed: false,
      authority_transferred: false,
      human_closure_required: true
    },
    claim_ceiling: [
      'exact union intersection and gap apply only to the supplied occupied finite states',
      'declared lawful support remains caller supplied and unauthenticated',
      'a constant occupied fibre grants no authority to an unobserved state or a provider operation',
      'no universal information loss source reconstruction release or deployment authority'
    ]
  });
}
