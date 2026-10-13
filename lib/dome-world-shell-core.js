import fs from 'node:fs';
import path from 'node:path';
import { stabilizeAshKeepSource } from '../app/dome-world/ash-keep-delivery-transform.js';
import handleSiteEpochReset from './site-epoch-reset.js';

export const DOME_WORLD_SHELL_VERSION = 'td613.dome-world.shell/v1.8-eviction-retired';
export const MARROWLINE_LAB_ROUTE = '/dome-world/marrowline.html';
export const ASH_THRESHOLD_ROUTE = '/dome-world/ash-threshold.html';
export const ASH_LIFECYCLE_SHELL_CONTRACT = 'td613.ash.lifecycle-shell/v0.1';
export const ASH_KEEP_SHELL_VERSION = 'td613.ash-keep.shell/v0.6-first-paint';
export const ASH_KEEP_JS_SHELL_VERSION = 'td613.ash-keep.js-shell/v0.5-event-driven-map';
export const ASH_CACHE_TRANSITION_CONTRACT = 'td613.ash.cache-transition/retired-site-epoch-authority';
export const ASH_LIFECYCLE_ASSET_EPOCH = '20260724-a12-release-v1';
export const ASH_LIFECYCLE_SOURCE_MODULE = '/dome-world/ash-lifecycle.js';
export const ASH_LIFECYCLE_MODULE = `${ASH_LIFECYCLE_SOURCE_MODULE}?v=${ASH_LIFECYCLE_ASSET_EPOCH}`;
export const ASH_WORKSPACE_BRIDGE_MODULE = '/dome-world/ash-workspace-bridge.js';
export const ASH_CANONICAL_MEMBRANE_EPOCH = '20260718-canonical-membrane-v6';
export const ASH_EVICTION_POSTURE = 'RETIRED_SITE_EPOCH_AUTHORITY';

const DOME_SOURCE_PATH = path.join(process.cwd(), 'app', 'dome-world', 'index.html');
const ASH_KEEP_SOURCE_PATH = path.join(process.cwd(), 'app', 'dome-world', 'ash-keep.html');
const ASH_KEEP_JS_SOURCE_PATH = path.join(process.cwd(), 'app', 'dome-world', 'ash-keep.js');
const ASH_KEEP_ICON_MARKER = '<link rel="icon" href="data:,">';
const ASH_CANONICAL_LINK_MARKER = '<link rel="canonical" href="/dome-world/ash-threshold.html">';
const ASH_CANONICAL_BOOT_MARKER = '<meta name="ash-canonical-membrane" content="v1.0">';
const ASH_CACHE_PREFLIGHT_MARKER = '<meta name="ash-cache-preflight" content="retired-site-epoch-authority">';
const SITE_RESET_BOOT = '<script id="td613-sitewide-reset-preflight" src="/site-epoch-preflight.js?v=20260927-v1"></script>';
const ASH_BOOTSTRAP_MARKER = 'td613-ash-canonical-module-bootstrap';
const ASH_PREPARING_SHELL = '<div id="td613-ash-preparing-shell" role="status" aria-live="polite"><strong>Preparing Ash</strong><span>Preserving local cases while the current instrument resolves.</span></div>';
const MARROWLINE_BUTTON = `<button class="lab-node lab-node-marrowline" type="button" data-tone="gold" data-glyph="∴" data-open-route="${MARROWLINE_LAB_ROUTE}" style="grid-column:span 8" onclick="window.location.assign('${MARROWLINE_LAB_ROUTE}')" aria-label="Open Marrowline Kʰonapolit terminal"><span class="lab-index">11</span><strong>Marrowline</strong><small>Kʰonapolit terminal / live ingress</small></button>`;
const ASH_TAB = `<button class="tab" data-view="ash" data-sigil="下"><small>04</small><span>Ash</span></button>`;

const ASH_VERSIONED_MODULES = Object.freeze([
  ['/dome-world/ash-keep.js', `/dome-world/ash-keep.js?v=${ASH_LIFECYCLE_ASSET_EPOCH}`],
  ['/dome-world/ash-convergence.js', `/dome-world/ash-convergence.js?v=${ASH_LIFECYCLE_ASSET_EPOCH}`],
  [ASH_LIFECYCLE_SOURCE_MODULE, ASH_LIFECYCLE_MODULE],
  [ASH_WORKSPACE_BRIDGE_MODULE, `${ASH_WORKSPACE_BRIDGE_MODULE}?v=${ASH_LIFECYCLE_ASSET_EPOCH}`],
  ['/dome-world/ash-case-controls.js', `/dome-world/ash-case-controls.js?v=${ASH_LIFECYCLE_ASSET_EPOCH}`],
  ['/dome-world/ash-a7-a11-recompiler-core.js', `/dome-world/ash-a7-a11-recompiler-core.js?v=${ASH_LIFECYCLE_ASSET_EPOCH}`],
  ['/dome-world/ash-a7-home-recompilation.js', `/dome-world/ash-a7-home-recompilation.js?v=${ASH_LIFECYCLE_ASSET_EPOCH}`],
  ['/dome-world/ash-a8-case-map-recompilation.js', `/dome-world/ash-a8-case-map-recompilation.js?v=${ASH_LIFECYCLE_ASSET_EPOCH}`]
]);

