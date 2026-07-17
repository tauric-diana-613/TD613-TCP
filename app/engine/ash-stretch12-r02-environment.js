import {
  assertNoArtifactContent,
  digestRecord,
  nowIso,
  uniqueStrings,
  withoutKeys
} from './ash-stretch12-r02-common.js';

export const ENVIRONMENT_PROFILE_SCHEMA = 'td613.ash.environment-profile/v0.1';
export const SENSOR_OBSERVATION_SCHEMA = 'td613.ash.environment-sensor-observation/v0.1';
export const SENSOR_BUNDLE_SCHEMA = 'td613.ash.environment-sensor-bundle/v0.1';
export const ENVIRONMENT_REPLAY_SCHEMA = 'td613.ash.environment-profile-replay/v0.1';

export const ENVIRONMENT_GROUPS = Object.freeze(['D','N','A','P','R','K','T','B','U']);
export const SOURCE_STATUSES = Object.freeze([
  'OBSERVED','VERIFIED','DERIVED','CONSTRUCTED','SUPPLIED','SELF_ATTESTED',
  'IMPORTED','STALE','CONTRADICTORY','MISSING','UNRESOLVED'
]);
export const ROUTE_CLASSES = Object.freeze([
  'CONSUMER_CLOUD_PROVIDER','MANAGED_ENTERPRISE_PROVIDER','PUBLIC_SECTOR_MANAGED_PROVIDER',
  'OFFLINE_LOCAL_MODEL','REMOTE_SELF_HOSTED_MODEL','LOCAL_DRIVE','REMOVABLE_MEDIA',
  'CLIENT_SIDE_ENCRYPTED_CLOUD_OBJECT','SHARED_COLLABORATIVE_WORKSPACE',
  'TD613_SIGNED_EXPORT','UNRESOLVED_ROUTE'
]);
export const UNRESOLVED_VALUES = Object.freeze([
  'UNOBSERVED','UNVERIFIABLE','OPERATOR_UNCERTAIN','PROVIDER_UNDISCLOSED',
  'ADMINISTRATIVELY_OPAQUE','TECHNICALLY_UNMEASURED','OUTSIDE_INSTRUMENT_JURISDICTION'
]);

const HARD_HOLD_ROUTES = new Set([
  'MANAGED_ENTERPRISE_PROVIDER','PUBLIC_SECTOR_MANAGED_PROVIDER',
  'SHARED_COLLABORATIVE_WORKSPACE','UNRESOLVED_ROUTE'
]);

function observationSubject(record) {
  return withoutKeys(record, ['record_digest']);
}

export async function compileSensorObservation(input, options = {}) {
  if (!input || typeof input !== 'object') throw new TypeError('Sensor input is required.');
  const group = String(input.group || '').toUpperCase();
  if (!ENVIRONMENT_GROUPS.includes(group)) throw new TypeError(`Unknown environment group: ${group}`);
  const sourceStatus = String(input.source_status || 'MISSING').toUpperCase();
  if (!SOURCE_STATUSES.includes(sourceStatus)) throw new TypeError(`Unknown source status: ${sourceStatus}`);
  const record = {
    schema: SENSOR_OBSERVATION_SCHEMA,
    schema_version: '0.1',
    record_id: input.record_id || `sensor:${input.environment_id}:${input.sensor_id}`,
    case_id: String(input.case_id || ''),
    environment_id: String(input.environment_id || ''),
    sensor_id: String(input.sensor_id || ''),
    sensor_version: String(input.sensor_version || '0.1'),
    group,
    field: String(input.field || ''),
    value: input.value ?? null,
    source_status: sourceStatus,
    provenance: {
      source_class: String(input.provenance?.source_class || sourceStatus),
      reference: input.provenance?.reference || null
    },
    observed_at: input.observed_at || nowIso(options.now),
    fresh_until: input.fresh_until || null,
    transformation_history: uniqueStrings(input.transformation_history),
    missingness: uniqueStrings(input.missingness),
    uncertainty: uniqueStrings(input.uncertainty),
    claim_ceiling: String(input.claim_ceiling || 'FIELD_OBSERVATION_ONLY'),
    operator_closure: String(input.operator_closure || 'OPEN')
  };
  if (!record.case_id || !record.environment_id || !record.sensor_id || !record.field) {
    throw new TypeError('case_id, environment_id, sensor_id, and field are required.');
  }
  if (record.source_status === 'MISSING' || record.source_status === 'UNRESOLVED') {
    if (!record.missingness.length) record.missingness = ['sensor value unavailable'];
    record.value = null;
  }
  record.record_digest = await digestRecord(SENSOR_OBSERVATION_SCHEMA, observationSubject(record), options.cryptoImpl);
  return Object.freeze(record);
}

