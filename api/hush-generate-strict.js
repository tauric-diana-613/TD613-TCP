const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400'
};

const DEFAULT_MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-flash-lite-latest'];
const GEMINI_TIMEOUT_MS = 12000;
const WALL_TIMEOUT_MS = 18000;
const STRICT_CANDIDATE_COUNT = 4;
const STRICT_PROVIDER_VERSION = 'hush-generate-strict-v4-authorship-locks';

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
      authorship_moves: stringArray(c.authorship_moves || c.authorshipMoves),
      mask_surface_notes: c.mask_surface_notes && typeof c === 'object' ? c.mask_surface_notes : {},
      risk_flags: stringArray(c.risk_flags || c.riskFlags)
    };
  }).filter(Boolean).slice(0, STRICT_CANDIDATE_COUNT);
}
function parse(text = '') {
  const cleaned = cleanJson(text);
  if (!cleaned) return { candidates: [], rawText: '', warnings: ['provider_empty_text'] };
  const attempts = [cleaned];
  const oi = cleaned.indexOf('{'), oj = cleaned.lastIndexOf('}');
  const ai = cleaned.indexOf('['), aj = cleaned.lastIndexOf(']');
  if (oi >= 0 && oj > oi) attempts.push(cleaned.slice(oi, oj + 1));
  if (ai >= 0 && aj > ai) attempts.push(cleaned.slice(ai, aj + 1));
  for (const attempt of [...new Set(attempts)].filter(Boolean)) {
    try { return { candidates: normalizeCandidates(JSON.parse(attempt)), rawText: cleaned.slice(0, 500), warnings: [] }; } catch {}
  }
  return { candidates: [], rawText: cleaned.slice(0, 500), warnings: ['provider_invalid_json'] };
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
function splitSourceUnits(source = '') {
  const raw = safe(source).split(/(?:\n+|(?<=[.!?])\s+)/).map((x) => x.trim()).filter(Boolean);
  const seen = new Set(), out = [];
  for (const unit of raw) {
    const key = norm(unit);
    if (!key || seen.has(key)) continue;
    if ([...seen].some((prev) => prev.length > 20 && (prev.includes(key) || key.includes(prev)))) continue;
    seen.add(key); out.push(unit);
    if (out.length >= 10) break;
  }
  return out;
}
function retrySeconds(payload = {}, response) {
  const header = Number(response?.headers?.get?.('retry-after'));
  if (Number.isFinite(header) && header > 0) return Math.ceil(header);
  const message = safe(payload?.error?.message || payload?.message || '');
  const match = message.match(/retry\s+in\s+([\d.]+)s/i);
  return match ? Math.ceil(Number(match[1])) : null;
}
function summarize(payload = {}, response) {
  const e = payload.error || payload;
  return { code: e.code || response?.status || '', status: e.status || '', message: safe(e.message || '').slice(0, 360) };
}
function rootWarning(payload = {}, response = {}, timedOut = false) {
  const msg = safe(payload?.error?.message || payload?.message || '').toLowerCase();
  const status = Number(response.status || 0);
  if (status === 429 || /quota|resource_exhausted|rate[-\s]?limit/.test(msg)) return 'provider_quota_exhausted';
  if (timedOut || status === 408) return 'provider_timeout';
  if (status >= 500) return 'provider_http_' + status;
  if (status >= 400) return 'provider_rejected_' + status;
  return 'provider_error';
}
function forbiddenMoves(route = {}) {
  return stringArray(route.forbidden_moves).filter((x) => !/preserve uncertainty|do not add new factual claims/i.test(x)).slice(0, 12);
}
function authorKernel(packet = {}, s = {}) {
  const fromPacket = packet.authorship_kernel || s.authorship_kernel || {};
  const seed = safe(s.sample_seed_excerpt || '');
  const lexical = uniq([...(stringArray(fromPacket.lexical_signature)), ...stringArray(s.diction_hints).map((x) => x.includes(',') ? x.split(',').pop() : x), ...stringArray(s.transition_bank)]).slice(0, 14);
  return {
    version: fromPacket.version || 'pr134-authorship-kernel/v1',
    mask_id: fromPacket.mask_id || s.mask_id || '',
    display_name: fromPacket.display_name || s.display_name || '',
    sentence_architecture: fromPacket.sentence_architecture || fromPacket.rhythmic_law || safe(seed.match(/Sentence length tendency:[^\n.]+/i)?.[0] || '').replace(/^Sentence length tendency:\s*/i, '') || 'mask-specific sentence architecture',
    diction_weather: fromPacket.diction_weather || s.formality_target || s.register || '',
    social_posture: fromPacket.social_posture || s.warmth_target || '',
    punctuation_law: fromPacket.punctuation_law || '',
    opening_moves: uniq([...(stringArray(fromPacket.opening_moves)), ...stringArray(s.transition_bank)]).slice(0, 10),
    lexical_signature: lexical,
    signature_moves: uniq([...(stringArray(fromPacket.signature_moves)), ...stringArray(s.desired_moves)]).slice(0, 12),
    contrast_against: stringArray(fromPacket.contrast_against).slice(0, 8),
    generic_avoid: uniq([...(stringArray(fromPacket.generic_avoid || fromPacket.banned_generic_moves)), ...stringArray(s.avoid_list), 'Here is', 'In summary', 'To clarify', 'This version', 'This rewrite']).slice(0, 18),
    release_requirements: uniq([...(stringArray(fromPacket.release_requirements)), 'preserve source units before style flourish', 'make this mask audibly different from the other masks', 'put concrete rhythm/diction choices in mask_surface_notes']).slice(0, 8)
  };
}
function compactPacket(packet = {}, candidateCount = STRICT_CANDIDATE_COUNT) {
  const route = packet.ontology_route || {}, s = packet.mask_style_vector || {}, e = packet.stylometry_engine || {}, controls = packet.flight_controls || {};
  const authorship = authorKernel(packet, s);
  return {
    packet_version: packet.packet_version || '',
    ontology_route: {
      route_type: route.route_type || '',
      source_type: route.source_type || '',
      semantic_risk: route.semantic_risk || '',
      transformation_depth: route.transformation_depth || '',
      allowed_moves: stringArray(route.allowed_moves).slice(0, 8),
      forbidden_moves: forbiddenMoves(route),
      cadence_pressure: route.cadence_pressure || ''
    },
    mask_style_vector: {
      mask_id: s.mask_id || '',
      display_name: s.display_name || '',
      register: s.register || '',
      rhythm_target: s.rhythm_target || '',
      diction_hints: stringArray(s.diction_hints).slice(0, 8),
      transition_bank: stringArray(s.transition_bank).slice(0, 8),
      avoid_list: stringArray(s.avoid_list).slice(0, 10),
      desired_moves: stringArray(s.desired_moves).slice(0, 8),
      sample_seed_excerpt: safe(s.sample_seed_excerpt || '').slice(0, 900)
    },
    authorship_kernel: authorship,
    stylometry_engine: {
      target_shell: e.target_shell || s.target_shell || null,
      cadence_shell: e.cadence_shell || null,
      generator_constraints: {
        avoid_exact_surface_copy: e.generator_constraints?.avoid_exact_surface_copy !== false,
        require_sentence_boundary_movement: e.generator_constraints?.require_sentence_boundary_movement !== false,
        require_visible_axis_movement: e.generator_constraints?.require_visible_axis_movement !== false,
        axis_targets: e.generator_constraints?.axis_targets || e.target_shell || s.target_shell || null
      }
    },
    flight_controls: {
      candidate_count: candidateCount,
      required_operation_diversity: controls.required_operation_diversity !== false,
      preserve_questions_as_questions: controls.preserve_questions_as_questions !== false,
      do_not_answer_source_questions: controls.do_not_answer_source_questions !== false,
      do_not_add_facts: controls.do_not_add_facts !== false,
      do_not_strengthen_claims: controls.do_not_strengthen_claims !== false,
      avoid_collapse_surface: controls.avoid_collapse_surface !== false,
      preferred_operations: stringArray(controls.preferred_operations).slice(0, 6),
      authorship_kernel_required: true
    }
  };
}
function minLengthRatioFor(contract = {}) {
  const tier = safe(contract.packetTier || '').toLowerCase();
  const evidence = safe(contract.maskEvidenceState || '').toLowerCase();
  if (tier.includes('chat_cadence')) return evidence === 'thin' ? 0.66 : 0.58;
  if (tier.includes('low_signature')) return 0.42;
  return 0.52;
}
function coverageLock(contract = {}, units = []) {
  const minRatio = minLengthRatioFor(contract);
  const tier = safe(contract.packetTier || 'standard_packet');
  const evidence = safe(contract.maskEvidenceState || 'unknown');
  return `COVERAGE LOCKS:\n- Packet tier: ${tier}. Mask evidence: ${evidence}.\n- Source-unit count: ${units.length}. Every candidate must preserve every source unit P1-P${Math.max(1, units.length)} unless a unit is truly empty.\n- Put each preserved unit label in preserved_propositions. Example: ["P1","P2","P3"].\n- dropped_propositions must be [] unless a source unit is impossible to preserve without adding facts.\n- Candidate text must be at least ${Math.round(minRatio * 100)}% of the source word count and must not feel like a summary.\n- For chat cadence packets, preserve social function, warmth/softening, uncertainty, sequence, and conversational relationship cues.\n- Do not compress multiple separate ideas into one vague sentence.\n- Do not produce aphorisms, taglines, captions, or wrapper notes.\n- Better to make a slightly longer mask-shaped message than a stylish message that drops source units.`;
}
function authorshipLock(packet = {}) {
  const k = packet.authorship_kernel || {};
  return `AUTHORSHIP LOCKS:\n- Mask voice: ${k.display_name || k.mask_id || 'selected mask'}.\n- Sentence architecture: ${k.sentence_architecture || 'follow mask architecture'}.\n- Diction weather: ${k.diction_weather || 'follow mask diction'}.\n- Social posture: ${k.social_posture || 'follow mask posture'}.\n- Punctuation law: ${k.punctuation_law || 'follow mask punctuation'}.\n- Preferred opening moves: ${stringArray(k.opening_moves).join('; ') || 'derive from mask, not source'}.\n- Lexical signature: ${stringArray(k.lexical_signature).join('; ') || 'use mask diction hints concretely'}.\n- Signature moves: ${stringArray(k.signature_moves).join('; ') || 'show mask-specific architecture and rhythm'}.\n- Avoid generic surface moves: ${stringArray(k.generic_avoid).join('; ') || 'generic assistant framing'}.\n- Contrast rules: ${stringArray(k.contrast_against).join('; ') || 'do not sound interchangeable with adjacent masks'}.\n- Each candidate must list authorship_moves naming two concrete mask-specific choices it used.\n- mask_surface_notes must describe rhythm, diction, and structure with concrete language, not boilerplate.`;
}
function prompt(contract = {}) {
  const source = safe(contract.sourceText || contract.messageDraftText || '').slice(0, 5000);
  const candidateCount = Math.min(STRICT_CANDIDATE_COUNT, Math.max(2, Number(contract.candidateCount || STRICT_CANDIDATE_COUNT) || STRICT_CANDIDATE_COUNT));
  const packet = compactPacket(contract.flightPacket || {}, candidateCount);
  const units = splitSourceUnits(source);
  return `Return JSON only. No markdown. Schema: {"candidates":[{"text":"string","style_note":"string","style_operation":"string","preserved_propositions":["P1"],"dropped_propositions":[],"changed_questions":[],"new_claims":[],"authorship_moves":["string"],"risk_flags":[],"mask_surface_notes":{"rhythm":"string","diction":"string","structure":"string"}}]}\n\nSTRICT RULES:\n- Generate ${candidateCount} candidates.\n- Preserve meaning, caveats, questions, negations, uncertainty, sequence, relationship cues, and causal links.\n- Do not answer questions.\n- Do not add facts or strengthen claims.\n- Do not copy the source opening, closing, sentence order, punctuation skeleton, or any six-word run.\n- Use the provider packet as active stylometric control.\n- Use authorship_kernel as a release-critical author surface, not decorative context.\n- Each candidate must have a distinct style_operation.\n- If the source has multiple sentences or clauses, the transformed message must still carry those separate units.\n\n${coverageLock(contract, units)}\n\n${authorshipLock(packet)}\n\nSOURCE UNITS:\n${units.map((u, i) => `P${i + 1}: ${u}`).join('\n')}\n\nPROVIDER PACKET:\n${JSON.stringify(packet, null, 2)}\n\nSOURCE TEXT:\n${source}`;
}
async function callGemini(model, bodyPrompt, jsonMode) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(process.env.GEMINI_API_KEY), {
      method: 'POST', headers: { 'content-type': 'application/json' }, signal: controller.signal,
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: bodyPrompt }] }], generationConfig: jsonMode ? { temperature: 0.7, topP: 0.9, responseMimeType: 'application/json', maxOutputTokens: 4096 } : { temperature: 0.7, topP: 0.9, maxOutputTokens: 4096 } })
    });
    const payload = await response.json().catch(() => ({}));
    return { response, payload, timedOut: false };
  } catch (error) {
    return { response: { ok: false, status: error?.name === 'AbortError' ? 408 : 599, headers: { get: () => null } }, payload: { error: { message: String(error?.message || error), status: error?.name || 'FETCH_ERROR' } }, timedOut: error?.name === 'AbortError' };
  } finally { clearTimeout(timer); }
}
function attemptRecord(model, jsonMode, response, payload, timedOut, parsed = null, usable = [], copied = 0) {
  const warning = response.ok ? (parsed?.warnings?.[0] || '') : rootWarning(payload, response, timedOut);
  return { model, jsonMode, ok: response.ok, status: response.status, warning, retryAfterSeconds: warning === 'provider_quota_exhausted' ? retrySeconds(payload, response) : null, parsedCandidates: parsed ? parsed.candidates.length : 0, usableCandidates: usable.length, copiedCandidates: copied, timedOut: !!timedOut, error: response.ok ? null : summarize(payload, response) };
}
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return send(res, 200, { ok: true });
  if (req.method === 'GET') return send(res, 200, { ok: true, route: 'hush-generate-strict', hasGeminiKey: Boolean(process.env.GEMINI_API_KEY), models: models(), version: STRICT_PROVIDER_VERSION });
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method-not-allowed' });
  if (!process.env.GEMINI_API_KEY) return send(res, 500, { ok: false, error: 'missing-gemini-api-key', candidates: [], warnings: ['provider_key_missing'] });
  const startedAt = Date.now();
  const contract = req.body?.contract || req.body || {};
  const source = safe(contract.sourceText || contract.messageDraftText || '');
  if (!source) return send(res, 400, { ok: false, error: 'missing-sourceText', candidates: [], warnings: ['missing_source_text'] });
  const attempts = [], rejectedCopy = [];
  const bodyPrompt = prompt(contract);
  for (const model of models()) {
    if (Date.now() - startedAt > WALL_TIMEOUT_MS) break;
    for (const jsonMode of [true, false]) {
      if (Date.now() - startedAt > WALL_TIMEOUT_MS) break;
      const { response, payload, timedOut } = await callGemini(model, bodyPrompt, jsonMode);
      if (!response.ok) {
        const rec = attemptRecord(model, jsonMode, response, payload, timedOut);
        attempts.push(rec);
        if (rec.warning === 'provider_quota_exhausted') {
          return send(res, 429, { ok: false, provider: 'gemini-strict', model, strict: true, noFallback: true, error: 'provider_quota_exhausted', candidates: [], warnings: ['provider_quota_exhausted', 'no-server-repair', 'no-local-fallback'], attempts, rejectedCopy: [], requestReceipt: { strict: true, noFallback: true, providerVersion: STRICT_PROVIDER_VERSION, elapsedMs: Date.now() - startedAt, retryAfterSeconds: rec.retryAfterSeconds } });
        }
        continue;
      }
      const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsed = parse(rawText);
      const usable = [];
      for (const c of parsed.candidates) {
        const risk = copyRisk(c.text, source);
        if (risk.copied) rejectedCopy.push({ model, jsonMode, risk, preview: c.text.slice(0, 160) });
        else usable.push(c);
      }
      attempts.push(attemptRecord(model, jsonMode, response, payload, timedOut, parsed, usable, parsed.candidates.length - usable.length));
      if (usable.length) return send(res, 200, { ok: true, provider: 'gemini-strict', model, deterministic: false, strict: true, version: STRICT_PROVIDER_VERSION, candidates: usable, warnings: parsed.warnings, attempts, rejectedCopy: rejectedCopy.slice(0, 8), rawText: parsed.rawText, requestReceipt: { strict: true, noFallback: true, providerVersion: STRICT_PROVIDER_VERSION, minLengthRatio: minLengthRatioFor(contract), packetTier: safe(contract.packetTier || ''), maskEvidenceState: safe(contract.maskEvidenceState || ''), authorshipKernelVersion: 'pr134-authorship-kernel/v1', elapsedMs: Date.now() - startedAt } });
    }
  }
  const lastWarning = attempts.at(-1)?.warning || 'strict-api-no-usable-candidates';
  return send(res, 504, { ok: false, provider: 'gemini-strict', model: 'none', strict: true, noFallback: true, error: lastWarning === 'provider_timeout' ? 'provider_timeout' : 'no-usable-api-candidates', candidates: [], warnings: [lastWarning, 'strict-api-no-usable-candidates', 'no-server-repair', 'no-local-fallback'], attempts, rejectedCopy: rejectedCopy.slice(0, 8), requestReceipt: { strict: true, noFallback: true, providerVersion: STRICT_PROVIDER_VERSION, minLengthRatio: minLengthRatioFor(contract), packetTier: safe(contract.packetTier || ''), maskEvidenceState: safe(contract.maskEvidenceState || ''), authorshipKernelVersion: 'pr134-authorship-kernel/v1', elapsedMs: Date.now() - startedAt } });
}