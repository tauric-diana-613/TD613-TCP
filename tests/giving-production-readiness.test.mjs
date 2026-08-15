import assert from 'node:assert/strict';
import {
  givingProductionSurfaceUrl,
  hasGivingProductionSurface,
  waitForGivingProductionSurface
} from '../scripts/giving-production-readiness.mjs';

const readyHtml = `<!doctype html><html><head><title>TD613 Giving</title></head><body>
  <section id="sessionMembrane"></section>
  <button id="exportCampaignDeputyBundleButton"></button>
  <button id="bulkGivingHistoryButton"></button>
</body></html>`;

assert.equal(hasGivingProductionSurface(readyHtml), true);
assert.equal(hasGivingProductionSurface('<title>TD613 Giving</title>'), false);

const releaseUrl = new URL(givingProductionSurfaceUrl('https://td613.com', {
  sourceCommit: 'a'.repeat(40),
  attempt: 2
}));
assert.equal(releaseUrl.pathname, '/giving/history/');
assert.equal(releaseUrl.searchParams.get('td613-giving-release'), 'a'.repeat(40));
assert.equal(releaseUrl.searchParams.get('readiness-attempt'), '2');

let fetchCount = 0;
let sleepCount = 0;
const observations = [];
const readiness = await waitForGivingProductionSurface({
  baseUrl: 'https://td613.com',
  sourceCommit: 'b'.repeat(40),
  attempts: 3,
  delayMs: 1,
  requestTimeoutMs: 100,
  fetchImpl: async () => {
    fetchCount += 1;
    return {
      ok: true,
      status: 200,
      text: async () => fetchCount === 1 ? '<title>Old Giving</title>' : readyHtml
    };
  },
  sleep: async () => { sleepCount += 1; },
  onAttempt: (observation) => observations.push(observation)
});

assert.equal(readiness.attempt, 2);
assert.equal(readiness.sourceCommit, 'b'.repeat(40));
assert.equal(fetchCount, 2);
assert.equal(sleepCount, 1);
assert.deepEqual(observations.map(({ ready }) => ready), [false, true]);

await assert.rejects(
  waitForGivingProductionSurface({
    baseUrl: 'https://td613.com',
    attempts: 2,
    delayMs: 1,
    requestTimeoutMs: 100,
    fetchImpl: async () => ({ ok: true, status: 200, text: async () => '<html>stale</html>' }),
    sleep: async () => {}
  }),
  /did not become ready after 2 attempts/
);

console.log('giving-production-readiness.test.mjs passed');
