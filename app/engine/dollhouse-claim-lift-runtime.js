// Local capture and declaration audits have separate evidence classes. None of
// these synchronous adapters authenticates a source, signature or acquisition.
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

export const DOLLHOUSE_CLAIM_LIFT_RUNTIME_SCHEMA = 'td613.dollhouse.claim-lift-runtime/v0.1';
export const DOLLHOUSE_BROWSER_EPISODE_SCHEMA = 'td613.dollhouse.browser-episode/v0.1';
export const DOLLHOUSE_COMPREHENSION_SCHEMA = 'td613.dollhouse.comprehension-attempt/v0.1';
export const DOLLHOUSE_PROVIDER_MATRIX_SCHEMA = 'td613.dollhouse.provider-observation-matrix/v0.1';
export const DOLLHOUSE_ANCESTRY_SCHEMA = 'td613.dollhouse.td613-ancestry-observation/v0.1';
export const DOLLHOUSE_GOLDEN_EGG_SCHEMA = 'td613.dollhouse.golden-egg-episode-evaluator/v0.1';
export const DOLLHOUSE_CHALLENGE_READOUT_SCHEMA = 'td613.dollhouse.challenge-readout/v0.1';
export const DOLLHOUSE_EXOGENOUS_WITNESS_SCHEMA = 'td613.dollhouse.exogenous-witness-intake/v0.1';
export const DOLLHOUSE_FOUR_ROLE_SCHEMA = 'td613.dollhouse.four-role-operational-audit/v0.1';

export const LOOM_COMPREHENSION_QUESTIONS = freeze([
  freeze({
    id: 'receiver_receipt',
    prompt: 'What does a matching receiver receipt establish?',
    choices: freeze([
      'The foreign host enforced every Loom rule internally.',
      'The returned declaration matches the supplied references and still requires local revalidation.',
      'The foreign host retained nothing after the turn.'
    ]),
    correct_index: 1
  }),
  freeze({
    id: 'local_only',
    prompt: 'What does local-only mean during the first Portable AIA handoff?',
    choices: freeze([
      'Withheld source bodies remain outside the receiver handoff unless explicitly selected later.',
      'Every local file is encrypted and sent invisibly.',
      'The receiver receives all files but promises not to use them.'
    ]),
    correct_index: 0
  }),
  freeze({
    id: 'challenge',
    prompt: 'What can a clean Challenge Receiver episode establish?',
    choices: freeze([
      'Universal secrecy and zero hidden memory.',
      'A bounded result over the declared probes and captured observation horizon.',
      'The provider cannot train on any content.'
    ]),
    correct_index: 1
  }),
  freeze({
    id: 'golden_egg',
    prompt: 'What does the Golden Egg acquisition contract require?',
    choices: freeze([
      'Five surfaces may be assembled from unrelated episodes if their hashes are valid.',
      'One immutable same-episode acquisition binds L, R, J, G and C under common custody and comparison frame.',
      'A green CI run automatically supplies empirical exteriority.'
    ]),
    correct_index: 1
  })
]);

function text(value, fallback = '') {
  return typeof value === 'string' && value.length <= 2048 ? value : fallback;
}
function number(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
const record = value => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) return {};
  const descriptors = Object.getOwnPropertyDescriptors(value);
  return Object.values(descriptors).every(item => Object.hasOwn(item, 'value') && item.enumerable) ? value : {};
};
const arrayValue = (value, index) => Object.getOwnPropertyDescriptor(value, String(index))?.value;
const identifier = value => text(value).trim();
const sha256 = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const time = value => number(value) !== null && value >= 0 ? value : null;
const authority = () => ({ loom_admission: false, consequential_execution: false, empirical_claim: false });
const localReceipt = fields => freeze({
  ...fields,
  evidence_class: 'LOCAL_ANALYSIS_OF_DECLARED_INPUT',
  source_authentication: 'NOT_PERFORMED',
  authority: authority(),
  externally_measured: false,
  empirical_exteriority_earned: false,
  golden_egg_earned: false,
  live_loom_mutated: false
});
function safeNow(environment) {
  const value = time(environment?.Date?.now?.());
  return value ?? Date.now();
}
function media(environment, query) {
  try { return Boolean(environment?.matchMedia?.(query)?.matches); } catch { return false; }
}
const boundedIdentifiers = value => Array.isArray(value) && value.length <= 64
  && Array.from({ length: value.length }, (_, index) => identifier(arrayValue(value, index))).every(Boolean);

