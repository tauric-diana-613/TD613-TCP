export const ASH_A12_COMMAND_RATIONALIZATION_VERSION = 'td613.ash.a12-command-rationalization/v0.1';

const host = globalThis.window;
const doc = globalThis.document;
let installed = false;

const COMMANDS = Object.freeze([
  Object.freeze({ id:'custody', label:'Custody', note:'Inspect the current source and custody posture in Case Map.', workspace:'map', anchor:'ashA8CaseMapRecompilation' }),
  Object.freeze({ id:'rooms', label:'Rooms', note:'Review the chambers that hold the current objects and obligations.', workspace:'map', anchor:'mapStage' }),
  Object.freeze({ id:'routes', label:'Routes', note:'Inspect relationships, route memory, contradiction, and missingness.', workspace:'map', anchor:'ashA8RelationshipList' }),
  Object.freeze({ id:'test', label:'Rebuild Test', note:'Open the pairwise comparison and residue laboratory.', workspace:'choir', anchor:'ashA10ChoirRecompilation' }),
  Object.freeze({ id:'draft', label:'Draft & Hush', note:'Prepare a derivative and inspect its human-approval boundary.', workspace:'work', anchor:'ashA9WorkRecompilation' }),
  Object.freeze({ id:'save', label:'Save Points', note:'Inspect continuity snapshots without treating them as proof.', workspace:'capsule', anchor:'ashA11CapsuleRecompilation' }),
  Object.freeze({ id:'receipts', label:'Receipts', note:'Open the current exact receipt inventory.', workspace:'work', anchor:'premiumReceiptInventory' })
]);

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[character]);
}

function ensureStyles() {
  if (!doc?.head || doc.getElementById('td613-ash-a12-command-css')) return;
  const style = doc.createElement('style');
  style.id = 'td613-ash-a12-command-css';
  style.textContent = '.a12-command-group{display:grid;gap:8px;padding:10px;border:1px solid rgba(118,234,212,.16);background:rgba(4,19,15,.52)}.a12-command-group>h3{margin:0;color:var(--mint,#76ead4);font:700 .62rem/1.4 var(--mono,ui-monospace,monospace);letter-spacing:.08em;text-transform:uppercase}.a12-command-status{grid-column:1/-1;margin:0;padding:9px 10px;border-left:2px solid rgba(228,198,108,.65);background:rgba(228,198,108,.055);color:var(--muted,#9ab4aa);font:.67rem/1.5 var(--mono,ui-monospace,monospace)}.a12-command-group button,.a12-command-group a{min-height:52px}.a12-command-group small{display:block}';
  doc.head.append(style);
}

function commandButton(command) {
  return '<button type="button" data-a12-command="' + escapeHtml(command.id) + '" data-a12-workspace="' + escapeHtml(command.workspace) + '" data-a12-anchor="' + escapeHtml(command.anchor || '') + '"><strong>' + escapeHtml(command.label) + '</strong><small>' + escapeHtml(command.note) + '</small></button>';
}

function ensureCommandSurface() {
  const grid = doc?.getElementById('premiumCommandGrid');
  if (!grid) return false;
  ensureStyles();
  grid.innerHTML = [
    '<section class="a12-command-group" aria-labelledby="a12CustodyHeading"><h3 id="a12CustodyHeading">Custody and structure</h3>',
    COMMANDS.slice(0, 3).map(commandButton).join(''),
    '</section>',
    '<section class="a12-command-group" aria-labelledby="a12WorkHeading"><h3 id="a12WorkHeading">Work and comparison</h3>',
    COMMANDS.slice(3).map(commandButton).join(''),
    '</section>',
    '<section class="a12-command-group" aria-labelledby="a12ContinuityHeading"><h3 id="a12ContinuityHeading">Continuity and boundaries</h3>',
    '<button type="button" data-a12-action="profile" data-command-action="profile"><strong>Cases & Profiles</strong><small>Return to the explicit case and profile selector.</small></button>',
    '<a href="/dome-world/ash-destination-handoff.html"><strong>Destination Handoff</strong><small>Open the separately gated crossing surface; this menu grants no crossing authority.</small></a>',
    '<a href="/safe-harbor/index.html"><strong>Safe Harbor</strong><small>Open the guarded source-side boundary route.</small></a>',
    '</section>',
    '<p id="ashA12CommandStatus" class="a12-command-status" role="status" aria-live="polite">Choose a named destination. Navigation changes the visible workspace only; custody, source bytes, release posture, and human closure remain unchanged.</p>'
  ].join('');
  grid.dataset.ashA12Rationalized = 'true';
  doc.documentElement.dataset.ashA12CommandSurface = 'ready';
  return true;
}

function publish(message, detail = {}) {
  const receipt = Object.freeze({
    schema:'td613.ash.a12-command-receipt/v0.1',
    message:String(message || ''),
    observed_at:new Date().toISOString(),
    authority_changed:false,
    custody_changed:false,
    source_bytes_moved:false,
    release_posture_changed:false,
    closure_changed:false,
    ...detail
  });
  const status = doc?.getElementById('ashA12CommandStatus');
  if (status) status.textContent = receipt.message;
  host?.dispatchEvent?.(new CustomEvent('td613:ash:a12-command-world-answer', { detail:receipt }));
  return receipt;
}

