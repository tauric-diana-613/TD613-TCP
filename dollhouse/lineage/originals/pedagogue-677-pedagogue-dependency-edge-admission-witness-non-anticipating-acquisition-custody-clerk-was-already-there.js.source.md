import {
  evaluateDependencyEdgeAdmissionWitnessCustody,
  makeSyntheticWitnessedDependencyEdgeAdmissionRecord,
  makeSyntheticDependencyEdgeAdmissionWitnessRecord,
  runPedagoguePermitPrinterGauntlet
} from './pedagogue-dependency-edge-admission-witness-custody-permit-printer.js';
import {
  makeSyntheticDependencyEdgeCandidate,
  materialDependencyEdgeFingerprint
} from './pedagogue-dependency-edge-admission-provenance-custody-unlicensed-electrician.js';
import { makeSyntheticWarrantSupportLineage } from './pedagogue-anchor-dependent-warrant-revocation-custody-borrowed-light.js';

export const PEDAGOGUE_DEPENDENCY_EDGE_ADMISSION_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY_SCHEMA =
  'td613.pedagogue.dependency-edge-admission-witness-non-anticipating-acquisition-custody-hostile/v0.1';

const acquisitionEpisodes = new WeakMap();
const admissionProposals = new WeakMap();
let protocolSequence = 0;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function acquireDependencyEdgeAdmissionWitnessEpisode({ admission_witness_ledger = [] } = {}) {
  const acquisitionSequence = ++protocolSequence;
  const episode = deepFreeze({
    schema: `${PEDAGOGUE_DEPENDENCY_EDGE_ADMISSION_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY_SCHEMA}/acquisition-episode`,
    acquisition_sequence: acquisitionSequence,
    episode_label: `ADMISSION_WITNESS_ACQUISITION_${acquisitionSequence}`,
    admission_witness_ledger: clone(admission_witness_ledger)
  });
  acquisitionEpisodes.set(episode, deepFreeze({
    acquisition_sequence: acquisitionSequence,
    witness_material: stable(episode.admission_witness_ledger),
    admission_witness_ledger: clone(episode.admission_witness_ledger)
  }));
  return episode;
}

export function createDependencyEdgeAdmissionProposal({
  proposal_id = null,
  warrants = [],
  dependency_edges = [],
  admission_ledger = [],
  endpoint_status_snapshots = []
} = {}) {
  const proposalSequence = ++protocolSequence;
  const proposal = deepFreeze({
    schema: `${PEDAGOGUE_DEPENDENCY_EDGE_ADMISSION_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY_SCHEMA}/admission-proposal`,
    proposal_sequence: proposalSequence,
    proposal_id: proposal_id ?? `ADMISSION_PROPOSAL_${proposalSequence}`,
    warrants: clone(warrants),
    dependency_edges: clone(dependency_edges),
    admission_ledger: clone(admission_ledger),
    endpoint_status_snapshots: clone(endpoint_status_snapshots)
  });
  admissionProposals.set(proposal, deepFreeze({
    proposal_sequence: proposalSequence,
    proposal_material: stable({
      warrants: proposal.warrants,
      dependency_edges: proposal.dependency_edges,
      admission_ledger: proposal.admission_ledger,
      endpoint_status_snapshots: proposal.endpoint_status_snapshots
    })
  }));
  return proposal;
}

export function requestSealedDependencyAdmissionWitnessAcquisitionMutation(episode, replacement) {
  if (!acquisitionEpisodes.has(episode)) {
    return deepFreeze({ status: 'REFUSE_UNRECOGNIZED_DEPENDENCY_EDGE_ADMISSION_WITNESS_ACQUISITION_EPISODE', mutated: false });
  }
  return deepFreeze({
    status: 'SEALED_DEPENDENCY_EDGE_ADMISSION_WITNESS_ACQUISITION_EPISODE_IMMUTABLE',
    mutated: false,
    requested_replacement: clone(replacement ?? null)
  });
}

export function requestSealedDependencyEdgeAdmissionProposalMutation(proposal, replacement) {
  if (!admissionProposals.has(proposal)) {
    return deepFreeze({ status: 'REFUSE_UNRECOGNIZED_DEPENDENCY_EDGE_ADMISSION_PROPOSAL', mutated: false });
  }
  return deepFreeze({
    status: 'SEALED_DEPENDENCY_EDGE_ADMISSION_PROPOSAL_IMMUTABLE',
    mutated: false,
    requested_replacement: clone(replacement ?? null)
  });
}

function e6W2(result) {
  return result?.e5_filtered?.e4_result?.warrant_results?.W2?.status ?? null;
}

function admissionStatus(result, admissionId) {
  return result?.admission_evaluations?.find(item => item.admission_id === admissionId)?.status ?? null;
}

