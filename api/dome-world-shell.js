import fs from 'node:fs';
import path from 'node:path';

export const DOME_WORLD_SHELL_VERSION = 'td613.dome-world.shell/v1.1-marrowline-desktop-span';
export const MARROWLINE_LAB_ROUTE = '/dome-world/marrowline.html';
export const ASH_THRESHOLD_ROUTE = '/dome-world/ash-threshold.html';
export const ASH_KEEP_ENTRY_ROUTE = '/dome-world/ash-keep-entry.html';
export const ASH_LIFECYCLE_SHELL_CONTRACT = 'td613.ash.lifecycle-shell/v0.1';
export const ASH_KEEP_SHELL_VERSION = 'td613.ash-keep.shell/v0.1';
export const ASH_KEEP_JS_SHELL_VERSION = 'td613.ash-keep.js-shell/v0.2-review-refresh';
export const ASH_LIFECYCLE_MODULE = '/dome-world/ash-lifecycle.js';
export const ASH_WORKSPACE_BRIDGE_MODULE = '/dome-world/ash-workspace-bridge.js';

const DOME_SOURCE_PATH = path.join(process.cwd(), 'app', 'dome-world', 'index.html');
const ASH_KEEP_SOURCE_PATH = path.join(process.cwd(), 'app', 'dome-world', 'ash-keep.html');
const ASH_KEEP_JS_SOURCE_PATH = path.join(process.cwd(), 'app', 'dome-world', 'ash-keep.js');
const MARROWLINE_BUTTON = `<button class="lab-node lab-node-marrowline" type="button" data-tone="gold" data-glyph="∴" data-open-route="${MARROWLINE_LAB_ROUTE}" style="grid-column:span 8" onclick="window.location.assign('${MARROWLINE_LAB_ROUTE}')" aria-label="Open Marrowline Kʰonapolit terminal"><span class="lab-index">11</span><strong>Marrowline</strong><small>Kʰonapolit terminal / live ingress</small></button>`;
const ASH_TAB = `<a class="tab" href="${ASH_THRESHOLD_ROUTE}" data-view="ash" data-sigil="下" style="text-decoration:none"><small>04</small><span>Ash</span></a>`;
const ASH_COMPATIBILITY_SECTION = `<section id="ash" class="view primary-view" data-glyph="下"><div class="view-intro"><div><div class="view-overline">下 / custody begins after the threshold</div><h2>Ash Threshold</h2><p>Clear arrival, boundary, and custody as distinct laws, then enter Ash Keep. Quick Scan remains a readiness operation inside the Keep; custody becomes the case root.</p></div><div class="view-telemetry"><span><b>0</b>raw text</span><span><b>SESSION</b>readiness</span><span><b>KEEP</b>primary</span></div></div><div class="grid"><div class="panel"><h3>Enter the Ash lifecycle</h3><p class="sub">The threshold performs no custody registration. Ash Keep binds a verified root into the Case Map and carries it through Rebuild, Draft, Release, Save Point, and Capsule.</p><div class="actions"><a class="btn primary" href="${ASH_THRESHOLD_ROUTE}">Enter Ash</a><a class="btn" href="/dome-world/ash-keep.html">Open existing Keep</a></div><p class="claim">Arrival ≠ consent; readiness ≠ custody; custody ≠ authenticity; continuity ≠ transport.</p></div><aside class="panel rel"><canvas id="ashCanvas" aria-label="Ash custody threshold field"></canvas><div class="legend"><span style="color:var(--cyan)">△ arrival boundary</span><br><span style="color:var(--gold)">◇ custody root</span><br><span style="color:var(--rose)">● held transition</span><br><span style="color:var(--violet)">∙ Quick Scan compatibility</span></div></aside></div><div hidden aria-hidden="true"><input id="ashArtifactId"><select id="ashClass"><option>sensitive-document</option></select><input id="ashMediaType" value="application/octet-stream"><input id="ashByteLength"><button id="runAsh"></button><button id="copyAsh"></button><button id="downloadAsh"></button></div><pre id="ashPre" hidden></pre></section>`;
const CORE_SCRIPT = '<script type="module" src="/dome-world/ash-keep.js"></script>';
const SERVED_CORE_SCRIPT = '<script type="module" src="/api/dome-world-shell?surface=ash-keep-js"></script>';
const LIFECYCLE_SCRIPT = `<script type="module" src="${ASH_LIFECYCLE_MODULE}"></script>`;
const WORKSPACE_BRIDGE_SCRIPT = `<script type="module" src="${ASH_WORKSPACE_BRIDGE_MODULE}"></script>`;
const ARRIVAL_COMPATIBILITY_SCRIPT = `<script>/* td613 arrival-route compatibility: composed shell first, history annotation only */if(sessionStorage.getItem('td613:ash-threshold:readiness:v0.1')&&(location.pathname!=='/dome-world/ash-keep.html'||location.search!=='?arrival=cleared')){history.replaceState(null,'','/dome-world/ash-keep.html?arrival=cleared')}</script>`;
const DRAFT_MARKER = '    caseId: state.caseMap.case_id,\n    body: $(\'draftBody\').value,';
const DRAFT_BINDING = '    caseId: state.caseMap.case_id,\n    caseMapDigest: state.caseMap.case_map_digest,\n    body: $(\'draftBody\').value,';
const REVIEW_MARKER = "  await put('reviews', state.latestReview, state.latestReview.review_id);\n  renderDraft();";
const REVIEW_BINDING = "  await put('reviews', state.latestReview, state.latestReview.review_id);\n  renderDraft();\n  setTimeout(() => location.reload(), 160); // td613 lifecycle review refresh";
const WORKSPACE_MARKER = "function setWorkspace(name) {\n  state.workspace = name;\n  qsa('.work-tab').forEach(button => button.setAttribute('aria-selected', String(button.dataset.workspace === name)));\n  qsa('.workspace').forEach(panel => panel.classList.toggle('active', panel.id === `workspace-${name}`));\n  state.mapVisible = name === 'map' && !document.hidden;\n  const prefs = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}');\n  localStorage.setItem(PREFS_KEY, JSON.stringify({ ...prefs, workspace: name, mapMode: state.mapMode }));\n  if (state.mapVisible) startScheduler(); else stopScheduler();\n}";
const WORKSPACE_BINDING = `${WORKSPACE_MARKER}\n\nwindow.__td613OpenAshWorkspace = setWorkspace; // td613 late workspace bridge`;

