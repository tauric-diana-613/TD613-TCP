import { compileCaseMap, compileRoomRules, compileRouteMemory } from '../engine/ash-keep-core.js';

export const ASH_ARCHIVE_DEMO_VERSION = 'td613.ash.archive-demo/v0.2-a14-harbor-memory';
export const ASH_ARCHIVE_ACCESSION_SCHEMA = 'td613.ash.archive-accession/v0.2-harbor-memory';

const DB_NAME = 'td613-ash-keep';
const POINTER_KEY = 'td613.ash-keep.current-case';
const PROFILE = 'archive';
const MARKER = 'demo_profile:archive';
const host = globalThis.window;
const doc = globalThis.document;
const byId = id => doc?.getElementById(id);
const digest = value => {
  const source = [...String(value || '0')]
    .map(character => character.codePointAt(0).toString(16).padStart(2, '0'))
    .join('') || '0';
  return `sha256:${source.repeat(Math.ceil(64 / source.length)).slice(0, 64)}`;
};

const ROOMS = Object.freeze([
  { id:'room_accession', label:'Accession & Scope', color:'#76ead4' },
  { id:'room_provenance', label:'Originals, Versions & Provenance', color:'#e4c66c' },
  { id:'room_restrictions', label:'Restrictions & Rights', color:'#f0abfc' },
  { id:'room_embargo', label:'Embargo & Review Clock', color:'#fb923c' },
  { id:'room_derivatives', label:'Derivatives & Access Copies', color:'#d9a1ff' },
  { id:'room_access', label:'Local Access Review', color:'#7dd3fc' },
  { id:'room_routes', label:'Transfer Preparation', color:'#ff8b9d' },
  { id:'room_next', label:'Next Custodial Actions', color:'#86efac' }
]);

