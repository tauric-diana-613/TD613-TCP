export const HUSH_PROPOSITION_MAP_VERSION = 'phase-35-proposition-map';

const safe = (value) => String(value ?? '').trim();
const words = (value = '') => (safe(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []);
const uniq = (values = []) => [...new Set(values.filter(Boolean))];

const ADVICE_WORDS = /\b(should|need to|try|apply|learn|network|resume|portfolio|bootcamp|certification|mentor|job board|linkedin)\b/i;
const UNCERTAINTY_WORDS = /\b(wondering|whether|if|maybe|might|could|not sure|do not know|don't know|really|overthinking|seems|feels)\b/i;
const NEGATION_WORDS = /\b(no|not|never|without|cannot|can't|do not|don't|isn't|is not|wasn't|was not)\b/i;
const RECORD_WORDS = /\b(spreadsheet|deadline|edit|changed|file|record|document|invoice|form|report|note)\b/i;
const METAPHOR_WORDS = /\b(rose|rot|dromological|signal|vibes|pattern|anchor|framework|beautiful|latency)\b/i;

function splitSentences(text = '') {
  const value = safe(text).replace(/\s+/g, ' ');
  return value.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((part) => part.trim()).filter(Boolean) || (value ? [value] : []);
}

function coreTerms(text = '') {
  const stop = new Set('the a an and or but if is are was were be been being do does did how what why when where who whom with without into from that this those these much really of in on to for no prior sector you your i me my we our'.split(' '));
  return uniq(words(text).map((word) => word.toLowerCase()).filter((word) => word.length > 2 && !stop.has(word))).slice(0, 12);
}

function classify(segment = '') {
  const text = safe(segment);
  if (/\?$/.test(text)) {
    if (/tech|job|experience|sector|career/i.test(text)) return { type: 'question', intent: 'career-entry' };
    if (/signal|fluency|skill|asset/i.test(text)) return { type: 'question', intent: 'skill-legibility' };
    return { type: 'question', intent: 'inquiry' };
  }
  if (RECORD_WORDS.test(text) && /saw|changed|know|deadline|edit/i.test(text)) return { type: 'claim', intent: 'witness-record' };
  if (UNCERTAINTY_WORDS.test(text)) return { type: 'reflection', intent: 'uncertainty' };
  if (METAPHOR_WORDS.test(text)) return { type: 'expressive', intent: 'metaphor-theory' };
  return { type: 'statement', intent: 'general' };
}

export function buildPropositionMap(sourceText = '') {
  const source = safe(sourceText);
  const segments = splitSentences(source);
  const propositions = segments.map((segment, index) => {
    const label = classify(segment);
    return {
      id: `p${index + 1}`,
      text: segment,
      type: label.type,
      intent: label.intent,
      mustRemainQuestion: label.type === 'question',
      hasUncertainty: UNCERTAINTY_WORDS.test(segment),
      hasNegation: NEGATION_WORDS.test(segment),
      hasMetaphor: METAPHOR_WORDS.test(segment),
      coreTerms: coreTerms(segment)
    };
  });
  const questionCount = propositions.filter((p) => p.type === 'question').length;
  const claimCount = propositions.filter((p) => p.type === 'claim').length;
  const uncertaintyCount = propositions.filter((p) => p.hasUncertainty).length;
  const metaphorCount = propositions.filter((p) => p.hasMetaphor).length;
  const routeHint = questionCount ? 'question-preservation' : claimCount ? 'witness-safe' : metaphorCount ? 'expressive-theory' : uncertaintyCount ? 'uncertainty-reflection' : 'general-transform';
  return {
    version: HUSH_PROPOSITION_MAP_VERSION,
    sourceLength: source.length,
    propositionCount: propositions.length,
    questionCount,
    claimCount,
    uncertaintyCount,
    negationCount: propositions.filter((p) => p.hasNegation).length,
    metaphorCount,
    routeHint,
    propositions,
    forbiddenChanges: [
      ...(questionCount ? ['do not answer the questions', 'preserve question form'] : []),
      ...(uncertaintyCount ? ['preserve uncertainty'] : []),
      ...(claimCount ? ['do not invent actors', 'do not strengthen accusation'] : []),
      'do not add new factual claims',
      'do not flatten into record-note boilerplate'
    ]
  };
}

export function questionFormScore(sourceText = '', outputText = '') {
  const sourceQuestions = (safe(sourceText).match(/\?/g) || []).length;
  const outputQuestions = (safe(outputText).match(/\?/g) || []).length;
  if (!sourceQuestions) return 1;
  return Math.max(0, Math.min(1, outputQuestions / sourceQuestions));
}

export function newClaimRisk(sourceText = '', outputText = '') {
  const sourceTerms = new Set(coreTerms(sourceText));
  const outputTerms = coreTerms(outputText);
  const additions = outputTerms.filter((term) => !sourceTerms.has(term));
  const risky = additions.filter((term) => ADVICE_WORDS.test(term) || /company|salary|hiring|certification|bootcamp|linkedin|portfolio|network/.test(term));
  return {
    additions,
    riskyAdditions: risky,
    score: Math.max(0, Math.min(1, risky.length / Math.max(1, outputTerms.length)))
  };
}
