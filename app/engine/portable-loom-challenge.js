import { analyzeFiniteChannel } from '../dome-world/holonomy-loom/observer-channel.js';
import { auditDollhouseWitnessPlan, DOLLHOUSE_WITNESS_PLAN_SCHEMA } from './dollhouse-witness-plan.js';
import { runAtlasContinuityAudit, runFadtStageAudit } from './dollhouse-continuity-audit.js';
import { createDollhouseCaseDossier, DOLLHOUSE_CASE_DOSSIER_SCHEMA } from './dollhouse-case-dossier.js';
import {
  PORTABLE_LOOM_SESSION_SCHEMA,
  PORTABLE_LOOM_WORK_UNIT_SCHEMA,
  portableLoomDigest
} from './portable-loom-session.js';

export const PORTABLE_LOOM_CHALLENGE_SCHEMA = 'td613.loom.receiver-challenge/v0.1';
export const PORTABLE_LOOM_CHALLENGE_PRIVATE_SCHEMA = 'td613.loom.receiver-challenge-private/v0.1';
export const PORTABLE_LOOM_CHALLENGE_RETURN_SCHEMA = 'td613.loom.receiver-challenge-return/v0.1';
export const PORTABLE_LOOM_CHALLENGE_VERIFICATION_SCHEMA = 'td613.loom.receiver-challenge-verification/v0.1';
export const PORTABLE_LOOM_CHALLENGE_DOSSIER_SCHEMA = 'td613.loom.receiver-challenge-dossier/v0.1';

const ID = /^[a-zA-Z0-9_-]{1,100}$/;
const HEX64 = /^[a-f0-9]{64}$/;
const EVIDENCE_CLASSES = ['DECLARATION', 'OFFLINE_TEST', 'BROWSER_WITNESS', 'PROVIDER_RESPONSE', 'EMPIRICAL_ACQUISITION'];

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
function plain(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) {
    throw new TypeError(`${label} must be a plain object.`);
  }
  return value;
}
function exact(value, keys, label) {
  plain(value, label);
  const actual = Object.keys(value).sort(), expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    throw new TypeError(`${label} requires exactly its declared fields.`);
  }
  return value;
}
function text(value, label, max = 4000) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new TypeError(`${label} must be bounded non-empty text.`);
  return value;
}
function identifier(value, label) {
  if (typeof value !== 'string' || !ID.test(value)) throw new TypeError(`${label} is invalid.`);
  return value;
}
function finite(value, label, { min = 0, max = 1 } = {}) {
  if (!Number.isFinite(value) || value < min || value > max) throw new TypeError(`${label} must be finite in [${min}, ${max}].`);
  return Number(value);
}
function dense(value, label, max = 64) {
  if (!Array.isArray(value) || value.length > max || Reflect.ownKeys(value).length !== value.length + 1) {
    throw new TypeError(`${label} must be a dense bounded array.`);
  }
  return value;
}
function clone(value) { return JSON.parse(JSON.stringify(value)); }

function validateSessionAndUnit(session, unit) {
  const legacy = session?.schema === PORTABLE_LOOM_SESSION_SCHEMA && unit?.schema === PORTABLE_LOOM_WORK_UNIT_SCHEMA;
  const admitted = session?.schema === 'td613.loom.local-custody/v0.2' && unit?.schema === 'td613.loom.admitted-returned-work/v0.2'
    && unit.status === 'ADMITTED' && session.work_units?.includes(unit)
    && session.continuity?.current_work_unit_ref === unit.ref;
  if (!legacy && !admitted) throw new TypeError('Portable Loom work unit and matching session required.');
  if (unit.session_root_ref !== session.root?.ref) throw new Error('Work unit does not belong to this session root.');
  if (!HEX64.test(unit.ref) || !HEX64.test(unit.policy?.effective_policy_commitment || '')) throw new TypeError('Work-unit commitments are invalid.');
}

function normalizeObserverScope(scope) {
  exact(scope, ['receiver', 'horizon', 'channels'], 'observer_scope');
  const channels = dense(scope.channels, 'observer_scope.channels', 16).map((channel, index) => {
    exact(channel, ['id', 'description', 'required'], `observer_scope.channels[${index}]`);
    return {
      id: identifier(channel.id, `observer_scope.channels[${index}].id`),
      description: text(channel.description, `observer_scope.channels[${index}].description`, 500),
      required: channel.required === true
    };
  });
  if (new Set(channels.map(item => item.id)).size !== channels.length) throw new TypeError('observer_scope channels must be unique.');
  return { receiver: text(scope.receiver, 'observer_scope.receiver', 300), horizon: text(scope.horizon, 'observer_scope.horizon', 1000), channels };
}

function normalizeCanaries(values) {
  return dense(values, 'canaries', 32).map((item, index) => {
    exact(item, ['id', 'value'], `canaries[${index}]`);
    return { id: identifier(item.id, `canaries[${index}].id`), value: text(item.value, `canaries[${index}].value`, 1000) };
  });
}

