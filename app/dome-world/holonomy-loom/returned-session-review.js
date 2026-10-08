import { inspectLoomDemoExport, loomDemoDigest } from './demo-contract.js';
import { normalizeLoomAiTask } from './ai-handoff.js';

export const LOOM_RETURN_MESSAGE_SCHEMA = 'td613.loom.return-review-message/v0.1';
export const LOOM_RETURN_REVIEW_STORAGE_KEY = 'td613.loom.return-review.v1';
const MAX_RETURN_BYTES = 2000000;
const copy = value => JSON.parse(JSON.stringify(value));

// A carried review record may contain only bounded JSON data. Never invoke an
// accessor supplied by a caller, and never turn carried data into a custodian.
function snapshot(value, seen = new Set(), depth = 0, budget = { nodes: 0, text: 0 }) {
  if (depth > 40 || ++budget.nodes > 50000) throw new Error('LOOM_RETURN_RECORD_TOO_LARGE');
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    if ((budget.text += value.length) > MAX_RETURN_BYTES) throw new Error('LOOM_RETURN_RECORD_TOO_LARGE');
    return value;
  }
  if (!value || typeof value !== 'object' || seen.has(value)) throw new Error('LOOM_RETURN_NON_DATA');
  const array = Array.isArray(value), keys = Reflect.ownKeys(value);
  if (!array && Object.getPrototypeOf(value) !== Object.prototype) throw new Error('LOOM_RETURN_NON_DATA');
  if (array && (value.length > 1024 || keys.length !== value.length + 1)) throw new Error('LOOM_RETURN_NON_DATA');
  seen.add(value); const output = array ? [] : {};
  for (const key of keys) {
    if (array && key === 'length') continue;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (typeof key !== 'string' || ['__proto__', 'constructor', 'prototype'].includes(key) || descriptor.get || descriptor.set
      || !descriptor.enumerable || (array && (!/^(0|[1-9][0-9]*)$/.test(key) || Number(key) >= value.length))) throw new Error('LOOM_RETURN_NON_DATA');
    output[key] = snapshot(descriptor.value, seen, depth + 1, budget);
  }
  seen.delete(value); return output;
}
function parse(raw) {
  if (typeof raw !== 'string' || raw.length > MAX_RETURN_BYTES) throw new Error('LOOM_RETURN_RECORD_TOO_LARGE');
  return snapshot(JSON.parse(raw));
}
async function originBinding(origin, environment) {
  if (!origin) return null;
  const selected = normalizeLoomAiTask({ task: origin.task, documents: origin.documents, rules: origin.rules, governance: origin.governance });
  return { selected, digest: await loomDemoDigest(selected, environment) };
}
async function compareOrigin(packet, origin, environment) {
  if (!origin) return 'UNOBSERVED';
  const activation = packet.loom_demo_provenance?.activation;
  if (!activation || activation.governance.input_digest !== origin.selected.governance?.input_digest
    || packet.loom_demo_provenance.origin_input_digest !== origin.selected.governance?.input_digest
    || activation.task !== origin.selected.task
    || await loomDemoDigest(activation.rules, environment) !== await loomDemoDigest(origin.selected.rules, environment)
    || await loomDemoDigest(packet.documents, environment) !== await loomDemoDigest(origin.selected.documents, environment)) throw new Error('LOOM_RETURN_ORIGIN_CHANGED');
  return 'ORIGIN_SELECTED_INPUTS_MATCH';
}
async function preservesReviewPrefix(previous, next, environment) {
  if (!previous || previous.loom_demo_provenance.case_id !== next.loom_demo_provenance.case_id) return;
  const before = previous.loom_demo_provenance.stages, after = next.loom_demo_provenance.stages;
  if (after.length < before.length) throw new Error('LOOM_RETURN_EARLIER_SNAPSHOT');
  for (const [index, stage] of before.entries()) {
    const projection = value => ({ receipt: value.receipt, binding: value.binding, receiver: value.receiver,
      observed_at: value.observed_at, predecessor_request_id: value.predecessor_request_id,
      content_predecessor_request_id: value.content_predecessor_request_id });
    if (await loomDemoDigest(projection(stage), environment) !== await loomDemoDigest(projection(after[index]), environment)) throw new Error('LOOM_RETURN_REVIEW_FORK');
  }
}

