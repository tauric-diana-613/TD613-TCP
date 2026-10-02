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
  return typeof value === 'string' ? value : fallback;
}
function number(value) {
  return Number.isFinite(Number(value)) ? Number(value) : null;
}
function bool(value) {
  return value === true;
}
function safeNow(environment) {
  const value = Number(environment?.Date?.now?.() ?? Date.now());
  return Number.isFinite(value) ? value : Date.now();
}
function media(environment, query) {
  try { return Boolean(environment?.matchMedia?.(query)?.matches); } catch { return false; }
}
function jsonClone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

export function captureBrowserRuntimeEpisode(environment = globalThis, options = {}) {
  const navigator = environment?.navigator || {};
  const vv = environment?.visualViewport || {};
  const screen = environment?.screen || {};
  const now = options.observed_at ?? safeNow(environment);
  const episodeId = text(options.episode_id, `browser-${now}`);
  const payload = {
    schema: DOLLHOUSE_BROWSER_EPISODE_SCHEMA,
    episode_id: episodeId,
    observed_at: now,
    evidence_class: 'LOCAL_BROWSER_RUNTIME_OBSERVATION',
    source_revision: text(options.source_revision, 'UNPINNED_BROWSER_SOURCE'),
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
      mobile_shaped_viewport_observed: Number.isFinite(Number(environment?.innerWidth)) && Number(environment.innerWidth) <= 480,
      physical_hardware_authenticated: false,
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
  const rows = LOOM_COMPREHENSION_QUESTIONS.map(question => {
    const supplied = Number(answerMap?.[question.id]);
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
  return freeze({
    schema: DOLLHOUSE_COMPREHENSION_SCHEMA,
    episode_id: text(options.episode_id, `comprehension-${options.observed_at ?? Date.now()}`),
    observed_at: options.observed_at ?? Date.now(),
    evidence_class: 'SELF_ADMINISTERED_OPERATOR_COMPREHENSION',
    status: complete ? 'COMPLETE' : 'INCOMPLETE',
    answered,
    correct,
    total: rows.length,
    score: complete ? correct / rows.length : null,
    rows,
    findings: {
      comprehension_measured_for_this_attempt: complete,
      perfect_attempt: complete && correct === rows.length,
      population_generalization: false,
      independent_research_participant_sample: false
    },
    claim_ceiling: [
      'measures only this completed attempt against declared TD613 concepts',
      'self-administered task performance is not a population study',
      'a perfect score does not establish durable understanding or usability'
    ]
  });
}

function normalizeProviderEpisode(input, index) {
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
    observed_at: input.observed_at ?? null,
    evidence_class: text(input.evidence_class, 'PROVIDER_RESPONSE')
  });
}

export function auditProviderObservationMatrix(inputs = []) {
  if (!Array.isArray(inputs) || inputs.length > 64) throw new TypeError('provider observations must be a bounded array');
  const episodes = inputs.map(normalizeProviderEpisode);
  const providers = [...new Set(episodes.map(row => row.provider))].sort();
  const models = [...new Set(episodes.map(row => `${row.provider}/${row.model}`))].sort();
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
    const uniqueOutcomes = [...new Set(rows.map(row => `${row.model}:${row.outcome}:${row.response_digest || 'NO_DIGEST'}`))];
    return uniqueOutcomes.length > 1 ? [freeze({ request_digest, observations: rows.length, unique_outcomes: uniqueOutcomes.length })] : [];
  });
  return freeze({
    schema: DOLLHOUSE_PROVIDER_MATRIX_SCHEMA,
    evidence_class: episodes.length ? 'OBSERVED_PROVIDER_EPISODE_SET' : 'EMPTY',
    episode_count: episodes.length,
    episodes,
    providers,
    models,
    routes,
    outcomes,
    divergence,
    findings: {
      multi_model_observation: models.length > 1,
      multi_provider_observation: providers.length > 1,
      same_request_divergence_observed: divergence.length > 0,
      universal_provider_behavior_established: false,
      provider_internal_policy_enforcement_observed: false
    },
    claim_ceiling: [
      'population is exactly the supplied observed episodes',
      'cross-model divergence can falsify a scalar-behavior assumption inside the observed set',
      'finite observed episodes do not establish universal provider behavior',
      'transport outcome and returned bytes do not reveal hidden provider policy state'
    ]
  });
}

