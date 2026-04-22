import http from 'http';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildSealedBatchArtifact } from '../app/safe-harbor/app/operator-batch-seal.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const port = Number(process.argv[2] || process.env.PORT || 6130);
const manifestPath = path.join(repoRoot, 'app', 'safe-harbor', 'corpus', 'TD613_corpus_manifest.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(payload));
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function handleSealBatch(req, res) {
  try {
    const body = JSON.parse(await readBody(req) || '{}');
    const batchId = String(body.batchId || '').trim();
    const packet = body.packet && typeof body.packet === 'object' ? body.packet : null;
    const signature = body.signature && typeof body.signature === 'object' ? body.signature : null;

    if (!batchId) {
      return sendJson(res, 400, { ok: false, error: 'missing-batch-id' });
    }
    if (!packet || !packet.issuance || !packet.issuance.badge_number) {
      return sendJson(res, 400, { ok: false, error: 'missing-sealed-packet' });
    }

    const manifest = await readJson(manifestPath);
    const registry = Array.isArray(manifest.corpus_registry) ? manifest.corpus_registry : [];
    const entry = registry.find((item) => item && item.batch_id === batchId);
    if (!entry || !entry.path) {
      return sendJson(res, 404, { ok: false, error: 'unknown-batch-id' });
    }

    const targetPath = path.resolve(path.dirname(manifestPath), entry.path);
    const corpusRoot = path.resolve(path.dirname(manifestPath));
    if (!targetPath.startsWith(corpusRoot + path.sep) && targetPath !== corpusRoot) {
      return sendJson(res, 400, { ok: false, error: 'invalid-target-path' });
    }

    const existingBatch = await readJson(targetPath);
    const sealedAt = new Date().toISOString();
    const artifact = buildSealedBatchArtifact({
      batch: existingBatch,
      registryEntry: entry,
      batchId,
      packet,
      signature,
      sealedAt
    });

    await fs.writeFile(targetPath, JSON.stringify(artifact, null, 2) + '\n', 'utf8');

    return sendJson(res, 200, {
      ok: true,
      batchId,
      path: targetPath,
      sealedAt,
      filename: path.basename(targetPath),
      artifact
    });
  } catch (error) {
    return sendJson(res, 500, { ok: false, error: String(error && error.message ? error.message : error) });
  }
}

async function handleStatic(req, res, requestPath) {
  let relativePath = decodeURIComponent(requestPath.split('?')[0] || '/');
  if (relativePath === '/') relativePath = '/app/index.html';
  const filePath = path.resolve(repoRoot, '.' + relativePath);
  if (!filePath.startsWith(repoRoot + path.sep) && filePath !== repoRoot) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  let finalPath = filePath;
  try {
    const stat = await fs.stat(finalPath);
    if (stat.isDirectory()) {
      finalPath = path.join(finalPath, 'index.html');
    }
  } catch {}

  try {
    const data = await fs.readFile(finalPath);
    const ext = path.extname(finalPath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);

  if (req.method === 'POST' && requestUrl.pathname === '/__td613/seal-batch') {
    return handleSealBatch(req, res);
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    return handleStatic(req, res, requestUrl.pathname);
  }

  res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Method not allowed');
});

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`[TD613] localhost operator server listening on http://127.0.0.1:${port}\n`);
});
