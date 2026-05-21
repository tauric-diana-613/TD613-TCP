export const HUSH_REPORT_INGEST_VERSION = 'phase-29';

const PREFIXES = {
  HUSH_PHASE24_READINESS_REPORT: 'phase24',
  HUSH_PHASE25_WHISTLEBLOWER_READINESS_REPORT: 'phase25',
  HUSH_PHASE27_LINGUISTIC_CUSTODY_REPORT: 'phase27',
  HUSH_PHASE28_TARGET_REGISTER_REPORT: 'phase28',
  HUSH_PHASE29_PRODUCT_READINESS_REPORT: 'phase29'
};

export function ingestHushReportLine(line = '') {
  const text = String(line || '').trim();
  const prefix = Object.keys(PREFIXES).find((item) => text.startsWith(item));
  if (!prefix) return { version: HUSH_REPORT_INGEST_VERSION, recognized: false, reportType: '', report: null, summary: {}, warnings: ['unknown-report-prefix'] };
  const payload = text.slice(prefix.length).trim();
  try {
    const report = JSON.parse(payload || '{}');
    return { version: HUSH_REPORT_INGEST_VERSION, recognized: true, reportType: PREFIXES[prefix], report, summary: summarizeIngestedReport(PREFIXES[prefix], report), warnings: [] };
  } catch (error) {
    return { version: HUSH_REPORT_INGEST_VERSION, recognized: true, reportType: PREFIXES[prefix], report: null, summary: {}, warnings: ['report-json-parse-failed'] };
  }
}

export function summarizeIngestedReport(type = '', report = {}) {
  return { type, version: report.version || '', readiness: report.readiness || {}, keys: Object.keys(report || {}) };
}

export function ingestHushReportLines(lines = []) {
  const entries = (Array.isArray(lines) ? lines : []).map((line) => ingestHushReportLine(line));
  return { version: HUSH_REPORT_INGEST_VERSION, entries, recognized: entries.filter((entry) => entry.recognized).length };
}
