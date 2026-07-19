import {
  ASH_LIFECYCLE_SCHEMA,
  ASH_LIFECYCLE_STATES,
  compileLifecycleReceipt,
  deriveAshLifecycle
} from './ash-lifecycle.js';
import {
  compilePedagogicalScene,
  compilePedagogicalTransition,
  compileRestState,
  compileTransferEncounter,
  compilePedagogueReceipt,
  verifyPedagogueReceipt
} from './flowcore-pedagogue-core.js';
import {
  AIA_ROUTE_IDS,
  compileAIAView,
  verifyAIAInvariants
} from './flowcore-pedagogue-aia.js';
import {
  renderPedagogueScene,
  renderPedagogueStaticFrame,
  compileVisualReceipt
} from '../dome-world/flowcore-pedagogue-visual.js';
import { canonicalDigest, canonicalJson } from '../dome-world/ash/canonical-json.js';

export const ASH_PEDAGOGUE_PACKAGE_SCHEMA = 'td613.ash.custody-pedagogue-package/v0.1';
export const ASH_PEDAGOGUE_WORLD_DELTA_SCHEMA = 'td613.ash.custody-pedagogue-world-delta/v0.1';

const RAW_KEYS = new Set(['body', 'text', 'content', 'raw', 'rawText', 'raw_text', 'bytes', 'buffer', 'sourceText', 'source_bytes', 'raw_bytes', 'raw_artifact_content']);

const STATE_COPY = Object.freeze({
  ARRIVAL_UNPERSISTED: Object.freeze({
    consequence: 'Nothing has been kept yet.',
    operational_phase: 'NOTICE',
    what_ash_created: 'No readiness or custody reference.',
    what_changed: 'No Case Map change.',
    unauthorized: 'No custody, case binding, reconstruction, release, or transport authority.',
    next: 'Choose a bounded source posture or exit.'
  }),
  READINESS_OBSERVED: Object.freeze({
    consequence: 'Ash can examine a bounded local source posture, but nothing has entered custody.',
    operational_phase: 'NOTICE',
    what_ash_created: 'A metadata-only readiness receipt.',
    what_changed: 'No Case Map change.',
    unauthorized: 'Readiness does not authorize custody, authenticity, case binding, release, or transport.',
    next: 'Register a custody reference or continue without binding.'
  }),
  CUSTODY_ROOT_PROVISIONAL: Object.freeze({
    consequence: 'A custody reference exists, but local digest verification has not completed.',
    operational_phase: 'HELD',
    what_ash_created: 'A provisional local custody reference.',
    what_changed: 'Rooms and Routes remain closed; the Case Map has not been rooted.',
    unauthorized: 'Provisional custody does not authorize case binding, reconstruction, release, or transport.',
    next: 'Retry local verification or continue without binding.'
  }),
  CUSTODY_ROOT_VERIFIED: Object.freeze({
    consequence: 'The source reference checked locally and may now be anchored to a case.',
    operational_phase: 'WORLD_ANSWERS',
    what_ash_created: 'A locally verified custody reference.',
    what_changed: 'The Case Map remains unchanged until an explicit bind.',
    unauthorized: 'Verification does not prove authenticity, truth, authorship, release, or transport.',
    next: 'Create or choose a case, then bind the verified reference.'
  }),
  CASE_BOUND: Object.freeze({
    consequence: 'The case now begins from this source; Rooms and Routes are open from the new foundation.',
    operational_phase: 'NAME',
    what_ash_created: 'A custody root node at chronology index zero and an exact case reference.',
    what_changed: 'The Case Map digest changes and older derivative tests become non-current.',
    unauthorized: 'Case binding does not prove truth and does not authorize release or transport.',
    next: 'Inspect the changed Case Map, then run a current Rebuild Test or rest.'
  }),
  REBUILD_ELIGIBLE: Object.freeze({
    consequence: 'A Rebuild Test matches the current custody-bound Case Map.',
    operational_phase: 'TRANSFER',
    what_ash_created: 'A current reconstruction-test reference.',
    what_changed: 'Draft work may proceed from the current case foundation.',
    unauthorized: 'Rebuild eligibility does not authorize release, publication, or transport.',
    next: 'Prepare a custody-bound draft or rest.'
  }),
  RELEASE_ELIGIBLE: Object.freeze({
    consequence: 'Exact local release review and receipt continuity are current for this case.',
    operational_phase: 'WORLD_ANSWERS',
    what_ash_created: 'A current local release receipt.',
    what_changed: 'Save-point sealing is available.',
    unauthorized: 'The pedagogue does not authorize a release, publication, or external transport.',
    next: 'Seal continuity locally or inspect what left.'
  }),
  CONTINUITY_SEALED: Object.freeze({
    consequence: 'Current release continuity is preserved in a local Save Point.',
    operational_phase: 'REST',
    what_ash_created: 'A current continuity reference tied to the exact release receipt.',
    what_changed: 'The case may resume from the current Save Point.',
    unauthorized: 'Continuity is not transport, truth, identity, or permission for another release.',
    next: 'Rest, inspect continuity, or return to the case.'
  })
});

