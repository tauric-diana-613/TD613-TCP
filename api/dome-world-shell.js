import fs from 'node:fs';
import path from 'node:path';
import { stabilizeAshKeepSource } from '../app/dome-world/ash-keep-delivery-transform.js';

export const DOME_WORLD_SHELL_VERSION = 'td613.dome-world.shell/v1.6-legal-demo-ux';
export const MARROWLINE_LAB_ROUTE = '/dome-world/marrowline.html';
export const ASH_THRESHOLD_ROUTE = '/dome-world/ash-threshold.html';
export const ASH_LIFECYCLE_SHELL_CONTRACT = 'td613.ash.lifecycle-shell/v0.1';
export const ASH_KEEP_SHELL_VERSION = 'td613.ash-keep.shell/v0.5-legal-demo-ux';
export const ASH_KEEP_JS_SHELL_VERSION = 'td613.ash-keep.js-shell/v0.5-event-driven-map';
export const ASH_CACHE_TRANSITION_CONTRACT = 'td613.ash.cache-transition/v0.5-legal-demo-ux';
export const ASH_LIFECYCLE_ASSET_EPOCH = '20260722-stable-build-eviction-v1';
export const ASH_LIFECYCLE_SOURCE_MODULE = '/dome-world/ash-lifecycle.js';
export const ASH_LIFECYCLE_MODULE = `${ASH_LIFECYCLE_SOURCE_MODULE}?v=${ASH_LIFECYCLE_ASSET_EPOCH}`;
export const ASH_WORKSPACE_BRIDGE_MODULE = '/dome-world/ash-workspace-bridge.js';
export const ASH_CANONICAL_MEMBRANE_EPOCH = '20260718-canonical-membrane-v6';
export const ASH_MASS_EVICTION_EPOCH = 'td613.ash.cache-flush/2026-07-22-stable-build-eviction-v1';

const DOME_SOURCE_PATH = path.join(process.cwd(), 'app', 'dome-world', 'index.html');
const ASH_KEEP_SOURCE_PATH = path.join(process.cwd(), 'app', 'dome-world', 'ash-keep.html');
const ASH_KEEP_JS_SOURCE_PATH = path.join(process.cwd(), 'app', 'dome-world', 'ash-keep.js');
const ASH_KEEP_ICON_MARKER = '<link rel="icon" href="data:,">';
const ASH_CANONICAL_BOOT_MARKER = '<meta name="ash-canonical-membrane" content="v1.0">';
const ASH_MASS_EVICTION_MARKER = '<meta name="ash-cache-preflight" content="stable-build-eviction-v1">';
const MARROWLINE_BUTTON = `<button class="lab-node lab-node-marrowline" type="button" data-tone="gold" data-glyph="∴" data-open-route="${MARROWLINE_LAB_ROUTE}" style="grid-column:span 8" onclick="window.location.assign('${MARROWLINE_LAB_ROUTE}')" aria-label="Open Marrowline Kʰonapolit terminal"><span class="lab-index">11</span><strong>Marrowline</strong><small>Kʰonapolit terminal / live ingress</small></button>`;
const ASH_TAB = `<button class="tab" data-view="ash" data-sigil="下"><small>04</small><span>Ash</span></button>`;

const ASH_VERSIONED_MODULES = Object.freeze([
  ['/dome-world/ash-keep.js', `/dome-world/ash-keep.js?v=${ASH_LIFECYCLE_ASSET_EPOCH}`],
  ['/dome-world/ash-convergence.js', `/dome-world/ash-convergence.js?v=${ASH_LIFECYCLE_ASSET_EPOCH}`],
  [ASH_LIFECYCLE_SOURCE_MODULE, ASH_LIFECYCLE_MODULE],
  [ASH_WORKSPACE_BRIDGE_MODULE, `${ASH_WORKSPACE_BRIDGE_MODULE}?v=${ASH_LIFECYCLE_ASSET_EPOCH}`],
  ['/dome-world/ash-case-controls.js', `/dome-world/ash-case-controls.js?v=${ASH_LIFECYCLE_ASSET_EPOCH}`]
]);

