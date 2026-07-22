export const ASH_DEMO_PEDAGOGY_VERSION = 'td613.ash.demo-pedagogy/v0.2-event-driven-idle-stable';

const host = globalThis.window;
const doc = globalThis.document;
const byId = id => doc?.getElementById(id);
const PROFILE_ORDER = Object.freeze(['investigation', 'political_campaign', 'fundraiser', 'research']);
let lastRenderSignature = '';

const surface = (id, label, selector, reason) => Object.freeze({ id, label, selector, reason });
const step = (label, detail, workspace) => Object.freeze({ label, detail, workspace });

const COMMON = Object.freeze({
  gesture_ready: Object.freeze([
    surface('add_object', 'Add an object', '#addObject', 'The demo may seed a map without closing authoring.'),
    surface('add_room', 'Add a Room', '#addRoom', 'The profile remains extensible beyond the synthetic fixture.'),
    surface('record_route', 'Record what left', '#recordRoute', 'Seeded Route Memory must not block exact later crossings.'),
    surface('accessible_table', 'Accessible map table', '#toggleTable', 'The table stays closed until asked for, while its control remains reachable.')
  ]),
  lifecycle_held: Object.freeze([
    surface('bind_root', 'Bind verified custody root', '#bindCustodyRoot', 'Binding stays held until a root exists and local verification completes.'),
    surface('run_test', 'Run Rebuild Test', '#runTest', 'The fixture may stage a Reader and references without bypassing lifecycle eligibility.'),
    surface('keep_draft', 'Keep draft', '#keepDraft', 'Populated draft text is not permission to create a governed receipt.'),
    surface('make_save', 'Create Save Point', '#makeSave', 'Continuity remains open until the required prior work completes.')
  ]),
  intentionally_dormant: Object.freeze([
    surface('provider_approval', 'Provider generation', '#providerApproval', 'Cloud or provider generation remains off until the human approves the exact selected text.'),
    surface('release_approval', 'Release receipt', '#approveRelease', 'Release remains locked until local review and required checks complete.'),
    surface('unexpected_detail', 'Unexpected Detail', '#unexpectedText', 'The demo must not invent provider novelty to make the interface look busy.'),
    surface('imported_reader', 'Imported Reader output', '#importedReaderOutput', 'No external Reader response exists in local synthetic hydration.'),
    surface('capsule_passphrase', 'Capsule passphrase', '#premiumCapsulePassphrase, #capsulePassphrase', 'Passphrases are never seeded, inferred, or stored.')
  ]),
  separate_boundary: Object.freeze([
    surface('destination_handoff', 'Destination handoff', 'a[href="/dome-world/ash-destination-handoff.html"]', 'External crossing remains a separately gated surface, not a local button disguised as transport.')
  ])
});