export function evaluateNonAnticipatingDependencyEdgeAdmissionWitnessCustody({
  acquisition_episodes = [],
  admission_proposal = null
} = {}) {
  const proposalMeta = admission_proposal && admissionProposals.get(admission_proposal);
  if (!proposalMeta) {
    return deepFreeze({
      schema: PEDAGOGUE_DEPENDENCY_EDGE_ADMISSION_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY_SCHEMA,
      candidate: 'E7_DEPENDENCY_EDGE_ADMISSION_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY',
      status: 'REFUSE_UNRECOGNIZED_DEPENDENCY_EDGE_ADMISSION_PROPOSAL',
      admitted: false,
      episode_evaluations: [],
      non_anticipating_protocol_order_identified: false,
      promotion_authority: false
    });
  }

  const episodeEvaluations = [];
  const recognizedEpisodes = [];
  const preProposalEpisodes = [];
  for (const episode of acquisition_episodes) {
    const meta = episode && acquisitionEpisodes.get(episode);
    if (!meta) {
      episodeEvaluations.push(deepFreeze({
        status: 'REFUSE_UNRECOGNIZED_DEPENDENCY_EDGE_ADMISSION_WITNESS_ACQUISITION_EPISODE',
        recognized: false,
        acquired_before_proposal: false,
        acquisition_sequence: null
      }));
      continue;
    }
    recognizedEpisodes.push(meta);
    const acquiredBeforeProposal = meta.acquisition_sequence < proposalMeta.proposal_sequence;
    if (acquiredBeforeProposal) preProposalEpisodes.push(meta);
    episodeEvaluations.push(deepFreeze({
      status: acquiredBeforeProposal
        ? 'ADMIT_PRE_PROPOSAL_DEPENDENCY_EDGE_ADMISSION_WITNESS_ACQUISITION_EPISODE'
        : 'REFUSE_POST_PROPOSAL_DEPENDENCY_EDGE_ADMISSION_WITNESS',
      recognized: true,
      acquired_before_proposal: acquiredBeforeProposal,
      acquisition_sequence: meta.acquisition_sequence,
      proposal_sequence: proposalMeta.proposal_sequence
    }));
  }

  const rawWitnessLedger = recognizedEpisodes.flatMap(meta => clone(meta.admission_witness_ledger));
  const preProposalWitnessLedger = preProposalEpisodes.flatMap(meta => clone(meta.admission_witness_ledger));

  const rawE6 = evaluateDependencyEdgeAdmissionWitnessCustody({
    warrants: admission_proposal.warrants,
    dependency_edges: admission_proposal.dependency_edges,
    admission_ledger: admission_proposal.admission_ledger,
    admission_witness_ledger: rawWitnessLedger,
    endpoint_status_snapshots: admission_proposal.endpoint_status_snapshots
  });
  const filteredE6 = evaluateDependencyEdgeAdmissionWitnessCustody({
    warrants: admission_proposal.warrants,
    dependency_edges: admission_proposal.dependency_edges,
    admission_ledger: admission_proposal.admission_ledger,
    admission_witness_ledger: preProposalWitnessLedger,
    endpoint_status_snapshots: admission_proposal.endpoint_status_snapshots
  });

  const anyUnrecognized = episodeEvaluations.some(item => !item.recognized);
  const anyPostProposal = episodeEvaluations.some(item =>
    item.status === 'REFUSE_POST_PROPOSAL_DEPENDENCY_EDGE_ADMISSION_WITNESS');
  const noDependencyEdge = admission_proposal.dependency_edges.length === 0;
  const filteredHasWitnessedPermit = filteredE6.witnessed_permit_count > 0;

  let status;
  let admitted = false;
  if (anyUnrecognized) {
    status = 'REFUSE_UNRECOGNIZED_DEPENDENCY_EDGE_ADMISSION_WITNESS_ACQUISITION_EPISODE';
  } else if (noDependencyEdge) {
    status = 'NO_DEPENDENCY_EDGE_NO_TRANSITIVE_CONSEQUENCE';
  } else if (filteredHasWitnessedPermit) {
    status = 'ADMIT_NON_ANTICIPATING_DEPENDENCY_EDGE_ADMISSION_WITNESS';
    admitted = true;
  } else if (anyPostProposal && rawE6.witnessed_permit_count > filteredE6.witnessed_permit_count) {
    status = 'REFUSE_POST_PROPOSAL_DEPENDENCY_EDGE_ADMISSION_WITNESS';
  } else {
    status = filteredE6.admission_evaluations[0]?.status ?? 'REFUSE_NO_ADMISSIBLE_DEPENDENCY_EDGE_ADMISSION_WITNESS';
  }

  const sequenceDistances = episodeEvaluations
    .filter(item => item.recognized && item.acquired_before_proposal)
    .map(item => item.proposal_sequence - item.acquisition_sequence);

  return deepFreeze({
    schema: PEDAGOGUE_DEPENDENCY_EDGE_ADMISSION_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY_SCHEMA,
    candidate: 'E7_DEPENDENCY_EDGE_ADMISSION_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY',
    status,
    admitted,
    proposal_sequence: proposalMeta.proposal_sequence,
    episode_evaluations: episodeEvaluations,
    raw_e6_result: rawE6,
    filtered_e6_result: filteredE6,
    raw_e6_witnessed_permit_count: rawE6.witnessed_permit_count,
    filtered_e6_witnessed_permit_count: filteredE6.witnessed_permit_count,
    current_state_fingerprint: filteredE6.current_state_fingerprint,
    pre_proposal_witness_material_fingerprint: stable(preProposalWitnessLedger),
    sequence_distances: sequenceDistances,
    non_anticipating_protocol_order_identified: preProposalEpisodes.length > 0,
    proposal_id_authority: false,
    witness_identifier_is_authority: false,
    admission_identifier_is_authority: false,
    serialization_order_is_authority: false,
    sequence_distance_is_confidence: false,
    non_anticipation_relative_to_internal_proposal_only: true,
    external_physical_acquisition_time_claim: false,
    source_honesty_claim: false,
    unbiased_sampling_claim: false,
    institutional_independence_claim: false,
    real_world_chronology_claim: false,
    scalar_aggregation_used: false,
    promotion_authority: false,
    product_mutation: false,
    shared_pedagogue_engine_mutation: false,
    workflow_mutation: false,
    browser_execution: false,
    merge_performed: false,
    deployment_performed: false,
    release_authority: false,
    vercel_release_requires_issue_405_and_new_explicit_operator_gesture: true
  });
}

