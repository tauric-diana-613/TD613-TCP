import fs from 'node:fs';
import path from 'node:path';

export const ASH_KEEP_SHELL_VERSION = 'td613.ash-keep.shell/v0.1';
export const ASH_LIFECYCLE_MODULE = '/dome-world/ash-lifecycle.js';

const SOURCE_PATH = path.join(process.cwd(), 'app', 'dome-world', 'ash-keep.html');
const CORE_SCRIPT = '<script type="module" src="/dome-world/ash-keep.js"></script>';
const LIFECYCLE_SCRIPT = `<script type="module" src="${ASH_LIFECYCLE_MODULE}"></script>`;

export function injectAshKeepLifecycle(source = '') {
  let html = String(source || '');
  if (!html) throw new Error('ash-keep-source-empty');

  if (!html.includes('name="ash-lifecycle"')) {
    const marker = '<meta name="theme-color" content="#04130f">';
    if (!html.includes(marker)) throw new Error('ash-keep-theme-marker-missing');
    html = html.replace(marker, `${marker}\n  <meta name="ash-lifecycle" content="v0.1">`);
  }

  if (!html.includes(ASH_LIFECYCLE_MODULE)) {
    if (!html.includes(CORE_SCRIPT)) throw new Error('ash-keep-core-script-marker-missing');
    html = html.replace(CORE_SCRIPT, `${CORE_SCRIPT}\n  ${LIFECYCLE_SCRIPT}`);
  }

  if (html.indexOf(ASH_LIFECYCLE_MODULE) < html.indexOf('/dome-world/ash-keep.js')) {
    throw new Error('ash-lifecycle-loaded-before-keep-core');
  }
  return html;
}

function send(res, status, body = '') {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-TD613-Ash-Keep-Shell', ASH_KEEP_SHELL_VERSION);
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
    const html = injectAshKeepLifecycle(source);
    send(res, 200, method === 'HEAD' ? '' : html);
  } catch (error) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.statusCode = 500;
    res.end(JSON.stringify({
      ok: false,
      error: 'ash-keep-shell-unavailable',
      detail: String(error?.message || error),
      version: ASH_KEEP_SHELL_VERSION
    }));
  }
}
