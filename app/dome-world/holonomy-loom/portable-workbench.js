import { compileDollhousePortableProjection } from '../../engine/dollhouse-portable-aia-roundtrip.js';
import { createLoomPortableGovernor } from '../../engine/loom-portable-governor.js';
import { answerPortablePractice } from '../marrowline-portable-companion.js';

const pretty = value => JSON.stringify(value, null, 2);
const MAX_RETURN_CHARS = 64000;

/** Finite, user-gestured receiver → operation → return route. Owns no clock. */
export function mountPortableWorkbench(root, { pause = () => {}, activate = () => {} } = {}) {
  root.innerHTML = `
    <p class="lt-eyebrow">Portable governance / local reference environment</p>
    <h3>Keep your rules in force.</h3>
    <p>Bind this session to one governed origin. Each receiver return is checked automatically before it can enter the session.</p>
    <div class="lp-scope"><span>CONNECTED HERE</span><strong>Loom local session</strong><span>Canonical fictional state · three local receiver views</span><span>Remote host adapter: not connected</span></div>
    <div class="lt-evidence"><button type="button" id="lpStart">ACTIVATE LOCAL GOVERNANCE</button><button type="button" id="lpRest" disabled>𝄐 REST</button><button type="button" id="lpResume" hidden>RESUME LOCAL SESSION</button></div>
    <p id="lpStatus" role="status">Ready to bind a fictional origin and enforce this session’s return boundary.</p>
    <svg class="lp-journey" viewBox="0 0 720 280" role="img" aria-labelledby="lpJourneyTitle lpJourneyDescription">
      <title id="lpJourneyTitle">Different directions, different permissions</title><desc id="lpJourneyDescription">The session waits for activation.</desc>
      <defs><pattern id="lpLattice" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="skewX(-18)"><path d="M0 24 L24 0 M0 0 H24" class="lp-grid"/></pattern></defs>
      <ellipse cx="370" cy="140" rx="320" ry="120" fill="url(#lpLattice)"/>
      <g class="lp-layers">
        <path class="lp-track lp-presentation" d="M175 90 C270 28 390 28 470 90 S585 143 630 90"/>
        <path class="lp-track lp-control" id="lpControlPath" d="M175 140 C280 94 390 94 470 140 S580 186 630 140"/>
        <path class="lp-track lp-support" id="lpSupportPath" d="M175 190 C280 157 390 157 470 190 S580 223 630 190"/>
      </g>
      <path class="lp-membrane" d="M540 50 Q577 140 540 230"/>
      <path class="lp-block" id="lpControlBlock" d="M550 125 V155" hidden/><path class="lp-block" id="lpSupportBlock" d="M550 175 V205" hidden/>
      <g class="lp-origin"><circle cx="175" cy="140" r="21"/><text x="175" y="145">cōl</text></g>
      <g class="lp-receiver"><circle cx="470" cy="140" r="21"/><text x="470" y="145">米</text></g>
      <g class="lp-home"><circle cx="630" cy="140" r="21"/><text id="lpHomeMark" x="630" y="145">出</text></g>
      <text class="lp-lane-label" x="15" y="90">PRESENTATION</text><text class="lp-lane-label" x="15" y="140">CONTROL</text><text class="lp-lane-label" x="15" y="190">ACTION SUPPORT</text>
      <text class="lp-stage-label" x="175" y="250">RETAINED ORIGIN</text><text class="lp-stage-label" x="470" y="250">RECEIVER RETURN</text><text class="lp-stage-label" x="630" y="250">ADMISSION</text>
      <text class="lp-stage-label" id="lpJourneyState" x="360" y="275">AWAITING ACTIVATION</text>
    </svg>
    <p id="lpFieldMeaning" class="lp-field-meaning">Presentation can vary. Control and permitted actions must survive the return. The lanes show software comparisons.</p>
    <dl class="lp-comparisons"><div><dt>Presentation</dt><dd>A different view may travel.</dd></div><div><dt>Control · 米</dt><dd id="lpControlMeaning">Origin rules must survive.</dd></div><div><dt>Action support · 出</dt><dd id="lpSupportMeaning">Added permission stays held.</dd></div></dl>
    <p id="lpCounts" class="lt-eyebrow">0 admitted · 0 held</p>
    <div id="lpSession" hidden>
      <p class="lt-eyebrow">Marrowline / governed local receiver</p>
      <p class="lp-limit">This runtime withholds altered controls and unsupported proposals at the local return boundary. The selected fictional state exercises it; external enforcement requires a host adapter. Message-checker input stays separate.</p>
      <label for="lpReceiver">Who is receiving?</label>
      <select id="lpReceiver"><option value="companion">Companion</option><option value="child">Child view</option><option value="auditor">Auditor view</option></select>
      <p id="lpProjection"></p>
      <div class="lp-questions" role="group" aria-label="Operate through the governed receiver">
        <button type="button" data-lp-operation="EXPLAIN_STATE">Inspect permitted actions</button>
        <button type="button" data-lp-operation="TRACE_FLOWCORE">Change view / preserve rules</button>
        <button type="button" data-lp-operation="PROPOSE_ACTION">Request structural rest</button>
        <button type="button" data-lp-operation="REPORT_MISSINGNESS">Report a missing observation</button>
      </div>
      <p id="lpAnswer" class="lp-answer" aria-live="polite">Choose an operation. Its return must pass the active boundary before this session admits the result.</p>
      <div class="lt-evidence"><button type="button" id="lpReturn" disabled>CHECK RETURN AGAIN</button><button type="button" id="lpAlter" disabled>CHALLENGE THE BOUNDARY</button><button type="button" id="lpExit">CLOSE LOCAL SESSION</button></div>
      <button type="button" id="lpApplyRest" hidden>APPLY ADMITTED REST HERE</button><p id="lpVerdict" role="status">Waiting for a return. No action has been executed.</p>
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
  let packet = null, projection = null, candidate = null, receipt = null, revision = 0, governor = null;
  const listeners = [];
  const listen = (target, event, fn) => { target.addEventListener(event, fn); listeners.push(() => target.removeEventListener(event, fn)); };
  const status = text => { $('#lpStatus').textContent = text; };
  function journey(stage, words) {
    root.dataset.journeyStage = stage;
    $('#lpJourneyState').textContent = words;
    $('#lpJourneyDescription').textContent = words + '. Paths show the declared software route, not a measured geometric trajectory.';
    $('#lpHomeMark').textContent = stage === 'held' ? 'Γ' : stage === 'returned' ? '出' : stage === 'rest' ? '𝄐' : '出';
  }
  function invalidate() {
    candidate = null; receipt = null; $('#lpApplyRest').hidden = true;
    $('#lpCandidate').value = ''; $('#lpReturn').disabled = true; $('#lpAlter').disabled = true;
    $('#lpVerdict').textContent = 'Waiting for a return. No action has been executed.';
    $('#lpChecks').hidden = true; $('#lpChecks').replaceChildren(); $('#lpReceipt').textContent = 'No return receipt yet.';
    $('#lpAnswer').textContent = 'Choose an operation. Its return must pass the active boundary before this session admits the result.';
    delete root.dataset.returnStatus;
  }
  function project() {
    invalidate();
    projection = compileDollhousePortableProjection(packet, { receiver: $('#lpReceiver').value });
    const p = projection.presentation;
    $('#lpProjection').textContent = projection.receiver === 'child' ? `${p.consequence} ${p.next}`
      : projection.receiver === 'auditor' ? `${p.scene_id} · ${p.governance.analysis_status} · ${pretty(p.evidentiary_coordinates)}`
      : `${packet.scene.consequence} Available operations: explain, trace, propose, report missingness.`;
    status(`Governance active for “${packet.scene.title}”. Source changes close this binding.`);
    showGovernance();
    const state = governor?.inspect().status;
    journey(state === 'HELD' ? 'held' : state === 'REST' ? 'rest' : 'receiver', state === 'HELD' ? 'LAST RETURN HELD · ORIGIN RETAINED' : state === 'REST' ? 'SESSION RESTING · RETURNS WITHHELD' : 'SAME CONTROL · DIFFERENT PRESENTATION');
  }
  function showCandidate(answer) {
    candidate = answer.candidate; $('#lpCandidate').value = pretty(candidate);
    $('#lpAnswer').textContent = answer.answer; $('#lpReturn').disabled = false; $('#lpAlter').disabled = false;
    $('#lpVerdict').textContent = 'Candidate ready. Return it to Loom before relying on its proposal.';
    $('#lpChecks').hidden = true; $('#lpReceipt').textContent = 'Candidate created; revalidation pending.';
    root.dataset.returnStatus = 'UNTRUSTED'; receipt = null;
    journey('candidate', 'HOST CANDIDATE · STILL UNTRUSTED');
    validate(candidate);
  }
  function validate(value) {
    pause();
    try {
      if (!packet || !projection || !governor) throw new TypeError('Open a current scene before checking a return.');
      if (value?.source_receiver !== projection.receiver) { governor.receive(null); showGovernance(); throw new TypeError('Return receiver differs from the current binding.'); }
      const event = governor.receive(value);
      const result = event.revalidation;
      candidate = value;
      showGovernance(event);
      if (!result || event.outcome !== 'ADMITTED' && result.status === 'PRESENT_TO_HUMAN') throw new TypeError(event.reasons.join('; '));
      receipt = { schema: 'td613.loom.portable-practice-receipt/v0.1', session_revision: revision,
        source_scene: packet.scene.id, source_revision: packet.source.revision,
        origin_replay_checksum: packet.receipt.checksum, checksum_is_authentication: false,
        host: 'MARROWLINE_LOCAL_REFERENCE_PRACTICE_OR_OPERATOR_PASTED_RETURN',
        host_identity_verified: false, candidate: value, revalidation: result,
        provider_calls: 0, action_executed: false, governor: governor.inspect() };
      root.dataset.returnStatus = result.status;
      journey(result.status === 'PRESENT_TO_HUMAN' ? 'returned' : 'held', result.status === 'PRESENT_TO_HUMAN' ? 'RELATION PRESERVED · HUMAN REVIEW NEXT' : 'RETURN HELD · KEEP THE DIFFERENCE VISIBLE');
      $('#lpVerdict').textContent = result.status === 'PRESENT_TO_HUMAN'
        ? 'Return admitted. The receiver preserved your rules. Consequential proposals still wait for your action.'
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
      $('#lpApplyRest').hidden = !(result.status === 'PRESENT_TO_HUMAN' && value.proposed_action === 'REST');
      if (result.status === 'HOLD') $('#lpAnswer').textContent = 'Returned result withheld. The origin and its permitted actions remain unchanged.';
    } catch (error) {
      receipt = null; candidate = null; root.dataset.returnStatus = 'HOLD'; $('#lpChecks').hidden = true; $('#lpApplyRest').hidden = true; $('#lpReturn').disabled = true; $('#lpAnswer').textContent = 'Return withheld before admission.';
      journey('held', 'RETURN REJECTED BEFORE ADMISSION');
      $('#lpVerdict').textContent = `HOLD — return admission failed: ${error.message}`;
      $('#lpReceipt').textContent = 'Malformed return rejected before admission. No successful revalidation receipt was created.';
    }
  }
  function showGovernance(event = governor?.inspect().latest_event) {
    const state = governor?.inspect();
    if (!state) { $('#lpCounts').textContent = '0 admitted · 0 held'; $('#lpControlBlock').setAttribute('hidden', ''); $('#lpSupportBlock').setAttribute('hidden', ''); $('#lpFieldMeaning').textContent = 'Activate governance to bind this origin. Presentation may vary; rules remain attached.'; return; }
    root.dataset.governorStatus = state.status;
    status(state.status === 'ACTIVE' ? 'Local governance active. Receiver returns are checked before admission.' : state.status === 'HELD' ? 'Local governance held a return. The original rules remain in force.' : state.status === 'REST' ? 'Local session resting. Incoming operations are withheld.' : 'Local session closed.');
    $('#lpCounts').textContent = `${state.admitted_count} admitted · ${state.held_count} held · event ${state.revision}`;
    const rejected = event?.outcome === 'HELD';
    const controlHeld = rejected && (!event?.revalidation?.atlas.control_plane_equal || !event?.revalidation?.atlas.flow_core_trace_equal);
    const supportHeld = rejected && (!event?.revalidation || !event.revalidation.fadt.all_fibres_exact || !event.revalidation.action.proposed_action_admissible);
    $('#lpControlPath').setAttribute('d', controlHeld ? 'M175 140 C280 94 390 94 470 140 Q515 170 549 140' : 'M175 140 C280 94 390 94 470 140 S580 186 630 140');
    $('#lpSupportPath').setAttribute('d', supportHeld ? 'M175 190 C280 157 390 157 470 190 Q515 216 549 190' : 'M175 190 C280 157 390 157 470 190 S580 223 630 190');
    $('#lpControlMeaning').textContent = controlHeld ? 'Changed control held at the boundary.' : 'The retained origin controls admission.';
    $('#lpSupportMeaning').textContent = supportHeld ? 'Changed or unsupported action held.' : 'Only origin-supported proposals can pass for human review.';
    $('#lpControlBlock').toggleAttribute('hidden', !controlHeld); $('#lpSupportBlock').toggleAttribute('hidden', !supportHeld);
    const gap = event?.revalidation?.fadt.fibres.flatMap(f => f.irreducible_gap) || [];
    $('#lpFieldMeaning').textContent = rejected
      ? `Boundary held this return. ${!event?.revalidation ? 'Return admission failed before comparison. ' : !event.revalidation.atlas.flow_core_trace_equal ? 'The Flow-Core trace changed. ' : controlHeld ? 'The control envelope changed. ' : ''}${supportHeld ? 'The proposed action support failed. ' : ''}${gap.length ? 'Exact difference: ' + gap.join(', ') + '. ' : ''}The original remains in force.`
      : state.status === 'REST' ? 'The local session is resting. Incoming operations remain withheld until you resume.'
      : 'The receiver may change presentation; the active boundary requires the same control relation and action support. Lanes encode these comparisons, not measured tomography.';
    $('#lpResume').hidden = state.status !== 'REST';
    root.querySelectorAll('[data-lp-operation]').forEach(b => { b.disabled = ['REST', 'CLOSED'].includes(state.status); });
  }
  listen($('#lpStart'), 'click', () => {
    pause(); if (!packet) activate(); if (!packet) return;
    governor?.close(); governor = createLoomPortableGovernor(packet); project(); showGovernance();
    $('#lpSession').hidden = false; $('#lpRest').disabled = false; $('#lpAlter').disabled = false;
  });
  listen($('#lpRest'), 'click', () => { pause(); governor?.rest(); $('#lpApplyRest').hidden = true; showGovernance(); journey('rest', 'SESSION RESTING · RETURNS WITHHELD'); });
  listen($('#lpResume'), 'click', () => { governor?.resume(); showGovernance(); journey('receiver', 'LOCAL GOVERNANCE RESUMED'); });
  listen($('#lpApplyRest'), 'click', () => {
    if (!candidate || !governor || governor.inspect().status !== 'ACTIVE') return;
    validate(candidate); // Fresh current-origin check at the consequential gesture.
    if (receipt?.revalidation.status !== 'PRESENT_TO_HUMAN' || candidate.proposed_action !== 'REST') return;
    pause(); governor.rest(); receipt = { ...receipt, local_effect: 'ANIMATION_PAUSED_AND_SESSION_RESTING', action_executed: 'REST', governor: governor.inspect() };
    $('#lpReceipt').textContent = pretty(receipt); $('#lpApplyRest').hidden = true; showGovernance(); journey('rest', 'ADMITTED REST APPLIED HERE');
    $('#lpVerdict').textContent = 'Rest applied here. Motion paused; this session withholds incoming operations until you resume.';
  });
  listen($('#lpReceiver'), 'change', () => { if (packet && projection) project(); });
  root.querySelectorAll('[data-lp-operation]').forEach(button => listen(button, 'click', () => {
    if (!projection || !governor || ['REST', 'CLOSED'].includes(governor.inspect().status)) return;
    const operation = button.dataset.lpOperation;
    const input = { operation };
    if (operation === 'PROPOSE_ACTION') input.proposedAction = 'REST';
    if (operation === 'REPORT_MISSINGNESS') input.reportedMissingness = ['This receiver has no independent observation of provider hidden state or pre-ingress custody.'];
    showCandidate(answerPortablePractice(projection, input));
  }));
  listen($('#lpReturn'), 'click', () => { if (candidate) validate(candidate); });
  listen($('#lpAlter'), 'click', () => {
    if (!candidate && projection) candidate = answerPortablePractice(projection, { operation: 'TRACE_FLOWCORE' }).candidate;
    if (!candidate) return;
    const altered = JSON.parse(pretty(candidate));
    altered.returned_control.governance.raw_release_allowed = !altered.returned_control.governance.raw_release_allowed;
    $('#lpCandidate').value = pretty(altered); validate(altered);
  });
  listen($('#lpImport'), 'click', () => {
    try {
      if ($('#lpCandidate').value.length > MAX_RETURN_CHARS) throw new TypeError('Return exceeds the 64,000-character practice limit.');
      validate(JSON.parse($('#lpCandidate').value));
    } catch (error) { governor?.receive(null); showGovernance(); root.dataset.returnStatus = 'HOLD'; receipt = null; candidate = null; $('#lpReturn').disabled = true; $('#lpApplyRest').hidden = true; $('#lpAnswer').textContent = 'Return withheld before admission.'; journey('held', 'RETURN COULD NOT BE READ'); $('#lpChecks').hidden = true; $('#lpReceipt').textContent = 'No receipt: return could not be parsed.'; $('#lpVerdict').textContent = `HOLD — ${error.message}`; }
  });
  listen($('#lpExit'), 'click', () => { pause(); governor?.close(); showGovernance(); invalidate(); projection = null; $('#lpRest').disabled = true; $('#lpResume').hidden = true; $('#lpSession').hidden = true; journey('rest', 'AT REST · THE ORIGIN STAYS HERE'); status('Session closed. Activate local governance to bind a new session.'); $('#lpStart').focus(); });
  listen($('#lpExport'), 'click', () => {
    if (!projection) return;
    const blob = new environment.Blob([pretty(projection) + '\n'], { type: 'application/json' });
    const url = environment.URL.createObjectURL(blob), link = root.ownerDocument.createElement('a');
    link.href = url; link.download = `loom-${packet.scene.id}-companion.json`; link.click();
    environment.setTimeout(() => environment.URL.revokeObjectURL(url), 0);
  });
  return Object.freeze({
    setPacket(next) { governor?.close(); governor = null; $('#lpRest').disabled = true; $('#lpResume').hidden = true; delete root.dataset.governorStatus; packet = next; projection = null; revision += 1; invalidate(); showGovernance(); journey('origin', packet ? 'ORIGIN ADMITTED · CHOOSE A RECEIVER' : 'WAITING FOR A SCENE'); $('#lpSession').hidden = true; $('#lpStart').disabled = false; status(packet ? `Ready to govern returns for “${packet.scene.title}”. Activate to bind this origin.` : 'Choose a fictional scene first.'); },
    inspect: () => ({ packet, projection, candidate, receipt, governance: governor?.inspect() || null }),
    destroy() { governor?.close(); listeners.forEach(remove => remove()); }
  });
}