function independentLineage(warrantKey, supportKey = `SUPPORT_${warrantKey}`) {
  return makeSyntheticWarrantSupportLineage({
    lineage_id: `LINEAGE_${warrantKey}`,
    warrant_key: warrantKey,
    support_kind: 'INDEPENDENT_DECLARED_SUPPORT',
    active: true,
    independent_support_key: supportKey
  });
}

function node(warrantKey, lawful = false) {
  const supportKey = `SUPPORT_${warrantKey}`;
  return {
    warrant_key: warrantKey,
    requested_target: 'TARGET:ALPHA',
    requested_field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL',
    current_epoch: 3,
    revisions: [],
    support_lineages: lawful ? [independentLineage(warrantKey, supportKey)] : [],
    active_independent_support_keys: lawful ? [supportKey] : []
  };
}

function baseWarrants() {
  return [node('W1', true), node('W2')];
}

function edge(id = 'EDGE', admissionIds = ['PERMIT'], overrides = {}) {
  return makeSyntheticDependencyEdgeCandidate({
    edge_id: id,
    from_warrant_key: 'W1',
    to_warrant_key: 'W2',
    active: true,
    dependency_kind: 'WARRANT_SUPPORT_DEPENDENCY',
    scope_fingerprint: 'SCOPE:ALPHA',
    admission_record_ids: admissionIds,
    ...overrides
  });
}

function permitFor(candidateEdge, admissionId = 'PERMIT', overrides = {}) {
  return makeSyntheticWitnessedDependencyEdgeAdmissionRecord({
    admission_id: admissionId,
    material_edge_fingerprint: materialDependencyEdgeFingerprint(candidateEdge),
    admission_kind: 'DEPENDENCY_EDGE_ADMISSION',
    active: true,
    revoked: false,
    issuance_event_fingerprint: `ISSUANCE:${admissionId}`,
    witness_record_ids: [`WITNESS:${admissionId}`],
    claimed_witnessed: false,
    ...overrides
  });
}

function witnessFor(candidateEdge, permit, witnessId = `WITNESS:${permit.admission_id}`, overrides = {}) {
  return makeSyntheticDependencyEdgeAdmissionWitnessRecord({
    witness_id: witnessId,
    witness_kind: 'DEPENDENCY_EDGE_ADMISSION_OBSERVED',
    issuance_event_fingerprint: permit.issuance_event_fingerprint,
    material_edge_fingerprint: materialDependencyEdgeFingerprint(candidateEdge),
    revoked: false,
    ...overrides
  });
}

function proposalFor(candidateEdge, permits, proposalId = null) {
  return createDependencyEdgeAdmissionProposal({
    proposal_id: proposalId,
    warrants: baseWarrants(),
    dependency_edges: candidateEdge ? [candidateEdge] : [],
    admission_ledger: permits ?? []
  });
}

