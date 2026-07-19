import fs from 'node:fs';
import path from 'node:path';
import { stabilizeAshKeepSource } from '../app/dome-world/ash-keep-delivery-transform.js';

export const DOME_WORLD_SHELL_VERSION = 'td613.dome-world.shell/v1.4-lifecycle-cache-boundary';
export const MARROWLINE_LAB_ROUTE = '/dome-world/marrowline.html';
export const ASH_THRESHOLD_ROUTE = '/dome-world/ash-threshold.html';
export const ASH_LIFECYCLE_SHELL_CONTRACT = 'td613.ash.lifecycle-shell/v0.1';
export const ASH_KEEP_SHELL_VERSION = 'td613.ash-keep.shell/v0.3-lifecycle-cache-boundary';
export const ASH_KEEP_JS_SHELL_VERSION = 'td613.ash-keep.js-shell/v0.5-event-driven-map';
export const ASH_CACHE_TRANSITION_CONTRACT = 'td613.ash.cache-transition/v0.3-v7-readiness-boundary';
export const ASH_LIFECYCLE_ASSET_EPOCH = '20260718-canonical-membrane-v7-readiness-boundary';
export const ASH_LIFECYCLE_SOURCE_MODULE = '/dome-world/ash-lifecycle.js';
export const ASH_LIFECYCLE_MODULE = `${ASH_LIFECYCLE_SOURCE_MODULE}?v=${ASH_LIFECYCLE_ASSET_EPOCH}`;
export const ASH_WORKSPACE_BRIDGE_MODULE = '/dome-world/ash-workspace-bridge.js';
export const ASH_CANONICAL_MEMBRANE_EPOCH = '20260718-canonical-membrane-v6';

const DOME_SOURCE_PATH = path.join(process.cwd(), 'app', 'dome-world', 'index.html');
const ASH_KEEP_SOURCE_PATH = path.join(process.cwd(), 'app', 'dome-world', 'ash-keep.html');
const ASH_KEEP_JS_SOURCE_PATH = path.join(process.cwd(), 'app', 'dome-world', 'ash-keep.js');
const ASH_KEEP_ICON_MARKER = '<link rel="icon" href="data:,">';
const ASH_CANONICAL_BOOT_MARKER = '<meta name="ash-canonical-membrane" content="v1.0">';
const MARROWLINE_BUTTON = `<button class="lab-node lab-node-marrowline" type="button" data-tone="gold" data-glyph="∴" data-open-route="${MARROWLINE_LAB_ROUTE}" style="grid-column:span 8" onclick="window.location.assign('${MARROWLINE_LAB_ROUTE}')" aria-label="Open Marrowline Kʰonapolit terminal"><span class="lab-index">11</span><strong>Marrowline</strong><small>Kʰonapolit terminal / live ingress</small></button>`;
const ASH_TAB = `<button class="tab" data-view="ash" data-sigil="下"><small>04</small><span>Ash</span></button>`;

