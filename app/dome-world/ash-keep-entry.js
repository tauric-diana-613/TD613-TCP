const PUBLIC_ROUTE = '/dome-world/ash-keep.html';
const SOURCE_ROUTE = '/dome-world/ash-keep-source.html?delivery=td613-static-v0.1';
const CORE_SOURCE_ROUTE = '/dome-world/ash-keep.js?delivery=td613-static-core-v0.1';
const READINESS_KEY = 'td613:ash-threshold:readiness:v0.1';
const THEME_MARKER = '<meta name="theme-color" content="#04130f">';
const CORE_SCRIPT = '<script type="module" src="/dome-world/ash-keep.js"></script>';
const LIFECYCLE_META = '<meta name="ash-lifecycle" content="v0.1">';
const LIFECYCLE_SCRIPT = '<script type="module" src="/dome-world/ash-lifecycle.js"></script>';
const WORKSPACE_BRIDGE_SCRIPT = '<script type="module" src="/dome-world/ash-workspace-bridge.js"></script>';
const ARRIVAL_COMPATIBILITY_SCRIPT = `<script>/* td613 arrival-route compatibility: static document first, history annotation only */if(sessionStorage.getItem('${READINESS_KEY}')&&location.pathname==='${PUBLIC_ROUTE}'&&location.search!=='?arrival=cleared'){history.replaceState(null,'','${PUBLIC_ROUTE}?arrival=cleared')}</script>`;
const LAUNCH_MEMBRANE_STYLE = '<style data-td613-ash-launch-membrane>.mast-state button.back{background:transparent;cursor:pointer}.case-entry{width:auto;min-width:54px;padding:0 9px;font:700 .62rem var(--mono);text-transform:uppercase}.launch.booting .launch-panel{width:min(360px,100%)}.launch.booting .launch-panel>*{display:none}.launch.booting .launch-panel::after{content:"Opening local custody…";display:block;padding:8px;color:var(--mint);font:700 .72rem var(--mono);letter-spacing:.1em;text-align:center;text-transform:uppercase}.launch-top{display:flex;align-items:center;justify-content:space-between;gap:12px}.launch-close{min-height:34px;padding:6px 10px;border:1px solid var(--line);background:transparent;color:var(--muted);font:700 .62rem var(--mono);text-transform:uppercase;cursor:pointer}body.launch-open{overflow:hidden}</style>';
const MAST_STATE_MARKER = '<div class="mast-state"><span class="status-chip" id="storageState">Local custody</span><a class="back" href="/dome-world/index.html#ash" aria-label="Back to Dome-World">‹</a></div>';
const MAST_STATE_BINDING = '<div class="mast-state"><span class="status-chip" id="storageState">Local custody</span><button class="back case-entry" id="openLaunch" type="button" aria-controls="launch" aria-expanded="false" aria-label="Open case entry" title="Open case entry">Case</button><a class="back" href="/dome-world/index.html#ash" aria-label="Back to Dome-World">‹</a></div>';
const LAUNCH_ROOT_MARKER = '<div class="launch" id="launch">';
const LAUNCH_ROOT_BINDING = '<div class="launch booting" id="launch" role="dialog" aria-modal="true" aria-labelledby="launchTitle" aria-describedby="launchDescription" aria-hidden="false">';
const LAUNCH_PANEL_MARKER = '<section class="launch-panel"><div class="launch-glyphs">米 · 上 · 下 · hõt · cōl · 𝄐 · ⟐</div>';
const LAUNCH_PANEL_BINDING = '<section class="launch-panel"><div class="launch-top"><div class="launch-glyphs">米 · 上 · 下 · hõt · cōl · 𝄐 · ⟐</div><button class="launch-close" id="closeLaunch" type="button" hidden>Return to case</button></div>';
const LAUNCH_COPY_MARKER = '<h2>Ash Keep</h2><p>Keep the private shape of a case coherent while testing what a purpose-shaped fragment could make recoverable through a declared route.</p>';
const LAUNCH_COPY_BINDING = '<h2 id="launchTitle">Ash Keep</h2><p id="launchDescription">Keep the private shape of a case coherent while testing what a purpose-shaped fragment could make recoverable through a declared route.</p>';
const DRAFT_MARKER = "    caseId: state.caseMap.case_id,\n    body: $('draftBody').value,";
const DRAFT_BINDING = "    caseId: state.caseMap.case_id,\n    caseMapDigest: state.caseMap.case_map_digest,\n    body: $('draftBody').value,";
const SAVE_POINT_MARKER = "    routeMemoryDigest: state.routeMemory.route_memory_digest,\n    evidenceInventory: state.caseMap.nodes.filter(node => ['artifact', 'source'].includes(node.type)).map(node => node.id),";
const SAVE_POINT_BINDING = "    routeMemoryDigest: state.routeMemory.route_memory_digest,\n    releaseReceiptReference: state.latestRelease?.receipt_id || null,\n    releaseReceiptDigest: state.latestRelease?.receipt_digest || null,\n    releaseCreatedAt: state.latestRelease?.created_at || null,\n    evidenceInventory: state.caseMap.nodes.filter(node => ['artifact', 'source'].includes(node.type)).map(node => node.id),";
const CAPSULE_MARKER = "async function exportCapsule() {\n  if (!state.savePoints.length) await makeSavePoint();";
const CAPSULE_BINDING = "async function exportCapsule() {\n  const latestSavePoint = state.savePoints.at(-1);\n  const currentRelease = state.latestRelease;\n  if (!currentRelease) throw new Error('A current Release Receipt is required before Capsule export.');\n  if (!latestSavePoint || latestSavePoint.release_receipt_reference !== currentRelease.receipt_id || latestSavePoint.release_receipt_digest !== currentRelease.receipt_digest || latestSavePoint.release_created_at !== currentRelease.created_at) await makeSavePoint();";
const REVIEW_MARKER = "  await put('reviews', state.latestReview, state.latestReview.review_id);\n  renderDraft();";
const REVIEW_BINDING = "  await put('reviews', state.latestReview, state.latestReview.review_id);\n  renderDraft();\n  setTimeout(() => location.reload(), 160); // td613 lifecycle review refresh";
const WORKSPACE_MARKER = "function setWorkspace(name) {\n  state.workspace = name;\n  qsa('.work-tab').forEach(button => button.setAttribute('aria-selected', String(button.dataset.workspace === name)));\n  qsa('.workspace').forEach(panel => panel.classList.toggle('active', panel.id === `workspace-${name}`));\n  state.mapVisible = name === 'map' && !document.hidden;\n  const prefs = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}');\n  localStorage.setItem(PREFS_KEY, JSON.stringify({ ...prefs, workspace: name, mapMode: state.mapMode }));\n  if (state.mapVisible) startScheduler(); else stopScheduler();\n}";
const WORKSPACE_BINDING = `${WORKSPACE_MARKER}\n\nwindow.__td613OpenAshWorkspace = setWorkspace; // td613 late workspace bridge`;
const LAUNCH_STATE_MARKER = "  canvasSize: { width: 0, height: 0, dpr: 0 }\n};\n\nfunction openDb() {";
const LAUNCH_STATE_BINDING = `  canvasSize: { width: 0, height: 0, dpr: 0 }\n};\n\nfunction setLaunchOpen(open, { returnable = Boolean(state.caseMap) } = {}) {\n  const launch = $('launch');\n  const close = $('closeLaunch');\n  launch.classList.remove('booting');\n  launch.classList.toggle('hidden', !open);\n  launch.setAttribute('aria-hidden', String(!open));\n  $('openLaunch').setAttribute('aria-expanded', String(open));\n  close.hidden = !returnable;\n  document.body.classList.toggle('launch-open', open);\n  if (open) requestAnimationFrame(() => $('newTitle').focus({ preventScroll: true }));\n  else if (launch.contains(document.activeElement)) $('openLaunch').focus({ preventScroll: true });\n}\n\n// td613 launch membrane state\nfunction openDb() {`;
const LAUNCH_HIDE_MARKER = "  $('launch').classList.add('hidden');";
const LAUNCH_FIRST_OPEN_MARKER = "    $('launch').classList.remove('hidden');";
const LAUNCH_FIRST_OPEN_BINDING = "    setLaunchOpen(true, { returnable: false });";
const LAUNCH_EVENT_MARKER = "  $('startDemo').addEventListener('click', () => act(() => createCase({ demo: true })));\n  $('newCase').addEventListener('click', () => act(() => createCase()));";
const LAUNCH_EVENT_BINDING = `${LAUNCH_EVENT_MARKER}\n  $('openLaunch').addEventListener('click', () => setLaunchOpen(true));\n  $('closeLaunch').addEventListener('click', () => { if (state.caseMap) setLaunchOpen(false); });`;
const VISIBILITY_MARKER = "  document.addEventListener('visibilitychange', () => { state.mapVisible = state.workspace === 'map' && !document.hidden; if (state.mapVisible) startScheduler(); else stopScheduler(); });";
const VISIBILITY_BINDING = `${VISIBILITY_MARKER}\n  document.addEventListener('keydown', event => {\n    if (event.key === 'Escape' && state.caseMap && !$('launch').classList.contains('hidden')) setLaunchOpen(false);\n  });`;
const BOOT_CATCH_MARKER = "boot().catch(error => { $('storageState').textContent = 'Local custody error'; console.error(error); });";
const BOOT_CATCH_BINDING = "boot().catch(error => { setLaunchOpen(true, { returnable: false }); $('storageState').textContent = 'Local custody error'; console.error(error); });";

