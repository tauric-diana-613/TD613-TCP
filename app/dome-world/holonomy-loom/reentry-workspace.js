import {
  createPortableLoomReentryCustodian,
  createPortableLoomReentryPrompt
} from '../../engine/portable-loom-reentry.js';

/** Extract carried objects without reserializing their pasted interior bytes. */
export function parseLoomReentryReturnBatch(raw) {
  if (typeof raw !== 'string' || !raw.trim() || raw.length > 1600000) throw new Error('Paste a bounded JSON array of returned turns.');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed) || parsed.length > 16) throw new Error('Return data must be a JSON array of up to sixteen turns.');
  const start = raw.indexOf('['), segments = [];
  let depth = 1, quoted = false, escaped = false, from = start + 1;
  for (let index = start + 1; index < raw.length; index += 1) {
    const char = raw[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') quoted = false;
      continue;
    }
    if (char === '"') { quoted = true; continue; }
    if (char === '[' || char === '{') depth += 1;
    else if (char === ']' || char === '}') {
      depth -= 1;
      if (depth === 0) { if (raw.slice(from, index).trim()) segments.push(raw.slice(from, index)); break; }
    } else if (char === ',' && depth === 1) { segments.push(raw.slice(from, index)); from = index + 1; }
  }
  if (segments.length !== parsed.length) throw new Error('Returned-turn boundaries could not be retained.');
  return parsed.map((value, index) => {
    if (typeof value === 'string') return value;
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Each turn must be a returned JSON object or its exact captured text string.');
    return segments[index];
  });
}

