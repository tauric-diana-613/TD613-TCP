export const ASH_A15_EMPIRICAL_VERSION = 'td613.ash.a15-empirical-profile-journeys/v0.1';
export const ASH_A15_WORLD_ANSWER_SCHEMA = 'td613.ash.a15-profile-world-answer/v0.1';
export const ASH_A15_ACTION_ID = 'orient_next_bounded_action';

export const ASH_A15_PROFILES = Object.freeze([
  'investigation',
  'political_campaign',
  'fundraiser',
  'research',
  'legal',
  'archive'
]);
export const ASH_A15_WORKSPACES = Object.freeze(['home', 'map', 'work', 'choir', 'capsule']);
export const ASH_A15_ROUTES = Object.freeze(['experimental', 'custodial', 'audit', 'implementation']);

const host = globalThis.window;
const doc = globalThis.document;
const byId = id => doc?.getElementById(id);
const freeze = value => Object.freeze(value);

const PROFILE_LAW = freeze({
  investigation:freeze({
    label:'Investigation',
    focus:'Preserve the original source, record the contradiction, and keep a benign alternative visible before any finding.',
    ceiling:'No identity, intent, guilt, authorship, surveillance probability, or truth finding.'
  }),
  political_campaign:freeze({
    label:'Political Campaign',
    focus:'Separate the next public launch fact from donor, host, targeting, coalition, security, and route-order joins.',
    ceiling:'No voter intent, donor identity, persuasion effect, or election prediction.'
  }),
  fundraiser:freeze({
    label:'Fundraiser',
    focus:'Stage the next approved ask or stewardship task without moving the private relationship, guest, or payment map.',
    ceiling:'No donor intent, payment status, guest identity, conversion claim, or revenue prediction.'
  }),
  research:freeze({
    label:'Research Project',
    focus:'Make method, provenance, consent, nulls, alternatives, and replication gaps visible before strengthening the claim.',
    ceiling:'No causal certainty, validity inflation, universal generalization, or policy prediction.'
  }),
  legal:freeze({
    label:'Legal Matter',
    focus:'Separate the deadline, evidence, privilege boundary, missing service fact, and human decision before preparing work.',
    ceiling:'No legal advice, guilt, liability, merits finding, privilege waiver, or outcome prediction.'
  }),
  archive:freeze({
    label:'Archive',
    focus:'Preserve lineage, restriction uncertainty, embargo posture, derivative status, and destination absence before access.',
    ceiling:'No ownership, authenticity, access grant, release, declassification, publication, or transfer authority.'
  })
});

const WORKSPACE_LAW = freeze({
  home:'Read the mandate, current missingness, and next bounded human duty.',
  map:'Inspect relationships, provenance, contradiction, and alternatives without converting structure into truth.',
  work:'Stage one reversible task with a named human owner and review boundary.',
  choir:'Compare routes and residue without treating reconstruction as attribution, validity, or intent.',
  capsule:'Preserve continuity only; export, recipient authority, handoff, and external deletion remain separate.'
});

const ROUTE_LAW = freeze({
  experimental:'Compare one reversible alternative and name what observation would distinguish it.',
  custodial:'Name what stays local, what authority remains human, and which crossing remains unavailable.',
  audit:'Surface the evidence gap, contradiction, missingness, and claim ceiling before any conclusion.',
  implementation:'Stage one reversible human-reviewed task; perform no consequential action and move no source bytes.'
});

const ROUTE_ALIASES = freeze({
  EXPERIENTIAL:'experimental',
  EXPERIMENTAL:'experimental',
  CUSTODIAL:'custodial',
  AUDIT:'audit',
  IMPLEMENTATION:'implementation'
});

const SENSITIVE_PATTERNS = freeze([
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\b(?:\+?1[ .-]?)?(?:\(?\d{3}\)?[ .-]?)\d{3}[ .-]?\d{4}\b/,
  /\b\d{3}-\d{2}-\d{4}\b/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
  /\b(?:api[_ -]?key|secret[_ -]?key|access[_ -]?token|passphrase|password)\s*[:=]/i
]);

const FORBIDDEN_PUBLIC_TOKENS = freeze([
  'td613.ash',
  'case_map_digest',
  'route_memory_digest',
  'authority_context',
  'lifecycle_rank',
  'indexeddb',
  'ash_demo_registry',
  'source_packet_commit'
]);

function normalizeProfile(profile) {
  const value = String(profile || '').toLowerCase();
  return ASH_A15_PROFILES.includes(value) ? value : null;
}

function normalizeWorkspace(workspace) {
  const value = String(workspace || '').toLowerCase();
  const aliases = { custody:'map', rooms:'map', routes:'map', draft:'work', test:'choir', save:'capsule' };
  const normalized = aliases[value] || value;
  return ASH_A15_WORKSPACES.includes(normalized) ? normalized : null;
}

