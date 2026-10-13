import { canonicalDigest, canonicalJson } from '../dome-world/ash/canonical-json.js';

export const ASH_LIVE_AIA_SCHEMA = 'td613.ash.live-aia/v0.1';
export const ASH_LIVE_ACTION_PLAN_SCHEMA = 'td613.ash.live-aia-action-plan/v0.1';
export const ASH_LIVE_ACTION_RECEIPT_SCHEMA = 'td613.ash.live-aia-action-receipt/v0.1';
export const ASH_LIVE_RENDER_RECEIPT_SCHEMA = 'td613.ash.live-aia-render-receipt/v0.1';
export const ASH_LIVE_ANIMATION_PLAN_SCHEMA = 'td613.ash.live-aia-animation-plan/v0.1';
export const ASH_LIVE_AIA_ROUTES = Object.freeze(['EXPERIENTIAL', 'CUSTODIAL', 'AUDIT', 'IMPLEMENTATION']);

const RAW_KEYS = new Set([
  'body', 'text', 'content', 'raw', 'rawText', 'raw_text', 'bytes', 'buffer',
  'sourceText', 'source_bytes', 'raw_bytes', 'raw_artifact_content', 'draft_body'
]);

const ACTIONS = Object.freeze({
  CLEAR_ASH_THRESHOLD: Object.freeze({
    command_id: 'compileQuickScan',
    workspace: 'custody',
    portal_selector: '#compileQuickScan',
    label: 'Notice what arrived',
    purpose: 'Create a metadata-only readiness observation before custody.',
    expected_consequence: 'Ash records posture only. Nothing enters custody yet.',
    requires_input: false,
    direct_command: true
  }),
  REGISTER_CUSTODY_ROOT: Object.freeze({
    command_id: 'registerCustodyRoot',
    workspace: 'custody',
    portal_selector: '#registerCustodyRoot',
    label: 'Make the custody reference',
    purpose: 'Create and locally verify a custody receipt from the selected posture.',
    expected_consequence: 'A custody reference may be created while artifact bytes remain outside the Case Map.',
    requires_input: true,
    direct_command: true
  }),
  VERIFY_CUSTODY_DIGEST_SPINE: Object.freeze({
    command_id: 'registerCustodyRoot',
    workspace: 'custody',
    portal_selector: '#registerCustodyRoot',
    label: 'Retry the local check',
    purpose: 'Retry exact local digest verification without widening authority.',
    expected_consequence: 'The root remains provisional unless the exact digest spine verifies.',
    requires_input: true,
    direct_command: true
  }),
  CREATE_CASE: Object.freeze({
    command_id: 'newCase',
    workspace: 'map',
    portal_selector: '#newCase',
    label: 'Create a place for the reference',
    purpose: 'Create a local Case Map before binding the verified custody root.',
    expected_consequence: 'A local case exists, but the custody root still requires an explicit bind.',
    requires_input: true,
    direct_command: true
  }),
  BIND_CUSTODY_ROOT_TO_CASE: Object.freeze({
    command_id: 'bindCustodyRoot',
    workspace: 'custody',
    portal_selector: '#bindCustodyRoot',
    label: 'Anchor the case to this root',
    purpose: 'Bind the verified custody reference to chronology index zero.',
    expected_consequence: 'The Case Map digest changes and later derivatives become non-current until rebuilt.',
    requires_input: false,
    direct_command: true
  }),
  RUN_CURRENT_REBUILD_TEST: Object.freeze({
    command_id: 'runTest',
    workspace: 'test',
    portal_selector: '#runTest',
    label: 'Test what could be rebuilt',
    purpose: 'Run a current Rebuild Test against the exact custody-bound Case Map.',
    expected_consequence: 'A current test may become eligible; release authority remains closed.',
    requires_input: true,
    direct_command: true
  }),
  KEEP_CUSTODY_BOUND_DRAFT: Object.freeze({
    command_id: 'keepDraft',
    workspace: 'draft',
    portal_selector: '#keepDraft',
    label: 'Keep this exact draft',
    purpose: 'Keep one local draft bound to the current Case Map digest.',
    expected_consequence: 'A local draft reference may be created; no release or transport occurs.',
    requires_input: true,
    direct_command: true
  }),
  REVIEW_EXACT_DRAFT: Object.freeze({
    command_id: 'reviewDraft',
    workspace: 'draft',
    portal_selector: '#reviewDraft',
    label: 'Review the exact draft',
    purpose: 'Review the kept draft against custody, route, identity, confidentiality, and chronology checks.',
    expected_consequence: 'The draft may become locally release-ready; publication and transport remain absent.',
    requires_input: true,
    direct_command: true
  }),
  KEEP_RELEASE_RECEIPT: Object.freeze({
    command_id: 'approveRelease',
    workspace: 'draft',
    portal_selector: '#approveRelease',
    label: 'Keep the release receipt',
    purpose: 'Keep an exact local release receipt after the governed review passes.',
    expected_consequence: 'Release eligibility may become current; nothing is transmitted.',
    requires_input: false,
    direct_command: true
  }),
  SEAL_CONTINUITY: Object.freeze({
    command_id: 'makeSave',
    workspace: 'save',
    portal_selector: '#makeSave',
    label: 'Seal a local save point',
    purpose: 'Preserve current release continuity in a local Save Point.',
    expected_consequence: 'Continuity may be sealed locally; continuity remains distinct from transport.',
    requires_input: false,
    direct_command: true
  }),
  TEND_CASE: Object.freeze({
    command_id: null,
    workspace: 'map',
    portal_selector: null,
    label: 'Return to the case',
    purpose: 'Inspect and tend the current local case without automatic advance.',
    expected_consequence: 'The current exact state remains available for human-directed work.',
    requires_input: false,
    direct_command: false
  })
});