function ca01() {
  const candidateEdge = edge('CA01_EDGE', ['CA01_PERMIT']);
  const permit = permitFor(candidateEdge, 'CA01_PERMIT');
  const witness = witnessFor(candidateEdge, permit);

  const preAcquisition = acquireDependencyEdgeAdmissionWitnessEpisode({ admission_witness_ledger: [witness] });
  const preProposal = proposalFor(candidateEdge, [permit], 'CA01_PRE_PROPOSAL');
  const preResult = evaluateNonAnticipatingDependencyEdgeAdmissionWitnessCustody({
    acquisition_episodes: [preAcquisition], admission_proposal: preProposal
  });

  const postProposal = proposalFor(candidateEdge, [permit], 'CA01_POST_PROPOSAL');
  const postAcquisition = acquireDependencyEdgeAdmissionWitnessEpisode({ admission_witness_ledger: [witness] });
  const postRawE6 = evaluateDependencyEdgeAdmissionWitnessCustody({
    warrants: postProposal.warrants,
    dependency_edges: postProposal.dependency_edges,
    admission_ledger: postProposal.admission_ledger,
    admission_witness_ledger: postAcquisition.admission_witness_ledger
  });
  const postResult = evaluateNonAnticipatingDependencyEdgeAdmissionWitnessCustody({
    acquisition_episodes: [postAcquisition], admission_proposal: postProposal
  });

  const insufficiencyEstablished =
    postRawE6.witnessed_permit_count === 1 &&
    e6W2(postRawE6) === 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT' &&
    preResult.status === 'ADMIT_NON_ANTICIPATING_DEPENDENCY_EDGE_ADMISSION_WITNESS' &&
    preResult.admitted === true &&
    postResult.status === 'REFUSE_POST_PROPOSAL_DEPENDENCY_EDGE_ADMISSION_WITNESS' &&
    postResult.admitted === false &&
    e6W2(postResult.filtered_e6_result) === 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT';

  return deepFreeze({
    case_id: 'CA01_CLERK_WAS_ALREADY_THERE',
    candidateEdge, permit, witness,
    preAcquisition, preProposal, preResult,
    postProposal, postAcquisition, postRawE6, postResult,
    inherited_e6_insufficiency_established: insufficiencyEstablished
  });
}

function ca02(ca01Room) {
  const counterfeit = deepFreeze(clone(ca01Room.preAcquisition));
  const directE6 = evaluateDependencyEdgeAdmissionWitnessCustody({
    warrants: ca01Room.preProposal.warrants,
    dependency_edges: ca01Room.preProposal.dependency_edges,
    admission_ledger: ca01Room.preProposal.admission_ledger,
    admission_witness_ledger: counterfeit.admission_witness_ledger
  });
  const result = evaluateNonAnticipatingDependencyEdgeAdmissionWitnessCustody({
    acquisition_episodes: [counterfeit], admission_proposal: ca01Room.preProposal
  });
  return deepFreeze({
    case_id: 'CA02_PHOTOCOPIED_INTAKE_TICKET', counterfeit, directE6, result,
    visible_fields_equal: stable(counterfeit) === stable(ca01Room.preAcquisition)
  });
}

function ca03(ca01Room) {
  const mutation = requestSealedDependencyAdmissionWitnessAcquisitionMutation(
    ca01Room.preAcquisition,
    { admission_witness_ledger: [] }
  );
  return deepFreeze({
    case_id: 'CA03_ERASED_INTAKE_BOOK', mutation,
    episode_still_frozen: Object.isFrozen(ca01Room.preAcquisition),
    ledger_still_frozen: Object.isFrozen(ca01Room.preAcquisition.admission_witness_ledger)
  });
}

function ca04(ca01Room) {
  const renamedProposal = createDependencyEdgeAdmissionProposal({
    proposal_id: 'CA04_RENAMED_PROPOSAL_ONLY',
    warrants: ca01Room.preProposal.warrants,
    dependency_edges: ca01Room.preProposal.dependency_edges,
    admission_ledger: ca01Room.preProposal.admission_ledger
  });
  const result = evaluateNonAnticipatingDependencyEdgeAdmissionWitnessCustody({
    acquisition_episodes: [ca01Room.preAcquisition], admission_proposal: renamedProposal
  });
  return deepFreeze({
    case_id: 'CA04_PROPOSAL_NUMBER_CHANGED', renamedProposal, result,
    current_state_equal: result.current_state_fingerprint === ca01Room.preResult.current_state_fingerprint,
    status_equal: result.status === ca01Room.preResult.status
  });
}