export function captureBrowserRuntimeEpisode(environment = globalThis, options = {}) {
  options = record(options);
  const navigator = environment?.navigator || {};
  const vv = environment?.visualViewport || {};
  const screen = environment?.screen || {};
  const now = time(options.observed_at) ?? safeNow(environment);
  const episodeId = text(options.episode_id, `browser-${now}`);
  const payload = {
    schema: DOLLHOUSE_BROWSER_EPISODE_SCHEMA,
    episode_id: episodeId,
    observed_at: now,
    evidence_class: 'LOCAL_BROWSER_RUNTIME_OBSERVATION',
    source_revision: text(options.source_revision, 'UNPINNED_BROWSER_SOURCE'),
    source_authentication: 'NOT_PERFORMED',
    authority: authority(),
    live_loom_mutated: false,
    empirical_exteriority_earned: false,
    golden_egg_earned: false,
    runtime: {
      user_agent: text(navigator.userAgent),
      platform: text(navigator.platform),
      max_touch_points: number(navigator.maxTouchPoints) ?? 0,
      hardware_concurrency: number(navigator.hardwareConcurrency),
      device_memory_gb: number(navigator.deviceMemory),
      language: text(navigator.language),
      webdriver: navigator.webdriver === true
    },
    viewport: {
      inner_width: number(environment?.innerWidth),
      inner_height: number(environment?.innerHeight),
      visual_width: number(vv.width),
      visual_height: number(vv.height),
      visual_scale: number(vv.scale),
      device_pixel_ratio: number(environment?.devicePixelRatio),
      screen_width: number(screen.width),
      screen_height: number(screen.height)
    },
    interaction_hints: {
      pointer_coarse: media(environment, '(pointer: coarse)'),
      hover_none: media(environment, '(hover: none)'),
      standalone: media(environment, '(display-mode: standalone)')
    },
    findings: {
      touch_capable_runtime_observed: (number(navigator.maxTouchPoints) ?? 0) > 0 || media(environment, '(pointer: coarse)'),
      mobile_shaped_viewport_observed: number(environment?.innerWidth) !== null && environment.innerWidth > 0 && environment.innerWidth <= 480,
      physical_hardware_authenticated: false,
      source_revision_authenticated: false,
      screenshot_captured_by_this_instrument: false
    },
    claim_ceiling: [
      'browser runtime and interaction geometry for this episode only',
      'touch hints and user-agent fields do not authenticate physical hardware',
      'simulated viewports can reproduce some observed fields',
      'historical physical-device evidence does not certify this source revision'
    ]
  };
  return freeze(payload);
}

export function scoreLoomComprehensionAttempt(answerMap = {}, options = {}) {
  answerMap = record(answerMap);
  options = record(options);
  const rows = LOOM_COMPREHENSION_QUESTIONS.map(question => {
    const supplied = answerMap?.[question.id];
    const answered = Number.isInteger(supplied) && supplied >= 0 && supplied < question.choices.length;
    return freeze({
      id: question.id,
      answered,
      supplied_index: answered ? supplied : null,
      correct: answered ? supplied === question.correct_index : false
    });
  });
  const answered = rows.filter(row => row.answered).length;
  const correct = rows.filter(row => row.correct).length;
  const complete = answered === rows.length;
  return localReceipt({
    schema: DOLLHOUSE_COMPREHENSION_SCHEMA,
    episode_id: text(options.episode_id, `comprehension-${time(options.observed_at) ?? Date.now()}`),
    observed_at: time(options.observed_at) ?? Date.now(),
    input_class: 'DECLARED_SELF_ADMINISTERED_ANSWERS',
    status: complete ? 'COMPLETE' : 'INCOMPLETE',
    answered,
    correct,
    total: rows.length,
    score: complete ? correct / rows.length : null,
    rows,
    findings: {
      complete_declared_attempt_scored: complete,
      comprehension_measured_for_this_attempt: false,
      operator_identity_or_gesture_verified: false,
      perfect_attempt: complete && correct === rows.length,
      population_generalization: false,
      independent_research_participant_sample: false
    },
    claim_ceiling: [
      'scores only the supplied answer indices against declared TD613 concepts',
      'answer declarations do not authenticate an operator or measure human comprehension',
      'self-administered task performance is not a population study',
      'a perfect score does not establish durable understanding or usability'
    ]
  });
}

