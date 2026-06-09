const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400'
};

const VERSION = 'hush-generate-v3.18.1-semantic-elasticity-helper-repair';
const ROTATION_VERSION = 'pr184.1-semantic-elasticity-helper-repair/v1';
const DEFAULT_MODEL_ORDER = ['gemini-flash-lite-latest', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'];
const GEMINI_TIMEOUT_MS = 8800;
const WALL_TIMEOUT_MS = 24500;
const MAX_OUTPUT_TOKENS = 8192;
let preferredWorkingModel = null;

const STOP_WORDS = new Set('the a an and or but if is are was were be been being do does did how what why when where who whom with without into from that this those these much really very just like of in on to for before after you your yours i me my mine we our ours it its they them their there here some so sorry sounds sound going through have has had basically maybe came come from can could would should will as at by each every all under over out up down again only still simply during onto not'.split(' '));
const DEFAULT_AUTHORSHIP_MOVES = [
  'moved the hinge forward',
  'kept metaphor pressure while changing cadence',
  'split a dense causal chain without reducing it',
  'lowered formality while preserving interpretive force',
  'kept the image function while changing vocabulary',
  'recast the hinge through contrastive grammar',
  'moved the argument into a mask-specific synonym field',
  'preserved the metaphor role without preserving the exact noun',
  'changed clause direction while preserving the semiotic relation'
];

function send(res, status, payload) {
  for (const [key, value] of Object.entries(corsHeaders)) res.setHeader(key, value);
  return res.status(status).json(payload);
}
function safe(value = '') { return String(value ?? '').trim(); }
function normalizeModelName(value = '') { return safe(value).replace(/^models\//, ''); }
function words(value = '') { return safe(value).toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) || []; }
function originalTokens(value = '') { return safe(value).match(/[A-Za-z0-9][A-Za-z0-9'’:_/.@#-]*/g) || []; }
function stringArray(value) { return Array.isArray(value) ? value.map((item) => safe(item)).filter(Boolean) : []; }
function uniq(values = []) { return [...new Set(values.map((value) => normalizeModelName(value)).filter(Boolean))]; }
function uniqueText(values = []) { return [...new Set(values.map((value) => safe(value)).filter(Boolean))]; }
function compactJson(value = {}) { return JSON.stringify(value || {}, null, 2); }
function placeholderMove(value = '') { return /^specific (mask|register|cadence|semantic) move$/i.test(safe(value)) || /^generic surface move$/i.test(safe(value)); }
function configuredModels() {
  const envModels = uniq([...safe(process.env.GEMINI_MODEL).split(','), ...safe(process.env.GEMINI_MODEL_FALLBACKS).split(',')]);
  return uniq([...DEFAULT_MODEL_ORDER, ...envModels]).sort((a, b) => {
    const ai = DEFAULT_MODEL_ORDER.indexOf(a);
    const bi = DEFAULT_MODEL_ORDER.indexOf(b);
    return (ai === -1 ? 50 : ai) - (bi === -1 ? 50 : bi);
  }).slice(0, 4);
}
function strictReviewMapRetry(contract = {}) { return contract.strictReviewMapRetry === true || /review-map/i.test(safe(contract.strictReviewMapRetryReason || '')); }
function detectComplexity(sourceText = '', contract = {}) {
  const wc = words(sourceText).length;
  const tier = safe(contract.packetTier || contract.flightPacket?.packetTier || contract.flightPacket?.packet_tier || '');
  const maskEvidenceState = safe(contract.maskEvidenceState || contract.flightPacket?.maskEvidenceState || '');
  const candidateCount = Number(contract.candidateCount || contract.flightPacket?.flight_controls?.candidate_count || 0);
  const registerTransform = /register_transform/i.test(tier);
  const chatCadence = /chat_cadence/i.test(tier);
  const hard = wc > 220 || candidateCount >= 4 || chatCadence || /theory|long/i.test(tier) || (!registerTransform && !chatCadence && /rich/i.test(maskEvidenceState));
  const medium = wc > 90 || candidateCount >= 3 || registerTransform || chatCadence;
  return { wordCount: wc, packetTier: tier, maskEvidenceState, candidateCount, hard, medium, registerTransform, chatCadence, strictReviewMapRetry: strictReviewMapRetry(contract) };
}
function minLengthRatio(sourceText = '', complexity = {}) {
  const count = words(sourceText).length;
  if (complexity.registerTransform || complexity.chatCadence) {
    if (count < 70) return 0.72;
    if (count < 140) return 0.66;
    if (count < 260) return 0.60;
    return 0.58;
  }
  if (complexity.strictReviewMapRetry) return count < 180 ? 0.54 : 0.58;
  if (complexity.hard && !complexity.strictReviewMapRetry) return 0.56;
  if (count < 80) return 0.46;
  if (count < 220) return 0.50;
  return 0.54;
}
function protectedLiteralTokens(value = '') { return originalTokens(value).filter((token) => /[A-Z][a-z]|\d|[-_:/.@#]/.test(token)); }
function importantTerms(sourceText = '', complexity = {}) {
  const found = words(sourceText).filter((word) => word.length > 2 && !STOP_WORDS.has(word));
  return [...new Set(found)].slice(0, complexity.registerTransform || complexity.chatCadence ? 24 : complexity.hard ? 28 : 20);
}
function semioticAnchorBank(sourceText = '', complexity = {}) { return importantTerms(sourceText, complexity).slice(0, complexity.registerTransform || complexity.chatCadence ? 18 : 14); }
function lexicalElasticityLevel(contract = {}, complexity = {}) {
  const style = contract.flightPacket?.mask_style_vector || {};
  const policy = contract.flightPacket?.style_diversity_policy || style.style_diversity || {};
  const surface = [style.display_name, style.rhythm_target, style.formality_target, policy.surface, policy.architecture, policy.grammar, policy.chat_speak_profile, policy.typo_policy, ...(policy.lexicon || []), ...(policy.transitions || []), ...(style.diction_hints || []), ...(style.transition_bank || [])].join(' ').toLowerCase();
  if (/source-register|preserve|custody|opacity/.test(surface)) return 'low';
  if (/coordinating|rooted|formal|grounded|structured/.test(surface)) return 'medium';
  if (/posting|chat|slang|contrast|goth|fracture|cadence|persona/.test(surface)) return 'high';
  if (complexity.chatCadence) return 'high';
  if (complexity.registerTransform) return 'medium';
  return 'medium';
}
function cleanJsonText(text = '') { return safe(text).replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim(); }
function candidateText(candidate = {}) { return typeof candidate === 'string' ? candidate : safe(candidate.text || candidate.output || candidate.candidate || candidate.rewrite || ''); }
function concreteMoves(values = [], index = 0) {
  const moves = stringArray(values).filter((move) => !placeholderMove(move));
  return moves.length ? moves.slice(0, 6) : [DEFAULT_AUTHORSHIP_MOVES[index % DEFAULT_AUTHORSHIP_MOVES.length], DEFAULT_AUTHORSHIP_MOVES[(index + 1) % DEFAULT_AUTHORSHIP_MOVES.length]];
}
function normalizeCandidates(value) {
  const source = Array.isArray(value) ? value : Array.isArray(value?.candidates) ? value.candidates : candidateText(value) ? [value] : [];
  return source.map((candidate, index) => {
    const text = candidateText(candidate);
    if (!text) return null;
    return {
      text,
      style_note: safe(candidate.style_note || candidate.styleNote || `provider-candidate-${index + 1}`),
      style_operation: safe(candidate.style_operation || candidate.styleOperation || candidate.operation || 'cadence_alias'),
      preserved_propositions: stringArray(candidate.preserved_propositions || candidate.preservedPropositions),
      dropped_propositions: stringArray(candidate.dropped_propositions || candidate.droppedPropositions),
      changed_questions: stringArray(candidate.changed_questions || candidate.changedQuestions),
      new_claims: stringArray(candidate.new_claims || candidate.newClaims),
      authorship_moves: concreteMoves(candidate.authorship_moves || candidate.authorshipMoves, index),
      mask_surface_notes: candidate.mask_surface_notes && typeof candidate.mask_surface_notes === 'object' ? candidate.mask_surface_notes : {},
      risk_flags: stringArray(candidate.risk_flags || candidate.riskFlags)
    };
  }).filter(Boolean).slice(0, 8);
}
function parseProviderJson(text = '') {
  const cleaned = cleanJsonText(text);
  const attempts = [cleaned];
  const firstObject = cleaned.indexOf('{');
  const lastObject = cleaned.lastIndexOf('}');
  if (firstObject >= 0 && lastObject > firstObject) attempts.push(cleaned.slice(firstObject, lastObject + 1));
  const firstArray = cleaned.indexOf('[');
  const lastArray = cleaned.lastIndexOf(']');
  if (firstArray >= 0 && lastArray > firstArray) attempts.push(cleaned.slice(firstArray, lastArray + 1));
  for (const attempt of [...new Set(attempts)].filter(Boolean)) {
    try {
      const parsed = JSON.parse(attempt);
      const candidates = normalizeCandidates(parsed);
      return { candidates, warnings: [...stringArray(parsed.warnings), ...(candidates.length ? [] : ['provider-json-contained-no-usable-candidates'])], rawText: cleaned.slice(0, 700) };
    } catch {}
  }
  if (cleaned.length > 20) {
    return { candidates: normalizeCandidates([{ text: cleaned, style_note: 'Recovered raw provider text after invalid JSON.', style_operation: 'cadence_alias', authorship_moves: ['recovered raw provider text'], risk_flags: ['provider-returned-invalid-json-recovered-raw-candidate'] }]), warnings: ['provider-returned-invalid-json', 'provider-invalid-json-recovered-as-raw-candidate'], rawText: cleaned.slice(0, 700) };
  }
  return { candidates: [], warnings: ['provider-returned-invalid-json'], rawText: cleaned.slice(0, 700) };
}
function normalizedText(value = '') { return words(value).join(' '); }
function longestSourceRun(candidateText = '', sourceText = '') {
  const candidate = words(candidateText), source = words(sourceText);
  if (!candidate.length || !source.length) return 0;
  const positions = new Map();
  source.forEach((word, index) => { if (!positions.has(word)) positions.set(word, []); positions.get(word).push(index); });
  let best = 0;
  for (let i = 0; i < candidate.length; i += 1) {
    for (const start of positions.get(candidate[i]) || []) {
      let run = 0;
      while (candidate[i + run] && source[start + run] && candidate[i + run] === source[start + run]) run += 1;
      if (run > best) best = run;
    }
  }
  return best;
}
function copyRisk(candidateText = '', sourceText = '', complexity = {}) {
  const candidateNorm = normalizedText(candidateText), sourceNorm = normalizedText(sourceText);
  if (!candidateNorm || !sourceNorm) return { copied: false, longestRun: 0, overlap: 0, lengthRatio: 1 };
  const candidateWords = words(candidateText), sourceWords = words(sourceText);
  const sourceSet = new Set(sourceWords.filter((word) => word.length > 2));
  const candidateSet = new Set(candidateWords.filter((word) => word.length > 2));
  let hits = 0;
  for (const word of candidateSet) if (sourceSet.has(word)) hits += 1;
  const overlap = hits / Math.max(1, Math.max(sourceSet.size, candidateSet.size));
  const longestRun = longestSourceRun(candidateText, sourceText);
  const lengthRatio = candidateWords.length / Math.max(1, sourceWords.length);
  const exact = candidateNorm === sourceNorm;
  const wrapper = !exact && sourceNorm.length >= 24 && candidateNorm.includes(sourceNorm);
  const registerLike = complexity && (complexity.registerTransform === true || complexity.chatCadence === true);
  const longRunFloor = registerLike ? Math.max(36, Math.floor(sourceWords.length * 0.18)) : Math.min(9, Math.max(6, Math.floor(sourceWords.length * 0.55)));
  const nearRunFloor = registerLike ? Math.max(48, Math.floor(sourceWords.length * 0.22)) : Math.min(8, Math.max(5, Math.floor(sourceWords.length * 0.4)));
  const longRun = longestRun >= longRunFloor;
  const near = registerLike ? overlap >= 0.82 && lengthRatio >= 0.72 && lengthRatio <= 1.35 && longestRun >= nearRunFloor : overlap >= 0.9 && lengthRatio >= 0.82 && lengthRatio <= 1.35 && longestRun >= nearRunFloor;
  return { copied: Boolean(exact || wrapper || longRun || near), exact, wrapper, longRun, near, longestRun, overlap: Number(overlap.toFixed(4)), lengthRatio: Number(lengthRatio.toFixed(4)), longRunFloor, nearRunFloor };
}
function compressionRisk(candidateText = '', sourceText = '', complexity = {}) {
  const candidateWords = words(candidateText).length;
  const sourceWords = Math.max(1, words(sourceText).length);
  const ratio = candidateWords / sourceWords;
  const floor = minLengthRatio(sourceText, complexity);
  return { compressed: sourceWords >= 42 && ratio < floor, candidateWords, sourceWords, lengthRatio: Number(ratio.toFixed(4)), floor };
}
function splitCandidates(candidates = [], sourceText = '', complexity = {}) {
  const usable = [], copied = [], compressed = [];
  candidates.forEach((candidate, index) => {
    const risk = copyRisk(candidate.text || '', sourceText, complexity);
    const compression = compressionRisk(candidate.text || '', sourceText, complexity);
    if (risk.copied) copied.push({ index, risk, preview: safe(candidate.text).slice(0, 180) });
    else if (compression.compressed) compressed.push({ index, risk: compression, preview: safe(candidate.text).slice(0, 180) });
    else usable.push(candidate);
  });
  return { usable, copied, compressed };
}
function sourceUnits(sourceText = '', complexity = {}) {
  const lines = safe(sourceText).split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const sentences = safe(sourceText).match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((line) => line.trim()).filter(Boolean) || [];
  const units = lines.length > 1 ? lines : sentences;
  return units.slice(0, complexity.registerTransform || complexity.chatCadence ? 10 : complexity.hard ? 24 : 18);
}
function compactFlightPacket(packet = {}) {
  const style = packet.mask_style_vector || {};
  const stylePolicy = packet.style_diversity_policy || style.style_diversity || {};
  return { style_diversity_policy: stylePolicy, mask_style_vector: style, flight_controls: packet.flight_controls || {}, packet_version: packet.packet_version || '', ontology_route: packet.ontology_route || {}, protective_style_policy: packet.protective_style_policy || {} };
}
function operationList(contract = {}, controls = {}) {
  return Array.isArray(contract.operationTaxonomy) && contract.operationTaxonomy.length ? contract.operationTaxonomy.slice(0, 6) : controls.preferred_operations?.slice?.(0, 6) || controls.required_operations?.slice?.(0, 6) || ['cadence_alias', 'syntax_inversion', 'register_lowering', 'friction_insert', 'witness_plainness', 'heat_calibration'];
}
function interpretiveDensityLaw() {
  return 'INTERPRETIVE DENSITY LAW:\nDo not summarize, digest, outline, simplify, explain, or strip the source down to its safest thesis. Preserve the central hinge logic, metaphor pressure, causal architecture, contradiction, strange phrases, and authorial posture. Transformation means re-voicing and re-architecting the full pressure of the passage, not reducing it. A candidate that reads like a polite summary, record note, next-step wrapper, or generic commentary is a failure.';
}
function lexicalElasticityLaw() {
  return 'LEXICAL ELASTICITY LAW:\nDo not treat every source word as protected. Preserve protected literals exactly: names, dates, amounts, IDs, quotes, file labels, and entity names. Preserve semiotic anchors by function, image, relation, pressure, and argument role. For non-protected diction, use mask-appropriate synonyms, inversions, contrastive grammar, reordered syntax, alternate phrasing, and changed semantic weather. A strong transform may share fewer surface words with the source while still preserving the source semiotic architecture.';
}
function wordCustodyText(elasticity = 'medium') {
  return `WORD CUSTODY:\n1. Protected literals stay exact.\n2. Semiotic anchors stay functionally intact but may change wording.\n3. Elastic diction should move toward the selected mask register.\nDo not over-preserve impressive nouns merely because they look important. Preserve what they do.\nLEXICAL ELASTICITY LEVEL: ${elasticity}. If elasticity is low, keep more source texture. If elasticity is medium, preserve semiotic anchors but rephrase non-protected diction. If elasticity is high, change surface vocabulary aggressively while preserving protected literals and semiotic function.`;
}
function registerCopyRepairDirective(repairBlock = '') {
  if (!/failed copy|copy/i.test(repairBlock)) return '';
  return '\n\nCOPY REPAIR REQUIRED: The last candidates preserved too much source order. Rewrite from the meaning, not the sentence sequence. Use a different opening, move the strongest later claim forward, merge or split source sentences, change clause order, and avoid more than six consecutive source words except names, quotes, IDs, or protected literals. Do not merely swap adjectives. Do not preserve the source paragraph path.';
}
function densityPrompt({ laneName, styleOperation, sourceText, candidateCount, minWords, operations, stylePolicy, compactPacket, repairBlock, retryBan, protectedLiterals, anchors, elasticity }) {
  const style = compactPacket.mask_style_vector || {};
  const lexicon = [...(stylePolicy.lexicon || []), ...(stylePolicy.transitions || []), ...(style.diction_hints || []), ...(style.transition_bank || [])].filter(Boolean).slice(0, 22);
  const avoid = (style.avoid_list || []).filter(Boolean).slice(0, 14);
  const copyRepair = registerCopyRepairDirective(repairBlock);
  const chatNote = laneName === 'CHAT CADENCE' ? 'Chat cadence may require semantic rewording, not just casualizing the same nouns. When elasticity is high, move concepts into the mask diction field. Do not simply reuse source nouns with lowercase styling.' : 'Lexical elasticity controls how far the wording may travel. Preserve protected literals exactly. Preserve semiotic anchors by function. Let non-protected diction move toward the selected register.';
  return `Return JSON only. Schema: {"candidates":[{"text":"string","style_note":"string","style_operation":"${styleOperation}","preserved_propositions":[],"dropped_propositions":[],"changed_questions":[],"new_claims":[],"authorship_moves":["concrete cadence/semantic move, not a placeholder"],"risk_flags":[],"mask_surface_notes":{"rhythm":"string","diction":"string","structure":"string","coverage":"string"}}]}

${laneName} LANE. Generate exactly ${candidateCount} transformed candidates in the selected surface. This is not analysis. Do not write review maps, ledgers, P1/P2 rows, architecture notes, custody reports, proposition reports, diagnostic notes, summaries, or explanations. Do not mention the source, packet, mask, prompt, lane, or preservation work inside candidate text. Candidate text must read like the transformed message itself.

${interpretiveDensityLaw()}

${lexicalElasticityLaw()}

${wordCustodyText(elasticity)}

SEMIOTIC ANCHORS: ${anchors.join(', ') || '(none)'}.
These are not all protected literals. Preserve their semiotic role, not automatically their exact wording.
PROTECTED LITERALS: ${protectedLiterals.join(', ') || '(none)'}.

${chatNote}

Do not preserve source sentence order, opener, or closer. Do not make a line-by-line paraphrase. Each candidate must use a distinct opening, cadence, sentence rhythm, and closure. Keep meaning, questions, negations, uncertainty, causal links, protected literals, claims, metaphor pressure, hinge logic, and stakes. Do not answer questions. Do not add facts.${retryBan}${copyRepair}

Each candidate must be at least ${minWords} words unless the source is shorter. Surface: ${stylePolicy.surface || ''}; rhythm=${style.rhythm_target || stylePolicy.architecture || ''}; formality=${style.formality_target || ''}; punctuation=${stylePolicy.punctuation || ''}; grammar=${stylePolicy.grammar || ''}; chat=${stylePolicy.chat_speak_profile || stylePolicy.chat || ''}; typo=${stylePolicy.typo_policy || ''}; diction hints=${lexicon.join(', ') || '(none)'}; avoid=${avoid.join(', ') || '(none)'}.

For authorship_moves, name actual moves such as "shifted the source noun field into mask diction," "kept the image function while changing vocabulary," "recast the hinge through contrastive grammar," "moved the argument into a lower-register synonym field," or "changed clause direction while preserving the semiotic relation." Never return placeholder moves.

OPERATIONS: ${operations.join(', ')}
${repairBlock}

MESSAGE TO TRANSFORM:
${sourceText}`;
}
function buildPrompt(contract = {}, repair = null) {
  const sourceText = safe(contract.sourceText || contract.messageDraftText || '').slice(0, 5000);
  const complexity = detectComplexity(sourceText, contract);
  const packet = contract.flightPacket || null;
  const compactPacket = packet ? compactFlightPacket(packet) : { mask_style_vector: {}, style_diversity_policy: {}, mask: contract.mask || {} };
  const controls = packet?.flight_controls || {};
  const operations = operationList(contract, controls);
  const candidateCount = complexity.registerTransform || complexity.chatCadence ? 3 : complexity.strictReviewMapRetry ? 3 : complexity.hard ? 2 : complexity.medium ? 3 : 4;
  const units = sourceUnits(sourceText, complexity);
  const anchors = semioticAnchorBank(sourceText, complexity);
  const protectedLiterals = protectedLiteralTokens(sourceText).slice(0, 28);
  const minWords = Math.max(24, Math.floor(words(sourceText).length * minLengthRatio(sourceText, complexity)));
  const stylePolicy = compactPacket.style_diversity_policy || {};
  const elasticity = lexicalElasticityLevel(contract, complexity);
  const retryBan = complexity.strictReviewMapRetry ? '\n\nSTRICT RETRY: The previous lane returned diagnostics instead of transformed text. Return only transformed candidate text. No review maps, ledgers, P rows, architecture summaries, diagnostic notes, or analysis.' : '';
  const repairBlock = repair ? `\nREPAIR: Previous output failed ${repair.kind}. Correct only that failure. ${repair.rejected || ''}` : '';
  if (complexity.registerTransform) return densityPrompt({ laneName: 'REGISTER TRANSFORM', styleOperation: 'register_transform', sourceText, candidateCount, minWords, operations, stylePolicy, compactPacket, repairBlock, retryBan, protectedLiterals, anchors, elasticity });
  if (complexity.chatCadence) return densityPrompt({ laneName: 'CHAT CADENCE', styleOperation: 'cadence_alias', sourceText, candidateCount, minWords, operations, stylePolicy, compactPacket, repairBlock, retryBan, protectedLiterals, anchors, elasticity });
  return `Return JSON only. Schema: {"candidates":[{"text":"string","style_note":"string","style_operation":"${operations[0] || 'cadence_alias'}","preserved_propositions":["P1"],"dropped_propositions":[],"changed_questions":[],"new_claims":[],"authorship_moves":["concrete mask/semantic move"],"risk_flags":[],"mask_surface_notes":{"rhythm":"string","diction":"string","structure":"string","coverage":"string"}}]}

Generate exactly ${candidateCount} candidates. Do not summarize. Each candidate must be at least ${minWords} words unless the source is shorter. Preserve meaning, questions, caveats, negations, uncertainty, and causal links. Preserve semiotic function; do not automatically preserve exact wording unless the term is a protected literal. Do not answer questions. Do not add facts. Use different style_operation values.${retryBan}

${lexicalElasticityLaw()}

SEMIOTIC ANCHORS: ${anchors.join(', ') || '(none)'}.
These are not all protected literals. Preserve their semiotic role, not automatically their exact wording.
PROTECTED LITERALS: ${protectedLiterals.join(', ') || '(none)'}.

STYLE CONTROL: ${stylePolicy.surface || ''}; architecture=${stylePolicy.architecture || ''}; punctuation=${stylePolicy.punctuation || ''}; grammar=${stylePolicy.grammar || ''}; chat=${stylePolicy.chat_speak_profile || stylePolicy.chat || ''}; typo=${stylePolicy.typo_policy || stylePolicy.typo || ''}. Human texture may change rhythm/register/punctuation only, never facts, protected literals, claims, hinge logic, or interpretive force. Preserve opacity; avoid generic institutional prose. Include two concrete authorship_moves per candidate.

OPERATIONS: ${operations.join(', ')}

SOURCE UNITS:
${units.map((unit, index) => `P${index + 1}: ${unit}`).join('\n')}

COMPACT PACKET:
${compactJson(compactPacket)}
${repairBlock}

SOURCE TEXT:
${sourceText}`;
}
function geminiTimeout(model) { return { response: { ok: false, status: 408 }, payload: { error: { message: 'Gemini call timed out under local Promise.race watchdog', status: 'AbortError', model: normalizeModelName(model), timeoutMs: GEMINI_TIMEOUT_MS } }, timedOut: true }; }
async function callGemini({ model, prompt, jsonMode = true, deterministic = true }) {
  const controller = new AbortController();
  let timer = null;
  const generationConfig = jsonMode ? { temperature: deterministic ? 0.22 : 0.58, topP: deterministic ? 0.64 : 0.88, responseMimeType: 'application/json', maxOutputTokens: MAX_OUTPUT_TOKENS } : { temperature: deterministic ? 0.22 : 0.58, topP: deterministic ? 0.64 : 0.88, maxOutputTokens: MAX_OUTPUT_TOKENS };
  const request = fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(normalizeModelName(model))}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig }), signal: controller.signal })
    .then(async (response) => ({ response, payload: await response.json().catch(() => ({})), timedOut: false }))
    .catch((error) => error?.name === 'AbortError' ? geminiTimeout(model) : { response: { ok: false, status: 599 }, payload: { error: { message: safe(error?.message || error), status: error?.name || 'FETCH_ERROR' } }, timedOut: false });
  const timeout = new Promise((resolve) => { timer = setTimeout(() => { try { controller.abort(); } catch {} resolve(geminiTimeout(model)); }, GEMINI_TIMEOUT_MS); });
  try { return await Promise.race([request, timeout]); }
  finally { if (timer) clearTimeout(timer); }
}
function providerText(payload = {}) { return payload?.candidates?.[0]?.content?.parts?.[0]?.text || ''; }
function summarizeProviderError(payload = {}) { const error = payload.error || payload; return { code: error.code || payload.code || '', status: error.status || payload.status || '', message: safe(error.message || payload.message || '').slice(0, 900) }; }
async function runProviderProbe(models = []) {
  const attempts = [];
  for (const model of models.slice(0, 3)) {
    const { response, payload, timedOut } = await callGemini({ model, prompt: 'Return JSON only: {"candidates":[{"text":"probe ok","style_note":"probe"}]}', jsonMode: true });
    attempts.push({ model: normalizeModelName(model), ok: response.ok, providerStatus: response.status, timedOut, error: response.ok ? null : summarizeProviderError(payload), textPreview: providerText(payload).slice(0, 120) });
    if (response.ok) { preferredWorkingModel = normalizeModelName(model); return { ok: true, model: preferredWorkingModel, attempts }; }
  }
  return { ok: false, attempts };
}
function queryFlags(req) { try { const url = new URL(req.url || '', 'https://td613.local'); return { models: url.searchParams.has('models') || url.searchParams.has('listModels') }; } catch { return { models: false }; } }
function repairTermBank(value = '', limit = 14) {
  const protectedTokens = protectedLiteralTokens(value);
  const content = originalTokens(value).filter((token) => { const lower = token.toLowerCase().replace(/[’']/g, ''); return lower.length > 2 && !STOP_WORDS.has(lower); });
  return uniqueText([...protectedTokens, ...content]).sort((a, b) => (b.length - a.length) || a.localeCompare(b)).slice(0, limit);
}
function relationHints(unit = '') {
  const lower = safe(unit).toLowerCase();
  const hints = [];
  if (/\bnot\b|;/.test(lower)) hints.push('contrast remains active');
  if (/\baxis\b|\bfirst\b|\bsecond\b|\bthird\b/.test(lower)) hints.push('axis structure remains visible');
  if (/\bwhen\b|\bunder\b|\bbecause\b|\btherefore\b/.test(lower)) hints.push('pressure/cause relation remains attached');
  if (/\?/.test(unit)) hints.push('question form remains open');
  if (/\bwoman|women|daughter|gender|body\b/.test(lower)) hints.push('gendered material relation remains named');
  if (/\btax|office|client|data|infrastructure|middleware\b/.test(lower)) hints.push('institutional workflow analogy remains present');
  return hints.length ? hints : ['proposition custody remains intact'];
}
function reviewMapUnit(unit = '', index = 0) {
  const terms = repairTermBank(unit, 12);
  const left = terms.slice(0, Math.ceil(terms.length / 2)).join(' / ') || 'source unit';
  const right = terms.slice(Math.ceil(terms.length / 2)).join(' / ') || 'same pressure';
  return `P${index + 1} keeps pressure on: ${left}. It also keeps ${right}. ${relationHints(unit).join('; ')}.`;
}
function reviewMapRepair(sourceText = '', contract = {}) {
  const complexity = detectComplexity(sourceText, contract);
  const units = sourceUnits(sourceText, { ...complexity, hard: true }).slice(0, 18);
  const global = repairTermBank(sourceText, 18).join(' / ');
  return `Reviewed repair surface: ${safe(contract?.flightPacket?.ontology_route?.route_type || 'selected mask')}. Architecture: proposition tags, shuffled term custody, relation hints, no sentence-order replay.\n${units.map(reviewMapUnit).join('\n')}\nGlobal custody bank: ${global}. The repair uses compact review-map structure, keeps claims bounded, and does not add facts.`;
}
function ledgerRepair(sourceText = '', contract = {}) {
  const complexity = detectComplexity(sourceText, contract);
  const units = sourceUnits(sourceText, { ...complexity, hard: true }).slice(0, 16);
  const rows = units.map((unit, index) => { const terms = repairTermBank(unit, 10); const reordered = terms.filter((_, i) => i % 2 === 1).concat(terms.filter((_, i) => i % 2 === 0)); return `Unit ${index + 1}: ${reordered.join(' | ') || 'source relation'}; ${relationHints(unit).join('; ')}.`; });
  return `Strict review ledger. This is deterministic repair surface, not provider prose.\n${rows.join('\n')}\nRelease note: term custody and relation markers are carried forward while sentence syntax is restructured.`;
}
function serverRepairCandidates(sourceText = '', contract = {}) {
  const src = safe(sourceText);
  const candidates = [
    { text: reviewMapRepair(src, contract), style_note: 'server deterministic proposition review map', style_operation: 'witness_plainness', preserved_propositions: sourceUnits(src, { hard: true }).map((_, index) => `P${index + 1}`).slice(0, 18), dropped_propositions: [], changed_questions: [], new_claims: [], authorship_moves: ['proposition labels replace sentence-order inversion', 'source terms are shuffled into custody clusters', 'review-map structure prevents wrapper prose'], mask_surface_notes: { rhythm: 'proposition-tagged review map', diction: 'custody ledger', structure: 'term clusters plus relation hints' }, risk_flags: ['server-deterministic-review-map-used'] },
    { text: ledgerRepair(src, contract), style_note: 'server deterministic review ledger', style_operation: 'friction_insert', preserved_propositions: sourceUnits(src, { hard: true }).map((_, index) => `P${index + 1}`).slice(0, 16), dropped_propositions: [], changed_questions: [], new_claims: [], authorship_moves: ['ledger format changes source syntax', 'term order is deliberately rebalanced', 'relation hints preserve claim shape'], mask_surface_notes: { rhythm: 'ledger fragments', diction: 'review custody terms', structure: 'unit rows with reordered terms' }, risk_flags: ['server-deterministic-review-map-used'] }
  ];
  const safeCandidates = candidates.filter((candidate) => !copyRisk(candidate.text, src).copied);
  const released = safeCandidates.length ? safeCandidates : candidates.map((candidate) => ({ ...candidate, risk_flags: [...candidate.risk_flags, 'review-map-needs-strict-review'] }));
  return { candidates: released, warnings: ['server-deterministic-review-map-used', ...(safeCandidates.length ? ['server-repair-review-map-cleared'] : ['server-repair-review-map-needs-review'])] };
}
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return send(res, 200, { ok: true });
  if (req.method === 'GET') {
    const models = configuredModels();
    if (queryFlags(req).models) return send(res, 200, { ok: true, version: VERSION, rotationVersion: ROTATION_VERSION, configuredModels: models, preferredWorkingModel, env: { hasGeminiKey: Boolean(process.env.GEMINI_API_KEY), geminiModel: process.env.GEMINI_MODEL || '', fallbackCount: safe(process.env.GEMINI_MODEL_FALLBACKS).split(',').filter(Boolean).length } });
    return send(res, 200, { ok: true, route: 'hush-generate', version: VERSION, rotationVersion: ROTATION_VERSION, probe: await runProviderProbe(models) });
  }
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method-not-allowed', version: VERSION });
  if (!process.env.GEMINI_API_KEY) return send(res, 500, { ok: false, error: 'missing-gemini-api-key', version: VERSION });
  const startedAt = Date.now();
  const contract = req.body?.contract || req.body || {};
  const sourceText = safe(contract.sourceText || contract.messageDraftText || '');
  if (!sourceText) return send(res, 400, { ok: false, error: 'missing-sourceText', version: VERSION });
  const strictReviewRetry = strictReviewMapRetry(contract);
  const complexity = detectComplexity(sourceText, contract);
  const configured = configuredModels();
  const baseModels = preferredWorkingModel ? [preferredWorkingModel, ...configured.filter((model) => model !== preferredWorkingModel)] : configured;
  const skippedModels = new Set(stringArray(contract.skipModels || contract.avoidModels || contract.strictReviewRetrySkipModels).map(normalizeModelName));
  const models = baseModels.filter((model) => !skippedModels.has(normalizeModelName(model))).length ? baseModels.filter((model) => !skippedModels.has(normalizeModelName(model))) : baseModels;
  const requestedAttemptBudget = Number(contract.strictReviewRetryAttemptBudget || 0);
  const requestedStageLimit = Number(contract.strictReviewRetryStageLimit || 0);
  const maxAttempts = strictReviewRetry ? Math.max(1, Math.min(requestedAttemptBudget || 3, models.length || 1)) : complexity.registerTransform || complexity.chatCadence ? Math.min(3, models.length || 1) : complexity.hard ? 2 : 3;
  const stageLimit = strictReviewRetry ? Math.max(1, Math.min(requestedStageLimit || 2, 2)) : complexity.registerTransform || complexity.chatCadence ? 2 : complexity.hard ? 1 : 2;
  const attempts = [], rejectedCopy = [], rejectedCompressed = [];
  const deterministic = req.query?.reroll !== '1' && contract.reroll !== true;
  let repair = null;
  for (let stage = 0; stage < stageLimit; stage += 1) {
    const prompt = buildPrompt(contract, repair);
    for (const model of models.slice(0, maxAttempts)) {
      if (Date.now() - startedAt > WALL_TIMEOUT_MS) break;
      const { response, payload, timedOut } = await callGemini({ model, prompt, jsonMode: true, deterministic });
      const rawText = providerText(payload);
      const parsed = parseProviderJson(rawText);
      const split = splitCandidates(parsed.candidates, sourceText, complexity);
      rejectedCopy.push(...split.copied.map((item) => ({ ...item, model: normalizeModelName(model), stage })));
      rejectedCompressed.push(...split.compressed.map((item) => ({ ...item, model: normalizeModelName(model), stage })));
      const elasticity = lexicalElasticityLevel(contract, complexity);
      attempts.push({ stage, model: normalizeModelName(model), jsonMode: true, ok: response.ok, status: response.status, timedOut, parsedCandidates: parsed.candidates.length, usableCandidates: split.usable.length, copiedCandidates: split.copied.length, compressedCandidates: split.compressed.length, warnings: parsed.warnings, error: response.ok ? null : summarizeProviderError(payload), textPreview: rawText.slice(0, 180), strictReviewMapRetry: strictReviewRetry, registerTransform: complexity.registerTransform, chatCadence: complexity.chatCadence, semanticElasticity: true, lexicalElasticityLevel: elasticity, skippedModels: [...skippedModels] });
      if (response.ok && split.usable.length) {
        preferredWorkingModel = normalizeModelName(model);
        return send(res, 200, { ok: true, provider: 'gemini', model: preferredWorkingModel, deterministic, version: VERSION, rotationVersion: ROTATION_VERSION, candidates: split.usable, warnings: [...parsed.warnings, 'interpretive-density-restored', 'semantic-elasticity-applied', 'lexical-custody-split', ...(complexity.registerTransform ? ['register-transform-prompt-lane-success'] : []), ...(complexity.chatCadence ? ['chat-cadence-prompt-lane-success'] : []), ...(strictReviewRetry ? ['strict-review-map-transform-lane-success'] : []), ...(skippedModels.size ? ['strict-review-skip-models-applied'] : [])], attempts, rejectedCopy: rejectedCopy.slice(0, 12), rejectedCompressed: rejectedCompressed.slice(0, 12), rawText: parsed.rawText, requestReceipt: { deterministic, temperature: deterministic ? 0.22 : 0.58, topP: deterministic ? 0.64 : 0.88, antiCompression: true, fastHardPacketLane: !strictReviewRetry, registerTransformPromptLane: complexity.registerTransform, chatCadencePromptLane: complexity.chatCadence, semanticElasticity: true, lexicalElasticityLevel: elasticity, rotationVersion: ROTATION_VERSION, strictReviewMapRetry: strictReviewRetry, complexity, modelOrder: models.slice(0, maxAttempts), skippedModels: [...skippedModels], minLengthRatio: minLengthRatio(sourceText, complexity), bounded: true, elapsedMs: Date.now() - startedAt } });
      }
    }
    repair = rejectedCompressed.length ? { kind: 'compression', rejected: rejectedCompressed.slice(-3).map((item) => `- ${item.preview}`).join('\n') } : { kind: 'copy', rejected: rejectedCopy.slice(-3).map((item) => `- ${item.preview}`).join('\n') };
  }
  const repaired = serverRepairCandidates(sourceText, contract);
  const elasticity = lexicalElasticityLevel(contract, complexity);
  return send(res, 200, { ok: true, provider: 'server-deterministic-repair', model: 'server-repair-review-map', deterministic, version: VERSION, rotationVersion: ROTATION_VERSION, candidates: repaired.candidates, warnings: [...repaired.warnings, 'provider-fast-lane-no-remote-release', 'semantic-elasticity-applied', 'lexical-custody-split', ...(complexity.registerTransform ? ['register-transform-prompt-lane-exhausted'] : []), ...(complexity.chatCadence ? ['chat-cadence-prompt-lane-exhausted'] : []), ...(strictReviewRetry ? ['strict-review-map-transform-lane-exhausted'] : []), ...(skippedModels.size ? ['strict-review-skip-models-applied'] : [])], attempts, rejectedCopy: rejectedCopy.slice(0, 12), rejectedCompressed: rejectedCompressed.slice(0, 12), requestReceipt: { deterministic, temperature: deterministic ? 0.22 : 0.58, topP: deterministic ? 0.64 : 0.88, antiCompression: true, fastHardPacketLane: !strictReviewRetry, registerTransformPromptLane: complexity.registerTransform, chatCadencePromptLane: complexity.chatCadence, semanticElasticity: true, lexicalElasticityLevel: elasticity, rotationVersion: ROTATION_VERSION, strictReviewMapRetry: strictReviewRetry, complexity, modelOrder: models.slice(0, maxAttempts), skippedModels: [...skippedModels], minLengthRatio: minLengthRatio(sourceText, complexity), bounded: true, elapsedMs: Date.now() - startedAt, reviewMapRepair: true, reviewMapRepairVersion: ROTATION_VERSION } });
}
