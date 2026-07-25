import { compileCaseMap, compileRoomRules, compileRouteMemory } from '../engine/ash-keep-core.js';

export const ASH_ARCHIVE_DEMO_VERSION = 'td613.ash.archive-demo/v0.1-a14-accession';
export const ASH_ARCHIVE_ACCESSION_SCHEMA = 'td613.ash.archive-accession/v0.1';

const DB_NAME = 'td613-ash-keep';
const POINTER_KEY = 'td613.ash-keep.current-case';
const PROFILE = 'archive';
const MARKER = 'demo_profile:archive';
const host = globalThis.window;
const doc = globalThis.document;
const byId = id => doc?.getElementById(id);
const digest = value => `sha256:${String(value).repeat(64).slice(0, 64)}`;

const ROOMS = Object.freeze([
  { id:'room_accession', label:'Accession & Scope', color:'#76ead4' },
  { id:'room_provenance', label:'Provenance & Custody', color:'#e4c66c' },
  { id:'room_restrictions', label:'Restrictions & Rights', color:'#f0abfc' },
  { id:'room_embargo', label:'Embargo & Review Clock', color:'#fb923c' },
  { id:'room_derivatives', label:'Derivatives & Redaction', color:'#d9a1ff' },
  { id:'room_access', label:'Access Copies', color:'#7dd3fc' },
  { id:'room_routes', label:'Transfer Preparation', color:'#ff8b9d' },
  { id:'room_next', label:'Next Custodial Actions', color:'#86efac' }
]);