const NODES = Object.freeze([
  { id:'node_accession_note', type:'artifact', label:'Harbor Memory accession note', room_id:'room_accession', source_status:'SUPPLIED', sensitivity:'PRIVATE', confidence_posture:'HELD' },
  { id:'node_scope_inventory', type:'artifact', label:'Mixed-media accession inventory', room_id:'room_accession', source_status:'CONSTRUCTED', sensitivity:'PRIVATE', confidence_posture:'HELD' },
  { id:'node_scope_gap', type:'evidence-gap', label:'One folder remains unenumerated', room_id:'room_accession', source_status:'OBSERVED', sensitivity:'RESTRICTED', confidence_posture:'OPEN' },
  { id:'node_original_audio', type:'artifact', label:'Original audio recording', room_id:'room_provenance', source_status:'SUPPLIED', sensitivity:'RESTRICTED', confidence_posture:'HELD' },
  { id:'node_transcript', type:'artifact', label:'Transcript derived from original audio', room_id:'room_provenance', source_status:'CONSTRUCTED', sensitivity:'PRIVATE', confidence_posture:'HELD' },
  { id:'node_edited_transcript', type:'artifact', label:'Edited transcript derivative', room_id:'room_derivatives', source_status:'CONSTRUCTED', sensitivity:'PRIVATE', confidence_posture:'OPEN' },
  { id:'node_photograph', type:'artifact', label:'Collection photograph', room_id:'room_provenance', source_status:'SUPPLIED', sensitivity:'PRIVATE', confidence_posture:'HELD' },
  { id:'node_uncertain_date', type:'evidence-gap', label:'Photograph date remains uncertain', room_id:'room_provenance', source_status:'OBSERVED', sensitivity:'PRIVATE', confidence_posture:'OPEN' },
  { id:'node_duplicate_scan', type:'artifact', label:'Duplicate photograph scan', room_id:'room_derivatives', source_status:'CONSTRUCTED', sensitivity:'PRIVATE', confidence_posture:'OPEN' },
  { id:'node_custody_root', type:'artifact', label:'Custody-root receipt', room_id:'room_provenance', source_status:'SUPPLIED', sensitivity:'RESTRICTED', confidence_posture:'HELD' },
  { id:'node_chain_ledger', type:'artifact', label:'Synthetic chain-of-custody ledger', room_id:'room_provenance', source_status:'CONSTRUCTED', sensitivity:'RESTRICTED', confidence_posture:'HELD' },
  { id:'node_donor_restriction', type:'claim', label:'Donor restriction requires human interpretation', room_id:'room_restrictions', source_status:'SUPPLIED', sensitivity:'RESTRICTED', confidence_posture:'OPEN' },
  { id:'node_missing_release_form', type:'evidence-gap', label:'Release form is missing', room_id:'room_restrictions', source_status:'OBSERVED', sensitivity:'RESTRICTED', confidence_posture:'OPEN' },
  { id:'node_third_party_rights', type:'claim', label:'Third-party rights remain unresolved', room_id:'room_restrictions', source_status:'OBSERVED', sensitivity:'RESTRICTED', confidence_posture:'OPEN' },
  { id:'node_release_authority', type:'claim', label:'Release authority remains external to Ash', room_id:'room_restrictions', source_status:'DERIVED', sensitivity:'PRIVATE', confidence_posture:'HELD' },
  { id:'node_embargoed_item', type:'artifact', label:'Embargoed collection item', room_id:'room_embargo', source_status:'SUPPLIED', sensitivity:'RESTRICTED', confidence_posture:'HELD' },
  { id:'node_embargo_clock', type:'event', label:'Synthetic embargo review date', room_id:'room_embargo', source_status:'SUPPLIED', sensitivity:'PRIVATE', confidence_posture:'HELD' },
  { id:'node_review_gap', type:'evidence-gap', label:'No declassification decision exists', room_id:'room_embargo', source_status:'OBSERVED', sensitivity:'RESTRICTED', confidence_posture:'OPEN' },
  { id:'node_preservation_master', type:'artifact', label:'Preservation master manifest', room_id:'room_derivatives', source_status:'CONSTRUCTED', sensitivity:'RESTRICTED', confidence_posture:'HELD' },
  { id:'node_redaction_plan', type:'artifact', label:'Proposed redaction plan', room_id:'room_derivatives', source_status:'CONSTRUCTED', sensitivity:'PRIVATE', confidence_posture:'OPEN' },
  { id:'node_public_access_copy', type:'artifact', label:'Public access copy', room_id:'room_derivatives', source_status:'CONSTRUCTED', sensitivity:'PUBLIC', confidence_posture:'OPEN' },
  { id:'node_research_copy', type:'artifact', label:'Restricted research access copy', room_id:'room_access', source_status:'CONSTRUCTED', sensitivity:'RESTRICTED', confidence_posture:'OPEN' },
  { id:'node_access_approval_gap', type:'evidence-gap', label:'No access approval receipt exists', room_id:'room_access', source_status:'OBSERVED', sensitivity:'RESTRICTED', confidence_posture:'OPEN' },
  { id:'node_transfer_manifest', type:'artifact', label:'Delayed transfer manifest', room_id:'room_routes', source_status:'CONSTRUCTED', sensitivity:'PRIVATE', disclosure_state:'LOCAL', confidence_posture:'OPEN' },
  { id:'node_destination_hold', type:'evidence-gap', label:'Destination and recipient remain unconfirmed', room_id:'room_routes', source_status:'OBSERVED', sensitivity:'PRIVATE', disclosure_state:'LOCAL', confidence_posture:'OPEN' },
  { id:'node_action_anchor', type:'intended-action', label:'Anchor the original audio and record uncertainty', room_id:'room_next', source_status:'SUPPLIED', confidence_posture:'OPEN' },
  { id:'node_action_review', type:'intended-action', label:'Human-review restrictions, missing release, and embargo posture', room_id:'room_next', source_status:'SUPPLIED', confidence_posture:'OPEN' },
  { id:'node_action_prepare', type:'intended-action', label:'Prepare a bounded access copy without publication', room_id:'room_next', source_status:'SUPPLIED', confidence_posture:'OPEN' },
  { id:'node_action_transfer', type:'intended-action', label:'Hold transfer until destination authorization', room_id:'room_next', source_status:'SUPPLIED', confidence_posture:'OPEN' }
]);

