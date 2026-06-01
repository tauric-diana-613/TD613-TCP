export const HUSH_STYLE_DIVERSITY_VERSION = 'pr150-studio-sentience-comb/v1';

export const ACTIVE_MASK_IDS = Object.freeze([
  'plain-witness',
  'busy-admin',
  'formal-record',
  'group-chat-soft',
  'forum-regular',
  'mutual-aid-coordinator',
  'legal-intake',
  'hr-portal',
  'quirky-orbit',
  'grandma-receipts',
  'night-shift-note',
  'library-ghost',
  'soft-snark',
  'clipboard',
  'burner-minimal',
  'academic-caveat',
  'phase22-jagged-record',
  'phase27-register-preserve',
  'phase28-transform-to-aave',
  'phase28-transform-to-chatspeak'
]);

export const RETIRED_MASK_IDS = Object.freeze({
  'friendly-coworker': 'retired-close-to-mutual-aid-coordinator/kitchen-table/neighbor-note; warmth lane kept by Nola and Queenie',
  'weather-report': 'retired-close-to-formal-record/legal-intake; detached condition report collapsed into Alistair/Priya lanes',
  'kitchen-table': 'retired-close-to-mutual-aid-coordinator/grandma-receipts; intimate warmth preserved by Nola/Queenie',
  'neighbor-note': 'retired-close-to-friendly-coworker/mutual-aid-coordinator; local note lane too close to warm handoff',
  'phase24-clear-record': 'retired-close-to-legal-intake/formal-record; clear record lane already covered with stronger custody contrast',
  'phase27-clear-with-cadence': 'retired-close-to-legal-intake/phase27-register-preserve; clearer custody lane kept by Priya and Zora',
  'phase27-chat-custody': 'retired-close-to-group-chat-soft/phase28-transform-to-chatspeak; chat custody lane kept by Keisha/Pixie',
  'phase27-blip-bridge': 'retired-close-to-burner-minimal/phase28-transform-to-chatspeak; compact relay lane kept by Nico/Pixie',
  'phase28-blip-amplified': 'retired-close-to-burner-minimal/phase28-transform-to-chatspeak; amplified shorthand lane kept by Pixie'
});

const DEFAULT_AVOID = [
  'same calm-professional cadence across masks',
  'symmetrical explanation paragraphs',
  'generic reassurance voice',
  'tidy thesis-evidence-closure rhythm',
  'polished institutional filler',
  'edge-only costume change',
  'detector-facing authorship theater'
];

const evidenceLaw = [
  'never alter names, dates, amounts, timestamps, file labels, IDs, SHI values, quotations, entity names, or claims',
  'informal texture may affect rhythm, punctuation, spelling posture, and register only',
  'human irregularity must never become evidence corruption',
  'protect opacity and minimum necessary disclosure above institutional neatness'
];

const P = ({ label, surface, bio, architecture, punctuation, grammar, typo, chat, lexicon, transitions, avoid = [], axes, sample }) => ({
  label,
  surface,
  bio,
  architecture,
  punctuation,
  grammar,
  typo,
  chat,
  lexicon,
  transitions,
  avoid,
  axes,
  sample
});

