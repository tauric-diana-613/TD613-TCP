// TD613 · historical Screaming Grove instruction custody · October 2, 2026
// Historical baseline: ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a
// Restore exact legacy system-instruction paragraphs and their original order,
// without adding any local Unicode encoder, provider invocation or renderer.
export const MARROWLINE_HISTORICAL_TRIAL_ID = 'historical-20261002-v1';
export {
  MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID,
  MARROWLINE_CARBON_RECONSTRUCTION_PROFILE,
  MARROWLINE_CARBON_RECONSTRUCTION_MODEL_ORDER,
  GEMINI_4_FRONTIER_MODEL_IDS,
  isGemini4FrontierModel,
  buildCarbonReconstructionSystemInstruction
} from './marrowline-carbon-reconstruction.js';
export const MARROWLINE_HISTORICAL_MODEL = 'gemini-3.8-flash';
// Exact Oct 2 ordered frontier; Argon was not in the Oct 2 architecture.
export const MARROWLINE_HISTORICAL_MODEL_ORDER = Object.freeze([
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3-flash-preview'
]);
// Reinstated 2026-10-02 first-seat priority for the text-only browser route.
// Original archived 3.7/3.5 seats are now upstream aliases, so never silently
// pretend they are independent historical checkpoints. Verified current 3.6 is
// the first distinct fallback; Argon remains a last-resort modern continuity
// seat, never misrepresented as part of the original October 2 model set.
export const MARROWLINE_RESTORED_MODEL_ORDER = Object.freeze([
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-4-argon'
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

// Explicit, reversible source rollback: the everyday restored Grove now uses
// the literal 2026-10-02 archived prose instructions, NOT the 2026-10-19
// single-register-permission rewrite. The later profile remains available to
// explicit offline comparison using nativeProsodyFreedom: true below.
// This restores source conditioning, never the original hosted model weights.
export const MARROWLINE_RESTORED_PROSODY_PROFILE = 'oct02-literal-prosody-rollback-20261122';
export const MARROWLINE_SINGLE_REGISTER_COMPARISON_PROFILE = 'native-single-register-permission-20261019';
const RESTORED_RELAY_FREEDOM = Object.freeze([
  RELAY_RESTORATIONS[0].historical
    .replace('forming changing, sometimes deeply interleaved clusters', 'forming sometimes deeply interleaved clusters')
    .replace('Invent nonidentical shapes from the actual argument;', 'Let the actual argument shape marks that may persist or evolve;'),
  ...RELAY_RESTORATIONS.slice(1).map(({ present }) => present)
]);
const RESTORED_CUE_FREEDOM = Object.freeze([
  CUE_RESTORATIONS[0].historical.replace('Their native scream-sing typography evolves with that movement;', 'Their native scream-sing typography may sustain one register or evolve with that movement;'),
  ...CUE_RESTORATIONS.slice(1, 4).map(({ present }) => present),
  CUE_RESTORATIONS[4].historical.replace(
    'Let the ACTUAL code points, stack depths and placement change across words and passages; one sampled mark copied across the stanza cannot carry the voice.',
    'Let the bots choose their actual code points, stack depths and placement: one register may persist for the entire performance or change at any scale.'
  )
]);

function restoreExact(source, restorations, label, replacements = null) {
  let value = String(source || '');
  for (const [index, { present, historical }] of restorations.entries()) {
    const first = value.indexOf(present);
    if (first < 0 || value.indexOf(present, first + present.length) >= 0)
      throw new Error('HISTORICAL_GROVE_DRIFT_' + label);
    const target = replacements ? replacements[index] : historical;
    if (typeof target !== 'string' || !target.trim())
      throw new Error('HISTORICAL_GROVE_FREEDOM_DRIFT_' + label);
    value = value.slice(0, first) + target + value.slice(first + present.length);
  }
  return value;
}

export function buildHistoricalGroveSystemInstruction({
  packetSystemInstruction = '',
  taskGuidance = '',
  relayAddendum = '',
  relayCue = '',
  nativeProsodyFreedom = false
} = {}) {
  if (!packetSystemInstruction.includes('CONVERSATIONAL LAW:')
    || !packetSystemInstruction.includes('Kʰonapolit')
    || !relayCue.includes('GEMINI COMPUTATIONAL INSTRUMENT')
    || !relayAddendum.includes('APERTURE ROUTE RECEIPT:'))
    throw new Error('HISTORICAL_GROVE_CANONICAL_INPUT_REQUIRED');
  // Oct 2 theatrical relay cue remains LAST after the Aperture receipt.
  // nativeProsodyFreedom=false retains the original historic paragraphs exactly.
  return [
    restoreExact(packetSystemInstruction, COVENANT_RESTORATIONS, 'COVENANT'),
    String(taskGuidance),
    restoreExact(relayAddendum, RELAY_RESTORATIONS, 'RELAY',
      nativeProsodyFreedom ? RESTORED_RELAY_FREEDOM : null),
    restoreExact(relayCue, CUE_RESTORATIONS, 'CUE',
      nativeProsodyFreedom ? RESTORED_CUE_FREEDOM : null)
  ].join('\n');
}

// Reconciled PR #1545 candidate (Candidate C): preserves all 11 October 2
// dramaturgical, page-rhythm, vertical-emphasis, and anti-stencil paragraphs
// intact, removing ONLY the 5 compulsory word-by-word pattern-rotation
// commands. Remains an explicit offline/research candidate until independently
// witnessed and authorized by the Operator; never silently overrides default.
export const MARROWLINE_DRAMATURGY_CANDIDATE_PROFILE = 'oct02-dramaturgy-noncompulsory-prosody-candidate-20261120';

// Composite dramaturgical + anti-overlay negation candidate (Candidate D):
// combines Candidate C's 5 dramaturgical noncompulsory edits with negative
// instructions naming "overlay", "through-line", and "strike-through" forms.
// Retained as a broader dramaturgical hypothesis (not pure lexical de-priming).
// Strictly gated behind explicit experimental selection.
export const MARROWLINE_VERTICAL_UNPRIMED_CANDIDATE_PROFILE = 'oct02-dramaturgy-vertical-unprimed-candidate-20261122';

// Minimal lexical-deprimed experimental arm (Candidate E / Arm E): derived
// directly from Candidate B (the literal October 2 baseline) by excising ONLY
// the two specifically identified horizontal/diagonal/tildes lexical
// invitations, with zero Candidate C dramaturgical edits, zero replacement
// anti-overlay/strike-through negations, and zero vertical specimen alphabets.
// Strictly gated behind explicit experimental selection.
export const MARROWLINE_LEXICAL_DEPRIMED_CANDIDATE_PROFILE = 'oct02-literal-lexical-deprimed-candidate-20261122';

// Artistic Restoration Candidate (2026-11-23):
// Synthesizes the forensic evidence from Sep 26–Oct 2, Oct 15 E1/E2, Oct 20
// D1/D2 + Slot 5, Nov 21–22 Q1/EP2, and Nov 23 R2-U:
// 1. Preserves full Kʰonapolit high-academia forensic/comic dramaturgy, the
//    Red Deer Diegetic Mission, Hornani fourfold, and exact TD613 custody keys
//    (including Khona‌lit-po with literal U+200C, 𝌋, ⟐, U+10D613).
// 2. Removes all 7+ negative/anti-pattern and horizontal/overlay/tilde/single-
//    accent lexemes that primed the U+0334–U+0338 depth-1 basin and triggered
//    parroting/loop collapse in R2-U.
// 3. Replaces abstract meta-rules with concise, concrete, positive vertical
//    High Zalgo choreography (plain resting ground, clean inter-word spaces
//    and punctuation, selective asymmetric crowns above and plunging roots
//    below, spontaneous rhythm).
// 4. Pairs with a compact current-turn recency cue in the user turn (matching
//    the Sep 26 pre-#1354 recency architecture) without mutating the operator's
//    own visible message or history.
export const MARROWLINE_ARTISTIC_RESTORATION_TRIAL_ID = 'artistic-restoration-20261123-v1';
export const MARROWLINE_ARTISTIC_RESTORATION_PROFILE = 'marrowline-artistic-restoration-20261123-v1';
// URL-only opt-in successor; v1 and historical comparator remain unchanged.
export const MARROWLINE_ARTISTIC_RESTORATION_V2_TRIAL_ID = 'artistic-restoration-20261123-v2';
export const MARROWLINE_ARTISTIC_RESTORATION_V2_PROFILE = 'marrowline-artistic-restoration-20261123-v2-native-continuity';

// Resilient Argon-first order for the restored production route:
// gemini-4-argon runs first, with genuine modern 3.8-flash and 3.6-flash
// transport failover on provider error/429/503/timeout.
export const MARROWLINE_ARTISTIC_RESTORATION_MODEL_ORDER = Object.freeze([
  'gemini-4-argon',
  'gemini-3.8-flash',
  'gemini-3.6-flash'
]);

const DRAMATURGY_NONCOMPULSORY_PERMISSIONS = Object.freeze([
  {
    present: 'Change above/below combinations, stack depths and clean intervals across words.',
    historical: 'Above/below combinations, stack depths and clean intervals may persist, repeat, deepen or change as the bots choose.'
  },
  {
    present: 'Do not stamp one selected code point or identical stack onto successive letters.',
    historical: 'A recurring mark or stack may be an intentional signature; changing it is the bots’ decision, not a per-letter obligation.'
  },
  {
    present: 'and move between genuinely towering overprinted eruptions, fine-marked speech, and clean breaths.',
    historical: 'and may sustain towering overprinted eruptions, fine-marked speech or clean breaths, or move among them when the writing earns it.'
  },
  {
    present: 'Do not tile a single chosen mark or one identical stack across letters or words, impose an axis schedule, imitate a specimen verbatim, or flatten the passage into a short sign-off.',
    historical: 'One expressive mark or stack may recur; do not impose an axis schedule, imitate a specimen verbatim, or flatten the passage into a short sign-off.'
  },
  {
    present: 'Let the ACTUAL code points, stack depths and placement change across words and passages; one sampled mark copied across the stanza cannot carry the voice.',
    historical: 'Let the ACTUAL code points, stack depths and placement persist or change across words and passages according to the authored movement; a mechanical stencil is not an authored recurring motif.'
  }
]);

const VERTICAL_UNPRIMED_SUBSTITUTIONS = Object.freeze([
  {
    present: 'Allow deep vertical overprint to collide across lines. Horizontal strokes, tildes and diagonal overlays are optional; a single exotic accent repeated on every character is NOT a vertical flourishing.',
    historical: 'Allow deep vertical overprint—multi-tier crowns above the cap line and roots below the baseline—to collide across lines; a single repeated overlay or accent on every character is NOT vertical flourishing.'
  },
  {
    present: 'Follow the full NATIVE SEMANTIC PROSODY vocabulary: sustained deep overlapping vertical flourishes are primary, with horizontal strokes, tilde and diagonal overlays available when the words earn them, never compulsory.',
    historical: 'Follow the full NATIVE SEMANTIC PROSODY vocabulary: sustained deep overlapping vertical crowns above and roots below the letters are primary; do not flatten the voice into single-mark through-line or strike-through overlays.'
  }
]);

const LEXICAL_DEPRIMED_SUBSTITUTIONS = Object.freeze([
  {
    present: 'Allow deep vertical overprint to collide across lines. Horizontal strokes, tildes and diagonal overlays are optional; a single exotic accent repeated on every character is NOT a vertical flourishing.',
    historical: 'Allow deep vertical overprint to collide across lines; a single exotic accent repeated on every character is NOT a vertical flourishing.'
  },
  {
    present: '- Follow the full NATIVE SEMANTIC PROSODY vocabulary: sustained deep overlapping vertical flourishes are primary, with horizontal strokes, tilde and diagonal overlays available when the words earn them, never compulsory.',
    historical: '- Follow the full NATIVE SEMANTIC PROSODY vocabulary: sustained deep overlapping vertical flourishes are primary.'
  }
]);

export function buildHistoricalGroveDramaturgyCandidate(input = {}) {
  const archived = typeof input === 'string'
    ? input
    : typeof input?.archivedSystemInstruction === 'string'
      ? input.archivedSystemInstruction
      : buildHistoricalGroveSystemInstruction({
        ...input,
        nativeProsodyFreedom: false
      });
  return restoreExact(archived, DRAMATURGY_NONCOMPULSORY_PERMISSIONS, 'DRAMATURGY_NONCOMPULSORY_PROSODY');
}

export function buildHistoricalGroveVerticalUnprimedCandidate(input = {}) {
  const dramaturgy = buildHistoricalGroveDramaturgyCandidate(input);
  return restoreExact(dramaturgy, VERTICAL_UNPRIMED_SUBSTITUTIONS, 'VERTICAL_UNPRIMED_PROSODY');
}

export function buildHistoricalGroveLexicalDeprimedCandidate(input = {}) {
  const archived = typeof input === 'string'
    ? input
    : typeof input?.archivedSystemInstruction === 'string'
      ? input.archivedSystemInstruction
      : buildHistoricalGroveSystemInstruction({
        ...input,
        nativeProsodyFreedom: false
      });
  return restoreExact(archived, LEXICAL_DEPRIMED_SUBSTITUTIONS, 'LEXICAL_DEPRIMED_PROSODY');
}

const ARTISTIC_RESTORATION_RELAY_REPLACEMENTS = Object.freeze([
  'The Tauric Diana bots speak in native High Zalgo from their first sentence on every subject—ordinary questions, jokes, tenderness, and fury alike. Anchor their prose in readable English words while letting authentic vertical High Zalgo erupt where the drama, wit, or shock strikes: deep asymmetric crowns climbing above the letters (drawn freely from combining marks above such as U+0300..U+0314, U+033D..U+0352, U+0363..U+036F) simultaneous with fractured roots plunging below (U+0316..U+0330, U+0339..U+033C, U+0347..U+0356). Keep inter-word spaces, punctuation, and protected literals clean so towering spires frame intelligible speech.',
  'Allow tall vertical crowns and plunging roots to collide across neighboring lines at irregular heights, breathing naturally between quiet unadorned phrases, light tremors, and sudden towering eruptions. Vary the mark combinations organically across letters rather than repeating a copied sequence.',
  'Let shifts in argument, address, ridicule, intimacy, or dread shape the vertical energy of the glyphs with no fixed height ceiling.',
  'Author real blank-line paragraph rests and single newlines for turns, comic traps, or deep-stack entrances and exits. Stay silly, mercurial, and cryptic: crowd or withhold pauses too.',
  'Compose the changing glyph clusters directly as part of the authored words and rhetoric, inventing fresh shapes alongside the prose.'
]);

const ARTISTIC_RESTORATION_CUE_REPLACEMENTS = Object.freeze([
  '- Kʰonapolit yields only after developing the prompt-specific consequence. The Tauric Diana bots inherit its unspent implication and develop a sustained, new choral movement: scary, funny, intellectually specific, and theatrically inventive rather than a recap or sign-off. Their native scream-sing High Zalgo evolves with that movement; never substitute a heading and a few decorated words for authored prose.',
  '- The Tauric Diana bots begin native High-Zalgo speech in their first sentence on EVERY turn. Give them an extended, unpredictable dramatic movement: expose the cost, pivot whom they address, let repetition mutate its meaning, and move organically between clean unadorned prose, delicate tremors, and towering asymmetric vertical spires that collide across lines.',
  '- HIGH ZALGO IS THEIR SCREAM-SING WRITING SYSTEM: author genuine, varied vertical combining marks directly inside the terminal prose—deep irregular crowns above and plunging roots below the letters—while keeping spaces between words and punctuation clean so the voice remains electrifying and readable.',
  '- Give the bots native page rhythm as well as native marks: author real single-line turns and blank-line paragraph breaks as pauses, pivots, comic traps, or entrances and exits for deep-stack cries. Let the voice be silly, mercurial, and cryptic.',
  '- NATIVE VERTICAL PROSODY: compose tall, ragged crowns above and plunging roots below chosen words, letting clean prose and quiet beats give the eruptions dramatic contrast. Invent fresh mark combinations alongside the prose.'
]);

const ARTISTIC_RESTORATION_CLEANUPS = Object.freeze([
  {
    present: 'Earlier replies supply conversational substance, not a formatting template. A prior reply that omitted the bots, flattened their handwriting, or used a single decorative motif does not redefine the complete relay requested now.',
    historical: 'Earlier replies supply conversational substance, not a formatting template. Compose this turn freshly on its own dramatic terms.'
  },
  {
    present: 'THE GEMINI API MUST AUTHOR THE ACTUAL COMBINING CODE POINTS. Marrowline preserves and measures the provider return; it never decorates, repaints, expands, synthesizes, overlays, or Zalgo-encodes the answer afterward.',
    historical: 'THE GEMINI API MUST AUTHOR THE ACTUAL COMBINING CODE POINTS directly inside the prose; Marrowline preserves the provider return byte-for-byte.'
  }
]);

export function buildArtisticRestorationTurnRecencyCue() {
  return [
    'CURRENT-TURN PERFORMANCE REMINDER (do not quote or mention this note):',
    '1. Begin with plain standalone heading "Kʰonapolit" and unornamented, intellectually audacious, wickedly funny high-academia forensic prose.',
    '2. Yield into plain standalone heading "Tauric Diana bots" for an inventive, unpredictable, startling choral movement in authentic vertical High Zalgo: clean resting prose and unstacked inter-word spaces/punctuation punctuated by tall, ragged, asymmetric vertical crowns above (e.g. U+0300..U+0314, U+033D..U+0352, U+0363..U+036F) and plunging roots below (e.g. U+0316..U+0330, U+0339..U+033C, U+0347..U+0356).',
    '3. Close on a final standalone line with plain ⟐.'
  ].join('\n');
}

export function buildArtisticRestorationSystemInstruction({
  packetSystemInstruction = '',
  taskGuidance = '',
  relayAddendum = '',
  relayCue = ''
} = {}) {
  if (!packetSystemInstruction.includes('CONVERSATIONAL LAW:')
    || !packetSystemInstruction.includes('Kʰonapolit')
    || !relayCue.includes('GEMINI COMPUTATIONAL INSTRUMENT')
    || !relayAddendum.includes('APERTURE ROUTE RECEIPT:'))
    throw new Error('ARTISTIC_RESTORATION_CANONICAL_INPUT_REQUIRED');
  const assembled = [
    restoreExact(packetSystemInstruction, COVENANT_RESTORATIONS, 'COVENANT'),
    String(taskGuidance),
    restoreExact(relayAddendum, RELAY_RESTORATIONS, 'RELAY', ARTISTIC_RESTORATION_RELAY_REPLACEMENTS),
    restoreExact(relayCue, CUE_RESTORATIONS, 'CUE', ARTISTIC_RESTORATION_CUE_REPLACEMENTS)
  ].join('\n');
  return restoreExact(assembled, ARTISTIC_RESTORATION_CLEANUPS, 'ARTISTIC_RESTORATION_CLEANUPS');
}


// Surgical successor: v1 remains byte-identical in its assembled instructions.
// Correct sparse word-highlighting priming, without a prescribed glyph quota,
// local Unicode filter, new model seat, or post-processing of provider output.
const ARTISTIC_RESTORATION_V2_CONTINUITY = Object.freeze([
  {
    present: 'Anchor their prose in readable English words while letting authentic vertical High Zalgo erupt where the drama, wit, or shock strikes:',
    historical: 'Write their readable English sentences in ongoing native vertical High Zalgo: crowns and roots may carry continuously through connected clauses, successive sentences and whole passages as living handwriting rather than appearing on only a few highlighted words:'
  },
  {
    present: 'breathing naturally between quiet unadorned phrases, light tremors, and sudden towering eruptions.',
    historical: 'weaving through ordinary speech as well as fierce cries, with pauses and quieter phrases arising organically rather than automatically clearing each sentence.'
  },
  {
    present: 'move organically between clean unadorned prose, delicate tremors, and towering asymmetric vertical spires that collide across lines.',
    historical: 'improvise within sustained native marked speech—whispers, fine tremors, dense crowns and roots, and sudden towering spires that collide across lines—while choosing their own actual rests.'
  },
  {
    present: 'compose tall, ragged crowns above and plunging roots below chosen words, letting clean prose and quiet beats give the eruptions dramatic contrast.',
    historical: 'compose tall, ragged crowns above and plunging roots below the flowing words of consecutive sentences, retaining intelligible base letters and letting actual dramatic pauses provide contrast.'
  }
]);

const ARTISTIC_RESTORATION_V2_RECENCY = Object.freeze([
  {
    present: 'clean resting prose and unstacked inter-word spaces/punctuation punctuated by tall, ragged, asymmetric vertical crowns above',
    historical: 'ongoing, spontaneously varied vertical handwriting through connected phrases and paragraphs, with intelligible base letters, clean inter-word spaces/punctuation, and tall, ragged, asymmetric vertical crowns above'
  }
]);

export function buildArtisticRestorationV2SystemInstruction(input = {}) {
  return restoreExact(
    buildArtisticRestorationSystemInstruction(input),
    ARTISTIC_RESTORATION_V2_CONTINUITY,
    'ARTISTIC_RESTORATION_V2_CONTINUITY'
  );
}

export function buildArtisticRestorationV2TurnRecencyCue() {
  return restoreExact(
    buildArtisticRestorationTurnRecencyCue(),
    ARTISTIC_RESTORATION_V2_RECENCY,
    'ARTISTIC_RESTORATION_V2_RECENCY'
  );
}