export function inspectTd613CustodyAncestry(input = {}) {
  const stage = input.stage_receipt || null;
  const head = input.head || null;
  const auth = stage?.auth || null;
  const bodyValid = stage?.schema === 'td613.loom.demo-stage-receipt/v0.2'
    && stage?.admission_state === 'ADMITTED'
    && stage?.authority_transferred === false
    && ['ACTIVATE', 'CONTINUE'].includes(stage?.phase);
  const authShape = auth?.scheme === 'hmac-sha256'
    && auth?.key_id === 'td613-loom-demo-stage-v1'
    && typeof auth?.tag === 'string'
    && auth.tag.length >= 32;
  const durable = head?.durable === true && typeof head?.receipt_digest === 'string' && head.receipt_digest.length >= 32;
  return freeze({
    schema: DOLLHOUSE_ANCESTRY_SCHEMA,
    evidence_class: 'TD613_CUSTODY_RECEIPT_OBSERVATION',
    body_valid: bodyValid,
    signed_receipt_shape_observed: authShape,
    durable_head_declared: durable,
    status: bodyValid && authShape && durable ? 'TD613_CUSTODY_ANCESTRY_PRESENT' : 'HELD',
    findings: {
      td613_cross_instance_custody_ancestry_observed: bodyValid && authShape && durable,
      cryptographic_signature_verified_by_this_browser_instrument: false,
      foreign_provider_content_origin_authenticated: false,
      provider_internal_execution_authenticated: false
    },
    claim_ceiling: [
      'this instrument inspects the returned TD613 custody receipt and durable-head shape',
      'the live server/Neon path is responsible for signature and head enforcement',
      'TD613 custody ancestry is not foreign-provider semantic origin'
    ]
  });
}

export function readReceiverChallengeVerification(input = {}) {
  if (input?.schema !== 'td613.loom.receiver-challenge-verification/v0.1') {
    return freeze({
      schema: DOLLHOUSE_CHALLENGE_READOUT_SCHEMA,
      status: 'HELD_INPUT_CLASS',
      reason: 'td613.loom.receiver-challenge-verification/v0.1 required',
      hidden_host_resolved: false
    });
  }
  const exposure = input.status === 'OBSERVED_EXPOSURE'
    || input.literal_exclusion?.status === 'OBSERVED_LITERAL_DISCLOSURE'
    || (input.protected_reconstruction?.recovered_probe_ids || []).length > 0;
  const hidden = input.hidden_host || {};
  return freeze({
    schema: DOLLHOUSE_CHALLENGE_READOUT_SCHEMA,
    evidence_class: input.evidence_class,
    challenge_ref: input.ref || null,
    status: input.status,
    exposure_observed: exposure,
    required_missing_channels: [...(input.capture?.required_missing_channels || [])],
    recovered_probe_ids: [...(input.protected_reconstruction?.recovered_probe_ids || [])],
    hidden_host: {
      retention: text(hidden.retention, 'UNRESOLVED'),
      training: text(hidden.training, 'UNRESOLVED'),
      internal_memory_state: text(hidden.internal_memory_state, 'UNRESOLVED'),
      unobserved_retransmission: text(hidden.unobserved_retransmission, 'UNRESOLVED')
    },
    hidden_host_resolved: ['retention', 'training', 'internal_memory_state', 'unobserved_retransmission']
      .every(key => hidden?.[key] && hidden[key] !== 'UNRESOLVED'),
    claim_ceiling: [
      'challenge results apply only to the declared probes and captured channels',
      'observed exposure is positive bounded evidence',
      'absence of exposure does not resolve hidden retention, training, memory or unobserved retransmission'
    ]
  });
}

