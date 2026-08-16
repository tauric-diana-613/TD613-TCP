# TD613 Layout Shells

## Architecture note

There is no shared layout component or router wrapper. Each major surface owns a standalone HTML shell. The three shells below are the effective layout sources for the public gateway, Hush, and Giving. Their contents are included in full because layout hierarchy and semantic order are part of the design contract.

## Public TD613 Gateway Shell

- File: app/index.html
- Description: Primary public ingress surface; global chamber shell, membranes, workbench, drawers, and launch navigation.

~~~html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>TCP Gateway</title>
  <style>
    html[data-ingress-bypass="true"] #ingressMembrane { display: none !important; }
  </style>
  <script>
    try {
      if (new URLSearchParams(window.location.search).get('ingress') === 'off') {
        document.documentElement.dataset.ingressBypass = 'true';
      }
    } catch (error) {}
  </script>
  <script src="./asset-versions.js"></script>
  <script type="module" src="./analytics.js"></script>
  <script type="module" src="./speed-insights.js"></script>
</head>
<body data-page-kind="gateway">
  <div id="ingressMembrane" class="ingress-membrane" aria-live="polite">
    <div class="ingress-layer">
      <div class="ingress-topline">
        <span class="eyebrow">TD613 / ingress membrane / custody handshake <span class="glyph glyph-lime" aria-hidden="true" data-glyph-key="ingressEyebrow">&#x25C7;</span></span>
      </div>

      <div class="ingress-heading">
        <div>
          <div id="ingressPhaseLabel" class="section-kicker"><span id="ingressPhaseGlyph" class="glyph glyph-cyan" aria-hidden="true" data-glyph-key="ingressPhasePrefix">&#x0398;</span> <span id="ingressPhaseText">Protocol // membrane waking</span></div>
          <h2>The Cadence Playground</h2>
        </div>
        <div class="ingress-heading-copy">
          <p id="ingressSubtitle" class="ingress-subtitle">Cross the threshold. Choose a chamber.</p>
        </div>
      </div>

      <div class="ingress-stage-rail" aria-label="Ingress stages">
        <span id="ingressStageContainment" class="ingress-stage-chip">Latent S</span>
        <span id="ingressStageMirror" class="ingress-stage-chip">Projected S'</span>
        <span id="ingressStageBadge" class="ingress-stage-chip">Registered Y</span>
        <span id="ingressStageSeal" class="ingress-stage-chip">Route / ceiling</span>
      </div>

      <div class="ingress-grid">
        <section class="ingress-console">
          <div class="ingress-cue-card">
            <div class="section-kicker"><span class="glyph glyph-lime" aria-hidden="true" data-glyph-key="ingressFieldCueKicker">&#x2207;</span> Field cue</div>
            <div id="ingressCueGlyph" class="ingress-cue-glyph">&#x25C7;</div>
            <div id="ingressCueLabel" class="ingress-cue-label">custody handshake unresolved</div>
            <p id="ingressCueCopy" class="ingress-cue-copy">Four gates. One valid posture.</p>
          </div>
          <div id="ingressStatus" class="ingress-status">Wait for the first cue.</div>
        </section>

        <section class="ingress-ritual">
          <div class="ingress-core-stage">
            <div class="ingress-rings" aria-hidden="true">
              <span class="ingress-ring ingress-ring-a"></span>
              <span class="ingress-ring ingress-ring-b"></span>
              <span class="ingress-ring ingress-ring-c"></span>
            </div>
            <div id="ingressSealTrack" class="ingress-seal-track" aria-hidden="true"></div>
            <div id="ingressSealNodes" class="ingress-seal-nodes" hidden aria-label="Seal triad">
              <span id="ingressSealLink1" class="ingress-seal-link ingress-seal-link-1" aria-hidden="true"></span>
              <span id="ingressSealLink2" class="ingress-seal-link ingress-seal-link-2" aria-hidden="true"></span>
              <span id="ingressSealLink3" class="ingress-seal-link ingress-seal-link-3" aria-hidden="true"></span>
              <button id="ingressSealNodeUl" type="button" class="ingress-seal-node ingress-seal-node-ul" aria-label="Seal point one"><span aria-hidden="true">&#x7C73;</span></button>
              <button id="ingressSealNodeUr" type="button" class="ingress-seal-node ingress-seal-node-ur" aria-label="Seal point two"><span aria-hidden="true">&#x51FA;</span></button>
              <button id="ingressSealNodeBc" type="button" class="ingress-seal-node ingress-seal-node-bc" aria-label="Seal point three"><span aria-hidden="true">&#x5165;</span></button>
            </div>
            <button id="ingressCore" type="button" class="ingress-core" aria-describedby="ingressStatus">
              <span id="ingressCoreGlyph" class="ingress-core-glyph">&#x27D0;</span>
              <span id="ingressCoreLabel" class="ingress-core-label">Stand by</span>
            </button>
            <div class="ingress-progress" aria-hidden="true">
              <span id="ingressProgressBar" class="ingress-progress-bar"></span>
            </div>
          </div>

          <div id="ingressMirrorControls" class="ingress-choice-row" hidden>
            <button id="ingressMirrorArmed" type="button" class="ingress-choice">latent</button>
            <button id="ingressMirrorOpen" type="button" class="ingress-choice">clear</button>
          </div>

          <div id="ingressBadgeControls" class="ingress-choice-row" hidden>
            <div id="ingressBadgeReadout" class="ingress-badge-readout">token // unset</div>
            <button id="ingressBadgeCycle" type="button" class="ingress-choice ingress-choice-rotator">advance token</button>
          </div>
        </section>

        <div class="ingress-cue-card ingress-forensic-card">
          <div class="section-kicker"><span class="glyph glyph-cyan" aria-hidden="true" data-glyph-key="sectionReadout">&#x0398;</span> Governed exposure</div>
          <div class="ingress-forensic-grid" aria-label="Governed exposure backbone">
            <div class="ingress-forensic-row"><span class="ingress-forensic-label">S</span><span id="ingressLatentState" class="ingress-forensic-value">latent state // available before narrowing</span></div>
            <div class="ingress-forensic-row"><span class="ingress-forensic-label">S'</span><span id="ingressProjectedState" class="ingress-forensic-value">projected state // what the membrane can hold</span></div>
            <div class="ingress-forensic-row"><span class="ingress-forensic-label">Y</span><span id="ingressRegisteredSurface" class="ingress-forensic-value">registered surface // what survives as answer-like output</span></div>
            <div class="ingress-forensic-row"><span class="ingress-forensic-label">Source class</span><span id="ingressSourceClass" class="ingress-forensic-value">open text / cadence witness / packet witness</span></div>
            <div class="ingress-forensic-row"><span class="ingress-forensic-label">Authority ceiling</span><span id="ingressAuthorityCeiling" class="ingress-forensic-value">exploratory until the route earns more</span></div>
            <div class="ingress-forensic-row"><span class="ingress-forensic-label">Route state</span><span id="ingressRouteStateReadout" class="ingress-forensic-value">buffered</span></div>
          </div>
        </div>
      </div>
    </div>
    <a href="?ingress=off" class="ingress-skip" aria-label="Open chambers without the ingress sequence">open chambers</a>
  </div>

  <div class="shell shell-gateway">
    <header class="gateway-head">
      <div class="gateway-topline">
        <span class="eyebrow">TD613 / gateway / station split live</span>
      </div>
      <div class="gateway-lockup">
        <div>
          <p class="deck-name">TCP <span class="glyph glyph-cyan" aria-hidden="true">&#x7C73;</span></p>
          <p class="gateway-brandmark">The Cadence Playground</p>
          <h1>Threshold / Select Chamber</h1>
        </div>
        <p class="gateway-summary">TD613 is a research instrument for measuring patterned voice and attesting authorship without conflating the two. Pick a chamber below to see one part of it.</p>
      </div>
    </header>

    <main class="gateway-main">
      <section class="panel gateway-panel gateway-threshold-panel">
        <div class="gateway-threshold-grid">
          <section class="gateway-aperture-chamber" aria-labelledby="gatewayApertureTitle">
            <div class="gateway-preview-shell" aria-describedby="gatewayPreviewNote">
              <header class="gateway-preview-head">
                <div class="gateway-preview-title-group">
                  <div class="section-kicker"><span class="glyph glyph-cyan" aria-hidden="true">&#x0398;</span> Aperture / counter-tool preview</div>
                  <h2 id="gatewayApertureTitle" class="gateway-preview-title">TD613 Aperture <span class="glyph glyph-ritual" aria-hidden="true">&#x03A9;</span></h2>
                  <p class="gateway-preview-subtitle">Aperture watches what filters or narrows your content as it moves through systems — not to enforce, but to make the filtering visible.</p>
                </div>

                <div class="gateway-preview-controls" aria-label="Gateway preview controls">
                  <span id="gatewayPreviewBounceStatus" class="gateway-preview-pill gateway-preview-pill-danger">BOUNCES: 0</span>
                  <span id="gatewayPreviewPhaseStatus" class="gateway-preview-pill gateway-preview-pill-cyan">STANDBY</span>
                  <button id="gatewayPreviewRun" type="button" class="gateway-preview-button">▶ PROPAGATE</button>
                  <button id="gatewayPreviewMoire" type="button" class="gateway-preview-button gateway-preview-button-active">MOIRÉ</button>
                  <button id="gatewayPreviewReset" type="button" class="gateway-preview-button">RESET</button>
                  <a id="gatewayApertureOpenFull" class="gateway-preview-link" href="./aperture/index.html" target="_blank" rel="noopener">Open full Aperture</a>
                </div>
              </header>

              <div class="gateway-preview-stage">
                <div class="gateway-preview-center" id="gatewayPreviewCenter">
                  <canvas id="gatewayPreviewCanvas" aria-label="TD613 Aperture gateway field preview"></canvas>
                </div>
              </div>

              <div class="gateway-preview-bottom">
                <section class="gateway-preview-bottom-panel">
                  <div class="section-kicker"><span class="glyph glyph-cyan" aria-hidden="true">&#x0398;</span> Moir&eacute; stratigraphy / entrainment cartography</div>
                  <canvas id="gatewayPreviewMoireCanvas" aria-label="Gateway preview moire field"></canvas>
                </section>
                <section class="gateway-preview-bottom-panel">
                  <div class="section-kicker"><span class="glyph glyph-lime" aria-hidden="true">&#x25C7;</span> Bounce trace / coherence drift</div>
                  <canvas id="gatewayPreviewTraceCanvas" aria-label="Gateway preview bounce trace"></canvas>
                </section>
              </div>

              <p id="gatewayPreviewNote" class="gateway-aperture-note">Detuned interference fields, temporal posture, and closure drift stay speculative here, not evidentiary. The full Aperture room keeps the audit trail, packet surfaces, and Safe Harbor lane.</p>
            </div>
          </section>

          <aside class="gateway-support-rail" aria-labelledby="gatewayDoorTitle">
            <div class="panel-heading gateway-support-heading">
              <div>
                <div class="section-kicker"><span class="glyph glyph-cyan" aria-hidden="true">&#x0398;</span> Chamber index</div>
                <h2 id="gatewayDoorTitle">Enter the machine</h2>
              </div>

            </div>

            <div class="gateway-grid gateway-grid-six">
              <button id="gatewayDoorDeck" type="button" class="gateway-card" data-station-target="play">
                <div class="gateway-card-kicker"><span class="glyph glyph-lime" aria-hidden="true">&#x25C7;</span> Deck</div>
                <h3>Encounter chamber</h3>
                <p>Stage the pair. Wake the duel.</p>
              </button>
              <button id="gatewayDoorHomebase" type="button" class="gateway-card" data-station-target="homebase">
                <div class="gateway-card-kicker"><span class="glyph glyph-lime" aria-hidden="true">&#x4E0B;</span> Mask Foundry</div>
                <h3>Homebase + Personas</h3>
                <p>Lock the home voice, choose the shell, and read what clung in one cockpit.</p>
              </button>
              <button id="gatewayDoorReadout" type="button" class="gateway-card" data-station-target="readout">
                <div class="gateway-card-kicker"><span class="glyph glyph-cyan" aria-hidden="true">&#x0398;</span> Readout</div>
                <h3>Witness / law</h3>
                <p>Witness first. Route and harbor after.</p>
              </button>
              <button id="gatewayDoorTrainer" type="button" class="gateway-card" data-station-target="trainer">
                <div class="gateway-card-kicker"><span class="glyph glyph-cyan" aria-hidden="true">&#x22A2;</span> Clone</div>
                <h3>Forge lane</h3>
                <p>Extract. Forge. Validate. Inject.</p>
              </button>
              <a id="gatewayDoorHush" class="gateway-card gateway-card-external" href="./adversarial-bench.html">
                <div class="gateway-card-kicker"><span class="glyph glyph-cyan" aria-hidden="true">&#x27D0;</span> Hush</div>
                <h3>Mask studio</h3>
                <p>Local review. Residual steering.</p>
              </a>
              <a id="gatewayDoorHarbor" class="gateway-card gateway-card-external" href="./safe-harbor/index.html">
                <div class="gateway-card-kicker"><span class="glyph glyph-cyan" aria-hidden="true">&#x27D0;</span> Safe Harbor</div>
                <h3>Guarded passage</h3>
                <p>Packet layer. Separate room.</p>
              </a>
            </div>

            <section id="gatewayApertureBridgeRail" class="gateway-bridge-rail" aria-live="polite">
              <div class="gateway-bridge-head">
                <div>
                  <div class="section-kicker"><span class="glyph glyph-cyan" aria-hidden="true">&#x27D0;</span> Aperture bridge</div>
                  <h3>Counter-tool lane</h3>
                </div>
                <span id="gatewayApertureBridgePill" class="gateway-bridge-pill" data-state="latent">awaiting route</span>
              </div>

              <div class="gateway-bridge-grid">
                <div class="gateway-bridge-row"><span class="gateway-bridge-label">Route</span><span id="gatewayApertureBridgeRoute" class="gateway-bridge-value">membrane-only</span></div>
                <div class="gateway-bridge-row"><span class="gateway-bridge-label">Handoff</span><span id="gatewayApertureBridgeHandoff" class="gateway-bridge-value">awaiting packet</span></div>
                <div class="gateway-bridge-row"><span class="gateway-bridge-label">Cumulative narrowing</span><span id="gatewayApertureBridgeNarrowing" class="gateway-bridge-value">pending</span></div>
                <div class="gateway-bridge-row"><span class="gateway-bridge-label">Provenance</span><span id="gatewayApertureBridgeProvenance" class="gateway-bridge-value">pending</span></div>
                <div class="gateway-bridge-row"><span class="gateway-bridge-label">Packet</span><span id="gatewayApertureBridgePacket" class="gateway-bridge-value">no packet prepared</span></div>
              </div>

              <p id="gatewayApertureBridgeNote" class="gateway-bridge-note">When Aperture has audited a candidate, Safe Harbor can read that audit here without you having to re-stage the work. Open the full Aperture room (above) to start a new audit.</p>
            </section>
          </aside>
        </div>
      </section>
    </main>

    <footer class="footer">TCP / station split gateway / same runtime, separate rooms <span class="glyph glyph-lime" aria-hidden="true" data-glyph-key="footerSeal">&#x27D0;</span></footer>
  </div>

  <script src="./chamber-bootstrap.js?v=202607081245"></script>