function canonicalAshBoot() {
  return `${ASH_CANONICAL_BOOT_MARKER}
  <style id="td613-ash-canonical-first-paint">
    html[data-ash-membrane-ready="false"] #launch{visibility:hidden!important;opacity:0!important}
    html[data-ash-membrane-ready="true"] #launch{visibility:visible!important;opacity:1!important}
    html[data-ash-session-open="true"] #launch{display:none!important}
    html[data-ash-session-open="false"] #launch:not(.hidden){display:flex!important}
    html,body{overflow-x:hidden!important;overscroll-behavior-y:auto!important;scroll-behavior:auto!important}
    body{overflow-y:auto!important;-webkit-overflow-scrolling:touch}
    #launch.launch{align-items:flex-start!important;justify-content:center!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior-y:auto!important;-webkit-overflow-scrolling:touch}
    #launch .launch-panel{max-height:none!important;overflow:visible!important;margin:auto!important}
    main,.workspace{overflow:visible!important}
    .map-stage canvas{touch-action:pan-y pinch-zoom!important}
  </style>
  <script id="td613-ash-canonical-first-paint-script">
  (()=>{try{
    const pointerKey='td613.ash-keep.current-case';
    const sessionKey='td613.ash.session.epoch';
    const epoch='${ASH_CANONICAL_MEMBRANE_EPOCH}';
    const pointer=localStorage.getItem(pointerKey);
    const sessionOpen=Boolean(pointer&&localStorage.getItem(sessionKey)===epoch);
    if(!sessionOpen){
      localStorage.removeItem(pointerKey);
      localStorage.removeItem(sessionKey);
      document.documentElement.classList.remove('ash-has-current-case');
    }
    document.documentElement.dataset.ashSessionOpen=String(sessionOpen);
    document.documentElement.dataset.ashMembraneReady='false';
    document.documentElement.dataset.ashCanonicalMembrane=epoch;
  }catch{
    document.documentElement.dataset.ashSessionOpen='false';
    document.documentElement.dataset.ashMembraneReady='false';
  }})();
  </script>`;
}

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
  const linkedTab = /<a class="tab" href="\/dome-world\/ash-threshold\.html" data-view="ash"[^>]*><small>04<\/small><span>Ash<\/span><\/a>/;
  if (linkedTab.test(html)) html = html.replace(linkedTab, ASH_TAB);
  if (!html.includes(ASH_TAB)) throw new Error('dome-world-ash-tab-marker-missing');
  if (!html.includes('data-ash-threshold-membrane')) throw new Error('dome-world-ash-membrane-marker-missing');
  if (!html.includes(`data-ash-threshold-enter href="${ASH_THRESHOLD_ROUTE}"`)) throw new Error('dome-world-ash-entry-marker-missing');
  if (html.includes('<h2>Ash Readiness</h2>')) throw new Error('dome-world-visible-readiness-title-survived');
  return html;
}

export function injectAshKeepLifecycle(source = '') {
  let html = String(source || '');
  if (!html) throw new Error('ash-keep-source-empty');
  const headClose = html.indexOf('</head>');
  if (headClose < 0) throw new Error('ash-keep-head-marker-missing');

  const additions = [];
  if (!html.includes(ASH_KEEP_ICON_MARKER)) additions.push(ASH_KEEP_ICON_MARKER);
  if (!html.includes(ASH_CANONICAL_BOOT_MARKER)) additions.push(canonicalAshBoot());
  if (additions.length) html = `${html.slice(0, headClose)}  ${additions.join('\n  ')}\n${html.slice(headClose)}`;

  if (!html.includes(ASH_LIFECYCLE_MODULE)) {
    const lifecycleCount = html.split(ASH_LIFECYCLE_SOURCE_MODULE).length - 1;
    if (lifecycleCount !== 1) throw new Error(`ash-lifecycle-source-module-count:${lifecycleCount}`);
    html = html.replace(ASH_LIFECYCLE_SOURCE_MODULE, ASH_LIFECYCLE_MODULE);
  }

  const ordered = ['/dome-world/ash-keep.js', '/dome-world/ash-convergence.js', ASH_LIFECYCLE_MODULE, ASH_WORKSPACE_BRIDGE_MODULE, '/dome-world/ash-case-controls.js'];
  if (!html.includes('name="ash-lifecycle" content="v0.1"')) throw new Error('ash-lifecycle-meta-missing');
  if (!html.includes('name="ash-constitutional-composition" content="v0.1"')) throw new Error('ash-composition-meta-missing');
  if (!html.includes(ASH_KEEP_ICON_MARKER)) throw new Error('ash-keep-explicit-icon-boundary-missing');
  if (!html.includes(ASH_CANONICAL_BOOT_MARKER)) throw new Error('ash-canonical-membrane-first-paint-missing');
  let cursor = -1;
  for (const module of ordered) {
    const index = html.indexOf(module);
    if (index < 0) throw new Error(`ash-canonical-module-missing:${module}`);
    if (index <= cursor) throw new Error(`ash-canonical-module-order-invalid:${module}`);
    cursor = index;
  }
  if (html.includes(`src="${ASH_LIFECYCLE_SOURCE_MODULE}"`)) throw new Error('ash-lifecycle-unversioned-module-survived');
  if (html.includes('surface=ash-keep-js')) throw new Error('ash-keep-still-depends-on-rewritten-core');
  return html;
}

