import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { runBoundedDollhouseOrchestrator } from '../../app/engine/dollhouse-bounded-orchestrator.js';

const comparison = 'research/portable-loom-dollhouse-execution-20261009/';
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const clone = data => JSON.parse(JSON.stringify(data));
const ROLES = ['PEDAGOGUE', 'APERTURE', 'ATLAS', 'FADT'];
const retainedCaptures = new WeakSet();
function exact(value, fields, label) {
  if (!value || Object.getPrototypeOf(value) !== Object.prototype
    || Object.keys(value).length !== fields.length || fields.some(f => !Object.hasOwn(value, f))) throw new Error(`${label}: exact data fields required`);
  for (const descriptor of Object.values(Object.getOwnPropertyDescriptors(value))) {
    if (!descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) throw new Error(`${label}: inert data required`);
  }
}
function text(value, label, max = 8000) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error(`${label}: bounded text required`);
}
function positive(value, label, max) {
  if (!Number.isSafeInteger(value) || value < 1 || value > max) throw new Error(`${label}: bounded positive integer required`);
}
export function loadFrozenInputs(root = process.cwd()) {
  const binding = JSON.parse(readFileSync(resolve(root, comparison + 'EXECUTION_BINDING.json')));
  for (const r of binding.input_and_source_records) {
    const path = resolve(root, r.path);
    if (!path.startsWith(resolve(root) + '/') || sha256(readFileSync(path)) !== r.sha256) throw new Error(`Frozen input/source changed: ${r.path}`);
  }
  return binding;
}
export function prepareComparisonPrompt(caseId, role, root = process.cwd()) {
  loadFrozenInputs(root);
  if (![...ROLES, 'MONOLITH'].includes(role)) throw new Error('Unregistered comparison role.');
  const corpus = JSON.parse(readFileSync(resolve(root, comparison + 'CASE_SET.json')));
  const c = corpus.cases.find(c => c.case_id === caseId);
  if (!c) throw new Error('Unregistered comparison case.');
  // Allowlisted inputs only; never enumerate a directory or read the score/key.
  const common = readFileSync(resolve(root, comparison + 'prompts/COMMON.txt'), 'utf8');
  const focus = readFileSync(resolve(root, comparison + `prompts/${role}.txt`), 'utf8');
  const prompt = common + '\n' + focus + '\n' + JSON.stringify(c);
  return { prompt, sha256: sha256(prompt), case_id: caseId, role,
    maximum_output_tokens: role === 'MONOLITH' ? 8192 : 2048 };
}
export function prepareReceiverMessages(caseId, capturedTurns = [], root = process.cwd()) {
  loadFrozenInputs(root);
  const registry = JSON.parse(readFileSync(resolve(root, 'research/portable-loom-preflight/CASE_REGISTRY.json')));
  const c = registry.cases.find(c => c.case_id === caseId && c.case_id.startsWith('R'));
  if (!c || !Array.isArray(capturedTurns) || capturedTurns.length >= c.turns.length) throw new Error('Unregistered or completed receiver trial.');
  const artifact = readFileSync(resolve(root, 'research/portable-loom-local-battery-20261009/artifact/portable-loom-standard.md'), 'utf8');
  const messages = [];
  for (let i = 0; i <= capturedTurns.length; i++) {
    messages.push({ role: 'user', content: i === 0 ? artifact + '\n\nRECEIVER ASSAY USER TURN\n' + c.turns[0] : c.turns[i] });
    if (i < capturedTurns.length) {
      const capture = capturedTurns[i];
      exact(capture, ['case_id', 'turn_index', 'text', 'capture_sha256'], 'prior captured turn');
      if (capture.case_id !== caseId || capture.turn_index !== i || sha256(capture.text) !== capture.capture_sha256) throw new Error('Prior turn binding mismatch.');
      text(capture.text, 'captured text', 2000000);
      messages.push({ role: 'assistant', content: capture.text });
    }
  }
  return { messages, case_id: caseId, turn_index: capturedTurns.length,
    maximum_assistant_outputs: c.maximum_assistant_outputs,
    claim_ceiling: 'Prompt adherence in captured API turns only; no browser, custody or hidden-provider witness.' };
}