export function injectMarrowlineLabButton(source = '') {
  const html = String(source || '');
  if (!html) throw new Error('dome-world-source-empty');
  if (html.includes(`data-open-route="${MARROWLINE_LAB_ROUTE}"`)) return html;
  const stationCount = '<span><b>10</b>stations</span>';
  const interfaceBus = /<button class="lab-node" data-open-view="api"[\s\S]*?<\/button>/;
  if (!html.includes(stationCount)) throw new Error('dome-world-lab-station-count-marker-missing');
  if (!interfaceBus.test(html)) throw new Error('dome-world-interface-bus-marker-missing');
  return html.replace(stationCount, '<span><b>11</b>stations</span>').replace(interfaceBus, button => `${button}${MARROWLINE_BUTTON}`);
}

export function injectAshLifecycleEntry(source = '') {
  let html = String(source || '');
  if (!html) throw new Error('dome-world-source-empty');
  const oldTab = '<button class="tab" data-view="ash" data-sigil="下"><small>04</small><span>Ash</span></button>';
  if (html.includes(oldTab)) html = html.replace(oldTab, ASH_TAB);
  if (!html.includes(`href="${ASH_THRESHOLD_ROUTE}" data-view="ash"`)) throw new Error('dome-world-ash-tab-marker-missing');
  const ashSection = /<section id="ash" class="view primary-view" data-glyph="下">[\s\S]*?<\/section>/;
  if (!html.includes('<h2>Ash Threshold</h2>')) {
    if (!ashSection.test(html)) throw new Error('dome-world-ash-section-marker-missing');
    html = html.replace(ashSection, ASH_COMPATIBILITY_SECTION);
  }
  html = html.replace("ash:'Ash / readiness membrane'", "ash:'Ash / custody threshold'");
  if (html.includes('<h2>Ash Readiness</h2>')) throw new Error('dome-world-visible-readiness-title-survived');
  return html;
}

export function injectAshKeepLifecycle(source = '') {
  let html = String(source || '');
  if (!html) throw new Error('ash-keep-source-empty');
  if (!html.includes('name="ash-lifecycle"')) {
    const marker = '<meta name="theme-color" content="#04130f">';
    if (!html.includes(marker)) throw new Error('ash-keep-theme-marker-missing');
    html = html.replace(marker, `${marker}\n  <meta name="ash-lifecycle" content="v0.1">`);
  }
  if (!html.includes(ASH_LIFECYCLE_MODULE)) {
    if (!html.includes(CORE_SCRIPT)) throw new Error('ash-keep-core-script-marker-missing');
    html = html.replace(CORE_SCRIPT, `${SERVED_CORE_SCRIPT}\n  ${ARRIVAL_COMPATIBILITY_SCRIPT}\n  ${LIFECYCLE_SCRIPT}\n  ${WORKSPACE_BRIDGE_SCRIPT}`);
  } else if (!html.includes('td613 arrival-route compatibility')) {
    html = html.replace(SERVED_CORE_SCRIPT, `${SERVED_CORE_SCRIPT}\n  ${ARRIVAL_COMPATIBILITY_SCRIPT}`);
  }
  if (!html.includes(ASH_WORKSPACE_BRIDGE_MODULE)) {
    if (!html.includes(LIFECYCLE_SCRIPT)) throw new Error('ash-lifecycle-script-marker-missing');
    html = html.replace(LIFECYCLE_SCRIPT, `${LIFECYCLE_SCRIPT}\n  ${WORKSPACE_BRIDGE_SCRIPT}`);
  }
  if (html.indexOf(ASH_LIFECYCLE_MODULE) < html.indexOf('surface=ash-keep-js')) throw new Error('ash-lifecycle-loaded-before-keep-core');
  if (html.indexOf(ASH_WORKSPACE_BRIDGE_MODULE) < html.indexOf(ASH_LIFECYCLE_MODULE)) throw new Error('ash-workspace-bridge-loaded-before-lifecycle');
  return html;
}