function navigate(control) {
  const workspace = control.dataset.a12Workspace;
  const anchor = control.dataset.a12Anchor || null;
  const navigateAsh = host?.__td613AshWholeInstrument?.navigate;
  doc?.getElementById('premiumCommandSheet')?.close?.();
  if (typeof navigateAsh !== 'function') {
    publish('Navigation held: the whole-instrument route owner has not reached readiness.', { result:'HELD_OWNER_UNAVAILABLE', workspace, anchor });
    return false;
  }
  const result = navigateAsh(workspace, {
    source_control:'a12-command-' + control.dataset.a12Command,
    anchor,
    open:true,
    return_path:doc.documentElement.dataset.ashPremiumWorkspace || 'home'
  });
  publish('Opened ' + (control.querySelector('strong')?.textContent || workspace) + '. The destination changed; Ash authority and case state did not.', { result:result?.result || 'ARRIVED', workspace, anchor });
  return true;
}

function settleProfileSelector(launch, profile) {
  const settle = () => {
    if (!launch?.isConnected || !profile?.isConnected) return false;
    launch.classList.remove('hidden');
    launch.setAttribute('aria-hidden', 'false');
    profile.focus?.({ preventScroll:false });
    profile.scrollIntoView?.({ block:'center', behavior:host.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    doc.documentElement.dataset.ashA12ProfileSelector = doc.activeElement === profile ? 'FOCUSED' : 'OPEN';
    return doc.activeElement === profile;
  };
  queueMicrotask(() => {
    if (typeof host.requestAnimationFrame === 'function') {
      host.requestAnimationFrame(() => {
        settle();
        host.requestAnimationFrame(() => settle());
      });
    } else settle();
  });
}

function openCasesAndProfiles() {
  const launch = doc?.getElementById('launch');
  const profile = doc?.getElementById('newProfile');
  doc?.getElementById('premiumCommandSheet')?.close?.();
  if (!launch || !profile) {
    publish('Cases & Profiles held: the explicit selector is not available in this composition.', { result:'HELD_SELECTOR_UNAVAILABLE' });
    return false;
  }
  launch.classList.remove('hidden');
  launch.setAttribute('aria-hidden', 'false');
  doc.documentElement.dataset.ashA12ProfileSelector = 'OPEN';
  settleProfileSelector(launch, profile);
  publish('Cases & Profiles opened. Selection remains explicit; no profile was inferred or changed.', { result:'SELECTOR_OPENED' });
  return true;
}

function ensureRouteDelta() {
  const surface = doc?.querySelector?.('[data-ash-route-surface]');
  if (!surface) return false;
  let details = surface.querySelector('.ash-route-delta');
  const delta = host?.__td613AshWholeInstrument?.current?.()?.transition_delta;
  if (!details) {
    details = doc.createElement('details');
    details.className = 'ash-route-delta';
    details.open = true;
    surface.append(details);
  }
  const changed = delta?.changed?.length ? delta.changed : ['explanation emphasis follows the explicitly selected route'];
  const unchanged = delta?.unchanged?.length ? delta.unchanged : ['case state','authority','source bytes','custody','claim ceiling','release posture','human closure'];
  details.innerHTML = '<summary>What changed—and what did not</summary><div><section><h4>Changed in explanation</h4><ul>' + changed.map(item => '<li>' + escapeHtml(item) + '</li>').join('') + '</ul></section><section><h4>Preserved exactly</h4><ul>' + unchanged.map(item => '<li>' + escapeHtml(item) + '</li>').join('') + '</ul></section></div>';
  details.dataset.ashA12Populated = 'true';
  return true;
}

function auditCommandSurface() {
  const grid = doc?.getElementById('premiumCommandGrid');
  if (!grid) return Object.freeze({ ready:false, visible_controls:0, inert_controls:0, empty_drawers:1 });
  const controls = [...grid.querySelectorAll('button,a')];
  const inert = controls.filter(control => control.tagName === 'BUTTON' && !control.dataset.a12Command && !control.dataset.a12Action);
  const empty = [...grid.querySelectorAll('section')].filter(section => !section.querySelector('button,a')).length;
  const result = Object.freeze({ ready:true, visible_controls:controls.length, inert_controls:inert.length, empty_drawers:empty });
  doc.documentElement.dataset.ashA12CommandAudit = inert.length || empty ? 'HELD' : 'PASS';
  return result;
}

function bind() {
  if (!doc?.body || doc.documentElement.dataset.ashA12Bound === 'true') return;
  doc.documentElement.dataset.ashA12Bound = 'true';
  doc.addEventListener('click', event => {
    const command = event.target?.closest?.('[data-a12-command]');
    if (command) {
      event.preventDefault();
      event.stopImmediatePropagation();
      navigate(command);
      return;
    }
    const action = event.target?.closest?.('[data-a12-action="profile"]');
    if (action) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openCasesAndProfiles();
    }
  }, true);
}

export function refreshAshA12(source = 'EXPLICIT_REFRESH') {
  ensureCommandSurface();
  ensureRouteDelta();
  const audit = auditCommandSurface();
  host?.dispatchEvent?.(new CustomEvent('td613:ash:a12-refreshed', { detail:Object.freeze({ source, audit, authority_changed:false, source_bytes_moved:false, human_closure_required:true }) }));
  return audit;
}

export function installAshA12CommandRationalization() {
  if (!host || !doc?.body || installed) return false;
  installed = true;
  bind();
  host.__td613AshA12 = Object.freeze({
    version:ASH_A12_COMMAND_RATIONALIZATION_VERSION,
    refresh:refreshAshA12,
    audit:auditCommandSurface,
    commands:COMMANDS,
    authority_changed:false,
    source_bytes_moved:false,
    human_closure_required:true
  });
  for (const type of ['canonical-module-graph-ready','whole-instrument-refreshed','profile-demo-hydrated','case-opened','case-created','case-closed']) {
    host.addEventListener('td613:ash:' + type, () => queueMicrotask(() => refreshAshA12('EVENT_' + type.toUpperCase())));
  }
  queueMicrotask(() => refreshAshA12('INSTALL'));
  return true;
}

if (host && doc) installAshA12CommandRationalization();
