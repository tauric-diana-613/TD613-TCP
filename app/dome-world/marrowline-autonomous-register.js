// TD613 · Screaming Grove · controlled removal of inherited mandatory style
// alternation. This is a separate URL-only experimental system instruction,
// NOT a modification of the byte-exact October 2 historical archive.
// There are no output transformations, stylistic scores or additional calls.
import { buildHistoricalGroveSystemInstruction } from './marrowline-historical-grove.js';

export const MARROWLINE_AUTONOMOUS_REGISTER_ID = 'restored-autonomous-register-v1';

// Each left-hand phrase must occur exactly once in the reconstructed historical
// request. Missing/multiple occurrences fail closed instead of silently editing
// a different system frame. All changes relax imperatives, not add geometry rules.
export const INHERITED_COMPULSION_RELEASES = Object.freeze([
  Object.freeze({
    inherited: 'Invent nonidentical shapes from the actual argument; protect literals.',
    autonomous: 'Invent actual argument-shaped native marks; protect literals. A chosen expressive motif may persist as long as the writing needs it.'
  }),
  Object.freeze({
    inherited: 'Change above/below combinations, stack depths and clean intervals across words.',
    autonomous: 'Above/below combinations, stack depths and clean intervals may persist or change at any scale; neither persistence nor variation is compulsory.'
  }),
  Object.freeze({
    inherited: 'Let changes in argument, address, ridicule or intimacy change the glyphs.',
    autonomous: 'Changes in argument, address, ridicule or intimacy may influence the glyphs without requiring a pattern change.'
  }),
  Object.freeze({
    inherited: 'Do not stamp one selected code point or identical stack onto successive letters. Compose the changing glyph clusters as part of the words and rhetoric',
    autonomous: 'A selected motif or stack may recur across successive letters when it is part of the authored voice. Compose the glyph clusters as part of the words and rhetoric'
  }),
  Object.freeze({
    inherited: 'move between genuinely towering overprinted eruptions, fine-marked speech, and clean breaths.',
    autonomous: 'choose among towering overprinted eruptions, fine-marked speech, and clean breaths; any register may persist for the entire movement.'
  }),
  Object.freeze({
    inherited: 'Do not tile a single chosen mark or one identical stack across letters or words, impose an axis schedule, imitate a specimen verbatim, or flatten the passage into a short sign-off.',
    autonomous: 'Do not impose an axis schedule, imitate a specimen verbatim, or flatten the passage into a short sign-off. Deliberate repeated patterns remain available creative choices.'
  }),
  Object.freeze({
    inherited: 'the provider authors varied combinations of native marks within the terminal prose.',
    autonomous: 'the provider authors real native combining marks within the terminal prose.'
  }),
  Object.freeze({
    inherited: 'Let the ACTUAL code points, stack depths and placement change across words and passages; one sampled mark copied across the stanza cannot carry the voice.',
    autonomous: 'Let actual code points, stack depths and placement persist or shift when the voice wants them to. Do not replace original prose with a copied calibration specimen.'
  })
]);

export function releaseInheritedRegisterCompulsion(historicalSystemInstruction = '') {
  let next = String(historicalSystemInstruction || '');
  if (!next.includes('GEMINI COMPUTATIONAL INSTRUMENT — CURRENT-TURN RELAY EXECUTION:')
      || !next.includes('APERTURE ROUTE RECEIPT:'))
    throw new Error('AUTONOMOUS_REGISTER_HISTORICAL_FRAME_REQUIRED');
  for (const { inherited, autonomous } of INHERITED_COMPULSION_RELEASES) {
    const first = next.indexOf(inherited);
    if (first < 0 || next.indexOf(inherited, first + inherited.length) !== -1)
      throw new Error('AUTONOMOUS_REGISTER_INHERITED_CLAUSE_DRIFT');
    next = next.slice(0, first) + autonomous + next.slice(first + inherited.length);
  }
  return next;
}

export function buildAutonomousRegisterSystemInstruction(source = {}) {
  return releaseInheritedRegisterCompulsion(buildHistoricalGroveSystemInstruction(source));
}
