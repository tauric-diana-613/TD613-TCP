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
const boundedHttp = value => Number.isInteger(value) && value >= 100 && value <= 599 ? value : null;
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};

export function projectLivingRoomState(packet, snapshot = {}) {
  const progress = snapshot.progress ?? 1;
  const failure = packet?.provider_failure && typeof packet.provider_failure === 'object' && !Array.isArray(packet.provider_failure)
    ? packet.provider_failure : null;
  const failureCode = typeof failure?.diagnostic?.code === 'string' ? failure.diagnostic.code : null;
  const failureStage = typeof failure?.diagnostic?.stage === 'string' ? failure.diagnostic.stage : null;
  const providerHttpStatus = boundedHttp(packet?.observations?.http_status ?? failure?.observations?.http_status);
  const providerModel = typeof (packet?.observations?.model ?? failure?.observations?.model) === 'string'
    ? short(packet?.observations?.model ?? failure?.observations?.model, 120) : null;
  // A server-side failure receipt reaching the tab is not an AI answer returning through the room.
  // Preserve the already-observed outbound submission while refusing to manufacture a return path.
  const transportFailure = packet?.phase === 'held' && failureStage === 'provider-transport'
    && (failureCode === 'PROVIDER_HTTP_ERROR' || failureCode === 'PROVIDER_TRANSPORT_FAILED');
  const field = projectLoomRequestField(transportFailure ? { ...packet, response_received: false } : packet, progress);
  const phase = field.phase;
  const outgoingSubmitted = field.outgoing.state === 'SUBMISSION_ROUTE';
  const responseObserved = field.cause.response_observed;
  const held = phase === 'held';
  const settled = phase === 'completed' || held;
  const settlingReveal = phase === 'completed' && packet.presentation?.settling === true && progress < 1
    && snapshot.rest !== true && snapshot.reducedMotion !== true;
  const bindingVerified = packet.binding_verified === true;
  const selectedCount = field.cause.selected_document_count;
  const localCount = field.cause.local_document_count;
  const rulesCount = boundedCount(packet.scene?.rules_count ?? packet.rules_count);
  const reportedSourceCount = responseObserved ? field.cause.source_references : null;
  const missingCount = responseObserved ? field.cause.reported_missingness_count : null;
  const manifest = Array.isArray(packet.scene?.documents) ? packet.scene.documents.slice(0, 8) : [];
  const documents = field.outgoing.strands.map((strand, index) => {
    const item = manifest.find(doc => doc && doc.share === true && typeof doc.id === 'string' && doc.id === strand.id);
    return { id: strand.id, name: short(item?.name || `Selected document ${index + 1}`), sourceReference: responseObserved ? strand.source_reference : 'NOT_REPORTED' };
  });
  const failureReceiptObserved = Boolean(failure);
  const control = {
    phase, outgoingSubmitted, responseObserved, held, settled, bindingVerified,
    selectedCount, localCount, rulesCount, reportedSourceCount, missingCount,
    failureReceiptObserved, providerHttpStatus, providerModel, providerFailureCode: failureCode,
    releaseState: held ? 'HELD' : phase === 'completed' ? 'ADMITTED_FOR_HUMAN_REVIEW' : 'UNAVAILABLE',
    providerActivity: 'UNKNOWN',
    observationBasis: failureReceiptObserved
      ? 'CLIENT_ROUTE_EVENTS_PROVIDER_DIAGNOSTIC_AND_MODEL_REPORTED_FIELDS'
      : 'CLIENT_ROUTE_EVENTS_AND_MODEL_REPORTED_FIELDS'
  };
  const selected = `${selectedCount} selected ${selectedCount === 1 ? 'document' : 'documents'}`;
  const retained = `${localCount} ${localCount === 1 ? 'file stays' : 'files stay'} in this tab`;
  const heldCopy = transportFailure
    ? {
        now: 'The AI route stopped before an answer came back.',
        why: `${providerHttpStatus ? `Gemini returned HTTP ${providerHttpStatus}` : 'The provider transport failed'} before a usable answer reached Loom. ${retained}.`,
        next: 'No answer or source references were admitted. Try again, or prepare this task for another AI.'
      }
    : { now: 'This route stopped.', why: responseObserved ? 'A response arrived, but this attempt did not finish admission. The answer stays held.' : outgoingSubmitted ? 'The packet was already submitted. Stopping the wait cannot pull it back.' : 'This attempt stopped before the packet was submitted.', next: 'Read the reason below. Your next attempt needs your choice.' };
  const plain = {
    prepared: { now: 'Pack the work. Keep the private pieces here.', why: `${selected} will travel with your task and ${rulesCount} rules; ${retained}.`, next: 'Choose Run when your packet is ready.' },
    checking: { now: 'Checking the packet before it leaves.', why: 'Loom checks your selected work and binds its rules to this task.', next: 'The route opens only after these local checks pass.' },
    pending: { now: 'Your packet has entered the AI route.', why: `The task, ${selected} and its rules were submitted. ${retained}.`, next: 'Waiting for a reply. The AI’s internal activity remains unknown.' },
    received: { now: 'A reply came back. Loom is checking it.', why: 'The returning answer must pass the local rules and source checks before review.', next: 'Read the answer after the return check finishes.' },
    completed: { now: 'The answer is ready for you to inspect.', why: missingCount ? `The AI named ${missingCount} open ${missingCount === 1 ? 'question' : 'questions'}. The gaps stay visible beside the returned work.` : 'The returned work passed the local admission checks. Your private files stayed here.', next: 'Read the work, then choose whether to copy it or continue in another workspace.' },
    held: heldCopy
  }[phase];
  const auditor = {
    now: `${phase.toUpperCase()} · ${control.releaseState}`,
    why: `${outgoingSubmitted ? 'Client submission observed' : 'Client submission unobserved'}; ${responseObserved ? 'model response body observed' : transportFailure ? 'provider failure receipt observed; model answer unobserved' : 'response unobserved'}; ${bindingVerified ? 'local AIA binding verified' : 'local AIA binding unverified'}.`,
    next: failureReceiptObserved
      ? `${failureStage || 'provider stage unreported'} · ${failureCode || 'diagnostic code unreported'}${providerHttpStatus ? ` · HTTP ${providerHttpStatus}` : ''}${providerModel ? ` · ${providerModel}` : ''}. Source use and missingness remain unreported unless an admitted model return supplies them.`
      : `${reportedSourceCount === null ? 'Source use unreported' : `${reportedSourceCount} source references reported by the model`}; ${missingCount === null ? 'missingness unreported' : `${missingCount} missing-information items reported by the model`}. Internal AI activity remains unknown.`
  };
  const glyphs = [{ glyph: 'à', relation: 'gathering', cause: 'The task, selected documents and rules form one outgoing packet.' }];
  if (localCount) glyphs.push({ glyph: 'cōl', relation: 'protected_continuity', cause: 'Unselected files remain outside this outgoing packet.' });
  if (outgoingSubmitted) glyphs.push({ glyph: '出', relation: 'release', cause: 'The browser submitted the selected packet to the runtime route; provider receipt is a separate observation.' });
  if ((settled && !settlingReveal) || snapshot.rest === true) glyphs.push({ glyph: '𝄐', relation: 'structural_rest', cause: 'Motion settles while the route history remains visible.' });
  const enabled = (!settled || settlingReveal) && snapshot.rest !== true && snapshot.reducedMotion !== true;
  const time = Number.isFinite(snapshot.motionTimeMs) && snapshot.motionTimeMs >= 0 ? snapshot.motionTimeMs : 0;
  const sourceLabel = outgoingSubmitted
    ? 'Selected work crossed the route; local-only work stayed here.'
    : 'Selected work waits here until you choose Run.';
  const providerLabel = transportFailure
    ? `${providerHttpStatus ? `HTTP ${providerHttpStatus}` : 'Provider transport failed'} · no usable AI answer returned`
    : responseObserved && held
      ? 'A provider reply arrived, but Loom held it from review.'
      : responseObserved
        ? 'A reply reached Loom and is represented by the return route.'
        : phase === 'pending'
          ? 'Waiting for the provider reply.'
          : outgoingSubmitted && held
            ? 'Waiting stopped before a reply was observed.'
            : 'No request has reached the AI receiver yet.';
  const providerShortLabel = transportFailure
    ? `Provider stopped${providerHttpStatus ? ` · HTTP ${providerHttpStatus}` : ''}`
    : responseObserved ? 'Reply observed' : phase === 'pending' ? 'Waiting for reply' : 'Nothing received yet';
  return freeze({
    schema: LOOM_LIVING_ROOM_SCHEMA, phase, outgoingSubmitted, responseObserved, held, settled,
    selectedCount, localCount, rulesCount, documents, reportedSourceCount, missingCount,
    failureReceiptObserved, providerHttpStatus, providerModel, providerFailureCode: failureCode,
    additionalMissingCount: Math.max(0, (missingCount ?? 0) - 8),
    source: { label: sourceLabel },
    provider: { state: transportFailure ? 'PROVIDER_FAILURE_OBSERVED' : responseObserved ? 'RESPONSE_OBSERVED' : 'UNOBSERVED', label: providerLabel, shortLabel: providerShortLabel },
    gate: { bindingVerified, blocked: held, label: held ? 'Route held' : bindingVerified ? 'Packet binding checked' : phase === 'checking' ? 'Checking packet binding' : 'Waiting for your Run' },
    glyphs, copy: { plain, auditor }, control,
    motion: { enabled, courierProgress: outgoingSubmitted ? (enabled && phase === 'pending' ? progress : 1) : 0,
      returnProgress: responseObserved ? (enabled && (phase === 'received' || settlingReveal) ? progress : 1) : 0,
      waitingPhase: enabled && phase === 'pending' ? (time % 6000) / 6000 : 0 },
    receipt: { requestId: short(packet.request_id, 120), eventAt: short(packet.at, 40), observationBasis: control.observationBasis, measurementOfHiddenState: false }
  });
}