const HOLD_COPY = Object.freeze({
  READINESS_NOT_OBSERVED: Object.freeze({ consequence: 'Ash has not observed a bounded source posture.', recovery: 'Clear the Ash threshold or exit.' }),
  CUSTODY_ROOT_ABSENT: Object.freeze({ consequence: 'No custody reference has been registered.', recovery: 'Register a local reference or continue without binding.' }),
  CUSTODY_DIGEST_NOT_VERIFIED: Object.freeze({ consequence: 'The source reference has not completed local verification.', recovery: 'Retry verification or continue without binding.' }),
  CUSTODY_ROOT_NOT_BOUND_TO_CASE: Object.freeze({ consequence: 'Ash checked the source reference, but this case does not begin from it yet.', recovery: 'Bind to the current case or choose another case.' }),
  CURRENT_REBUILD_TEST_ABSENT: Object.freeze({ consequence: 'No Rebuild Test matches the current Case Map digest.', recovery: 'Run a current test; older tests remain inspectable but non-current.' }),
  CURRENT_CUSTODY_BOUND_DRAFT_ABSENT: Object.freeze({ consequence: 'No draft matches the current custody-bound Case Map.', recovery: 'Keep a new bounded draft or rest.' }),
  LOCAL_RELEASE_REVIEW_NOT_READY: Object.freeze({ consequence: 'The current draft has not completed exact local release review.', recovery: 'Review the exact draft or keep it held.' }),
  RELEASE_RECEIPT_NOT_KEPT: Object.freeze({ consequence: 'No current local release receipt has been kept.', recovery: 'Keep the reviewed receipt or remain held.' }),
  CURRENT_CONTINUITY_NOT_SEALED: Object.freeze({ consequence: 'No current Save Point seals this release continuity.', recovery: 'Create a current local Save Point or remain at the release receipt.' })
});

function clone(value) {
  return value === null || typeof value !== 'object'
    ? value
    : Array.isArray(value)
      ? value.map(clone)
      : Object.fromEntries(Object.entries(value).map(([key, child]) => [key, clone(child)]));
}

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
}

function rejectRawContent(value, path = '$') {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) return value.forEach((item, index) => rejectRawContent(item, `${path}[${index}]`));
  for (const [key, child] of Object.entries(value)) {
    if (RAW_KEYS.has(key) && child != null && child !== '') throw new Error(`${path}.${key} is raw content and cannot enter the Ash pedagogue adapter.`);
    rejectRawContent(child, `${path}.${key}`);
  }
}

function lifecycleFrom(snapshot = {}) {
  if (snapshot.lifecycle?.schema === ASH_LIFECYCLE_SCHEMA) return snapshot.lifecycle;
  return deriveAshLifecycle(snapshot.lifecycle_input || snapshot);
}

