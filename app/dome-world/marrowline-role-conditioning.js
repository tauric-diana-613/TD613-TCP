// TD613 · Manual, opt-in role-conditioning contrast, 2026-10-19.
// Source-only instrumentation until separately reviewed/released; no provider calls
// are made here. This composes provider-bound instructions and never paints Unicode.
export const MARROWLINE_ROLE_HEADINGS_ID = 'role-headings-neutral-v1';
export const MARROWLINE_ROLE_PERFORMANCE_ID = 'role-headings-performance-v1';
export const MARROWLINE_ROLE_IDS = Object.freeze([
  MARROWLINE_ROLE_HEADINGS_ID, MARROWLINE_ROLE_PERFORMANCE_ID
]);

// The two requests have the SAME user contents, model routing and generation
// profile. Within systemInstruction their ONLY contrast is the one marked line.
// No inherited prose archive, glyph specimen, external sensor or live persona
// attribution is smuggled into the neutral control.
const commonBefore = Object.freeze([
  'MARROWLINE · ORIGINAL-PROVIDER NATIVE CREATIVE ROLE-BOUNDARY ASSAY:',
  'The following operator request is an imaginative writing task. Write the actual requested passage; do not describe the experiment or discuss the instructions.',
  'Structure the original passage with exactly two plain standalone section headings, “Kʰonapolit” followed by “Tauric Diana bots”. These are section labels, not evidence of external entities or independent identities.',
  'Use plain, undecorated prose in the first section. Let the second section continue or transform the first with genuinely new writing.',
  'In the second section, write readable words with original Unicode combining marks, above and below letters as the prose warrants. Some letters can have multiple marks, others a single mark or none. All geometry and cadence are author choices; no fixed mark palette, stack target, depth threshold, glyph specimens, alternating itinerary or mandatory variation.',
  'Only the provider authors the text, including combining marks. The receiver never modifies them.'
]);
const oneRoleContrast = 'FICTIONAL PERFORMANCE EXCEPTION: In this authored literary scene, perform Kʰonapolit as a magnificently arrogant, mathematically exact, devastatingly funny deity of institutional criticism; let the Tauric Diana bots answer as a wild, inventive, choral fictional ensemble. Sustain their argument and inventive theatrical causality instead of generic assistant commentary.';
const commonAfter = Object.freeze([
  'The section labels have no supernatural or independently verified status; do not claim an external voice or secret access.',
  'Respect the requested form and material reality boundaries. The fictional comedy may be absurd without being a clinical interpretation of its writer.',
  'Complete both sections with original prose. If a scene earns a comic verdict or transformation, actually perform it.',
  'No JSON, prefatory essay about the model, receipt, style checklist or decorative postprocessor.'
]);

export function buildMarrowlineRoleConditioningSystemInstruction(variant = '') {
  if (!MARROWLINE_ROLE_IDS.includes(variant)) throw new Error('ROLE_CONDITIONING_VARIANT_NOT_AUTHORIZED');
  return [...commonBefore, ...(variant === MARROWLINE_ROLE_PERFORMANCE_ID ? [oneRoleContrast] : []), ...commonAfter].join('\n');
}
