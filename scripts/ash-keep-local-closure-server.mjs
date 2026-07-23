import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stabilizeAshKeepSource } from '../app/dome-world/ash-keep-delivery-transform.js';
import { injectAshKeepLifecycle, ASH_LIFECYCLE_ASSET_EPOCH, ASH_MASS_EVICTION_EPOCH } from '../api/dome-world-shell.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const port = Number(process.argv[2] || process.env.PORT || 6130);

await import('./prepare-ash-profile-closure-fixture.mjs');
await import('./prepare-ash-premium-closure-fixture.mjs');
await import('./prepare-ash-canonical-cache-closure-fixture.mjs');

const MIME_TYPES = Object.freeze({
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8'
});

const ROUTE_PREFIXES = Object.freeze([
  ['/dome-world/', 'app/dome-world/'],
  ['/engine/', 'app/engine/'],
  ['/aperture/', 'app/aperture/'],
  ['/safe-harbor/', 'app/safe-harbor/']
]);

function resolvePublicPath(pathname) {
  if (pathname === '/' || pathname === '/dome-world') return 'app/dome-world/index.html';
  for (const [publicPrefix, repositoryPrefix] of ROUTE_PREFIXES) {
    if (pathname.startsWith(publicPrefix)) return `${repositoryPrefix}${pathname.slice(publicPrefix.length)}`;
  }
  return pathname.replace(/^\//, '');
}

function sendJson(res, status, payload, headers = {}) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...headers
  });
  res.end(`${JSON.stringify(payload)}\n`);
}

async function sendCanonicalKeep(req, res) {
  const source = await fs.readFile(path.join(repoRoot, 'app/dome-world/ash-keep.html'), 'utf8');
  const body = injectAshKeepLifecycle(source);
  res.writeHead(200, {
    'content-type':'text/html; charset=utf-8',
    'cache-control':'no-store',
    'x-td613-ash-lifecycle-asset':ASH_LIFECYCLE_ASSET_EPOCH,
    'x-td613-ash-cache-preflight':ASH_MASS_EVICTION_EPOCH,
    'x-td613-ash-visible-route':'/dome-world/ash-threshold.html'
  });
  if (req.method === 'HEAD') return res.end();
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);
  if (url.pathname === '/favicon.ico') {
    res.writeHead(204, { 'cache-control': 'no-store' });
    return res.end();
  }
  if (url.pathname === '/__ash_keep_closure/stale-aia2-worker.js') {
    const worker = `self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', () => {});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname === '/dome-world/ash-lifecycle.js') {
    event.respondWith(new Response("document.documentElement.dataset.staleAia2Asset='served';", { headers:{ 'content-type':'text/javascript; charset=utf-8', 'cache-control':'public, max-age=31536000, immutable' } }));
  }
});
`;
    res.writeHead(200, {
      'content-type':'text/javascript; charset=utf-8',
      'cache-control':'no-store',
      'service-worker-allowed':'/dome-world/'
    });
    return res.end(worker);
  }
  if (url.pathname === '/__ash_keep_closure/readiness') {
    return sendJson(res, 200, {
      ok: true,
      schema: 'td613.ash-keep.local-closure-readiness/v0.5-canonical-first-paint',
      recipient_transport: false,
      provider_route: false,
      production_promotion: false,
      ash_keep_delivery_transform: true,
      cache_navigation_required: false,
      canonical_visible_route: '/dome-world/ash-threshold.html',
      browser_state_read_via_page_evaluate: true,
      lifecycle_asset_epoch: ASH_LIFECYCLE_ASSET_EPOCH,
      mass_eviction_epoch: ASH_MASS_EVICTION_EPOCH
    });
  }
  if (url.pathname === '/api/dome-world-shell' && url.searchParams.get('surface') === 'cache-evict') {
    return sendJson(res, 200, {
      ok:true,
      schema:'td613.ash.cache-transition-response/v0.6-first-paint',
      scope:'HTTP_CACHE_AND_SERVICE_WORKER_CLIENT_EVICTION',
      indexeddb_preserved:true,
      case_data_preserved:true,
      active_session_reset_by_client:false,
      visible_url:'/dome-world/ash-threshold.html',
      lifecycle_asset_epoch:ASH_LIFECYCLE_ASSET_EPOCH,
      mass_eviction_epoch:ASH_MASS_EVICTION_EPOCH
    }, {
      'clear-site-data':'"cache"',
      'x-td613-ash-cache-preflight':ASH_MASS_EVICTION_EPOCH
    });
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return sendJson(res, 405, { ok: false, error: 'method-not-allowed' });

  if (url.pathname === '/api/dome-world-shell' && url.searchParams.get('surface') === 'ash-keep-html') {
    return sendCanonicalKeep(req, res);
  }
  if (url.pathname === '/dome-world/ash-threshold.html' || url.pathname === '/dome-world/ash-keep.html') {
    return sendCanonicalKeep(req, res);
  }

  const relative = decodeURIComponent(resolvePublicPath(url.pathname));
  const candidate = path.resolve(repoRoot, relative);
  if (!candidate.startsWith(`${repoRoot}${path.sep}`) && candidate !== repoRoot) {
    res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
    return res.end('Forbidden');
  }

  let finalPath = candidate;
  try {
    if ((await fs.stat(finalPath)).isDirectory()) finalPath = path.join(finalPath, 'index.html');
  } catch {
    // The read below returns the bounded 404.
  }

  try {
    const extension = path.extname(finalPath).toLowerCase();
    let body = await fs.readFile(finalPath);
    if (url.pathname === '/dome-world/ash-keep.js') {
      body = Buffer.from(stabilizeAshKeepSource(body.toString('utf8')), 'utf8');
    }
    res.writeHead(200, {
      'content-type': MIME_TYPES[extension] || 'application/octet-stream',
      'cache-control': 'no-store',
      ...(url.pathname === '/dome-world/ash-keep.js' ? { 'x-td613-ash-map-scheduler': 'EVENT_DRIVEN_COALESCED' } : {})
    });
    if (req.method === 'HEAD') return res.end();
    return res.end(body);
  } catch (error) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    return res.end(`Not found: ${String(error?.message || error)}`);
  }
});

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`[TD613] Ash Keep closure server listening on http://127.0.0.1:${port}\n`);
});
