import { compileReaderProfile } from '../engine/ash-keep-core.js';
import {
  replayMoireRebuildAssay,
  runDeterministicMoireAssay,
  verifyMoireRebuildAssay,
  verifyMoireRebuildReplay
} from '../engine/ash-keep-moire.js';

export const ASH_PREMIUM_UI_VERSION = 'td613.ash.premium-ui/v0.1-command-instrument';

const DB_NAME = 'td613-ash-keep';
const POINTER_KEY = 'td613.ash-keep.current-case';
const installedHosts = new WeakSet();
const live = {
  snapshot: null,
  choirReceipt: null,
  choirReplay: null,
  refreshToken: 0
};

const LIFECYCLE_COPY = Object.freeze({
  ARRIVAL_UNPERSISTED: ['Setup not finished', 'Admit readiness or open an encrypted copy'],
  READINESS_OBSERVED: ['Ready to bind custody', 'Verify a custody root'],
  CUSTODY_ROOT_PROVISIONAL: ['Custody root needs verification', 'Complete local verification'],
  CUSTODY_ROOT_VERIFIED: ['Ready to bind the case', 'Bind the verified root'],
  CASE_BOUND: ['Case protected', 'Run a Rebuild Test before drafting'],
  REBUILD_ELIGIBLE: ['Draft work is open', 'Review the next bounded derivative'],
  RELEASE_ELIGIBLE: ['Exact release may be sealed', 'Seal continuity or record what left'],
  CONTINUITY_SEALED: ['Continuity protected', 'Resume from the current Save Point']
});

const PRIMARY_DESTINATIONS = Object.freeze([
  ['home', 'Home', '⌂'],
  ['map', 'Map', '米'],
  ['work', 'Work', 'à'],
  ['choir', 'Choir', '≈'],
  ['capsule', 'Capsule', '⟐']
]);

const SECONDARY_DESTINATIONS = Object.freeze([
  ['custody', 'Custody', 'Bind or verify the current root'],
  ['rooms', 'Rooms', 'Review local chambers and route rules'],
  ['routes', 'Routes', 'Inspect the crossing timeline'],
  ['test', 'Rebuild Test', 'Test a declared projection'],
  ['draft', 'Draft & Hush', 'Prepare, screen, and review one derivative'],
  ['save', 'Save Points', 'Inspect exact continuity receipts']
]);

const REVIEW_GROUPS = Object.freeze([
  ['Custody and integrity', ['validCustody', 'unresolvedTamper']],
  ['People and confidentiality', ['protectedIdentityReviewed', 'confidentialPassagesReviewed']],
  ['Route and metadata', ['metadataReviewed', 'sourceReferencesReviewed', 'routeHistoryReviewed']],
  ['Reconstruction and Choir', ['sufficientTestCoverage', 'promptInjectionReviewed', 'roomBridgesReviewed', 'chronologyReviewed', 'hushLinkCheckReviewed']],
  ['Final exact-draft confirmation', ['explicitReview']]
]);

const byId = (doc, id) => doc.getElementById(id);
const escapeHtml = value => String(value ?? '').replace(/[&<>"]/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
})[character]);
const humanize = value => String(value || '').replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase());
const shortDigest = value => value ? `${String(value).slice(0, 10)}…${String(value).slice(-10)}` : 'absent';
const unique = values => [...new Set(values.filter(Boolean))];