const RELATIONSHIPS = Object.freeze([
  { id:'edge_note_scope', from:'node_accession_note', to:'node_scope_inventory', type:'describes', source_status:'SUPPLIED' },
  { id:'edge_audio_transcript', from:'node_original_audio', to:'node_transcript', type:'source-of', source_status:'CONSTRUCTED' },
  { id:'edge_transcript_edited', from:'node_transcript', to:'node_edited_transcript', type:'source-of-derivative', source_status:'CONSTRUCTED' },
  { id:'edge_photo_date', from:'node_photograph', to:'node_uncertain_date', type:'has-uncertain-date', source_status:'OBSERVED' },
  { id:'edge_photo_scan', from:'node_photograph', to:'node_duplicate_scan', type:'source-of-duplicate', source_status:'CONSTRUCTED' },
  { id:'edge_root_audio', from:'node_custody_root', to:'node_original_audio', type:'anchors', source_status:'SUPPLIED' },
  { id:'edge_root_photo', from:'node_custody_root', to:'node_photograph', type:'anchors', source_status:'SUPPLIED' },
  { id:'edge_root_ledger', from:'node_custody_root', to:'node_chain_ledger', type:'anchors', source_status:'SUPPLIED' },
  { id:'edge_restriction_audio', from:'node_donor_restriction', to:'node_original_audio', type:'restricts-access-to', source_status:'SUPPLIED' },
  { id:'edge_release_missing', from:'node_missing_release_form', to:'node_public_access_copy', type:'blocks-release-of', source_status:'OBSERVED' },
  { id:'edge_rights_photo', from:'node_third_party_rights', to:'node_photograph', type:'holds-rights-review-for', source_status:'OBSERVED' },
  { id:'edge_embargo_item', from:'node_embargo_clock', to:'node_embargoed_item', type:'holds-until-review', source_status:'SUPPLIED' },
  { id:'edge_review_embargo', from:'node_review_gap', to:'node_embargoed_item', type:'blocks-declassification-of', source_status:'OBSERVED' },
  { id:'edge_master_audio', from:'node_original_audio', to:'node_preservation_master', type:'preserved-by', source_status:'CONSTRUCTED' },
  { id:'edge_master_photo', from:'node_photograph', to:'node_preservation_master', type:'preserved-by', source_status:'CONSTRUCTED' },
  { id:'edge_redaction_access', from:'node_redaction_plan', to:'node_public_access_copy', type:'proposes', source_status:'CONSTRUCTED' },
  { id:'edge_authority_access', from:'node_release_authority', to:'node_public_access_copy', type:'holds-release-of', source_status:'DERIVED' },
  { id:'edge_copy_approval', from:'node_access_approval_gap', to:'node_research_copy', type:'blocks-access-to', source_status:'OBSERVED' },
  { id:'edge_copy_prepare', from:'node_research_copy', to:'node_action_prepare', type:'requires-human-review', source_status:'CONSTRUCTED' },
  { id:'edge_anchor_action', from:'node_original_audio', to:'node_action_anchor', type:'requires', source_status:'SUPPLIED' },
  { id:'edge_review_action', from:'node_missing_release_form', to:'node_action_review', type:'requires', source_status:'OBSERVED' },
  { id:'edge_manifest_destination', from:'node_transfer_manifest', to:'node_destination_hold', type:'held-by', source_status:'OBSERVED' },
  { id:'edge_destination_transfer', from:'node_destination_hold', to:'node_action_transfer', type:'requires', source_status:'OBSERVED' }
]);

const RULES = Object.freeze([
  { route_id:'route_internal_accession_review', allowed_room_ids:['room_accession','room_provenance','room_restrictions','room_next'], local_link_keys:['edge_note_scope','edge_audio_transcript','edge_root_audio'], allowed_node_types:['artifact','claim','evidence-gap','event','intended-action'] },
  { route_id:'route_restricted_research_copy', allowed_room_ids:['room_restrictions','room_embargo','room_derivatives','room_access'], local_link_keys:['edge_copy_approval','edge_master_audio'], allowed_node_types:['artifact','claim','evidence-gap','event'] },
  { route_id:'route_public_access_copy_review', allowed_room_ids:['room_restrictions','room_embargo','room_derivatives'], local_link_keys:['edge_release_missing','edge_authority_access','edge_redaction_access'], allowed_node_types:['artifact','claim','evidence-gap','event'] },
  { route_id:'route_delayed_transfer', allowed_room_ids:['room_accession','room_provenance','room_routes','room_next'], local_link_keys:['edge_manifest_destination'], allowed_node_types:['artifact','evidence-gap','intended-action'] }
]);

