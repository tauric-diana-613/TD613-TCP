const DISCOVERY_ID = 'apertureCounterToolDiscovery';
const SURFACE_ID = 'td613AperturePedagogueSurfaceInline';

function escapeScriptJson(value) {
  return JSON.stringify(value, null, 2).replaceAll('<', '\\u003c');
}

export function composeShareableApertureHtml({ coreHtml, surfaceModuleSource, discovery }) {
  if (typeof coreHtml !== 'string' || !coreHtml.includes('</head>') || !coreHtml.includes('</body>')) {
    throw new Error('Shareable Aperture composition requires a complete HTML document.');
  }
  if (typeof surfaceModuleSource !== 'string' || !surfaceModuleSource.includes('installAperturePedagogueSurface')) {
    throw new Error('Pedagogue surface module is missing its installer.');
  }
  if (/<\/script/i.test(surfaceModuleSource)) {
    throw new Error('Pedagogue surface module must not contain a closing script token before inline packaging.');
  }
  if (!discovery || discovery.schema !== 'td613.aperture.counter-tool-route-guide/v1') {
    throw new Error('Counter-Tool discovery card is missing or incompatible.');
  }

  let next = coreHtml
    .replace(new RegExp(`<script\\b[^>]*id=["']${DISCOVERY_ID}["'][\\s\\S]*?<\\/script>\\s*`, 'i'), '')
    .replace(new RegExp(`<script\\b[^>]*id=["']${SURFACE_ID}["'][\\s\\S]*?<\\/script>\\s*`, 'i'), '');

  const discoveryBlock = `<script id="${DISCOVERY_ID}" type="application/json">\n${escapeScriptJson(discovery)}\n</script>`;
  const surfaceBlock = `<script id="${SURFACE_ID}" type="module">\n${surfaceModuleSource.trim()}\ninstallAperturePedagogueSurface(document, window);\n</script>`;

  next = next.replace('</head>', `${discoveryBlock}\n</head>`);
  next = next.replace('</body>', `${surfaceBlock}\n</body>`);
  return next;
}

export const APERTURE_PEDAGOGUE_PACKAGE = Object.freeze({
  schema: 'td613.aperture.pedagogue-standalone-package/v1',
  discoveryId: DISCOVERY_ID,
  surfaceId: SURFACE_ID,
  externalRuntimeDependency: false,
  authorityTransfer: false,
  automaticAction: false
});