export const ASH_DEMO_PEDAGOGY_MANIFESTS = Object.freeze({
  investigation: Object.freeze({
    profile:'investigation', label:'Investigation', title:'Preserve before alleging.',
    consequence:'Ash keeps originals, contradictions, alternatives, and source boundaries visible before any finding.',
    stress_question:'Can the interface support urgent inquiry work without turning a difference into identity, intent, guilt, authorship, or truth?', entry_workspace:'home',
    task_spine:Object.freeze([
      step('Preserve source', 'Open custody posture and identify what remains original, missing, or provisional.', 'custody'),
      step('Map contradictions', 'Place versions, chronology, claims, gaps, and benign alternatives in one local structure.', 'map'),
      step('Test alternatives', 'Stage a bounded comparison without exporting the complete Case Map or source joins.', 'test'),
      step('Human-review finding', 'Prepare one nonaccusatory derivative while identity, intent, guilt, and truth remain outside the claim ceiling.', 'draft')
    ]), active_workspaces:Object.freeze(['home','custody','map','rooms','routes','test','work','choir','draft','save']),
    destination_copy:Object.freeze({ home:'Read mandate, evidence gaps, and the next preservation duty.', map:'Inspect provenance, chronology, contradictions, and competing explanations.', work:'Route preservation, interview, comparison, and review tasks.', choir:'Compare remembered routes without converting residue into attribution.', capsule:'Inspect continuity posture; sealing remains a separate human gesture.' }),
    keep_quiet:'Provider output, release approval, passphrases, invented novelty, and automatic findings stay dormant.', claim_ceiling:'No identity, intent, guilt, authorship, surveillance probability, or truth finding.'
  }),
  political_campaign: Object.freeze({
    profile:'political_campaign', label:'Political Campaign', title:'Separate public launch facts from the private campaign map.',
    consequence:'Ash preserves mandate, compliance, field, fundraising, and message joins while routing only the public facts each recipient needs.',
    stress_question:'Can the interface move launch work quickly without leaking donor, host, targeting, security, or route-order joins?', entry_workspace:'map',
    task_spine:Object.freeze([
      step('Confirm mandate', 'Read decision rights, launch timing, unresolved approvals, and public claim limits.', 'home'),
      step('Split public and private', 'Inspect Rooms so donor, host, targeting, coalition, and safety joins stay purpose-bound.', 'rooms'),
      step('Route launch work', 'Review reporter, coalition, finance, vendor, compliance, and offline-Reader crossings.', 'routes'),
      step('Human-review claim', 'Prepare one bounded public derivative without voter-intent or election prediction claims.', 'draft')
    ]), active_workspaces:Object.freeze(['home','map','rooms','routes','work','draft','test','choir','save']),
    destination_copy:Object.freeze({ home:'Read launch authority, open decisions, and the next bounded action.', map:'Inspect mandate, electorate, finance, field, message, safety, and claims together.', work:'Route launch approvals, field gaps, compliance, and message review.', choir:'Assay route combinations without recovering donor, host, or targeting joins.', capsule:'Inspect continuity; campaign release remains separately authorized.' }),
    keep_quiet:'Private donor/host sequences, provider generation, release approval, passphrases, and election prediction stay dormant.', claim_ceiling:'No voter intent, donor identity, persuasion effect, or election prediction.'
  }),
  fundraiser: Object.freeze({
    profile:'fundraiser', label:'Fundraiser', title:'Move the ask without moving the relationship map.',
    consequence:'Ash keeps revenue, donor, guest, sponsor, payment, and stewardship joins local while exposing the next human-reviewed action.',
    stress_question:'Can the interface support a time-bound fundraising sprint without turning prospects, payments, guests, or asks into inferred intent?', entry_workspace:'work',
    task_spine:Object.freeze([
      step('State the gap', 'Read the goal, confirmed amount, open commitments, decision rights, and downside uncertainty.', 'home'),
      step('Protect relationship joins', 'Inspect donor, host, guest, payment, and stewardship Rooms before drafting an ask.', 'rooms'),
      step('Route asks + stewardship', 'Review host, sponsor, vendor, guest, payment, and offline-Reader crossings.', 'routes'),
      step('Human-review ask', 'Prepare bounded ask language while donor intent, payment status, and conversion prediction remain held.', 'draft')
    ]), active_workspaces:Object.freeze(['home','work','map','rooms','routes','draft','test','choir','save']),
    destination_copy:Object.freeze({ home:'Read the revenue gap, open commitments, and next approved ask.', map:'Inspect goals, donors, hosts, sponsors, guests, payments, and stewardship.', work:'Route asks, approvals, seat assignments, reconciliation, and follow-up.', choir:'Compare route combinations without reconstructing the private relationship map.', capsule:'Inspect continuity; donor and guest data never become a portable default.' }),
    keep_quiet:'Prospect identity, payment status, provider output, release approval, passphrases, and conversion prediction stay dormant.', claim_ceiling:'No donor intent, payment status, guest identity, or conversion prediction.'
  }),
  research: Object.freeze({
    profile:'research', label:'Research Project', title:'Make the method inspectable before making the claim.',
    consequence:'Ash keeps question, provenance, ethics, nulls, alternatives, reproducibility, and route limits visible before publication language hardens.',
    stress_question:'Can the interface hold methods, nulls, consent, missingness, and replication gaps together without over-hydrating unsupported conclusions?', entry_workspace:'map',
    task_spine:Object.freeze([
      step('Frame the question', 'Read commitments, population boundaries, missing pilot rationale, and ethics posture.', 'home'),
      step('Inspect method + provenance', 'Map sources, protocols, raw data, coding, models, nulls, alternatives, and gaps.', 'map'),
      step('Test + reproduce', 'Stage controls, held-outs, Reader classes, route order, and deterministic replay.', 'test'),
      step('Human-review publication', 'Prepare a bounded claim while null-compatible outcomes and generalization limits remain visible.', 'draft')
    ]), active_workspaces:Object.freeze(['home','map','rooms','routes','test','choir','work','draft','save','custody']),
    destination_copy:Object.freeze({ home:'Read the question, commitments, evidence posture, and next methodological duty.', map:'Inspect sources, methods, data, ethics, coding, models, results, alternatives, and replication.', work:'Route preservation, calibration, ablation, retest, and claim-review tasks.', choir:'Compare review routes without turning reconstruction into validity or truth.', capsule:'Inspect continuity; archive and publication remain separately authorized.' }),
    keep_quiet:'Provider output, release approval, passphrases, invented novelty, and universal generalization stay dormant.', claim_ceiling:'No universal generalization, causal certainty, validity inflation, or policy prediction.'
  })
});