function openDb(host) {
  return new Promise((resolve, reject) => {
    const request = host.indexedDB.open(DB_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getRecord(db, store, id) {
  return new Promise((resolve, reject) => {
    if (!id || !db.objectStoreNames.contains(store)) return resolve(null);
    const request = db.transaction(store).objectStore(store).get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

function getAll(db, store) {
  return new Promise((resolve, reject) => {
    if (!db.objectStoreNames.contains(store)) return resolve([]);
    const request = db.transaction(store).objectStore(store).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

function valuesForCase(rows, caseId) {
  return rows
    .map(row => row?.value || row)
    .filter(value => value?.case_id === caseId || value?.id === caseId);
}

export function humanLifecycle(state) {
  const exact = String(state || 'ARRIVAL_UNPERSISTED').toUpperCase();
  const [posture, next] = LIFECYCLE_COPY[exact] || ['State requires review', 'Inspect the exact lifecycle receipt'];
  return Object.freeze({ exact, posture, next });
}

export function derivePremiumSnapshot({ caseMap, routeMemory, tests, drafts, reviews, releases, savePoints, lifecycle, custodyReceipts } = {}) {
  if (!caseMap) return Object.freeze({
    caseMap: null,
    routeMemory: null,
    profile: null,
    title: 'No case open',
    lifecycle: humanLifecycle(lifecycle?.lifecycle_state),
    counts: { rooms: 0, objects: 0, relations: 0, routes: 0, openActions: 0, gaps: 0, held: 0 },
    currentPriority: null,
    nextRoute: null,
    latestTest: null,
    latestDraft: null,
    latestReview: null,
    latestRelease: null,
    latestSavePoint: null,
    continuityChanged: false,
    receipts: [],
    custodyReceipts: []
  });
  const nodes = caseMap.nodes || [];
  const routes = routeMemory?.entries || [];
  const openActions = nodes.filter(node => node.type === 'intended-action' && node.confidence_posture !== 'CLOSED');
  const gaps = nodes.filter(node => node.type === 'evidence-gap');
  const held = nodes.filter(node => ['OPEN', 'HELD'].includes(node.confidence_posture));
  const latestTest = tests.at(-1) || null;
  const latestDraft = drafts.at(-1) || null;
  const latestReview = reviews.at(-1) || null;
  const latestRelease = releases.at(-1) || null;
  const latestSavePoint = savePoints.at(-1) || null;
  const lifecycleState = lifecycle?.lifecycle_state || lifecycle?.lifecycle_receipt?.lifecycle?.state;
  const receipts = unique([
    latestTest?.test_id,
    latestReview?.review_id,
    latestRelease?.receipt_id,
    latestSavePoint?.save_point_id,
    ...custodyReceipts.map(receipt => receipt?.receipt_id)
  ]);
  return Object.freeze({
    caseMap,
    routeMemory,
    profile: caseMap.profile,
    title: caseMap.title,
    lifecycle: humanLifecycle(lifecycleState),
    counts: {
      rooms: caseMap.rooms?.length || 0,
      objects: nodes.length,
      relations: caseMap.relationships?.length || 0,
      routes: routes.length,
      openActions: openActions.length,
      gaps: gaps.length,
      held: held.length
    },
    currentPriority: openActions[0] || gaps[0] || null,
    openActions,
    gaps,
    nextRoute: routes.at(-1) || null,
    latestTest,
    latestDraft,
    latestReview,
    latestRelease,
    latestSavePoint,
    continuityChanged: Boolean(latestSavePoint && latestSavePoint.case_map_digest !== caseMap.case_map_digest),
    receipts,
    custodyReceipts
  });
}

async function readSnapshot(doc, host) {
  const caseId = host.localStorage.getItem(POINTER_KEY);
  if (!caseId) return derivePremiumSnapshot({
    lifecycle: { lifecycle_state: doc.body?.dataset?.ashLifecycle || 'ARRIVAL_UNPERSISTED' }
  });
  const db = await openDb(host);
  try {
    const [
      caseMap, routeRow, tests, drafts, reviews, releases, savePoints, lifecycleRow, custodyRows
    ] = await Promise.all([
      getRecord(db, 'cases', caseId),
      getRecord(db, 'routeMemory', caseId),
      getAll(db, 'tests'),
      getAll(db, 'drafts'),
      getAll(db, 'reviews'),
      getAll(db, 'releases'),
      getAll(db, 'savePoints'),
      getRecord(db, 'lifecycle', caseId),
      getAll(db, 'custodyReceipts')
    ]);
    return derivePremiumSnapshot({
      caseMap,
      routeMemory: routeRow?.value || null,
      tests: valuesForCase(tests, caseId),
      drafts: valuesForCase(drafts, caseId),
      reviews: reviews.map(row => row?.value || row).filter(value => !value?.draft_id || drafts.some(row => (row?.value || row)?.draft_id === value.draft_id)),
      releases: valuesForCase(releases, caseId),
      savePoints: valuesForCase(savePoints, caseId),
      lifecycle: lifecycleRow?.value || { lifecycle_state: doc.body?.dataset?.ashLifecycle },
      custodyReceipts: custodyRows.map(row => row?.value || row)
    });
  } finally {
    db.close();
  }
}

function ensureStyles(doc) {
  if (byId(doc, 'td613-ash-premium-css')) return;
  const link = doc.createElement('link');
  link.id = 'td613-ash-premium-css';
  link.rel = 'stylesheet';
  link.href = '/dome-world/ash-premium-ui.css';
  doc.head.append(link);
}

function workspaceSection(doc, id, title, mark, description, body) {
  const section = doc.createElement('section');
  section.className = 'workspace premium-workspace';
  section.id = `workspace-${id}`;
  section.setAttribute('role', 'tabpanel');
  section.innerHTML = `
    <div class="workspace-head premium-workspace-head">
      <div><p class="premium-kicker">Ash command instrument</p><h2>${title}</h2><p>${description}</p></div>
      <span class="workspace-mark">${mark}</span>
    </div>
    ${body}`;
  return section;
}

function ensureWorkspaces(doc) {
  const main = doc.querySelector('main');
  if (!main) return false;
  if (!byId(doc, 'workspace-home')) {
    main.prepend(workspaceSection(doc, 'home', 'Command Deck', '⌂ / current posture',
      'See the current case, risk, next lawful action, crossing history, and continuity posture before entering the deeper instruments.',
      '<div id="premiumHomeBody" class="premium-stack"><div class="premium-skeleton">Reading the current local case…</div></div>'));
  }
  if (!byId(doc, 'workspace-work')) {
    byId(doc, 'workspace-map')?.insertAdjacentElement('afterend', workspaceSection(doc, 'work', 'Work Queue', 'à / profile work',
      'Profile-specific priorities route into Ash’s existing constitutional workspaces rather than separate mini-apps.',
      '<div id="premiumWorkBody" class="premium-stack"><div class="premium-skeleton">Preparing the work queue…</div></div>'));
  }
  if (!byId(doc, 'workspace-choir')) {
    main.append(workspaceSection(doc, 'choir', 'Choir', '≈ / controlled interference',
      'Run a bounded pairwise Moiré assay from current Route Memory. Residue remains evidence for human interpretation—not attribution, truth, prediction, suppression, or action authority.',
      `<div class="choir-layout">
        <section class="premium-sheet choir-console">
          <div class="premium-sheet-head"><div><p class="premium-kicker">Pairwise Moiré</p><h3>Projection circuit</h3></div><span class="premium-chip violet">Validation-gated</span></div>
          <p class="premium-copy">Choose at least two remembered routes. The deterministic Reader runs baseline, singleton, and unordered-pair observations against the held Case Map.</p>
          <div id="choirProjectionList" class="projection-list"></div>
          <div class="premium-action-row">
            <button class="premium-action primary" id="runPremiumChoir" type="button">Run pairwise assay</button>
            <button class="premium-action" id="replayPremiumChoir" type="button" disabled>Replay receipt</button>
            <button class="premium-action" id="downloadPremiumChoir" type="button" disabled>Export receipt</button>
          </div>
          <p class="premium-status" id="premiumChoirStatus">Choose two route projections.</p>
        </section>
        <section class="premium-sheet">
          <div class="premium-sheet-head"><div><p class="premium-kicker">Interference field</p><h3>Residue matrix</h3></div><span id="choirCalibrationChip" class="premium-chip">Not run</span></div>
          <div id="choirMatrix" class="choir-matrix"><p class="premium-empty">No Choir receipt yet.</p></div>
          <details class="claim-ceiling" open><summary>Claim ceiling</summary>
            <p>Pairwise residue ≠ intent, identity, authorship, causation, surveillance probability, release prohibition, prediction, recommendation, suppression, or automatic Ash action.</p>
          </details>
          <pre class="receipt premium-receipt" id="premiumChoirReceipt">No Choir receipt yet.</pre>
        </section>
      </div>
      <section class="premium-sheet instrument-registry">
        <div class="premium-sheet-head"><div><p class="premium-kicker">Choir family</p><h3>Instrument registry</h3></div><span class="premium-chip violet">Bounded contracts</span></div>
        <div class="instrument-grid" id="choirInstrumentRegistry"></div>
      </section>`));
  }
  if (!byId(doc, 'workspace-capsule')) {
    main.append(workspaceSection(doc, 'capsule', 'Capsule', '⟐ / portable continuity',
      'Seal or reopen authenticated continuity through the existing Ash Capsule engine. Passphrases and keys remain unstored.',
      `<div id="premiumCapsuleBody" class="capsule-layout">
        <section class="premium-sheet"><div class="premium-skeleton">Reading continuity posture…</div></section>
      </div>`));
  }
  return true;
}

function ensureChrome(doc) {
  if (byId(doc, 'premiumPrimaryDock')) return;
  const dock = doc.createElement('nav');
  dock.id = 'premiumPrimaryDock';
  dock.className = 'premium-primary-dock';
  dock.setAttribute('aria-label', 'Primary Ash destinations');
  dock.innerHTML = PRIMARY_DESTINATIONS.map(([id, label, glyph]) =>
    `<button type="button" data-premium-workspace="${id}" aria-pressed="false"><span aria-hidden="true">${glyph}</span><b>${label}</b></button>`
  ).join('');
  doc.body.append(dock);

  const context = doc.createElement('section');
  context.id = 'premiumContextBar';
  context.className = 'premium-context-bar';
  context.innerHTML = `
    <button type="button" class="premium-context-main" id="premiumReturnHome">
      <span><small id="premiumProfileLabel">No profile</small><strong id="premiumCaseLabel">No case open</strong></span>
      <span class="premium-context-next"><small>Next lawful action</small><b id="premiumNextAction">Choose a profile</b></span>
    </button>
    <button type="button" id="premiumContinuityButton" class="premium-continuity-button" data-posture="open">
      <small>Capsule</small><strong id="premiumContinuityLabel">Not sealed</strong>
    </button>
    <button type="button" id="premiumMenuButton" class="premium-menu-button" aria-haspopup="dialog" aria-controls="premiumCommandSheet">⌘</button>`;
  doc.querySelector('.workspace-rail')?.insertAdjacentElement('beforebegin', context);

  const sheet = doc.createElement('dialog');
  sheet.id = 'premiumCommandSheet';
  sheet.className = 'premium-command-sheet';
  sheet.innerHTML = `
    <div class="command-sheet-head">
      <div><p class="premium-kicker">Ash command sheet</p><h2>All instruments</h2></div>
      <button type="button" class="premium-close" id="closePremiumCommands" aria-label="Close command sheet">×</button>
    </div>
    <label class="command-search"><span class="sr-only">Filter commands</span><input id="premiumCommandSearch" type="search" placeholder="Find a workspace or crossing…"></label>
    <div class="command-grid" id="premiumCommandGrid">
      ${SECONDARY_DESTINATIONS.map(([id, label, note]) => `<button type="button" data-command-workspace="${id}"><strong>${label}</strong><small>${note}</small></button>`).join('')}
      <a href="/safe-harbor/index.html"><strong>Safe Harbor ingress</strong><small>Open the guarded source-side station</small></a>
      <a href="/dome-world/ash-destination-handoff.html"><strong>Destination handoff</strong><small>Open the separately gated crossing surface</small></a>
      <button type="button" data-command-action="receipts"><strong>Receipts</strong><small>Open the current receipt inventory</small></button>
      <button type="button" data-command-action="profile"><strong>Cases & profile</strong><small>Return to the explicit case selector</small></button>
    </div>`;
  doc.body.append(sheet);
}

function openWorkspace(doc, host, name) {
  const open = host.__td613OpenAshWorkspace || host.__td613AshKeep?.openWorkspace;
  if (typeof open === 'function') open(name);
  doc.querySelectorAll('[data-premium-workspace]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.premiumWorkspace === name));
  });
  doc.documentElement.dataset.ashPremiumWorkspace = name;
  if (name === 'home' || name === 'work' || name === 'capsule' || name === 'choir') refresh(doc, host);
  host.scrollTo?.({ top: 0, behavior: host.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

function metric(label, value, tone = '') {
  return `<article class="premium-metric ${tone}"><small>${escapeHtml(label)}</small><strong>${escapeHtml(value)}</strong></article>`;
}

function actionButton(label, workspace, tone = '') {
  return `<button type="button" class="premium-action ${tone}" data-route-workspace="${workspace}">${escapeHtml(label)}</button>`;
}

function routeTimeline(routes = []) {
  if (!routes.length) return '<p class="premium-empty">Nothing has been recorded as leaving this case.</p>';
  return `<ol class="crossing-timeline">${[...routes].reverse().map(entry => `
    <li>
      <i aria-hidden="true"></i>
      <div><strong>${escapeHtml(humanize(entry.recipient_class))} · ${escapeHtml(humanize(entry.purpose))}</strong>
      <p>${entry.disclosed_opaque_references?.length || 0} references left · ${escapeHtml(entry.recorded_at || 'local time unrecorded')}</p>
      <small>${escapeHtml(humanize(entry.recall_state))} · <code>${escapeHtml(entry.route_id)}</code></small></div>
    </li>`).join('')}</ol>`;
}

function renderHome(doc, snapshot) {
  const target = byId(doc, 'premiumHomeBody');
  if (!target) return;
  if (!snapshot.caseMap) {
    target.innerHTML = `<section class="premium-hero empty">
      <p class="premium-kicker">No active case</p><h3>Choose a profile or open a Capsule.</h3>
      <p>Ash begins without presuming a profession. The launch gate keeps demo, blank-workspace, and recovery actions explicit.</p>
      <div class="premium-action-row"><button class="premium-action primary" data-command-action="profile">Open cases & profiles</button>${actionButton('Open Capsule', 'capsule')}</div>
    </section>`;
    return;
  }
  const c = snapshot.counts;
  const profile = humanize(snapshot.profile);
  const profileMetrics = snapshot.profile === 'political_campaign'
    ? [
        metric('Decisions open', c.openActions, 'gold'),
        metric('External routes', c.routes),
        metric('Risk gaps', c.gaps, c.gaps ? 'rose' : ''),
        metric('Awaiting review', snapshot.latestReview?.status === 'READY_FOR_LOCAL_RELEASE_APPROVAL' ? 1 : snapshot.latestDraft ? 1 : 0)
      ]
    : snapshot.profile === 'fundraiser'
      ? [
          metric('Open asks & actions', c.openActions, 'gold'),
          metric('External routes', c.routes),
          metric('Fulfillment gaps', c.gaps, c.gaps ? 'rose' : ''),
          metric('Continuity points', snapshot.latestSavePoint ? 1 : 0)
        ]
      : [
          metric('Open actions', c.openActions, 'gold'),
          metric('External routes', c.routes),
          metric('Evidence gaps', c.gaps, c.gaps ? 'rose' : ''),
          metric('Continuity points', snapshot.latestSavePoint ? 1 : 0)
        ];
  target.innerHTML = `
    <section class="premium-hero">
      <div class="premium-hero-copy">
        <p class="premium-kicker">${escapeHtml(profile)} · ${escapeHtml(snapshot.caseMap.source_status)}</p>
        <h3>${escapeHtml(snapshot.title)}</h3>
        <p>${escapeHtml(snapshot.lifecycle.posture)}. ${escapeHtml(snapshot.lifecycle.next)}.</p>
      </div>
      <div class="premium-exact-state"><small>Exact state</small><code>${escapeHtml(snapshot.lifecycle.exact)}</code><span>Case digest ${escapeHtml(shortDigest(snapshot.caseMap.case_map_digest))}</span></div>
    </section>
    <div class="premium-metric-grid">${profileMetrics.join('')}</div>
    <div class="command-deck-grid">
      <section class="premium-sheet priority-sheet">
        <div class="premium-sheet-head"><div><p class="premium-kicker">Current priority</p><h3>${escapeHtml(snapshot.currentPriority?.label || 'No open priority')}</h3></div><span class="premium-chip ${snapshot.currentPriority ? 'rose' : ''}">${snapshot.currentPriority ? escapeHtml(humanize(snapshot.currentPriority.source_status)) : 'Clear'}</span></div>
        <p class="premium-copy">${snapshot.currentPriority ? `Held in ${escapeHtml(humanize(snapshot.currentPriority.room_id))}. Exact confidence posture: ${escapeHtml(snapshot.currentPriority.confidence_posture)}.` : 'No intended action or evidence gap is currently open.'}</p>
        <div class="premium-action-row">
          ${actionButton(snapshot.profile === 'fundraiser' ? 'Open next ask' : 'Review next response', 'work', 'primary')}
          ${actionButton('Record what left', 'routes')}
          ${actionButton('Run Rebuild Test', 'test')}
          ${actionButton('Run Choir assay', 'choir', 'violet')}
          ${actionButton('Seal Capsule', 'capsule', 'gold')}
        </div>
      </section>
      <section class="premium-sheet">
        <div class="premium-sheet-head"><div><p class="premium-kicker">Continuity</p><h3>${snapshot.latestSavePoint ? 'Save Point held locally' : 'No Save Point yet'}</h3></div><span class="premium-chip ${snapshot.continuityChanged ? 'rose' : 'mint'}">${snapshot.continuityChanged ? 'Changed since seal' : snapshot.latestSavePoint ? 'Current' : 'Open'}</span></div>
        <dl class="premium-facts">
          <div><dt>Last sealed</dt><dd>${escapeHtml(snapshot.latestSavePoint?.created_at || 'Never')}</dd></div>
          <div><dt>Release receipt</dt><dd>${snapshot.latestRelease ? 'Bound' : 'Absent'}</dd></div>
          <div><dt>Passphrase</dt><dd>Never stored</dd></div>
          <div><dt>Case protected</dt><dd>${snapshot.latestSavePoint ? 'Locally sealed' : 'Not yet sealed'}</dd></div>
        </dl>
        <div class="premium-action-row">${actionButton('Open Capsule', 'capsule', 'gold')}${actionButton('Inspect receipts', 'work')}</div>
      </section>
    </div>
    <section class="premium-sheet">
      <div class="premium-sheet-head"><div><p class="premium-kicker">What has already left</p><h3>Crossing timeline</h3></div><span class="premium-chip">${c.routes} remembered</span></div>
      ${routeTimeline(snapshot.routeMemory?.entries)}
    </section>`;
}

function renderWork(doc, snapshot) {
  const target = byId(doc, 'premiumWorkBody');
  if (!target) return;
  if (!snapshot.caseMap) {
    target.innerHTML = '<section class="premium-sheet"><p class="premium-empty">Open a case before building a work queue.</p></section>';
    return;
  }
  const queue = [...snapshot.openActions, ...snapshot.gaps];
  target.innerHTML = `
    <div class="work-overview">
      ${metric('Open priorities', queue.length, queue.length ? 'rose' : '')}
      ${metric('Draft', snapshot.latestDraft ? 'Kept' : 'Absent')}
      ${metric('Review', snapshot.latestReview ? humanize(snapshot.latestReview.status) : 'Not started')}
      ${metric('Receipts', snapshot.receipts.length, 'gold')}
    </div>
    <div class="work-layout">
      <section class="premium-sheet">
        <div class="premium-sheet-head"><div><p class="premium-kicker">${escapeHtml(humanize(snapshot.profile))}</p><h3>Priority queue</h3></div><span class="premium-chip">${queue.length} items</span></div>
        <div class="priority-list">${queue.length ? queue.map((node, index) => `
          <article><span>${String(index + 1).padStart(2, '0')}</span><div><strong>${escapeHtml(node.label)}</strong><p>${escapeHtml(humanize(node.room_id))}</p><small>${escapeHtml(node.source_status)} · ${escapeHtml(node.confidence_posture)}</small></div></article>`).join('') : '<p class="premium-empty">No intended action or evidence gap remains open.</p>'}</div>
      </section>
      <section class="premium-sheet">
        <div class="premium-sheet-head"><div><p class="premium-kicker">Exact instruments</p><h3>Act through the existing chambers</h3></div><span class="premium-chip mint">No duplicate engine</span></div>
        <div class="work-actions">
          ${actionButton('Map the priority', 'map', 'primary')}
          ${actionButton('Review Rooms', 'rooms')}
          ${actionButton('Record a crossing', 'routes')}
          ${actionButton('Run Rebuild Test', 'test')}
          ${actionButton('Prepare Draft & Hush', 'draft')}
          ${actionButton('Inspect Save Points', 'save')}
        </div>
      </section>
    </div>
    <section class="premium-sheet receipt-inventory" id="premiumReceiptInventory">
      <div class="premium-sheet-head"><div><p class="premium-kicker">Receipt access</p><h3>Current exact records</h3></div><span class="premium-chip gold">${snapshot.receipts.length} references</span></div>
      <div class="receipt-list">${snapshot.receipts.length ? snapshot.receipts.map(value => `<code>${escapeHtml(value)}</code>`).join('') : '<p class="premium-empty">No terminal receipt has been kept for this case.</p>'}</div>
    </section>
    <section class="premium-sheet">
      <div class="premium-sheet-head"><div><p class="premium-kicker">Route Memory</p><h3>Operational history</h3></div><span class="premium-chip">${snapshot.counts.routes} crossings</span></div>
      ${routeTimeline(snapshot.routeMemory?.entries)}
    </section>`;
}

function instrumentRegistry() {
  const instruments = [
    ['Pairwise Moiré', 'Operator surface active', 'active'],
    ['Calibration circuit', 'Receipt contract available', 'bounded'],
    ['Reader provenance', 'Engine available · surface pending', 'bounded'],
    ['Reader disagreement', 'Engine available · surface pending', 'bounded'],
    ['Matched benign controls', 'Engine available · surface pending', 'bounded'],
    ['Higher-order interference', 'Separate bounded contract', 'bounded'],
    ['Ordered route sequence', 'Separate bounded contract', 'bounded'],
    ['Temporal disclosure', 'Separate bounded contract', 'bounded']
  ];
  return instruments.map(([name, posture, state]) => `<article data-instrument-state="${state}"><strong>${name}</strong><p>${posture}</p></article>`).join('');
}

function renderChoir(doc, snapshot) {
  const list = byId(doc, 'choirProjectionList');
  const registry = byId(doc, 'choirInstrumentRegistry');
  if (registry && !registry.dataset.rendered) {
    registry.innerHTML = instrumentRegistry();
    registry.dataset.rendered = 'true';
  }
  if (!list) return;
  const routes = snapshot.routeMemory?.entries || [];
  list.innerHTML = routes.length ? routes.map((entry, index) => `
    <label class="projection-card">
      <input type="checkbox" data-choir-projection="${escapeHtml(entry.entry_id || `route_${index + 1}`)}" ${index < 2 ? 'checked' : ''}>
      <span><strong>${escapeHtml(humanize(entry.recipient_class))}</strong><small>${escapeHtml(humanize(entry.purpose))}</small><code>${escapeHtml(entry.route_id)}</code></span>
      <b>${entry.disclosed_opaque_references?.length || 0}</b>
    </label>`).join('') : '<p class="premium-empty">Record at least two Route Memory entries before running a pairwise assay.</p>';
  byId(doc, 'runPremiumChoir').disabled = routes.length < 2;
}

function renderCapsule(doc, snapshot) {
  const target = byId(doc, 'premiumCapsuleBody');
  if (!target) return;
  const sealed = Boolean(snapshot.latestSavePoint);
  target.innerHTML = `
    <section class="premium-sheet capsule-promise">
      <div class="premium-sheet-head"><div><p class="premium-kicker">Pocket continuity</p><h3>${sealed ? 'Current case has a local Save Point' : 'Continuity remains open'}</h3></div><span class="premium-chip ${sealed ? 'mint' : 'rose'}">${sealed ? 'Protected locally' : 'Not sealed'}</span></div>
      <dl class="capsule-facts">
        <div><dt>Last sealed</dt><dd>${escapeHtml(snapshot.latestSavePoint?.created_at || 'Never')}</dd></div>
        <div><dt>Current case</dt><dd>${snapshot.caseMap ? escapeHtml(snapshot.title) : 'No case open'}</dd></div>
        <div><dt>Release receipt</dt><dd>${snapshot.latestRelease ? 'Bound to current case' : 'Absent'}</dd></div>
        <div><dt>Passphrase</dt><dd>Never stored</dd></div>
        <div><dt>Change since seal</dt><dd>${snapshot.continuityChanged ? 'Current digest differs' : sealed ? 'No digest drift observed' : 'Unknown until sealed'}</dd></div>
      </dl>
      <div class="capsule-inputs">
        <label><span>Passphrase</span><input id="premiumCapsulePassphrase" type="password" autocomplete="new-password"></label>
        <label><span>Encrypted copy</span><input id="premiumCapsuleFile" type="file" accept="application/json,.json"></label>
      </div>
      <div class="premium-action-row">
        <button type="button" class="premium-action primary" id="premiumSealSave" ${snapshot.caseMap ? '' : 'disabled'}>Seal Save Point</button>
        <button type="button" class="premium-action gold" id="premiumExportCapsule" ${snapshot.caseMap ? '' : 'disabled'}>Export encrypted copy</button>
        <button type="button" class="premium-action" id="premiumImportCapsule">Open encrypted copy</button>
        <button type="button" class="premium-action" id="premiumInspectSave" ${sealed ? '' : 'disabled'}>Inspect last Save Point</button>
      </div>
      <p class="premium-status" id="premiumCapsuleStatus">${snapshot.caseMap ? 'Actions use the existing Ash continuity engine.' : 'Opening an authenticated copy does not require a current case.'}</p>
    </section>
    <section class="premium-sheet">
      <div class="premium-sheet-head"><div><p class="premium-kicker">Exact continuity receipt</p><h3>${escapeHtml(snapshot.latestSavePoint?.save_point_id || 'No Save Point')}</h3></div><span class="premium-chip">Local only</span></div>
      <pre class="receipt premium-receipt">${escapeHtml(snapshot.latestSavePoint ? JSON.stringify(snapshot.latestSavePoint, null, 2) : 'No Save Point yet.')}</pre>
      ${sealed ? '<p class="premium-hold">Returning the entire case to an earlier state remains held: a Save Point proves continuity but does not silently overwrite the current Case Map.</p>' : ''}
    </section>`;
  bindCapsuleActions(doc);
}

function renderChrome(doc, snapshot) {
  byId(doc, 'premiumProfileLabel').textContent = snapshot.profile ? humanize(snapshot.profile) : 'No profile';
  byId(doc, 'premiumCaseLabel').textContent = snapshot.title;
  byId(doc, 'premiumNextAction').textContent = snapshot.currentPriority?.label || snapshot.lifecycle.next;
  const continuity = byId(doc, 'premiumContinuityButton');
  const continuityLabel = byId(doc, 'premiumContinuityLabel');
  if (continuity && continuityLabel) {
    const sealed = Boolean(snapshot.latestSavePoint);
    continuity.dataset.posture = snapshot.continuityChanged ? 'changed' : sealed ? 'sealed' : 'open';
    continuityLabel.textContent = snapshot.continuityChanged ? 'Changed' : sealed ? 'Sealed' : 'Not sealed';
  }
}

function groupReviewChecks(doc) {
  const root = byId(doc, 'reviewChecks');
  if (!root || root.dataset.premiumGrouped === 'true' || !root.querySelector('[data-review]')) return;
  const nodes = new Map([...root.querySelectorAll('label.check')].map(label => [label.querySelector('[data-review]')?.dataset.review, label]));
  root.textContent = '';
  root.classList.add('premium-review-groups');
  for (const [title, keys] of REVIEW_GROUPS) {
    const group = doc.createElement('details');
    group.className = 'review-group';
    group.open = title === 'Final exact-draft confirmation';
    const count = keys.filter(key => nodes.has(key)).length;
    group.innerHTML = `<summary><span>${title}</span><b data-review-group-count>${count} checks</b></summary><div></div>`;
    const body = group.querySelector('div');
    keys.forEach(key => { if (nodes.has(key)) body.append(nodes.get(key)); });
    group.addEventListener('change', () => updateReviewGroup(group));
    root.append(group);
  }
  root.dataset.premiumGrouped = 'true';
  root.querySelectorAll('.review-group').forEach(updateReviewGroup);
}

function updateReviewGroup(group) {
  const checks = [...group.querySelectorAll('input[type="checkbox"]')];
  const done = checks.filter(input => input.checked).length;
  const badge = group.querySelector('[data-review-group-count]');
  if (badge) badge.textContent = done === checks.length && checks.length ? 'clear' : done ? `${done}/${checks.length} reviewed` : 'needs review';
  group.dataset.reviewPosture = done === checks.length && checks.length ? 'clear' : done ? 'partial' : 'held';
}

function bindCapsuleActions(doc) {
  const sync = () => {
    const sourcePass = byId(doc, 'premiumCapsulePassphrase');
    const targetPass = byId(doc, 'capsulePassphrase');
    if (sourcePass && targetPass) targetPass.value = sourcePass.value;
    const sourceFile = byId(doc, 'premiumCapsuleFile');
    const targetFile = byId(doc, 'capsuleFile');
    if (sourceFile?.files?.length && targetFile) {
      try {
        const transfer = new DataTransfer();
        [...sourceFile.files].forEach(file => transfer.items.add(file));
        targetFile.files = transfer.files;
      } catch {
        // A browser that blocks programmatic FileList transfer can still use the exact Save workspace.
      }
    }
  };
  byId(doc, 'premiumSealSave')?.addEventListener('click', () => byId(doc, 'makeSave')?.click(), { once: true });
  byId(doc, 'premiumExportCapsule')?.addEventListener('click', () => { sync(); byId(doc, 'exportCapsule')?.click(); }, { once: true });
  byId(doc, 'premiumImportCapsule')?.addEventListener('click', () => { sync(); byId(doc, 'importCapsule')?.click(); }, { once: true });
  byId(doc, 'premiumInspectSave')?.addEventListener('click', () => byId(doc, 'premiumPrimaryDock')?.dispatchEvent(new CustomEvent('td613:premium:open-save')), { once: true });
}

function downloadJson(doc, filename, value) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
  const anchor = doc.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function runChoir(doc) {
  const snapshot = live.snapshot;
  if (!snapshot?.caseMap || !snapshot.routeMemory) throw new Error('Choir requires a current Case Map and Route Memory.');
  const selectedIds = [...doc.querySelectorAll('[data-choir-projection]:checked')].map(input => input.dataset.choirProjection);
  const entries = snapshot.routeMemory.entries.filter((entry, index) => selectedIds.includes(entry.entry_id || `route_${index + 1}`));
  if (entries.length < 2) throw new Error('Choose at least two route projections.');
  const reader = await compileReaderProfile({
    readerClass: 'deterministic-baseline',
    label: 'Ash premium Choir deterministic Reader',
    version: '1',
    sourceStatus: 'DERIVED',
    repeatCount: 1,
    seeded: true,
    evidenceBasis: ['current local Case Map', 'current local Route Memory', 'operator-selected route projections'],
    observations: ['Reader execution remained browser-local.']
  });
  const projections = entries.map((entry, index) => ({
    projection_id: `projection_${String(index + 1).padStart(2, '0')}_${entry.route_id}`.replace(/[^a-z0-9_]/g, '_').slice(0, 120),
    disclosed_opaque_references: entry.disclosed_opaque_references,
    route_id: entry.route_id,
    purpose: entry.purpose,
    source_status: 'OBSERVED'
  }));
  live.choirReceipt = await runDeterministicMoireAssay({
    caseMap: snapshot.caseMap,
    routeMemory: snapshot.routeMemory,
    reader,
    projections,
    calibration: {
      preregisteredFixture: false,
      benignControl: false,
      heldOut: false,
      sourceDriftCheck: false,
      alternativeReader: false,
      exactThresholds: {}
    },
    sourceStatus: 'DERIVED',
    evidenceBasis: ['operator-selected current Route Memory entries', 'deterministic named Reader'],
    missingness: ['matched benign-control bank not selected in this operator run'],
    alternatives: ['ordinary topic overlap', 'shared route templates', 'incomplete Route Memory'],
    openQuestions: ['Which matched control and alternative Reader should be added before any wider interpretation?']
  });
  const verified = await verifyMoireRebuildAssay(live.choirReceipt);
  if (!verified) throw new Error('Choir receipt failed digest verification.');
  live.choirReplay = null;
  renderChoirReceipt(doc);
  byId(doc, 'replayPremiumChoir').disabled = false;
  byId(doc, 'downloadPremiumChoir').disabled = false;
  byId(doc, 'premiumChoirStatus').textContent = `${live.choirReceipt.pairwise_residue.length} pairs observed · ${live.choirReceipt.emergent_pair_count} emergent · operator review required.`;
}

function renderChoirReceipt(doc) {
  const receipt = live.choirReceipt;
  if (!receipt) return;
  byId(doc, 'premiumChoirReceipt').textContent = JSON.stringify(receipt, null, 2);
  const chip = byId(doc, 'choirCalibrationChip');
  chip.textContent = humanize(receipt.calibration_state);
  chip.className = `premium-chip ${receipt.calibration_state === 'CALIBRATED_FOR_NAMED_FIXTURE' ? 'mint' : 'rose'}`;
  const matrix = byId(doc, 'choirMatrix');
  matrix.innerHTML = receipt.pairwise_residue.map(row => {
    const residue = row.residue;
    const total = residue.node_ids.length + residue.relationship_ids.length + residue.chronology_millipoints + residue.source_style_linkage_millipoints;
    return `<article class="${row.emergent_topology_detected ? 'emergent' : ''}">
      <small>${row.projection_ids.map(humanize).join(' + ')}</small>
      <strong>${row.emergent_topology_detected ? 'Residue observed' : row.state === 'OBSERVED' ? 'No additional residue' : humanize(row.state)}</strong>
      <p>${residue.node_ids.length} nodes · ${residue.relationship_ids.length} relations · ${residue.room_bridge_ids.length} bridges</p>
      <meter min="0" max="${Math.max(1, total)}" value="${Math.min(total, Math.max(1, total))}"></meter>
    </article>`;
  }).join('');
}

async function replayChoir(doc) {
  if (!live.choirReceipt) throw new Error('Run Choir first.');
  live.choirReplay = await replayMoireRebuildAssay(live.choirReceipt);
  if (!(await verifyMoireRebuildReplay(live.choirReplay))) throw new Error('Choir replay failed verification.');
  byId(doc, 'premiumChoirStatus').textContent = `${live.choirReplay.status} · Reader was not rerun and storage was not mutated.`;
  byId(doc, 'premiumChoirReceipt').textContent = JSON.stringify({ assay: live.choirReceipt, replay: live.choirReplay }, null, 2);
}

async function refresh(doc, host) {
  const token = ++live.refreshToken;
  try {
    const snapshot = await readSnapshot(doc, host);
    if (token !== live.refreshToken) return;
    live.snapshot = snapshot;
    renderChrome(doc, snapshot);
    renderHome(doc, snapshot);
    renderWork(doc, snapshot);
    renderChoir(doc, snapshot);
    renderCapsule(doc, snapshot);
    groupReviewChecks(doc);
    doc.documentElement.dataset.ashPremiumReady = 'true';
  } catch (error) {
    console.error(error);
    const home = byId(doc, 'premiumHomeBody');
    if (home) home.innerHTML = `<p class="premium-hold">Premium composition held: ${escapeHtml(error.message)}</p>`;
  }
}

function bindEvents(doc, host) {
  doc.addEventListener('click', event => {
    const primary = event.target.closest?.('[data-premium-workspace]');
    if (primary) {
      event.preventDefault();
      openWorkspace(doc, host, primary.dataset.premiumWorkspace);
      return;
    }
    const route = event.target.closest?.('[data-route-workspace],[data-command-workspace]');
    if (route) {
      event.preventDefault();
      byId(doc, 'premiumCommandSheet')?.close();
      openWorkspace(doc, host, route.dataset.routeWorkspace || route.dataset.commandWorkspace);
      return;
    }
    const command = event.target.closest?.('[data-command-action]');
    if (command?.dataset.commandAction === 'profile') {
      event.preventDefault();
      byId(doc, 'premiumCommandSheet')?.close();
      byId(doc, 'launch')?.classList.remove('hidden');
      byId(doc, 'newProfile')?.focus();
      return;
    }
    if (command?.dataset.commandAction === 'receipts') {
      event.preventDefault();
      byId(doc, 'premiumCommandSheet')?.close();
      openWorkspace(doc, host, 'work');
      byId(doc, 'premiumReceiptInventory')?.scrollIntoView({ block: 'start' });
    }
  });

  byId(doc, 'premiumReturnHome')?.addEventListener('click', () => openWorkspace(doc, host, 'home'));
  byId(doc, 'premiumContinuityButton')?.addEventListener('click', () => openWorkspace(doc, host, 'capsule'));
  byId(doc, 'premiumMenuButton')?.addEventListener('click', () => byId(doc, 'premiumCommandSheet')?.showModal());
  byId(doc, 'closePremiumCommands')?.addEventListener('click', () => byId(doc, 'premiumCommandSheet')?.close());
  byId(doc, 'premiumCommandSearch')?.addEventListener('input', event => {
    const query = event.target.value.trim().toLowerCase();
    byId(doc, 'premiumCommandGrid')?.querySelectorAll('button,a').forEach(item => {
      item.hidden = Boolean(query && !item.textContent.toLowerCase().includes(query));
    });
  });

  byId(doc, 'runPremiumChoir')?.addEventListener('click', async () => {
    try {
      byId(doc, 'premiumChoirStatus').textContent = 'Running named deterministic Reader across the selected projections…';
      await runChoir(doc);
    } catch (error) {
      byId(doc, 'premiumChoirStatus').textContent = `Choir held · ${error.message}`;
    }
  });
  byId(doc, 'replayPremiumChoir')?.addEventListener('click', async () => {
    try { await replayChoir(doc); }
    catch (error) { byId(doc, 'premiumChoirStatus').textContent = `Replay held · ${error.message}`; }
  });
  byId(doc, 'downloadPremiumChoir')?.addEventListener('click', () => {
    if (live.choirReceipt) downloadJson(doc, `td613-ash-choir-${live.choirReceipt.assay_id}.json`, {
      assay: live.choirReceipt,
      replay: live.choirReplay,
      production_status: 'IMPLEMENTED_VALIDATION_GATED',
      transport_authorized: false,
      automatic_ash_action: false
    });
  });
  byId(doc, 'premiumPrimaryDock')?.addEventListener('td613:premium:open-save', () => openWorkspace(doc, host, 'save'));

  for (const type of [
    'core-ready', 'case-opened', 'case-created', 'core-mutated', 'profile-demo-hydrated',
    'custody-bound', 'rebuild-kept', 'draft-kept', 'review-kept', 'release-kept',
    'continuity-kept', 'capsule-opened'
  ]) {
    host.addEventListener(`td613:ash:${type}`, () => {
      refresh(doc, host);
      if (['case-opened', 'case-created', 'profile-demo-hydrated', 'capsule-opened'].includes(type)) {
        queueMicrotask(() => openWorkspace(doc, host, 'home'));
      }
    });
  }

  if (typeof host.MutationObserver === 'function') {
    new host.MutationObserver(() => refresh(doc, host)).observe(doc.body, {
      attributes: true,
      attributeFilter: ['data-ash-lifecycle']
    });
    const reviewRoot = byId(doc, 'reviewChecks');
    if (reviewRoot) new host.MutationObserver(() => groupReviewChecks(doc)).observe(reviewRoot, { childList: true });
  }
}

export function installAshPremiumUI(doc = globalThis.document, host = globalThis.window) {
  if (!doc?.body || !host || installedHosts.has(host)) return false;
  ensureStyles(doc);
  ensureWorkspaces(doc);
  ensureChrome(doc);
  bindEvents(doc, host);
  groupReviewChecks(doc);
  doc.documentElement.dataset.ashPremiumUI = ASH_PREMIUM_UI_VERSION;
  host.__td613AshPremiumUI = Object.freeze({
    version: ASH_PREMIUM_UI_VERSION,
    refresh: () => refresh(doc, host),
    snapshot: () => live.snapshot,
    open: name => openWorkspace(doc, host, name),
    choirReceipt: () => live.choirReceipt
  });
  installedHosts.add(host);
  refresh(doc, host);
  const pointer = host.localStorage.getItem(POINTER_KEY);
  if (pointer) queueMicrotask(() => openWorkspace(doc, host, 'home'));
  return true;
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  installAshPremiumUI(document, window);
}
