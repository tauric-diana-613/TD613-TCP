const params = new URLSearchParams(location.search);
const recipientId = params.get('recipient') || '';
const destinationId = params.get('destination') || '';
const status = document.getElementById('status');
document.getElementById('identity').textContent = `${destinationId} → ${recipientId}`;

function announceReady() {
  window.parent.postMessage({
    type: 'TD613_ASH_RECIPIENT_READY',
    recipient_id: recipientId,
    destination_id: destinationId
  }, location.origin);
}

window.addEventListener('message', event => {
  if (event.origin !== location.origin) return;
  const packet = event.data;
  if (packet?.type === 'TD613_ASH_RECIPIENT_PING') {
    announceReady();
    return;
  }
  const port = event.ports?.[0];
  if (!port || packet?.type !== 'TD613_ASH_DESTINATION_HANDOFF') return;
  const references = Array.isArray(packet.reference_ids) ? [...new Set(packet.reference_ids.map(String))].sort() : [];
  const accepted = packet.destination_id === destinationId
    && packet.recipient_id === recipientId
    && /^sha256:[0-9a-f]{64}$/.test(packet.plan_digest || '')
    && references.length > 0
    && packet.raw_body_present === false
    && packet.raw_corpus_present === false;
  status.textContent = accepted ? `ACCEPTED · ${references.length} bounded reference(s).` : 'REFUSED · exact recipient or scope contract failed.';
  port.postMessage({
    type: 'TD613_ASH_DESTINATION_RECEIPT_OBSERVATION',
    accepted,
    posture: accepted ? 'ACCEPTED' : 'REFUSED',
    destination_id: destinationId,
    recipient_id: recipientId,
    plan_digest: packet.plan_digest || null,
    received_reference_ids: accepted ? references : [],
    raw_body_received: false,
    raw_corpus_received: false,
    external_deletion_proven: false,
    reuse_authorized: false,
    truth_inferred: false
  });
  port.close();
});

announceReady();
