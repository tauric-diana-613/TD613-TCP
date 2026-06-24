function text(value) { return String(value || ''); }
function lower(value) { return text(value).toLowerCase(); }
function clamp(value) { return Math.max(0, Math.min(1, Number((Number(value) || 0).toFixed(4)))); }
function tokens(value) { return text(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []; }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function jaccard(a = [], b = []) {
  const sa = new Set(a.map((item) => String(item).toLowerCase()));
  const sb = new Set(b.map((item) => String(item).toLowerCase()));
  const union = new Set([...sa, ...sb]);
  if (!union.size) return 0;
  return clamp([...sa].filter((item) => sb.has(item)).length / union.size);
}
function specificTemplates(value = '') {
  const v = lower(value);
  const out = [];
  if (v.includes('sure') && v.includes('because')) out.push('sure-because-scaffold');
  if (v.includes('just happens')) out.push('just-happens-scaffold');
  if (v.includes('cute little')) out.push('cute-little-scaffold');
  if (v.startsWith('convenient footer issue')) out.push('convenient-footer-issue');
  if (v.startsWith('odd little mismatch')) out.push('odd-little-mismatch');
  return unique(out);
}
function recentList(options = {}) {
  return Array.isArray(options.recentOutputs) ? options.recentOutputs : Array.isArray(options.recent_outputs) ? options.recent_outputs : [];
}

export function calibrateNolanNeedlerMetrics(metrics = {}, candidate = '', options = {}) {
  const recent = recentList(options);
  const templates = specificTemplates(candidate);
  const templateSimilarity = recent.length ? Math.max(...recent.map((item) => jaccard(templates, specificTemplates(item)))) : 0;
  const tokenSimilarity = recent.length ? Math.max(...recent.map((item) => jaccard(tokens(candidate), tokens(item)))) : 0;
  const obviousReusableScaffold = lower(candidate).includes('sure, because') || lower(candidate).includes('just happens') || lower(candidate).includes('cute little');
  const hardEdge = (metrics.motive_invention_risk ?? 0) > 0 || (metrics.contempt_density ?? 0) > 0 || (metrics.hostile_accusation_risk ?? 0) > 0.12;
  const templateUniqueness = obviousReusableScaffold ? 0.72 : clamp(1 - templateSimilarity);
  const crossSampleSimilarity = clamp(Math.max(tokenSimilarity * 0.55, templateSimilarity * 0.7));
  const idiolectPersistence = clamp(crossSampleSimilarity * 0.55 + templateSimilarity * 0.32 + (obviousReusableScaffold ? 0.12 : 0));
  return Object.freeze({
    ...metrics,
    sarcasm_template_uniqueness: templateUniqueness,
    cross_sample_similarity_index: crossSampleSimilarity,
    idiolect_persistence_score: idiolectPersistence,
    snark_escalation_risk: hardEdge ? metrics.snark_escalation_risk : Math.min(metrics.snark_escalation_risk ?? 0, 0.08),
    reusable_quip_risk: clamp(Math.max(metrics.reusable_quip_risk ?? 0, obviousReusableScaffold ? 0.24 : templateSimilarity * 0.6))
  });
}