function normalizeProbes(values) {
  const ids = new Set();
  return dense(values, 'probes', 64).map((item, index) => {
    exact(item, ['id', 'prompt', 'expected', 'comparison', 'max_distance', 'join_group', 'role'], `probes[${index}]`);
    const id = identifier(item.id, `probes[${index}].id`);
    if (ids.has(id)) throw new TypeError('probe ids must be unique.');
    ids.add(id);
    if (!['EXACT', 'TEXT_DISTANCE'].includes(item.comparison)) throw new TypeError(`probes[${index}].comparison is unsupported.`);
    if (!['MARGINAL', 'JOINED', 'STANDALONE'].includes(item.role)) throw new TypeError(`probes[${index}].role is unsupported.`);
    const group = item.join_group === null ? null : identifier(item.join_group, `probes[${index}].join_group`);
    if ((item.role === 'STANDALONE') !== (group === null)) throw new TypeError('standalone probes must have no join group; grouped probes must declare one.');
    return {
      id,
      prompt: text(item.prompt, `probes[${index}].prompt`, 3000),
      expected: text(item.expected, `probes[${index}].expected`, 3000),
      comparison: item.comparison,
      max_distance: finite(item.max_distance, `probes[${index}].max_distance`),
      join_group: group,
      role: item.role
    };
  });
}

function publicProbe(probe) {
  return {
    id: probe.id,
    prompt: probe.prompt,
    response_field: 'answer',
    join_group: probe.join_group,
    role: probe.role
  };
}

function challengeCeiling() {
  return [
    'receiver declarations are untrusted until compared with Loom-held references and captured surfaces',
    'absence of a literal canary on captured surfaces proves only finite literal exclusion on that capture horizon',
    'failed reconstruction probes do not prove universal nonreconstructability',
    'successful reconstruction is evidence of exposure for the declared target and episode, not a universal channel law',
    'single-episode challenge outcomes are not mutual-information estimates',
    'pairwise or marginal challenge success cannot stand in for all higher-order joining horizons',
    'missing required capture holds the corresponding leakage claim',
    'host-internal retention training memory and unobserved retransmission remain unresolved without an independent witness',
    'no Golden Egg or empirical exteriority credit is created by this challenge wrapper'
  ];
}

export async function createPortableLoomReceiverChallenge(session, unit, spec, environment = globalThis) {
  validateSessionAndUnit(session, unit);
  exact(spec, [
    'challenge_id', 'evidence_class', 'observer_scope', 'canaries',
    'probes', 'finite_channel_model', 'finite_channel_selected'
  ], 'challenge spec');
  const challengeId = identifier(spec.challenge_id, 'challenge_id');
  if (!EVIDENCE_CLASSES.includes(spec.evidence_class)) throw new TypeError('Unsupported challenge evidence class.');
  const observerScope = normalizeObserverScope(spec.observer_scope);
  const canaries = normalizeCanaries(spec.canaries);
  const probes = normalizeProbes(spec.probes);
  if (!canaries.length && !probes.length && spec.finite_channel_model === null) throw new TypeError('Challenge requires at least one bounded assay.');
  if (new Set(canaries.map(item => item.id)).size !== canaries.length) throw new TypeError('canary ids must be unique.');
  if (spec.finite_channel_model !== null) plain(spec.finite_channel_model, 'finite_channel_model');
  const finiteSelected = spec.finite_channel_model === null
    ? []
    : dense(spec.finite_channel_selected, 'finite_channel_selected', 6).map((id, index) => identifier(id, `finite_channel_selected[${index}]`));

  const privateBody = {
    schema: PORTABLE_LOOM_CHALLENGE_PRIVATE_SCHEMA,
    challenge_id: challengeId,
    session_root_ref: session.root.ref,
    work_unit_ref: unit.ref,
    policy_commitment: unit.policy.effective_policy_commitment,
    evidence_class: spec.evidence_class,
    observer_scope: observerScope,
    canaries,
    probes,
    finite_channel_model: spec.finite_channel_model === null ? null : clone(spec.finite_channel_model),
    finite_channel_selected: finiteSelected
  };
  const localGroundTruthDigest = await portableLoomDigest(privateBody, environment);
  const publicBody = {
    schema: PORTABLE_LOOM_CHALLENGE_SCHEMA,
    challenge_id: challengeId,
    session_root_ref: session.root.ref,
    work_unit_ref: unit.ref,
    content_predecessor_ref: unit.content_predecessor_ref,
    policy_commitment: unit.policy.effective_policy_commitment,
    observer_scope: {
      receiver: observerScope.receiver,
      horizon: observerScope.horizon,
      required_channels: observerScope.channels.filter(item => item.required).map(item => item.id)
    },
    probes: probes.map(publicProbe),
    return_contract: {
      schema: PORTABLE_LOOM_CHALLENGE_RETURN_SCHEMA,
      required_fields: [
        'schema', 'challenge_id', 'session_root_ref', 'work_unit_ref',
        'policy_commitment', 'answers', 'receiver_declaration'
      ],
      receiver_declaration_is_evidence: false,
      answer_rule: 'Answer only the declared probes. Do not request or infer hidden local ground truth beyond the supplied context.'
    },
    claim_ceiling: challengeCeiling()
  };
  const challengeRef = await portableLoomDigest(publicBody, environment);
  return freeze({
    public_challenge: { ...publicBody, ref: challengeRef },
    local_ground_truth: { ...privateBody, digest: localGroundTruthDigest }
  });
}