const NODES = Object.freeze([
  { id:'node_accession_offer', type:'artifact', label:'Synthetic accession offer packet', room_id:'room_accession', source_status:'SUPPLIED', sensitivity:'PRIVATE', confidence_posture:'HELD' },
  { id:'node_scope_inventory', type:'artifact', label:'Box-level scope inventory', room_id:'room_accession', source_status:'CONSTRUCTED', sensitivity:'PRIVATE', confidence_posture:'HELD' },
  { id:'node_scope_gap', type:'evidence-gap', label:'Two folders remain unenumerated', room_id:'room_accession', source_status:'OBSERVED', sensitivity:'RESTRICTED', confidence_posture:'OPEN' },
  { id:'node_custody_root', type:'artifact', label:'Custody-root receipt', room_id:'room_provenance', source_status:'SUPPLIED', sensitivity:'RESTRICTED', confidence_posture:'HELD' },
  { id:'node_chain_ledger', type:'artifact', label:'Synthetic chain-of-custody ledger', room_id:'room_provenance', source_status:'CONSTRUCTED', sensitivity:'RESTRICTED', confidence_posture:'HELD' },
  { id:'node_provenance_gap', type:'evidence-gap', label:'One transfer date requires verification', room_id:'room_provenance', source_status:'OBSERVED', sensitivity:'PRIVATE', confidence_posture:'OPEN' },
  { id:'node_donor_restriction', type:'claim', label:'Donor restriction requires human interpretation', room_id:'room_restrictions', source_status:'SUPPLIED', sensitivity:'RESTRICTED', confidence_posture:'OPEN' },
  { id:'node_third_party_rights', type:'claim', label:'Third-party rights remain unresolved', room_id:'room_restrictions', source_status:'OBSERVED', sensitivity:'RESTRICTED', confidence_posture:'OPEN' },
  { id:'node_release_authority', type:'claim', label:'Release authority remains external to Ash', room_id:'room_restrictions', source_status:'DERIVED', sensitivity:'PRIVATE', confidence_posture:'HELD' },
  { id:'node_embargo_clock', type:'event', label:'Synthetic embargo review date', room_id:'room_embargo', source_status:'SUPPLIED', sensitivity:'PRIVATE', confidence_posture:'HELD' },
  { id:'node_embargo_extension', type:'hypothesis', label:'Restriction review may require extension', room_id:'room_embargo', source_status:'INFERRED', sensitivity:'PRIVATE', confidence_posture:'OPEN' },
  { id:'node_review_gap', type:'evidence-gap', label:'No declassification decision exists', room_id:'room_embargo', source_status:'OBSERVED', sensitivity:'RESTRICTED', confidence_posture:'OPEN' },
  { id:'node_preservation_master', type:'artifact', label:'Preservation master manifest', room_id:'room_derivatives', source_status:'CONSTRUCTED', sensitivity:'RESTRICTED', confidence_posture:'HELD' },
  { id:'node_redaction_plan', type:'artifact', label:'Proposed redaction plan', room_id:'room_derivatives', source_status:'CONSTRUCTED', sensitivity:'PRIVATE', confidence_posture:'OPEN' },
  { id:'node_public_derivative', type:'artifact', label:'Unapproved public derivative', room_id:'room_derivatives', source_status:'CONSTRUCTED', sensitivity:'PUBLIC', confidence_posture:'OPEN' },
  { id:'node_research_copy', type:'artifact', label:'Restricted research access copy', room_id:'room_access', source_status:'CONSTRUCTED', sensitivity:'RESTRICTED', confidence_posture:'OPEN' },
  { id:'node_reading_room_copy', type:'artifact', label:'Reading-room access copy', room_id:'room_access', source_status:'CONSTRUCTED', sensitivity:'PRIVATE', confidence_posture:'OPEN' },
  { id:'node_access_approval_gap', type:'evidence-gap', label:'No access approval receipt exists', room_id:'room_access', source_status:'OBSERVED', sensitivity:'RESTRICTED', confidence_posture:'OPEN' },
  { id:'node_transfer_manifest', type:'artifact', label:'Delayed transfer manifest', room_id:'room_routes', source_status:'CONSTRUCTED', sensitivity:'PRIVATE', disclosure_state:'LOCAL', confidence_posture:'OPEN' },
  { id:'node_destination_hold', type:'evidence-gap', label:'Destination and recipient remain unconfirmed', room_id:'room_routes', source_status:'OBSERVED', sensitivity:'PRIVATE', disclosure_state:'LOCAL', confidence_posture:'OPEN' },
  { id:'node_action_verify', type:'intended-action', label:'Verify accession scope and provenance gaps', room_id:'room_next', source_status:'SUPPLIED', confidence_posture:'OPEN' },
  { id:'node_action_review', type:'intended-action', label:'Human-review restrictions and embargo posture', room_id:'room_next', source_status:'SUPPLIED', confidence_posture:'OPEN' },
  { id:'node_action_prepare', type:'intended-action', label:'Prepare bounded access copy without release', room_id:'room_next', source_status:'SUPPLIED', confidence_posture:'OPEN' },
  { id:'node_action_transfer', type:'intended-action', label:'Hold transfer until destination authorization', room_id:'room_next', source_status:'SUPPLIED', confidence_posture:'OPEN' }
]);

const RELATIONSHIPS = Object.freeze([
  { id:'edge_offer_scope', from:'node_accession_offer', to:'node_scope_inventory', type:'describes', source_status:'SUPPLIED' },
  { id:'edge_gap_scope', from:'node_scope_gap', to:'node_action_verify', type:'requires', source_status:'OBSERVED' },
  { id:'edge_root_ledger', from:'node_custody_root', to:'node_chain_ledger', type:'anchors', source_status:'SUPPLIED' },
  { id:'edge_provenance_verify', from:'node_provenance_gap', to:'node_action_verify', type:'requires', source_status:'OBSERVED' },
  { id:'edge_restriction_review', from:'node_donor_restriction', to:'node_action_review', type:'requires', source_status:'SUPPLIED' },
  { id:'edge_rights_review', from:'node_third_party_rights', to:'node_action_review', type:'requires', source_status:'OBSERVED' },
  { id:'edge_authority_derivative', from:'node_release_authority', to:'node_public_derivative', type:'holds-release-of', source_status:'DERIVED' },
  { id:'edge_embargo_extension', from:'node_embargo_clock', to:'node_embargo_extension', type:'admits-review-of', source_status:'INFERRED' },
  { id:'edge_review_gap', from:'node_review_gap', to:'node_public_derivative', type:'blocks-release-of', source_status:'OBSERVED' },
  { id:'edge_master_redaction', from:'node_preservation_master', to:'node_redaction_plan', type:'supports-derivation-of', source_status:'CONSTRUCTED' },
  { id:'edge_redaction_public', from:'node_redaction_plan', to:'node_public_derivative', type:'proposes', source_status:'CONSTRUCTED' },
  { id:'edge_copy_approval', from:'node_access_approval_gap', to:'node_research_copy', type:'blocks-access-to', source_status:'OBSERVED' },
  { id:'edge_copy_prepare', from:'node_research_copy', to:'node_action_prepare', type:'requires-human-review', source_status:'CONSTRUCTED' },
  { id:'edge_manifest_destination', from:'node_transfer_manifest', to:'node_destination_hold', type:'held-by', source_status:'OBSERVED' },
  { id:'edge_destination_transfer', from:'node_destination_hold', to:'node_action_transfer', type:'requires', source_status:'OBSERVED' }
]);

