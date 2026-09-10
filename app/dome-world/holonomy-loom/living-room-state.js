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

export function projectLivingRoomState(packet, snapshot = {}) {
  const progress = snapshot.progress ?? 1;
  const field = projectLoomRequestField(packet, progress);
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
  const control = {
    phase, outgoingSubmitted, responseObserved, held, settled, bindingVerified,
    selectedCount, localCount, rulesCount, reportedSourceCount, missingCount,
    releaseState: held ? 'HELD' : phase === 'completed' ? 'ADMITTED_FOR_HUMAN_REVIEW' : 'UNAVAILABLE',
    providerActivity: 'UNKNOWN', observationBasis: 'CLIENT_ROUTE_EVENTS_AND_MODEL_REPORTED_FIELDS'
  };
  const selected = `${selectedCount} selected ${selectedCount === 1 ? 'document' : 'documents'}`;
  const retained = `${localCount} ${localCount === 1 ? 'file stays' : 'files stay'} in this tab`;
  const plain = {
    prepared: { now: 'Pack the work. Keep the private pieces here.', why: `${selected} will travel with your task and ${rulesCount} rules; ${retained}.`, next: 'Choose Run when your packet is ready.' },
    checking: { now: 'Checking the packet before it leaves.', why: 'Loom checks your selected work and binds its rules to this task.', next: 'The route opens only after these local checks pass.' },
    pending: { now: 'Your packet has entered the AI route.', why: `The task, ${selected} and its rules were submitted. ${retained}.`, next: 'Waiting for a reply. The AI’s internal activity remains unknown.' },
    received: { now: 'A reply came back. Loom is checking it.', why: 'The returning answer must pass the local rules and source checks before review.', next: 'Read the answer after the return check finishes.' },
    completed: { now: 'The answer is ready for you to inspect.', why: missingCount ? `The AI named ${missingCount} open ${missingCount === 1 ? 'question' : 'questions'}. The gaps stay visible beside the returned work.` : 'The returned work passed the local admission checks. Your private files stayed here.', next: 'Read the work, then choose whether to copy it or continue in another workspace.' },
    held: { now: 'This route stopped.', why: responseObserved ? 'A response arrived, but this attempt did not finish admission. The answer stays held.' : outgoingSubmitted ? 'The packet was already submitted. Stopping the wait cannot pull it back.' : 'This attempt stopped before the packet was submitted.', next: 'Read the reason below. Your next attempt needs your choice.' }
  }[phase];
  const auditor = {
    now: `${phase.toUpperCase()} · ${control.releaseState}`,
    why: `${outgoingSubmitted ? 'Client submission observed' : 'Client submission unobserved'}; ${responseObserved ? 'response body observed' : 'response unobserved'}; ${bindingVerified ? 'local AIA binding verified' : 'local AIA binding unverified'}.`,
    next: `${reportedSourceCount === null ? 'Source use unreported' : `${reportedSourceCount} source references reported by the model`}; ${missingCount === null ? 'missingness unreported' : `${missingCount} missing-information items reported by the model`}. Internal AI activity remains unknown.`
  };
  const glyphs = [{ glyph: 'à', relation: 'gathering', cause: 'The task, selected documents and rules form one outgoing packet.' }];
  if (localCount) glyphs.push({ glyph: 'cōl', relation: 'protected_continuity', cause: 'Unselected files remain outside this outgoing packet.' });
  if (outgoingSubmitted) glyphs.push({ glyph: '出', relation: 'release', cause: 'The browser submitted the selected packet to the runtime route; provider receipt is a separate observation.' });
  if ((settled && !settlingReveal) || snapshot.rest === true) glyphs.push({ glyph: '𝄐', relation: 'structural_rest', cause: 'Motion settles while the route history remains visible.' });
  const enabled = (!settled || settlingReveal) && snapshot.rest !== true && snapshot.reducedMotion !== true;
  const time = Number.isFinite(snapshot.motionTimeMs) && snapshot.motionTimeMs >= 0 ? snapshot.motionTimeMs : 0;
  return freeze({
    schema: LOOM_LIVING_ROOM_SCHEMA, phase, outgoingSubmitted, responseObserved, held, settled,
    selectedCount, localCount, rulesCount, documents, reportedSourceCount, missingCount,
    additionalMissingCount: Math.max(0, (missingCount ?? 0) - 8),
    provider: { state: responseObserved ? 'RESPONSE_OBSERVED' : 'UNOBSERVED', label: responseObserved ? 'A response reached this tab' : !outgoingSubmitted ? 'AI route has not been called' : held ? 'Waiting stopped · AI activity unknown' : 'Waiting for a reply · AI activity unknown' },
    gate: { bindingVerified, blocked: held, label: held ? 'Route held' : bindingVerified ? 'Packet binding checked' : phase === 'checking' ? 'Checking packet binding' : 'Waiting for your Run' },
    glyphs, copy: { plain, auditor }, control,
    motion: { enabled, courierProgress: outgoingSubmitted ? (enabled && phase === 'pending' ? progress : 1) : 0,
      returnProgress: responseObserved ? (enabled && (phase === 'received' || settlingReveal) ? progress : 1) : 0,
      waitingPhase: enabled && phase === 'pending' ? (time % 6000) / 6000 : 0 },
    receipt: { requestId: short(packet.request_id, 120), eventAt: short(packet.at, 40), observationBasis: control.observationBasis, measurementOfHiddenState: false }
  });
}