function cachePreflightBoot() {
  return `${ASH_CACHE_PREFLIGHT_MARKER}
  <style id="td613-ash-cache-preflight-style">
    #td613-ash-preparing-shell{position:fixed;inset:0;z-index:2147483647;display:grid;place-content:center;gap:8px;padding:24px;background:#010806;color:#fff8da;text-align:center;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
    #td613-ash-preparing-shell strong{font:600 clamp(1.35rem,4vw,2rem)/1.15 Georgia,serif}
    #td613-ash-preparing-shell span{color:#76ead4;font-size:.78rem;line-height:1.55}
    html[data-ash-cache-preflight="complete"] #td613-ash-preparing-shell{display:none!important}
  </style>
  <script id="td613-ash-cache-preflight-script">
  (()=>{
    const incoming=new URL(location.href);
    const legacyPresentation=incoming.searchParams.get('presentation')==='legacy';
    const canonicalPath=${JSON.stringify(ASH_THRESHOLD_ROUTE)};
    const assetEpoch=${JSON.stringify(ASH_LIFECYCLE_ASSET_EPOCH)};
    const receiptKey='td613.ash.cache-preflight.receipt';
    document.title='TD613 Ash';
    if(location.pathname!==canonicalPath||location.search){history.replaceState(null,'',canonicalPath+location.hash)}
    document.documentElement.dataset.ashCanonicalUrl='true';
    document.documentElement.dataset.ashCachePreflight='complete';
    window.__td613AshFirstPaintWitness=Object.freeze({
      schema:'td613.ash.first-paint-witness/v0.2-eviction-retired',
      title:document.title,
      url:location.pathname+location.search,
      preparing_shell_present:true,
      legacy_composition_visible:false,
      epoch_query_visible:false
    });
    const receipt=Object.freeze({
      schema:'td613.ash.cache-preflight-receipt/v0.4-retired',
      epoch:'RETIRED_SITE_EPOCH_AUTHORITY',
      asset_epoch:assetEpoch,
      performed:false,
      retired:true,
      sitewide_epoch_authoritative:true,
      legacy_reset_suppressed:true,
      legacy_bypass:legacyPresentation,
      indexeddb_preserved:true,
      case_data_preserved:true,
      active_session_reset:false,
      local_case_pointer_preserved:true,
      visible_url:canonicalPath
    });
    try{sessionStorage.setItem(receiptKey,JSON.stringify(receipt))}catch{}
    window.__td613AshAia3PreflightReceipt=receipt;
    window.__td613AshAia3Preflight=Promise.resolve(receipt);
  })();
  </script>`;
}

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
    const epoch=${JSON.stringify(ASH_CANONICAL_MEMBRANE_EPOCH)};
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

