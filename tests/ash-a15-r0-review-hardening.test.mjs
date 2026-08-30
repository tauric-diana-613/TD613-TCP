import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const PARENT_892_RECEIPT='5e1c459bccd58ba89e6a218198e69d8d1518424e';
function resolveScientificHead(){
  const parents=execFileSync('git',['show','-s','--format=%P','HEAD'],{encoding:'utf8'}).trim().split(/\s+/).filter(Boolean);
  if(parents.length===2){ const candidate=parents[1]; try { execFileSync('git',['merge-base','--is-ancestor',PARENT_892_RECEIPT,candidate],{stdio:'pipe'}); return candidate; } catch {} }
  return 'HEAD';
}
const SCIENCE_HEAD=resolveScientificHead();
execFileSync('git',['cat-file','-e',`${PARENT_892_RECEIPT}^{commit}`],{stdio:'pipe'});
execFileSync('git',['merge-base','--is-ancestor',PARENT_892_RECEIPT,SCIENCE_HEAD],{stdio:'pipe'});
const ahead=Number(execFileSync('git',['rev-list','--count',`${PARENT_892_RECEIPT}..${SCIENCE_HEAD}`],{encoding:'utf8'}).trim());
assert.ok(ahead>=8,'prime-dual closure chamber must retain at least the eight preregistered/frozen scientific successor commits');
const changed=execFileSync('git',['diff','--name-only',`${PARENT_892_RECEIPT}..${SCIENCE_HEAD}`,'--','app/dome-world/docs/ash/experiments/a15-r0','app/dome-world/previews/a15-r0','tests'],{encoding:'utf8'}).trim().split('\n').filter(Boolean).filter(path=>path.startsWith('app/dome-world/docs/ash/experiments/a15-r0/')||path.startsWith('app/dome-world/previews/a15-r0/')||path.startsWith('tests/ash-a15-r0-'));
const allowed=new Set([
  'app/dome-world/docs/ash/experiments/a15-r0/FINITE_PRIME_DUAL_WITNESS_LOGIC_DECLARED_APERTURE_CLOSURE_PREREGISTRATION_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/FINITE_PRIME_DUAL_WITNESS_LOGIC_DECLARED_APERTURE_CLOSURE_EXPECTATIONS_V0_1.json',
  'app/dome-world/docs/ash/experiments/a15-r0/FINITE_PRIME_DUAL_WITNESS_LOGIC_DECLARED_APERTURE_CLOSURE_BURDEN_V0_1.json',
  'app/dome-world/docs/ash/experiments/a15-r0/FINITE_PRIME_DUAL_WITNESS_LOGIC_DECLARED_APERTURE_CLOSURE_FREEZE_V0_1.md',
  'app/dome-world/previews/a15-r0/finite-prime-dual-witness-logic-declared-aperture-closure.js',
  'tests/ash-a15-r0-aperture-pedagogue-finite-prime-dual-witness-logic-declared-aperture-closure.test.mjs',
  'tests/ash-a15-r0-aperture-pedagogue-finite-prime-dual-witness-logic-declared-aperture-closure-hostile.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);
const historicalMutations=changed.filter(path=>!allowed.has(path));
assert.deepEqual(historicalMutations,[],`post-#892 prime-dual closure chamber mutated inherited A15-R0 paths: ${historicalMutations.join(', ')}`);
assert.equal(changed.length,allowed.size,`prime-dual closure chamber must contain exactly ${allowed.size} live paths; observed ${changed.length}`);
for(const path of allowed) assert.equal(changed.includes(path),true,`missing prime-dual closure path: ${path}`);

execFileSync(process.execPath,['tests/ash-a15-r0-review-hardening-sharded.test.mjs'],{stdio:'inherit'});
await import('./ash-a15-r0-aperture-pedagogue-holonomy-loom-heterostratigraphic-research-bench.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-fadt-holonomy-loom-constitutional-descent-membrane.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-cech-nerve-descent-nonidentifiability.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dome-world-constitutional-projection-faithfulness.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-aia-receiver-indexed-distinguishability.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-phasonic-supermoire-dromological-tomography.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-s3-schedule-atlas-first-stratum-gate.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-schedule-state-identifiability-lag.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-baseline-replay-rescue-aperture.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-replay-transversality-unimodular-locus.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-replay-repair-quotient-canonical-section.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-holonomy-coarsened-robust-replay-inverse-design.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-holonomy-minimal-coordinate-repair-routing-aperture.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-holonomy-raw-aperture-cut-anisotropic-redundancy.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-holonomy-parity-completion-erasure-robust-aia.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-holonomy-single-corruption-correcting-aia.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-holonomy-corruption-plus-erasure-aia.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-holonomy-double-corruption-aia.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-holonomy-double-corruption-isometry-orbit.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-holonomy-orbit-transport-tomographic-conjugacy.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-holonomy-orbit-transport-witness-fiber-descent.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-holonomy-stabilizer-claim-authority-filtration.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-holonomy-repair-label-partition-safe-erasure-lattice.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-holonomy-safe-authority-closure-correspondence.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-bitemporal-authority-birth-nonretroactive-jurisdiction.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-bitemporal-prospective-replay-minimal-observation-policy.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-admissibility-horizon-refinement-recompression-rupture.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-claim-bundle-minimal-sufficient-custody-frontier.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-post-recompression-bundle-restoration-sidecar.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-restoration-holonomy-path-dependent-custody.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-anticipatory-custody-envelope-uniform-surface.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-two-surface-horizon-aliasing.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-finite-distinguishability-trajectory-calculus.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-trajectory-custody-functional-closure.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-trajectory-custody-functional-closure-refinement.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-finite-custody-behavioral-quotient-task-closure.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-finite-custody-behavioral-quotient-task-closure-hostile.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-finite-custody-task-dependency-poset.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-finite-custody-task-dependency-poset-hostile.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-finite-task-topology-rigidity-birkhoff.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-finite-task-topology-rigidity-birkhoff-hostile.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-finite-task-homotopy-amnesia-role-tomography.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-finite-task-homotopy-amnesia-role-tomography-hostile.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-finite-topological-probe-separation-redundancy.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-finite-topological-probe-separation-redundancy-hostile.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-finite-topological-distinguishability-metric-amnesia.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-finite-topological-distinguishability-metric-amnesia-hostile.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-finite-metric-cut-skeleton-topological-orientation.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-finite-metric-cut-skeleton-topological-orientation-hostile.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-finite-orientation-fibre-symmetry-breaking-identifiability.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-finite-orientation-fibre-symmetry-breaking-identifiability-hostile.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-finite-orientation-fibre-transport-opacity-erasure-robustness.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-finite-orientation-fibre-transport-opacity-erasure-robustness-hostile.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-finite-transport-separation-hypergraph-robust-multicover.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-finite-transport-separation-hypergraph-robust-multicover-hostile.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-finite-blocker-duality-minimal-obstruction-reconstruction.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-finite-blocker-duality-minimal-obstruction-reconstruction-hostile.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-finite-prime-dual-witness-logic-declared-aperture-closure.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-finite-prime-dual-witness-logic-declared-aperture-closure-hostile.test.mjs');
await import('./ash-a15-r0-wedding-identifiability.test.mjs');
console.log('Ash A15-R0 finite prime-dual witness logic / declared-aperture closure hardening tests passed.');
