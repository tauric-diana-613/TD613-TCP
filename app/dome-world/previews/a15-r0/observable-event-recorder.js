import { canonicalDigest } from '../../ash/canonical-json.js';
import { A15_R0_SCHEMAS, immutableCopy, validateObservableEvent } from './a15-r0-contracts.js';

const EVENT_DOMAIN = 'TD613:ASH:A15-R0:OBSERVABLE-EVENT:v1';

function withoutDigest(value) {
  const output = structuredClone(value);
  delete output.event_digest;
  return output;
}

export function createObservableEventRecorder({
  runId = 'a15r0_run_fixed_kernel_v01',
  projectionId = 'FIXED_KERNEL_ASSAY',
  cryptoImpl = globalThis.crypto
} = {}) {
  const records = [];
  let sequence = 0;

  return Object.freeze({
    async record(input = {}) {
      sequence += 1;
      const record = {
        schema: A15_R0_SCHEMAS.event,
        event_id: `a15r0_event_${String(sequence).padStart(3, '0')}`,
        run_id: runId,
        projection_id: projectionId,
        task_state_before: String(input.taskStateBefore),
        control_id: String(input.controlId),
        control_visible: input.controlVisible === true,
        control_enabled: input.controlEnabled === true,
        gesture: String(input.gesture || 'click'),
        action_id: String(input.actionId),
        kernel_receipt_id: String(input.kernelReceiptId),
        world_answer_id: String(input.worldAnswerId),
        action_to_consequence_distance: Number.isSafeInteger(input.actionToConsequenceDistance)
          ? input.actionToConsequenceDistance
          : 1,
        boundary_crossings: [...(input.boundaryCrossings || [])],
        unexplained_seams: [...(input.unexplainedSeams || [])],
        backtrack: input.backtrack === true,
        help_requested: input.helpRequested === true,
        rest_available: input.restAvailable !== false,
        return_available: input.returnAvailable === true,
        source_status: 'OBSERVED',
        sensor_id: 'browser-interface-observation',
        authority_class: 'A1_OBSERVATIONAL',
        missingness: [...(input.missingness || [])],
        event_digest: null
      };
      record.event_digest = await canonicalDigest(EVENT_DOMAIN, withoutDigest(record), { cryptoImpl });
      validateObservableEvent(record);
      records.push(Object.freeze(record));
      return immutableCopy(record);
    },

    snapshot() {
      return immutableCopy(records);
    },

    reset() {
      records.length = 0;
      sequence = 0;
      return true;
    }
  });
}
