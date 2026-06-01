import { readFile } from 'node:fs/promises';
import path from 'node:path';

const VERSION = 'pr127-flight-html-injector/v1';

function setHeaders(res) {
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.setHeader('cache-control', 'no-store, max-age=0');
  res.setHeader('x-td613-flight-injector', VERSION);
}

function inject(html = '') {
  if (html.includes('td613-flight-android-scroll-fix.js')) return html;
  const script = '\n<script src="./td613-flight-android-scroll-fix.js?v=202606010520" data-td613-flight-android-scroll-fix="pr127"></script>\n';
  if (html.includes('</body>')) return html.replace('</body>', script + '</body>');
  return html + script;
}

export default async function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), 'app', 'safe-harbor', 'td613-flight.html');
    const html = await readFile(filePath, 'utf8');
    setHeaders(res);
    return res.status(200).send(inject(html));
  } catch (error) {
    setHeaders(res);
    return res.status(500).send('<!doctype html><meta charset="utf-8"><title>TD613 Flight unavailable</title><pre>TD613 Flight injector failed: ' + String(error?.message || error).replace(/[<>&]/g, '') + '</pre>');
  }
}
