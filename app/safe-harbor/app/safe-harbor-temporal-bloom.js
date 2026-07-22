import {
  countersignEntrantAuthorshipBinding,
  validateGen3ShiExactMatch
} from './safe-harbor-gen3-evidence-contract.js';
import { stableCanonicalJson } from './safe-harbor-stylometry-v3.js';

export const TEMPORAL_BLOOM_SCHEMA = 'td613.safe-harbor.temporal-bloom/v1';
export const PROVENANCE_SVG_SCHEMA = 'td613.safe-harbor.pua-provenance-attestation-svg/v1';
export const STAGE3_PRESENTATION_SCHEMA = 'td613.safe-harbor.stage3-presentation/v1';

const LANES = Object.freeze(['future_self', 'past_self', 'higher_self']);
const LANE_LABELS = Object.freeze({
  future_self: 'Future Self',
  past_self: 'Past Self',
  higher_self: 'Higher Self'
});
const CLAIM_CEILING = 'Packet-scoped stylometric evidence, entrant custody assertion, and presentation integrity only; not civil identity, exclusive ownership, third-party attribution, or universal authorship proof.';
const REDUCED_OUTCOMES = new Set(['FAILED', 'CONTAMINATED', 'PROMPT-DOMINATED', 'IMITATION-COLLISION']);

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function isObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function words(text) {
  return String(text || '').trim().split(/\s+/u).filter(Boolean);
}