function stateCopy(lifecycle) {
  return STATE_COPY[lifecycle.state] || Object.freeze({
    consequence: 'The exact Ash state requires inspection.',
    operational_phase: 'HELD',
    what_ash_created: 'Unresolved.',
    what_changed: 'Unresolved.',
    unauthorized: 'No authority is inferred.',
    next: lifecycle.next_action || 'Inspect the lifecycle receipt.'
  });
}

export function mapAshLifecycleToPedagoguePhase(lifecycle, context = {}) {
  if (!lifecycle || lifecycle.schema !== ASH_LIFECYCLE_SCHEMA) throw new Error('A derived Ash lifecycle is required.');
  const copy = stateCopy(lifecycle);
  const allowed = lifecycle.state === ASH_LIFECYCLE_STATES.READINESS_OBSERVED && context.action_selected === true
    ? ['NOTICE', 'ACT']
    : lifecycle.state === ASH_LIFECYCLE_STATES.CASE_BOUND && context.resting === true
      ? ['NAME', 'REST']
      : [copy.operational_phase];
  return freeze({
    lifecycle_state: lifecycle.state,
    primary_phase: allowed.at(-1),
    allowed_phases: allowed,
    automatic_advance: false,
    operator_action_required: true,
    station_owner: 'Ash',
    flowcore_commands_station: false,
    human_closure_required: true,
    closure: { status: 'OPEN', closed_by: null }
  });
}

function staleReference(reference, currentDigest) {
  return Boolean(reference?.case_map_digest && currentDigest && reference.case_map_digest !== currentDigest);
}

export function compileAshCustodyWorldDelta(beforeSnapshot = null, afterSnapshot = {}, options = {}) {
  rejectRawContent(beforeSnapshot);
  rejectRawContent(afterSnapshot);
  const before = beforeSnapshot ? lifecycleFrom(beforeSnapshot) : null;
  const after = lifecycleFrom(afterSnapshot);
  const afterCopy = stateCopy(after);
  const beforeDigest = before?.references?.case_map_digest || beforeSnapshot?.caseMap?.case_map_digest || null;
  const afterDigest = after.references?.case_map_digest || afterSnapshot?.caseMap?.case_map_digest || null;
  const caseMapChanged = Boolean(beforeDigest && afterDigest && beforeDigest !== afterDigest);
  const gatesOpened = Object.entries(after.gates || {})
    .filter(([key, value]) => value === true && before?.gates?.[key] !== true)
    .map(([key]) => key)
    .sort();
  const staleDerivatives = ['latestTest', 'latestDraft', 'latestReview', 'latestRelease', 'latestSavePoint']
    .filter(key => staleReference(afterSnapshot[key], afterDigest));
  const holds = (after.holds || []).map(code => ({
    code,
    consequence: HOLD_COPY[code]?.consequence || 'The exact Ash route remains held.',
    recovery: HOLD_COPY[code]?.recovery || 'Inspect the lifecycle receipt or exit.'
  }));
  const delta = {
    schema: ASH_PEDAGOGUE_WORLD_DELTA_SCHEMA,
    before_state: before?.state || 'UNINSPECTED_CURRENT_LOCAL_STATE',
    after_state: after.state,
    primary_consequence: afterCopy.consequence,
    case_map_digest_before: beforeDigest,
    case_map_digest_after: afterDigest,
    case_map_digest_changed: caseMapChanged,
    gates_opened: gatesOpened,
    rooms_open: after.gates?.rooms === true,
    routes_open: after.gates?.routes === true,
    stale_derivative_kinds: staleDerivatives,
    chronology_root_index: afterSnapshot?.caseMap?.nodes?.find(node => node.custody_reference === after.references?.custody_receipt)?.chronology_index ?? null,
    bytes_outside_case_map: true,
    raw_content_imported: false,
    transport_performed: false,
    ash_state_mutated_by_adapter: false,
    pedagogue_release_authorized: false,
    lifecycle_holds: holds,
    causal_trace: [
      'Ash derived the exact state from current local references.',
      'The adapter translated that state into a visible human consequence.',
      'Case, gate, hold, and stale-derivative changes remained inspectable.',
      'No lifecycle, custody, release, persistence, or transport action was performed by the adapter.'
    ],
    unresolved_relations: options.unresolvedRelations || (holds.length ? holds.map(item => item.code) : []),
    static_equivalent: {
      summary: afterCopy.consequence,
      steps: ['show what stayed local', 'show what Ash created', 'show Case Map and gate changes', 'show holds and recovery', 'show what remains unauthorized', 'show next lawful action']
    }
  };
  canonicalJson(delta);
  return freeze(delta);
}