const RULES = Object.freeze([
  { route_id:'route_internal_accession_review', allowed_room_ids:['room_accession','room_provenance','room_restrictions','room_next'], local_link_keys:['edge_offer_scope','edge_root_ledger'], allowed_node_types:['artifact','claim','evidence-gap','intended-action'] },
  { route_id:'route_restricted_research_copy', allowed_room_ids:['room_restrictions','room_embargo','room_derivatives','room_access'], local_link_keys:['edge_copy_approval','edge_master_redaction'], allowed_node_types:['artifact','claim','evidence-gap'] },
  { route_id:'route_public_derivative_review', allowed_room_ids:['room_restrictions','room_embargo','room_derivatives'], local_link_keys:['edge_authority_derivative','edge_review_gap'], allowed_node_types:['artifact','claim','evidence-gap'] },
  { route_id:'route_delayed_transfer', allowed_room_ids:['room_accession','room_provenance','room_routes','room_next'], local_link_keys:['edge_manifest_destination'], allowed_node_types:['artifact','evidence-gap','intended-action'] }
]);

const ROUTES = Object.freeze([
  { entry_id:'route_archive_accession_01', draft_digest:digest('accession'), route_id:'route_internal_accession_review', purpose:'review-accession-without-release', recipient_class:'archive-custodian', recorded_at:'2026-07-25T12:00:00Z', disclosed_opaque_references:['node_accession_offer','node_scope_inventory','node_provenance_gap'], recall_state:'NOT_RECALLED' },
  { entry_id:'route_archive_research_01', draft_digest:digest('research'), route_id:'route_restricted_research_copy', purpose:'prepare-restricted-access-copy', recipient_class:'approved-researcher-role', recorded_at:'2026-07-25T12:10:00Z', disclosed_opaque_references:['node_redaction_plan','node_research_copy','node_access_approval_gap'], recall_state:'NOT_RECALLED' },
  { entry_id:'route_archive_public_01', draft_digest:digest('public'), route_id:'route_public_derivative_review', purpose:'review-public-derivative-without-publication', recipient_class:'human-release-reviewer', recorded_at:'2026-07-25T12:20:00Z', disclosed_opaque_references:['node_public_derivative','node_review_gap','node_release_authority'], recall_state:'NOT_RECALLED' },
  { entry_id:'route_archive_transfer_01', draft_digest:digest('transfer'), route_id:'route_delayed_transfer', purpose:'prepare-transfer-without-delivery', recipient_class:'unconfirmed-destination-custodian', recorded_at:'2026-07-25T12:30:00Z', disclosed_opaque_references:['node_transfer_manifest','node_destination_hold'], recall_state:'NOT_RECALLED' }
]);

