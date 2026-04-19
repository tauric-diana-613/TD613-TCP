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

assert.ok(gatewayHtml.includes('id="gatewayApertureFrame"'), 'gateway HTML includes the Aperture iframe mount');
assert.ok(gatewayHtml.includes('id="gatewayApertureHarborLink"'), 'gateway HTML includes the Aperture-to-Harbor bridge action');
assert.ok(browserMainSource.includes('GATEWAY_APERTURE_HANDOFF_KEY'), 'gateway runtime persists Aperture bridge summaries');
assert.ok(browserMainSource.includes('handleGatewayApertureBridgeMessage'), 'gateway runtime listens for Aperture bridge messages');
assert.ok(browserMainSource.includes('mountGatewayApertureEmbedIfReady'), 'gateway runtime delays the Aperture iframe until ingress is open');
assert.ok(apertureHtml.includes('APERTURE_GATEWAY_EMBED'), 'Aperture runtime exposes an embed-mode branch');
assert.ok(apertureHtml.includes('window.parent.postMessage'), 'Aperture embed can bridge status to the gateway');
assert.ok(harborMainSource.includes('parseGatewayApertureContext'), 'Safe Harbor exposes an Aperture fallback intake path');
assert.ok(harborMainSource.includes("source: 'aperture-gateway'"), 'Safe Harbor tags Aperture fallback input distinctly from TCP query handoff');

console.log('gateway-aperture-embed.test.mjs passed');
