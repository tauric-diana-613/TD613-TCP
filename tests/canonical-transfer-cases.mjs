export const CANONICAL_REFERENCE_VOICE = `Honestly, I wasn't trying to make a speech. I just kept circling the story because every time I got to the part where I should have left, I remembered one more detail that changed why I stayed. By the time I finished, I had used three qualifiers, two apologies, and the same phrase twice, which is apparently what I do when I'm buying time to say the hard part out loud.`;

export const CANONICAL_PROBE_VOICE = `Hey, if you're still out, grab the charger and use the side door. It sticks, so lean on it. If nobody hears you right away, wait a second and knock again. I'm in back unloading boxes, and I probably won't catch the first try.`;

export const CANONICAL_REFLECTIVE_DONOR = `Honestly, I kept circling the point because every time I tried to leave, I found one more reason to stay, and then I stalled again because the room went quiet.`;

export const CANONICAL_OPERATIONAL_DONOR = 'Hey, grab the charger. Use the side door. It sticks, so lean on it. I am in back.';

export const CANONICAL_TRANSFER_CASES = Object.freeze([
  {
    id: 'screenshot_reference_under_probe',
    category: 'flagship',
    sourceText: CANONICAL_REFERENCE_VOICE,
    donorText: CANONICAL_PROBE_VOICE,
    strength: 0.9
  },
  {
    id: 'screenshot_probe_under_reference',
    category: 'flagship',
    sourceText: CANONICAL_PROBE_VOICE,
    donorText: CANONICAL_REFERENCE_VOICE,
    strength: 0.9
  },
  {
    id: 'operational_under_reflective',
    category: 'flagship',
    sourceText: 'Door sticks. Knock twice. I am in back.',
    donorText: CANONICAL_REFLECTIVE_DONOR,
    strength: 0.88
  },
  {
    id: 'reflective_under_operational',
    category: 'flagship',
    sourceText: `Honestly, I wasn't trying to make a speech. I just kept circling the story because every time I got to the part where I should have left, I remembered one more detail that changed why I stayed.`,
    donorText: CANONICAL_OPERATIONAL_DONOR,
    strength: 0.88
  },
  {
    id: 'contraction_heavy',
    category: 'flagship',
    sourceText: 'I am not sure if it is ready. I will bring it when I can.',
    donorText: `I'm not sure it's ready. I'll bring it when I can.`,
    strength: 0.9
  },
  {
    id: 'contraction_light',
    category: 'flagship',
    sourceText: `I'm sure it's ready. I'll bring it when I can.`,
    donorText: 'I am certain it is ready. I will bring it when I can.',
    strength: 0.9
  },
  {
    id: 'pathology_additive_collapse_blocked',
    category: 'pathology',
    sourceText: 'Because the room stayed loud, I kept the note. But the line dragged. So I left this mark behind.',
    donorText: CANONICAL_REFLECTIVE_DONOR,
    strength: 0.9
  },
  {
    id: 'pathology_connector_stack_blocked',
    category: 'pathology',
    sourceText: 'I left early though if the train arrived on time. Honestly, and also the signal worked. But because the door was unlocked, I stayed.',
    donorText: CANONICAL_REFERENCE_VOICE,
    strength: 0.88
  },
  {
    id: 'low_opportunity_visible_shift',
    category: 'low-opportunity',
    sourceText: 'Stone settles under glass.',
    donorText: CANONICAL_PROBE_VOICE,
    strength: 0.9
  },
  {
    id: 'protected_literal_survival',
    category: 'literal',
    sourceText: 'Meet at 9:30, bring ID ZX-17.',
    donorText: CANONICAL_REFERENCE_VOICE,
    strength: 0.9
  }
]);

export function buildBorrowedShell(extractCadenceProfile, testCase) {
  return {
    mode: 'borrowed',
    profile: extractCadenceProfile(testCase.donorText),
    strength: testCase.strength
  };
}
