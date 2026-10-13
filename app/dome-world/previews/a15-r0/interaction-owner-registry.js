import { A15_R0_SCHEMAS, validateInteractionOwnerRecord } from './a15-r0-contracts.js';

const CONTROL_IDS = Object.freeze([
  'bind-reference',
  'form-relation',
  'compare-route',
  'preserve-result',
  'return-custody',
  'rest-run',
  'reset-fixture'
]);

export const A15_R0_INTERACTION_OWNERS = Object.freeze(CONTROL_IDS.map(controlId => Object.freeze({
  schema: A15_R0_SCHEMAS.owner,
  control_id: controlId,
  projection_owner: 'A15_R0_HARNESS',
  action_owner: 'ASH_KERNEL_ADAPTER',
  event_phase: 'bubble',
  delegated: true,
  competing_owner_detected: false
})));

for (const record of A15_R0_INTERACTION_OWNERS) validateInteractionOwnerRecord(record);

if (new Set(A15_R0_INTERACTION_OWNERS.map(record => record.control_id)).size !== A15_R0_INTERACTION_OWNERS.length) {
  throw new Error('A15-R0 controls require one declared interaction owner each.');
}

export function getInteractionOwner(controlId) {
  return A15_R0_INTERACTION_OWNERS.find(record => record.control_id === controlId) || null;
}
