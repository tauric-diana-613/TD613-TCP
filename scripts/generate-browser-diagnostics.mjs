import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DIAGNOSTIC_BATTERY, DIAGNOSTIC_CORPUS } from '../app/data/diagnostics.js';
import { runSafeHarborDiagnostics } from './lib/safe-harbor-diagnostics.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const browserDiagnosticsPath = path.join(repoRoot, 'app', 'browser-diagnostics.js');
const safeHarborAudit = runSafeHarborDiagnostics({ repoRoot });

const payload = {
  diagnostic_corpus: DIAGNOSTIC_CORPUS,
  diagnostic_battery: DIAGNOSTIC_BATTERY,
  diagnostic_annexes: {
    safeHarbor: safeHarborAudit
  }
};

const browserSource = [
  '(function () {',
  '  window.TCP_DATA = window.TCP_DATA || {};',
  `  Object.assign(window.TCP_DATA, ${JSON.stringify(payload, null, 2)});`,
  '})();',
  ''
].join('\n');

fs.writeFileSync(browserDiagnosticsPath, browserSource, 'utf8');
console.log('browser-diagnostics.js regenerated from app/data/diagnostics.js');
