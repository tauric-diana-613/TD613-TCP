import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const bridge = readFileSync('app/dome-world/ash-workspace-bridge.js', 'utf8');
const surface = readFileSync('app/dome-world/ash-custodian-return.js', 'utf8');
const engine = readFileSync('app/engine/ash-custodian-return.js', 'utf8');

assert.match(bridge, /ash-custodian-return\.js/);
assert.match(surface, /td613\.ash\.custodian-return\/v0\.1/);
assert.match(surface, /td613-ash-return-sandbox/);
assert.match(surface, /live case remained untouched/i);
assert.match(surface, /purpose-shaped projection/i);
assert.match(surface, /universal score/i);
assert.match(engine, /live_case_mutated: false/);
assert.match(engine, /universal_score_emitted: false/);
assert.match(engine, /null_outcomes_preserved: true/);
assert.match(engine, /contradictory_outcomes_preserved: true/);
assert.match(engine, /rejected_outcomes_preserved: true/);
assert.match(engine, /unresolved_outcomes_preserved: true/);
assert.doesNotMatch(surface, /recipient_transport\s*[:=]\s*['"](?:ENABLED|ACTIVE|SENT)/i);
assert.doesNotMatch(surface, /fetch\s*\(/, 'Stretch 2 must not call an external provider or transport route.');

console.log('Ash Custodian Return integration contract: PASS');
