import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');

const gatewayHtml = fs.readFileSync(path.join(repoRoot, 'app', 'index.html'), 'utf8');
const browserMainSource = fs.readFileSync(path.join(repoRoot, 'app', 'browser-main.js'), 'utf8');
const apertureHtml = fs.readFileSync(path.join(repoRoot, 'app', 'aperture', 'index.html'), 'utf8');
const harborMainSource = fs.readFileSync(path.join(repoRoot, 'app', 'safe-harbor', 'app', 'main.js'), 'utf8');

assert.ok(gatewayHtml.includes('id="gatewayPreviewCanvas"'), 'gateway HTML includes the centered Aperture field preview');
assert.ok(gatewayHtml.includes('id="gatewayPreviewMoire"'), 'gateway HTML exposes the gateway Moire control');
assert.ok(gatewayHtml.includes('id="gatewayPreviewRun"'), 'gateway HTML exposes the gateway Propagate control');
assert.ok(gatewayHtml.includes('id="gatewayApertureHarborLink"'), 'gateway HTML includes the Aperture-to-Harbor bridge action');
assert.ok(browserMainSource.includes('GATEWAY_APERTURE_HANDOFF_KEY'), 'gateway runtime persists Aperture bridge summaries');
assert.ok(browserMainSource.includes('handleGatewayApertureBridgeMessage'), 'gateway runtime still accepts same-origin Aperture bridge messages');
assert.ok(browserMainSource.includes('handleGatewayApertureStorageEvent'), 'gateway runtime listens for stored Aperture lane updates');
assert.ok(browserMainSource.includes('initGatewayPreview'), 'gateway runtime initializes the standalone-style Aperture preview');
assert.ok(browserMainSource.includes('toggleGatewayPreviewMoire'), 'gateway runtime exposes a dedicated Moire preview control');
assert.ok(apertureHtml.includes('APERTURE_GATEWAY_EMBED'), 'Aperture runtime exposes an embed-mode branch');
assert.ok(apertureHtml.includes('window.parent.postMessage'), 'Aperture embed can bridge status to the gateway');
assert.ok(apertureHtml.includes('sessionStorage.setItem(GATEWAY_APERTURE_HANDOFF_KEY'), 'Aperture persists its latest handoff summary for the gateway and Safe Harbor');
assert.ok(apertureHtml.includes('if (typeof drawMain === "function") drawMain();'), 'Aperture redraws the main field after resize so the center geometry stays visible');
assert.ok(harborMainSource.includes('parseGatewayApertureContext'), 'Safe Harbor exposes an Aperture fallback intake path');
assert.ok(harborMainSource.includes("source: 'aperture-gateway'"), 'Safe Harbor tags Aperture fallback input distinctly from TCP query handoff');

console.log('gateway-aperture-embed.test.mjs passed');
