const PUBLIC_ROUTE = globalThis.document?.documentElement?.dataset?.ashPublicRoute || '/dome-world/ash-keep.html';
const SOURCE_ROUTE = '/dome-world/ash-keep-source.html?delivery=td613-static-v0.1';
const CORE_SOURCE_ROUTE = '/dome-world/ash-keep.js?delivery=td613-static-core-v0.1';
const READINESS_KEY = 'td613:ash-threshold:readiness:v0.1';
const THEME_MARKER = '<meta name="theme-color" content="#04130f">';
const CORE_SCRIPT = '<script type="module" src="/dome-world/ash-keep.js"></script>';
const LIFECYCLE_META = '<meta name="ash-lifecycle" content="v0.1">';
const LIFECYCLE_SCRIPT = '<script type="module" src="/dome-world/ash-lifecycle.js"></script>';
const WORKSPACE_BRIDGE_SCRIPT = '<script type="module" src="/dome-world/ash-workspace-bridge.js"></script>';
const ARRIVAL_COMPATIBILITY_SCRIPT = `<script>/* td613 arrival-route compatibility: static document first, history annotation only */if(sessionStorage.getItem('${READINESS_KEY}')&&location.search!=='?arrival=cleared'){history.replaceState(null,'',location.pathname+'?arrival=cleared')}</script>`;
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
  const html = String(source || '');
  if (!html) throw new Error('Keep document source was empty');
  if (!html.includes('class="launch" id="launch" role="dialog"')) throw new Error('Keep document omitted its case-entry membrane');
  for (const control of ['id="startDemo"', 'id="newCase"', 'id="saveCase"', 'id="closeCase"']) {
    if (!html.includes(control)) throw new Error(`Keep document omitted ${control}`);
  }
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
  if (!code.includes(DRAFT_BINDING)) throw new Error('Governed core omitted the Draft Case Map binding');
  if (!code.includes(SAVE_POINT_BINDING)) throw new Error('Governed core omitted the Save Point release binding');
  if (!code.includes(CAPSULE_BINDING)) throw new Error('Governed core omitted the Capsule current Save Point binding');
  if (!code.includes('td613 lifecycle review refresh')) throw new Error('Governed core omitted the lifecycle review refresh');
  if (!code.includes('td613 late workspace bridge')) throw new Error('Governed core omitted the late workspace capability');
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