const STATE_RANK = Object.freeze({
  ARRIVAL_UNPERSISTED: 0,
  READINESS_OBSERVED: 1,
  CUSTODY_ROOT_PROVISIONAL: 2,
  CUSTODY_ROOT_VERIFIED: 3,
  CASE_BOUND: 4,
  REBUILD_ELIGIBLE: 5,
  RELEASE_ELIGIBLE: 6,
  CONTINUITY_SEALED: 7,
  HELD: -1
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
  if (Array.isArray(value)) {
    value.forEach((item, index) => rejectRawContent(item, `${path}[${index}]`));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (RAW_KEYS.has(key) && child != null && child !== '') {
      throw new Error(`${path}.${key} is raw content and cannot enter the live AIA receipt lane.`);
    }
    rejectRawContent(child, `${path}.${key}`);
  }
}

function assertLifecycle(lifecycle) {
  if (!lifecycle || lifecycle.schema !== 'td613.ash.lifecycle/v0.1') {
    throw new Error('An exact Ash lifecycle is required.');
  }
}

function compactLifecycle(lifecycle) {
  assertLifecycle(lifecycle);
  return {
    schema: lifecycle.schema,
    state: lifecycle.state,
    next_action: lifecycle.next_action,
    gates: clone(lifecycle.gates || {}),
    holds: clone(lifecycle.holds || []),
    references: clone(lifecycle.references || {}),
    non_authority: clone(lifecycle.non_authority || [])
  };
}

export function compileAshLiveActionPlan(lifecycle, options = {}) {
  assertLifecycle(lifecycle);
  const action = ACTIONS[lifecycle.next_action] || ACTIONS.TEND_CASE;
  const plan = {
    schema: ASH_LIVE_ACTION_PLAN_SCHEMA,
    lifecycle_state: lifecycle.state,
    lifecycle_next_action: lifecycle.next_action,
    command_id: action.command_id,
    workspace: action.workspace,
    portal_selector: action.portal_selector,
    label: action.label,
    purpose: action.purpose,
    expected_consequence: action.expected_consequence,
    requires_input: action.requires_input,
    direct_command: action.direct_command,
    operator_confirmation_required: action.direct_command,
    automatic_advance: false,
    animation_commands_station: false,
    station_owner: 'Ash',
    flowcore_role: 'PRESENTATION_AND_CAUSAL_EXPLANATION',
    visible_non_authority: clone(lifecycle.non_authority || []),
    recovery: lifecycle.holds?.length
      ? `Resolve or inspect: ${lifecycle.holds.join(' · ')}. Rest and exit remain available.`
      : 'Return, Rest, exact inspection, and exit remain available.',
    empirical_posture: {
      child_legible_design: true,
      adult_human_evidence_present: options.adultHumanEvidencePresent === true,
      child_study_authorized: false,
      telemetry_present: false
    },
    closure: { status: 'OPEN', closed_by: null }
  };
  canonicalJson(plan);
  return freeze(plan);
}

function step(id, label, complete, current, held, detail) {
  return { id, label, complete, current, held, detail };
}

export function deriveAshLiveAnimationPlan(beforeLifecycle, afterLifecycle, route = 'EXPERIENTIAL', reducedMotion = false) {
  if (beforeLifecycle) assertLifecycle(beforeLifecycle);
  assertLifecycle(afterLifecycle);
  if (!ASH_LIVE_AIA_ROUTES.includes(route)) throw new Error(`Unknown AIA route: ${route}`);
  const beforeRank = beforeLifecycle ? (STATE_RANK[beforeLifecycle.state] ?? -1) : -1;
  const afterRank = STATE_RANK[afterLifecycle.state] ?? -1;
  const refs = afterLifecycle.references || {};
  const held = new Set(afterLifecycle.holds || []);
  const steps = [
    step('local-boundary', 'The source stays local', true, afterRank <= 1, false, 'Artifact bytes remain outside the Case Map and no transport is performed.'),
    step('custody-reference', 'Ash creates a reference', Boolean(refs.custody_receipt), afterRank >= 1 && afterRank <= 3, held.has('CUSTODY_ROOT_ABSENT') || held.has('CUSTODY_DIGEST_NOT_VERIFIED'), 'A custody reference is separate from the artifact, manifest, and receipt.'),
    step('case-root', 'The case receives its root', Boolean(refs.case_id && refs.case_map_digest && afterRank >= 4), afterRank === 4, held.has('CUSTODY_ROOT_NOT_BOUND_TO_CASE'), 'Binding places the root at chronology index zero and changes the Case Map digest.'),
    step('current-work', 'Later work matches the root', Boolean(refs.rebuild_test), afterRank === 5, held.has('CURRENT_REBUILD_TEST_ABSENT') || held.has('CURRENT_CUSTODY_BOUND_DRAFT_ABSENT'), 'Tests and drafts must match the current Case Map digest.'),
    step('release-review', 'Release review becomes current', Boolean(refs.release_receipt), afterRank === 6, held.has('LOCAL_RELEASE_REVIEW_NOT_READY') || held.has('RELEASE_RECEIPT_NOT_KEPT'), 'Eligibility remains local and does not perform publication or transport.'),
    step('continuity', 'Continuity is sealed', Boolean(refs.save_point), afterRank === 7, held.has('CURRENT_CONTINUITY_NOT_SEALED'), 'A Save Point preserves continuity without becoming transport.')
  ];
  const changed = {
    state_changed: beforeLifecycle ? beforeLifecycle.state !== afterLifecycle.state : true,
    advanced: afterRank > beforeRank,
    regressed: beforeRank > afterRank,
    next_action_changed: beforeLifecycle ? beforeLifecycle.next_action !== afterLifecycle.next_action : true,
    case_map_digest_changed: beforeLifecycle
      ? beforeLifecycle.references?.case_map_digest !== afterLifecycle.references?.case_map_digest
      : Boolean(afterLifecycle.references?.case_map_digest),
    holds_added: beforeLifecycle
      ? (afterLifecycle.holds || []).filter(item => !(beforeLifecycle.holds || []).includes(item))
      : clone(afterLifecycle.holds || []),
    holds_cleared: beforeLifecycle
      ? (beforeLifecycle.holds || []).filter(item => !(afterLifecycle.holds || []).includes(item))
      : []
  };
  const plan = {
    schema: ASH_LIVE_ANIMATION_PLAN_SCHEMA,
    route,
    reduced_motion: reducedMotion === true,
    mode: reducedMotion ? 'NUMBERED_STATIC_CAUSAL_FRAMES' : 'FINITE_GESTURE_TRIGGERED_CAUSAL_SEQUENCE',
    trigger: 'EXPLICIT_HUMAN_GESTURE_OR_EXPLICIT_REPLAY',
    autoplay_authority: false,
    station_command_authority: false,
    duration_ms: reducedMotion ? 0 : 4200,
    finite: true,
    interruptible: true,
    replay_reperforms_ash_action: false,
    continuous_animation: false,
    semantic_topology: [
      'source remains local',
      'custody reference remains distinct from artifact',
      'case root changes only after explicit binding',
      'gates open only after exact predicates',
      'authority ceiling remains visible',
      'Rest remains available'
    ],
    before: beforeLifecycle ? compactLifecycle(beforeLifecycle) : null,
    after: compactLifecycle(afterLifecycle),
    changed,
    steps,
    final_frame: {
      lifecycle_state: afterLifecycle.state,
      next_action: afterLifecycle.next_action,
      holds: clone(afterLifecycle.holds || []),
      closure: 'OPEN'
    }
  };
  canonicalJson(plan);
  return freeze(plan);
}

export async function compileAshLiveActionReceipt(input = {}, options = {}) {
  rejectRawContent(input);
  const { beforeLifecycle, afterLifecycle, actionPlan, gesture = {}, outcome = 'OBSERVED' } = input;
  assertLifecycle(beforeLifecycle);
  assertLifecycle(afterLifecycle);
  if (!actionPlan || actionPlan.schema !== ASH_LIVE_ACTION_PLAN_SCHEMA) throw new Error('A governed live AIA action plan is required.');
  const frozenClock = String(options.frozenClock || input.observedAt || '');
  const idSeed = String(options.idSeed || '');
  if (!frozenClock || !idSeed) throw new Error('Action receipt requires frozenClock and idSeed.');
  const subject = {
    before: compactLifecycle(beforeLifecycle),
    after: compactLifecycle(afterLifecycle),
    action: clone(actionPlan),
    gesture: {
      type: String(gesture.type || 'button'),
      target_id: gesture.target_id ? String(gesture.target_id) : actionPlan.command_id,
      confirmed: gesture.confirmed === true
    },
    outcome: String(outcome),
    raw_content_recorded: false,
    transport_performed_by_membrane: false,
    station_authority_transferred: false,
    automatic_advance: false,
    human_closure_required: true
  };
  const digest = await canonicalDigest('TD613:ASH:LIVE-AIA-ACTION:v1', {
    frozen_clock: frozenClock,
    id_seed: idSeed,
    subject
  }, options);
  const receipt = {
    schema: ASH_LIVE_ACTION_RECEIPT_SCHEMA,
    receipt_id: `ash_live_action_${digest.slice(-24)}`,
    observed_at: frozenClock,
    ...subject,
    receipt_digest: digest,
    closure: { status: 'OPEN', closed_by: null }
  };
  canonicalJson(receipt);
  return freeze(receipt);
}

export async function compileAshLiveRenderReceipt(input = {}, options = {}) {
  rejectRawContent(input);
  const { packageView, route, animationPlan, visibleClaims = [] } = input;
  if (!packageView?.package_digest || !packageView?.lifecycle?.schema) throw new Error('A verified Ash pedagogue package is required.');
  if (!ASH_LIVE_AIA_ROUTES.includes(route)) throw new Error(`Unknown AIA route: ${route}`);
  if (!animationPlan || animationPlan.schema !== ASH_LIVE_ANIMATION_PLAN_SCHEMA) throw new Error('A deterministic animation plan is required.');
  const frozenClock = String(options.frozenClock || '');
  const idSeed = String(options.idSeed || '');
  if (!frozenClock || !idSeed) throw new Error('Render receipt requires frozenClock and idSeed.');
  const comprehension = packageView.comprehension_contract || {};
  const derivedClaims = [
    comprehension.what_stayed_local,
    comprehension.what_ash_created,
    comprehension.what_changed_in_case,
    comprehension.what_remains_unauthorized,
    comprehension.what_may_happen_next
  ].filter(Boolean);
  const claims = visibleClaims.length ? visibleClaims.map(String) : derivedClaims;
  const subject = {
    package_digest: packageView.package_digest,
    lifecycle_receipt: packageView.lifecycle_receipt?.receipt_id || null,
    pedagogue_receipt: packageView.pedagogue_receipt?.receipt_id || null,
    route,
    animation_plan: clone(animationPlan),
    visible_claims: claims,
    claims_derived_from_package: claims.every(claim => derivedClaims.includes(claim)),
    reduced_motion_equivalent_present: true,
    exact_inspection_available: true,
    telemetry_present: false,
    raw_content_recorded: false,
    commands_station: false,
    automatic_ash_action: false,
    human_closure_required: true
  };
  if (!subject.claims_derived_from_package) throw new Error('Visible claims must be derivable from the verified Ash pedagogue package.');
  const digest = await canonicalDigest('TD613:ASH:LIVE-AIA-RENDER:v1', {
    frozen_clock: frozenClock,
    id_seed: idSeed,
    subject
  }, options);
  const receipt = {
    schema: ASH_LIVE_RENDER_RECEIPT_SCHEMA,
    receipt_id: `ash_live_render_${digest.slice(-24)}`,
    created_at: frozenClock,
    ...subject,
    receipt_digest: digest,
    closure: { status: 'OPEN', closed_by: null }
  };
  canonicalJson(receipt);
  return freeze(receipt);
}

export function verifyAshLivePresentationBoundary(value) {
  const violations = [];
  if (!value || typeof value !== 'object') return Object.freeze({ valid: false, violations: ['VALUE_ABSENT'] });
  if (value.automatic_advance === true || value.authority?.automatic_ash_action === true) violations.push('AUTOMATIC_ASH_ACTION');
  if (value.station_authority_transferred === true || value.authority?.station_authority_transferred === true) violations.push('STATION_AUTHORITY_TRANSFER');
  if (value.transport_performed_by_membrane === true || value.transport_performed === true) violations.push('MEMBRANE_TRANSPORT');
  if (value.raw_content_recorded === true || value.raw_content_imported === true) violations.push('RAW_CONTENT_IN_PRESENTATION_RECEIPT');
  if (value.closure?.status && value.closure.status !== 'OPEN') violations.push('AUTOMATIC_CLOSURE');
  return Object.freeze({ valid: violations.length === 0, violations });
}
