import {
  assertNoArtifactContent,
  clamp01,
  digestRecord,
  nowIso,
  stateFromScore,
  uniqueStrings,
  withoutKeys
} from './ash-stretch12-r02-common.js';
import { verifyEnvironmentProfile } from './ash-stretch12-r02-environment.js';

export const ROUTE_WEATHER_SCHEMA = 'td613.flowcore.portable-route-weather/v0.1';
export const ROUTE_INTERVENTION_SCHEMA = 'td613.flowcore.route-intervention/v0.1';
export const ROUTE_WEATHER_SERIES_SCHEMA = 'td613.flowcore.route-weather-series/v0.1';
export const ROUTE_WEATHER_REPLAY_SCHEMA = 'td613.flowcore.route-weather-replay/v0.1';

export const INTERVENTIONS = Object.freeze([
  'KEEP_LOCAL','REST_AND_REOBSERVE','DISABLE_SYNC_AND_RETEST','CHANGE_ENDPOINT','CHANGE_ROUTE',
  'ROTATE_KEY','SEPARATE_RECOVERY_KEY','ENCRYPT_BEFORE_TRANSPORT','REMOVE_METADATA',
  'COARSEN_CHRONOLOGY','REMOVE_RELATION_BRIDGE','PARAPHRASE_AND_RETEST',
  'REPLACE_WITH_STRUCTURAL_SURROGATE','OFFLINE_LOCAL_ONLY','BOUNDED_PACKET_REVIEW'
]);

function weatherSubject(record) { return withoutKeys(record, ['record_digest']); }
function signal(profile, group, field) { return profile?.descriptor?.[group]?.[field]?.value ?? null; }
function bool(value) { return value === true || value === 'true' || value === 'YES' || value === 'ACTIVE' || value === 'ENABLED'; }
function count(values) { return values.filter(Boolean).length; }

export function deriveWeatherComponents(profile, assaySummary = {}, history = []) {
  const plaintextActive = bool(signal(profile,'T','plaintext_active')) || ['paste','file_upload','API_PACKET'].includes(signal(profile,'T','transport_method'));
  const readerAccess = Number(assaySummary.reader_count || 0) > 0;
  const routeVelocity = Number(assaySummary.route_velocity || 0);
  const recipients = Number(assaySummary.recipient_count || 0);
  const copies = Number(assaySummary.copy_count || 0);
  const temperatureScore = clamp01((count([plaintextActive,readerAccess]) + Math.min(routeVelocity,2) + Math.min(recipients,2) + Math.min(copies,2)) / 8);

  const missing = profile?.unresolved_surfaces?.length || 0;
  const policyConflict = bool(signal(profile,'A','policy_conflict'));
  const deadlinePressure = bool(assaySummary.deadline_pressure);
  const custodyObligation = bool(assaySummary.custody_obligation);
  const pressureScore = clamp01((Math.min(missing,4) + count([policyConflict,deadlinePressure,custodyObligation])) / 7);

  const persistenceSignals = [
    bool(signal(profile,'P','backup_retention')), bool(signal(profile,'P','version_history')),
    bool(signal(profile,'B','cloud_sync')), bool(signal(profile,'P','indexing')),
    bool(signal(profile,'P','preview_cache')), bool(signal(profile,'P','recipient_copies'))
  ];
  const humidityScore = persistenceSignals.filter(Boolean).length / persistenceSignals.length;

  const declared = profile?.route_class || 'UNRESOLVED_ROUTE';
  const providerAction = bool(assaySummary.provider_action);
  const managedDevice = bool(signal(profile,'D','device_management')) || bool(signal(profile,'A','workspace_administrator'));
  const deletionClaim = bool(assaySummary.deleted_claimed);
  const unresolvedDeletion = bool(signal(profile,'P','deletion_verification')) === false;
  const stableJoiningKeys = Number(assaySummary.joining_key_risk || 0) > 0;
  const torsionReasons = [];
  if (declared === 'OFFLINE_LOCAL_MODEL' && providerAction) torsionReasons.push('OFFLINE_DECLARATION_WITH_PROVIDER_ACTION');
  if (assaySummary.declared_personal === true && managedDevice) torsionReasons.push('PERSONAL_DECLARATION_WITH_MANAGED_SURFACE');
  if (deletionClaim && unresolvedDeletion) torsionReasons.push('DELETION_CLAIM_WITH_UNRESOLVED_PERSISTENCE');
  if (assaySummary.anonymous_claim === true && stableJoiningKeys) torsionReasons.push('ANONYMITY_CLAIM_WITH_JOINING_KEYS');
  const torsionScore = clamp01(torsionReasons.length / 4);

  const visibilityScore = clamp01(profile?.coverage?.ratio ?? 0);
  const priorFailures = history.filter(item => item.intervention === 'REST_AND_REOBSERVE' || item.hard_hold === true).length;
  const changed = bool(assaySummary.projection_changed) || bool(assaySummary.endpoint_changed) || bool(assaySummary.recipient_changed);
  const stale = profile?.hard_holds?.includes('STALE_SENSOR_HOLD');
  const restDebtScore = clamp01((Math.min(priorFailures,3) + count([changed,stale,missing > 0])) / 6);

  const required = [
    assaySummary.origin_verified === true, assaySummary.custody_verified === true,
    Boolean(assaySummary.purpose_reference), Boolean(assaySummary.projection_digest),
    Boolean(profile?.record_digest), Boolean(assaySummary.reader_ensemble_reference),
    Boolean(assaySummary.claim_ceiling)
  ];
  const coherenceScore = required.filter(Boolean).length / required.length;
  const entropyScore = clamp01((Math.min(copies,3) + Math.min(Number(assaySummary.unknown_joins || 0),3) + Math.min(Number(assaySummary.uncontrolled_recipients || 0),3) + Math.min(Number(assaySummary.opaque_persistence || 0),3)) / 12);

  return Object.freeze({
    temperature:{score:temperatureScore,state:stateFromScore(temperatureScore,[[0.2,'COOL'],[0.5,'WARM'],[0.75,'HOT'],[1,'CRITICAL']]),basis:['plaintext activation','Reader access','route velocity','recipient multiplicity','copy creation']},
    pressure:{score:pressureScore,state:stateFromScore(pressureScore,[[0.2,'LOW'],[0.5,'ACCUMULATING'],[0.75,'HIGH'],[1,'BLOCKING']]),basis:['missing sensors','policy conflict','deadline pressure','route demand','custody obligations']},
    humidity:{score:humidityScore,state:stateFromScore(humidityScore,[[0.2,'DRY'],[0.5,'PERSISTENT'],[0.75,'SATURATED'],[1,'OPAQUE']]),basis:['backups','version history','caches','sync','indexing','recipient copies']},
    torsion:{score:torsionScore,state:torsionReasons.length?'MISMATCH':'ALIGNED_WITH_DECLARATION',reasons:torsionReasons},
    visibility:{score:visibilityScore,state:visibilityScore===1?'BOUNDED_COMPLETE':visibilityScore>=0.66?'PARTIAL':'LOW'},
    rest_debt:{score:restDebtScore,state:stateFromScore(restDebtScore,[[0.2,'CLEAR'],[0.5,'DUE'],[0.75,'REQUIRED'],[1,'HARD_REST']]),basis:['failed assays','stale observations','changed projection or endpoint','uncertainty']},
    invariant_coherence:{score:coherenceScore,state:coherenceScore===1?'PRESERVED':coherenceScore>=0.7?'PARTIAL':'BROKEN'},
    entropy_production:{score:entropyScore,state:stateFromScore(entropyScore,[[0.2,'LOW'],[0.5,'GROWING'],[0.75,'HIGH'],[1,'UNCONTROLLED']])}
  });
}

