export const HUSH_PR86_PROFILE_RESCUE_VERSION = 'pr86.3-low-interference-analyze-only-profile';

import { extractCadenceProfile } from './engine/stylometry.js';

const $ = (id, doc = document) => doc.getElementById(id);
const esc = (value = '') => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(Number(value)) ? Number(value) : 0));
const round = (value, digits = 2) => Number.isFinite(Number(value)) ? Number(Number(value).toFixed(digits)) : 0;
const wordList = (value = '') => String(value || '').match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || [];
const sentenceList = (value = '') => (String(value || '').match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []).map((item) => item.trim()).filter(Boolean);
let timer = null;
let analysisArmed = false;
let analyzedSource = '';

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

function density(text = '', pattern) {
  const total = wordList(text).length || 1;
  return clamp01((String(text || '').match(pattern) || []).length / total);
}

function syllableLike(word = '') {
  return Math.max(1, (String(word).toLowerCase().match(/[aeiouy]+/g) || []).length);
}

function repeatedNgramRate(tokens = [], n = 2) {
  if (tokens.length < n + 1) return 0;
  const grams = [];
  for (let i = 0; i <= tokens.length - n; i += 1) grams.push(tokens.slice(i, i + n).join(' '));
  return clamp01(1 - new Set(grams).size / Math.max(1, grams.length));
}