function hold(error) {
  document.documentElement.dataset.ashDeliveryState = 'held';
  const status = document.getElementById('ashDeliveryStatus');
  if (status) status.textContent = `Ash Keep held at the document boundary: ${error?.message || String(error)}`;
  console.error('td613 ash keep static delivery held', error);
}

function replaceExactly(source, marker, replacement, label) {
  const count = source.split(marker).length - 1;
  if (count !== 1) throw new Error(`${label} expected exactly one marker; observed ${count}`);
  return source.replace(marker, replacement);
}

function governDocument(source) {
  let html = String(source || '');
  if (!html) throw new Error('Keep document source was empty');
  if (!html.includes('data-td613-ash-launch-membrane')) html = replaceExactly(html, '</head>', `${LAUNCH_MEMBRANE_STYLE}\n</head>`, 'Launch membrane style');
  if (!html.includes('id="openLaunch"')) html = replaceExactly(html, MAST_STATE_MARKER, MAST_STATE_BINDING, 'Case entry control');
  if (!html.includes('class="launch booting"')) html = replaceExactly(html, LAUNCH_ROOT_MARKER, LAUNCH_ROOT_BINDING, 'Boot-gated launch root');
  if (!html.includes('id="closeLaunch"')) html = replaceExactly(html, LAUNCH_PANEL_MARKER, LAUNCH_PANEL_BINDING, 'Return-to-case control');
  if (!html.includes('id="launchTitle"')) html = replaceExactly(html, LAUNCH_COPY_MARKER, LAUNCH_COPY_BINDING, 'Launch dialog labels');
  if (!html.includes('data-td613-ash-launch-membrane')) throw new Error('Governed document omitted launch membrane styles');
  if (!html.includes('id="openLaunch"') || !html.includes('id="closeLaunch"')) throw new Error('Governed document omitted launch controls');
  if (!html.includes('class="launch booting"')) throw new Error('Governed document omitted boot-gated launch state');
  return html;
}

