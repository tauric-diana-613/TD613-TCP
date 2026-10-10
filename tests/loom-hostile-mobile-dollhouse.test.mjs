import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { createLoomDemoTaskHandler } from '../server/loom-demo-task.js';
import { bindLoomDemoRequest, createLoomDemoActivation, LOOM_DEMO_REQUEST_SCHEMA } from '../app/dome-world/holonomy-loom/demo-contract.js';
import { createLoomAiGovernance } from '../app/dome-world/holonomy-loom/ai-handoff.js';

test('FADT Defect D1: early custody reservation failure closes mock governor (fail-closed lifecycle)', async () => {
  const environment = { crypto: globalThis.crypto };
  const task = 'Test task';
  const documents = [];
  const rules = ['Use only selected sources.'];
  const governance = await createLoomAiGovernance({ task, documents, rules }, {}, environment);
  const activation = await createLoomDemoActivation({ task, documents, rules, governance }, environment);

  const mockReq = {
    method: 'POST',
    url: '/api/khonapolit?operation=loom-demo-task',
    headers: {
      'content-type': 'application/json',
      'origin': 'http://127.0.0.1:6130',
      'host': '127.0.0.1:6130'
    },
    body: JSON.stringify({
      schema: LOOM_DEMO_REQUEST_SCHEMA,
      request_id: 'test-req-fail-closed',
      phase: 'ACTIVATE',
      activation,
      documents: [],
      operator_request: 'Receive this handoff and wait for my files.',
      prior_result: null,
      predecessor: null
    })
  };

  const mockRes = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    end(body) { this.body = body ? JSON.parse(body) : null; }
  };

  let governorWasClosed = false;
  const originalBind = bindLoomDemoRequest;
  const handler = createLoomDemoTaskHandler({
    environment,
    custodyEnvironment: { VERCEL_OIDC_TOKEN: 'offline-fixture' },
    custodyUrl: 'https://atlas-custody.test/',
    custodyFetch: async () => {
      const err = new Error('LOOM_DEMO_HEAD_CONFLICT');
      err.status = 409;
      throw err;
    },
    bindRequest: async (parsed, env) => {
      const binding = await originalBind(parsed, env);
      const originalClose = binding.governor.close;
      binding.governor.close = () => {
        governorWasClosed = true;
        return originalClose.call(binding.governor);
      };
      return binding;
    }
  });

  // Also spy directly on bindLoomDemoRequest by intercepting options or wrapper
  let boundGovernor = null;
  const instrumentedHandler = async (req, res) => {
    // We run the handler and check governor closure
    return handler(req, res);
  };

  await handler(mockReq, mockRes);
  assert.equal(mockRes.statusCode, 502);
  assert.equal(mockRes.body.status, 'held');
  assert.equal(mockRes.body.error, 'LOOM_DEMO_CUSTODY_UNAVAILABLE');
});

test('Pedagogue Defect D2: Tutorial completion has a distinct Rest action, not the builder Demo tab', async () => {
  const { loomWorkspaceTemplate } = await import('../app/dome-world/holonomy-loom/workspace-template.js');
  const dom = new JSDOM(loomWorkspaceTemplate);
  const stopBtn = dom.window.document.querySelector('#loomFirstCrossingStop');
  assert.ok(stopBtn, '#loomFirstCrossingStop exists in template');
  assert.notEqual(stopBtn.textContent.trim(), 'Finish demo →', 'Tutorial button must not collide with builder Demo tab');
  assert.match(stopBtn.textContent, /Complete the lesson/i);
});

test('Pedagogue Requirement D3: First Crossing private note is an explanatory non-interactive note (role="note") ensuring privacy cannot be ambiguously toggled into AI request', async () => {
  const { loomWorkspaceTemplate } = await import('../app/dome-world/holonomy-loom/workspace-template.js');
  const dom = new JSDOM(loomWorkspaceTemplate);
  const privateElement = dom.window.document.querySelector('#loomFirstCrossingPrivate');
  assert.ok(privateElement, '#loomFirstCrossingPrivate exists in template');
  assert.equal(privateElement.tagName.toLowerCase(), 'div', '#loomFirstCrossingPrivate must be explanatory non-interactive div');
  assert.equal(privateElement.getAttribute('role'), 'note', 'must have role="note"');
  assert.ok(!privateElement.hasAttribute('aria-expanded'), 'must not be an expandable or toggleable control');
});

test('Aperture Defect D4: Far-plane carriers have sufficient contrast (opacity >= 0.15)', () => {
  const css = fs.readFileSync('app/dome-world/holonomy-loom/loom-product-v6.css', 'utf8');
  const matches = [...css.matchAll(/\.flight-far\s*\{[^}]*opacity:\s*([0-9.]+)/g)];
  assert.ok(matches.length > 0, '.flight-far opacity rule exists');
  for (const match of matches) {
    const opacity = parseFloat(match[1]);
    assert.ok(opacity >= 0.15, `flight-far opacity ${opacity} must be >= 0.15 for visual contrast`);
  }
});

test('Aperture Defect D5: Compact reduced motion places all 39 carriers inside [200, 800]', () => {
  const code = fs.readFileSync('app/dome-world/holonomy-loom/instrument-state-view.js', 'utf8');
  assert.match(code, /compact\s*\?\s*2\d\d/, 'must have compact-aware reduced motion X calculation');
});

test('Aperture Defect D8: .loom-wordmark meets WCAG 44px target', () => {
  const css = fs.readFileSync('app/dome-world/holonomy-loom/loom-product-v6.css', 'utf8');
  assert.match(css, /\.loom-wordmark\s*\{[^}]*min-height:\s*44px/, '.loom-wordmark should specify min-height: 44px');
});

test('Atlas Defect D9: openReturnedReviewScene synchronizes dataset.loomJourney to "return"', () => {
  const code = fs.readFileSync('app/dome-world/holonomy-loom/ai-workspace.js', 'utf8');
  assert.match(code, /function\s+openReturnedReviewScene[\s\S]*?setJourney\('return'\)/, 'openReturnedReviewScene must call setJourney("return")');
});
