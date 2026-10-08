import { normalizeLoomAiTask, verifyLoomAiGovernance } from '../dome-world/holonomy-loom/ai-handoff-base.js';
import { compileLoomInstrumentStateView } from '../dome-world/holonomy-loom/instrument-state-view.js';
import { FLOWCORE_GLYPH_REGISTRY } from '../dome-world/data/flowcore-glyph-semantics-v01.js';
import { runFadtAgent } from './dollhouse-atlas-fadt.js';
import { auditTypedEpistemicDeficit } from './aperture-v32-typed-epistemic-deficit.js';
import { PORTABLE_LOOM_MECHANISMS } from './portable-loom-mechanisms.js';
import { PORTABLE_LOOM_OUTPUT_PROTOCOL, LOOM_GATE_LABEL, LOOM_GATE_HREF } from './portable-loom-output.js';
import { LOOM_GATE_EXPLANATION } from './portable-loom-gate-explanation.js';

export const PORTABLE_LOOM_CORE_SCHEMA = 'td613.loom.portable-governance/v0.1';
export const LOOM_DECLARED_STATE_SCHEMA = 'td613.loom.declared-state/v0.1';
export const LOOM_EVIDENCE_CLASSES = Object.freeze(['OBSERVED', 'DERIVED', 'ENGINEERED', 'RELEASE_GOVERNANCE', 'HYPOTHESIS', 'PROPOSED_RESEARCH_DESIGN', 'PROPOSED_AESTHETIC_BINDING', 'ANALOGY', 'FORMAL CONSTRUCTION', 'SPECULATION', 'AESTHETIC', 'HISTORICAL / LINEAGE', 'UNRESOLVED']);
const freeze = value => { if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const stable = value => Array.isArray(value) ? '[' + value.map(stable).join(',') + ']'
  : value && typeof value === 'object' ? '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + stable(value[key])).join(',') + '}' : JSON.stringify(value);
