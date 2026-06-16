import { benchState, selectHushMask } from './adversarial-bench-light.js';
import { extractCadenceProfile } from './engine/stylometry.js';

const VERSION = 'hush-pr76-light-panels/v1-no-generator-coupling';
const $ = (id, doc = document) => doc.getElementById(id);
const text = (value) => String(value ?? '').trim();
const esc = (value = '') => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const words = (value = '') => (String(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length;
const tokens = (value = '') => (String(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []);
const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(Number(value)) ? Number(value) : 0));
const round = (value, digits = 2) => Number.isFinite(Number(value)) ? Number(Number(value).toFixed(digits)) : 0;
let analyzedSignature = '';
let renderTimer = null;

function installStyle(doc = document) {
  if ($('hushPr76LightPanelsStyle', doc)) return;
  const style = doc.createElement('style');
  style.id = 'hushPr76LightPanelsStyle';
  style.textContent = `
    body[data-page-kind="adversarial-bench"] #messageDraftProfile,
    body[data-page-kind="adversarial-bench"] #hushSuggestedMasksPanel {
      display: none !important;
    }
    body[data-page-kind="adversarial-bench"][data-hush-pr76-analyzed="true"] #messageDraftProfile {
      display: block !important;
    }
    body[data-page-kind="adversarial-bench"][data-hush-pr76-analyzed="true"] #hushSuggestedMasksPanel:not([hidden]) {
      display: block !important;
    }
    .hush-source-profile-panel {
      margin: .42rem 0 .55rem;
      padding: .72rem;
      border: 1px solid rgba(137,255,240,.20);
      border-radius: 18px;
      background: linear-gradient(145deg, rgba(4,11,22,.78), rgba(16,7,26,.72));
      min-height: 12rem;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.06);
    }
    .hush-source-profile-head { display:flex; justify-content:space-between; gap:.75rem; align-items:flex-start; margin-bottom:.58rem; }
    .hush-source-profile-head span { display:block; color:#89e7ff; font-size:.58rem; letter-spacing:.18em; text-transform:uppercase; }
    .hush-source-profile-head strong { display:block; color:#f1fff6; font-size:.78rem; letter-spacing:.12em; text-transform:uppercase; margin-top:.12rem; }
    .hush-source-profile-head p { margin:0; max-width:48%; color:rgba(226,255,236,.66); font-size:.62rem; line-height:1.32; text-align:right; }
    .hush-source-profile-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:.38rem; }
    .hush-source-metric { min-height:3.2rem; border:1px solid rgba(137,255,240,.18); border-radius:14px; background:rgba(0,0,0,.24); padding:.42rem .46rem; }
    .hush-source-metric span { display:block; color:rgba(202,255,223,.58); font-size:.52rem; letter-spacing:.12em; text-transform:uppercase; }
    .hush-source-metric strong { display:block; margin-top:.22rem; color:#f1fff6; font-size:.68rem; line-height:1.2; word-break:break-word; }
    .hush-source-metric.warn { border-color:rgba(255,184,107,.42); }
    .hush-source-profile-scroll-hint { display:none; }
    .hush-suggested-masks-panel { margin:.65rem 0 .75rem; padding:.7rem; border:1px solid rgba(137,255,240,.26); border-radius:18px; background:linear-gradient(145deg,rgba(5,13,24,.86),rgba(14,6,24,.72)); box-shadow:inset 0 1px 0 rgba(255,255,255,.08); overflow:hidden; }
    .hush-suggested-mask-head { display:flex; justify-content:space-between; gap:.8rem; align-items:flex-start; margin-bottom:.58rem; color:#eafff5; font-size:.68rem; line-height:1.3; }
    .hush-suggested-mask-head strong { display:block; font-size:.72rem; letter-spacing:.08em; text-transform:uppercase; }
    .hush-suggested-kicker { display:block; color:#89e7ff; font-size:.56rem; letter-spacing:.18em; text-transform:uppercase; margin-bottom:.14rem; }
    .hush-suggested-mask-head > span { color:rgba(226,255,236,.58); font-size:.56rem; text-transform:uppercase; letter-spacing:.12em; text-align:right; }
    .hush-suggested-mask-carousel { display:flex; gap:.68rem; overflow-x:auto; overscroll-behavior-x:contain; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; padding:.08rem .12rem .7rem; scrollbar-width:thin; }
    .hush-suggested-mask-card { flex:0 0 min(88%,31rem); scroll-snap-align:start; display:grid; grid-template-columns:2rem minmax(0,1fr); gap:.52rem; align-items:center; padding:.64rem; border:1px solid rgba(137,255,240,.20); border-radius:18px; background:rgba(0,0,0,.28); }
    .hush-suggested-mask-rank { display:grid; place-items:center; width:1.75rem; height:1.75rem; border-radius:999px; background:linear-gradient(105deg,#c69cff,#89e7ff); color:#061018; font-weight:900; }
    .hush-suggested-mask-main strong { color:#f1fff6; font-size:.72rem; letter-spacing:.08em; text-transform:uppercase; }
    .hush-suggested-mask-main p { margin:.15rem 0 .28rem; color:rgba(226,255,236,.72); font-size:.62rem; line-height:1.24; }
    .hush-suggested-mask-metrics { display:flex; gap:.28rem; flex-wrap:wrap; }
    .hush-suggested-mask-metrics span { border:1px solid rgba(137,255,240,.20); border-radius:999px; padding:.12rem .34rem; font-size:.52rem; color:#caffdf; text-transform:uppercase; letter-spacing:.08em; }
    .hush-suggested-mask-card button { grid-column:1/-1; border:1px solid rgba(137,255,240,.22); border-radius:999px; padding:.55rem .72rem; background:rgba(5,9,20,.86); color:#f1fff6; font-size:.62rem; font-weight:900; text-transform:uppercase; letter-spacing:.14em; }
    .hush-suggested-mask-empty { color:#ffd9ad; font-size:.68rem; line-height:1.35; }
    @media(max-width:760px){
      .hush-source-profile-panel{height:clamp(12rem,34vh,16rem)!important;max-height:clamp(12rem,34vh,16rem)!important;min-height:0!important;overflow-y:scroll!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important;scrollbar-width:thin!important;scrollbar-color:rgba(137,255,240,.62) rgba(3,8,18,.72)!important;padding:.56rem .5rem 1.6rem!important;box-shadow:inset 0 -1.35rem 1.4rem rgba(137,255,240,.09),inset 0 1px 0 rgba(255,255,255,.06)!important}
      .hush-source-profile-head{position:sticky!important;top:-.56rem!important;z-index:4!important;display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:.22rem!important;margin:-.56rem -.5rem .34rem!important;padding:.56rem .5rem .36rem!important;background:linear-gradient(180deg,rgba(4,10,21,.98),rgba(4,10,21,.9) 76%,rgba(4,10,21,0))!important;backdrop-filter:blur(6px)!important}
      .hush-source-profile-head p{max-width:none;text-align:left;margin:0;font-size:.56rem;line-height:1.25}
      .hush-source-profile-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:.26rem!important;overflow:visible!important;padding:0 0 .2rem!important}
      .hush-source-metric{height:2.92rem!important;min-height:2.92rem!important;max-height:2.92rem!important;padding:.34rem .34rem!important;border-radius:12px!important;display:flex!important;flex-direction:column!important;justify-content:center!important;overflow:hidden!important}
      .hush-source-metric span{font-size:.39rem!important;letter-spacing:.075em!important;line-height:1.08!important;white-space:normal!important;overflow-wrap:anywhere!important}
      .hush-source-metric strong{font-size:.52rem!important;line-height:1.12!important;margin-top:.12rem!important;white-space:normal!important;overflow-wrap:anywhere!important;word-break:normal!important}
      .hush-source-profile-scroll-hint{display:block!important;position:sticky!important;bottom:.04rem!important;z-index:5!important;margin:.38rem auto -1rem!important;width:max-content!important;max-width:92%!important;padding:.18rem .54rem!important;border:1px solid rgba(137,255,240,.24)!important;border-radius:999px!important;background:linear-gradient(105deg,rgba(7,13,28,.96),rgba(17,8,31,.94))!important;color:rgba(202,255,223,.86)!important;font-size:.48rem!important;letter-spacing:.15em!important;text-transform:uppercase!important;pointer-events:none!important;box-shadow:0 0 .7rem rgba(137,255,240,.12)!important}
      .hush-suggested-mask-card{flex-basis:87%;}.hush-suggested-mask-head{display:block}.hush-suggested-mask-head>span{display:block;text-align:left;margin-top:.24rem}
    }
  `;
  doc.head.appendChild(style);
}

function metric(label, value, tone = '') {
  return `<article class="hush-source-metric ${tone}"><span>${esc(label)}</span><strong>${esc(value)}</strong></article>`;
}

function profileFor(sourceText = '') {
  const cadence = extractCadenceProfile(sourceText) || {};
  const t = tokens(sourceText);
  const lower = t.map((token) => token.toLowerCase());
  const sentenceList = String(sourceText).match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
  const sentenceLengths = sentenceList.map(words);
  const avg = cadence.avgSentenceLength || (sentenceLengths.reduce((sum, value) => sum + value, 0) / Math.max(sentenceLengths.length, 1));
  const lexicalVariety = t.length ? new Set(lower).size / t.length : 0;
  const punctuationDensity = cadence.punctuationDensity || clamp01((sourceText.match(/[.,;:!?—-]/g) || []).length / Math.max(words(sourceText), 1));
  const caveats = clamp01((sourceText.match(/\b(?:maybe|perhaps|unless|except|however|although|but|if|might|could|should|probably|apparently|because|arguably|seems|appears)\b/gi) || []).length / Math.max(words(sourceText), 1) * 10);
  const literals = clamp01((sourceText.match(/\b(?:EXHIBIT|DOC|CASE|ID|REF|TD613|SHI|SAC|API|LLM|AI|PR\d+|\d{2,}(?:[-/:.]\d+)*)\b/gi) || []).length / Math.max(words(sourceText), 1) * 10);
  const firstPerson = clamp01((sourceText.match(/\b(?:i|me|my|mine|we|us|our|ours)\b/gi) || []).length / Math.max(words(sourceText), 1) * 10);
  const secondPerson = clamp01((sourceText.match(/\b(?:you|your|yours|u|ur)\b/gi) || []).length / Math.max(words(sourceText), 1) * 10);
  const heat = clamp01(punctuationDensity * 2 + caveats * .25 + literals * .35);
  return { ...cadence, wordCount: words(sourceText), charCount: sourceText.replace(/\s/g, '').length, sentenceCount: sentenceList.length, avgSentenceLength: avg || 0, maxSentenceLength: Math.max(0, ...sentenceLengths), lexicalVariety, punctuationDensity, caveats, literals, firstPerson, secondPerson, heat, authorshipLinkage: clamp01((cadence.recurrencePressure || 0) * .35 + punctuationDensity * .25 + firstPerson * .18 + secondPerson * .12 + lexicalVariety * .1), transformDifficulty: clamp01(heat * .45 + literals * .35 + caveats * .2) };
}

function ensureSuggestedPanel(doc = document) {
  let panel = $('hushSuggestedMasksPanel', doc);
  if (panel) return panel;
  const anchor = $('messageDraftProfile', doc) || $('hushInputControlRail', doc) || $('messageDraftInput', doc);
  if (!anchor) return null;
  panel = doc.createElement('section');
  panel.id = 'hushSuggestedMasksPanel';
  panel.className = 'hush-suggested-masks-panel';
  panel.hidden = true;
  anchor.insertAdjacentElement('afterend', panel);
  return panel;
}

function renderProfile(doc = document) {
  const sourceText = $('messageDraftInput', doc)?.value || '';
  const profileEl = $('messageDraftProfile', doc);
  if (!profileEl || !text(sourceText)) return;
  const p = profileFor(sourceText);
  const route = p.transformDifficulty >= .7 ? 'high-friction transform; preserve propositions before style.' : p.authorshipLinkage >= .55 ? 'source-body visible; prioritize syntax movement.' : 'stable source; standard mask route.';
  const metrics = [
    metric('Words', p.wordCount),
    metric('Characters', p.charCount),
    metric('Sentences', p.sentenceCount),
    metric('Avg sentence', round(p.avgSentenceLength, 1)),
    metric('Max sentence', p.maxSentenceLength),
    metric('Lexical variety', round(p.lexicalVariety, 2)),
    metric('Punctuation', round(p.punctuationDensity, 2)),
    metric('Caveats', round(p.caveats, 2)),
    metric('Literal load', round(p.literals, 2), p.literals > .55 ? 'warn' : ''),
    metric('First person', round(p.firstPerson, 2)),
    metric('Second person', round(p.secondPerson, 2)),
    metric('Recurrence', round(p.recurrencePressure || 0, 2)),
    metric('Authorship link', round(p.authorshipLinkage, 2), p.authorshipLinkage > .6 ? 'warn' : ''),
    metric('Route difficulty', round(p.transformDifficulty, 2))
  ];
  profileEl.innerHTML = `<section class="hush-source-profile-panel" aria-label="Authorship profile"><div class="hush-source-profile-head"><div><span>Authorship Profile</span><strong>Message route scan</strong></div><p>${esc(route)}</p></div><div class="hush-source-profile-grid">${metrics.join('')}</div><div class="hush-source-profile-scroll-hint">↕ scroll stylometrics</div></section>`;
}

function scoreMask(mask = {}, sourceText = '') {
  const hay = [mask.label, mask.family, mask.description, mask.intendedUse, mask.riskTell, mask.sampleSeed].join(' ').toLowerCase();
  const source = sourceText.toLowerCase();
  const precise = /grounded|ledger|plain|precise|document|legal|literal|careful/.test(hay) ? .18 : 0;
  const expressive = /poetic|symbolic|glitch|oracle|cassandra|theory|ritual/.test(hay) ? .1 : 0;
  const literalNeed = /\b(?:td613|case|doc|id|exhibit|api|llm|ai|\d{2,})\b/i.test(source) ? precise : 0;
  const sourceWords = words(sourceText);
  const seedWords = words(mask.sampleSeed || mask.description || '');
  const lengthFit = clamp01(seedWords / Math.max(160, sourceWords));
  const routeScore = clamp01(.42 + lengthFit * .22 + literalNeed + expressive);
  return { mask, routeScore, reason: precise ? 'Good for literal/custody-heavy routing.' : expressive ? 'Good for expressive surface movement.' : 'Balanced route for this message.' };
}

function renderSuggestions(doc = document) {
  const panel = ensureSuggestedPanel(doc);
  const sourceText = $('messageDraftInput', doc)?.value || '';
  if (!panel || !text(sourceText)) return;
  const masks = [...(benchState.hushMasks || []), ...(benchState.customMasks || [])];
  panel.hidden = false;
  const rows = masks.map((mask) => scoreMask(mask, sourceText)).sort((a, b) => b.routeScore - a.routeScore).slice(0, 3);
  if (!rows.length) {
    panel.innerHTML = '<div class="hush-suggested-mask-empty"><strong>Suggested Masks</strong><br>No route candidates available yet.</div>';
    return;
  }
  panel.innerHTML = `<div class="hush-suggested-mask-head"><div><span class="hush-suggested-kicker">Suggested Masks</span><strong>Recommended for this message, not for you.</strong></div><span>swipe routes · not identity verdicts</span></div><div class="hush-suggested-mask-carousel" role="list">${rows.map((row, idx) => `<article class="hush-suggested-mask-card" role="listitem"><div class="hush-suggested-mask-rank">${idx + 1}</div><div class="hush-suggested-mask-main"><strong>${esc(row.mask.label || row.mask.id || 'Unnamed mask')}</strong><p>${esc(row.reason)}</p><div class="hush-suggested-mask-metrics"><span>score ${round(row.routeScore, 2)}</span><span>${esc(row.mask.family || row.mask.profileStatus || 'route')}</span></div></div><button type="button" data-hush-use-mask="${esc(row.mask.id || '')}">Use Mask</button></article>`).join('')}</div>`;
  panel.querySelectorAll('[data-hush-use-mask]').forEach((button) => button.addEventListener('click', () => {
    const maskId = button.getAttribute('data-hush-use-mask') || '';
    const select = $('maskFieldSelect', doc);
    if (select) {
      select.value = maskId;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    selectHushMask(maskId, doc);
  }));
}

function hidePanels(doc = document) {
  if (doc.body) doc.body.dataset.hushPr76Analyzed = 'false';
  const profile = $('messageDraftProfile', doc);
  if (profile) profile.innerHTML = '';
  const panel = $('hushSuggestedMasksPanel', doc);
  if (panel) { panel.hidden = true; panel.innerHTML = ''; }
}

function render(doc = document) {
  const current = text($('messageDraftInput', doc)?.value || '');
  if (!current || current !== analyzedSignature) return hidePanels(doc);
  if (doc.body) doc.body.dataset.hushPr76Analyzed = 'true';
  renderProfile(doc);
  renderSuggestions(doc);
}

function bind(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench' || doc.body.dataset.hushPr76LightPanels === 'true') return;
  doc.body.dataset.hushPr76LightPanels = 'true';
  installStyle(doc);
  ensureSuggestedPanel(doc);
  const analyze = $('analyzeOutputBtn', doc);
  if (analyze) analyze.addEventListener('click', () => {
    analyzedSignature = text($('messageDraftInput', doc)?.value || '');
    if (!analyzedSignature) return hidePanels(doc);
    if (doc.body) doc.body.dataset.hushPr76Analyzed = 'true';
    window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(() => render(doc), 0);
  }, true);
  const input = $('messageDraftInput', doc);
  if (input) input.addEventListener('input', () => {
    if (text(input.value || '') !== analyzedSignature) hidePanels(doc);
  });
}

if (typeof document !== 'undefined') {
  const run = () => bind(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  [240, 720, 1400, 2600].forEach((delay) => window.setTimeout(run, delay));
}

window.__TD613_HUSH_PR76_LIGHT_PANELS__ = { version: VERSION, render, hidePanels };
