const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400'
};

const VERSION = 'hush-generate-v3.21.3-label-opaque-custody-sets';
const ROTATION_VERSION = 'pr187.3-label-opaque-custody-sets/v1';
const DEFAULT_MODEL_ORDER = ['gemini-flash-lite-latest', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'];
const GEMINI_TIMEOUT_MS = 8800;
const WALL_TIMEOUT_MS = 24500;
const MAX_OUTPUT_TOKENS = 8192;
let preferredWorkingModel = null;

const STOP = new Set('the a an and or but if is are was were be been being do does did how what why when where who whom with without into from that this those these much really very just like of in on to for before after you your yours i me my mine we our ours it its they them their there here some so sorry sounds sound going through have has had basically maybe came come from can could would should will as at by each every all under over out up down again only still simply during onto not'.split(' '));
const ROUTE_LABEL_PATTERN = /\b(?:practical-pressure|validation-mechanism|release-risk|uncertainty-observation|seed-state|residual-context|functional custody|macro_start|source-path captivity|delimiter transcription)\b/i;
const SET_NAMES = ['Set A', 'Set B', 'Set C', 'Set D', 'Set E', 'Set F'];
const SET_TO_MACRO = { a: 'practical-pressure', b: 'mechanism', c: 'risk', d: 'uncertainty', e: 'release-dilemma', f: 'release-dilemma' };

function send(res, status, payload) {
  for (const [key, value] of Object.entries(corsHeaders)) res.setHeader(key, value);
  return res.status(status).json(payload);
}
function safe(value = '') { return String(value ?? '').trim(); }
function arr(value) { return Array.isArray(value) ? value : []; }
function words(value = '') { return safe(value).toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) || []; }
function tokens(value = '') { return safe(value).match(/[A-Za-z0-9][A-Za-z0-9'’:_/.@#-]*/g) || []; }
function stringArray(value) { return Array.isArray(value) ? value.map(safe).filter(Boolean) : []; }
function normModel(value = '') { return safe(value).replace(/^models\//, ''); }
function uniqText(values = []) { return [...new Set(values.map(safe).filter(Boolean))]; }
function uniqModels(values = []) { return [...new Set(values.map(normModel).filter(Boolean))]; }
function candidateText(candidate = {}) { return typeof candidate === 'string' ? candidate : safe(candidate?.text || candidate?.output || candidate?.candidate || candidate?.rewrite || ''); }
function configuredModels() {
  const env = uniqModels([...safe(process.env.GEMINI_MODEL).split(','), ...safe(process.env.GEMINI_MODEL_FALLBACKS).split(',')]);
  return uniqModels([...DEFAULT_MODEL_ORDER, ...env]).sort((a, b) => {
    const ai = DEFAULT_MODEL_ORDER.indexOf(a);
    const bi = DEFAULT_MODEL_ORDER.indexOf(b);
    return (ai < 0 ? 50 : ai) - (bi < 0 ? 50 : bi);
  }).slice(0, 4);
}
function strictRetry(contract = {}) { return contract.strictReviewMapRetry === true || /review-map/i.test(safe(contract.strictReviewMapRetryReason || '')); }
function surfaceText(contract = {}) {
  const style = contract.flightPacket?.mask_style_vector || {};
  const policy = contract.flightPacket?.style_diversity_policy || style.style_diversity || {};
  const route = safe(contract.flightPacket?.ontology_route?.routeType || contract.flightPacket?.ontology_route?.route_type || contract.flightPacket?.remote_route_payload?.routeType || contract.ontologyRoute?.routeType || '');
  const tier = safe(contract.packetTier || contract.flightPacket?.packetTier || contract.flightPacket?.packet_tier || '');
  return [tier, route, style.mask_id, style.display_name, style.register, style.intended_use, style.rhythm_target, style.formality_target, style.chat_speak_profile, policy.id, policy.label, policy.surface, policy.architecture, policy.grammar, policy.chat_speak_profile, ...arr(policy.lexicon), ...arr(policy.transitions), ...arr(style.diction_hints), ...arr(style.transition_bank), ...arr(style.desired_moves)].join(' ').toLowerCase();
}
function complexity(sourceText = '', contract = {}) {
  const wordCount = words(sourceText).length;
  const packetTier = safe(contract.packetTier || contract.flightPacket?.packetTier || contract.flightPacket?.packet_tier || '');
  const maskEvidenceState = safe(contract.maskEvidenceState || contract.flightPacket?.maskEvidenceState || '');
  const candidateCount = Number(contract.candidateCount || contract.flightPacket?.flight_controls?.candidate_count || 0);
  const surface = surfaceText(contract);
  const sourceCasual = /\b(im|rn|idk|lol|gotta|yall|bc|tbh|pls|ok|kinda|sorta|like)\b/i.test(sourceText) || /\n\n/.test(sourceText);
  const maskCasual = /casual-register|group-chat|small circle|group-thread|thread|chat|yall|rn|idk|tbh|low-drama|posting|small-circle/.test(surface);
  const deSourceMask = /fracture|fractured|mina|gitch|pixie|glitch|slash|orbit|lulu|posting|miles|group-chat|small circle|threaded|keisha/.test(surface);
  const lowSignature = /low_signature/i.test(packetTier);
  const lowSignatureCadence = lowSignature && maskCasual;
  const sourceRegisterOverlap = Boolean(sourceCasual && (maskCasual || deSourceMask));
  const firstPassDeSource = Boolean(sourceRegisterOverlap || lowSignatureCadence || (deSourceMask && wordCount >= 90));
  const registerTransform = /register_transform/i.test(packetTier);
  const chatCadence = /chat_cadence/i.test(packetTier) || lowSignatureCadence || sourceRegisterOverlap || firstPassDeSource;
  const hard = wordCount > 220 || candidateCount >= 4 || chatCadence || /theory|long/i.test(packetTier) || (!registerTransform && !chatCadence && /rich/i.test(maskEvidenceState));
  const medium = wordCount > 90 || candidateCount >= 3 || registerTransform || chatCadence;
  return { wordCount, packetTier, maskEvidenceState, candidateCount, hard, medium, registerTransform, chatCadence, lowSignatureCadence, sourceRegisterOverlap, firstPassDeSource, strictReviewMapRetry: strictRetry(contract) };
}
function minRatio(sourceText = '', cx = {}) {
  const count = words(sourceText).length;
  if (cx.lowSignatureCadence && cx.firstPassDeSource) return count < 140 ? 0.56 : count < 260 ? 0.52 : 0.50;
  if (cx.registerTransform || cx.chatCadence) return count < 70 ? 0.72 : count < 140 ? 0.66 : count < 260 ? 0.60 : 0.58;
  if (cx.strictReviewMapRetry) return count < 180 ? 0.54 : 0.58;
  if (cx.hard && !cx.strictReviewMapRetry) return 0.56;
  return count < 80 ? 0.46 : count < 220 ? 0.50 : 0.54;
}
function protectedLits(sourceText = '') { return tokens(sourceText).filter((token) => /[A-Z][a-z]|\d|[-_:/.@#]/.test(token)).slice(0, 28); }
function termBank(sourceText = '', limit = 20) {
  return uniqText(tokens(sourceText).filter((token) => {
    const lower = token.toLowerCase().replace(/[’']/g, '');
    return lower.length > 2 && !STOP.has(lower);
  })).sort((a, b) => b.length - a.length || a.localeCompare(b)).slice(0, limit);
}
function lexicalElasticityLevel(contract = {}, cx = {}) {
  const surface = surfaceText(contract);
  if (/source-register|preserve|custody|opacity/.test(surface)) return 'low';
  if (/coordinating|rooted|formal|grounded|structured/.test(surface)) return 'medium';
  if (/posting|chat|slang|contrast|goth|fracture|cadence|persona|group-thread|small circle/.test(surface)) return 'high';
  if (cx.chatCadence || cx.sourceRegisterOverlap || cx.firstPassDeSource) return 'high';
  if (cx.registerTransform) return 'medium';
  return 'medium';
}
function propList(contract = {}) {
  return arr(contract.flightPacket?.source_manifest?.proposition_summary?.propositions).length
    ? arr(contract.flightPacket.source_manifest.proposition_summary.propositions)
    : arr(contract.flightPacket?.ontology_route?.propositionMap?.propositions);
}
function sourceUnits(sourceText = '', cx = {}) {
  const lines = safe(sourceText).split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const sentences = safe(sourceText).match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((line) => line.trim()).filter(Boolean) || [];
  const units = lines.length > 1 ? lines : sentences;
  return units.slice(0, cx.registerTransform || cx.chatCadence ? 10 : cx.hard ? 24 : 18);
}
function groupKey(text = '', terms = []) {
  const field = `${text} ${terms.join(' ')}`.toLowerCase();
  if (/money|legal|safet|piss off|right people|wrong time|comms|encrypted|skills|provisioned|safe harbor/.test(field)) return 'practical-pressure';
  if (/constant|math|validat|zero-up|pua|unicode|persona|confidence|build spec|self-validating|system|geometry/.test(field)) return 'validation-mechanism';
  if (/botnet|haywire|irresponsib|release|share|give everyone|unsafe|danger|risk/.test(field)) return 'release-risk';
  if (/observed|paranoia|idk|what to do|extra observed/.test(field)) return 'uncertainty-observation';
  if (/seed|formulate|better|have the seed|unfold/.test(field)) return 'seed-state';
  return 'residual-context';
}
function functionalMap(contract = {}, sourceText = '', cx = {}) {
  const props = propList(contract);
  const buckets = new Map([
    ['practical-pressure', []],
    ['validation-mechanism', []],
    ['release-risk', []],
    ['uncertainty-observation', []],
    ['seed-state', []],
    ['residual-context', []]
  ]);
  const add = (key, terms, flags = '') => {
    const clean = uniqText(terms.map(safe)).filter(Boolean).slice(0, 18);
    if (clean.length) buckets.get(key)?.push(`${clean.join(' / ')}${flags ? ` [${flags}]` : ''}`);
  };
  if (props.length) {
    props.slice(0, 16).forEach((p) => {
      const terms = arr(p.coreTerms).length ? arr(p.coreTerms) : termBank(safe(p.text || ''), 12);
      const flags = [p.hasNegation ? 'negation' : '', p.hasUncertainty ? 'uncertainty' : '', p.mustRemainQuestion ? 'question' : ''].filter(Boolean).join(', ');
      add(groupKey(safe(p.text || ''), terms), terms, flags);
    });
  } else {
    sourceUnits(sourceText, cx).slice(0, 16).forEach((unit) => add(groupKey(unit), termBank(unit, 12), /\?/.test(unit) ? 'question' : ''));
  }
  if (/constants|zero-up-my-sleeve|PuA|unicode|build specs|math|self validating|self-validating/i.test(sourceText)) {
    buckets.get('validation-mechanism').unshift('required mechanism: constants/design constraints / math validation / self-validating system / build specs / three-way zero-up-my-sleeve key / persona-state confidence / PuA Unicode tables');
  }
  return [...buckets.entries()].map(([, values], index) => `${SET_NAMES[index]}: ${uniqText(values).slice(0, 3).join(' || ') || '(no required item)'}`);
}
function macroCat(text = '') {
  const first = words(text).slice(0, 55).join(' ');
  if (/botnet|haywire|irresponsib|release|share|give/.test(first)) return 'risk';
  if (/constant|math|validat|zero up|pua|unicode|self validating|build spec|geometry/.test(first)) return 'mechanism';
  if (/safe harbor|encrypted|comms|money|legal|people|skills|provisioned/.test(first)) return 'practical-pressure';
  if (/idk|observed|paranoia|what to do|watched/.test(first)) return 'uncertainty';
  return 'release-dilemma';
}
function macroMismatch(candidate = {}) {
  const declared = safe(candidate.macro_start).toLowerCase();
  if (!declared) return { mismatch: false, declared: '', detected: macroCat(candidate.text || '') };
  const detected = macroCat(candidate.text || '');
  let normalized = declared.includes('risk') ? 'risk' : declared.includes('mechanism') ? 'mechanism' : declared.includes('practical') ? 'practical-pressure' : declared.includes('uncertainty') ? 'uncertainty' : declared.includes('release') ? 'release-dilemma' : declared;
  if (/^[a-f]$/.test(normalized)) normalized = SET_TO_MACRO[normalized] || normalized;
  return { mismatch: normalized !== detected, declared: normalized, detected };
}
function labelLeak(text = '') {
  const match = safe(text).match(ROUTE_LABEL_PATTERN);
  return { leaked: Boolean(match), matched: match?.[0] || '' };
}
function longestRunCalc(candidateWords = [], sourceWords = []) {
  const positions = new Map();
  sourceWords.forEach((word, index) => { if (!positions.has(word)) positions.set(word, []); positions.get(word).push(index); });
  let best = 0;
  for (let i = 0; i < candidateWords.length; i += 1) {
    for (const start of positions.get(candidateWords[i]) || []) {
      let run = 0;
      while (candidateWords[i + run] && sourceWords[start + run] && candidateWords[i + run] === sourceWords[start + run]) run += 1;
      if (run > best) best = run;
    }
  }
  return best;
}
function copyRisk(text = '', sourceText = '', cx = {}) {
  const candidateWords = words(text);
  const sourceWords = words(sourceText);
  if (!candidateWords.length || !sourceWords.length) return { copied: false, longestRun: 0, overlap: 0, lengthRatio: 1 };
  const candidateNorm = candidateWords.join(' ');
  const sourceNorm = sourceWords.join(' ');
  const candidateSet = new Set(candidateWords.filter((word) => word.length > 2));
  const sourceSet = new Set(sourceWords.filter((word) => word.length > 2));
  let hits = 0;
  for (const word of candidateSet) if (sourceSet.has(word)) hits += 1;
  const overlap = hits / Math.max(1, Math.max(candidateSet.size, sourceSet.size));
  const longestRun = longestRunCalc(candidateWords, sourceWords);
  const lengthRatio = candidateWords.length / Math.max(1, sourceWords.length);
  const registerLike = Boolean(cx.registerTransform || cx.chatCadence);
  const longRunFloor = registerLike ? Math.max(36, Math.floor(sourceWords.length * 0.18)) : Math.min(9, Math.max(6, Math.floor(sourceWords.length * 0.55)));
  const nearRunFloor = registerLike ? Math.max(48, Math.floor(sourceWords.length * 0.22)) : Math.min(8, Math.max(5, Math.floor(sourceWords.length * 0.4)));
  const copied = candidateNorm === sourceNorm || candidateNorm.includes(sourceNorm) || longestRun >= longRunFloor || (registerLike ? overlap >= 0.82 && lengthRatio >= 0.72 && lengthRatio <= 1.35 && longestRun >= nearRunFloor : overlap >= 0.9 && lengthRatio >= 0.82 && lengthRatio <= 1.35 && longestRun >= nearRunFloor);
  return { copied, longestRun, overlap: Number(overlap.toFixed(4)), lengthRatio: Number(lengthRatio.toFixed(4)), longRunFloor, nearRunFloor };
}
function sourcePathCaptivity(text = '', sourceText = '', contract = {}, cx = {}) {
  if (!(cx.sourceRegisterOverlap || cx.lowSignatureCadence || cx.firstPassDeSource)) return { captive: false, presentCount: 0, orderedCount: 0, sequenceRatio: 0, beginsWithSourceOpening: false };
  const candidateWords = words(text);
  const opening = words(sourceText).slice(0, 16).filter((word) => word.length > 2 && !STOP.has(word));
  const firstWindow = new Set(candidateWords.slice(0, 36));
  const beginsWithSourceOpening = opening.length > 0 && opening.filter((word) => firstWindow.has(word)).length >= Math.min(4, Math.ceil(opening.length * 0.45));
  const props = propList(contract).slice(0, 12);
  const groups = props.length ? props.map((p) => arr(p.coreTerms).map((term) => safe(term).toLowerCase()).filter((term) => term.length > 2 && !STOP.has(term)).slice(0, 12)) : sourceUnits(sourceText, cx).slice(0, 12).map((unit) => termBank(unit, 10).map((term) => term.toLowerCase()));
  const positions = [];
  for (const group of groups) {
    let bestIndex = -1;
    let hits = 0;
    for (let i = 0; i < candidateWords.length; i += 1) {
      if (group.includes(candidateWords[i])) { if (bestIndex < 0) bestIndex = i; hits += 1; }
    }
    if (hits >= Math.min(2, Math.max(1, Math.ceil(group.length * 0.25)))) positions.push(bestIndex);
  }
  let orderedCount = 0;
  let last = -1;
  for (const pos of positions) if (pos >= 0 && pos > last) { orderedCount += 1; last = pos; }
  const presentCount = positions.length;
  const sequenceRatio = presentCount ? orderedCount / presentCount : 0;
  const coverageRatio = groups.length ? presentCount / groups.length : 0;
  return { captive: Boolean((beginsWithSourceOpening && orderedCount >= 4) || (presentCount >= 5 && sequenceRatio >= 0.7 && coverageRatio >= 0.55)), presentCount, orderedCount, sequenceRatio: Number(sequenceRatio.toFixed(4)), coverageRatio: Number(coverageRatio.toFixed(4)), beginsWithSourceOpening };
}
function delimiterTranscription(text = '', sourceText = '', contract = {}, cx = {}) {
  const slashCount = (safe(text).match(/\//g) || []).length;
  const wordCount = Math.max(1, words(text).length);
  const fragments = safe(text).split('/').map((part) => part.trim()).filter(Boolean);
  const shortFragmentRatio = fragments.length ? fragments.filter((part) => words(part).length <= 7).length / fragments.length : 0;
  const path = sourcePathCaptivity(text, sourceText, contract, cx);
  return { transcription: Boolean(slashCount >= 8 && (shortFragmentRatio >= 0.55 || path.captive)), slashCount, slashDensity: Number((slashCount / wordCount).toFixed(4)), shortFragmentRatio: Number(shortFragmentRatio.toFixed(4)), path };
}
function techPresent(text = '', sourceText = '') {
  if (!/constants|zero-up-my-sleeve|PuA|unicode|build specs|math|self validating|self-validating/i.test(sourceText)) return true;
  return [/constant/i.test(text), /math|validat/i.test(text), /zero-up-my-sleeve|three-way|three way/i.test(text), /PuA|unicode/i.test(text), /build spec|provision/i.test(text), /persona|confidence|state/i.test(text)].filter(Boolean).length >= 3;
}
function termShard(text = '', sourceText = '') {
  const segments = safe(text).split(/[.!?]+/).map((part) => part.trim()).filter(Boolean);
  const shortSegments = segments.filter((part) => words(part).length > 0 && words(part).length <= 4).length;
  const anchor = /\b(?:[A-Z][A-Za-z0-9-]*|PuA|Unicode|Botnets|Math|Like|But|It)(?:,\s*|\.\s*){1,}(?:[A-Z][A-Za-z0-9-]*|PuA|Unicode|Botnets|Math|Like|But|It)/.test(text);
  const sourceTerms = new Set([...termBank(sourceText, 28), ...protectedLits(sourceText).map((token) => token.toLowerCase())]);
  const hits = safe(text).split(/[,.]/).map((part) => safe(part).toLowerCase()).filter((part) => sourceTerms.has(part)).length;
  return { corrupted: Boolean((shortSegments >= 4 && anchor) || hits >= 5), shortSegments, anchorShard: anchor, shardHits: hits };
}
function maskReject(text = '', sourceText = '', contract = {}, cx = {}) {
  const surface = surfaceText(contract);
  if (/orbit|lulu/.test(surface) && /\b(comet|swarm|uninvited|ghost|seatbelt|paperwork comet|quintet|spaceship|planet)\b/i.test(text)) return { rejected: true, reason: 'decorative-prop-drift' };
  if (/posting|miles/.test(surface) && !techPresent(text, sourceText)) return { rejected: true, reason: 'technical-mechanism-thinned' };
  if (/steady|mabel/.test(surface)) {
    const sentences = safe(text).split(/[.!?]+/).map((part) => part.trim()).filter(Boolean);
    const average = words(text).length / Math.max(1, sentences.length);
    const path = sourcePathCaptivity(text, sourceText, contract, cx);
    if (sentences.length >= 10 && average <= 9 && path.captive) return { rejected: true, reason: 'sentence-splitting-summary' };
  }
  if (/rooted|simone|aave|target register/.test(surface) && /\b(currently developing|private sanctuary interface|possessing expertise|simultaneously balancing|profit motives|legal protections)\b/i.test(text)) return { rejected: true, reason: 'institutional-standardization' };
  if (/needling|rochelle/.test(surface) && termShard(text, sourceText).corrupted) return { rejected: true, reason: 'term-shard-corruption' };
  return { rejected: false, reason: '' };
}
function compressionRisk(text = '', sourceText = '', cx = {}) {
  const candidateWords = words(text).length;
  const sourceWords = Math.max(1, words(sourceText).length);
  const lengthRatio = candidateWords / sourceWords;
  const floor = minRatio(sourceText, cx);
  return { compressed: sourceWords >= 42 && lengthRatio < floor, candidateWords, sourceWords, lengthRatio: Number(lengthRatio.toFixed(4)), floor };
}
function splitCandidates(candidates = [], sourceText = '', cx = {}, contract = {}) {
  const usable = [], copied = [], compressed = [];
  candidates.forEach((candidate, index) => {
    const text = candidate.text || '';
    const leak = labelLeak(text);
    const risk = copyRisk(text, sourceText, cx);
    const delimiter = delimiterTranscription(text, sourceText, contract, cx);
    const path = sourcePathCaptivity(text, sourceText, contract, cx);
    const macro = macroMismatch(candidate);
    const shard = termShard(text, sourceText);
    const mask = maskReject(text, sourceText, contract, cx);
    const compression = compressionRisk(text, sourceText, cx);
    if (leak.leaked) copied.push({ index, risk: { copied: true, routeLabelLeak: true, matched: leak.matched }, preview: safe(text).slice(0, 180) });
    else if (risk.copied) copied.push({ index, risk, preview: safe(text).slice(0, 180) });
    else if (delimiter.transcription) copied.push({ index, risk: { copied: true, delimiterTranscription: true, ...delimiter }, preview: safe(text).slice(0, 180) });
    else if (path.captive) copied.push({ index, risk: { copied: true, sourcePathCaptivity: true, ...path }, preview: safe(text).slice(0, 180) });
    else if (macro.mismatch) copied.push({ index, risk: { copied: true, macroStartMismatch: true, ...macro }, preview: safe(text).slice(0, 180) });
    else if (shard.corrupted) copied.push({ index, risk: { copied: true, termShard: true, ...shard }, preview: safe(text).slice(0, 180) });
    else if (mask.rejected) copied.push({ index, risk: { copied: true, maskSpecific: true, reason: mask.reason }, preview: safe(text).slice(0, 180) });
    else if (compression.compressed) compressed.push({ index, risk: compression, preview: safe(text).slice(0, 180) });
    else usable.push(candidate);
  });
  return { usable, copied, compressed };
}
function compactFlightPacket(packet = {}) {
  const style = packet.mask_style_vector || {};
  const policy = packet.style_diversity_policy || style.style_diversity || {};
  return { style_diversity_policy: policy, mask_style_vector: style, flight_controls: packet.flight_controls || {}, packet_version: packet.packet_version || '', ontology_route: packet.ontology_route || {}, protective_style_policy: packet.protective_style_policy || {} };
}
function opList(contract = {}, controls = {}) {
  return Array.isArray(contract.operationTaxonomy) && contract.operationTaxonomy.length ? contract.operationTaxonomy.slice(0, 6) : controls.preferred_operations?.slice?.(0, 6) || controls.required_operations?.slice?.(0, 6) || ['cadence_alias', 'syntax_inversion', 'register_lowering', 'friction_insert', 'witness_plainness', 'heat_calibration'];
}
function maskFailureLaw(contract = {}) {
  const surface = surfaceText(contract);
  if (/needling|rochelle/.test(surface)) return 'MASK FAILURE LAW: Do not use generic snark or term fragments.';
  if (/rooted|simone|aave|target register/.test(surface)) return 'MASK FAILURE LAW: Do not sanitize into institutional standard prose.';
  if (/gitch|pixie|glitch/.test(surface)) return 'MASK FAILURE LAW: Glitch syntax, not meaning. No chopped transcription.';
  if (/fracture|fractured|mina/.test(surface)) return 'MASK FAILURE LAW: Fracture is not slash transcription. Break the route, not the custody chain.';
  if (/steady|mabel/.test(surface)) return 'MASK FAILURE LAW: Steady does not mean line-by-line simplification.';
  if (/orbit|lulu/.test(surface)) return 'MASK FAILURE LAW: Metaphor may orbit but cannot invent props.';
  if (/posting|miles/.test(surface)) return 'MASK FAILURE LAW: Keep the technical validation chain visible.';
  if (/group-chat|threaded|keisha|small circle/.test(surface)) return 'MASK FAILURE LAW: Do not keep the same casual wording with a wrapper.';
  return 'MASK FAILURE LAW: Transform the argument route, not merely vocabulary or tone.';
}
function buildPrompt(contract = {}, repair = null) {
  const sourceText = safe(contract.sourceText || contract.messageDraftText || '').slice(0, 5000);
  const cx = complexity(sourceText, contract);
  const packet = contract.flightPacket || null;
  const compact = packet ? compactFlightPacket(packet) : { mask_style_vector: {}, style_diversity_policy: {}, mask: contract.mask || {} };
  const style = compact.mask_style_vector || {};
  const stylePolicy = compact.style_diversity_policy || {};
  const operations = opList(contract, packet?.flight_controls || {});
  const candidateCount = cx.registerTransform || cx.chatCadence ? 3 : cx.strictReviewMapRetry ? 3 : cx.hard ? 2 : cx.medium ? 3 : 4;
  const anchors = termBank(sourceText, cx.registerTransform || cx.chatCadence ? 18 : 14);
  const literals = protectedLits(sourceText);
  const groups = functionalMap(contract, sourceText, cx);
  const minWords = Math.max(24, Math.floor(words(sourceText).length * minRatio(sourceText, cx)));
  const elasticity = lexicalElasticityLevel(contract, cx);
  const retryBan = cx.strictReviewMapRetry ? '\n\nSTRICT RETRY: Return only transformed candidate text. No review maps, ledgers, P rows, architecture summaries, diagnostic notes, or analysis.' : '';
  const repairBlock = repair ? `\nREPAIR: Previous output failed ${repair.kind}. Correct only that failure. ${repair.rejected || ''}` : '';
  const deSource = (repair?.kind === 'copy' && (cx.sourceRegisterOverlap || cx.lowSignatureCadence || cx.firstPassDeSource)) ? 'repair' : cx.firstPassDeSource ? 'first-pass' : '';
  const lane = cx.registerTransform ? 'REGISTER TRANSFORM' : cx.chatCadence ? 'CHAT CADENCE' : 'GENERAL';
  const styleOperation = cx.registerTransform ? 'register_transform' : 'cadence_alias';
  const lexicon = [...arr(stylePolicy.lexicon), ...arr(stylePolicy.transitions), ...arr(style.diction_hints), ...arr(style.transition_bank)].filter(Boolean).slice(0, 22);
  const avoid = arr(style.avoid_list).filter(Boolean).slice(0, 14);
  const custody = `SOURCE OBLIGATION SETS — NOT SOURCE ORDER:\n${groups.map((group) => `- ${group}`).join('\n') || '- none'}\nSEMIOTIC ANCHORS: ${anchors.join(', ') || '(none)'}\nPROTECTED LITERALS: ${literals.join(', ') || '(none)'}`;
  const sourceBlock = deSource ? `${deSource === 'repair' ? 'DE-SOURCED COPY REPAIR MODE' : 'FIRST-PASS DE-SOURCE MODE'}:\nThe raw source text is withheld. Rebuild from these source obligation sets only. The sets are grouped by function, not sequence. Do not recreate the original opening, order, or phrasing.\n${custody}` : `${custody}\n\nMESSAGE TO TRANSFORM:\n${sourceText}`;
  return `Return JSON only. Schema: {"candidates":[{"text":"string","macro_start":"A | B | C | D | E","style_note":"string","style_operation":"${styleOperation}","preserved_propositions":[],"dropped_propositions":[],"changed_questions":[],"new_claims":[],"authorship_moves":["concrete cadence/semantic move, not a placeholder"],"risk_flags":[],"mask_surface_notes":{"rhythm":"string","diction":"string","structure":"string","coverage":"string"}}]}

${lane} LANE. Generate exactly ${candidateCount} transformed candidates in the selected surface. Candidate text must read like the transformed message itself, not analysis.

INTERPRETIVE DENSITY LAW: Do not summarize or strip the source to a safe thesis. Preserve hinge logic, causal architecture, contradiction, strange phrases, and authorial posture.
LEXICAL ELASTICITY LAW: Preserve protected literals exactly; preserve semantic anchors by function; change non-protected diction through mask-appropriate syntax and vocabulary.
WORD CUSTODY: protected literals stay exact; semiotic anchors stay functionally intact; elastic diction moves toward the selected mask. LEXICAL ELASTICITY LEVEL: ${elasticity}.
${(cx.sourceRegisterOverlap || cx.lowSignatureCadence || cx.firstPassDeSource) ? 'NO STYLE COSTUME LAW: The source already contains casual or low-signature diction. Recompose from source obligation sets. Do not use the sets as sequence.' : ''}
${(cx.sourceRegisterOverlap || cx.lowSignatureCadence || cx.firstPassDeSource) ? 'MACRO-ORDER REQUIREMENTS: Candidate 1 declares macro_start A and begins from real-world constraints. Candidate 2 declares macro_start B and begins from the actual validation mechanism. Candidate 3 declares macro_start C and begins from the actual release danger. If a fourth candidate exists, declare macro_start D and begin from uncertainty/observation pressure.' : ''}
${maskFailureLaw(contract)}

SET LABELS ARE METADATA ONLY: Never put Set A, Set B, Set C, Set D, Set E, practical-pressure, validation-mechanism, release-risk, uncertainty-observation, seed-state, residual-context, functional custody, macro_start, source-path captivity, or delimiter transcription in candidate text. Start with the actual content, never the map label.
ORDERED MAP FORBIDDEN: The sets are a bag of obligations, not an outline. Choose a new route and declare it in macro_start.
SOURCE-PATH CAPTIVITY GATE: A candidate fails if it follows the same semantic group sequence as the source.
DELIMITER TRANSCRIPTION GATE: Slashes/fragments/glitches must transform relation and pressure; no source-line transcription.
TECHNICAL MECHANISM GATE: Preserve constants/math validation/self-validating system/build specs/zero-up-my-sleeve/PuA/Unicode/persona-state confidence as mechanism. Do not thin it into "the constants line up" or "this matters."
Do not preserve source sentence order, opener, or closer. Do not make a line-by-line paraphrase. Each candidate needs a distinct opening and route. Keep meaning, negations, uncertainty, causal links, protected literals, claims, hinge logic, and stakes. Do not answer questions. Do not add facts.${retryBan}${repairBlock}
Each candidate must be at least ${minWords} words unless the source is shorter. Surface: ${stylePolicy.surface || ''}; rhythm=${style.rhythm_target || stylePolicy.architecture || ''}; formality=${style.formality_target || ''}; punctuation=${stylePolicy.punctuation || ''}; grammar=${stylePolicy.grammar || ''}; chat=${stylePolicy.chat_speak_profile || stylePolicy.chat || ''}; typo=${stylePolicy.typo_policy || ''}; diction hints=${lexicon.join(', ') || '(none)'}; avoid=${avoid.join(', ') || '(none)'}.
For macro_start, use only A, B, C, D, or E. For authorship_moves, name actual moves such as "rebuilt from source obligation sets," "recomposed away from source sequence," or "kept the technical mechanism visible while changing the route."
OPERATIONS: ${operations.join(', ')}
${sourceBlock}`;
}
function geminiTimeout(model) { return { response: { ok: false, status: 408 }, payload: { error: { message: 'Gemini call timed out under local Promise.race watchdog', status: 'AbortError', model: normModel(model), timeoutMs: GEMINI_TIMEOUT_MS } }, timedOut: true }; }
async function callGemini({ model, prompt, jsonMode = true, deterministic = true }) {
  const controller = new AbortController();
  let timer = null;
  const generationConfig = jsonMode ? { temperature: deterministic ? 0.22 : 0.58, topP: deterministic ? 0.64 : 0.88, responseMimeType: 'application/json', maxOutputTokens: MAX_OUTPUT_TOKENS } : { temperature: deterministic ? 0.22 : 0.58, topP: deterministic ? 0.64 : 0.88, maxOutputTokens: MAX_OUTPUT_TOKENS };
  const request = fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(normModel(model))}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig }), signal: controller.signal })
    .then(async (response) => ({ response, payload: await response.json().catch(() => ({})), timedOut: false }))
    .catch((error) => error?.name === 'AbortError' ? geminiTimeout(model) : { response: { ok: false, status: 599 }, payload: { error: { message: safe(error?.message || error), status: error?.name || 'FETCH_ERROR' } }, timedOut: false });
  const timeout = new Promise((resolve) => { timer = setTimeout(() => { try { controller.abort(); } catch {} resolve(geminiTimeout(model)); }, GEMINI_TIMEOUT_MS); });
  try { return await Promise.race([request, timeout]); } finally { if (timer) clearTimeout(timer); }
}
function providerText(payload = {}) { return payload?.candidates?.[0]?.content?.parts?.[0]?.text || ''; }
function summarizeProviderError(payload = {}) { const error = payload.error || payload; return { code: error.code || payload.code || '', status: error.status || payload.status || '', message: safe(error.message || payload.message || '').slice(0, 900) }; }
function normalizeCandidates(value) {
  let source = [];
  if (Array.isArray(value)) {
    source = value.flatMap((item) => Array.isArray(item?.candidates) ? item.candidates : [item]);
  } else if (Array.isArray(value?.candidates)) {
    source = value.candidates;
  } else if (candidateText(value)) {
    source = [value];
  }
  return source.map((candidate, index) => {
    const text = candidateText(candidate);
    return text ? {
      text,
      macro_start: safe(candidate.macro_start || candidate.macroStart || ''),
      style_note: safe(candidate.style_note || candidate.styleNote || `provider-candidate-${index + 1}`),
      style_operation: safe(candidate.style_operation || candidate.styleOperation || candidate.operation || 'cadence_alias'),
      preserved_propositions: stringArray(candidate.preserved_propositions || candidate.preservedPropositions),
      dropped_propositions: stringArray(candidate.dropped_propositions || candidate.droppedPropositions),
      changed_questions: stringArray(candidate.changed_questions || candidate.changedQuestions),
      new_claims: stringArray(candidate.new_claims || candidate.newClaims),
      authorship_moves: stringArray(candidate.authorship_moves || candidate.authorshipMoves).length ? stringArray(candidate.authorship_moves || candidate.authorshipMoves) : ['rebuilt from source obligation sets', 'recomposed away from source sequence'],
      mask_surface_notes: candidate.mask_surface_notes && typeof candidate.mask_surface_notes === 'object' ? candidate.mask_surface_notes : {},
      risk_flags: stringArray(candidate.risk_flags || candidate.riskFlags)
    } : null;
  }).filter(Boolean).slice(0, 8);
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
      return { candidates, warnings: [...stringArray(parsed.warnings), ...(candidates.length ? [] : ['provider-json-contained-no-usable-candidates'])], rawText: cleaned.slice(0, 700) };
    } catch {}
  }
  if (cleaned.length > 20) return { candidates: normalizeCandidates([{ text: cleaned, style_note: 'Recovered raw provider text after invalid JSON.', style_operation: 'cadence_alias', authorship_moves: ['recovered raw provider text'], risk_flags: ['provider-returned-invalid-json-recovered-raw-candidate'] }]), warnings: ['provider-returned-invalid-json', 'provider-invalid-json-recovered-as-raw-candidate'], rawText: cleaned.slice(0, 700) };
  return { candidates: [], warnings: ['provider-returned-invalid-json'], rawText: cleaned.slice(0, 700) };
}
async function runProviderProbe(models = []) {
  const attempts = [];
  for (const model of models.slice(0, 3)) {
    const { response, payload, timedOut } = await callGemini({ model, prompt: 'Return JSON only: {"candidates":[{"text":"probe ok","style_note":"probe"}]}', jsonMode: true });
    attempts.push({ model: normModel(model), ok: response.ok, providerStatus: response.status, timedOut, error: response.ok ? null : summarizeProviderError(payload), textPreview: providerText(payload).slice(0, 120) });
    if (response.ok) { preferredWorkingModel = normModel(model); return { ok: true, model: preferredWorkingModel, attempts }; }
  }
  return { ok: false, attempts };
}
function queryFlags(req) { try { const url = new URL(req.url || '', 'https://td613.local'); return { models: url.searchParams.has('models') || url.searchParams.has('listModels') }; } catch { return { models: false }; } }
function serverRepairCandidates(sourceText = '') {
  return { candidates: [{ text: `Reviewed repair surface. Source obligations retained, but no remote candidate passed strict transform gates. Key terms: ${termBank(sourceText, 18).join(' / ')}.`, style_note: 'server deterministic proposition review map', style_operation: 'witness_plainness', preserved_propositions: [], dropped_propositions: [], changed_questions: [], new_claims: [], authorship_moves: ['server repair used after remote candidates failed'], mask_surface_notes: { structure: 'review map' }, risk_flags: ['server-deterministic-review-map-used'] }], warnings: ['server-deterministic-review-map-used', 'server-repair-review-map-cleared'] };
}
function copyRejectWarnings(rejectedCopy = []) {
  const json = JSON.stringify(rejectedCopy);
  return [
    /routeLabelLeak/.test(json) ? 'route-label-leak' : '',
    /sourcePathCaptivity/.test(json) ? 'source-path-captivity' : '',
    /delimiterTranscription/.test(json) ? 'delimiter-transcription' : '',
    /macroStartMismatch/.test(json) ? 'macro-start-mismatch' : '',
    /termShard/.test(json) ? 'term-shard-corruption' : '',
    /decorative-prop-drift/.test(json) ? 'decorative-prop-drift' : '',
    /technical-mechanism-thinned/.test(json) ? 'technical-mechanism-thinned' : '',
    /sentence-splitting-summary/.test(json) ? 'sentence-splitting-summary' : '',
    /institutional-standardization/.test(json) ? 'institutional-standardization' : ''
  ].filter(Boolean);
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
  const cx = complexity(sourceText, contract);
  const sRetry = strictRetry(contract);
  const configured = configuredModels();
  const base = preferredWorkingModel ? [preferredWorkingModel, ...configured.filter((model) => model !== preferredWorkingModel)] : configured;
  const skipped = new Set(stringArray(contract.skipModels || contract.avoidModels || contract.strictReviewRetrySkipModels).map(normModel));
  const models = base.filter((model) => !skipped.has(normModel(model))).length ? base.filter((model) => !skipped.has(normModel(model))) : base;
  const attemptBudget = Number(contract.strictReviewRetryAttemptBudget || 0);
  const stageBudget = Number(contract.strictReviewRetryStageLimit || 0);
  const maxAttempts = sRetry ? Math.max(1, Math.min(attemptBudget || 3, models.length || 1)) : cx.registerTransform || cx.chatCadence ? Math.min(3, models.length || 1) : cx.hard ? 2 : 3;
  const stageLimit = sRetry ? Math.max(1, Math.min(stageBudget || 2, 2)) : cx.registerTransform || cx.chatCadence ? 2 : cx.hard ? 1 : 2;
  const attempts = [];
  const rejectedCopy = [];
  const rejectedCompressed = [];
  const deterministic = req.query?.reroll !== '1' && contract.reroll !== true;
  let repair = null;
  for (let stage = 0; stage < stageLimit; stage += 1) {
    const prompt = buildPrompt(contract, repair);
    for (const model of models.slice(0, maxAttempts)) {
      if (Date.now() - startedAt > WALL_TIMEOUT_MS) break;
      const { response, payload, timedOut } = await callGemini({ model, prompt, jsonMode: true, deterministic });
      const rawText = providerText(payload);
      const parsed = parseProviderJson(rawText);
      const split = splitCandidates(parsed.candidates, sourceText, cx, contract);
      const elasticity = lexicalElasticityLevel(contract, cx);
      rejectedCopy.push(...split.copied.map((item) => ({ ...item, model: normModel(model), stage })));
      rejectedCompressed.push(...split.compressed.map((item) => ({ ...item, model: normModel(model), stage })));
      attempts.push({ stage, model: normModel(model), jsonMode: true, ok: response.ok, status: response.status, timedOut, parsedCandidates: parsed.candidates.length, usableCandidates: split.usable.length, copiedCandidates: split.copied.length, compressedCandidates: split.compressed.length, warnings: parsed.warnings, error: response.ok ? null : summarizeProviderError(payload), textPreview: rawText.slice(0, 180), strictReviewMapRetry: sRetry, registerTransform: cx.registerTransform, chatCadence: cx.chatCadence, lowSignatureCadence: cx.lowSignatureCadence, sourceRegisterOverlap: cx.sourceRegisterOverlap, firstPassDeSource: cx.firstPassDeSource, functionalCustodyMap: true, routeLabelOpaqueSets: true, routeLabelSanitizer: true, macroStartEnforced: true, semanticElasticity: true, deSourceRecomposition: true, lexicalElasticityLevel: elasticity, skippedModels: [...skipped] });
      if (response.ok && split.usable.length) {
        preferredWorkingModel = normModel(model);
        const rejectWarnings = copyRejectWarnings(rejectedCopy);
        return send(res, 200, { ok: true, provider: 'gemini', model: preferredWorkingModel, deterministic, version: VERSION, rotationVersion: ROTATION_VERSION, candidates: split.usable, warnings: [...parsed.warnings, ...rejectWarnings, 'interpretive-density-restored', 'semantic-elasticity-applied', 'lexical-custody-split', 'de-source-recomposition-applied', 'functional-custody-map-applied', 'label-opaque-custody-sets-active', 'route-label-sanitizer-active', 'nested-candidate-array-parser-active', 'ordered-custody-map-forbidden', 'macro-start-enforcement-active', 'first-pass-desource-applied', 'source-path-captivity-gate-active', 'delimiter-transcription-gate-active', ...(cx.sourceRegisterOverlap ? ['source-register-overlap-detected', 'no-style-costume-law-applied'] : []), ...(cx.registerTransform ? ['register-transform-prompt-lane-success'] : []), ...(cx.chatCadence ? ['chat-cadence-prompt-lane-success'] : []), ...(cx.lowSignatureCadence ? ['low-signature-cadence-lane-success'] : []), ...(sRetry ? ['strict-review-map-transform-lane-success'] : []), ...(skipped.size ? ['strict-review-skip-models-applied'] : [])], attempts, rejectedCopy: rejectedCopy.slice(0, 12), rejectedCompressed: rejectedCompressed.slice(0, 12), rawText: parsed.rawText, requestReceipt: { deterministic, temperature: deterministic ? 0.22 : 0.58, topP: deterministic ? 0.64 : 0.88, antiCompression: true, fastHardPacketLane: !sRetry, registerTransformPromptLane: cx.registerTransform, chatCadencePromptLane: cx.chatCadence, lowSignatureCadenceLane: cx.lowSignatureCadence, sourceRegisterOverlap: cx.sourceRegisterOverlap, firstPassDeSource: cx.firstPassDeSource, functionalCustodyMap: true, labelOpaqueCustodySets: true, routeLabelSanitizer: true, nestedCandidateArrayParser: true, orderedCustodyMapForbidden: true, macroStartEnforcement: true, deSourceRecomposition: true, sourcePathCaptivityGate: true, delimiterTranscriptionGate: true, deSourcedCopyRepair: repair?.kind === 'copy' && (cx.sourceRegisterOverlap || cx.lowSignatureCadence || cx.firstPassDeSource), semanticElasticity: true, lexicalElasticityLevel: elasticity, rotationVersion: ROTATION_VERSION, strictReviewMapRetry: sRetry, complexity: cx, modelOrder: models.slice(0, maxAttempts), skippedModels: [...skipped], minLengthRatio: minRatio(sourceText, cx), bounded: true, elapsedMs: Date.now() - startedAt } });
      }
    }
    repair = rejectedCompressed.length ? { kind: 'compression', rejected: rejectedCompressed.slice(-3).map((item) => `- ${item.preview}`).join('\n') } : { kind: 'copy', rejected: rejectedCopy.slice(-3).map((item) => `- ${item.preview}`).join('\n') };
  }
  const repaired = serverRepairCandidates(sourceText, contract);
  const elasticity = lexicalElasticityLevel(contract, cx);
  const rejectWarnings = copyRejectWarnings(rejectedCopy);
  return send(res, 200, { ok: true, provider: 'server-deterministic-repair', model: 'server-repair-review-map', deterministic, version: VERSION, rotationVersion: ROTATION_VERSION, candidates: repaired.candidates, warnings: [...repaired.warnings, ...rejectWarnings, 'provider-fast-lane-no-remote-release', 'semantic-elasticity-applied', 'lexical-custody-split', 'de-source-recomposition-applied', 'functional-custody-map-applied', 'label-opaque-custody-sets-active', 'route-label-sanitizer-active', 'nested-candidate-array-parser-active', 'ordered-custody-map-forbidden', 'macro-start-enforcement-active', 'first-pass-desource-applied', 'source-path-captivity-gate-active', 'delimiter-transcription-gate-active', ...(cx.sourceRegisterOverlap ? ['source-register-overlap-detected', 'no-style-costume-law-applied'] : []), ...(cx.registerTransform ? ['register-transform-prompt-lane-exhausted'] : []), ...(cx.chatCadence ? ['chat-cadence-prompt-lane-exhausted'] : []), ...(cx.lowSignatureCadence ? ['low-signature-cadence-lane-exhausted'] : []), ...(sRetry ? ['strict-review-map-transform-lane-exhausted'] : []), ...(skipped.size ? ['strict-review-skip-models-applied'] : [])], attempts, rejectedCopy: rejectedCopy.slice(0, 12), rejectedCompressed: rejectedCompressed.slice(0, 12), requestReceipt: { deterministic, temperature: deterministic ? 0.22 : 0.58, topP: deterministic ? 0.64 : 0.88, antiCompression: true, fastHardPacketLane: !sRetry, registerTransformPromptLane: cx.registerTransform, chatCadencePromptLane: cx.chatCadence, lowSignatureCadenceLane: cx.lowSignatureCadence, sourceRegisterOverlap: cx.sourceRegisterOverlap, firstPassDeSource: cx.firstPassDeSource, functionalCustodyMap: true, labelOpaqueCustodySets: true, routeLabelSanitizer: true, nestedCandidateArrayParser: true, orderedCustodyMapForbidden: true, macroStartEnforcement: true, deSourceRecomposition: true, sourcePathCaptivityGate: true, delimiterTranscriptionGate: true, deSourcedCopyRepair: repair?.kind === 'copy' && (cx.sourceRegisterOverlap || cx.lowSignatureCadence || cx.firstPassDeSource), semanticElasticity: true, lexicalElasticityLevel: elasticity, rotationVersion: ROTATION_VERSION, strictReviewMapRetry: sRetry, complexity: cx, modelOrder: models.slice(0, maxAttempts), skippedModels: [...skipped], minLengthRatio: minRatio(sourceText, cx), bounded: true, elapsedMs: Date.now() - startedAt, reviewMapRepair: true, reviewMapRepairVersion: ROTATION_VERSION } });
}
