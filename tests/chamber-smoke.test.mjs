// JSDOM-based smoke test for every chamber HTML page.
//
// Asserts each chamber loads without jsdom-level errors and that:
//   - asset-versions.js populated window.TD613_ASSET_VERSIONS
//   - td613-constants.js populated window.TD613_CONSTANTS
//   - chamber-chrome.js painted the masthead nav (station chambers only)
//
// JSDOM is used with runScripts:'dangerously' + resources:'usable' so the
// chamber-bootstrap.js document.write chain can fetch and execute the
// downstream scripts (browser-data → diagnostics → engine → fixtures →
// main → chrome) the same way a real browser does.
//
// Canvas is stubbed: JSDOM lacks a canvas implementation by default and
// browser-main calls getContext('2d') on Gateway preview canvases. We
// install a no-op context returner before any script runs.

import assert from 'assert';
import { readFileSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, resolve } from 'path';
import { JSDOM, VirtualConsole } from 'jsdom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_DIR = resolve(__dirname, '..', 'app');

const CHAMBERS = [
  { name: 'Gateway',  file: 'index.html',    hasNav: false },
  { name: 'Deck',     file: 'deck.html',     hasNav: true  },
  { name: 'Trainer',  file: 'trainer.html',  hasNav: true  },
  { name: 'Readout',  file: 'readout.html',  hasNav: true  },
  { name: 'Homebase / Personas', file: 'homebase.html', hasNav: true  }
];

function makeCanvasStub() {
  const noop = () => {};
  const stub = {
    fillRect: noop, clearRect: noop, strokeRect: noop,
    getImageData: () => ({ data: new Uint8ClampedArray(4) }),
    putImageData: noop, createImageData: () => ({ data: new Uint8ClampedArray(4) }),
    setTransform: noop, resetTransform: noop, drawImage: noop,
    save: noop, restore: noop, fillText: noop, strokeText: noop,
    beginPath: noop, moveTo: noop, lineTo: noop, closePath: noop,
    stroke: noop, fill: noop, clip: noop,
    translate: noop, scale: noop, rotate: noop,
    arc: noop, arcTo: noop, rect: noop, ellipse: noop,
    quadraticCurveTo: noop, bezierCurveTo: noop,
    measureText: () => ({ width: 0 }), transform: noop,
    getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
    isPointInPath: () => false, isPointInStroke: () => false,
    createLinearGradient: () => stub,
    createRadialGradient: () => stub,
    createPattern: () => stub,
    setLineDash: noop, getLineDash: () => [],
    canvas: null
  };
  return () => stub;
}

async function loadChamber(file) {
  const filePath = resolve(APP_DIR, file);
  const html = readFileSync(filePath, 'utf8');

  const jsdomErrors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (err) => jsdomErrors.push(err));
  // Author console.{log,warn,error} is expected and not a failure signal.

  const dom = new JSDOM(html, {
    url: pathToFileURL(filePath).href,
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    virtualConsole
  });

  // Install canvas stub before chamber-bootstrap finishes injecting scripts.
  // (JSDOM creates HTMLCanvasElement.prototype lazily; touch it once.)
  dom.window.HTMLCanvasElement.prototype.getContext = makeCanvasStub();

  // Wait for window 'load' (after all sub-resources resolve).
  if (dom.window.document.readyState !== 'complete') {
    await new Promise((resolveP) => {
      const onLoad = () => resolveP();
      dom.window.addEventListener('load', onLoad);
      // Safety timeout in case a never-resolving fetch hangs.
      setTimeout(onLoad, 10000);
    });
  }

  // Yield to let DOMContentLoaded handlers (chamber-chrome paintNav) run.
  await new Promise((r) => setTimeout(r, 150));

  return { dom, jsdomErrors };
}

function shortError(err) {
  const msg = err.message || String(err);
  return msg.length > 200 ? msg.slice(0, 200) + '…' : msg;
}

let failures = 0;
for (const chamber of CHAMBERS) {
  const label = `smoke: ${chamber.name.padEnd(10)} (${chamber.file.padEnd(14)}) `;
  try {
    const { dom, jsdomErrors } = await loadChamber(chamber.file);
    const { window } = dom;

    assert.equal(
      jsdomErrors.length, 0,
      `jsdom errors during load: ${jsdomErrors.map(shortError).join(' | ')}`
    );

    assert.ok(window.TD613_ASSET_VERSIONS, 'asset-versions.js did not set TD613_ASSET_VERSIONS');
    assert.equal(typeof window.TD613_ASSET_VERSIONS.styles, 'string', 'TD613_ASSET_VERSIONS.styles missing');
    assert.equal(typeof window.TD613_ASSET_VERSIONS.main, 'string', 'TD613_ASSET_VERSIONS.main missing');

    assert.ok(window.TD613_CONSTANTS, 'td613-constants.js did not set TD613_CONSTANTS');
    assert.equal(
      window.TD613_CONSTANTS.GATEWAY_APERTURE_HANDOFF_KEY,
      'td613.gateway.aperture-handoff',
      'storage key drifted from canonical value'
    );
    assert.equal(
      typeof window.TD613_CONSTANTS.validateHandoffEnvelope,
      'function',
      'validateHandoffEnvelope missing from constants'
    );

    if (chamber.hasNav) {
      const navContainer = window.document.querySelector('.station-masthead-links');
      assert.ok(navContainer, '.station-masthead-links container missing');
      const links = navContainer.querySelectorAll('a.gateway-link');
      assert.ok(
        links.length >= 2,
        `chamber-chrome did not paint nav links — found ${links.length}, expected >= 2`
      );
    }

    process.stdout.write(label + 'OK\n');
    dom.window.close();
  } catch (err) {
    failures++;
    process.stdout.write(label + 'FAIL\n');
    console.error('  ' + shortError(err));
  }
}

if (failures > 0) {
  console.error(`\n${failures} chamber(s) failed smoke test`);
  process.exit(1);
}
console.log('\nall chambers loaded cleanly');