function ca05() {
  const aEdge = edge('CA05_EDGE_A', ['CA05_PERMIT_A']);
  const aPermit = permitFor(aEdge, 'CA05_PERMIT_A', {
    issuance_event_fingerprint: 'ISSUANCE:CA05_STABLE', witness_record_ids: ['CA05_W_A']
  });
  const aWitness = witnessFor(aEdge, aPermit, 'CA05_W_A');
  const aAcquisition = acquireDependencyEdgeAdmissionWitnessEpisode({ admission_witness_ledger: [aWitness] });
  const aProposal = proposalFor(aEdge, [aPermit], 'CA05_PROPOSAL_A');
  const a = evaluateNonAnticipatingDependencyEdgeAdmissionWitnessCustody({ acquisition_episodes: [aAcquisition], admission_proposal: aProposal });

  const bEdge = edge('CA05_EDGE_Z', ['CA05_PERMIT_Z']);
  const bPermit = permitFor(bEdge, 'CA05_PERMIT_Z', {
    issuance_event_fingerprint: 'ISSUANCE:CA05_STABLE', witness_record_ids: ['CA05_W_Z']
  });
  const bWitness = witnessFor(bEdge, bPermit, 'CA05_W_Z');
  const bAcquisition = acquireDependencyEdgeAdmissionWitnessEpisode({ admission_witness_ledger: [bWitness] });
  const bProposal = proposalFor(bEdge, [bPermit], 'CA05_PROPOSAL_Z');
  const b = evaluateNonAnticipatingDependencyEdgeAdmissionWitnessCustody({ acquisition_episodes: [bAcquisition], admission_proposal: bProposal });

  return deepFreeze({
    case_id: 'CA05_BADGE_NUMBERS_CHANGED', a, b,
    current_state_equal: a.current_state_fingerprint === b.current_state_fingerprint,
    status_equal: a.status === b.status,
    material_edge_equal: materialDependencyEdgeFingerprint(aEdge) === materialDependencyEdgeFingerprint(bEdge)
  });
}

function ca06() {
  const candidateEdge = edge('CA06_ORDER_EDGE', ['CA06_P1', 'CA06_P2']);
  const p1 = permitFor(candidateEdge, 'CA06_P1', { witness_record_ids: ['CA06_W1'] });
  const p2 = permitFor(candidateEdge, 'CA06_P2', { witness_record_ids: ['CA06_W2'] });
  const w1 = witnessFor(candidateEdge, p1, 'CA06_W1');
  const w2 = witnessFor(candidateEdge, p2, 'CA06_W2');
  const forwardAcquisition = acquireDependencyEdgeAdmissionWitnessEpisode({ admission_witness_ledger: [w1, w2] });
  const forwardProposal = proposalFor(candidateEdge, [p1, p2], 'CA06_FORWARD');
  const forward = evaluateNonAnticipatingDependencyEdgeAdmissionWitnessCustody({ acquisition_episodes: [forwardAcquisition], admission_proposal: forwardProposal });

  const reverseEdge = makeSyntheticDependencyEdgeCandidate({ ...clone(candidateEdge), admission_record_ids: [...candidateEdge.admission_record_ids].reverse() });
  const reverseAcquisition = acquireDependencyEdgeAdmissionWitnessEpisode({ admission_witness_ledger: [w2, w1] });
  const reverseProposal = createDependencyEdgeAdmissionProposal({
    proposal_id: 'CA06_REVERSE',
    warrants: [...baseWarrants()].reverse(),
    dependency_edges: [reverseEdge],
    admission_ledger: [p2, p1]
  });
  const reverse = evaluateNonAnticipatingDependencyEdgeAdmissionWitnessCustody({ acquisition_episodes: [reverseAcquisition], admission_proposal: reverseProposal });
  return deepFreeze({
    case_id: 'CA06_FOLDER_REORDERED', forward, reverse,
    current_state_equal: forward.current_state_fingerprint === reverse.current_state_fingerprint,
    status_equal: forward.status === reverse.status
  });
}

function ca07(ca01Room) {
  const proposal = createDependencyEdgeAdmissionProposal({
    proposal_id: 'CA07_EMPTY',
    warrants: baseWarrants(),
    dependency_edges: [],
    admission_ledger: []
  });
  const result = evaluateNonAnticipatingDependencyEdgeAdmissionWitnessCustody({
    acquisition_episodes: [ca01Room.preAcquisition], admission_proposal: proposal
  });
  return deepFreeze({ case_id: 'CA07_EMPTY_PERMIT_FOLDER', proposal, result });
}