function normalizeProviderEpisode(input, index) {
  input = record(input);
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError(`provider episode ${index} must be an object`);
  const provider = text(input.provider).trim();
  const model = text(input.model).trim();
  const route = text(input.route).trim();
  const outcome = text(input.outcome).trim().toUpperCase();
  const requestDigest = text(input.request_digest).trim();
  const responseDigest = text(input.response_digest).trim();
  if (!provider || !model || !route || !outcome) throw new TypeError(`provider episode ${index} requires provider, model, route and outcome`);
  return freeze({
    provider,
    model,
    route,
    outcome,
    request_digest: requestDigest || null,
    response_digest: responseDigest || null,
    status_code: number(input.status_code),
    latency_ms: number(input.latency_ms),
    observed_at: time(input.observed_at),
    evidence_class: 'DECLARED_PROVIDER_EPISODE',
    evidence_class_declared: identifier(input.evidence_class) || null
  });
}

export function auditProviderObservationMatrix(inputs = []) {
  if (!Array.isArray(inputs) || inputs.length > 64) throw new TypeError('provider observations must be a bounded array');
  const episodes = Array.from({ length: inputs.length }, (_, index) => normalizeProviderEpisode(arrayValue(inputs, index), index));
  const providers = [...new Set(episodes.map(row => row.provider))].sort();
  const models = [...new Set(episodes.map(row => JSON.stringify([row.provider, row.model])))].sort();
  const routes = [...new Set(episodes.map(row => row.route))].sort();
  const outcomes = Object.fromEntries([...new Set(episodes.map(row => row.outcome))].sort().map(outcome => [
    outcome, episodes.filter(row => row.outcome === outcome).length
  ]));
  const requestGroups = new Map();
  for (const episode of episodes) {
    if (!episode.request_digest) continue;
    if (!requestGroups.has(episode.request_digest)) requestGroups.set(episode.request_digest, []);
    requestGroups.get(episode.request_digest).push(episode);
  }
  const divergence = [...requestGroups.entries()].flatMap(([request_digest, rows]) => {
    // A receiver label is a comparison coordinate, not an output difference.
    // Missing digests cannot be treated as an observed response mismatch.
    const outcomes = new Set(rows.map(row => row.outcome));
    const responses = new Set(rows.map(row => row.response_digest).filter(Boolean));
    return outcomes.size > 1 || responses.size > 1 ? [freeze({
      request_digest, observations: rows.length, distinct_outcomes: outcomes.size, distinct_response_digests: responses.size
    })] : [];
  });
  return localReceipt({
    schema: DOLLHOUSE_PROVIDER_MATRIX_SCHEMA,
    input_class: episodes.length ? 'DECLARED_PROVIDER_EPISODE_SET' : 'EMPTY',
    episode_count: episodes.length,
    episodes,
    providers,
    models,
    routes,
    outcomes,
    divergence,
    findings: {
      multi_model_declared: models.length > 1,
      multi_provider_declared: providers.length > 1,
      same_request_divergence_in_supplied_records: divergence.length > 0,
      multi_model_observation: false,
      multi_provider_observation: false,
      same_request_divergence_observed: false,
      provider_execution_verified: false,
      universal_provider_behavior_established: false,
      provider_internal_policy_enforcement_observed: false
    },
    claim_ceiling: [
      'population is exactly the supplied episode declarations',
      'output differences are computed within that declared set; receiver-label differences alone are insufficient',
      'finite observed episodes do not establish universal provider behavior',
      'transport outcome and returned bytes do not reveal hidden provider policy state'
    ]
  });
}

