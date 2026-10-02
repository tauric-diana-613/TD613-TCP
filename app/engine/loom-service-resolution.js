import {
  bindLoomDemoRequest, createLoomDemoActivation, loomDemoDigest,
  loomDemoReceiptDigest, loomDemoResult, validateLoomDemoStageReceipt, inspectLoomDemoExport
} from '../dome-world/holonomy-loom/demo-contract.js';
import {
  createPortableLoomAiPacket, inspectPortableLoomReceiverAssurance,
  normalizeLoomAiTask, verifyLoomAiGovernance
} from '../dome-world/holonomy-loom/ai-handoff.js';

export const LOOM_SERVICE_RESOLUTION_SCHEMA = 'td613.loom.service-resolution/v0.1';
const FAILURE_KINDS = Object.freeze(['RETRY', 'IMPORT', 'DUPLICATE', 'MANUAL_RECONSTRUCTION', 'STALE_STAGE_RECOVERY']);
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const invariant = (condition, reason) => { if (!condition) throw new Error(reason); };
const revision = value => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);

// Snapshot plain data before the first await. Missing, sparse, callable or accessor
// evidence cannot be silently normalized into a successful observation.
function snapshot(value, seen = new Set(), depth = 0, budget = { items: 0, characters: 0 }) {
  invariant(depth < 40 && ++budget.items < 50000, 'EVIDENCE_LIMIT');
  if (typeof value === 'string') {
    budget.characters += value.length;
    invariant(budget.characters <= 2000000, 'EVIDENCE_LIMIT');
    return value;
  }
  if (value === null || typeof value === 'boolean' || value === undefined) return value;
  if (typeof value === 'number') { invariant(Number.isFinite(value), 'INVALID_NUMBER'); return value; }
  invariant(value && typeof value === 'object' && !seen.has(value), 'NON_DATA_EVIDENCE');
  seen.add(value);
  const array = Array.isArray(value);
  invariant(array || Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null, 'NON_DATA_EVIDENCE');
  const keys = Reflect.ownKeys(value);
  if (array) invariant(value.length <= 1024 && keys.length === value.length + 1, 'NON_DENSE_EVIDENCE');
  const output = array ? [] : {};
  for (const key of keys) {
    if (array && key === 'length') continue;
    invariant(typeof key === 'string' && key !== '__proto__', 'NON_DATA_EVIDENCE');
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    invariant(descriptor.enumerable && !descriptor.get && !descriptor.set, 'NON_DATA_EVIDENCE');
    if (array) invariant(/^(0|[1-9][0-9]*)$/.test(key) && Number(key) < value.length, 'NON_DENSE_EVIDENCE');
    output[key] = snapshot(descriptor.value, seen, depth + 1, budget);
  }
  if (array) for (let index = 0; index < value.length; index++) invariant(Object.hasOwn(value, index), 'NON_DENSE_EVIDENCE');
  seen.delete(value);
  return output;
}
function time(value) {
  if (Number.isSafeInteger(value) && value >= 0 && value <= 8640000000000000) return value;
  invariant(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value), 'OBSERVATION_TIME_MISSING');
  const parsed = Date.parse(value);
  invariant(Number.isFinite(parsed) && new Date(parsed).toISOString() === value, 'OBSERVATION_TIME_INVALID');
  return parsed;
}
function list(value, reason) { invariant(Array.isArray(value), reason); return value; }
function observation(value, source, receiver) {
  invariant(value && value.source_revision === source, 'SOURCE_REVISION_CHANGED_OR_UNOBSERVED');
  invariant(value.receiver === receiver, 'RECEIVER_UNOBSERVED_OR_CHANGED');
  return time(value.observed_at);
}
function packetInput(packet) {
  invariant(packet && typeof packet === 'object', 'PACKET_UNOBSERVED');
  return normalizeLoomAiTask({ task: packet.task, documents: packet.documents, rules: packet.rules,
    ...(packet.receipt !== undefined ? { receipt: packet.receipt } : {}), governance: packet.governance });
}
function boundary() {
  return {
    scope: 'READ_ONLY_DECLARED_ROUTE_ADVISORY', source_revision_authenticated: false,
    native_receipt_authentication_performed: false, result_admission_granted: false,
    custody_mutated: false, recovery_authority_granted: false, global_latest_established: false,
    fork_exclusion_established: false, foreign_origin_authenticated: false,
    provider_semantic_completion_verified: false, authority_transferred: false,
    merge_authority: false, release_authority: false, empirical_claim_earned: false
  };
}