function governCore(source) {
  let code = String(source || '');
  if (!code) throw new Error('Keep core source was empty');
  if (code.includes(DRAFT_MARKER)) {
    code = replaceExactly(code, DRAFT_MARKER, DRAFT_BINDING, 'Draft Case Map binding');
  } else if (!code.includes(DRAFT_BINDING)) {
    throw new Error('Draft Case Map binding marker is unavailable');
  }
  if (code.includes(SAVE_POINT_MARKER)) {
    code = replaceExactly(code, SAVE_POINT_MARKER, SAVE_POINT_BINDING, 'Save Point release binding');
  } else if (!code.includes(SAVE_POINT_BINDING)) {
    throw new Error('Save Point release binding marker is unavailable');
  }
  if (code.includes(CAPSULE_MARKER)) {
    code = replaceExactly(code, CAPSULE_MARKER, CAPSULE_BINDING, 'Capsule current Save Point binding');
  } else if (!code.includes(CAPSULE_BINDING)) {
    throw new Error('Capsule current Save Point binding marker is unavailable');
  }
  if (!code.includes('td613 lifecycle review refresh')) {
    code = replaceExactly(code, REVIEW_MARKER, REVIEW_BINDING, 'Draft review refresh');
  }
  if (!code.includes('td613 late workspace bridge')) {
    code = replaceExactly(code, WORKSPACE_MARKER, WORKSPACE_BINDING, 'Late workspace bridge');
  }
  if (!code.includes('td613 launch membrane state')) {
    code = replaceExactly(code, LAUNCH_STATE_MARKER, LAUNCH_STATE_BINDING, 'Launch state helper');
    const hideCount = code.split(LAUNCH_HIDE_MARKER).length - 1;
    if (hideCount !== 2) throw new Error(`Launch hide markers expected exactly two observations; observed ${hideCount}`);
    code = code.replaceAll(LAUNCH_HIDE_MARKER, '  setLaunchOpen(false);');
    code = replaceExactly(code, LAUNCH_FIRST_OPEN_MARKER, LAUNCH_FIRST_OPEN_BINDING, 'First-case launch state');
    code = replaceExactly(code, LAUNCH_EVENT_MARKER, LAUNCH_EVENT_BINDING, 'Launch controls');
    code = replaceExactly(code, VISIBILITY_MARKER, VISIBILITY_BINDING, 'Launch escape return');
    code = replaceExactly(code, BOOT_CATCH_MARKER, BOOT_CATCH_BINDING, 'Launch boot recovery');
  }
  if (!code.includes(DRAFT_BINDING)) throw new Error('Governed core omitted the Draft Case Map binding');
  if (!code.includes(SAVE_POINT_BINDING)) throw new Error('Governed core omitted the Save Point release binding');
  if (!code.includes(CAPSULE_BINDING)) throw new Error('Governed core omitted the Capsule current Save Point binding');
  if (!code.includes('td613 lifecycle review refresh')) throw new Error('Governed core omitted the lifecycle review refresh');
  if (!code.includes('td613 late workspace bridge')) throw new Error('Governed core omitted the late workspace capability');
  if (!code.includes('td613 launch membrane state')) throw new Error('Governed core omitted the launch membrane state helper');
  if (!code.includes("$('openLaunch').addEventListener")) throw new Error('Governed core omitted the returnable case-entry control');
  return code;
}

