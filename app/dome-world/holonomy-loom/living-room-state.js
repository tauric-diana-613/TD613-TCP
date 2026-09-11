import { projectLoomRequestField } from './ai-request-field.js';

/** Local display projection, never a provider observation or transport operation.
 * Receiver copy and choreography are projections of the same bounded control facts.
 * The local document manifest stays local; private names and every payload are omitted.
 */
export const LOOM_LIVING_ROOM_SCHEMA = 'td613.loom.living-room/v0.1';
const short = (value, limit = 60) => {
  const chars = Array.from(typeof value === 'string' ? value : '');
  return chars.length > limit ? chars.slice(0, limit - 1).join('') + '…' : chars.join('');
};
// Counts never allocate scene objects. Preserve over-limit local drafts for the intake gate.
const boundedCount = value => Number.isSafeInteger(value) && value >= 0 ? value : 0;
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
const boundedFailure = packet => {
  const failure = packet?.provider_failure;
  if (!failure || typeof failure !== 'object' || Array.isArray(failure)) return null;
  const stage = typeof failure.diagnostic?.stage === 'string' ? failure.diagnostic.stage : null;
  const code = typeof failure.diagnostic?.code === 'string' ? failure.diagnostic.code : null;
  const status = Number.isInteger(failure.observations?.http_status) && failure.observations.http_status >= 100 && failure.observations.http_status <= 599
    ? failure.observations.http_status : null;
  return stage || code || status !== null ? { stage, code, status } : null;
};