function chooseIntervention(profile, components, assaySummary) {
  const reasons = [];
  let intervention = 'BOUNDED_PACKET_REVIEW';
  if (profile.hard_holds.length || components.torsion.state === 'MISMATCH') {
    intervention = 'REST_AND_REOBSERVE';
    reasons.push(...profile.hard_holds, ...components.torsion.reasons);
  } else if (components.visibility.state !== 'BOUNDED_COMPLETE') {
    intervention = 'REST_AND_REOBSERVE'; reasons.push('ENVIRONMENT_VISIBILITY_INCOMPLETE');
  } else if (bool(signal(profile,'B','cloud_sync'))) {
    intervention = 'DISABLE_SYNC_AND_RETEST'; reasons.push('PERSISTENCE_HUMIDITY_WITH_SYNC');
  } else if (Number(assaySummary.metadata_recovery_upper || 0) > Number(assaySummary.metadata_threshold || 0.2)) {
    intervention = 'REMOVE_METADATA'; reasons.push('METADATA_RECOVERY_EXCEEDS_THRESHOLD');
  } else if (Number(assaySummary.chronology_recovery_upper || 0) > Number(assaySummary.chronology_threshold || 0.2)) {
    intervention = 'COARSEN_CHRONOLOGY'; reasons.push('CHRONOLOGY_RECOVERY_EXCEEDS_THRESHOLD');
  } else if (Number(assaySummary.relationship_recovery_upper || 0) > Number(assaySummary.relationship_threshold || 0.2)) {
    intervention = 'REMOVE_RELATION_BRIDGE'; reasons.push('RELATIONSHIP_RECOVERY_EXCEEDS_THRESHOLD');
  } else if (components.temperature.state === 'CRITICAL' || components.entropy_production.state === 'UNCONTROLLED') {
    intervention = 'KEEP_LOCAL'; reasons.push('EXPOSURE_ACTIVATION_OR_ENTROPY_CRITICAL');
  } else reasons.push('NO_COMPONENTWISE_HARD_HOLD_IN_DECLARED_MODEL');
  return { intervention, reasons:uniqueStrings(reasons) };
}

