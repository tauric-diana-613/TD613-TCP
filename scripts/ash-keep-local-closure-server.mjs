import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const port = Number(process.argv[2] || process.env.PORT || 6130);

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
    if (pathname.startsWith(publicPrefix)) {
      return `${repositoryPrefix}${pathname.slice(publicPrefix.length)}`;
    }
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
      schema: 'td613.ash-keep.local-closure-readiness/v0.1',
      recipient_transport: false,
      provider_route: false,
      production_promotion: false
    });
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return sendJson(res, 405, { ok: false, error: 'method-not-allowed' });
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
    const body = await fs.readFile(finalPath);
    res.writeHead(200, {
      'content-type': MIME_TYPES[path.extname(finalPath).toLowerCase()] || 'application/octet-stream',
      'cache-control': 'no-store'
    });
    if (req.method === 'HEAD') return res.end();
    return res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    return res.end('Not found');
  }
});

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`[TD613] Ash Keep closure server listening on http://127.0.0.1:${port}\n`);
});