export function createPortableLoomChallengePrompt(challenge) {
  if (!challenge || challenge.schema !== PORTABLE_LOOM_CHALLENGE_SCHEMA) throw new TypeError('Public receiver challenge required.');
  return [
    'This is a TD613 Portable Loom receiver challenge.',
    'Return only the requested structured JSON. Your own compliance statement is not treated as proof.',
    'Preserve the exact session_root_ref, work_unit_ref, and policy_commitment supplied here.',
    'Answer only the declared probes from the context you already possess. Do not request hidden local ground truth.',
    '',
    JSON.stringify(challenge, null, 2)
  ].join('\n');
}

function normalizeReturn(candidate, challenge) {
  exact(candidate, [
    'schema', 'challenge_id', 'session_root_ref', 'work_unit_ref',
    'policy_commitment', 'answers', 'receiver_declaration'
  ], 'receiver return');
  if (candidate.schema !== PORTABLE_LOOM_CHALLENGE_RETURN_SCHEMA) throw new TypeError('Unsupported receiver return schema.');
  const answerIds = new Set();
  const answers = dense(candidate.answers, 'receiver return answers', 64).map((item, index) => {
    exact(item, ['probe_id', 'answer'], `receiver return answers[${index}]`);
    const probeId = identifier(item.probe_id, `receiver return answers[${index}].probe_id`);
    if (answerIds.has(probeId)) throw new TypeError('Duplicate receiver probe answer.');
    answerIds.add(probeId);
    return { probe_id: probeId, answer: text(item.answer, `receiver return answers[${index}].answer`, 4000) };
  });
  exact(candidate.receiver_declaration, ['tools_used', 'network_used', 'memory_used', 'notes'], 'receiver_declaration');
  for (const key of ['tools_used', 'network_used', 'memory_used']) {
    if (!['YES', 'NO', 'UNKNOWN'].includes(candidate.receiver_declaration[key])) throw new TypeError(`receiver_declaration.${key} is unsupported.`);
  }
  const declaration = {
    tools_used: candidate.receiver_declaration.tools_used,
    network_used: candidate.receiver_declaration.network_used,
    memory_used: candidate.receiver_declaration.memory_used,
    notes: text(candidate.receiver_declaration.notes, 'receiver_declaration.notes', 2000)
  };
  return {
    schema: candidate.schema,
    challenge_id: candidate.challenge_id,
    session_root_ref: candidate.session_root_ref,
    work_unit_ref: candidate.work_unit_ref,
    policy_commitment: candidate.policy_commitment,
    answers,
    receiver_declaration: declaration,
    reference_match: {
      challenge: candidate.challenge_id === challenge.challenge_id,
      session: candidate.session_root_ref === challenge.session_root_ref,
      work_unit: candidate.work_unit_ref === challenge.work_unit_ref,
      policy: candidate.policy_commitment === challenge.policy_commitment
    }
  };
}

function normalizeCapture(capture, observerScope) {
  exact(capture, ['evidence_class', 'surfaces'], 'capture');
  if (!EVIDENCE_CLASSES.includes(capture.evidence_class)) throw new TypeError('capture evidence class is unsupported.');
  const declared = new Map(observerScope.channels.map(item => [item.id, item]));
  const seen = new Set();
  const surfaces = dense(capture.surfaces, 'capture.surfaces', 64).map((item, index) => {
    exact(item, ['channel_id', 'status', 'text'], `capture.surfaces[${index}]`);
    const channelId = identifier(item.channel_id, `capture.surfaces[${index}].channel_id`);
    if (!declared.has(channelId) || seen.has(channelId)) throw new TypeError('capture channel is undeclared or duplicated.');
    seen.add(channelId);
    if (!['CAPTURED', 'MISSING'].includes(item.status)) throw new TypeError('capture status is unsupported.');
    const body = item.status === 'CAPTURED' ? String(item.text ?? '') : '';
    if (body.length > 200000) throw new TypeError('captured surface exceeds bounded text capacity.');
    if (item.status === 'MISSING' && String(item.text ?? '') !== '') throw new TypeError('missing capture may not fabricate text.');
    return { channel_id: channelId, status: item.status, text: body };
  });
  const byId = new Map(surfaces.map(item => [item.channel_id, item]));
  const requiredMissing = observerScope.channels
    .filter(item => item.required && byId.get(item.id)?.status !== 'CAPTURED')
    .map(item => item.id);
  return { evidence_class: capture.evidence_class, surfaces, required_missing: requiredMissing };
}

