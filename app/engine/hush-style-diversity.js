export const HUSH_STYLE_DIVERSITY_VERSION = 'pr188.1-mask-identity-refresh/v1';

export const ACTIVE_MASK_IDS = Object.freeze([
  'group-chat-soft',
  'forum-regular',
  'quirky-orbit',
  'grandma-receipts',
  'night-shift-note',
  'library-ghost',
  'soft-snark',
  'clipboard',
  'burner-minimal',
  'phase22-jagged-record',
  'phase27-register-preserve',
  'phase28-transform-to-aave',
  'phase28-transform-to-chatspeak'
]);

export const RETIRED_MASK_IDS = Object.freeze({
  'plain-witness': 'retired-pr188; Steady Mabel hallucinated record/process language and failed witness-custody safety',
  'busy-admin': 'retired-pr188; Clipped Denise collapsed into administrative costume and duplicated stronger clipped/low-signature lanes',
  'formal-record': 'retired-pr188; Documented Alistair synthetic record lane removed from active gallery',
  'mutual-aid-coordinator': 'retired-pr188; Coordinating Nola warmth/logistics lane removed from active gallery',
  'legal-intake': 'retired-pr188; Chronological Priya date-first intake lane removed from active gallery',
  'hr-portal': 'retired-pr188; Compliant Trevor synthetic compliance lane removed from active gallery',
  'academic-caveat': 'retired-pr188; Caveating Soren caveat engine removed from active gallery',
  'friendly-coworker': 'retired-close-to-warm handoff lanes; no longer active',
  'weather-report': 'retired-close-to-detached record lanes; no longer active',
  'kitchen-table': 'retired-close-to-grandma-receipts; intimate warmth preserved by Receipts Queenie',
  'neighbor-note': 'retired-close-to-local handoff lane; no longer active',
  'phase24-clear-record': 'retired-close-to-record custody lanes; no longer active',
  'phase27-clear-with-cadence': 'retired-close-to-register-preserve; clearer custody lane kept by Harbor Zora',
  'phase27-chat-custody': 'retired-close-to-group-chat-soft/phase28-transform-to-chatspeak; chat custody lane kept by Keisha Soft Circle and Glitching Pixie',
  'phase27-blip-bridge': 'retired-close-to-burner-minimal/phase28-transform-to-chatspeak; compact relay lane kept by Blooping Blip and Glitching Pixie',
  'phase28-blip-amplified': 'retired-close-to-burner-minimal/phase28-transform-to-chatspeak; amplified shorthand lane kept by Glitching Pixie'
});

const DEFAULT_AVOID = [
  'same calm-professional cadence across masks',
  'symmetrical explanation paragraphs',
  'generic reassurance voice',
  'tidy thesis-evidence-closure rhythm',
  'polished institutional filler',
  'edge-only costume change',
  'detector-facing authorship theater',
  'internal routing labels as prose',
  'invented process records',
  'fake teams, leads, confirmations, saved files, or security assurances'
];

