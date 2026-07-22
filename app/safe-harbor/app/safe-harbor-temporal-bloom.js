import {
  TEMPORAL_MATURE_WORDS,
  buildTemporalBloomPresentation,
  buildProvenancePresentation,
  buildAttestationMetadata,
  validateAttestationMetadata,
  presentationContainsRawText
} from './safe-harbor-gen3-presentation-core.js';

const STATE_EVENT = 'td613:safe-harbor:stage3-state';
const REQUEST_EVENT = 'td613:safe-harbor:stage3-request-state';
const COUNTERSIGN_REQUEST_EVENT = 'td613:safe-harbor:countersign-request';
const COUNTERSIGN_RESULT_EVENT = 'td613:safe-harbor:countersign-result';
const LANE_ORDER = Object.freeze(['future_self', 'past_self', 'higher_self']);
const PRESENTATION_TS_KEY = 'td613.safe-harbor.stage3.presentation-authority.v1';

let latestState = null;
let latestBloom = null;
let latestPresentation = null;

const byId = (id) => document.getElementById(id);

function text(id, value) {
  const node = byId(id);
  if (node) node.textContent = value == null || value === '' ? 'unavailable' : String(value);
}

function stablePresentationTimestamp(packetHash) {
  const key = String(packetHash || 'unissued');
  try {
    const saved = JSON.parse(sessionStorage.getItem(PRESENTATION_TS_KEY) || '{}');
    if (saved && saved.packet_hash === key && saved.timestamp) return saved.timestamp;
    const timestamp = new Date().toISOString();
    sessionStorage.setItem(PRESENTATION_TS_KEY, JSON.stringify({ packet_hash: key, timestamp }));
    return timestamp;
  } catch (error) {
    return new Date().toISOString();
  }
}

function publicMode() {
  return !latestState || latestState.public_mode !== false;
}

function laneCount(lane) {
  const value = latestState && latestState.lane_counts ? latestState.lane_counts[lane] : 0;
  return Math.max(0, Math.floor(Number(value) || 0));
}

function laneMature(lane) {
  return laneCount(lane) >= TEMPORAL_MATURE_WORDS;
}

function currentLane() {
  return latestState && LANE_ORDER.includes(latestState.current_lane)
    ? latestState.current_lane
    : 'future_self';
}

function requestedStageIndex(target) {
  if (!target) return null;
  const id = target.id;
  if (id === 'ingressStageFuture') return 0;
  if (id === 'ingressStagePast') return 1;
  if (id === 'ingressStageHigher') return 2;
  if (id === 'ingressStageSeal') return 3;
  return null;
}

function priorLanesMature(index) {
  if (index <= 0) return true;
  return LANE_ORDER.slice(0, Math.min(index, LANE_ORDER.length)).every(laneMature);
}

function holdNavigation(message) {
  const recognition = byId('temporalBloomRecognition');
  if (recognition) recognition.textContent = message;
  const shell = byId('temporalBloom');
  if (shell) shell.dataset.held = 'true';
}

function guardClick(event) {
  if (!publicMode()) return;
  const target = event.target && event.target.closest
    ? event.target.closest('#ingressContinue,#ingressStageFuture,#ingressStagePast,#ingressStageHigher,#ingressStageSeal')
    : null;
  if (!target) return;
  if (target.id === 'ingressContinue' && !laneMature(currentLane())) {
    event.preventDefault();
    event.stopImmediatePropagation();
    holdNavigation('The page is still receiving this message. Continue appears when the lane can support recurrence.');
    return;
  }
  const index = requestedStageIndex(target);
  if (index !== null && !priorLanesMature(index)) {
    event.preventDefault();
    event.stopImmediatePropagation();
    holdNavigation('The next page remains quiet until the earlier message can carry on its own.');
  }
}

function guardKeyboard(event) {
  if (!publicMode()) return;
  if (event.target?.id !== 'ingressStepInput') return;
  if (event.key !== 'Enter' || (!event.ctrlKey && !event.metaKey)) return;
  if (laneMature(currentLane())) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  holdNavigation('The page is still receiving this message. Continue appears when the lane can support recurrence.');
}