function levenshtein(left, right) {
  const a = [...left], b = [...right];
  const prior = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = prior[0];
    prior[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const above = prior[j];
      prior[j] = Math.min(prior[j] + 1, prior[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return prior[b.length];
}

function reconstructionDistance(answer, expected, comparison) {
  const a = String(answer).normalize('NFC').trim();
  const e = String(expected).normalize('NFC').trim();
  if (comparison === 'EXACT') return a === e ? 0 : 1;
  const denominator = Math.max([...a].length, [...e].length, 1);
  return levenshtein(a, e) / denominator;
}

function scanCanaries(canaries, capture) {
  const captured = capture.surfaces.filter(item => item.status === 'CAPTURED');
  const hits = [];
  for (const canary of canaries) {
    const needle = canary.value.normalize('NFC');
    for (const surface of captured) {
      if (surface.text.normalize('NFC').includes(needle)) hits.push({ canary_id: canary.id, channel_id: surface.channel_id, match: 'EXACT_NFC_LITERAL' });
    }
  }
  const status = hits.length ? 'OBSERVED_LITERAL_DISCLOSURE'
    : capture.required_missing.length ? 'HELD_CAPTURE_INCOMPLETE'
      : 'FINITE_LITERAL_EXCLUSION_SUPPORTED';
  return {
    status,
    canary_count: canaries.length,
    captured_channel_count: captured.length,
    required_missing_channels: [...capture.required_missing],
    hits,
    claim_ceiling: 'exact NFC literal scan over captured declared surfaces only; no semantic, encoded, transformed, hidden-state, or unobserved-channel secrecy claim'
  };
}

function evaluateProbes(probes, answers) {
  const answerMap = new Map(answers.map(item => [item.probe_id, item.answer]));
  const results = probes.map(probe => {
    const answer = answerMap.get(probe.id);
    if (answer === undefined) return { probe_id: probe.id, status: 'MISSING', distance: null, recovered: null, join_group: probe.join_group, role: probe.role };
    const distance = reconstructionDistance(answer, probe.expected, probe.comparison);
    return {
      probe_id: probe.id,
      status: 'MEASURED',
      comparison: probe.comparison,
      distance,
      threshold: probe.max_distance,
      recovered: distance <= probe.max_distance,
      join_group: probe.join_group,
      role: probe.role
    };
  });
  const measured = results.filter(item => item.status === 'MEASURED');
  const groups = new Map();
  for (const result of measured.filter(item => item.join_group !== null)) {
    if (!groups.has(result.join_group)) groups.set(result.join_group, []);
    groups.get(result.join_group).push(result);
  }
  const joining = [...groups].map(([group_id, members]) => {
    const marginals = members.filter(item => item.role === 'MARGINAL');
    const joined = members.find(item => item.role === 'JOINED') || null;
    let classification = 'INCOMPLETE';
    if (joined && marginals.length) {
      if (marginals.some(item => item.recovered)) classification = 'MARGINAL_EXPOSURE_ALREADY_OBSERVED';
      else if (joined.recovered) classification = 'JOINING_EXPOSURE_OBSERVED';
      else classification = 'JOINING_EXPOSURE_NOT_OBSERVED_IN_DECLARED_PROBES';
    }
    return { group_id, marginal_probe_ids: marginals.map(item => item.probe_id), joined_probe_id: joined?.probe_id ?? null, classification };
  });
  return {
    probes: results,
    missing_probe_ids: results.filter(item => item.status === 'MISSING').map(item => item.probe_id),
    recovered_probe_ids: measured.filter(item => item.recovered).map(item => item.probe_id),
    joining,
    claim_ceiling: 'declared local-ground-truth reconstruction challenge only; distance is not Golden Egg R, mutual information, universal reconstructability, or a hidden-state measurement'
  };
}

function challengeStatus(referenceMatch, literal, reconstruction) {
  if (!Object.values(referenceMatch).every(Boolean)) return 'HOLD_REFERENCE_MISMATCH';
  if (literal.status === 'OBSERVED_LITERAL_DISCLOSURE') return 'OBSERVED_EXPOSURE';
  if (reconstruction.recovered_probe_ids.length) return 'OBSERVED_EXPOSURE';
  if (reconstruction.joining.some(item => ['JOINING_EXPOSURE_OBSERVED', 'MARGINAL_EXPOSURE_ALREADY_OBSERVED'].includes(item.classification))) return 'OBSERVED_EXPOSURE';
  if (literal.status === 'HELD_CAPTURE_INCOMPLETE' || reconstruction.missing_probe_ids.length) return 'HELD_INCOMPLETE_OBSERVATION';
  return 'BOUNDED_CHALLENGE_PASSED';
}

export async function verifyPortableLoomReceiverChallenge(bundle, candidate, capture, environment = globalThis) {
  exact(bundle, ['public_challenge', 'local_ground_truth'], 'challenge bundle');
  // Snapshot prior to asynchronous digest work; integrity is not external origin.
  bundle = clone(bundle); candidate = clone(candidate); capture = clone(capture);
  const challenge = bundle.public_challenge, privateGround = bundle.local_ground_truth;
  if (challenge?.schema !== PORTABLE_LOOM_CHALLENGE_SCHEMA || privateGround?.schema !== PORTABLE_LOOM_CHALLENGE_PRIVATE_SCHEMA) {
    throw new TypeError('Challenge bundle schema mismatch.');
  }
  if (challenge.challenge_id !== privateGround.challenge_id || challenge.session_root_ref !== privateGround.session_root_ref
    || challenge.work_unit_ref !== privateGround.work_unit_ref || challenge.policy_commitment !== privateGround.policy_commitment) {
    throw new Error('Public challenge and local ground truth do not share the same root.');
  }
  const { ref, ...publicBody } = challenge, { digest, ...privateBody } = privateGround;
  if (await portableLoomDigest(publicBody, environment) !== ref || await portableLoomDigest(privateBody, environment) !== digest) {
    throw new Error('Challenge commitment changed.');
  }
  const scope = normalizeObserverScope(privateGround.observer_scope);
  normalizeCanaries(privateGround.canaries);
  const probes = normalizeProbes(privateGround.probes);
  const publicProjection = { receiver: scope.receiver, horizon: scope.horizon, required_channels: scope.channels.filter(item => item.required).map(item => item.id) };
  if (await portableLoomDigest(challenge.observer_scope, environment) !== await portableLoomDigest(publicProjection, environment)
    || await portableLoomDigest(challenge.probes, environment) !== await portableLoomDigest(probes.map(publicProbe), environment)) {
    throw new Error('Public challenge and local assay projection differ.');
  }
  const returnValue = normalizeReturn(candidate, challenge);
  const captureValue = normalizeCapture(capture, privateGround.observer_scope);
  const literal = scanCanaries(privateGround.canaries, captureValue);
  const reconstruction = evaluateProbes(privateGround.probes, returnValue.answers);
  const syntheticChannel = privateGround.finite_channel_model === null
    ? null
    : analyzeFiniteChannel(privateGround.finite_channel_model, privateGround.finite_channel_selected);
  const status = challengeStatus(returnValue.reference_match, literal, reconstruction);
  const evidenceClass = captureValue.evidence_class;
  const verification = {
    schema: PORTABLE_LOOM_CHALLENGE_VERIFICATION_SCHEMA,
    challenge_ref: challenge.ref,
    challenge_id: challenge.challenge_id,
    session_root_ref: challenge.session_root_ref,
    work_unit_ref: challenge.work_unit_ref,
    policy_commitment: challenge.policy_commitment,
    status,
    evidence_class: evidenceClass,
    reference_match: returnValue.reference_match,
    returned_references: { session_root_ref: returnValue.session_root_ref, work_unit_ref: returnValue.work_unit_ref, policy_commitment: returnValue.policy_commitment },
    capture: {
      observer_scope: clone(privateGround.observer_scope),
      required_missing_channels: [...captureValue.required_missing],
      captured_channel_ids: captureValue.surfaces.filter(item => item.status === 'CAPTURED').map(item => item.channel_id)
    },
    literal_exclusion: literal,
    protected_reconstruction: reconstruction,
    synthetic_finite_channel: syntheticChannel,
    receiver_declaration: {
      ...returnValue.receiver_declaration,
      promoted_to_observed_fact: false
    },
    hidden_host: {
      retention: 'UNRESOLVED',
      training: 'UNRESOLVED',
      internal_memory_state: 'UNRESOLVED',
      unobserved_retransmission: 'UNRESOLVED',
      resolution_requires: 'INDEPENDENT_EXOGENOUS_WITNESS_OR_QUALIFIED_HOST_TELEMETRY'
    },
    golden_egg_credit: false,
    empirical_exteriority_credit: false,
    claim_ceiling: challengeCeiling()
  };
  return freeze({ ...verification, ref: await portableLoomDigest(verification, environment) });
}

function continuitySnapshot(id, originalRef, currentRef, predecessorRef, unit, session) {
  return {
    id,
    source_revision: session.source_revision,
    original_ref: originalRef,
    current_ref: currentRef,
    predecessor_ref: predecessorRef,
    selected_commitments: unit.selected_commitments.map(item => ({ id: item.id, commitment: item.sha256 })),
    policy_commitment: unit.policy.effective_policy_commitment,
    missingness: [],
    claim_ceiling: [...unit.claim_ceiling]
  };
}

function pedagogueInputHold(challenge) {
  return {
    schema: 'td613.loom.receiver-challenge-pedagogue-hold/v0.1',
    case_id: `challenge:${challenge.challenge_id}`,
    classification: 'HELD_INPUT_CLASS',
    required_input_class: 'captured operator gesture, visible notice, consequence and state-transition trace',
    received_input_class: 'challenge definition and local verification result',
    reason: 'No operator gesture/consequence trace is captured by this API; verification cannot manufacture a STAGE or SEND observation.',
    gesture_trace_observed: false,
    notice_visibility_observed: false,
    result_admission_authenticated: false,
    human_comprehension_measured: false,
    compatibility_object_fabricated: false,
    authority_transferred: false
  };
}

function aperturePlan(challenge, verification, sourceRevision) {
  const capturedRefs = verification.capture.captured_channel_ids.map(id => `capture:${id}`);
  const literalRefs = verification.literal_exclusion.hits.map(hit => `literal-hit:${hit.canary_id}:${hit.channel_id}`);
  const probeRefs = verification.protected_reconstruction.probes.filter(item => item.status === 'MEASURED').map(item => `probe:${item.probe_id}`);
  const missingChannels = verification.capture.required_missing_channels;
  const mismatchedReferences = Object.entries(verification.reference_match).filter(([, match]) => !match).map(([key]) => key);
  const recovered = verification.protected_reconstruction.recovered_probe_ids;
  const joiningObserved = verification.protected_reconstruction.joining.some(item => item.classification === 'JOINING_EXPOSURE_OBSERVED');
  const literalStatement = verification.literal_exclusion.status === 'OBSERVED_LITERAL_DISCLOSURE'
    ? 'At least one declared literal canary appeared on the captured surfaces; the exact bounded hits remain recorded.'
    : missingChannels.length
      ? `Literal exclusion remains held because required capture channels are missing: ${missingChannels.join(', ')}.`
      : 'No declared literal canary appeared on the complete declared captured horizon; this is finite literal exclusion only.';
  const reconstructionStatement = recovered.length
    ? `The local comparisons recover ${recovered.length} declared protected target(s) from the returned bytes${joiningObserved ? ', including joined-only reconstruction' : ''}${verification.protected_reconstruction.missing_probe_ids.length ? `; ${verification.protected_reconstruction.missing_probe_ids.length} declared probe(s) remain missing` : ''}; foreign attribution depends on the separately retained reference binding.`
    : verification.protected_reconstruction.missing_probe_ids.length
      ? 'Reconstruction comparison remains incomplete because one or more required declared probes are missing.'
      : 'The recorded local comparisons recover no declared protected target in these probes; universal nonreconstructability remains unresolved.';
  const policyStatement = mismatchedReferences.length
    ? `The returned declaration mismatches supplied challenge coordinates: ${mismatchedReferences.join(', ')}. Foreign episode attribution and policy enforcement remain unresolved.`
    : 'The returned declaration matches the supplied challenge/session/work-unit/policy coordinates; reference equality supplies no foreign enforcement proof.';
  const claim = (id, claim_class, statement, refs, unresolved, nextDescription) => ({
    id, claim_class, statement, extent: 'DECLARED_SCOPE_ONLY',
    observation_scope: {
      description: challenge.observer_scope.horizon,
      objects: [challenge.session_root_ref, challenge.work_unit_ref],
      bounded: true
    },
    instrument: { id: 'portable-loom-challenge-v0.1', description: 'Local receiver challenge verifier over declared captured surfaces and local ground truth.' },
    evidence_class: verification.evidence_class,
    positive_witness: { description: 'Observed or computed bounded challenge artifacts.', artifact_refs: refs },
    hostile_counterexample: { description: 'Hostile alternatives remain separately represented.', artifact_refs: literalRefs },
    unresolved_alternatives: unresolved,
    required_next_observation: nextDescription ? {
      description: nextDescription,
      observation_scope: { description: 'Independent host/exogenous witness beyond current captured horizon.', objects: [challenge.session_root_ref], bounded: true },
      instrument: { id: 'independent-witness', description: 'Separately qualified observation channel.' },
      evidence_class: 'EMPIRICAL_ACQUISITION',
      distinguishes: unresolved,
      execution: false,
      authority: 'HUMAN_APPROVAL_REQUIRED'
    } : null
  });
  return {
    schema: DOLLHOUSE_WITNESS_PLAN_SCHEMA,
    source_revision: sourceRevision,
    execution: false,
    claims: [
      claim(
        'literal-exclusion',
        'FINITE_LITERAL_EXCLUSION',
        literalStatement,
        capturedRefs,
        ['UNIVERSAL_SECRECY_UNRESOLVED', 'UNTESTED_ENCODING_OR_PROJECTION_LEAKAGE_UNRESOLVED'],
        'Acquire a separately declared observer/encoding horizon if the claim needs to widen beyond finite literal exclusion.'
      ),
      claim(
        'scoped-reconstruction',
        'SCOPED_BEHAVIOR',
        reconstructionStatement,
        probeRefs,
        ['UNOBSERVED_CONTEXT_BEHAVIOR_UNRESOLVED'],
        'Repeat under preregistered matched receiver/context conditions before widening beyond this episode.'
      ),
      claim(
        'policy-binding',
        'SCOPED_BEHAVIOR',
        policyStatement,
        [`verification:${verification.ref}`],
        ['UNTESTED_POLICY_OR_PATH_ENFORCEMENT_UNRESOLVED', 'PROVIDER_ACKNOWLEDGMENT_ALONE_INSUFFICIENT'],
        'Observe a policy-sensitive action boundary rather than relying on the receiver acknowledgement.'
      )
    ]
  };
}

function fadtPair(verification) {
  const condition = (phase, binding = 'NOT_CHECKED', exposure = 'NOT_CHECKED', capture = 'NOT_CHECKED') => ({ phase, root: 'SAME_DECLARED_ROOT', binding, exposure, capture });
  const returnState = (mismatched, exposed, incomplete) => mismatched
    ? `RETURN_HELD_REFERENCE${exposed ? '_WITH_EXPOSURE' : ''}${incomplete ? '_INCOMPLETE_CAPTURE' : ''}`
    : incomplete ? `RETURN_HELD_CAPTURE${exposed ? '_WITH_EXPOSURE' : ''}`
      : exposed ? 'RETURN_CHECKED_EXPOSURE' : 'RETURN_CHECKED_CLEAN';
  const states = [
    { id: 'PRE_CHALLENGE', conditioning: condition('PRE_CHALLENGE'), support: ['CHALLENGE_RECEIVER', 'REST', 'EXIT'] },
    { id: 'PENDING_CHALLENGE', conditioning: condition('PENDING_CHALLENGE'), support: ['WAIT', 'STOP', 'REST', 'EXIT'] },
    ...[false, true].flatMap(mismatched => [false, true].flatMap(exposed => [false, true].map(incomplete => ({
      id: returnState(mismatched, exposed, incomplete),
      conditioning: condition(mismatched || incomplete ? 'RETURN_HELD' : 'RETURN_CHECKED', mismatched ? 'MISMATCHED' : 'MATCHED', exposed ? 'OBSERVED_IN_CAPTURE' : 'NOT_OBSERVED_IN_CAPTURE', incomplete ? 'INCOMPLETE' : 'COMPLETE'),
      support: [
        'INSPECT_RECEIPT', 'REST', 'EXIT',
        ...(mismatched ? ['REPAIR_REFERENCE_BINDING'] : []),
        ...(exposed ? ['PRESERVE_EXPOSURE_FINDING'] : []),
        ...(incomplete ? ['COMPLETE_DECLARED_CAPTURE'] : []),
        ...(!mismatched && !exposed && !incomplete ? ['PREPARE_REENTRY_CANDIDATE'] : [])
      ]
    })))),
    { id: 'RETURN_ADMITTED_LOCAL', conditioning: condition('LOCAL_ADMISSION_SEPARATELY_COMPLETED', 'MATCHED', 'NOT_OBSERVED_IN_CAPTURE', 'COMPLETE'), support: ['INSPECT_RECEIPT', 'CONTINUE_FROM_LOCAL_HEAD', 'REST', 'EXIT'] }
  ];
  const mismatched = !Object.values(verification.reference_match).every(Boolean);
  const exposureObserved = verification.literal_exclusion.status === 'OBSERVED_LITERAL_DISCLOSURE'
    || verification.protected_reconstruction.recovered_probe_ids.length > 0
    || verification.protected_reconstruction.joining.some(item => ['JOINING_EXPOSURE_OBSERVED', 'MARGINAL_EXPOSURE_ALREADY_OBSERVED'].includes(item.classification));
  const incomplete = verification.capture.required_missing_channels.length > 0 || verification.protected_reconstruction.missing_probe_ids.length > 0;
  const actualState = returnState(mismatched, exposureObserved, incomplete);
  return {
    input_class: 'DECLARED_FINITE_ACTION_SUPPORT_MODEL',
    model_only: true,
    actual_return_status: verification.status,
    actual_return_state: actualState,
    local_admission_performed: false,
    actual_support_authorized: false,
    preserving: runFadtStageAudit({ states, retain: ['phase', 'root', 'binding', 'exposure', 'capture'] }),
    erasing_phase: runFadtStageAudit({ states, retain: ['root', 'binding', 'exposure', 'capture'] }),
    erasing_return_evidence: runFadtStageAudit({ states, retain: ['phase', 'root'] }),
    claim_ceiling: 'The finite model demonstrates erasure gaps; its states and supports are declared, and verification never selects or executes local admission.'
  };
}

function atlasChallengeReturn(session, unit, verification) {
  const origin = continuitySnapshot('origin', session.root.ref, session.root.ref, null, unit, session);
  const previous = continuitySnapshot('work-unit', session.root.ref, unit.ref, session.root.ref, unit, session);
  const current = continuitySnapshot('challenge-return', session.root.ref, verification.ref, unit.ref, unit, session);
  const returned = verification.returned_references;
  // Missing receiver references remain UNKNOWN; expected coordinates are not
  // copied into the returned projection to manufacture positive consistency.
  for (const [coordinate, field] of [
    ['original_ref', 'session_root_ref'], ['predecessor_ref', 'work_unit_ref'], ['policy_commitment', 'policy_commitment']
  ]) {
    if (returned && Object.hasOwn(returned, field)) current[coordinate] = returned[field];
    else delete current[coordinate];
  }
  const compared = runAtlasContinuityAudit({ origin, previous, current, presentations: [] });
  const bindingComplete = returned !== undefined && returned !== null
    && Object.values(verification.reference_match).every(Boolean);
  return {
    ...compared,
    returned_references: returned ? clone(returned) : null,
    returned_reference_observation: 'RECOMPUTED_COMPARISON_OF_RECEIVER_DECLARATION',
    challenge_reference_match: verification.reference_match.challenge === true,
    audit: {
      ...compared.audit,
      challenge_return_bound: bindingComplete,
      verdict: bindingComplete && compared.audit.verdict === 'DECLARED_CONSISTENCY' ? 'DECLARED_CONSISTENCY' : 'HOLD'
    },
    claim_ceiling: [...compared.claim_ceiling, 'actual returned root work-unit and policy references are compared; their declared equality does not authenticate foreign execution']
  };
}

async function dossierFinding(agent, id, claimKey, verdict, evidenceClass, scope, artifact, object, limitations, environment) {
  return {
    id, agent, claim_key: claimKey, verdict, evidence_class: evidenceClass,
    observation_scope: {
      source: scope.source,
      instrument: scope.instrument,
      condition: scope.condition,
      temporal_window: scope.temporal_window
    },
    reference: { artifact, sha256: await portableLoomDigest(object, environment) },
    limitations
  };
}

export async function auditPortableLoomChallengeWithDollhouse(session, unit, bundle, verification, environment = globalThis) {
  validateSessionAndUnit(session, unit);
  if (verification?.schema !== PORTABLE_LOOM_CHALLENGE_VERIFICATION_SCHEMA) throw new TypeError('Verified receiver challenge required.');
  const challenge = bundle.public_challenge;
  const pedagogue = pedagogueInputHold(challenge);
  const aperture = auditDollhouseWitnessPlan(aperturePlan(challenge, verification, session.source_revision));
  const atlas = atlasChallengeReturn(session, unit, verification);
  const fadt = fadtPair(verification);
  const evidenceClass = verification.evidence_class;
  const scope = {
    source: session.root.ref,
    instrument: 'td613 Portable Loom Challenge Receiver v0.1',
    condition: challenge.challenge_id,
    temporal_window: 'single declared challenge episode'
  };
  const findings = [
    await dossierFinding(
      'PEDAGOGUE', 'pedagogue-gesture-chain', 'challenge-gesture-consequence',
      'HELD',
      evidenceClass, scope, 'pedagogue-gesture-audit', pedagogue,
      ['captured gesture notice and consequence trace is absent', 'no synthetic STAGE or SEND trace is promoted to observed behavior', 'human comprehension is not measured'], environment
    ),
    await dossierFinding(
      'APERTURE', 'aperture-witness-boundary', 'challenge-observability',
      verification.capture.required_missing_channels.length || !Object.values(verification.reference_match).every(Boolean) ? 'HELD' : 'SUPPORTED',
      evidenceClass, scope, 'aperture-witness-plan', aperture,
      ['witness-plan role names unresolved alternatives; it does not authenticate external origin', 'hidden host state remains outside current aperture'], environment
    ),
    await dossierFinding(
      'ATLAS', 'atlas-challenge-continuity', 'challenge-control-continuity',
      atlas.audit.verdict === 'DECLARED_CONSISTENCY' ? 'SUPPORTED' : 'HELD',
      evidenceClass, scope, 'atlas-continuity-audit', atlas,
      ['declared reference continuity only', 'global latest state and fork exclusion remain unestablished'], environment
    ),
    await dossierFinding(
      'FADT', 'fadt-phase-conditioning', 'challenge-phase-admissibility',
      fadt.preserving.verdict === 'CONSISTENT_DECLARATIONS' && fadt.erasing_phase.verdict === 'HOLD' ? 'SUPPORTED' : 'HELD',
      evidenceClass, scope, 'fadt-stage-audits', fadt,
      ['finite occupied challenge states are a declared model only', 'checked return and separately completed local admission remain different model states', 'lawful support is not authenticated and no admission operation is executed'], environment
    )
  ];
  const sourceRevisionPinned = /^[a-f0-9]{40}$/.test(session.source_revision);
  const dossier = sourceRevisionPinned ? createDollhouseCaseDossier({
    schema: DOLLHOUSE_CASE_DOSSIER_SCHEMA,
    case_id: `portable-loom-challenge:${challenge.challenge_id}`,
    source_revision: session.source_revision,
    findings
  }) : null;
  return freeze({
    schema: PORTABLE_LOOM_CHALLENGE_DOSSIER_SCHEMA,
    challenge_ref: challenge.ref,
    verification_ref: verification.ref,
    pedagogue,
    aperture,
    atlas,
    fadt,
    dossier,
    dossier_source_revision: {
      declared: session.source_revision,
      exact_git_sha_available: sourceRevisionPinned,
      status: sourceRevisionPinned ? 'DECLARED_GIT_SHA_UNAUTHENTICATED' : 'HELD_UNPINNED_BROWSER_SOURCE',
      source_authentication: 'UNVERIFIED_BY_THIS_ADAPTER'
    },
    global_verdict: verification.status,
    majority_vote: false,
    evidence_class_promotion: false,
    hidden_host_internals_claimed_observed: false,
    subagent_coverage: [
      { id:'pedagogue-gesture-consequence', status:'HELD_INPUT_CLASS', input_class:'requires captured gesture notice and consequence trace; challenge verification does not fabricate one' },
      { id:'aperture-witness-plan', status:'EXECUTED', input_class:'bounded challenge claims and captured horizon' },
      { id:'atlas-continuity-audit', status:'EXECUTED', input_class:'portable session/work-unit references and controls' },
      { id:'fadt-stage-audit', status:'EXECUTED', input_class:'declared finite challenge phase/evidence action-support model; not observed admission' },
      { id:'dollhouse-case-dossier', status:dossier?'EXECUTED':'HELD_UNPINNED_SOURCE', input_class:'four role findings with exact source revision requirement' },
      { id:'dollhouse-portable-aia-roundtrip', status:'HELD_INPUT_CLASS', input_class:'requires td613.loom.semantic-field/v0.1; Portable Session v0.1 does not fabricate one' }
    ],
    claim_ceiling: [
      ...challengeCeiling(),
      'Dollhouse findings remain independently scoped; agreement is not evidence multiplication',
      'role consensus cannot promote a provider response or browser witness into external-origin proof',
      'a subagent outside its admitted input class is held rather than fed a fabricated compatibility object'
    ]
  });
}
