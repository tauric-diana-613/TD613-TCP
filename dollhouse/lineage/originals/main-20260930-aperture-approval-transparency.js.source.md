const ROUTE_SEAL_STATES = new Set(['seal_eligible', 'seal-eligible', 'approved']);
const BLOCKED_SOURCE_CONTEXTS = new Set(['private_text_unknown_consent', 'unknown_private', 'private_unknown']);
const BLOCKED_CONSENT_STATES = new Set(['unknown', 'partial', 'missing', 'unconfirmed']);
const BLOCKED_CLAIM_CEILINGS = new Set(['blocked', 'unknown', 'missing']);

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeKey(value = '') {
  return String(value || '').trim().toLowerCase().replace(/[-\s]+/g, '_');
}

function uniqueStrings(values = []) {
  return [...new Set(asArray(values).map((value) => String(value || '').trim()).filter(Boolean))];
}

function firstCandidate(packet = {}) {
  return packet.approvedCandidate ||
    packet.approved_candidate ||
    packet.selectedCandidate ||
    packet.selected_candidate ||
    packet.selectedRoute?.candidate ||
    packet.selected_route?.candidate ||
    asArray(packet.ruptureCandidates || packet.rupture_candidates || packet.candidates)[0] ||
    null;
}

function candidateLabel(candidate = null) {
  if (!candidate) return null;
  if (typeof candidate === 'string') return candidate;
  return candidate.id ||
    candidate.candidate_id ||
    candidate.class ||
    candidate.rupture_class ||
    candidate.name ||
    candidate.candidate_statement ||
    candidate.statement ||
    'candidate';
}

function resolveHumanReclosure(packet = {}) {
  const human = packet.humanReclosure || packet.human_reclosure || {};
  const confirmed = Boolean(
    packet.humanReclosed ||
    packet.human_reclosed ||
    human.confirmed ||
    human.operator_confirmed_route ||
    human.operatorConfirmedRoute ||
    human.operator_selected_route ||
    (human.required === false && human.operator_selected_route !== false)
  );

  return Object.freeze({
    required: human.required !== false,
    confirmed,
    operatorConfirmedRoute: Boolean(human.operator_confirmed_route || human.operatorConfirmedRoute || human.operator_selected_route),
    operatorConfirmedClaimCeiling: Boolean(human.operator_confirmed_claim_ceiling || human.operatorConfirmedClaimCeiling),
    rejectedRoutesVisible: human.rejected_routes_visible !== false && human.rejectedRoutesVisible !== false
  });
}

function resolveHardStops(packet = {}) {
  return uniqueStrings([
    ...asArray(packet.hardStops || packet.hard_stops),
    ...asArray(packet.recaptureGuard?.hardStops || packet.recapture_guard?.hard_stops),
    ...asArray(packet.approvalDiagnostics?.hardStops || packet.approval_diagnostics?.hard_stops)
  ]);
}

function resolveBlockers({
  candidate,
  routeState,
  hardStops,
  humanReclosure,
  sourceContext,
  consentStatus,
  claimCeiling
}) {
  const blockers = [];
  if (!candidate) blockers.push('no candidate available');
  if (!ROUTE_SEAL_STATES.has(routeState)) blockers.push(`blocked by route state: ${routeState || 'missing'}`);
  if (hardStops.length) blockers.push(`blocked by hard stops: ${hardStops.join(', ')}`);
  if (humanReclosure.required && !humanReclosure.confirmed) blockers.push('blocked by human reclosure: not confirmed');
  if (BLOCKED_SOURCE_CONTEXTS.has(sourceContext)) blockers.push(`blocked by source context: ${sourceContext}`);
  if (BLOCKED_CONSENT_STATES.has(consentStatus)) blockers.push(`blocked by consent status: ${consentStatus}`);
  if (BLOCKED_CLAIM_CEILINGS.has(claimCeiling)) blockers.push(`blocked by claim ceiling: ${claimCeiling}`);
  return blockers;
}

export function deriveApertureApprovalTransparency(packet = {}) {
  const routeState = normalizeKey(packet.routeState || packet.route_state || '');
  const candidate = firstCandidate(packet);
  const hardStops = resolveHardStops(packet);
  const humanReclosure = resolveHumanReclosure(packet);
  const sourceContext = normalizeKey(packet.sourceContext || packet.source_context || '');
  const consentStatus = normalizeKey(packet.consentStatus || packet.consent_status || 'confirmed');
  const claimCeiling = normalizeKey(packet.claimCeiling || packet.claim_ceiling || 'structural');
  const blockers = resolveBlockers({
    candidate,
    routeState,
    hardStops,
    humanReclosure,
    sourceContext,
    consentStatus,
    claimCeiling
  });
  const approved = blockers.length === 0;
  const approvalDiagnostics = Object.freeze({
    candidateAvailable: Boolean(candidate),
    selectedCandidateAvailable: Boolean(packet.selectedCandidate || packet.selected_candidate),
    candidateLabel: candidateLabel(candidate),
    routeState: routeState || 'missing',
    inputSealStatus: packet.sealStatus || packet.seal_status || 'missing',
    hardStops: Object.freeze(hardStops),
    humanReclosure,
    sourceContext: sourceContext || 'unspecified',
    consentStatus: consentStatus || 'unspecified',
    claimCeiling: claimCeiling || 'unspecified',
    blockers: Object.freeze(blockers)
  });

  return Object.freeze({
    approvedCandidate: approved ? candidate : null,
    approvalStatus: approved ? 'approved' : 'not_approved',
    approvalReason: approved
      ? 'human reclosure confirmed and no hard stops fired'
      : blockers.join('; '),
    approvalDiagnostics
  });
}

export function applyApertureApprovalTransparency(packet = {}) {
  const transparency = deriveApertureApprovalTransparency(packet);
  return Object.freeze({
    ...packet,
    approvedCandidate: transparency.approvedCandidate,
    approvalStatus: transparency.approvalStatus,
    approvalReason: transparency.approvalReason,
    approvalDiagnostics: transparency.approvalDiagnostics,
    sealStatus: transparency.approvalStatus === 'approved' ? 'seal_eligible' : 'blocked'
  });
}

export function explainApertureApprovalBlock(packet = {}) {
  const transparency = deriveApertureApprovalTransparency(packet);
  if (transparency.approvalStatus === 'approved') {
    return 'Approved candidate produced.';
  }
  const diagnostics = transparency.approvalDiagnostics;
  return [
    'No approved candidate was produced because:',
    `- routeState = ${diagnostics.routeState}`,
    `- sealStatus = ${diagnostics.inputSealStatus}`,
    `- hardStops = ${diagnostics.hardStops.length ? diagnostics.hardStops.join(', ') : '[]'}`,
    `- humanReclosure.confirmed = ${diagnostics.humanReclosure.confirmed}`,
    `- candidate = ${diagnostics.candidateLabel || 'none'}`,
    `- blockers = ${diagnostics.blockers.length ? diagnostics.blockers.join(' | ') : '[]'}`
  ].join('\n');
}