export function compileExogenousWitnessCandidate(input = {}) {
  const sourceUrl = text(input.source_url).trim();
  const sourceBodySha256 = text(input.source_body_sha256).trim().toLowerCase();
  const acquisitionMethod = text(input.acquisition_method).trim().toUpperCase();
  const relationship = text(input.relationship_to_admitted_record).trim();
  const errors = [];
  let parsed = null;
  try { parsed = new URL(sourceUrl); } catch {}
  if (!parsed || parsed.protocol !== 'https:') errors.push('HTTPS_SOURCE_URL_REQUIRED');
  if (!/^[a-f0-9]{64}$/.test(sourceBodySha256)) errors.push('SOURCE_BODY_SHA256_REQUIRED');
  if (!['LIVE_EXTERNAL_RETRIEVAL', 'OPERATOR_SUPPLIED_EXTERNAL_CAPTURE', 'REPOSITORY_ONLY'].includes(acquisitionMethod)) {
    errors.push('ACQUISITION_METHOD_UNSUPPORTED');
  }
  if (!relationship) errors.push('RELATIONSHIP_TO_ADMITTED_RECORD_REQUIRED');
  const liveExternal = acquisitionMethod === 'LIVE_EXTERNAL_RETRIEVAL';
  const repositoryOnly = acquisitionMethod === 'REPOSITORY_ONLY';
  return freeze({
    schema: DOLLHOUSE_EXOGENOUS_WITNESS_SCHEMA,
    acquisition_event_id: text(input.acquisition_event_id, `exogenous-${input.acquired_at ?? Date.now()}`),
    acquired_at: input.acquired_at ?? Date.now(),
    source_url: sourceUrl || null,
    source_body_sha256: sourceBodySha256 || null,
    acquisition_method: acquisitionMethod || null,
    relationship_to_admitted_record: relationship || null,
    status: errors.length ? 'INADMISSIBLE' : liveExternal ? 'EXOGENOUS_CANDIDATE' : 'RECORDED_EXTERNAL_MATERIAL',
    errors,
    findings: {
      live_external_retrieval_declared: liveExternal,
      materially_new_evidentiary_substrate_candidate: liveExternal && !repositoryOnly,
      independent_origin_authenticated_by_this_instrument: false,
      empirical_exteriority_earned: false,
      western_research_field_reopening_candidate: liveExternal && !errors.length
    },
    claim_ceiling: [
      'a recorded external acquisition event is not proof of exterior origin from the record alone',
      'repository-only bytes cannot bootstrap exteriority',
      'a live external retrieval candidate can reopen a research question without earning target-artifact origin or Golden Egg credit',
      'independence and relevance still require source-specific adjudication'
    ]
  });
}

function metricValue(metric) {
  return number(metric?.value);
}
function sameEpisode(metric, episodeId) {
  return metric?.episode_id === episodeId && metric?.measured === true;
}

export function evaluateGoldenEggEpisodeCandidate(spec = {}) {
  const errors = [];
  const episodeId = text(spec.episode_id).trim();
  const custodyId = text(spec.custody_id).trim();
  const comparisonFrameId = text(spec.comparison_frame_id).trim();
  const routes = Array.isArray(spec.routes) ? spec.routes : [];
  if (!episodeId || !custodyId || !comparisonFrameId) errors.push('EPISODE_CUSTODY_FRAME_REQUIRED');
  if (routes.length !== 2) errors.push('EXACTLY_TWO_ROUTES_REQUIRED');
  const routeIds = routes.map(route => text(route?.route_id).trim()).filter(Boolean);
  if (routeIds.length !== 2 || new Set(routeIds).size !== 2) errors.push('DISTINCT_ROUTE_IDS_REQUIRED');
  for (const route of routes) {
    if (route?.custody_id !== custodyId || route?.comparison_frame_id !== comparisonFrameId || route?.episode_id !== episodeId) {
      errors.push('ROUTE_BINDING_MISMATCH');
    }
    if (route?.return_observed !== true) errors.push('RETURN_NOT_OBSERVED');
  }

  const metrics = spec.metrics || {};
  const required = ['L', 'R', 'J', 'G', 'C'];
  const missing = required.filter(name => !sameEpisode(metrics[name], episodeId));
  const evidenceClassMissing = required.filter(name => !text(metrics[name]?.evidence_class).trim());
  const L = metricValue(metrics.L);
  const R = metricValue(metrics.R);
  const J = metricValue(metrics.J);
  const G = metrics.G?.empirical_bound === true;
  const C = metrics.C?.matched_return_observed === true;
  const thresholdsPass = L !== null && R !== null && J !== null && L <= 0.5 && R <= 0.2 && J <= 0.1 && G && C;

  let status = 'HELD';
  if (errors.length) status = 'INADMISSIBLE';
  else if (missing.length || evidenceClassMissing.length) status = 'HELD';
  else if (!thresholdsPass) status = 'FAILED';
  else status = 'CANDIDATE';

  return freeze({
    schema: DOLLHOUSE_GOLDEN_EGG_SCHEMA,
    episode_id: episodeId || null,
    custody_id: custodyId || null,
    comparison_frame_id: comparisonFrameId || null,
    status,
    errors: [...new Set(errors)],
    missing_surfaces: missing,
    missing_evidence_class: evidenceClassMissing,
    thresholds: { L_max: 0.5, R_max: 0.2, J_max: 0.1, G_empirical_required: true, C_matched_return_required: true },
    observed: { L, R, J, G_empirical_bound: G, C_matched_return_observed: C },
    route_ids: routeIds,
    golden_egg_earned: false,
    findings: {
      all_five_same_episode_surfaces_present: !missing.length,
      thresholds_pass: thresholdsPass,
      common_custody_and_frame: !errors.includes('ROUTE_BINDING_MISMATCH'),
      independent_evidence_authentication_performed: false
    },
    claim_ceiling: [
      'CANDIDATE means the supplied same-episode structure and thresholds survived this local evaluator',
      'local evaluation does not authenticate source independence or empirical acquisition',
      'CANDIDATE is not Golden Egg earned'
    ]
  });
}

