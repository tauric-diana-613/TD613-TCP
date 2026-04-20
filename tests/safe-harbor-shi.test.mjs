import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const harborMainSource = fs.readFileSync(path.join(repoRoot, 'app', 'safe-harbor', 'app', 'main.js'), 'utf8');

assert.ok(
  harborMainSource.includes('function shiNumberPattern()'),
  'Safe Harbor derives SHI validation from the declared format instead of a hardcoded fragment'
);
assert.ok(
  !harborMainSource.includes('/^TD613-SH-9B07D8B-[A-F0-9]{8}$/u'),
  'Safe Harbor no longer hardcodes a single SHI binding fragment into the validator'
);
assert.ok(
  harborMainSource.includes('const available = issued || recoverable || null;'),
  'Safe Harbor treats a recoverable issued SHI as a live surface value'
);
assert.ok(
  harborMainSource.includes('dom.copyShiNumber.disabled = !available;'),
  'SHI copy controls stay usable whenever an issued SHI is still recoverable in session'
);
assert.ok(
  harborMainSource.includes('dom.bypassIngress.disabled = surfaceIsOpen || !typedShiValid;'),
  'Reopen with SHI stays disabled until a real SHI value is entered'
);
assert.ok(
  !harborMainSource.includes('recallReady || isShiNumber'),
  'SHI reopen readiness no longer advertises a live path without an entered code'
);
assert.ok(
  harborMainSource.includes("state.ingress.operatorShellOpen = true;") &&
    harborMainSource.includes("state.ingress.bypass = true;") &&
    harborMainSource.includes("logEvent('bypass-opened'"),
  'A recognized SHI can now actually open the packetless operator shell instead of leaving Harbor trapped behind the membrane'
);
assert.ok(
  harborMainSource.includes("reason: 'valid-shi-blind-recall'"),
  'A valid SHI can now open the operator shell even when no retained packet or stored recall hash is present'
);

console.log('safe-harbor-shi.test.mjs passed');
