const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400'
};

const FALLBACK_TEXT_MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-flash-lite-latest'];
const MAX_MODEL_ATTEMPTS = 3;
const GEMINI_TIMEOUT_MS = 8500;
const WALL_TIMEOUT_MS = 18000;
let preferredWorkingModel = null;

function send(res, status, payload) {
  for (const [key, value] of Object.entries(corsHeaders)) res.setHeader(key, value);
  return res.status(status).json(payload);
}

function normalizeModelName(value = '') { return String(value || '').trim().replace(/^models\//, ''); }
function unique(values = []) { return [...new Set(values.map((value) => normalizeModelName(value)).filter(Boolean))]; }
function configuredModels() {
  const configured = unique([...String(process.env.GEMINI_MODEL || '').split(','), ...String(process.env.GEMINI_MODEL_FALLBACKS || '').split(',')]);
  return unique([...configured, ...FALLBACK_TEXT_MODELS]).slice(0, MAX_MODEL_ATTEMPTS);
}
function cleanJsonText(text = '') { return String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim(); }
function words(value = '') { return String(value || '').toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) || []; }
function normalizedText(value = '') { return words(value).join(' '); }
function stringArray(value) { return Array.isArray(value) ? value.map((item) => String(item || '').trim()).filter(Boolean) : []; }
function safe(value = '') { return String(value ?? '').trim(); }
function compactJson(value = {}) { return JSON.stringify(value || {}, null, 2); }
function truncate(value = '', limit = 2600) {
  const text = safe(value).replace(/\s+/g, ' ');
  return text.length > limit ? `${text.slice(0, limit).trim()}…` : text;
}
function candidateText(candidate = {}) {
  if (typeof candidate === 'string') return candidate;
  return safe(candidate.text || candidate.output || candidate.candidate || candidate.rewrite || '');
}
function normalizeProviderCandidates(value) {
  const source = Array.isArray(value) ? value : Array.isArray(value?.candidates) ? value.candidates : value?.text || value?.output || value?.candidate || value?.rewrite ? [value] : [];
  return source.map((candidate, index) => {
    const text = candidateText(candidate);
    if (!text) return null;
    return {
      text,
      style_note: typeof candidate === 'object' && candidate.style_note ? String(candidate.style_note) : `provider-candidate-${index + 1}`,
      style_operation: String(candidate.style_operation || candidate.styleOperation || candidate.operation || '').trim(),
      preserved_propositions: stringArray(candidate.preserved_propositions || candidate.preservedPropositions),
      dropped_propositions: stringArray(candidate.dropped_propositions || candidate.droppedPropositions),
      changed_questions: stringArray(candidate.changed_questions || candidate.changedQuestions),
      new_claims: stringArray(candidate.new_claims || candidate.newClaims),
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
      const candidates = normalizeProviderCandidates(parsed);
      return { candidates, warnings: [...(Array.isArray(parsed.warnings) ? parsed.warnings.map(String) : []), ...(candidates.length ? [] : ['provider-json-contained-no-usable-candidates'])], rawText: cleaned.slice(0, 600) };
    } catch {}
  }
  if (cleaned.length > 20) return { candidates: [{ text: cleaned, style_note: 'Recovered raw provider text after invalid JSON.', style_operation: 'cadence_alias', preserved_propositions: [], dropped_propositions: [], changed_questions: [], new_claims: [], mask_surface_notes: {}, risk_flags: ['provider-returned-invalid-json-recovered-raw-candidate'] }], warnings: ['provider-returned-invalid-json', 'provider-invalid-json-recovered-as-raw-candidate'], rawText: cleaned.slice(0, 600) };
  return { candidates: [], warnings: ['provider-returned-invalid-json'], rawText: cleaned.slice(0, 600) };
}
function longestSourceRun(candidateText = '', sourceText = '') {
  const candidate = words(candidateText);
  const source = words(sourceText);
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
  const candidateNorm = normalizedText(candidateText);
  const sourceNorm = normalizedText(sourceText);
  if (!candidateNorm || !sourceNorm) return { copied: false, longestRun: 0, overlap: 0, lengthRatio: 1 };
  const candidateWords = words(candidateText);
  const sourceWords = words(sourceText);
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
function splitCandidates(candidates = [], sourceText = '') {
  const usable = [];
  const copied = [];
  candidates.forEach((candidate, index) => {
    const risk = copyRisk(candidate.text || '', sourceText);
    if (risk.copied) copied.push({ index, risk, preview: String(candidate.text || '').slice(0, 180) });
    else usable.push(candidate);
  });
  return { usable, copied };
}
function sourceUnits(sourceText = '') {
  const lines = String(sourceText || '').split(/\n+/).map((line) => line.trim()).filter(Boolean);
  return lines.length ? lines : String(sourceText || '').match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((line) => line.trim()).filter(Boolean) || [];
}
function importantTerms(sourceText = '') {
  const stop = new Set('the a an and or but if is are was were be been being do does did how what why when where who whom with without into from that this those these much really very just like of in on to for no not before after you your yours i me my mine we our ours it its they them their there here some so sorry sounds sound going through have has had basically maybe came come from can could would should will as at by'.split(' '));
  return [...new Set(words(sourceText).map((word) => word.replace(/^sig$/, 'sigil').replace(/^llms$/, 'llm')).filter((word) => word.length > 2 && !stop.has(word)))].slice(0, 28);
}
function sourceNgrams(sourceText = '', n = 6) {
  const list = words(sourceText);
  const grams = [];
  for (let i = 0; i <= list.length - n; i += 1) grams.push(list.slice(i, i + n).join(' '));
  return grams.slice(0, 12);
}
function operationList(contract = {}, controls = {}) {
  return Array.isArray(contract.operationTaxonomy) && contract.operationTaxonomy.length ? contract.operationTaxonomy.slice(0, 8) : controls.required_operations || ['syntax_inversion', 'cadence_alias', 'register_lowering', 'register_lifting', 'lyric_pressure', 'friction_insert', 'heat_calibration', 'witness_plainness'];
}
function compactFlightPacket(packet = {}) {
  const style = packet.mask_style_vector || {};
  const engine = packet.stylometry_engine || {};
  return {
    packet_version: packet.packet_version || '',
    ontology_route: packet.ontology_route || {},
    mask_style_vector: {
      mask_id: style.mask_id || '',
      display_name: style.display_name || '',
      register: style.register || '',
      intended_use: style.intended_use || '',
      risk_tell: style.risk_tell || '',
      sentence_length_target: style.sentence_length_target || '',
      rhythm_target: style.rhythm_target || '',
      formality_target: style.formality_target || '',
      warmth_target: style.warmth_target || '',
      compression_target: style.compression_target || '',
      diction_hints: (style.diction_hints || []).slice(0, 8),
      transition_bank: (style.transition_bank || []).slice(0, 8),
      desired_moves: (style.desired_moves || []).slice(0, 8),
      enrichment_applied: Boolean(style.enrichment_applied),
      canonical_seed_hash: style.canonical_seed_hash || '',
      sample_seed_excerpt: truncate(style.sample_seed_excerpt || '', 900)
    },
    stylometry_engine: {
      source_profile: engine.source_profile || {},
      mask_reference_profile: engine.mask_reference_profile || {},
      target_shell: engine.target_shell || null,
      cadence_shell: engine.cadence_shell || null,
      generator_constraints: engine.generator_constraints || {},
      audit: { warnings: engine.audit?.warnings || [], enrichment: engine.audit?.enrichment ? { version: engine.audit.enrichment.version, applied: engine.audit.enrichment.applied, canonicalSeedHash: engine.audit.enrichment.canonicalSeedHash } : null }
    },
    flight_controls: packet.flight_controls || {},
    source_manifest: { proposition_summary: packet.source_manifest?.proposition_summary || {}, question_map: packet.source_manifest?.question_map || [], claim_map: packet.source_manifest?.claim_map || [] }
  };
}
function buildPrompt(contract = {}, repair = null) {
  const sourceText = String(contract.sourceText || '').slice(0, 5000);
  const packet = contract.flightPacket || null;
  const compactPacket = packet ? compactFlightPacket(packet) : { mask: contract.mask || {} };
  const controls = packet?.flight_controls || {};
  const operations = operationList(contract, controls);
  const candidateCount = Math.max(4, Math.min(6, Number(controls.candidate_count || contract.candidateCount || 6)));
  const units = sourceUnits(sourceText).slice(0, 12);
  const terms = importantTerms(sourceText);
  const forbiddenRuns = sourceNgrams(sourceText, 6);
  const schema = { candidates: [{ text: 'string', style_note: 'string', style_operation: operations[0] || 'cadence_alias', preserved_propositions: ['p1'], dropped_propositions: [], changed_questions: [], new_claims: [], risk_flags: [], mask_surface_notes: { rhythm: 'string', diction: 'string', temperature: 'string', structure: 'string' } }] };
  const repairBlock = repair ? `\n\nREPAIR NOTICE: previous candidates failed copy audit. Change openings, clause order, and sentence boundaries. Rejected: ${repair.rejected || 'none'}.` : '';
  return `Return JSON only. No markdown. No prose outside JSON.\nSchema:\n${compactJson(schema)}\n\nGenerate ${candidateCount} transformed candidates. Preserve meaning, questions, caveats, negations, uncertainty, and causal links. Do not answer questions. Do not add facts. Use distinct style_operation values. Move the source surface toward the mask target shell without quoting the canonical seed.\n\nCOPY AUDIT:\n- exact copy: fail\n- source wrapped with a preface/afterword: fail\n- same sentence with swapped words: fail\n- any six consecutive source words: fail\n- same opening word and same clause order: likely fail\n${repairBlock}\n\nOperations:\n${operations.map((operation) => `- ${operation}`).join('\n')}\n\nSOURCE PROPOSITIONS TO PRESERVE:\n${units.map((unit, index) => `P${index + 1}: ${unit}`).join('\n')}\n\nIMPORTANT TERMS:\n${terms.join(', ') || '(none)'}\n\nFORBIDDEN SOURCE RUNS:\n${forbiddenRuns.map((item) => `- ${item}`).join('\n') || '- (source too short for six-word runs)'}\n\nCOMPACT HUSH FLIGHT PACKET:\n${compactJson(compactPacket)}\n\nSOURCE TEXT TO TRANSFORM, NOT COPY:\n${sourceText}`;
}
async function callGemini({ model, prompt, jsonMode, deterministic = true }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  const generationConfig = jsonMode
    ? { temperature: deterministic ? 0.24 : 0.64, topP: deterministic ? 0.68 : 0.88, responseMimeType: 'application/json', maxOutputTokens: 4096 }
    : { temperature: deterministic ? 0.24 : 0.64, topP: deterministic ? 0.68 : 0.88, maxOutputTokens: 4096 };
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(normalizeModelName(model)) + ':generateContent?key=' + encodeURIComponent(process.env.GEMINI_API_KEY), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig }), signal: controller.signal });
    const payload = await response.json().catch(() => ({}));
    return { response, payload, timedOut: false };
  } catch (error) {
    return { response: { ok: false, status: error?.name === 'AbortError' ? 408 : 599 }, payload: { error: { message: String(error?.message || error), status: error?.name || 'FETCH_ERROR' } }, timedOut: error?.name === 'AbortError' };
  } finally {
    clearTimeout(timer);
  }
}
function summarizeProviderError(payload = {}) {
  const error = payload.error || payload;
  return { code: error.code || payload.code || '', status: error.status || payload.status || '', message: String(error.message || payload.message || '').slice(0, 900) };
}
async function runProviderProbe(models = []) {
  const prompt = 'Return JSON only. Schema: {"candidates":[{"text":"probe ok","style_note":"probe","risk_flags":[]}]}';
  const attempts = [];
  for (const model of models.slice(0, 2)) {
    const { response, payload, timedOut } = await callGemini({ model, prompt, jsonMode: true, deterministic: true });
    const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    attempts.push({ model: normalizeModelName(model), jsonMode: true, ok: response.ok, providerStatus: response.status, timedOut, error: response.ok ? null : summarizeProviderError(payload), textPreview: rawText.slice(0, 120) });
    if (response.ok) { preferredWorkingModel = normalizeModelName(model); return { ok: true, model: preferredWorkingModel, jsonMode: true, attempts }; }
  }
  return { ok: false, attempts };
}
function queryFlags(req) {
  try {
    const url = new URL(req.url || '', 'https://td613.local');
    return { probe: url.searchParams.has('probe') || url.searchParams.has('selftest'), models: url.searchParams.has('models') || url.searchParams.has('listModels') };
  } catch { return { probe: false, models: false }; }
}
function serverRepairCandidates(sourceText = '', contract = {}) {
  const src = safe(sourceText);
  const parts = src.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((p) => p.trim()) || [src];
  const qs = src.match(/[^?]+\?/g)?.map((p) => p.trim()) || [];
  const hasQuestion = qs.length > 0;
  const terms = importantTerms(src).slice(0, 6);
  const route = contract?.flightPacket?.ontology_route?.route_type || '';
  const op = contract?.flightPacket?.flight_controls?.preferred_operations?.[0] || 'cadence_alias';
  const baseQuestion = hasQuestion ? qs[0].replace(/[?]+$/g, '').trim() : parts[0].replace(/[.!?]+$/g, '').trim();
  const secondQuestion = hasQuestion && qs[1] ? qs[1].replace(/[?]+$/g, '').trim() : '';
  const topic = terms.length ? terms.join(', ') : 'the source claim';
  const candidates = hasQuestion
    ? [
      { text: `Before the credential gate gets to decide the frame, the question is ${baseQuestion.toLowerCase()}?${secondQuestion ? ` The second question stays live too: ${secondQuestion.toLowerCase()}?` : ''}`, style_note: 'server deterministic question inversion', style_operation: 'question_preservation' },
      { text: `The entry point is not the only issue: ${baseQuestion}?${secondQuestion ? ` And under that same pressure, ${secondQuestion.toLowerCase()}?` : ''}`, style_note: 'server deterministic cadence alias', style_operation: op },
      { text: `Put the question through the ${route || 'mask'} route: ${baseQuestion}?${secondQuestion ? ` Keep the follow-up intact: ${secondQuestion}?` : ''}`, style_note: 'server deterministic route surface', style_operation: 'heat_calibration' }
    ]
    : [
      { text: `The claim can move through ${topic} without keeping the source order: ${parts.slice(1).concat(parts[0]).join(' ')}`, style_note: 'server deterministic syntax inversion', style_operation: 'syntax_inversion' },
      { text: `Under the ${route || 'mask'} route, the same proposition changes pressure before it changes meaning: ${src}`, style_note: 'server deterministic route pressure', style_operation: op },
      { text: `What has to survive is not the original wrapper but the claim itself: ${src}`, style_note: 'server deterministic claim preservation', style_operation: 'cadence_alias' }
    ];
  const usable = candidates.filter((candidate) => !copyRisk(candidate.text, src).copied);
  return { candidates: usable.length ? usable : candidates, warnings: usable.length ? ['server-deterministic-repair-used'] : ['server-deterministic-repair-used-copy-risk-remains'] };
}
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return send(res, 200, { ok: true });
  if (req.method === 'GET') {
    const flags = queryFlags(req);
    const models = configuredModels();
    if (flags.models) return send(res, 200, { ok: true, configuredModels: models, preferredWorkingModel, env: { hasGeminiKey: Boolean(process.env.GEMINI_API_KEY), geminiModel: process.env.GEMINI_MODEL || '', fallbackCount: String(process.env.GEMINI_MODEL_FALLBACKS || '').split(',').filter(Boolean).length } });
    return send(res, 200, { ok: true, route: 'hush-generate', probe: await runProviderProbe(models) });
  }
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method-not-allowed' });
  if (!process.env.GEMINI_API_KEY) return send(res, 500, { ok: false, error: 'missing-gemini-api-key' });
  const startedAt = Date.now();
  const contract = req.body?.contract || req.body || {};
  const sourceText = safe(contract.sourceText || contract.messageDraftText || '');
  if (!sourceText) return send(res, 400, { ok: false, error: 'missing-sourceText' });
  const configured = configuredModels();
  const models = preferredWorkingModel ? [preferredWorkingModel, ...configured.filter((model) => model !== preferredWorkingModel)] : configured;
  const attempts = [];
  const rejected = [];
  const deterministic = req.query?.reroll !== '1' && contract.reroll !== true;
  const jsonModes = deterministic ? [true] : [true, false];
  let repair = null;
  for (let stage = 0; stage < 2; stage += 1) {
    if (Date.now() - startedAt > WALL_TIMEOUT_MS) break;
    const prompt = buildPrompt(contract, repair);
    for (const model of models.slice(0, deterministic ? 2 : 3)) {
      if (Date.now() - startedAt > WALL_TIMEOUT_MS) break;
      for (const jsonMode of jsonModes) {
        if (Date.now() - startedAt > WALL_TIMEOUT_MS) break;
        const { response, payload, timedOut } = await callGemini({ model, prompt, jsonMode, deterministic });
        const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const parsed = parseProviderJson(rawText);
        const { usable, copied } = splitCandidates(parsed.candidates, sourceText);
        rejected.push(...copied.map((item) => ({ ...item, model: normalizeModelName(model), stage })));
        attempts.push({ stage, model: normalizeModelName(model), jsonMode, ok: response.ok, status: response.status, timedOut, parsedCandidates: parsed.candidates.length, usableCandidates: usable.length, copiedCandidates: copied.length, warnings: parsed.warnings, error: response.ok ? null : summarizeProviderError(payload), textPreview: rawText.slice(0, 180) });
        if (response.ok && usable.length) {
          preferredWorkingModel = normalizeModelName(model);
          return send(res, 200, { ok: true, provider: 'gemini', model: preferredWorkingModel, deterministic, version: 'hush-generate-v3.4-fast-bounded', candidates: usable, warnings: parsed.warnings, attempts, rejectedCopy: rejected.slice(0, 16), rawText: parsed.rawText, requestReceipt: { deterministic, temperature: deterministic ? 0.24 : 0.64, topP: deterministic ? 0.68 : 0.88, bounded: true, elapsedMs: Date.now() - startedAt } });
        }
      }
    }
    repair = { rejected: rejected.slice(-6).map((item) => `- ${item.preview} (${item.risk?.exact ? 'exact' : item.risk?.wrapper ? 'wrapper' : item.risk?.longRun ? 'long-run' : item.risk?.near ? 'near-copy' : 'copy-risk'})`).join('\n') || '- no parsed candidates' };
  }
  const repaired = serverRepairCandidates(sourceText, contract);
  return send(res, 200, { ok: true, provider: 'server-deterministic-repair', model: 'server-repair', deterministic, version: 'hush-generate-v3.4-fast-bounded', candidates: repaired.candidates, warnings: [...repaired.warnings, 'gemini-fast-path-fallback-before-timeout'], attempts, rejectedCopy: rejected.slice(0, 16), requestReceipt: { deterministic, temperature: deterministic ? 0.24 : 0.64, topP: deterministic ? 0.68 : 0.88, bounded: true, elapsedMs: Date.now() - startedAt } });
}