/**
 * Derive one case from observations of existing Loom/Marrowline routes. This is
 * neither a journal nor a custody engine: no admission, provider call, storage,
 * import, restore or action occurs here. Matching native receipts establish
 * declared consistency only; the signature and durable-head service are separate.
 *
 * origin: {packet, receiver:'LOOM', source_revision, observed_at}
 * marrowline: {activation, snapshot, stages:[{request,response,receiver,
 *   source_revision,observed_at}]} (response is the native provider envelope).
 * exports: [{packet,receiver:'MARROWLINE',source_revision,observed_at}]
 * revalidation: {packet,assay,receiver:'LOOM',source_revision,observed_at}
 * recovery: {mode:'RELOAD'|'REENTRY',before,after,receiver:'LOOM',source_revision,
 *   observed_at}; each snapshot retains case/current/predecessor, packet_digest,
 *   source_revision and explicit action_support including INSPECT_RETURN.
 * failure_demand: {coverage:'COMPLETE_OBSERVED_ROUTE',case_id,from_observed_at,
 *   through_observed_at,events:[{id,kind,receiver,observed_at,avoidable,
 *   prior_failure_request_id}]}. Explicit empty events remain a scoped declaration.
 * operator_outcome: {reviewed,case_id,request_id,correct,complete,inspectable,
 *   receiver:'LOOM',source_revision,observed_at}.
 */
