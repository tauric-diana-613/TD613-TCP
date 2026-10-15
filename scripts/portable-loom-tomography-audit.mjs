// This script is copied byte-for-byte beside the standard Portable Loom JSON.
// It recomputes canonical, separately sourced mathematical fixtures; it does
// not infer a protected conversation, run a provider, or manufacture evidence.
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runHardenedDiscreteTransportTomographyAssay } from './tomography/app/dome-world/previews/a15-r0/discrete-transport-tomography-closed-loop-hardened.js';
import { runNoncommutingTwoFaceHolonomyTomographyHoldout } from './tomography/app/dome-world/previews/a15-r0/noncommuting-two-face-holonomy-tomography.js';
import { buildGoldenEggFeasibleRegion } from './tomography/app/dome-world/previews/a15-r0/golden-egg-feasible-region.js';
import { evaluateGoldenEggEpisodeCandidate } from './tomography/app/engine/dollhouse-claim-lift-runtime.js';

const dir = dirname(fileURLToPath(import.meta.url));
const artifact = JSON.parse(await readFile(join(dir, 'portable-loom-standard.json'), 'utf8'));
const contract = JSON.parse(await readFile(join(dir, 'portable-loom-math-contract.json'), 'utf8'));
if (artifact.schema !== 'td613.loom.portable-session-export/v0.1'
  || artifact.portable_tomography?.schema !== contract.schema
  || artifact.portable_tomography?.execution !== 'LOCAL_COMPANION_REQUIRED') {
  throw new Error('Portable Loom artifact and separately exported tomography contract do not match.');
}
if (artifact.portable_task?.documents?.length || artifact.session?.work_units?.length || artifact.loom_gate_reports?.length) {
  throw new Error('The standard, non-demo Portable Loom must start with no task sources or acquired results.');
}
if (contract.empirical_acquisition !== 'NOT_RUN' || contract.qualified_same_episode !== false) {
  throw new Error('A standard export cannot pre-seed Golden Egg evidence.');
}

const transport = runHardenedDiscreteTransportTomographyAssay();
const surface = runNoncommutingTwoFaceHolonomyTomographyHoldout();
const region = buildGoldenEggFeasibleRegion();
if (transport.findings.hardened_assay_mechanism_validated !== true
  || transport.claims.holonomy_loom_runtime !== false
  || surface.findings.assay_mechanism_validated !== true
  || surface.claim_ceiling.production_authority !== false
  || region.joint_realizability !== 'UNMEASURED'
  || region.golden_egg_earned !== false
  || region.empirical_candidate_count !== 0) {
  throw new Error('Canonical discrete-math fixture or claim ceiling failed.');
}
const report = {
  schema: 'td613.loom.portable-tomography-audit/v0.1',
  artifact_source_revision: contract.source_revision,
  mathematical_modules_recomputed: true,
  transport: {
    schema: transport.schema,
    arithmetic_domain: transport.arithmetic_domain,
    hardened_nullspace_control_pass: transport.findings.primary_projection_nullspace_persists_through_common_heldout_probe,
    valid_finite_fixture: transport.findings.hardened_assay_mechanism_validated
  },
  face_holonomy: {
    schema: surface.schema,
    arithmetic_domain: surface.arithmetic_domain,
    distinct_noncommuting_loops_observed_in_authored_fixture: surface.findings.local_face_holonomies_noncommute,
    wrong_basepoint_rejected: surface.findings.wrong_basepoint_control_rejected,
    wrong_order_rejected: surface.findings.wrong_order_control_rejected,
    valid_finite_fixture: surface.findings.assay_mechanism_validated
  },
  feasible_region: {
    schema: region.schema,
    source_status: region.source_status,
    thresholds: region.thresholds,
    formal_candidate_count: region.formal_candidate_count,
    feasible_candidate_count: region.feasible_candidate_count,
    pareto_candidate_count: region.pareto_candidate_count,
    joint_realizability: region.joint_realizability
  },
  observed_real_routes: 'NOT_RUN',
  observed_protected_conversation: 'NOT_RUN',
  empirical_acquisition: 'NOT_RUN',
  independent_origin_authentication: 'NOT_PERFORMED',
  measured_g: null,
  observed_matched_control_protected_returns: null,
  empirical_golden_egg_earned: false,
  claim_ceiling: 'EXACT_AUTHORED_FINITE_MATHEMATICS_ONLY'
};
const args = process.argv.slice(2);
if (!args.length || (args.length === 1 && args[0] === '--self-check')) {
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
} else if (args.length === 2 && args[0] === '--episode') {
  const path = resolve(args[1]);
  // The independent-admission problem is still separate. This evaluator
  // checks declared same-episode fields; its result is NOT authentication.
  const evaluation = evaluateGoldenEggEpisodeCandidate(JSON.parse(await readFile(path, 'utf8')));
  process.stdout.write(JSON.stringify({
    schema: 'td613.loom.portable-episode-declaration-audit/v0.1',
    imported_evidence_class: 'OPERATOR_SUPPLIED_DECLARATION',
    independent_source_authentication: 'NOT_PERFORMED',
    empirical_promotion_authority: false,
    evaluation,
    formal_kernel_self_check: report
  }, null, 2) + '\n');
} else {
  throw new Error('Use: node portable-loom-tomography-audit.mjs [--self-check | --episode /path/to/captured-episode.json]');
}
