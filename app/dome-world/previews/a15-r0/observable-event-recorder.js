import { canonicalDigest } from '../../ash/canonical-json.js';
import { A15_R0_SCHEMAS, immutableCopy, validateObservableEvent } from './a15-r0-contracts.js';

const EVENT_DOMAIN = 'TD613:ASH:A15-R0:OBSERVABLE-EVENT:v1';

function withoutDigest(value) {
  const output = structuredClone(value);
  delete output.event_digest;
  return output;
}

function requiredIdentifier(value, label) {
  if (typeof value !== 'string' || value.length === 0) throw new TypeError(`${label} is required.`);
  return value;
}

export function createObservableEventRecorder({
  runId = 'a15r0_run_fixed_kernel_v01',
  projectionId = 'FIXED_KERNEL_ASSAY',
  cryptoImpl = globalThis.crypto
} = {}) {
  const records = [];
  let sequence = 0;
  let generation = 0;
  let operationTail = Promise.resolve();

  return Object.freeze({
    async record(input = {}) {
      const actionId = requiredIdentifier(input.actionId, 'actionId');
      const kernelReceiptId = requiredIdentifier(input.kernelReceiptId, 'kernelReceiptId');
      const worldAnswerId = requiredIdentifier(input.worldAnswerId, 'worldAnswerId');
      if (input.actionToConsequenceDistance !== undefined
          && (!Number.isSafeInteger(input.actionToConsequenceDistance) || input.actionToConsequenceDistance < 0)) {
        throw new TypeError('actionToConsequenceDistance must be a non-negative safe integer.');
      }
      const taskStateBefore = requiredIdentifier(input.taskStateBefore, 'taskStateBefore');
      const controlId = requiredIdentifier(input.controlId, 'controlId');

      const recordGeneration = generation;
      sequence += 1;
      const recordSequence = sequence;
      const record = {
        schema: A15_R0_SCHEMAS.event,
        event_id: `a15r0_event_${String(recordSequence).padStart(3, '0')}`,
        run_id: runId,
        projection_id: projectionId,
        task_state_before: taskStateBefore,
        control_id: controlId,
        control_visible: input.controlVisible === true,
        control_enabled: input.controlEnabled === true,
        gesture: String(input.gesture || 'click'),
        action_id: actionId,
        kernel_receipt_id: kernelReceiptId,
        world_answer_id: worldAnswerId,
        action_to_consequence_distance: input.actionToConsequenceDistance === undefined ? 1 : input.actionToConsequenceDistance,
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
      const operation = operationTail.then(async () => {
        record.event_digest = await canonicalDigest(EVENT_DOMAIN, withoutDigest(record), { cryptoImpl });
        validateObservableEvent(record);
        const frozen = Object.freeze(record);
        if (recordGeneration === generation) records.push(frozen);
        return immutableCopy(record);
      });
      operationTail = operation.then(() => undefined, () => undefined);
      return operation;
    },
    snapshot() { return immutableCopy(records); },
    reset() {
      generation += 1;
      records.length = 0;
      sequence = 0;
      return true;
    }
  });
}