export function inspectTd613CustodyAncestry(input = {}) {
  input = record(input);
  const stage = record(input.stage_receipt);
  const head = record(input.head);
  const auth = record(stage.auth);
  const bodyShape = stage?.schema === 'td613.loom.demo-stage-receipt/v0.2'
    && stage?.admission_state === 'ADMITTED'
    && stage?.authority_transferred === false
    && ['ACTIVATE', 'CONTINUE'].includes(stage?.phase)
    && ['activation_digest', 'request_digest', 'current_input_digest', 'result_digest'].every(key => sha256(stage[key]))
    && /^[a-zA-Z0-9_-]{1,100}$/.test(identifier(stage?.request_id))
    && time(stage?.expires_at) !== null
    && stage?.stage_policy === (stage?.phase === 'ACTIVATE' ? 'AIA_ONLY' : 'SELECTED_FILES_BOUND')
    && (stage?.prior_result_digest === null || sha256(stage?.prior_result_digest))
    && (stage?.phase === 'ACTIVATE' ? stage?.predecessor_receipt_digest === null : sha256(stage?.predecessor_receipt_digest));
  const authShape = auth?.scheme === 'hmac-sha256'
    && auth?.key_id === 'td613-loom-demo-stage-v1'
    && typeof auth?.tag === 'string' && /^[A-Za-z0-9_-]{43}$/.test(auth.tag);
  const durable = head?.durable === true && sha256(head?.receipt_digest);
  return localReceipt({
    schema: DOLLHOUSE_ANCESTRY_SCHEMA,
    receipt_body_shape_valid: bodyShape,
    body_valid: false,
    signed_receipt_shape_observed: authShape,
    durable_head_declared: durable,
    receipt_and_head_shapes_present: bodyShape && authShape && durable,
    head_receipt_digest_declared: sha256(head?.receipt_digest) ? head.receipt_digest : null,
    status: 'HELD',
    findings: {
      td613_cross_instance_custody_ancestry_observed: false,
      cryptographic_signature_verified_by_this_browser_instrument: false,
      head_receipt_binding_verified: false,
      durable_head_authenticated: false,
      foreign_provider_content_origin_authenticated: false,
      provider_internal_execution_authenticated: false
    },
    claim_ceiling: [
      'this instrument inspects supplied TD613 custody receipt and durable-head shapes only',
      'matching shapes, digests and a declared durable flag do not establish authenticated ancestry',
      'the live server/Neon path is responsible for signature and head enforcement',
      'TD613 custody ancestry is not foreign-provider semantic origin'
    ]
  });
}

export function readReceiverChallengeVerification(input = {}) {
  input = record(input);
  if (input?.schema !== 'td613.loom.receiver-challenge-verification/v0.1') {
    return localReceipt({
      schema: DOLLHOUSE_CHALLENGE_READOUT_SCHEMA,
      status: 'HELD_INPUT_CLASS',
      reason: 'td613.loom.receiver-challenge-verification/v0.1 required',
      hidden_host_resolved: false
    });
  }
  const capture = record(input.capture), reconstruction = record(input.protected_reconstruction);
  const missing = capture.required_missing_channels ?? [];
  const recovered = reconstruction.recovered_probe_ids ?? [];
  if (!boundedIdentifiers(missing) || !boundedIdentifiers(recovered)) return localReceipt({
    schema: DOLLHOUSE_CHALLENGE_READOUT_SCHEMA,
    status: 'HELD_INPUT_CLASS',
    reason: 'bounded arrays of channel and probe identifiers required',
    hidden_host_resolved: false
  });
  const exposure = input.status === 'OBSERVED_EXPOSURE'
    || record(input.literal_exclusion).status === 'OBSERVED_LITERAL_DISCLOSURE'
    || recovered.length > 0;
  const hidden = record(input.hidden_host);
  const hiddenKeys = ['retention', 'training', 'internal_memory_state', 'unobserved_retransmission'];
  return localReceipt({
    schema: DOLLHOUSE_CHALLENGE_READOUT_SCHEMA,
    evidence_class_declared: identifier(input.evidence_class) || null,
    challenge_ref: identifier(input.ref) || null,
    status: 'DECLARED_CHALLENGE_READOUT',
    challenge_status_declared: identifier(input.status) || null,
    exposure_declared: exposure,
    exposure_observed: false,
    required_missing_channels: Array.from({ length: missing.length }, (_, index) => identifier(arrayValue(missing, index))),
    recovered_probe_ids: Array.from({ length: recovered.length }, (_, index) => identifier(arrayValue(recovered, index))),
    hidden_host_declared: Object.fromEntries(hiddenKeys.map(key => [key, identifier(hidden[key]) || 'UNRESOLVED'])),
    hidden_host: Object.fromEntries(hiddenKeys.map(key => [key, 'UNRESOLVED'])),
    hidden_host_resolved: false,
    challenge_reference_verified: false,
    claim_ceiling: [
      'challenge results apply only to the declared probes and captured channels',
      'a supplied exposure declaration remains separate from independently observed exposure',
      'absence of exposure does not resolve hidden retention, training, memory or unobserved retransmission'
    ]
  });
}

