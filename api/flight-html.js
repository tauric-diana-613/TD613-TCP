import { readFile } from 'node:fs/promises';
import path from 'node:path';

const VERSION = 'pr138-flight-android-swipe-smooth/v1';

function isAndroidRequest(req) {
  return /Android/i.test(String(req?.headers?.['user-agent'] || ''));
}

function setHeaders(res, active = false) {
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.setHeader('cache-control', 'no-store, max-age=0');
  res.setHeader('x-td613-flight-injector', VERSION);
  res.setHeader('x-td613-flight-android-scroll-fix', active ? 'active' : 'inactive');
}

function androidInlinePatch() {
  return `
<style id="td613-flight-android-inline-scroll-fix">
@media (max-width: 920px) {
  html,
  body {
    min-width: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    min-height: 100dvh !important;
    max-height: none !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    overscroll-behavior-x: none !important;
    overscroll-behavior-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    touch-action: pan-y pinch-zoom !important;
  }

  body.flight-locked,
  html[data-flight-shi-cached="true"] body.flight-locked {
    overflow-x: hidden !important;
    overflow-y: auto !important;
  }

  .page-wrap {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    height: auto !important;
    min-height: 100dvh !important;
    overflow: visible !important;
    padding-inline: max(0.72rem, env(safe-area-inset-left)) max(0.72rem, env(safe-area-inset-right)) !important;
    touch-action: pan-y pinch-zoom !important;
  }

  header {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    padding-right: 0.72rem !important;
  }

  .flight-quick-nav {
    position: static !important;
    justify-content: flex-start !important;
    flex-wrap: wrap !important;
    margin: 0.42rem 0 0 !important;
  }

  .grid {
    display: flex !important;
    grid-template-columns: none !important;
    align-items: stretch !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    height: auto !important;
    min-height: 0 !important;
    gap: 0 !important;
    overflow-x: auto !important;
    overflow-y: visible !important;
    scroll-snap-type: x proximity !important;
    scroll-behavior: auto !important;
    scrollbar-width: none !important;
    overscroll-behavior-x: contain !important;
    touch-action: pan-x pan-y pinch-zoom !important;
    -webkit-overflow-scrolling: touch !important;
    transform: translate3d(0, 0, 0) !important;
    backface-visibility: hidden !important;
    will-change: scroll-position;
  }

  .grid::-webkit-scrollbar {
    display: none !important;
  }

  .grid > div,
  .flight-lane-prompt,
  .flight-lane-output {
    flex: 0 0 100% !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    overflow: visible !important;
    scroll-snap-align: start !important;
    transform: translate3d(0, 0, 0) !important;
    backface-visibility: hidden !important;
    touch-action: pan-x pan-y pinch-zoom !important;
  }

  .card,
  .dev-drawer,
  .drawer-body,
  .output-card,
  .seal-card,
  .copy-bin-card {
    max-width: 100% !important;
    content-visibility: visible !important;
    contain-intrinsic-size: auto !important;
    transform: translateZ(0) !important;
    backface-visibility: hidden !important;
    touch-action: pan-x pan-y pinch-zoom !important;
  }

  body::before,
  body::after,
  .page-wrap::before {
    will-change: auto !important;
  }

  textarea,
  .output,
  .code-output,
  .json-output {
    touch-action: pan-y pinch-zoom !important;
    -webkit-overflow-scrolling: touch !important;
  }

  input,
  select,
  button,
  a,
  summary,
  label {
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

function inject(html = '', active = false) {
  if (!active || html.includes('td613-flight-android-inline-scroll-fix')) return html;
  const patch = androidInlinePatch();
  if (html.includes('</head>')) return html.replace('</head>', patch + '\n</head>');
  if (html.includes('</body>')) return html.replace('</body>', patch + '\n</body>');
  return html + patch;
}

export default async function handler(req, res) {
  const active = isAndroidRequest(req);
  try {
    const filePath = path.join(process.cwd(), 'app', 'safe-harbor', 'td613-flight.html');
    const html = await readFile(filePath, 'utf8');
    setHeaders(res, active);
    return res.status(200).send(inject(html, active));
  } catch (error) {
    setHeaders(res, active);
    return res.status(500).send('<!doctype html><meta charset="utf-8"><title>TD613 Flight unavailable</title><pre>TD613 Flight injector failed: ' + String(error?.message || error).replace(/[<>&]/g, '') + '</pre>');
  }
}