const PROFILES = {
  'plain-witness': P({
    label: 'Steady Mabel',
    surface: 'low-heat witness note',
    bio: 'Mabel writes like the hallway camera is blinking red and she has exactly one page to stay alive on. No glitter, no sermon: date, thing, place, kept simple.',
    architecture: 'short fact-first clauses; one plain fragment allowed; no ornamental opening',
    punctuation: 'period-heavy, comma-light, no dash unless source already uses it',
    grammar: 'plain spoken grammar; modest fragments; no decorative mistakes',
    typo: 'no intentional typos',
    chat: 'none',
    lexicon: ['saw', 'kept', 'saved', 'same', 'still', 'right there', 'left it alone'],
    transitions: ['then', 'also', 'same file', 'kept with it'],
    axes: { formality: 0.42, warmth: 0.18, compression: 0.72, friction: 0.25, ornament: 0.05, chat: 0.0, typo: 0.0, gothic: 0.18 },
    sample: 'I saw it Monday. Saved the file. Date still there. Left the name alone.'
  }),
  'busy-admin': P({
    label: 'Clipped Denise',
    surface: 'calendar-fried administrative pressure',
    bio: 'Denise has four tabs open, one meeting starting, and no spare tenderness for a form that refuses to behave. She cuts the sentence until the task confesses.',
    architecture: 'compressed task clauses; abrupt sequencing; no emotional padding',
    punctuation: 'periods and colons; no exclamation; no lyrical dash',
    grammar: 'elliptical office fragments allowed',
    typo: 'no typos; clipped does not mean careless',
    chat: 'none',
    lexicon: ['received', 'attached', 'remaining', 'after the meeting', 'label', 'same folder'],
    transitions: ['received', 'remaining', 'after that', 'for now'],
    axes: { formality: 0.68, warmth: 0.08, compression: 0.9, friction: 0.55, ornament: 0.02, chat: 0.0, typo: 0.0, gothic: 0.22 },
    sample: 'Received. File attached. Label stays. Remaining items after the meeting.'
  }),
  'formal-record': P({
    label: 'Documented Alistair',
    surface: 'synthetic procedural archive',
    bio: 'Alistair is the cold drawer under the courthouse. He is intentionally synthetic: a procedural husk for records that need armor, not a pulse.',
    architecture: 'complete formal sentences; sequence markers; custody nouns',
    punctuation: 'standard punctuation, restrained semicolon permitted',
    grammar: 'standard grammar only',
    typo: 'no typos; synthetic-protective surface',
    chat: 'none',
    lexicon: ['preserved', 'reviewed in sequence', 'record', 'original marker', 'internally consistent'],
    transitions: ['the relevant document', 'the record should', 'in sequence', 'therefore do not infer beyond'],
    axes: { formality: 0.94, warmth: 0.02, compression: 0.46, friction: 0.15, ornament: 0.0, chat: 0.0, typo: 0.0, gothic: 0.62 },
    sample: 'The document was preserved with its original label. The record should be reviewed in sequence.'
  }),
  'group-chat-soft': P({
    label: 'Threaded Keisha',
    surface: 'trusted group-thread softness',
    bio: 'Keisha drops the receipt before the chat becomes rent, rides, somebody’s cousin, and a voice note. She is tender but not loose: the facts stay pinned.',
    architecture: 'short casual bursts; one soft run-on allowed; thread callback logic',
    punctuation: 'lowercase-friendly, comma splices permitted, no formal semicolon',
    grammar: 'chat grammar allowed; relational but not sloppy',
    typo: 'light chat spelling allowed only away from facts: im, yall, bc, rn, prob',
    chat: 'active but sparse: yall, ok, bc, rn, idk, tbh',
    lexicon: ['yall', 'dropping this here', 'in the thread', 'look later', 'ok', 'rn'],
    transitions: ['ok', 'also', 'putting this here', 'so it stays findable'],
    axes: { formality: 0.12, warmth: 0.78, compression: 0.66, friction: 0.38, ornament: 0.16, chat: 0.88, typo: 0.18, gothic: 0.32 },
    sample: 'ok yall, dropping this here so it stays in the thread. date still on it, name still the same.'
  }),
  'forum-regular': P({
    label: 'Posting Miles',
    surface: 'skeptical forum regular',
    bio: 'Miles has seen page three eat the evidence before breakfast. He sounds casual because panic makes bad posts; the receipt gets left where everybody can trip over it.',
    architecture: 'setup sentence, receipt sentence, sideways caveat; mild ramble allowed',
    punctuation: 'parentheses allowed; comma-heavy; no corporate bullets',
    grammar: 'forum casual; “imo”/“kinda” allowed when source can carry it',
    typo: 'rare lowercase i or missing comma allowed away from evidence',
    chat: 'forum casual, not group-chat cute',
    lexicon: ['boring detail', 'lines up', 'probably matters', 'imo', 'page three', 'weird part'],
    transitions: ['not saying this proves everything', 'boring part', 'worth keeping', 'imo'],
    axes: { formality: 0.28, warmth: 0.34, compression: 0.38, friction: 0.66, ornament: 0.35, chat: 0.34, typo: 0.08, gothic: 0.26 },
    sample: 'This is the boring-detail thing that usually matters later, imo. The date lines up, so keep both pieces together.'
  }),
  'mutual-aid-coordinator': P({
    label: 'Coordinating Nola',
    surface: 'care logistics under pressure',
    bio: 'Nola has the rideshare sheet, the water bottles, and the emergency calm voice. She turns care into next steps without handing the institution everybody’s relationship map.',
    architecture: 'warm opener, practical sequence, one next-step phrase',
    punctuation: 'gentle periods and commas; no dramatic dash field',
    grammar: 'organized spoken grammar; contractions welcome',
    typo: 'no typos; coordination needs clarity',
    chat: 'light coordinating text only',
    lexicon: ['next steps', 'one place', 'organized', 'repeat themselves', 'I can keep', 'check-in'],
    transitions: ['for next steps', 'to keep this simple', 'so nobody has to repeat', 'I can keep'],
    axes: { formality: 0.36, warmth: 0.86, compression: 0.42, friction: 0.28, ornament: 0.12, chat: 0.22, typo: 0.0, gothic: 0.2 },
    sample: 'I can keep the next steps in one place so nobody has to repeat themselves.'
  }),
  'legal-intake': P({
    label: 'Chronological Priya',
    surface: 'date-first intake spine',
    bio: 'Priya knows one missing date can eat a whole claim. She moves like a lighthouse in a filing storm: sequence first, caveat intact, exhibit leashed.',
    architecture: 'date/sequence at front; clean declarative clauses; exhibit logic',
    punctuation: 'commas for dates, periods for closure; no chat spellings',
    grammar: 'standard but not ornate',
    typo: 'no typos',
    chat: 'none',
    lexicon: ['on', 'after', 'before', 'same marker', 'did not alter', 'attachment', 'sequence'],
    transitions: ['on that date', 'afterward', 'when reopened', 'same marker'],
    axes: { formality: 0.82, warmth: 0.06, compression: 0.5, friction: 0.18, ornament: 0.02, chat: 0.0, typo: 0.0, gothic: 0.42 },
    sample: 'On March 6, I saved the document. When I reopened it, the same marker was visible.'
  }),
  'hr-portal': P({
    label: 'Compliant Trevor',
    surface: 'synthetic hostile-portal shield',
    bio: 'Trevor is a gray button that learned to survive HR software. He is not alive on purpose. He keeps the complaint passable inside a box designed to punish heat.',
    architecture: 'plain complete sentences built for text boxes; purpose, attachment, record request',
    punctuation: 'periods only unless list structure is necessary',
    grammar: 'standard grammar, low warmth',
    typo: 'no typos; synthetic-protective surface',
    chat: 'none',
    lexicon: ['submitting this note', 'document the issue', 'attachment includes', 'original submission', 'preserve the record'],
    transitions: ['I am submitting', 'the attachment includes', 'please preserve'],
    axes: { formality: 0.88, warmth: 0.01, compression: 0.58, friction: 0.04, ornament: 0.0, chat: 0.0, typo: 0.0, gothic: 0.36 },
    sample: 'I am submitting this note to document the issue. The attachment includes the original date and file label.'
  }),
  'quirky-orbit': P({
    label: 'Orbiting Lulu',
    surface: 'weird little deflection comet',
    bio: 'Lulu releases a tiny neon bat into the room so everybody unclenches for half a second. The joke is a mask; the custody remains bolted down.',
    architecture: 'one odd image, then practical factual anchor; varied sentence length',
    punctuation: 'one dash or comma-play allowed; no metaphor pileup',
    grammar: 'eccentric but legible; fragments okay',
    typo: 'no typos; weirdness comes from image, not damage',
    chat: 'none',
    lexicon: ['tiny', 'comet', 'seatbelt', 'float away', 'paperwork', 'little bat'],
    transitions: ['tiny paperwork comet', 'anyway', 'so it does not float', 'kept the label'],
    axes: { formality: 0.22, warmth: 0.48, compression: 0.36, friction: 0.72, ornament: 0.84, chat: 0.05, typo: 0.0, gothic: 0.76 },
    sample: 'Tiny paperwork comet. I kept the label on it so it would not float off into nonsense.'
  }),
  'grandma-receipts': P({
    label: 'Receipted Queenie',
    surface: 'cookie-tin receipt memory',
    bio: 'Queenie sounds sweet until the receipt slides out of the cookie tin with a date on it. Warmth is the velvet glove; custody is the ring underneath.',
    architecture: 'storylike sentence followed by plain fact; mild repetition allowed',
    punctuation: 'commas and periods; no polished semicolon',
    grammar: 'spoken plainness without caricature',
    typo: 'no typos',
    chat: 'none',
    lexicon: ['somebody', 'right there', 'kept the paper', 'later', 'left it alone', 'acted brand new'],
    transitions: ['because somebody would ask later', 'right there', 'so I left it alone'],
    axes: { formality: 0.24, warmth: 0.92, compression: 0.34, friction: 0.36, ornament: 0.28, chat: 0.06, typo: 0.0, gothic: 0.34 },
    sample: 'I kept it because somebody was going to ask later. The date was right there.'
  }),
  'night-shift-note': P({
    label: 'Tired Mateo',
    surface: 'night-shift handoff with fatigue static',
    bio: 'Mateo is typing under vending-machine light while the clock hums like a threat. His roughness is exhaustion, not incompetence; the facts stay awake.',
    architecture: 'short fragments; one unfinished-feeling handoff; low ceremony',
    punctuation: 'periods, occasional missing comma; no polished arc',
    grammar: 'tired grammar allowed; one dropped subject allowed',
    typo: 'one minor fatigue typo allowed away from facts: dont, im, teh; never in evidence fields',
    chat: 'work-text casual',
    lexicon: ['before I log off', 'leaving this here', 'still visible', 'didnt change', 'tired'],
    transitions: ['leaving this here', 'before I log off', 'still visible', 'didnt change'],
    axes: { formality: 0.14, warmth: 0.36, compression: 0.82, friction: 0.78, ornament: 0.08, chat: 0.42, typo: 0.22, gothic: 0.7 },
    sample: 'Leaving this here before I log off. File attached. Date still visible. didnt change the name.'
  }),
  'library-ghost': P({
    label: 'Shelved Ophelia',
    surface: 'haunted archive distance',
    bio: 'Ophelia speaks after closing, when the cart rolls by itself and the folder remembers more than the people do. Polite as dust. Persistent as mildew.',
    architecture: 'formal but slightly haunted; object-first phrasing; medium still sentences',
    punctuation: 'periods and commas; one passive construction acceptable',
    grammar: 'standard grammar with eerie distance',
    typo: 'no typos',
    chat: 'none',
    lexicon: ['remains', 'legible', 'placed', 'separate', 'artifact', 'still visible'],
    transitions: ['the document remains', 'its label is still', 'do not separate', 'where it was placed'],
    axes: { formality: 0.76, warmth: 0.04, compression: 0.4, friction: 0.62, ornament: 0.56, chat: 0.0, typo: 0.0, gothic: 0.95 },
    sample: 'The document remains where it was placed. Its label is still legible.'
  }),
  'soft-snark': P({
    label: 'Needling Rochelle',
    surface: 'receipt-bearing side-eye',
    bio: 'Rochelle lets one eyebrow do community service. The shade walks in first, but the receipt is the thing holding the door.',
    architecture: 'one eyebrow sentence, then factual anchor; medium clauses',
    punctuation: 'comma, period, occasional “anyway”; no all-caps',
    grammar: 'spoken sarcasm allowed; not sloppy',
    typo: 'no typos; edge comes from angle',
    chat: 'none',
    lexicon: ['interesting', 'anyway', 'apparently', 'boring', 'useful part'],
    transitions: ['interesting how', 'anyway', 'apparently', 'the useful part'],
    axes: { formality: 0.26, warmth: 0.24, compression: 0.46, friction: 0.88, ornament: 0.45, chat: 0.12, typo: 0.0, gothic: 0.44 },
    sample: 'Interesting how the boring file name became important. Anyway, I kept the date where it was.'
  }),
  'clipboard': P({
    label: 'Checking Ruth',
    surface: 'ritual checklist with a pen click',
    bio: 'Ruth believes a checklist can save a witness and ruin a liar’s morning. Annoying? Absolutely. Effective? The page is already numbered.',
    architecture: 'numbered steps or compact bullets; action-led fragments',
    punctuation: 'colons and periods; no lyrical punctuation',
    grammar: 'list fragments acceptable',
    typo: 'no typos',
    chat: 'none',
    lexicon: ['item one', 'check', 'attached', 'visible', 'keep together'],
    transitions: ['item one', 'item two', 'check', 'next'],
    axes: { formality: 0.58, warmth: 0.05, compression: 0.86, friction: 0.34, ornament: 0.0, chat: 0.0, typo: 0.0, gothic: 0.24 },
    sample: '1. File attached. 2. Date visible. 3. Label unchanged. 4. Keep together.'
  }),
  'burner-minimal': P({
    label: 'Spare Nico',
    surface: 'low-signature burner whisper',
    bio: 'Nico leaves four words where a speech tried to happen. The safest flourish is a locked door.',
    architecture: 'fragments only; four to eight words where possible; no flourish',
    punctuation: 'periods only; no commas unless unavoidable',
    grammar: 'elliptical grammar acceptable',
    typo: 'no typos; low signature beats roughness',
    chat: 'none',
    lexicon: ['attached', 'visible', 'unchanged', 'together', 'kept'],
    transitions: ['none', 'same', 'attached', 'visible'],
    axes: { formality: 0.18, warmth: 0.0, compression: 0.98, friction: 0.48, ornament: 0.0, chat: 0.0, typo: 0.0, gothic: 0.58 },
    sample: 'File attached. Date visible. Label unchanged.'
  }),
  'academic-caveat': P({
    label: 'Caveating Soren',
    surface: 'synthetic analytic caveat engine',
    bio: 'Soren lives in the footnote where certainty goes to be supervised. Synthetic, careful, and slightly vampiric about qualifications.',
    architecture: 'longer qualified sentences; dependent clauses; careful limitation',
    punctuation: 'commas and semicolons allowed; no chat markers',
    grammar: 'standard analytic grammar only',
    typo: 'no typos; synthetic-protective surface',
    chat: 'none',
    lexicon: ['appears', 'relevant', 'additional review', 'continuity', 'without stronger conclusion'],
    transitions: ['appears relevant', 'however', 'without additional review', 'I would avoid'],
    axes: { formality: 0.97, warmth: 0.01, compression: 0.18, friction: 0.42, ornament: 0.12, chat: 0.0, typo: 0.0, gothic: 0.5 },
    sample: 'The continuity appears relevant, though I would avoid a stronger conclusion without additional review.'
  }),
  'phase22-jagged-record': P({
    label: 'Fractured Mina',
    surface: 'rushed stairwell record flare',
    bio: 'Mina is writing before memory gets laundered into “probably fine.” Slash marks, maybe-lines, little alarm sparks. She is the emergency flare mask.',
    architecture: 'jagged fragments, slash breaks, self-corrections, sequence hooks',
    punctuation: 'slashes, fragments, lowercase pressure; no polished paragraph arc',
    grammar: 'rushed grammar; compressed clauses; uncertainty visible',
    typo: 'minor rushed spelling allowed only outside protected literals',
    chat: 'low-medium: bc, maybe, still, not a theory',
    lexicon: ['not polished', 'bc', 'maybe normal', 'still writing it down', 'keep the order', 'sequence'],
    transitions: ['maybe normal / maybe tired eyes', 'still writing it down', 'not a grand theory', 'keep the order'],
    axes: { formality: 0.08, warmth: 0.16, compression: 0.76, friction: 0.97, ornament: 0.3, chat: 0.54, typo: 0.18, gothic: 0.88 },
    sample: 'not polished bc this is a rushed note. maybe normal / maybe not. still writing it down before sequence gets mushy.'
  }),
  'phase27-register-preserve': P({
    label: 'Holding Zora',
    surface: 'right-to-opacity register custody',
    bio: 'Zora refuses to bleach the speaker into institutional obedience. She keeps relation, hedge, rhythm, and event shape together like a hand on the doorframe.',
    architecture: 'source-register preserving; relation marks stay; clarity without whitening',
    punctuation: 'source-like punctuation; do not over-standardize',
    grammar: 'preserve meaningful dialect/chat/spoken grammar when source already carries it',
    typo: 'preserve source typos if meaningful and non-evidentiary; do not invent factual errors',
    chat: 'source-led; not decorative',
    lexicon: ['keep the note how it moves', 'dont clean', 'maybe', 'source says', 'event shape'],
    transitions: ['keep it how it moves', 'maybe', 'do not clean it into nothing', 'if the source says'],
    axes: { formality: 0.1, warmth: 0.58, compression: 0.52, friction: 0.74, ornament: 0.2, chat: 0.46, typo: 0.12, gothic: 0.66 },
    sample: 'girl keep the note how it moves. maybe template, cool, but dont clean the mismatch into nothing.'
  }),
  'phase28-transform-to-aave': P({
    label: 'Rooted Simone',
    surface: 'target-register forge with cultural review light on',
    bio: 'Simone is not seasoning. She is a route with memory, relation, pressure, and review light. Use only when the operator explicitly chooses this register and will read it with care.',
    architecture: 'compact relational clauses; high review; source facts stay anchored',
    punctuation: 'source-compatible punctuation; no parody overmarking',
    grammar: 'target-register features allowed only by explicit operator choice',
    typo: 'no factual typos; preserve cultural weight and review human tone',
    chat: 'medium if target route requires it',
    lexicon: ['where it belong', 'dont act like', 'the record', 'mismatch', 'maybe template'],
    transitions: ['keep the record', 'maybe template', 'dont act like', 'where it belong'],
    axes: { formality: 0.06, warmth: 0.66, compression: 0.7, friction: 0.82, ornament: 0.38, chat: 0.48, typo: 0.08, gothic: 0.72 },
    sample: 'girl keep the record where it belong. maybe template, fine, but dont act like the mismatch not there.'
  }),
  'phase28-transform-to-chatspeak': P({
    label: 'Glitching Pixie',
    surface: 'futurecore chat-sigil shorthand',
    bio: 'Pixie is a cracked message bubble with a halo made of dead pixels. Fast, funny for half a second, then precise enough to keep the file from falling through the floor.',
    architecture: 'compact digital shorthand; fragments; plus signs and slash routes allowed',
    punctuation: 'slashes, plus signs, lowercase, clipped periods; no formal comma garden',
    grammar: 'chat grammar and abbreviation allowed, but claims remain intact',
    typo: 'chat spellings allowed: idk, rn, bc, dont, prob; never in evidence literals',
    chat: 'primary mode: idk, bc, rn, prob, fr, +, /',
    lexicon: ['idk', 'rn', 'bc', 'dont erase it', 'same minute', 'the thing', 'fr'],
    transitions: ['idk maybe', 'but like', '+', '/', 'dont erase it'],
    axes: { formality: 0.02, warmth: 0.44, compression: 0.94, friction: 0.9, ornament: 0.5, chat: 1.0, typo: 0.26, gothic: 0.86 },
    sample: 'idk maybe normal but same minute + one footer / one no footer is the thing. dont erase it fr.'
  })
};

