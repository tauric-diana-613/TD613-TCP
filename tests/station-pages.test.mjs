import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');

const files = {
  gateway: fs.readFileSync(path.join(repoRoot, 'app', 'index.html'), 'utf8'),
  homebase: fs.readFileSync(path.join(repoRoot, 'app', 'homebase.html'), 'utf8'),
  personas: fs.readFileSync(path.join(repoRoot, 'app', 'personas.html'), 'utf8'),
  readout: fs.readFileSync(path.join(repoRoot, 'app', 'readout.html'), 'utf8'),
  deck: fs.readFileSync(path.join(repoRoot, 'app', 'deck.html'), 'utf8'),
  trainer: fs.readFileSync(path.join(repoRoot, 'app', 'trainer.html'), 'utf8')
};

assert.ok(files.gateway.includes('data-page-kind="gateway"'), 'gateway page exposes gateway page-kind');
assert.ok(files.gateway.includes('id="gatewayPreviewCanvas"'), 'gateway page mounts an Aperture-style preview shell');
assert.ok(files.gateway.includes('id="gatewayPreviewMoire"'), 'gateway page exposes the Moire preview control');
assert.ok(files.gateway.includes('id="gatewayApertureBridgeRail"'), 'gateway page exposes the Aperture bridge rail');
assert.ok(files.homebase.includes('data-page-kind="homebase"'), 'homebase page exposes homebase page-kind');
assert.ok(files.personas.includes('data-page-kind="personas"'), 'personas page exposes personas page-kind');
assert.ok(files.readout.includes('data-page-kind="readout"'), 'readout page exposes readout page-kind');
assert.ok(files.deck.includes('data-page-kind="deck"'), 'deck page exposes deck page-kind');
assert.ok(files.trainer.includes('data-page-kind="trainer"'), 'trainer page exposes trainer page-kind');

assert.ok(files.gateway.includes('data-station-target="play"'), 'gateway page links into Deck');
assert.ok(files.gateway.includes('id="gatewayDoorDeck"'), 'gateway page exposes the Deck room door');
assert.ok(files.gateway.includes('id="gatewayDoorHarbor"'), 'gateway page keeps Safe Harbor visible as a room door');
assert.ok(files.gateway.includes('Open full Aperture'), 'gateway page exposes a standalone Aperture action');
assert.ok(files.homebase.includes('id="viewPaneHomebase"'), 'homebase page mounts the Homebase pane');
assert.ok(files.personas.includes('id="viewPanePersonas"'), 'personas page mounts the Personas pane');
assert.ok(files.readout.includes('id="viewPaneReadout"'), 'readout page mounts the Readout pane');
assert.ok(files.deck.includes('id="viewPanePlay"'), 'deck page mounts the Deck pane');
assert.ok(files.trainer.includes('id="viewPaneTrainer"'), 'trainer page mounts the Trainer pane');

const browserMainSource = fs.readFileSync(path.join(repoRoot, 'app', 'browser-main.js'), 'utf8');
assert.ok(browserMainSource.includes('redirectLegacyGatewayHashIfNeeded'), 'browser-main redirects legacy gateway hash routes');
assert.ok(browserMainSource.includes('navigateToStation'), 'browser-main uses explicit station navigation');
assert.ok(browserMainSource.includes('ensureSharedRuntimeDock'), 'browser-main injects shared runtime dock markup');

console.log('station-pages.test.mjs passed');
