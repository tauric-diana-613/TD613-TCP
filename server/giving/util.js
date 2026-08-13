import crypto from 'node:crypto';
import {
  ALLOWED_UPSTREAM_HOSTS,
  MAX_RESPONSE_BYTES,
  UPSTREAM_TIMEOUT_MS
} from './constants.js';

const MAX_UPSTREAM_TIMEOUT_MS = 55_000;

export class GivingError extends Error {
  constructor(code, message, status = 400, details = undefined) {
    super(message);
    this.name = 'GivingError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  }
  if (typeof value === 'number' && !Number.isFinite(value)) return 'null';
  return JSON.stringify(value ?? null);
}

export function sha256(value) {
  return crypto.createHash('sha256').update(typeof value === 'string' ? value : canonicalJson(value)).digest('hex');
}

export function hmacSha256(secret, value) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

export function constantTimeEqual(left, right) {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  return a.length > 0 && a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function randomId(prefix = 'id') {
  return `${prefix}_${crypto.randomBytes(18).toString('base64url')}`;
}

export function cleanText(value, max = 500) {
  if (value === undefined || value === null) return null;
  const text = String(value).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  return text ? text.slice(0, max) : null;
}

export function requireText(value, field, max = 500) {
  const text = cleanText(value, max);
  if (!text) throw new GivingError('invalid-field', `${field} is required`, 400, { field });
  return text;
}

export function clampInteger(value, min, max, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Math.max(min, Math.min(max, Number.isFinite(parsed) ? parsed : fallback));
}

export function amountToCents(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    return Math.round((value + Number.EPSILON) * 100);
  }
  const raw = String(value).trim();
  if (!raw) return null;
  const negative = /^\s*\(/.test(raw) || /^\s*-/.test(raw);
  const cleaned = raw.replace(/[$,()\s]/g, '').replace(/^-/, '');
  if (!/^\d+(?:\.\d+)?$/.test(cleaned)) return null;
  const [whole, decimal = ''] = cleaned.split('.');
  const hundredths = (decimal + '00').slice(0, 2);
  const third = Number(decimal[2] || '0');
  let cents = (Number(whole) * 100) + Number(hundredths);
  if (third >= 5) cents += 1;
  return negative ? -cents : cents;
}

export function isoDate(value) {
  if (!value) return null;
  const text = String(value).trim();
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const us = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (us) {
    const year = us[3].length === 2 ? `20${us[3]}` : us[3];
    return `${year}-${us[1].padStart(2, '0')}-${us[2].padStart(2, '0')}`;
  }
  return null;
}

export function splitDelimited(text, delimiter = ',') {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  const input = String(text || '').replace(/^\uFEFF/, '');
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === delimiter) {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field.replace(/\r$/, ''));
      if (row.some((entry) => entry !== '')) rows.push(row);
      row = [];
      field = '';
    } else field += char;
  }
  row.push(field.replace(/\r$/, ''));
  if (row.some((entry) => entry !== '')) rows.push(row);
  if (quoted) throw new GivingError('malformed-delimited-source', 'Source ended inside a quoted field', 502);
  return rows;
}

export function rowsToObjects(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map((header, index) => cleanText(header, 120) || `column_${index + 1}`);
  return rows.slice(1).map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ''])));
}

export function pick(object, aliases, fallback = null) {
  const entries = Object.entries(object || {});
  for (const alias of aliases) {
    const direct = entries.find(([key]) => key.toLowerCase().replace(/[^a-z0-9]/g, '') === alias.toLowerCase().replace(/[^a-z0-9]/g, ''));
    if (direct && direct[1] !== '' && direct[1] !== undefined && direct[1] !== null) return direct[1];
  }
  return fallback;
}

export function assertAllowedUrl(value) {
  const url = value instanceof URL ? value : new URL(value);
  if (url.protocol !== 'https:' || !ALLOWED_UPSTREAM_HOSTS.has(url.hostname)) {
    throw new GivingError('upstream-host-withheld', 'Upstream host is not admitted by the Giving source registry', 500, {
      hostname: url.hostname
    });
  }
  return url;
}

export async function fetchWithBoundary(url, options = {}, boundary = {}) {
  const target = assertAllowedUrl(url);
  const timeoutMs = clampInteger(boundary.timeoutMs, 1_000, MAX_UPSTREAM_TIMEOUT_MS, UPSTREAM_TIMEOUT_MS);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error('upstream-timeout')), timeoutMs);
  try {
    const response = await (boundary.fetchImpl || fetch)(target, {
      ...options,
      redirect: 'error',
      signal: controller.signal
    });
    const contentLength = Number(response.headers?.get?.('content-length') || 0);
    if (contentLength > MAX_RESPONSE_BYTES) {
      throw new GivingError('upstream-response-oversized', 'Source response exceeds the Giving page boundary; narrow the search', 413, {
        limit_bytes: MAX_RESPONSE_BYTES
      });
    }
    return response;
  } catch (error) {
    if (error instanceof GivingError) throw error;
    if (error?.name === 'AbortError' || String(error?.message).includes('timeout')) {
      throw new GivingError('upstream-timeout', 'Source did not complete within the bounded retrieval window', 504);
    }
    throw new GivingError('upstream-unavailable', 'Source retrieval failed without establishing a zero-result claim', 502);
  } finally {
    clearTimeout(timer);
  }
}

export async function readBoundedText(response) {
  const text = await response.text();
  if (Buffer.byteLength(text) > MAX_RESPONSE_BYTES) {
    throw new GivingError('upstream-response-oversized', 'Source response exceeds the Giving page boundary; narrow the search', 413, {
      limit_bytes: MAX_RESPONSE_BYTES
    });
  }
  return text;
}

export function headerValue(req, name) {
  const target = String(name).toLowerCase();
  const pair = Object.entries(req?.headers || {}).find(([key]) => String(key).toLowerCase() === target);
  const value = pair?.[1];
  return Array.isArray(value) ? String(value[0] || '') : String(value || '');
}

export function safeJsonParse(text, code = 'invalid-json') {
  if (text && typeof text === 'object' && !Buffer.isBuffer(text) && !ArrayBuffer.isView(text) && !(text instanceof ArrayBuffer)) {
    return text;
  }
  try {
    return JSON.parse(typeof text === 'string' ? text : bodyChunkForJson(text));
  } catch {
    throw new GivingError(code, 'Expected a valid JSON object', 400);
  }
}

function bodyChunkForJson(value) {
  if (Buffer.isBuffer(value)) return value.toString('utf8');
  if (ArrayBuffer.isView(value)) return Buffer.from(value.buffer, value.byteOffset, value.byteLength).toString('utf8');
  if (value instanceof ArrayBuffer) return Buffer.from(value).toString('utf8');
  return String(value ?? '');
}

export const _utilInternals = Object.freeze({ MAX_UPSTREAM_TIMEOUT_MS });