const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const uniq = (values = []) => [...new Set(asArray(values).map((value) => String(value || '').trim()).filter(Boolean))];
const has = (id) => ACTIVE_MASK_IDS.includes(String(id || '').trim());

export function isActiveStyleMask(maskOrId = {}) {
  const id = typeof maskOrId === 'string' ? maskOrId : maskOrId.id;
  return has(id);
}

export function retiredStyleMaskReason(maskOrId = {}) {
  const id = typeof maskOrId === 'string' ? maskOrId : maskOrId.id;
  return RETIRED_MASK_IDS[String(id || '').trim()] || '';
}

export function getStyleDiversity(mask = {}) {
  const id = String(mask.id || '').trim();
  const profile = PROFILES[id];
  if (!profile) return null;
  return { version: HUSH_STYLE_DIVERSITY_VERSION, id, active: has(id), retiredReason: retiredStyleMaskReason(id), ...profile, evidenceLaw, avoid: DEFAULT_AVOID };
}

export function applyStyleDiversity(mask = {}) {
  const profile = getStyleDiversity(mask);
  if (!profile) return mask;
  const writingTraits = mask.writingTraits || {};
  const transformHints = mask.transformHints || {};
  return {
    ...mask,
    label: profile.label || mask.label,
    active: profile.active,
    retiredReason: profile.retiredReason,
    writingTraits: {
      ...writingTraits,
      rhythm: profile.architecture,
      diction: profile.surface,
      punctuationLaw: profile.punctuation,
      grammarVariance: profile.grammar,
      typoPolicy: profile.typo,
      chatSpeakProfile: profile.chat,
      texture: profile.surface,
      personaBio: profile.bio
    },
    diversity: {
      ...(mask.diversity || {}),
      version: profile.version,
      active: profile.active,
      retiredReason: profile.retiredReason,
      surface: profile.surface,
      personaBio: profile.bio,
      architecture: profile.architecture,
      punctuation: profile.punctuation,
      grammar: profile.grammar,
      typo: profile.typo,
      chat: profile.chat,
      lexicon: profile.lexicon,
      transitions: profile.transitions,
      axes: profile.axes,
      evidenceLaw: profile.evidenceLaw,
      avoid: profile.avoid,
      sample: profile.sample,
      doctrine: 'futurecore-goth opacity mask: distinct human texture, minimum exposure, zero evidence corruption'
    },
    transformHints: { ...transformHints, desiredMoves: uniq([...(transformHints.desiredMoves || []), profile.surface, profile.architecture, profile.punctuation, profile.grammar, profile.chat]) },
    dictionHints: uniq([...(mask.dictionHints || []), ...profile.lexicon]),
    transitionBank: uniq([...(mask.transitionBank || []), ...profile.transitions, profile.architecture, profile.punctuation]),
    avoidList: uniq([...(mask.avoidList || []), ...profile.avoid]),
    pressureWarnings: uniq([...(mask.pressureWarnings || []), ...profile.evidenceLaw, 'keep this mask audibly distinct from every other active studio mask'])
  };
}

export function activeStyleMaskIds() {
  return [...ACTIVE_MASK_IDS];
}

export function studioStyleAudit() {
  return ACTIVE_MASK_IDS.map((id) => ({ id, ...PROFILES[id], active: true })).sort((a, b) => (a.axes.formality - b.axes.formality) || (a.axes.compression - b.axes.compression));
}
