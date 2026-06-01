import { readFile } from 'node:fs/promises';
import path from 'node:path';

const VERSION = 'pr129-flight-html-android-inline/v1';

function setHeaders(res) {
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.setHeader('cache-control', 'no-store, max-age=0');
  res.setHeader('x-td613-flight-injector', VERSION);
}

function androidInlinePatch() {
  return `
<style id="td613-flight-android-inline-scroll-fix">
@media (max-width: 820px) {
  html,
  body {
    min-width: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    overscroll-behavior-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    touch-action: pan-y pan-x pinch-zoom !important;
  }

  .page-wrap {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    overflow: visible !important;
  }

  .grid {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    grid-template-columns: 100% 100% !important;
    gap: 0 !important;
    overflow: hidden !important;
    touch-action: pan-y pan-x pinch-zoom !important;
    -webkit-overflow-scrolling: touch !important;
  }

  .grid > div,
  .flight-lane-prompt,
  .flight-lane-output {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 100% !important;
  }

  textarea,
  input,
  select,
  button,
  a,
  .output,
  .code-output,
  .json-output {
    touch-action: manipulation !important;
  }
}
</style>
<script id="td613-flight-android-inline-scroll-marker">
(function () {
  document.documentElement.dataset.flightAndroidInlineScrollFix = '${VERSION}';
  if (document.body) document.body.dataset.flightAndroidInlineScrollFix = '${VERSION}';
})();
</script>
`;
}

function inject(html = '') {
  if (html.includes('td613-flight-android-inline-scroll-fix')) return html;
  const patch = androidInlinePatch();
  if (html.includes('</head>')) return html.replace('</head>', patch + '\n</head>');
  if (html.includes('</body>')) return html.replace('</body>', patch + '\n</body>');
  return html + patch;
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
