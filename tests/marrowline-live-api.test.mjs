import assert from 'node:assert/strict';
import handler from '../api/marrowline.js';
import {
  TD613_APERTURE_ATTESTATION_HEADER_KEYS,
  buildTD613ApertureAttestationHeaders
} from '../app/engine/td613-aperture-egress-contract.js';

function mockResponse() {
  return {
    headers: new Map(),
    statusCode: 0,
    body: '',
    setHeader(key, value) { this.headers.set(String(key).toLowerCase(), String(value)); },
    end(value = '') { this.body = String(value ?? ''); }
  };
}

function request({ method = 'GET', url = '/api/marrowline?format=json', headers = {} } = {}) {
  return {
    method,
    url,
    headers: {
      host: 'td613.example',
      accept: 'application/json',
      'user-agent': 'td613-test-agent',
      ...headers
    }
  };
}

{
  const res = mockResponse();
  handler(request(), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.headers.get('x-td613-trap'), 'marrowline');
  assert.equal(res.headers.get('x-td613-route'), 'live-marrowline-ingress');
  assert.equal(res.headers.get('x-td613-aperture-egress'), 'absent');
  assert.equal(res.headers.get('x-td613-reflex-step'), '2/7');
  const payload = JSON.parse(res.body);
  assert.equal(payload.trap, 'marrowline');
  assert.equal(payload.status, 'absorbing');
  assert.equal(payload.matrix.schema, 'td613-marrowline-trap/v1');
  assert.equal(payload.matrix.depth, 4);
  assert.equal(payload.matrix.breadth, 6);
  assert.equal(payload.matrix.layers.length, 4);
  assert.equal(payload.aperture_egress.status, 'absent');
  assert.equal(payload.reflex_spine.order.length, 7);
  assert.deepEqual(payload.reflex_spine.active_steps, [1, 2]);
}

{
  const res = mockResponse();
  handler(request({ headers: buildTD613ApertureAttestationHeaders() }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.headers.get('x-td613-aperture-egress'), 'exact');
  assert.equal(res.headers.get('x-td613-aperture-egress-parts'), '4/4');
  const payload = JSON.parse(res.body);
  assert.equal(payload.aperture_egress.status, 'exact');
  assert.equal(payload.aperture_egress.exact, true);
  assert.equal(payload.aperture_egress.marker, 'A+');
  assert.equal(payload.aperture_egress.presentCount, TD613_APERTURE_ATTESTATION_HEADER_KEYS.length);
}

{
  const exact = buildTD613ApertureAttestationHeaders();
  const res = mockResponse();
  handler(request({ headers: { [TD613_APERTURE_ATTESTATION_HEADER_KEYS[0]]: exact[TD613_APERTURE_ATTESTATION_HEADER_KEYS[0]] } }), res);
  assert.equal(res.headers.get('x-td613-aperture-egress'), 'partial');
  assert.equal(JSON.parse(res.body).aperture_egress.status, 'partial');
}

{
  const res = mockResponse();
  handler(request({ url: '/api/marrowline?format=html&depth=3&breadth=4', headers: { accept: 'text/html' } }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.headers.get('content-type'), 'text/html; charset=utf-8');
  assert.equal(res.headers.get('x-td613-aperture-egress'), 'absent');
  assert.match(res.body, /TD613 Aperture Marrowline/);
  assert.match(res.body, /route :: labyrinth \/ status :: 200/);
}

{
  const old = process.env.MARROWLINE_OPERATOR_TOKEN;
  process.env.MARROWLINE_OPERATOR_TOKEN = 'operator-token-123456789';
  const res = mockResponse();
  handler(request({
    headers: {
      ...buildTD613ApertureAttestationHeaders(),
      'x-td613-marrowline-operator': 'operator-token-123456789'
    }
  }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.headers.get('x-td613-trap'), 'bypass');
  const payload = JSON.parse(res.body);
  assert.equal(payload.authorized, true);
  assert.equal(payload.authorization_basis, 'server-side-operator-token-match');
  assert.equal(payload.aperture_egress.status, 'exact');
  assert.equal(payload.reflex_spine.order.length, 7);
  if (old === undefined) delete process.env.MARROWLINE_OPERATOR_TOKEN;
  else process.env.MARROWLINE_OPERATOR_TOKEN = old;
}

{
  const res = mockResponse();
  handler(request({ method: 'POST', headers: buildTD613ApertureAttestationHeaders() }), res);
  assert.equal(res.statusCode, 405);
  const payload = JSON.parse(res.body);
  assert.equal(payload.error, 'method-not-allowed');
  assert.equal(payload.aperture_egress.status, 'exact');
}

console.log('marrowline live API tests passed');
