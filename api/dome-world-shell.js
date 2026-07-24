import fs from 'node:fs';
import path from 'node:path';
import { stabilizeAshKeepSource } from '../app/dome-world/ash-keep-delivery-transform.js';

export const DOME_WORLD_SHELL_VERSION = 'td613.dome-world.shell/v1.8-a11-predeployment-cache';
export const MARROWLINE_LAB_ROUTE = '/dome-world/marrowline.html';
export const ASH_THRESHOLD_ROUTE = '/dome-world/ash-threshold.html';
export const ASH_LIFECYCLE_SHELL_CONTRACT = 'td613.ash.lifecycle-shell/v0.1';
export const ASH_KEEP_SHELL_VERSION = 'td613.ash-keep.shell/v0.7-a11-predeployment-cache';
export const ASH_KEEP_JS_SHELL_VERSION = 'td613.ash-keep.js-shell/v0.5-event-driven-map';
export const ASH_CACHE_TRANSITION_CONTRACT = 'td613.ash.cache-transition/v0.7-a11-predeployment';
export const ASH_LIFECYCLE_ASSET_EPOCH = '20260723-a2-a5-release-v1';
export const ASH_LIFECYCLE_SOURCE_MODULE = '/dome-world/ash-lifecycle.js';
export const ASH_LIFECYCLE_MODULE = `${ASH_LIFECYCLE_SOURCE_MODULE}?v=${ASH_LIFECYCLE_ASSET_EPOCH}`;
export const ASH_WORKSPACE_BRIDGE_MODULE = '/dome-world/ash-workspace-bridge.js';
export const ASH_CANONICAL_MEMBRANE_EPOCH = '20260718-canonical-membrane-v6';
export const ASH_MASS_EVICTION_EPOCH = 'td613.ash.cache-flush/2026-07-23-a2-a5-release-v1';
export const ASH_A11_PREFLIGHT_ASSET_EPOCH = '20260724-a11-predeployment-v1';
export const ASH_A11_PREFLIGHT_EVICTION_EPOCH = 'td613.ash.cache-flush/2026-07-24-a11-predeployment-v1';

const DOME_SOURCE_PATH = path.join(process.cwd(), 'app', 'dome-world', 'index.html');
const ASH_KEEP_SOURCE_PATH = path.join(process.cwd(), 'app', 'dome-world', 'ash-keep.html');
const ASH_KEEP_JS_SOURCE_PATH = path.join(process.cwd(), 'app', 'dome-world', 'ash-keep.js');
const ASH_KEEP_ICON_MARKER = '<link rel="icon" href="data:,">';
const ASH_CANONICAL_LINK_MARKER = '<link rel="canonical" href="/dome-world/ash-threshold.html">';
const ASH_CANONICAL_BOOT_MARKER = '<meta name="ash-canonical-membrane" content="v1.0">';
const ASH_MASS_EVICTION_MARKER = '<meta name="ash-cache-preflight" content="a2-a5-release-v1">';
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
  ['/dome-world/ash-a7-a11-recompiler-core.js', '/dome-world/ash-a7-a11-recompiler-core.js?v=20260723-a7-v1'],
  ['/dome-world/ash-a7-home-recompilation.js', '/dome-world/ash-a7-home-recompilation.js?v=20260723-a7-v1'],
  ['/dome-world/ash-a8-case-map-recompilation.js', '/dome-world/ash-a8-case-map-recompilation.js?v=20260723-a8-v1']
]);

