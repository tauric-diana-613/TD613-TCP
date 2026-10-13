export const HUSH_READINESS_DASHBOARD_VERSION = 'phase-29';

const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const hasRows = (section = {}) => Number(section.attempts || 0) > 0;
const strictReady = (section = {}) => hasRows(section) && section.emitted === section.attempts && (section.readyRows === undefined || section.readyRows === section.attempts) && !section.hardFailureRows && !section.eventShapeFailures && !section.eventShapeFailureRows && !section.garbledRows && !section.flattenedRows;

function status(value) {
  if (value === true) return 'green';
  if (value === false) return 'red';
  return 'gray';
}

function surface(name, ready, detail = {}) {
  return { name, status: status(ready), ready: ready === true, detail };
}

export function buildHushReadinessDashboard(input = {}) {
  const p24 = input.phase24 || {};
  const p25 = input.phase25 || {};
  const p27 = input.phase27 || {};
  const p28 = input.phase28 || {};
  const surfaces = {
    coherentToJagged: surface('coherent-to-jagged', p25.readiness?.coherentToJagged ?? p24.readiness?.coherentToJagged, p25.coherentToJagged || p24.coherentToJagged || {}),
    jaggedToCoherent: surface('jagged-to-coherent', p25.readiness?.jaggedToCoherent ?? p24.readiness?.jaggedToCoherent, p25.jaggedToCoherent || p24.jaggedToCoherent || {}),
    hardCustomizer: surface('hard-customizer', p25.readiness?.hardCustomizer, p25.hardCustomizer || {}),
    messyNotes: surface('messy-notes', p27.readiness?.messyNotes, p27.messyNotes || {}),
    chatspeak: surface('chatspeak', p27.readiness?.chatspeak, p27.chatspeak || {}),
    dialectCustody: surface('dialect-custody', p27.readiness?.dialectPreservation, p27.dialectPreservation || {}),
    codeSwitching: surface('code-switching', p27.readiness?.codeSwitching, p27.codeSwitching || {}),
    targetRegister: surface('target-register', p28.readiness?.overall, p28.targetRegisterFlights || {}),
    exportSafety: surface('export-safety', input.exportReady, input.exportSummary || {}),
    operatorSafety: surface('operator-safety', input.operatorReady, input.operatorSummary || {})
  };
  const blockers = [];
  const warnings = [];
  for (const item of Object.values(surfaces)) {
    if (item.status === 'red') blockers.push(`${item.name}-not-ready`);
    if (item.status === 'gray') warnings.push(`${item.name}-not-reported`);
  }
  const testFlightReady = !blockers.includes('coherent-to-jagged-not-ready') && !blockers.includes('jagged-to-coherent-not-ready');
  const liveWhistleblowerReady = false;
  const targetRegisterReady = p28.readiness?.overall === true;
  const exportReady = input.exportReady === true;
  const overall = testFlightReady && exportReady && warnings.length === 0;
  const nextActions = blockers.length ? blockers.map((blocker) => `review:${blocker}`) : ['continue-synthetic-test-flight'];
  if (!liveWhistleblowerReady) warnings.push('live-whistleblower-use-still-human-review-required');
  return { version: HUSH_READINESS_DASHBOARD_VERSION, surfaces, readiness: { testFlightReady, liveWhistleblowerReady, targetRegisterReady, exportReady, overall }, blockers, warnings: [...new Set(warnings)], nextActions };
}

export function summarizeHushReadinessDashboard(dashboard = {}) {
  return { version: dashboard.version || HUSH_READINESS_DASHBOARD_VERSION, surfaceCount: Object.keys(dashboard.surfaces || {}).length, readiness: dashboard.readiness || {}, blockers: list(dashboard.blockers), warnings: list(dashboard.warnings), nextActions: list(dashboard.nextActions) };
}
