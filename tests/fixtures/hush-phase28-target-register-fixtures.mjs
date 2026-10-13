export const phase28SourceInputs = [
  'FILE-72 exported at the same minute, but one copy has the footer and one copy does not. The explanation may be a template issue.',
  'INV-440 was logged at 2:18. Jordan should hold the resend until finance confirms the version.',
  'ROSTER-8 changed after 4:30 on 05/20. The timing should remain attached to the roster note.'
];

export const phase28Targets = [
  { id: 'aave', maskId: 'phase28-transform-to-aave', registerMode: 'transform-to-aave' },
  { id: 'chatspeak', maskId: 'phase28-transform-to-chatspeak', registerMode: 'transform-to-chatspeak' },
  { id: 'blip', maskId: 'phase28-blip-amplified', registerMode: 'custom-mask' }
];
