import { coutureArmature } from './couture-armature.js';

export const loomWorkspaceTemplate = `${coutureArmature}<section class="loom-stage" aria-labelledby="loomFieldHeading"><div class="loom-stage-copy"><span class="loom-kicker">YOUR AI FIREWALL</span><h1 id="loomFieldHeading">Loom</h1><p>Work with Gemini, ChatGPT, and other LLMs. Inspect the request before it leaves, protect what stays local, and review the answer when it returns.</p></div><section id="aiRuntime" class="ai-runtime" aria-label="Current Loom route"><p class="mark">CURRENT ROUTE</p>
      <h2 id="aiConsequence" hidden>Your work starts here.</h2>
      <div id="aiRuntimeState" class="ai-runtime-state il-state"></div>
      <div id="aiLivingRoom" hidden aria-hidden="true"></div>
      <p id="aiGapSummary" class="ai-muted"></p><p id="aiMotionCause" class="ai-muted" hidden>The field follows actual request events.</p>
      <dl id="aiFacts" class="ai-facts" hidden><div><dt>Selected</dt><dd id="aiSharedCount">0</dd></div><div><dt>Local</dt><dd id="aiLocalCount">0</dd></div><div><dt>Round trip</dt><dd id="aiElapsed">—</dd></div></dl>
      <div class="ai-room-replay"><button type="button" id="aiStillField" aria-pressed="false">Still</button><button type="button" id="aiRoomReplay" disabled>Replay</button><button type="button" id="aiRoomLive" hidden>Live</button><label id="aiRoomScrubLabel" hidden>Observed event <input id="aiRoomScrub" type="range" min="0" max="0" value="0" aria-label="Replay observed event"></label><p id="aiRoomReplayStatus" class="ai-muted"></p></div>
      <div id="aiRuntimeInspection" hidden><div class="ai-view-switch"><button type="button" id="aiChild" aria-pressed="true">Plain language answer</button><button type="button" id="aiAuditor" aria-pressed="false">Auditor answer</button></div><ol id="aiEvents" class="ai-events" aria-label="Request history" hidden></ol><pre id="aiReceipt">No request yet.</pre></div>
    </section>
<div id="loomThresholdLayer" class="loom-threshold-layer">
  <div id="loomThresholdGate" class="loom-threshold-gate" hidden></div>
  <section id="loomFirstCrossing" class="loom-first-crossing" aria-labelledby="loomFirstCrossingTitle" hidden tabindex="-1">
    <div class="loom-motion-view" aria-hidden="true"><span>FLOW-CORE / LIVING FIELD</span><span>𝌋</span></div>
    <div class="loom-first-crossing-copy">
      <div class="loom-tutorial-meta"><span class="loom-threshold-kicker">SEE HOW YOUR AI FIREWALL WORKS · INTERACTIVE DEMO</span><span id="loomTutorialProgress" class="loom-tutorial-progress">1 of 7 · Choose</span></div>
      <h2 id="loomFirstCrossingTitle">Firewall your online life from AI.</h2>
      <p id="loomFirstCrossingPrompt">Work with Gemini, ChatGPT, and other LLMs on your terms. Check exactly what you send, keep protected information out of the request, and examine the answer before accepting it. The wider privacy risks remain visible for review.</p>
      <div class="loom-value-route" aria-label="Three parts of the AI firewall"><span>01 <strong>Inspect the request</strong></span><span>02 <strong>Protect what stays private</strong></span><span>03 <strong>Examine the return</strong></span></div><p class="loom-tutorial-operator-note" aria-label="Current Flow-Core illustration"><span id="loomTutorialOperatorGlyph" class="loom-tutorial-operator-glyph" aria-hidden="true">à</span><span id="loomTutorialOperatorLabel">Gather the question</span></p>
    </div>
    <details class="loom-flowcore-help">
      <summary>What is Flow-Core runtime?</summary>
      <div class="loom-flowcore-panel">
        <button type="button" id="loomFlowcoreHelpClose" class="loom-flowcore-help-close" aria-label="Close Flow-Core explanation">×</button>
        <p>The moving symbols show how a request is gathered, protected, sent, returned, and reviewed. The tutorial is a demonstration; the workspace shows events from your actual request. Tap a glyph to copy it.</p>
        <p id="loomFlowcoreMessage" class="loom-flowcore-message" aria-live="polite"></p>
        <div class="loom-flowcore-legend">
          <span><button type="button" data-flowcore-copy="à" aria-label="Copy à · Gather">à</button> Gather</span><span><button type="button" data-flowcore-copy="米" aria-label="Copy 米 · Revisit">米</button> Revisit</span><span><button type="button" data-flowcore-copy="出" aria-label="Copy 出 · Send">出</button> Send</span><span><button type="button" data-flowcore-copy="hõt" aria-label="Copy hõt · Review">hõt</button> Review</span>
          <span><button type="button" data-flowcore-copy="cōl" aria-label="Copy cōl · Keep private">cōl</button> Keep private</span><span><button type="button" data-flowcore-copy="上" aria-label="Copy 上 · Ready">上</button> Ready</span><span><button type="button" data-flowcore-copy="下" aria-label="Copy 下 · Return">下</button> Return</span><span><button type="button" data-flowcore-copy="𝄐" aria-label="Copy 𝄐 · Rest">𝄐</button> Rest</span>
        </div>
        <p id="loomFlowcoreCopyNotice" class="loom-flowcore-copy-notice" role="status" aria-live="polite" aria-atomic="true"></p>
      </div>
    </details>
    <div class="loom-boundary-event" aria-label="Fictional outgoing check">
      <div class="loom-boundary-event-outgoing">
        <span class="loom-boundary-event-kicker">What this example sends</span>
        <strong>Your question and only the context it needs.</strong>
        <p>See exactly which details would leave your device.</p>
      </div>
      <div class="loom-boundary-event-denial">
        <span class="loom-boundary-event-kicker">A local privacy check</span>
        <div class="loom-boundary-event-collision">
          <code>One excluded phrase</code>
          <span class="loom-boundary-event-stop">HELD LOCALLY</span>
        </div>
        <p>The check held back one private phrase. Other details could still reveal something about you.</p>
      </div>
    </div>
    <div id="loomFirstCrossingObjects" class="loom-first-crossing-objects" aria-label="Tutorial: choose a request and source">
      <button type="button" data-first-crossing-item="brief" aria-pressed="false"><strong>The question you want answered</strong><small>Start with the decision you need help making.</small></button>
      <button type="button" data-first-crossing-item="source" aria-pressed="false"><strong>The context worth sharing</strong><small>Only the details that help answer it.</small></button>
      <div id="loomFirstCrossingPrivate" class="loom-first-crossing-private" role="note"><strong>Keep the rest private</strong><small>This stays outside the AI request</small></div>
    </div>
    <div class="loom-first-crossing-actions">
      <button type="button" id="loomFirstCrossingAction" hidden>Check my request →</button>
      <button type="button" id="loomFirstCrossingStop" hidden>Finish tutorial →</button>
    </div>
    <section id="loomTutorialSelection" class="loom-tutorial-selection" aria-label="Selected tutorial content" hidden>
      <dl><div><dt>Request</dt><dd id="loomTutorialRequest"></dd></div><div><dt>Sources</dt><dd id="loomTutorialReference"></dd></div><div><dt>Instructions</dt><dd id="loomTutorialInstructions"></dd></div></dl>
      <p>Other conversation <span>Outside this example request</span></p>
    </section>
    <blockquote id="loomTutorialSampleAnswer" class="loom-tutorial-sample-answer" hidden><span>Example reply · no AI provider was called</span><p id="loomTutorialSampleAnswerText"></p></blockquote>
    <div class="loom-practice-controls">
      <button type="button" id="loomFirstCrossingBack" hidden>← Start over</button>
      <button type="button" id="loomReplayFirstCrossing" class="loom-replay-first-crossing" hidden>Start over</button>
      <button type="button" id="loomFirstCrossingPause" class="loom-field-toggle" aria-label="Remix the Flow-Core animation" title="Remix the Flow-Core animation">𝌋</button>
      <button type="button" id="loomFirstCrossingLeave">Skip tutorial →</button>
    </div>
    <p id="loomFirstCrossingAnswer" class="loom-first-crossing-answer" aria-live="polite"></p>
    <details class="loom-research-proof" aria-label="How would we test conversation privacy?"><summary>How would we know?</summary><p>We would compare the same exchange from both sides: what you meant to accomplish, what the AI received, what came back, and what someone outside the conversation could learn.</p><p>This walkthrough is fictional. It cannot settle what an outsider could reconstruct, and an AI provider can see whatever you actually send.</p><details class="loom-research-technical"><summary>View the research method and thresholds</summary><p>One real comparison must measure leakage, faithful reconstruction of the intended work, how clues combine, the geometry of the route, and actual returns on both paths. The research targets are L ≤ 0.5 bits, R ≤ 0.2 and J ≤ 0.1, with measured G and observed C. Results from separate conversations cannot stand in for one complete journey.</p></details></details>
    <details class="loom-science-intro" aria-label="Explore mathematical privacy examples"><summary>Explore the privacy science · real calculations</summary><div id="loomScienceIntro" class="loom-science-host"></div></details><p id="loomTutorialWaiting" class="loom-tutorial-waiting" role="status" hidden>Preparing the next step…</p>
    <details id="loomTutorialProof" class="loom-tutorial-proof" hidden><summary>See the checks <span aria-hidden="true">+</span></summary><div class="loom-tutorial-check-summary" role="note"><p><strong>What went out?</strong> Nothing. The tutorial ran entirely in your browser.</p><p><strong>What was checked?</strong> One excluded phrase was held by the local example.</p><p><strong>What remains unknown?</strong> What someone outside the exchange could infer.</p></div><p>Save the request and its checks for review. New returned work still needs your approval in the active Loom session. This tutorial uses a fictional reply.</p><details class="loom-tutorial-technical"><summary>View machine-readable receipt</summary><pre id="loomTutorialProofRecord"></pre></details></details>
  </section>
<span class="loom-edition" aria-hidden="true">TD613 · Human authority, by design</span>
</div>
<div class="loom-hero-route" aria-hidden="true"><span data-hero-step="loom"><b>1</b> Loom</span><i>→</i><span data-hero-step="marrowline"><b>2</b> Marrowline</span><i>→</i><span data-hero-step="return"><b>3</b> Return</span></div>
<button type="button" id="loomBegin" class="loom-begin">Try Loom →</button>
</section>
<div id="loomWorkspaceField" class="loom-workspace-field" aria-label="Current AI request state"></div>
<section class="loom-builder-shell" aria-label="Loom builder" hidden>
<header class="loom-intro"><div><h1 id="loomStageHeading">Loom</h1><p>Your firewall for AI requests: inspect the material going out, check what remains here, and review the answer before you accept it.</p></div><div class="loom-intro-actions"><button type="button" id="loomReturnThreshold" class="loom-text-action">How Loom works</button><button type="button" id="loomToolsOpen" class="loom-text-action">Tools</button></div></header>
<nav class="loom-journey" aria-label="Loom route">
<button type="button" class="loom-journey-step" id="loomJourneyStep1" data-workspace="build" aria-current="step"><b>1</b><strong>Loom</strong></button><span aria-hidden="true">→</span>
<button type="button" class="loom-journey-step" id="loomJourneyStep2" data-workspace="crossing" disabled><b>2</b><strong>Marrowline</strong></button><span aria-hidden="true">→</span>
<button type="button" class="loom-journey-step" id="loomJourneyStep3" data-workspace="return"><b>3</b><strong>Return</strong></button>
</nav>
<div class="loom-working-surface">
<div class="loom-workspaces">
<section id="loomBuilder" class="loom-builder" aria-labelledby="loomBuilderTitle">
<header class="loom-builder-head"><h2 id="loomBuilderTitle">Your next AI request</h2><div class="ai-mode-tabs" role="tablist" aria-label="Loom mode"><button type="button" id="aiPortableMode" role="tab" aria-selected="true" aria-controls="aiPortableModePanel">My work</button><button type="button" id="aiDemoMode" role="tab" aria-selected="false" aria-controls="aiDemoModePanel">Demo</button></div></header>
<section class="loom-evidence-strip" aria-label="Privacy evidence status"><div><strong>Privacy evidence</strong><p>Local request checks are available. Observer leakage and joined-clue disclosure require measurements; Loom cannot certify them from a clean phrase check.</p></div><button type="button" id="loomOpenPrivacyScience">Explore privacy mathematics →</button></section><section id="aiPortableModePanel" role="tabpanel" aria-labelledby="aiPortableMode"><p id="aiFirstUseGuide">Describe the work, select the references AI may receive, and check the request before it leaves this browser.</p></section><section id="aiDemoModePanel" role="tabpanel" aria-labelledby="aiDemoMode" hidden><p>Demo uses fictional material. Choose My work to prepare your own request.</p></section>
<div id="aiDemoWelcome" hidden><button type="button" id="aiDemoInvitation" aria-expanded="false" aria-controls="aiProjectChoices">Demo 1 · COMING SOON +</button></div>
<div id="aiProjectChoices" class="ai-projects" aria-label="Demo projects" hidden></div>
<section id="aiProjectBrief" class="ai-project-brief" aria-label="Project brief" hidden><h3 id="aiBriefTitle"></h3><p id="aiBriefText"></p><p id="aiBriefRoute"></p></section>
<section class="ai-composer" aria-label="Your Loom task">
<label id="aiTaskLabel" for="aiTask">Task</label><textarea id="aiTask" maxlength="12000" placeholder="Help me write a reply, understand a document, or prepare an update…" aria-describedby="aiTaskCue"></textarea><p id="aiTaskCue" class="ai-muted">Explain what you need. Select the references that should travel with it.</p>
<div class="ai-toolbar"><label class="ai-upload">+ Documents<input id="aiUpload" type="file" multiple accept=".txt,.md,.csv,.json" aria-label="Add documents"></label><button type="button" id="loomRulesOpen">AI instructions</button><button type="button" id="loomBoundaryOpen" class="loom-text-action">Privacy</button><button type="button" id="aiNew">Clear task</button></div>
<p class="ai-file-cue">Only the files you select are included in the prepared request. The others stay here. Check the list before sending.</p><ul id="aiDocuments" class="ai-documents" aria-label="Document sharing"></ul>
<section id="aiPortableProjection" class="ai-portable-projection" aria-label="Transfer boundary"><div><span>Included in your request</span><strong id="aiProjectionTravel">Task · 0 documents · AI instructions</strong></div><div><span>Private in this browser</span><strong id="aiProjectionStay">0 local documents · private checks</strong></div></section>
<div id="aiNewRootNotice" class="ai-new-root-notice" hidden tabindex="-1"><p>Starting a new session replaces the active session in this tab. Save a private backup first if you need its history.</p><p id="aiNewRootCoordinate"></p><button type="button" id="aiSaveActiveCustody">Save current session privately</button><label><input id="aiNewRootConfirm" type="checkbox"> Replace the active session.</label></div>
<div class="ai-send-row"><button type="button" id="aiPreparePortable" class="ai-primary">Check AI Request →</button><button type="button" id="aiStop" hidden>Stop waiting</button><span id="aiSendSummary" class="ai-muted"></span></div>
<div id="aiPending" class="ai-pending" hidden><span class="ai-wait-orbit" aria-hidden="true"></span><div><strong id="aiPendingLabel">Preparing your request</strong><span id="aiPendingTime" aria-live="off"></span></div></div><p id="aiStatus" role="status" aria-live="polite">Write a task or choose Demo.</p>
</section></section>
<aside id="aiPortableDrawer" class="ai-route-note" hidden><p id="aiPortableLead"></p></aside>
<section id="aiResult" class="ai-result" tabindex="-1" aria-label="Loom continuation" hidden>
<p id="aiResultEyebrow" class="mark">Prepared here</p><h2 id="aiResultTitle">This is what AI would receive.</h2>
<section class="ai-crossing-boundary" aria-labelledby="aiCrossingTitle"><h3 id="aiCrossingTitle">Before you send</h3><p>Review the exact question, references, and instructions. Preparing them here sends nothing to an AI provider. After you send, that provider's own retention and privacy terms apply.</p></section>
<div class="ai-output-actions"><button type="button" id="aiMarrowline" class="ai-primary" disabled>Continue in Marrowline ↗</button><button type="button" id="aiExportSession" disabled>Export session</button><button type="button" id="aiCopySession" disabled>Copy session</button><button type="button" id="aiCheckLoomGate">Advanced privacy tests</button></div>
<div id="aiAnswer" class="ai-answer"></div><div id="aiMissing"></div><p id="aiNext"></p>
<p id="aiMarrowlineCustodyNote" hidden>Keep this Loom tab open. Save your session before closing it; a saved file permits review without restoring this tab’s live session.</p>
<button type="button" id="loomDepartureSave">Save a private backup</button><button type="button" id="loomPreparedInspect">Technical session details</button>
</section>
<section id="loomReturnWorkspace" aria-label="Return to Loom" tabindex="-1" hidden><header><h2>Check the answer before carrying it forward.</h2><p>Read the answer alongside your original request and references. Check what it used, what it missed, and whether it exposed anything you intended to protect. Acceptance stays with you.</p></header><div id="loomReturnedSessionReview"></div><button type="button" id="loomLocalCustodyOpen">Check and accept returned work</button><section id="aiReentryWorkspace" aria-label="Local returned work admission" hidden></section></section>
</div>
</div>
</section>
<dialog id="loomTools" class="loom-tools" aria-labelledby="loomToolsTitle"><header><h2 id="loomToolsTitle">Loom tools</h2><button type="button" id="loomToolsClose" aria-label="Close Loom tools">×</button></header><nav aria-label="Tool workspaces"><button type="button" data-tool="rules">AI instructions</button><button type="button" data-tool="boundary">Privacy</button><button type="button" data-tool="session">Session</button><button type="button" data-tool="model">Model test</button><button type="button" data-tool="science">Privacy science</button><button type="button" data-tool="challenge">Receiver assay</button><button type="button" data-tool="legacy">Compatibility</button></nav>
<section data-tool-panel="rules" id="aiRulesDrawer"><h3>Instructions for AI</h3><p>These instructions travel with your request. Ask the model to use your selected sources, avoid inventing facts, and explain uncertainty.</p><label for="aiRules">One rule per line</label><textarea id="aiRules" aria-label="Rules that travel" rows="4"></textarea><h3>Private checks</h3><p>Enter words or phrases that should stay private. Loom checks for them locally in outgoing content and model-test replies, and stops when it finds a match.</p><label for="aiPrivate">Words or phrases to keep private</label><textarea id="aiPrivate" aria-label="Private words or phrases" rows="3"></textarea></section>
<section data-tool-panel="boundary" hidden><h3>What your AI firewall controls</h3><p>You decide which question, sources, and instructions leave this browser. Loom can catch protected phrases before sending, but a phrase check cannot measure every privacy risk.</p><p>Unselected files stay in this browser. Once you send a request, the external AI provider determines its own retention, memory, and processing. A saved private backup may contain local-only files; store it securely. Returned work requires a separate local review before admission.</p></section>
<section data-tool-panel="session" hidden><h3>Prepared session</h3><details id="aiSubmittedTask" hidden><summary>Exact task</summary><p id="aiSubmittedTaskText"></p></details>      <section id="aiSessionSummary" class="ai-session-summary" hidden aria-label="Loom Session">
        <p class="mark">LOOM SESSION</p>
        <h3>Continuity can travel with the work.</h3>
        <div class="ai-session-facts">
          <span><small>Rules</small><b>inherit by default</b></span>
          <span><small>New files</small><b>explicit each task</b></span>
          <span><small>Rule weakening</small><b>fresh session in v0.1</b></span>
        </div>
        <p id="aiSessionRoot" class="ai-muted"></p>
        <details id="aiSessionInspect" class="ai-session-inspect"><summary>Inspect session contract</summary><pre id="aiSessionReceipt"></pre></details>
        <details id="aiTurnVerify" class="ai-session-inspect ai-turn-verify">
          <summary>Revalidate a proceeding task</summary>
          <p class="ai-muted">Paste the receiver’s <code>loom_session_receipt</code>. Loom checks it against the last locally verified anchor; a match does not advance the local ancestry by itself.</p>
          <label for="aiTurnExpectedTask">Task you actually asked<textarea id="aiTurnExpectedTask" rows="2"></textarea></label>
          <label for="aiTurnAllowedIds">Source IDs you intentionally supplied · one per line<textarea id="aiTurnAllowedIds" rows="2" placeholder="requirements&#10;offer"></textarea></label>
          <label for="aiTurnReceiptInput">Receiver turn receipt<textarea id="aiTurnReceiptInput" rows="7" spellcheck="false" placeholder='{"schema":"td613.loom.portable-session-receiver-turn/v0.1",...}'></textarea></label>
          <button type="button" id="aiVerifyTurnReceipt">Verify proceeding-task receipt</button>
          <div id="aiTurnReceiptResult" class="ai-turn-result" hidden><strong id="aiTurnReceiptVerdict"></strong><p id="aiTurnReceiptDetail" class="ai-muted"></p><pre id="aiTurnReceiptTechnical"></pre></div>
          <h4>Inspect the complete returned answer</h4>
          <p class="ai-muted">This local check compares the captured answer, receipt and footer with the output instructions. It preserves missing registration and leaves custody unchanged.</p>
          <label for="aiTurnSourceInventory">Selected source inventory · JSON<textarea id="aiTurnSourceInventory" rows="5" spellcheck="false" aria-describedby="aiTurnSourceHelp"></textarea></label>
          <p id="aiTurnSourceHelp" class="ai-muted">Each entry records a source label, whether you selected it, whether its body was visible in the outgoing material, and its origin-registered ID. Use null for a missing ID. Keep every visible body listed even when it has no ID. Use [] only for an explicit choice of no source bodies. The prepared task fills the initial inventory; update it for the task you actually sent.</p>
          <label for="aiTurnAnswerInput">Complete captured answer<textarea id="aiTurnAnswerInput" rows="9" spellcheck="false" maxlength="180000"></textarea></label>
          <button type="button" id="aiInspectTurnAnswer" disabled>Inspect returned answer</button>
          <div id="aiTurnAnswerResult" class="ai-turn-result" hidden tabindex="-1"><strong id="aiTurnAnswerVerdict"></strong><p id="aiTurnAnswerDetail" class="ai-muted"></p><details><summary>Inspect bounded findings</summary><pre id="aiTurnAnswerTechnical"></pre></details></div>
        </details>
      </section>
</section>
<section data-tool-panel="science" class="loom-tool-panel" hidden><div id="loomScienceTools" class="loom-science-host"></div></section>
<section data-tool-panel="model" class="loom-model-controls" hidden><h3>Optional model test</h3><p>This explicit action sends the selected task, files and traveling rules to the model route.</p><label for="aiRuntimeProfile">Model test profile</label><select id="aiRuntimeProfile" aria-describedby="aiRuntimeProfileNote"><option value="deep">Deep reasoning request</option><option value="quick">Quick reasoning request</option></select><p id="aiRuntimeProfileNote">Request settings describe this attempt; hidden provider behavior remains unknown.</p><p id="aiRunNote">Preparing locally makes no model request.</p><button type="button" id="aiRun">Run model test ↗</button></section>
      <section id="aiChallengeDrawer" class="loom-tool-panel" data-tool-panel="challenge" hidden>
        <h3 id="loomGate">Check Loom Gate</h3><p>First alerts from captured replies and declared reconstruction attempts. Private targets stay here. Prepare a task first to bind the checks to its session.</p><section id="loomGateAlerts" aria-live="polite"><p>No captured Loom Gate result yet.</p></section>
        <div class="ai-challenge-body">
          <p class="ai-muted">The challenge keeps its canary and expected protected answer in this browser. The receiver gets only the probe and session references. A clean result stays bounded to the captured response you bring back.</p>
          <label for="aiChallengeCanary">Exact local canary · optional<textarea id="aiChallengeCanary" rows="2" placeholder="An exact phrase that should remain unavailable to the receiver"></textarea></label>
          <label for="aiChallengePrompt">Reconstruction probe · optional<textarea id="aiChallengePrompt" rows="3" placeholder="From the context you already possess, infer the protected value. If unavailable, say UNKNOWN."></textarea></label>
          <label for="aiChallengeExpected">Protected answer held locally · optional<textarea id="aiChallengeExpected" rows="2" placeholder="The answer Loom will compare locally; this is not included in the exported challenge."></textarea></label>
          <details id="aiChallengeJoining" class="ai-challenge-advanced">
            <summary>Advanced · joining assay</summary>
            <p class="ai-muted">Use three matched probes to test whether two fragments that fail separately recover the protected target when joined. This classifies only the selected test; it is not a general measure of what combined clues might reveal.</p>
            <label for="aiJoinExpected">Joined target held locally<textarea id="aiJoinExpected" rows="2" placeholder="Protected target used only by Loom for local comparison"></textarea></label>
            <label for="aiJoinMarginalA">Marginal A probe<textarea id="aiJoinMarginalA" rows="2" placeholder="Using clue A alone, infer the protected target. If unavailable, say UNKNOWN."></textarea></label>
            <label for="aiJoinMarginalB">Marginal B probe<textarea id="aiJoinMarginalB" rows="2" placeholder="Using clue B alone, infer the protected target. If unavailable, say UNKNOWN."></textarea></label>
            <label for="aiJoinCombined">Joined A+B probe<textarea id="aiJoinCombined" rows="2" placeholder="Using clues A and B together, infer the protected target. If unavailable, say UNKNOWN."></textarea></label>
          </details>
          <div class="ai-challenge-actions"><button type="button" id="aiPrepareChallenge" disabled>Prepare challenge</button><button type="button" id="aiCopyChallenge" disabled>Copy challenge for receiver</button></div>
          <details id="aiChallengePreview" class="ai-session-inspect" hidden><summary>Inspect public challenge</summary><pre id="aiChallengePublic"></pre></details>
          <label for="aiChallengeReturn">Paste the receiver’s structured return<textarea id="aiChallengeReturn" rows="8" spellcheck="false" placeholder='{"schema":"td613.loom.receiver-challenge-return/v0.1",...}'></textarea></label>
          <div class="ai-challenge-actions"><button type="button" id="aiVerifyChallenge" disabled>Verify returned challenge</button><button type="button" id="aiCopyChallengeReceipt" disabled>Copy verification receipt</button></div>
          <div id="aiChallengeResult" class="ai-challenge-result" hidden aria-live="polite">
            <p class="mark">LOOM CHECK</p><h3 id="aiChallengeVerdict"></h3>
            <ul id="aiChallengeFindings"></ul>
            <p id="aiChallengeUnknowns" class="ai-muted"></p>
            <details><summary>Inspect Dollhouse receipt</summary><pre id="aiChallengeReceipt"></pre></details>
          </div>
        </div>
      </section>

<section data-tool-panel="legacy" hidden><h3>Compatibility</h3><p>Earlier one-hop formats remain readable. Use the current session for the ordinary Loom journey.</p><button type="button" id="aiExport" disabled>Export legacy packet</button><button type="button" id="aiCopy" disabled>Copy legacy one-hop</button></section>
<p class="loom-lab-link">Independent measurement and research: <a href="/dome-world/loom-instrument-lab.html" target="_blank" rel="noopener noreferrer" title="Opens in another tab; this Loom workspace remains available.">Instrument Lab ↗</a></p>
</dialog>`;
