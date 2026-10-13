import { verifyPortableLoomReceiverChallenge, PORTABLE_LOOM_CHALLENGE_VERIFICATION_SCHEMA } from './portable-loom-challenge.js';
import { portableLoomCoreDigest, copyPortableLoomJson } from './portable-loom-core.js';
import { LOOM_GATE_LABEL, LOOM_GATE_HREF } from './portable-loom-output.js';

export const PORTABLE_LOOM_GATE_SCHEMA = 'td613.loom.gate-alert/v0.1';
// Export only counts and references. Raw replies, canaries, expected answers,
// free-form scope descriptions and private reconstruction keys stay local.
export async function createPortableLoomGateReport(bundle, candidate, capture, environment = globalThis) {
  const verification = await verifyPortableLoomReceiverChallenge(bundle, candidate, capture, environment);
  const literal = verification.literal_exclusion, reconstruction = verification.protected_reconstruction;
  const recovered = reconstruction.probes.filter(probe => probe.recovered === true);
  const body = {
    schema: PORTABLE_LOOM_GATE_SCHEMA, action: 'CHECK_LOOM_GATE', label: LOOM_GATE_LABEL,
    href: LOOM_GATE_HREF,
    session_root_ref: verification.session_root_ref, anchor_work_unit_ref: verification.work_unit_ref,
    policy_commitment: verification.policy_commitment, challenge_ref: verification.challenge_ref, verification_ref: verification.ref,
    verification_schema: PORTABLE_LOOM_CHALLENGE_VERIFICATION_SCHEMA,
    status: verification.status, evidence_class: verification.evidence_class,
    reference_match: { ...verification.reference_match },
    coverage: { captured_channels: verification.capture.captured_channel_ids.length, missing_required_channels: verification.capture.required_missing_channels.length,
      checked_targets: literal.canary_count, disclosed_targets: new Set(literal.hits.map(hit => hit.canary_id)).size,
      declared_reconstruction_attempts: reconstruction.probes.length, measured_reconstruction_attempts: reconstruction.probes.filter(probe => probe.status === 'MEASURED').length,
      successful_reconstruction_attempts: recovered.length, missing_attempts: reconstruction.missing_probe_ids.length },
    joining: { observed: reconstruction.joining.filter(item => item.classification === 'JOINING_EXPOSURE_OBSERVED').length,
      incomplete: reconstruction.joining.filter(item => item.classification === 'INCOMPLETE').length },
    conversation_leakage_fraction: null,
    measurement: 'COUNTS_OF_DECLARED_TARGETS_AND_ATTEMPTS_ON_CAPTURED_SURFACES',
    receipt_scope: 'ORIGIN_COMPUTED_SUMMARY_REQUIRES_LOCAL_PRIVATE_RECORD_FOR_RECOMPUTATION',
    next_action: verification.status === 'OBSERVED_EXPOSURE' ? 'HOLD_REVIEW_EXPOSURE_AND_REGISTERED_SCOPE'
      : verification.status === 'BOUNDED_CHALLENGE_PASSED' ? 'REVIEW_CAPTURE_COVERAGE_BEFORE_CONTINUING' : 'HOLD_REPAIR_BINDING_OR_MISSING_CAPTURE',
    authority: { head_advanced: false, foreign_enforcement_proved: false, empirical_credit: 0 }
  };
  return Object.freeze({ ...body, ref: await portableLoomCoreDigest(body, environment) });
}