function cachePreflightBoot() {
  return `${ASH_MASS_EVICTION_MARKER}
  <style id="td613-ash-cache-preflight-style">
    html[data-ash-cache-preflight="pending"] body>*:not(#td613-ash-preparing-shell){visibility:hidden!important}
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
    const epoch=${JSON.stringify(ASH_A11_PREFLIGHT_EVICTION_EPOCH)};
    const assetEpoch=${JSON.stringify(ASH_A11_PREFLIGHT_ASSET_EPOCH)};
    const canonicalSessionEpoch=${JSON.stringify(ASH_CANONICAL_MEMBRANE_EPOCH)};
    const moduleMarkerKey='td613.ash.cache-flush.aia3.epoch';
    const preflightMarkerKey='td613.ash.cache-preflight.epoch';
    const receiptKey='td613.ash.cache-preflight.receipt';
    const pointerKey='td613.ash-keep.current-case';
    const sessionKey='td613.ash.session.epoch';
    const recoveryBridge='/safe-harbor/ash-keep-recovery.html';
    document.title='TD613 Ash';
    if(location.pathname!==canonicalPath||location.search){history.replaceState(null,'',canonicalPath+location.hash)}
    document.documentElement.dataset.ashCanonicalUrl='true';
    document.documentElement.dataset.ashCachePreflight='pending';
    window.__td613AshFirstPaintWitness=Object.freeze({
      schema:'td613.ash.first-paint-witness/v0.1',
      title:document.title,
      url:location.pathname+location.search,
      preparing_shell_present:true,
      legacy_composition_visible:false,
      epoch_query_visible:false
    });
    const publish=receipt=>{
      try{sessionStorage.setItem(receiptKey,JSON.stringify(receipt))}catch{}
      window.__td613AshAia3PreflightReceipt=receipt;
      return receipt;
    };
    window.__td613AshAia3Preflight=(async()=>{
      const pointer=(()=>{try{return localStorage.getItem(pointerKey)}catch{return null}})();
      const sessionBefore=(()=>{try{return localStorage.getItem(sessionKey)}catch{return null}})();
      const controllerPresent=Boolean(navigator.serviceWorker?.controller);
      let moduleMarker=null,preflightMarker=null;
      try{moduleMarker=localStorage.getItem(moduleMarkerKey);preflightMarker=localStorage.getItem(preflightMarkerKey)}catch{}
      const current=moduleMarker===epoch||preflightMarker===epoch;
      if(legacyPresentation){
        const receipt=publish({schema:'td613.ash.cache-preflight-receipt/v0.4-a11-predeployment',epoch,asset_epoch:assetEpoch,performed:false,legacy_bypass:true,indexeddb_preserved:true,case_data_preserved:true,active_session_reset:false,local_case_pointer_preserved:true,session_epoch_preserved_or_migrated:true,visible_url:canonicalPath});
        document.documentElement.dataset.ashCachePreflight='complete';
        return receipt;
      }
      if(current&&!controllerPresent){
        try{localStorage.setItem(moduleMarkerKey,epoch);localStorage.setItem(preflightMarkerKey,epoch)}catch{}
        let receipt={schema:'td613.ash.cache-preflight-receipt/v0.4-a11-predeployment',epoch,asset_epoch:assetEpoch,performed:false,indexeddb_preserved:true,case_data_preserved:true,active_session_reset:false,local_case_pointer_preserved:true,session_epoch_preserved_or_migrated:true,visible_url:canonicalPath};
        try{receipt=JSON.parse(sessionStorage.getItem(receiptKey)||'null')||receipt}catch{}
        publish(receipt);
        document.documentElement.dataset.ashCachePreflight='complete';
        return receipt;
      }
      const cleared=[];const workers=[];let http={attempted:false,observed:false};
      try{if(globalThis.caches?.keys){const names=await caches.keys();for(const name of names){if(await caches.delete(name))cleared.push(name)}}}catch{}
      try{if(navigator.serviceWorker?.getRegistrations){const registrations=await navigator.serviceWorker.getRegistrations();for(const registration of registrations){try{if(new URL(registration.scope,location.href).origin===location.origin&&await registration.unregister())workers.push(registration.scope)}catch{}}}}catch{}
      try{
        const url=new URL('/api/dome-world-shell',location.href);
        url.searchParams.set('surface','cache-evict');
        url.searchParams.set('epoch',epoch);
        url.searchParams.set('asset_epoch',assetEpoch);
        url.searchParams.set('nonce',crypto.randomUUID?.()||String(Date.now()));
        const response=await fetch(url,{cache:'no-store',credentials:'same-origin',headers:{'Cache-Control':'no-cache, no-store, max-age=0',Pragma:'no-cache'}});
        http={attempted:true,observed:response.ok,status:response.status,clear_site_data:response.headers.get('Clear-Site-Data')};
      }catch(error){http={attempted:true,observed:false,reason:String(error?.message||error)}}
      let sessionMigrated=false;
      try{
        localStorage.setItem(moduleMarkerKey,epoch);
        localStorage.setItem(preflightMarkerKey,epoch);
        if(pointer&&sessionBefore!==canonicalSessionEpoch){localStorage.setItem(sessionKey,canonicalSessionEpoch);sessionMigrated=true}
      }catch{}
      const receipt=publish({
        schema:'td613.ash.cache-preflight-receipt/v0.4-a11-predeployment',epoch,asset_epoch:assetEpoch,performed:true,http_cache:http,
        cache_names:cleared,worker_scopes:workers,indexeddb_preserved:true,case_data_preserved:true,active_session_reset:false,
        controller_present_before_eviction:controllerPresent,cross_scope_recovery_required:controllerPresent,
        local_case_pointer_preserved:(()=>{try{return localStorage.getItem(pointerKey)===pointer}catch{return false}})(),
        session_epoch_preserved_or_migrated:(()=>{try{return pointer?localStorage.getItem(sessionKey)===canonicalSessionEpoch:localStorage.getItem(sessionKey)===sessionBefore}catch{return false}})(),
        session_epoch_migrated:sessionMigrated,visible_url:canonicalPath
      });
      if(controllerPresent&&incoming.pathname.startsWith('/dome-world/')){
        try{sessionStorage.setItem('td613.ash.recovery.source-receipt',JSON.stringify(receipt))}catch{}
        location.replace(recoveryBridge);
        return new Promise(()=>{});
      }
      document.documentElement.dataset.ashCachePreflight='complete';
      return receipt;
    })();
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
    const moduleMarkerKey='td613.ash.cache-flush.aia3.epoch';
    const preflightMarkerKey='td613.ash.cache-preflight.epoch';
    const epoch=${JSON.stringify(ASH_CANONICAL_MEMBRANE_EPOCH)};
    const massEpoch=${JSON.stringify(ASH_A11_PREFLIGHT_EVICTION_EPOCH)};
    const pointer=localStorage.getItem(pointerKey);
    const massCurrent=localStorage.getItem(moduleMarkerKey)===massEpoch||localStorage.getItem(preflightMarkerKey)===massEpoch;
    if(pointer&&massCurrent&&localStorage.getItem(sessionKey)!==epoch){localStorage.setItem(sessionKey,epoch);document.documentElement.dataset.ashSessionMigrated='true'}
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
    globalThis.dispatchEvent(new CustomEvent('td613:ash:canonical-module-graph-ready',{detail:{schema:'td613.ash.canonical-module-graph/v0.1',module_count:modules.length,asset_epoch:${JSON.stringify(ASH_LIFECYCLE_ASSET_EPOCH)},preflight_asset_epoch:${JSON.stringify(ASH_A11_PREFLIGHT_ASSET_EPOCH)},preflight_performed:Boolean(receipt?.performed)}}));
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
  if (!html.includes(ASH_KEEP_ICON_MARKER)) additions.push(ASH_KEEP_ICON_MARKER);
  if (!html.includes(ASH_CANONICAL_LINK_MARKER)) additions.push(ASH_CANONICAL_LINK_MARKER);
  if (!html.includes(ASH_MASS_EVICTION_MARKER)) additions.push(cachePreflightBoot());
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
  if (!html.includes(ASH_MASS_EVICTION_MARKER)) throw new Error('ash-cache-preflight-missing');
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
  res.setHeader('X-TD613-Ash-Cache-Preflight', ASH_MASS_EVICTION_EPOCH);
  res.setHeader('X-TD613-Ash-A11-Preflight-Asset', ASH_A11_PREFLIGHT_ASSET_EPOCH);
  res.setHeader('X-TD613-Ash-A11-Cache-Preflight', ASH_A11_PREFLIGHT_EVICTION_EPOCH);
  res.end(body);
}

function sendCacheEviction(res, method) {
  const body = JSON.stringify({
    ok:true,
    schema:'td613.ash.cache-transition-response/v0.7-a11-predeployment',
    scope:'HTTP_CACHE_AND_SERVICE_WORKER_CLIENT_EVICTION',
    indexeddb_preserved:true,
    case_data_preserved:true,
    active_session_reset_by_client:false,
    physical_erasure_verified:false,
    visible_url:ASH_THRESHOLD_ROUTE,
    contract:ASH_CACHE_TRANSITION_CONTRACT,
    lifecycle_asset_epoch:ASH_LIFECYCLE_ASSET_EPOCH,
    mass_eviction_epoch:ASH_MASS_EVICTION_EPOCH,
    a11_preflight_asset_epoch:ASH_A11_PREFLIGHT_ASSET_EPOCH,
    a11_preflight_eviction_epoch:ASH_A11_PREFLIGHT_EVICTION_EPOCH
  });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  res.setHeader('Clear-Site-Data', '"cache"');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-TD613-Ash-Cache-Transition', ASH_CACHE_TRANSITION_CONTRACT);
  res.setHeader('X-TD613-Ash-Lifecycle', ASH_LIFECYCLE_SHELL_CONTRACT);
  res.setHeader('X-TD613-Ash-Lifecycle-Asset', ASH_LIFECYCLE_ASSET_EPOCH);
  res.setHeader('X-TD613-Ash-Canonical-Membrane', ASH_CANONICAL_MEMBRANE_EPOCH);
  res.setHeader('X-TD613-Ash-Cache-Preflight', ASH_MASS_EVICTION_EPOCH);
  res.setHeader('X-TD613-Ash-A11-Preflight-Asset', ASH_A11_PREFLIGHT_ASSET_EPOCH);
  res.setHeader('X-TD613-Ash-A11-Cache-Preflight', ASH_A11_PREFLIGHT_EVICTION_EPOCH);
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
