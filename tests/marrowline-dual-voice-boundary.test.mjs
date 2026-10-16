import test from 'node:test';
import assert from 'node:assert/strict';
import { bothMarrowlineVoicesAbsent } from '../server/khonapolit-quality.js';
import { parseRelayEnvelope } from '../app/dome-world/khonapolit-relay.js';

test('a completed response without either required speaker is not a valid transmission', () => {
  const unvoiced = parseRelayEnvelope('The moon is made of paperwork, according to the committee.');
  assert.equal(bothMarrowlineVoicesAbsent(unvoiced), true);
  assert.equal(bothMarrowlineVoicesAbsent(parseRelayEnvelope('Kʰonapolit\\nAn argument.')), false);
  assert.equal(bothMarrowlineVoicesAbsent(parseRelayEnvelope('Tauric Diana bots\\nChorus.')), false);
});
