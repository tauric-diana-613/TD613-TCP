const VERSION = 'hush-pr76-light-panels/v3-dom-only-readonly';
const $ = (id, doc = document) => doc.getElementById(id);
const text = (value) => String(value ?? '').trim();
const esc = (value = '') => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const wordList = (value = '') => String(value || '').match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || [];
const words = (value = '') => wordList(value).length;
const round = (value, digits = 2) => Number.isFinite(Number(value)) ? Number(Number(value).toFixed(digits)) : 0;
const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(Number(value)) ? Number(value) : 0));
let analyzedSignature = '';
let renderTimer = null;

function installStyle(doc = document) {
  if ($('hushPr76DomOnlyStyle', doc)) return;
  const style = doc.createElement('style');
  style.id = 'hushPr76DomOnlyStyle';
  style.textContent = `
    body[data-page-kind="adversarial-bench"] #messageDraftProfile:empty::before {
      content: 'No profile yet';
      color: rgba(226,255,236,.34);
    }
    body[data-page-kind="adversarial-bench"] #messageDraftProfile {
      display: block !important;
      margin: .4rem 0 .54rem !important;
    }
    body[data-page-kind="adversarial-bench"] #hushSuggestedMasksPanel[hidden] { display: none !important; }
    .hush-pr76-profile-panel {
      position: relative;
      margin: .28rem 0 .58rem;
      padding: .64rem .62rem 1.35rem;
      border: 1px solid rgba(137,255,240,.20);
      border-left: 3px solid rgba(137,255,240,.70);
      border-radius: 14px;
      background: linear-gradient(145deg, rgba(3,9,20,.82), rgba(13,7,25,.72));
      box-shadow: inset 0 1px 0 rgba(255,255,255,.06), 0 0 18px rgba(137,255,240,.07);
      max-height: clamp(12rem, 34vh, 17rem);
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
      scrollbar-width: thin;
    }
    .hush-pr76-profile-head {
      position: sticky;
      top: -.64rem;
      z-index: 2;
      display: grid;
      gap: .16rem;
      margin: -.64rem -.62rem .44rem;
      padding: .64rem .62rem .42rem;
      background: linear-gradient(180deg, rgba(3,9,20,.98), rgba(3,9,20,.90) 78%, rgba(3,9,20,0));
      backdrop-filter: blur(6px);
    }
    .hush-pr76-profile-head span,
    .hush-pr76-suggested-kicker {
      color: #89e7ff;
      font-size: .54rem;
      letter-spacing: .18em;
      text-transform: uppercase;
    }
    .hush-pr76-profile-head strong {
      color: #f1fff6;
      font-size: .74rem;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    .hush-pr76-profile-head p {
      margin: .08rem 0 0;
      color: rgba(226,255,236,.64);
      font-size: .58rem;
      line-height: 1.28;
    }
    .hush-pr76-metric-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: .28rem;
    }
    .hush-pr76-metric {
      min-height: 3rem;
      padding: .38rem .4rem;
      border: 1px solid rgba(137,255,240,.16);
      border-radius: 12px;
      background: rgba(0,0,0,.24);
      display: flex;
      flex-direction: column;
      justify-content: center;
      overflow: hidden;
    }
    .hush-pr76-metric span {
      color: rgba(202,255,223,.58);
      font-size: .42rem;
      line-height: 1.08;
      letter-spacing: .09em;
      text-transform: uppercase;
    }
    .hush-pr76-metric strong {
      margin-top: .14rem;
      color: #f1fff6;
      font-size: .56rem;
      line-height: 1.12;
      overflow-wrap: anywhere;
    }
    .hush-pr76-metric.warn { border-color: rgba(255,184,107,.40); }
    .hush-pr76-scroll-hint {
      position: sticky;
      bottom: .04rem;
      z-index: 3;
      width: max-content;
      max-width: 92%;
      margin: .42rem auto -1rem;
      padding: .16rem .54rem;
      border: 1px solid rgba(137,255,240,.22);
      border-radius: 999px;
      background: linear-gradient(105deg,rgba(7,13,28,.96),rgba(17,8,31,.94));
      color: rgba(202,255,223,.86);
      font-size: .46rem;
      letter-spacing: .15em;
      text-transform: uppercase;
      pointer-events: none;
    }
    .hush-pr76-suggested-panel {
      margin: .58rem 0 .74rem;
      padding: .68rem .58rem .72rem;
      border: 1px solid rgba(137,255,240,.22);
      border-left: 3px solid rgba(198,156,255,.70);
      border-radius: 14px;
      background: linear-gradient(145deg,rgba(5,13,24,.84),rgba(14,6,24,.72));
      box-shadow: inset 0 1px 0 rgba(255,255,255,.07), 0 0 16px rgba(198,156,255,.08);
      overflow: hidden;
    }
    .hush-pr76-suggested-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: .7rem;
      margin-bottom: .56rem;
      color: #f1fff6;
    }
    .hush-pr76-suggested-head strong {
      display: block;
      margin-top: .12rem;
      font-size: .72rem;
      letter-spacing: .1em;
      text-transform: uppercase;
    }
    .hush-pr76-suggested-head em {
      color: rgba(226,255,236,.56);
      font-style: normal;
      font-size: .52rem;
      letter-spacing: .12em;
      text-transform: uppercase;
      text-align: right;
    }
    .hush-pr76-carousel {
      display: flex;
      gap: .64rem;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-x: contain;
      padding: .08rem .06rem .64rem;
    }
    .hush-pr76-card {
      flex: 0 0 min(88%, 30rem);
      scroll-snap-align: start;
      display: grid;
      grid-template-columns: 1.85rem minmax(0,1fr);
      gap: .48rem;
      align-items: center;
      padding: .62rem;
      border: 1px solid rgba(137,255,240,.18);
      border-radius: 16px;
      background: rgba(0,0,0,.26);
    }
    .hush-pr76-rank {
      display: grid;
      place-items: center;
      width: 1.7rem;
      height: 1.7rem;
      border-radius: 999px;
      background: linear-gradient(105deg,#c69cff,#89e7ff);
      color: #061018;
      font-weight: 900;
    }
    .hush-pr76-card strong {
      color: #f1fff6;
      font-size: .68rem;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    .hush-pr76-card p {
      margin: .16rem 0 .28rem;
      color: rgba(226,255,236,.70);
      font-size: .58rem;
      line-height: 1.24;
    }
    .hush-pr76-tags {
      display: flex;
      gap: .28rem;
      flex-wrap: wrap;
    }
    .hush-pr76-tags span {
      border: 1px solid rgba(137,255,240,.18);
      border-radius: 999px;
      padding: .1rem .32rem;
      font-size: .48rem;
      color: #caffdf;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    .hush-pr76-card button {
      grid-column: 1 / -1;
      border: 1px solid rgba(137,255,240,.22);
      border-radius: 999px;
      padding: .52rem .68rem;
      background: rgba(5,9,20,.86);
      color: #f1fff6;
      font-size: .58rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: .14em;
    }
  `;
  doc.head.appendChild(style);
}

