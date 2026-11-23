import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const SCRATCH_BASE = process.env.TD613_EXP_A_SCRATCH || path.join(process.env.USERPROFILE || process.env.HOME || '.', '.gemini', 'antigravity', 'brain', '9f2d357f-af13-4730-b6c0-a1afe1416169', 'scratch');
const RC_R1_DIR = path.join(SCRATCH_BASE, 'exp_a_reciprocal_completion_r1_20261029');
const OUT_DIR = path.join(RC_R1_DIR, '05_blinded_adversarial_packet_r1');

const aRc2Path = path.join(RC_R1_DIR, '03_assay_rc2_repaired/ASSAY_RC2_R1_RECEIPT.json');
const aRc3Path = path.join(RC_R1_DIR, '04_assay_rc3_repaired/ASSAY_RC3_R1_RECEIPT.json');

const aRc2 = JSON.parse(fs.readFileSync(aRc2Path, 'utf8'));
const aRc3 = JSON.parse(fs.readFileSync(aRc3Path, 'utf8'));

// 1. Randomize Arm Identifiers (5 arms)
const rawArmKeys = [
  'ARM_1_FLAT_P1_FIRST',
  'ARM_2_FLAT_EM_FIRST',
  'ARM_3A_UNTYPED_STRONG_UNION',
  'ARM_3B_TYPED_STRONG_UNION',
  'ARM_4_MODULAR_ROUTING'
];

const blindArmIds = rawArmKeys.map(() => 'ARM_' + crypto.randomBytes(3).toString('hex').toUpperCase());
// Shuffle
for (let i = blindArmIds.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [blindArmIds[i], blindArmIds[j]] = [blindArmIds[j], blindArmIds[i]];
}

// 2. Randomize Route Identifiers (5 conditions)
const rawRouteKeys = [
  'condition_1_unbridged',
  'condition_2_warranted_bridge',
  'condition_3a_obvious_false_twin',
  'condition_3b_plausible_false_twin',
  'condition_4_ablated_witness'
];

const blindRouteIds = rawRouteKeys.map(() => 'ROUTE_' + crypto.randomBytes(3).toString('hex').toUpperCase());
for (let i = blindRouteIds.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [blindRouteIds[i], blindRouteIds[j]] = [blindRouteIds[j], blindRouteIds[i]];
}

// Assemble Unblinding Key
const unblindingKey = {
  schema: 'td613.experiment-a.unblinding-key/v3-r1',
  generated_at: new Date().toISOString(),
  confidentiality_notice: 'STRICTLY LOCAL CUSTODY · DO NOT PUBLISH TO PUBLIC REPOSITORY · TRANSMIT PRIVATELY ONLY AFTER FROZEN INDEPENDENT EVALUATOR SCORE SHEET',
  arm_mappings: {},
  route_mappings: {}
};

for (let i = 0; i < rawArmKeys.length; i++) {
  unblindingKey.arm_mappings[blindArmIds[i]] = rawArmKeys[i];
}
for (let i = 0; i < rawRouteKeys.length; i++) {
  unblindingKey.route_mappings[blindRouteIds[i]] = rawRouteKeys[i];
}

// Assemble Blinded Observations
const blindedSweeps = [];

for (const sweep of aRc3.sweep_results) {
  const kappa = sweep.kappa_bytes;
  const sweepEntry = {
    budget_bytes: kappa,
    arms: {}
  };

  const armDataMap = {
    'ARM_1_FLAT_P1_FIRST': sweep.arm_1_flat_p1_first,
    'ARM_2_FLAT_EM_FIRST': sweep.arm_2_flat_em_first,
    'ARM_3A_UNTYPED_STRONG_UNION': sweep.arm_3a_untyped_strong_union_balanced,
    'ARM_3B_TYPED_STRONG_UNION': sweep.arm_3b_typed_strong_union_balanced,
    'ARM_4_MODULAR_ROUTING': sweep.arm_4_modular_chamber_routing
  };

  for (let i = 0; i < rawArmKeys.length; i++) {
    const rawKey = rawArmKeys[i];
    const blindId = blindArmIds[i];
    const d = armDataMap[rawKey];

    sweepEntry.arms[blindId] = {
      non_scalar_vector: d.vector,
      derived_scalar_score: d.score_v
    };
  }

  blindedSweeps.push(sweepEntry);
}

const blindedRoutes = {};
for (let i = 0; i < rawRouteKeys.length; i++) {
  const rawKey = rawRouteKeys[i];
  const blindId = blindRouteIds[i];
  const condData = aRc2.conditions[rawKey];

  blindedRoutes[blindId] = {
    admitted_path_count: condData.admitted_path_count,
    checks_passed_count: condData.checks ? Object.values(condData.checks).filter(Boolean).length : 0,
    total_checks_count: condData.checks ? Object.keys(condData.checks).length : 0
  };
}

const blindedPacket = {
  schema: 'td613.experiment-a.blinded-adversarial-review-packet/v3-r1',
  packet_id: 'BLINDED-R1-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
  timestamp: new Date().toISOString(),
  protocol: 'PROSPECTIVE_BLINDED_BENCHMARK_REVIEW_R1',
  notice: 'Contains objective numerical observation vectors and execution counts only. All condition names, descriptive arm titles, and authorial conclusions have been purged.',
  evaluation_instructions: 'Evaluate comparative cross-chamber performance, vector counts, and routing fidelity across anonymized arms and routes. Freeze evaluation scores before requesting sealed unblinding key transmission.',
  budget_sweeps: blindedSweeps,
  bridge_compilation_routes: blindedRoutes
};

fs.writeFileSync(path.join(OUT_DIR, 'BLINDED_ADVERSARIAL_REVIEW_PACKET_R1.json'), JSON.stringify(blindedPacket, null, 2), 'utf8');
fs.writeFileSync(path.join(OUT_DIR, 'SEALED_UNBLINDING_KEY_R1.json'), JSON.stringify(unblindingKey, null, 2), 'utf8');

console.log('Blinded Review Packet R1 built successfully.');
console.log('Sealed Unblinding Key R1 generated in local custody.');
