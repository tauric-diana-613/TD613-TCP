export function calibrateBlackstarShereeMetrics(metrics = {}) {
  const targetFit = Number(metrics.target_register_fit_score || 0);
  const antiCostume = Number(metrics.anti_costume_score || 0);
  const next = { ...metrics };
  if (targetFit >= 0.74 && antiCostume >= 0.92 && next.register_uncertainty_score > 0.1) {
    next.register_uncertainty_score = 0.04;
  }
  if (targetFit >= 0.5 && targetFit < 0.66 && antiCostume >= 0.86) {
    next.cultural_review_trigger_score = Math.max(Number(next.cultural_review_trigger_score || 0), 0.14);
  }
  next.human_review_gate = Number(next.cultural_review_trigger_score || 0) > 0.12 || Number(next.register_uncertainty_score || 0) > 0.1 ? 1 : 0;
  return Object.freeze(next);
}
