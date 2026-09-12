import { readLoomAiFailure, describeLoomAiFailure } from './holonomy-loom/ai-failure.js';
import { renderLoomAiResult } from './holonomy-loom/ai-result-view.js';
import { consumeLoomAiHandoff, LOOM_AI_TASK_SCHEMA, createLoomAiGovernance, createLoomAiTaskGovernor } from './holonomy-loom/ai-handoff.js';

/** A real, explicitly requested Flow-Core task on the selected Loom projection. */
export function mountMarrowlineLoomTask(root, packet, environment = window) {
  const doc = root.ownerDocument;
  root.replaceChildren();
  root.className = 'loom-import-workspace loom-import-context-card';
  root.setAttribute('data-loom-import-workspace', '');
  doc.documentElement.setAttribute('data-loom-task-import', 'active');
  const style = doc.createElement('style');
  style.textContent = `
.loom-import-workspace{box-sizing:border-box;width:min(100%,860px);margin:0 0 18px;padding:clamp(16px,3vw,28px);border:1px solid #7772b755;border-radius:22px;background:radial-gradient(ellipse at 95% 0%,#4c329733,transparent 62%),linear-gradient(135deg,#191a48f2,#10112cf5);box-shadow:0 18px 70px #08061644;color:#f2efff;font:16px/1.65 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Noto Sans',sans-serif}
.loom-import-workspace h2{font-size:clamp(24px,3.3vw,34px);font-weight:580;letter-spacing:-.03em;line-height:1.2;margin:8px 0 10px}
.loom-import-workspace h3{font-size:20px;font-weight:550;margin:20px 0 4px}
.loom-import-workspace p{max-width:72ch;margin:8px 0;color:#d0ccea}
.loom-import-workspace .loom-import-eyebrow{color:#ebcb83;font-size:12px;letter-spacing:.16em;text-transform:uppercase}
.loom-import-workspace .loom-import-boundary{margin:16px 0;padding:13px 15px;border:1px solid #8881c34d;border-radius:14px;background:#b4a5ff0c;color:#ded8fa}
.loom-import-workspace .loom-import-boundary strong{display:block;color:#f5edcf;margin-bottom:4px}
.loom-import-workspace textarea#loomImportedTask,.loom-import-workspace textarea#loomImportedFollowup{box-sizing:border-box;width:100%;min-height:112px;max-height:55vh;border:1px solid #8580bb66;border-radius:14px;padding:16px;background:#0e103080;color:#f3f0ff;font:16px/1.65 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Noto Sans',sans-serif;resize:vertical;overflow:auto;white-space:pre-wrap;letter-spacing:normal}
.loom-import-workspace textarea#loomImportedFollowup{border-color:#e6c78c77;background:#0c0e2a}
.loom-import-workspace button,.loom-import-workspace a{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;margin:0;padding:11px 16px;border:1px solid #8b81bd80;border-radius:12px;background:#302b6155;color:#f3ecff;font:550 15px/1.35 system-ui,sans-serif;text-decoration:none;cursor:pointer}
.loom-import-workspace button:hover,.loom-import-workspace a:hover{border-color:#d8befc;background:#65529b55}
.loom-import-workspace button:focus-visible,.loom-import-workspace a:focus-visible,.loom-import-workspace summary:focus-visible{outline:2px solid #f0cf88;outline-offset:4px}
.loom-import-workspace #loomImportedRun{border-color:#f0dba1;background:linear-gradient(120deg,#f4dda5,#e7b8d9);color:#21132b;font-weight:700}
.loom-import-workspace button:disabled{opacity:.65;cursor:wait}.loom-import-workspace [hidden]{display:none!important}
.loom-import-workspace .loom-import-actions,.loom-import-workspace .loom-import-links{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin:12px 0}
.loom-import-workspace .loom-import-links{padding-top:14px;border-top:1px solid #8881c340;margin-top:20px}.loom-import-workspace .loom-import-links a{background:transparent;border-color:transparent;color:#d5c9f0;padding-inline:8px}
.loom-import-workspace .loom-import-close{float:right;min-height:36px;padding:7px 10px;font-size:13px;background:transparent}
.loom-import-workspace pre{white-space:pre-wrap;overflow-wrap:anywhere;font:15px/1.75 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Noto Sans',sans-serif;padding:18px 8px;max-width:100%;letter-spacing:normal}
.loom-import-workspace details{margin:10px 0;padding:0 14px;border:1px solid #8881c355;border-radius:14px;background:#17163844}.loom-import-workspace summary{display:flex;justify-content:space-between;align-items:center;gap:16px;list-style:none;cursor:pointer;padding:13px 0;font-weight:600;color:#e4ddfb;min-height:24px}.loom-import-workspace summary::-webkit-details-marker{display:none}.loom-import-workspace summary::after{content:'+';font:400 24px/1 system-ui,sans-serif;color:#e2c387;flex-shrink:0}.loom-import-workspace details[open]>summary::after{content:'−'}
.loom-import-workspace [role=status]{padding:12px 0;color:#d8cdef;min-height:28px}.loom-import-workspace .loom-import-progress{height:3px;background:#6b589455;border-radius:3px;overflow:hidden;margin:8px 0 4px}.loom-import-workspace .loom-import-progress::after{content:'';display:block;width:38%;height:100%;background:linear-gradient(90deg,#a99aff,#f0cfa1);animation:loom-import-wait 2.4s ease-in-out infinite alternate}.loom-import-workspace .loom-import-answer{white-space:normal;overflow-wrap:anywhere;line-height:1.8;padding:12px 0}.loom-import-workspace label{display:block;font-weight:650;margin:16px 0 8px}.loom-import-workspace #loomImportedExpand{float:right;min-height:36px;padding:6px 10px;margin-top:-4px;font-size:13px}.loom-import-workspace .loom-import-provider{font-size:13px;color:#bcb5d5;margin:0 0 8px}
@keyframes loom-import-wait{from{transform:translateX(0)}to{transform:translateX(165%)}}@media(prefers-reduced-motion:reduce){.loom-import-workspace .loom-import-progress::after{animation:none;width:100%}}@media(max-width:560px){.loom-import-workspace{padding:16px 13px;border-radius:18px}.loom-import-workspace #loomImportedRun{flex-basis:100%}.loom-import-workspace details{padding-inline:11px}.loom-import-workspace .loom-import-close{float:none;margin-bottom:8px}}
`;
  root.append(style);
  const add = (tag, text, parent = root) => { const el = doc.createElement(tag); el.textContent = text; parent.append(el); return el; };
  const close = add('button', 'Close imported context'); close.type = 'button'; close.className = 'loom-import-close'; close.setAttribute('aria-label', 'Close imported context and keep Marrowline open');
  const eyebrow = add('small', 'Marrowline · brought from Loom'); eyebrow.className = 'loom-import-eyebrow';
  add('h2', 'Continue your Loom task');
  add('p', 'Your Loom task arrived as context inside Marrowline. The current Marrowline workspace remains available around this card.');
  close.addEventListener('click', () => { root.hidden = true; doc.documentElement.removeAttribute('data-loom-task-import'); });
  const boundary = add('div', ''); boundary.className = 'loom-import-boundary'; boundary.id = 'loomImportedBoundary';
  add('strong', `${packet.documents.length} selected document${packet.documents.length === 1 ? '' : 's'} · ${packet.rules.length} rule${packet.rules.length === 1 ? '' : 's'} carried here`, boundary);
  const withheldCount = packet.governance?.withheld_document_count;
  add('span', Number.isInteger(withheldCount) && withheldCount > 0 ? `${withheldCount} local-only document${withheldCount === 1 ? '' : 's'} stayed out of this transfer. Only the material shown below can be sent.` : 'Only your selected material came here. Documents left unselected in Loom stay outside this transfer.', boundary);
  const expand = add('button', 'Expand task'); expand.type = 'button'; expand.id = 'loomImportedExpand'; expand.setAttribute('aria-expanded', 'false'); expand.setAttribute('aria-controls', 'loomImportedTask');
  const label = add('label', 'Your task');
  const task = add('textarea', ''); task.id = 'loomImportedTask'; label.htmlFor = task.id; task.value = packet.task; task.maxLength = 12000; task.readOnly = true; task.rows = 3;
  expand.addEventListener('click', () => { const expanded = expand.getAttribute('aria-expanded') !== 'true'; expand.setAttribute('aria-expanded', String(expanded)); task.rows = expanded ? 12 : 3; expand.textContent = expanded ? 'Compact task' : 'Expand task'; });
  const actions = add('div', ''); actions.className = 'loom-import-actions';
  const run = add('button', 'Run with Flow-Core AI', actions); run.type = 'button'; run.id = 'loomImportedRun';
  const cancel = add('button', 'Stop waiting', actions); cancel.id = 'loomImportedStop'; cancel.type = 'button'; cancel.hidden = true;
  const provider = add('p', 'This run sends the displayed task, selected documents and rules through Dome-World’s Flow-Core AI runtime. Technical route provenance remains in the receipt.'); provider.className = 'loom-import-provider';
  const progress = add('div', ''); progress.className = 'loom-import-progress'; progress.hidden = true; progress.setAttribute('aria-hidden', 'true');
  const status = add('div', 'Ready when you are. Opening this context card sent nothing to the AI.'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  const answerTitle = add('h3', 'Marrowline’s answer'); answerTitle.hidden = true;
  const answer = add('div', ''); answer.className = 'loom-import-answer'; answer.id = 'loomImportedAnswer';
  const material = add('details', ''); material.id = 'loomImportedDocuments'; add('summary', `Review ${packet.documents.length} selected document${packet.documents.length === 1 ? '' : 's'}`, material);
  packet.documents.forEach(document => { const details = add('details', '', material); add('summary', document.name, details); add('pre', document.text, details); });
  const rules = add('details', ''); rules.id = 'loomImportedRules'; add('summary', `Your portable rules · ${packet.rules.length}`, rules); const list = add('ul', '', rules); packet.rules.forEach(rule => add('li', rule, list));
  const exact = add('details', ''); exact.id = 'loomImportedReceiptDetails'; add('summary', 'Inspect transfer and response receipt', exact); const receipt = add('pre', '', exact); receipt.id = 'loomImportedReceipt';
  add('p', 'The local control checks that this request still matches your selected task and rules. Document instructions remain untrusted input. A returned answer still needs your judgment before any onward action.', exact);
  receipt.textContent = JSON.stringify({ handoff: packet.handoff_receipt, provider: 'not requested' }, null, 2);
  const links = add('nav', ''); links.className = 'loom-import-links'; links.setAttribute('aria-label', 'Imported Loom context navigation');
  const back = add('a', 'Return to Loom', links); back.href = '/dome-world/holonomy-loom.html';
  const relay = add('a', 'Start a separate Marrowline chat', links); relay.href = '/dome-world/marrowline.html';
  let governor;
  let acceptedReceipt = null;
  let controller;
  let destroyed = false;
  const ready = (async () => {
    const selected = { task: packet.task, documents: packet.documents, rules: packet.rules };
    if (!packet.governance) packet.governance = await createLoomAiGovernance(selected, {}, environment);
    governor = await createLoomAiTaskGovernor({ ...selected, governance: packet.governance }, environment);
    if (destroyed) governor.close();
    return governor;
  })();
  ready.catch(() => {});
  const rest = add('button', 'Rest this AI workspace'); rest.type = 'button'; rest.id = 'loomImportedRest'; run.after(rest);
  function recordSessionEvent(kind) { const previous = JSON.parse(receipt.textContent); receipt.textContent = JSON.stringify({ ...previous, session_event: { kind, recorded_at: new Date().toISOString() }, governance: governor.inspect() }, null, 2); }
  rest.addEventListener('click', async () => { try { await ready; if (destroyed) return; if (governor.inspect().state === 'REST') { governor.resume(); rest.textContent = 'Rest this AI workspace'; status.textContent = 'Ready. Your selected material and rules remain bound.'; recordSessionEvent('RESUME'); } else { governor.rest(); controller?.abort(); rest.textContent = 'Resume AI workspace'; status.textContent = 'Resting. Choose “Resume AI workspace” beside Run to continue.'; recordSessionEvent('REST'); } } catch { status.textContent = 'Task held: AIA control could not be bound.'; } });
  cancel.addEventListener('click', () => controller?.abort());
  run.addEventListener('click', async () => {
    if (controller || destroyed) return;
    if (!task.value.trim()) { status.textContent = 'Enter a task before running.'; return; }
    const request_id = environment.crypto.randomUUID();
    const input = { schema: LOOM_AI_TASK_SCHEMA, request_id, task: task.value, documents: packet.documents, rules: packet.rules };
    const pending = new AbortController(); controller = pending;
    const schedule = environment.setTimeout?.bind(environment) ?? setTimeout;
    const unschedule = environment.clearTimeout?.bind(environment) ?? clearTimeout;
    const deadline = schedule(() => pending.abort('deadline'), 55000);
    run.disabled = true; task.disabled = true; cancel.hidden = false; status.textContent = 'Marrowline is working with your selected material. The answer will appear here; you can stop waiting at any time.'; progress.hidden = false; answer.setAttribute('aria-busy', 'true'); run.textContent = 'Working on your task…';
    const started_at = new Date().toISOString(); let providerFailure = null; let clientFetchInvoked = false;
    try {
      await ready;
      const admission = await governor.authorize({ task: task.value, documents: packet.documents, rules: packet.rules, governance: packet.governance });
      if (!admission.allowed) throw new Error(admission.state === 'REST' ? 'This AI workspace is resting. Select “Resume AI workspace” beside Run to continue.' : 'The AIA session held this changed request. Return to Loom to prepare the selected task again.');
      if (destroyed || pending.signal.aborted) return;
      answer.textContent = ''; answerTitle.hidden = true; acceptedReceipt = null; clientFetchInvoked = true;
      const response = await environment.fetch('/api/khonapolit?operation=loom-task', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(input), signal: pending.signal });
      const output = await response.json();
      if (destroyed || pending.signal.aborted) return;
      providerFailure = readLoomAiFailure(output, request_id);
      if (!response.ok || providerFailure) throw new Error(describeLoomAiFailure(providerFailure, response.status));
      if (output.status !== 'completed' || output.schema !== 'td613.loom.ai-task-result/v0.1' || output.request_id !== request_id || typeof output.answer !== 'string' || !output.answer.trim() || output.answer.length > 24000 || !Array.isArray(output.missing_information) || output.missing_information.length > 32 || output.missing_information.some(item => typeof item !== 'string' || item.length > 1000) || !Array.isArray(output.used_document_ids) || output.used_document_ids.length > 8 || new Set(output.used_document_ids).size !== output.used_document_ids.length || output.used_document_ids.some(id => !packet.documents.some(document => document.id === id)) || typeof output.suggested_next_step !== 'string' || output.suggested_next_step.length > 2000) throw new Error('The returned task record could not be matched and validated.');
      const admissionReceipt = governor.receive(output, request_id); if (!admissionReceipt.allowed) throw new Error('The AIA session held the returned response.');
      renderLoomAiResult(answer, output, { documentNames: new Map(packet.documents.map(document => [document.id, document.name])) }); answerTitle.hidden = false; status.textContent = 'Your answer has arrived. Review the sources and any missing information below.';
      acceptedReceipt = { handoff: packet.handoff_receipt, request_id, started_at, returned_at: new Date().toISOString(), response: output, client_fetch_invoked: clientFetchInvoked, governance: governor.inspect() }; receipt.textContent = JSON.stringify(acceptedReceipt, null, 2);
    } catch (error) {
      if (destroyed) return;
      status.textContent = pending.signal.aborted ? (pending.signal.reason === 'deadline' ? 'The AI request exceeded 55 seconds. Your task remains here; you can try again when ready. A request already received by the provider may still finish there.' : 'Stopped waiting. A request already received by the provider may still finish there.') : `Task held: ${error.message}`;
      receipt.textContent = JSON.stringify({ handoff: packet.handoff_receipt, request_id, started_at, state: pending.signal.aborted ? (pending.signal.reason === 'deadline' ? 'CLIENT_DEADLINE' : 'WAIT_CANCELLED') : 'HELD', reason: status.textContent, client_fetch_invoked: clientFetchInvoked, governance: governor?.inspect() ?? null, ...(!clientFetchInvoked && acceptedReceipt ? { retained_answer_receipt: acceptedReceipt } : {}), ...(providerFailure ? { provider_failure: providerFailure } : {}) }, null, 2);
    } finally { unschedule(deadline); if (!destroyed) { controller = undefined; run.disabled = false; task.disabled = false; cancel.hidden = true; progress.hidden = true; answer.setAttribute('aria-busy', 'false'); run.textContent = 'Run with Flow-Core AI'; } }
  });
  return { ready, inspect: () => governor?.inspect() ?? null, destroy() { destroyed = true; controller?.abort(); governor?.close(); doc.documentElement.removeAttribute('data-loom-task-import'); root.removeAttribute('data-loom-import-workspace'); root.replaceChildren(); } };
}

export async function bootMarrowlineLoomImport(environment = window) {
  const match = /^#loom=([a-f0-9]{48})$/.exec(environment.location.hash);
  if (!match) return null;
  const doc = environment.document;
  const root = doc.createElement('section'); root.id = 'loomImportedWorkspace'; root.tabIndex = -1;
  const living = doc.querySelector('.living-workspace');
  const main = living ?? doc.querySelector('main'); if (!main) return null;
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
