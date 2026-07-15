const PUBLIC_ROUTE = '/dome-world/ash-keep.html';
const SOURCE_ROUTE = '/dome-world/ash-keep-source.html?delivery=td613-static-v0.1';
const READINESS_KEY = 'td613:ash-threshold:readiness:v0.1';
const THEME_MARKER = '<meta name="theme-color" content="#04130f">';
const CORE_SCRIPT = '<script type="module" src="/dome-world/ash-keep.js"></script>';
const SERVED_CORE_SCRIPT = '<script type="module" src="/api/dome-world-shell?surface=ash-keep-js"></script>';
const LIFECYCLE_META = '<meta name="ash-lifecycle" content="v0.1">';
const LIFECYCLE_SCRIPT = '<script type="module" src="/dome-world/ash-lifecycle.js"></script>';
const ARRIVAL_COMPATIBILITY_SCRIPT = `<script>/* td613 arrival-route compatibility: static document first, history annotation only */if(sessionStorage.getItem('${READINESS_KEY}')&&location.pathname==='${PUBLIC_ROUTE}'&&location.search!=='?arrival=cleared'){history.replaceState(null,'','${PUBLIC_ROUTE}?arrival=cleared')}</script>`;

function hold(error) {
  document.documentElement.dataset.ashDeliveryState = 'held';
  const status = document.getElementById('ashDeliveryStatus');
  if (status) status.textContent = `Ash Keep held at the document boundary: ${error?.message || String(error)}`;
  console.error('td613 ash keep static delivery held', error);
}

async function receiveKeep() {
  const response = await fetch(SOURCE_ROUTE, {
    cache: 'no-store',
    credentials: 'same-origin',
    headers: { Accept: 'text/html' }
  });
  if (!response.ok) throw new Error(`source response ${response.status}`);
  let html = await response.text();
  if (!html.includes(THEME_MARKER)) throw new Error('theme marker missing from static source');
  if (!html.includes(CORE_SCRIPT)) throw new Error('Keep core script missing from static source');
  html = html.replace(CORE_SCRIPT, SERVED_CORE_SCRIPT);
  if (!html.includes(LIFECYCLE_META)) html = html.replace(THEME_MARKER, `${THEME_MARKER}\n  ${LIFECYCLE_META}`);
  if (!html.includes('/dome-world/ash-lifecycle.js')) {
    html = html.replace(SERVED_CORE_SCRIPT, `${SERVED_CORE_SCRIPT}\n  ${ARRIVAL_COMPATIBILITY_SCRIPT}\n  ${LIFECYCLE_SCRIPT}`);
  }
  if (html.includes(CORE_SCRIPT) || !html.includes(SERVED_CORE_SCRIPT)) throw new Error('Keep core was not bound to the transformed shell surface');
  const arrival = sessionStorage.getItem(READINESS_KEY) ? '?arrival=cleared' : '';
  history.replaceState(null, '', `${PUBLIC_ROUTE}${arrival}`);
  document.open('text/html', 'replace');
  document.write(html);
  document.close();
}

receiveKeep().catch(hold);
