import {
  byId,
  escapeHtml,
  humanize,
  installAshStage,
  publishStageWorldAnswer
} from './ash-a7-a11-recompiler-core.js';

export const ASH_A11_CAPSULE_VERSION = 'td613.ash.a11-capsule-recompilation/v0.1';

const host = globalThis.window;
const doc = globalThis.document;

const CAPSULE_QUESTIONS = Object.freeze([
  Object.freeze({
    question:'What is preserved',
    answer:'The current local case identity, its exact Save Point continuity snapshot, attached local receipts, and the digest posture visible at the moment of sealing.'
  }),
  Object.freeze({
    question:'What remains outside',
    answer:'Unselected source material, external systems, recipient-side state, unstored passphrases, unresolved questions, and any claim the local receipts do not establish.'
  }),
  Object.freeze({
    question:'Who may open it',
    answer:'A human who possesses the encrypted copy and supplies the passphrase through the existing local Capsule owner. Ash does not store the passphrase or infer an opener.'
  }),
  Object.freeze({
    question:'What closes it',
    answer:'A deliberate human Save Point or encrypted export action through the existing continuity engine. Merely opening Capsule changes no continuity state.'
  }),
  Object.freeze({
    question:'Where it may go',
    answer:'An encrypted copy may leave through the native export owner. Destination handoff preparation may be explained here, while actual boundary crossing remains a separate authorized surface.'
  }),
  Object.freeze({
    question:'Which receipt follows it',
    answer:'The Save Point receipt follows local continuity. Export, release, route, recipient, and destination-handoff receipts remain separate and appear only after their own exact actions.'
  }),
  Object.freeze({
    question:'How it may return',
    answer:'An encrypted copy may return through the native import owner. Opening it does not silently overwrite the current Case Map; restoration and reconciliation remain human-governed.'
  }),
  Object.freeze({
    question:'What sealing does not prove',
    answer:'Sealing does not prove truth, authorship, identity, intent, causation, consent, safety, completeness, recipient deletion, external custody, or permission to release.'
  })
]);

function openQuestionCount(snapshot) {
  return (snapshot?.gaps?.length || 0) + (snapshot?.openActions?.length || 0);
}

function continuityPosture(snapshot) {
  if (!snapshot?.caseMap) return Object.freeze({ label:'No case open', detail:'Capsule may still open an authenticated encrypted copy through its native owner.' });
  if (!snapshot.latestSavePoint) return Object.freeze({ label:'Continuity open', detail:'No local Save Point has been retained for the current case.' });
  if (snapshot.continuityChanged) return Object.freeze({ label:'Changed since Save Point', detail:'The current case digest differs from the retained continuity snapshot.' });
  return Object.freeze({ label:'Save Point current', detail:'No digest drift is observed against the latest retained local Save Point.' });
}

function ensureCapsuleRoot() {
  const workspace = byId('workspace-capsule');
  if (!workspace) return null;
  let root = byId('ashA11CapsuleRecompilation');
  if (!root) {
    root = doc.createElement('section');
    root.id = 'ashA11CapsuleRecompilation';
    root.className = 'ash-stage-card wide';
    root.setAttribute('aria-labelledby', 'ashA11CapsuleTitle');
    const head = workspace.querySelector('.workspace-head');
    if (head) head.insertAdjacentElement('afterend', root);
    else workspace.prepend(root);
  }
  return root;
}

function focusNativeCapsule() {
  const nativeBody = byId('premiumCapsuleBody');
  if (!nativeBody) return false;
  nativeBody.scrollIntoView?.({ block:'start', behavior:'smooth' });
  const control = nativeBody.querySelector('button:not([disabled]),input:not([disabled])');
  control?.focus?.({ preventScroll:true });
  return true;
}

