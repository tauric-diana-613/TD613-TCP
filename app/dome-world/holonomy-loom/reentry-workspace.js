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
  onCheck = () => {},
  onAdmission = () => {},
  onChallenge = null,
  getChallenge = () => null,
  createCustodian = createPortableLoomReentryCustodian,
  now = () => Date.now()
} = {}) {
  if (!root?.ownerDocument) throw new TypeError('Re-entry workspace element required.');
  // Return is an ordinary product workspace. Exact records and compatibility
  // carriers share one secondary surface; no operational step nests a drawer.
  root.innerHTML = `<section class="loom-reentry" data-loom-reentry="drawer" aria-labelledby="loomReentryHeading">
    <header class="loom-reentry-head"><h2 id="loomReentryHeading">Return to Loom</h2><p>Check the returned work. Review its consequence. Choose whether to admit it.</p></header>
    <div class="loom-reentry-body">
      <p>Check compares a carried return with your local task registration. Admit changes Loom's local admitted history. The foreign assistant's internal enforcement remains unobserved.</p>
      <p data-loom-reentry="lane-state" role="status">No live local custody lane. Imported or reloaded records remain review-only.</p>
      <dl class="loom-reentry-state">
        <div><dt>Session root</dt><dd data-loom-reentry="root">Prepare a Loom session first.</dd></div>
        <div><dt>Admitted local head</dt><dd data-loom-reentry="head">No admitted descendant.</dd></div>
        <div><dt>Admitted descendants</dt><dd data-loom-reentry="count">0</dd></div>
      </dl>
      <p data-loom-reentry="anchor"></p>
      <p data-loom-reentry="recovery">This working custody lane lives in this tab. Its private record includes selected source bodies, pasted returns and any attached local challenge answer keys. Save it locally before leaving; do not paste it into a receiver. Reloaded or imported records require a separate custody witness and gain no admission authority here.</p>
      <div data-loom-reentry="active">
        <section class="loom-reentry-step" aria-labelledby="loomReentryRegisterHeading">
          <h3 id="loomReentryRegisterHeading">Register the next task</h3>
          <label for="loomReentryTask">Task to carry<textarea id="loomReentryTask" data-loom-reentry="task" rows="3" maxlength="12000" placeholder="The exact task you intend to carry to another assistant."></textarea></label>
          <p>Sources start empty for each task. Use <a href="#loomReentryInspection" data-loom-reentry="inspect-sources">Sources & exact record</a> to deliberately add source bodies; inherited rules stay attached.</p>
          <p data-loom-reentry="source-selection">No source bodies selected for the next task.</p>
          <p>Prepare registers this task locally and keeps the admitted head unchanged. Copy carries the task, selected sources and return contract to your clipboard; no provider request is made here.</p>
          <div class="loom-reentry-actions"><button type="button" data-loom-reentry="stage" disabled>Prepare next foreign task</button><button type="button" data-loom-reentry="copy" disabled>Copy task + return contract</button></div>
          <p data-loom-reentry="expiry" hidden></p>
          <ol class="loom-reentry-turns" data-loom-reentry="turns" hidden></ol>
        </section>
        <section class="loom-reentry-step" aria-labelledby="loomReentryCheckHeading">
        <h3 id="loomReentryCheckHeading">Check returned work</h3>
        <label for="loomReentryReturns">Returned turns · all registered tasks, in order<textarea id="loomReentryReturns" data-loom-reentry="returns" rows="6" maxlength="1600000" spellcheck="false" aria-describedby="loomReentryReturnsCue" placeholder="[ {first returned object}, {second returned object} ]"></textarea></label>
        <p id="loomReentryReturnsCue">Keep each returned JSON object unchanged and wrap the ordered returns in an array. A matching declaration can still be held for missing or insufficient evidence.</p>
        <section data-loom-reentry="rules-drawer" aria-labelledby="loomReentryRulesHeading"><h4 id="loomReentryRulesHeading">Inherited rules</h4><ul class="loom-reentry-rules" data-loom-reentry="rules"></ul></section>
        <label class="loom-reentry-review"><input type="checkbox" data-loom-reentry="policy-review"><span>I reviewed these returned answers against the exact inherited rules. This review remains an operator declaration.</span></label>
        <p data-loom-reentry="challenge-history-summary">No captured Challenge episodes in this custody lane. A clean or absent assay cannot prove foreign enforcement.</p>
        <label class="loom-reentry-review" data-loom-reentry="challenge-option" hidden><input type="checkbox" data-loom-reentry="attach-challenge"><span>Recheck the current captured Challenge episode with this return. Recorded episodes linked to this excursion remain part of Check even when this box is clear.</span></label>
        <p>Check leaves admitted history unchanged. A candidate requires all registered returns, matching commitments and explicit policy review.</p>
        <div class="loom-reentry-actions"><button type="button" data-loom-reentry="check" disabled>Check returned work</button></div>
        </section>
      </div>
      <div class="loom-reentry-result" data-loom-reentry="result" role="status" aria-live="polite" tabindex="-1" hidden>
        <h4 data-loom-reentry="verdict"></h4><p data-loom-reentry="detail"></p><ul class="loom-reentry-turns" data-loom-reentry="reasons" hidden></ul><p data-loom-reentry="check-observation-status" hidden></p>
      </div>
      <div data-loom-reentry="admission" hidden>
        <h3>Review and admit</h3>
        <p class="loom-reentry-notice" data-loom-reentry="notice"></p>
        <p>The pasted return could have been fabricated without foreign execution. Hidden retention, training, memory and retransmission remain unobserved. This local ledger cannot exclude a separately copied session fork.</p>
        <label class="loom-reentry-review"><input type="checkbox" data-loom-reentry="accept"><span>I reviewed this exact candidate and accept its unresolved foreign claims for this local admission.</span></label>
        <div class="loom-reentry-actions"><button type="button" data-loom-reentry="admit" disabled>Admit returned work</button></div>
      </div>
      <p data-loom-reentry="rest-state" hidden>Resting. Registered tasks and the admitted head stay unchanged; the excursion deadline keeps running. Resume or discard pending tasks when ready.</p>
      <div class="loom-reentry-actions loom-reentry-tools">
        <button type="button" data-loom-reentry="rest" disabled>Rest</button>
        <button type="button" data-loom-reentry="cancel" disabled>Discard pending tasks</button>
        <button type="button" data-loom-reentry="challenge-head" hidden>Challenge current anchor</button>
        <button type="button" data-loom-reentry="save" disabled>Save private custody record</button>
      </div>
      <p>Private Save includes selected source bodies, pasted returns and local challenge answer keys. Keep the file here; do not send it to a receiver. Reloaded records remain review-only.</p>
      <p>Discard removes only this tab's pending registration and candidate. Work already copied or submitted to a receiver cannot be recalled.</p>
      <details id="loomReentryInspection" class="loom-reentry-inspection" data-loom-reentry="inspection">
        <summary>Sources & exact record</summary>
        <section data-loom-reentry="sources-drawer" aria-labelledby="loomReentrySourcesHeading">
          <h3 id="loomReentrySourcesHeading">Sources for the next registered task</h3>
          <p>Include only files intentionally supplied for this task. Prior task files stay unselected. Up to eight objects, each with <code>id</code>, <code>name</code> and <code>text</code>.</p>
          <label for="loomReentrySources">Selected source bodies · JSON array<textarea id="loomReentrySources" data-loom-reentry="sources" rows="4" maxlength="400000" spellcheck="false">[]</textarea></label>
          <label for="loomReentryWithheld">Documents deliberately withheld · count only<input id="loomReentryWithheld" data-loom-reentry="withheld" type="number" min="0" max="8" step="1" value="0"></label>
        </section>
        <section data-loom-reentry="prompt-drawer" hidden><h3>Exact registered transfer</h3><pre data-loom-reentry="prompt"></pre></section>
        <section data-loom-reentry="challenge-history-drawer" hidden><h3>Recorded Challenge episodes and scope</h3><ol class="loom-reentry-turns" data-loom-reentry="challenge-history"></ol></section>
        <section data-loom-reentry="continuation" hidden aria-labelledby="loomCarrierHeading">
          <h3 id="loomCarrierHeading">Continue from the admitted answer · carrier only</h3>
          <p>This carrier includes the latest admitted answer and a new task. It registers no foreign turn and advances no ancestry. Use the registered-task controls above when the next return must be eligible for another local admission.</p>
          <h4>Preceding admitted answer</h4><pre data-loom-reentry="preceding-answer"></pre>
          <label for="loomContinuationTask">Task for this continuation carrier<textarea id="loomContinuationTask" data-loom-reentry="continuation-task" rows="3" maxlength="12000"></textarea></label>
          <p>Choose source bodies deliberately. Only the latest admitted turn's selected documents are available here; every checkbox starts clear.</p>
          <div data-loom-reentry="continuation-sources"></div>
          <p data-loom-reentry="continuation-selection">The prior answer will travel; no source body is selected.</p>
          <div class="loom-reentry-actions"><button type="button" data-loom-reentry="prepare-carrier" disabled>Prepare continuation carrier</button><button type="button" data-loom-reentry="copy-carrier" disabled>Copy admitted continuation</button></div>
          <section data-loom-reentry="carrier-preview" hidden><h4>Exact continuation carrier</h4><pre data-loom-reentry="carrier"></pre></section>
        </section>
        <section><h3>Private local custody and evidence</h3><p>This exact record includes local-only source bodies and any challenge answer keys. Keep it here; imported or reloaded records remain review-only.</p><pre data-loom-reentry="technical">No local custody lane yet.</pre></section>
      </details>
    </div>
  </section>`;

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
    $('check-observation-status').hidden = true; $('check-observation-status').textContent = '';
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
      const detail = root.ownerDocument.createElement('section'), summary = root.ownerDocument.createElement('h4'), body = root.ownerDocument.createElement('pre');
      summary.textContent = document.name; body.textContent = document.text; detail.append(summary, body);
      $('continuation-sources').append(label, detail);
    }
    $('continuation-selection').textContent = 'The prior answer will travel; no source body is selected.';
  }
  function renderState() {
    const view = custodian?.inspect();
    root.dataset.custodyState = disposed ? 'CLOSED' : view ? 'LIVE_PROCESS' : busy ? 'CHECKING' : 'UNAVAILABLE';
    $('lane-state').textContent = disposed ? 'The live local custody lane is closed. Saved records remain review-only.'
      : view ? 'Live local custody in this tab. Check leaves the head unchanged; only exact reviewed admission advances it.'
        : busy ? 'Checking local seed custody. Admission is unavailable until this check completes.'
          : 'No live local custody lane. Imported or reloaded records remain review-only; they cannot authorize admission here.';
    try {
      const sources = JSON.parse($('sources').value);
      $('source-selection').textContent = Array.isArray(sources)
        ? `${sources.length} source bod${sources.length === 1 ? 'y' : 'ies'} selected for the next task · ${$('withheld').value} deliberately withheld. Exact bytes are available in Sources & exact record.`
        : 'Source selection needs a JSON array. Review Sources & exact record before preparing.';
    } catch {
      $('source-selection').textContent = 'Source selection is unreadable. Review Sources & exact record before preparing.';
    }
    if (view) {
      $('root').textContent = compact(view.root_ref); $('root').title = view.root_ref;
      $('head').textContent = view.current_work_unit_ref ? compact(view.current_work_unit_ref) : 'No admitted descendant.';
      $('head').title = view.current_work_unit_ref || '';
      $('count').textContent = String(view.work_unit_count);
      $('anchor').textContent = `Departure anchor ${compact(view.anchor_work_unit_ref)} · seed: ${view.seed_class === 'VERIFIED_PREPARATION' ? 'verified local preparation' : 'verified local result'}. Preparation and admission are separate states.`;
      $('technical').textContent = JSON.stringify({ custody: custodian.export(), candidate }, null, 2);
    }
    const episodes=custodian?.current().challenge_history||[];
    const linked=episodes.filter(item=>excursion && item.scope.excursion_ref===excursion.ref);
    const held=linked.filter(item=>item.status!=='BOUNDED_CHALLENGE_PASSED');
    $('challenge-history-summary').textContent=episodes.length
      ? `${episodes.length} captured Challenge episode(s) retained. ${linked.length} linked to this registered excursion; ${held.length} pending, held or exposed. Linked non-pass episodes prevent admission. Anchor-only episodes do not cover future tasks.`
      : 'No captured Challenge episodes in this custody lane. A clean or absent assay cannot prove foreign enforcement.';
    $('challenge-history-drawer').hidden=!episodes.length;
    $('challenge-history').replaceChildren(...episodes.map(item=>{
      const row=root.ownerDocument.createElement('li');
      row.textContent=`${item.status} · ${item.scope.excursion_ref===excursion?.ref?'current registered excursion':item.scope.excursion_ref?'prior registered excursion':'anchor only; no future-turn coverage'} · ${compact(item.ref)}${item.reason?` · ${item.reason}`:''}`;
      return row;
    }));
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
  listen($('inspect-sources'), 'click', event => {
    event.preventDefault(); $('inspection').open = true; $('sources').focus();
  });

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
    // Observation follows the real local check. A companion display failure
    // cannot overwrite the candidate, advance the head or substitute a verdict.
    renderState();
    try { await onCheck(checked); }
    catch (error) {
      if (!disposed && ticket === generation) {
        $('check-observation-status').textContent = `Local check completed; companion observation refresh held. ${error.message} The checked result and admitted head are unchanged.`;
        $('check-observation-status').hidden = false;
      }
    }
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

  async function setSession(session, packet, { canCommit = () => true } = {}) {
    if (disposed) throw new Error('Re-entry surface is disposed.');
    if (busy) throw new Error('HOLD · finish the pending local operation before replacing this custody lane.');
    if (typeof canCommit !== 'function') throw new TypeError('A custody installation guard must be a function.');
    // Check the replacement without destroying the active lane or its pending
    // tasks. Publication and old-lane closure follow successful construction
    // and the caller's final cancellation/version guard, with no intervening await.
    generation += 1; const ticket = generation;
    const operation = {}; pendingOperation = operation;
    busy = true;
    renderState();
    let next = null;
    try {
      next = await createCustodian(session, packet, { now }, environment);
      if (disposed || ticket !== generation) throw new Error('HOLD · local custody installation was superseded.');
      if (canCommit() !== true) throw new DOMException('Local custody installation stopped before publication.', 'AbortError');
      const ruleItems = session.work_units.at(-1).policy.effective_rules.map(rule => {
        const item = root.ownerDocument.createElement('li'); item.textContent = rule; return item;
      });
      clearExpiry(); custodian?.close(); custodian = next; next = null;
      excursion = null; candidate = null; reviewedRef = null; suppliedChallenge = null; resting = false;
      $('task').value = ''; $('sources').value = '[]'; $('withheld').value = '0'; $('returns').value = '';
      $('policy-review').checked = false; $('accept').checked = false; $('attach-challenge').checked = false;
      $('result').hidden = true; $('prompt-drawer').hidden = true; $('turns').hidden = true; $('expiry').hidden = true;
      $('rules').replaceChildren(...ruleItems);
      showResult('Local admission lane ready.', 'Register the next foreign task before it leaves. The seed remains a verified local preparation or result; no returned descendant has been admitted.', 'READY');
    } catch (error) {
      next?.close();
      if (!disposed && ticket === generation) {
        // A failed replacement cannot consume an earlier review gesture.
        candidate = null; reviewedRef = null; $('accept').checked = false;
        showResult('HOLD · local custody replacement stopped.', `${error.message} ${custodian ? 'The previous custody lane and registered tasks remain unchanged. Check any returned work again before admission.' : 'Imported or reloaded records gain no admission authority here.'}`, 'HELD', [], true);
      }
      throw error;
    }
    finally { if (pendingOperation === operation) { pendingOperation = null; busy = false; if (!disposed) renderState(); } }
  }
  function clearSession() {
    generation += 1; clearExpiry(); custodian?.close(); custodian = null; excursion = null; candidate = null; reviewedRef = null; suppliedChallenge = null; resting = false; busy = false; pendingOperation = null;
    $('root').textContent = 'Prepare a Loom session first.'; $('head').textContent = 'No admitted descendant.'; $('count').textContent = '0'; $('anchor').textContent = ''; $('technical').textContent = 'No local custody lane yet.';
    $('result').hidden = true; $('prompt-drawer').hidden = true; $('turns').hidden = true; $('expiry').hidden = true; renderState();
  }
  function setChallenge(evidence) { const needsCheck=Boolean(candidate); suppliedChallenge = evidence; invalidate(needsCheck?'Challenge evidence changed. Check this exact candidate again before admission.':null); }
  async function recordChallenge(evidence){
    if(disposed||!custodian)return null;
    const lane=custodian;suppliedChallenge=evidence;
    invalidate('Challenge episode captured. Check the returned work again before admission.');
    const pending=lane.recordChallenge(evidence);renderState();
    const record=await pending;
    if(!disposed&&custodian===lane)invalidate('Challenge episode retained with its scope. Check returned work before admission.');
    return record;
  }
  function dispose() { disposed = true; generation += 1; clearExpiry(); custodian?.close(); busy = false; pendingOperation = null; cleanups.splice(0).forEach(cleanup => cleanup()); renderState(); }
  renderState();
  return Object.freeze({ setSession, clearSession, setChallenge, recordChallenge, dispose, getRecord: () => custodian?.export() || null, inspect: () => ({ custody: custodian?.inspect() || null, candidate, excursion, carrier, resting, busy, reviewed_candidate_ref: reviewedRef }) });
}