function sceneInput(snapshot, lifecycle, delta) {
  const copy = stateCopy(lifecycle);
  const holds = lifecycle.holds || [];
  return {
    scene_kind: 'GENERIC',
    station_owner: 'Dome-World',
    source_status: 'E0',
    observation_status: holds.length ? 'UNRESOLVED' : 'OBSERVED',
    world_state_reference: lifecycle.references?.case_map_digest || lifecycle.references?.custody_receipt || lifecycle.state,
    provenance: {
      source_references: ['app/engine/ash-lifecycle.js', lifecycle.references?.custody_receipt || lifecycle.state],
      evidence_basis: ['exact locally derived Ash lifecycle', 'metadata-only pedagogue projection'],
      transformations: ['derive exact lifecycle', 'translate consequence before ontology', 'preserve hold and authority boundaries'],
      station_owners: ['Ash', 'Dome-World']
    },
    visible_condition: {
      plain_language: copy.consequence,
      what_stayed_local: 'Artifact bytes remain outside the Case Map and no transport is performed.',
      what_ash_created: copy.what_ash_created,
      what_changed_in_case: copy.what_changed,
      what_remains_unauthorized: copy.unauthorized,
      what_may_happen_next: copy.next
    },
    available_affordances: [{
      action_id: 'inspect_exact_ash_custody_state',
      purpose: 'Inspect the current exact local lifecycle consequence without mutating Ash.',
      authorized_by_station: 'Ash',
      reversible: true
    }],
    route_topology: {
      sequence: ['Choose source', 'See what stays local', 'Anchor source to case', 'Watch Case Map change', 'Inspect technical custody details if needed', 'Rest'],
      lifecycle_state: lifecycle.state,
      lifecycle_next_action: lifecycle.next_action,
      gates: clone(lifecycle.gates),
      holds: clone(holds),
      bytes_outside_case_map: true
    },
    causal_structure: {
      input: 'current local Ash references',
      operator: 'deriveAshLifecycle followed by presentation-only translation',
      observable: 'exact state, holds, gates, references, and bounded consequence',
      authority: 'Ash owns lifecycle truth; Flow-Core commands no station'
    },
    research_frame: {
      question: 'Can a first-time operator explain the current custody consequence before defining Custody Root?',
      hypothesis: 'Consequence-first translation will preserve exact Ash gates while reducing ontology-first route burden.',
      observable_behavior: ['operator states what stayed local', 'operator states what Ash created', 'operator identifies the Case Map change', 'operator identifies what remains unauthorized', 'operator identifies the next lawful action'],
      alternative_explanations: ['clarity may arise from copy alone rather than the full pedagogue sequence', 'the synthetic inspection may omit a real recovery obstacle', 'existing Ash familiarity may account for correct explanation'],
      expected_failure_modes: ['technical naming appears before consequence', 'a hold is narrated as blame', 'case binding is mistaken for truth or release authority'],
      falsifier: ['operators cannot identify what remained local', 'operators infer release authority from the presentation', 'reduced-motion and animated explanations diverge'],
      abstention_conditions: ['exact lifecycle is unavailable', 'custody references are inconsistent', 'raw source content appears in the proposed packet']
    },
    missingness: holds.length ? holds : ['interaction evidence not yet collected'],
    contradictions: ['local-only protection can coexist with a demanding multi-gate route'],
    claim_ceiling: {
      allowed_claims: ['the displayed state and gates were derived from the supplied exact local references', 'the adapter performed no Ash mutation'],
      forbidden_claims: ['custody proves authenticity', 'case binding proves truth', 'pedagogy authorizes release', 'continuity is transport', 'a hold proves user error']
    },
    technical_terms_withheld: ['Custody Root', 'Case Map digest', 'Rebuild eligibility', 'release continuity']
  };
}