function ensureStyles() {
  if (byId('td613-ash-demo-pedagogy-css')) return;
  const style = doc.createElement('style');
  style.id = 'td613-ash-demo-pedagogy-css';
  style.textContent = `.ash-demo-pedagogy{margin:0 0 18px;padding:18px;border:1px solid rgba(118,234,212,.26);background:linear-gradient(145deg,rgba(4,20,16,.97),rgba(18,12,27,.88));box-shadow:0 18px 48px rgba(0,0,0,.2)}.ash-demo-pedagogy header{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:start}.ash-demo-pedagogy h3{margin:0;font:500 clamp(1.35rem,2.6vw,2.15rem)/1.08 var(--serif)}.ash-demo-pedagogy p{color:var(--muted);line-height:1.55}.ash-demo-pedagogy__chip{padding:7px 9px;border:1px solid rgba(228,198,108,.38);color:var(--gold);font:700 .58rem/1.2 var(--mono);text-transform:uppercase;letter-spacing:.08em}.ash-demo-pedagogy__steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:14px 0 0;padding:0;list-style:none}.ash-demo-pedagogy__steps button{width:100%;min-height:112px;padding:12px;text-align:left;border:1px solid rgba(118,234,212,.2);background:rgba(2,10,8,.72);color:var(--paper);cursor:pointer}.ash-demo-pedagogy__steps button:hover,.ash-demo-pedagogy__steps button:focus-visible{border-color:var(--gold);background:rgba(228,198,108,.07)}.ash-demo-pedagogy__steps button[data-current="true"]{border-color:var(--cyan);box-shadow:inset 0 0 0 1px rgba(118,234,212,.16)}.ash-demo-pedagogy__steps span{display:block;color:var(--cyan);font:700 .56rem var(--mono);text-transform:uppercase}.ash-demo-pedagogy__steps strong{display:block;margin:8px 0 5px;font:600 .9rem var(--mono)}.ash-demo-pedagogy__steps small{display:block;color:var(--muted);font:500 .68rem/1.45 var(--mono)}.ash-demo-pedagogy__ledger{margin-top:12px;border-top:1px solid rgba(118,234,212,.14);padding-top:10px}.ash-demo-pedagogy__ledger summary{cursor:pointer;color:var(--gold);font:700 .62rem var(--mono);text-transform:uppercase;letter-spacing:.08em}.ash-demo-pedagogy__groups{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:10px}.ash-demo-pedagogy__group{padding:10px;border:1px solid rgba(118,234,212,.12);background:rgba(1,8,6,.58)}.ash-demo-pedagogy__group h4{margin:0 0 7px;color:var(--paper);font:700 .6rem var(--mono);text-transform:uppercase}.ash-demo-pedagogy__group ul{margin:0;padding-left:16px;color:var(--muted);font:500 .62rem/1.45 var(--mono)}.ash-demo-pedagogy__group li[data-state="MISSING"],.ash-demo-pedagogy__group li[data-state="DRIFT"]{color:var(--rose)}.ash-demo-pedagogy__ceiling{margin:12px 0 0!important;color:var(--rose)!important;font:700 .62rem var(--mono)!important;text-transform:uppercase}@media(max-width:860px){.ash-demo-pedagogy__steps{grid-template-columns:repeat(2,minmax(0,1fr))}.ash-demo-pedagogy__groups{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:520px){.ash-demo-pedagogy{padding:14px}.ash-demo-pedagogy header{grid-template-columns:1fr}.ash-demo-pedagogy__steps,.ash-demo-pedagogy__groups{grid-template-columns:1fr}.ash-demo-pedagogy__steps button{min-height:88px}}`;
  doc.head.append(style);
}