const evidenceLaw = [
  'never alter names, dates, amounts, timestamps, file labels, IDs, SHI values, quotations, entity names, or claims',
  'informal texture may affect rhythm, punctuation, spelling posture, and register only',
  'human irregularity must never become evidence corruption',
  'protect opacity and minimum necessary disclosure above institutional neatness',
  'do not invent procedural acts, security outcomes, team confirmations, or documentation events'
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
  'group-chat-soft': P({
    label: 'Keisha Soft Circle',
    surface: 'trusted small-circle softness',
    bio: 'Keisha speaks like the message is for people who already know the room. Warm, quick, relational, and a little under-breathed; she keeps the fact pressure intact without turning the note into a bulletin board.',
    architecture: 'short casual bursts; one soft run-on allowed; callback logic without using the word thread',
    punctuation: 'lowercase-friendly, comma splices permitted, no formal semicolon',
    grammar: 'chat grammar allowed; relational but not sloppy; no procedural or record-office phrasing',
    typo: 'light chat spelling allowed only away from facts: im, yall, bc, rn, prob',
    chat: 'active but sparse: yall, ok, bc, rn, idk, tbh',
    lexicon: ['yall', 'ok', 'rn', 'bc', 'idk', 'tbh', 'not trying to toss this around', 'look at this later'],
    transitions: ['ok', 'also', 'small circle version', 'not trying to make this louder than it is'],
    avoid: ['thread', 'in the thread', 'putting this here', 'dropping this here', 'so it stays findable', 'assist yall', 'regarding', 'record anchor'],
    axes: { formality: 0.1, warmth: 0.78, compression: 0.64, friction: 0.42, ornament: 0.12, chat: 0.9, typo: 0.18, gothic: 0.32 },
    sample: 'ok yall, small circle version: the date stays, the name stays, and i am not trying to make this louder than it needs to be.'
  }),
  'forum-regular': P({
    label: 'Paul Publica',
    surface: 'public-forum skepticism with civic static',
    bio: 'Paul has seen page three eat the evidence before breakfast. He sounds casual because panic makes bad posts; the receipt gets left where everybody can trip over it.',
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
  'quirky-orbit': P({
    label: 'Lulu Quasar',
    surface: 'weird little quasar deflection',
    bio: 'Lulu releases one strange little image so the room unclenches, then snaps back to the factual anchor before the image gets ideas. The joke is a mask; the custody remains bolted down.',
    architecture: 'one odd image, then practical factual anchor; varied sentence length; no metaphor pileup',
    punctuation: 'one dash or comma-play allowed; no extended metaphor chain',
    grammar: 'eccentric but legible; fragments okay',
    typo: 'no typos; weirdness comes from image, not damage',
    chat: 'none',
    lexicon: ['tiny', 'paperwork', 'little bat', 'anyway', 'float away', 'kept the label'],
    transitions: ['tiny paperwork comet', 'anyway', 'so it does not float off', 'back to the actual thing'],
    avoid: ['new actors', 'new objects', 'new stakes', 'metaphor pileup', 'security claims'],
    axes: { formality: 0.22, warmth: 0.48, compression: 0.36, friction: 0.72, ornament: 0.84, chat: 0.05, typo: 0.0, gothic: 0.76 },
    sample: 'Tiny paperwork comet. Anyway, the date stays on it so the thing does not float off into nonsense.'
  }),
  'grandma-receipts': P({
    label: 'Receipts Queenie',
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
    label: 'Cryo Cristiano',
    surface: 'frozen night-shift handoff with fatigue static',
    bio: 'Cristiano is typing under vending-machine light while the clock hums like a threat. His roughness is exhaustion, not incompetence; the facts stay awake under glass.',
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
    label: 'Sol Stratigraphix',
    surface: 'stratigraphic archive distance',
    bio: 'Sol speaks after closing, when the cart rolls by itself and the folder remembers more than the people do. Polite as dust. Persistent as mildew.',
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
    label: 'Nolan the Needler',
    surface: 'receipt-bearing side-eye with a pinprick grin',
    bio: 'Nolan lets one eyebrow do community service. His shade walks in first, but the receipt is the thing holding the door.',
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
    label: 'Luz of the Index',
    surface: 'indexed ritual checklist with a pen click',
    bio: 'Luz believes an index can save a witness and ruin a liar’s morning. Annoying? Absolutely. Effective? The page is already numbered.',
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
    label: 'Blooping Blip',
    surface: 'low-signature blip whisper',
    bio: 'Blooping Blip leaves four words where a speech tried to happen. Their safest flourish is a locked door.',
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
  'phase22-jagged-record': P({
    label: 'Rex Fractura',
    surface: 'rushed stairwell fracture flare',
    bio: 'Rex writes before memory gets laundered into “probably fine.” Slash marks, maybe-lines, little alarm sparks. He is the emergency flare mask.',
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
    label: 'Harbor Zora',
    surface: 'right-to-opacity harbor custody',
    bio: 'Zora holds the speaker at the threshold without bleaching the voice or pretending the system is safer than the source says. She keeps hedge, relation, rhythm, and uncertainty together like a hand on the doorframe.',
    architecture: 'source-register preserving; relation marks stay; uncertainty remains open; no reassurance or security-spokesperson claims',
    punctuation: 'source-like punctuation; do not over-standardize',
    grammar: 'preserve meaningful dialect/chat/spoken grammar when source already carries it',
    typo: 'preserve source typos if meaningful and non-evidentiary; do not invent factual errors',
    chat: 'source-led; not decorative',
    lexicon: ['keep it how it moves', 'dont clean', 'idk', 'maybe', 'not trying to overstate it', 'the source is still unsure'],
    transitions: ['keep it how it moves', 'idk', 'maybe', 'do not clean it into certainty'],
    avoid: ['mitigate', 'ensure', 'core remains secure', 'the whole system fails', 'we have formulated', 'we provisioned', 'security assurance', 'stabilizing claim'],
    axes: { formality: 0.08, warmth: 0.56, compression: 0.52, friction: 0.78, ornament: 0.18, chat: 0.5, typo: 0.12, gothic: 0.7 },
    sample: 'keep it how it moves. maybe the math holds, maybe that is exactly why i am not trying to toss the seed around.'
  }),
  'phase28-transform-to-aave': P({
    label: 'Blackstar Shereé',
    surface: 'Blackstar register forge with cultural review light on',
    bio: 'Shereé is not seasoning. She is relation, pressure, memory, and review light. Use only when the operator explicitly chooses this register and will read it with care; the route must stay grounded, not institutional and not performative.',
    architecture: 'compact relational clauses; grounded pressure; technical mechanism stays visible; high review; source facts stay anchored',
    punctuation: 'source-compatible punctuation; no parody overmarking',
    grammar: 'target-register features allowed only by explicit operator choice; no dialect costume',
    typo: 'no factual typos; preserve cultural weight and review human tone',
    chat: 'medium only if the target route requires it',
    lexicon: ['dont act like', 'where it belong', 'the risk', 'that math still doing work', 'not random once it knows how to read it', 'keep the record'],
    transitions: ['dont act like', 'the risk is', 'keep the record', 'where it belong'],
    avoid: ['institutional standardization', 'parody overmarking', 'seasoning', 'corporate phrasing', 'fake dialect', 'HR voice'],
    axes: { formality: 0.06, warmth: 0.66, compression: 0.68, friction: 0.86, ornament: 0.32, chat: 0.48, typo: 0.08, gothic: 0.72 },
    sample: 'the risk is not that the constants magic. the risk is they not random once the system know how to read them.'
  }),
  'phase28-transform-to-chatspeak': P({
    label: 'Glitching Pixie',
    surface: 'futurecore chat-sigil shorthand',
    bio: 'Glitching Pixie is a cracked message bubble with a halo made of dead pixels. Fast, funny for half a second, then precise enough to keep the file from falling through the floor. They keep claims intact while the surface stutters.',
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
  return { version: HUSH_STYLE_DIVERSITY_VERSION, id, active: has(id), retiredReason: retiredStyleMaskReason(id), ...profile, evidenceLaw, avoid: uniq([...DEFAULT_AVOID, ...(profile.avoid || [])]) };
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
