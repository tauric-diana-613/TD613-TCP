// Offline visual-QA server. It never reaches a public source or persists data.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.argv[2] || 8766);
const registry = {
  schema: 'td613.giving.source-registry/v1',
  source_instance_count: 4,
  instances: [
    { id: 'fec-schedule-a', family: 'FEC', custodian: 'Federal Election Commission', jurisdiction: 'Federal', state: 'READY', electronic_scope: 'OpenFEC Schedule A electronic filings' },
    { id: 'florida-state-contributions', family: 'FLORIDA', custodian: 'Florida Division of Elections', jurisdiction: 'Florida state and multicounty', state: 'READY', electronic_scope: 'State searchable electronic contribution database' },
    { id: 'voterfocus-duval', family: 'VOTERFOCUS', custodian: 'Duval County Supervisor of Elections / Jacksonville', jurisdiction: 'Duval', state: 'READY', electronic_scope: 'Electronic filings with explicit historical dates' },
    { id: 'easyvote-lakeland', family: 'EASYVOTE', custodian: 'City of Lakeland', jurisdiction: 'Lakeland, Polk County', state: 'READY', electronic_scope: 'Electronically submitted municipal reports' }
  ]
};

function json(response, data) {
  response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify({ ok: true, data, receipt: { schema: 'td613.giving.preview-receipt/v1' }, error: null }));
}

const server = http.createServer(async (request, response) => {
  if (request.url === '/api/giving' && request.method === 'POST') {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    const envelope = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (envelope.operation === 'session.status') return json(response, { authenticated: true, intent_nonce: 'offline-preview-intent' });
    if (envelope.operation === 'registry.read') return json(response, registry);
    if (envelope.operation === 'readiness') return json(response, { ready: true, preview: true });
    return json(response, {});
  }
  const previewOperator = request.url?.includes('surface=operator');
  const requestPath = request.url?.split('?')[0];
  const requested = requestPath === '/app/giving/history/' ? '/app/giving/history/index.html' : requestPath;
  const target = path.resolve(root, `.${requested.split('?')[0]}`);
  if (!target.startsWith(root)) { response.writeHead(403); return response.end(); }
  try {
    let body = await fs.readFile(target);
    if (previewOperator && target.endsWith('app\\giving\\history\\index.html')) {
      body = Buffer.from(body.toString('utf8')
        .replace('data-session="checking"', 'data-session="open"')
        .replace('<section class="session-membrane"', '<section hidden class="session-membrane"')
        .replace('<div class="operator-shell" id="operatorShell" hidden>', '<div class="operator-shell" id="operatorShell">')
        .replace('<script type="module" src="./giving-app.js"></script>', ''));
    }
    const type = target.endsWith('.html') ? 'text/html' : target.endsWith('.css') ? 'text/css' : target.endsWith('.js') ? 'text/javascript' : 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end('not found');
  }
});

server.listen(port, '127.0.0.1', () => console.log(`Giving preview: http://127.0.0.1:${port}/app/giving/history/`));
