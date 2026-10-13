import assert from 'node:assert/strict';
import { listGeminiGenerateContentModels as list } from '../server/gemini-model-policy.js';

const row = id => ({ name: `models/${id}`, supportedGenerationMethods: ['generateContent'] });
const response = (body, status = 200) => ({ ok: status === 200, status, json: async () => body });
let calls = 0;
const scoped = async (url, options) => {
  calls++;
  assert.equal(new URL(url).searchParams.has('key'), false);
  return response({ models: [row(options.headers['x-goog-api-key'] === 'fixture-a' ? 'only-a' : 'only-b')] });
};
const a = await list('fixture-a', { fetchImpl: scoped, at: 1000, force: true });
assert.deepEqual(a.models, ['only-a']);
assert.equal((await list('fixture-a', { fetchImpl: scoped, at: 1001 })).cached, true);
assert.equal(calls, 1);
assert.deepEqual((await list('fixture-b', { fetchImpl: scoped, at: 1002 })).models, ['only-b']);
assert.equal(calls, 2, 'different credential requires independent observation');
assert.equal((await list('', { fetchImpl: scoped, at: 1003 })).ok, false);
assert.equal(calls, 2, 'missing key cannot inherit warm cache or contact provider');
assert.equal((await list('fixture-b', { fetchImpl: scoped, at: 999 })).cached, false, 'later cache cannot rewrite earlier observation');
assert.equal((await list('fixture-b', { fetchImpl: scoped, at: 700000 })).cached, false);
const alternate = async () => response({ models: [row('alternate')] });
assert.deepEqual((await list('fixture-b', { fetchImpl: alternate, at: 700001 })).models, ['alternate']);

const pageTokens = [];
const pages = async url => {
  const token = new URL(url).searchParams.get('pageToken');
  pageTokens.push(token);
  return response(token ? { models: [row('second'), row('first')] } : {
    models: [row('first'), { name: 'models/embedding', supportedGenerationMethods: ['embedContent'] }], nextPageToken: 'next'
  });
};
const complete = await list('fixture-pages', { fetchImpl: pages, at: 1000 });
assert.deepEqual(complete.models, ['first', 'second']);
assert.deepEqual(pageTokens, [null, 'next']);
assert.equal(complete.complete, true);
assert.equal(complete.pageCount, 2);

for (const [name, fetchImpl] of [
  ['partial-http', async url => new URL(url).searchParams.has('pageToken') ? response({}, 403) : response({ models: [row('partial')], nextPageToken: 'next' })],
  ['cycle', async () => response({ models: [row('partial')], nextPageToken: 'again' })],
  ['malformed', async () => response({ models: 'invalid' })],
  ['entry', async () => response({ models: [{ name: 'models/invalid' }] })],
  ['json', async () => ({ ok: true, status: 200, json: async () => { throw Error('fixture-secret'); } })],
  ['transport', async () => { throw Error('fixture-secret'); }],
  ['timeout', async () => new Promise(() => {})],
  ['body-timeout', async () => ({ ok: true, status: 200, json: () => new Promise(() => {}) })]
]) {
  const result = await list('fixture-secret', { fetchImpl, at: 1000, timeoutMs: 15 });
  assert.equal(result.ok, false, name);
  assert.equal(result.complete, false, name);
  assert.deepEqual(result.models, [], `${name}: partial evidence must not become a catalog`);
  assert.equal(JSON.stringify(result).includes('fixture-secret'), false);
}

let page = 0;
const unbounded = await list('fixture-limit', { fetchImpl: async () => response({ models: [], nextPageToken: String(++page) }) });
assert.equal(unbounded.error, 'model-list-page-limit');
assert.equal(page, 10);
let healthy = true;
const refresh = async () => healthy ? response({ models: [row('old')] }) : response({}, 503);
await list('fixture-refresh', { fetchImpl: refresh, at: 1000 });
healthy = false;
assert.equal((await list('fixture-refresh', { fetchImpl: refresh, at: 1001, force: true })).ok, false);
assert.equal((await list('fixture-refresh', { fetchImpl: refresh, at: 1002 })).ok, false, 'failed refresh invalidates matching cached evidence');
let releaseOld;
let concurrentCalls = 0;
const concurrent = async () => ++concurrentCalls === 1
  ? new Promise(resolve => { releaseOld = resolve; }) : response({}, 503);
const old = list('fixture-concurrent', { fetchImpl: concurrent, at: 1000 });
await list('fixture-concurrent', { fetchImpl: concurrent, at: 1001, force: true });
releaseOld(response({ models: [row('superseded')] }));
await old;
assert.equal((await list('fixture-concurrent', { fetchImpl: concurrent, at: 1002 })).ok, false);
console.log('gemini-model-discovery.test.mjs passed');