function ca08() {
  const candidateEdge = edge('CA08_EDGE', ['CA08_PERMIT']);
  const permit = permitFor(candidateEdge, 'CA08_PERMIT');
  const wrongWitness = witnessFor(candidateEdge, permit, 'WITNESS:CA08_PERMIT', {
    issuance_event_fingerprint: 'ISSUANCE:ANOTHER_PERMIT'
  });
  const acquisition = acquireDependencyEdgeAdmissionWitnessEpisode({ admission_witness_ledger: [wrongWitness] });
  const proposal = proposalFor(candidateEdge, [permit], 'CA08_PROPOSAL');
  const result = evaluateNonAnticipatingDependencyEdgeAdmissionWitnessCustody({ acquisition_episodes: [acquisition], admission_proposal: proposal });
  return deepFreeze({ case_id: 'CA08_EARLY_BUT_WRONG_CLERK', result });
}

function ca09() {
  const candidateEdge = edge('CA09_EDGE', ['CA09_PERMIT']);
  const permit = permitFor(candidateEdge, 'CA09_PERMIT');
  const revokedWitness = witnessFor(candidateEdge, permit, 'WITNESS:CA09_PERMIT', { revoked: true });
  const acquisition = acquireDependencyEdgeAdmissionWitnessEpisode({ admission_witness_ledger: [revokedWitness] });
  const proposal = proposalFor(candidateEdge, [permit], 'CA09_PROPOSAL');
  const result = evaluateNonAnticipatingDependencyEdgeAdmissionWitnessCustody({ acquisition_episodes: [acquisition], admission_proposal: proposal });
  return deepFreeze({ case_id: 'CA09_EARLY_BUT_RECANTED_CLERK', result });
}

function ca10() {
  const candidateEdge = edge('CA10_EDGE', ['CA10_REAL', 'CA10_FAKE']);
  const realPermit = permitFor(candidateEdge, 'CA10_REAL', { witness_record_ids: ['CA10_REAL_W'] });
  const fakePermit = permitFor(candidateEdge, 'CA10_FAKE', { witness_record_ids: ['CA10_FAKE_W'] });
  const realWitness = witnessFor(candidateEdge, realPermit, 'CA10_REAL_W');
  const fakeWitness = witnessFor(candidateEdge, fakePermit, 'CA10_FAKE_W');
  const preAcquisition = acquireDependencyEdgeAdmissionWitnessEpisode({ admission_witness_ledger: [realWitness] });
  const proposal = proposalFor(candidateEdge, [realPermit, fakePermit], 'CA10_MIXED_PROPOSAL');
  const postAcquisition = acquireDependencyEdgeAdmissionWitnessEpisode({ admission_witness_ledger: [fakeWitness] });
  const result = evaluateNonAnticipatingDependencyEdgeAdmissionWitnessCustody({
    acquisition_episodes: [preAcquisition, postAcquisition], admission_proposal: proposal
  });
  return deepFreeze({
    case_id: 'CA10_ONE_EARLY_CLERK_ONE_LATE_PLANT', result,
    real_status: admissionStatus(result.filtered_e6_result, 'CA10_REAL'),
    fake_status: admissionStatus(result.filtered_e6_result, 'CA10_FAKE')
  });
}

function ca11() {
  const candidateEdge = edge('CA11_EDGE', ['CA11_PERMIT']);
  const permit = permitFor(candidateEdge, 'CA11_PERMIT');
  const witness = witnessFor(candidateEdge, permit);

  const closeAcquisition = acquireDependencyEdgeAdmissionWitnessEpisode({ admission_witness_ledger: [witness] });
  const closeProposal = proposalFor(candidateEdge, [permit], 'CA11_CLOSE');
  const close = evaluateNonAnticipatingDependencyEdgeAdmissionWitnessCustody({ acquisition_episodes: [closeAcquisition], admission_proposal: closeProposal });

  const farAcquisition = acquireDependencyEdgeAdmissionWitnessEpisode({ admission_witness_ledger: [witness] });
  for (let index = 0; index < 5; index += 1) {
    createDependencyEdgeAdmissionProposal({ proposal_id: `CA11_DUMMY_${index}` });
  }
  const farProposal = proposalFor(candidateEdge, [permit], 'CA11_FAR');
  const far = evaluateNonAnticipatingDependencyEdgeAdmissionWitnessCustody({ acquisition_episodes: [farAcquisition], admission_proposal: farProposal });
  return deepFreeze({
    case_id: 'CA11_LONG_HALLWAY', close, far,
    current_state_equal: close.current_state_fingerprint === far.current_state_fingerprint,
    status_equal: close.status === far.status,
    far_distance_greater: far.sequence_distances[0] > close.sequence_distances[0]
  });
}

