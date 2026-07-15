import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');

const files = {
  gateway: fs.readFileSync(path.join(repoRoot, 'app', 'index.html'), 'utf8'),
  homebase: fs.readFileSync(path.join(repoRoot, 'app', 'homebase.html'), 'utf8'),
  readout: fs.readFileSync(path.join(repoRoot, 'app', 'readout.html'), 'utf8'),
  deck: fs.readFileSync(path.join(repoRoot, 'app', 'deck.html'), 'utf8'),
  trainer: fs.readFileSync(path.join(repoRoot, 'app', 'clone.html'), 'utf8')
};

assert.ok(files.gateway.includes('data-page-kind="gateway"'), 'gateway page exposes gateway page-kind');
assert.ok(files.gateway.includes('id="gatewayPreviewCanvas"'), 'gateway page mounts an Aperture-style preview shell');
assert.ok(files.gateway.includes('id="gatewayPreviewMoire"'), 'gateway page exposes the Moire preview control');
assert.ok(files.gateway.includes('id="gatewayApertureBridgeRail"'), 'gateway page exposes the Aperture bridge rail');
assert.ok(files.homebase.includes('data-page-kind="homebase"'), 'homebase page exposes homebase page-kind');
assert.ok(files.readout.includes('data-page-kind="readout"'), 'readout page exposes readout page-kind');
assert.ok(files.deck.includes('data-page-kind="deck"'), 'deck page exposes deck page-kind');
assert.ok(files.trainer.includes('data-page-kind="clone"'), 'clone page exposes clone page-kind');

assert.ok(files.gateway.includes('data-station-target="play"'), 'gateway page links into Deck');
assert.ok(files.gateway.includes('id="gatewayDoorDeck"'), 'gateway page exposes the Deck room door');
assert.ok(files.gateway.includes('id="gatewayDoorHarbor"'), 'gateway page keeps Safe Harbor visible as a room door');
assert.ok(files.gateway.includes('Open full Aperture'), 'gateway page exposes a standalone Aperture action');
assert.ok(files.gateway.includes('id="gatewayApertureOpenFull" class="gateway-preview-link" href="./aperture/index.html"'), 'gateway opens the canonical Aperture route without a public cache token');
assert.ok(!files.gateway.includes('href="./aperture/index.html?v='), 'gateway should not expose a cache-busted Aperture shim URL');
assert.ok(files.gateway.includes('open chambers'), 'gateway offers a clear non-blocking ingress bypass');
assert.ok(files.homebase.includes('id="viewPaneHomebase"'), 'homebase page mounts the Homebase pane');
assert.ok(files.homebase.includes('Mask gallery'), 'homebase page owns the merged Personas mask gallery');
assert.ok(!fs.existsSync(path.join(repoRoot, 'app', 'personas.html')), 'standalone personas page should not exist after the merge');
for (const station of ['homebase', 'readout', 'deck', 'trainer']) {
  if (station === 'trainer') {
    assert.ok(!files.trainer.includes('Homebase / Personas'), 'Clone removes the retired Homebase / Personas link');
  } else {
    assert.ok(files[station].includes('Homebase / Personas'), `${station} station links to merged Homebase / Personas surface`);
  }
  assert.ok(!files[station].includes('id="tabPersonas"'), `${station} station should not expose a separate Personas tab`);
}
assert.ok(files.readout.includes('id="viewPaneReadout"'), 'readout page mounts the Readout pane');
assert.ok(files.deck.includes('id="viewPanePlay"'), 'deck page mounts the Deck pane');
assert.ok(files.trainer.includes('id="viewPaneTrainer"'), 'clone page mounts the Clone forge pane');
assert.ok(files.gateway.includes('<title>TCP Gateway</title>'), 'gateway has the correct first-paint title');
assert.ok(files.trainer.includes('<title>TD613 Clone</title>'), 'clone has the correct first-paint title');
assert.ok(files.trainer.includes('clone-polish.css'), 'Clone loads its station-specific responsive polish');
assert.ok(files.trainer.includes('TD613 Clone station'), 'Clone does not retain the retired TCP label in its footer');
for (const [relativePath, title] of [
  ['app/aperture/index.html', 'TD613 Aperture'],
  ['app/hush.html', 'TD613 Hush'],
  ['app/adversarial-bench.html', 'TD613 Hush'],
  ['app/safe-harbor/index.html', 'TD613 Safe Harbor'],
  ['app/safe-harbor/td613-flight.html', 'TD613 Flight'],
  ['app/dome-world/index.html', 'Dome-World'],
]) {
  const page = fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
  assert.ok(page.includes(`<title>${title}</title>`), `${relativePath} has the correct first-paint title`);
}
assert.ok(files.deck.includes('id="governedExposurePreview"'), 'deck page exposes governed exposure readout for the shared runtime');
assert.ok(files.deck.includes('id="similarity"'), 'deck page exposes witness metrics for the shared runtime');
assert.ok(files.deck.includes('id="harborBox"'), 'deck page exposes harbor output for the shared runtime');
assert.ok(files.deck.includes('id="heroSignalValue"'), 'deck page exposes hero telemetry for the shared runtime');

