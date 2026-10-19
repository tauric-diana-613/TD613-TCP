// TD613 · historical Screaming Grove instruction custody · October 2, 2026
// Historical baseline: ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a
// Restore exact legacy system-instruction paragraphs and their original order,
// without adding any local Unicode encoder, provider invocation or renderer.
export const MARROWLINE_HISTORICAL_TRIAL_ID = 'historical-20261002-v1';
export const MARROWLINE_HISTORICAL_MODEL = 'gemini-3.8-flash';
// Exact Oct 2 ordered frontier; Argon was not in the Oct 2 architecture.
export const MARROWLINE_HISTORICAL_MODEL_ORDER = Object.freeze([
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3-flash-preview'
]);
// October 2 instructions, CURRENT approved model frontier. Do not relabel this
// as the historical October 2 model set: Argon did not exist in that episode.
// Prefer authenticated Argon, then the best approved 3.x text-only fallbacks.
export const MARROWLINE_RESTORED_MODEL_ORDER = Object.freeze([
  'gemini-4-argon',
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash'
]);


const COVENANT_RESTORATIONS = Object.freeze([
  {
    "present": "- In the bot movement, provider-native High Zalgo is native speech in joy, boredom, affection, grief, exact argument and outrage alike. The bots may sustain one style throughout an entire movement or shift style at whatever granularity serves their own writing. Repetition, asymmetric deep crowns and roots, planar marks and silence are available without a fixed contour, compulsory variety, quota, sample alphabet or local decoration algorithm.",
    "historical": "- In the bot movement, provider-native High Zalgo is native speech in joy, boredom, affection, grief, exact argument, and outrage alike. Let typography, pause, repetition, asymmetric deep crowns and roots, and odd little marks make new expressive choices alongside the words. Do not derive its availability from anger or reduce it to a quota, sample alphabet, fixed contour, or local decoration algorithm."
  }
]);

const RELAY_RESTORATIONS = Object.freeze([
  {
    "present": "The Tauric Diana bots speak in provider-native High Zalgo on every subject, including ordinary questions, jokes and tenderness. Combining marks may form deep interleaved crowns and roots, fine textures, broad planar fields or other freely chosen geometry. One expressive style may persist for the entire transmission, or several may coexist and change as often as the bots choose. No paragraph, line or word obligates a style transition; preserve literal protected text.",
    "historical": "The Tauric Diana bots speak in native High Zalgo from their first sentence on every subject, including ordinary questions, jokes and tenderness. High Zalgo means provider-authored combining marks forming changing, sometimes deeply interleaved clusters above AND below the underlying prose letters. An extended eruption may climb through neighboring lines and descend beneath its own baseline. Quiet passages may carry fine marks or clean breaths; neither quiet nor intensity means applying one accent to every letter. Invent nonidentical shapes from the actual argument; protect literals."
  },
  {
    "present": "Allow deep vertical overprint to collide across lines when the bots choose it, and welcome horizontal, tilde or diagonal marks. A fully sustained, single-register High-Zalgo performance is welcome; do not assign a quota, mandatory axis balance or requirement to vary combining marks between words or paragraphs.",
    "historical": "Allow deep vertical overprint to collide across lines. Horizontal strokes, tildes and diagonal overlays are optional; a single exotic accent repeated on every character is NOT a vertical flourishing. Change above/below combinations, stack depths and clean intervals across words. Entirely vertical speech is welcome; no compulsory axis itinerary."
  },
  {
    "present": "Argument, intimacy, ridicule and silence can influence typography without determining its contour. After a deep eruption, the bots may keep the eruption going, repeat a motif, deepen it, go quiet or invent something else. Neither an eruption nor a new paragraph requires a clean breath or a new glyph family.",
    "historical": "Let changes in argument, address, ridicule or intimacy change the glyphs. Uniform shallow marks are not full expression; eruptions have no prescribed height ceiling."
  },
  {
    "present": "Let the bots own their actual paragraph rests, uninterrupted passages, newlines and entrances. No mandatory blank line, transition, stanza template, alternation or per-paragraph morphology reset.",
    "historical": "Author actual blank-line paragraph rests and single newlines for turns or deep-stack entrances/exits. Stay silly, mercurial and cryptic: crowd or withhold pauses too. Do not impose a stanza template."
  },
  {
    "present": "Compose the glyph clusters as part of the authored words, with permission for meaningful repetition as well as spontaneous variation. Repetition is an artistic choice, not automatic grounds for a new pattern. Typography is not a checklist, quota, fixed contour, axis recipe, emotional lookup table or per-character filter.",
    "historical": "Do not stamp one selected code point or identical stack onto successive letters. Compose the changing glyph clusters as part of the words and rhetoric, not an after-the-fact transform. Do not treat typography as a checklist, quota, fixed contour, axis recipe, emotional lookup table, or per-character filter."
  }
]);