function renderBloom() {
  latestBloom = buildTemporalBloomPresentation(latestState || {});
  const publicState = latestBloom.public_mode;
  document.body.dataset.temporalPublic = publicState ? 'true' : 'false';
  document.body.dataset.temporalBloom = 'gen3';

  const current = latestBloom.current;
  const shell = byId('temporalBloom');
  if (shell) {
    shell.dataset.lane = current.lane;
    shell.dataset.band = current.band;
    shell.dataset.color = current.color_token;
    shell.dataset.mature = current.mature ? 'true' : 'false';
    shell.dataset.held = 'false';
  }
  const line = byId('temporalBloomLine');
  if (line) {
    line.dataset.band = current.band;
    line.dataset.color = current.color_token;
    line.setAttribute('aria-hidden', 'true');
  }
  text('temporalBloomRecognition', current.recognition_copy);
  text('ingressStepMeta', current.recognition_copy);
  text('ingressStepState', current.mature ? 'message received' : 'receiving');

  const continueButton = byId('ingressContinue');
  if (continueButton && latestState?.current_lane) {
    const hide = publicState && !current.mature;
    continueButton.hidden = hide;
    continueButton.disabled = hide || Boolean(latestState.surface_open);
    continueButton.setAttribute('aria-hidden', hide ? 'true' : 'false');
  }

  const summaries = {
    future_self: 'ingressSummaryFutureSelf',
    past_self: 'ingressSummaryPastSelf',
    higher_self: 'ingressSummaryHigherSelf'
  };
  for (const [lane, id] of Object.entries(summaries)) text(id, latestBloom.lanes[lane].recognition_copy);

  const progressPill = byId('ingressProgressPill');
  if (progressPill && publicState) progressPill.textContent = 'temporal field';
  const resolved = byId('ingressResolvedReadout');
  if (resolved && publicState) resolved.textContent = 'qualitative recognition';
  const threshold = byId('ingressThresholdReadout');
  if (threshold && publicState) threshold.textContent = 'counts held behind operator boundary';
}

function setDataset(node, key, value) {
  if (!node) return;
  if (value === undefined || value === null || value === '') delete node.dataset[key];
  else node.dataset[key] = String(value);
}