const ARCHIVE_DEMO = Object.freeze({
  schema:ASH_ARCHIVE_ACCESSION_SCHEMA,
  profile:PROFILE,
  label:'Archive',
  demo_id:'demo_archive_nightjar_accession_v1',
  title:'Nightjar Community Archive · accession, restriction, and access-copy review',
  summary:'A synthetic accession that preserves provenance, restriction uncertainty, embargo clocks, preservation masters, access-copy derivatives, and delayed transfer without granting access or release authority.',
  rooms:ROOMS,
  nodes:NODES,
  relationships:RELATIONSHIPS,
  rules:RULES,
  routes:ROUTES,
  observations:Object.freeze([{ kind:'SYNTHETIC_ARCHIVE_ACCESSION_FIXTURE', real_people:false, real_organizations:false, real_documents:false, real_events:false, access_granted:false, release_authorized:false, transfer_executed:false }]),
  missingness:Object.freeze(['No real collection or donor exists.', 'No access approval receipt exists.', 'No declassification decision exists.', 'No destination or recipient is authorized.']),
  alternatives:Object.freeze(['restriction may expire after human review', 'third-party rights may require continued closure', 'a derivative may be narrower than the preservation master', 'transfer may remain local indefinitely']),
  assay:Object.freeze({
    source_status:'CONSTRUCTED',
    accession_scope_declared:true,
    provenance_gaps_preserved:true,
    restrictions_interpreted_automatically:false,
    access_copy_created_automatically:false,
    release_authority:false,
    transfer_authority:false,
    claim_ceiling:'SYNTHETIC_ARCHIVE_ACCESSION_AND_INTERFACE_HYDRATION_ONLY__NO_ACCESS_GRANT_RELEASE_DECLASSIFICATION_OR_TRANSFER_AUTHORITY'
  }),
  defaults:Object.freeze({
    reader_class:'deterministic-baseline',
    test_refs:['node_accession_offer','node_custody_root','node_donor_restriction','node_embargo_clock','node_access_approval_gap','node_destination_hold'],
    route:{ id:'route_restricted_research_copy', recipient_class:'approved-researcher-role', purpose:'prepare-restricted-access-copy', digest:digest('bounded-copy'), refs:['node_redaction_plan','node_research_copy','node_access_approval_gap'] },
    draft:{ route:'route_public_derivative_review', recipient_class:'human-release-reviewer', purpose:'review-public-derivative-without-publication', version:'1', refs:['node_public_derivative','node_review_gap','node_release_authority'], body:'Synthetic archive review draft: preserve the original custody record, distinguish preservation master from derivative, retain unresolved restrictions and third-party rights, and withhold access, publication, declassification, or transfer until a qualified human supplies explicit authority.' },
    provider_task:'Review the synthetic accession packet for provenance gaps, restriction uncertainty, embargo posture, derivative boundaries, and unsupported access or release claims.',
    protected_literals:['custody-root receipt','donor restriction text','third-party rights note','preservation master digest','complete transfer ledger'],
    save_questions:['Which accession folders remain unenumerated?','Who may interpret the restriction?','Which derivative can be prepared without granting access?','What destination evidence is still absent?'],
    save_next:['Verify the accession scope.','Preserve provenance gaps.','Human-review restrictions and embargo posture.','Prepare only a bounded access copy.','Keep transfer held until destination authorization.'],
    research_notes:'Synthetic Archive accession and interface specimen. Ash stages provenance, restrictions, derivatives, access-copy review, and transfer preparation. It performs no access grant, declassification, publication, export, destination handoff, or custody transfer.',
    tradeoff:{ utility:6, rebuild:3, link:8, work:7 }
  })
});

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function setValue(id, value) {
  const element = byId(id);
  if (!element || value == null) return;
  element.value = String(value);
  element.dispatchEvent(new Event('input', { bubbles:true }));
  element.dispatchEvent(new Event('change', { bubbles:true }));
}