function inlineCore(source) {
  const safe = source.replace(/<\/script/gi, '<\\/script');
  return `<script type="module" data-td613-ash-core="governed-inline">\n${safe}\n</script>`;
}

async function receiveKeep() {
  const [documentResponse, coreResponse] = await Promise.all([
    fetch(SOURCE_ROUTE, { cache: 'no-store', credentials: 'same-origin', headers: { Accept: 'text/html' } }),
    fetch(CORE_SOURCE_ROUTE, { cache: 'no-store', credentials: 'same-origin', headers: { Accept: 'text/javascript' } })
  ]);
  if (!documentResponse.ok) throw new Error(`source response ${documentResponse.status}`);
  if (!coreResponse.ok) throw new Error(`core response ${coreResponse.status}`);
  let html = governDocument(await documentResponse.text());
  const governedCore = inlineCore(governCore(await coreResponse.text()));
  if (!html.includes(THEME_MARKER)) throw new Error('theme marker missing from static source');
  if (!html.includes(CORE_SCRIPT)) throw new Error('Keep core script missing from static source');
  html = html.replace(CORE_SCRIPT, governedCore);
  if (!html.includes(LIFECYCLE_META)) html = html.replace(THEME_MARKER, `${THEME_MARKER}\n  ${LIFECYCLE_META}`);
  if (!html.includes('/dome-world/ash-lifecycle.js')) {
    html = html.replace(governedCore, `${governedCore}\n  ${ARRIVAL_COMPATIBILITY_SCRIPT}\n  ${LIFECYCLE_SCRIPT}\n  ${WORKSPACE_BRIDGE_SCRIPT}`);
  } else if (!html.includes('/dome-world/ash-workspace-bridge.js')) {
    html = html.replace(LIFECYCLE_SCRIPT, `${LIFECYCLE_SCRIPT}\n  ${WORKSPACE_BRIDGE_SCRIPT}`);
  }
  const arrival = sessionStorage.getItem(READINESS_KEY) ? '?arrival=cleared' : '';
  history.replaceState(null, '', `${PUBLIC_ROUTE}${arrival}`);
  document.open('text/html', 'replace');
  document.write(html);
  document.close();
}

if (typeof document !== 'undefined') receiveKeep().catch(hold);

export { governCore, governDocument };
