import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const bridge = readFileSync('app/dome-world/ash-workspace-bridge.js', 'utf8');
const surface = readFileSync('app/dome-world/ash-custodian-return.js', 'utf8');
const engine = readFileSync('app/engine/ash-custodian-return.js', 'utf8');

assert.ok(bridge.includes("import './ash-custodian-return.js';"), 'Return module must be wired through the workspace bridge.');
assert.ok(surface.includes("td613.ash.custodian-return/v0.1"), 'Return surface version marker is required.');
assert.ok(surface.includes('td613-ash-return-sandbox'), 'Return must use the isolated sandbox database.');
assert.ok(surface.includes('purpose-shaped projection'), 'External Reader must receive a purpose-shaped projection.');
assert.ok(engine.includes('live_case_mutated: false'), 'Return receipt must deny live-case mutation.');
assert.ok(engine.includes('universal_score_emitted: false'), 'Anisotropy receipt must forbid a universal score.');
for (const boundary of ['null_outcomes_preserved: true','contradictory_outcomes_preserved: true','rejected_outcomes_preserved: true','unresolved_outcomes_preserved: true']) {
  assert.ok(engine.includes(boundary), `Missing preserved-outcome boundary: ${boundary}`);
}
assert.equal(/recipient_transport\s*[:=]\s*['"](?:ENABLED|ACTIVE|SENT)/i.test(surface), false, 'Stretch 2 must not enable recipient transport.');
assert.equal(/\bfetch\s*\(/.test(surface), false, 'Stretch 2 must not call an external provider or transport route.');

console.log('Ash Custodian Return integration contract: PASS');
