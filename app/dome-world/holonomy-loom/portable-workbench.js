import { compileDollhousePortableProjection, revalidateDollhousePortableReturn } from '../../engine/dollhouse-portable-aia-roundtrip.js';
import { answerPortablePractice } from '../marrowline-portable-companion.js';

const pretty = value => JSON.stringify(value, null, 2);
const MAX_RETURN_CHARS = 64000;

/** Finite, user-gestured receiver → operation → return route. Owns no clock. */
export function mountPortableWorkbench(root, { pause = () => {} } = {}) {
  root.innerHTML = `
    <p class="lt-eyebrow">Carry a relation / bring it home</p>
    <h3>What survives another point of view?</h3>
    <p>Try this scene in a local companion, ask a bounded question, then bring its answer back for checking.</p>
    <button type="button" id="lpStart" disabled>TRY PORTABLE AIA</button>
    <p id="lpStatus" role="status">Choose a fictional scene first.</p>
    <div id="lpSession" hidden>
      <p class="lt-eyebrow">Marrowline / local reference practice</p>
      <p class="lp-limit">Runs in this page. A remote model connection remains unimplemented. Only the selected fictional scene travels through this practice route; your message above stays in the checker.</p>
      <label for="lpReceiver">Who is receiving?</label>
      <select id="lpReceiver"><option value="companion">Companion</option><option value="child">Child view</option><option value="auditor">Auditor view</option></select>
      <p id="lpProjection"></p>
      <div class="lp-questions" role="group" aria-label="Ask the local companion">
        <button type="button" data-lp-operation="EXPLAIN_STATE">What can happen next?</button>
        <button type="button" data-lp-operation="TRACE_FLOWCORE">Why these glyphs?</button>
        <button type="button" data-lp-operation="PROPOSE_ACTION">Suggest rest</button>
        <button type="button" data-lp-operation="REPORT_MISSINGNESS">What cannot be verified here?</button>
      </div>
      <p id="lpAnswer" class="lp-answer" aria-live="polite">Choose a question. The answer will carry a structured, untrusted return candidate.</p>
      <div class="lt-evidence"><button type="button" id="lpReturn" disabled>RETURN TO LOOM</button><button type="button" id="lpAlter" disabled>TRY AN ALTERED RETURN</button><button type="button" id="lpExit">REST / CLOSE COMPANION</button></div>
      <p id="lpVerdict" role="status">Waiting for a return. No action has been executed.</p>
      <dl id="lpChecks" class="lt-facts" hidden></dl>
      <details class="lt-details"><summary>Inspect / carry / return</summary>
        <p>This export carries the versioned control grammar and fictional state. Any external host receives what you share; onward controls cannot establish pre-ingress secrecy.</p>
        <button type="button" id="lpExport">DOWNLOAD COMPANION STATE</button>
        <label for="lpCandidate">Structured return candidate</label>
        <textarea id="lpCandidate" rows="5" maxlength="64000" spellcheck="false" placeholder="Paste a structured return from an external companion, or inspect the local candidate here."></textarea>
        <button type="button" id="lpImport">CHECK PASTED RETURN</button>
        <pre id="lpReceipt">No return receipt yet.</pre>
      </details>
    </div>`;
  const $ = selector => root.querySelector(selector);
  const environment = root.ownerDocument.defaultView;
  let packet = null, projection = null, candidate = null, receipt = null, revision = 0;
  const listeners = [];
  const listen = (target, event, fn) => { target.addEventListener(event, fn); listeners.push(() => target.removeEventListener(event, fn)); };
  const status = text => { $('#lpStatus').textContent = text; };
  function invalidate() {
    candidate = null; receipt = null;
    $('#lpCandidate').value = ''; $('#lpReturn').disabled = true; $('#lpAlter').disabled = true;
    $('#lpVerdict').textContent = 'Waiting for a return. No action has been executed.';
    $('#lpChecks').hidden = true; $('#lpChecks').replaceChildren(); $('#lpReceipt').textContent = 'No return receipt yet.';
    $('#lpAnswer').textContent = 'Choose a question. The answer will carry a structured, untrusted return candidate.';
    delete root.dataset.returnStatus;
  }
  function project() {
    invalidate();
    projection = compileDollhousePortableProjection(packet, { receiver: $('#lpReceiver').value });
    const p = projection.presentation;
    $('#lpProjection').textContent = projection.receiver === 'child' ? `${p.consequence} ${p.next}`
      : projection.receiver === 'auditor' ? `${p.scene_id} · ${p.governance.analysis_status} · ${pretty(p.evidentiary_coordinates)}`
      : `${packet.scene.consequence} Available operations: explain, trace, propose, report missingness.`;
    status(`Local practice open for “${packet.scene.title}”. Source changes invalidate this session.`);
  }
  function showCandidate(answer) {
    candidate = answer.candidate; $('#lpCandidate').value = pretty(candidate);
    $('#lpAnswer').textContent = answer.answer; $('#lpReturn').disabled = false; $('#lpAlter').disabled = false;
    $('#lpVerdict').textContent = 'Candidate ready. Return it to Loom before relying on its proposal.';
    $('#lpChecks').hidden = true; $('#lpReceipt').textContent = 'Candidate created; revalidation pending.';
    root.dataset.returnStatus = 'UNTRUSTED'; receipt = null;
  }
  function validate(value) {
    pause();
    try {
      if (!packet || !projection) throw new TypeError('Open a current scene before checking a return.');
      const result = revalidateDollhousePortableReturn(packet, value);
      receipt = { schema: 'td613.loom.portable-practice-receipt/v0.1', session_revision: revision,
        source_scene: packet.scene.id, source_revision: packet.source.revision,
        origin_replay_checksum: packet.receipt.checksum, checksum_is_authentication: false,
        host: 'MARROWLINE_LOCAL_REFERENCE_PRACTICE_OR_OPERATOR_PASTED_RETURN',
        host_identity_verified: false, candidate: value, revalidation: result,
        provider_calls: 0, action_executed: false };
      root.dataset.returnStatus = result.status;
      $('#lpVerdict').textContent = result.status === 'PRESENT_TO_HUMAN'
        ? 'The checked relation survived this return. You may review the proposal; nothing has been sent or executed.'
        : `HOLD — ${result.reason_codes.join(', ')}. Keep the original state; the returned change earns no action.`;
      const rows = [
        ['Atlas / control', result.atlas.control_plane_equal ? 'Preserved' : 'Changed — held'],
        ['Flow-Core trace', result.atlas.flow_core_trace_equal ? 'Preserved with its legend' : 'Changed — held'],
        ['FADT / support gap Γ', result.fadt.fibres.map(f => f.irreducible_gap.length ? f.irreducible_gap.join(', ') : '∅ for this action-support comparison').join('; ')],
        ['Human closure', 'Required; return grants no release authority'],
        ['Origin evidence', `${packet.alert.observed_vs_modeled}; L ${packet.distinctions.L}`],
        ['Host-reported missingness', result.host_reported_missingness.join('; ') || 'None supplied; completeness unproven']
      ];
      $('#lpChecks').replaceChildren();
      rows.forEach(([name, value]) => { const box = root.ownerDocument.createElement('div'), dt = root.ownerDocument.createElement('dt'), dd = root.ownerDocument.createElement('dd'); dt.textContent = name; dd.textContent = value; box.append(dt, dd); $('#lpChecks').append(box); });
      $('#lpChecks').hidden = false; $('#lpReceipt').textContent = pretty(receipt);
    } catch (error) {
      receipt = null; root.dataset.returnStatus = 'HOLD'; $('#lpChecks').hidden = true;
      $('#lpVerdict').textContent = `HOLD — return admission failed: ${error.message}`;
      $('#lpReceipt').textContent = 'Malformed return rejected before admission. No successful revalidation receipt was created.';
    }
  }
  listen($('#lpStart'), 'click', () => { pause(); if (!packet) return; project(); $('#lpSession').hidden = false; });
  listen($('#lpReceiver'), 'change', () => { if (packet && projection) project(); });
  root.querySelectorAll('[data-lp-operation]').forEach(button => listen(button, 'click', () => {
    if (!projection) return;
    const operation = button.dataset.lpOperation;
    const input = { operation };
    if (operation === 'PROPOSE_ACTION') input.proposedAction = 'REST';
    if (operation === 'REPORT_MISSINGNESS') input.reportedMissingness = ['This receiver has no independent observation of provider hidden state or pre-ingress custody.'];
    showCandidate(answerPortablePractice(projection, input));
  }));
  listen($('#lpReturn'), 'click', () => { if (candidate) validate(candidate); });
  listen($('#lpAlter'), 'click', () => {
    if (!candidate) return;
    const altered = JSON.parse(pretty(candidate));
    altered.returned_control.governance.raw_release_allowed = !altered.returned_control.governance.raw_release_allowed;
    $('#lpCandidate').value = pretty(altered); validate(altered);
  });
  listen($('#lpImport'), 'click', () => {
    try {
      if ($('#lpCandidate').value.length > MAX_RETURN_CHARS) throw new TypeError('Return exceeds the 64,000-character practice limit.');
      validate(JSON.parse($('#lpCandidate').value));
    } catch (error) { root.dataset.returnStatus = 'HOLD'; receipt = null; $('#lpChecks').hidden = true; $('#lpReceipt').textContent = 'No receipt: return could not be parsed.'; $('#lpVerdict').textContent = `HOLD — ${error.message}`; }
  });
  listen($('#lpExit'), 'click', () => { pause(); invalidate(); projection = null; $('#lpSession').hidden = true; status('Companion at rest. Choose Try Portable AIA to begin again.'); $('#lpStart').focus(); });
  listen($('#lpExport'), 'click', () => {
    if (!projection) return;
    const blob = new environment.Blob([pretty(projection) + '\n'], { type: 'application/json' });
    const url = environment.URL.createObjectURL(blob), link = root.ownerDocument.createElement('a');
    link.href = url; link.download = `loom-${packet.scene.id}-companion.json`; link.click();
    environment.setTimeout(() => environment.URL.revokeObjectURL(url), 0);
  });
  return Object.freeze({
    setPacket(next) { packet = next; projection = null; revision += 1; invalidate(); $('#lpSession').hidden = true; $('#lpStart').disabled = !packet; status(packet ? `Ready to carry “${packet.scene.title}” into a different receiver.` : 'Choose a fictional scene first.'); },
    inspect: () => ({ packet, projection, candidate, receipt }),
    destroy() { listeners.forEach(remove => remove()); }
  });
}