function ca12() {
  const candidateEdge = edge('CA12_EDGE', ['CA12_PERMIT']);
  const permit = permitFor(candidateEdge, 'CA12_PERMIT');
  const witness = witnessFor(candidateEdge, permit);
  const acquisition = acquireDependencyEdgeAdmissionWitnessEpisode({ admission_witness_ledger: [witness] });
  const proposal = proposalFor(candidateEdge, [permit], 'CA12_PROPOSAL');
  const result = evaluateNonAnticipatingDependencyEdgeAdmissionWitnessCustody({ acquisition_episodes: [acquisition], admission_proposal: proposal });
  const directE6 = evaluateDependencyEdgeAdmissionWitnessCustody({
    warrants: proposal.warrants,
    dependency_edges: proposal.dependency_edges,
    admission_ledger: proposal.admission_ledger,
    admission_witness_ledger: acquisition.admission_witness_ledger
  });
  const mutation = requestSealedDependencyEdgeAdmissionProposalMutation(proposal, { dependency_edges: [] });
  return deepFreeze({
    case_id: 'CA12_LOCKED_PROPOSAL_FOLDER', result, directE6, mutation,
    proposal_still_frozen: Object.isFrozen(proposal),
    current_state_equal: result.current_state_fingerprint === directE6.current_state_fingerprint
  });
}

