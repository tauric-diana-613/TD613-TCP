import { createStandardPortableLoomRuntime } from '../../engine/portable-loom-standard-runtime.js';

/** Real standard-session controller UI. All material stays in this page until
 * the operator deliberately releases the selected prompt to their clipboard.
 * Receiver replies, selected bodies and local keys are always rendered as text.
 */
export function mountStandardPortableLoom(root, artifact, environment = window) {
  root.innerHTML = `
    <header><p class="eyebrow">𝌋 STANDARD PORTABLE LOOM</p><h1>Choose what travels.</h1><p class="lead">Control what you send to AI. Keep custody of your data. Check what the system can verify.</p><p class="scope">This portable runs its selection, authorization, receipt and custody checks locally. You choose the receiving AI.</p></header>
    <div class="field" data-loom="field" aria-hidden="true"></div>
    <section class="panel start"><button data-loom="start">Start local session</button><p data-loom="status" role="status">Ready. Start a session, then choose your task and material.</p></section>
    <div class="workspace" data-loom="workspace" hidden>
      <section class="panel"><p class="eyebrow">à YOUR REQUEST</p><label>Your task<textarea data-loom="task" rows="3" maxlength="12000" placeholder="What should the receiving AI accomplish?"></textarea></label>
        <div class="source-heading"><h2>hõt // cōl Your material</h2><button data-loom="add">+ Add source</button></div><p class="hint">Select each source that may travel. Leave other sources private.</p><div data-loom="sources"></div>
        <details><summary>Local protection and route</summary><label>Private phrases to check, one per line<textarea data-loom="protected" rows="2" maxlength="8000" placeholder="Optional. These phrases stay local."></textarea></label><label>Selected view<select data-loom="route"><option>UNKNOWN</option><option>EXPERIENTIAL</option><option>CUSTODIAL</option><option>AUDIT</option><option>IMPLEMENTATION</option></select></label></details>
        <div class="actions"><button data-loom="prepare">上 Prepare selected material</button><button data-loom="rest">𝄐 Rest</button></div><p data-loom="selection" class="hint">Nothing prepared for carriage.</p>
        <label>Receiving AI / destination<input data-loom="destination" maxlength="120" placeholder="For example: my temporary ChatGPT conversation"></label>
        <button class="primary" data-loom="carry" disabled>出 Authorize and copy once</button><details><summary>Inspect exact outgoing prompt</summary><pre data-loom="outbound">No authorized carriage yet.</pre></details>
      </section>
      <section class="panel"><p class="eyebrow">下 RETURN AND CHECK</p><h2>Bring the answer home.</h2><p class="hint">Paste the actual structured reply. The local adapter retains its original bytes and binds its answer to your registered task.</p><label>Captured reply<textarea data-loom="reply" rows="8" maxlength="100000" placeholder="Paste the receiving AI’s JSON reply here."></textarea></label>
        <button data-loom="capture">Capture reply</button><label class="choice"><input type="checkbox" data-loom="review">I reviewed the reply against the selected sources and retained rules.</label><button data-loom="check">Check returned work</button><p data-loom="verdict" role="status">Waiting for a captured reply.</p>
        <label class="choice"><input type="checkbox" data-loom="accept">Admit this exact checked return with its recorded observation limits.</label><button data-loom="admit" disabled>Admit reviewed return</button><div class="actions"><button data-loom="retry">↻ Retry same route</button><button data-loom="save">Save private custody record</button></div>
        <details><summary>Inspect verification receipt</summary><pre data-loom="receipt">No return check yet.</pre></details>
      </section>
    </div>
    <section class="panel gate-affordance"><button data-loom="gate" class="gate-attention">米 Check Loom Gate</button><button data-loom="how">下 How do I know?</button><p class="hint">Review selection, authorization, actual local carriage, captured returns, custody and retained alerts.</p></section>
    <section class="panel" data-loom="gate-panel" hidden><h2>米 Loom Gate</h2><pre data-loom="gate-report"></pre></section>
    <dialog data-loom="drawer"><button data-loom="close-drawer" aria-label="Close technical explanation">✕</button><h2>下 How do I know?</h2><pre data-loom="methods"></pre></dialog>
    <footer data-loom="footer">Session awaiting activation · 米 Check Loom Gate ⟐</footer>`;
  const $ = key => root.querySelector(`[data-loom="${key}"]`);
  let runtime = null, busy = false, candidate = null, selectedInput = null, capturedRaw = null, animation = null, closed = false;
  const listeners = [];
  const on = (key, fn) => { const handler = () => run(fn); $(key).addEventListener('click', handler); listeners.push(() => $(key).removeEventListener('click', handler)); };
  function message(text) { $('status').textContent = text; }
  function invalidateForm() { candidate = null; $('admit').disabled = true; $('carry').disabled = true; $('accept').checked = false; }
  function update() {
    if (!runtime) return;
    const state = runtime.inspect(); $('footer').textContent = runtime.footer();
    $('carry').disabled = state.phase !== 'STAGED';
    $('admit').disabled = !candidate || candidate.status !== 'ADMISSION_CANDIDATE';
    root.dataset.phase = state.phase;
    if (environment.matchMedia?.('(prefers-reduced-motion: reduce)').matches) paint(0);
  }
  async function run(fn) {
    if (busy) return; busy = true; root.setAttribute('aria-busy', 'true');
    try { await fn(); } catch (error) { message(error.message); } finally { busy = false; root.setAttribute('aria-busy', 'false'); update(); }
  }
  function requireRuntime() { if (!runtime) throw new Error('Start a local session first.'); }
  const save = (name, content, type = 'application/json') => {
    const url = environment.URL.createObjectURL(new environment.Blob([content], { type }));
    const a = root.ownerDocument.createElement('a'); a.href = url; a.download = name; a.click(); environment.setTimeout(() => environment.URL.revokeObjectURL(url), 0);
  };
  function paint(time) {
    if (!runtime || closed) return;
    const reduced = environment.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const width = Math.max(320, root.clientWidth || 1000);
    const result = runtime.presentation({ viewport: { width, height: 350, viewBox: `0 0 ${width} 350`, compact: width < 600 }, reducedMotion: !!reduced, timestampMs: time });
    $('field').innerHTML = result.svg; // SVG is generated exclusively by the installed renderer, never reply/source text.
    $('field').dataset.carriers = String(result.carrier_count);
  }
  function animate(time) {
    paint(time);
    if (!closed && !environment.matchMedia?.('(prefers-reduced-motion: reduce)').matches) animation = environment.requestAnimationFrame(animate);
  }
  on('start', async () => {
    if (runtime) throw new Error('The active session already exists. Save privately before starting a separate page.');
    runtime = await createStandardPortableLoomRuntime(artifact, { gesture: 'START_LOCAL_SESSION', environment });
    $('workspace').hidden = false; $('start').disabled = true; message('Local governance active. Choose your task and exactly which material may travel.');
    paint(0); if (!environment.matchMedia?.('(prefers-reduced-motion: reduce)').matches) animation = environment.requestAnimationFrame(animate);
  });
  on('add', () => {
    if ($('sources').children.length >= 8) throw new Error('Choose at most eight source records.');
    const item = root.ownerDocument.createElement('article'); item.className = 'source'; item.dataset.sourceId = `source_${environment.crypto.randomUUID().replace(/-/g, '')}`;
    item.innerHTML = '<label>Source name<input data-source="name" maxlength="240" placeholder="Document or excerpt name"></label><label>Source text<textarea data-source="text" rows="3" maxlength="60000"></textarea></label><label class="choice"><input type="checkbox" data-source="share">Allow this source to travel</label><button type="button" data-source="remove">Remove source</button>';
    item.querySelector('[data-source="remove"]').addEventListener('click', () => { item.remove(); invalidateForm(); }); $('sources').append(item); invalidateForm();
  });
  function inputs() {
    return { task: $('task').value, documents: [...$('sources').children].map(item => ({ id: item.dataset.sourceId,
      name: item.querySelector('[data-source="name"]').value, text: item.querySelector('[data-source="text"]').value,
      share: item.querySelector('[data-source="share"]').checked })),
      protected_terms: $('protected').value.split('\n').map(v => v.trim()).filter(Boolean), route: $('route').value };
  }
  on('prepare', async () => {
    requireRuntime(); selectedInput = inputs(); candidate = null; $('review').checked = false; $('accept').checked = false;
    const state = await runtime.stage(selectedInput);
    $('selection').textContent = `${state.selected_document_ids.length} selected · ${state.withheld_document_count} private · review before copying.`;
    $('outbound').textContent = runtime.preview().text;
    $('reply').value = ''; $('receipt').textContent = 'No return check for this intent.';
    message('Selected material prepared. Authorize one exact carriage to your chosen receiver.');
  });
  on('carry', async () => {
    requireRuntime(); if (JSON.stringify(inputs()) !== JSON.stringify(selectedInput)) throw new Error('Selection changed. Prepare the current material again.');
    const state = runtime.inspect();
    const ticket = await runtime.authorize({ gesture: 'AUTHORIZE_ONE_CARRIAGE', destination: $('destination').value,
      expected_payload_digest: state.payload_digest, expected_revision: state.revision });
    const released = await runtime.carry(ticket); $('outbound').textContent = released.text;
    try { await environment.navigator.clipboard.writeText(released.text); message('Authorized prompt copied once. Paste it into the selected receiving AI.'); }
    catch { message('Authorization consumed. The exact released prompt is available under Inspect outgoing prompt; copy it manually.'); }
  });
  on('capture', async () => { requireRuntime(); candidate = null; capturedRaw = $('reply').value; const r = await runtime.capture(capturedRaw); $('receipt').textContent = JSON.stringify(r, null, 2); message(r.status === 'HELD' ? r.reason : 'Original reply bytes retained and answer bound locally. Review before Check.'); });
  on('check', async () => {
    requireRuntime(); if ($('reply').value !== capturedRaw) throw new Error('Reply changed. Capture its actual bytes again.'); if (!$('review').checked) throw new Error('Review the selected sources and root rules before Check.');
    candidate = await runtime.check({ gesture: 'REVIEW_ROOT_RULES' }); $('receipt').textContent = JSON.stringify(candidate, null, 2);
    $('verdict').textContent = candidate.status === 'ADMISSION_CANDIDATE' ? 'Return checks passed. Explicit reviewed admission remains your choice.' : `HOLD · ${candidate.reasons.join('; ')}`;
  });
  on('admit', async () => {
    requireRuntime(); if (!$('accept').checked || !candidate) throw new Error('Review and select this exact candidate before admission.');
    const result = await runtime.admit({ gesture: 'ADMIT_RETURNED_WORK', expected_candidate_ref: candidate.ref,
      expected_head_ref: candidate.expected_head_ref, accept_unresolved: true }); candidate = null;
    $('verdict').textContent = `${result.status} · ${result.local_ledger_advanced ? 'Local custody advanced to the checked descendant.' : result.reason}`;
    message('Admission decision retained. Rest or deliberately prepare the next task.');
  });
  on('rest', async () => { requireRuntime(); await runtime.rest(); invalidateForm(); message('Rest. History retained; outbound authorization cleared. Prepare a fresh intent when ready.'); });
  on('retry', async () => { requireRuntime(); if (JSON.stringify(inputs()) !== JSON.stringify(selectedInput)) throw new Error('Selection changed. Prepare a fresh intent.'); const state = await runtime.retry(); $('outbound').textContent = runtime.preview().text; candidate = null; $('reply').value = ''; message(`New attempt on the retained route. ${state.retained_attempt_count} attempts preserved; fresh authorization required.`); });
  on('save', () => { requireRuntime(); save('portable-loom-private-custody.json', JSON.stringify(runtime.exportPrivate(), null, 2)); message('Private record saved. Keep it local; it contains source bodies and protected targets.'); });
  on('gate', () => { requireRuntime(); $('gate').classList.remove('gate-attention'); $('gate-panel').hidden = false; $('gate-report').textContent = JSON.stringify(runtime.gate(), null, 2); });
  on('how', () => { requireRuntime(); $('methods').textContent = JSON.stringify(runtime.explain(), null, 2); $('drawer').showModal(); });
  on('close-drawer', () => $('drawer').close());
  const formChange = event => { if (event.target.dataset.loom === 'reply') { candidate = null; $('admit').disabled = true; } if (event.target.closest('[data-loom="sources"]') || ['task', 'protected', 'route'].includes(event.target.dataset.loom)) invalidateForm(); };
  root.addEventListener('input', formChange); root.addEventListener('change', formChange);
  return Object.freeze({ inspect: () => runtime?.inspect() ?? { phase: 'AWAITING_ACTIVATION' }, getRuntime: () => runtime,
    dispose() { closed = true; if (animation !== null) environment.cancelAnimationFrame(animation); listeners.forEach(fn => fn()); root.removeEventListener('input', formChange); root.removeEventListener('change', formChange); } });
}