function nodeVisible(node) { if (!node) return false; const style = getComputedStyle(node), rect = node.getBoundingClientRect(); return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0; }
function dormantState(node) { if (!node) return 'MISSING'; if ('checked' in node) return node.checked ? 'DRIFT' : 'DORMANT_OK'; if (node.disabled || node.getAttribute('aria-disabled') === 'true') return 'DORMANT_OK'; if ('value' in node) return String(node.value || '').trim() === '' ? 'DORMANT_OK' : 'DRIFT'; return 'DORMANT_OK'; }
function inspectSurface(item, expected) { const node = doc.querySelector(item.selector); let state = node ? 'PRESENT' : 'MISSING'; if (expected === 'GESTURE_READY' && node) state = !node.disabled && node.getAttribute('aria-disabled') !== 'true' ? 'READY' : 'HELD'; if (expected === 'LIFECYCLE_HELD' && node) state = node.disabled || node.getAttribute('aria-disabled') === 'true' ? 'HELD' : 'READY_AFTER_SEQUENCE'; if (expected === 'INTENTIONALLY_DORMANT') state = dormantState(node); if (expected === 'SEPARATE_BOUNDARY' && node) state = node.tagName === 'A' ? 'SEPARATE' : 'DRIFT'; return Object.freeze({ ...item, expected, state, visible:nodeVisible(node) }); }
function auditManifest(manifest) { const hydrated = manifest.active_workspaces.map(workspace => Object.freeze({ id:`workspace_${workspace}`, label:workspace.replaceAll('_',' '), selector:`#workspace-${workspace}`, reason:manifest.destination_copy[workspace] || 'Profile workspace remains available.', expected:'HYDRATED_VIEW', state:byId(`workspace-${workspace}`) ? 'PRESENT' : 'MISSING', visible:nodeVisible(byId(`workspace-${workspace}`)) })); const gesture = COMMON.gesture_ready.map(item => inspectSurface(item, 'GESTURE_READY')); const held = COMMON.lifecycle_held.map(item => inspectSurface(item, 'LIFECYCLE_HELD')); const dormant = COMMON.intentionally_dormant.map(item => inspectSurface(item, 'INTENTIONALLY_DORMANT')); const separate = COMMON.separate_boundary.map(item => inspectSurface(item, 'SEPARATE_BOUNDARY')); const all = [...hydrated, ...gesture, ...held, ...dormant, ...separate]; return Object.freeze({ profile:manifest.profile, version:ASH_DEMO_PEDAGOGY_VERSION, hydrated, gesture_ready:gesture, lifecycle_held:held, intentionally_dormant:dormant, separate_boundary:separate, missing:all.filter(item => item.state === 'MISSING').map(item => item.id), drift:all.filter(item => item.state === 'DRIFT').map(item => item.id) }); }
function group(label, items) { return `<section class="ash-demo-pedagogy__group"><h4>${label}</h4><ul>${items.map(item => `<li data-state="${item.state}" title="${item.reason}">${item.label} · ${item.state.replaceAll('_',' ').toLowerCase()}</li>`).join('')}</ul></section>`; }
function currentProfile() { const explicit = doc.documentElement.dataset.ashDemoProfile; if (ASH_DEMO_PEDAGOGY_MANIFESTS[explicit]) return explicit; const selected = byId('newProfile')?.value; return ASH_DEMO_PEDAGOGY_MANIFESTS[selected] && host.localStorage?.getItem?.('td613.ash-keep.current-case') ? selected : null; }
function openWorkspace(name) { const open = host.__td613AshUiUxRescue?.open || host.__td613AshPremiumUI?.open || host.__td613OpenAshWorkspace || host.__td613AshKeep?.openWorkspace; if (typeof open !== 'function') return false; open(name); host.dispatchEvent(new CustomEvent('td613:ash:demo-pedagogy-step', { detail:{ profile:currentProfile(), workspace:name, version:ASH_DEMO_PEDAGOGY_VERSION } })); return true; }
function updateMotionLabels(manifest) { const labels = manifest.task_spine.map(item => item.label); doc.querySelectorAll('.ash-ux-motion-node b').forEach((node, index) => { if (labels[index] && node.textContent !== labels[index]) node.textContent = labels[index]; }); }
function decorateDestinations(manifest) { doc.querySelectorAll('[data-premium-workspace]').forEach(button => { const workspace = button.dataset.premiumWorkspace; const purpose = manifest.destination_copy[workspace]; if (!purpose) return; if (button.dataset.demoProfile !== manifest.profile) button.dataset.demoProfile = manifest.profile; if (button.dataset.demoPurpose !== purpose) button.dataset.demoPurpose = purpose; if (button.title !== purpose) button.title = purpose; if (button.getAttribute('aria-description') !== purpose) button.setAttribute('aria-description', purpose); }); }