export async function verifySensorObservation(record, options = {}) {
  if (!record || record.schema !== SENSOR_OBSERVATION_SCHEMA) return false;
  return record.record_digest === await digestRecord(SENSOR_OBSERVATION_SCHEMA, observationSubject(record), options.cryptoImpl);
}

function bundleSubject(record) {
  return withoutKeys(record, ['record_digest']);
}

export async function compileSensorBundle(input, options = {}) {
  assertNoArtifactContent(input);
  const observations = [...(input.observations || [])];
  if (!observations.length) throw new TypeError('At least one sensor observation is required.');
  for (const observation of observations) {
    if (!(await verifySensorObservation(observation, options))) throw new Error(`Unverified sensor: ${observation?.sensor_id || 'unknown'}`);
  }
  const ids = observations.map(item => item.record_id);
  if (new Set(ids).size !== ids.length) throw new Error('Sensor record IDs must be unique.');
  const observedGroups = new Set(observations.map(item => item.group));
  const missingGroups = ENVIRONMENT_GROUPS.filter(group => !observedGroups.has(group));
  const compiledAt = input.compiled_at || nowIso(options.now);
  const stale = observations.filter(item => item.source_status === 'STALE' || (item.fresh_until && Date.parse(item.fresh_until) < Date.parse(compiledAt)));
  const contradictory = observations.filter(item => item.source_status === 'CONTRADICTORY');
  const unresolved = observations.filter(item => ['MISSING','UNRESOLVED'].includes(item.source_status));
  const bundle = {
    schema: SENSOR_BUNDLE_SCHEMA,
    schema_version: '0.1',
    record_id: input.record_id || `sensor-bundle:${input.environment_id}`,
    case_id: String(input.case_id || observations[0].case_id),
    environment_id: String(input.environment_id || observations[0].environment_id),
    created_at: compiledAt,
    source_status: contradictory.length ? 'CONTRADICTORY' : stale.length ? 'STALE' : unresolved.length || missingGroups.length ? 'UNRESOLVED' : 'DERIVED',
    observation_references: observations.map(item => item.record_id).sort(),
    observation_digests: observations.map(item => item.record_digest).sort(),
    observations,
    group_coverage: Object.fromEntries(ENVIRONMENT_GROUPS.map(group => [group, observations.filter(item => item.group === group).length])),
    missing_groups: missingGroups,
    stale_references: stale.map(item => item.record_id).sort(),
    contradictory_references: contradictory.map(item => item.record_id).sort(),
    unresolved_references: unresolved.map(item => item.record_id).sort(),
    missingness: uniqueStrings([...(input.missingness || []), ...missingGroups.map(group => `${group} group unobserved`), ...unresolved.flatMap(item => item.missingness)]),
    uncertainty: uniqueStrings([...(input.uncertainty || []), ...observations.flatMap(item => item.uncertainty)]),
    claim_ceiling: 'DECLARED_SENSOR_UNIVERSE_ONLY',
    operator_closure: String(input.operator_closure || 'OPEN'),
    artifact_blind: true
  };
  assertNoArtifactContent(bundle);
  bundle.record_digest = await digestRecord(SENSOR_BUNDLE_SCHEMA, bundleSubject(bundle), options.cryptoImpl);
  return Object.freeze(bundle);
}

export async function verifySensorBundle(bundle, options = {}) {
  if (!bundle || bundle.schema !== SENSOR_BUNDLE_SCHEMA || bundle.artifact_blind !== true) return false;
  assertNoArtifactContent(bundle);
  return bundle.record_digest === await digestRecord(SENSOR_BUNDLE_SCHEMA, bundleSubject(bundle), options.cryptoImpl);
}

function profileSubject(record) {
  return withoutKeys(record, ['record_digest']);
}

function observationMap(bundle) {
  const map = Object.fromEntries(ENVIRONMENT_GROUPS.map(group => [group, {}]));
  for (const item of bundle.observations) {
    map[item.group][item.field] = {
      value: item.value,
      source_status: item.source_status,
      sensor_reference: item.record_id,
      observed_at: item.observed_at,
      claim_ceiling: item.claim_ceiling
    };
  }
  return map;
}

