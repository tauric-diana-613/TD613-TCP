import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stabilizeAshKeepSource } from '../app/dome-world/ash-keep-delivery-transform.js';

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

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  });
  res.end(`${JSON.stringify(payload)}\n`);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);
  if (url.pathname === '/favicon.ico') {
    res.writeHead(204, { 'cache-control': 'no-store' });
    return res.end();
  }
  if (url.pathname === '/__ash_keep_closure/readiness') {
    return sendJson(res, 200, {
      ok: true,
      schema: 'td613.ash-keep.local-closure-readiness/v0.3-canonical-cache-browser-receipt',
      recipient_transport: false,
      provider_route: false,
      production_promotion: false,
      ash_keep_delivery_transform: true,
      cache_navigation_required: false,
      browser_state_read_via_page_evaluate: true
    });
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return sendJson(res, 405, { ok: false, error: 'method-not-allowed' });

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
