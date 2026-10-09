import { copyPortableLoomJson } from './portable-loom-core.js';
import { portableLoomDigest } from './portable-loom-session.js';

/** The native adapter's content-binding operation, available to any receiver.
 * The caller retains original capture bytes separately. Binding is computed
 * locally and never authenticates the origin or execution of a foreign reply.
 */
export async function bindPortableLoomCapturedResult(excursion, result, environment = globalThis, {
  notes = 'Local capture adapter bound these supplied result bytes to the registered departure. Foreign origin and execution remain unauthenticated.'
} = {}) {
  excursion = copyPortableLoomJson(excursion); result = copyPortableLoomJson(result);
  if (excursion?.schema !== 'td613.loom.reentry-excursion/v0.2' || excursion.turns?.length !== 1) throw new Error('One registered departure turn required.');
  if (result?.status !== 'completed' || typeof result.answer !== 'string' || !result.answer.trim()
    || !Array.isArray(result.used_document_ids) || !Array.isArray(result.missing_information)) throw new Error('Completed captured result required.');
  const turn = excursion.turns[0];
  return {
    schema: 'td613.loom.bound-receiver-turn/v0.2', excursion_ref: excursion.ref, intent_ref: turn.ref,
    session_root_ref: excursion.session_root_ref, policy_commitment: excursion.policy_commitment,
    anchor_work_unit_ref: excursion.anchor_work_unit_ref, turn_index: turn.turn_index,
    task_digest: turn.task_digest, source_commitment_digest: turn.source_commitment_digest,
    answer: result.answer, answer_digest: await portableLoomDigest(result.answer, environment),
    used_document_ids: [...result.used_document_ids], missing_information: [...result.missing_information],
    receiver_declaration: { policy_change_requested: result.policy_change_requested === true, notes }
  };
}
