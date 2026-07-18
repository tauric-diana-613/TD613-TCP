import { buildProtectedLiteralList, checkProtectedLiteralIntegrity } from '../app/engine/hush-protected-literals.js';
import { auditHushCatchphraseQuarantine } from '../app/engine/hush-catchphrase-quarantine.js';
import { hushSanitizerReceipt, sanitizeHushRemoteContract } from '../app/engine/hush-contract-sanitizer.js';
import { auditHushSpeechActCustody, speechActPromptLaw } from '../app/engine/hush-speech-act-custody.js';

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400'
};

const VERSION = 'hush-generate-budgeted-pr188.18-speech-act-custody';
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
function providerBoundContract(contract = {}) { return sanitizeHushRemoteContract(contract); }
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
function sourceTextOf(contract = {}) { return safe(contract.sourceText || contract.messageDraftText || ''); }
function candidateBudget(contract = {}) {
  const n = Number(contract.candidateCount || controls(contract).candidate_count || 0);
  if (Number.isFinite(n) && n > 0) return Math.max(1, Math.min(n, 2));
  return words(sourceTextOf(contract)).length >= 220 ? 1 : 2;
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
  const cleanContract = providerBoundContract(contract);
  const fp = cleanContract.flightPacket || {};
  const vector = fp.mask_style_vector || {};
  const policy = fp.style_diversity_policy || vector.style_diversity || {};
  const mask = cleanContract.mask || cleanContract.selectedMask || {};
  const hints = vector.transform_hints || mask.transformHints || {};
  const diversity = vector.style_diversity || mask.diversity || {};
  const layout = vector.layout_cadence || mask.layoutCadence || mask.surfaceCadence || null;
  const punctuation = layout?.punctuation || {};
  const lineBreaks = layout?.line_breaks || layout?.lineBreaks || {};
  const markers = layout?.surface_markers || layout?.surfaceMarkers || {};
  return {
    packetTier: safe(cleanContract.packetTier || fp.packetTier || fp.packet_tier || ''),
    maskId: safe(cleanContract.maskId || cleanContract.mask_id || vector.mask_id || vector.id || cleanContract.selectedMaskId || ''),
    registerClass: safe(vector.register || policy.internalRegister || mask.internalRegister || mask.family || cleanContract.internalRegister || ''),
    surfaceClass: safe(policy.surface || diversity.surface || mask.family || ''),
    sentenceArchitecture: safe(policy.architecture || diversity.sentenceArchitecture || diversity.architecture || hints.sentence || ''),
    grammarVariance: safe(policy.grammar || diversity.grammar || hints.cadence || ''),
    chatProfile: safe(policy.chat || policy.chat_speak_profile || diversity.chat || ''),
    punctuationDensity: punctuation.punctuation_density ?? punctuation.punctuationDensity ?? '',
    punctuationStyle: safe(punctuation.style || ''),
    lineBreakTendency: safe(lineBreaks.tendency || ''),
    paragraphBreaks: lineBreaks.paragraph_break_count ?? lineBreaks.paragraphBreakCount ?? '',
    lowercaseLead: markers.lowercase_lead ?? markers.lowercaseLead ?? '',
    apostropheDrop: markers.apostrophe_drop ?? markers.apostropheDrop ?? '',
    sentence: safe(vector.sentence || hints.sentence || ''),
    warmth: safe(vector.warmth || hints.warmth || ''),
    custody: safe(vector.custody || hints.custody || ''),
    ornamentLimit: 'source-derived-only',
    layoutCadence: layout,
    dictionHints: uniq([...arr(policy.lexicon), ...arr(policy.transitions), ...arr(vector.diction_hints), ...arr(vector.transition_bank), ...arr(vector.desired_moves), ...arr(mask.dictionHints), ...arr(mask.transitionBank), ...arr(hints.desiredMoves)]).slice(0, 30),
    avoid: uniq([...arr(policy.avoid), ...arr(vector.avoid_list), ...arr(vector.avoid_moves), ...arr(mask.avoidList), ...arr(hints.avoidMoves)]).slice(0, 24),
    pressureWarnings: uniq([...arr(vector.pressure_warnings), ...arr(mask.pressureWarnings)]).slice(0, 16)
  };
}
function compactLayoutCadenceText(label = 'layout', cadence = null) {
  if (!cadence) return `${label}: unavailable`;
  const lineBreaks = cadence.line_breaks || cadence.lineBreaks || {};
  const punctuation = cadence.punctuation || {};
  const markers = cadence.surface_markers || cadence.surfaceMarkers || {};
  return `${label}: tendency=${safe(lineBreaks.tendency || 'flat')}; line_break_density=${lineBreaks.line_break_density ?? lineBreaks.lineBreakDensity ?? 0}; paragraph_breaks=${lineBreaks.paragraph_break_count ?? lineBreaks.paragraphBreakCount ?? 0}; avg_paragraph_words=${lineBreaks.average_paragraph_words ?? lineBreaks.averageParagraphWords ?? 0}; punctuation_style=${safe(punctuation.style || 'moderate')}; punctuation_density=${punctuation.punctuation_density ?? punctuation.punctuationDensity ?? 0}; lowercase_lead=${markers.lowercase_lead ?? markers.lowercaseLead ?? 0}; apostrophe_drop=${markers.apostrophe_drop ?? markers.apostropheDrop ?? 0}`;
}
function layoutCadenceLaw(contract = {}, style = {}) {
  const fp = contract.flightPacket || {};
  const engine = fp.stylometry_engine || {};
  const sourceCadence = fp.source_manifest?.source_layout_cadence || contract.sourceLayoutCadence || null;
  const maskCadence = style.layoutCadence || fp.mask_style_vector?.layout_cadence || contract.maskLayoutCadence || null;
  const constraints = engine.generator_constraints || {};
  const maskLayoutActive = Boolean(maskCadence || constraints.preserve_mask_layout_cadence || constraints.custom_mask_line_break_behavior_active || constraints.preserve_layout_cadence);
  if (!sourceCadence && !maskLayoutActive) return '';
  return `LAYOUT CADENCE CUSTODY:
- Source/input line breaks are reading context only, not output constraints. Do not copy, preserve, or force source line breaks.
- Use visible line/paragraph pacing only when the selected mask/custom-mask corpus indicates line-break behavior; otherwise choose natural pacing for the transformed message.
- Punctuation density, punctuation scarcity, repeated punctuation, lowercase sentence-start behavior, and apostrophe/contraction surface are mask cues when present in the selected custom profile. Preserve meaning and protected literals above all else.
- ${compactLayoutCadenceText('source layout diagnostic only', sourceCadence)}
- ${compactLayoutCadenceText('mask layout', maskCadence)}`;
}
function sourceObligations(sourceText = '') {
  const lines = safe(sourceText).split(/\n+/).map((s) => s.trim()).filter(Boolean);
  const sentences = safe(sourceText).match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) || [];
  const units = lines.length > 1 ? lines : sentences;
  return units.slice(0, 14).map((unit, index) => `P${index + 1}: ${unit}`);
}
function protectedLiteralsOf(contract = {}) {
  const supplied = arr(contract.protectedLiterals || contract.flightPacket?.protected_literals);
  return uniq(supplied.length ? supplied : buildProtectedLiteralList(sourceTextOf(contract)));
}
function candidateIntegrity(candidate = {}, contract = {}) {
  const literalCheck = checkProtectedLiteralIntegrity(candidate.text || '', protectedLiteralsOf(contract));
  const dropped = arr(candidate.dropped_propositions).map(safe).filter(Boolean);
  const newClaims = arr(candidate.new_claims).map(safe).filter(Boolean);
  const speechActCustody = auditHushSpeechActCustody(sourceTextOf(contract), candidate.text || '');
  const warnings = [
    ...literalCheck.missing.map((literal) => `missing-protected-literal:${literal}`),
    ...(dropped.length ? ['provider-reported-dropped-propositions'] : []),
    ...(newClaims.length ? ['provider-reported-new-claims'] : []),
    ...speechActCustody.warnings
  ];
  return { passed: literalCheck.passed && !dropped.length && !newClaims.length && speechActCustody.passed, literalCheck, dropped, newClaims, speechActCustody, warnings };
}
function aaveAcademicDrift(text = '', contract = {}) {
  if (!isAaveRoute(contract)) return false;
  const clean = safe(text);
  const lead = clean.slice(0, 360);
  return /^(?:yuval noah harari|this paper aims|for instance|furthermore|moreover|in conclusion|seneca,|marcus aurelius,|the ancient greeks|the ancient romans)\b/i.test(lead)
    || /\b(?:posits|argues that|aims to demonstrate|for instance|furthermore|moreover|renowned|solely focusing|this enduring human cognition)\b/i.test(lead);
}
function aaveCompressionDrift(text = '', contract = {}) {
  if (!isAaveRoute(contract)) return false;
  const sourceWords = words(sourceTextOf(contract)).length;
  const candidateWords = words(text).length;
  if (sourceWords < 50) return false;
  const ratio = candidateWords / Math.max(1, sourceWords);
  return ratio < 0.58;
}
function buildPrompt(rawContract = {}) {
  const contract = providerBoundContract(rawContract);
  const sourceText = sourceTextOf(contract).slice(0, 5200);
  const style = compactStyle(contract);
  const count = candidateBudget(contract);
  const aave = isAaveRoute(contract);
  const minWords = Math.max(24, Math.floor(words(sourceText).length * (aave ? 0.62 : 0.54)));
  const schemaOperation = aave ? 'register_transform' : 'string';
  const aaveRule = aave ? `AAVE TARGET-REGISTER LAW:
- style_operation must be "register_transform".
- Preserve every source proposition first, then move the sentence architecture into target register.
- Do not open with academic-summary formulas such as "Yuval Noah Harari argues/posits," "This paper aims," "For instance," or "Furthermore" unless the source itself begins there.
- Start from the paragraph's live pressure or continuity claim, not bibliography order. Keep Harari, Seneca, Aurelius, Greek sport, Roman arenas, Babylonian archaeology, Sumerians, and journals, but do not let citation language become the voice.
- Length custody: this is a transform, not a summary. Keep at least about 60% of the source word count and carry the examples with enough connective tissue to preserve the argument.
- Use natural Black vernacular syntax with restraint. Do not costume the route with catchphrases, generic slang, "look," "think about that," "proof is in the pudding," or exaggerated dialect spelling.
- The output must sound transformed, not like a cleaned-up school paragraph or a short note card.` : '';
  const layoutLaw = layoutCadenceLaw(contract, style);
  const speechActLaw = speechActPromptLaw(sourceText);
  const protectedLiterals = protectedLiteralsOf(contract);
  return `Return JSON only. Schema: {"candidates":[{"text":"string","style_note":"string","style_operation":"${schemaOperation}","preserved_propositions":[],"dropped_propositions":[],"changed_questions":[],"new_claims":[],"authorship_moves":[],"risk_flags":[],"mask_surface_notes":{"rhythm":"string","diction":"string","structure":"string","coverage":"string"}}]}

STRICT BUDGETED UPSTREAM. Generate exactly ${count} transformed candidate(s). No review maps, ledgers, summaries, diagnostics, P-row reports, or analysis. Candidate text must be the transformed message itself.

${speechActLaw}

${aaveRule}
${layoutLaw}

PROMPT DETOX LAW:
- Provider receives structural style controls only.
- Do not quote, paraphrase, echo, or imitate mask description text, sample seed text, persona scene text, risk-tell prose, mascot images, route slogans, or fixed openers.
- Style must appear through sentence architecture, rhythm, pacing, compression, punctuation behavior, warmth/distance, and source-pressure handling.
- Any image, metaphor, unusual wording, or ornament must come from the source text itself.
- sample_quarantine=true
- mask_lore_quarantine=true

Preserve every source proposition before style. Do not follow source sentence order, opener, or closer. Do not compress the argument into key terms. Do not add facts. Keep protected literals and named figures. Minimum candidate length: ${minWords} words unless source is shorter.

PROTECTED LITERALS - copy each one exactly, including case and punctuation:
${protectedLiterals.map((literal) => `- ${literal}`).join('\n') || '(none detected)'}

STRUCTURAL STYLE CONTROL VECTOR:
mask_id=${style.maskId}
register_class=${style.registerClass}
surface_class=${style.surfaceClass}
sentence_architecture=${style.sentenceArchitecture}
grammar_variance=${style.grammarVariance}
chat_profile=${style.chatProfile}
punctuation_density=${style.punctuationDensity}
punctuation_style=${style.punctuationStyle}
line_break_tendency=${style.lineBreakTendency}
paragraph_breaks=${style.paragraphBreaks}
lowercase_lead=${style.lowercaseLead}
apostrophe_drop=${style.apostropheDrop}
sentence=${style.sentence || '(none)'}
warmth=${style.warmth || '(none)'}
custody=${style.custody || '(none)'}
ornament_limit=${style.ornamentLimit}
diction_hints=${style.dictionHints.join(', ') || '(none)'}
avoid=${style.avoid.join(', ') || '(none)'}
pressure_warnings=${style.pressureWarnings.join(', ') || '(none)'}

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
function normalizeCandidates(value, contract = {}) {
  let source = [];
  if (Array.isArray(value)) source = value.flatMap((item) => Array.isArray(item?.candidates) ? item.candidates : [item]);
  else if (Array.isArray(value?.candidates)) source = value.candidates;
  else if (candidateText(value)) source = [value];
  const defaultOperation = isAaveRoute(contract) ? 'register_transform' : 'cadence_alias';
  return source.map((candidate, index) => {
    const text = candidateText(candidate);
    return text ? {
      text,
      style_note: safe(candidate.style_note || candidate.styleNote || `budgeted-provider-candidate-${index + 1}`),
      style_operation: safe(candidate.style_operation || candidate.styleOperation || candidate.operation || defaultOperation),
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
function parseProviderJson(text = '', contract = {}) {
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
      const candidates = normalizeCandidates(parsed, contract);
      return { candidates, warnings: [...arr(parsed.warnings).map(safe).filter(Boolean), ...(candidates.length ? [] : ['provider-json-contained-no-usable-candidates'])], rawText: cleaned.slice(0, 700) };
    } catch {}
  }
  return { candidates: [], warnings: ['provider-returned-invalid-json'], rawText: cleaned.slice(0, 700) };
}
function quarantineCandidateRows(candidates = [], contract = {}) {
  const sourceText = sourceTextOf(contract);
  return arr(candidates).map((candidate) => {
    const catchphraseQuarantine = auditHushCatchphraseQuarantine({ text: candidate.text || '', sourceText, contract });
    const integrity = candidateIntegrity(candidate, contract);
    const academicDrift = aaveAcademicDrift(candidate.text, contract);
    const compressionDrift = !academicDrift && aaveCompressionDrift(candidate.text, contract);
    const passed = catchphraseQuarantine.passed && integrity.passed && !academicDrift && !compressionDrift;
    return { candidate, catchphraseQuarantine, integrity, speechActCustody: integrity.speechActCustody, academicDrift, compressionDrift, passed };
  });
}
function detoxReceipt(extra = {}) { return hushSanitizerReceipt(extra); }
function heldPayload({ contract, attempts, startedAt, reason = 'strict_budgeted_upstream_no_releasable_candidate', catchphraseRejected = 0 }) {
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
    warnings: [reason, 'strict-budgeted-upstream', 'strict-upstream-budget-honored', 'strict-api-no-usable-candidates', 'no-local-fallback', 'prompt-detox-active', 'speech-act-custody-active'],
    attempts,
    requestReceipt: { strictDirect: true, strictNoFallback: true, strictBudgetedUpstream: true, strictBudgetHonored: true, strictUpstreamBudgetMs: wallBudget(contract), strictAttemptBudget: attemptBudget(contract), strictFastUpstream: isFast(contract), aaveRoute: isAaveRoute(contract), modelOrder: attempts.map((a) => a.model), elapsedMs: Date.now() - startedAt, rotationVersion: VERSION, speechActCustody: true, ...detoxReceipt({ catchphraseRejected }) }
  };
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return send(res, 200, { ok: true });
  if (req.method === 'GET') return send(res, 200, { ok: true, route: 'hush-generate-budgeted', version: VERSION, strictBudgetedUpstream: true, promptDetoxActive: true, speechActCustodyActive: true, configuredModels: configuredModels(), preferredWorkingModel });
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method-not-allowed', version: VERSION });
  if (!process.env.GEMINI_API_KEY) return send(res, 500, { ok: false, error: 'missing-gemini-api-key', version: VERSION });

  const startedAt = Date.now();
  const rawContract = req.body?.contract || req.body || {};
  const contract = providerBoundContract(rawContract);
  const sourceText = sourceTextOf(contract);
  if (!sourceText) return send(res, 400, { ok: false, error: 'missing-sourceText', version: VERSION, requestReceipt: detoxReceipt() });

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
  let catchphraseRejected = 0;

  for (const model of models.slice(0, maxAttempts)) {
    if (Date.now() - startedAt > wallMs - timeoutMs - 500) return send(res, 504, heldPayload({ contract, attempts, startedAt, reason: 'strict_budgeted_upstream_preflight_stop', catchphraseRejected }));
    const { response, payload, timedOut } = await callGemini({ model, prompt, timeoutMs, deterministic });
    const rawText = providerText(payload);
    const parsed = parseProviderJson(rawText, contract);
    const candidateRows = quarantineCandidateRows(parsed.candidates, contract);
    const catchphraseRows = candidateRows.filter((row) => !row.catchphraseQuarantine.passed);
    const academicRejected = candidateRows.filter((row) => row.catchphraseQuarantine.passed && row.academicDrift);
    const compressedRejected = candidateRows.filter((row) => row.catchphraseQuarantine.passed && row.compressionDrift);
    const integrityRejected = candidateRows.filter((row) => row.catchphraseQuarantine.passed && !row.integrity.passed);
    const speechActRejected = candidateRows.filter((row) => !row.speechActCustody?.passed);
    catchphraseRejected += catchphraseRows.length;
    const usable = candidateRows
      .filter((row) => row.passed)
      .map((row) => ({ ...row.candidate, literal_integrity: row.integrity.literalCheck, speech_act_custody: row.speechActCustody, catchphrase_quarantine: row.catchphraseQuarantine }));
    attempts.push({ model: normModel(model), ok: response.ok, status: response.status, timedOut, parsedCandidates: parsed.candidates.length, usableCandidates: usable.length, catchphraseRejected: catchphraseRows.length, literalIntegrityRejected: integrityRejected.length, speechActRejected: speechActRejected.length, literalIntegrityWarnings: uniq(integrityRejected.flatMap((row) => row.integrity.warnings)), aaveAcademicRejected: academicRejected.length, aaveCompressedRejected: compressedRejected.length, warnings: [...parsed.warnings, 'prompt-detox-active', 'speech-act-custody-active', ...(catchphraseRows.length ? ['catchphrase-quarantine-rejected-provider-candidate'] : []), ...(integrityRejected.length ? ['candidate-integrity-gate-rejected'] : []), ...(speechActRejected.length ? ['speech-act-custody-rejected-provider-candidate'] : []), ...(academicRejected.length ? ['aave-academic-summary-drift'] : []), ...(compressedRejected.length ? ['aave-compression-drift'] : [])], error: response.ok ? null : summarizeProviderError(payload), textPreview: rawText.slice(0, 180), strictBudgetedUpstream: true, strictFastUpstream: isFast(contract), aaveRoute: isAaveRoute(contract) });
    if (response.ok && usable.length) {
      preferredWorkingModel = normModel(model);
      return send(res, 200, { ok: true, provider: 'gemini', model: preferredWorkingModel, deterministic, version: VERSION, rotationVersion: VERSION, candidates: usable, warnings: [...parsed.warnings, 'prompt-detox-active', 'speech-act-custody-active', 'strict-budgeted-upstream', 'strict-upstream-budget-honored', ...(catchphraseRejected ? ['catchphrase-quarantine-rejected-provider-candidate'] : []), ...(speechActRejected.length ? ['speech-act-custody-rejected-provider-candidate'] : []), ...(isFast(contract) ? ['strict-fast-upstream-applied'] : ['strict-normal-upstream-budget-applied']), ...(isAaveRoute(contract) ? ['aave-route-budgeted-upstream', 'aave-register-fidelity-law-applied', 'aave-compression-gate-applied'] : [])], attempts, rawText: parsed.rawText, requestReceipt: { deterministic, strictDirect: true, strictNoFallback: true, strictBudgetedUpstream: true, strictBudgetHonored: true, strictUpstreamBudgetMs: wallMs, strictAttemptBudget: maxAttempts, strictFastUpstream: isFast(contract), aaveRoute: isAaveRoute(contract), aaveRegisterFidelityLaw: isAaveRoute(contract), aaveCompressionGate: isAaveRoute(contract), speechActCustody: true, elapsedMs: Date.now() - startedAt, rotationVersion: VERSION, ...detoxReceipt({ catchphraseRejected }) } });
    }
  }

  return send(res, 504, heldPayload({ contract, attempts, startedAt, catchphraseRejected }));
}

export { buildPrompt, candidateIntegrity, compactStyle, protectedLiteralsOf, providerBoundContract, quarantineCandidateRows };