function escapeXml(value) {
  return String(value == null ? '' : value)
    .replace(/&/gu, '&amp;')
    .replace(/</gu, '&lt;')
    .replace(/>/gu, '&gt;')
    .replace(/"/gu, '&quot;')
    .replace(/'/gu, '&apos;');
}

function parsePacketText(text) {
  try {
    const parsed = JSON.parse(String(text || '').trim());
    return isObject(parsed) && parsed.schema_version === 'td613.safe-harbor.packet/v1' ? parsed : null;
  } catch {
    return null;
  }
}

export function qualitativeBloomState(wordCount) {
  const count = Math.max(0, Number(wordCount || 0));
  if (count === 0) return Object.freeze({ state: 'unopened', public_label: 'The lane is quiet.', ready_to_continue: false, mature: false });
  if (count < 40) return Object.freeze({ state: 'receiving', public_label: 'The message is being received.', ready_to_continue: false, mature: false });
  if (count < 120) return Object.freeze({ state: 'rooted', public_label: 'The lane has taken root.', ready_to_continue: true, mature: false });
  if (count < 240) return Object.freeze({ state: 'forming', public_label: 'The pattern is beginning to hold.', ready_to_continue: true, mature: false });
  if (count < 360) return Object.freeze({ state: 'deepening', public_label: 'The pattern is deepening without closing.', ready_to_continue: true, mature: false });
  return Object.freeze({ state: 'mature', public_label: 'The lane can support mature comparison.', ready_to_continue: true, mature: true });
}

export function buildTemporalBloomState(segments = {}) {
  const lanes = {};
  for (const lane of LANES) {
    const observed = words(segments[lane]).length;
    const qualitative = qualitativeBloomState(observed);
    lanes[lane] = {
      lane,
      observed_words_internal: observed,
      public_state: qualitative.state,
      public_label: qualitative.public_label,
      ready_to_continue: qualitative.ready_to_continue,
      mature: qualitative.mature
    };
  }
  const resolved = LANES.filter((lane) => lanes[lane].ready_to_continue).length;
  const mature = LANES.filter((lane) => lanes[lane].mature).length;
  return {
    schema_version: TEMPORAL_BLOOM_SCHEMA,
    public_counts_visible: false,
    raw_counts_exported_to_ui: false,
    reciprocal_recognition: 'The message is being received.',
    lanes,
    triad_state: mature === 3 ? 'mature-triad' : resolved === 3 ? 'triad-rooted' : resolved > 0 ? 'receiving-triad' : 'quiet-triad'
  };
}

function challengeOutcome(packet) {
  return packet?.authorship_evidence?.blind_custody_challenge?.results?.challenge_result
    || packet?.authorship_evidence?.blind_custody_challenge?.challenge_result
    || packet?.authorship_evidence?.authorship_maturity?.null_and_adversarial_posture?.control_receipt?.authority_reduction
    || null;
}

function imitationCollision(packet) {
  const outcome = challengeOutcome(packet);
  const direct = packet?.authorship_evidence?.blind_custody_challenge?.results?.imitation_collision;
  const control = packet?.authorship_evidence?.authorship_maturity?.null_and_adversarial_posture?.control_receipt?.imitation_collision;
  return outcome === 'IMITATION-COLLISION' || direct === true || control === true || control === 'present';
}

export function deriveAuthorityPresentation(packet = {}) {
  const outcome = challengeOutcome(packet);
  const collision = imitationCollision(packet);
  const reduced = collision || REDUCED_OUTCOMES.has(String(outcome || '').toUpperCase());
  const countersignature = packet?.binding_provenance?.entrant_authorship_binding?.countersignature?.status || 'unsigned';
  return {
    schema_version: STAGE3_PRESENTATION_SCHEMA,
    challenge_outcome: outcome,
    imitation_collision: collision,
    authority_reduced: reduced,
    authority_label: reduced ? 'AUTHORITY CLAIM REDUCED' : 'PACKET-SCOPED AUTHORITY',
    countersignature_state: countersignature,
    claim_ceiling: CLAIM_CEILING
  };
}

export function validateStage3ShiSurfaces(packet, surfaces = {}) {
  return validateGen3ShiExactMatch(packet, {
    domShi: Object.prototype.hasOwnProperty.call(surfaces, 'domShi') ? surfaces.domShi : packet?.issuance?.badge_number,
    svgShi: Object.prototype.hasOwnProperty.call(surfaces, 'svgShi') ? surfaces.svgShi : packet?.issuance?.badge_number
  });
}

export function buildAuthorityChronology(packet = {}) {
  const lineage = packet.temporal_lineage || {};
  const binding = packet?.binding_provenance?.entrant_authorship_binding || {};
  return [
    {
      authority_class: 'root namespace and covenant binding authority',
      timestamp: lineage?.root_binding_authority?.recorded_ts_utc || packet?.binding_provenance?.binding_event?.recorded_ts_utc || '2025-08-11T03:58:39Z'
    },
    {
      authority_class: 'first preserved operational badge-protocol specimen',
      timestamp: lineage?.badge_protocol_history?.recorded_date || '2025-10-17'
    },
    {
      authority_class: 'packet-specific credential authority',
      timestamp: lineage?.entrant_credential_authority?.recorded_ts_utc || packet?.intake?.ts_utc || packet?.created_at || null
    },
    {
      authority_class: 'packet-scoped custody and authorship-assertion authority',
      timestamp: binding?.countersignature?.signed_at_utc || null
    },
    {
      authority_class: 'presentation and integrity-attestation authority',
      timestamp: packet?.issuance?.assigned_at || packet?.created_at || null
    }
  ];
}

export function buildProvenanceSvgMetadata(packet = {}) {
  const shi = packet?.issuance?.badge_number || null;
  const binding = packet?.binding_provenance?.entrant_authorship_binding || {};
  const presentation = deriveAuthorityPresentation(packet);
  return {
    schema_version: PROVENANCE_SVG_SCHEMA,
    namespace_anchor: 'U+10D613',
    principal: 'tauric.diana.613',
    shi_number: shi,
    packet_hash_sha256: packet.packet_hash_sha256 || null,
    stylometric_fingerprint: packet?.issuance?.stylometric_fingerprint || null,
    stability_digest: packet?.authorship_evidence?.stability_receipt?.stability_digest || null,
    blind_challenge_precommitment_digest: binding?.entrant_credential?.blind_challenge_precommitment_digest || null,
    blind_challenge_result_digest: binding?.entrant_credential?.blind_challenge_result_digest || null,
    restoration_receipt_digest: binding?.entrant_credential?.restoration_receipt_digest || null,
    holdout_rank: packet?.authorship_evidence?.blind_custody_challenge?.results?.genuine_holdout_rank || null,
    nearest_impostor_margin: packet?.authorship_evidence?.blind_custody_challenge?.results?.separation_margin || null,
    imitation_collision: presentation.imitation_collision,
    authority_reduced: presentation.authority_reduced,
    countersignature_state: presentation.countersignature_state,
    countersignature_digest: binding?.countersignature?.signature_digest || null,
    authority_chronology: buildAuthorityChronology(packet),
    claim_ceiling: CLAIM_CEILING,
    issued_at_utc: packet?.issuance?.assigned_at || packet?.created_at || null,
    raw_text_included: false
  };
}

export function renderProvenanceSvg(packet = {}, options = {}) {
  const metadata = buildProvenanceSvgMetadata(packet);
  const shi = metadata.shi_number;
  const exact = validateStage3ShiSurfaces(packet, { domShi: options.domShi || shi, svgShi: shi });
  if (exact.status !== 'pass') {
    const error = new Error(`Stage 3 SVG export held: ${exact.reason}`);
    error.code = 'TD613_STAGE3_SHI_HOLD';
    error.details = exact;
    throw error;
  }
  const title = metadata.authority_reduced ? 'TD613 PUA Provenance Attestation — Reduced Authority' : 'TD613 PUA Provenance Attestation';
  const collisionLine = metadata.imitation_collision ? 'AI IMITATION COLLISION: PRESENT' : 'AI IMITATION COLLISION: ABSENT';
  const authorityLine = metadata.authority_reduced ? 'AUTHORITY CLAIM REDUCED' : 'PACKET-SCOPED AUTHORITY';
  const metadataJson = stableCanonicalJson(metadata);
  const lines = [
    `ENTRANT SHI: ${shi}`,
    `PACKET HASH: ${metadata.packet_hash_sha256 || 'unavailable'}`,
    `STABILITY DIGEST: ${metadata.stability_digest || 'unavailable'}`,
    collisionLine,
    `AUTHORSHIP ASSERTION: ${String(metadata.countersignature_state || 'unsigned').toUpperCase()}`,
    authorityLine,
    'INDEPENDENT IDENTITY ADJUDICATION: NOT CLAIMED'
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760" role="img" aria-labelledby="td613SvgTitle td613SvgDesc" data-td613-shi="${escapeXml(shi)}" data-td613-authority="${metadata.authority_reduced ? 'reduced' : 'packet-scoped'}">
  <title id="td613SvgTitle">${escapeXml(title)}</title>
  <desc id="td613SvgDesc">Packet-scoped TD613 provenance presentation. Civil identity and universal authorship are not claimed.</desc>
  <metadata id="td613-provenance-metadata">${escapeXml(metadataJson)}</metadata>
  <rect width="1200" height="760" rx="36" fill="#0b0d13"/>
  <rect x="30" y="30" width="1140" height="700" rx="28" fill="none" stroke="#d7c58b" stroke-width="2"/>
  <text x="80" y="120" fill="#f2e9cf" font-size="58" font-family="Georgia, serif">􍘓</text>
  <text x="160" y="108" fill="#f2e9cf" font-size="28" font-family="system-ui, sans-serif">TD613 · Tauric Diana 613</text>
  <text x="80" y="160" fill="#b9b39f" font-size="18" font-family="system-ui, sans-serif">PUA PROVENANCE ATTESTATION · PACKET-SCOPED</text>
  ${lines.map((line, index) => `<text x="80" y="${225 + (index * 54)}" fill="${metadata.authority_reduced && index === 5 ? '#f0b5a8' : '#f2e9cf'}" font-size="${index === 5 ? 24 : 20}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace">${escapeXml(line)}</text>`).join('\n  ')}
  <line x1="80" y1="620" x2="1120" y2="620" stroke="#4b4e56" stroke-width="1"/>
  <text x="80" y="660" fill="#b9b39f" font-size="16" font-family="system-ui, sans-serif">${escapeXml(CLAIM_CEILING)}</text>
  <text x="80" y="705" fill="#d7c58b" font-size="18" font-family="Georgia, serif">U+10D613 · Sealed ⟐</text>
</svg>`;
}

export async function countersignStage3Packet(packet = {}, options = {}) {
  const exact = validateStage3ShiSurfaces(packet, {
    domShi: options.domShi || packet?.issuance?.badge_number,
    svgShi: options.svgShi || packet?.issuance?.badge_number
  });
  if (exact.status !== 'pass') {
    return {
      status: 'hold',
      reason: exact.reason,
      packet: clone(packet),
      exact_match: exact
    };
  }
  const countersigned = await countersignEntrantAuthorshipBinding(packet, {
    signatureType: options.signatureType || 'entrant-declared-local-digest',
    signedAtUtc: options.signedAtUtc || new Date().toISOString()
  });
  return {
    status: countersigned?.binding_provenance?.entrant_authorship_binding?.countersignature?.status === 'countersigned' ? 'countersigned' : 'hold',
    reason: null,
    packet: countersigned,
    exact_match: validateStage3ShiSurfaces(countersigned, {
      domShi: options.domShi || countersigned?.issuance?.badge_number,
      svgShi: options.svgShi || countersigned?.issuance?.badge_number
    })
  };
}

function downloadText(filename, text, type) {
  const blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function laneFromUi() {
  if (document.getElementById('ingressStagePast')?.classList.contains('is-active')) return 'past_self';
  if (document.getElementById('ingressStageHigher')?.classList.contains('is-active')) return 'higher_self';
  if (document.getElementById('ingressStageSeal')?.classList.contains('is-active')) return 'seal';
  return 'future_self';
}

function sessionSegments() {
  try {
    const saved = JSON.parse(sessionStorage.getItem('td613.safe-harbor.session.v1') || 'null');
    const source = saved?.ingress?.segments || saved?.sealed?.segments || {};
    return Object.fromEntries(LANES.map((lane) => {
      const value = source[lane];
      return [lane, typeof value === 'string' ? value : value?.raw_text || ''];
    }));
  } catch {
    return { future_self: '', past_self: '', higher_self: '' };
  }
}

function ensureBloomUi() {
  if (document.getElementById('td613TemporalBloom')) return;
  const support = document.getElementById('ingressStepSupport');
  if (!support) return;
  const section = document.createElement('section');
  section.id = 'td613TemporalBloom';
  section.className = 'temporal-bloom';
  section.setAttribute('aria-labelledby', 'td613TemporalBloomTitle');
  section.innerHTML = `
    <div class="temporal-bloom-head">
      <div>
        <div class="surface-kicker">Temporal Bloom</div>
        <h3 id="td613TemporalBloomTitle">The message is being received.</h3>
      </div>
      <span class="surface-state" id="td613BloomTriadState">quiet</span>
    </div>
    <div class="temporal-bloom-lanes" role="list" aria-label="Qualitative lane maturity">
      ${LANES.map((lane) => `<div class="temporal-bloom-lane" role="listitem" data-bloom-lane="${lane}" data-state="unopened"><span class="bloom-dot" aria-hidden="true"></span><span><strong>${LANE_LABELS[lane]}</strong><small>The lane is quiet.</small></span></div>`).join('')}
    </div>
    <p class="temporal-bloom-recognition" id="td613BloomRecognition" aria-live="polite">No score is being demanded. The membrane is listening for enough structure to proceed.</p>`;
  support.insertAdjacentElement('afterend', section);
  document.body.classList.add('temporal-bloom-public');
  document.body.dataset.temporalBloomPublic = 'true';
}

function updateBloomUi() {
  ensureBloomUi();
  const segments = sessionSegments();
  const active = laneFromUi();
  const input = document.getElementById('ingressStepInput');
  if (active !== 'seal' && input) segments[active] = input.value || '';
  const bloom = buildTemporalBloomState(segments);
  for (const lane of LANES) {
    const node = document.querySelector(`[data-bloom-lane="${lane}"]`);
    if (!node) continue;
    node.dataset.state = bloom.lanes[lane].public_state;
    const small = node.querySelector('small');
    if (small) small.textContent = bloom.lanes[lane].public_label;
  }
  const triad = document.getElementById('td613BloomTriadState');
  if (triad) triad.textContent = bloom.triad_state.replace(/-/gu, ' ');
  const recognition = document.getElementById('td613BloomRecognition');
  const activeState = active === 'seal' ? null : bloom.lanes[active];
  if (recognition) recognition.textContent = active === 'seal'
    ? (bloom.triad_state === 'mature-triad' ? 'The triad can support mature comparison. Sealing remains your explicit act.' : 'The triad has been received. Its limits remain visible at the seal.')
    : activeState.public_label;
  const continueButton = document.getElementById('ingressContinue');
  if (continueButton) {
    const show = active === 'seal' || Boolean(activeState?.ready_to_continue);
    continueButton.hidden = !show;
    continueButton.setAttribute('aria-hidden', show ? 'false' : 'true');
  }
}

function ensureProvenanceUi() {
  if (document.getElementById('td613Stage3Presentation')) return;
  const mint = document.getElementById('mintedIssuanceSection');
  if (!mint) return;
  const section = document.createElement('section');
  section.id = 'td613Stage3Presentation';
  section.className = 'stage3-presentation';
  section.setAttribute('aria-labelledby', 'td613Stage3Title');
  section.innerHTML = `
    <div class="stage3-head">
      <div><div class="surface-kicker">Gen3 provenance</div><h3 id="td613Stage3Title">Packet-scoped authorship and custody</h3></div>
      <span class="surface-state" id="td613Stage3Authority">awaiting packet</span>
    </div>
    <div class="stage3-grid">
      <div><span>SHI exact match</span><strong id="td613Stage3ShiState">awaiting packet</strong></div>
      <div><span>Countersignature</span><strong id="td613Stage3SignatureState">unsigned</strong></div>
      <div><span>Imitation collision</span><strong id="td613Stage3CollisionState">unavailable</strong></div>
      <div><span>Claim ceiling</span><strong>packet-scoped</strong></div>
    </div>
    <ol class="stage3-chronology" id="td613Stage3Chronology" aria-label="Authority chronology"></ol>
    <p class="stage3-note" id="td613Stage3Note" aria-live="polite">Unsigned assertions remain visibly unsigned. The glyph anchors provenance; it does not independently confer authorship.</p>
    <div class="button-grid compact">
      <button class="control" id="td613Countersign" type="button" disabled>Countersign packet</button>
      <button class="control secondary" id="td613DownloadSvg" type="button" disabled>Download attestation SVG</button>
      <button class="control secondary" id="td613DownloadSignedPacket" type="button" disabled>Download countersigned packet</button>
    </div>
    <div id="td613ProvenanceSvgMount" class="stage3-svg-mount" aria-hidden="true"></div>`;
  mint.insertAdjacentElement('afterend', section);
}

let stage3Packet = null;

function packetFromPreview() {
  return parsePacketText(document.getElementById('packetPreview')?.textContent);
}

function renderStage3Packet(packet) {
  ensureProvenanceUi();
  stage3Packet = packet ? clone(packet) : null;
  const section = document.getElementById('td613Stage3Presentation');
  const countersign = document.getElementById('td613Countersign');
  const svgButton = document.getElementById('td613DownloadSvg');
  const packetButton = document.getElementById('td613DownloadSignedPacket');
  if (!packet || !packet.issuance?.badge_number) {
    section?.removeAttribute('data-td613-shi');
    if (countersign) countersign.disabled = true;
    if (svgButton) svgButton.disabled = true;
    if (packetButton) packetButton.disabled = true;
    return;
  }
  const shi = packet.issuance.badge_number;
  section.dataset.td613Shi = shi;
  const exact = validateStage3ShiSurfaces(packet, { domShi: shi, svgShi: shi });
  const presentation = deriveAuthorityPresentation(packet);
  const shiState = document.getElementById('td613Stage3ShiState');
  const sigState = document.getElementById('td613Stage3SignatureState');
  const collisionState = document.getElementById('td613Stage3CollisionState');
  const authority = document.getElementById('td613Stage3Authority');
  const note = document.getElementById('td613Stage3Note');
  if (shiState) shiState.textContent = exact.status === 'pass' ? 'exact match' : `export hold: ${exact.reason}`;
  if (sigState) sigState.textContent = presentation.countersignature_state;
  if (collisionState) collisionState.textContent = presentation.imitation_collision ? 'PRESENT' : 'absent';
  if (authority) authority.textContent = presentation.authority_label.toLowerCase();
  section.dataset.authority = presentation.authority_reduced ? 'reduced' : 'packet-scoped';
  if (note) note.textContent = presentation.authority_reduced
    ? 'AI IMITATION COLLISION: PRESENT. AUTHORITY CLAIM REDUCED. The adverse result remains part of the packet.'
    : (presentation.countersignature_state === 'countersigned' ? 'The entrant countersignature binds a packet-scoped custody assertion. Independent identity adjudication remains unclaimed.' : 'Unsigned assertions remain visibly unsigned. The glyph anchors provenance; it does not independently confer authorship.');
  const chronology = document.getElementById('td613Stage3Chronology');
  if (chronology) chronology.innerHTML = buildAuthorityChronology(packet).map((entry) => `<li><span>${escapeXml(entry.authority_class)}</span><strong>${escapeXml(entry.timestamp || 'not activated')}</strong></li>`).join('');
  const enable = exact.status === 'pass';
  if (countersign) countersign.disabled = !enable || presentation.countersignature_state === 'countersigned';
  if (svgButton) svgButton.disabled = !enable;
  if (packetButton) packetButton.disabled = !enable || presentation.countersignature_state !== 'countersigned';
  if (enable) {
    const svg = renderProvenanceSvg(packet, { domShi: shi });
    const mount = document.getElementById('td613ProvenanceSvgMount');
    if (mount) mount.innerHTML = svg;
  }
}

function bindStage3Actions() {
  ensureProvenanceUi();
  document.getElementById('td613Countersign')?.addEventListener('click', async () => {
    if (!stage3Packet) return;
    const result = await countersignStage3Packet(stage3Packet, {
      domShi: document.getElementById('td613Stage3Presentation')?.dataset.td613Shi,
      svgShi: stage3Packet?.issuance?.badge_number
    });
    if (result.status !== 'countersigned') {
      const note = document.getElementById('td613Stage3Note');
      if (note) note.textContent = `Countersignature held: ${result.reason || 'packet conflict'}.`;
      return;
    }
    const preview = document.getElementById('packetPreview');
    if (preview) preview.textContent = JSON.stringify(result.packet, null, 2);
    const forensic = document.getElementById('forensicSchemaPreview');
    if (forensic) forensic.textContent = JSON.stringify(result.packet, null, 2);
    renderStage3Packet(result.packet);
    window.dispatchEvent(new CustomEvent('td613:safe-harbor:stage3-countersigned', { detail: { shi_number: result.packet?.issuance?.badge_number } }));
  });
  document.getElementById('td613DownloadSvg')?.addEventListener('click', () => {
    if (!stage3Packet) return;
    try {
      const svg = renderProvenanceSvg(stage3Packet, { domShi: document.getElementById('td613Stage3Presentation')?.dataset.td613Shi });
      downloadText(`TD613_PUA_Provenance_${stage3Packet.issuance.badge_number}.svg`, svg, 'image/svg+xml;charset=utf-8');
    } catch (error) {
      const note = document.getElementById('td613Stage3Note');
      if (note) note.textContent = error.message;
    }
  });
  document.getElementById('td613DownloadSignedPacket')?.addEventListener('click', () => {
    if (!stage3Packet) return;
    downloadText(`TD613_Safe_Harbor_${stage3Packet.issuance.badge_number}_countersigned.json`, `${JSON.stringify(stage3Packet, null, 2)}\n`, 'application/json;charset=utf-8');
  });
}

function bootStage3() {
  ensureBloomUi();
  ensureProvenanceUi();
  updateBloomUi();
  bindStage3Actions();
  const input = document.getElementById('ingressStepInput');
  input?.addEventListener('input', updateBloomUi);
  ['ingressStageFuture', 'ingressStagePast', 'ingressStageHigher', 'ingressStageSeal', 'ingressBack', 'ingressContinue'].forEach((id) => {
    document.getElementById(id)?.addEventListener('click', () => setTimeout(updateBloomUi, 0));
  });
  const preview = document.getElementById('packetPreview');
  if (preview) {
    const refresh = () => renderStage3Packet(packetFromPreview());
    new MutationObserver(refresh).observe(preview, { childList: true, characterData: true, subtree: true });
    refresh();
  }
  window.TD613_SAFE_HARBOR_STAGE3 = Object.freeze({
    TEMPORAL_BLOOM_SCHEMA,
    PROVENANCE_SVG_SCHEMA,
    STAGE3_PRESENTATION_SCHEMA,
    qualitativeBloomState,
    buildTemporalBloomState,
    deriveAuthorityPresentation,
    validateStage3ShiSurfaces,
    buildAuthorityChronology,
    buildProvenanceSvgMetadata,
    renderProvenanceSvg,
    countersignStage3Packet
  });
  window.dispatchEvent(new CustomEvent('td613:safe-harbor:stage3-ready', { detail: { schema_version: STAGE3_PRESENTATION_SCHEMA } }));
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootStage3, { once: true });
  else bootStage3();
}
