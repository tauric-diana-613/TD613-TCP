import { bindLoomDemoRequest } from '../app/dome-world/holonomy-loom/demo-contract.js';
import { createLoomTaskHandler } from './loom-task.js';

// This adapter uses the existing Loom provider route and adds independent
// server-side AIA/file-binding checks. No extra Vercel function or credential.
export function createLoomDemoTaskHandler({ taskHandler = createLoomTaskHandler(), environment = globalThis } = {}) {
  return async (req, res) => {
    let binding;
    const fail = (code, status = 400) => {
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.end(JSON.stringify({ schema: 'td613.loom.ai-task-result/v0.1', request_id: req.body?.request_id ?? null, status: 'held', answer: '', error: code }));
    };
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return fail('method-not-allowed', 405); }
    const headers = Object.fromEntries(Object.entries(req.headers || {}).map(([key,value]) => [key.toLowerCase(),value]));
    try {
      const origin = new URL(headers.origin);
      if (headers['sec-fetch-site'] === 'cross-site' || origin.origin !== headers.origin || origin.host !== headers.host || !['https:', 'http:'].includes(origin.protocol) || (origin.protocol === 'http:' && !['localhost','127.0.0.1','[::1]'].includes(origin.hostname))) return fail('same-origin-required',403);
    } catch { return fail('same-origin-required',403); }
    if (!/^application\/json(?:\s*;|$)/i.test(headers['content-type'] || '')) return fail('json-required',415);
    try {
      const raw = typeof req.body === 'string' || Buffer.isBuffer(req.body) ? String(req.body) : JSON.stringify(req.body);
      if (!raw || Buffer.byteLength(raw, 'utf8') > 240000) return fail('task-too-large',413);
      binding = await bindLoomDemoRequest(JSON.parse(raw), environment);
    } catch (error) { return fail(error.message || 'loom-demo-binding-held'); }
    const proxy = Object.create(req);
    proxy.body = binding.input;
    const response = Object.create(res);
    response.setHeader = (...args) => res.setHeader(...args);
    response.end = raw => {
      const output = JSON.parse(String(raw));
      if (output.status === 'completed' && !binding.governor.receive(output, binding.input.request_id).allowed) {
        res.statusCode = 422;
        binding.governor.close();
        return fail('loom-demo-response-held',422);
      }
      res.statusCode = response.statusCode;
      binding.governor.close();
      return res.end(JSON.stringify({ ...output, loom_demo_binding: binding.receipt }));
    };
    try { await taskHandler(proxy,response); }
    finally { binding.governor.close(); }
  };
}
// Draft release barrier. The factory above is available to bounded offline
// contract tests, but is NOT an admitted production receiver: its predecessor
// sequence and result provenance still need an independently scoped signed
// receipt. Do not open this route merely because a secret has been configured.
// Removing this barrier requires those checks, hostile tests and browser review.
export default function loomDemoReleaseHeld(req, res) {
  res.statusCode = 503;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  return res.end(JSON.stringify({
    schema: 'td613.loom.ai-task-result/v0.1',
    request_id: req.body?.request_id ?? null,
    status: 'held', answer: '', error: 'loom-demo-release-not-admitted'
  }));
}
