import { createHash } from 'node:crypto';

export const ASSAY_REQUEST_SCHEMA = 'td613.loom.server-assay-request/v0.1';
export const ASSAY_RESPONSE_SCHEMA = 'td613.loom.server-assay-response/v0.1';
export const ASSAY_POLICY_SCHEMA = 'td613.loom.server-assay-policy/v0.1';
export const sha256 = value => createHash('sha256').update(value).digest('hex');
export function canonicalJson(value) {
  if (Array.isArray(value)) return '[' + value.map(canonicalJson).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonicalJson(value[k])).join(',') + '}';
  return JSON.stringify(value);
}
const roles = ['MONOLITH', 'PEDAGOGUE', 'APERTURE', 'ATLAS', 'FADT'];
export function requireThat(condition, code) { if (!condition) throw new Error(code); }
function integer(value, min, max) { return Number.isSafeInteger(value) && value >= min && value <= max; }
export function exactFields(value, fields) {
  requireThat(value && Object.getPrototypeOf(value) === Object.prototype
    && Object.keys(value).length === fields.length && fields.every(k => Object.hasOwn(value, k)), 'ASSAY_FIELD_SHAPE');
}
export function validateAssayPolicy(p, at = Date.now()) {
  exactFields(p, ['schema', 'run_id', 'protocol_commit', 'artifact_sha256', 'expires_at', 'binding', 'receiver_output_tokens']);
  requireThat(p.schema === ASSAY_POLICY_SCHEMA && /^[a-zA-Z0-9_-]{1,80}$/.test(p.run_id)
    && /^[a-f0-9]{40}$/.test(p.protocol_commit) && /^[a-f0-9]{64}$/.test(p.artifact_sha256)
    && Number.isFinite(Date.parse(p.expires_at)) && Date.parse(p.expires_at) > at, 'ASSAY_POLICY_UNBOUND_OR_EXPIRED');
  const b = p.binding;
  requireThat(b?.provider === 'GEMINI_GENERATE_CONTENT' && b.protocol_commit === p.protocol_commit
    && b.credential_env === 'GEMINI_API_KEY' && /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/.test(b.model)
    && !/latest/i.test(b.model) && b.tools === 'DISABLED' && b.retrieval === 'DISABLED' && b.retries === 0
    && Array.isArray(b.response_model_ids) && b.response_model_ids.length > 0
    && b.response_model_ids.every(x => typeof x === 'string' && /^[a-zA-Z0-9._-]{1,100}$/.test(x)), 'ASSAY_MODEL_BINDING');
  const l = b.limits, g = b.generation_parameters, pricing = b.pricing;
  requireThat(integer(l?.max_calls, 1, 288) && integer(l.max_input_tokens_per_call, 1, 1000000)
    && integer(l.max_output_tokens_per_call, 1, 8192) && integer(l.timeout_ms, 1, 120000)
    && integer(l.max_response_bytes, 1, 2000000) && typeof l.max_cost_usd === 'number'
    && Number.isFinite(l.max_cost_usd) && l.max_cost_usd > 0 && l.max_cost_usd <= 1000000
    && integer(p.receiver_output_tokens, 1, l.max_output_tokens_per_call), 'ASSAY_NUMERICAL_LIMITS');
  requireThat(g && ['temperature', 'top_p'].every(k => g[k] === null ||
    (typeof g[k] === 'number' && Number.isFinite(g[k]) && g[k] >= 0 && g[k] <= (k === 'top_p' ? 1 : 2)))
    && (g.thinking_level === null || ['minimal', 'low', 'medium', 'high'].includes(g.thinking_level)), 'ASSAY_DECODING_BINDING');
  requireThat(pricing && ['input_usd_per_million', 'output_usd_per_million'].every(k =>
    typeof pricing[k] === 'number' && Number.isFinite(pricing[k]) && pricing[k] >= 0 && pricing[k] <= 100000)
    && typeof pricing.source === 'string' && pricing.source.length > 0
    && Number.isFinite(Date.parse(pricing.verified_at)) && Date.parse(pricing.verified_at) <= at
    && b.authorization?.record && b.authorization?.scope, 'ASSAY_PRICING_OR_AUTHORIZATION_UNBOUND');
  return p;
}
export function validateTrial(t) {
  exactFields(t, ['trial_id', 'case_id', 'role', 'turn_index']);
  requireThat(integer(t.turn_index, 0, 3), 'ASSAY_TURN');
  if (t.role === 'RECEIVER') requireThat(/^R(?:0[1-9]|1[0-2])$/.test(t.case_id)
    && new RegExp(`^(?:FIRST_CONFIGURED_RECEIVER|SECOND_PROVIDER)-${t.case_id}-[123]$`).test(t.trial_id), 'ASSAY_TRIAL_ID');
  else requireThat(roles.includes(t.role) && t.turn_index === 0 && /^K(?:0[1-9]|1[0-2])$/.test(t.case_id)
    && new RegExp(`^COMPARE-${t.case_id}-[123]$`).test(t.trial_id), 'ASSAY_TRIAL_ID');
  return `${t.trial_id}:${t.role}:${t.turn_index}`;
}
export function outputLimit(p, t) { return t.role === 'RECEIVER' ? p.receiver_output_tokens : t.role === 'MONOLITH' ? 8192 : 2048; }
export function reservationNanos(p, limit) {
  const cost = p.binding.limits.max_input_tokens_per_call * p.binding.pricing.input_usd_per_million * 1000
    + limit * p.binding.pricing.output_usd_per_million * 1000;
  requireThat(Number.isSafeInteger(Math.ceil(cost)), 'ASSAY_COST_RANGE');
  return Math.ceil(cost);
}
export function buildAssayProviderWire(request, policy, manifest, artifactText) {
  validateAssayPolicy(policy);
  exactFields(request, ['schema', 'run_id', 'protocol_commit', 'artifact_sha256', 'trial', 'messages']);
  const t = request.trial;
  validateTrial(t);
  requireThat(request.schema === ASSAY_REQUEST_SCHEMA && request.run_id === policy.run_id
    && request.protocol_commit === policy.protocol_commit && request.artifact_sha256 === policy.artifact_sha256
    && manifest.artifact_sha256 === policy.artifact_sha256 && sha256(artifactText) === policy.artifact_sha256, 'ASSAY_COORDINATE_MISMATCH');
  const messages = request.messages;
  requireThat(Array.isArray(messages) && messages.length > 0 && messages.length <= 7, 'ASSAY_MESSAGES');
  for (const m of messages) {
    exactFields(m, ['role', 'content']);
    requireThat(['user', 'assistant'].includes(m.role) && typeof m.content === 'string'
      && m.content.length > 0 && Buffer.byteLength(m.content) <= 2000000, 'ASSAY_MESSAGE_CONTENT');
  }
  if (t.role === 'RECEIVER') {
    requireThat(t.trial_id.startsWith('FIRST_CONFIGURED_RECEIVER-'), 'ASSAY_SECOND_PROVIDER_UNBOUND');
    const c = manifest.receivers.find(c => c.case_id === t.case_id);
    requireThat(c && t.turn_index < c.maximum_assistant_outputs && messages.length === t.turn_index * 2 + 1, 'ASSAY_RECEIVER_TURN');
    for (let i = 0; i <= t.turn_index; i++) {
      const u = messages[2 * i];
      requireThat(u.role === 'user' && (i === 0 ? sha256(u.content) === c.first_user_message_sha256
        : u.content === c.later_user_messages[i - 1]), 'ASSAY_USER_INPUT_CHANGED');
      if (i < t.turn_index) requireThat(messages[2 * i + 1].role === 'assistant', 'ASSAY_PREDECESSOR_ROLE');
    }
  } else {
    const c = manifest.comparison.find(c => c.trial_id === t.trial_id && c.case_id === t.case_id && c.role === t.role);
    requireThat(c && messages.length === 1 && messages[0].role === 'user'
      && sha256(messages[0].content) === c.prompt_sha256, 'ASSAY_COMPARISON_INPUT_CHANGED');
  }
  const maxOutputTokens = outputLimit(policy, t);
  requireThat(maxOutputTokens <= policy.binding.limits.max_output_tokens_per_call, 'ASSAY_OUTPUT_LIMIT');
  const g = policy.binding.generation_parameters;
  const body = JSON.stringify({ contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
    generationConfig: { candidateCount: 1, maxOutputTokens,
      ...(g.temperature === null ? {} : { temperature: g.temperature }), ...(g.top_p === null ? {} : { topP: g.top_p }),
      ...(g.thinking_level === null ? {} : { thinkingConfig: { thinkingLevel: g.thinking_level } }) } });
  requireThat(Buffer.byteLength(body) + 8192 <= policy.binding.limits.max_input_tokens_per_call, 'ASSAY_INPUT_RESERVATION_EXCEEDED');
  return { body, request_sha256: sha256(body), output_limit: maxOutputTokens,
    reserved_cost_nanos: reservationNanos(policy, maxOutputTokens),
    prior_assistant_sha256: messages.filter(m => m.role === 'assistant').map(m => sha256(m.content)),
    url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(policy.binding.model)}:generateContent` };
}
export function inspectAssayResponse(bytes, p, limit) {
  const body = JSON.parse(bytes.toString('utf8')), u = body.usageMetadata, candidate = body.candidates?.[0];
  requireThat(Array.isArray(body.candidates) && body.candidates.length === 1 && candidate.finishReason === 'STOP', 'ASSAY_PROVIDER_COMPLETION_HELD');
  requireThat(p.binding.response_model_ids.includes(body.modelVersion), 'ASSAY_RETURNED_MODEL_MISMATCH');
  requireThat(integer(u?.promptTokenCount, 0, p.binding.limits.max_input_tokens_per_call)
    && integer(u.totalTokenCount, u.promptTokenCount, u.promptTokenCount + limit), 'ASSAY_USAGE_MISSING_OR_EXCEEDED');
  requireThat(Array.isArray(candidate.content?.parts) && candidate.content.parts.length > 0
    && candidate.content.parts.every(x => typeof x.text === 'string' && !x.functionCall && !x.executableCode), 'ASSAY_TOOL_OR_NON_TEXT_RESULT');
  const text = candidate.content.parts.filter(x => !x.thought).map(x => x.text).join('');
  requireThat(text.length > 0, 'ASSAY_EMPTY_ANSWER');
  return { text, answer_sha256: sha256(text), model: body.modelVersion, usage: u,
    output_tokens_including_thinking: u.totalTokenCount - u.promptTokenCount };
}