export async function deriveLoomServiceResolution(raw = {}, environment = globalThis) {
  let input;
  try {
    input = snapshot(raw);
    invariant(input && typeof input === 'object' && !Array.isArray(input), 'NON_DATA_EVIDENCE');
  }
  catch (error) {
    return freeze({ schema: LOOM_SERVICE_RESOLUTION_SCHEMA, status: 'HELD', case_id: null,
      reasons: [error.message], checks: [], event_history: [], failure_demand: { state: 'HELD', counts: null },
      progress: { verified_milestones: 0, transitions_are_progress: false }, evidence_boundary: boundary() });
  }
  const checks = [], history = [], bindings = [];
  let selected, originResult, activation, latestResult, latestReceipt, expectedExport, exportPacket, exportDigest;
  let originTime, completionTime, exportTime, returnTime, recoveryTime, outcomeTime;
  let failureDemand = { state: 'HELD', counts: null, observed_events: [] };
  const source = input.source_revision;
  const check = async (id, run) => {
    try { const detail = await run(); checks.push({ id, state: 'OBSERVED_CONSISTENCY', ...detail }); }
    catch (error) { checks.push({ id, state: 'HELD', reason: error.message }); }
  };
  await check('origin', async () => {
    invariant(revision(source), 'SOURCE_REVISION_UNPINNED_OR_MISSING');
    originTime = observation(input.origin, source, 'LOOM');
    selected = packetInput(input.origin.packet);
    await verifyLoomAiGovernance(selected, environment);
    if (selected.receipt?.source_revision !== undefined) invariant(selected.receipt.source_revision === source, 'SOURCE_REVISION_CHANGED');
    originResult = loomDemoResult(input.origin.packet.continuation?.prior_result, selected.documents);
    invariant(originResult, 'ORIGINAL_LOOM_RESULT_UNOBSERVED');
    activation = input.marrowline?.activation;
    invariant(activation, 'ACTIVATION_UNOBSERVED');
    const expected = await createLoomDemoActivation({ ...input.origin.packet, handoff_receipt: { issued_at: activation.issued_at } }, environment);
    invariant(same(expected, activation), 'ORIGIN_ACTIVATION_CHANGED');
    invariant(originTime <= activation.issued_at, 'ORIGIN_AFTER_ACTIVATION');
    return { source_revision: source, origin_input_digest: selected.governance.input_digest,
      activation_issued_at: activation.issued_at, activation_expires_at: activation.expires_at,
      task_digest: await loomDemoDigest(selected.task, environment), rules_digest: await loomDemoDigest(selected.rules, environment),
      selected_commitments: activation.manifest, original_request_id: originResult.request_id,
      original_result_digest: activation.prior_result_commitment.sha256,
      withheld_document_count: selected.governance.withheld_document_count, observed_at: input.origin.observed_at };
  });
  await check('loom_completion', async () => {
    invariant(selected && originResult, 'ORIGIN_REQUIRED');
    const workspace = input.workspace;
    invariant(workspace?.session?.source_revision === source, 'WORKSPACE_SOURCE_REVISION_UNOBSERVED');
    const events = list(workspace.events, 'WORKSPACE_EVENTS_UNOBSERVED');
    let previous = -1;
    for (const event of events) { const at = time(event.at); invariant(at >= previous, 'WORKSPACE_EVENT_ORDER_CHANGED'); previous = at; }
    const completions = events.filter(event => event.phase === 'completed' && event.request_id === originResult.request_id);
    invariant(completions.length === 1, 'EXACT_LOOM_COMPLETION_UNOBSERVED_OR_DUPLICATE');
    const event = completions[0], receipt = event.local_receipt;
    invariant(receipt?.schema === 'td613.loom.ai-egress/v0.1' && receipt.request_id === originResult.request_id, 'LOCAL_EGRESS_RECEIPT_UNOBSERVED');
    invariant(same(receipt.shared_document_ids, selected.documents.map(doc => doc.id)), 'SELECTED_DOCUMENTS_CHANGED');
    const withheld = list(receipt.withheld_document_ids, 'LOCAL_EXCLUSIONS_UNOBSERVED');
    invariant(new Set(withheld).size === withheld.length && withheld.every(id => typeof id === 'string' && !receipt.shared_document_ids.includes(id)), 'LOCAL_EXCLUSIONS_CHANGED');
    invariant(withheld.length === selected.governance.withheld_document_count && receipt.protected_terms_sent === false
      && Number.isInteger(receipt.protected_term_count) && receipt.protected_term_count >= 0, 'PROTECTED_EXCLUSIONS_UNOBSERVED_OR_CHANGED');
    invariant(event.aia?.input_digest === selected.governance.input_digest && event.aia.fadt_admission === true, 'LOOM_ADMISSION_OBSERVATION_UNOBSERVED');
    completionTime = time(event.at);
    invariant(completionTime <= originTime, 'LOOM_COMPLETION_AFTER_HANDOFF');
    history.push({ stage: 'LOOM_RESULT', receiver: 'LOOM', source_revision: source,
      request_id: originResult.request_id, predecessor_request_id: null, observed_at: event.at });
    return { request_id: originResult.request_id, local_document_ids: withheld,
      protected_term_count: receipt.protected_term_count, protected_terms_sent: false, observed_at: event.at };
  });
  await check('marrowline_continuations', async () => {
    invariant(selected && activation && originResult, 'ORIGIN_REQUIRED');
    const stages = list(input.marrowline?.stages, 'MARROWLINE_HISTORY_UNOBSERVED');
    invariant(stages.length >= 3, 'TWO_CONTINUATIONS_UNOBSERVED');
    invariant(stages.length <= 128, 'MARROWLINE_HISTORY_LIMIT');
    let priorReceipt = null, priorResult = originResult, lastAt = originTime;
    const ids = new Set();
    for (const [index, stage] of stages.entries()) {
      const at = observation(stage, source, 'MARROWLINE');
      invariant(at >= lastAt && at >= activation.issued_at && at < activation.expires_at, 'MARROWLINE_EVENT_ORDER_OR_EXPIRY_CHANGED');
      const request = stage.request, response = stage.response ?? stage.result;
      invariant(request && response && request.phase === (index === 0 ? 'ACTIVATE' : 'CONTINUE'), 'NATIVE_STAGE_MISSING_OR_CHANGED');
      invariant(!ids.has(request.request_id), 'DUPLICATE_STAGE_REQUEST'); ids.add(request.request_id);
      invariant(same(request.activation, activation), 'CASE_ACTIVATION_CHANGED');
      invariant(same(request.predecessor, priorReceipt), 'IMMEDIATE_PREDECESSOR_CHANGED');
      invariant(index === 0 ? request.prior_result === null : same(loomDemoResult(request.prior_result, selected.documents), priorResult), 'LATEST_RESULT_NOT_USED');
      const binding = await bindLoomDemoRequest(request, environment);
      bindings.push(binding);
      const receipt = validateLoomDemoStageReceipt(response.loom_demo_stage_receipt ?? stage.receipt, activation);
      const result = loomDemoResult(response, binding.selected.documents);
      const native = response.native_reply;
      invariant(native?.ok === true && native.text === result.answer && native.relay?.transcript === result.answer
        && native.receipt?.provider?.completion?.complete === true, 'NATIVE_COMPLETION_UNOBSERVED');
      invariant(same(response.loom_demo_binding ?? stage.binding, binding.receipt), 'NATIVE_BINDING_CHANGED');
      invariant(receipt.phase === request.phase && receipt.request_id === request.request_id
        && receipt.request_digest === await loomDemoDigest(request, environment)
        && receipt.current_input_digest === binding.governance.input_digest
        && receipt.prior_result_digest === binding.receipt.prior_result_digest
        && receipt.result_digest === await loomDemoDigest(result, environment)
        && receipt.predecessor_receipt_digest === (priorReceipt ? await loomDemoReceiptDigest(priorReceipt, environment) : null), 'NATIVE_RECEIPT_BINDING_CHANGED');
      history.push({ stage: index === 0 ? 'MARROWLINE_ACTIVATION' : `MARROWLINE_CONTINUATION_${index}`,
        receiver: stage.receiver, source_revision: stage.source_revision, request_id: request.request_id,
        predecessor_request_id: priorReceipt?.request_id ?? null,
        content_predecessor_request_id: index === 0 ? null : priorResult.request_id,
        result_digest: receipt.result_digest, prior_result_digest: receipt.prior_result_digest,
        predecessor_receipt_digest: receipt.predecessor_receipt_digest, observed_at: stage.observed_at });
      priorReceipt = receipt;
      if (index > 0) priorResult = result;
      lastAt = at;
    }
    latestResult = priorResult; latestReceipt = priorReceipt;
    const current = input.marrowline.snapshot;
    invariant(current?.phase === 'DONE' && current.active === true && current.busy === false
      && current.current_result_request_id === latestResult.request_id && current.predecessor_request_id === latestReceipt.request_id, 'CURRENT_NATIVE_STATE_UNOBSERVED_OR_STALE');
    const latestBinding = bindings.at(-1);
    expectedExport = createPortableLoomAiPacket({ ...latestBinding.selected, governance: latestBinding.governance }, { priorResult: latestResult });
    return { admitted_stage_observations: stages.length, continuation_observations: stages.length - 1,
      latest_request_id: latestResult.request_id, latest_result_digest: latestReceipt.result_digest,
      receipt_validation: 'NATIVE_SHAPE_AND_DIGEST_RECOMPUTATION_ONLY' };
  });
  // Ephemeral native binders recompute contracts; they never receive/admit a result.
  bindings.forEach(binding => binding.governor.close());
  await check('current_export', async () => {
    invariant(expectedExport && latestResult, 'COMPLETE_CONTINUATION_HISTORY_REQUIRED');
    const exports = list(input.exports, 'EXPORT_OBSERVATION_UNOBSERVED');
    invariant(exports.length > 0, 'EXPORT_OBSERVATION_UNOBSERVED');
    let previous = time(history.at(-1).observed_at);
    for (const item of exports) {
      const at = observation(item, source, 'MARROWLINE');
      invariant(at >= previous && at < activation.expires_at, 'EXPORT_EVENT_ORDER_OR_EXPIRY_CHANGED');
      const { loom_demo_provenance: provenance, ...portable } = item.packet ?? {};
      invariant(same(portable, expectedExport), 'EXPORT_NOT_EXACT_LATEST_CONTINUATION');
      const inspection = await inspectLoomDemoExport(item.packet, environment);
      invariant(inspection.status === 'REVIEW_ONLY_CONSISTENCY', 'EXPORT_HISTORY_UNOBSERVED_OR_CHANGED');
      invariant(provenance.source_revision.value === source
        && input.origin.packet.receipt?.source_revision === source, 'EXPORTED_SOURCE_REVISION_UNOBSERVED_OR_CHANGED');
      invariant(same(provenance.activation, activation) && same(provenance.original_result, originResult)
        && provenance.stages.length === input.marrowline.stages.length, 'EXPORTED_ORIGIN_OR_HISTORY_CHANGED');
      for (const [index, carried] of provenance.stages.entries()) {
        const observed = input.marrowline.stages[index], response = observed.response ?? observed.result;
        invariant(same(carried.receipt, response.loom_demo_stage_receipt ?? observed.receipt)
          && same(carried.binding, response.loom_demo_binding ?? observed.binding)
          && carried.observed_at === observed.observed_at && carried.receiver === observed.receiver, 'EXPORTED_NATIVE_HISTORY_CHANGED');
      }
      previous = at;
    }
    const item = exports.at(-1); exportPacket = item.packet; exportTime = previous;
    exportDigest = await loomDemoDigest(exportPacket, environment);
    history.push({ stage: 'CURRENT_EXPORT', receiver: item.receiver, source_revision: source,
      request_id: latestResult.request_id, result_digest: latestReceipt.result_digest,
      packet_digest: exportDigest, observed_at: item.observed_at });
    return { request_id: latestResult.request_id, packet_digest: exportDigest,
      original_result_and_native_history_carried: true,
      origin_task_retained_in_native_continuation: true, selected_documents_and_rules_preserved: true };
  });
  await check('loom_revalidation', async () => {
    invariant(exportPacket && exportDigest, 'CURRENT_EXPORT_REQUIRED');
    returnTime = observation(input.revalidation, source, 'LOOM');
    invariant(returnTime >= exportTime && same(input.revalidation.packet, exportPacket), 'RETURN_RELATION_CHANGED');
    const assay = await inspectPortableLoomReceiverAssurance(input.revalidation.packet, environment);
    invariant(assay.outcome === 'ADMITTED' && same(input.revalidation.assay, assay), 'RETURN_REVALIDATION_UNOBSERVED_OR_HELD');
    history.push({ stage: 'LOOM_RETURN_REVALIDATION', receiver: 'LOOM', source_revision: source,
      request_id: latestResult.request_id, packet_digest: exportDigest, observed_at: input.revalidation.observed_at });
    return { state: 'RETURN_BINDING_RECOMPUTED', request_id: latestResult.request_id,
      custody_admission: 'NOT_INFERRED_FROM_PORTABLE_ASSURANCE', packet_digest: exportDigest };
  });
  await check('recovery', async () => {
    invariant(exportPacket && returnTime !== undefined, 'REVALIDATED_RETURN_REQUIRED');
    const recovery = input.recovery;
    recoveryTime = observation(recovery, source, 'LOOM');
    invariant(['RELOAD', 'REENTRY'].includes(recovery.mode) && recoveryTime >= returnTime, 'RECOVERY_UNOBSERVED_OR_OUT_OF_ORDER');
    for (const state of [recovery.before, recovery.after]) {
      invariant(state?.source_revision === source && state.case_id === activation.activation_digest
        && state.current_result_request_id === latestResult.request_id && state.predecessor_request_id === latestReceipt.request_id
        && state.packet_digest === exportDigest, 'RECOVERY_CURRENT_RESULT_OR_LINEAGE_CHANGED');
      invariant(list(state.action_support, 'RECOVERY_ACTION_SUPPORT_UNOBSERVED').includes('INSPECT_RETURN')
        && new Set(state.action_support).size === state.action_support.length
        && state.action_support.every(item => typeof item === 'string'), 'RECOVERY_NOT_PRACTICALLY_INSPECTABLE');
    }
    invariant(same(recovery.before.action_support, recovery.after.action_support), 'RECOVERY_ACTION_SUPPORT_CHANGED');
    history.push({ stage: 'RECOVERY_OBSERVATION', receiver: 'LOOM', source_revision: source,
      request_id: latestResult.request_id, packet_digest: exportDigest, observed_at: recovery.observed_at });
    return { mode: recovery.mode, state: 'DECLARED_INSPECTION_AND_SUPPORT_PRESERVED', authority_restored: false };
  });
  await check('operator_outcome', async () => {
    invariant(latestResult && recoveryTime !== undefined, 'RECOVERED_RETURN_REQUIRED');
    const outcome = input.operator_outcome;
    outcomeTime = observation(outcome, source, 'LOOM');
    invariant(outcomeTime >= recoveryTime && outcome.case_id === activation.activation_digest
      && outcome.request_id === latestResult.request_id, 'OUTCOME_NOT_EXACT_CURRENT_CASE');
    invariant(outcome.reviewed === true && outcome.correct === true && outcome.complete === true && outcome.inspectable === true, 'OPERATOR_NEED_RESOLUTION_NOT_REVIEWED');
    return { state: 'OPERATOR_DECLARED_CORRECT_COMPLETE_INSPECTABLE', request_id: outcome.request_id,
      observed_at: outcome.observed_at, human_comprehension_measured: false };
  });
  await check('failure_demand', async () => {
    const demand = input.failure_demand;
    invariant(activation && completionTime !== undefined && outcomeTime !== undefined, 'FULL_ROUTE_OBSERVATION_REQUIRED');
    invariant(demand?.coverage === 'COMPLETE_OBSERVED_ROUTE' && demand.case_id === activation.activation_digest,
      'FAILURE_DEMAND_COVERAGE_UNOBSERVED');
    invariant(time(demand.from_observed_at) <= completionTime && time(demand.through_observed_at) >= outcomeTime, 'FAILURE_DEMAND_COVERAGE_INCOMPLETE');
    const events = list(demand.events, 'FAILURE_DEMAND_EVENTS_UNOBSERVED'), seen = new Set();
    const counts = Object.fromEntries(FAILURE_KINDS.map(kind => [kind, 0]));
    let at = time(demand.from_observed_at), avoidable = 0;
    const observed = events.map(event => {
      const now = time(event.observed_at);
      invariant(typeof event.id === 'string' && event.id.trim() && !seen.has(event.id), 'FAILURE_EVENT_ID_MISSING_OR_DUPLICATE'); seen.add(event.id);
      invariant(FAILURE_KINDS.includes(event.kind) && ['LOOM', 'MARROWLINE'].includes(event.receiver)
        && typeof event.avoidable === 'boolean' && now >= at && now <= time(demand.through_observed_at), 'FAILURE_EVENT_UNOBSERVED_OR_OUT_OF_ORDER');
      invariant(typeof event.prior_failure_request_id === 'string' && event.prior_failure_request_id.trim(), 'FAILURE_ATTRIBUTION_UNOBSERVED');
      counts[event.kind]++; if (event.avoidable) avoidable++; at = now;
      return { id: event.id, kind: event.kind, receiver: event.receiver, observed_at: event.observed_at,
        avoidable: event.avoidable, prior_failure_request_id: event.prior_failure_request_id };
    });
    failureDemand = { state: 'EXPLICIT_OBSERVED_ROUTE_DECLARATION', counts, total: events.length, avoidable,
      observed_events: observed, zero_is_not_universal_absence: true, attribution_independently_verified: false };
    return { total: events.length, avoidable, retries_are_progress: false };
  });
  const held = checks.filter(item => item.state === 'HELD');
  return freeze({ schema: LOOM_SERVICE_RESOLUTION_SCHEMA,
    status: held.length ? 'HELD' : 'REVIEWED_DECLARED_RESOLUTION', case_id: activation?.activation_digest ?? null,
    source_revision: revision(source) ? source : null, reasons: held.map(item => `${item.id}:${item.reason}`),
    checks, event_history: history, failure_demand: failureDemand,
    progress: { verified_milestones: checks.filter(item => item.state !== 'HELD').length,
      required_milestones: checks.length, transitions_are_progress: false,
      status_only_completion_is_resolution: false },
    evidence_boundary: boundary(),
    claim_ceiling: ['Declared native-route consistency and explicit operator review only.',
      'Missing observations remain HELD; current snapshots do not reconstruct omitted history.',
      'Digest checks do not authenticate receipts, source revision, foreign origin or global latest state.',
      'Recovery inspection does not restore custody authority; failure counts are observed declarations.'] });
}
