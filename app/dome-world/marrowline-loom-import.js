import { consumeLoomAiHandoff, LOOM_AI_TASK_SCHEMA, createLoomAiGovernance, createLoomAiTaskGovernor } from './holonomy-loom/ai-handoff.js';

/** A real, explicitly requested Gemini task on the selected Loom projection. */
export function mountMarrowlineLoomTask(root, packet, environment = window) {
  const doc = root.ownerDocument;
  root.replaceChildren();
  root.className = 'loom-import-workspace';
  root.setAttribute('data-loom-import-workspace', '');
  doc.documentElement.setAttribute('data-loom-task-import', 'active');
  const style = doc.createElement('style');
  style.textContent = `html[data-loom-task-import=active]{height:auto!important;min-height:100%;overflow:auto!important;overscroll-behavior:auto!important}html[data-loom-task-import=active] body{position:static!important;inset:auto!important;height:auto!important;min-height:100vh;overflow:visible!important;overscroll-behavior:auto!important}html[data-loom-task-import=active] .ritual-shell{display:block!important;height:auto!important;min-height:100vh;overflow:visible!important;padding:12px!important}html[data-loom-task-import=active] .ritual-shell>:not([data-loom-import-workspace]){display:none!important}html[data-loom-task-import=active] .mobile-dock{display:none!important}.loom-import-workspace{margin:24px 0;padding:clamp(20px,4vw,40px);border:1px solid #367969;border-radius:24px;background:linear-gradient(135deg,#0e2828,#071816);color:#e1f8ef;font:16px/1.55 system-ui,sans-serif}.loom-import-workspace h2{font-size:clamp(25px,4vw,38px);margin:6px 0 12px}.loom-import-workspace p{max-width:72ch}.loom-import-workspace textarea{box-sizing:border-box;width:100%;min-height:160px;border:1px solid #498374;border-radius:16px;padding:18px;background:#071d1b;color:#e1f8ef;font:16px/1.6 system-ui,sans-serif;resize:vertical}.loom-import-workspace button,.loom-import-workspace a{display:inline-block;margin:12px 10px 12px 0;padding:12px 18px;border:1px solid #89ddba;border-radius:24px;background:#a2e6c5;color:#05201b;font:600 15px system-ui,sans-serif;text-decoration:none}.loom-import-workspace button:disabled{opacity:.55}.loom-import-workspace pre{white-space:pre-wrap;overflow-wrap:anywhere;font:14px/1.5 system-ui,sans-serif}.loom-import-workspace details{margin:12px 0;padding:12px;border:1px solid #306658;border-radius:12px}.loom-import-workspace [role=status]{padding:12px 0;color:#b8e5cb}.loom-import-workspace .loom-import-answer{border-left:3px solid #9adbbb;padding:4px 18px;white-space:pre-wrap;overflow-wrap:anywhere}.loom-import-workspace label{display:block;font-weight:650;margin:20px 0 8px}`;
  root.append(style);
  const add = (tag, text, parent = root) => { const el = doc.createElement(tag); el.textContent = text; parent.append(el); return el; };
  add('small', 'LOOM → MARROWLINE');
  add('h2', 'Your AI workspace is ready');
  add('p', 'Your selected task, documents and rules arrived together. Run the task to send this shared material to Gemini and receive a real answer.');
  const label = add('label', 'What should the AI do?');
  const task = add('textarea', '');
  task.id = 'loomImportedTask'; label.htmlFor = task.id; task.value = packet.task; task.maxLength = 12000; task.readOnly = true;
  const material = add('details', '');
  add('summary', `${packet.documents.length} shared documents · ${packet.rules.length} task rules`, material);
  const list = add('ul', '', material);
  packet.rules.forEach(rule => add('li', rule, list));
  packet.documents.forEach(document => { const details = add('details', '', material); add('summary', document.name, details); add('pre', document.text, details); });
  const run = add('button', 'Run this task with Gemini'); run.type = 'button'; run.id = 'loomImportedRun';
  const cancel = add('button', 'Stop waiting'); cancel.type = 'button'; cancel.hidden = true;
  const back = add('a', 'Back to Loom'); back.href = '/dome-world/holonomy-loom.html';
  const relay = add('a', 'Open Marrowline relay'); relay.href = '/dome-world/marrowline.html';
  const status = add('div', 'Ready. Shared material stays here until you run the task.'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  const answer = add('div', ''); answer.className = 'loom-import-answer'; answer.id = 'loomImportedAnswer';
  const exact = add('details', ''); exact.id = 'loomImportedReceiptDetails'; add('summary', 'Inspect task and response receipt', exact); const receipt = add('pre', '', exact); receipt.id = 'loomImportedReceipt';
  add('p', 'Loom carried only the selected material. Marrowline sends the displayed task, selected documents and rules to Gemini. Document instructions remain untrusted input; any proposed onward action requires its own review.', exact);
  receipt.textContent = JSON.stringify({ handoff: packet.handoff_receipt, provider: 'not requested' }, null, 2);
  let governor;
  const ready = (async () => {
    const selected = { task: packet.task, documents: packet.documents, rules: packet.rules };
    if (!packet.governance) packet.governance = await createLoomAiGovernance(selected, {}, environment);
    governor = await createLoomAiTaskGovernor({ ...selected, governance: packet.governance }, environment);
    if (destroyed) governor.close();
    return governor;
  })();
  ready.catch(() => {});
  const rest = add('button', 'Rest this AI workspace'); rest.type = 'button'; rest.id = 'loomImportedRest';
  rest.addEventListener('click', async () => { try { await ready; if (destroyed) return; if (governor.inspect().state === 'REST') { governor.resume(); rest.textContent = 'Rest this AI workspace'; status.textContent = 'Ready. Your selected material and rules remain bound.'; } else { governor.rest(); controller?.abort(); rest.textContent = 'Resume AI workspace'; status.textContent = 'Resting. New AI requests are held.'; } } catch { status.textContent = 'Task held: AIA control could not be bound.'; } });
  let controller;
  let destroyed = false;
  cancel.addEventListener('click', () => controller?.abort());
  run.addEventListener('click', async () => {
    if (controller || destroyed) return;
    if (!task.value.trim()) { status.textContent = 'Enter a task before running.'; return; }
    const request_id = environment.crypto.randomUUID();
    const input = { schema: LOOM_AI_TASK_SCHEMA, request_id, task: task.value, documents: packet.documents, rules: packet.rules };
    const pending = new AbortController(); controller = pending;
    run.disabled = true; task.disabled = true; cancel.hidden = false; answer.textContent = '';
    status.textContent = 'Gemini is working on the shared task…';
    const started_at = new Date().toISOString();
    try {
      await ready;
      const admission = await governor.authorize({ task: task.value, documents: packet.documents, rules: packet.rules, governance: packet.governance });
      if (!admission.allowed) throw new Error('The AIA session held this request. Restore the selected task or resume the workspace.');
      if (destroyed || pending.signal.aborted) return;
      const response = await environment.fetch('/api/khonapolit?operation=loom-task', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(input), signal: pending.signal });
      const output = await response.json();
      if (destroyed || pending.signal.aborted) return;
      if (!response.ok) throw new Error(typeof output.error === 'string' ? output.error.slice(0, 300) : 'Gemini could not complete this task.');
      if (output.status !== 'completed' || output.schema !== 'td613.loom.ai-task-result/v0.1' || output.request_id !== request_id || typeof output.answer !== 'string' || !output.answer.trim() || output.answer.length > 24000 || !Array.isArray(output.missing_information) || output.missing_information.length > 32 || output.missing_information.some(item => typeof item !== 'string' || item.length > 1000) || !Array.isArray(output.used_document_ids) || output.used_document_ids.length > 8 || new Set(output.used_document_ids).size !== output.used_document_ids.length || output.used_document_ids.some(id => !packet.documents.some(document => document.id === id)) || typeof output.suggested_next_step !== 'string' || output.suggested_next_step.length > 2000) throw new Error('The returned task record could not be matched and validated.');
      const admissionReceipt = governor.receive(output, request_id);
      if (!admissionReceipt.allowed) throw new Error('The AIA session held the returned response.');
      answer.textContent = output.answer;
      if (output.missing_information.length) add('p', `Still needed: ${output.missing_information.join(' · ')}`, answer);
      if (output.suggested_next_step) add('p', `Suggested next step: ${output.suggested_next_step}`, answer);
      status.textContent = 'Gemini answered. Review the result and its cited document IDs.';
      receipt.textContent = JSON.stringify({ handoff: packet.handoff_receipt, request_id, started_at, returned_at: new Date().toISOString(), response: output, governance: governor.inspect() }, null, 2);
    } catch (error) {
      if (destroyed) return;
      status.textContent = pending.signal.aborted ? 'Stopped waiting. A request already received by the provider may still finish there.' : `Task held: ${error.message}`;
      receipt.textContent = JSON.stringify({ handoff: packet.handoff_receipt, request_id, started_at, state: pending.signal.aborted ? 'WAIT_CANCELLED' : 'HELD', reason: status.textContent }, null, 2);
    } finally { if (!destroyed) { controller = undefined; run.disabled = false; task.disabled = false; cancel.hidden = true; } }
  });
  return { ready, inspect: () => governor?.inspect() ?? null, destroy() { destroyed = true; controller?.abort(); governor?.close(); doc.documentElement.removeAttribute('data-loom-task-import'); root.removeAttribute('data-loom-import-workspace'); root.replaceChildren(); } };
}

export async function bootMarrowlineLoomImport(environment = window) {
  const match = /^#loom=([a-f0-9]{48})$/.exec(environment.location.hash);
  if (!match) return null;
  const doc = environment.document;
  const root = doc.createElement('section'); root.id = 'loomImportedWorkspace'; root.tabIndex = -1;
  const main = doc.querySelector('main'); if (!main) return null;
  main.prepend(root);
  environment.history.replaceState(null, '', environment.location.pathname + environment.location.search);
  try {
    const packet = await consumeLoomAiHandoff(match[1], environment);
    const workspace = mountMarrowlineLoomTask(root, packet, environment);
    root.focus();
    return workspace;
  } catch (error) {
    root.className = 'panel'; root.textContent = `Loom task could not be opened: ${error.message} `;
    const back = doc.createElement('a'); back.href = '/dome-world/holonomy-loom.html'; back.textContent = 'Return to Loom'; root.append(back);
    return null;
  }
}
if (typeof window !== 'undefined' && typeof document !== 'undefined') bootMarrowlineLoomImport();
