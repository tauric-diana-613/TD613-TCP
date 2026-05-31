const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400'
};

const FALLBACK_TEXT_MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-flash-lite-latest', 'gemini-flash-latest', 'gemini-2.5-pro', 'gemini-pro-latest'];
const MAX_MODEL_ATTEMPTS = 8;
const MAX_REPAIR_STAGES = 5;
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
function candidateText(candidate = {}) {
  if (typeof candidate === 'string') return candidate;
  return String(candidate.text || candidate.output || candidate.candidate || candidate.rewrite || '').trim();
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
  if (!candidateNorm || !sourceNorm) return { copied: false, exact: false, wrapper: false, longRun: false, near: false, longestRun: 0, overlap: 0, lengthRatio: 1 };
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
function compactJson(value = {}) { return JSON.stringify(value || {}, null, 2); }
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
  return grams.slice(0, 18);
}
function operationList(contract = {}, controls = {}) {
  return Array.isArray(contract.operationTaxonomy) && contract.operationTaxonomy.length ? contract.operationTaxonomy : controls.required_operations || ['syntax_inversion', 'cadence_alias', 'register_lowering', 'register_lifting', 'lyric_pressure', 'friction_insert', 'heat_calibration', 'witness_plainness'];
}
function buildPrompt(contract = {}, repair = null) {
  const sourceText = String(contract.sourceText || '').slice(0, 7000);
  const packet = contract.flightPacket || null;
  const controls = packet?.flight_controls || {};
  const operations = operationList(contract, controls);
  const candidateCount = Math.max(6, Math.min(8, Number(controls.candidate_count || contract.candidateCount || 8)));
  const units = sourceUnits(sourceText);
  const terms = importantTerms(sourceText);
  const forbiddenRuns = sourceNgrams(sourceText, 6);
  const schema = { candidates: [{ text: 'string', style_note: 'string', style_operation: operations[0] || 'cadence_alias', preserved_propositions: ['p1'], dropped_propositions: [], changed_questions: [], new_claims: [], risk_flags: [], mask_surface_notes: { rhythm: 'string', diction: 'string', temperature: 'string', structure: 'string' } }] };
  const repairBlock = repair ? `\n\nREPAIR NOTICE:\nThe previous generation failed the copy audit. This is not a request for a preface. You must perform a deeper rewrite.\nRejected candidates:\n${repair.rejected || '- none listed'}\nMandatory repair moves:\n- Start every candidate with a different word than the source.\n- Change sentence order and sentence boundaries.\n- Keep the propositions, but break the original clause sequence.\n- Do not reuse any listed forbidden source run.\n` : '';
  return `Return JSON only. No markdown. No prose outside JSON.\nSchema:\n${compactJson(schema)}\n\nGenerate ${candidateCount} transformed candidates. Preserve the meaning, but change the surface. Use distinct style_operation values.\n\nCOPY AUDIT THAT YOUR OUTPUT MUST PASS:\n- exact copy: fail\n- source wrapped with a preface/afterword: fail\n- same sentence with a few swapped words: fail\n- any six consecutive source words: fail\n- same opening word and same clause order: likely fail\n- source token overlap may remain for protected terms, but syntax must move.\n\nRules:\n- Transform the whole source.\n- Do not summarize.\n- Do not add facts.\n- Preserve questions as questions.\n- Preserve uncertainty, negation, caveats, and causal links.\n- Preserve protected terms only when they are meaning-bearing.\n- Reorder claims and change sentence boundaries.\n- Use paraphrase, compression, expansion, inversion, cadence shift, and register shift.\n- No candidate may be a quote, wrapper, explanation, or commentary about the source.\n\nOperations:\n${operations.map((operation) => `- ${operation}`).join('\n')}\n${repairBlock}\nSOURCE PROPOSITIONS TO PRESERVE:\n${units.map((unit, index) => `P${index + 1}: ${unit}`).join('\n')}\n\nIMPORTANT TERMS TO CARRY WHEN NEEDED:\n${terms.join(', ') || '(none)'}\n\nFORBIDDEN SOURCE RUNS:\n${forbiddenRuns.map((item) => `- ${item}`).join('\n') || '- (source too short for six-word runs)'}\n\nHush Flight Packet:\n${packet ? compactJson(packet) : compactJson({ mask: contract.mask || {}, source_units: units, required_terms: terms })}\n\nSOURCE TEXT TO TRANSFORM, NOT COPY:\n${sourceText}`;
}
async function callGemini({ model, prompt, jsonMode, deterministic = true }) {
  const generationConfig = jsonMode
    ? { temperature: deterministic ? 0.28 : 0.72, topP: deterministic ? 0.72 : 0.92, responseMimeType: 'application/json', maxOutputTokens: 8192 }
    : { temperature: deterministic ? 0.28 : 0.72, topP: deterministic ? 0.72 : 0.92, maxOutputTokens: 8192 };
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(normalizeModelName(model)) + ':generateContent?key=' + encodeURIComponent(process.env.GEMINI_API_KEY), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig }) });
  const payload = await response.json().catch(() => ({}));
  return { response, payload };
}
function summarizeProviderError(payload = {}) {
  const error = payload.error || payload;
  return { code: error.code || payload.code || '', status: error.status || payload.status || '', message: String(error.message || payload.message || '').slice(0, 900) };
}
async function runProviderProbe(models = []) {
  const prompt = 'Return JSON only. Schema: {"candidates":[{"text":"probe ok","style_note":"probe","risk_flags":[]}]}';
  const attempts = [];
  for (const model of models) {
    for (const jsonMode of [true, false]) {
      const { response, payload } = await callGemini({ model, prompt, jsonMode, deterministic: true });
      const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      attempts.push({ model: normalizeModelName(model), jsonMode, ok: response.ok, providerStatus: response.status, error: response.ok ? null : summarizeProviderError(payload), textPreview: rawText.slice(0, 120) });
      if (response.ok) { preferredWorkingModel = normalizeModelName(model); return { ok: true, model: preferredWorkingModel, jsonMode, attempts }; }
    }
  }
  return { ok: false, attempts };
}
function queryFlags(req) {
  try {
    const url = new URL(req.url || '', 'https://td613.local');
    return { probe: url.searchParams.has('probe') || url.searchParams.has('selftest'), models: url.searchParams.has('models') || url.searchParams.has('listModels') };
  } catch { return { probe: false, models: false };
}

function serverRepairCandidates(sourceText = '', contract = {}) {
  const src = String(sourceText || '').trim();
  const norm = normalizedText(src);
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
  const contract = req.body?.contract || req.body || {};
  const sourceText = String(contract.sourceText || contract.messageDraftText || '').trim();
  if (!sourceText) return send(res, 400, { ok: false, error: 'missing-sourceText' });
  const models = preferredWorkingModel ? [preferredWorkingModel, ...configuredModels().filter((model) => model !== preferredWorkingModel)] : configuredModels();
  const attempts = [];
  const rejected = [];
  const deterministic = req.query?.reroll !== '1' && contract.reroll !== true;
  let repair = null;
  for (let stage = 0; stage < MAX_REPAIR_STAGES; stage += 1) {
    const prompt = buildPrompt(contract, repair);
    for (const model of models) {
      for (const jsonMode of [true, false]) {
        const { response, payload } = await callGemini({ model, prompt, jsonMode, deterministic });
        const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const parsed = parseProviderJson(rawText);
        const { usable, copied } = splitCandidates(parsed.candidates, sourceText);
        rejected.push(...copied.map((item) => ({ ...item, model: normalizeModelName(model), stage })));
        attempts.push({ stage, model: normalizeModelName(model), jsonMode, ok: response.ok, status: response.status, parsedCandidates: parsed.candidates.length, usableCandidates: usable.length, copiedCandidates: copied.length, warnings: parsed.warnings, error: response.ok ? null : summarizeProviderError(payload), textPreview: rawText.slice(0, 180) });
        if (response.ok && usable.length) {
          preferredWorkingModel = normalizeModelName(model);
          return send(res, 200, { ok: true, provider: 'gemini', model: preferredWorkingModel, deterministic, version: 'hush-generate-v3.3-stable-default', candidates: usable, warnings: parsed.warnings, attempts, rejectedCopy: rejected.slice(0, 16), rawText: parsed.rawText, requestReceipt: { deterministic, temperature: deterministic ? 0.28 : 0.72, topP: deterministic ? 0.72 : 0.92 } });
        }
      }
    }
    repair = { rejected: rejected.slice(-8).map((item) => `- ${item.preview} (${item.risk?.exact ? 'exact' : item.risk?.wrapper ? 'wrapper' : item.risk?.longRun ? 'long-run' : item.risk?.near ? 'near-copy' : 'copy-risk'})`).join('\n') || '- no parsed candidates' };
  }
  const repaired = serverRepairCandidates(sourceText, contract);
  return send(res, 200, { ok: true, provider: 'server-deterministic-repair', model: 'server-repair', deterministic, version: 'hush-generate-v3.3-stable-default', candidates: repaired.candidates, warnings: [...repaired.warnings, 'gemini-produced-no-copy-safe-candidates'], attempts, rejectedCopy: rejected.slice(0, 16), requestReceipt: { deterministic, temperature: deterministic ? 0.28 : 0.72, topP: deterministic ? 0.72 : 0.92 } });
}