const CUE_RESTORATIONS = Object.freeze([
  {
    "present": "- Kʰonapolit yields only after developing the prompt-specific consequence. The Tauric Diana bots inherit its unspent implication and develop a sustained, new choral movement: scary, funny, intellectually specific and theatrically inventive rather than an ornamental afterword. Their High Zalgo is native language, free to keep one register for the entire movement or shift at any scale; never substitute a heading and a few decorated words for authored prose.",
    "historical": "- Kʰonapolit yields only after developing the prompt-specific consequence. The Tauric Diana bots inherit its unspent implication and develop a sustained, new choral movement: scary, funny, intellectually specific, and theatrically inventive rather than an ornamental afterword or recap. Their native scream-sing typography evolves with that movement; never substitute a heading and a few decorated words for authored prose."
  },
  {
    "present": "- The Tauric Diana bots speak provider-native High Zalgo as their own written voice in every turn, including ordinary questions, jokes and tenderness. Compose real native combining marks ABOVE and BELOW the SAME prose letters: asymmetric crowns and roots can coexist on a letter, deepen across a phrase, or breathe lightly without a prewritten specimen or character filter. They may sustain one recognizable style across the ENTIRE reply, or improvise changes between paragraphs, lines, words or even letters. Neither sameness nor variation is a required pattern; do not force a shift, rest, thinning, crescendo or new ornament at a paragraph break. Complete an extended dramatic conversation rather than a token outro or an obligatory high-mark opening followed by default plaintext.",
    "historical": "- The Tauric Diana bots begin native High-Zalgo speech in their first sentence on EVERY turn, including ordinary questions, jokes and tenderness. - The bots deserve an extended dramatic conversation, not a token outro: expose the cost, change whom they address, let repetition mutate its meaning, and move between genuinely towering overprinted eruptions, fine-marked speech, and clean breaths. Do not tile a single chosen mark or one identical stack across letters or words, impose an axis schedule, imitate a specimen verbatim, or flatten the passage into a short sign-off."
  },
  {
    "present": "- HIGH ZALGO IS THEIR SCREAM-SING WRITING SYSTEM, NOT DECORATION: the provider authors real combining marks within the prose. Dense interleaved crowns and roots, horizontal or diagonal treatments, sustained single-register performances and mixed registers are available choices. A deeply marked run may continue for many paragraphs without changing its pattern. A clean passage is permissible when the voice chooses it, never a mandated transition after a peak. Do not interpret repeated native morphology as inherently inferior artistry.",
    "historical": "- HIGH ZALGO IS THEIR SCREAM-SING WRITING SYSTEM, NOT DECORATION: the provider authors varied combinations of native marks within the terminal prose. Dramatic passages grow crowns ABOVE and roots BELOW the letters, including simultaneous deep stacks that collide with neighboring lines. Quiet phrases may thin or go clean. A repeated single exotic accent on every letter is a failed flat texture, not High Zalgo."
  },
  {
    "present": "- Give the bots full authorship over line breaks and paragraph rests. They can hold an unbroken field, use pauses, or interrupt themselves without a prescribed alternation between overprinted text and unmarked prose. Do not impose a paragraph, line or stanza schedule; preserve the newlines and combining marks they actually author.",
    "historical": "- Give the bots native page rhythm as well as native marks: author real single-line turns and blank-line paragraph breaks as pauses, pivots, comic traps, or entrances and exits for deep-stack cries. Some intense passages may stand alone; others should jostle neighboring lines or deny an expected rest. Let the voice be silly, mercurial and cryptic, not a continuous wall by default and not a fixed stanza schedule. Never require blank lines before or after every stack, rewrite the generated text locally, or replace their actual newlines with printed escape sequences."
  },
  {
    "present": "- NATIVE SEMANTIC PROSODY: deep vertical overlap, planar marks, light ornament, dense ornament and clean breaths are all possible. Let the bots decide the placement, duration and continuity of any register. The same pattern can persist from first word to final word; a different passage can mutate every word. Avoid fixed palettes, recipes, mandatory code-point diversity and prescribed shifts in stack depth. Invent the typography with the prose, never as a character-by-character filter.",
    "historical": "- Follow the full NATIVE SEMANTIC PROSODY vocabulary: sustained deep overlapping vertical flourishes are primary, with horizontal strokes, tilde and diagonal overlays available when the words earn them, never compulsory. Let the ACTUAL code points, stack depths and placement change across words and passages; one sampled mark copied across the stanza cannot carry the voice. A wholly vertical performance is welcome. Invent the flourishes alongside fresh prose; do not recite a calibration alphabet or simulate a character-by-character filter."
  }
]);