</body>
</html>
~~~


## Hush Product Shell

- File: app/hush.html
- Description: Hush header, safety pills, persona gallery, readiness dashboard, evidence cockpit insertion point, and embedded console route.

~~~html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>TD613 Hush</title>
  <link rel="stylesheet" href="./hush-product-spine.css" />
  <link rel="stylesheet" href="./hush-visual-system.css" />
  <link rel="stylesheet" href="./hush-mobile-field-deck.css" />
  <script type="module" src="./analytics.js"></script>
  <script type="module" src="./speed-insights.js"></script>
  <script type="module" src="./hush.js?v=202607010405"></script>
</head>
<body data-page-kind="hush-visual-system">
  <main class="hush-product-shell">
    <header class="hush-product-header">
      <p class="eyebrow">TD613 Hush · Current Surface</p>
      <h1>Hush Console</h1>
      <p>Current Hush launch surface for the live console, packet drawer, persona gallery, evidence cockpit, and Customizer forge. Local review remains the governing posture.</p>
      <div class="hush-product-pills" aria-label="Hush safety posture">
        <span>Current Console</span>
        <span>Packet Drawer</span>
        <span>Local Review</span>
        <span>No Platform Guarantee</span>
        <span>Human Review Required</span>
      </div>
    </header>

    <section id="hushPersonaGallerySection" class="hush-product-card" aria-labelledby="personaGalleryTitle">
      <div class="card-heading-row"><div><p class="eyebrow">Mask theater</p><h2 id="personaGalleryTitle">Persona Gallery</h2></div><p class="notice">Stories, route warnings, and card grammar for every active mask.</p></div>
      <div id="hushPersonaGallery" class="persona-gallery"></div>
    </section>

    <section id="hushReadinessDashboard" class="hush-product-card" aria-labelledby="dashboardTitle">
      <h2 id="dashboardTitle">Readiness Dashboard</h2>
      <div id="hushDashboardSummary" class="dashboard-grid"></div>
      <p id="hushDashboardNotice" class="notice">Dashboard awaiting report input. Synthetic test flight remains the default posture.</p>
    </section>

    <section class="hush-product-card" aria-labelledby="routeTitle">
      <h2 id="routeTitle">Current Hush Room</h2>
      <p>The current transform console remains the active operator chamber. Packet visibility now lives in the drawer beside it, not behind it.</p>
      <p class="hush-product-pills"><a class="launch-link" href="./adversarial-bench.html">Open Current Hush Console</a><a class="launch-link" href="./hush-packet-dashboard.html">Open Packet Drawer</a></p>
      <iframe title="Current Hush Console" src="./adversarial-bench.html" loading="lazy"></iframe>
    </section>
  </main>
