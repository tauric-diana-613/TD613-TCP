import * as bench from './adversarial-bench.mjs';
import { extractCadenceProfile } from './engine/stylometry.js';

const $ = (id, doc = document) => doc.getElementById(id);
const txt = (value) => String(value ?? '').trim();
const arr = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(Number(value)) ? Number(value) : 0));
const round = (value, digits = 3) => Number.isFinite(Number(value)) ? Number(Number(value).toFixed(digits)) : 0;
const words = (value = '') => (String(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length;
const wordList = (value = '') => (String(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []);
const sentences = (value = '') => (String(value).match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []).map((s) => s.trim()).filter(Boolean);
const esc = (value = '') => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
let analysisArmed = false;
let analyzedSignature = '';
let rendering = false;

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
  const protectedLiteralDensity = density(sourceText, /\b(?:EXHIBIT|DOC|CASE|ID|REF|TD613|SHI|SAC|\d{2,}(?:[-/:.]\d+)*)\b/gi);
  const namedEntityDensity = density(sourceText, /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\b/g);
  const questionDensity = count ? (sourceText.match(/\?/g) || []).length / Math.max(sentenceList.length, 1) : 0;
  const caveatDensity = density(sourceText, /\b(?:maybe|perhaps|unless|except|however|although|but|if|might|could|should|probably|apparently|because)\b/gi);
  const claimDensity = density(sourceText, /\b(?:is|are|was|were|will|must|can|created|means|shows|proves|takes|gives|made|built|shows|turns)\b/gi);
  const modalDensity = density(sourceText, /\b(?:can|could|would|should|might|must|may|need|needs|supposed|trying)\b/gi);
  const causalDensity = density(sourceText, /\b(?:because|so|therefore|since|that means|which means|if|then|when)\b/gi);
  const firstPersonDensity = density(sourceText, /\b(?:i|me|my|mine|we|us|our|ours)\b/gi);
  const secondPersonDensity = density(sourceText, /\b(?:you|your|yours|u|ur)\b/gi);
  const quoteDensity = density(sourceText, /["“”'‘’]/g);
  const parenDensity = density(sourceText, /[()[\]{}]/g);
  const uppercaseDensity = density(sourceText, /\b[A-Z]{2,}\b/g);
  const longWordRate = count ? tokens.filter((token) => token.length >= 8).length / count : 0;
  const lexicalDiversity = count ? new Set(lowerTokens).size / count : 0;
  const avgLength = profile.avgSentenceLength || mean(sentenceLengths);
  const punctuationDensity = Number(profile.punctuationDensity || density(sourceText, /[.,;:!?—-]/g));
  const heatScore = clamp01(punctuationDensity * 2.2 + questionDensity * 0.25 + caveatDensity * 1.8 + protectedLiteralDensity * 1.4 + uppercaseDensity * 0.8 + (count < 18 ? 0.12 : 0));
  return {
    ...profile,
    wordCount: profile.wordCount ?? count,
    sentenceCount: sentenceList.length,
    avgSentenceLength: avgLength,
    maxSentenceLength: Math.max(0, ...sentenceLengths),
    sentenceLengthSpread: std(sentenceLengths),
    lexicalDiversity: clamp01(lexicalDiversity),
    longWordRate: clamp01(longWordRate),
    punctuationDensity: clamp01(punctuationDensity),
    questionDensity: clamp01(questionDensity),
    claimDensity: clamp01(claimDensity * 10),
    caveatDensity: clamp01(caveatDensity * 10),
    modalDensity: clamp01(modalDensity * 10),
    causalDensity: clamp01(causalDensity * 10),
    firstPersonDensity: clamp01(firstPersonDensity * 10),
    secondPersonDensity: clamp01(secondPersonDensity * 10),
    quoteDensity: clamp01(quoteDensity * 10),
    parenDensity: clamp01(parenDensity * 10),
    uppercaseDensity: clamp01(uppercaseDensity * 10),
    heatScore,
    namedEntityDensity: clamp01(namedEntityDensity * 10),
    protectedLiteralDensity: clamp01(protectedLiteralDensity * 10),
    sourceResidualRisk: clamp01((profile.recurrencePressure || 0) * 0.55 + heatScore * 0.35 + protectedLiteralDensity * 3),
    custodyPressure: clamp01(heatScore * 0.45 + protectedLiteralDensity * 3 + caveatDensity * 4),
    authorshipLinkage: clamp01((profile.recurrencePressure || 0) * 0.28 + lexicalDiversity * 0.14 + punctuationDensity * 0.18 + firstPersonDensity * 0.15 + secondPersonDensity * 0.12 + uppercaseDensity * 0.13),
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
  let sourceUnlinking = clamp01(0.35 * distanceUseful(source.avgSentenceLength, mp.avgSentenceLength, 8) + 0.25 * caps.syntaxShiftCapacity + 0.2 * caps.dictionShiftCapacity + 0.1 * caps.recurrenceBreakPotential + 0.1 * caps.openerShiftPotential);
  if (source.sourceResidualRisk > 0.75 && maskFit > 0.85) sourceUnlinking = clamp01(sourceUnlinking - 0.15);
  const heatReduction = clamp01(source.heatScore * caps.coolingCapacity * Math.max(semanticCarry, 0.35) + (source.heatScore < 0.25 ? caps.coolingCapacity * 0.2 : 0));
  const sampleStrength = clamp01(e.totalWords / 900);
  const traitCompleteness = clamp01(Object.keys(mask.writingTraits || {}).length / 8 + Object.keys(mask.transformHints || {}).length / 6);
  const distinctiveDiction = clamp01(arr(mask.dictionHints).length / 8 + arr(mask.transitionBank).length / 10 + (e.seed.length > 240 ? 0.2 : 0));
  const lowGenericityRisk = clamp01(1 - wrapperRisk(mask));
  const driftControl = clamp01(0.35 * sampleStrength + 0.25 * traitCompleteness + 0.2 * distinctiveDiction + 0.2 * lowGenericityRisk);
  const intent = intentFit(mask, source, operatorContext);
  const wrap = wrapperRisk(mask);
  const collapseRisk = clamp01(caps.custodyRisk * 0.48 + wrap * 0.42 + (source.custodyPressure > 0.7 && textIncludesAny(mask.family || '', ['ledger', 'record']) ? 0.12 : 0));
  const custodySafety = clamp01(1 - collapseRisk);
  const routeScore = clamp01(0.24 * semanticCarry + 0.18 * maskFit + 0.18 * sourceUnlinking + 0.14 * heatReduction + 0.1 * driftControl + 0.1 * intent + 0.06 * custodySafety - 0.12 * wrap - 0.1 * collapseRisk);
  const confidence = routeScore >= 0.78 && semanticCarry >= 0.75 && sourceUnlinking >= 0.55 && collapseRisk <= 0.3 ? 'high' : routeScore >= 0.62 && semanticCarry >= 0.62 ? 'medium' : 'low';
  let reasonLabel = 'Balanced route: meaning held with usable distance.';
  let reasonCode = 'balanced-route';
  if (semanticCarry >= 0.78 && wrap < 0.25) { reasonCode = 'semantic-carry'; reasonLabel = 'Best for meaning preservation with low wrapper risk.'; }
  if (sourceUnlinking >= 0.78) { reasonCode = 'source-unlinking'; reasonLabel = 'Strong source unlinking and syntax movement.'; }
  if (heatReduction >= 0.65 && source.heatScore >= 0.35) { reasonCode = 'heat-reduction'; reasonLabel = 'Lowers source heat while preserving intent.'; }
  if (collapseRisk > 0.48) { reasonCode = 'review-needed'; reasonLabel = 'Useful route, but review custody/wrapper risk.'; }
  const warnings = [];
  if (confidence === 'low') warnings.push('use-with-review');
  if (wrap > 0.45) warnings.push('wrapper-risk');
  if (collapseRisk > 0.45) warnings.push('custody-collapse-risk');
  if (source.wordCount < 12) warnings.push('short-source-confidence-reduced');
  return { maskId: mask.id, maskLabel: mask.label || mask.id, rank: 0, routeScore: round(routeScore), confidence, reasonCode, reasonLabel, metrics: { semanticCarry: round(semanticCarry), maskFit: round(maskFit), sourceUnlinking: round(sourceUnlinking), heatReduction: round(heatReduction), driftControl: round(driftControl), intentFit: round(intent), custodySafety: round(custodySafety), wrapperRisk: round(wrap), collapseRisk: round(collapseRisk), total: round(routeScore) }, warnings };
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
  const voice = `1p ${round(p.firstPersonDensity, 2)} · 2p ${round(p.secondPersonDensity, 2)} · modality ${round(p.modalDensity, 2)}`;
  const pressure = `heat ${round(p.heatScore, 2)} · custody ${round(p.custodyPressure, 2)} · link ${round(p.authorshipLinkage, 2)}`;
  const route = p.transformDifficulty >= 0.7 ? 'high-friction transform; preserve propositions before style.' : p.authorshipLinkage >= 0.55 ? 'source-body visible; prioritize syntax movement.' : 'stable source; standard mask route.';
  rendering = true;
  profileEl.innerHTML = `<section class="hush-source-profile-panel" aria-label="Authorship profile"><div class="hush-source-profile-head"><div><span>Authorship Profile</span><strong>Message route scan</strong></div><p>${esc(route)}</p></div><div class="hush-source-profile-grid">${[
    metric('Words', p.wordCount),
    metric('Sentences', p.sentenceCount),
    metric('Syntax', syntax),
    metric('Punctuation', round(p.punctuationDensity, 2)),
    metric('Recurrence', round(p.recurrencePressure || 0, 2)),
    metric('Lexical variety', round(p.lexicalDiversity, 2)),
    metric('Long-word rate', round(p.longWordRate, 2)),
    metric('Question load', round(p.questionDensity, 2)),
    metric('Claim density', round(p.claimDensity, 2)),
    metric('Caveats', round(p.caveatDensity, 2)),
    metric('Voice markers', voice),
    metric('Causal hinges', round(p.causalDensity, 2)),
    metric('Named/literal load', `${round(p.namedEntityDensity, 2)} / ${round(p.protectedLiteralDensity, 2)}`),
    metric('Pressure', pressure, p.heatScore > 0.65 ? 'warn' : ''),
    metric('Route difficulty', `${round(p.transformDifficulty, 2)} · ${labelScore(p.transformDifficulty)}`)
  ].join('')}</div></section>`;
  rendering = false;
}

function captureScroll() {
  return { x: window.scrollX || document.documentElement.scrollLeft || 0, y: window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0 };
}

function restoreScroll(pos) {
  if (!pos) return;
  const restore = () => window.scrollTo({ left: pos.x, top: pos.y, behavior: 'auto' });
  restore();
  window.setTimeout(restore, 30);
  window.setTimeout(restore, 120);
  window.setTimeout(restore, 260);
}

function selectMask(maskId, doc = document) {
  const pos = captureScroll();
  const select = $('maskFieldSelect', doc);
  if (select) select.value = maskId;
  if (typeof bench.selectHushMask === 'function') bench.selectHushMask(maskId);
  analyzedSignature = signature(doc);
  setAnalyzed(doc, true);
  window.setTimeout(() => { render(doc); restoreScroll(pos); }, 0);
  window.setTimeout(() => restoreScroll(pos), 160);
}

function render(doc = document) {
  if (rendering) return;
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
    .hush-source-profile-head{display:flex;justify-content:space-between;gap:.75rem;align-items:flex-start;margin-bottom:.58rem}.hush-source-profile-head span{display:block;color:#89e7ff;font-size:.58rem;letter-spacing:.18em;text-transform:uppercase}.hush-source-profile-head strong{display:block;color:#f1fff6;font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;margin-top:.12rem}.hush-source-profile-head p{margin:0;max-width:48%;color:rgba(226,255,236,.66);font-size:.62rem;line-height:1.32;text-align:right}.hush-source-profile-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.38rem}.hush-source-metric{min-height:3.2rem;border:1px solid rgba(137,255,240,.18);border-radius:14px;background:rgba(0,0,0,.24);padding:.42rem .46rem}.hush-source-metric span{display:block;color:rgba(202,255,223,.58);font-size:.52rem;letter-spacing:.12em;text-transform:uppercase}.hush-source-metric strong{display:block;margin-top:.22rem;color:#f1fff6;font-size:.68rem;line-height:1.2;word-break:break-word}.hush-source-metric.warn{border-color:rgba(255,184,107,.42)}
    .hush-suggested-masks-panel{margin:.65rem 0 .75rem;padding:.7rem;border:1px solid rgba(137,255,240,.26);border-radius:18px;background:linear-gradient(145deg,rgba(5,13,24,.86),rgba(14,6,24,.72));box-shadow:inset 0 1px 0 rgba(255,255,255,.08);overflow:hidden}.hush-suggested-mask-head{display:flex;justify-content:space-between;gap:.8rem;align-items:flex-start;margin-bottom:.58rem;color:#eafff5;font-size:.68rem;line-height:1.3}.hush-suggested-mask-head strong{display:block;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase}.hush-suggested-kicker{display:block;color:#89e7ff;font-size:.56rem;letter-spacing:.18em;text-transform:uppercase;margin-bottom:.14rem}.hush-suggested-mask-head>span{color:rgba(226,255,236,.58);font-size:.56rem;text-transform:uppercase;letter-spacing:.12em;text-align:right}.hush-suggested-mask-carousel{display:flex;gap:.68rem;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding:.08rem .12rem .7rem;scrollbar-width:thin}.hush-suggested-mask-card{flex:0 0 min(88%,31rem);scroll-snap-align:start;display:grid;grid-template-columns:2rem minmax(0,1fr);gap:.52rem;align-items:center;padding:.64rem;border:1px solid rgba(137,255,240,.20);border-radius:18px;background:rgba(0,0,0,.28)}.hush-suggested-mask-rank{display:grid;place-items:center;width:1.75rem;height:1.75rem;border-radius:999px;background:linear-gradient(105deg,#c69cff,#89e7ff);color:#061018;font-weight:900}.hush-suggested-mask-main strong{color:#f1fff6;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase}.hush-suggested-mask-main p{margin:.15rem 0 .28rem;color:rgba(226,255,236,.72);font-size:.62rem;line-height:1.24}.hush-suggested-mask-metrics,.hush-suggested-mask-warnings{display:flex;gap:.28rem;flex-wrap:wrap}.hush-suggested-mask-metrics span,.hush-suggested-mask-warnings span{border:1px solid rgba(137,255,240,.20);border-radius:999px;padding:.12rem .34rem;font-size:.52rem;color:#caffdf;text-transform:uppercase;letter-spacing:.08em}.hush-suggested-mask-warnings span{border-color:rgba(255,184,107,.35);color:#ffd9ad}.hush-suggested-mask-note{min-height:.72rem;margin-top:.18rem;color:#7dffe1;font-size:.56rem}.hush-suggested-mask-card button{grid-column:1/-1;border:1px solid rgba(137,255,240,.22);border-radius:999px;padding:.55rem .72rem;background:rgba(5,9,20,.86);color:#f1fff6;font-size:.62rem;font-weight:900;text-transform:uppercase;letter-spacing:.14em}.hush-suggested-mask-empty{color:#ffd9ad;font-size:.68rem;line-height:1.35}
    @media(max-width:760px){.hush-source-profile-head{display:block}.hush-source-profile-head p{max-width:none;text-align:left;margin-top:.35rem}.hush-source-profile-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:.34rem}.hush-source-metric{min-height:3rem}.hush-suggested-mask-card{flex-basis:87%;}.hush-suggested-mask-head{display:block}.hush-suggested-mask-head>span{display:block;text-align:left;margin-top:.24rem}}
  `;
  doc.head.appendChild(style);
}

function observeProfile(doc = document) {
  const profile = $('messageDraftProfile', doc);
  if (!profile || profile.dataset.pr76Observed === 'true') return;
  profile.dataset.pr76Observed = 'true';
  const observer = new MutationObserver(() => {
    if (rendering) return;
    window.setTimeout(() => {
      if (!analysisArmed || signature(doc) !== analyzedSignature) hideAnalysis(doc);
      else renderDetailedProfile(doc);
    }, 0);
  });
  observer.observe(profile, { childList: true, subtree: true, characterData: true });
}

function boot(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench') return;
  doc.body.dataset.hushPr76Recommender = 'true';
  installStyle(doc);
  ensurePanel(doc);
  hideAnalysis(doc);
  observeProfile(doc);
  const analyze = $('analyzeOutputBtn', doc);
  if (analyze && analyze.dataset.pr76Bound !== 'true') {
    analyze.dataset.pr76Bound = 'true';
    analyze.addEventListener('click', () => window.setTimeout(() => { analyzedSignature = signature(doc); setAnalyzed(doc, true); render(doc); }, 120));
  }
  const input = $('messageDraftInput', doc);
  if (input && input.dataset.pr76Bound !== 'true') {
    input.dataset.pr76Bound = 'true';
    input.addEventListener('input', () => { analyzedSignature = ''; window.setTimeout(() => hideAnalysis(doc), 0); window.setTimeout(() => hideAnalysis(doc), 80); });
    input.addEventListener('paste', () => { analyzedSignature = ''; window.setTimeout(() => hideAnalysis(doc), 0); window.setTimeout(() => hideAnalysis(doc), 120); });
  }
}

if (typeof document !== 'undefined') {
  const run = () => boot(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true }); else run();
  [240, 720, 1400, 2600].forEach((delay) => window.setTimeout(run, delay));
}

export { recommend as recommendHushMasksForCurrentMessage, scoreMaskRoute };