import crypto from 'node:crypto';
import { _serveMarrowlineTrap } from '../app/engine/td613-aperture.js';
import {
  TD613_APERTURE_ATTESTATION_HEADER_KEYS,
  observeTD613ApertureEgress
} from '../app/engine/td613-aperture-egress-contract.js';
import { TD613_REFLEX_ORDER } from '../app/dome-world/reflex-spine.js';

const VERSION = 'td613.marrowline.live-ingress/v2-aperture-egress';
const OPERATOR_HEADER = 'x-td613-marrowline-operator';

function clampInt(value, min, max, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Math.max(min, Math.min(max, Number.isFinite(parsed) ? parsed : fallback));
}

function headerValue(headers = {}, key = '') {
  const target = String(key).toLowerCase();
  const entry = Object.entries(headers || {}).find(([name]) => String(name).toLowerCase() === target);
  return entry ? String(entry[1] ?? '') : '';
}

function operatorToken(req) {
  const direct = headerValue(req?.headers, OPERATOR_HEADER).trim();
  if (direct) return direct;
  const authorization = headerValue(req?.headers, 'authorization').trim();
  return authorization.replace(/^Bearer\s+/i, '').trim();
}

function constantTimeEqual(left = '', right = '') {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  if (!a.length || a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function operatorAuthorized(req) {
  const expected = String(process.env.MARROWLINE_OPERATOR_TOKEN || '').trim();
  const supplied = operatorToken(req);
  return Boolean(expected && supplied && constantTimeEqual(expected, supplied));
}

function requestEnvelope(req = {}) {
  const host = headerValue(req.headers, 'host');
  return {
    method: String(req.method || 'GET').toUpperCase(),
    url: String(req.url || '/api/marrowline'),
    host,
    hostname: host.split(':')[0],
    headers: { ...(req.headers || {}) }
  };
}

function setHeaders(res, headers = {}) {
  for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);
}

function write(res, status, body, headers = {}) {
  res.statusCode = status;
  setHeaders(res, headers);
  res.end(body);
}

function apertureResponseHeaders(observation = {}) {
  return {
    'X-TD613-Aperture-Egress': observation.status || 'absent',
    'X-TD613-Aperture-Egress-Parts': `${observation.presentCount || 0}/${observation.requiredCount || TD613_APERTURE_ATTESTATION_HEADER_KEYS.length}`,
    'X-TD613-Reflex-Step': '2/7'
  };
}

function addIngressReceiptToBody(result = {}, observation = {}) {
  const contentType = String(result.headers?.['content-type'] || '').toLowerCase();
  if (!contentType.includes('application/json')) return result.body;
  try {
    const payload = JSON.parse(result.body);
    return JSON.stringify({
      ...payload,
      aperture_egress: observation,
      reflex_spine: {
        schema: 'td613.dome-world.reflex-spine/v1',
        active_steps: [1, 2],
        order: TD613_REFLEX_ORDER
      }
    });
  } catch {
    return result.body;
  }
}

export default function handler(req, res) {
  const apertureEgress = observeTD613ApertureEgress(req?.headers || {});
  setHeaders(res, {
    'Cache-Control': 'no-store, max-age=0',
    'X-Content-Type-Options': 'nosniff',
    'X-TD613-Marrowline-Live': VERSION,
    'Vary': 'Accept, User-Agent',
    ...apertureResponseHeaders(apertureEgress)
  });

  if (String(req.method || '').toUpperCase() === 'OPTIONS') {
    write(res, 204, '', {
      'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
      'Access-Control-Allow-Headers': [
        'Accept',
        'Authorization',
        OPERATOR_HEADER,
        ...TD613_APERTURE_ATTESTATION_HEADER_KEYS
      ].join(','),
      'Access-Control-Max-Age': '600'
    });
    return;
  }

  if (!['GET', 'HEAD'].includes(String(req.method || '').toUpperCase())) {
    write(res, 405, JSON.stringify({
      protocol: VERSION,
      ok: false,
      error: 'method-not-allowed',
      allowed: ['GET', 'HEAD', 'OPTIONS'],
      aperture_egress: apertureEgress
    }), {
      'Content-Type': 'application/json; charset=utf-8',
      'Allow': 'GET, HEAD, OPTIONS'
    });
    return;
  }

  const requestUrl = new URL(req.url || '/api/marrowline', `https://${headerValue(req.headers, 'host') || 'td613.local'}`);
  const format = ['html', 'json', 'auto'].includes(requestUrl.searchParams.get('format'))
    ? requestUrl.searchParams.get('format')
    : 'auto';
  const depth = clampInt(requestUrl.searchParams.get('depth'), 3, 7, 4);
  const breadth = clampInt(requestUrl.searchParams.get('breadth'), 4, 10, 6);

  if (operatorAuthorized(req)) {
    const payload = JSON.stringify({
      protocol: VERSION,
      trap: false,
      authorized: true,
      authorization_basis: 'server-side-operator-token-match',
      route: 'operator-bypass',
      aperture_egress: apertureEgress,
      reflex_spine: {
        schema: 'td613.dome-world.reflex-spine/v1',
        active_steps: [1, 2],
        order: TD613_REFLEX_ORDER
      },
      claim_ceiling: 'operator-token-match-not-identity-authorship-or-legal-authority-proof'
    });
    write(res, 200, String(req.method).toUpperCase() === 'HEAD' ? '' : payload, {
      'Content-Type': 'application/json; charset=utf-8',
      'X-TD613-Trap': 'bypass',
      'X-TD613-Route': 'operator-bypass'
    });
    return;
  }

  const result = _serveMarrowlineTrap({
    request: requestEnvelope(req),
    format,
    depth,
    breadth
  });
  const body = String(req.method).toUpperCase() === 'HEAD'
    ? ''
    : addIngressReceiptToBody(result, apertureEgress);

  write(
    res,
    result.status,
    body,
    {
      ...result.headers,
      'X-TD613-Route': 'live-marrowline-ingress',
      'X-TD613-Authorization': 'not-present'
    }
  );
}