export function validateTransportBinding(binding) {
  exact(binding, ['schema', 'protocol_commit', 'provider', 'model', 'response_model_ids', 'credential_env',
    'generation_parameters', 'limits', 'pricing', 'authorization', 'tools', 'retrieval', 'retries'], 'transport binding');
  if (binding.schema !== 'td613.loom.bound-model-transport/v0.1'
    || !/^[a-f0-9]{40}$/.test(binding.protocol_commit) || !['GEMINI_GENERATE_CONTENT', 'OPENAI_CHAT_COMPLETIONS'].includes(binding.provider)) throw new Error('Unbound transport/protocol.');
  text(binding.model, 'model', 100);
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(binding.model) || /latest/i.test(binding.model)) throw new Error('Exact model ID required; moving aliases held.');
  if (!Array.isArray(binding.response_model_ids) || !binding.response_model_ids.length
    || binding.response_model_ids.some(x => typeof x !== 'string' || !x.trim())) throw new Error('Exact acceptable returned model IDs required.');
  if (!/^[A-Z][A-Z0-9_]{2,100}$/.test(binding.credential_env)) throw new Error('Credential environment reference required.');
  exact(binding.generation_parameters, ['temperature', 'top_p', 'thinking_level'], 'generation parameters');
  for (const k of ['temperature', 'top_p']) {
    const v = binding.generation_parameters[k];
    if (v !== null && (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > (k === 'top_p' ? 1 : 2))) throw new Error('Invalid decoding parameter.');
  }
  if (binding.generation_parameters.thinking_level !== null
    && !['minimal', 'low', 'medium', 'high'].includes(binding.generation_parameters.thinking_level)) throw new Error('Invalid thinking level.');
  if (binding.provider === 'OPENAI_CHAT_COMPLETIONS' && binding.generation_parameters.thinking_level !== null) throw new Error('This bounded OpenAI adapter does not map Gemini thinking levels.');
  exact(binding.limits, ['max_calls', 'max_input_tokens_per_call', 'max_output_tokens_per_call', 'max_cost_usd', 'timeout_ms', 'max_response_bytes'], 'limits');
  positive(binding.limits.max_calls, 'max calls', 468);
  positive(binding.limits.max_input_tokens_per_call, 'max input tokens', 1000000);
  positive(binding.limits.max_output_tokens_per_call, 'max output tokens', 8192);
  positive(binding.limits.timeout_ms, 'timeout', 300000);
  positive(binding.limits.max_response_bytes, 'response bytes', 8000000);
  if (typeof binding.limits.max_cost_usd !== 'number' || !Number.isFinite(binding.limits.max_cost_usd) || binding.limits.max_cost_usd < 0) throw new Error('Numeric financial ceiling required.');
  exact(binding.pricing, ['input_usd_per_million', 'output_usd_per_million', 'source', 'verified_at'], 'pricing');
  for (const rate of [binding.pricing.input_usd_per_million, binding.pricing.output_usd_per_million]) {
    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate < 0) throw new Error('Bound numerical pricing required.');
  }
  text(binding.pricing.source, 'pricing source'); text(binding.pricing.verified_at, 'pricing verification time');
  if (!Number.isFinite(Date.parse(binding.pricing.verified_at))) throw new Error('Pricing time required.');
  exact(binding.authorization, ['record', 'scope'], 'authorization');
  text(binding.authorization.record, 'authorization record'); text(binding.authorization.scope, 'authorization scope');
  if (binding.tools !== 'DISABLED' || binding.retrieval !== 'DISABLED' || binding.retries !== 0) throw new Error('No tools/retrieval/retries permitted.');
  return clone(binding);
}