function canonicalModuleBootstrap() {
  const modules = ASH_VERSIONED_MODULES.map(([, versioned]) => versioned);
  return `<script type="module" id="${ASH_BOOTSTRAP_MARKER}">
    const receipt=await globalThis.__td613AshAia3Preflight;
    const modules=${JSON.stringify(modules)};
    for(const moduleUrl of modules){await import(moduleUrl)}
    document.documentElement.dataset.ashModuleGraph='ready';
    document.documentElement.dataset.ashCachePreflight='complete';
    globalThis.dispatchEvent(new CustomEvent('td613:ash:canonical-module-graph-ready',{detail:{schema:'td613.ash.canonical-module-graph/v0.1',module_count:modules.length,asset_epoch:${JSON.stringify(ASH_LIFECYCLE_ASSET_EPOCH)},preflight_performed:Boolean(receipt?.performed)}}));
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
  if (html.includes(`id="${ASH_BOOTSTRAP_MARKER}"`)) return html;
  const headClose = html.indexOf('</head>');
  if (headClose < 0) throw new Error('ash-keep-head-marker-missing');
  html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>TD613 Ash</title>');

  const additions = [];
  if (!html.includes('id="td613-sitewide-reset-preflight"')) additions.push(SITE_RESET_BOOT);
  if (!html.includes(ASH_KEEP_ICON_MARKER)) additions.push(ASH_KEEP_ICON_MARKER);
  if (!html.includes(ASH_CANONICAL_LINK_MARKER)) additions.push(ASH_CANONICAL_LINK_MARKER);
  if (!html.includes(ASH_CACHE_PREFLIGHT_MARKER)) additions.push(cachePreflightBoot());
  if (!html.includes(ASH_CANONICAL_BOOT_MARKER)) additions.push(canonicalAshBoot());
  if (additions.length) html = `${html.slice(0, headClose)}  ${additions.join('\n  ')}\n${html.slice(headClose)}`;

  if (!html.includes('id="td613-ash-preparing-shell"')) {
    html = html.replace(/<body([^>]*)>/, `<body$1>\n  ${ASH_PREPARING_SHELL}`);
  }

  for (const [sourceModule] of ASH_VERSIONED_MODULES) {
    const sourceTag = `<script type="module" src="${sourceModule}"></script>`;
    if (!html.includes(sourceTag)) throw new Error(`ash-canonical-module-source-missing:${sourceModule}`);
    html = html.replace(sourceTag, '');
  }
  if (!html.includes('</body>')) throw new Error('ash-keep-body-marker-missing');
  html = html.replace('</body>', `  ${canonicalModuleBootstrap()}\n</body>`);

  const ordered = ASH_VERSIONED_MODULES.map(([, versioned]) => versioned);
  if (!html.includes('name="ash-lifecycle" content="v0.1"')) throw new Error('ash-lifecycle-meta-missing');
  if (!html.includes('name="ash-constitutional-composition" content="v0.1"')) throw new Error('ash-composition-meta-missing');
  if (!html.includes(ASH_KEEP_ICON_MARKER)) throw new Error('ash-keep-explicit-icon-boundary-missing');
  if (!html.includes(ASH_CACHE_PREFLIGHT_MARKER)) throw new Error('ash-cache-compat-preflight-missing');
  if (!html.includes(ASH_CANONICAL_BOOT_MARKER)) throw new Error('ash-canonical-membrane-first-paint-missing');
  if (!html.includes('<title>TD613 Ash</title>')) throw new Error('ash-canonical-title-missing');
  let cursor = -1;
  for (const module of ordered) {
    const index = html.indexOf(module);
    if (index < 0) throw new Error(`ash-canonical-module-missing:${module}`);
    if (index <= cursor) throw new Error(`ash-canonical-module-order-invalid:${module}`);
    cursor = index;
  }
  for (const [sourceModule] of ASH_VERSIONED_MODULES) {
    if (html.includes(`src="${sourceModule}"`)) throw new Error(`ash-unversioned-module-survived:${sourceModule}`);
  }
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
    if (requestUrl.pathname === ASH_THRESHOLD_ROUTE || requestUrl.pathname === '/dome-world/ash-keep.html') return 'ash-keep-html';
    return requestUrl.searchParams.get('surface') || 'dome-world';
  } catch {
    return 'dome-world';
  }
}

function surfaceDefinition(surface) {
  if (surface === 'ash-keep-html') return { path:ASH_KEEP_SOURCE_PATH, contentType:'text/html; charset=utf-8', header:['X-TD613-Ash-Keep-Shell', ASH_KEEP_SHELL_VERSION], transform:injectAshKeepLifecycle };
  if (surface === 'ash-keep-js') return { path:ASH_KEEP_JS_SOURCE_PATH, contentType:'text/javascript; charset=utf-8', header:['X-TD613-Ash-Keep-JS-Shell', ASH_KEEP_JS_SHELL_VERSION], transform:bindAshDraftsToCaseMap };
  return { path:DOME_SOURCE_PATH, contentType:'text/html; charset=utf-8', header:['X-TD613-Dome-Shell', DOME_WORLD_SHELL_VERSION], transform:renderDomeWorldShell };
}

function send(res, status, body = '', definition = surfaceDefinition('dome-world')) {
  res.statusCode = status;
  res.setHeader('Content-Type', definition.contentType);
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader(definition.header[0], definition.header[1]);
  res.setHeader('X-TD613-Ash-Lifecycle', ASH_LIFECYCLE_SHELL_CONTRACT);
  res.setHeader('X-TD613-Ash-Lifecycle-Asset', ASH_LIFECYCLE_ASSET_EPOCH);
  res.setHeader('X-TD613-Ash-Canonical-Membrane', ASH_CANONICAL_MEMBRANE_EPOCH);
  res.setHeader('X-TD613-Ash-Cache-Preflight', ASH_EVICTION_POSTURE);
  res.end(body);
}

function sendRetiredCacheEviction(res, method) {
  const body = JSON.stringify({
    ok:false,
    retired:true,
    schema:'td613.ash.cache-transition-response/v1.0-retired',
    scope:'NO_EVICTION_AUTHORITY',
    contract:ASH_CACHE_TRANSITION_CONTRACT,
    lifecycle_asset_epoch:ASH_LIFECYCLE_ASSET_EPOCH,
    posture:ASH_EVICTION_POSTURE,
    sitewide_epoch_authoritative:true
  });
  res.statusCode = 410;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-TD613-Ash-Cache-Transition', ASH_CACHE_TRANSITION_CONTRACT);
  res.setHeader('X-TD613-Ash-Cache-Preflight', ASH_EVICTION_POSTURE);
  res.end(method === 'HEAD' ? '' : body);
}

export default function handler(req, res) {
  const method = String(req.method || 'GET').toUpperCase();
  const surface = requestedSurface(req);
  if (surface === 'site-epoch-reset') {
    handleSiteEpochReset(req,res);
    return;
  }
  if (!['GET', 'HEAD'].includes(method)) {
    res.setHeader('Allow', 'GET, HEAD');
    send(res, 405, 'Method Not Allowed', surfaceDefinition(surface === 'cache-evict' ? 'dome-world' : surface));
    return;
  }
  if (surface === 'cache-evict') {
    sendRetiredCacheEviction(res, method);
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