/** Human gesture layer; all admission law stays in the process-local custodian. */
export function mountPortableLoomReentryWorkspace(root, {
  environment = globalThis,
  onAdmission = () => {},
  onChallenge = null,
  getChallenge = () => null,
  createCustodian = createPortableLoomReentryCustodian,
  now = () => Date.now()
} = {}) {
  if (!root?.ownerDocument) throw new TypeError('Re-entry workspace element required.');
  root.innerHTML = `<details class="loom-reentry" data-loom-reentry="drawer">
    <summary><span>Bring work back into Loom<small>Prepare a task. Check its return. Choose whether to admit.</small></span></summary>
    <div class="loom-reentry-body">
      <p>Check compares a carried return with your local task registration. Admit changes Loom's local admitted history. The foreign assistant's internal enforcement remains unobserved.</p>
      <dl class="loom-reentry-state">
        <div><dt>Session root</dt><dd data-loom-reentry="root">Prepare a Loom session first.</dd></div>
        <div><dt>Admitted local head</dt><dd data-loom-reentry="head">No admitted descendant.</dd></div>
        <div><dt>Admitted descendants</dt><dd data-loom-reentry="count">0</dd></div>
      </dl>
      <p data-loom-reentry="anchor"></p>
      <p data-loom-reentry="recovery">This working custody lane lives in this tab. Its private record includes selected source bodies, pasted returns and any attached local challenge answer keys. Save it locally before leaving; do not paste it into a receiver. Reloaded or imported records require a separate custody witness and gain no admission authority here.</p>
      <div data-loom-reentry="active">
        <label for="loomReentryTask">Prepare next foreign task<textarea id="loomReentryTask" data-loom-reentry="task" rows="3" maxlength="12000" placeholder="The exact task you intend to carry to another assistant."></textarea></label>
        <details data-loom-reentry="sources-drawer"><summary>Choose source bodies for this task · starts empty</summary><div>
          <p>Include only files intentionally supplied for this task. Prior task files stay unselected. Up to eight objects, each with <code>id</code>, <code>name</code> and <code>text</code>.</p>
          <label for="loomReentrySources">Selected source bodies · JSON array<textarea id="loomReentrySources" data-loom-reentry="sources" rows="4" maxlength="400000" spellcheck="false">[]</textarea></label>
          <label for="loomReentryWithheld">Documents deliberately withheld · count only<input id="loomReentryWithheld" data-loom-reentry="withheld" type="number" min="0" max="8" step="1" value="0"></label>
        </div></details>
        <p>Prepare registers this task locally and keeps the admitted head unchanged. Copy carries the task, selected sources and return contract to your clipboard; no provider request is made here.</p>
        <div class="loom-reentry-actions"><button type="button" data-loom-reentry="stage" disabled>Prepare next foreign task</button><button type="button" data-loom-reentry="copy" disabled>Copy task + return contract</button></div>
        <p data-loom-reentry="expiry" hidden></p>
        <ol class="loom-reentry-turns" data-loom-reentry="turns" hidden></ol>
        <details data-loom-reentry="prompt-drawer" hidden><summary>Inspect what will travel</summary><pre data-loom-reentry="prompt"></pre></details>
        <label for="loomReentryReturns">Returned turns · all registered tasks, in order<textarea id="loomReentryReturns" data-loom-reentry="returns" rows="6" maxlength="1600000" spellcheck="false" aria-describedby="loomReentryReturnsCue" placeholder="[ {first returned object}, {second returned object} ]"></textarea></label>
        <p id="loomReentryReturnsCue">Keep each returned JSON object unchanged and wrap the ordered returns in an array. A matching declaration can still be held for missing or insufficient evidence.</p>
        <details data-loom-reentry="rules-drawer"><summary>Review the exact inherited rules</summary><ul class="loom-reentry-rules" data-loom-reentry="rules"></ul></details>
        <label class="loom-reentry-review"><input type="checkbox" data-loom-reentry="policy-review"><span>I reviewed these returned answers against the exact inherited rules. This review remains an operator declaration.</span></label>
        <label class="loom-reentry-review" data-loom-reentry="challenge-option" hidden><input type="checkbox" data-loom-reentry="attach-challenge"><span>Attach the current captured Challenge Receiver episode. Its result stays bounded to that episode.</span></label>
        <p>Check leaves admitted history unchanged. A candidate requires all registered returns, matching commitments and explicit policy review.</p>
        <div class="loom-reentry-actions"><button type="button" data-loom-reentry="check" disabled>Check returned work</button></div>
      </div>
      <div class="loom-reentry-result" data-loom-reentry="result" role="status" aria-live="polite" tabindex="-1" hidden>
        <h4 data-loom-reentry="verdict"></h4><p data-loom-reentry="detail"></p><ul class="loom-reentry-turns" data-loom-reentry="reasons" hidden></ul>
      </div>
      <div data-loom-reentry="admission" hidden>
        <p class="loom-reentry-notice" data-loom-reentry="notice"></p>
        <p>The pasted return could have been fabricated without foreign execution. Hidden retention, training, memory and retransmission remain unobserved. This local ledger cannot exclude a separately copied session fork.</p>
        <label class="loom-reentry-review"><input type="checkbox" data-loom-reentry="accept"><span>I reviewed this exact candidate and accept its unresolved foreign claims for this local admission.</span></label>
        <div class="loom-reentry-actions"><button type="button" data-loom-reentry="admit" disabled>Admit returned work</button></div>
      </div>
      <p data-loom-reentry="rest-state" hidden>Resting. Registered tasks and the admitted head stay unchanged; the excursion deadline keeps running. Resume or discard pending tasks when ready.</p>
      <details data-loom-reentry="continuation" hidden><summary>Continue from the admitted answer · carrier only</summary><div>
        <p>This carrier includes the latest admitted answer and a new task. It registers no foreign turn and advances no ancestry. Use the registered-task controls above when the next return must be eligible for another local admission.</p>
        <details><summary>Inspect the preceding admitted answer</summary><pre data-loom-reentry="preceding-answer"></pre></details>
        <label for="loomContinuationTask">Task for this continuation carrier<textarea id="loomContinuationTask" data-loom-reentry="continuation-task" rows="3" maxlength="12000"></textarea></label>
        <p>Choose source bodies deliberately. Only the latest admitted turn's selected documents are available here; every checkbox starts clear.</p>
        <div data-loom-reentry="continuation-sources"></div>
        <p data-loom-reentry="continuation-selection">The prior answer will travel; no source body is selected.</p>
        <div class="loom-reentry-actions"><button type="button" data-loom-reentry="prepare-carrier" disabled>Prepare continuation carrier</button><button type="button" data-loom-reentry="copy-carrier" disabled>Copy admitted continuation</button></div>
        <details data-loom-reentry="carrier-preview" hidden><summary>Inspect the exact continuation carrier</summary><pre data-loom-reentry="carrier"></pre></details>
      </div></details>
      <div class="loom-reentry-actions">
        <button type="button" data-loom-reentry="rest" disabled>Rest</button>
        <button type="button" data-loom-reentry="cancel" disabled>Discard pending tasks</button>
        <button type="button" data-loom-reentry="challenge-head" hidden>Challenge current anchor</button>
        <button type="button" data-loom-reentry="save" disabled>Save private custody record</button>
      </div>
      <p>Discard removes only this tab's pending registration and candidate. Work already copied or submitted to a receiver cannot be recalled.</p>
      <details><summary>Inspect local custody and evidence</summary><pre data-loom-reentry="technical">No local custody lane yet.</pre></details>
    </div>
  </details>`;

  const $ = key => root.querySelector(`[data-loom-reentry="${key}"]`);
  const cleanups = [];
  const listen = (element, event, action) => { element.addEventListener(event, action); cleanups.push(() => element.removeEventListener(event, action)); };
  let custodian = null, excursion = null, candidate = null, reviewedRef = null;
  let suppliedChallenge = null, busy = false, resting = false, disposed = false, generation = 0, expiryTimer = null, pendingOperation = null;
  let carrier = null, carrierHead = null;
  const compact = ref => ref ? `${ref.slice(0, 12)}…` : 'none';
  const expired = () => !!excursion && (now() < excursion.issued_at || now() >= excursion.expires_at);
  const clearExpiry = () => { if (expiryTimer !== null) environment.clearTimeout?.(expiryTimer); expiryTimer = null; };
  const challengeEvidence = () => suppliedChallenge || getChallenge();
  const showResult = (title, detail, state = 'HELD', reasons = [], focus = false) => {
    $('result').hidden = false; $('result').dataset.state = state;
    $('verdict').textContent = title; $('detail').textContent = detail;
    $('reasons').replaceChildren();
    for (const reason of reasons) { const item = root.ownerDocument.createElement('li'); item.textContent = reason; $('reasons').append(item); }
    $('reasons').hidden = reasons.length === 0;
    if (focus) $('result').focus({ preventScroll: false });
  };
  function renderContinuation() {
    const latest = custodian?.current().work_units.at(-1) || null;
    $('continuation').hidden = !latest;
    if ((latest?.ref || null) === carrierHead) return;
    carrierHead = latest?.ref || null; carrier = null;
    $('carrier-preview').hidden = true; $('continuation-task').value = '';
    $('continuation-sources').replaceChildren(); $('preceding-answer').textContent = latest ? JSON.stringify(latest.admitted_result, null, 2) : '';
    for (const document of latest?.selected_documents || []) {
      const label = root.ownerDocument.createElement('label'); label.className = 'loom-reentry-review';
      const checkbox = root.ownerDocument.createElement('input'); checkbox.type = 'checkbox'; checkbox.dataset.continuationSource = document.id;
      const span = root.ownerDocument.createElement('span'); span.textContent = `Carry ${document.name} (${document.id})`;
      label.append(checkbox, span);
      const detail = root.ownerDocument.createElement('details'), summary = root.ownerDocument.createElement('summary'), body = root.ownerDocument.createElement('pre');
      summary.textContent = `Inspect ${document.name}`; body.textContent = document.text; detail.append(summary, body);
      $('continuation-sources').append(label, detail);
    }
    $('continuation-selection').textContent = 'The prior answer will travel; no source body is selected.';
  }
  function renderState() {
    const view = custodian?.inspect();
    if (view) {
      $('root').textContent = compact(view.root_ref); $('root').title = view.root_ref;
      $('head').textContent = view.current_work_unit_ref ? compact(view.current_work_unit_ref) : 'No admitted descendant.';
      $('head').title = view.current_work_unit_ref || '';
      $('count').textContent = String(view.work_unit_count);
      $('anchor').textContent = `Departure anchor ${compact(view.anchor_work_unit_ref)} · seed: ${view.seed_class === 'VERIFIED_PREPARATION' ? 'verified local preparation' : 'verified local result'}. Preparation and admission are separate states.`;
      $('technical').textContent = JSON.stringify({ custody: custodian.export(), candidate }, null, 2);
    }
    const hasChallenge = !!challengeEvidence();
    $('challenge-option').hidden = !hasChallenge;
    if (!hasChallenge) $('attach-challenge').checked = false;
    $('active').hidden = resting;
    $('rest-state').hidden = !resting;
    $('rest').textContent = resting ? 'Resume' : 'Rest';
    $('admission').hidden = !candidate || candidate.status !== 'ADMISSION_CANDIDATE' || resting || expired();
    const unavailable = !custodian || disposed || busy;
    for (const key of ['task', 'sources', 'withheld', 'returns', 'policy-review', 'attach-challenge']) $(key).disabled = unavailable || resting;
    $('stage').disabled = unavailable || resting || expired();
    $('copy').disabled = unavailable || resting || !excursion || expired();
    $('check').disabled = unavailable || resting || !excursion || expired();
    $('admit').disabled = unavailable || resting || expired() || candidate?.status !== 'ADMISSION_CANDIDATE' || reviewedRef !== candidate?.ref || !$('accept').checked;
    $('accept').disabled = unavailable || resting || expired();
    $('rest').disabled = unavailable;
    $('cancel').disabled = unavailable || !excursion;
    $('save').disabled = unavailable;
    $('challenge-head').hidden = typeof onChallenge !== 'function';
    $('challenge-head').disabled = unavailable || resting;
    renderContinuation();
    $('continuation-task').disabled = unavailable || resting;
    for (const item of $('continuation-sources').querySelectorAll('input')) item.disabled = unavailable || resting;
    $('prepare-carrier').disabled = unavailable || resting || !carrierHead;
    $('copy-carrier').disabled = unavailable || resting || !carrier;
  }
  function invalidate(detail = null) {
    generation += 1; candidate = null; reviewedRef = null; $('accept').checked = false; $('admission').hidden = true;
    if (expired()) showResult('HOLD · excursion expired.', 'The admitted head is unchanged. Discard pending tasks before preparing a new excursion.', 'HELD');
    else if (detail) showResult('Check required.', detail, 'HELD');
    renderState();
  }
  function watchExpiry() {
    clearExpiry();
    if (!excursion) { $('expiry').hidden = true; return; }
    $('expiry').hidden = false;
    $('expiry').textContent = `Registered excursion expires ${new Date(excursion.expires_at).toLocaleString()}. Rest does not extend this deadline.`;
    if (environment.setTimeout) expiryTimer = environment.setTimeout(() => {
      expiryTimer = null;
      if (!disposed && excursion && expired()) {
        invalidate(); showResult('HOLD · excursion expired.', 'The admitted head is unchanged. Discard pending tasks before preparing a new excursion.', 'HELD'); renderState();
      }
    }, Math.max(0, excursion.expires_at - now()));
  }
  async function run(action) {
    if (disposed || busy || !custodian) return;
    const operation = {}; pendingOperation = operation; busy = true; renderState();
    const ticket = generation;
    try { await action(ticket); }
    catch (error) { if (!disposed && ticket === generation) { candidate = null; reviewedRef = null; $('accept').checked = false; showResult('HOLD · local operation stopped.', `${error.message} No admission occurred; the admitted head is unchanged.`, 'HELD', [], true); } }
    finally { if (pendingOperation === operation) { pendingOperation = null; busy = false; if (!disposed) renderState(); } }
  }

  for (const key of ['task', 'sources', 'withheld', 'returns']) listen($(key), 'input', () => invalidate('Input changed. Recheck the exact carried return before admission.'));
  for (const key of ['policy-review', 'attach-challenge']) listen($(key), 'change', () => invalidate('Review or challenge selection changed. Check again before admission.'));
  listen($('accept'), 'change', () => { reviewedRef = $('accept').checked && candidate?.status === 'ADMISSION_CANDIDATE' ? candidate.ref : null; renderState(); });

  listen($('stage'), 'click', () => run(async ticket => {
    const documents = JSON.parse($('sources').value);
    if (!Array.isArray(documents) || documents.length > 8) throw new Error('Select a JSON array of up to eight source bodies.');
    const withheld = Number($('withheld').value);
    if (!Number.isInteger(withheld) || withheld < 0 || withheld > 8) throw new Error('Withheld count must be an integer from zero through eight.');
    const next = await custodian.stage({ task: $('task').value, documents, withheld_document_count: withheld });
    if (disposed || ticket !== generation) return;
    excursion = next; candidate = null; reviewedRef = null; $('accept').checked = false;
    $('prompt').textContent = createPortableLoomReentryPrompt(excursion); $('prompt-drawer').hidden = false;
    $('turns').replaceChildren();
    for (const turn of excursion.turns) {
      const item = root.ownerDocument.createElement('li');
      item.textContent = `Task ${turn.turn_index}: ${turn.task.slice(0, 120)}${turn.task.length > 120 ? '…' : ''} · ${turn.documents.length} selected source${turn.documents.length === 1 ? '' : 's'}`;
      $('turns').append(item);
    }
    $('turns').hidden = false;
    $('sources').value = '[]'; $('withheld').value = '0'; $('returns').value = '';
    $('policy-review').checked = false;
    watchExpiry();
    showResult('Task registered locally.', `Task ${excursion.turns.length} is ready to copy. The admitted head is unchanged. Source selection for the next task has been cleared.`, 'REGISTERED', [], true);
  }));
  listen($('copy'), 'click', () => run(async () => {
    if (!excursion || expired()) throw new Error('The registered excursion is unavailable or expired.');
    await environment.navigator.clipboard.writeText(createPortableLoomReentryPrompt(excursion));
    showResult('Task and return contract copied.', 'Only this registered task, its explicit source bodies and inherited rules were copied. Copy made no provider request and did not advance the admitted head.', 'COPIED');
  }));
  listen($('check'), 'click', () => run(async ticket => {
    const rawTurns = parseLoomReentryReturnBatch($('returns').value);
    const attached = $('attach-challenge').checked ? challengeEvidence() : null;
    if ($('attach-challenge').checked && !attached) throw new Error('The selected challenge evidence is unavailable.');
    const checked = await custodian.check({ returns: rawTurns.map(raw => ({ raw, policy_review: $('policy-review').checked ? 'ROOT_RULES_RETAINED' : 'REVIEW_NOT_DECLARED' })), challenge: attached });
    if (disposed || ticket !== generation) return;
    candidate = checked; reviewedRef = null; $('accept').checked = false;
    if (checked.status === 'ADMISSION_CANDIDATE') {
      $('notice').textContent = `Admit adds these ${checked.returned_turns.length} exact returned task${checked.returned_turns.length === 1 ? '' : 's'}, answers and selected source commitments as Loom's next local descendants. The admitted head changes from ${compact(checked.expected_head_ref)} to a new descendant after departure anchor ${compact(checked.departure.anchor_work_unit_ref)}. Root rules remain bound to ${compact(checked.departure.policy_commitment)}. The foreign assistant's enforcement remains unobserved.`;
      showResult('Ready for local admission.', 'The carried record matches this local registration. Nothing has been admitted yet. Review the head-changing consequence below.', 'ADMISSION_CANDIDATE', [], true);
    } else showResult('HOLD · returned work remains unadmitted.', 'Check kept the admitted head unchanged. Resolve the stated mismatch or insufficient evidence before another check.', 'HELD', checked.reasons, true);
  }));
  listen($('admit'), 'click', () => run(async ticket => {
    if (candidate?.status !== 'ADMISSION_CANDIDATE' || reviewedRef !== candidate.ref || !$('accept').checked) throw new Error('Review this exact candidate before admission.');
    const before = custodian.inspect();
    const event = await custodian.admit(candidate, { expected_head_ref: candidate.expected_head_ref, reviewed_candidate_ref: reviewedRef, gesture: 'ADMIT_RETURNED_WORK', accept_unresolved: true });
    if (disposed || ticket !== generation) return;
    if (event.status !== 'ADMITTED') {
      candidate = null; reviewedRef = null; $('accept').checked = false;
      showResult('HOLD · admission did not advance history.', 'The previous admitted head remains current. Check again against the live local state.', 'HELD', [event.reason], true); return;
    }
    excursion = null; candidate = null; reviewedRef = null; suppliedChallenge = null;
    $('accept').checked = false; $('attach-challenge').checked = false; $('policy-review').checked = false;
    $('returns').value = ''; $('prompt-drawer').hidden = true; $('turns').hidden = true; clearExpiry(); $('expiry').hidden = true;
    const after = custodian.inspect();
    showResult('Admitted locally.', `Head ${compact(before.current_work_unit_ref)} → ${compact(after.current_work_unit_ref)}. ${event.work_units.length} returned work unit${event.work_units.length === 1 ? '' : 's'} added; ${after.work_unit_count} local descendants now admitted. Root ${compact(after.root_ref)} remains fixed. Foreign execution remains unresolved.`, 'ADMITTED', [], true);
    renderState();
    try { await onAdmission(event.session, event.work_units.at(-1)); }
    catch (error) { showResult('Admitted locally · continuation refresh held.', `The local head advanced successfully. ${error.message} Save the custody record; refreshing the companion surface needs repair.`, 'ADMITTED', [], true); }
  }));
  listen($('rest'), 'click', () => {
    if (!custodian || busy) return;
    resting = !resting; renderState();
    if (expired()) showResult(resting ? 'Resting · excursion remains expired.' : 'HOLD · excursion remains expired.', 'The admitted head is unchanged. Rest or resume does not extend custody expiry; discard pending tasks before preparing another excursion.', 'HELD');
    else showResult(resting ? 'Resting.' : 'Route resumed.', 'The admitted head and registered tasks are unchanged. The excursion deadline was not extended.', resting ? 'REST' : 'RESUMED');
  });
  listen($('cancel'), 'click', () => {
    if (!custodian || busy) return;
    custodian.cancel(); excursion = null; invalidate(); clearExpiry();
    $('expiry').hidden = true; $('turns').hidden = true; $('prompt-drawer').hidden = true; $('returns').value = ''; $('policy-review').checked = false;
    showResult('Pending tasks discarded locally.', 'The admitted head remains current. Material already copied or submitted to a receiver cannot be recalled.', 'CANCELLED', [], true); renderState();
  });
  listen($('challenge-head'), 'click', () => run(async () => {
    await onChallenge?.(custodian.current(), custodian.current().work_units.at(-1) || null);
  }));
  listen($('save'), 'click', () => run(async () => {
    const payload = JSON.stringify(custodian.export(), null, 2);
    if (!environment.Blob || !environment.URL?.createObjectURL) throw new Error('Local file saving is unavailable in this browser. Inspect and copy the custody record instead.');
    const url = environment.URL.createObjectURL(new environment.Blob([payload], { type: 'application/json' }));
    const link = root.ownerDocument.createElement('a'); link.href = url; link.download = 'loom-local-custody.json'; root.ownerDocument.body.append(link); link.click(); link.remove();
    environment.setTimeout?.(() => environment.URL.revokeObjectURL(url), 1000);
    showResult('Local record download requested.', 'The browser handles saving. Carried integrity remains separate from recovery custody authority.', 'EXPORTED');
  }));
  function invalidateCarrier() {
    carrier = null; $('carrier-preview').hidden = true;
    const ids = [...$('continuation-sources').querySelectorAll('input:checked')].map(item => item.dataset.continuationSource);
    $('continuation-selection').textContent = `The prior answer will travel; ${ids.length} source bod${ids.length === 1 ? 'y is' : 'ies are'} deliberately selected.`;
    renderState();
  }
  listen($('continuation-task'), 'input', invalidateCarrier);
  listen($('continuation-sources'), 'change', invalidateCarrier);
  listen($('prepare-carrier'), 'click', () => run(async ticket => {
    const sourceIds = [...$('continuation-sources').querySelectorAll('input:checked')].map(item => item.dataset.continuationSource);
    const next = await custodian.continuation({ task: $('continuation-task').value, source_ids: sourceIds });
    if (disposed || ticket !== generation) return;
    carrier = next; $('carrier').textContent = JSON.stringify(carrier, null, 2); $('carrier-preview').hidden = false;
    showResult('Continuation carrier prepared.', 'The preceding admitted answer and explicitly selected sources are inspectable before copying. This read-only carrier registers no return and leaves the head unchanged.', 'CARRIER_READY', [], true);
  }));
  listen($('copy-carrier'), 'click', () => run(async () => {
    if (!carrier || carrier.anchor_work_unit_ref !== custodian.inspect().current_work_unit_ref) throw new Error('Prepare a carrier against the current admitted head.');
    await environment.navigator.clipboard.writeText(JSON.stringify(carrier, null, 2));
    showResult('Admitted continuation copied.', 'The new task, preceding admitted answer, inherited rules and explicitly selected source bodies were copied. This carrier made no provider request and registered no new foreign turn.', 'CARRIER_COPIED');
  }));

  async function setSession(session, packet) {
    if (disposed) throw new Error('Re-entry surface is disposed.');
    generation += 1; const ticket = generation; clearExpiry(); custodian?.close(); custodian = null;
    const operation = {}; pendingOperation = operation;
    excursion = null; candidate = null; reviewedRef = null; suppliedChallenge = null; resting = false; busy = true;
    $('task').value = ''; $('sources').value = '[]'; $('withheld').value = '0'; $('returns').value = '';
    $('policy-review').checked = false; $('accept').checked = false; $('attach-challenge').checked = false;
    $('result').hidden = true; $('prompt-drawer').hidden = true; $('turns').hidden = true; $('expiry').hidden = true;
    $('root').textContent = 'Checking the new local seed…'; $('root').title = '';
    $('head').textContent = 'No active admitted descendant.'; $('head').title = ''; $('count').textContent = '0'; $('anchor').textContent = ''; $('technical').textContent = 'New seed custody is being checked.';
    renderState();
    try {
      const next = await createCustodian(session, packet, { now }, environment);
      if (disposed || ticket !== generation) { next.close(); return; }
      custodian = next; $('rules').replaceChildren();
      for (const rule of session.work_units.at(-1).policy.effective_rules) { const item = root.ownerDocument.createElement('li'); item.textContent = rule; $('rules').append(item); }
      showResult('Local admission lane ready.', 'Register the next foreign task before it leaves. The seed remains a verified local preparation or result; no returned descendant has been admitted.', 'READY');
    } catch (error) { if (!disposed && ticket === generation) showResult('HOLD · local custody unavailable.', `${error.message} Imported or reloaded records gain no admission authority here.`, 'HELD', [], true); }
    finally { if (pendingOperation === operation) { pendingOperation = null; busy = false; if (!disposed) renderState(); } }
  }
  function clearSession() {
    generation += 1; clearExpiry(); custodian?.close(); custodian = null; excursion = null; candidate = null; reviewedRef = null; suppliedChallenge = null; resting = false; busy = false; pendingOperation = null;
    $('root').textContent = 'Prepare a Loom session first.'; $('head').textContent = 'No admitted descendant.'; $('count').textContent = '0'; $('anchor').textContent = ''; $('technical').textContent = 'No local custody lane yet.';
    $('result').hidden = true; $('prompt-drawer').hidden = true; $('turns').hidden = true; $('expiry').hidden = true; renderState();
  }
  function setChallenge(evidence) { const needsCheck=Boolean(candidate); suppliedChallenge = evidence; invalidate(needsCheck?'Challenge evidence changed. Check this exact candidate again before admission.':null); }
  function dispose() { disposed = true; generation += 1; clearExpiry(); custodian?.close(); busy = false; pendingOperation = null; cleanups.splice(0).forEach(cleanup => cleanup()); renderState(); }
  renderState();
  return Object.freeze({ setSession, clearSession, setChallenge, dispose, getRecord: () => custodian?.export() || null, inspect: () => ({ custody: custodian?.inspect() || null, candidate, excursion, carrier, resting, busy, reviewed_candidate_ref: reviewedRef }) });
}
