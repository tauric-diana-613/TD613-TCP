import fs from 'node:fs';
import path from 'node:path';

export const ASH_KEEP_JS_SHELL_VERSION = 'td613.ash-keep.js-shell/v0.1';

const SOURCE_PATH = path.join(process.cwd(), 'app', 'dome-world', 'ash-keep.js');
const DRAFT_MARKER = '    caseId: state.caseMap.case_id,\n    body: $(\'draftBody\').value,';
const DRAFT_BINDING = '    caseId: state.caseMap.case_id,\n    caseMapDigest: state.caseMap.case_map_digest,\n    body: $(\'draftBody\').value,';

export function bindAshDraftsToCaseMap(source = '') {
  const code = String(source || '');
  if (!code) throw new Error('ash-keep-js-source-empty');
  if (code.includes('caseMapDigest: state.caseMap.case_map_digest')) return code;
  if (!code.includes(DRAFT_MARKER)) throw new Error('ash-keep-draft-marker-missing');
  return code.replace(DRAFT_MARKER, DRAFT_BINDING);
}

function send(res, status, body = '') {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-TD613-Ash-Keep-JS-Shell', ASH_KEEP_JS_SHELL_VERSION);
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
    const code = bindAshDraftsToCaseMap(source);
    send(res, 200, method === 'HEAD' ? '' : code);
  } catch (error) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.statusCode = 500;
    res.end(JSON.stringify({
      ok: false,
      error: 'ash-keep-js-shell-unavailable',
      detail: String(error?.message || error),
      version: ASH_KEEP_JS_SHELL_VERSION
    }));
  }
}
