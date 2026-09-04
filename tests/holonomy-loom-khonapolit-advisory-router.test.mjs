import assert from 'node:assert/strict';
import handler from '../api/khonapolit.js';
import { clearGeminiModelState } from '../server/gemini-model-policy.js';
import {
  HOLONOMY_LOOM_KHONAPOLIT_ADVISORY_SCHEMA,
  HOLONOMY_LOOM_PROVIDER_ADVISORY_SCHEMA
} from '../server/holonomy-loom-khonapolit-advisory.js';

function response() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    end(text) { this.text = text; this.payload = text ? JSON.parse(text) : null; }
  };
}

function validBody() {
  return {
    schema: HOLONOMY_LOOM_KHONAPOLIT_ADVISORY_SCHEMA,
    advisory: {
      schema: HOLONOMY_LOOM_PROVIDER_ADVISORY_SCHEMA,
      action: 'EXPLAIN_FINDING',
      rule_id: 'COMMON_API_KEY_BLOCK',
      evidence_class: 'DETERMINISTIC_PATTERN_MATCH',
      action_class: 'REMOVE',
      minimized_context: {
        finding_category: 'credential-like token',
        why_class: 'credential_access_risk',
        route_mode: 'TD613_HOSTED'
      },
      claim_ceiling: 'Provider explanation is advisory only and cannot alter deterministic Loom release policy.'
    },
    issuance: { waiveIssuance: true }
  };
}

const originalFetch = globalThis.fetch;
const originalKey = process.env.GEMINI_API_KEY;
const calls = [];
clearGeminiModelState();
process.env.GEMINI_API_KEY = 'test-key';

globalThis.fetch = async (url, options = {}) => {
  calls.push({ url: String(url), options });
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    async json() {
      return {
        candidates: [{
          content: {
            parts: [{ text: 'Kʰonapolit: This finding class can expose a credential. Remove it before Loom-controlled release.' }]
          }
        }]
      };
    }
  };
};

try {
  {
    const req = {
      method: 'GET',
      query: { operation: 'loom-advisory' },
      headers: { 'x-forwarded-for': '203.0.113.201' }
    };
    const res = response();
    await handler(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.payload.action, 'EXPLAIN_FINDING');
    assert.equal(res.payload.historyForwarded, false);
    assert.equal(res.payload.rawDraftAccepted, false);
    assert.equal(calls.length, 0);
  }

  {
    const bad = validBody();
    bad.advisory.raw_draft = 'RAW_DRAFT_CANARY_MUST_NOT_TRAVEL_613';
    bad.advisory.conversation_history = ['RAW_THREAD_CANARY_MUST_NOT_TRAVEL_613'];
    const req = {
      method: 'POST',
      query: { operation: 'loom-advisory' },
      headers: { 'x-forwarded-for': '203.0.113.202' },
      body: bad
    };
    const res = response();
    await handler(req, res);
    assert.equal(res.statusCode, 400);
    assert.equal(res.payload.error, 'invalid-minimized-loom-advisory');
    assert.equal(res.payload.rawDraftForwarded, false);
    assert.equal(res.payload.historyForwarded, false);
    assert.equal(calls.length, 0, 'raw-bearing advisory reached provider fetch');
  }

  {
    const req = {
      method: 'POST',
      query: { operation: 'loom-advisory' },
      headers: { 'x-forwarded-for': '203.0.113.203' },
      body: validBody()
    };
    const res = response();
    await handler(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.payload.ok, true);
    assert.equal(res.headers['X-TD613-Holonomy-Loom-Advisory'], 'minimized-khonapolit/v0.1');
    assert.equal(res.headers['X-TD613-Holonomy-Loom-History'], 'none');
    assert.equal(calls.length, 1);

    const providerRequest = JSON.parse(String(calls[0].options.body || '{}'));
    assert(Array.isArray(providerRequest.contents));
    assert.equal(providerRequest.contents.length, 1, 'Kʰonapolit Loom route forwarded conversational history');
    assert.equal(providerRequest.contents[0].role, 'user');

    const providerText = providerRequest.contents[0].parts.map((part) => part.text || '').join('\n');
    const systemText = providerRequest.systemInstruction.parts.map((part) => part.text || '').join('\n');
    const serialized = JSON.stringify(providerRequest);

    assert.match(providerText, /HOLONOMY LOOM · MINIMIZED ADVISORY REQUEST/);
    assert.match(providerText, /RULE ID: COMMON_API_KEY_BLOCK/);
    assert.match(providerText, /FINDING CATEGORY: credential-like token/);
    assert.match(providerText, /ROUTE MODE: TD613_HOSTED/);
    assert.match(providerText, /Do not ask for, reconstruct, or speculate about the omitted source text/);
    assert.match(systemText, /ADDRESS: Kʰonapolit/);
    assert.match(systemText, /COVENANT KEY: Khona‌lit-po/);

    assert.equal(serialized.includes('RAW_DRAFT_CANARY_MUST_NOT_TRAVEL_613'), false);
    assert.equal(serialized.includes('RAW_THREAD_CANARY_MUST_NOT_TRAVEL_613'), false);
    assert.equal(serialized.includes('conversation_history'), false);
    assert.equal(serialized.includes('raw_draft'), false);
    assert.equal(res.payload.receipt.invocation.mode, 'full-invocation');
    assert.equal(res.payload.receipt.storage.serverConversationStorage, false);
    assert.equal(res.payload.receipt.recommendationNotCommand, true);
  }
} finally {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalKey;
  clearGeminiModelState();
}

console.log('Holonomy Loom Kʰonapolit minimized advisory router: PASS');