function sentenceEcho(sentences = []) {
  if (sentences.length < 2) return 0;
  const sets = sentences.map((sentence) => new Set(wordList(sentence.toLowerCase()).filter((word) => word.length > 2)));
  let total = 0;
  let pairs = 0;
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

function buildProfile(source = '') {
  const base = extractCadenceProfile(source) || {};
  const tokens = wordList(source);
  const lower = tokens.map((token) => token.toLowerCase());
  const sentences = sentenceList(source);
  const sentenceLengths = sentences.map((sentence) => wordList(sentence).length);
  const wordCount = tokens.length;
  const charCount = String(source || '').replace(/\s/g, '').length;
  const syllables = tokens.reduce((sum, token) => sum + syllableLike(token), 0);
  const avgSentence = Number(base.avgSentenceLength || mean(sentenceLengths));
  const punctuation = Number(base.punctuationDensity || density(source, /[.,;:!?—-]/g));
  const caveat = density(source, /\b(?:maybe|perhaps|unless|except|however|although|but|if|might|could|should|probably|apparently|because|arguably|seems|appears)\b/gi) * 10;
  const claim = density(source, /\b(?:is|are|was|were|will|must|can|created|means|shows|proves|takes|gives|made|built|turns|requires|produces)\b/gi) * 10;
  const modal = density(source, /\b(?:can|could|would|should|might|must|may|need|needs|supposed|trying)\b/gi) * 10;
  const causal = density(source, /\b(?:because|so|therefore|since|that means|which means|if|then|when|thus|hence)\b/gi) * 10;
  const contrast = density(source, /\b(?:but|however|although|yet|still|nevertheless|instead|whereas)\b/gi) * 10;
  const temporal = density(source, /\b(?:before|after|when|while|then|now|later|already|again|still|until)\b/gi) * 10;
  const firstPerson = density(source, /\b(?:i|me|my|mine|we|us|our|ours)\b/gi) * 10;
  const secondPerson = density(source, /\b(?:you|your|yours|u|ur)\b/gi) * 10;
  const thirdPerson = density(source, /\b(?:he|she|they|them|their|hers|his|it|its)\b/gi) * 10;
  const named = density(source, /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\b/g) * 10;
  const literal = density(source, /\b(?:EXHIBIT|DOC|CASE|ID|REF|TD613|SHI|SAC|API|LLM|AI|PR\d+|\d{2,}(?:[-/:.]\d+)*)\b/gi) * 10;
  const recurrence = clamp01(Number(base.recurrencePressure || 0) * 0.45 + repeatedNgramRate(lower, 2) * 0.28 + repeatedNgramRate(lower, 3) * 0.18 + sentenceEcho(sentences) * 0.22);
  const heat = clamp01(punctuation * 2.2 + caveat * 0.18 + literal * 0.14 + (source.match(/\?/g) || []).length * 0.12 + (source.match(/!/g) || []).length * 0.16);
  const custody = clamp01(heat * 0.45 + literal * 0.3 + caveat * 0.12 + named * 0.1);
  const linkage = clamp01(recurrence * 0.32 + punctuation * 0.18 + firstPerson * 0.15 + secondPerson * 0.12 + literal * 0.08);
  const difficulty = clamp01(claim * 0.12 + caveat * 0.16 + literal * 0.2 + heat * 0.2 + linkage * 0.16);
  return {
    wordCount,
    charCount,
    sentenceCount: sentences.length,
    avgSentence,
    sentenceSpread: std(sentenceLengths),
    maxSentence: Math.max(0, ...sentenceLengths),
    lexical: wordCount ? new Set(lower).size / wordCount : 0,
    hapax: wordCount ? [...new Set(lower)].filter((word) => lower.filter((item) => item === word).length === 1).length / wordCount : 0,
    avgWordLength: wordCount ? mean(tokens.map((token) => token.length)) : 0,
    syllablesPerWord: wordCount ? syllables / wordCount : 0,
    readability: wordCount && sentences.length ? 206.835 - 1.015 * (wordCount / sentences.length) - 84.6 * (syllables / wordCount) : 0,
    longWords: wordCount ? tokens.filter((token) => token.length >= 8).length / wordCount : 0,
    shortWords: wordCount ? tokens.filter((token) => token.length <= 3).length / wordCount : 0,
    punctuation,
    comma: density(source, /,/g) * 10,
    colon: density(source, /[;:]/g) * 10,
    dash: density(source, /[—-]/g) * 10,
    quote: density(source, /["“”'‘’]/g) * 10,
    paren: density(source, /[()[\]{}]/g) * 10,
    question: sentences.length ? (source.match(/\?/g) || []).length / sentences.length : 0,
    exclaim: sentences.length ? (source.match(/!/g) || []).length / sentences.length : 0,
    claim: clamp01(claim), caveat: clamp01(caveat), modal: clamp01(modal), causal: clamp01(causal), contrast: clamp01(contrast), temporal: clamp01(temporal),
    firstPerson: clamp01(firstPerson), secondPerson: clamp01(secondPerson), thirdPerson: clamp01(thirdPerson), named: clamp01(named), literal: clamp01(literal), uppercase: clamp01(density(source, /\b[A-Z]{2,}\b/g) * 10),
    recurrence, bigram: repeatedNgramRate(lower, 2), trigram: repeatedNgramRate(lower, 3), echo: sentenceEcho(sentences), heat, custody, linkage, difficulty
  };
}

function metric(label, value, tone = '') {
  return `<article class="hush-source-metric ${tone}"><span>${esc(label)}</span><strong>${esc(value)}</strong></article>`;
}

function clearProfile(doc = document) {
  const host = $('messageDraftProfile', doc);
  if (!host) return;
  host.innerHTML = '';
  host.dataset.pr86Profile = 'asleep';
  host.dataset.pr86Source = '';
}

function bindScrollHint(panel) {
  if (!panel || panel.dataset.pr86ScrollBound === 'true') return;
  panel.dataset.pr86ScrollBound = 'true';
  panel.addEventListener('scroll', () => {
    if (panel.scrollTop > 2) panel.dataset.scrolled = 'true';
  }, { passive: true });
}

function renderProfile(doc = document) {
  const host = $('messageDraftProfile', doc);
  const input = $('messageDraftInput', doc);
  const source = input?.value || '';
  if (!host || !source.trim() || !analysisArmed || source !== analyzedSource) {
    clearProfile(doc);
    return false;
  }
  const p = buildProfile(source);
  const route = p.difficulty >= 0.7 ? 'high-friction transform; preserve propositions before style.' : p.linkage >= 0.55 ? 'source-body visible; prioritize syntax movement.' : 'stable source; standard mask route.';
  const metrics = [
    metric('Words', p.wordCount), metric('Characters', p.charCount), metric('Sentences', p.sentenceCount), metric('Syntax', `avg ${round(p.avgSentence, 1)}w · spread ${round(p.sentenceSpread, 1)} · max ${p.maxSentence}`), metric('Lexical variety', round(p.lexical, 2)), metric('Hapax rate', round(p.hapax, 2)), metric('Avg word length', round(p.avgWordLength, 1)), metric('Long-word rate', round(p.longWords, 2)), metric('Short-word rate', round(p.shortWords, 2)), metric('Syllables/word', round(p.syllablesPerWord, 2)), metric('Readability', round(p.readability, 1)), metric('Punctuation', round(p.punctuation, 2)), metric('Comma load', round(p.comma, 2)), metric('Colon/semicolon', round(p.colon, 2)), metric('Dash load', round(p.dash, 2)), metric('Quote load', round(p.quote, 2)), metric('Parenthetical load', round(p.paren, 2)), metric('Question load', round(p.question, 2)), metric('Exclamation load', round(p.exclaim, 2)), metric('Claim density', round(p.claim, 2)), metric('Caveats', round(p.caveat, 2)), metric('Modality', round(p.modal, 2)), metric('Causal hinges', round(p.causal, 2)), metric('Contrast hinges', round(p.contrast, 2)), metric('Temporal hinges', round(p.temporal, 2)), metric('Voice markers', `1p ${round(p.firstPerson, 2)} · 2p ${round(p.secondPerson, 2)} · 3p ${round(p.thirdPerson, 2)}`), metric('Named/literal load', `${round(p.named, 2)} / ${round(p.literal, 2)}`), metric('Uppercase load', round(p.uppercase, 2)), metric('Recurrence', round(p.recurrence, 2)), metric('Bigram repeat', round(p.bigram, 2)), metric('Trigram repeat', round(p.trigram, 2)), metric('Sentence echo', round(p.echo, 2)), metric('Pressure', `heat ${round(p.heat, 2)} · custody ${round(p.custody, 2)} · link ${round(p.linkage, 2)}`, p.heat > 0.65 ? 'warn' : ''), metric('Route difficulty', `${round(p.difficulty, 2)} · ${p.difficulty >= 0.7 ? 'high' : p.difficulty >= 0.42 ? 'medium' : 'low'}`)
  ];
  host.innerHTML = `<section class="hush-source-profile-panel" aria-label="Authorship profile"><div class="hush-source-profile-head"><div><span>Authorship Profile</span><strong>Message route scan</strong></div><p>${esc(route)}</p></div><div class="hush-source-profile-grid">${metrics.join('')}</div><div class="hush-source-profile-scroll-hint">↕ scroll stylometrics</div></section>`;
  host.dataset.pr86Profile = 'rendered';
  host.dataset.pr86Source = source;
  bindScrollHint(host.querySelector('.hush-source-profile-panel'));
  return true;
}

function installStyle(doc = document) {
  if (doc.getElementById('hushPr86ProfileRescueStyle')) return;
  const style = doc.createElement('style');
  style.id = 'hushPr86ProfileRescueStyle';
  style.textContent = `
    body[data-page-kind="adversarial-bench"] #messageDraftProfile.bay-profile{display:none!important;height:0!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important;}
    body[data-page-kind="adversarial-bench"] #messageDraftProfile.bay-profile[data-pr86-profile="rendered"]{display:block!important;height:auto!important;min-height:0!important;margin:0!important;padding:0!important;overflow:visible!important;}
    body[data-page-kind="adversarial-bench"] #messageDraftProfile .hush-source-profile-panel{margin:.65rem 0 .55rem;padding:.72rem;border:1px solid rgba(137,255,240,.20);border-radius:18px;background:linear-gradient(145deg,rgba(4,11,22,.78),rgba(16,7,26,.72));box-shadow:inset 0 1px 0 rgba(255,255,255,.06);}
    body[data-page-kind="adversarial-bench"] #messageDraftProfile .hush-source-profile-head{display:flex;justify-content:space-between;gap:.75rem;align-items:flex-start;margin-bottom:.58rem;}
    body[data-page-kind="adversarial-bench"] #messageDraftProfile .hush-source-profile-head span{display:block;color:#89e7ff;font-size:.58rem;letter-spacing:.18em;text-transform:uppercase;}
    body[data-page-kind="adversarial-bench"] #messageDraftProfile .hush-source-profile-head strong{display:block;color:#f1fff6;font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;margin-top:.12rem;}
    body[data-page-kind="adversarial-bench"] #messageDraftProfile .hush-source-profile-head p{margin:0;max-width:48%;color:rgba(226,255,236,.66);font-size:.62rem;line-height:1.32;text-align:right;}
    body[data-page-kind="adversarial-bench"] #messageDraftProfile .hush-source-profile-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.38rem;}
    body[data-page-kind="adversarial-bench"] #messageDraftProfile .hush-source-metric{min-height:3.2rem;border:1px solid rgba(137,255,240,.18);border-radius:14px;background:rgba(0,0,0,.24);padding:.42rem .46rem;}
    body[data-page-kind="adversarial-bench"] #messageDraftProfile .hush-source-metric span{display:block;color:rgba(202,255,223,.58);font-size:.52rem;letter-spacing:.12em;text-transform:uppercase;}
    body[data-page-kind="adversarial-bench"] #messageDraftProfile .hush-source-metric strong{display:block;margin-top:.22rem;color:#f1fff6;font-size:.68rem;line-height:1.2;word-break:break-word;}
    body[data-page-kind="adversarial-bench"] #messageDraftProfile .hush-source-profile-scroll-hint{display:none;transition:opacity .18s ease, transform .18s ease;}
    @media(max-width:760px){
      body[data-page-kind="adversarial-bench"] #messageDraftProfile .hush-source-profile-panel{height:clamp(12rem,34vh,16rem)!important;max-height:clamp(12rem,34vh,16rem)!important;min-height:0!important;overflow-y:scroll!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important;scrollbar-width:thin!important;scrollbar-color:rgba(137,255,240,.62) rgba(3,8,18,.72)!important;padding:.56rem .5rem 1.6rem!important;box-shadow:inset 0 -1.35rem 1.4rem rgba(137,255,240,.09),inset 0 1px 0 rgba(255,255,255,.06)!important;}
      body[data-page-kind="adversarial-bench"] #messageDraftProfile .hush-source-profile-head{position:sticky!important;top:-.56rem!important;z-index:4!important;display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:.22rem!important;margin:-.56rem -.5rem .34rem!important;padding:.56rem .5rem .36rem!important;background:linear-gradient(180deg,rgba(4,10,21,.98),rgba(4,10,21,.9) 76%,rgba(4,10,21,0))!important;backdrop-filter:blur(6px)!important;}
      body[data-page-kind="adversarial-bench"] #messageDraftProfile .hush-source-profile-head p{max-width:none!important;text-align:left!important;margin:0!important;font-size:.56rem!important;line-height:1.25!important;}
      body[data-page-kind="adversarial-bench"] #messageDraftProfile .hush-source-profile-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:.26rem!important;overflow:visible!important;padding:0 0 .2rem!important;}
      body[data-page-kind="adversarial-bench"] #messageDraftProfile .hush-source-metric{height:2.92rem!important;min-height:2.92rem!important;max-height:2.92rem!important;padding:.34rem .34rem!important;border-radius:12px!important;display:flex!important;flex-direction:column!important;justify-content:center!important;overflow:hidden!important;}
      body[data-page-kind="adversarial-bench"] #messageDraftProfile .hush-source-metric span{font-size:.39rem!important;letter-spacing:.075em!important;line-height:1.08!important;white-space:normal!important;overflow-wrap:anywhere!important;}
      body[data-page-kind="adversarial-bench"] #messageDraftProfile .hush-source-metric strong{font-size:.52rem!important;line-height:1.12!important;margin-top:.12rem!important;white-space:normal!important;overflow-wrap:anywhere!important;word-break:normal!important;}
      body[data-page-kind="adversarial-bench"] #messageDraftProfile .hush-source-profile-scroll-hint{display:block!important;position:sticky!important;bottom:.04rem!important;z-index:5!important;margin:.38rem auto -1rem!important;width:max-content!important;max-width:92%!important;padding:.18rem .54rem!important;border:1px solid rgba(137,255,240,.24)!important;border-radius:999px!important;background:linear-gradient(105deg,rgba(7,13,28,.96),rgba(17,8,31,.94))!important;color:rgba(202,255,223,.86)!important;font-size:.48rem!important;letter-spacing:.15em!important;text-transform:uppercase!important;pointer-events:none!important;box-shadow:0 0 .7rem rgba(137,255,240,.12)!important;}
      body[data-page-kind="adversarial-bench"] #messageDraftProfile .hush-source-profile-panel[data-scrolled="true"] .hush-source-profile-scroll-hint{opacity:0!important;transform:translateY(.4rem)!important;}
    }
  `;
  doc.head.appendChild(style);
}

function scheduleRender(doc = document, delay = 80) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => renderProfile(doc), delay);
}

function boot(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench') return;
  doc.body.dataset.hushPr86ProfileRescue = 'true';
  installStyle(doc);
  clearProfile(doc);

  const analyze = $('analyzeOutputBtn', doc);
  if (analyze && analyze.dataset.pr86ProfileRescue !== 'true') {
    analyze.dataset.pr86ProfileRescue = 'true';
    analyze.addEventListener('click', () => {
      const source = $('messageDraftInput', doc)?.value || '';
      if (!source.trim()) {
        analysisArmed = false;
        analyzedSource = '';
        window.clearTimeout(timer);
        clearProfile(doc);
        return;
      }
      analysisArmed = true;
      analyzedSource = source;
      [120, 420, 900].forEach((delay) => scheduleRender(doc, delay));
    }, true);
  }

  const input = $('messageDraftInput', doc);
  if (input && input.dataset.pr86ProfileRescue !== 'true') {
    input.dataset.pr86ProfileRescue = 'true';
    input.addEventListener('input', () => {
      if (input.value !== analyzedSource) {
        analysisArmed = false;
        analyzedSource = '';
        window.clearTimeout(timer);
        clearProfile(doc);
      }
    }, true);
  }
}

if (typeof document !== 'undefined') {
  const run = () => boot(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  window.setTimeout(run, 360);
}
