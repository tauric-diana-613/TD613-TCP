export const HUSH_NARROWING_LOSSES_VERSION = 'phase-30';

const n = (value) => Number.isFinite(value) ? value : 0;
const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const clamp = (value) => Math.max(0, Math.min(1, n(value)));
const round = (value) => Number(clamp(value).toFixed(4));

function boolLoss(value) { return value ? 1 : 0; }

export function computeHushNarrowingLosses(input = {}) {
  const release = input.releasePolicy || {};
  const target = input.targetRegisterAudit || {};
  const dialect = input.dialectCustody || {};
  const chat = input.chatspeakCustody || {};
  const boundary = input.codeSwitchBoundary || {};
  const exportReceipt = input.exportReceipt || {};
  const dashboard = input.dashboard || {};
  const docs = input.docsMemory || {};
  const losses = {
    payload: round(input.payloadLoss ?? boolLoss(list(release.hardBlocks).includes('payload-loss'))),
    literal: round(input.literalLoss ?? boolLoss(list(release.hardBlocks).includes('protected-literal-drop') || list(target.hardFailures).includes('protected-literal-dropped'))),
    event: round(input.eventLoss ?? boolLoss(target.eventShapePassed === false || list(target.hardFailures).includes('event-shape-lost'))),
    register: round(input.registerLoss ?? boolLoss(dialect.passed === false || chat.passed === false || boundary.passed === false)),
    target: round(input.targetLoss ?? boolLoss(target.passed === false || list(target.hardFailures).includes('target-register-not-visible') || list(target.hardFailures).includes('target-register-overcooked'))),
    export: round(input.exportLoss ?? boolLoss(exportReceipt.privateTextStored === true || exportReceipt.complete === false)),
    ui: round(input.uiLoss ?? boolLoss(dashboard.readiness?.overall === false && dashboard.blockers?.length)),
    docs: round(input.docsLoss ?? boolLoss(docs.passed === false))
  };
  const entries = Object.entries(losses);
  const dominant = entries.reduce((best, item) => item[1] > best[1] ? item : best, ['none', 0]);
  const severity = round(entries.reduce((sum, item) => sum + item[1], 0) / entries.length);
  const blockers = entries.filter((item) => item[1] >= 0.75).map((item) => `${item[0]}-loss`);
  const warnings = entries.filter((item) => item[1] > 0 && item[1] < 0.75).map((item) => `${item[0]}-loss-review`);
  const routeState = blockers.length ? 'hold' : warnings.length ? 'warning' : 'receipt-ready';
  return { version: HUSH_NARROWING_LOSSES_VERSION, losses, dominantLoss: dominant[0], severity, routeState, blockers, warnings };
}

export function summarizeHushNarrowingLosses(result = {}) {
  return { version: result.version || HUSH_NARROWING_LOSSES_VERSION, dominantLoss: result.dominantLoss || 'none', severity: n(result.severity), routeState: result.routeState || 'pending', blockers: list(result.blockers), warnings: list(result.warnings) };
}