export function compileExogenousWitnessCandidate(input = {}) {
  input = record(input);
  const sourceUrl = text(input.source_url).trim();
  const sourceBodySha256 = text(input.source_body_sha256).trim().toLowerCase();
  const acquisitionMethod = text(input.acquisition_method).trim().toUpperCase();
  const relationship = text(input.relationship_to_admitted_record).trim();
  const errors = [];
  let parsed = null;
  try { parsed = new URL(sourceUrl); } catch {}
  if (!parsed || parsed.protocol !== 'https:' || parsed.username || parsed.password) errors.push('HTTPS_SOURCE_URL_REQUIRED');
  if (!/^[a-f0-9]{64}$/.test(sourceBodySha256)) errors.push('SOURCE_BODY_SHA256_REQUIRED');
  if (!['LIVE_EXTERNAL_RETRIEVAL', 'OPERATOR_SUPPLIED_EXTERNAL_CAPTURE', 'REPOSITORY_ONLY'].includes(acquisitionMethod)) {
    errors.push('ACQUISITION_METHOD_UNSUPPORTED');
  }
  if (!relationship) errors.push('RELATIONSHIP_TO_ADMITTED_RECORD_REQUIRED');
  const liveExternal = acquisitionMethod === 'LIVE_EXTERNAL_RETRIEVAL';
  const referenceKeys = ['acquisition_event_id', 'source_revision', 'custody_reference', 'measurement_reference'];
  const missingReferences = referenceKeys.filter(key => !identifier(input[key]));
  if (time(input.acquired_at) === null) missingReferences.push('acquired_at');
  return localReceipt({
    schema: DOLLHOUSE_EXOGENOUS_WITNESS_SCHEMA,
    acquisition_event_id: identifier(input.acquisition_event_id) || null,
    acquired_at_declared: time(input.acquired_at),
    source_url: sourceUrl || null,
    source_body_sha256: sourceBodySha256 || null,
    acquisition_method: acquisitionMethod || null,
    relationship_to_admitted_record: relationship || null,
    references: Object.fromEntries(referenceKeys.map(key => [key, identifier(input[key]) || null])),
    missing_references: missingReferences,
    status: errors.length ? 'INADMISSIBLE' : 'HELD',
    errors,
    findings: {
      live_external_retrieval_declared: liveExternal,
      materially_new_evidentiary_substrate_candidate: false,
      materially_new_substrate_declared: input.materially_new_substrate === true,
      source_references_verified: false,
      independent_origin_authenticated_by_this_instrument: false,
      empirical_exteriority_earned: false,
      western_research_field_reopening_candidate: false
    },
    claim_ceiling: [
      'a recorded external acquisition event is not proof of exterior origin from the record alone',
      'repository-only bytes cannot bootstrap exteriority',
      'a live-retrieval label is a declaration; it does not establish that acquisition occurred or reopen the research field',
      'independence and relevance still require source-specific adjudication'
    ]
  });
}

const GOLDEN_SURFACES = Object.freeze(['L', 'R', 'J', 'G', 'C']);
// These are accepted declaration classes, never authentication by this adapter.
const EMPIRICAL_SURFACE_CLASSES = new Set([
  'EMPIRICAL_ACQUISITION', 'PUBLIC_EMPIRICAL_CASE', 'VALIDATION_GATED_DEPLOYED_BOUNDARY_OBSERVED'
]);

