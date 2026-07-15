import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('scripts/ash-keep-delivery-boundary-probe.mjs', 'utf8');

for (const marker of [
  'DOCUMENT_READY',
  'EDGE_INTERSTITIAL',
  'NON_HTML',
  'EMPTY_DOCUMENT',
  'H1_ABSENT',
  'NAVIGATION_ERROR',
  'ash-keep-delivery-boundary.json',
  'ash-keep-delivered-document.html',
  'ash-keep-delivery-boundary.png',
  'response_headers',
  'body_text_prefix',
  'final_url',
  'classification',
  'h1_count',
  'diagnostic_timeouts',
  'promotion_authorized: false'
]) assert.ok(source.includes(marker), `missing delivery-boundary marker: ${marker}`);

assert.match(source, /waitUntil: 'domcontentloaded'/);
assert.match(source, /challenge_bypass_attempted: false/);
assert.match(source, /user_agent_overridden: false/);
assert.doesNotMatch(source, /userAgent\s*:/);
assert.doesNotMatch(source, /setExtraHTTPHeaders|addCookies|storageState\s*:/);
assert.doesNotMatch(source, /process\.exit\(1\)/);

console.log('ash-keep-delivery-boundary-probe.test.mjs passed');