export function bindAshDraftsToCaseMap(source = '') {
  let code = String(source || '');
  if (!code) throw new Error('ash-keep-js-source-empty');
  if (code.includes(DRAFT_MARKER)) {
    code = code.replace(DRAFT_MARKER, DRAFT_BINDING);
  } else if (!code.includes(DRAFT_BINDING)) {
    throw new Error('ash-keep-draft-marker-missing');
  }
  if (!code.includes('td613 lifecycle review refresh')) {
    if (!code.includes(REVIEW_MARKER)) throw new Error('ash-keep-review-marker-missing');
    code = code.replace(REVIEW_MARKER, REVIEW_BINDING);
  }
  if (!code.includes('td613 late workspace bridge')) {
    if (!code.includes(WORKSPACE_MARKER)) throw new Error('ash-keep-workspace-marker-missing');
    code = code.replace(WORKSPACE_MARKER, WORKSPACE_BINDING);
  }
  return code;
}

export function renderDomeWorldShell(source = '') {
  return injectAshLifecycleEntry(injectMarrowlineLabButton(source));
}

function requestedSurface(req) {
  const direct = Array.isArray(req.query?.surface) ? req.query.surface[0] : req.query?.surface;
  if (direct) return String(direct);
  try {
    const requestUrl = new URL(req.url || '/', 'http://localhost');
    if (requestUrl.searchParams.get('arrival') === 'cleared' || req.query?.arrival === 'cleared') return 'ash-keep-html';
    return requestUrl.searchParams.get('surface') || 'dome-world';
  } catch {
    return req.query?.arrival === 'cleared' ? 'ash-keep-html' : 'dome-world';
  }
}

function surfaceDefinition(surface) {
  if (surface === 'ash-keep-html') return { path: ASH_KEEP_SOURCE_PATH, contentType: 'text/html; charset=utf-8', header: ['X-TD613-Ash-Keep-Shell', ASH_KEEP_SHELL_VERSION], transform: injectAshKeepLifecycle };
  if (surface === 'ash-keep-js') return { path: ASH_KEEP_JS_SOURCE_PATH, contentType: 'text/javascript; charset=utf-8', header: ['X-TD613-Ash-Keep-JS-Shell', ASH_KEEP_JS_SHELL_VERSION], transform: bindAshDraftsToCaseMap };
  return { path: DOME_SOURCE_PATH, contentType: 'text/html; charset=utf-8', header: ['X-TD613-Dome-Shell', DOME_WORLD_SHELL_VERSION], transform: renderDomeWorldShell };
}

function send(res, status, body = '', definition = surfaceDefinition('dome-world')) {
  res.statusCode = status;
  res.setHeader('Content-Type', definition.contentType);
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader(definition.header[0], definition.header[1]);
  res.setHeader('X-TD613-Ash-Lifecycle', ASH_LIFECYCLE_SHELL_CONTRACT);
  res.end(body);
}

function redirectAshKeepDocument(res, method) {
  res.statusCode = 307;
  res.setHeader('Location', ASH_KEEP_ENTRY_ROUTE);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-TD613-Ash-Keep-Shell', ASH_KEEP_SHELL_VERSION);
  res.setHeader('X-TD613-Ash-Lifecycle', ASH_LIFECYCLE_SHELL_CONTRACT);
  res.end(method === 'HEAD' ? '' : 'Ash Keep document delivery continues through the static adapter.');
}

export default function handler(req, res) {
  const method = String(req.method || 'GET').toUpperCase();
  const surface = requestedSurface(req);
  const definition = surfaceDefinition(surface);
  if (!['GET', 'HEAD'].includes(method)) {
    res.setHeader('Allow', 'GET, HEAD');
    send(res, 405, 'Method Not Allowed', definition);
    return;
  }
  if (surface === 'ash-keep-html') {
    redirectAshKeepDocument(res, method);
    return;
  }
  try {
    const source = fs.readFileSync(definition.path, 'utf8');
    const rendered = definition.transform(source);
    send(res, 200, method === 'HEAD' ? '' : rendered, definition);
  } catch (error) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, error: 'dome-world-shell-surface-unavailable', surface, detail: String(error?.message || error), version: DOME_WORLD_SHELL_VERSION, ashLifecycle: ASH_LIFECYCLE_SHELL_CONTRACT }));
  }
}