function bindCapsule(root) {
  if (!root || root.dataset.bound === 'true') return;
  root.dataset.bound = 'true';
  root.addEventListener('click', event => {
    const control = event.target.closest('[data-ash-a11-action]');
    if (!control) return;
    const action = control.dataset.ashA11Action;
    if (action === 'focus-native') {
      const focused = focusNativeCapsule();
      publishStageWorldAnswer('A11', focused
        ? 'Capsule moved focus to the existing continuity owner. No Save Point, export, import, release, handoff, or closure action ran.'
        : 'The native continuity owner is not available in the current view. No state changed.');
      return;
    }
    publishStageWorldAnswer('A11', 'Capsule exposed the requested continuity or handoff preparation surface. Navigation changed; preservation, transport, recipient delivery, custody, and closure did not change automatically.');
  });
}

export function renderAshA11Capsule(snapshot) {
  const root = ensureCapsuleRoot();
  if (!root) return false;
  const posture = continuityPosture(snapshot);
  const save = snapshot?.latestSavePoint || null;
  const release = snapshot?.latestRelease || null;
  const questions = openQuestionCount(snapshot);
  root.dataset.ashA11Capsule = ASH_A11_CAPSULE_VERSION;
  root.innerHTML = `<p class="ash-stage-kicker">Capsule · continuity, sealing, return, and transfer preparation</p>
    <h3 id="ashA11CapsuleTitle">Capsule preserves a returnable local continuity posture without converting sealing into truth or preparation into crossing.</h3>
    <p class="ash-stage-copy">Read the custody questions first. Then use the existing Capsule and Save Point owners below. Each consequential action retains its own human gesture and receipt.</p>
    <section class="ash-stage-card wide" aria-labelledby="ashA11PostureTitle">
      <p class="ash-stage-kicker">Current continuity posture</p>
      <h3 id="ashA11PostureTitle">${escapeHtml(posture.label)}</h3>
      <dl class="ash-stage-facts">
        <div><dt>Current case</dt><dd>${escapeHtml(snapshot?.caseMap ? snapshot.title : 'No case open')}</dd></div>
        <div><dt>Latest Save Point</dt><dd>${escapeHtml(save?.save_point_id || 'Absent')}</dd></div>
        <div><dt>Save Point created</dt><dd>${escapeHtml(save?.created_at || 'Never')}</dd></div>
        <div><dt>Release receipt</dt><dd>${escapeHtml(release?.receipt_id || 'Absent')}</dd></div>
        <div><dt>Open questions / actions</dt><dd>${escapeHtml(String(questions))} remain visible outside the seal.</dd></div>
        <div><dt>World answer</dt><dd>${escapeHtml(posture.detail)}</dd></div>
      </dl>
    </section>
    <section class="ash-stage-card wide" aria-labelledby="ashA11QuestionsTitle">
      <p class="ash-stage-kicker">Eight custody questions</p>
      <h3 id="ashA11QuestionsTitle">Know the boundary before sealing or moving anything</h3>
      <div class="ash-stage-grid">${CAPSULE_QUESTIONS.map(item => `<article class="ash-stage-card"><p class="ash-stage-kicker">${escapeHtml(item.question)}</p><h3>${escapeHtml(item.question)}</h3><p class="ash-stage-copy">${escapeHtml(item.answer)}</p></article>`).join('')}</div>
    </section>
    <section class="ash-stage-card wide" aria-labelledby="ashA11SaveTitle">
      <p class="ash-stage-kicker">Save Points · continuity snapshots</p>
      <h3 id="ashA11SaveTitle">A Save Point preserves a return address; it does not rewind the present</h3>
      <ol class="ash-stage-list">
        <li><strong>Preservation</strong> keeps current local materials and receipts available under their existing owners.</li>
        <li><strong>Sealing</strong> records a deliberate continuity posture and digest through the native Save Point action.</li>
        <li><strong>Save state</strong> names what was retained at one moment, including visible gaps and unanswered questions.</li>
        <li><strong>Return</strong> opens an authenticated copy for inspection; reconciliation with the current Case Map remains a separate human decision.</li>
      </ol>
      <div class="premium-action-row"><button type="button" class="premium-action primary" data-ash-a11-action="focus-native">Use native Capsule controls</button><button type="button" class="premium-action" data-route-workspace="save" data-ash-a11-action="open-save">Open Save Points</button></div>
    </section>
    <section class="ash-stage-card wide" aria-labelledby="ashA11HandoffTitle">
      <p class="ash-stage-kicker">Destination handoff · separate authority</p>
      <h3 id="ashA11HandoffTitle">Preparation belongs in Capsule; actual handoff remains outside the seal</h3>
      <dl class="ash-stage-facts">
        <div><dt>Prepare here</dt><dd>Identify the destination, recipient, purpose, minimized references, required receipts, return posture, and held prerequisites.</dd></div>
        <div><dt>Cross elsewhere</dt><dd>The separate Destination handoff owner requires an exact plan, matched recipient readiness, explicit operator authorization, one attempt, recipient receipt, custody accounting, and replay.</dd></div>
        <div><dt>What stays local</dt><dd>Raw bodies, raw corpora, local joining keys, passphrases, and unselected source material remain outside the handoff packet.</dd></div>
        <div><dt>Return posture</dt><dd>Rollback may restore local transport posture; it cannot prove deletion from a recipient or external system.</dd></div>
      </dl>
      <div class="premium-action-row"><a class="premium-action gold" href="/app/dome-world/ash-destination-handoff.html" target="_blank" rel="noopener" data-ash-a11-action="inspect-handoff">Inspect separate Destination handoff</a></div>
    </section>
    <section class="ash-stage-card wide" aria-labelledby="ashA11CeilingTitle">
      <p class="ash-stage-kicker">Claim ceiling and closure</p>
      <h3 id="ashA11CeilingTitle">Preservation, sealing, transport preparation, crossing, receipt, return, and closure remain distinct</h3>
      <ul class="ash-stage-list">
        <li>A Save Point receipt proves that Ash retained a specific local continuity snapshot and digest posture.</li>
        <li>An encrypted export proves that a copy was prepared locally; it does not prove who later opened it or what an external system retained.</li>
        <li>A release receipt does not itself transport anything. A route record does not prove recipient deletion. A handoff receipt does not erase local custody.</li>
        <li>Capsule may prepare and explain. The destination owner may attempt a crossing only after its own explicit authorization. Human closure remains final.</li>
      </ul>
      <p class="ash-stage-status" id="ashA11Status" role="status" aria-live="polite">A11 compiled Capsule around continuity, sealing limits, Save Points, destination preparation, return, and human closure. No consequential action ran.</p>
    </section>`;
  bindCapsule(root);
  publishStageWorldAnswer('A11', 'Capsule recompiled around preservation, exclusions, opener authority, sealing, receipts, return, destination preparation, proof limits, and human closure. Native owners retain every consequential action.');
  return true;
}

installAshStage({
  stage:'A11',
  sync:renderAshA11Capsule,
  navigationSelectors:'[data-premium-workspace="capsule"],[data-route-workspace="capsule"],[data-route-workspace="save"],#premiumSealSave,#premiumExportCapsule,#premiumImportCapsule,#premiumInspectSave'
});

if (host) host.__td613AshA11Capsule = Object.freeze({
  version:ASH_A11_CAPSULE_VERSION,
  custody_questions:CAPSULE_QUESTIONS.map(item => item.question),
  save_points_recompiled_as_continuity_snapshots:true,
  destination_preparation_in_capsule:true,
  actual_destination_handoff_separate:true,
  automatic_save:false,
  automatic_export:false,
  automatic_import:false,
  automatic_handoff:false,
  authority_changed:false,
  source_bytes_moved:false,
  human_closure_required:true,
  render:renderAshA11Capsule
});
