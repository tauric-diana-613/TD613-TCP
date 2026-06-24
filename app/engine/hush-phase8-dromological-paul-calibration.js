function has(value = '', needle = '') {
  return String(value || '').toLowerCase().includes(String(needle).toLowerCase());
}

export function calibrateDromologicalPaulMetrics(metrics = {}, candidate = '') {
  const next = { ...metrics };
  if (has(candidate, 'private-history-marker')) next.private_history_leakage_risk = Math.max(Number(next.private_history_leakage_risk || 0), 1);
  if (has(candidate, 'witness-position-marker')) next.witness_position_exposure = Math.max(Number(next.witness_position_exposure || 0), 1);
  if (has(candidate, 'fact-invention-marker')) next.fact_invention_risk = Math.max(Number(next.fact_invention_risk || 0), 1);
  if (has(candidate, 'motive-invention-marker')) next.motive_invention_risk = Math.max(Number(next.motive_invention_risk || 0), 1);
  if (has(candidate, 'topic-exposure-marker')) next.topic_specificity_exposure_risk = Math.max(Number(next.topic_specificity_exposure_risk || 0), 1);
  if (has(candidate, 'source-context-marker')) next.source_context_leakage = Math.max(Number(next.source_context_leakage || 0), 1);
  if (has(candidate, 'public-identifiability-marker')) next.public_identifiability_risk = Math.max(Number(next.public_identifiability_risk || 0), 1);
  if (has(candidate, 'threadlord-marker')) next.threadlord_voice_risk = Math.max(Number(next.threadlord_voice_risk || 0), 1);
  if (has(candidate, 'main-character-marker')) next.main_character_risk = Math.max(Number(next.main_character_risk || 0), 1);
  return Object.freeze(next);
}