export function bindAshDraftsToCaseMap(source = '') {
  const code = stabilizeAshKeepSource(source);
  for (const marker of [
    'caseMapDigest: state.caseMap.case_map_digest',
    'releaseReceiptReference: state.latestRelease?.receipt_id || null',
    'releaseReceiptDigest: state.latestRelease?.receipt_digest || null',
    'latestSavePoint.release_receipt_reference !== currentRelease.receipt_id',
    'A current Release Receipt is required before Capsule export.',
    'window.__td613OpenAshWorkspace = setWorkspace',
    "mode: 'EVENT_DRIVEN_COALESCED'"
  ]) if (!code.includes(marker)) throw new Error(`ash-native-core-binding-missing:${marker}`);
  if (code.includes('location.reload()')) throw new Error('ash-native-core-contains-forced-reload');
  if (code.includes('state.frame = scheduleFrame(frame);')) throw new Error('ash-native-core-perpetual-scheduler-survived');
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
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader(definition.header[0], definition.header[1]);
  res.setHeader('X-TD613-Ash-Lifecycle', ASH_LIFECYCLE_SHELL_CONTRACT);
  res.setHeader('X-TD613-Ash-Lifecycle-Asset', ASH_LIFECYCLE_ASSET_EPOCH);
  res.setHeader('X-TD613-Ash-Canonical-Membrane', ASH_CANONICAL_MEMBRANE_EPOCH);
  res.end(body);
}

function sendCacheEviction(res, method) {
  const body = JSON.stringify({
    ok:true,
    schema:'td613.ash.cache-transition-response/v0.4-v7-readiness-boundary',
    scope:'HTTP_CACHE_ONLY',
    indexeddb_preserved:true,
    case_data_preserved:true,
    active_session_reset_by_client:true,
    physical_erasure_verified:false,
    contract:ASH_CACHE_TRANSITION_CONTRACT,
    lifecycle_asset_epoch:ASH_LIFECYCLE_ASSET_EPOCH
  });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
  res.setHeader('Clear-Site-Data', '"cache"');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-TD613-Ash-Cache-Transition', ASH_CACHE_TRANSITION_CONTRACT);
  res.setHeader('X-TD613-Ash-Lifecycle', ASH_LIFECYCLE_SHELL_CONTRACT);
  res.setHeader('X-TD613-Ash-Lifecycle-Asset', ASH_LIFECYCLE_ASSET_EPOCH);
  res.setHeader('X-TD613-Ash-Canonical-Membrane', ASH_CANONICAL_MEMBRANE_EPOCH);
  res.end(method === 'HEAD' ? '' : body);
}

export default function handler(req, res) {
  const method = String(req.method || 'GET').toUpperCase();
  const surface = requestedSurface(req);
  if (!['GET', 'HEAD'].includes(method)) {
    res.setHeader('Allow', 'GET, HEAD');
    send(res, 405, 'Method Not Allowed', surfaceDefinition(surface === 'cache-evict' ? 'dome-world' : surface));
    return;
  }
  if (surface === 'cache-evict') {
    sendCacheEviction(res, method);
    return;
  }
  const definition = surfaceDefinition(surface);
  try {
    const source = fs.readFileSync(definition.path, 'utf8');
    const rendered = definition.transform(source);
    send(res, 200, method === 'HEAD' ? '' : rendered, definition);
  } catch (error) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.statusCode = 500;
    res.end(JSON.stringify({ ok:false, error:'dome-world-shell-surface-unavailable', surface, detail:String(error?.message || error), version:DOME_WORLD_SHELL_VERSION, ashLifecycle:ASH_LIFECYCLE_SHELL_CONTRACT }));
  }
}