const ROUTES = Object.freeze([
  { entry_id:'route_archive_accession_01', draft_digest:digest('accession'), route_id:'route_internal_accession_review', purpose:'anchor-original-and-record-uncertainty', recipient_class:'archive-custodian', recorded_at:'2026-07-25T12:00:00Z', disclosed_opaque_references:['node_original_audio','node_transcript','node_uncertain_date'], recall_state:'NOT_RECALLED' },
  { entry_id:'route_archive_research_01', draft_digest:digest('research'), route_id:'route_restricted_research_copy', purpose:'prepare-restricted-access-copy', recipient_class:'approved-researcher-role', recorded_at:'2026-07-25T12:10:00Z', disclosed_opaque_references:['node_redaction_plan','node_research_copy','node_access_approval_gap'], recall_state:'NOT_RECALLED' },
  { entry_id:'route_archive_public_01', draft_digest:digest('public'), route_id:'route_public_access_copy_review', purpose:'review-public-access-copy-without-publication', recipient_class:'human-release-reviewer', recorded_at:'2026-07-25T12:20:00Z', disclosed_opaque_references:['node_public_access_copy','node_missing_release_form','node_release_authority'], recall_state:'NOT_RECALLED' },
  { entry_id:'route_archive_transfer_01', draft_digest:digest('transfer'), route_id:'route_delayed_transfer', purpose:'prepare-transfer-without-delivery', recipient_class:'unconfirmed-destination-custodian', recorded_at:'2026-07-25T12:30:00Z', disclosed_opaque_references:['node_transfer_manifest','node_destination_hold'], recall_state:'NOT_RECALLED' }
]);