function metric(label, value, tone = '') {
  return `<article class="hush-pr76-metric ${tone}"><span>${esc(label)}</span><strong>${esc(value)}</strong></article>`;
}

function profileFor(source = '') {
  const tokens = wordList(source);
  const lower = tokens.map((token) => token.toLowerCase());
  const sentences = String(source).match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
  const sentenceLengths = sentences.map(words);
  const punctuation = (source.match(/[.,;:!?—-]/g) || []).length;
  const caveatHits = (source.match(/\b(?:maybe|perhaps|unless|except|however|although|but|if|might|could|should|probably|apparently|because|arguably|seems|appears)\b/gi) || []).length;
  const literalHits = (source.match(/\b(?:TD613|SHI|SAC|API|LLM|AI|PR\d+|\d{2,}(?:[-/:.]\d+)*)\b/gi) || []).length;
  const firstPerson = (source.match(/\b(?:i|me|my|mine|we|us|our|ours)\b/gi) || []).length;
  const secondPerson = (source.match(/\b(?:you|your|yours|u|ur)\b/gi) || []).length;
  const repeats = lower.length - new Set(lower).size;
  const lexicalVariety = tokens.length ? new Set(lower).size / tokens.length : 0;
  const avgSentence = sentenceLengths.length ? sentenceLengths.reduce((sum, v) => sum + v, 0) / sentenceLengths.length : 0;
  const punctuationDensity = tokens.length ? punctuation / tokens.length : 0;
  const heat = clamp01(punctuationDensity * 2.5 + literalHits / Math.max(tokens.length, 1) * 7 + caveatHits / Math.max(tokens.length, 1) * 5);
  const route = heat > .62 ? 'High-friction message: preserve claims before style movement.' : lexicalVariety < .55 ? 'Repeat-heavy message: syntax movement should lead.' : 'Stable message: standard mask route available.';
  return { wordCount: tokens.length, charCount: source.replace(/\s/g, '').length, sentenceCount: sentences.length, avgSentence, maxSentence: Math.max(0, ...sentenceLengths), lexicalVariety, punctuationDensity, caveatHits, literalHits, firstPerson, secondPerson, repeats, heat, route };
}