// Inspect before reading: untrusted imports cannot invoke getters or lose fields.
function copy(value, depth = 0, budget = { nodes: 0, characters: 0 }, ancestors = new Set()) {
  if (++budget.nodes > 25000 || depth > 35) throw new TypeError('Portable governance exceeds its structural bound.');
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'string') { budget.characters += value.length; if (budget.characters > 450000) throw new TypeError('Portable governance exceeds its text bound.'); return value; }
  if (typeof value === 'number' && Number.isFinite(value) && !Object.is(value, -0)) return value;
  if (!value || typeof value !== 'object' || ancestors.has(value)) throw new TypeError('Portable governance requires lossless JSON.');
  const array = Array.isArray(value), keys = Reflect.ownKeys(value);
  if (array ? Object.getPrototypeOf(value) !== Array.prototype || keys.length !== value.length + 1 || keys.slice(0, -1).some((key, i) => key !== String(i))
    : ![Object.prototype, null].includes(Object.getPrototypeOf(value))) throw new TypeError('Portable governance requires plain dense JSON.');
  ancestors.add(value);
  try {
    const entries = keys.filter(key => !(array && key === 'length')).map(key => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (typeof key !== 'string' || !descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) throw new TypeError('Portable governance refuses accessors and hidden fields.');
      return [key, copy(descriptor.value, depth + 1, budget, ancestors)];
    });
    return array ? entries.map(([, item]) => item) : Object.fromEntries(entries);
  } finally { ancestors.delete(value); }
}
export const copyPortableLoomJson = value => copy(value);
function exact(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || stable(Object.keys(value).sort()) !== stable([...keys].sort())) throw new TypeError(`${label} requires exactly its declared fields.`);
}
function text(value, label, max = 1000) { if (typeof value !== 'string' || !value.trim() || value.length > max) throw new TypeError(`Invalid ${label}.`); return value; }
function strings(value, label, max = 32) { if (!Array.isArray(value) || value.length > max || new Set(value).size !== value.length) throw new TypeError(`Invalid ${label}.`); value.forEach(item => text(item, label)); return value; }
export async function portableLoomCoreDigest(value, environment = globalThis) {
  const bytes = new TextEncoder().encode(stable(copy(value)));
  return [...new Uint8Array(await environment.crypto.subtle.digest('SHA-256', bytes))].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function declaredStates(documents) {
  const manifests = [];
  for (const document of documents) {
    let value; try { value = JSON.parse(document.text); } catch { continue; }
    if (value?.schema !== LOOM_DECLARED_STATE_SCHEMA) continue;
    exact(value, ['schema', 'basis', 'states', 'deficit'], 'Declared state');
    if (!['SYNTHETIC_PRACTICE', 'OPERATOR_DECLARED'].includes(value.basis)) throw new TypeError('Unknown declared state basis.');
    if (!Array.isArray(value.states) || !value.states.length || value.states.length > 32) throw new TypeError('Declared states require 1–32 records.');
    const ids = new Set(); let previous = 0;
    for (const state of value.states) {
      exact(state, ['id', 'sequence', 'summary', 'support', 'evidence_class', 'source_ids'], 'Declared state record');
      text(state.id, 'state identity', 80); if (ids.has(state.id)) throw new TypeError('Duplicate state identity.'); ids.add(state.id);
      if (!Number.isSafeInteger(state.sequence) || state.sequence <= previous) throw new TypeError('State chronology must be strictly increasing.'); previous = state.sequence;
      text(state.summary, 'compressed state', 300); strings(state.support, 'declared support'); strings(state.source_ids, 'state source references', 8);
      if (!LOOM_EVIDENCE_CLASSES.includes(state.evidence_class) || state.source_ids.some(id => !documents.some(doc => doc.id === id))) throw new TypeError('State evidence class or selected-source reference is invalid.');
    }
    if (value.deficit !== null) {
      exact(value.deficit, ['latent_dimension', 'current_rank', 'sigma_min', 'condition_number', 'uncertainty_status', 'sigma_min_floor', 'condition_number_ceiling'], 'Declared deficit');
      for (const key of ['latent_dimension', 'current_rank', 'sigma_min', 'condition_number', 'sigma_min_floor', 'condition_number_ceiling']) if (typeof value.deficit[key] !== 'number' || !Number.isFinite(value.deficit[key])) throw new TypeError('Deficit metrics must be finite numbers.');
      if (!['VALID_DECLARED', 'INCOMPLETE', 'INVALID'].includes(value.deficit.uncertainty_status)) throw new TypeError('Unknown uncertainty geometry.');
    }
    manifests.push({ document_id: document.id, ...value });
  }
  if (manifests.length > 1) throw new TypeError('Select at most one declared state manifest.');
  return manifests[0] ?? null;
}

// The same sanitizer serves origin construction and independent receiver replay.
// No bodies, filenames, prose diagnostics, private checks or provider keys enter.
function observation(event) {
  const result = {};
  for (const key of ['phase', 'at', 'request_id', 'shared', 'local', 'rules_count', 'task_present', 'selected_document_ids', 'outbound_submitted', 'response_received', 'binding_verified', 'route_event']) if (event[key] !== undefined && event[key] !== null) result[key] = event[key];
  if (event.scene?.rules_count !== undefined) result.rules_count = event.scene.rules_count;
  if (typeof event.geometry?.rest === 'boolean') result.geometry = { rest: event.geometry.rest };
  if (event.provider_failure) result.provider_failure = { diagnostic: { stage: event.provider_failure.diagnostic?.stage ?? 'unclassified' } };
  return result;
}
export async function createPortableLoomCore(input, { observationBasis = null, sourceRevision = 'browser-unpinned' } = {}, environment = globalThis) {
  input = copy(input);
  const selected = normalizeLoomAiTask({ task: input.task, documents: input.documents, rules: input.rules, governance: input.governance });
  await verifyLoomAiGovernance(selected, environment);
  const basis = observationBasis === null ? [{ phase: 'checking', shared: selected.documents.length, local: selected.governance.withheld_document_count, rules_count: selected.rules.length,
    task_present: true, selected_document_ids: selected.documents.map(doc => doc.id), binding_verified: true, outbound_submitted: false, response_received: false }]
    : copy(observationBasis).map(observation);
  if (!basis.length || basis.length > 30) throw new TypeError('Portable observations require 1–30 events.');
  const last = basis.at(-1);
  if (last.shared !== selected.documents.length || last.local !== selected.governance.withheld_document_count || last.rules_count !== selected.rules.length
    || stable(last.selected_document_ids) !== stable(selected.documents.map(doc => doc.id))) throw new TypeError('Current observation must bind the selected task view.');
  const view = await compileLoomInstrumentStateView(last, { eventHistory: basis, sourceRevision, cryptoImpl: environment.crypto });
  const manifest = declaredStates(selected.documents);
  const states = manifest?.states ?? [{ id: 'selected_task', sequence: 1, summary: 'Selected task view', support: selected.governance.projections[0].invariants.authorized_actions, evidence_class: 'ENGINEERED', source_ids: selected.documents.map(doc => doc.id) }];
  const groups = new Map();
  states.forEach(state => { if (!groups.has(state.summary)) groups.set(state.summary, []); groups.get(state.summary).push({ id: state.id, support: state.support }); });
  const compression = runFadtAgent({ fibres: [...groups].map(([, antecedents], index) => ({ id: `summary_${index + 1}`, antecedents })) });
  const body = {
    schema: PORTABLE_LOOM_CORE_SCHEMA, selected_input_digest: selected.governance.input_digest,
    policy_commitment: await portableLoomCoreDigest(selected.rules, environment), source_revision: sourceRevision,
    selected_commitments: await Promise.all(selected.documents.map(async doc => ({ id: doc.id, name: doc.name, sha256: await portableLoomCoreDigest(doc.text, environment) }))),
    observation_basis: basis,
    semantic_state: { schema: view.schema, evidence_class: 'OBSERVED', observation_scope: 'SUPPLIED_CLIENT_EVENTS_NOT_AUTHENTICATED', event_history: view.event_history,
      event_relation_history: view.event_relation_history, route_graph: view.route_graph, active_relation: view.active_relation, state: view.state,
      missingness: view.scene.missingness, contradictions: view.scene.contradictions, operator_gesture_trace_captured: false },
    flow_core: { legend: copy(FLOWCORE_GLYPH_REGISTRY), glyph_trace: view.event_relation_history, active_relation: view.active_relation },
    projections: copy(selected.governance.projections), projection_verification: copy(selected.governance.verification),
    declared_state: manifest, compression: { evidence_class: 'DERIVED', premise_scope: manifest?.basis ?? 'LOCAL_TASK_ACTION_SUPPORT', audit: compression },
    chronology: { custodian: 'Temporal Custodian', rule: 'APPEND_ONLY_KNOWLEDGE_ORDER', records: states.map(state => ({ id: state.id, sequence: state.sequence, source_ids: state.source_ids, evidence_class: state.evidence_class })), replay_rule: 'PREFIX_ONLY_NO_LATER_EVIDENCE' },
    observation_design: manifest?.deficit ? auditTypedEpistemicDeficit(manifest.deficit) : null,
    epistemic_coordinates: {
      V: { meaning: 'visibility', status: 'SUPPLIED_CLIENT_OBSERVATIONS', observation_scope: view.observation_class },
      C: { meaning: 'custody', status: 'CARRIED_INTEGRITY_ONLY', live_custody_capability: false },
      P: { meaning: 'process identification', status: 'UNRESOLVED_FOREIGN_PROCESS', receiver_declaration_is_identification: false },
      L: { meaning: 'latent reconstructibility', status: 'UNRESOLVED_UNTIL_DECLARED_PROBES_CAPTURED', finite_support_audit_is_reconstruction_test: false }
    },
    evidence_classes: [...LOOM_EVIDENCE_CLASSES], mechanisms: copy(PORTABLE_LOOM_MECHANISMS),
    return_protocol: { schema: 'td613.loom.bound-receiver-turn/v0.2', registration_required: true, stages: ['REGISTER', 'CAPTURE', 'CHECK', 'EXPLICIT_ADMIT', 'REST'], check_advances_head: false, imported_json_restores_custody: false },
    output_protocol: copy(PORTABLE_LOOM_OUTPUT_PROTOCOL), gate_explanation: copy(LOOM_GATE_EXPLANATION),
    loom_gate: { action: 'CHECK_LOOM_GATE', label: LOOM_GATE_LABEL, href: LOOM_GATE_HREF,
      status: 'NOT_RUN', instruction: 'Keep private target values local. Bring captured receiver replies and declared reconstruction attempts to Loom Gate. A copied packet alone contains no capture of the rest of this conversation.', conversation_leakage_fraction: null },
    authority: { packet_carriage_only: true, receiver_authority_transferred: false, external_action_authorized: false, live_custody_capability: false, empirical_credit: 0, human_closure_required: true }
  };
  return freeze({ ...body, ref: await portableLoomCoreDigest(body, environment) });
}

export async function verifyPortableLoomCore(input, core, environment = globalThis) {
  core = copy(core);
  if (core?.schema !== PORTABLE_LOOM_CORE_SCHEMA) throw new TypeError('Unsupported portable governance.');
  const rebuilt = await createPortableLoomCore(input, { observationBasis: core.observation_basis, sourceRevision: core.source_revision }, environment);
  if (stable(rebuilt) !== stable(core)) throw new Error('Portable governance, chronology, projection or support changed.');
  return freeze({ status: 'RECOMPUTED_INTEGRITY', ref: core.ref, source_authenticated: false, action_executed: false, custody_restored: false });
}

export function projectPortableLoomCore(core, route, { throughSequence = null } = {}) {
  if (core?.schema !== PORTABLE_LOOM_CORE_SCHEMA || !core.projections.some(projection => projection.route === route)) throw new TypeError('Explicit canonical receiver route required.');
  const projection = core.projections.find(item => item.route === route);
  const states = core.declared_state?.states ?? [];
  if (throughSequence !== null && (!Number.isSafeInteger(throughSequence) || throughSequence < 1)) throw new TypeError('Replay sequence must be a positive integer.');
  return freeze({ schema: 'td613.loom.portable-governance-projection/v0.1', core_ref: core.ref, projection: copy(projection),
    declared_states: copy(states.filter(state => throughSequence === null || state.sequence <= throughSequence)),
    authority_transferred: false, replay_is_prefix: throughSequence !== null });
}

export function inspectPortableLoomAction(core, fibreId, action) {
  const fibre = core?.compression?.audit?.fibres.find(item => item.fibre_id === fibreId);
  if (!fibre || typeof action !== 'string') return freeze({ status: 'HOLD', reason: 'UNDECLARED_FIBRE_OR_ACTION', action_executed: false });
  return freeze({ status: fibre.intersection.includes(action) ? 'SUPPORTED_FOR_ALL_DECLARED_ANTECEDENTS' : 'HOLD',
    reason: fibre.intersection.includes(action) ? 'FINITE_UNIVERSALLY_SOUND_SUPPORT' : 'ACTION_NOT_IN_SUPPORT_INTERSECTION',
    irreducible_gap: [...fibre.irreducible_gap], action_executed: false });
}