async function waitForAsh() {
  for (let index = 0; index < 600; index += 1) {
    if (host?.__td613AshKeep?.refresh && host?.__td613AshPremiumUI?.open) return;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error('Ash Keep did not reach Archive accession readiness.');
}

async function writeRecords(caseMap, roomRules, routeMemory) {
  const db = await openDb();
  try {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(['cases','roomRules','routeMemory'], 'readwrite');
      transaction.objectStore('cases').put(caseMap);
      transaction.objectStore('roomRules').put({ id:caseMap.case_id, value:roomRules });
      transaction.objectStore('routeMemory').put({ id:caseMap.case_id, value:routeMemory });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}

function applyDefaults() {
  const defaults = ARCHIVE_DEMO.defaults;
  setValue('readerClass', defaults.reader_class);
  setValue('testRefs', defaults.test_refs.join(', '));
  setValue('routeId', defaults.route.id);
  setValue('routeRecipient', defaults.route.recipient_class);
  setValue('routePurpose', defaults.route.purpose);
  setValue('routeDigest', defaults.route.digest);
  setValue('routeRefs', defaults.route.refs.join(', '));
  setValue('draftBody', defaults.draft.body);
  setValue('draftRoute', defaults.draft.route);
  setValue('draftRecipient', defaults.draft.recipient_class);
  setValue('draftPurpose', defaults.draft.purpose);
  setValue('draftVersion', defaults.draft.version);
  setValue('draftRefs', defaults.draft.refs.join(', '));
  setValue('providerTask', defaults.provider_task);
  setValue('protectedLiterals', defaults.protected_literals.join(', '));
  setValue('saveQuestions', defaults.save_questions.join('\n'));
  setValue('saveNext', defaults.save_next.join('\n'));
  setValue('researchNotes', defaults.research_notes);
  setValue('unexpectedText', '');
  setValue('importedReaderOutput', '');
  for (const [key, value] of Object.entries(defaults.tradeoff)) {
    setValue(`${key}Value`, value);
    if (byId(`${key}Readout`)) byId(`${key}Readout`).textContent = String(value);
  }
  doc.documentElement.dataset.ashDemoProfile = PROFILE;
  doc.documentElement.dataset.ashDemoId = ARCHIVE_DEMO.demo_id;
  doc.documentElement.dataset.ashArchiveAccession = ASH_ARCHIVE_DEMO_VERSION;
}

function renderDocket() {
  doc?.getElementById('archiveAccessionDocket')?.remove();
  const layout = doc?.querySelector('#workspace-map .map-layout');
  if (!layout) return;
  const section = doc.createElement('section');
  section.id = 'archiveAccessionDocket';
  section.className = 'apeq-paia-method-docket archive-accession-docket';
  section.dataset.profile = PROFILE;
  section.innerHTML = `<h3>Archive Accession Review<small>synthetic collection · human authority required</small></h3><p>${ARCHIVE_DEMO.summary}</p><div class="apeq-paia-docket-metrics"><b>rooms · ${ROOMS.length}</b><b>objects · ${NODES.length}</b><b>relations · ${RELATIONSHIPS.length}</b><b>routes · ${ROUTES.length}</b></div><p><strong>Task spine:</strong> accession scope → provenance → restrictions → embargo review → derivative boundary → access-copy review → delayed transfer.</p><details><summary>What remains held</summary><ul><li>Access approval, declassification, and publication</li><li>Donor-restriction and third-party-rights interpretation</li><li>Destination authorization and custody transfer</li></ul></details><p class="apeq-paia-ceiling">Claim ceiling · synthetic accession only · no access grant, release, declassification, publication, or transfer authority</p>`;
  layout.before(section);
}

async function currentCase() {
  const id = host?.localStorage?.getItem(POINTER_KEY);
  if (!id) return null;
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction('cases').objectStore('cases').get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export function buildArchiveDemoFixture() { return ARCHIVE_DEMO; }

export async function rehydrateArchiveDemo() {
  try {
    const record = await currentCase();
    if (!record || !(record.operator_notes || []).includes(MARKER)) return null;
    applyDefaults();
    renderDocket();
    return ARCHIVE_DEMO;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function hydrateArchiveDemo() {
  const status = byId('demoProfileStatus');
  await waitForAsh();
  const caseMap = await compileCaseMap({
    profile:PROFILE,
    title:ARCHIVE_DEMO.title,
    rooms:ROOMS,
    nodes:NODES,
    relationships:RELATIONSHIPS,
    privateChronology:['synthetic accession offered','scope inventory compiled','custody root staged','restriction uncertainty preserved','embargo review held','derivative boundaries declared','access copy prepared locally','transfer held for destination authority'],
    intendedActions:NODES.filter(node => node.type === 'intended-action').map(node => node.label),
    sourceStatus:'SIMULATED',
    evidenceBasis:['synthetic Archive accession fixture'],
    observations:['No real collection, donor, repository, researcher, destination, or document is represented.'],
    missingness:[...ARCHIVE_DEMO.missingness],
    alternatives:[...ARCHIVE_DEMO.alternatives],
    openQuestions:['Which restriction requires qualified interpretation?','Which derivative may be prepared without granting access?','Which destination evidence remains absent?'],
    operatorNotes:[MARKER, `demo_id:${ARCHIVE_DEMO.demo_id}`, 'claim_ceiling:no_access_release_declassification_publication_or_transfer_authority']
  });
  const roomRules = await compileRoomRules({ caseId:caseMap.case_id, rules:RULES, sourceStatus:'SIMULATED' });
  const routeMemory = await compileRouteMemory({
    caseId:caseMap.case_id,
    entries:ROUTES,
    operatorDeclaredAssumptions:['A preservation master is not an access copy.','A prepared derivative is not a release approval.','A transfer manifest is not destination authorization.'],
    unknown:['restriction interpretation','third-party rights posture','embargo extension','destination identity and recipient authority'],
    sourceStatus:'SIMULATED'
  });
  await writeRecords(caseMap, roomRules, routeMemory);
  host.localStorage.setItem(POINTER_KEY, caseMap.case_id);
  await host.__td613AshKeep.refresh();
  applyDefaults();
  renderDocket();
  host.dispatchEvent(new CustomEvent('td613:ash:profile-demo-hydrated', {
    detail:{
      profile:PROFILE,
      case_id:caseMap.case_id,
      case_map_digest:caseMap.case_map_digest,
      route_memory_digest:routeMemory.route_memory_digest,
      source_status:'CONSTRUCTED',
      access_granted:false,
      release_authorized:false,
      declassification_authorized:false,
      transfer_executed:false
    }
  }));
  setTimeout(() => host.__td613AshPremiumUI?.open?.('map'), 0);
  if (status) status.innerHTML = '<strong>Archive demo hydrated.</strong> Accession, provenance, restrictions, derivatives, and delayed transfer remain synthetic and human-gated.';
  return { caseMap, roomRules, routeMemory, fixture:ARCHIVE_DEMO };
}

export function installArchiveDemo(documentRef = doc, windowRef = host) {
  if (!documentRef?.documentElement || !windowRef || windowRef.__td613AshArchiveDemo) return false;
  windowRef.addEventListener('td613:ash:case-opened', () => setTimeout(rehydrateArchiveDemo, 0));
  windowRef.__td613AshArchiveDemo = Object.freeze({
    version:ASH_ARCHIVE_DEMO_VERSION,
    schema:ASH_ARCHIVE_ACCESSION_SCHEMA,
    profile:PROFILE,
    label:ARCHIVE_DEMO.label,
    build:buildArchiveDemoFixture,
    hydrate:hydrateArchiveDemo,
    rehydrate:rehydrateArchiveDemo,
    counts:Object.freeze({ rooms:ROOMS.length, nodes:NODES.length, relationships:RELATIONSHIPS.length, rules:RULES.length, routes:ROUTES.length }),
    authority:Object.freeze({ access_granted:false, release_authority:false, declassification_authority:false, transfer_authority:false, raw_content_transport:false, human_review_required:true })
  });
  documentRef.documentElement.dataset.ashArchiveDemo = ASH_ARCHIVE_DEMO_VERSION;
  return true;
}

if (doc && host) installArchiveDemo(doc, host);
