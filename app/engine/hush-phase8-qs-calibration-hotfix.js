export function calibrateQueenieThresholds(thresholds = {}) {
  return Object.freeze({
    ...thresholds,
    bounded_warmth_score_max: 0.93,
    story_pressure_score_max: 0.6
  });
}

function text(value) { return String(value || ''); }
function lower(value) { return text(value).toLowerCase(); }
function clamp(value) { return Math.max(0, Math.min(1, Number((Number(value) || 0).toFixed(4)))); }
function boundedRate(count, denominator) { return clamp(denominator ? count / denominator : 0); }
function countMatches(value, regex) { return (text(value).match(regex) || []).length; }
function phrase(value, needle) { return lower(value).includes(String(needle).toLowerCase()); }

function exactPhrase(value, phraseText) {
  const escaped = String(phraseText).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[^A-Za-z0-9])${escaped}(?:$|[^A-Za-z0-9])`, 'iu').test(text(value));
}

function countSpacedSlash(value) {
  return countMatches(value, /(?:^|\s)\/(?:\s|$)/gu) + countMatches(value, /\/\//gu);
}

function recomputeRexLeakage(value) {
  const spacedSlash = countSpacedSlash(value);
  const lexicalHits = ['date holds', 'label holds', 'not small'].filter((item) => exactPhrase(value, item)).length;
  return clamp(spacedSlash * 0.1 + lexicalHits * 0.16);
}

function recomputePixieLeakage(value) {
  const hits = ['idk', 'rn', 'tho'].filter((item) => exactPhrase(value, item)).length;
  const maybeWeird = phrase(value, 'maybe weird') ? 1 : 0;
  return clamp((hits + maybeWeird) * 0.18);
}

function recomputeLuzLeakage(value) {
  const numbered = countMatches(value, /(?:^|\n)\s*\d+\./gu);
  const lexicalHits = ['checklist', 'itemize', 'numbered'].filter((item) => exactPhrase(value, item)).length;
  return clamp(numbered * 0.18 + lexicalHits * 0.2);
}

function recomputeThinAtmosphere(value, metrics = {}) {
  const approvedThinPhrases = ['learned another route', 'loose part', 'left its shelf'];
  const approvedHits = approvedThinPhrases.filter((item) => phrase(value, item)).length;
  const atmosphericBase = metrics.thin_atmosphere_score ?? 0;
  return clamp(Math.min(atmosphericBase, 0.22 + approvedHits * 0.14));
}

export function calibrateSolMetrics(metrics = {}, candidate = '') {
  const rexLeak = recomputeRexLeakage(candidate);
  const pixieLeak = recomputePixieLeakage(candidate);
  const luzLeak = recomputeLuzLeakage(candidate);
  const thinAtmosphere = recomputeThinAtmosphere(candidate, metrics);
  const custody = Math.max(metrics.custody_chain_visibility_score ?? 0, 0.01);
  const atmosphereRatio = clamp((thinAtmosphere + (metrics.haunt_pressure_score ?? 0) + 0.01) / (custody + 0.01));
  const priorMask = clamp(Math.max(
    metrics.queenie_leakage_score ?? 0,
    rexLeak,
    metrics.cryo_handoff_leakage_score ?? 0,
    pixieLeak,
    metrics.keisha_social_leakage_score ?? 0,
    luzLeak,
    metrics.nolan_snark_leakage_score ?? 0
  ));
  return Object.freeze({
    ...metrics,
    rex_fracture_leakage_score: rexLeak,
    pixie_chat_leakage_score: pixieLeak,
    luz_checklist_leakage_score: luzLeak,
    prior_mask_similarity_score: priorMask,
    thin_atmosphere_score: thinAtmosphere,
    atmosphere_to_custody_ratio: atmosphereRatio,
    atmosphere_containment_score: clamp(1 - (metrics.haunt_pressure_score ?? 0) - Math.max(0, atmosphereRatio - 0.35))
  });
}
