export const loomWorkspaceTemplate = `<section class="loom-stage" aria-labelledby="loomFieldHeading"><div class="loom-stage-copy"><span class="loom-kicker">YOUR AI WORKSPACE</span><h1 id="loomFieldHeading">Loom</h1><p>Your work stays yours until you choose a crossing.</p></div><section id="aiRuntime" class="ai-runtime" aria-label="Current Loom route"><p class="mark">CURRENT ROUTE</p>
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
    <div class="loom-first-crossing-copy">
      <div class="loom-tutorial-meta"><span class="loom-threshold-kicker">YOUR PRIVACY · YOUR CUSTODY</span><span id="loomTutorialProgress" class="loom-tutorial-progress">1 of 7 · Your request</span></div>
      <h2 id="loomFirstCrossingTitle">Protect your work when you use AI.</h2>
      <p id="loomFirstCrossingPrompt">Choose what AI receives and keep custody of what comes back. Try a fictional request and reference.</p>
    </div>
    <details class="loom-flowcore-help">
      <summary>What is Flow-Core runtime?</summary>
      <div class="loom-flowcore-panel">
        <button type="button" id="loomFlowcoreHelpClose" class="loom-flowcore-help-close" aria-label="Close Flow-Core explanation">×</button>
        <p>Flow-Core maps the choices in your Loom session: what you share, what stays private, when you send, and how you review returned work. Each symbol has its own motion. The tutorial illustrates the route with fictional material; the working session follows actual request events.</p>
        <p id="loomFlowcoreMessage" class="loom-flowcore-message" aria-live="polite"></p>
        <div class="loom-flowcore-legend">
          <span><button type="button" data-flowcore-copy="à" aria-label="à">à</button> Gather</span><span><button type="button" data-flowcore-copy="米" aria-label="米">米</button> Revisit</span><span><button type="button" data-flowcore-copy="出" aria-label="出">出</button> Send</span><span><button type="button" data-flowcore-copy="hõt" aria-label="hõt">hõt</button> Review</span>
          <span><button type="button" data-flowcore-copy="cōl" aria-label="cōl">cōl</button> Keep private</span><span><button type="button" data-flowcore-copy="上" aria-label="上">上</button> Ready</span><span><button type="button" data-flowcore-copy="下" aria-label="下">下</button> Return</span><span><button type="button" data-flowcore-copy="𝄐" aria-label="𝄐">𝄐</button> Rest</span>
        </div>
        <p id="loomFlowcoreCopyNotice" class="loom-flowcore-copy-notice" role="status" aria-live="polite" aria-atomic="true"></p>
      </div>
    </details>
    <div id="loomFirstCrossingObjects" class="loom-first-crossing-objects" aria-label="How Loom controls an AI request">
      <button type="button" data-first-crossing-item="brief" aria-pressed="false"><span>à · GATHER</span><strong>Select your question</strong><small>When does the garden open?</small></button>
      <button type="button" data-first-crossing-item="source" aria-pressed="false"><span class="loom-operator-pair"><span><b>hõt</b> REVIEW</span><span><b>cōl</b> PROTECT</span></span><strong>Select your evidence</strong><small>Garden hours: opens at nine.</small></button>
      <div id="loomFirstCrossingPrivate" class="loom-first-crossing-private" role="note"><span>WITHHELD BY DESIGN</span><strong>Private note</strong><small>Stays in this browser.</small></div>
    </div>
    <div class="loom-first-crossing-actions">
      <button type="button" id="loomFirstCrossingAction" hidden>Inspect what AI receives →</button>
      <button type="button" id="loomFirstCrossingStop" hidden>𝄐 · Complete the lesson →</button>
    </div>
    <div class="loom-practice-controls">
      <button type="button" id="loomFirstCrossingBack" hidden>← Start over</button>
      <button type="button" id="loomReplayFirstCrossing" class="loom-replay-first-crossing" hidden>Start over</button>
      <button type="button" id="loomFirstCrossingPause" class="loom-field-toggle" aria-label="Remix the Flow-Core animation" title="Remix the Flow-Core animation">𝌋</button>
      <button type="button" id="loomFirstCrossingLeave">Skip tutorial →</button>
    </div>
    <p id="loomFirstCrossingAnswer" class="loom-first-crossing-answer" aria-live="polite"></p>
    <details id="loomTutorialProof" class="loom-tutorial-proof" hidden><summary>Inspect the fictional return receipt <span aria-hidden="true">↗</span></summary><pre id="loomTutorialProofRecord"></pre></details>
  </section>
</div>
<div class="loom-hero-route" aria-hidden="true"><span data-hero-step="loom"><b>1</b> Loom</span><i>→</i><span data-hero-step="marrowline"><b>2</b> Marrowline</span><i>→</i><span data-hero-step="return"><b>3</b> Return</span></div>
<button type="button" id="loomBegin" class="loom-begin">Enter Loom →</button>
</section>
<section class="loom-builder-shell" aria-label="Loom builder" hidden>
<div id="loomWorkspaceField" class="loom-workspace-field" aria-label="Current AI request state"></div>
<header class="loom-intro"><div><h1 id="loomStageHeading">Loom</h1><p>Choose what AI receives. Keep your sources and conversation history together.</p></div><div class="loom-intro-actions"><button type="button" id="loomReturnThreshold" class="loom-text-action">How it works</button><button type="button" id="loomToolsOpen" class="loom-text-action">Tools</button></div></header>
<nav class="loom-journey" aria-label="Loom route">
<button type="button" class="loom-journey-step" id="loomJourneyStep1" data-workspace="build" aria-current="step"><b>1</b><strong>Loom</strong></button><span aria-hidden="true">→</span>
<button type="button" class="loom-journey-step" id="loomJourneyStep2" data-workspace="crossing" disabled><b>2</b><strong>Marrowline</strong></button><span aria-hidden="true">→</span>
<button type="button" class="loom-journey-step" id="loomJourneyStep3" data-workspace="return"><b>3</b><strong>Return</strong></button>
</nav>
<div class="loom-working-surface">
<div class="loom-workspaces">
<section id="loomBuilder" class="loom-builder" aria-labelledby="loomBuilderTitle">
<header class="loom-builder-head"><h2 id="loomBuilderTitle">Your task</h2><div class="ai-mode-tabs" role="tablist" aria-label="Loom mode"><button type="button" id="aiPortableMode" role="tab" aria-selected="true" aria-controls="aiPortableModePanel">My work</button><button type="button" id="aiDemoMode" role="tab" aria-selected="false" aria-controls="aiDemoModePanel">Demo</button></div></header>
<section id="aiPortableModePanel" role="tabpanel" aria-labelledby="aiPortableMode"><p id="aiFirstUseGuide">Build the task here. Marrowline carries the AI conversation when you continue.</p></section><section id="aiDemoModePanel" role="tabpanel" aria-labelledby="aiDemoMode" hidden><p>New demos will follow the portable-governance assay. Use My work to prepare your own request.</p></section>
<div id="aiDemoWelcome" hidden><button type="button" id="aiDemoInvitation" aria-expanded="false" aria-controls="aiProjectChoices">Demo 1 · COMING SOON +</button></div>
<div id="aiProjectChoices" class="ai-projects" aria-label="Demo projects" hidden></div>
<section id="aiProjectBrief" class="ai-project-brief" aria-label="Project brief" hidden><h3 id="aiBriefTitle"></h3><p id="aiBriefText"></p><p id="aiBriefRoute"></p></section>
<section class="ai-composer" aria-label="Your Loom task">
<label id="aiTaskLabel" for="aiTask">Task</label><textarea id="aiTask" maxlength="12000" placeholder="Ask for a decision, an analysis, a plan…" aria-describedby="aiTaskCue"></textarea><p id="aiTaskCue" class="ai-muted">Your task travels with the material you select.</p>
<div class="ai-toolbar"><label class="ai-upload">+ Documents<input id="aiUpload" type="file" multiple accept=".txt,.md,.csv,.json" aria-label="Add documents"></label><button type="button" id="loomRulesOpen">Rules</button><button type="button" id="loomBoundaryOpen" class="loom-text-action">Boundary ↗</button><button type="button" id="aiNew">Clear task</button></div>
<p class="ai-file-cue">Files stay here until selected.</p><ul id="aiDocuments" class="ai-documents" aria-label="Document sharing"></ul>
<section id="aiPortableProjection" class="ai-portable-projection" aria-label="Transfer boundary"><div><span>Travels</span><strong id="aiProjectionTravel">Task · 0 documents · 2 rules</strong></div><div><span>Stays here</span><strong id="aiProjectionStay">0 local documents · private checks</strong></div></section>
<div id="aiNewRootNotice" class="ai-new-root-notice" hidden tabindex="-1"><p>Starting a new root replaces this tab's active Loom custody lane.</p><p id="aiNewRootCoordinate"></p><button type="button" id="aiSaveActiveCustody">Save current private custody record</button><label><input id="aiNewRootConfirm" type="checkbox"> Replace the active root.</label></div>
<div class="ai-send-row"><button type="button" id="aiPreparePortable" class="ai-primary">Prepare AI request →</button><button type="button" id="aiStop" hidden>Stop waiting</button><span id="aiSendSummary" class="ai-muted"></span></div>
<div id="aiPending" class="ai-pending" hidden><span class="ai-wait-orbit" aria-hidden="true"></span><div><strong id="aiPendingLabel">Preparing your request</strong><span id="aiPendingTime" aria-live="off"></span></div></div><p id="aiStatus" role="status" aria-live="polite">Write a task or choose Demo.</p>
</section></section>
<aside id="aiPortableDrawer" class="ai-route-note" hidden><p id="aiPortableLead"></p></aside>
<section id="aiResult" class="ai-result" tabindex="-1" aria-label="Loom continuation" hidden>
<p id="aiResultEyebrow" class="mark">Prepared here</p><h2 id="aiResultTitle">AI request ready.</h2>
<section class="ai-crossing-boundary" aria-labelledby="aiCrossingTitle"><h3 id="aiCrossingTitle">Continue in Marrowline</h3><p>Your request includes your selected files and rules. Preparation does not send it to AI. Shared content follows the AI service’s own policies.</p></section>
<div class="ai-output-actions"><button type="button" id="aiMarrowline" class="ai-primary" disabled>Continue in Marrowline ↗</button><button type="button" id="aiExportSession" disabled>Export session</button><button type="button" id="aiCopySession" disabled>Copy session</button><button type="button" id="aiCheckLoomGate">Check Loom Gate</button></div>
<div id="aiAnswer" class="ai-answer"></div><div id="aiMissing"></div><p id="aiNext"></p>
<p id="aiMarrowlineCustodyNote" hidden>Keep this Loom tab open. Save your session before closing it; a saved file permits review without restoring this tab’s live session.</p>
<button type="button" id="loomDepartureSave">Save private custody record</button><button type="button" id="loomPreparedInspect">Inspect prepared work</button>
</section>
<section id="loomReturnWorkspace" aria-label="Return to Loom" tabindex="-1" hidden><header><h2>Bring the work back.</h2><p>Review the AI result alongside its sources and conversation history.</p></header><div id="loomReturnedSessionReview"></div><button type="button" id="loomLocalCustodyOpen">Local custody · Check & Admit</button><section id="aiReentryWorkspace" aria-label="Local returned work admission" hidden></section></section>
</div>
</div>
</section>
<dialog id="loomTools" class="loom-tools" aria-labelledby="loomToolsTitle"><header><h2 id="loomToolsTitle">Loom tools</h2><button type="button" id="loomToolsClose" aria-label="Close Loom tools">×</button></header><nav aria-label="Tool workspaces"><button type="button" data-tool="rules">Rules</button><button type="button" data-tool="boundary">Boundary</button><button type="button" data-tool="session">Session</button><button type="button" data-tool="model">Model test</button><button type="button" data-tool="challenge">Receiver assay</button><button type="button" data-tool="legacy">Compatibility</button></nav>
<section data-tool-panel="rules" id="aiRulesDrawer"><h3>Traveling rules</h3><p>These rules accompany your task. The defaults below treat sources as data and keep missing evidence visible.</p><label for="aiRules">One rule per line</label><textarea id="aiRules" aria-label="Rules that travel" rows="4"></textarea><h3>Private checks</h3><p>These terms stay here. Matching outgoing material or a local model-test reply holds that local check.</p><label for="aiPrivate">Private terms to block locally</label><textarea id="aiPrivate" aria-label="Local private terms" rows="3"></textarea></section>
<section data-tool-panel="boundary" hidden><h3>What this boundary establishes</h3><p>Selected task, file bytes and traveling rules are bound locally. Preparation makes no model request.</p><p>Foreign-host enforcement, downstream retention and hidden model state remain unobserved. A public transfer carries selected source bodies; a private custody record can also contain local sources and challenge keys.</p></section>
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
        </details>
      </section>
</section>
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
            <p class="ai-muted">Use three matched probes to test whether two fragments that fail separately recover the protected target when joined. This classifies this declared episode; it is not Golden Egg J or a universal synergy estimate.</p>
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
<p class="loom-lab-link">Independent measurement and research: <a href="/dome-world/loom-instrument-lab.html">Instrument Lab ↗</a></p>
</dialog>`;