export async function compileRouteWeather(input, options = {}) {
  if (!(await verifyEnvironmentProfile(input.environment_profile, options))) throw new Error('Verified environment profile required.');
  assertNoArtifactContent(input);
  const components = deriveWeatherComponents(input.environment_profile, input.assay_summary || {}, input.prior_weather || []);
  const ruling = chooseIntervention(input.environment_profile, components, input.assay_summary || {});
  const dangerous = Object.entries(components).filter(([,value]) => ['CRITICAL','BLOCKING','OPAQUE','MISMATCH','LOW','HARD_REST','BROKEN','UNCONTROLLED'].includes(value.state)).map(([name,value]) => ({component:name,state:value.state}));
  const receipt = {
    schema:ROUTE_WEATHER_SCHEMA,schema_version:'0.1',
    weather_receipt_id:input.weather_receipt_id || `weather:${input.environment_profile.environment_id}:${Date.now()}`,
    case_id:input.environment_profile.case_id,created_at:input.created_at || nowIso(options.now),
    environment_profile_reference:input.environment_profile.record_id,environment_profile_digest:input.environment_profile.record_digest,
    sensor_bundle_reference:input.environment_profile.sensor_bundle_reference,sensor_bundle_digest:input.environment_profile.sensor_bundle_digest,
    artifact_blind:true,protected_dimension_summary:input.protected_dimension_summary || {},components,dominant_fold:dangerous,
    intervention:ruling.intervention,intervention_basis:ruling.reasons,
    hard_hold:input.environment_profile.hard_holds.length > 0 || components.torsion.state === 'MISMATCH',
    missingness:uniqueStrings(input.environment_profile.missingness),uncertainty:uniqueStrings([...(input.environment_profile.uncertainty || []),...(input.uncertainty || [])]),
    prior_weather_reference:input.prior_weather?.at(-1)?.weather_receipt_id || null,
    automatic_release:false,automatic_ash_action:false,prediction_authorized:false,universal_score:null,
    source_status:'DERIVED',claim_ceiling:'ARTIFACT_BLIND_ROUTE_CONTROL_SIGNAL_ONLY',operator_closure:String(input.operator_closure || 'OPEN')
  };
  receipt.record_digest = await digestRecord(ROUTE_WEATHER_SCHEMA, weatherSubject(receipt), options.cryptoImpl);
  return Object.freeze(receipt);
}

export async function verifyRouteWeather(receipt, options = {}) {
  if (!receipt || receipt.schema !== ROUTE_WEATHER_SCHEMA || receipt.artifact_blind !== true) return false;
  if (receipt.automatic_release !== false || receipt.automatic_ash_action !== false || receipt.prediction_authorized !== false || receipt.universal_score !== null) return false;
  assertNoArtifactContent(receipt);
  return receipt.record_digest === await digestRecord(ROUTE_WEATHER_SCHEMA, weatherSubject(receipt), options.cryptoImpl);
}

export async function compileRouteIntervention(weather, input = {}, options = {}) {
  if (!(await verifyRouteWeather(weather, options))) throw new Error('Verified route weather required.');
  if (!INTERVENTIONS.includes(weather.intervention)) throw new Error('Unknown Flow-Core intervention.');
  const receipt = {
    schema:ROUTE_INTERVENTION_SCHEMA,schema_version:'0.1',record_id:input.record_id || `intervention:${weather.weather_receipt_id}`,
    case_id:weather.case_id,created_at:input.created_at || nowIso(options.now),weather_reference:weather.weather_receipt_id,
    weather_digest:weather.record_digest,intervention:weather.intervention,intervention_basis:weather.intervention_basis,
    artifact_blind:true,automatic_release:false,automatic_ash_action:false,requires_human_gesture:true,source_status:'DERIVED',
    missingness:weather.missingness,uncertainty:weather.uncertainty,claim_ceiling:'INTERVENTION_RECOMMENDATION_ONLY',operator_closure:String(input.operator_closure || 'OPEN')
  };
  receipt.record_digest = await digestRecord(ROUTE_INTERVENTION_SCHEMA, withoutKeys(receipt,['record_digest']), options.cryptoImpl);
  return Object.freeze(receipt);
}

export async function compileWeatherSeries(input, options = {}) {
  const receipts = [...(input.receipts || [])];
  for (const receipt of receipts) if (!(await verifyRouteWeather(receipt, options))) throw new Error('Unverified weather in series.');
  const series = {
    schema:ROUTE_WEATHER_SERIES_SCHEMA,schema_version:'0.1',record_id:input.record_id || `weather-series:${input.case_id}`,
    case_id:input.case_id,created_at:input.created_at || nowIso(options.now),weather_references:receipts.map(item=>item.weather_receipt_id),
    weather_digests:receipts.map(item=>item.record_digest),transition_count:Math.max(0,receipts.length-1),artifact_blind:true,
    automatic_release:false,source_status:'DERIVED',missingness:uniqueStrings(receipts.flatMap(item=>item.missingness)),
    uncertainty:uniqueStrings(receipts.flatMap(item=>item.uncertainty)),claim_ceiling:'SERIES_REPLAY_ONLY',operator_closure:'OPEN'
  };
  series.record_digest = await digestRecord(ROUTE_WEATHER_SERIES_SCHEMA, withoutKeys(series,['record_digest']), options.cryptoImpl);
  return Object.freeze(series);
}
