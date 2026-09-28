/**
 * Browser-local conversation titles. Deterministic topical labels rather
 * than quotations of the first eight words or claims of model authorship.
 * No provider call, extra completion, or change to response morphology.
 */
export const DEFAULT_MARROWLINE_TITLE = 'The speaking grove';

// Retain the original algorithm solely to recognize auto-titled older records.
export function legacyMarrowlineTitle(text = '', seed = '') {
  const authored = String(seed || text || '').replace(/^𝌋\u200c/u, '').replace(/⟐\s*$/u, '')
    .replace(/^[\s"'“”‘’#*]+/u, '').replace(/\s+/gu, ' ').trim();
  if (!authored) return DEFAULT_MARROWLINE_TITLE;
  const subject = authored.replace(/^(?:please\s+)?(?:write\s+(?:me\s+)?|tell\s+me\s+|can\s+you\s+|could\s+you\s+|help\s+me\s+)/iu, '')
    .replace(/^(?:a\s+|an\s+)?(?:(?:poem|story|scene)\s+(?:about|of)\s+)/iu, '');
  const first = (subject || authored).split(/(?<=[.!?])\s+|[\n\r]/u)[0].replace(/[\s.,;:!?–—-]+$/u, '').trim();
  const bounded = first.split(/\s+/u).slice(0, 8).join(' ').slice(0, 64).trimEnd()
    .replace(/[\s.,;:!?–—-]+$/u, '');
  return bounded ? bounded[0].toLocaleUpperCase('en-US') + bounded.slice(1) : DEFAULT_MARROWLINE_TITLE;
}

const TASK = /^(?:(?:please|plz|hey|okay|ok)\s+)*(?:(?:can|could|would)\s+you\s+|i\s+(?:need|want)\s+you\s+to\s+|help\s+me\s+(?:to|with)\s+)?(?:design|develop|create|draft|write|make|build|plan|outline|explain|compare|contrast|analy[sz]e|assess|review|investigate|trace|debug|fix|repair|diagnose|summari[sz]e|explore|discuss|identify|describe|research|show|tell|check|evaluate|propose|map|reconstruct|name|title)\b[\s:,.!?-]*/iu;
const STOP = new Set('a an the and or of to for in on with by from at as this that these those my our your me you i we it is are was were be do does did can could would should please about tell write make create draft explain compare design review analyze analyse help need want what why how who when where'.split(' '));
const SMALL = new Set('a an the and or of for in on with by from at as to vs versus between'.split(' '));
const normalize = text => String(text ?? '')
  .replace(/^𝌋[\u200c\u200d]?\s*/u, '').replace(/\s*⟐\s*$/u, '')
  .replace(/[\x60]{3}[\s\S]*?[\x60]{3}/gu, ' ').replace(/https?:\/\/\S+/giu,' ')
  .replace(/\s+/gu, ' ').trim();
const hasMeaning = text => (text.match(/[\p{L}\p{N}]+/gu) || [])
  .filter(word => !STOP.has(word.toLocaleLowerCase('en-US')))
  .some(word => word.length >= 4);
function subjectOf(clause) {
  const opened = clause.replace(/^(?:okay|ok|hey|so|well|please|plz)\s*[,!:–—-]?\s*/iu, '').trim();
  let phrase = opened.replace(TASK, '');
  if (phrase === opened && /^(?:what|why|how|which|who|when|where)\b/iu.test(opened)) {
    phrase = opened.replace(/^(?:what|why|how|which|who|when|where)\s+(?:(?:is|are|does|do|did|can|could|would|should)\s+)?/iu, '');
  }
  return phrase
    .replace(/^(?:me\s+)?(?:a|an|the)\s+(?:poem|story|scene|essay|analysis|report|guide|comparison|plan)\s+(?:about|of|on)\s+/iu, '')
    .replace(/^(?:the\s+)?(?:difference|distinction)\s+between\s+/iu, '')
    .replace(/^(?:me\s+)?(?:about|of|on)\s+/iu, '')
    .replace(/^(?:a|an|the)\s+/iu, '')
    .replace(/^(?:(?:careful|cautious|detailed|comprehensive|thorough|quick|short|clear|good|better|new|actual|proper|real|full|brief|simple|practical|useful)\s+){1,3}/iu, '')
    .replace(/^(?:to|about|on)\s+/iu, '')
    .replace(/(?:[,;]\s*|\s+[—–]\s+).*/u, '')
    .replace(/\s+(?:while|without|because|so that)\s+.*$/iu, '')
    .replace(/[\s"'“”‘’#*.,;:!?–—-]+$/u, '').trim();
}
function compact(phrase) {
  let title = phrase.split(/\s+/u).filter(Boolean).slice(0, 5).join(' ');
  if (title.length > 44) title = title.slice(0, 44).replace(/\s+\S*$/u, '').trim();
  title = title.replace(/\s+(?:and|or|with|of|for|in|on|to|the|a|an)$/iu, '')
    .replace(/[\s.,;:!?–—-]+$/u, '');
  return title ? title.split(/\s+/u).map((word, i) => {
    const small = word.toLocaleLowerCase('en-US');
    if (i && SMALL.has(small)) return small;
    if (word !== small && (/[A-Z].*[A-Z]|\d|[^\u0000-\u007f]/u.test(word))) return word;
    return word.replace(/^\p{L}/u, c => c.toLocaleUpperCase('en-US'));
  }).join(' ') : DEFAULT_MARROWLINE_TITLE;
}
/** Full initial human task, optionally passed as seed. */
export function deriveMarrowlineConversationTitle(text = '', seed = '') {
  const authored = normalize(seed || text);
  if (!authored) return DEFAULT_MARROWLINE_TITLE;
  const clauses = authored.split(/(?<=[.!?])\s+(?=[\p{L}\p{N}𝌋])/u).map(x => x.trim()).filter(Boolean);
  // A setup/vignette is not the actual instruction: prefer the last explicit
  // operator request, including "Design..." after several scenario sentences.
  const requests = clauses.filter(x => TASK.test(x) || /^(?:what|why|how|which|who|when|where)\b/iu.test(x));
  let subject = subjectOf(requests.at(-1) || clauses[0] || authored);
  if (!hasMeaning(subject)) {
    const about = authored.match(/\b(?:about|regarding|concerning|between)\s+([^.!?;]+)/iu);
    subject = subjectOf(about?.[1] || clauses[0] || authored);
  }
  return compact(subject || authored);
}
