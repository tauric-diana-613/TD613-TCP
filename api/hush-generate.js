const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400'
};

const VERSION = 'hush-generate-v3.9-pr161-review-map-repair-surface';
const ROTATION_VERSION = 'pr161-review-map-repair-surface/v1';
const DEFAULT_MODEL_ORDER = ['gemini-flash-lite-latest', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'];
const GEMINI_TIMEOUT_MS = 8800;
const WALL_TIMEOUT_MS = 24500;
const MAX_OUTPUT_TOKENS = 8192;
let preferredWorkingModel = null;

const STOP_WORDS = new Set(
  'the a an and or but if is are was were be been being do does did how what why when where who whom with without into from that this those these much really very just like of in on to for before after you your yours i me my mine we our ours it its they them their there here some so sorry sounds sound going through have has had basically maybe came come from can could would should will as at by each every all under over out up down again only still simply during onto not'
    .split(' ')
);
const REPAIR_BRIDGES = [
  'keeps pressure on',
  'carries forward',
  'holds the relation between',
  'marks the hinge around',
  'keeps visible',
  'does not drop',
  'routes through',
  'keeps custody over'
];

function send(res, status, payload) {
  for (const [key, value] of Object.entries(corsHeaders)) res.setHeader(key, value);
  return res.status(status).json(payload);
}
function safe(value = '') { return String(value ?? '').trim(); }
function normalizeModelName(value = '') { return safe(value).replace(/^models\//, ''); }
function uniq(values = []) { return [...new Set(values.map((value) => normalizeModelName(value)).filter(Boolean))]; }
function words(value = '') { return safe(value).toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) || []; }
function originalTokens(value = '') {
  return safe(value).match(/[A-Za-z0-9][A-Za-z0-9'’:-]*/g) || [];
}
function uniqueText(values = []) {
  return [...new Set(values.map((value) => safe(value)).filter(Boolean))];
}
function stringArray(value) { return Array.isArray(value) ? value.map((item) => safe(item)).filter(Boolean) : []; }
function compactJson(value = {}) { return JSON.stringify(value || {}, null, 2); }
function configuredModels() {
  const configured = uniq([...safe(process.env.GEMINI_MODEL).split(','), ...safe(process.env.GEMINI_MODEL_FALLBACKS).split(',')]);
  return uniq([...DEFAULT_MODEL_ORDER, ...configured]).sort((a, b) => {
    const ai = DEFAULT_MODEL_ORDER.indexOf(a);
    const bi = DEFAULT_MODEL_ORDER.indexOf(b);
    return (ai === -1 ? 50 : ai) - (bi === -1 ? 50 : bi);
  }).slice(0, 4);
}
function detectComplexity(sourceText = '', contract = {}) {
  const wc = words(sourceText).length;
  const tier = safe(contract.packetTier || contract.flightPacket?.packetTier || contract.flightPacket?.packet_tier || '');
  const maskEvidenceState = safe(contract.maskEvidenceState || contract.flightPacket?.maskEvidenceState || '');
  const candidateCount = Number(contract.candidateCount || contract.flightPacket?.flight_controls?.candidate_count || 0);
  const hard = wc > 220 || candidateCount >= 4 || /chat_cadence|theory|long|rich/i.test(`${tier} ${maskEvidenceState}`);
  const medium = wc > 90 || candidateCount >= 3;
  return { wordCount: wc, packetTier: tier, maskEvidenceState, candidateCount, hard, medium };
}
function cleanJsonText(text = '') { return safe(text).replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim(); }
function candidateText(candidate = {}) {
  if (typeof candidate === 'string') return candidate;
  return safe(candidate.text || candidate.output || candidate.candidate || candidate.rewrite || '');
}
function inferMoves(candidate = {}, index = 0) {
  const direct = stringArray(candidate.authorship_moves || candidate.authorshipMoves);
  if (direct.length) return direct;
  const notes = candidate.mask_surface_notes && typeof candidate.mask_surface_notes === 'object' ? candidate.mask_surface_notes : {};
  const moves = [
    notes.rhythm && `rhythm:${safe(notes.rhythm)}`,
    notes.diction && `diction:${safe(notes.diction)}`,
    notes.structure && `structure:${safe(notes.structure)}`,
    (candidate.style_operation || candidate.styleOperation || candidate.operation) && `operation:${safe(candidate.style_operation || candidate.styleOperation || candidate.operation)}`
  ].filter(Boolean);
  return moves.length ? moves.slice(0, 4) : [`candidate-${index + 1}:authorship-move-inferred`];
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
      authorship_moves: inferMoves(candidate, index),
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
  if (cleaned.length > 20) return { candidates: normalizeCandidates([{ text: cleaned, style_note: 'Recovered raw provider text after invalid JSON.', style_operation: 'cadence_alias', authorship_moves: ['recovered-raw-provider-text'], risk_flags: ['provider-returned-invalid-json-recovered-raw-candidate'] }]), warnings: ['provider-returned-invalid-json', 'provider-invalid-json-recovered-as-raw-candidate'], rawText: cleaned.slice(0, 700) };
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
function copyRisk(candidateText = '', sourceText = '') {
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
  const longRun = longestRun >= Math.min(9, Math.max(6, Math.floor(sourceWords.length * 0.55)));
  const near = overlap >= 0.9 && lengthRatio >= 0.82 && lengthRatio <= 1.35 && longestRun >= Math.min(8, Math.max(5, Math.floor(sourceWords.length * 0.4)));
  return { copied: Boolean(exact || wrapper || longRun || near), exact, wrapper, longRun, near, longestRun, overlap: Number(overlap.toFixed(4)), lengthRatio: Number(lengthRatio.toFixed(4)) };
}
function minLengthRatio(sourceText = '', complexity = {}) {
  const count = words(sourceText).length;
  if (complexity.hard) return 0.50;
  if (count < 80) return 0.46;
  if (count < 220) return 0.50;
  return 0.54;
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
    const risk = copyRisk(candidate.text || '', sourceText);
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
  return units.slice(0, complexity.hard ? 24 : 18);
}
function importantTerms(sourceText = '', complexity = {}) {
  const stop = new Set('the a an and or but if is are was were be been being do does did how what why when where who whom with without into from that this those these much really very just like of in on to for no not before after you your yours i me my mine we our ours it its they them their there here some so sorry sounds sound going through have has had basically maybe came come from can could would should will as at by'.split(' '));
  return [...new Set(words(sourceText).filter((word) => word.length > 2 && !stop.has(word)))].slice(0, complexity.hard ? 28 : 20);
}
function compactFlightPacket(packet = {}) {
  const style = packet.mask_style_vector || {};
  const stylePolicy = packet.style_diversity_policy || style.style_diversity || {};
  return {
    packet_version: packet.packet_version || '',
    ontology_route: packet.ontology_route || {},
    protective_style_policy: packet.protective_style_policy || {},
    style_diversity_policy: {
      surface: stylePolicy.surface || '',
      architecture: stylePolicy.architecture || style.rhythm_target || '',
      punctuation: stylePolicy.punctuation || style.punctuation_law || '',
      grammar: stylePolicy.grammar || style.grammar_variance || '',
      chat_speak_profile: stylePolicy.chat_speak_profile || stylePolicy.chat || style.chat_speak_profile || '',
      typo_policy: stylePolicy.typo_policy || stylePolicy.typo || style.typo_policy || '',
      lexicon: (stylePolicy.lexicon || style.diction_hints || []).slice(0, 12),
      transitions: (stylePolicy.transitions || style.transition_bank || []).slice(0, 10)
    },
    mask_style_vector: {
      mask_id: style.mask_id || '',
      display_name: style.display_name || '',
      rhythm_target: style.rhythm_target || '',
      formality_target: style.formality_target || '',
      diction_hints: (style.diction_hints || []).slice(0, 12),
      transition_bank: (style.transition_bank || []).slice(0, 10),
      avoid_list: (style.avoid_list || []).slice(0, 14)
    },
    flight_controls: packet.flight_controls || {}
  };
}
function operationList(contract = {}, controls = {}) {
  return Array.isArray(contract.operationTaxonomy) && contract.operationTaxonomy.length ? contract.operationTaxonomy.slice(0, 6) : controls.preferred_operations?.slice?.(0, 6) || controls.required_operations?.slice?.(0, 6) || ['cadence_alias', 'syntax_inversion', 'register_lowering', 'friction_insert', 'witness_plainness', 'heat_calibration'];
}
function buildPrompt(contract = {}, repair = null) {
  const sourceText = safe(contract.sourceText || contract.messageDraftText || '').slice(0, 5000);
  const complexity = detectComplexity(sourceText, contract);
  const packet = contract.flightPacket || null;
  const compactPacket = packet ? compactFlightPacket(packet) : { mask: contract.mask || {} };
  const controls = packet?.flight_controls || {};
  const operations = operationList(contract, controls);
  const candidateCount = complexity.hard ? 2 : complexity.medium ? 3 : 4;
  const units = sourceUnits(sourceText, complexity);
  const terms = importantTerms(sourceText, complexity);
  const floorRatio = minLengthRatio(sourceText, complexity);
  const minWords = Math.max(28, Math.floor(words(sourceText).length * floorRatio));
  const stylePolicy = compactPacket.style_diversity_policy || {};
  const repairBlock = repair ? `\nREPAIR: Previous output failed ${repair.kind}. Correct only that failure. ${repair.rejected || ''}` : '';
  return `Return JSON only. Schema: {"candidates":[{"text":"string","style_note":"string","style_operation":"${operations[0] || 'cadence_alias'}","preserved_propositions":["P1"],"dropped_propositions":[],"changed_questions":[],"new_claims":[],"authorship_moves":["specific mask move"],"risk_flags":[],"mask_surface_notes":{"rhythm":"string","diction":"string","structure":"string","coverage":"string"}}]}\n\nGenerate exactly ${candidateCount} candidates. Do not summarize. Each candidate must be at least ${minWords} words unless the source is shorter. Preserve meaning, questions, caveats, negations, uncertainty, and causal links. Do not answer questions. Do not add facts. Do not claim a proposition is preserved unless the text carries it. Use different style_operation values.\n\nSTYLE CONTROL: ${stylePolicy.surface || ''}; architecture=${stylePolicy.architecture || ''}; punctuation=${stylePolicy.punctuation || ''}; grammar=${stylePolicy.grammar || ''}; chat=${stylePolicy.chat_speak_profile || stylePolicy.chat || ''}; typo=${stylePolicy.typo_policy || stylePolicy.typo || ''}. Human texture may change rhythm/register/punctuation only, never facts, names, dates, amounts, IDs, file labels, quotes, entities, or claims. Preserve opacity; avoid generic institutional prose. Include two concrete authorship_moves per candidate.\n\nOPERATIONS: ${operations.join(', ')}\n\nSOURCE UNITS:\n${units.map((unit, index) => `P${index + 1}: ${unit}`).join('\n')}\n\nIMPORTANT TERMS: ${terms.join(', ') || '(none)'}\n\nCOMPACT PACKET:\n${compactJson(compactPacket)}\n${repairBlock}\n\nSOURCE TEXT:\n${sourceText}`;
}
async function callGemini({ model, prompt, jsonMode = true, deterministic = true }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  const generationConfig = jsonMode ? { temperature: deterministic ? 0.22 : 0.58, topP: deterministic ? 0.64 : 0.88, responseMimeType: 'application/json', maxOutputTokens: MAX_OUTPUT_TOKENS } : { temperature: deterministic ? 0.22 : 0.58, topP: deterministic ? 0.64 : 0.88, maxOutputTokens: MAX_OUTPUT_TOKENS };
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(normalizeModelName(model))}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig }), signal: controller.signal });
    const payload = await response.json().catch(() => ({}));
    return { response, payload, timedOut: false };
  } catch (error) {
    return { response: { ok: false, status: error?.name === 'AbortError' ? 408 : 599 }, payload: { error: { message: safe(error?.message || error), status: error?.name || 'FETCH_ERROR' } }, timedOut: error?.name === 'AbortError' };
  } finally { clearTimeout(timer); }
}
function providerText(payload = {}) { return payload?.candidates?.[0]?.content?.parts?.[0]?.text || ''; }
function summarizeProviderError(payload = {}) {
  const error = payload.error || payload;
  return { code: error.code || payload.code || '', status: error.status || payload.status || '', message: safe(error.message || payload.message || '').slice(0, 900) };
}
async function runProviderProbe(models = []) {
  const attempts = [];
  for (const model of models.slice(0, 3)) {
    const { response, payload, timedOut } = await callGemini({ model, prompt: 'Return JSON only: {"candidates":[{"text":"probe ok","style_note":"probe"}]}', jsonMode: true });
    attempts.push({ model: normalizeModelName(model), ok: response.ok, providerStatus: response.status, timedOut, error: response.ok ? null : summarizeProviderError(payload), textPreview: providerText(payload).slice(0, 120) });
    if (response.ok) { preferredWorkingModel = normalizeModelName(model); return { ok: true, model: preferredWorkingModel, attempts }; }
  }
  return { ok: false, attempts };
}
function queryFlags(req) {
  try { const url = new URL(req.url || '', 'https://td613.local'); return { models: url.searchParams.has('models') || url.searchParams.has('listModels') }; } catch { return { models: false }; }
}
function repairTermBank(value = '', limit = 14) {
  const protectedTokens = originalTokens(value).filter((token) =>
    /[A-Z][a-z]|\d|[-:]/.test(token)
  );
  const content = originalTokens(value).filter((token) => {
    const lower = token.toLowerCase().replace(/[’']/g, '');
    return lower.length > 2 && !STOP_WORDS.has(lower);
  });
  return uniqueText([...protectedTokens, ...content])
    .sort((a, b) => (b.length - a.length) || a.localeCompare(b))
    .slice(0, limit);
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
  const bridge = REPAIR_BRIDGES[index % REPAIR_BRIDGES.length];
  const left = terms.slice(0, Math.ceil(terms.length / 2)).join(' / ') || 'source unit';
  const right = terms.slice(Math.ceil(terms.length / 2)).join(' / ') || 'same pressure';
  return `P${index + 1} ${bridge}: ${left}. It also keeps ${right}. ${relationHints(unit).join('; ')}.`;
}
function reviewMapRepair(sourceText = '', contract = {}) {
  const complexity = detectComplexity(sourceText, contract);
  const route = safe(
    contract?.flightPacket?.ontology_route?.route_type ||
    contract?.flightPacket?.ontology_route?.cadence_pressure ||
    'selected mask'
  );
  const style =
    contract?.flightPacket?.style_diversity_policy ||
    contract?.flightPacket?.mask_style_vector?.style_diversity ||
    {};
  const units = sourceUnits(sourceText, { ...complexity, hard: true }).slice(0, 18);
  const rows = units.map(reviewMapUnit);
  const global = repairTermBank(sourceText, 18).join(' / ');
  const maskLine =
    `Reviewed repair surface: ${safe(style.surface || route)}. ` +
    `Architecture: proposition tags, shuffled term custody, relation hints, no sentence-order replay.`;
  return `${maskLine}\n${rows.join('\n')}\nGlobal custody bank: ${global}. The repair uses compact review-map structure, keeps claims bounded, and does not add facts.`;
}
function ledgerRepair(sourceText = '', contract = {}) {
  const complexity = detectComplexity(sourceText, contract);
  const route = safe(contract?.flightPacket?.ontology_route?.route_type || 'mask');
  const units = sourceUnits(sourceText, { ...complexity, hard: true }).slice(0, 16);
  const rows = units.map((unit, index) => {
    const terms = repairTermBank(unit, 10);
    const reordered = terms
      .filter((_, i) => i % 2 === 1)
      .concat(terms.filter((_, i) => i % 2 === 0));
    return `Unit ${index + 1}: ${reordered.join(' | ') || 'source relation'}; ${relationHints(unit).join('; ')}.`;
  });
  return `Strict review ledger for ${route}. This is deterministic repair surface, not provider prose.\n${rows.join('\n')}\nRelease note: term custody and relation markers are carried forward while sentence syntax is restructured.`;
}
function serverRepairCandidates(sourceText = '', contract = {}) {
  const src = safe(sourceText);
  const candidates = [
    {
      text: reviewMapRepair(src, contract),
      style_note: 'server deterministic proposition review map',
      style_operation: 'witness_plainness',
      preserved_propositions: sourceUnits(src, { hard: true })
        .map((_, index) => `P${index + 1}`)
        .slice(0, 18),
      dropped_propositions: [],
      changed_questions: [],
      new_claims: [],
      authorship_moves: [
        'proposition labels replace sentence-order inversion',
        'source terms are shuffled into custody clusters',
        'review-map structure prevents wrapper prose'
      ],
      mask_surface_notes: {
        rhythm: 'proposition-tagged review map',
        diction: 'custody ledger',
        structure: 'term clusters plus relation hints'
      },
      risk_flags: ['server-deterministic-review-map-used']
    },
    {
      text: ledgerRepair(src, contract),
      style_note: 'server deterministic review ledger',
      style_operation: 'friction_insert',
      preserved_propositions: sourceUnits(src, { hard: true })
        .map((_, index) => `P${index + 1}`)
        .slice(0, 16),
      dropped_propositions: [],
      changed_questions: [],
      new_claims: [],
      authorship_moves: [
        'ledger format changes source syntax',
        'term order is deliberately rebalanced',
        'relation hints preserve claim shape'
      ],
      mask_surface_notes: {
        rhythm: 'ledger fragments',
        diction: 'review custody terms',
        structure: 'unit rows with reordered terms'
      },
      risk_flags: ['server-deterministic-review-map-used']
    }
  ];
  const safeCandidates = candidates.filter((candidate) => !copyRisk(candidate.text, src).copied);
  const released = safeCandidates.length
    ? safeCandidates
    : candidates.map((candidate) => ({
        ...candidate,
        risk_flags: [...candidate.risk_flags, 'review-map-needs-strict-review']
      }));
  return {
    candidates: released,
    warnings: [
      'server-deterministic-review-map-used',
      ...(safeCandidates.length
        ? ['server-repair-review-map-cleared']
        : ['server-repair-review-map-needs-review'])
    ]
  };
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
  const complexity = detectComplexity(sourceText, contract);
  const configured = configuredModels();
  const models = preferredWorkingModel ? [preferredWorkingModel, ...configured.filter((model) => model !== preferredWorkingModel)] : configured;
  const maxAttempts = complexity.hard ? 2 : 3;
  const attempts = [], rejectedCopy = [], rejectedCompressed = [];
  const deterministic = req.query?.reroll !== '1' && contract.reroll !== true;
  let repair = null;

  for (let stage = 0; stage < (complexity.hard ? 1 : 2); stage += 1) {
    const prompt = buildPrompt(contract, repair);
    for (const model of models.slice(0, maxAttempts)) {
      if (Date.now() - startedAt > WALL_TIMEOUT_MS) break;
      const { response, payload, timedOut } = await callGemini({ model, prompt, jsonMode: true, deterministic });
      const rawText = providerText(payload);
      const parsed = parseProviderJson(rawText);
      const split = splitCandidates(parsed.candidates, sourceText, complexity);
      rejectedCopy.push(...split.copied.map((item) => ({ ...item, model: normalizeModelName(model), stage })));
      rejectedCompressed.push(...split.compressed.map((item) => ({ ...item, model: normalizeModelName(model), stage })));
      attempts.push({ stage, model: normalizeModelName(model), jsonMode: true, ok: response.ok, status: response.status, timedOut, parsedCandidates: parsed.candidates.length, usableCandidates: split.usable.length, copiedCandidates: split.copied.length, compressedCandidates: split.compressed.length, warnings: parsed.warnings, error: response.ok ? null : summarizeProviderError(payload), textPreview: rawText.slice(0, 180) });
      if (response.ok && split.usable.length) {
        preferredWorkingModel = normalizeModelName(model);
        return send(res, 200, { ok: true, provider: 'gemini', model: preferredWorkingModel, deterministic, version: VERSION, rotationVersion: ROTATION_VERSION, candidates: split.usable, warnings: parsed.warnings, attempts, rejectedCopy: rejectedCopy.slice(0, 12), rejectedCompressed: rejectedCompressed.slice(0, 12), rawText: parsed.rawText, requestReceipt: { deterministic, temperature: deterministic ? 0.22 : 0.58, topP: deterministic ? 0.64 : 0.88, antiCompression: true, fastHardPacketLane: true, complexity, modelOrder: models.slice(0, maxAttempts), minLengthRatio: minLengthRatio(sourceText, complexity), bounded: true, elapsedMs: Date.now() - startedAt } });
      }
    }
    repair = rejectedCompressed.length ? { kind: 'compression', rejected: rejectedCompressed.slice(-3).map((item) => `- ${item.preview}`).join('\n') } : { kind: 'copy', rejected: rejectedCopy.slice(-3).map((item) => `- ${item.preview}`).join('\n') };
  }

  const repaired = serverRepairCandidates(sourceText, contract);
  return send(res, 200, { ok: true, provider: 'server-deterministic-repair', model: 'server-repair-review-map', deterministic, version: VERSION, rotationVersion: ROTATION_VERSION, candidates: repaired.candidates, warnings: [...repaired.warnings, 'provider-fast-lane-no-remote-release'], attempts, rejectedCopy: rejectedCopy.slice(0, 12), rejectedCompressed: rejectedCompressed.slice(0, 12), requestReceipt: { deterministic, temperature: deterministic ? 0.22 : 0.58, topP: deterministic ? 0.64 : 0.88, antiCompression: true, fastHardPacketLane: true, complexity, modelOrder: models.slice(0, maxAttempts), minLengthRatio: minLengthRatio(sourceText, complexity), bounded: true, elapsedMs: Date.now() - startedAt, reviewMapRepair: true, reviewMapRepairVersion: ROTATION_VERSION } });
}
