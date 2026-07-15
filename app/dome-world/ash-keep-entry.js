const PUBLIC_ROUTE = '/dome-world/ash-keep.html';
const SOURCE_ROUTE = '/dome-world/ash-keep-source.html?delivery=td613-static-v0.1';
const CORE_SOURCE_ROUTE = '/dome-world/ash-keep.js?delivery=td613-static-core-v0.1';
const READINESS_KEY = 'td613:ash-threshold:readiness:v0.1';
const THEME_MARKER = '<meta name="theme-color" content="#04130f">';
const CORE_SCRIPT = '<script type="module" src="/dome-world/ash-keep.js"></script>';
const LIFECYCLE_META = '<meta name="ash-lifecycle" content="v0.1">';
const LIFECYCLE_SCRIPT = '<script type="module" src="/dome-world/ash-lifecycle.js"></script>';
const ARRIVAL_COMPATIBILITY_SCRIPT = `<script>/* td613 arrival-route compatibility: static document first, history annotation only */if(sessionStorage.getItem('${READINESS_KEY}')&&location.pathname==='${PUBLIC_ROUTE}'&&location.search!=='?arrival=cleared'){history.replaceState(null,'','${PUBLIC_ROUTE}?arrival=cleared')}</script>`;
const DRAFT_MARKER = "    caseId: state.caseMap.case_id,\n    body: $('draftBody').value,";
const DRAFT_BINDING = "    caseId: state.caseMap.case_id,\n    caseMapDigest: state.caseMap.case_map_digest,\n    body: $('draftBody').value,";
const REVIEW_MARKER = "  await put('reviews', state.latestReview, state.latestReview.review_id);\n  renderDraft();";
const REVIEW_BINDING = "  await put('reviews', state.latestReview, state.latestReview.review_id);\n  renderDraft();\n  setTimeout(() => location.reload(), 160); // td613 lifecycle review refresh";

function hold(error) {
  document.documentElement.dataset.ashDeliveryState = 'held';
  const status = document.getElementById('ashDeliveryStatus');
  if (status) status.textContent = `Ash Keep held at the document boundary: ${error?.message || String(error)}`;
  console.error('td613 ash keep static delivery held', error);
}

function replaceExactly(source, marker, replacement, label) {
  const count = source.split(marker).length - 1;
  if (count !== 1) throw new Error(`${label} expected exactly one marker; observed ${count}`);
  return source.replace(marker, replacement);
}

function governCore(source) {
  let code = String(source || '');
  if (!code) throw new Error('Keep core source was empty');
  if (!code.includes('caseMapDigest: state.caseMap.case_map_digest')) {
    code = replaceExactly(code, DRAFT_MARKER, DRAFT_BINDING, 'Draft Case Map binding');
  }
  if (!code.includes('td613 lifecycle review refresh')) {
    code = replaceExactly(code, REVIEW_MARKER, REVIEW_BINDING, 'Draft review refresh');
  }
  if (!code.includes('caseMapDigest: state.caseMap.case_map_digest')) throw new Error('Governed core omitted the current Case Map digest');
  if (!code.includes('td613 lifecycle review refresh')) throw new Error('Governed core omitted the lifecycle review refresh');
  return code;
}

function inlineCore(source) {
  const safe = source.replace(/<\/script/gi, '<\\/script');
  return `<script type="module" data-td613-ash-core="governed-inline">\n${safe}\n</script>`;
}

async function receiveKeep() {
  const [documentResponse, coreResponse] = await Promise.all([
    fetch(SOURCE_ROUTE, { cache: 'no-store', credentials: 'same-origin', headers: { Accept: 'text/html' } }),
    fetch(CORE_SOURCE_ROUTE, { cache: 'no-store', credentials: 'same-origin', headers: { Accept: 'text/javascript' } })
  ]);
  if (!documentResponse.ok) throw new Error(`source response ${documentResponse.status}`);
  if (!coreResponse.ok) throw new Error(`core response ${coreResponse.status}`);
  let html = await documentResponse.text();
  const governedCore = inlineCore(governCore(await coreResponse.text()));
  if (!html.includes(THEME_MARKER)) throw new Error('theme marker missing from static source');
  if (!html.includes(CORE_SCRIPT)) throw new Error('Keep core script missing from static source');
  html = html.replace(CORE_SCRIPT, governedCore);
  if (!html.includes(LIFECYCLE_META)) html = html.replace(THEME_MARKER, `${THEME_MARKER}\n  ${LIFECYCLE_META}`);
  if (!html.includes('/dome-world/ash-lifecycle.js')) {
    html = html.replace(governedCore, `${governedCore}\n  ${ARRIVAL_COMPATIBILITY_SCRIPT}\n  ${LIFECYCLE_SCRIPT}`);
  }
  const arrival = sessionStorage.getItem(READINESS_KEY) ? '?arrival=cleared' : '';
  history.replaceState(null, '', `${PUBLIC_ROUTE}${arrival}`);
  document.open('text/html', 'replace');
  document.write(html);
  document.close();
}

receiveKeep().catch(hold);
