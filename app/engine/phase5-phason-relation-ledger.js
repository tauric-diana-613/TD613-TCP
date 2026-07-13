import { canonicalDigest } from '../dome-world/ash/canonical-json.js';
import { PHASE5_DIGEST_DOMAINS, RELATION_ENVELOPE_SCHEMA } from './phase5-relation-envelope.js';

export const PHASON_RELATION_EVENT_SCHEMA = 'td613.phason.relation-event/v0.1';
export const PHASON_RELATION_CHAIN_SCHEMA = 'td613.phason.relation-chain/v0.1';
export const PHASON_EVENT_TYPES = Object.freeze(['CREATED', 'CONFIRMED', 'REVISED', 'WITHDRAWN', 'SUPERSEDED']);
export const LEGAL_RELATION_TRANSITIONS = Object.freeze({
  '∅': ['PROPOSED'],
  PROPOSED: ['CONFIRMED', 'WITHDRAWN'],
  CONFIRMED: ['REVISED', 'WITHDRAWN', 'SUPERSEDED'],
  REVISED: ['SUPERSEDED'],
  WITHDRAWN: [],
  SUPERSEDED: []
});
function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
}
function randomId(prefix, cryptoImpl = globalThis.crypto) {
  if (!cryptoImpl?.getRandomValues) throw new Error('Secure random values are unavailable.');
  const bytes = new Uint8Array(10);
  cryptoImpl.getRandomValues(bytes);
  return `${prefix}${Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')}`;
}
function without(object, field) { const subject = clone(object); delete subject[field]; return subject; }
export function validateRelationTransition(priorState, newState) {
  const prior = priorState == null ? '∅' : priorState;
  const allowed = LEGAL_RELATION_TRANSITIONS[prior];
  if (!allowed || !allowed.includes(newState)) return Object.freeze({ valid: false, outcome: 'HOLD_LIFECYCLE_CONTRADICTION', prior_state: priorState, new_state: newState });
  return Object.freeze({ valid: true, outcome: 'TRANSITION_ADMISSIBLE', prior_state: priorState, new_state: newState });
}
export function computePhasonEventDigest(event, options = {}) {
  return canonicalDigest(PHASE5_DIGEST_DOMAINS.phasonEvent, without(event, 'event_digest'), options);
}
export function computePhasonChainDigest(chain, options = {}) {
  return canonicalDigest(PHASE5_DIGEST_DOMAINS.phasonChain, without(chain, 'chain_digest'), options);
}
export async function compilePhasonRelationEvent(
  {
    relationEnvelope, eventType, priorState = null, newState = null,
    previousEventDigest = null, operatorActionRequired = true,
    createdAt = null, eventId = null
  },
  { cryptoImpl = globalThis.crypto, TextEncoderImpl = globalThis.TextEncoder } = {}
) {
  if (!relationEnvelope || relationEnvelope.schema !== RELATION_ENVELOPE_SCHEMA) throw new TypeError('Phason relation event requires a Relation Envelope.');
  if (!PHASON_EVENT_TYPES.includes(eventType)) throw new Error('Unsupported Phason relation event type.');
  const targetState = newState || ({ CREATED: 'PROPOSED', CONFIRMED: 'CONFIRMED', REVISED: 'REVISED', WITHDRAWN: 'WITHDRAWN', SUPERSEDED: 'SUPERSEDED' })[eventType];
  if (!validateRelationTransition(priorState, targetState).valid) throw new Error('HOLD_LIFECYCLE_CONTRADICTION');
  const event = {
    schema: PHASON_RELATION_EVENT_SCHEMA,
    event_id: eventId || randomId('phev_', cryptoImpl),
    relation_id: relationEnvelope.relation_id,
    event_type: eventType,
    prior_state: priorState,
    new_state: targetState,
    relation_digest: relationEnvelope.relation_digest,
    previous_event_digest: previousEventDigest,
    created_at: createdAt || new Date().toISOString(),
    time_posture: 'local-clock-not-trusted-time',
    artifact_content_changed: false,
    context_receipt_changed: false,
    round_trip_receipt_changed: false,
    relation_changed: true,
    operator_action_required: operatorActionRequired === true,
    does_not_establish: ['co-occurrence', 'identity', 'location', 'causation', 'permission', 'external deletion']
  };
  event.event_digest = await computePhasonEventDigest(event, { cryptoImpl, TextEncoderImpl });
  return freeze(event);
}
export function detectPhasonFork(events = []) {
  const successors = new Map();
  for (const event of events) {
    const previous = event.previous_event_digest ?? 'ROOT';
    const seen = successors.get(previous) || new Set();
    seen.add(event.event_digest);
    successors.set(previous, seen);
  }
  const forks = [];
  for (const [previousEventDigest, digests] of successors.entries()) {
    if (digests.size > 1) forks.push(Object.freeze({
      previous_event_digest: previousEventDigest === 'ROOT' ? null : previousEventDigest,
      successor_event_digests: Object.freeze([...digests])
    }));
  }
  return Object.freeze(forks);
}
async function buildChain(relationId, events, { cryptoImpl = globalThis.crypto, TextEncoderImpl = globalThis.TextEncoder } = {}) {
  const forks = detectPhasonFork(events);
  const chain = {
    schema: PHASON_RELATION_CHAIN_SCHEMA,
    relation_id: relationId,
    event_references: events.map(event => ({ event_id: event.event_id, event_type: event.event_type, event_digest: event.event_digest, previous_event_digest: event.previous_event_digest })),
    events: clone(events),
    current_state: events.at(-1)?.new_state || null,
    fork_detected: forks.length > 0,
    forks: clone(forks),
    artifact_digest_present: false,
    seal: '⟐'
  };
  chain.chain_digest = await computePhasonChainDigest(chain, { cryptoImpl, TextEncoderImpl });
  return freeze(chain);
}
export async function createPhasonRelationChain(relationEnvelope, options = {}) {
  const event = await compilePhasonRelationEvent({
    relationEnvelope, eventType: 'CREATED', priorState: null, newState: 'PROPOSED',
    previousEventDigest: null, operatorActionRequired: true
  }, options);
  return buildChain(relationEnvelope.relation_id, [event], options);
}
export async function appendPhasonRelationEvent(chain, relationEnvelope, eventType, options = {}) {
  if (!chain || chain.schema !== PHASON_RELATION_CHAIN_SCHEMA) throw new TypeError('Phason relation chain is required.');
  if (chain.relation_id !== relationEnvelope?.relation_id) throw new Error('Relation and Phason chain IDs do not match.');
  const events = clone(chain.events || []);
  const previous = events.at(-1) || null;
  const event = await compilePhasonRelationEvent({
    relationEnvelope, eventType,
    priorState: previous?.new_state || null,
    previousEventDigest: previous?.event_digest || null,
    operatorActionRequired: options.operatorActionRequired !== false,
    createdAt: options.createdAt || null,
    eventId: options.eventId || null
  }, options);
  events.push(event);
  return buildChain(chain.relation_id, events, options);
}
export async function mergePhasonBranches(relationId, branches, options = {}) {
  const events = []; const seen = new Set();
  for (const branch of branches || []) for (const event of branch?.events || []) {
    if (!seen.has(event.event_digest)) { seen.add(event.event_digest); events.push(clone(event)); }
  }
  return buildChain(relationId, events, options);
}
export async function replayPhasonRelationChain(chain, { cryptoImpl = globalThis.crypto, TextEncoderImpl = globalThis.TextEncoder } = {}) {
  const errors = [];
  if (!chain || chain.schema !== PHASON_RELATION_CHAIN_SCHEMA) return Object.freeze({ outcome: 'RELATION_REPLAY_HELD_LIFECYCLE_CONTRADICTION', errors: ['unsupported_phason_chain_schema'], fork_detected: false });
  const events = chain.events || [];
  let previous = null;
  for (const [index, event] of events.entries()) {
    if (await computePhasonEventDigest(event, { cryptoImpl, TextEncoderImpl }) !== event.event_digest) errors.push(`event_digest_mismatch:${index}`);
    if (event.previous_event_digest !== previous?.event_digest && index > 0) errors.push(`event_link_mismatch:${index}`);
    if (!validateRelationTransition(event.prior_state, event.new_state).valid) errors.push(`illegal_transition:${index}`);
    if (index > 0 && event.prior_state !== previous?.new_state) errors.push(`state_continuity_mismatch:${index}`);
    previous = event;
  }
  if (await computePhasonChainDigest(chain, { cryptoImpl, TextEncoderImpl }) !== chain.chain_digest) errors.push('chain_digest_mismatch');
  const forks = detectPhasonFork(events);
  if (forks.length) errors.push('phason_fork');
  return Object.freeze({
    outcome: forks.length ? 'RELATION_REPLAY_HELD_PHASON_FORK' : errors.length ? 'RELATION_REPLAY_HELD_LIFECYCLE_CONTRADICTION' : 'RELATION_REPLAY_VERIFIED',
    errors: Object.freeze(errors), fork_detected: forks.length > 0, forks,
    current_state: previous?.new_state || null, network_called: false, storage_mutated: false
  });
}
