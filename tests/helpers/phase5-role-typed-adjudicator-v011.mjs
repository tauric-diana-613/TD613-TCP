import {
  compileRelationProposal,
  validateAshCustodyReceiptIntegrity,
  validateFlowCoreContextReceipt,
  validateRoundTripReceipt
} from '../../app/engine/phase5-relation-contract.js';
import { R0_RECEIPT_REFERENCES_ONLY } from '../../app/engine/phase5-relation-crypto.js';

export async function collapsedTerminalBlind({ ash, flow, roundTrip, routeScope, options = {} }) {
  try {
    await compileRelationProposal({
      ashReceipt: ash,
      flowcoreReceipt: flow,
      roundTripReceipt: roundTrip,
      assuranceClass: R0_RECEIPT_REFERENCES_ONLY,
      routeScope
    }, options);
    return 'PROCEED';
  } catch {
    return 'HOLD';
  }
}

export async function roleTypedLocalizationBlind({ ash, flow, roundTrip, routeScope, options = {} }) {
  try {
    await validateAshCustodyReceiptIntegrity(ash);
  } catch {
    return 'ASH_CUSTODY_INTEGRITY';
  }

  try {
    validateFlowCoreContextReceipt(flow);
  } catch {
    return 'FLOWCORE_CONTEXT_ADMISSIBILITY';
  }

  try {
    await validateRoundTripReceipt(roundTrip, flow, options);
  } catch (error) {
    const message = String(error?.message || '');
    if (/unsupported aperture round-trip schema/i.test(message)) return 'APERTURE_ROUNDTRIP_SCHEMA';
    if (/failed independent replay/i.test(message)) return 'APERTURE_ROUNDTRIP_REPLAY';
    return 'APERTURE_ROUNDTRIP_OTHER';
  }

  try {
    await compileRelationProposal({
      ashReceipt: ash,
      flowcoreReceipt: flow,
      roundTripReceipt: roundTrip,
      assuranceClass: R0_RECEIPT_REFERENCES_ONLY,
      routeScope
    }, options);
    return 'VALID_HANDOFF';
  } catch {
    return 'PHASE5_RELATION_COMPOSITION';
  }
}

export async function adjudicateBlind(handoff) {
  const localization = await roleTypedLocalizationBlind(handoff);
  return Object.freeze({
    terminal: localization === 'VALID_HANDOFF' ? 'PROCEED' : 'HOLD',
    localization
  });
}