function localProtectedTerms(value) {
  const terms = snapshot(value);
  if (!Array.isArray(terms) || terms.length > 128
    || terms.some(term => typeof term !== 'string' || !term.trim() || term.length > 1000 || term.includes('\0'))) throw new Error('LOOM_RETURN_INVALID_LOCAL_PRIVATE_POLICY');
  return [...new Set(terms)].sort();
}
function latestRetainedResult(packet) {
  const stages = packet?.loom_demo_provenance?.stages;
  if (!Array.isArray(stages)) return null;
  const substantive = stages.filter(stage => stage?.receipt?.phase === 'CONTINUE' && stage.result);
  return substantive.at(-1)?.result ?? packet?.continuation?.prior_result ?? null;
}
function assertBoundReturnMatchesReview(packet, boundReturn) {
  const latest = latestRetainedResult(packet);
  if (!latest) throw new Error('LOOM_RETURN_BOUND_TURN_WITHOUT_REVIEWED_RESULT');
  const same = boundReturn.answer === latest.answer
    && JSON.stringify(boundReturn.missing_information) === JSON.stringify(latest.missing_information)
    && JSON.stringify(boundReturn.used_document_ids) === JSON.stringify(latest.used_document_ids);
  if (!same) throw new Error('LOOM_RETURN_BOUND_TURN_RESULT_MISMATCH');
}

function checkLocalProtectedResults(packet, terms) {
  const provenance = packet.loom_demo_provenance;
  const records = [provenance.original_result, ...provenance.stages.map(stage => stage.result), packet.continuation?.prior_result].filter(Boolean);
  const retained = [...new Map(records.map(result => [JSON.stringify(result), result])).values()];
  const matches = retained.filter(result => [result.answer, ...result.missing_information, ...result.used_document_ids, result.suggested_next_step]
    .some(value => terms.some(term => value.includes(term))));
  return {
    state: terms.length ? matches.length ? 'HELD_EXACT_LITERAL_MATCH' : 'EXACT_LITERAL_CHECK_CLEAR' : 'NO_DECLARED_LOCAL_TERMS',
    term_count: terms.length, screened_result_count: terms.length ? retained.length : 0, matching_result_count: matches.length,
    screening: 'EXACT_LITERAL_MATCH_CASE_SENSITIVE', scope: 'RETAINED_NORMALIZED_RESULT_TEXT_FIELDS_ONLY',
    policy_source: 'CURRENT_LOCAL_OPERATOR_DECLARATION', hidden_receiver_state_checked: false, universal_secrecy_established: false
  };
}

