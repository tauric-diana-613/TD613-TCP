const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400'
};

const DEFAULT_MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-flash-lite-latest'];
const GEMINI_TIMEOUT_MS = 14000;
const WALL_TIMEOUT_MS = 26000;

function send(res, status, payload) {
  for (const [key, value] of Object.entries(corsHeaders)) res.setHeader(key, value);
  return res.status(status).json(payload);
}
function uniq(xs = []) { return [...new Set(xs.map((x) => String(x || '').trim().replace(/^models\//, '')).filter(Boolean))]; }
function models() { return uniq([...String(process.env.GEMINI_MODEL || '').split(','), ...String(process.env.GEMINI_MODEL_FALLBACKS || '').split(','), ...DEFAULT_MODELS]).slice(0, 3); }
function safe(v = '') { return String(v ?? '').trim(); }
function cleanJson(text = '') { return safe(text).replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim(); }
function words(v = '') { return safe(v).toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) || []; }
function norm(v = '') { return words(v).join(' '); }
function textOf(c = {}) { return typeof c === 'string' ? c : safe(c.text || c.output || c.candidate || c.rewrite || ''); }
function stringArray(v) { return Array.isArray(v) ? v.map((x) => safe(x)).filter(Boolean) : []; }
function normalizeCandidates(value) {
  const src = Array.isArray(value) ? value : Array.isArray(value?.candidates) ? value.candidates : value?.text || value?.output || value?.candidate || value?.rewrite ? [value] : [];
  return src.map((c, i) => {
    const text = textOf(c);
    if (!text) return null;
    return {
      text,
      style_note: typeof c === 'object' && c.style_note ? String(c.style_note) : `strict-provider-candidate-${i + 1}`,
      style_operation: safe(c.style_operation || c.styleOperation || c.operation || `strict_api_operation_${i + 1}`),
      preserved_propositions: stringArray(c.preserved_propositions || c.preservedPropositions),
      dropped_propositions: stringArray(c.dropped_propositions || c.droppedPropositions),
      changed_questions: stringArray(c.changed_questions || c.changedQuestions),
      new_claims: stringArray(c.new_claims || c.newClaims),
      mask_surface_notes: c.mask_surface_notes && typeof c.mask_surface_notes === 'object' ? c.mask_surface_notes : {},
      risk_flags: stringArray(c.risk_flags || c.riskFlags)
    };
  }).filter(Boolean).slice(0, 8);
}
function parse(text = '') {
  const cleaned = cleanJson(text);
  const attempts = [cleaned];
  const oi = cleaned.indexOf('{'), oj = cleaned.lastIndexOf('}');
  const ai = cleaned.indexOf('['), aj = cleaned.lastIndexOf(']');
  if (oi >= 0 && oj > oi) attempts.push(cleaned.slice(oi, oj + 1));
  if (ai >= 0 && aj > ai) attempts.push(cleaned.slice(ai, aj + 1));
  for (const attempt of [...new Set(attempts)].filter(Boolean)) {
    try { return { candidates: normalizeCandidates(JSON.parse(attempt)), rawText: cleaned.slice(0, 700), warnings: [] }; } catch {}
  }
  return { candidates: [], rawText: cleaned.slice(0, 700), warnings: ['provider-returned-invalid-json'] };
}
function longestRun(candidate = '', source = '') {
  const c = words(candidate), s = words(source);
  let best = 0;
  for (let i = 0; i < c.length; i++) for (let j = 0; j < s.length; j++) {
    let k = 0;
    while (c[i + k] && s[j + k] && c[i + k] === s[j + k]) k++;
    if (k > best) best = k;
  }
  return best;
}
function copyRisk(candidate = '', source = '') {
  const cn = norm(candidate), sn = norm(source);
  if (!cn || !sn) return { copied: false, longestRun: 0, overlap: 0, lengthRatio: 1 };
  const cw = words(candidate), sw = words(source);
  const cs = new Set(cw.filter((w) => w.length > 2)), ss = new Set(sw.filter((w) => w.length > 2));
  let hits = 0;
  for (const w of cs) if (ss.has(w)) hits++;
  const overlap = hits / Math.max(1, Math.max(cs.size, ss.size));
  const run = longestRun(candidate, source);
  const ratio = cw.length / Math.max(1, sw.length);
  const copied = cn === sn || (sn.length >= 24 && cn.includes(sn)) || run >= Math.min(9, Math.max(6, Math.floor(sw.length * 0.55))) || (overlap >= 0.9 && ratio >= 0.82 && ratio <= 1.35 && run >= Math.min(8, Math.max(5, Math.floor(sw.length * 0.4))));
  return { copied, longestRun: run, overlap: Number(overlap.toFixed(4)), lengthRatio: Number(ratio.toFixed(4)) };
}
function sourceUnits(source = '') { return safe(source).split(/\n+/).map((x) => x.trim()).filter(Boolean).slice(0, 12); }
function compactPacket(packet = {}) {
  const s = packet.mask_style_vector || {}, e = packet.stylometry_engine || {};
  return { packet_version: packet.packet_version || '', ontology_route: packet.ontology_route || {}, mask_style_vector: { mask_id: s.mask_id || '', display_name: s.display_name || '', register: s.register || '', rhythm_target: s.rhythm_target || '', diction_hints: (s.diction_hints || []).slice(0, 10), transition_bank: (s.transition_bank || []).slice(0, 10), desired_moves: (s.desired_moves || []).slice(0, 10), sample_seed_excerpt: safe(s.sample_seed_excerpt || '').slice(0, 1200) }, stylometry_engine: { target_shell: e.target_shell || null, cadence_shell: e.cadence_shell || null, generator_constraints: e.generator_constraints || {} }, flight_controls: packet.flight_controls || {} };
}
function prompt(contract = {}) {
  const source = safe(contract.sourceText || contract.messageDraftText || '').slice(0, 5000);
  const packet = compactPacket(contract.flightPacket || {});
  const units = sourceUnits(source);
  return `Return JSON only. No markdown. Schema: {"candidates":[{"text":"string","style_note":"string","style_operation":"string","preserved_propositions":["p1"],"dropped_propositions":[],"changed_questions":[],"new_claims":[],"risk_flags":[],"mask_surface_notes":{"rhythm":"string","diction":"string","structure":"string"}}]}\n\nSTRICT RULES:\n- Generate 4 candidates.\n- Preserve meaning, caveats, questions, negations, uncertainty, and causal links.\n- Do not answer questions.\n- Do not add facts.\n- Do not copy the source opening, closing, sentence order, punctuation skeleton, or any six-word run.\n- Use the flight packet as active stylometric control.\n- Each candidate must have a distinct style_operation.\n\nSOURCE UNITS:\n${units.map((u, i) => `P${i + 1}: ${u}`).join('\n')}\n\nFLIGHT PACKET:\n${JSON.stringify(packet, null, 2)}\n\nSOURCE TEXT:\n${source}`;
}
async function callGemini(model, bodyPrompt, jsonMode) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(process.env.GEMINI_API_KEY), {
      method: 'POST', headers: { 'content-type': 'application/json' }, signal: controller.signal,
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: bodyPrompt }] }], generationConfig: jsonMode ? { temperature: 0.72, topP: 0.9, responseMimeType: 'application/json', maxOutputTokens: 4096 } : { temperature: 0.72, topP: 0.9, maxOutputTokens: 4096 } })
    });
    const payload = await response.json().catch(() => ({}));
    return { response, payload, timedOut: false };
  } catch (error) {
    return { response: { ok: false, status: error?.name === 'AbortError' ? 408 : 599 }, payload: { error: { message: String(error?.message || error), status: error?.name || 'FETCH_ERROR' } }, timedOut: error?.name === 'AbortError' };
  } finally { clearTimeout(timer); }
}
function summarize(payload = {}) { const e = payload.error || payload; return { code: e.code || '', status: e.status || '', message: safe(e.message || '').slice(0, 900) }; }
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return send(res, 200, { ok: true });
  if (req.method === 'GET') return send(res, 200, { ok: true, route: 'hush-generate-strict', hasGeminiKey: Boolean(process.env.GEMINI_API_KEY), models: models() });
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method-not-allowed' });
  if (!process.env.GEMINI_API_KEY) return send(res, 500, { ok: false, error: 'missing-gemini-api-key', candidates: [] });
  const startedAt = Date.now();
  const contract = req.body?.contract || req.body || {};
  const source = safe(contract.sourceText || contract.messageDraftText || '');
  if (!source) return send(res, 400, { ok: false, error: 'missing-sourceText', candidates: [] });
  const attempts = [], rejectedCopy = [];
  const bodyPrompt = prompt(contract);
  for (const model of models()) {
    if (Date.now() - startedAt > WALL_TIMEOUT_MS) break;
    for (const jsonMode of [true, false]) {
      if (Date.now() - startedAt > WALL_TIMEOUT_MS) break;
      const { response, payload, timedOut } = await callGemini(model, bodyPrompt, jsonMode);
      const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsed = parse(rawText);
      const usable = [];
      for (const c of parsed.candidates) {
        const risk = copyRisk(c.text, source);
        if (risk.copied) rejectedCopy.push({ model, jsonMode, risk, preview: c.text.slice(0, 180) });
        else usable.push(c);
      }
      attempts.push({ model, jsonMode, ok: response.ok, status: response.status, timedOut, parsedCandidates: parsed.candidates.length, usableCandidates: usable.length, copiedCandidates: parsed.candidates.length - usable.length, warnings: parsed.warnings, error: response.ok ? null : summarize(payload), textPreview: rawText.slice(0, 180) });
      if (response.ok && usable.length) return send(res, 200, { ok: true, provider: 'gemini-strict', model, deterministic: false, strict: true, version: 'hush-generate-strict-v1', candidates: usable, warnings: parsed.warnings, attempts, rejectedCopy: rejectedCopy.slice(0, 16), rawText: parsed.rawText, requestReceipt: { strict: true, noFallback: true, elapsedMs: Date.now() - startedAt } });
    }
  }
  return send(res, 504, { ok: false, provider: 'gemini-strict', model: 'none', strict: true, noFallback: true, error: 'no-usable-api-candidates', candidates: [], warnings: ['strict-api-no-usable-candidates', 'no-server-repair', 'no-local-fallback'], attempts, rejectedCopy: rejectedCopy.slice(0, 16), requestReceipt: { strict: true, noFallback: true, elapsedMs: Date.now() - startedAt } });
}