function renderSignature(manifest, audit) {
  const state = [...audit.hydrated, ...audit.gesture_ready, ...audit.lifecycle_held, ...audit.intentionally_dormant, ...audit.separate_boundary].map(item => `${item.id}:${item.state}`).join('|');
  return `${manifest.profile}|${doc.documentElement.dataset.ashPremiumWorkspace || ''}|${state}`;
}

function render(manifest) {
  const home = byId('workspace-home');
  if (!home) return false;
  const audit = auditManifest(manifest);
  const signature = renderSignature(manifest, audit);
  let panel = byId('ashDemoPedagogyLedger');
  if (!panel) {
    panel = doc.createElement('section'); panel.id = 'ashDemoPedagogyLedger'; panel.className = 'ash-demo-pedagogy'; home.querySelector('.workspace-head')?.insertAdjacentElement('afterend', panel);
  }
  panel.dataset.profile = manifest.profile;
  if (lastRenderSignature !== signature || panel.dataset.renderSignature !== signature) {
    panel.dataset.renderSignature = signature;
    panel.innerHTML = `<header><div><p class="premium-kicker">${manifest.label} · child-legible profile route</p><h3>${manifest.title}</h3><p>${manifest.consequence}</p><p><strong>Stress question:</strong> ${manifest.stress_question}</p></div><span class="ash-demo-pedagogy__chip">${manifest.entry_workspace} first</span></header><ol class="ash-demo-pedagogy__steps">${manifest.task_spine.map((item,index) => `<li><button type="button" data-demo-pedagogy-workspace="${item.workspace}" data-demo-step="${index}" data-current="${doc.documentElement.dataset.ashPremiumWorkspace === item.workspace}"><span>${index + 1} · ${item.workspace}</span><strong>${item.label}</strong><small>${item.detail}</small></button></li>`).join('')}</ol><details class="ash-demo-pedagogy__ledger"><summary>Hydration ledger · what should work, wait, stay quiet, or remain separate</summary><div class="ash-demo-pedagogy__groups">${group('Hydrated now', audit.hydrated)}${group('Ready for gesture', audit.gesture_ready)}${group('Held by sequence', audit.lifecycle_held)}${group('Quiet on purpose', audit.intentionally_dormant)}${group('Separate boundary', audit.separate_boundary)}</div><p>${manifest.keep_quiet}</p></details><p class="ash-demo-pedagogy__ceiling">Claim ceiling · ${manifest.claim_ceiling}</p>`;
    lastRenderSignature = signature;
  }
  doc.documentElement.dataset.ashPedagogyProfile = manifest.profile;
  doc.documentElement.dataset.ashPedagogyVersion = ASH_DEMO_PEDAGOGY_VERSION;
  doc.documentElement.dataset.ashPedagogyAudit = JSON.stringify({ missing:audit.missing, drift:audit.drift });
  const title = byId('ashAiaTitle'); if (title && title.textContent !== manifest.title) title.textContent = manifest.title;
  const consequence = doc.querySelector('[data-aia-consequence]'); if (consequence && consequence.textContent !== manifest.consequence) consequence.textContent = manifest.consequence;
  updateMotionLabels(manifest); decorateDestinations(manifest); return audit;
}

