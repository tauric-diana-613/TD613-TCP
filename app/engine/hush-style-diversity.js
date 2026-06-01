export const HUSH_STYLE_DIVERSITY_VERSION = 'pr149-style-diversity/v1';

const DEFAULT_AVOID = [
  'same calm-professional cadence across masks',
  'symmetrical explanation paragraphs',
  'generic reassurance voice',
  'tidy thesis-evidence-closure rhythm',
  'polished institutional filler'
];

const PROFILES = {
  'plain-witness': ['plain witness note', 'short fact-first clauses', 'periods dominate', ['saw', 'kept', 'saved', 'same', 'still']],
  'friendly-coworker': ['workplace sticky-note warmth', 'mid-length conversational handoff', 'soft commas', ['quick note', 'left it', 'later']],
  'busy-admin': ['clipped admin pressure', 'short task clauses', 'periods and colons', ['received', 'attached', 'remaining']],
  'formal-record': ['procedural record surface', 'complete formal sentences', 'standard punctuation', ['preserved', 'reviewed', 'record']],
  'group-chat-soft': ['informal thread message', 'short casual bursts', 'lowercase-friendly', ['dropping this here', 'thread', 'ok']],
  'forum-regular': ['skeptical forum note', 'setup plus receipt plus caveat', 'parenthetical asides', ['boring detail', 'lines up', 'probably matters']],
  'mutual-aid-coordinator': ['care logistics note', 'warm opener then practical sequence', 'gentle periods', ['next steps', 'one place', 'organized']],
  'legal-intake': ['chronology-first intake', 'date and sequence at front', 'date commas', ['on', 'after', 'before']],
  'hr-portal': ['flat compliance surface', 'plain complete sentences', 'periods only', ['submitting this note', 'document the issue']],
  'quirky-orbit': ['playful deflection with custody intact', 'one image then factual anchor', 'one dash allowed', ['tiny', 'comet', 'seatbelt']],
  'grandma-receipts': ['warm receipt keeper', 'storylike sentence then plain fact', 'spoken plainness', ['somebody', 'right there', 'kept the paper']],
  'night-shift-note': ['tired handoff', 'short fragments', 'rough but legible', ['before I log off', 'leaving this here', 'still visible']],
  'library-ghost': ['quiet archival distance', 'formal but still', 'still punctuation', ['remains', 'legible', 'placed']],
  'soft-snark': ['mild bite with receipt anchor', 'one eyebrow sentence then fact', 'anyway allowed', ['interesting', 'anyway', 'apparently']],
  'weather-report': ['detached condition report', 'short observational sentences', 'periods only', ['appears', 'noted', 'visible']],
  'kitchen-table': ['trusted kitchen-table steadiness', 'plain warm sentences with firm center', 'contractions welcome', ['plainly', 'that part matters']],
  'clipboard': ['checklist surface', 'numbered or compact steps', 'colons and periods', ['item one', 'check', 'attached']],
  'burner-minimal': ['low-signature confirmation', 'fragments only', 'sparse periods', ['attached', 'visible', 'unchanged']],
  'academic-caveat': ['analytic caveat surface', 'longer qualified sentences', 'commas and semicolons', ['appears', 'relevant', 'review']],
  'neighbor-note': ['ordinary local note', 'short everyday sentence then fact', 'casual commas', ['just leaving this here', 'easy to find']]
};

const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const uniq = (values = []) => [...new Set(asArray(values).map((value) => String(value || '').trim()).filter(Boolean))];

export function getStyleDiversity(mask = {}) {
  const row = PROFILES[String(mask.id || '').trim()];
  if (!row) return null;
  const [surface, architecture, punctuation, lexicon] = row;
  return { version: HUSH_STYLE_DIVERSITY_VERSION, surface, architecture, punctuation, lexicon, avoid: DEFAULT_AVOID };
}

export function applyStyleDiversity(mask = {}) {
  const profile = getStyleDiversity(mask);
  if (!profile) return mask;
  const writingTraits = mask.writingTraits || {};
  const transformHints = mask.transformHints || {};
  return {
    ...mask,
    writingTraits: {
      ...writingTraits,
      rhythm: writingTraits.rhythm || profile.architecture,
      diction: writingTraits.diction || profile.surface,
      punctuationLaw: writingTraits.punctuationLaw || profile.punctuation,
      texture: profile.surface
    },
    diversity: { ...(mask.diversity || {}), ...profile },
    transformHints: { ...transformHints, desiredMoves: uniq([...(transformHints.desiredMoves || []), profile.surface, profile.architecture, profile.punctuation]) },
    dictionHints: uniq([...(mask.dictionHints || []), ...profile.lexicon]),
    transitionBank: uniq([...(mask.transitionBank || []), profile.architecture, profile.punctuation]),
    avoidList: uniq([...(mask.avoidList || []), ...profile.avoid]),
    pressureWarnings: uniq([...(mask.pressureWarnings || []), 'keep this mask audibly distinct from the other gallery masks', 'informal texture may shape rhythm and punctuation; never damage facts, dates, names, amounts, file labels, or quoted material'])
  };
}