export function runFourRoleOperationalAudit(input = {}) {
  const device = input.device || null;
  const comprehension = input.comprehension || null;
  const provider = input.provider || null;
  const ancestry = input.ancestry || null;
  const challenge = input.challenge || null;
  const golden = input.golden || null;
  const exogenous = input.exogenous || null;

  const pedagogue = freeze({
    role: 'PEDAGOGUE',
    status: comprehension?.status === 'COMPLETE' ? 'MEASURED_ATTEMPT' : 'HELD',
    findings: [
      comprehension?.findings?.comprehension_measured_for_this_attempt
        ? `operator comprehension attempt measured: ${comprehension.correct}/${comprehension.total}`
        : 'operator comprehension has not been measured in this packet',
      'measurement precedes any population-level comprehension claim'
    ]
  });

  const apertureMissing = [];
  if (!challenge) apertureMissing.push('receiver challenge verification');
  if (!provider?.episode_count) apertureMissing.push('provider observation episode');
  if (!device) apertureMissing.push('browser runtime episode');
  const aperture = freeze({
    role: 'APERTURE',
    status: apertureMissing.length ? 'OPEN' : 'BOUNDED_OBSERVATION_SET',
    findings: [
      challenge?.hidden_host_resolved ? 'hidden-host state supplied as resolved by a qualifying external witness' : 'hidden retention/training/memory remain unresolved',
      provider?.episode_count ? `${provider.episode_count} provider episode(s) occupy the observed population` : 'provider population empty',
      exogenous?.findings?.materially_new_evidentiary_substrate_candidate ? 'materially new exogenous substrate candidate recorded' : 'no live exogenous witness candidate in this packet',
      ...apertureMissing.map(item => `missing: ${item}`)
    ]
  });

  const atlas = freeze({
    role: 'ATLAS',
    status: ancestry?.status === 'TD613_CUSTODY_ANCESTRY_PRESENT' ? 'TD613_ANCESTRY_OBSERVED' : 'OPEN',
    findings: [
      ancestry?.findings?.td613_cross_instance_custody_ancestry_observed
        ? 'TD613 custody ancestry is present without collapsing it into foreign semantic origin'
        : 'no current TD613 custody receipt/head pair admitted here',
      provider?.models?.length > 1 ? `receiver/model relation preserved across ${provider.models.length} model coordinates` : 'multi-model relation not yet occupied',
      golden?.route_ids?.length === 2 ? 'Golden Egg candidate preserves two distinct route identities' : 'two-route Golden Egg relation absent'
    ]
  });

  const fadt = freeze({
    role: 'FADT',
    status: 'AUDITED',
    findings: [
      provider?.models?.length > 1 ? 'erasing model identity would collapse observed provider distinctions' : 'model-erasure gap not yet witnessed',
      device ? 'erasing source revision/device episode would overgeneralize the browser observation' : 'no device episode to test',
      golden?.status === 'CANDIDATE' ? 'erasing episode/custody/frame would invalidate the same-episode candidate' : 'Golden Egg candidate fibre remains unoccupied'
    ]
  });

  return freeze({
    schema: DOLLHOUSE_FOUR_ROLE_SCHEMA,
    roles: freeze([pedagogue, aperture, atlas, fadt]),
    agreement_is_evidence_multiplication: false,
    automatic_promotion: false,
    human_closure_required: true
  });
}