let scheduled = false;
function schedule() { if (scheduled) return; scheduled = true; host.setTimeout(() => { scheduled = false; const profile = currentProfile(); if (!profile) return; const manifest = ASH_DEMO_PEDAGOGY_MANIFESTS[profile]; const audit = render(manifest); host.__td613AshDemoPedagogyState = Object.freeze({ profile, manifest, audit }); host.dispatchEvent(new CustomEvent('td613:ash:demo-pedagogy-hydrated', { detail:{ profile, version:ASH_DEMO_PEDAGOGY_VERSION, missing:audit?.missing || [], drift:audit?.drift || [] } })); }, 0); }

export function installAshDemoPedagogy(docArg = document, hostArg = window) {
  if (!docArg?.body || !hostArg || hostArg.__td613AshDemoPedagogy) return false;
  ensureStyles();
  docArg.addEventListener('click', event => { const button = event.target?.closest?.('[data-demo-pedagogy-workspace]'); if (!button) return; event.preventDefault(); openWorkspace(button.dataset.demoPedagogyWorkspace); }, true);
  for (const type of ['profile-demo-hydrated','case-opened','case-created','premium-ready','aia3-readiness-changed','ux-workspace-opened','lifecycle-updated','explanation-frame']) hostArg.addEventListener(`td613:ash:${type}`, schedule);
  hostArg.__td613AshDemoPedagogy = Object.freeze({ version:ASH_DEMO_PEDAGOGY_VERSION, profiles:PROFILE_ORDER, manifests:ASH_DEMO_PEDAGOGY_MANIFESTS, hydrate:profile => { if (!ASH_DEMO_PEDAGOGY_MANIFESTS[profile]) throw new Error(`No pedagogy manifest for ${profile}.`); docArg.documentElement.dataset.ashDemoProfile = profile; return render(ASH_DEMO_PEDAGOGY_MANIFESTS[profile]); }, audit:profile => auditManifest(ASH_DEMO_PEDAGOGY_MANIFESTS[profile || currentProfile()]), current:() => hostArg.__td613AshDemoPedagogyState || null, open:openWorkspace });
  docArg.documentElement.dataset.ashDemoPedagogy = ASH_DEMO_PEDAGOGY_VERSION;
  schedule(); return true;
}

if (host && doc) installAshDemoPedagogy(doc, host);
