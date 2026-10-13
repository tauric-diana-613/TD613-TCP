import assert from 'assert';
import {
  applyApertureApprovalTransparency,
  deriveApertureApprovalTransparency,
  explainApertureApprovalBlock
} from '../app/engine/aperture-approval-transparency.js';

const blockedPacket = {
  routeState: 'human_reclosure_required',
  sealStatus: 'blocked',
  selectedCandidate: { id: 'RC1', class: 'compression_loss' },
  hardStops: ['claim_ceiling_breach'],
  humanReclosure: {
    required: true,
    confirmed: false,
    rejected_routes_visible: true
  },
  consentStatus: 'confirmed',
  claimCeiling: 'structural'
};

const blocked = applyApertureApprovalTransparency(blockedPacket);
assert.equal(blocked.approvalStatus, 'not_approved');
assert.equal(blocked.approvedCandidate, null);
assert.equal(blocked.sealStatus, 'blocked');
assert(blocked.approvalReason.includes('blocked by route state: human_reclosure_required'));
assert(blocked.approvalReason.includes('blocked by hard stops: claim_ceiling_breach'));
assert(blocked.approvalReason.includes('blocked by human reclosure: not confirmed'));
assert.equal(blocked.approvalDiagnostics.candidateLabel, 'RC1');
assert.deepEqual(blocked.approvalDiagnostics.hardStops, ['claim_ceiling_breach']);

const explanation = explainApertureApprovalBlock(blockedPacket);
assert(explanation.startsWith('No approved candidate was produced because:'));
assert(explanation.includes('routeState = human_reclosure_required'));
assert(explanation.includes('hardStops = claim_ceiling_breach'));
assert(explanation.includes('humanReclosure.confirmed = false'));
assert(explanation.includes('candidate = RC1'));

const approvedPacket = {
  routeState: 'seal_eligible',
  sealStatus: 'seal_eligible',
  selectedCandidate: { id: 'RC2', class: 'buried_thesis' },
  hardStops: [],
  humanReclosure: {
    required: true,
    confirmed: true,
    operator_confirmed_route: true,
    operator_confirmed_claim_ceiling: true,
    rejected_routes_visible: true
  },
  consentStatus: 'confirmed',
  claimCeiling: 'structural'
};

const approved = applyApertureApprovalTransparency(approvedPacket);
assert.equal(approved.approvalStatus, 'approved');
assert.equal(approved.approvedCandidate.id, 'RC2');
assert.equal(approved.approvalReason, 'human reclosure confirmed and no hard stops fired');
assert.equal(approved.sealStatus, 'seal_eligible');

const privateBlocked = deriveApertureApprovalTransparency({
  routeState: 'seal_eligible',
  selectedCandidate: { id: 'RC3' },
  humanReclosure: { required: false },
  sourceContext: 'private_text_unknown_consent',
  consentStatus: 'unknown',
  claimCeiling: 'blocked'
});
assert.equal(privateBlocked.approvalStatus, 'not_approved');
assert(privateBlocked.approvalDiagnostics.blockers.includes('blocked by source context: private_text_unknown_consent'));
assert(privateBlocked.approvalDiagnostics.blockers.includes('blocked by consent status: unknown'));
assert(privateBlocked.approvalDiagnostics.blockers.includes('blocked by claim ceiling: blocked'));

console.log('aperture-approval-transparency.test.mjs passed');