function renderProfile(doc = document) {
  const source = $('messageDraftInput', doc)?.value || '';
  const host = $('messageDraftProfile', doc);
  if (!host || !text(source)) return;
  const p = profileFor(source);
  host.innerHTML = `<section class="hush-pr76-profile-panel" aria-label="Authorship profile"><div class="hush-pr76-profile-head"><span>Authorship Profile</span><strong>Scroll Stylometrics</strong><p>${esc(p.route)}</p></div><div class="hush-pr76-metric-grid">${[
    metric('Words', p.wordCount),
    metric('Characters', p.charCount),
    metric('Sentences', p.sentenceCount),
    metric('Avg sentence', round(p.avgSentence, 1)),
    metric('Max sentence', p.maxSentence),
    metric('Lexical variety', round(p.lexicalVariety, 2)),
    metric('Punctuation', round(p.punctuationDensity, 2)),
    metric('Caveats', p.caveatHits, p.caveatHits > 3 ? 'warn' : ''),
    metric('Literal load', p.literalHits, p.literalHits ? 'warn' : ''),
    metric('First person', p.firstPerson),
    metric('Second person', p.secondPerson),
    metric('Recurrence', p.repeats)
  ].join('')}</div><div class="hush-pr76-scroll-hint">↕ scroll stylometrics</div></section>`;
}

function ensureSuggestedPanel(doc = document) {
  let panel = $('hushSuggestedMasksPanel', doc);
  if (panel) return panel;
  const anchor = $('messageDraftProfile', doc) || $('hushInputControlRail', doc) || $('messageDraftInput', doc);
  if (!anchor) return null;
  panel = doc.createElement('section');
  panel.id = 'hushSuggestedMasksPanel';
  panel.className = 'hush-pr76-suggested-panel';
  panel.hidden = true;
  anchor.insertAdjacentElement('afterend', panel);
  return panel;
}

function maskOptions(doc = document) {
  const select = $('maskFieldSelect', doc);
  if (!select) return [];
  return Array.from(select.options || []).filter((option) => option.value).map((option) => ({ id: option.value, label: option.textContent.trim(), selected: option.selected }));
}