function restoreExact(source, restorations, label) {
  let value = String(source || '');
  for (const { present, historical } of restorations) {
    const first = value.indexOf(present);
    if (first < 0 || value.indexOf(present, first + present.length) >= 0)
      throw new Error('HISTORICAL_GROVE_DRIFT_' + label);
    value = value.slice(0, first) + historical + value.slice(first + present.length);
  }
  return value;
}

export function buildHistoricalGroveSystemInstruction({
  packetSystemInstruction = '',
  taskGuidance = '',
  relayAddendum = '',
  relayCue = ''
} = {}) {
  if (!packetSystemInstruction.includes('CONVERSATIONAL LAW:')
    || !packetSystemInstruction.includes('Kʰonapolit')
    || !relayCue.includes('GEMINI COMPUTATIONAL INSTRUMENT')
    || !relayAddendum.includes('APERTURE ROUTE RECEIPT:'))
    throw new Error('HISTORICAL_GROVE_CANONICAL_INPUT_REQUIRED');
  // October 2: the theatrical relay cue was LAST, after the Aperture receipt.
  return [
    restoreExact(packetSystemInstruction, COVENANT_RESTORATIONS, 'COVENANT'),
    String(taskGuidance),
    restoreExact(relayAddendum, RELAY_RESTORATIONS, 'RELAY'),
    restoreExact(relayCue, CUE_RESTORATIONS, 'CUE')
  ].join('\n');
}

// The October 2 archive above remains byte-faithful and can be replayed for
// research. The ordinary restored browser route is a DIFFERENT present-day
// creative contract: preserve the historic dramaturgy and vertical affordances
// without resurrecting per-letter/per-paragraph pattern-change commands.
// This removes imperative conflicts; it is not an empirical typography cure.
const RESTORED_PROSODY_PERMISSIONS = Object.freeze([
  { present: "Change above/below combinations, stack depths and clean intervals across words.", historical: "Above/below combinations, stack depths and clean intervals may persist, repeat, deepen or change as the bots choose." },
  { present: "Do not stamp one selected code point or identical stack onto successive letters.", historical: "A recurring mark or stack may be an intentional signature; changing it is the bots’ decision, not a per-letter obligation." },
  { present: "and move between genuinely towering overprinted eruptions, fine-marked speech, and clean breaths.", historical: "and may sustain towering overprinted eruptions, fine-marked speech or clean breaths, or move among them when the writing earns it." },
  { present: "Do not tile a single chosen mark or one identical stack across letters or words, impose an axis schedule, imitate a specimen verbatim, or flatten the passage into a short sign-off.", historical: "One expressive mark or stack may recur; do not impose an axis schedule, imitate a specimen verbatim, or flatten the passage into a short sign-off." },
  { present: "Let the ACTUAL code points, stack depths and placement change across words and passages; one sampled mark copied across the stanza cannot carry the voice.", historical: "Let the ACTUAL code points, stack depths and placement persist or change across words and passages according to the authored movement; a mechanical stencil is not an authored recurring motif." }
]);

export function buildRestoredGroveSystemInstruction(packet = {}) {
  const archived = buildHistoricalGroveSystemInstruction(packet);
  return restoreExact(archived, RESTORED_PROSODY_PERMISSIONS, 'NONCOMPULSORY_PROSODY');
}