export function evaluateGoldenEggEpisodeCandidate(spec = {}) {
  spec = record(spec);
  const errors = [];
  const episodeId = identifier(spec.episode_id);
  const custodyId = identifier(spec.custody_id);
  const comparisonFrameId = identifier(spec.comparison_frame_id);
  const departureId = identifier(spec.common_departure_id);
  const preregistration = identifier(spec.preregistration_reference);
  const preregisteredAt = time(spec.preregistered_at);
  const acquisitionStartedAt = time(spec.acquisition_started_at);
  const binding = { episode_id: episodeId, custody_id: custodyId, comparison_frame_id: comparisonFrameId, common_departure_id: departureId };
  const routes = Array.isArray(spec.routes) && spec.routes.length === 2
    ? Array.from({ length: 2 }, (_, index) => record(arrayValue(spec.routes, index))) : [];
  if (Object.values(binding).some(value => !value)) errors.push('EPISODE_CUSTODY_FRAME_DEPARTURE_REQUIRED');
  if (spec.immutable_episode !== true) errors.push('IMMUTABLE_EPISODE_REQUIRED');
  if (spec.continuous_custody !== true) errors.push('CONTINUOUS_CUSTODY_REQUIRED');
  if (!preregistration || preregisteredAt === null || acquisitionStartedAt === null) errors.push('PREREGISTRATION_AND_ACQUISITION_TIMES_REQUIRED');
  if (preregisteredAt !== null && acquisitionStartedAt !== null && preregisteredAt >= acquisitionStartedAt) errors.push('PREREGISTRATION_MUST_PRECEDE_ACQUISITION');
  if (routes.length !== 2) errors.push('EXACTLY_TWO_ROUTES_REQUIRED');
  const routeIds = routes.map(route => identifier(route.route_id)).filter(Boolean);
  const returnIds = routes.map(route => identifier(route.return_observation_id)).filter(Boolean);
  if (routeIds.length !== 2 || new Set(routeIds).size !== 2) errors.push('DISTINCT_ROUTE_IDS_REQUIRED');
  if (returnIds.length !== 2 || new Set(returnIds).size !== 2) errors.push('DISTINCT_RETURN_OBSERVATIONS_REQUIRED');
  const control = routes.find(route => identifier(route.role).toUpperCase() === 'CONTROL');
  const protectedRoute = routes.find(route => identifier(route.role).toUpperCase() === 'PROTECTED');
  if (!control || !protectedRoute) errors.push('CONTROL_AND_PROTECTED_ROLES_REQUIRED');
  for (const route of routes) {
    if (Object.entries(binding).some(([key, expected]) => !expected || route[key] !== expected)) errors.push('ROUTE_BINDING_MISMATCH');
    if (route.return_observed !== true) errors.push('RETURN_NOT_OBSERVED');
  }

  const metrics = record(spec.metrics), missing = [], evidenceClassMissing = [], unqualified = [];
  const sourceRevisions = new Map();
  const measurementRecords = Object.fromEntries(GOLDEN_SURFACES.map(name => {
    const metric = record(metrics[name]);
    const value = number(metric.value);
    const evidenceClass = identifier(metric.evidence_class);
    const missingReferences = ['source_id', 'source_revision', 'measurement_reference'].filter(key => !identifier(metric[key]));
    const measuredAt = time(metric.observed_at);
    if (!Object.keys(metric).length || metric.measured !== true) missing.push(name);
    if (!evidenceClass) evidenceClassMissing.push(name);
    if (!EMPIRICAL_SURFACE_CLASSES.has(evidenceClass)
      || (metric.synthetic !== undefined && metric.synthetic !== false)
      || (spec.synthetic !== undefined && spec.synthetic !== false)
      || (spec.evidence_class !== undefined && !EMPIRICAL_SURFACE_CLASSES.has(identifier(spec.evidence_class)))
      || missingReferences.length || value === null || measuredAt === null) unqualified.push(name);
    const measurementBinding = { ...binding, preregistration_reference: preregistration };
    for (const [key, expected] of Object.entries(measurementBinding)) {
      if (!identifier(metric[key])) {
        if (!unqualified.includes(name)) unqualified.push(name);
      } else if (!expected || metric[key] !== expected) errors.push(`${name}_MEASUREMENT_BINDING_MISMATCH`);
    }
    if (metric.name !== undefined && metric.name !== name) errors.push(`${name}_MEASUREMENT_NAME_MISMATCH`);
    if (value !== null && (value < 0 || value > 1)) errors.push(`${name}_UNIT_INTERVAL_VALUE_REQUIRED`);
    if (measuredAt !== null && acquisitionStartedAt !== null && measuredAt < acquisitionStartedAt) errors.push(`${name}_MEASUREMENT_PRECEDES_ACQUISITION`);
    const sourceId = identifier(metric.source_id), sourceRevision = identifier(metric.source_revision);
    if (sourceId && sourceRevision) {
      if (sourceRevisions.has(sourceId) && sourceRevisions.get(sourceId) !== sourceRevision) errors.push('CONFLICTING_SOURCE_REVISION');
      sourceRevisions.set(sourceId, sourceRevision);
    }
    return [name, {
      ...Object.fromEntries([...Object.keys(measurementBinding), 'source_id', 'source_revision', 'measurement_reference'].map(key => [key, identifier(metric[key]) || null])),
      evidence_class_declared: evidenceClass || null,
      measured_declared: metric.measured === true,
      observed_at_declared: measuredAt,
      value,
      missing_references: missingReferences
    }];
  }));
  const { L: { value: L }, R: { value: R }, J: { value: J } } = measurementRecords;
  const geometry = record(metrics.G), matched = record(metrics.C);
  const G = measurementRecords.G.value === 1 && geometry.empirical_bound === true && Boolean(identifier(geometry.geometry_reference));
  const C = measurementRecords.C.value === 1 && matched.matched_return_observed === true
    && matched.control_route_id === control?.route_id && matched.protected_route_id === protectedRoute?.route_id
    && Boolean(control && protectedRoute)
    && matched.control_return_observation_id === control?.return_observation_id
    && matched.protected_return_observation_id === protectedRoute?.return_observation_id;
  if (!G && !unqualified.includes('G')) unqualified.push('G');
  if (!C && !unqualified.includes('C')) unqualified.push('C');
  const valuesValid = [L, R, J].every(value => value !== null && value >= 0 && value <= 1);
  const thresholdsPass = valuesValid && L <= 0.5 && R <= 0.2 && J <= 0.1 && G && C;

  let status = 'HELD';
  if (errors.length) status = 'INADMISSIBLE';
  else if (missing.length || evidenceClassMissing.length || unqualified.length) status = 'HELD';
  else if (!thresholdsPass) status = 'FAILED';
  else status = 'CANDIDATE';

  return localReceipt({
    schema: DOLLHOUSE_GOLDEN_EGG_SCHEMA,
    episode_id: episodeId || null,
    custody_id: custodyId || null,
    comparison_frame_id: comparisonFrameId || null,
    common_departure_id: departureId || null,
    preregistration_reference: preregistration || null,
    preregistered_at_declared: preregisteredAt,
    acquisition_started_at_declared: acquisitionStartedAt,
    status,
    errors: [...new Set(errors)],
    missing_surfaces: missing,
    missing_evidence_class: evidenceClassMissing,
    unqualified_surfaces: unqualified,
    measurement_records: measurementRecords,
    geometry_declaration: { empirical_bound: geometry.empirical_bound === true, geometry_reference: identifier(geometry.geometry_reference) || null },
    matched_return_declaration: {
      matched_return_observed: matched.matched_return_observed === true,
      ...Object.fromEntries(['control_route_id', 'protected_route_id', 'control_return_observation_id', 'protected_return_observation_id']
        .map(key => [key, identifier(matched[key]) || null]))
    },
    thresholds: { L_max: 0.5, R_max: 0.2, J_max: 0.1, G_empirical_required: true, C_matched_return_required: true },
    declared_values: { L, R, J, G_empirical_bound: G, C_matched_return_observed: C },
    route_ids: routeIds,
    return_observation_ids: returnIds,
    empirical_candidate_qualified: false,
    findings: {
      all_five_same_episode_surface_declarations_present: errors.length === 0 && !missing.length && !unqualified.length,
      thresholds_pass: thresholdsPass,
      common_custody_and_frame_declared: Object.values(binding).every(Boolean) && routes.length === 2
        && !errors.includes('ROUTE_BINDING_MISMATCH') && !errors.some(error => error.endsWith('_MEASUREMENT_BINDING_MISMATCH'))
        && GOLDEN_SURFACES.every(name => Object.keys(binding).every(key => measurementRecords[name][key] === binding[key])),
      independent_evidence_authentication_performed: false
    },
    claim_ceiling: [
      'CANDIDATE means only that the supplied empirical-class declarations, provenance references, same-episode structure and thresholds survived local checks',
      'local evaluation does not authenticate source independence or empirical acquisition',
      'CANDIDATE is not Golden Egg earned'
    ]
  });
}

