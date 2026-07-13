import fs from 'node:fs';
import path from 'node:path';

export const DOME_WORLD_SHELL_VERSION = 'td613.dome-world.shell/v1.2-phase5-relation-lab';
export const RELATION_ENVELOPE_LAB_ROUTE = '/dome-world/relation-envelope.html';
export const MARROWLINE_LAB_ROUTE = '/dome-world/marrowline.html';

const SOURCE_PATH = path.join(process.cwd(), 'app', 'dome-world', 'index.html');
const RELATION_BUTTON = `<button class="lab-node lab-node-relation" type="button" data-tone="violet" data-glyph="≈" data-open-route="${RELATION_ENVELOPE_LAB_ROUTE}" style="grid-column:span 4" onclick="window.location.assign('${RELATION_ENVELOPE_LAB_ROUTE}')" aria-label="Open Phase V Relation Envelope laboratory"><span class="lab-index">11</span><strong>Relation Envelope</strong><small>third object / Phason continuity</small></button>`;
const MARROWLINE_BUTTON = `<button class="lab-node lab-node-marrowline" type="button" data-tone="gold" data-glyph="∴" data-open-route="${MARROWLINE_LAB_ROUTE}" style="grid-column:span 8" onclick="window.location.assign('${MARROWLINE_LAB_ROUTE}')" aria-label="Open Marrowline Kʰonapolit terminal"><span class="lab-index">12</span><strong>Marrowline</strong><small>Kʰonapolit terminal / live ingress</small></button>`;

export function injectMarrowlineLabButton(source = '') {
  const html = String(source || '');
  if (!html) throw new Error('dome-world-source-empty');
  if (html.includes(`data-open-route="${RELATION_ENVELOPE_LAB_ROUTE}"`)
    && html.includes(`data-open-route="${MARROWLINE_LAB_ROUTE}"`)) return html;

  const stationCount = '<span><b>10</b>stations</span>';
  const interfaceBus = /<button class="lab-node" data-open-view="api"[\s\S]*?<\/button>/;
  if (!html.includes(stationCount)) throw new Error('dome-world-lab-station-count-marker-missing');
  if (!interfaceBus.test(html)) throw new Error('dome-world-interface-bus-marker-missing');

  return html
    .replace(stationCount, '<span><b>12</b>stations</span>')
    .replace(interfaceBus, button => `${button}${RELATION_BUTTON}${MARROWLINE_BUTTON}`);
}

function send(res, status, body = '') {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-TD613-Dome-Shell', DOME_WORLD_SHELL_VERSION);
  res.end(body);
}

export default function handler(req, res) {
  const method = String(req.method || 'GET').toUpperCase();
  if (!['GET', 'HEAD'].includes(method)) {
    res.setHeader('Allow', 'GET, HEAD');
    send(res, 405, 'Method Not Allowed');
    return;
  }

  try {
    const source = fs.readFileSync(SOURCE_PATH, 'utf8');
    const html = injectMarrowlineLabButton(source);
    send(res, 200, method === 'HEAD' ? '' : html);
  } catch (error) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.statusCode = 500;
    res.end(JSON.stringify({
      ok: false,
      error: 'dome-world-shell-unavailable',
      detail: String(error?.message || error),
      version: DOME_WORLD_SHELL_VERSION
    }));
  }
}
