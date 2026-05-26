export const HUSH_PR84_AUTHORSHIP_METRICS_PLUS_VERSION = 'pr84.1-scrollable-two-column-stylometrics';

const $ = (id, doc = document) => doc.getElementById(id);
const esc = (value = '') => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(Number(value)) ? Number(value) : 0));
const round = (value, digits = 2) => Number.isFinite(Number(value)) ? Number(Number(value).toFixed(digits)) : 0;
const wordList = (value = '') => String(value || '').match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || [];
const sentenceList = (value = '') => (String(value || '').match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []).map((item) => item.trim()).filter(Boolean);
const syllableLike = (word = '') => Math.max(1, (String(word).toLowerCase().match(/[aeiouy]+/g) || []).length);

function density(text = '', pattern) {
  const words = wordList(text).length || 1;
  return clamp01((String(text || '').match(pattern) || []).length / words);
}

function mean(values = []) {
  const finite = values.map(Number).filter(Number.isFinite);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : 0;
}

function std(values = []) {
  const finite = values.map(Number).filter(Number.isFinite);
  if (finite.length < 2) return 0;
  const m = mean(finite);
  return Math.sqrt(finite.reduce((sum, value) => sum + ((value - m) ** 2), 0) / finite.length);
}

function repeatedNgramRate(tokens = [], n = 2) {
  if (tokens.length < n + 1) return 0;
  const grams = [];
  for (let i = 0; i <= tokens.length - n; i += 1) grams.push(tokens.slice(i, i + n).join(' '));
  const unique = new Set(grams);
  return clamp01(1 - unique.size / Math.max(1, grams.length));
}

function avgPairJaccard(sentences = []) {
  if (sentences.length < 2) return 0;
  let total = 0;
  let pairs = 0;
  const sets = sentences.map((sentence) => new Set(wordList(sentence.toLowerCase()).filter((word) => word.length > 2)));
  for (let i = 0; i < sets.length; i += 1) {
    for (let j = i + 1; j < sets.length; j += 1) {
      const union = new Set([...sets[i], ...sets[j]]);
      const inter = [...sets[i]].filter((word) => sets[j].has(word));
      total += union.size ? inter.length / union.size : 0;
      pairs += 1;
    }
  }
  return clamp01(total / Math.max(1, pairs));
}