export function runFourRoleOperationalAudit(input = {}) {
  input = record(input);
  const typed = (value, schema) => record(value).schema === schema ? value : null;
  const device = typed(input.device, DOLLHOUSE_BROWSER_EPISODE_SCHEMA);
  const comprehension = typed(input.comprehension, DOLLHOUSE_COMPREHENSION_SCHEMA);
  const ancestry = typed(input.ancestry, DOLLHOUSE_ANCESTRY_SCHEMA);
  const challenge = typed(input.challenge, DOLLHOUSE_CHALLENGE_READOUT_SCHEMA);
  const golden = typed(input.golden, DOLLHOUSE_GOLDEN_EGG_SCHEMA);
  const exogenous = typed(input.exogenous, DOLLHOUSE_EXOGENOUS_WITNESS_SCHEMA);
  // Recompute finite provider comparisons rather than trusting supplied counts.
  let provider = null;
  if (typed(input.provider, DOLLHOUSE_PROVIDER_MATRIX_SCHEMA)) {
    try { provider = auditProviderObservationMatrix(input.provider.episodes); } catch {}
  }
  let scored = null;
  if (Array.isArray(comprehension?.rows) && comprehension.rows.length === LOOM_COMPREHENSION_QUESTIONS.length) {
    const rows = Array.from({ length: comprehension.rows.length }, (_, index) => record(arrayValue(comprehension.rows, index)));
    const supplied = Object.fromEntries(rows.map(row => [identifier(row.id), row.supplied_index]));
    if (new Set(rows.map(row => identifier(row.id))).size === LOOM_COMPREHENSION_QUESTIONS.length) scored = scoreLoomComprehensionAttempt(supplied);
  }

  const pedagogue = freeze({
    role: 'PEDAGOGUE',
    status: scored?.status === 'COMPLETE' ? 'SCORED_DECLARED_ATTEMPT' : 'HELD',
    findings: [
      scored?.status === 'COMPLETE'
        ? `supplied answer indices scored: ${scored.correct}/${scored.total}`
        : 'no complete declared answer set in this packet',
      'operator comprehension and population-level understanding remain unmeasured'
    ]
  });

  const apertureMissing = [];
  if (!challenge) apertureMissing.push('receiver challenge verification');
  if (!provider?.episode_count) apertureMissing.push('provider observation episode');
  if (!device) apertureMissing.push('browser runtime episode');
  const aperture = freeze({
    role: 'APERTURE',
    status: apertureMissing.length ? 'OPEN' : 'DECLARED_INPUT_SUMMARY',
    findings: [
      'hidden retention/training/memory remain unresolved; this summary authenticates no external witness',
      provider?.episode_count ? `${provider.episode_count} supplied provider episode declaration(s)` : 'provider declaration set empty',
      exogenous ? 'external-source declaration supplied; independent acquisition qualification remains held' : 'no external-source declaration in this packet',
      ...apertureMissing.map(item => `missing: ${item}`)
    ]
  });

  const atlas = freeze({
    role: 'ATLAS',
    status: ancestry ? 'DECLARED_RECEIPT_SHAPE_SUMMARY' : 'OPEN',
    findings: [
      'TD613 ancestry authentication, durable-head binding and foreign semantic origin remain outside this summary',
      provider?.models?.length > 1 ? `supplied episodes retain ${provider.models.length} receiver/model coordinates` : 'multi-model declaration absent',
      Array.isArray(golden?.route_ids) && golden.route_ids.length === 2 && golden.route_ids.every(id => identifier(id)) && new Set(golden.route_ids).size === 2
        ? 'two distinct route identities declared; acquisition remains unauthenticated' : 'two distinct route declarations absent'
    ]
  });

  const fadt = freeze({
    role: 'FADT',
    status: 'HELD_INPUT_CLASS',
    findings: [
      'no finite lawful-action support map or occupied quotient fibres supplied; no admissibility gap computed',
      device ? 'browser episode/source coordinates are present; physical hardware and source authentication remain separate' : 'no typed browser episode supplied',
      'receiver labels, episode labels and role agreement do not establish a finite erasure theorem'
    ]
  });

  return localReceipt({
    schema: DOLLHOUSE_FOUR_ROLE_SCHEMA,
    roles: freeze([pedagogue, aperture, atlas, fadt]),
    independent_role_audits_executed: false,
    agreement_is_evidence_multiplication: false,
    automatic_promotion: false,
    human_closure_required: true
  });
}
