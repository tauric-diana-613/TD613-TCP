export const HUSH_READINESS_LEDGER_VERSION = 'phase-29';

async function sha256(text = '') {
  const value = String(text ?? '');
  if (globalThis.crypto?.subtle) {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  return `fallback-${Math.abs(hash).toString(16)}`;
}

const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

export async function buildHushReadinessLedgerRow(input = {}) {
  const timestamp = input.timestamp || new Date().toISOString();
  return {
    version: HUSH_READINESS_LEDGER_VERSION,
    runId: input.runId || `hush-${timestamp}`,
    timestamp,
    engineVersions: input.engineVersions || {},
    inputHash: await sha256(input.sourceText || ''),
    outputHash: await sha256(input.outputText || ''),
    maskId: input.maskId || '',
    mode: input.mode || '',
    dashboardSummary: input.dashboardSummary || {},
    hardBlocks: list(input.hardBlocks),
    warnings: list(input.warnings),
    privateTextStored: input.includePrivateText === true
  };
}

export function redactHushReadinessLedgerRow(row = {}) {
  const { sourceText, outputText, privateText, ...safe } = row;
  return { ...safe, privateTextStored: safe.privateTextStored === true ? true : false };
}

export function summarizeHushReadinessLedger(row = {}) {
  return { version: row.version || HUSH_READINESS_LEDGER_VERSION, runId: row.runId || '', hasInputHash: Boolean(row.inputHash), hasOutputHash: Boolean(row.outputHash), privateTextStored: row.privateTextStored === true, hardBlocks: list(row.hardBlocks), warnings: list(row.warnings) };
}
