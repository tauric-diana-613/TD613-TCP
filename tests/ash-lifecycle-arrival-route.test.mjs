import assert from 'node:assert/strict';
import handler from '../api/dome-world-shell.js';

function invoke(req) {
  const headers = new Map();
  let body = '';
  const res = {
    statusCode: 0,
    setHeader(name, value) { headers.set(String(name).toLowerCase(), String(value)); },
    end(value = '') { body = String(value); }
  };
  handler(req, res);
  return { statusCode: res.statusCode, headers, body };
}

const arrivalOnly = invoke({
  method: 'GET',
  url: '/api/dome-world-shell?arrival=cleared',
  query: { arrival: 'cleared' }
});

assert.equal(arrivalOnly.statusCode, 200);
assert.equal(arrivalOnly.headers.get('x-td613-ash-keep-shell'), 'td613.ash-keep.shell/v0.1');
assert.match(arrivalOnly.body, /<title>TD613 Ash Keep · Case Map<\/title>/);
assert.match(arrivalOnly.body, /<meta name="ash-lifecycle" content="v0\.1">/);
assert.match(arrivalOnly.body, /<script type="module" src="\/dome-world\/ash-lifecycle\.js"><\/script>/);
assert.doesNotMatch(arrivalOnly.body, /<title>TD613 Dome-World/);

const explicitSurface = invoke({
  method: 'GET',
  url: '/api/dome-world-shell?surface=ash-keep-html&arrival=cleared',
  query: { surface: 'ash-keep-html', arrival: 'cleared' }
});

assert.equal(explicitSurface.statusCode, 200);
assert.equal(explicitSurface.headers.get('x-td613-ash-keep-shell'), 'td613.ash-keep.shell/v0.1');
assert.match(explicitSurface.body, /name="ash-lifecycle" content="v0\.1"/);

console.log('ash-lifecycle-arrival-route.test.mjs passed');