export async function compileAshCustodyPedagogueScene(snapshot = {}, options = {}) {
  rejectRawContent(snapshot);
  const lifecycle = lifecycleFrom(snapshot);
  const delta = compileAshCustodyWorldDelta(options.beforeSnapshot || null, snapshot, options);
  const exactReceipt = await compileLifecycleReceipt(lifecycle, {
    ...options,
    observedAt: options.frozenClock
  });
  const input = sceneInput(snapshot, lifecycle, delta);
  const scene = await compilePedagogicalScene(input, options);
  const action = { action_id: 'inspect_exact_ash_custody_state', authorized_by_station: 'Ash' };
  const notice = await compilePedagogicalTransition(scene, null, null, {
    ...options,
    phase: 'NOTICE',
    staticEquivalent: { summary: input.visible_condition.plain_language, steps: ['consequence', 'local boundary', 'claim ceiling'] }
  });
  const act = await compilePedagogicalTransition(scene, action, null, {
    ...options,
    phase: 'ACT',
    priorTransitions: [notice],
    staticEquivalent: { summary: 'Inspect the exact local state without changing it.', steps: ['purpose', 'Ash authority', 'reversibility', 'exit'] }
  });
  const answer = await compilePedagogicalTransition(scene, action, {
    ...delta,
    missingness: lifecycle.holds || [],
    contradictions: input.contradictions,
    losses: [],
    glyph_candidates: lifecycle.state === ASH_LIFECYCLE_STATES.CONTINUITY_SEALED ? ['structural-rest'] : ['gathering-and-accumulated-obligation']
  }, {
    ...options,
    phase: 'WORLD_ANSWERS',
    priorTransitions: [notice, act]
  });
  const name = await compilePedagogicalTransition(scene, null, null, {
    ...options,
    phase: 'NAME',
    priorTransitions: [notice, act, answer],
    name: {
      plain_language: stateCopy(lifecycle).consequence,
      glyph_relation: lifecycle.state === ASH_LIFECYCLE_STATES.CONTINUITY_SEALED ? 'structural-rest' : 'gathering-and-accumulated-obligation',
      technical_term: `Ash lifecycle: ${lifecycle.state}`,
      non_equivalence: ['custody is not authenticity', 'case binding is not truth', 'rebuild eligibility is not release authority', 'continuity is not transport']
    },
    staticEquivalent: { summary: stateCopy(lifecycle).consequence, steps: ['plain consequence', 'exact state name', 'non-equivalence'] }
  });
  const rest = await compilePedagogicalTransition(scene, null, null, {
    ...options,
    phase: 'REST',
    priorTransitions: [notice, act, answer, name],
    staticEquivalent: { summary: 'Demand stops while the exact consequence, return, recovery, and exit remain available.', steps: ['stop prompts', 'retain state', 'return', 'recovery', 'exit'] }
  });
  const restState = await compileRestState(scene, rest, options);
  const transitions = [notice, act, answer, name, rest];
  const transfer = [ASH_LIFECYCLE_STATES.REBUILD_ELIGIBLE, ASH_LIFECYCLE_STATES.RELEASE_ELIGIBLE, ASH_LIFECYCLE_STATES.CONTINUITY_SEALED].includes(lifecycle.state)
    ? await compileTransferEncounter(name, {
      context: { station: 'Ash', next_action: lifecycle.next_action },
      shared_relation_candidate: 'the next workspace remains bound to the current exact Case Map references',
      observable_correspondence: ['the next action names the current lifecycle gate and reference set'],
      alternative_explanations: ['a newer local reference may make the displayed next action stale'],
      abstention_conditions: ['the current lifecycle receipt cannot be replayed']
    }, options)
    : null;
  const pedagogueReceipt = await compilePedagogueReceipt(scene, transitions, {
    ...options,
    transferEncounters: transfer ? [transfer] : []
  });
  const verification = await verifyPedagogueReceipt(pedagogueReceipt, options);
  if (!verification.valid) throw new Error('Ash pedagogue receipt verification failed.');

  const views = [];
  for (const route of AIA_ROUTE_IDS) views.push(await compileAIAView(scene, answer, route, options));
  const invariantReport = verifyAIAInvariants(scene, views);
  const frames = {};
  const reducedFrames = {};
  const visualReceipts = {};
  for (const route of AIA_ROUTE_IDS) {
    const viewId = `ash-custody-pedagogue:${lifecycle.state}:${route}`;
    frames[route] = renderPedagogueScene(viewId, scene, answer, options.desktopViewport || { width: 1120, height: 760, devicePixelRatio: 1 }, options.time || 0, { activeViewId: viewId, reducedMotion: false });
    reducedFrames[route] = renderPedagogueStaticFrame(viewId, scene, answer, options.mobileViewport || { width: 390, height: 844, devicePixelRatio: 1 }, { activeViewId: viewId });
    visualReceipts[route] = await compileVisualReceipt(scene, answer, frames[route], {
      ...options,
      idSeed: `${options.idSeed}:${route}`,
      worldRevision: lifecycle.state,
      inputDigest: pedagogueReceipt.receipt_digest
    });
  }

  const subject = {
    lifecycle_receipt: exactReceipt.receipt_id,
    lifecycle_digest: exactReceipt.lifecycle_digest,
    scene_reference: scene.scene_id,
    pedagogue_receipt_digest: pedagogueReceipt.receipt_digest,
    state: lifecycle.state,
    holds: lifecycle.holds,
    routes: AIA_ROUTE_IDS
  };
  const digest = await canonicalDigest('TD613:ASH:CUSTODY-PEDAGOGUE-PACKAGE:v1', subject, options);
  const output = {
    schema: ASH_PEDAGOGUE_PACKAGE_SCHEMA,
    package_id: `ash_pedagogue_${digest.slice(-24)}`,
    package_digest: digest,
    lifecycle,
    lifecycle_receipt: exactReceipt,
    operational_phase: mapAshLifecycleToPedagoguePhase(lifecycle, options.context || {}),
    comprehension_contract: {
      what_stayed_local: input.visible_condition.what_stayed_local,
      what_ash_created: input.visible_condition.what_ash_created,
      what_changed_in_case: input.visible_condition.what_changed_in_case,
      what_remains_unauthorized: input.visible_condition.what_remains_unauthorized,
      what_may_happen_next: input.visible_condition.what_may_happen_next
    },
    scene,
    world_delta: delta,
    phase_sequence: transitions,
    rest_state: restState,
    transfer_encounter: transfer,
    pedagogue_receipt: pedagogueReceipt,
    receipt_verification: verification,
    aia_views: Object.fromEntries(views.map(view => [view.route, view])),
    aia_invariant_report: invariantReport,
    desktop_frames: frames,
    reduced_mobile_frames: reducedFrames,
    visual_receipts: visualReceipts,
    hold_scenes: (lifecycle.holds || []).map(code => ({ code, ...(HOLD_COPY[code] || { consequence: 'Held for exact review.', recovery: 'Inspect the lifecycle receipt or exit.' }), blame_language: false, increased_recovery_cost: false, rest_available: true, exit_available: true })),
    non_regression: {
      raw_bytes_enter_case_map: false,
      local_only_changed: false,
      digest_mismatch_still_rejects: true,
      stale_derivatives_remain_non_current: true,
      rooms_routes_open_before_case_binding: false,
      automatic_release_added: false,
      automatic_persistence_added: false,
      ash_lifecycle_mutated: false
    },
    authority: {
      station_owner: 'Ash',
      flowcore_commands_station: false,
      automatic_ash_action: false,
      release_authorized: false,
      station_authority_transferred: false,
      human_closure_required: true
    },
    closure: { status: 'OPEN', closed_by: null }
  };
  canonicalJson(output);
  return freeze(output);
}
