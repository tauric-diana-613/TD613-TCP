import assert from 'node:assert/strict';
import fs from 'node:fs';
const probe=fs.readFileSync('scripts/flowcore-context-deployment-probe.mjs','utf8');
assert.match(probe,/phase-3-active/);
assert.match(probe,/td613\.flowcore\.context-receipt\/v0\.1/);
assert.match(probe,/artifact_reference!==null/);
assert.match(probe,/privateByDefault/);
assert.doesNotMatch(probe,/ash-custody|Cinder|automatic_ash_action\s*=\s*true/);
console.log('Flow-Core Phase III deployment probe contract passes.');