function profile(text = '') {
  const tokens = wordList(text);
  const lower = tokens.map((token) => token.toLowerCase());
  const sentences = sentenceList(text);
  const sentenceLengths = sentences.map((sentence) => wordList(sentence).length);
  const wordCount = tokens.length;
  const charCount = String(text || '').replace(/\s/g, '').length;
  const avgWordLength = wordCount ? tokens.reduce((sum, token) => sum + token.length, 0) / wordCount : 0;
  const syllables = tokens.reduce((sum, token) => sum + syllableLike(token), 0);
  const lexical = wordCount ? new Set(lower).size / wordCount : 0;
  const hapax = wordCount ? [...new Set(lower)].filter((word) => lower.filter((item) => item === word).length === 1).length / wordCount : 0;
  const punctuation = density(text, /[.,;:!?—-]/g);
  const commas = density(text, /,/g);
  const semicolons = density(text, /[;:]/g);
  const dashes = density(text, /[—-]/g);
  const quotes = density(text, /["“”'‘’]/g);
  const parens = density(text, /[()[\]{}]/g);
  const questions = sentences.length ? (String(text || '').match(/\?/g) || []).length / sentences.length : 0;
  const exclam = sentences.length ? (String(text || '').match(/!/g) || []).length / sentences.length : 0;
  const caveats = density(text, /\b(?:maybe|perhaps|unless|except|however|although|but|if|might|could|should|probably|apparently|because|arguably|seems|appears)\b/gi) * 10;
  const claims = density(text, /\b(?:is|are|was|were|will|must|can|created|means|shows|proves|takes|gives|made|built|turns|requires|produces)\b/gi) * 10;
  const modals = density(text, /\b(?:can|could|would|should|might|must|may|need|needs|supposed|trying)\b/gi) * 10;
  const causal = density(text, /\b(?:because|so|therefore|since|that means|which means|if|then|when|thus|hence)\b/gi) * 10;
  const contrast = density(text, /\b(?:but|however|although|yet|still|nevertheless|instead|whereas)\b/gi) * 10;
  const temporal = density(text, /\b(?:before|after|when|while|then|now|later|already|again|still|until)\b/gi) * 10;
  const firstPerson = density(text, /\b(?:i|me|my|mine|we|us|our|ours)\b/gi) * 10;
  const secondPerson = density(text, /\b(?:you|your|yours|u|ur)\b/gi) * 10;
  const thirdPerson = density(text, /\b(?:he|she|they|them|their|hers|his|it|its)\b/gi) * 10;
  const named = density(text, /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\b/g) * 10;
  const literals = density(text, /\b(?:EXHIBIT|DOC|CASE|ID|REF|TD613|SHI|SAC|API|LLM|AI|PR\d+|\d{2,}(?:[-/:.]\d+)*)\b/gi) * 10;
  const uppercase = density(text, /\b[A-Z]{2,}\b/g) * 10;
  const emoji = density(text, /[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu) * 10;
  const longWordRate = wordCount ? tokens.filter((token) => token.length >= 8).length / wordCount : 0;
  const shortWordRate = wordCount ? tokens.filter((token) => token.length <= 3).length / wordCount : 0;
  const avgSentenceLength = mean(sentenceLengths);
  const sentenceSpread = std(sentenceLengths);
  const maxSentenceLength = Math.max(0, ...sentenceLengths);
  const burstiness = avgSentenceLength ? sentenceSpread / avgSentenceLength : 0;
  const recurrence = clamp01(repeatedNgramRate(lower, 2) * 0.55 + repeatedNgramRate(lower, 3) * 0.45 + avgPairJaccard(sentences) * 0.45);
  const heat = clamp01(punctuation * 2.1 + questions * 0.24 + exclam * 0.25 + caveats * 0.12 + uppercase * 0.08 + literals * 0.1);
  const custody = clamp01(heat * 0.32 + literals * 0.22 + named * 0.14 + caveats * 0.12 + claims * 0.08);
  const link = clamp01(recurrence * 0.32 + lexical * 0.14 + punctuation * 0.16 + firstPerson * 0.12 + secondPerson * 0.1 + uppercase * 0.08 + burstiness * 0.08);
  const difficulty = clamp01(claims * 0.12 + caveats * 0.16 + questions * 0.14 + literals * 0.19 + heat * 0.18 + parens * 0.08 + named * 0.06);
  const readability = wordCount && sentences.length ? 206.835 - 1.015 * (wordCount / sentences.length) - 84.6 * (syllables / wordCount) : 0;
  return {
    wordCount, charCount, sentenceCount: sentences.length, avgSentenceLength, sentenceSpread, maxSentenceLength, lexical, hapax,
    avgWordLength, syllablesPerWord: wordCount ? syllables / wordCount : 0, readability, punctuation, commas, semicolons, dashes, quotes, parens,
    questions, exclam, recurrence, longWordRate, shortWordRate, caveats: clamp01(caveats), claims: clamp01(claims), modals: clamp01(modals), causal: clamp01(causal), contrast: clamp01(contrast), temporal: clamp01(temporal),
    firstPerson: clamp01(firstPerson), secondPerson: clamp01(secondPerson), thirdPerson: clamp01(thirdPerson), named: clamp01(named), literals: clamp01(literals), uppercase: clamp01(uppercase), emoji: clamp01(emoji),
    bigramRepeat: repeatedNgramRate(lower, 2), trigramRepeat: repeatedNgramRate(lower, 3), sentenceEcho: avgPairJaccard(sentences), burstiness, heat, custody, link, difficulty
  };
}

function metric(label, value, tone = '') {
  return `<article class="hush-source-metric ${tone}"><span>${esc(label)}</span><strong>${esc(value)}</strong></article>`;
}

function metricRows(text = '') {
  const p = profile(text);
  const route = p.difficulty >= 0.7 ? 'high' : p.link >= 0.55 ? 'medium' : 'low';
  return [
    metric('Words', p.wordCount),
    metric('Characters', p.charCount),
    metric('Sentences', p.sentenceCount),
    metric('Syntax', `avg ${round(p.avgSentenceLength, 1)}w · spread ${round(p.sentenceSpread, 1)} · max ${p.maxSentenceLength}`),
    metric('Burstiness', round(p.burstiness, 2)),
    metric('Lexical variety', round(p.lexical, 2)),
    metric('Hapax rate', round(p.hapax, 2)),
    metric('Avg word length', round(p.avgWordLength, 1)),
    metric('Long-word rate', round(p.longWordRate, 2)),
    metric('Short-word rate', round(p.shortWordRate, 2)),
    metric('Syllables/word', round(p.syllablesPerWord, 2)),
    metric('Readability', round(p.readability, 1)),
    metric('Punctuation', round(p.punctuation, 2)),
    metric('Comma load', round(p.commas, 2)),
    metric('Colon/semicolon', round(p.semicolons, 2)),
    metric('Dash load', round(p.dashes, 2)),
    metric('Quote load', round(p.quotes, 2)),
    metric('Parenthetical load', round(p.parens, 2)),
    metric('Question load', round(p.questions, 2)),
    metric('Exclamation load', round(p.exclam, 2)),
    metric('Claim density', round(p.claims, 2)),
    metric('Caveats', round(p.caveats, 2)),
    metric('Modality', round(p.modals, 2)),
    metric('Causal hinges', round(p.causal, 2)),
    metric('Contrast hinges', round(p.contrast, 2)),
    metric('Temporal hinges', round(p.temporal, 2)),
    metric('Voice markers', `1p ${round(p.firstPerson, 2)} · 2p ${round(p.secondPerson, 2)} · 3p ${round(p.thirdPerson, 2)}`),
    metric('Named/literal load', `${round(p.named, 2)} / ${round(p.literals, 2)}`),
    metric('Uppercase load', round(p.uppercase, 2)),
    metric('Emoji/sigil load', round(p.emoji, 2)),
    metric('Recurrence', round(p.recurrence, 2)),
    metric('Bigram repeat', round(p.bigramRepeat, 2)),
    metric('Trigram repeat', round(p.trigramRepeat, 2)),
    metric('Sentence echo', round(p.sentenceEcho, 2)),
    metric('Pressure', `heat ${round(p.heat, 2)} · custody ${round(p.custody, 2)} · link ${round(p.link, 2)}`, p.heat > 0.65 ? 'warn' : ''),
    metric('Route difficulty', `${round(p.difficulty, 2)} · ${route}`)
  ].join('');
}

function rewriteProfile(doc = document) {
  const host = $('messageDraftProfile', doc);
  const grid = host?.querySelector?.('.hush-source-profile-grid');
  const input = $('messageDraftInput', doc);
  if (!grid || !input?.value?.trim()) return;
  const current = grid.getAttribute('data-pr84-source') || '';
  if (current === input.value) return;
  grid.setAttribute('data-pr84-source', input.value);
  grid.innerHTML = metricRows(input.value);
}

function installStyle(doc = document) {
  if ($('hushPr84AuthorshipMetricsPlusStyle', doc)) return;
  const style = doc.createElement('style');
  style.id = 'hushPr84AuthorshipMetricsPlusStyle';
  style.textContent = `
    @media(max-width:760px){
      body[data-page-kind="adversarial-bench"] .hush-source-profile-panel{
        height:clamp(22rem,54vh,31rem)!important;
        max-height:clamp(22rem,54vh,31rem)!important;
        overflow-y:auto!important;
        overflow-x:hidden!important;
        -webkit-overflow-scrolling:touch!important;
        overscroll-behavior:contain!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-profile-grid{
        display:grid!important;
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
        grid-auto-flow:row!important;
        gap:.34rem!important;
        overflow:visible!important;
        padding:0 0 .35rem!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-metric{
        height:3.2rem!important;
        min-height:3.2rem!important;
        padding:.42rem .42rem!important;
        display:flex!important;
        flex-direction:column!important;
        justify-content:center!important;
        overflow:hidden!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-metric span{
        font-size:.43rem!important;
        letter-spacing:.085em!important;
        line-height:1.1!important;
        white-space:normal!important;
        overflow-wrap:anywhere!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-metric strong{
        font-size:.58rem!important;
        line-height:1.16!important;
        margin-top:.16rem!important;
        white-space:normal!important;
        overflow-wrap:anywhere!important;
        word-break:normal!important;
      }
    }
  `;
  doc.head.appendChild(style);
}

function boot(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench') return;
  doc.body.dataset.hushPr84AuthorshipMetricsPlus = 'true';
  installStyle(doc);
  const run = () => window.setTimeout(() => rewriteProfile(doc), 0);
  ['input', 'change', 'click'].forEach((eventName) => doc.addEventListener(eventName, run, true));
  const host = $('messageDraftProfile', doc);
  if (host && host.dataset.pr84Observed !== 'true') {
    host.dataset.pr84Observed = 'true';
    new MutationObserver(run).observe(host, { childList: true, subtree: true });
  }
  [0, 240, 720, 1400, 2600, 4200].forEach((delay) => window.setTimeout(() => rewriteProfile(doc), delay));
}

if (typeof document !== 'undefined') {
  const run = () => boot(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
}
