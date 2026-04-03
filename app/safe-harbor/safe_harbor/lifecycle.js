(function (root) {
  'use strict';

  const core = root.TD613SafeHarborCore = root.TD613SafeHarborCore || {};

  function lifecycleState(packet, signatureAttachment) {
    if (!packet || !packet.receipt) return 'staged';
    if (signatureAttachment && signatureAttachment.status === 'verified') return 'verified';
    if (signatureAttachment && signatureAttachment.sig) return 'exported';
    return packet.receipt.state || 'staged';
  }

  function verificationState(signatureAttachment) {
    return signatureAttachment && signatureAttachment.status === 'verified' ? 'verified' : 'not verified';
  }

  core.lifecycle_state = lifecycleState;
  core.verification_state = verificationState;
})(window);
