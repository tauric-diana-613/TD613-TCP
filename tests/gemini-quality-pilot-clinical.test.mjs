import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('scripts/run-gemini-quality-pilot.mjs', 'utf8');
assert.doesNotMatch(source, /generateContent\?key=/);
assert.match(source, /geminiGenerateContentUrl/);
assert.match(source, /geminiRequestHeaders/);
assert.match(source, /finishReason === 'STOP'/);
assert.match(source, /outputTokenLimitReached/);
assert.match(source, /state: hardGatesPassed \? 'HARD_GATES_PASSED' : 'HELD'/);

console.log(JSON.stringify({
  schema: 'td613.gemini-quality-pilot-clinical/v0.1',
  provider_calls: 0,
  production_mutation: false,
  completion_gate: 'finishReason=STOP-required',
  credential_transport: 'header-only',
  status: 'PASS'
}));
console.log('gemini-quality-pilot-clinical.test.mjs passed');
