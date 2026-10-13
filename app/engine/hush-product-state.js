import { buildHushReadinessDashboard, summarizeHushReadinessDashboard } from './hush-readiness-dashboard.js';

export const HUSH_PRODUCT_STATE_VERSION = 'phase-29';

const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

export function buildHushProductState(input = {}) {
  const dashboard = input.dashboard || buildHushReadinessDashboard(input.reports || {});
  return {
    version: HUSH_PRODUCT_STATE_VERSION,
    currentMode: input.currentMode || '',
    selectedMask: input.selectedMask || null,
    selectedContract: input.selectedContract || null,
    latestSwap: input.latestSwap || null,
    latestReleasePolicy: input.latestReleasePolicy || null,
    latestRegisterAudit: input.latestRegisterAudit || null,
    latestTargetAudit: input.latestTargetAudit || null,
    latestExportPolicy: input.latestExportPolicy || null,
    latestRecognitionField: input.latestRecognitionField || null,
    dashboard,
    dashboardSummary: summarizeHushReadinessDashboard(dashboard),
    operatorWarnings: [...new Set([...list(input.operatorWarnings), ...list(dashboard.warnings)])]
  };
}

export function updateHushProductState(state = {}, patch = {}) {
  return buildHushProductState({ ...state, ...patch });
}

export function summarizeHushProductState(state = {}) {
  return { version: state.version || HUSH_PRODUCT_STATE_VERSION, currentMode: state.currentMode || '', maskId: state.selectedMask?.id || state.selectedMask?.maskId || '', dashboard: state.dashboardSummary || summarizeHushReadinessDashboard(state.dashboard || {}), operatorWarnings: list(state.operatorWarnings) };
}