export async function compileEnvironmentProfile(input, options = {}) {
  if (!(await verifySensorBundle(input.sensor_bundle, options))) throw new Error('A verified sensor bundle is required.');
  const routeClass = String(input.route_class || '').toUpperCase();
  if (!ROUTE_CLASSES.includes(routeClass)) throw new TypeError(`Unknown route class: ${routeClass}`);
  const unresolvedSurfaces = uniqueStrings([
    ...(input.unresolved_surfaces || []),
    ...input.sensor_bundle.missingness,
    ...input.sensor_bundle.stale_references.map(id => `stale:${id}`),
    ...input.sensor_bundle.contradictory_references.map(id => `contradictory:${id}`)
  ]);
  const holds = [];
  if (HARD_HOLD_ROUTES.has(routeClass)) holds.push(`ROUTE_${routeClass}_HARD_HOLD`);
  if (unresolvedSurfaces.length) holds.push('ENVIRONMENT_SURFACES_UNRESOLVED');
  if (input.sensor_bundle.stale_references.length) holds.push('STALE_SENSOR_HOLD');
  if (input.sensor_bundle.contradictory_references.length) holds.push('CONTRADICTORY_SENSOR_HOLD');
  const coverage = ENVIRONMENT_GROUPS.filter(group => input.sensor_bundle.group_coverage[group] > 0).length / ENVIRONMENT_GROUPS.length;
  const profile = {
    schema: ENVIRONMENT_PROFILE_SCHEMA,
    schema_version: '0.1',
    record_id: input.record_id || `environment:${input.environment_id}`,
    case_id: String(input.case_id || input.sensor_bundle.case_id),
    environment_id: String(input.environment_id || input.sensor_bundle.environment_id),
    created_at: input.created_at || nowIso(options.now),
    valid_until: input.valid_until || null,
    source_status: holds.length ? 'UNRESOLVED' : 'DERIVED',
    route_class: routeClass,
    descriptor: observationMap(input.sensor_bundle),
    sensor_bundle_reference: input.sensor_bundle.record_id,
    sensor_bundle_digest: input.sensor_bundle.record_digest,
    coverage: {
      observed_groups: ENVIRONMENT_GROUPS.filter(group => input.sensor_bundle.group_coverage[group] > 0),
      missing_groups: input.sensor_bundle.missing_groups,
      ratio: coverage,
      state: coverage === 1 && !unresolvedSurfaces.length ? 'BOUNDED_COMPLETE' : 'PARTIAL'
    },
    unresolved_surfaces: unresolvedSurfaces,
    hard_holds: holds,
    artifact_blind: true,
    automatic_release: false,
    endpoint_integrity_claimed: false,
    unknown_defaults_to_safe: false,
    missingness: input.sensor_bundle.missingness,
    uncertainty: uniqueStrings(input.uncertainty),
    claim_ceiling: 'ENVIRONMENT_SPECIFIC_DECLARED_SENSOR_UNIVERSE',
    operator_closure: String(input.operator_closure || 'OPEN')
  };
  assertNoArtifactContent(profile);
  profile.record_digest = await digestRecord(ENVIRONMENT_PROFILE_SCHEMA, profileSubject(profile), options.cryptoImpl);
  return Object.freeze(profile);
}

export async function verifyEnvironmentProfile(profile, options = {}) {
  if (!profile || profile.schema !== ENVIRONMENT_PROFILE_SCHEMA || profile.artifact_blind !== true) return false;
  if (profile.unknown_defaults_to_safe !== false || profile.automatic_release !== false) return false;
  assertNoArtifactContent(profile);
  if (profile.valid_until && Date.parse(profile.valid_until) < Date.now()) return false;
  return profile.record_digest === await digestRecord(ENVIRONMENT_PROFILE_SCHEMA, profileSubject(profile), options.cryptoImpl);
}

export async function replayEnvironmentProfile(profile, sensorBundle, options = {}) {
  const replayed = await compileEnvironmentProfile({
    record_id: profile.record_id,
    case_id: profile.case_id,
    environment_id: profile.environment_id,
    created_at: profile.created_at,
    valid_until: profile.valid_until,
    route_class: profile.route_class,
    sensor_bundle: sensorBundle,
    unresolved_surfaces: profile.unresolved_surfaces.filter(item => !sensorBundle.missingness.includes(item)),
    uncertainty: profile.uncertainty,
    operator_closure: profile.operator_closure
  }, options);
  return Object.freeze({
    schema: ENVIRONMENT_REPLAY_SCHEMA,
    original_digest: profile.record_digest,
    replay_digest: replayed.record_digest,
    deterministic: profile.record_digest === replayed.record_digest,
    changed: profile.record_digest !== replayed.record_digest,
    eligibility_invalidated: profile.record_digest !== replayed.record_digest,
    automatic_release: false
  });
}

export function environmentChanged(previousProfile, nextProfile) {
  return Object.freeze({
    changed: previousProfile?.record_digest !== nextProfile?.record_digest,
    previous_environment_digest: previousProfile?.record_digest || null,
    next_environment_digest: nextProfile?.record_digest || null,
    prior_eligibility_revoked: previousProfile?.record_digest !== nextProfile?.record_digest
  });
}