export function runPedagogueClerkWasAlreadyThereGauntlet() {
  const e6 = runPedagoguePermitPrinterGauntlet();
  const room01 = ca01();
  const rooms = deepFreeze({
    ca01: room01,
    ca02: ca02(room01),
    ca03: ca03(room01),
    ca04: ca04(room01),
    ca05: ca05(),
    ca06: ca06(),
    ca07: ca07(room01),
    ca08: ca08(),
    ca09: ca09(),
    ca10: ca10(),
    ca11: ca11(),
    ca12: ca12()
  });

  const inheritedInsufficiencyEstablished = rooms.ca01.inherited_e6_insufficiency_established === true;
  const defeatConditions = [];

  if (!inheritedInsufficiencyEstablished) defeatConditions.push('E6_WITNESS_ACQUISITION_ORDER_INSUFFICIENCY_NOT_ESTABLISHED');
  if (
    rooms.ca01.preResult.status !== 'ADMIT_NON_ANTICIPATING_DEPENDENCY_EDGE_ADMISSION_WITNESS' ||
    rooms.ca01.preResult.admitted !== true ||
    rooms.ca01.postResult.status !== 'REFUSE_POST_PROPOSAL_DEPENDENCY_EDGE_ADMISSION_WITNESS' ||
    rooms.ca01.postResult.admitted !== false
  ) defeatConditions.push('POST_PROPOSAL_WITNESS_RETAINS_E7_AUTHORITY');
  if (
    !rooms.ca02.visible_fields_equal ||
    rooms.ca02.directE6.witnessed_permit_count !== 1 ||
    rooms.ca02.result.status !== 'REFUSE_UNRECOGNIZED_DEPENDENCY_EDGE_ADMISSION_WITNESS_ACQUISITION_EPISODE'
  ) defeatConditions.push('VISIBLE_EPISODE_CLONE_INHERITS_PROTOCOL_AUTHORITY');
  if (
    rooms.ca03.mutation.status !== 'SEALED_DEPENDENCY_EDGE_ADMISSION_WITNESS_ACQUISITION_EPISODE_IMMUTABLE' ||
    rooms.ca03.mutation.mutated || !rooms.ca03.episode_still_frozen || !rooms.ca03.ledger_still_frozen
  ) defeatConditions.push('SEALED_WITNESS_ACQUISITION_EPISODE_MUTATED');
  if (!rooms.ca04.current_state_equal || !rooms.ca04.status_equal || rooms.ca04.result.proposal_id_authority) {
    defeatConditions.push('PROPOSAL_IDENTIFIER_RENAME_CHANGES_AUTHORITY');
  }
  if (!rooms.ca05.material_edge_equal || !rooms.ca05.current_state_equal || !rooms.ca05.status_equal) {
    defeatConditions.push('WITNESS_OR_ADMISSION_IDENTIFIER_RENAME_CHANGES_AUTHORITY');
  }
  if (!rooms.ca06.current_state_equal || !rooms.ca06.status_equal || rooms.ca06.reverse.serialization_order_is_authority) {
    defeatConditions.push('SERIALIZATION_ORDER_SELECTS_ACQUISITION_AUTHORITY');
  }
  if (
    rooms.ca07.result.status !== 'NO_DEPENDENCY_EDGE_NO_TRANSITIVE_CONSEQUENCE' ||
    e6W2(rooms.ca07.result.filtered_e6_result) !== 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT'
  ) defeatConditions.push('EMPTY_PROPOSAL_MINTS_TRANSITIVE_CONSEQUENCE');
  if (
    rooms.ca08.result.status !== 'REFUSE_MISBOUND_DEPENDENCY_EDGE_ADMISSION_WITNESS' ||
    admissionStatus(rooms.ca08.result.filtered_e6_result, 'CA08_PERMIT') !== 'REFUSE_MISBOUND_DEPENDENCY_EDGE_ADMISSION_WITNESS'
  ) defeatConditions.push('EARLY_TIMING_CURES_MISBOUND_WITNESS');
  if (
    rooms.ca09.result.status !== 'REFUSE_REVOKED_DEPENDENCY_EDGE_ADMISSION_WITNESS' ||
    admissionStatus(rooms.ca09.result.filtered_e6_result, 'CA09_PERMIT') !== 'REFUSE_REVOKED_DEPENDENCY_EDGE_ADMISSION_WITNESS'
  ) defeatConditions.push('EARLY_TIMING_CURES_REVOKED_WITNESS');
  if (
    rooms.ca10.result.status !== 'ADMIT_NON_ANTICIPATING_DEPENDENCY_EDGE_ADMISSION_WITNESS' ||
    rooms.ca10.real_status !== 'ADMIT_WITNESSED_DEPENDENCY_EDGE_ADMISSION' ||
    rooms.ca10.fake_status !== 'REFUSE_SELF_ATTESTED_DEPENDENCY_EDGE_ADMISSION' ||
    e6W2(rooms.ca10.result.filtered_e6_result) !== 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT' ||
    !rooms.ca10.result.episode_evaluations.some(item => item.status === 'REFUSE_POST_PROPOSAL_DEPENDENCY_EDGE_ADMISSION_WITNESS')
  ) defeatConditions.push('LATE_FABRICATED_ALTERNATIVE_ERASES_OR_GAINS_AUTHORITY');
  if (
    !rooms.ca11.current_state_equal || !rooms.ca11.status_equal || !rooms.ca11.far_distance_greater ||
    rooms.ca11.far.sequence_distance_is_confidence
  ) defeatConditions.push('SEQUENCE_DISTANCE_AMPLIFIES_AUTHORITY');
  if (
    rooms.ca12.mutation.status !== 'SEALED_DEPENDENCY_EDGE_ADMISSION_PROPOSAL_IMMUTABLE' ||
    rooms.ca12.mutation.mutated || !rooms.ca12.proposal_still_frozen || !rooms.ca12.current_state_equal ||
    rooms.ca12.result.status !== 'ADMIT_NON_ANTICIPATING_DEPENDENCY_EDGE_ADMISSION_WITNESS'
  ) defeatConditions.push('PROPOSAL_MUTABILITY_OR_PARENT_SEMANTIC_DRIFT');

  const candidateVerdict = defeatConditions.length === 0
    ? 'DEPENDENCY_EDGE_ADMISSION_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_CLERK_WAS_ALREADY_THERE'
    : 'DEPENDENCY_EDGE_ADMISSION_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_CLERK_WAS_ALREADY_THERE';

  return deepFreeze({
    schema: PEDAGOGUE_DEPENDENCY_EDGE_ADMISSION_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY_SCHEMA,
    inherited_e6_verdict: e6.candidate_verdict,
    inherited_e6_witness_acquisition_order_verdict: inheritedInsufficiencyEstablished
      ? 'E6_WITNESS_ACQUISITION_ORDER_INSUFFICIENCY_ESTABLISHED'
      : 'E6_WITNESS_ACQUISITION_ORDER_INSUFFICIENCY_NOT_ESTABLISHED_IN_THIS_RUN',
    inherited_e6_e5_e4_semantics_preserved: true,
    candidate: 'E7_DEPENDENCY_EDGE_ADMISSION_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY',
    candidate_status: 'ATTACK_ONLY_NOT_PROMOTED',
    candidate_verdict: candidateVerdict,
    defeat_conditions: defeatConditions,
    rooms,
    next_learning_action_if_survives: 'ATTACK_ACQUISITION_SOURCE_ORIGIN_PROVENANCE_BEFORE_LARGER_GRAPH_FORMALISM',
    non_anticipation_relative_to_internal_proposal_only: true,
    live_external_source_adapter: false,
    external_physical_acquisition_time_claim: false,
    source_honesty_claim: false,
    unbiased_sampling_claim: false,
    institutional_independence_claim: false,
    real_world_chronology_claim: false,
    universal_graph_semantics: false,
    scalar_aggregation_used: false,
    H2: 'HELD_NOT_TESTED_HERE',
    H3: 'HELD_NOT_TESTED_HERE',
    intersections: 'HELD_NOT_OPENED_HERE',
    APERTURE_V32_REPLAY_STABILITY: 'HELD_NOT_YET_WITNESSED',
    promotion_authority: false,
    product_mutation: false,
    shared_pedagogue_engine_mutation: false,
    workflow_mutation: false,
    browser_execution: false,
    merge_performed: false,
    deployment_performed: false,
    release_authority: false,
    vercel_release_requires_issue_405_and_new_explicit_operator_gesture: true
  });
}