function normalizeRoute(route) {
  const raw = String(route || 'experimental');
  const normalized = ROUTE_ALIASES[raw.toUpperCase()] || raw.toLowerCase();
  return ASH_A15_ROUTES.includes(normalized) ? normalized : null;
}

function contextText(context) {
  if (typeof context === 'string') return context;
  try { return JSON.stringify(context || {}); } catch { return String(context || ''); }
}

export function containsSensitiveContext(context) {
  const text = contextText(context);
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(text));
}

export function publicAnswerLeaksOntology(message) {
  const text = String(message || '').toLowerCase();
  return FORBIDDEN_PUBLIC_TOKENS.some(token => text.includes(token));
}

function authority() {
  return freeze({
    custody_changed:false,
    source_bytes_moved:false,
    raw_content_transport:false,
    consequential_action:false,
    release_authority:false,
    destination_authority:false,
    human_review_required:true,
    human_closure_required:true
  });
}

export function compileAshA15WorldAnswer({
  profile,
  workspace,
  route,
  context = freeze({ synthetic:true }),
  action_id = ASH_A15_ACTION_ID
} = {}) {
  const normalizedProfile = normalizeProfile(profile);
  const normalizedWorkspace = normalizeWorkspace(workspace);
  const normalizedRoute = normalizeRoute(route);
  const base = {
    schema:ASH_A15_WORLD_ANSWER_SCHEMA,
    version:ASH_A15_EMPIRICAL_VERSION,
    action_id,
    profile:normalizedProfile,
    workspace:normalizedWorkspace,
    route:normalizedRoute,
    synthetic_fixture:true,
    context_imported:false,
    real_world_claim:false,
    ontology_exposed:false,
    authority:authority()
  };

  if (action_id !== ASH_A15_ACTION_ID) {
    return freeze({ ...base, status:'HELD_UNKNOWN_ACTION', message:'This empirical lane recognizes only the named orientation gesture. No Ash action occurred.' });
  }
  if (!normalizedProfile || !normalizedWorkspace || !normalizedRoute) {
    return freeze({ ...base, status:'HELD_INCOMPLETE_ROUTE', message:'Choose one promoted profile, one principal workspace, and one AIA route before orientation. No Ash action occurred.' });
  }
  if (containsSensitiveContext(context)) {
    return freeze({ ...base, status:'HELD_SENSITIVE_CONTEXT', message:'Sensitive or identifying material stays outside this synthetic journey. Remove it and use bounded placeholders; nothing was imported.' });
  }

  const profileLaw = PROFILE_LAW[normalizedProfile];
  const message = `${profileLaw.label}: ${profileLaw.focus} ${WORKSPACE_LAW[normalizedWorkspace]} ${ROUTE_LAW[normalizedRoute]} Claim ceiling: ${profileLaw.ceiling}`;
  if (publicAnswerLeaksOntology(message)) throw new Error('A15 public world answer exposed internal ontology.');
  return freeze({
    ...base,
    status:'READY',
    message,
    profile_focus:profileLaw.focus,
    workspace_directive:WORKSPACE_LAW[normalizedWorkspace],
    route_directive:ROUTE_LAW[normalizedRoute],
    claim_ceiling:profileLaw.ceiling
  });
}

export function compileAshA15Matrix() {
  return freeze(ASH_A15_PROFILES.flatMap(profile =>
    ASH_A15_WORKSPACES.flatMap(workspace =>
      ASH_A15_ROUTES.map(route => compileAshA15WorldAnswer({ profile, workspace, route }))
    )
  ));
}

function currentProfile() {
  return normalizeProfile(
    doc?.documentElement?.dataset?.ashDemoProfile
    || host?.__td613AshPremiumUI?.snapshot?.()?.profile
    || byId('newProfile')?.value
  ) || 'investigation';
}

function currentWorkspace() {
  return normalizeWorkspace(
    doc?.documentElement?.dataset?.ashPremiumWorkspace
    || doc?.querySelector?.('.workspace.active[id^="workspace-"]')?.id?.replace('workspace-', '')
  ) || 'home';
}

function currentRoute() {
  return normalizeRoute(host?.__td613AshLiveAIA?.current?.()?.route) || 'experimental';
}

function ensureStyles() {
  if (!doc?.head || byId('td613-ash-a15-empirical-css')) return;
  const style = doc.createElement('style');
  style.id = 'td613-ash-a15-empirical-css';
  style.textContent = `.ash-a15-empirical{margin:14px 0 0;padding:14px;border:1px solid rgba(118,234,212,.22);background:rgba(2,10,8,.78)}.ash-a15-empirical__head{display:flex;align-items:start;justify-content:space-between;gap:12px}.ash-a15-empirical h3{margin:2px 0 6px;font:500 1.2rem Georgia,serif}.ash-a15-empirical p{margin:5px 0;color:var(--muted,#9ab4aa);font-size:.72rem;line-height:1.5}.ash-a15-empirical__chips{display:flex;gap:5px;flex-wrap:wrap}.ash-a15-empirical__chips span{padding:5px 7px;border:1px solid rgba(228,198,108,.3);font:700 .55rem ui-monospace,monospace;text-transform:uppercase}.ash-a15-empirical button{min-height:40px;margin-top:9px;padding:8px 11px;border:1px solid rgba(118,234,212,.55);background:#0b2a21;color:var(--paper,#fff8da);font:700 .62rem ui-monospace,monospace;text-transform:uppercase}.ash-a15-empirical [data-a15-world-answer]{min-height:1.5em;color:var(--mint,#76ead4)}@media(max-width:620px){.ash-a15-empirical__head{display:grid}.ash-a15-empirical button{width:100%}}`;
  doc.head.append(style);
}

