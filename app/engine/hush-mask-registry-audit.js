import hushMasks from '../data/hush-masks.js';
import phase22HushMasks from '../data/hush-phase22-masks.js';
import phase24HushMasks from '../data/hush-phase24-masks.js';
import phase27HushMasks from '../data/hush-phase27-masks.js';
import phase28HushMasks from '../data/hush-phase28-masks.js';
import { listHushMasks } from './hush-mask-studio.js';

export const HUSH_MASK_REGISTRY_AUDIT_VERSION = 'phase-30';

const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const ids = (items) => list(items).map((item) => item.id || item.maskId || '').filter(Boolean);

export function getAllHushDataMasks(input = {}) {
  return input.dataMasks || [...hushMasks, ...phase22HushMasks, ...phase24HushMasks, ...phase27HushMasks, ...phase28HushMasks];
}

export function auditHushMaskRegistry(input = {}) {
  const dataMasks = getAllHushDataMasks(input);
  const studioMasks = input.studioMasks || listHushMasks(input.studioInput || {});
  const uiMasks = input.uiMasks || studioMasks;
  const dataIds = ids(dataMasks);
  const studioIds = ids(studioMasks);
  const uiIds = ids(uiMasks);
  const missingFromStudio = dataIds.filter((id) => !studioIds.includes(id));
  const missingFromUi = dataIds.filter((id) => !uiIds.includes(id));
  const orphanedMasks = studioIds.filter((id) => !dataIds.includes(id));
  return { version: HUSH_MASK_REGISTRY_AUDIT_VERSION, dataMaskCount: dataIds.length, studioMaskCount: studioIds.length, uiMaskCount: uiIds.length, dataMasks: dataIds, studioMasks: studioIds, uiMasks: uiIds, missingFromStudio, missingFromUi, orphanedMasks, passed: missingFromStudio.length === 0 && missingFromUi.length === 0 };
}

export function summarizeHushMaskRegistryAudit(audit = {}) {
  return { version: audit.version || HUSH_MASK_REGISTRY_AUDIT_VERSION, dataMaskCount: audit.dataMaskCount || 0, studioMaskCount: audit.studioMaskCount || 0, uiMaskCount: audit.uiMaskCount || 0, missingFromStudio: list(audit.missingFromStudio), missingFromUi: list(audit.missingFromUi), orphanedMasks: list(audit.orphanedMasks), passed: audit.passed === true };
}