const browserMainSource = fs.readFileSync(path.join(repoRoot, 'app', 'browser-main.js'), 'utf8');
const chamberChromeSource = fs.readFileSync(path.join(repoRoot, 'app', 'chamber-chrome.js'), 'utf8');
const assetVersionsSource = fs.readFileSync(path.join(repoRoot, 'app', 'asset-versions.js'), 'utf8');
assert.ok(browserMainSource.includes('redirectLegacyGatewayHashIfNeeded'), 'browser-main redirects legacy gateway hash routes');
assert.ok(browserMainSource.includes('navigateToStation'), 'browser-main uses explicit station navigation');
assert.ok(browserMainSource.includes('ensureSharedRuntimeDock'), 'browser-main injects shared runtime dock markup');
assert.ok(browserMainSource.includes('bootWatchdogTimer'), 'gateway ingress has a watchdog against a stuck opening sequence');
assert.ok(browserMainSource.includes("return new URL('./aperture/index.html', window.location.href).toString();"), 'browser-main keeps Gateway Aperture standalone route canonical');
assert.ok(chamberChromeSource.includes("{ label: 'Aperture', href: './aperture/index.html' }"), 'shared chamber chrome opens canonical Aperture route');
assert.ok(!chamberChromeSource.includes("?v=' + V.aperture"), 'shared chamber chrome must not append public Aperture cache tokens');
const browserMainAssetVersion = assetVersionsSource.match(/main:\s+'(\d+)'/)?.[1];
assert.ok(Number(browserMainAssetVersion) >= 202606211930, 'asset versions retain the Gateway route canonicalization bump or newer');
const apertureAssetVersion = assetVersionsSource.match(/aperture:\s+'(\d+)'/)?.[1];
assert.ok(Number(apertureAssetVersion) >= 202606211930, 'asset versions retain the Aperture canonicalization bump or newer');
assert.ok(assetVersionsSource.includes("chrome:      '202606151735'"), 'asset versions bump chamber chrome after Gateway desktop housekeeping patch');
assert.ok(assetVersionsSource.includes("return 'TD613 Clone';"), 'asset versions preserves Clone title during its early bootstrap');
assert.ok(assetVersionsSource.includes("return 'TCP Gateway';"), 'asset versions preserves Gateway title during its early bootstrap');
assert.ok(assetVersionsSource.includes("return 'TD613 Safe Harbor';"), 'asset versions keeps Safe Harbor title handling explicit');
assert.ok(assetVersionsSource.includes("return 'TD613 Flight';"), 'asset versions keeps Flight title handling explicit');
assert.ok(assetVersionsSource.includes("return 'TD613 Aperture';"), 'asset versions keeps Aperture title handling explicit');
assert.ok(assetVersionsSource.includes("return 'Dome-World';"), 'asset versions keeps Dome-World title handling explicit');
assert.ok(!assetVersionsSource.includes("document.title = 'TD613 Hush'"), 'asset bootstrap no longer overwrites every station title with Hush');

const hushCosmeticSource = fs.readFileSync(path.join(repoRoot, 'app', 'hush-cosmetic-repair.css'), 'utf8');
const hushRailSource = fs.readFileSync(path.join(repoRoot, 'app', 'hush-input-control-rail.js'), 'utf8');
assert.ok(hushCosmeticSource.includes('#hushPr76AuthorshipProfileHost'), 'Hush positions the generated stylometrics host, not only its retired placeholder');
assert.ok(hushCosmeticSource.includes('#hushSuggestedMasksPanel'), 'Hush explicitly places the later route suggestions panel');
assert.ok(hushCosmeticSource.includes('grid-column: 1 / -1'), 'Hush route suggestions span the compact compose grid');
assert.ok(hushCosmeticSource.includes('border-radius: 999px !important'), 'Hush preserves the native pill action grammar');
assert.ok(hushCosmeticSource.includes('grid-template-columns: minmax(0, 1fr) !important'), 'Hush stacks the desktop action rail in one column');
assert.ok(hushCosmeticSource.includes('grid-template-rows: repeat(3, minmax(42px, auto)) !important'), 'Hush desktop rail reserves three intentional action rows');
assert.ok(hushRailSource.includes('Export Stylometrics'), 'Hush exposes a real stylometrics export action');
assert.ok(hushRailSource.includes('exportReportJsonBtn'), 'Hush export reuses the existing report exporter');
assert.ok(hushRailSource.includes('button.disabled = !ready'), 'Hush keeps export asleep until analysis is ready');
const hushRescueSource = fs.readFileSync(path.join(repoRoot, 'app', 'hush-pr75-rescue.js'), 'utf8');
assert.ok(hushRescueSource.includes('grid-template-columns:minmax(0,1fr)!important'), 'Hush rescue rail keeps the desktop stack intact');
assert.ok(hushCosmeticSource.includes('padding-inline: 10px !important'), 'Hush contains the compose surface inside its desktop panel');

const safeHarborHandshakeSource = fs.readFileSync(path.join(repoRoot, 'app', 'safe-harbor', 'app', 'operator-handshake-polish.css'), 'utf8');
assert.ok(safeHarborHandshakeSource.includes('container-type: inline-size'), 'Safe Harbor sizes Handshake content from its narrow card');
assert.ok(safeHarborHandshakeSource.includes('grid-template-columns: 1fr !important'), 'Safe Harbor stacks proof values before they collapse into narrow columns');
assert.ok(safeHarborHandshakeSource.includes('@container (min-width: 560px)'), 'Safe Harbor restores split proof rows only when the card itself is wide enough');

console.log('station-pages.test.mjs passed');

