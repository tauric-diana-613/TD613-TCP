export const HUSH_PR87_PROFILE_HARDSTOP_VERSION = 'pr87.2-stable-profile-visibility-hardstop';

const $ = (id, doc = document) => doc.getElementById(id);
const esc = (value = '') => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const words = (value = '') => String(value || '').match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || [];
const sentences = (value = '') => (String(value || '').match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []).map((item) => item.trim()).filter(Boolean);
const round = (value, digits = 2) => Number.isFinite(Number(value)) ? Number(Number(value).toFixed(digits)) : 0;
const mean = (values = []) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const std = (values = []) => {
  if (values.length < 2) return 0;
  const m = mean(values);
  return Math.sqrt(values.reduce((sum, value) => sum + ((value - m) ** 2), 0) / values.length);
};
const density = (text = '', pattern) => {
  const total = words(text).length || 1;
  return Math.max(0, Math.min(1, (String(text || '').match(pattern) || []).length / total));
};

let armedSource = '';
let timer = null;

function installStyle(doc = document) {
  if ($('hushPr87ProfileHardstopStyle', doc)) return;
  const style = doc.createElement('style');
  style.id = 'hushPr87ProfileHardstopStyle';
  style.textContent = `
    body[data-page-kind="adversarial-bench"] #messageDraftProfile.bay-profile:not([data-pr87-profile="rendered"]){display:none!important;height:0!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important;}
    body[data-page-kind="adversarial-bench"] #messageDraftProfile.bay-profile[data-pr87-profile="rendered"],
    body[data-page-kind="adversarial-bench"] #messageDraftProfile.bay-profile[data-pr86-profile="rendered"],
    body[data-page-kind="adversarial-bench"][data-hush-pr76-analyzed="true"] #messageDraftProfile.bay-profile[data-pr87-profile="rendered"]{display:block!important;height:auto!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:visible!important;}
    body[data-page-kind="adversarial-bench"] #messageDraftProfile .pr87-panel{margin:.65rem 0 .55rem!important;padding:.6rem!important;border:1px solid rgba(137,255,240,.20)!important;border-radius:18px!important;background:rgba(4,11,22,.78)!important;box-sizing:border-box!important;}
    body[data-page-kind="adversarial-bench"] #messageDraftProfile .pr87-head{display:grid!important;gap:.18rem!important;margin-bottom:.48rem!important;}
    body[data-page-kind="adversarial-bench"] #messageDraftProfile .pr87-head span{color:#89e7ff!important;font-size:.58rem!important;letter-spacing:.18em!important;text-transform:uppercase!important;}
    body[data-page-kind="adversarial-bench"] #messageDraftProfile .pr87-head strong{color:#f1fff6!important;font-size:.78rem!important;letter-spacing:.12em!important;text-transform:uppercase!important;}
    body[data-page-kind="adversarial-bench"] #messageDraftProfile .pr87-head p{margin:0!important;color:rgba(226,255,236,.66)!important;font-size:.58rem!important;line-height:1.28!important;}
    body[data-page-kind="adversarial-bench"] #messageDraftProfile .pr87-grid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:.34rem!important;}
    body[data-page-kind="adversarial-bench"] #messageDraftProfile .pr87-metric{min-height:3rem!important;border:1px solid rgba(137,255,240,.18)!important;border-radius:14px!important;background:rgba(0,0,0,.24)!important;padding:.38rem .42rem!important;}
    body[data-page-kind="adversarial-bench"] #messageDraftProfile .pr87-metric span{display:block!important;color:rgba(202,255,223,.58)!important;font-size:.48rem!important;letter-spacing:.1em!important;text-transform:uppercase!important;}
    body[data-page-kind="adversarial-bench"] #messageDraftProfile .pr87-metric strong{display:block!important;margin-top:.18rem!important;color:#f1fff6!important;font-size:.64rem!important;line-height:1.16!important;word-break:break-word!important;}
    body[data-page-kind="adversarial-bench"] #messageDraftProfile .pr87-scroll-hint{display:none;}
    @media(max-width:760px){body[data-page-kind="adversarial-bench"] #messageDraftProfile .pr87-panel{height:clamp(12rem,34vh,16rem)!important;max-height:clamp(12rem,34vh,16rem)!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;padding:.5rem .46rem 1.4rem!important;}body[data-page-kind="adversarial-bench"] #messageDraftProfile .pr87-head{position:sticky!important;top:-.5rem!important;z-index:3!important;margin:-.5rem -.46rem .3rem!important;padding:.5rem .46rem .34rem!important;background:rgba(4,10,21,.97)!important;}body[data-page-kind="adversarial-bench"] #messageDraftProfile .pr87-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:.26rem!important;}body[data-page-kind="adversarial-bench"] #messageDraftProfile .pr87-metric{height:2.8rem!important;min-height:2.8rem!important;max-height:2.8rem!important;padding:.32rem!important;overflow:hidden!important;}body[data-page-kind="adversarial-bench"] #messageDraftProfile .pr87-metric span{font-size:.39rem!important;letter-spacing:.075em!important;}body[data-page-kind="adversarial-bench"] #messageDraftProfile .pr87-metric strong{font-size:.52rem!important;}body[data-page-kind="adversarial-bench"] #messageDraftProfile .pr87-scroll-hint{display:block!important;position:sticky!important;bottom:0!important;margin:.35rem auto -1rem!important;width:max-content!important;padding:.16rem .5rem!important;border:1px solid rgba(137,255,240,.24)!important;border-radius:999px!important;background:rgba(7,13,28,.96)!important;color:rgba(202,255,223,.86)!important;font-size:.48rem!important;letter-spacing:.15em!important;text-transform:uppercase!important;pointer-events:none!important;}body[data-page-kind="adversarial-bench"] #messageDraftProfile .pr87-panel[data-scrolled="true"] .pr87-scroll-hint{opacity:0!important;}}
  `;
  doc.head.appendChild(style);
}

