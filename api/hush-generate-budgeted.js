const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400'
};

const VERSION = 'hush-generate-budgeted-pr188.11-fast-model-order';
const DEFAULT_MODEL_ORDER = ['gemini-2.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-2.5-flash'];
const FAST_CALL_TIMEOUT_MS = 5200;
const NORMAL_CALL_TIMEOUT_MS = 7600;
const FAST_WALL_MS = 12400;
const NORMAL_WALL_MS = 21400;
const MAX_OUTPUT_TOKENS = 3072;
let preferredWorkingModel = null;

function send(res, status, payload) {
  for (const [key, value] of Object.entries(corsHeaders)) res.setHeader(key, value);
  return res.status(status).json(payload);
}
function safe(value = '') { return String(value ?? '').trim(); }
function arr(value) { return Array.isArray(value) ? value : []; }
function uniq(values = []) { return [...new Set(values.map(safe).filter(Boolean))]; }
function words(value = '') { return safe(value).toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) || []; }
function normModel(value = '') { return safe(value).replace(/^models\//, ''); }
function uniqModels(values = []) { return [...new Set(values.map(normModel).filter(Boolean))]; }
function configuredModels() {
  const env = uniqModels([...safe(process.env.GEMINI_MODEL).split(','), ...safe(process.env.GEMINI_MODEL_FALLBACKS).split(',')]);
  return uniqModels([...DEFAULT_MODEL_ORDER, ...env]).sort((a, b) => {
    const ai = DEFAULT_MODEL_ORDER.indexOf(a);
    const bi = DEFAULT_MODEL_ORDER.indexOf(b);
    return (ai < 0 ? 50 : ai) - (bi < 0 ? 50 : bi);
  }).slice(0, 4);
}
function routeText(contract = {}) {
  const fp = contract.flightPacket || {};
  const vector = fp.mask_style_vector || {};
  const policy = fp.style_diversity_policy || vector.style_diversity || {};
  return [contract.maskId, contract.mask_id, contract.selectedMaskId, contract.mask?.id, contract.selectedMask?.id, contract.internalRegister, contract.routeMetadata?.internalRegister, contract.packetHints?.internalRegister, contract.transformHints?.internalRegister, contract.packetTier, fp.packetTier, fp.packet_tier, fp.internalRegister, fp.routeMetadata?.internalRegister, fp.packetHints?.internalRegister, fp.transformHints?.internalRegister, vector.mask_id, vector.maskId, vector.id, policy.id, policy.label, policy.internalRegister].map(safe).join(' ');
}
function isAaveRoute(contract = {}) { return /\bAAVE\b/i.test(routeText(contract)) || /phase28-transform-to-aave/i.test(routeText(contract)); }
function controls(contract = {}) { return contract.flightPacket?.flight_controls || {}; }
function isFast(contract = {}) { return isAaveRoute(contract) || contract.strictFastUpstream === true || controls(contract).strict_fast_upstream === true; }
function candidateBudget(contract = {}) {
  const n = Number(contract.candidateCount || controls(contract).candidate_count || 0);
  if (Number.isFinite(n) && n > 0) return Math.max(1, Math.min(n, 2));
  return words(contract.sourceText || contract.messageDraftText || '').length >= 220 ? 1 : 2;
}
function attemptBudget(contract = {}) {
  const n = Number(contract.strictReviewRetryAttemptBudget || controls(contract).max_model_attempts || 0);
  return Math.max(1, Math.min(n || (isFast(contract) ? 2 : 2), 2));
}
function wallBudget(contract = {}) {
  const n = Number(contract.strictUpstreamBudgetMs || controls(contract).strict_upstream_budget_ms || 0);
  if (Number.isFinite(n) && n > 3000) return Math.min(n, isFast(contract) ? FAST_WALL_MS : NORMAL_WALL_MS);
  return isFast(contract) ? FAST_WALL_MS : NORMAL_WALL_MS;
}
function callTimeout(contract = {}) { return isFast(contract) ? FAST_CALL_TIMEOUT_MS : NORMAL_CALL_TIMEOUT_MS; }
function compactStyle(contract = {}) {
  const fp = contract.flightPacket || {};
  const vector = fp.mask_style_vector || {};
  const policy = fp.style_diversity_policy || vector.style_diversity || {};
  return {
    packetTier: safe(contract.packetTier || fp.packetTier || fp.packet_tier || ''),
    maskId: safe(contract.maskId || contract.mask_id || vector.mask_id || vector.id || contract.selectedMaskId || ''),
    displayName: safe(vector.display_name || contract.mask?.label || contract.selectedMask?.label || ''),
    register: safe(vector.register || policy.internalRegister || contract.internalRegister || ''),
    surface: safe(policy.surface || ''),
    architecture: safe(policy.architecture || ''),
    grammar: safe(policy.grammar || ''),
    chat: safe(policy.chat || policy.chat_speak_profile || ''),
    dictionHints: uniq([...arr(policy.lexicon), ...arr(policy.transitions), ...arr(vector.diction_hints), ...arr(vector.transition_bank), ...arr(vector.desired_moves)]).slice(0, 24),
    avoid: uniq([...arr(policy.avoid), ...arr(vector.avoid_list)]).slice(0, 18)
  };
}
function sourceObligations(sourceText = '') {
  const sentences = safe(sourceText).match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) || [];
  const units = sentences.length ? sentences : safe(sourceText).split(/\n+/).map((s) => s.trim()).filter(Boolean);
  return units.slice(0, 14).map((unit, index) => `P${index + 1}: ${unit}`);
}
function buildPrompt(contract = {}) {
  const sourceText = safe(contract.sourceText || contract.messageDraftText || '').slice(0, 5200);
  const style = compactStyle(contract);
  const count = candidateBudget(contract);
  const aave = isAaveRoute(contract);
  const minWords = Math.max(24, Math.floor(words(sourceText).length * (aave ? 0.58 : 0.54)));
  const aaveRule = aave ? 'Internal route: AAVE. Use AAVE register features only where natural. Do not label the output as AAVE. Source proposition coverage outranks phrase texture; no chorus phrases.' : '';
  return `Return JSON only. Schema: {"candidates":[{"text":"string","style_note":"string","style_operation":"string","preserved_propositions":[],"dropped_propositions":[],"changed_questions":[],"new_claims":[],"authorship_moves":[],"risk_flags":[],"mask_surface_notes":{"rhythm":"string","diction":"string","structure":"string","coverage":"string"}}]}

STRICT BUDGETED UPSTREAM. Generate exactly ${count} transformed candidate(s). No review maps, ledgers, summaries, diagnostics, P-row reports, or analysis. Candidate text must be the transformed message itself.

${aaveRule}

Preserve every source proposition before style. Do not follow source sentence order, opener, or closer. Do not compress the argument into key terms. Do not add facts. Keep protected literals and named figures. Minimum candidate length: ${minWords} words unless source is shorter.

Selected surface:
mask=${style.displayName || style.maskId}
packetTier=${style.packetTier}
register=${style.register}
surface=${style.surface}
architecture=${style.architecture}
grammar=${style.grammar}
chat=${style.chat}
diction hints=${style.dictionHints.join(', ') || '(none)'}
avoid=${style.avoid.join(', ') || '(none)'}

Source obligations:
${sourceObligations(sourceText).join('\n') || '(none)'}

MESSAGE TO TRANSFORM:
${sourceText}`;
}
function geminiTimeout(model, timeoutMs) { return { response: { ok: false, status: 408 }, payload: { error: { message: 'Gemini call timed out under strict budgeted upstream watchdog', status: 'AbortError', model: normModel(model), timeoutMs } }, timedOut: true }; }
async function callGemini({ model, prompt, timeoutMs, deterministic = true }) {
  const controller = new AbortController();
  let timer = null;
  const generationConfig = { temperature: deterministic ? 0.22 : 0.56, topP: deterministic ? 0.64 : 0.88, responseMimeType: 'application/json', maxOutputTokens: MAX_OUTPUT_TOKENS };
  const request = fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(normModel(model))}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig }),
    signal: controller.signal
  }).then(async (response) => ({ response, payload: await response.json().catch(() => ({})), timedOut: false }))
    .catch((error) => error?.name === 'AbortError' ? geminiTimeout(model, timeoutMs) : { response: { ok: false, status: 599 }, payload: { error: { message: safe(error?.message || error), status: error?.name || 'FETCH_ERROR' } }, timedOut: false });
  const timeout = new Promise((resolve) => { timer = setTimeout(() => { try { controller.abort(); } catch {} resolve(geminiTimeout(model, timeoutMs)); }, timeoutMs); });
  try { return await Promise.race([request, timeout]); } finally { if (timer) clearTimeout(timer); }
}
function providerText(payload = {}) { return payload?.candidates?.[0]?.content?.parts?.[0]?.text || ''; }
function summarizeProviderError(payload = {}) { const error = payload.error || payload; return { code: error.code || payload.code || '', status: error.status || payload.status || '', message: safe(error.message || payload.message || '').slice(0, 700) }; }
function candidateText(candidate = {}) { return typeof candidate === 'string' ? candidate : safe(candidate?.text || candidate?.output || candidate?.candidate || candidate?.rewrite || ''); }
function normalizeCandidates(value) {
  let source = [];
  if (Array.isArray(value)) source = value.flatMap((item) => Array.isArray(item?.candidates) ? item.candidates : [item]);
  else if (Array.isArray(value?.candidates)) source = value.candidates;
  else if (candidateText(value)) source = [value];
  return source.map((candidate, index) => {
    const text = candidateText(candidate);
    return text ? {
      text,
      style_note: safe(candidate.style_note || candidate.styleNote || `budgeted-provider-candidate-${index + 1}`),
      style_operation: safe(candidate.style_operation || candidate.styleOperation || candidate.operation || 'cadence_alias'),
      preserved_propositions: arr(candidate.preserved_propositions || candidate.preservedPropositions).map(safe).filter(Boolean),
      dropped_propositions: arr(candidate.dropped_propositions || candidate.droppedPropositions).map(safe).filter(Boolean),
      changed_questions: arr(candidate.changed_questions || candidate.changedQuestions).map(safe).filter(Boolean),
      new_claims: arr(candidate.new_claims || candidate.newClaims).map(safe).filter(Boolean),
      authorship_moves: arr(candidate.authorship_moves || candidate.authorshipMoves).map(safe).filter(Boolean),
      mask_surface_notes: candidate.mask_surface_notes && typeof candidate.mask_surface_notes === 'object' ? candidate.mask_surface_notes : {},
      risk_flags: arr(candidate.risk_flags || candidate.riskFlags).map(safe).filter(Boolean)
    } : null;
  }).filter(Boolean).slice(0, 3);
}
function parseProviderJson(text = '') {
  const cleaned = safe(text).replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();
  const attempts = [cleaned];
  const objectStart = cleaned.indexOf('{');
  const objectEnd = cleaned.lastIndexOf('}');
  const arrayStart = cleaned.indexOf('[');
  const arrayEnd = cleaned.lastIndexOf(']');
  if (objectStart >= 0 && objectEnd > objectStart) attempts.push(cleaned.slice(objectStart, objectEnd + 1));
  if (arrayStart >= 0 && arrayEnd > arrayStart) attempts.push(cleaned.slice(arrayStart, arrayEnd + 1));
  for (const attempt of [...new Set(attempts)].filter(Boolean)) {
    try {
      const parsed = JSON.parse(attempt);
      const candidates = normalizeCandidates(parsed);
      return { candidates, warnings: [...arr(parsed.warnings).map(safe).filter(Boolean), ...(candidates.length ? [] : ['provider-json-contained-no-usable-candidates'])], rawText: cleaned.slice(0, 700) };
    } catch {}
  }
  return { candidates: [], warnings: ['provider-returned-invalid-json'], rawText: cleaned.slice(0, 700) };
}
function heldPayload({ contract, attempts, startedAt, reason = 'strict_budgeted_upstream_no_releasable_candidate' }) {
  return {
    ok: false,
    status: 'held',
    held: true,
    released: false,
    provider: 'gemini-strict',
    model: reason,
    error: reason,
    reason,
    candidates: [],
    warnings: [reason, 'strict-budgeted-upstream', 'strict-upstream-budget-honored', 'strict-api-no-usable-candidates', 'no-local-fallback'],
    attempts,
    requestReceipt: { strictDirect: true, strictNoFallback: true, strictBudgetedUpstream: true, strictBudgetHonored: true, strictUpstreamBudgetMs: wallBudget(contract), strictAttemptBudget: attemptBudget(contract), strictFastUpstream: isFast(contract), aaveRoute: isAaveRoute(contract), modelOrder: attempts.map((a) => a.model), elapsedMs: Date.now() - startedAt, rotationVersion: VERSION }
  };
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return send(res, 200, { ok: true });
  if (req.method === 'GET') return send(res, 200, { ok: true, route: 'hush-generate-budgeted', version: VERSION, strictBudgetedUpstream: true, configuredModels: configuredModels(), preferredWorkingModel });
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method-not-allowed', version: VERSION });
  if (!process.env.GEMINI_API_KEY) return send(res, 500, { ok: false, error: 'missing-gemini-api-key', version: VERSION });

  const startedAt = Date.now();
  const contract = req.body?.contract || req.body || {};
  const sourceText = safe(contract.sourceText || contract.messageDraftText || '');
  if (!sourceText) return send(res, 400, { ok: false, error: 'missing-sourceText', version: VERSION });

  const prompt = buildPrompt(contract);
  const configured = configuredModels();
  const skipped = new Set(arr(contract.skipModels || contract.avoidModels || contract.strictReviewRetrySkipModels).map(normModel));
  const base = preferredWorkingModel ? [preferredWorkingModel, ...configured.filter((model) => model !== preferredWorkingModel)] : configured;
  const models = base.filter((model) => !skipped.has(normModel(model))).length ? base.filter((model) => !skipped.has(normModel(model))) : base;
  const attempts = [];
  const maxAttempts = attemptBudget(contract);
  const timeoutMs = callTimeout(contract);
  const wallMs = wallBudget(contract);
  const deterministic = contract.reroll !== true;

  for (const model of models.slice(0, maxAttempts)) {
    if (Date.now() - startedAt > wallMs - timeoutMs - 500) return send(res, 504, heldPayload({ contract, attempts, startedAt, reason: 'strict_budgeted_upstream_preflight_stop' }));
    const { response, payload, timedOut } = await callGemini({ model, prompt, timeoutMs, deterministic });
    const rawText = providerText(payload);
    const parsed = parseProviderJson(rawText);
    attempts.push({ model: normModel(model), ok: response.ok, status: response.status, timedOut, parsedCandidates: parsed.candidates.length, warnings: parsed.warnings, error: response.ok ? null : summarizeProviderError(payload), textPreview: rawText.slice(0, 180), strictBudgetedUpstream: true, strictFastUpstream: isFast(contract), aaveRoute: isAaveRoute(contract) });
    if (response.ok && parsed.candidates.length) {
      preferredWorkingModel = normModel(model);
      return send(res, 200, { ok: true, provider: 'gemini', model: preferredWorkingModel, deterministic, version: VERSION, rotationVersion: VERSION, candidates: parsed.candidates, warnings: [...parsed.warnings, 'strict-budgeted-upstream', 'strict-upstream-budget-honored', ...(isFast(contract) ? ['strict-fast-upstream-applied'] : ['strict-normal-upstream-budget-applied']), ...(isAaveRoute(contract) ? ['aave-route-budgeted-upstream'] : [])], attempts, rawText: parsed.rawText, requestReceipt: { deterministic, strictDirect: true, strictNoFallback: true, strictBudgetedUpstream: true, strictBudgetHonored: true, strictUpstreamBudgetMs: wallMs, strictAttemptBudget: maxAttempts, strictFastUpstream: isFast(contract), aaveRoute: isAaveRoute(contract), elapsedMs: Date.now() - startedAt, rotationVersion: VERSION } });
    }
  }

  return send(res, 504, heldPayload({ contract, attempts, startedAt }));
}