const ARCHIVE_DEMO = Object.freeze({
  schema:ASH_ARCHIVE_ACCESSION_SCHEMA,
  profile:PROFILE,
  label:'Archive',
  demo_id:'demo_archive_harbor_memory_v1',
  title:'Harbor Memory Archive · mixed-media accession and access review',
  summary:'A synthetic mixed-media accession whose original audio, transcripts, photograph, uncertain date, duplicate scan, donor restriction, missing release, embargoed item, and access copies remain non-equivalent and human-gated.',
  rooms:ROOMS,
  nodes:NODES,
  relationships:RELATIONSHIPS,
  rules:RULES,
  routes:ROUTES,
  observations:Object.freeze([{ kind:'SYNTHETIC_HARBOR_MEMORY_ARCHIVE_FIXTURE', real_people:false, real_organizations:false, real_documents:false, real_events:false, access_granted:false, release_authorized:false, transfer_executed:false }]),
  missingness:Object.freeze(['No real collection or donor exists.','The photograph date remains uncertain.','The release form is missing.','No access approval or declassification decision exists.','No destination or recipient is authorized.']),
  alternatives:Object.freeze(['the uncertain date may remain unresolved','the donor restriction may require continued closure','the edited transcript may remain narrower than the original audio','the public access copy may remain unapproved','transfer may remain local indefinitely']),
  assay:Object.freeze({
    source_status:'CONSTRUCTED',
    accession_scope_declared:true,
    mixed_media_fixture_complete:true,
    original_derivative_lineage_visible:true,
    provenance_gaps_preserved:true,
    restrictions_interpreted_automatically:false,
    access_copy_created_automatically:false,
    release_authority:false,
    transfer_authority:false,
    claim_ceiling:'SYNTHETIC_HARBOR_MEMORY_ARCHIVE_AND_INTERFACE_HYDRATION_ONLY__NO_OWNERSHIP_AUTHENTICITY_ACCESS_GRANT_RELEASE_DECLASSIFICATION_PUBLICATION_OR_TRANSFER_AUTHORITY'
  }),
  defaults:Object.freeze({
    reader_class:'deterministic-baseline',
    test_refs:['node_original_audio','node_transcript','node_edited_transcript','node_photograph','node_uncertain_date','node_duplicate_scan','node_donor_restriction','node_missing_release_form','node_embargoed_item','node_public_access_copy'],
    route:{ id:'route_restricted_research_copy', recipient_class:'approved-researcher-role', purpose:'prepare-restricted-access-copy', digest:digest('bounded-copy'), refs:['node_redaction_plan','node_research_copy','node_access_approval_gap'] },
    draft:{ route:'route_public_access_copy_review', recipient_class:'human-release-reviewer', purpose:'review-public-access-copy-without-publication', version:'1', refs:['node_public_access_copy','node_missing_release_form','node_release_authority'], body:'Synthetic Harbor Memory review draft: anchor the original audio, preserve transcript and photograph lineage, retain date uncertainty, donor restriction, missing release, and embargo, and withhold access, publication, declassification, or transfer until a qualified human supplies explicit authority.' },
    provider_task:'Anchor one original, record uncertainty, inspect version lineage and restrictions, and prepare only a bounded access copy without publication or transfer.',
    protected_literals:['original audio recording','donor restriction text','missing release form','preservation master digest','complete transfer ledger'],
    save_questions:['Which object anchors the collection?','Which date remains uncertain?','Which derivative can be prepared without publication?','Which restriction or release evidence is still absent?'],
    save_next:['Anchor the original audio.','Preserve transcript and photograph lineage.','Record the uncertain date and duplicate scan.','Human-review donor restriction, missing release, and embargo.','Prepare only a bounded access copy.','Keep transfer held until destination authorization.'],
    research_notes:'Synthetic Harbor Memory Archive specimen. Ash stages accession, provenance, derivatives, date uncertainty, restrictions, access-copy review, and transfer preparation. It performs no access grant, authenticity finding, declassification, publication, export, destination handoff, or custody transfer.',
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
  throw new Error('Ash Keep did not reach Harbor Memory Archive readiness.');
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
  section.innerHTML = `<h3>Harbor Memory Archive<small>mixed-media accession · synthetic only · human authority required</small></h3><p>${ARCHIVE_DEMO.summary}</p><div class="apeq-paia-docket-metrics"><b>rooms · ${ROOMS.length}</b><b>objects · ${NODES.length}</b><b>relations · ${RELATIONSHIPS.length}</b><b>routes · ${ROUTES.length}</b></div><p><strong>NOTICE:</strong> one collection, non-identical provenance, rights, and access posture.</p><p><strong>ACT:</strong> anchor the original audio and record what remains uncertain.</p><p><strong>WORLD ANSWERS:</strong> original → transcript → edited transcript; photograph → uncertain date + duplicate scan; donor restriction + missing release; embargo; public access copy; preservation and delayed-transfer routes.</p><p><strong>REST:</strong> the collection remains local. Nothing has been published.</p><details><summary>What remains held</summary><ul><li>Authenticity, ownership, donor intent, access approval, declassification, and publication</li><li>Donor-restriction and third-party-rights interpretation</li><li>Destination authorization and custody transfer</li></ul></details><p class="apeq-paia-ceiling">Claim ceiling · synthetic Harbor Memory accession only · no ownership, authenticity, access grant, release, declassification, publication, or transfer authority</p>`;
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
    privateChronology:['mixed-media accession offered','original audio anchored','transcript lineage recorded','photograph date held uncertain','duplicate scan identified','restriction and missing release preserved','embargo review held','public access copy withheld','transfer held for destination authority'],
    intendedActions:NODES.filter(node => node.type === 'intended-action').map(node => node.label),
    sourceStatus:'SIMULATED',
    evidenceBasis:['synthetic Harbor Memory mixed-media Archive fixture'],
    observations:['No real collection, donor, repository, speaker, researcher, destination, or document is represented.'],
    missingness:[...ARCHIVE_DEMO.missingness],
    alternatives:[...ARCHIVE_DEMO.alternatives],
    openQuestions:['Which object anchors the collection?','Which date remains uncertain?','Who may interpret the restriction?','Which access copy may be prepared without publication?','Which destination evidence remains absent?'],
    operatorNotes:[MARKER, `demo_id:${ARCHIVE_DEMO.demo_id}`, 'claim_ceiling:no_ownership_authenticity_access_release_declassification_publication_or_transfer_authority']
  });
  const roomRules = await compileRoomRules({ caseId:caseMap.case_id, rules:RULES, sourceStatus:'SIMULATED' });
  const routeMemory = await compileRouteMemory({
    caseId:caseMap.case_id,
    entries:ROUTES,
    operatorDeclaredAssumptions:['The original audio is not its transcript.','The transcript is not the edited transcript.','A duplicate scan is not a second original.','A public access copy is not publication approval.','A transfer manifest is not destination authorization.'],
    unknown:['photograph date','release-form status','restriction interpretation','third-party rights posture','embargo review outcome','destination identity and recipient authority'],
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
      mixed_media_fixture_complete:true,
      access_granted:false,
      release_authorized:false,
      declassification_authorized:false,
      publication_authorized:false,
      transfer_executed:false
    }
  }));
  setTimeout(() => host.__td613AshPremiumUI?.open?.('map'), 0);
  if (status) status.innerHTML = '<strong>Harbor Memory Archive hydrated.</strong> Original/derivative lineage, date uncertainty, restriction, missing release, embargo, access-copy, and transfer boundaries remain synthetic and human-gated.';
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
    authority:Object.freeze({ ownership:false, authenticity:false, access_granted:false, release_authority:false, declassification_authority:false, publication_authority:false, transfer_authority:false, raw_content_transport:false, human_review_required:true })
  });
  documentRef.documentElement.dataset.ashArchiveDemo = ASH_ARCHIVE_DEMO_VERSION;
  return true;
}

if (doc && host) installArchiveDemo(doc, host);
