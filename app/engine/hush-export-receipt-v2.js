export const HUSH_EXPORT_RECEIPT_V2_VERSION = 'phase-30';

const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

async function hashText(text = '') {
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

export async function buildHushExportReceiptV2(input = {}) {
  const timestamp = input.timestamp || new Date().toISOString();
  const sourceHash = input.sourceHash || await hashText(input.sourceText || '');
  const outputHash = input.outputHash || await hashText(input.outputText || '');
  const receipt = {
    version: HUSH_EXPORT_RECEIPT_V2_VERSION,
    receiptId: input.receiptId || `hush-v2-${timestamp}`,
    timestamp,
    sourceHash,
    outputHash,
    maskId: input.maskId || '',
    mode: input.mode || '',
    routeState: input.routeState || input.narrowingLossSummary?.routeState || 'pending',
    releasePolicySummary: input.releasePolicySummary || {},
    registerContractSummary: input.registerContractSummary || {},
    dialectCustodySummary: input.dialectCustodySummary || {},
    chatspeakCustodySummary: input.chatspeakCustodySummary || {},
    codeSwitchBoundarySummary: input.codeSwitchBoundarySummary || {},
    targetRegisterAuditSummary: input.targetRegisterAuditSummary || {},
    readinessDashboardSummary: input.readinessDashboardSummary || {},
    narrowingLossSummary: input.narrowingLossSummary || {},
    ledgerRowHash: input.ledgerRowHash || '',
    claimCeiling: input.claimCeiling || 'local-review-only',
    privateTextStored: input.includePrivateText === true,
    limitations: input.limitations || ['local review only', 'not anonymity proof', 'not detector proof', 'not platform safety proof', 'not publication safety proof', 'human review required']
  };
  receipt.complete = Boolean(receipt.sourceHash && receipt.outputHash && receipt.claimCeiling && receipt.privateTextStored === false);
  return receipt;
}

export function summarizeHushExportReceiptV2(receipt = {}) {
  return { version: receipt.version || HUSH_EXPORT_RECEIPT_V2_VERSION, receiptId: receipt.receiptId || '', complete: receipt.complete === true, privateTextStored: receipt.privateTextStored === true, routeState: receipt.routeState || 'pending', hasReleasePolicy: Object.keys(receipt.releasePolicySummary || {}).length > 0, hasRegisterCustody: Object.keys(receipt.registerContractSummary || {}).length > 0 || Object.keys(receipt.dialectCustodySummary || {}).length > 0, hasTargetRegisterAudit: Object.keys(receipt.targetRegisterAuditSummary || {}).length > 0, hasDashboardSummary: Object.keys(receipt.readinessDashboardSummary || {}).length > 0, claimCeiling: receipt.claimCeiling || '' };
}

export function auditHushExportReceiptV2(receipt = {}) {
  const failures = [];
  if (receipt.privateTextStored === true) failures.push('private-text-stored');
  if (!receipt.sourceHash || !receipt.outputHash) failures.push('hash-missing');
  if (!receipt.claimCeiling) failures.push('claim-ceiling-missing');
  if (!Object.keys(receipt.readinessDashboardSummary || {}).length) failures.push('dashboard-summary-missing');
  return { version: HUSH_EXPORT_RECEIPT_V2_VERSION, passed: failures.length === 0, hardFailures: failures, warnings: list(receipt.limitations).length ? [] : ['limitations-missing'] };
}
