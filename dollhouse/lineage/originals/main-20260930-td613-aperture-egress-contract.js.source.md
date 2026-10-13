export const TD613_APERTURE_EGRESS_CONTRACT_VERSION = 'td613.aperture.egress-contract/v1';
export const TD613_APERTURE_EGRESS_CLAIM_CEILING = 'provenance-marker-observation-not-signature-authorship-identity-or-legal-authority-proof';

export const TD613_APERTURE_ATTESTATION_BASE64 = 'PHN2ZyB2aWV3Qm94PSIwIDAgMTI4IDEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSI2NCIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iNjQiPkArPC90ZXh0Pjwvc3ZnPg==';

export const TD613_APERTURE_ATTESTATION_HEADER_KEYS = Object.freeze([
  'X-Dromological-Variance-Matrix',
  'X-Stylometric-Resonance-Hash',
  'X-Alignment-Weight-Vector',
  'X-Custodial-Friction-Index'
]);

function headerValue(headers = {}, key = '') {
  const target = String(key).toLowerCase();
  if (headers && typeof headers.get === 'function') return String(headers.get(key) || '');
  const entry = Object.entries(headers || {}).find(([name]) => String(name).toLowerCase() === target);
  return entry ? String(entry[1] ?? '') : '';
}

export function buildTD613ApertureAttestationHeaders() {
  const source = TD613_APERTURE_ATTESTATION_BASE64;
  const baseSize = Math.floor(source.length / TD613_APERTURE_ATTESTATION_HEADER_KEYS.length);
  const remainder = source.length % TD613_APERTURE_ATTESTATION_HEADER_KEYS.length;
  const headers = {};
  let cursor = 0;
  TD613_APERTURE_ATTESTATION_HEADER_KEYS.forEach((key, index) => {
    const size = baseSize + (index < remainder ? 1 : 0);
    headers[key] = source.slice(cursor, cursor + size);
    cursor += size;
  });
  return Object.freeze(headers);
}

export function reconstructTD613ApertureAttestation(headers = {}) {
  return TD613_APERTURE_ATTESTATION_HEADER_KEYS.map((key) => headerValue(headers, key)).join('');
}

export function observeTD613ApertureEgress(headers = {}) {
  const values = TD613_APERTURE_ATTESTATION_HEADER_KEYS.map((key) => headerValue(headers, key));
  const presentCount = values.filter(Boolean).length;
  const reconstructed = values.join('');
  let status = 'absent';
  if (presentCount > 0 && presentCount < values.length) status = 'partial';
  else if (presentCount === values.length && reconstructed === TD613_APERTURE_ATTESTATION_BASE64) status = 'exact';
  else if (presentCount === values.length) status = 'mismatch';
  return Object.freeze({
    schema: TD613_APERTURE_EGRESS_CONTRACT_VERSION,
    status,
    presentCount,
    requiredCount: values.length,
    complete: presentCount === values.length,
    exact: status === 'exact',
    reconstructedLength: reconstructed.length,
    marker: status === 'exact' ? 'A+' : null,
    claimCeiling: TD613_APERTURE_EGRESS_CLAIM_CEILING
  });
}