export function projectLivingRoomState(packet, snapshot = {}) {
  const progress = snapshot.progress ?? 1;
  const field = projectLoomRequestField(packet, progress);
  const phase = field.phase;
  const outgoingSubmitted = field.outgoing.state === 'SUBMISSION_ROUTE';
  const held = phase === 'held';
  const providerFailure = held ? boundedFailure(packet) : null;
  const transportFailure = providerFailure && ['provider-plan', 'provider-transport'].includes(providerFailure.stage);
  // A local/server failure receipt reaching the tab is not the same observation as an AI answer returning.
  const routeReturnObserved = field.cause.response_observed;
  const responseObserved = routeReturnObserved && !transportFailure;
  const settled = phase === 'completed' || held;
  const settlingReveal = phase === 'completed' && packet.presentation?.settling === true && progress < 1
    && snapshot.rest !== true && snapshot.reducedMotion !== true;
  const bindingVerified = packet.binding_verified === true;
  const selectedCount = field.cause.selected_document_count;
  const localCount = field.cause.local_document_count;
  const rulesCount = boundedCount(packet.scene?.rules_count ?? packet.rules_count);
  const reportableModelFields = responseObserved && !providerFailure;
  const reportedSourceCount = reportableModelFields ? field.cause.source_references : null;
  const missingCount = reportableModelFields ? field.cause.reported_missingness_count : null;
  const manifest = Array.isArray(packet.scene?.documents) ? packet.scene.documents.slice(0, 8) : [];
  const documents = field.outgoing.strands.map((strand, index) => {
    const item = manifest.find(doc => doc && doc.share === true && typeof doc.id === 'string' && doc.id === strand.id);
    return { id: strand.id, name: short(item?.name || `Selected document ${index + 1}`), sourceReference: reportableModelFields ? strand.source_reference : 'NOT_REPORTED' };
  });
  const providerFailureText = providerFailure
    ? providerFailure.code === 'DEADLINE_EXCEEDED'
      ? 'The AI route timed out before a complete answer returned.'
      : providerFailure.code === 'REQUEST_CANCELLED'
        ? 'Waiting stopped before a complete answer returned.'
        : transportFailure
          ? `The provider request failed${providerFailure.status === null ? '' : ` (HTTP ${providerFailure.status})`} before an AI answer returned.`
          : 'A provider reply returned, but Loom held it before presenting an answer.'
    : null;
  const control = {
    phase, outgoingSubmitted, routeReturnObserved, responseObserved, held, settled, bindingVerified,
    selectedCount, localCount, rulesCount, reportedSourceCount, missingCount,
    providerFailure: providerFailure ? { ...providerFailure, transportFailure: Boolean(transportFailure) } : null,
    releaseState: held ? 'HELD' : phase === 'completed' ? 'ADMITTED_FOR_HUMAN_REVIEW' : 'UNAVAILABLE',
    providerActivity: 'UNKNOWN', observationBasis: 'CLIENT_ROUTE_EVENTS_AND_MODEL_REPORTED_FIELDS'
  };
  const selected = `${selectedCount} selected ${selectedCount === 1 ? 'document' : 'documents'}`;
  const retained = `${localCount} ${localCount === 1 ? 'file stays' : 'files stay'} in this tab`;
  const heldCopy = providerFailure
    ? {
        now: 'This route stopped.',
        why: `${providerFailureText} ${retained}.`,
        next: 'No source-use or missing-information claim is shown unless an AI answer actually returns and passes the local checks.'
      }
    : {
        now: 'This route stopped.',
        why: responseObserved ? 'A response arrived, but this attempt did not finish admission. The answer stays held.' : outgoingSubmitted ? 'The packet was already submitted. Stopping the wait cannot pull it back.' : 'This attempt stopped before the packet was submitted.',
        next: 'Read the reason below. Your next attempt needs your choice.'
      };
  const plain = {
    prepared: { now: 'Pack the work. Keep the private pieces here.', why: `${selected} will travel with your task and ${rulesCount} rules; ${retained}.`, next: 'Choose Run when your packet is ready.' },
    checking: { now: 'Checking the packet before it leaves.', why: 'Loom checks your selected work and binds its rules to this task.', next: 'The route opens only after these local checks pass.' },
    pending: { now: 'Your packet has entered the AI route.', why: `The task, ${selected} and its rules were submitted. ${retained}.`, next: 'Waiting for a reply. The AI’s internal activity remains unknown.' },
    received: { now: 'A reply came back. Loom is checking it.', why: 'The returning answer must pass the local rules and source checks before review.', next: 'Read the answer after the return check finishes.' },
    completed: { now: 'The answer is ready for you to inspect.', why: missingCount ? `The AI named ${missingCount} open ${missingCount === 1 ? 'question' : 'questions'}. The gaps stay visible beside the returned work.` : 'The returned work passed the local admission checks. Your private files stayed here.', next: 'Read the work, then choose whether to copy it or continue in another workspace.' },
    held: heldCopy
  }[phase];
  const returnObservation = routeReturnObserved
    ? transportFailure ? 'provider failure receipt observed' : 'response body observed'
    : 'response unobserved';
  const auditor = {
    now: `${phase.toUpperCase()} · ${control.releaseState}`,
    why: `${outgoingSubmitted ? 'Client submission observed' : 'Client submission unobserved'}; ${returnObservation}; ${bindingVerified ? 'local AIA binding verified' : 'local AIA binding unverified'}.`,
    next: providerFailure
      ? `${providerFailureText} No model source-use or missingness claim was admitted from this failed attempt.`
      : `${reportedSourceCount === null ? 'Source use unreported' : `${reportedSourceCount} source references reported by the model`}; ${missingCount === null ? 'missingness unreported' : `${missingCount} missing-information items reported by the model`}. Internal AI activity remains unknown.`
  };
  const glyphs = [{ glyph: 'à', relation: 'gathering', cause: 'The task, selected documents and rules form one outgoing packet.' }];
  if (localCount) glyphs.push({ glyph: 'cōl', relation: 'protected_continuity', cause: 'Unselected files remain outside this outgoing packet.' });
  if (outgoingSubmitted) glyphs.push({ glyph: '出', relation: 'release', cause: 'The browser submitted the selected packet to the runtime route; provider receipt is a separate observation.' });
  if ((settled && !settlingReveal) || snapshot.rest === true) glyphs.push({ glyph: '𝄐', relation: 'structural_rest', cause: 'Motion settles while the route history remains visible.' });
  const enabled = (!settled || settlingReveal) && snapshot.rest !== true && snapshot.reducedMotion !== true;
  const time = Number.isFinite(snapshot.motionTimeMs) && snapshot.motionTimeMs >= 0 ? snapshot.motionTimeMs : 0;
  const provider = providerFailure
    ? { state: transportFailure ? 'PROVIDER_FAILURE_OBSERVED' : 'RESPONSE_HELD', label: providerFailureText }
    : responseObserved
      ? { state: 'RESPONSE_OBSERVED', label: reportedSourceCount === null ? 'AI answer returned; source use unreported' : `${reportedSourceCount} source ${reportedSourceCount === 1 ? 'reference' : 'references'} reported by the AI` }
      : { state: 'UNOBSERVED', label: !outgoingSubmitted ? 'Nothing sent to the AI route yet' : held ? 'Waiting stopped; no AI answer observed' : 'Waiting for an AI answer; internal activity unknown' };
  return freeze({
    schema: LOOM_LIVING_ROOM_SCHEMA, phase, outgoingSubmitted, routeReturnObserved, responseObserved, held, settled,
    selectedCount, localCount, rulesCount, documents, reportedSourceCount, missingCount,
    providerFailure: control.providerFailure,
    additionalMissingCount: Math.max(0, (missingCount ?? 0) - 8),
    provider,
    gate: { bindingVerified, blocked: held, label: held ? 'Route held' : bindingVerified ? 'Packet binding checked' : phase === 'checking' ? 'Checking packet binding' : 'Waiting for your Run' },
    glyphs, copy: { plain, auditor }, control,
    motion: { enabled, courierProgress: outgoingSubmitted ? (enabled && phase === 'pending' ? progress : 1) : 0,
      returnProgress: responseObserved ? (enabled && (phase === 'received' || settlingReveal) ? progress : 1) : 0,
      waitingPhase: enabled && phase === 'pending' ? (time % 6000) / 6000 : 0 },
    receipt: { requestId: short(packet.request_id, 120), eventAt: short(packet.at, 40), observationBasis: control.observationBasis, measurementOfHiddenState: false }
  });
}