</body>
</html>
~~~


## Giving History Operator Shell

- File: app/giving/history/index.html
- Description: Private signed-session membrane plus the complete research workspace: custody/search rail, source run, identity review, committee ledger, vault, Campaign Deputy, and receipts.

~~~html
<!doctype html>
<html lang="en" data-session="checking">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive,nosnippet,noimageindex">
  <meta name="referrer" content="no-referrer">
  <title>TD613 Giving History</title>
  <link rel="stylesheet" href="./giving.css">
</head>
<body>
  <noscript><div class="fatal-note">This private research ledger requires JavaScript.</div></noscript>

  <section class="session-membrane" id="sessionMembrane" aria-labelledby="sessionTitle">
    <div class="session-card">
      <div class="seal" aria-hidden="true">⟐</div>
      <p class="eyebrow">PRIVATE OPERATOR BOUNDARY</p>
      <h1 id="sessionTitle">Giving History</h1>
      <p class="session-copy">Open a short-lived signed session. The access secret is transmitted only to the same-origin Giving boundary and is never stored by this page.</p>
      <form id="sessionForm" class="session-form">
        <label>
          <span>Operator access secret</span>
          <input id="accessSecret" name="access_secret" type="password" autocomplete="current-password" required>
        </label>
        <button class="button primary" type="submit">Open research ledger</button>
      </form>
      <p class="status-note" id="sessionMessage" role="status">Checking the operator session…</p>
    </div>
  </section>

  <div class="operator-shell" id="operatorShell" hidden>
    <header class="masthead">
      <div class="brand-block">
        <div class="brand-mark" aria-hidden="true">𝌋</div>
        <div>
          <p class="eyebrow">TD613 / PRIVATE RESEARCH LEDGER</p>
          <h1>Giving History</h1>
          <p>Federated contribution evidence with source lineage and human identity closure.</p>
        </div>
      </div>
      <div class="mast-actions">
        <span class="session-pill" id="sessionPill"><span></span> signed session</span>
        <button class="button quiet" id="readinessButton" type="button">Readiness</button>
        <button class="button quiet danger" id="signOutButton" type="button">Close session</button>
      </div>
    </header>

    <main class="workspace">
      <aside class="control-rail">
        <section class="panel dossier-control">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">DOSSIER CUSTODY</p>
              <h2>Research file</h2>
            </div>
            <span class="state-badge" id="saveState">unsaved</span>
          </div>
          <label class="field">
            <span>Dossier title</span>
            <input id="dossierTitle" type="text" maxlength="100" placeholder="Donor or research question">
          </label>
          <label class="field">
            <span>Custody mode</span>
            <select id="custodyMode">
              <option value="LOCAL">Local — IndexedDB</option>
              <option value="HOSTED">Hosted — encrypted only</option>
              <option value="HYBRID">Hybrid — local + encrypted branch</option>
            </select>
          </label>
          <div class="button-row">
            <button class="button" id="newDossierButton" type="button">New</button>
            <button class="button primary" id="saveDossierButton" type="button">Save</button>
          </div>
          <label class="field">
            <span>Local dossiers</span>
            <select id="localDossierSelect"><option value="">No local dossier selected</option></select>
          </label>
          <button class="button wide" id="openDossierButton" type="button">Open selected dossier</button>
          <p class="fine-print">Hosted custody never writes decrypted records to local storage. Vault decryption is a separate authority from session access.</p>
        </section>

        <section class="panel search-control">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">DETERMINISTIC RETRIEVAL</p>
              <h2>Search terms</h2>
            </div>
            <span class="counter" id="selectedSourceCount">0 sources</span>
          </div>
          <form id="searchForm">
            <label class="field">
              <span>Contributor name</span>
              <input id="searchName" name="name" type="text" maxlength="160" required autocomplete="off">
            </label>
            <label class="field">
              <span>Aliases <small>one per line</small></span>
              <textarea id="searchAliases" name="aliases" rows="3" maxlength="1000"></textarea>
            </label>
            <label class="field">
              <span>Identity hints <small>city, employer, ZIP — never a forced match</small></span>
              <input id="searchHints" name="hints" type="text" maxlength="300">
            </label>
            <div class="split-fields">
              <label class="field"><span>Beginning date</span><input id="dateFrom" name="date_from" type="date" required></label>
              <label class="field"><span>Ending date</span><input id="dateTo" name="date_to" type="date" required></label>
            </div>
            <fieldset class="source-picker">
              <legend>Electronic source instances</legend>
              <div class="source-picker-actions">
                <button class="text-button" id="selectAllSources" type="button">Select available</button>
                <button class="text-button" id="clearSources" type="button">Clear</button>
              </div>
              <div id="sourceRegistry" class="source-list" aria-live="polite"></div>
            </fieldset>
            <div class="button-row">
              <button class="button primary" id="runSearchButton" type="submit">Search selected sources</button>
              <button class="button danger" id="cancelSearchButton" type="button" disabled>Cancel</button>
            </div>
          </form>
        </section>
      </aside>

      <div class="ledger-column">
        <nav class="ledger-tabs" aria-label="Giving dossier sections">
          <button class="tab active" type="button" data-view="search">Source run</button>
          <button class="tab" type="button" data-view="review">Identity review <span id="reviewCount">0</span></button>
          <button class="tab" type="button" data-view="ledger">Committee ledger <span id="ledgerCount">0</span></button>
          <button class="tab" type="button" data-view="vault">Vault</button>
          <button class="tab" type="button" data-view="campaign">Campaign Deputy</button>
          <button class="tab" type="button" data-view="receipts">Receipts</button>
        </nav>

        <section class="view active" id="view-search" data-view-panel="search">
          <div class="section-head">
            <div>
              <p class="eyebrow">SOURCE-BY-SOURCE EXECUTION</p>
              <h2>Retrieval run</h2>
            </div>
            <div class="run-summary" id="runSummary">No search has run.</div>
          </div>
          <div class="coverage-warning" id="coverageWarning" hidden>
            Source failures and partial coverage remain explicit. They are never converted into zero-giving claims.
          </div>
          <div class="source-progress-grid" id="sourceProgress">
            <div class="empty-state"><strong>Waiting for a query.</strong><span>Choose searchable electronic custodians from the left rail.</span></div>
          </div>
        </section>

        <section class="view" id="view-review" data-view-panel="review" hidden>
          <div class="section-head">
            <div>
              <p class="eyebrow">HUMAN CLOSURE REQUIRED</p>
              <h2>Identity adjudication</h2>
            </div>
            <div class="legend" aria-label="Identity states">
              <span data-state="CANDIDATE">candidate</span><span data-state="CONFIRMED">confirmed</span><span data-state="EXCLUDED">excluded</span><span data-state="UNREVIEWED">unreviewed</span>
            </div>
          </div>
          <div class="review-toolbar">
            <label class="field compact"><span>Show</span><select id="reviewFilter"><option value="ALL">All records</option><option value="CANDIDATE">Candidate</option><option value="UNREVIEWED">Unreviewed</option><option value="CONFIRMED">Confirmed</option><option value="EXCLUDED">Excluded</option></select></label>
            <label class="field compact grow"><span>Filter records</span><input id="reviewSearch" type="search" placeholder="Name, committee, city, employer"></label>
          </div>
          <div class="cluster-notice" id="clusterNotice">No candidate clusters have been proposed.</div>
          <div class="record-list" id="recordList">
            <div class="empty-state"><strong>No records yet.</strong><span>Search results will arrive with their source lineage intact.</span></div>
          </div>
        </section>

        <section class="view" id="view-ledger" data-view-panel="ledger" hidden>
          <div class="section-head">
            <div>
              <p class="eyebrow">CONFIRMED RECORDS ONLY</p>
              <h2>Committee-first ledger</h2>
            </div>
            <div class="button-row align-end">
              <button class="button" id="exportCsvButton" type="button">Export CSV</button>
              <button class="button" id="exportEncryptedButton" type="button">Encrypted JSON</button>
            </div>
          </div>
          <div class="total-banner">
            <span>Confirmed across committees</span>
            <strong id="confirmedTotal">$0.00</strong>
            <small id="confirmedRecordCount">0 records</small>
          </div>
          <div class="committee-list" id="committeeLedger">
            <div class="empty-state"><strong>No confirmed giving.</strong><span>Committee totals remain asleep until you confirm record identity.</span></div>
          </div>
        </section>

        <section class="view" id="view-vault" data-view-panel="vault" hidden>
          <div class="section-head">
            <div>
              <p class="eyebrow">SEPARATE DECRYPTION AUTHORITY</p>
              <h2>Encrypted vault</h2>
            </div>
            <span class="state-badge">AES-GCM / PBKDF2</span>
          </div>
          <div class="vault-grid">
            <section class="inner-panel">
              <h3>Vault passphrase</h3>
              <p>Used in browser memory for this operation only. It is never sent to TD613 or stored in the dossier.</p>
              <label class="field"><span>Separate vault passphrase</span><input id="vaultPassphrase" type="password" autocomplete="new-password" minlength="12"></label>
              <div class="button-row">
                <button class="button primary" id="syncVaultButton" type="button">Encrypt &amp; save branch</button>
                <button class="button" id="refreshVaultButton" type="button">List vault versions</button>
              </div>
            </section>
            <section class="inner-panel">
              <h3>Hosted versions</h3>
              <p>Neon receives ciphertext, version metadata, digests, and ancestry only.</p>
              <div id="vaultVersions" class="version-list"><span class="muted">No hosted versions loaded.</span></div>
            </section>
          </div>
          <div class="conflict-panel" id="conflictPanel" hidden>
            <strong>Parallel vault branches detected.</strong>
            <p>No branch was overwritten. Open each candidate, reconcile in memory, then explicitly record the chosen ancestry.</p>
            <div id="conflictActions" class="button-row"></div>
          </div>
        </section>

        <section class="view" id="view-campaign" data-view-panel="campaign" hidden>
          <div class="section-head">
            <div>
              <p class="eyebrow">EXPLICIT CRM WRITEBACK</p>
              <h2>Campaign Deputy</h2>
            </div>
            <span class="state-badge">human gesture required</span>
          </div>
          <div class="writeback-warning">Historical public contributions remain in Giving. Campaign Deputy receives only a reviewed contact and committee-list relationship.</div>
          <div class="campaign-grid">
            <section class="inner-panel">
              <div class="inner-heading"><h3>1. Find an existing person</h3><button class="button" id="loadPeopleButton" type="button">Load people page</button></div>
              <label class="field"><span>Filter the loaded index</span><input id="peopleFilter" type="search" placeholder="Name, email, phone"></label>
              <div id="peopleIndex" class="people-list"><span class="muted">No Campaign Deputy people loaded into this dossier.</span></div>
              <button class="button wide" id="morePeopleButton" type="button" hidden>Load next page</button>
              <label class="field"><span>Reviewed committee taxonomy</span><select id="committeeSelect"><option value="">Select a confirmed committee</option></select></label>
              <button class="button primary wide" id="linkExistingButton" type="button" disabled>Link exact selected person</button>
            </section>

            <section class="inner-panel">
              <h3>2. Explicitly create a contact</h3>
              <p>Only after duplicate review. Choose each public field you intend to copy.</p>
              <label class="field"><span>Confirmed source record</span><select id="createRecordSelect"><option value="">Select a confirmed record</option></select></label>
              <div class="field-choice-grid" id="createFieldChoices">
                <label><input type="checkbox" value="name" checked> name</label>
                <label><input type="checkbox" value="email" checked> email</label>
                <label><input type="checkbox" value="phone" checked> phone</label>
                <label><input type="checkbox" value="employer" checked> employer</label>
                <label><input type="checkbox" value="occupation" checked> occupation</label>
                <label><input type="checkbox" value="city_state_zip" checked> city / state / ZIP</label>
                <label class="sensitive"><input type="checkbox" value="street_address"> public street address</label>
              </div>
              <button class="button primary wide" id="createContactButton" type="button" disabled>Create new contact, then link</button>
            </section>
          </div>
          <section class="withhold-panel">
            <div><strong>3. Withhold writeback</strong><p>Close the reviewed dossier without mutating Campaign Deputy.</p></div>
            <button class="button" id="withholdButton" type="button">Record WITHHOLD</button>
          </section>
          <div id="campaignReceipts" class="receipt-list"></div>
        </section>

        <section class="view" id="view-receipts" data-view-panel="receipts" hidden>
          <div class="section-head">
            <div>
              <p class="eyebrow">LINEAGE / CUSTODY / REFUSALS</p>
              <h2>Operator receipts</h2>
            </div>
            <button class="button" id="copyReceiptsButton" type="button">Copy receipts</button>
          </div>
          <div class="receipt-list" id="receiptList"><div class="empty-state"><strong>No receipts yet.</strong><span>Retrieval and operator decisions will be recorded here without donor search inputs.</span></div></div>
        </section>
      </div>
    </main>
  </div>

  <div class="toast-stack" id="toastStack" aria-live="polite" aria-atomic="false"></div>
  <script type="module" src="./giving-app.js"></script>
</body>
</html>
~~~