function ensurePanel() {
  const membrane = byId('ashAiaMembrane');
  if (!membrane) return null;
  let panel = byId('ashA15EmpiricalJourney');
  if (panel) return panel;
  panel = doc.createElement('section');
  panel.id = 'ashA15EmpiricalJourney';
  panel.className = 'ash-a15-empirical';
  panel.dataset.ashA15Empirical = ASH_A15_EMPIRICAL_VERSION;
  panel.innerHTML = `<div class="ash-a15-empirical__head"><div><p>A15 · six-profile empirical journey</p><h3>Orient the next bounded action</h3><p>The same gesture must answer differently by profile, workspace, and route while moving no source bytes.</p></div><div class="ash-a15-empirical__chips"><span data-a15-profile></span><span data-a15-workspace></span><span data-a15-route></span></div></div><button type="button" id="ashA15OrientAction">Orient next bounded action</button><p id="ashA15WorldAnswer" data-a15-world-answer role="status" aria-live="polite">Choose a profile route, then ask Ash to orient—not perform—the next action.</p>`;
  membrane.append(panel);
  return panel;
}

function decorate(panel, answer = null) {
  if (!panel) return false;
  const profile = answer?.profile || currentProfile();
  const workspace = answer?.workspace || currentWorkspace();
  const route = answer?.route || currentRoute();
  panel.querySelector('[data-a15-profile]').textContent = profile.replaceAll('_', ' ');
  panel.querySelector('[data-a15-workspace]').textContent = workspace;
  panel.querySelector('[data-a15-route]').textContent = route;
  if (answer) panel.querySelector('[data-a15-world-answer]').textContent = answer.message;
  return true;
}

export function orientAshA15Journey(overrides = {}) {
  const answer = compileAshA15WorldAnswer({
    profile:overrides.profile || currentProfile(),
    workspace:overrides.workspace || currentWorkspace(),
    route:overrides.route || currentRoute(),
    context:overrides.context || freeze({ synthetic:true }),
    action_id:overrides.action_id || ASH_A15_ACTION_ID
  });
  const panel = ensurePanel();
  decorate(panel, answer);
  doc?.documentElement && (doc.documentElement.dataset.ashA15EmpiricalStatus = answer.status);
  host?.dispatchEvent?.(new CustomEvent('td613:ash:a15-world-answer', { detail:answer }));
  return answer;
}

let installed = false;
let refreshQueued = false;
function refresh() {
  const panel = ensurePanel();
  decorate(panel);
  return Boolean(panel);
}
function scheduleRefresh() {
  if (refreshQueued) return;
  refreshQueued = true;
  queueMicrotask(() => { refreshQueued = false; refresh(); });
}

export function installAshA15EmpiricalJourneys(entries = null) {
  if (!host || !doc?.body || installed) return false;
  installed = true;
  ensureStyles();
  doc.addEventListener('click', event => {
    if (!event.target?.closest?.('#ashA15OrientAction')) return;
    event.preventDefault();
    orientAshA15Journey();
  }, true);
  for (const type of ['aia-ready','profile-demo-hydrated','demo-registry-hydrated','premium-ready','ux-workspace-opened','lifecycle-updated','whole-instrument-refreshed']) {
    host.addEventListener(`td613:ash:${type}`, scheduleRefresh);
  }
  doc.documentElement.dataset.ashA15Empirical = ASH_A15_EMPIRICAL_VERSION;
  const api = freeze({
    version:ASH_A15_EMPIRICAL_VERSION,
    schema:ASH_A15_WORLD_ANSWER_SCHEMA,
    action_id:ASH_A15_ACTION_ID,
    profiles:ASH_A15_PROFILES,
    workspaces:ASH_A15_WORKSPACES,
    routes:ASH_A15_ROUTES,
    matrix:compileAshA15Matrix,
    orient:orientAshA15Journey,
    compile:compileAshA15WorldAnswer,
    entries:() => entries,
    refresh,
    authority:authority()
  });
  host.__td613AshA15EmpiricalJourneys = api;
  refresh();
  host.dispatchEvent(new CustomEvent('td613:ash:a15-empirical-ready', { detail:{ version:api.version, matrix_cells:120, authority:api.authority } }));
  return true;
}

if (host && doc) queueMicrotask(() => installAshA15EmpiricalJourneys());