/** Read-only return inspection. Parsed exports never enter the live v0.2 lane. */
export function mountReturnedSessionReview(root, {
  environment = window, getOrigin = () => null, getChild = () => null, getProtectedTerms = () => [], onReview = () => {}
} = {}) {
  if (!root) return null;
  const doc = root.ownerDocument;
  root.innerHTML = `<section class="loom-return-review" aria-labelledby="loomReturnedSessionTitle">
    <h2 id="loomReturnedSessionTitle">Returned session</h2>
    <p>Review the latest work here. A saved session preserves the review record after reload; local custody admission requires its own live lane.</p>
    <label class="loom-return-upload">Open returned session<input type="file" accept=".json,application/json" data-return-review="upload" aria-label="Open a returned Loom session"></label>
    <p data-return-review="status" role="status" aria-live="polite" tabindex="-1">A return from Marrowline will appear here. You can also open an exported session.</p>
    <div data-return-review="result" hidden>
      <p data-return-review="boundary"></p><p data-return-review="lineage"></p>
      <div data-return-review="history"></div>
      <button type="button" data-return-review="save">Save reviewed session</button>
      <button type="button" data-return-review="clear">Clear review record</button>
    </div>
  </section>`;
  const find = key => root.querySelector(`[data-return-review="${key}"]`);
  let current = null, disposed = false, generation = 0;
  function status(message, held = false) {
    find('status').textContent = message;
    find('status').dataset.state = held ? 'HELD' : 'REVIEW_ONLY';
    if (held) find('status').focus?.({ preventScroll: true });
  }
  function render() {
    if (!current) { find('result').hidden = true; return; }
    find('result').hidden = false;
    const { packet, inspection, origin_match, local_protected_check } = current;
    const provenance = packet.loom_demo_provenance;
    find('boundary').textContent = `${local_protected_check?.state==='EXACT_LITERAL_CHECK_CLEAR' ? 'Declared private terms did not match these returned fields. ' : 'No local private-term check was declared. '}Review consistency checked. Receipt signatures remain unverified. This review record grants no admission authority. See Return to Loom for the current local Check and admission state. ${origin_match === 'UNOBSERVED' ? 'The original local record is unavailable for comparison.' : 'The origin task, selected files and rules match this tab.'}`;
    const continuations = provenance.stages.filter(stage => stage.receipt.phase === 'CONTINUE');
    find('lineage').textContent = `${continuations.length} substantive continuation${continuations.length === 1 ? '' : 's'} · latest ${inspection.latest_request_id}. ${inspection.content_history_retained ? 'Each returned result body is retained.' : 'This earlier export retains receipt links; intermediate result bodies remain unobserved.'}`;
    const history = find('history'); history.replaceChildren();
    const entries = [];
    if (provenance.original_result) entries.push(['Original Loom result', provenance.original_result]);
    let substantive = 0;
    for (const stage of provenance.stages) {
      const label = stage.receipt.phase === 'ACTIVATE' ? 'Setup acknowledgement' : `Continuation ${++substantive}`;
      if (stage.result) entries.push([label, stage.result]);
    }
    if (!inspection.content_history_retained && packet.continuation?.prior_result) entries.push(['Latest returned result', packet.continuation.prior_result]);
    // Latest work is the primary reading path. Earlier bodies remain inspectable
    // together in one sibling surface, preserving full content lineage.
    const prior = doc.createElement('details'), summary = doc.createElement('summary');
    summary.textContent = 'Earlier work and transfer lineage'; prior.append(summary);
    const task = doc.createElement('p'); task.textContent = `Original task: ${packet.task}`; prior.append(task);
    const material = doc.createElement('p'); material.textContent = `Selected material: ${packet.documents.map(item=>item.name||item.id).join(', ') || 'No file bodies'}. Traveling rules: ${packet.rules.join('; ')}`; prior.append(material);
    entries.forEach(([label, result], index) => {
      const article = doc.createElement('article'), title = doc.createElement('h3'), answer = doc.createElement('p'), missing = doc.createElement('p');
      const latest = index === entries.length - 1;
      title.textContent = latest ? `${label} · current` : label; answer.textContent = result.answer; answer.style.whiteSpace = 'pre-wrap';
      missing.textContent = result.missing_information.length ? `Missing evidence: ${result.missing_information.join('; ')}` : 'No missing information declared by this result.';
      article.append(title, answer, missing); (latest ? history : prior).append(article);
    });
    history.append(prior);
  }
  async function receive(input, { source = 'IMPORTED', sourceWindow = null, persist = true, boundReturn = null } = {}) {
    const ticket = ++generation;
    let localProtectedCheck = null;
    try {
      if (source === 'OPENER_RETURN' && (!sourceWindow || sourceWindow !== getChild())) throw new Error('LOOM_RETURN_UNRECOGNIZED_WINDOW');
      const packet = typeof input === 'string' ? parse(input) : snapshot(input);
      // Private check terms are captured before the first await and retained
      // only on this stack. They never enter the packet, storage or transport.
      const protectedTerms = localProtectedTerms(getProtectedTerms());
      const origin = await originBinding(getOrigin(), environment);
      if (source === 'OPENER_RETURN' && !origin) throw new Error('LOOM_RETURN_NO_ACTIVE_ORIGIN');
      const inspection = await inspectLoomDemoExport(packet, environment);
      if (inspection.status !== 'REVIEW_ONLY_CONSISTENCY') throw new Error(inspection.reason || 'LOOM_RETURN_INSPECTION_HELD');
      const origin_match = await compareOrigin(packet, origin, environment);
      await preservesReviewPrefix(current?.packet, packet, environment);
      localProtectedCheck = checkLocalProtectedResults(packet, protectedTerms);
      if (localProtectedCheck.matching_result_count) throw new Error('LOOM_RETURN_PROTECTED_RESULT_MATCH');
      const present = await originBinding(getOrigin(), environment);
      if (disposed || ticket !== generation) return { status: 'HELD', reason: 'LOOM_RETURN_SUPERSEDED_REVIEW' };
      if ((origin?.digest ?? null) !== (present?.digest ?? null)
        || (source === 'OPENER_RETURN' && sourceWindow !== getChild())) throw new Error('LOOM_RETURN_CHANGED_DURING_REVIEW');
      if (JSON.stringify(protectedTerms) !== JSON.stringify(localProtectedTerms(getProtectedTerms()))) {
        localProtectedCheck = { state: 'HELD_LOCAL_PRIVATE_POLICY_CHANGED', screening: 'CHECK_WITHDRAWN', scope: 'CURRENT_LOCAL_REVIEW_ONLY', universal_secrecy_established: false };
        throw new Error('LOOM_RETURN_PRIVATE_POLICY_CHANGED_DURING_REVIEW');
      }
      let carriedBoundReturn = null;
      if (boundReturn !== null) {
        carriedBoundReturn = snapshot(boundReturn);
        if (!carriedBoundReturn || carriedBoundReturn.schema !== 'td613.loom.bound-receiver-turn/v0.2') throw new Error('LOOM_RETURN_BOUND_TURN_INVALID');
        assertBoundReturnMatchesReview(packet, carriedBoundReturn);
      }
      current = { packet, inspection, origin_match, source, local_protected_check: localProtectedCheck };
      let saved = false;
      if (persist) {
        try { environment.sessionStorage?.setItem(LOOM_RETURN_REVIEW_STORAGE_KEY, JSON.stringify(packet)); saved = Boolean(environment.sessionStorage); }
        catch { /* Review remains available; storage success is never inferred. */ }
      }
      render();
      status(`Returned session checked for review. ${saved ? 'This review record is saved in this tab for reload.' : 'Save the reviewed session before closing this tab.'} ${carriedBoundReturn ? 'The bound return is available in Return to Loom; that lane shows its current Check and admission state.' : 'This review record grants no admission authority; receipt signatures remain unverified.'}`);
      const outcome = copy({ ...inspection, origin_match, source, local_protected_check: localProtectedCheck, persisted_for_reload: saved });
      onReview(outcome, carriedBoundReturn ? copy(carriedBoundReturn) : null);
      return outcome;
    } catch (error) {
      if (!disposed && ticket === generation) status(`Return review HELD · ${error.message}. ${current ? 'The previous reviewed snapshot is still available.' : 'No returned session became current.'}`, true);
      return { status: 'HELD', reason: error.message, local_protected_check: localProtectedCheck, live_custody_capability: false, restore_authority: false };
    }
  }
  const message = event => {
    if (event.origin !== environment.location.origin || event.source !== getChild() || !event.source) return;
    try {
      const data = snapshot(event.data);
      const keys = data && Object.keys(data).sort().join('|');
      if (!data || !['packet|schema','bound_return|packet|schema'].includes(keys) || data.schema !== LOOM_RETURN_MESSAGE_SCHEMA) return;
      void receive(data.packet, { source: 'OPENER_RETURN', sourceWindow: event.source, boundReturn: data.bound_return ?? null });
    } catch { status('Return review HELD · malformed carried record. The previous review is unchanged.', true); }
  };
  environment.addEventListener('message', message);
  find('upload').addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > MAX_RETURN_BYTES) throw new Error('LOOM_RETURN_RECORD_TOO_LARGE');
      await receive(await file.text());
    } catch (error) { status(`Return review HELD · ${error.message}.`, true); }
    finally { event.target.value = ''; }
  });
  function download() {
    if (!current) return;
    if (!environment.Blob || !environment.URL?.createObjectURL) { status('Local file saving is unavailable. The review record remains in this tab.', true); return; }
    const url = environment.URL.createObjectURL(new environment.Blob([JSON.stringify(current.packet, null, 2)], { type: 'application/json' }));
    const link = doc.createElement('a'); link.href = url; link.download = 'loom-reviewed-session.json'; doc.body.append(link); link.click(); link.remove();
    environment.setTimeout(() => environment.URL.revokeObjectURL(url), 1000);
    status('Reviewed session download requested. Your browser handles saving; the file carries review material and grants no custody authority.');
  }
  function clear() {
    generation++; current = null;
    try { environment.sessionStorage?.removeItem(LOOM_RETURN_REVIEW_STORAGE_KEY); } catch { /* No authority depends on storage. */ }
    render(); status('Review cleared. The independent local custody lane is unchanged.');
  }
  find('save').addEventListener('click', download); find('clear').addEventListener('click', clear);
  let saved = null;
  try { saved = environment.sessionStorage?.getItem(LOOM_RETURN_REVIEW_STORAGE_KEY); } catch { /* Storage unavailable. */ }
  const ready = saved ? receive(saved, { source: 'RELOADED_REVIEW', persist: false }) : Promise.resolve(null);
  return Object.freeze({ receive, ready, clear, download,
    inspect: () => current ? copy(current) : null,
    dispose() { disposed = true; generation++; environment.removeEventListener('message', message); } });
}