function scoreMask(mask, source = '') {
  const hay = `${mask.id} ${mask.label}`.toLowerCase();
  const src = source.toLowerCase();
  let score = .42;
  if (/legal|forensic|record|evidence|cryo|receipt|ledger/.test(hay)) score += /td613|api|pr\d+|record|receipt|evidence|claim|literal/.test(src) ? .22 : .08;
  if (/poetic|oracle|cassandra|ritual|symbolic/.test(hay)) score += /feels|god|girl|ritual|memory|voice|lore|synth/.test(src) ? .18 : .06;
  if (/blackstar|sheree|target|register/.test(hay)) score += /lore|synth|community|identity|human|behavioral|linguistic/.test(src) ? .22 : .1;
  if (mask.selected) score += .06;
  return clamp01(score);
}

function renderSuggestions(doc = document) {
  const source = $('messageDraftInput', doc)?.value || '';
  const panel = ensureSuggestedPanel(doc);
  if (!panel || !text(source)) return;
  const rows = maskOptions(doc).map((mask) => ({ ...mask, score: scoreMask(mask, source) })).sort((a, b) => b.score - a.score).slice(0, 5);
  panel.hidden = false;
  if (!rows.length) {
    panel.innerHTML = '<div class="hush-pr76-suggested-head"><div><span class="hush-pr76-suggested-kicker">Suggested Masks</span><strong>No masks available</strong></div></div>';
    return;
  }
  panel.innerHTML = `<div class="hush-pr76-suggested-head"><div><span class="hush-pr76-suggested-kicker">Suggested Masks</span><strong>Route suggestions</strong></div><em>swipe · not identity verdicts</em></div><div class="hush-pr76-carousel" role="list">${rows.map((row, idx) => `<article class="hush-pr76-card" role="listitem"><div class="hush-pr76-rank">${idx + 1}</div><div><strong>${esc(row.label)}</strong><p>${row.selected ? 'Current route. ' : ''}Suggested from visible message features and available mask labels.</p><div class="hush-pr76-tags"><span>score ${round(row.score, 2)}</span><span>${row.selected ? 'active' : 'candidate'}</span></div></div><button type="button" data-hush-pr76-use-mask="${esc(row.id)}">Use Mask</button></article>`).join('')}</div>`;
  panel.querySelectorAll('[data-hush-pr76-use-mask]').forEach((button) => button.addEventListener('click', () => {
    const id = button.getAttribute('data-hush-pr76-use-mask') || '';
    const select = $('maskFieldSelect', doc);
    if (!select) return;
    select.value = id;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }));
}

function hidePanels(doc = document) {
  const profile = $('messageDraftProfile', doc);
  if (profile) profile.innerHTML = '';
  const panel = $('hushSuggestedMasksPanel', doc);
  if (panel) { panel.hidden = true; panel.innerHTML = ''; }
}

function render(doc = document) {
  const source = text($('messageDraftInput', doc)?.value || '');
  if (!source || source !== analyzedSignature) {
    hidePanels(doc);
    return false;
  }
  renderProfile(doc);
  renderSuggestions(doc);
  return true;
}

function bind(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench' || doc.body.dataset.hushPr76DomOnly === 'true') return;
  doc.body.dataset.hushPr76DomOnly = 'true';
  installStyle(doc);
  ensureSuggestedPanel(doc);
  const analyze = $('analyzeOutputBtn', doc);
  if (analyze) analyze.addEventListener('click', () => {
    analyzedSignature = text($('messageDraftInput', doc)?.value || '');
    if (!analyzedSignature) return hidePanels(doc);
    window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(() => render(doc), 0);
  });
  const input = $('messageDraftInput', doc);
  if (input) input.addEventListener('input', () => {
    if (text(input.value || '') !== analyzedSignature) hidePanels(doc);
  });
}

if (typeof document !== 'undefined') {
  const run = () => bind(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  [260, 760, 1500, 2800].forEach((delay) => window.setTimeout(run, delay));
}

window.__TD613_HUSH_PR76_LIGHT_PANELS__ = { version: VERSION, disabled: false, render, hidePanels };