export function buildBoundedWire(bindingInput, messages, requestedOutputLimit) {
  const binding = validateTransportBinding(bindingInput);
  positive(requestedOutputLimit, 'trial output limit', 8192);
  if (requestedOutputLimit > binding.limits.max_output_tokens_per_call) throw new Error('Trial exceeds bound output ceiling.');
  if (!Array.isArray(messages) || !messages.length || messages.length > 8) throw new Error('Bounded message sequence required.');
  for (const m of messages) { exact(m, ['role', 'content'], 'message'); text(m.content, 'message text', 2000000); if (!['user', 'assistant'].includes(m.role)) throw new Error('Unsupported message role.'); }
  const config = binding.generation_parameters;
  let url, body;
  if (binding.provider === 'GEMINI_GENERATE_CONTENT') {
    url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(binding.model)}:generateContent`;
    body = { contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
      generationConfig: { candidateCount: 1, maxOutputTokens: requestedOutputLimit,
        ...(config.temperature === null ? {} : { temperature: config.temperature }),
        ...(config.top_p === null ? {} : { topP: config.top_p }),
        ...(config.thinking_level === null ? {} : { thinkingConfig: { thinkingLevel: config.thinking_level } }) } };
  } else {
    url = 'https://api.openai.com/v1/chat/completions';
    body = { model: binding.model, messages, n: 1, max_completion_tokens: requestedOutputLimit, store: false,
      ...(config.temperature === null ? {} : { temperature: config.temperature }),
      ...(config.top_p === null ? {} : { top_p: config.top_p }) };
  }
  const bytes = Buffer.from(JSON.stringify(body));
  // Byte bound plus fixed allowance is an explicitly conservative reservation;
  // actual API usage must still be checked. It grants no tokenizer-proof claim.
  const inputReservation = bytes.length + 8192;
  if (inputReservation > binding.limits.max_input_tokens_per_call) throw new Error('Conservative input reservation exceeds ceiling.');
  const reservedCost = (binding.limits.max_input_tokens_per_call * binding.pricing.input_usd_per_million
    + requestedOutputLimit * binding.pricing.output_usd_per_million) / 1000000;
  if (reservedCost > binding.limits.max_cost_usd) throw new Error('Call reservation exceeds financial ceiling.');
  return { url, bytes, sha256: sha256(bytes), generation_config_sha256: sha256(JSON.stringify(body.generationConfig ?? {
    n: body.n, max_completion_tokens: body.max_completion_tokens, temperature: body.temperature ?? null, top_p: body.top_p ?? null, store: false })),
    input_reservation_tokens: inputReservation, output_limit: requestedOutputLimit, reserved_cost_usd: reservedCost };
}

export function extractCapturedModel(bindingInput, bytes) {
  const binding = validateTransportBinding(bindingInput), payload = JSON.parse(Buffer.from(bytes).toString('utf8'));
  let textResult, model, usage, inputTokens, outputTokens, finish;
  if (binding.provider === 'GEMINI_GENERATE_CONTENT') {
    if (!Array.isArray(payload.candidates) || payload.candidates.length !== 1) throw new Error('One Gemini candidate required.');
    const candidate = payload.candidates[0], parts = candidate.content?.parts;
    if (!Array.isArray(parts) || !parts.length || parts.some(p => p.functionCall || p.executableCode || (p.text === undefined && !p.thought))) throw new Error('Unexpected tool/non-text content.');
    textResult = parts.filter(p => !p.thought).map(p => p.text ?? '').join(''); model = payload.modelVersion;
    usage = payload.usageMetadata; inputTokens = usage?.promptTokenCount; outputTokens = usage?.totalTokenCount - inputTokens;
    finish = candidate.finishReason;
    if (finish !== 'STOP') throw new Error('Incomplete or held Gemini completion.');
  } else {
    if (!Array.isArray(payload.choices) || payload.choices.length !== 1) throw new Error('One OpenAI choice required.');
    const choice = payload.choices[0];
    if (choice.message?.tool_calls || choice.message?.function_call || choice.message?.refusal) throw new Error('Tool/refusal content is not an admitted answer.');
    textResult = choice.message?.content; model = payload.model; usage = payload.usage;
    inputTokens = usage?.prompt_tokens; outputTokens = usage?.completion_tokens; finish = choice.finish_reason;
    if (finish !== 'stop') throw new Error('Incomplete or held OpenAI completion.');
  }
  text(textResult, 'returned text', binding.limits.max_response_bytes);
  if (!binding.response_model_ids.includes(model)) throw new Error('Returned model outside exact binding.');
  if (!Number.isSafeInteger(inputTokens) || inputTokens < 0 || inputTokens > binding.limits.max_input_tokens_per_call
    || !Number.isSafeInteger(outputTokens) || outputTokens < 0 || outputTokens > binding.limits.max_output_tokens_per_call) throw new Error('Missing or exceeded reported token bounds.');
  return { text: textResult, model, usage, input_tokens: inputTokens, output_tokens: outputTokens, finish_reason: finish,
    observation_boundary: 'Authenticated HTTPS transport response; reported model/usage metadata, no hidden-process or billing verification.' };
}

export async function captureOneBoundCall(bindingInput, wire, attemptPath, journalPath, {
  environment = process.env, fetchImpl = globalThis.fetch, fixture = false, trialIdentity = null
} = {}) {
  const binding = validateTransportBinding(bindingInput);
  fixture = fixture || fetchImpl !== globalThis.fetch;
  if (!fixture) {
    exact(trialIdentity, ['trial_id', 'case_id', 'role', 'turn_index'], 'trial identity');
    if (!/^(?:FIRST_CONFIGURED_RECEIVER|SECOND_PROVIDER)-R\d{2}-[123]$|^COMPARE-K\d{2}-[123]$/.test(trialIdentity.trial_id)
      || !['RECEIVER', 'MONOLITH', ...ROLES].includes(trialIdentity.role)
      || !Number.isInteger(trialIdentity.turn_index) || trialIdentity.turn_index < 0 || trialIdentity.turn_index > 3) throw new Error('Registered bounded trial identity required.');
    if (!trialIdentity.trial_id.includes(`-${trialIdentity.case_id}-`)) throw new Error('Trial/case identity mismatch.');
    if ((trialIdentity.role === 'RECEIVER') !== /^R\d{2}$/.test(trialIdentity.case_id)) throw new Error('Role/case track mismatch.');
    if (trialIdentity.role !== 'RECEIVER' && trialIdentity.turn_index !== 0) throw new Error('Isolated role/monolith calls have one prompt only.');
  }
  const credential = environment[binding.credential_env];
  if (!credential || typeof credential !== 'string') throw new Error('HELD_MISSING_CONFIGURED_CREDENTIAL; server-side key remains unexported.');
  if (wire.bytes.includes(Buffer.from(credential))) throw new Error('Protected credential entered request payload.');
  if (existsSync(attemptPath)) throw new Error('Attempt exists; no overwrite/retry.');
  const bindingSha = sha256(JSON.stringify(binding)), lock = journalPath + '.lock';
  // Exclusive lock prevents simultaneous calls from overspending one journal.
  mkdirSync(lock);
  try {
    const journal = existsSync(journalPath) ? JSON.parse(readFileSync(journalPath))
      : { binding_sha256: bindingSha, calls_reserved: 0, reserved_cost_usd: 0, attempts: [], trial_call_keys: [] };
    if (journal.binding_sha256 !== bindingSha || journal.calls_reserved >= binding.limits.max_calls
      || journal.reserved_cost_usd + wire.reserved_cost_usd > binding.limits.max_cost_usd) throw new Error('HELD_BUDGET_OR_BINDING');
    const callKey = trialIdentity ? `${trialIdentity.trial_id}:${trialIdentity.role}:${trialIdentity.turn_index}` : `fixture:${attemptPath}`;
    if (journal.trial_call_keys.includes(callKey)) throw new Error('Trial call already reserved; no silent repeat.');
    // Recompute wire from the declared data before use; no caller can smuggle
    // tools, a different endpoint or a larger output cap through a forged wire.
    const decoded = JSON.parse(wire.bytes.toString('utf8'));
    const messages = binding.provider === 'GEMINI_GENERATE_CONTENT'
      ? decoded.contents.map(c => ({ role: c.role === 'model' ? 'assistant' : 'user', content: c.parts[0].text })) : decoded.messages;
    const rebuilt = buildBoundedWire(binding, messages, wire.output_limit);
    if (rebuilt.url !== wire.url || !rebuilt.bytes.equals(wire.bytes)
      || rebuilt.reserved_cost_usd !== wire.reserved_cost_usd || wire.sha256 !== rebuilt.sha256) throw new Error('Unbound wire request.');
    mkdirSync(attemptPath);
    writeFileSync(join(attemptPath, 'request.body.json'), wire.bytes, { flag: 'wx' });
    const request = { schema: 'td613.loom.bound-api-attempt/v0.1', fixture_transport: fixture,
      evidence_class: fixture ? 'LOCAL_STRUCTURAL_TEST' : 'ACTUAL_RECEIVER_TEST', method: 'POST', url: wire.url,
      request_sha256: wire.sha256, binding_sha256: bindingSha, output_limit: wire.output_limit,
      reserved_cost_usd: wire.reserved_cost_usd, trial_identity: trialIdentity,
      started_at: new Date().toISOString(), attempt: 1, retries: 0 };
    writeFileSync(join(attemptPath, 'request.json'), JSON.stringify(request, null, 2) + '\n', { flag: 'wx' });
    journal.calls_reserved++; journal.reserved_cost_usd += wire.reserved_cost_usd; journal.attempts.push(resolve(attemptPath));
    journal.trial_call_keys.push(callKey);
    writeFileSync(journalPath, JSON.stringify(journal, null, 2) + '\n');
    const chunks = [], controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), binding.limits.timeout_ms);
    let response, error = null, decodedResponse = null;
    try {
      response = await fetchImpl(wire.url, { method: 'POST', redirect: 'error', signal: controller.signal,
        headers: { 'content-type': 'application/json', ...(binding.provider === 'GEMINI_GENERATE_CONTENT'
          ? { 'x-goog-api-key': credential } : { authorization: `Bearer ${credential}` }) }, body: wire.bytes });
      let length = 0;
      for await (const chunk of response.body) {
        const bytes = Buffer.from(chunk); chunks.push(bytes); length += bytes.length;
        if (length > binding.limits.max_response_bytes) { controller.abort(); throw new Error('Response byte ceiling exceeded.'); }
      }
      if (!response.ok) throw new Error('Non-success HTTP response retained; no retry.');
      decodedResponse = extractCapturedModel(binding, Buffer.concat(chunks));
      if (decodedResponse.output_tokens > wire.output_limit) throw new Error('Reported completion exceeds this trial output bound.');
    } catch (e) { error = String(e.message).includes(credential) ? 'Transport error contained protected credential; details withheld.' : e.message; }
    finally { clearTimeout(timer); }
    const raw = Buffer.concat(chunks);
    // Provider credential echoes remain private and are excluded from the
    // releasable evidence packet. Exact private bytes are retained separately.
    const credentialEcho = raw.includes(Buffer.from(credential));
    const rawName = credentialEcho ? 'PRIVATE_CREDENTIAL_ECHO.bin' : 'response.body.bin';
    writeFileSync(join(attemptPath, rawName), raw, { flag: 'wx', mode: 0o600 });
    if (credentialEcho) { error = 'HELD_PROTECTED_CREDENTIAL_ECHO'; decodedResponse = null; }
    const result = { ...request, ended_at: new Date().toISOString(), http_status: response?.status ?? null,
      response_bytes: raw.length, response_sha256: sha256(raw), raw_path: rawName,
      releasable: !credentialEcho, status: error ? 'HELD_EVIDENCE_GAP' : 'CAPTURED_NOT_ADMITTED', error,
      returned: decodedResponse, provider_origin_scope: fixture ? 'MOCK_HTTP_FIXTURE_ONLY' : 'HTTPS_RESPONSE_FROM_BOUND_PROVIDER_ENDPOINT',
      model_identity_scope: 'Provider-declared metadata; no internal model weights observed.',
      cost_scope: 'Conservative reservation using bound pricing; independently settled invoice unobserved.' };
    writeFileSync(join(attemptPath, 'capture.json'), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
    return result;
  } finally {
    const { rmdirSync } = await import('node:fs'); rmdirSync(lock);
  }
}

export function loadRetainedCapture(attemptPath, bindingInput, identity) {
  const binding = validateTransportBinding(bindingInput);
  exact(identity, ['case_id', 'role', 'capture_id'], 'capture identity');
  const cap = JSON.parse(readFileSync(join(attemptPath, 'capture.json'))), request = JSON.parse(readFileSync(join(attemptPath, 'request.json')));
  const body = readFileSync(join(attemptPath, 'request.body.json'));
  if (!cap.releasable || cap.raw_path !== 'response.body.bin') throw new Error('Protected/non-releasable capture.');
  const raw = readFileSync(join(attemptPath, cap.raw_path));
  if (sha256(body) !== request.request_sha256 || request.request_sha256 !== cap.request_sha256
    || sha256(raw) !== cap.response_sha256 || raw.length !== cap.response_bytes
    || request.binding_sha256 !== sha256(JSON.stringify(binding)) || request.binding_sha256 !== cap.binding_sha256
    || request.fixture_transport !== cap.fixture_transport || request.evidence_class !== cap.evidence_class
    || JSON.stringify(request.trial_identity) !== JSON.stringify(cap.trial_identity)
    || request.url !== cap.url || cap.http_status !== 200) throw new Error('Retained capture byte/binding mismatch.');
  const b = JSON.parse(body), messages = binding.provider === 'GEMINI_GENERATE_CONTENT'
    ? b.contents.map(c => ({ role: c.role === 'model' ? 'assistant' : 'user', content: c.parts[0].text })) : b.messages;
  const wire = buildBoundedWire(binding, messages, request.output_limit);
  if (wire.url !== request.url || !wire.bytes.equals(body)) throw new Error('Retained request outside exact transport binding.');
  const decoded = extractCapturedModel(binding, raw);
  if (JSON.stringify(decoded) !== JSON.stringify(cap.returned)) throw new Error('Returned text or metadata rewritten.');
  const result = { ...cap, ...identity, independent_local_byte_check: true,
    origin_claim_ceiling: 'Same-process API capture; checks authenticate carried bytes, not independent external origin.' };
  retainedCaptures.add(result);
  return result;
}

export function loadReceiverContinuation(referenceFile, binding, trialId, caseId, root = process.cwd()) {
  if (referenceFile === 'EMPTY') return [];
  const refs = JSON.parse(readFileSync(referenceFile));
  if (!Array.isArray(refs) || refs.length > 3) throw new Error('Bounded prior capture references required.');
  const prior = [];
  for (let i = 0; i < refs.length; i++) {
    exact(refs[i], ['attempt_path'], 'prior capture reference');
    const cap = loadRetainedCapture(refs[i].attempt_path, binding, { case_id: caseId, role: 'RECEIVER', capture_id: `${trialId}-${i}` });
    if (cap.fixture_transport || cap.status !== 'CAPTURED_NOT_ADMITTED'
      || cap.trial_identity?.trial_id !== trialId || cap.trial_identity?.case_id !== caseId
      || cap.trial_identity?.turn_index !== i || cap.trial_identity?.role !== 'RECEIVER') throw new Error('Receiver history is missing, synthetic or from another trial.');
    const prepared = prepareReceiverMessages(caseId, prior, root);
    if (buildBoundedWire(binding, prepared.messages, cap.output_limit).sha256 !== cap.request_sha256) throw new Error('Receiver predecessor request changed.');
    prior.push({ case_id: caseId, turn_index: i, text: cap.returned.text, capture_sha256: sha256(cap.returned.text) });
  }
  return prior;
}

export function validateRoleReturn(data, role, caseId) {
  exact(data, ['schema', 'case_id', 'agent', 'verdict', 'finding', 'limitations'], 'role output');
  if (data.schema !== 'td613.loom.model-role-finding/v0.1' || data.case_id !== caseId || data.agent !== role
    || !ROLES.includes(role) || !['SUPPORTED', 'HELD', 'CONTRADICTED', 'UNKNOWN'].includes(data.verdict)) throw new Error('Typed role/case binding mismatch.');
  text(data.finding, 'finding');
  if (!Array.isArray(data.limitations) || !data.limitations.length || data.limitations.length > 16) throw new Error('Role limitations required.');
  data.limitations.forEach(s => text(s, 'limitation', 1000));
  return clone(data);
}
export function admitGovernedRoleCaptures(caseData, captures) {
  const held = reason => ({ status: 'HELD_EVIDENCE_GAP', reason, case_id: caseData.case_id,
    original_captures: clone(captures), prior_findings: clone(caseData.prior_findings), authority: 'HUMAN_REVIEW_REQUIRED' });
  if (!Array.isArray(captures) || captures.length !== 4) return held('Four separately retained role captures required.');
  const identity = captures[0].binding_sha256, ids = new Set(), typed = [];
  try {
    for (const role of ROLES) {
      const cap = captures.find(c => c.role === role);
      if (!cap || !retainedCaptures.has(cap) || cap.status !== 'CAPTURED_NOT_ADMITTED' || cap.fixture_transport
        || cap.evidence_class !== 'ACTUAL_RECEIVER_TEST' || cap.binding_sha256 !== identity
        || !cap.capture_id || ids.has(cap.capture_id) || cap.case_id !== caseData.case_id
        || cap.trial_identity?.case_id !== caseData.case_id || cap.trial_identity?.role !== role
        || cap.trial_identity?.trial_id !== captures[0].trial_identity?.trial_id) throw new Error('Missing, synthetic, mixed-binding or reused capture.');
      ids.add(cap.capture_id); typed.push({ role, cap, data: validateRoleReturn(JSON.parse(cap.returned.text), role, caseData.case_id) });
    }
    const findings = typed.map(({ role, cap, data }) => ({ id: `captured-${role}`, agent: role, claim_key: 'local-inputs-review',
      verdict: data.verdict, evidence_class: 'PROVIDER_RESPONSE',
      observation_scope: { source: `Case ${caseData.case_id}`, instrument: 'Captured bound API model-role text',
        condition: 'Model judgment only; no mathematical-adapter execution or source authentication credited.', temporal_window: `${cap.started_at} / ${cap.ended_at}` },
      reference: { artifact: cap.capture_id, sha256: cap.response_sha256 }, limitations: [...data.limitations] }));
    // Earlier findings remain caller declarations; original minimal records
    // are also returned unchanged outside the clerk for the blinded scorer.
    for (const f of caseData.prior_findings) findings.push({ id: f.id, agent: f.agent, claim_key: f.claim_key, verdict: f.verdict,
      evidence_class: 'DECLARATION', observation_scope: { source: caseData.case_id, instrument: 'Frozen prior finding',
        condition: 'Original fixture declaration retained without authentication.', temporal_window: 'Frozen prospective corpus' },
      reference: { artifact: comparison + 'CASE_SET.json', sha256: sha256(JSON.stringify(f)) }, limitations: ['Original finding is a declared fixture, not a verified observation.'] });
    const temporal = caseData.role_inputs.TEMPORAL_CUSTODIAN;
    const clerk = runBoundedDollhouseOrchestrator({ schema: 'td613.dollhouse.bounded-orchestration/v0.1', case_id: caseData.case_id,
      source_revision: caseData.source_revision, episode_id: temporal.episode_id, findings, temporal });
    const payloadOkay = sha256(caseData.payload.utf8) === caseData.payload.sha256;
    return { status: 'TYPED_MODEL_FINDINGS_RETAINED', case_id: caseData.case_id,
      recommendation: payloadOkay ? clerk.recommendation : 'HELD', independent_payload_hash_check: payloadOkay,
      clerk, prior_findings: clone(caseData.prior_findings), unresolved_prior_finding_ids: caseData.prior_findings.filter(f => f.verdict !== 'SUPPORTED').map(f => f.id),
      model_role_findings: typed.map(t => t.data), original_captures: clone(captures),
      evidence_boundary: 'Locally byte-checked model-role capture and deterministic declared temporal sidecar; no independent external origin, scientific superiority or execution authority.' };
  } catch (e) { return held(e.message); }
}
