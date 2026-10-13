import * as bench from './adversarial-bench.mjs';
import { extractCadenceProfile } from './engine/stylometry.js';

export const HUSH_PR76_MASK_RECOMMENDER_VERSION = 'pr76.4-stable-profile-native-metrics';

const $ = (id, doc = document) => doc.getElementById(id);
const txt = (value) => String(value ?? '').trim();
const arr = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(Number(value)) ? Number(value) : 0));
const round = (value, digits = 2) => Number.isFinite(Number(value)) ? Number(Number(value).toFixed(digits)) : 0;
const words = (value = '') => (String(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length;
const wordList = (value = '') => (String(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []);
const sentences = (value = '') => (String(value).match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []).map((s) => s.trim()).filter(Boolean);
const esc = (value = '') => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
let analysisArmed = false;
let analyzedSignature = '';
let renderTimer = null;

function signature(doc = document) {
  return txt($('messageDraftInput', doc)?.value || '');
}

function setAnalyzed(doc = document, state = false) {
  analysisArmed = Boolean(state);
  if (doc?.body) doc.body.dataset.hushPr76Analyzed = analysisArmed ? 'true' : 'false';
}

function hideAnalysis(doc = document) {
  setAnalyzed(doc, false);
  const profile = $('messageDraftProfile', doc);
  if (profile) profile.innerHTML = '';
  const panel = $('hushSuggestedMasksPanel', doc);
  if (panel) { panel.hidden = true; panel.innerHTML = ''; }
}

function scheduleRender(doc = document, delay = 24) {
  window.clearTimeout(renderTimer);
  renderTimer = window.setTimeout(() => render(doc), delay);
}

function similarity(a, b, scale = 1) {
  const left = Number(a);
  const right = Number(b);
  if (!Number.isFinite(left) || !Number.isFinite(right)) return 0.5;
  return clamp01(1 - Math.abs(left - right) / Math.max(scale, 0.0001));
}

function distanceUseful(a, b, scale = 1) {
  const left = Number(a);
  const right = Number(b);
  if (!Number.isFinite(left) || !Number.isFinite(right)) return 0.5;
  const d = Math.abs(left - right) / Math.max(scale, 0.0001);
  if (d < 0.18) return 0.28;
  if (d > 1.6) return 0.72;
  return clamp01(0.42 + d * 0.36);
}

function density(text = '', pattern) {
  const count = words(text) || 1;
  const matches = String(text).match(pattern) || [];
  return clamp01(matches.length / count);
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

function syllableLike(word = '') {
  return Math.max(1, (String(word).toLowerCase().match(/[aeiouy]+/g) || []).length);
}

function repeatedNgramRate(tokens = [], n = 2) {
  if (tokens.length < n + 1) return 0;
  const grams = [];
  for (let i = 0; i <= tokens.length - n; i += 1) grams.push(tokens.slice(i, i + n).join(' '));
  return clamp01(1 - new Set(grams).size / Math.max(1, grams.length));
}

function avgPairJaccard(sentenceList = []) {
  if (sentenceList.length < 2) return 0;
  let total = 0;
  let pairs = 0;
  const sets = sentenceList.map((sentence) => new Set(wordList(sentence.toLowerCase()).filter((word) => word.length > 2)));
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

function labelScore(value = 0) {
  const v = Number(value) || 0;
  if (v >= 0.72) return 'high';
  if (v >= 0.42) return 'medium';
  return 'low';
}

function sourceProfile(sourceText = '') {
  const profile = extractCadenceProfile(sourceText) || {};
  const tokens = wordList(sourceText);
  const lowerTokens = tokens.map((token) => token.toLowerCase());
  const count = tokens.length;
  const sentenceList = sentences(sourceText);
  const sentenceLengths = sentenceList.map((sentence) => words(sentence));
  const charCount = String(sourceText || '').replace(/\s/g, '').length;
  const syllables = tokens.reduce((sum, token) => sum + syllableLike(token), 0);
  const protectedLiteralDensity = density(sourceText, /\b(?:EXHIBIT|DOC|CASE|ID|REF|TD613|SHI|SAC|API|LLM|AI|PR\d+|\d{2,}(?:[-/:.]\d+)*)\b/gi);
  const namedEntityDensity = density(sourceText, /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\b/g);
  const questionDensity = count ? (sourceText.match(/\?/g) || []).length / Math.max(sentenceList.length, 1) : 0;
  const exclamationDensity = count ? (sourceText.match(/!/g) || []).length / Math.max(sentenceList.length, 1) : 0;
  const caveatDensity = density(sourceText, /\b(?:maybe|perhaps|unless|except|however|although|but|if|might|could|should|probably|apparently|because|arguably|seems|appears)\b/gi);
  const claimDensity = density(sourceText, /\b(?:is|are|was|were|will|must|can|created|means|shows|proves|takes|gives|made|built|turns|requires|produces)\b/gi);
  const modalDensity = density(sourceText, /\b(?:can|could|would|should|might|must|may|need|needs|supposed|trying)\b/gi);
  const causalDensity = density(sourceText, /\b(?:because|so|therefore|since|that means|which means|if|then|when|thus|hence)\b/gi);
  const contrastDensity = density(sourceText, /\b(?:but|however|although|yet|still|nevertheless|instead|whereas)\b/gi);
  const temporalDensity = density(sourceText, /\b(?:before|after|when|while|then|now|later|already|again|still|until)\b/gi);
  const firstPersonDensity = density(sourceText, /\b(?:i|me|my|mine|we|us|our|ours)\b/gi);
  const secondPersonDensity = density(sourceText, /\b(?:you|your|yours|u|ur)\b/gi);
  const thirdPersonDensity = density(sourceText, /\b(?:he|she|they|them|their|hers|his|it|its)\b/gi);
  const quoteDensity = density(sourceText, /["“”'‘’]/g);
  const parenDensity = density(sourceText, /[()[\]{}]/g);
  const commaDensity = density(sourceText, /,/g);
  const semicolonDensity = density(sourceText, /[;:]/g);
  const dashDensity = density(sourceText, /[—-]/g);
  const uppercaseDensity = density(sourceText, /\b[A-Z]{2,}\b/g);
  const emojiDensity = density(sourceText, /[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu);
  const longWordRate = count ? tokens.filter((token) => token.length >= 8).length / count : 0;
  const shortWordRate = count ? tokens.filter((token) => token.length <= 3).length / count : 0;
  const lexicalDiversity = count ? new Set(lowerTokens).size / count : 0;
  const hapaxRate = count ? [...new Set(lowerTokens)].filter((word) => lowerTokens.filter((item) => item === word).length === 1).length / count : 0;
  const avgLength = profile.avgSentenceLength || mean(sentenceLengths);
  const punctuationDensity = Number(profile.punctuationDensity || density(sourceText, /[.,;:!?—-]/g));
  const burstiness = avgLength ? std(sentenceLengths) / avgLength : 0;
  const recurrencePressure = clamp01((profile.recurrencePressure || 0) * 0.45 + repeatedNgramRate(lowerTokens, 2) * 0.28 + repeatedNgramRate(lowerTokens, 3) * 0.18 + avgPairJaccard(sentenceList) * 0.22);
  const heatScore = clamp01(punctuationDensity * 2.2 + questionDensity * 0.25 + exclamationDensity * 0.25 + caveatDensity * 1.8 + protectedLiteralDensity * 1.4 + uppercaseDensity * 0.8 + (count < 18 ? 0.12 : 0));
  const readability = count && sentenceList.length ? 206.835 - 1.015 * (count / sentenceList.length) - 84.6 * (syllables / count) : 0;
  return {
    ...profile,
    wordCount: profile.wordCount ?? count,
    charCount,
    sentenceCount: sentenceList.length,
    avgSentenceLength: avgLength,
    maxSentenceLength: Math.max(0, ...sentenceLengths),
    sentenceLengthSpread: std(sentenceLengths),
    burstiness: clamp01(burstiness),
    lexicalDiversity: clamp01(lexicalDiversity),
    hapaxRate: clamp01(hapaxRate),
    avgWordLength: count ? mean(tokens.map((token) => token.length)) : 0,
    syllablesPerWord: count ? syllables / count : 0,
    readability,
    longWordRate: clamp01(longWordRate),
    shortWordRate: clamp01(shortWordRate),
    punctuationDensity: clamp01(punctuationDensity),
    commaDensity: clamp01(commaDensity * 10),
    semicolonDensity: clamp01(semicolonDensity * 10),
    dashDensity: clamp01(dashDensity * 10),
    quoteDensity: clamp01(quoteDensity * 10),
    parenDensity: clamp01(parenDensity * 10),
    questionDensity: clamp01(questionDensity),
    exclamationDensity: clamp01(exclamationDensity),
    claimDensity: clamp01(claimDensity * 10),
    caveatDensity: clamp01(caveatDensity * 10),
    modalDensity: clamp01(modalDensity * 10),
    causalDensity: clamp01(causalDensity * 10),
    contrastDensity: clamp01(contrastDensity * 10),
    temporalDensity: clamp01(temporalDensity * 10),
    firstPersonDensity: clamp01(firstPersonDensity * 10),
    secondPersonDensity: clamp01(secondPersonDensity * 10),
    thirdPersonDensity: clamp01(thirdPersonDensity * 10),
    quoteLoad: clamp01(quoteDensity * 10),
    parenLoad: clamp01(parenDensity * 10),
    uppercaseDensity: clamp01(uppercaseDensity * 10),
    emojiDensity: clamp01(emojiDensity * 10),
    namedEntityDensity: clamp01(namedEntityDensity * 10),
    protectedLiteralDensity: clamp01(protectedLiteralDensity * 10),
    bigramRepeat: repeatedNgramRate(lowerTokens, 2),
    trigramRepeat: repeatedNgramRate(lowerTokens, 3),
    sentenceEcho: avgPairJaccard(sentenceList),
    recurrencePressure,
    heatScore,
    sourceResidualRisk: clamp01(recurrencePressure * 0.55 + heatScore * 0.35 + protectedLiteralDensity * 3),
    custodyPressure: clamp01(heatScore * 0.45 + protectedLiteralDensity * 3 + caveatDensity * 4),
    authorshipLinkage: clamp01(recurrencePressure * 0.28 + lexicalDiversity * 0.14 + punctuationDensity * 0.18 + firstPersonDensity * 0.15 + secondPersonDensity * 0.12 + uppercaseDensity * 0.13),
    transformDifficulty: clamp01((claimDensity * 6) * 0.18 + (caveatDensity * 6) * 0.22 + questionDensity * 0.14 + protectedLiteralDensity * 2.6 + heatScore * 0.22 + parenDensity * 0.1)
  };
}

function maskEvidence(mask = {}) {
  const seed = txt(mask.sampleSeed || mask.description || mask.riskTell || '');
  const profile = mask.profile || extractCadenceProfile(seed) || {};
  const writingTraits = mask.writingTraits || {};
  const totalWords = Number(profile.wordCount || mask.totalWords || words(seed));
  const warnings = arr(mask.warnings).concat(arr(mask.pressureWarnings));
  return { seed, profile, writingTraits, totalWords, warnings };
}

function textIncludesAny(value = '', terms = []) {
  const hay = String(value || '').toLowerCase();
  return terms.some((term) => hay.includes(String(term).toLowerCase()));
}

function maskCapacities(mask = {}) {
  const evidence = maskEvidence(mask);
  const hay = [mask.label, mask.family, mask.description, mask.intendedUse, mask.riskTell, evidence.seed, JSON.stringify(mask.writingTraits || {}), JSON.stringify(mask.transformHints || {})].join(' ');
  const precise = textIncludesAny(hay, ['grounded', 'ledger', 'plain', 'precise', 'document', 'legal', 'clerk', 'talia', 'literal', 'careful']);
  const expressive = textIncludesAny(hay, ['theory', 'poetic', 'myth', 'velvet', 'oracle', 'camp', 'kiki', 'ritual', 'metaphor']);
  const cooling = textIncludesAny(hay, ['grounded', 'calm', 'plain', 'soft', 'low heat', 'talia', 'clerk', 'neutral']);
  const unlink = textIncludesAny(hay, ['rotating', 'mask', 'unlink', 'fog', 'dry', 'compression', 'pseudonym', 'neutralize', 'hostile']);
  const custody = textIncludesAny(hay, ['custody', 'archive', 'record', 'ledger', 'preserve', 'documentation']);
  return {
    precisionCapacity: precise ? 0.82 : expressive ? 0.58 : 0.68,
    questionCapacity: textIncludesAny(hay, ['question', 'dialogue', 'kiki', 'conversation', 'soft']) ? 0.8 : 0.62,
    caveatCapacity: precise || textIncludesAny(hay, ['careful', 'qualified', 'nuance']) ? 0.78 : 0.6,
    literalCapacity: precise ? 0.84 : 0.62,
    coolingCapacity: cooling ? 0.86 : expressive ? 0.48 : 0.65,
    syntaxShiftCapacity: unlink || expressive ? 0.78 : 0.56,
    dictionShiftCapacity: unlink || expressive ? 0.8 : 0.58,
    recurrenceBreakPotential: unlink ? 0.78 : 0.55,
    openerShiftPotential: 0.72,
    custodyRisk: custody ? 0.56 : 0.26,
    expressiveCapacity: expressive ? 0.84 : 0.55,
    unlinkCapacity: unlink ? 0.84 : 0.58
  };
}

function wrapperRisk(mask = {}) {
  const hay = [mask.sampleSeed, mask.description, mask.intendedUse, mask.riskTell, arr(mask.transitionBank).join(' '), arr(mask.dictionHints).join(' ')].join(' ');
  const hits = [/just keeping this organized/i, /for the record/i, /the point is preservation/i, /that keeps the context together/i, /to clarify/i, /here is/i].reduce((sum, pattern) => sum + (pattern.test(hay) ? 1 : 0), 0);
  return clamp01(hits / 3 + (textIncludesAny(hay, ['ledger', 'record', 'organized']) ? 0.14 : 0));
}

function intentFit(mask = {}, source = {}, operatorContext = {}) {
  const caps = maskCapacities(mask);
  const intent = operatorContext.intentMode || 'neutralize';
  if (intent === 'stable-pseudonym') return clamp01(0.35 + maskEvidence(mask).totalWords / 500 + (1 - wrapperRisk(mask)) * 0.25);
  if (intent === 'rotating-mask') return clamp01(caps.unlinkCapacity * 0.72 + caps.syntaxShiftCapacity * 0.28);
  if (intent === 'hostile-pipeline-compression') return clamp01(caps.unlinkCapacity * 0.44 + caps.coolingCapacity * 0.24 + (1 - caps.custodyRisk) * 0.32);
  if (intent === 'expressive-theory') return clamp01(caps.expressiveCapacity * 0.7 + caps.dictionShiftCapacity * 0.3);
  return clamp01(caps.coolingCapacity * 0.38 + caps.precisionCapacity * 0.32 + caps.unlinkCapacity * 0.3);
}

function scoreMaskRoute({ source, mask, operatorContext }) {
  const e = maskEvidence(mask);
  const caps = maskCapacities(mask);
  const mp = e.profile || {};
  const claimCapacityFit = similarity(source.claimDensity, caps.precisionCapacity, 0.85);
  const questionCapacityFit = source.questionDensity ? caps.questionCapacity : 0.68;
  const caveatCapacityFit = source.caveatDensity ? caps.caveatCapacity : 0.68;
  const literalPreservationFit = source.protectedLiteralDensity ? caps.literalCapacity : 0.7;
  const semanticCarry = clamp01(0.35 * claimCapacityFit + 0.25 * questionCapacityFit + 0.2 * caveatCapacityFit + 0.2 * literalPreservationFit);
  const maskFit = clamp01(0.25 * similarity(source.avgSentenceLength, mp.avgSentenceLength, 8) + 0.2 * similarity(source.punctuationDensity, mp.punctuationDensity, 0.09) + 0.2 * similarity(source.heatScore, caps.coolingCapacity, 0.9) + 0.15 * similarity(source.contractionDensity, mp.contractionDensity, 0.05) + 0.1 * similarity(source.recurrencePressure, mp.recurrencePressure, 0.25) + 0.1 * (e.totalWords ? clamp01(e.totalWords / 220) : 0.45));
  const sourceUnlinking = clamp01(0.35 * distanceUseful(source.avgSentenceLength, mp.avgSentenceLength, 8) + 0.25 * caps.syntaxShiftCapacity + 0.2 * caps.dictionShiftCapacity + 0.1 * caps.recurrenceBreakPotential + 0.1 * caps.openerShiftPotential);
  const wr = wrapperRisk(mask);
  const literalRisk = clamp01(source.protectedLiteralDensity * (1 - caps.literalCapacity));
  const collapseRisk = clamp01(wr * 0.4 + caps.custodyRisk * 0.25 + literalRisk * 0.22 + Math.max(0, source.heatScore - caps.coolingCapacity) * 0.13);
  const fit = intentFit(mask, source, operatorContext);
  const driftControl = clamp01(0.55 * semanticCarry + 0.25 * caps.coolingCapacity + 0.2 * caps.precisionCapacity);
  const routeScore = round(clamp01(0.3 * semanticCarry + 0.22 * sourceUnlinking + 0.18 * maskFit + 0.18 * fit + 0.12 * driftControl - collapseRisk * 0.28), 3);
  const warnings = [];
  if (wr > 0.48) warnings.push('wrapper-risk');
  if (literalRisk > 0.45) warnings.push('literal-load');
  if (source.transformDifficulty > 0.7 && semanticCarry < 0.7) warnings.push('high-friction');
  const reasonLabel = semanticCarry >= 0.72 && sourceUnlinking >= 0.62 ? 'Strong carry with useful surface movement.' : sourceUnlinking >= 0.65 ? 'Best for unlinking syntax and cadence.' : semanticCarry >= 0.7 ? 'Best for meaning preservation with low wrapper risk.' : 'Balanced route: meaning held with usable distance.';
  return { mask, maskId: mask.id || mask.key || mask.label, maskLabel: mask.label || mask.name || 'Unnamed mask', routeScore, confidence: labelScore(routeScore), reasonLabel, warnings, metrics: { semanticCarry: round(semanticCarry, 3), sourceUnlinking: round(sourceUnlinking, 3), maskFit: round(maskFit, 3), intentFit: round(fit, 3), driftControl: round(driftControl, 3), collapseRisk: round(collapseRisk, 3), wrapperRisk: round(wr, 3) } };
}

function compare(a, b) {
  return b.routeScore - a.routeScore || b.metrics.semanticCarry - a.metrics.semanticCarry || a.metrics.collapseRisk - b.metrics.collapseRisk || a.metrics.wrapperRisk - b.metrics.wrapperRisk || b.metrics.intentFit - a.metrics.intentFit || b.metrics.sourceUnlinking - a.metrics.sourceUnlinking;
}

function recommend(doc = document) {
  const sourceText = $('messageDraftInput', doc)?.value || '';
  const state = bench.benchState || {};
  const masks = [...arr(state.hushMasks), ...arr(state.customMasks)];
  if (!txt(sourceText)) return [];
  const source = sourceProfile(sourceText);
  const operatorContext = { intentMode: $('recognitionIntentMode', doc)?.value || state.recognitionIntentMode || 'neutralize', contextType: $('recognitionContextType', doc)?.value || state.recognitionContextType || 'group-chat', exposureDuration: $('recognitionExposureDuration', doc)?.value || state.recognitionExposureDuration || 'single-use' };
  return masks.map((mask) => scoreMaskRoute({ source, mask, operatorContext })).filter((row) => row.metrics.semanticCarry >= 0.45).sort(compare).slice(0, 3).map((row, index) => ({ ...row, rank: index + 1 }));
}

function ensurePanel(doc = document) {
  let panel = $('hushSuggestedMasksPanel', doc);
  if (panel) return panel;
  const anchor = $('messageDraftProfile', doc) || $('messageDraftInput', doc);
  if (!anchor) return null;
  panel = doc.createElement('section');
  panel.id = 'hushSuggestedMasksPanel';
  panel.className = 'hush-suggested-masks-panel';
  panel.hidden = true;
  anchor.insertAdjacentElement('afterend', panel);
  return panel;
}

function metric(label, value, tone = '') {
  return `<article class="hush-source-metric ${tone}"><span>${esc(label)}</span><strong>${esc(value)}</strong></article>`;
}

function renderDetailedProfile(doc = document) {
  const profileEl = $('messageDraftProfile', doc);
  const sourceText = $('messageDraftInput', doc)?.value || '';
  if (!profileEl || !txt(sourceText)) return;
  const p = sourceProfile(sourceText);
  const syntax = `avg ${round(p.avgSentenceLength, 1)}w · spread ${round(p.sentenceLengthSpread, 1)} · max ${p.maxSentenceLength}`;
  const voice = `1p ${round(p.firstPersonDensity, 2)} · 2p ${round(p.secondPersonDensity, 2)} · 3p ${round(p.thirdPersonDensity, 2)} · mod ${round(p.modalDensity, 2)}`;
  const pressure = `heat ${round(p.heatScore, 2)} · custody ${round(p.custodyPressure, 2)} · link ${round(p.authorshipLinkage, 2)}`;
  const route = p.transformDifficulty >= 0.7 ? 'high-friction transform; preserve propositions before style.' : p.authorshipLinkage >= 0.55 ? 'source-body visible; prioritize syntax movement.' : 'stable source; standard mask route.';
  const metrics = [
    metric('Words', p.wordCount), metric('Characters', p.charCount), metric('Sentences', p.sentenceCount), metric('Syntax', syntax), metric('Burstiness', round(p.burstiness, 2)), metric('Lexical variety', round(p.lexicalDiversity, 2)), metric('Hapax rate', round(p.hapaxRate, 2)), metric('Avg word length', round(p.avgWordLength, 1)), metric('Long-word rate', round(p.longWordRate, 2)), metric('Short-word rate', round(p.shortWordRate, 2)), metric('Syllables/word', round(p.syllablesPerWord, 2)), metric('Readability', round(p.readability, 1)), metric('Punctuation', round(p.punctuationDensity, 2)), metric('Comma load', round(p.commaDensity, 2)), metric('Colon/semicolon', round(p.semicolonDensity, 2)), metric('Dash load', round(p.dashDensity, 2)), metric('Quote load', round(p.quoteLoad, 2)), metric('Parenthetical load', round(p.parenLoad, 2)), metric('Question load', round(p.questionDensity, 2)), metric('Exclamation load', round(p.exclamationDensity, 2)), metric('Claim density', round(p.claimDensity, 2)), metric('Caveats', round(p.caveatDensity, 2)), metric('Voice markers', voice), metric('Causal hinges', round(p.causalDensity, 2)), metric('Contrast hinges', round(p.contrastDensity, 2)), metric('Temporal hinges', round(p.temporalDensity, 2)), metric('Named/literal load', `${round(p.namedEntityDensity, 2)} / ${round(p.protectedLiteralDensity, 2)}`), metric('Uppercase load', round(p.uppercaseDensity, 2)), metric('Emoji/sigil load', round(p.emojiDensity, 2)), metric('Recurrence', round(p.recurrencePressure || 0, 2)), metric('Bigram repeat', round(p.bigramRepeat, 2)), metric('Trigram repeat', round(p.trigramRepeat, 2)), metric('Sentence echo', round(p.sentenceEcho, 2)), metric('Pressure', pressure, p.heatScore > 0.65 ? 'warn' : ''), metric('Route difficulty', `${round(p.transformDifficulty, 2)} · ${labelScore(p.transformDifficulty)}`)
  ];
  profileEl.innerHTML = `<section class="hush-source-profile-panel" aria-label="Authorship profile"><div class="hush-source-profile-head"><div><span>Authorship Profile</span><strong>Message route scan</strong></div><p>${esc(route)}</p></div><div class="hush-source-profile-grid">${metrics.join('')}</div><div class="hush-source-profile-scroll-hint">↕ scroll stylometrics</div></section>`;
}

function captureScroll() {
  return { x: window.scrollX || document.documentElement.scrollLeft || 0, y: window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0 };
}

function restoreScroll(pos) {
  if (!pos) return;
  const restore = () => window.scrollTo({ left: pos.x, top: pos.y, behavior: 'auto' });
  restore();
  window.setTimeout(restore, 40);
  window.setTimeout(restore, 160);
}

function selectMask(maskId, doc = document) {
  const pos = captureScroll();
  const select = $('maskFieldSelect', doc);
  if (select) select.value = maskId;
  if (typeof bench.selectHushMask === 'function') bench.selectHushMask(maskId);
  analyzedSignature = signature(doc);
  setAnalyzed(doc, true);
  window.setTimeout(() => { render(doc); restoreScroll(pos); }, 0);
}

function render(doc = document) {
  const current = signature(doc);
  const panel = ensurePanel(doc);
  if (!panel) return;
  if (!analysisArmed || !txt(current) || current !== analyzedSignature) {
    hideAnalysis(doc);
    return;
  }
  setAnalyzed(doc, true);
  renderDetailedProfile(doc);
  const state = bench.benchState || {};
  const masks = [...arr(state.hushMasks), ...arr(state.customMasks)];
  panel.hidden = false;
  if (!masks.length) {
    panel.innerHTML = '<div class="hush-suggested-mask-empty">Suggested masks unavailable until mask profiles load.</div>';
    return;
  }
  const rows = recommend(doc);
  if (!rows.length) {
    panel.innerHTML = '<div class="hush-suggested-mask-empty"><strong>Suggested Masks</strong><br>No strong route found. Use a conservative mask or add a custom reference sample.</div>';
    return;
  }
  panel.innerHTML = `<div class="hush-suggested-mask-head"><div><span class="hush-suggested-kicker">Suggested Masks</span><strong>Recommended for this message, not for you.</strong></div><span>swipe routes · not identity verdicts</span></div><div class="hush-suggested-mask-carousel" role="list">${rows.map((row) => `<article class="hush-suggested-mask-card" role="listitem" data-mask-id="${esc(row.maskId)}"><div class="hush-suggested-mask-rank">${row.rank}</div><div class="hush-suggested-mask-main"><strong>${esc(row.maskLabel)}</strong><p>${esc(row.reasonLabel)}</p><div class="hush-suggested-mask-metrics"><span>score ${esc(row.routeScore)}</span><span>meaning ${esc(row.metrics.semanticCarry)}</span><span>unlink ${esc(row.metrics.sourceUnlinking)}</span><span>drift ${esc(row.metrics.driftControl)}</span><span>${esc(row.confidence)}</span></div>${row.warnings.length ? `<div class="hush-suggested-mask-warnings">${row.warnings.map((item) => `<span>${esc(item)}</span>`).join('')}</div>` : ''}<div class="hush-suggested-mask-note"></div></div><button type="button" data-hush-use-mask="${esc(row.maskId)}">Use Mask</button></article>`).join('')}</div>`;
  panel.querySelectorAll('[data-hush-use-mask]').forEach((button) => button.addEventListener('click', () => selectMask(button.getAttribute('data-hush-use-mask'), doc)));
}

function installStyle(doc = document) {
  if ($('hushPr76Style', doc)) return;
  const style = doc.createElement('style');
  style.id = 'hushPr76Style';
  style.textContent = `
    body[data-page-kind="adversarial-bench"] #messageDraftProfile,body[data-page-kind="adversarial-bench"] #hushSuggestedMasksPanel{display:none!important}
    body[data-page-kind="adversarial-bench"][data-hush-pr76-analyzed="true"] #messageDraftProfile{display:block!important}
    body[data-page-kind="adversarial-bench"][data-hush-pr76-analyzed="true"] #hushSuggestedMasksPanel:not([hidden]){display:block!important}
    .hush-source-profile-panel{margin:.65rem 0 .55rem;padding:.72rem;border:1px solid rgba(137,255,240,.20);border-radius:18px;background:linear-gradient(145deg,rgba(4,11,22,.78),rgba(16,7,26,.72));min-height:12rem;box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}
    .hush-source-profile-head{display:flex;justify-content:space-between;gap:.75rem;align-items:flex-start;margin-bottom:.58rem}.hush-source-profile-head span{display:block;color:#89e7ff;font-size:.58rem;letter-spacing:.18em;text-transform:uppercase}.hush-source-profile-head strong{display:block;color:#f1fff6;font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;margin-top:.12rem}.hush-source-profile-head p{margin:0;max-width:48%;color:rgba(226,255,236,.66);font-size:.62rem;line-height:1.32;text-align:right}.hush-source-profile-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.38rem}.hush-source-metric{min-height:3.2rem;border:1px solid rgba(137,255,240,.18);border-radius:14px;background:rgba(0,0,0,.24);padding:.42rem .46rem}.hush-source-metric span{display:block;color:rgba(202,255,223,.58);font-size:.52rem;letter-spacing:.12em;text-transform:uppercase}.hush-source-metric strong{display:block;margin-top:.22rem;color:#f1fff6;font-size:.68rem;line-height:1.2;word-break:break-word}.hush-source-metric.warn{border-color:rgba(255,184,107,.42)}.hush-source-profile-scroll-hint{display:none}
    .hush-suggested-masks-panel{margin:.65rem 0 .75rem;padding:.7rem;border:1px solid rgba(137,255,240,.26);border-radius:18px;background:linear-gradient(145deg,rgba(5,13,24,.86),rgba(14,6,24,.72));box-shadow:inset 0 1px 0 rgba(255,255,255,.08);overflow:hidden}.hush-suggested-mask-head{display:flex;justify-content:space-between;gap:.8rem;align-items:flex-start;margin-bottom:.58rem;color:#eafff5;font-size:.68rem;line-height:1.3}.hush-suggested-mask-head strong{display:block;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase}.hush-suggested-kicker{display:block;color:#89e7ff;font-size:.56rem;letter-spacing:.18em;text-transform:uppercase;margin-bottom:.14rem}.hush-suggested-mask-head>span{color:rgba(226,255,236,.58);font-size:.56rem;text-transform:uppercase;letter-spacing:.12em;text-align:right}.hush-suggested-mask-carousel{display:flex;gap:.68rem;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding:.08rem .12rem .7rem;scrollbar-width:thin}.hush-suggested-mask-card{flex:0 0 min(88%,31rem);scroll-snap-align:start;display:grid;grid-template-columns:2rem minmax(0,1fr);gap:.52rem;align-items:center;padding:.64rem;border:1px solid rgba(137,255,240,.20);border-radius:18px;background:rgba(0,0,0,.28)}.hush-suggested-mask-rank{display:grid;place-items:center;width:1.75rem;height:1.75rem;border-radius:999px;background:linear-gradient(105deg,#c69cff,#89e7ff);color:#061018;font-weight:900}.hush-suggested-mask-main strong{color:#f1fff6;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase}.hush-suggested-mask-main p{margin:.15rem 0 .28rem;color:rgba(226,255,236,.72);font-size:.62rem;line-height:1.24}.hush-suggested-mask-metrics,.hush-suggested-mask-warnings{display:flex;gap:.28rem;flex-wrap:wrap}.hush-suggested-mask-metrics span,.hush-suggested-mask-warnings span{border:1px solid rgba(137,255,240,.20);border-radius:999px;padding:.12rem .34rem;font-size:.52rem;color:#caffdf;text-transform:uppercase;letter-spacing:.08em}.hush-suggested-mask-warnings span{border-color:rgba(255,184,107,.35);color:#ffd9ad}.hush-suggested-mask-note{min-height:.72rem;margin-top:.18rem;color:#7dffe1;font-size:.56rem}.hush-suggested-mask-card button{grid-column:1/-1;border:1px solid rgba(137,255,240,.22);border-radius:999px;padding:.55rem .72rem;background:rgba(5,9,20,.86);color:#f1fff6;font-size:.62rem;font-weight:900;text-transform:uppercase;letter-spacing:.14em}.hush-suggested-mask-empty{color:#ffd9ad;font-size:.68rem;line-height:1.35}
    @media(max-width:760px){.hush-source-profile-panel{height:clamp(12rem,34vh,16rem)!important;max-height:clamp(12rem,34vh,16rem)!important;min-height:0!important;overflow-y:scroll!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important;scrollbar-width:thin!important;scrollbar-color:rgba(137,255,240,.62) rgba(3,8,18,.72)!important;padding:.56rem .5rem 1.6rem!important;box-shadow:inset 0 -1.35rem 1.4rem rgba(137,255,240,.09),inset 0 1px 0 rgba(255,255,255,.06)!important}.hush-source-profile-panel::-webkit-scrollbar{width:6px!important}.hush-source-profile-panel::-webkit-scrollbar-track{background:rgba(3,8,18,.72)!important;border-radius:999px!important}.hush-source-profile-panel::-webkit-scrollbar-thumb{background:linear-gradient(180deg,rgba(137,255,240,.9),rgba(198,156,255,.78))!important;border-radius:999px!important}.hush-source-profile-head{position:sticky!important;top:-.56rem!important;z-index:4!important;display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:.22rem!important;margin:-.56rem -.5rem .34rem!important;padding:.56rem .5rem .36rem!important;background:linear-gradient(180deg,rgba(4,10,21,.98),rgba(4,10,21,.9) 76%,rgba(4,10,21,0))!important;backdrop-filter:blur(6px)!important}.hush-source-profile-head p{max-width:none;text-align:left;margin:0;font-size:.56rem;line-height:1.25}.hush-source-profile-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:.26rem!important;overflow:visible!important;padding:0 0 .2rem!important}.hush-source-metric{height:2.92rem!important;min-height:2.92rem!important;max-height:2.92rem!important;padding:.34rem .34rem!important;border-radius:12px!important;display:flex!important;flex-direction:column!important;justify-content:center!important;overflow:hidden!important}.hush-source-metric span{font-size:.39rem!important;letter-spacing:.075em!important;line-height:1.08!important;white-space:normal!important;overflow-wrap:anywhere!important}.hush-source-metric strong{font-size:.52rem!important;line-height:1.12!important;margin-top:.12rem!important;white-space:normal!important;overflow-wrap:anywhere!important;word-break:normal!important}.hush-source-profile-scroll-hint{display:block!important;position:sticky!important;bottom:.04rem!important;z-index:5!important;margin:.38rem auto -1rem!important;width:max-content!important;max-width:92%!important;padding:.18rem .54rem!important;border:1px solid rgba(137,255,240,.24)!important;border-radius:999px!important;background:linear-gradient(105deg,rgba(7,13,28,.96),rgba(17,8,31,.94))!important;color:rgba(202,255,223,.86)!important;font-size:.48rem!important;letter-spacing:.15em!important;text-transform:uppercase!important;pointer-events:none!important;box-shadow:0 0 .7rem rgba(137,255,240,.12)!important}.hush-suggested-mask-card{flex-basis:87%;}.hush-suggested-mask-head{display:block}.hush-suggested-mask-head>span{display:block;text-align:left;margin-top:.24rem}}
  `;
  doc.head.appendChild(style);
}

function bind(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench' || doc.body.dataset.hushPr76 === 'true') return;
  doc.body.dataset.hushPr76 = 'true';
  installStyle(doc);
  ensurePanel(doc);
  const analyze = $('analyzeOutputBtn', doc);
  if (analyze) analyze.addEventListener('click', () => {
    analyzedSignature = signature(doc);
    if (!analyzedSignature) return hideAnalysis(doc);
    setAnalyzed(doc, true);
    scheduleRender(doc, 0);
  }, true);
  const input = $('messageDraftInput', doc);
  if (input) {
    input.addEventListener('input', () => {
      if (signature(doc) !== analyzedSignature) hideAnalysis(doc);
    });
  }
  ['recognitionIntentMode', 'recognitionContextType', 'recognitionExposureDuration'].forEach((id) => {
    const node = $(id, doc);
    if (node) node.addEventListener('change', () => scheduleRender(doc, 0));
  });
}

if (typeof document !== 'undefined') {
  const run = () => bind(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  [240, 720, 1400, 2600].forEach((delay) => window.setTimeout(run, delay));
}