export async function inspectPortableLoomGateReport(report, environment = globalThis) {
  const { ref, ...body } = copyPortableLoomJson(report);
  const keys = (value, expected) => value && !Array.isArray(value) && Object.keys(value).sort().join('|') === expected.sort().join('|');
  const counts = body.coverage;
  if (!keys(body, ['schema','action','label','href','session_root_ref','anchor_work_unit_ref','policy_commitment','challenge_ref','verification_ref','verification_schema','status','evidence_class','reference_match','coverage','joining','conversation_leakage_fraction','measurement','receipt_scope','next_action','authority'])
    || !keys(counts, ['captured_channels','missing_required_channels','checked_targets','disclosed_targets','declared_reconstruction_attempts','measured_reconstruction_attempts','successful_reconstruction_attempts','missing_attempts'])
    || !keys(body.joining, ['observed','incomplete']) || !keys(body.authority, ['head_advanced','foreign_enforcement_proved','empirical_credit'])
    || !keys(body.reference_match, ['challenge','session','work_unit','policy']) || Object.values(body.reference_match).some(value=>typeof value!=='boolean')
    || ['ref','session_root_ref','anchor_work_unit_ref','policy_commitment','challenge_ref','verification_ref'].some(key=>!(/^[a-f0-9]{64}$/.test(key==='ref'?ref:body[key])))
    || [...Object.values(counts),...Object.values(body.joining)].some(value=>!Number.isSafeInteger(value)||value<0||value>100000)
    || counts.disclosed_targets>counts.checked_targets || counts.successful_reconstruction_attempts>counts.measured_reconstruction_attempts
    || counts.measured_reconstruction_attempts+counts.missing_attempts!==counts.declared_reconstruction_attempts
    || !['OBSERVED_EXPOSURE','HOLD_REFERENCE_MISMATCH','HELD_INCOMPLETE_OBSERVATION','BOUNDED_CHALLENGE_PASSED'].includes(body.status)
    || !['DECLARATION','OFFLINE_TEST','BROWSER_WITNESS','PROVIDER_RESPONSE','EMPIRICAL_ACQUISITION'].includes(body.evidence_class)
    || body.action!=='CHECK_LOOM_GATE' || body.label!==LOOM_GATE_LABEL || body.href!==LOOM_GATE_HREF
    || body.verification_schema!==PORTABLE_LOOM_CHALLENGE_VERIFICATION_SCHEMA
    || body.measurement!=='COUNTS_OF_DECLARED_TARGETS_AND_ATTEMPTS_ON_CAPTURED_SURFACES'
    || body.receipt_scope!=='ORIGIN_COMPUTED_SUMMARY_REQUIRES_LOCAL_PRIVATE_RECORD_FOR_RECOMPUTATION') throw new Error('Loom Gate summary shape changed.');
  const expectedNext=body.status==='OBSERVED_EXPOSURE'?'HOLD_REVIEW_EXPOSURE_AND_REGISTERED_SCOPE':body.status==='BOUNDED_CHALLENGE_PASSED'?'REVIEW_CAPTURE_COVERAGE_BEFORE_CONTINUING':'HOLD_REPAIR_BINDING_OR_MISSING_CAPTURE';
  if(body.next_action!==expectedNext)throw new Error('Loom Gate summary action changed.');
  if (body.schema !== PORTABLE_LOOM_GATE_SCHEMA || body.conversation_leakage_fraction !== null || body.authority?.head_advanced !== false
    || body.authority?.foreign_enforcement_proved !== false || body.authority?.empirical_credit !== 0
    || await portableLoomCoreDigest(body, environment) !== ref) throw new Error('Loom Gate summary integrity changed.');
  return { status: 'CARRIED_SUMMARY_INTEGRITY', local_private_recomputation_required: true, foreign_capture_authenticated: false };
}

export function describePortableLoomGateReport(report) {
  const c = report.coverage;
  return `${report.status === 'OBSERVED_EXPOSURE' ? 'Alert · exposure detected.' : report.status === 'BOUNDED_CHALLENGE_PASSED' ? 'Captured checks passed.' : (c.disclosed_targets || c.successful_reconstruction_attempts) ? 'HOLD · captured exposure; references require review.' : 'HOLD · incomplete or mismatched evidence.'} ${c.disclosed_targets} of ${c.checked_targets} declared protected targets appeared in ${c.captured_channels} captured channels. ${c.successful_reconstruction_attempts} of ${c.declared_reconstruction_attempts} reconstruction attempts recovered their declared target; ${report.joining.observed} joined recoveries. ${c.missing_required_channels} required channels and ${c.missing_attempts} attempts are missing. These counts describe the checked capture; a percentage of the whole conversation has not been measured.`;
}