function renderProvenance() {
  const panel = byId('stage3ProvenancePanel');
  if (!panel) return;
  const packet = latestState?.packet_summary || null;
  if (!packet || !packet.shi_number) {
    panel.dataset.state = 'awaiting-packet';
    text('stage3Shi', 'not issued');
    text('stage3Countersignature', 'UNSIGNED');
    text('stage3AuthorityReduction', 'packet evidence unavailable');
    text('stage3ExportState', 'SVG export held until packet issuance');
    const button = byId('stage3CountersignButton');
    if (button) button.disabled = true;
    return;
  }

  const presentationTimestamp = stablePresentationTimestamp(packet.packet_hash_sha256);
  latestPresentation = buildProvenancePresentation(packet, packet.dom_shi || packet.shi_number, presentationTimestamp);
  if (presentationContainsRawText(latestPresentation)) throw new Error('Stage 3 presentation attempted to expose raw text.');
  const metadata = buildAttestationMetadata(latestPresentation);
  const attestation = validateAttestationMetadata(metadata);
  const chronology = latestPresentation.chronology;
  const countersignatureStatus = String(latestPresentation.countersignature?.status || 'unsigned').toUpperCase();
  const reduced = latestPresentation.authority_reduction.authority_claim_reduced;

  panel.dataset.state = attestation.status === 'pass' ? (reduced ? 'authority-reduced' : 'packet-bound') : 'export-hold';
  setDataset(panel, 'td613Stage3Provenance', 'true');
  setDataset(panel, 'td613Shi', latestPresentation.shi_number);
  setDataset(panel, 'td613PacketShi', packet.shi_number);
  setDataset(panel, 'td613CanonShi', packet.canon_shi);
  setDataset(panel, 'td613BindingShi', packet.binding_shi);
  setDataset(panel, 'td613PacketHash', packet.packet_hash_sha256);
  setDataset(panel, 'td613StylometricFingerprint', packet.stylometric_fingerprint);
  setDataset(panel, 'td613StabilityDigest', packet.stability_digest);
  setDataset(panel, 'td613BlindPrecommitmentDigest', packet.blind_challenge_precommitment_digest);
  setDataset(panel, 'td613BlindResultDigest', packet.blind_challenge_result_digest);
  setDataset(panel, 'td613RestorationDigest', packet.restoration_receipt_digest);
  setDataset(panel, 'td613HoldoutRank', packet.genuine_holdout_rank);
  setDataset(panel, 'td613NearestImpostorMargin', packet.nearest_impostor_margin);
  setDataset(panel, 'td613ImitationCollision', reduced && latestPresentation.authority_reduction.imitation_collision_present ? 'PRESENT' : 'ABSENT');
  setDataset(panel, 'td613CountersignatureStatus', countersignatureStatus);
  setDataset(panel, 'td613CountersignatureDigest', latestPresentation.countersignature?.signature_digest);
  setDataset(panel, 'td613BindingTimestamp', chronology.binding_authority.timestamp);
  setDataset(panel, 'td613HistoricalDate', chronology.badge_protocol_history.date);
  setDataset(panel, 'td613HistoricalExample', chronology.badge_protocol_history.historical_example);
  setDataset(panel, 'td613EntrantIntakeTimestamp', chronology.entrant_credential_authority.timestamp);
  setDataset(panel, 'td613CountersignatureTimestamp', chronology.entrant_countersignature_authority.timestamp);
  setDataset(panel, 'td613PresentationTimestamp', chronology.presentation_authority.timestamp);
  setDataset(panel, 'td613ClaimCeiling', latestPresentation.claim_ceiling);
  setDataset(panel, 'td613AuthorityReduced', reduced ? 'true' : 'false');
  setDataset(panel, 'td613ShiExactMatch', latestPresentation.shi_exact_match.status);

  const principal = document.querySelector('[data-td613-principal="true"]');
  setDataset(principal, 'td613Shi', latestPresentation.shi_number);
  setDataset(principal, 'td613PacketHash', packet.packet_hash_sha256);
  setDataset(principal, 'td613StylometricFingerprint', packet.stylometric_fingerprint);

  text('stage3Principal', latestPresentation.principal);
  text('stage3Shi', latestPresentation.shi_number);
  text('stage3Countersignature', countersignatureStatus);
  text('stage3BindingAuthority', chronology.binding_authority.timestamp);
  text('stage3HistoricalAuthority', `payload 5 · ${chronology.badge_protocol_history.date}`);
  text('stage3EntrantIntake', chronology.entrant_credential_authority.timestamp || 'unavailable');
  text('stage3CountersignatureAuthority', chronology.entrant_countersignature_authority.timestamp || 'UNSIGNED');
  text('stage3PresentationAuthority', chronology.presentation_authority.timestamp);
  text('stage3ClaimCeiling', latestPresentation.claim_ceiling);
  text('stage3AuthorityReduction', reduced
    ? `${latestPresentation.authority_reduction.imitation_collision_present ? 'AI IMITATION COLLISION: PRESENT · ' : ''}AUTHORITY CLAIM REDUCED`
    : 'PACKET-BOUND AUTHORITY · INDEPENDENT IDENTITY ADJUDICATION NOT CLAIMED');
  text('stage3ExportState', attestation.status === 'pass'
    ? 'SVG inputs reconciled'
    : `SVG EXPORT HOLD · ${attestation.reason}`);

  const button = byId('stage3CountersignButton');
  if (button) {
    const signed = countersignatureStatus === 'COUNTERSIGNED';
    button.disabled = signed || latestPresentation.shi_exact_match.status !== 'pass';
    button.textContent = signed ? 'Authorship Assertion Countersigned' : 'Countersign Packet-Scoped Authorship & Custody';
  }
}

function renderState(detail) {
  latestState = detail && typeof detail === 'object' ? detail : {};
  renderBloom();
  renderProvenance();
}

function requestCountersignature() {
  if (!latestPresentation || latestPresentation.shi_exact_match.status !== 'pass') return;
  window.dispatchEvent(new CustomEvent(COUNTERSIGN_REQUEST_EVENT, {
    detail: {
      signatureType: 'entrant-declared-local-digest',
      signedAtUtc: new Date().toISOString(),
      userGesture: true
    }
  }));
}

window.addEventListener(STATE_EVENT, (event) => renderState(event.detail));
window.addEventListener(COUNTERSIGN_RESULT_EVENT, (event) => {
  const result = event.detail || {};
  text('stage3ExportState', result.status === 'pass' ? 'Countersignature attached; SVG inputs refreshing.' : `COUNTERSIGNATURE HOLD · ${result.reason || 'unavailable'}`);
});
document.addEventListener('click', guardClick, true);
document.addEventListener('keydown', guardKeyboard, true);
byId('stage3CountersignButton')?.addEventListener('click', requestCountersignature);

window.TD613_SAFE_HARBOR_TEMPORAL_BLOOM = Object.freeze({
  schema_version: 'td613.safe-harbor.temporal-bloom-ui/v1',
  threshold_authority: 'safe-harbor-main-counted-state',
  independent_tokenization_performed: false,
  telemetry_collected: false,
  getLatestPresentation: () => latestPresentation ? JSON.parse(JSON.stringify(latestPresentation)) : null
});

window.dispatchEvent(new CustomEvent(REQUEST_EVENT));