function cachePreflightBoot() {
  return `${ASH_MASS_EVICTION_MARKER}
  <style id="td613-ash-cache-preflight-style">
    html[data-ash-cache-preflight="pending"] body>*{visibility:hidden!important}
    html[data-ash-cache-preflight="pending"] body::before{content:"Updating Ash Keep · preserving local cases";visibility:visible!important;position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:24px;background:#010806;color:#fff8da;font:600 13px/1.5 ui-monospace,monospace;letter-spacing:.04em;text-align:center}
  </style>
  <script id="td613-ash-cache-preflight-script">
  (()=>{
    const epoch=${JSON.stringify(ASH_MASS_EVICTION_EPOCH)};
    const assetEpoch=${JSON.stringify(ASH_LIFECYCLE_ASSET_EPOCH)};
    const canonicalSessionEpoch=${JSON.stringify(ASH_CANONICAL_MEMBRANE_EPOCH)};
    const moduleMarkerKey='td613.ash.cache-flush.aia3.epoch';
    const preflightMarkerKey='td613.ash.cache-preflight.epoch';
    const receiptKey='td613.ash.cache-preflight.receipt';
    const pointerKey='td613.ash-keep.current-case';
    const sessionKey='td613.ash.session.epoch';
    const recoveryBridge='/safe-harbor/ash-keep-recovery.html';
    const publish=receipt=>{try{sessionStorage.setItem(receiptKey,JSON.stringify(receipt))}catch{}window.__td613AshAia3PreflightReceipt=receipt;window.__td613AshAia3Preflight=Promise.resolve(receipt);return receipt};
    const legacyPresentation=new URLSearchParams(location.search).get('presentation')==='legacy';
    if(legacyPresentation){
      const receipt=publish({schema:'td613.ash.cache-preflight-receipt/v0.2',epoch,asset_epoch:assetEpoch,performed:false,legacy_bypass:true,indexeddb_preserved:true,case_data_preserved:true,active_session_reset:false,local_case_pointer_preserved:true,session_epoch_preserved_or_migrated:true});
      document.documentElement.dataset.ashCachePreflight='complete';
      return;
    }
    let moduleMarker=null,preflightMarker=null;
    try{moduleMarker=localStorage.getItem(moduleMarkerKey);preflightMarker=localStorage.getItem(preflightMarkerKey)}catch{}
    if(moduleMarker===epoch||preflightMarker===epoch){
      try{localStorage.setItem(moduleMarkerKey,epoch);localStorage.setItem(preflightMarkerKey,epoch)}catch{}
      let receipt={schema:'td613.ash.cache-preflight-receipt/v0.2',epoch,asset_epoch:assetEpoch,performed:false,indexeddb_preserved:true,case_data_preserved:true,active_session_reset:false,local_case_pointer_preserved:true,session_epoch_preserved_or_migrated:true};
      try{receipt=JSON.parse(sessionStorage.getItem(receiptKey)||'null')||receipt}catch{}
      publish(receipt);
      document.documentElement.dataset.ashCachePreflight='complete';
      return;
    }
    document.documentElement.dataset.ashCachePreflight='pending';
    const veil=document.createElement('div');
    veil.id='td613-ash-cache-preflight-veil';
    veil.textContent='Updating Ash Keep · preserving local cases';
    veil.setAttribute('role','status');
    veil.setAttribute('aria-live','polite');
    veil.style.cssText='position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:24px;background:#010806;color:#fff8da;font:600 13px/1.5 ui-monospace,monospace;letter-spacing:.04em;text-align:center';
    document.documentElement.append(veil);
    window.stop();
    window.__td613AshAia3Preflight=(async()=>{
      const pointer=(()=>{try{return localStorage.getItem(pointerKey)}catch{return null}})();
      const sessionBefore=(()=>{try{return localStorage.getItem(sessionKey)}catch{return null}})();
      const controllerPresent=Boolean(navigator.serviceWorker?.controller);
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
      const receipt={
        schema:'td613.ash.cache-preflight-receipt/v0.2',epoch,asset_epoch:assetEpoch,performed:true,http_cache:http,
        cache_names:cleared,worker_scopes:workers,indexeddb_preserved:true,case_data_preserved:true,active_session_reset:false,
        controller_present_before_eviction:controllerPresent,cross_scope_recovery_required:controllerPresent,
        local_case_pointer_preserved:(()=>{try{return localStorage.getItem(pointerKey)===pointer}catch{return false}})(),
        session_epoch_preserved_or_migrated:(()=>{try{return pointer?localStorage.getItem(sessionKey)===canonicalSessionEpoch:localStorage.getItem(sessionKey)===sessionBefore}catch{return false}})(),
        session_epoch_migrated:sessionMigrated
      };
      publish(receipt);
      if(controllerPresent&&location.pathname.startsWith('/dome-world/')){
        const bridge=new URL(recoveryBridge,location.href);
        bridge.searchParams.set('return',location.pathname+location.search+location.hash);
        bridge.searchParams.set('epoch',assetEpoch);
        location.replace(bridge.pathname+bridge.search);
        return new Promise(()=>{});
      }
      const current=new URL(location.href);
      if(current.searchParams.get('ash_epoch')!==assetEpoch){
        current.searchParams.set('ash_epoch',assetEpoch);
        location.replace(current.pathname+current.search+current.hash);
        return new Promise(()=>{});
      }
      publish(receipt);
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
    const massEpoch=${JSON.stringify(ASH_MASS_EVICTION_EPOCH)};
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
  if (!html.includes(ASH_MASS_EVICTION_MARKER)) additions.push(cachePreflightBoot());
  if (!html.includes(ASH_CANONICAL_BOOT_MARKER)) additions.push(canonicalAshBoot());
  if (additions.length) html = `${html.slice(0, headClose)}  ${additions.join('\n  ')}\n${html.slice(headClose)}`;

  for (const [sourceModule, versionedModule] of ASH_VERSIONED_MODULES) {
    const versionedTag = `src="${versionedModule}"`;
    if (html.includes(versionedTag)) continue;
    const unversionedTag = `src="${sourceModule}"`;
    if (!html.includes(unversionedTag)) throw new Error(`ash-canonical-module-source-missing:${sourceModule}`);
    html = html.replace(unversionedTag, versionedTag);
  }

  const ordered = ASH_VERSIONED_MODULES.map(([, versioned]) => versioned);
  if (!html.includes('name="ash-lifecycle" content="v0.1"')) throw new Error('ash-lifecycle-meta-missing');
  if (!html.includes('name="ash-constitutional-composition" content="v0.1"')) throw new Error('ash-composition-meta-missing');
  if (!html.includes(ASH_KEEP_ICON_MARKER)) throw new Error('ash-keep-explicit-icon-boundary-missing');
  if (!html.includes(ASH_MASS_EVICTION_MARKER)) throw new Error('ash-cache-preflight-missing');
  if (!html.includes(ASH_CANONICAL_BOOT_MARKER)) throw new Error('ash-canonical-membrane-first-paint-missing');
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
    if (requestUrl.searchParams.get('arrival') === 'cleared' || req.query?.arrival === 'cleared') return 'ash-keep-html';
    return requestUrl.searchParams.get('surface') || 'dome-world';
  } catch {
    return req.query?.arrival === 'cleared' ? 'ash-keep-html' : 'dome-world';
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
  res.end(body);
}

function sendCacheEviction(res, method) {
  const body = JSON.stringify({
    ok:true,
    schema:'td613.ash.cache-transition-response/v0.5-aia3-mass-eviction',
    scope:'HTTP_CACHE_AND_SERVICE_WORKER_CLIENT_EVICTION',
    indexeddb_preserved:true,
    case_data_preserved:true,
    active_session_reset_by_client:false,
    physical_erasure_verified:false,
    contract:ASH_CACHE_TRANSITION_CONTRACT,
    lifecycle_asset_epoch:ASH_LIFECYCLE_ASSET_EPOCH,
    mass_eviction_epoch:ASH_MASS_EVICTION_EPOCH
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