function metric(label, value) {
  return `<article class="pr87-metric"><span>${esc(label)}</span><strong>${esc(value)}</strong></article>`;
}

function clearProfile(doc = document) {
  const host = $('messageDraftProfile', doc);
  if (!host) return;
  host.innerHTML = '';
  host.dataset.pr87Profile = 'asleep';
  host.dataset.pr86Profile = 'asleep';
  host.dataset.inlineProfile = 'asleep';
}

function renderProfile(doc = document) {
  const host = $('messageDraftProfile', doc);
  const input = $('messageDraftInput', doc);
  const source = input?.value || '';
  if (!host || !source.trim() || source !== armedSource) {
    clearProfile(doc);
    return;
  }
  const tokenList = words(source);
  const sentenceRows = sentences(source);
  const lengths = sentenceRows.map((sentence) => words(sentence).length);
  const lower = tokenList.map((token) => token.toLowerCase());
  const unique = new Set(lower);
  const punc = density(source, /[.,;:!?—-]/g);
  const caveat = density(source, /\b(?:maybe|perhaps|unless|except|however|although|but|if|might|could|should|probably|apparently|because|arguably|seems|appears)\b/gi);
  const claim = density(source, /\b(?:is|are|was|were|will|must|can|created|means|shows|proves|takes|gives|made|built|turns|requires|produces|making|becomes)\b/gi);
  const literal = density(source, /\b(?:EXHIBIT|DOC|CASE|ID|REF|TD613|SHI|SAC|API|LLM|AI|PR\d+|\d{2,}(?:[-/:.]\d+)*)\b/gi);
  const recurrence = tokenList.length ? 1 - unique.size / tokenList.length : 0;
  const route = claim + caveat + literal > 0.45 ? 'high-friction transform; preserve propositions before style.' : 'stable source; standard mask route.';
  const metrics = [
    metric('Words', tokenList.length),
    metric('Characters', source.replace(/\s/g, '').length),
    metric('Sentences', sentenceRows.length),
    metric('Syntax', `avg ${round(mean(lengths), 1)}w · spread ${round(std(lengths), 1)} · max ${Math.max(0, ...lengths)}`),
    metric('Lexical variety', round(unique.size / (tokenList.length || 1), 2)),
    metric('Long-word rate', round(tokenList.filter((token) => token.length >= 8).length / (tokenList.length || 1), 2)),
    metric('Short-word rate', round(tokenList.filter((token) => token.length <= 3).length / (tokenList.length || 1), 2)),
    metric('Punctuation', round(punc, 2)),
    metric('Claim density', round(claim, 2)),
    metric('Caveats', round(caveat, 2)),
    metric('Literal load', round(literal, 2)),
    metric('Recurrence', round(recurrence, 2)),
    metric('Question load', round((source.match(/\?/g) || []).length / (sentenceRows.length || 1), 2)),
    metric('Pressure', `heat ${round(punc + caveat + literal, 2)} · link ${round(recurrence + punc, 2)}`),
    metric('Route difficulty', round(claim + caveat + literal, 2))
  ];
  host.innerHTML = `<section class="pr87-panel" aria-label="Authorship profile"><div class="pr87-head"><span>Authorship Profile</span><strong>Message route scan</strong><p>${esc(route)}</p></div><div class="pr87-grid">${metrics.join('')}</div><div class="pr87-scroll-hint">↕ scroll stylometrics</div></section>`;
  host.dataset.pr87Profile = 'rendered';
  host.dataset.pr86Profile = 'rendered';
  host.dataset.inlineProfile = 'rendered';
  if (doc.body) doc.body.dataset.hushPr76Analyzed = 'true';
  const panel = host.querySelector('.pr87-panel');
  panel?.addEventListener('scroll', () => { if (panel.scrollTop > 2) panel.dataset.scrolled = 'true'; }, { passive: true });
}

function boot(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench') return;
  installStyle(doc);
  clearProfile(doc);
  const analyze = $('analyzeOutputBtn', doc);
  if (analyze && analyze.dataset.pr87Profile !== 'true') {
    analyze.dataset.pr87Profile = 'true';
    analyze.addEventListener('click', () => {
      armedSource = $('messageDraftInput', doc)?.value || '';
      if (!armedSource.trim()) { clearProfile(doc); return; }
      window.clearTimeout(timer);
      [120, 360, 800, 1400, 2500, 4200, 6500].forEach((delay) => window.setTimeout(() => renderProfile(doc), delay));
    }, true);
  }
  const input = $('messageDraftInput', doc);
  if (input && input.dataset.pr87Profile !== 'true') {
    input.dataset.pr87Profile = 'true';
    input.addEventListener('input', () => { armedSource = ''; window.clearTimeout(timer); clearProfile(doc); }, true);
  }
}

if (typeof document !== 'undefined') {
  const run = () => boot(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  window.setTimeout(run, 500);
  window.setTimeout(run, 1500);
}
