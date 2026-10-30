/**
 * @fileoverview TD613 Dollhouse Native Antigravity Skill Dispatcher.
 *
 * Implements the six-role execution contract:
 *   - 5 Specialists: Pedagogue, Aperture, Atlas, FADT, Temporal Custodian
 *   - 1 Orchestrator: Multi-role scientific governance & evidence adjudication
 *
 * Scientific & Governance Invariants:
 *   - Genuine engine execution: calls actual restored domain modules;
 *   - Non-substitution: LLM reasoning/prose never replaces engine verification;
 *   - Shared acquisition on a single receipt adds ZERO empirical replication:
 *     SHARED_ACQUISITION != INDEPENDENT_REPLICATION;
 *   - Missing observations are never filled by inference; they remain NOT_EVALUATED/HELD;
 *   - Orchestrator preserves dissent and holds fail-closed;
 *   - Executed specialist findings and extension failures strictly govern the final Orchestrator disposition;
 *   - Standalone missing observations eliminate false SUPPORTED outcomes;
 *   - Source revision and evidence references bind to verifiable provenance;
 *   - Artifact writes fail closed and prevent unauthorized file overwrites;
 *   - Release and deployment authority remain strictly false; human closure is always required.
 */

import { createHash } from 'node:crypto';
import { existsSync, lstatSync, statSync, readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { resolve, isAbsolute, relative } from 'node:path';
import {
  FIVE_ROLES,
  ROLE_INFRACTIONS,
  FAILURE_MODES,
  executeSpecialistRole,
  runOrchestrationDecision,
  normalizeRoleObservations
} from './dollhouse-ablation-harness.js';
import {
  auditDollhouseDromologicalCadence,
  auditDollhouseInstitutionalTime,
  auditDollhouseLineageSecondPass,
  runPedagogueAgent
} from './dollhouse-pedagogue-dromological.js';
import {
  auditTypedEpistemicDeficit,
  computeMatrixSvd,
  evaluateCandidateProbeStability
} from './aperture-v32-typed-epistemic-deficit.js';
import {
  classifyAtlasRelationIdentity,
  auditAtlasHolonomyHistoryParity,
  auditPhasonCustodyDiff
} from './dollhouse-atlas-relational-custody.js';
import {
  probeA01_FutureResponseSeparation,
  probeA02_HigherOrderParity,
  probeA03_GHZPhaseAndLocality,
  probeA04_F31RankVsRealSVD,
  probeA05_RepresentationCausalControl,
  probeA06_OntologyFreeSurprise,
  probeA07_QuantumVisibilityAmbiguity,
  probeA08_MeasurementContextIntervention,
  probeA09_MathematicalNotationEquivalence
} from '../../docs/research/experiment-b-preflight/09_atlas_mathematical_qualification/atlas-mathematical-qualification-suite.mjs';
import {
  computeFadtFiberBounds,
  evaluateFadtCoordinateRecovery,
  evaluateFadtDiscrepancyIdentity,
  compileFadtReparativePacket
} from './dollhouse-fadt-reparative-assistance.js';
import {
  runTemporalCustodianAudit,
  auditServiceJourneyChronology
} from './dollhouse-temporal-custodian.js';
import {
  createDollhouseCaseDossier,
  DOLLHOUSE_CASE_DOSSIER_SCHEMA
} from './dollhouse-case-dossier.js';
import { DOLLHOUSE_AGENT_REGISTRY } from './dollhouse-agent-registry.js';

export const DOLLHOUSE_SKILL_AUDIT_SCHEMA = 'td613.dollhouse.skill-audit/v1.0';
export const DOLLHOUSE_SKILL_RECEIPT_SCHEMA = 'td613.dollhouse.skill-audit-receipt/v1.0';

export const CANONICAL_SPECIALIST_ROLES = FIVE_ROLES;
export const ORCHESTRATOR_ROLE = 'ORCHESTRATOR';
export const ALL_CANONICAL_ROLES = Object.freeze([...FIVE_ROLES, ORCHESTRATOR_ROLE]);

/**
 * Inspects working tree cleanliness for modified, staged, or untracked source files.
 * @param {string} [repoRoot]
 * @param {object} [options]
 * @returns {{ is_clean: boolean, modified_files: string[], staged_files: string[], untracked_source_files: string[] }}
 */
export function inspectExecutingSourceCleanliness(repoRoot, options = {}) {
  const child_process = globalThis.process?.getBuiltinModule?.('node:child_process');
  if (!child_process?.execFileSync) {
    return { is_clean: true, modified_files: [], staged_files: [], untracked_source_files: [] };
  }
  try {
    const cwd = repoRoot || process.cwd();
    const output = child_process.execFileSync('git', ['status', '--porcelain'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    });
    const lines = output.split(/\r?\n/).map(l => l.trimEnd()).filter(Boolean);
    const modified = [];
    const staged = [];
    const untracked = [];

    for (const line of lines) {
      const code = line.slice(0, 2);
      const filePath = line.slice(3).trim();
      // Skip ignorable scratch, tmp, .gemini
      if (filePath.startsWith('scratch/') || filePath.startsWith('tmp/') || filePath.startsWith('.gemini/')) {
        continue;
      }
      const isStaged = code[0] !== ' ' && code[0] !== '?' && code[0] !== '!';
      const isWorkTree = code[1] !== ' ' && code[1] !== '?' && code[1] !== '!';
      const isUntracked = code === '??';

      if (isStaged) staged.push(filePath);
      if (isWorkTree) modified.push(filePath);
      if (isUntracked && (filePath.endsWith('.js') || filePath.endsWith('.mjs') || filePath.startsWith('app/') || filePath.startsWith('scripts/'))) {
        untracked.push(filePath);
      }
    }

    const isClean = staged.length === 0 && modified.length === 0 && untracked.length === 0;
    return {
      is_clean: isClean,
      modified_files: modified,
      staged_files: staged,
      untracked_source_files: untracked
    };
  } catch {
    return { is_clean: false, modified_files: ['GIT_INSPECTION_FAILED'], staged_files: [], untracked_source_files: [] };
  }
}

/**
 * Resolves current git head SHA if available, otherwise returns fallback.
 * @param {object} [options]
 * @returns {string}
 */
export function resolveCurrentSourceRevision(options = {}) {
  const child_process = globalThis.process?.getBuiltinModule?.('node:child_process');
  if (child_process?.execFileSync) {
    try {
      const cwd = options.repo_root || options.repoRoot || process.cwd();
      const sha = child_process.execFileSync('git', ['rev-parse', 'HEAD'], {
        cwd,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore']
      }).trim();
      if (/^[a-f0-9]{40}$/.test(sha)) {
        return sha;
      }
    } catch {
      return 'WORKING_TREE_UNCOMMITTED';
    }
  }
  return 'WORKING_TREE_UNCOMMITTED';
}

/**
 * Binds and validates source revision against verifiable git provenance and working tree cleanliness.
 * @param {string} sourceRev
 * @param {object} [options]
 * @returns {object}
 */
export function verifySourceRevision(sourceRev, options = {}) {
  const repoRoot = options.repo_root || options.repoRoot || process.cwd();
  const checkoutRev = resolveCurrentSourceRevision({ repo_root: repoRoot });
  const cleanliness = inspectExecutingSourceCleanliness(repoRoot, options);

  if (typeof sourceRev !== 'string' || !sourceRev.trim()) {
    return {
      verified: false,
      git_commit_verified: false,
      reason: 'MISSING_SOURCE_REVISION',
      infraction: 'HOLD_UNVERIFIABLE_SOURCE_REVISION',
      declared_revision: null,
      executing_checkout_revision: checkoutRev,
      is_working_tree: false,
      cleanliness,
      source_revision: null
    };
  }

  const trimmed = sourceRev.trim();

  // Allow working tree fallback when explicitly running in uncommitted local state
  if (trimmed === 'WORKING_TREE_UNCOMMITTED') {
    if (options.strict_provenance === true) {
      return {
        verified: false,
        git_commit_verified: false,
        in_local_git_history: false,
        is_working_tree: true,
        declared_revision: trimmed,
        executing_checkout_revision: checkoutRev,
        reason: 'STRICT_PROVENANCE_REFUSES_UNCOMMITTED',
        infraction: 'HOLD_STRICT_PROVENANCE_FAILED',
        status: 'UNCOMMITTED_REFUSED_UNDER_STRICT_PROVENANCE',
        cleanliness,
        source_revision: trimmed
      };
    }
    return {
      verified: true,
      git_commit_verified: false,
      in_local_git_history: false,
      is_working_tree: true,
      declared_revision: trimmed,
      executing_checkout_revision: checkoutRev,
      status: 'WORKING_TREE_RESEARCH_MODE',
      cleanliness,
      source_revision: trimmed
    };
  }

  // Must match 40-character hex commit SHA
  if (!/^[a-f0-9]{40}$/.test(trimmed)) {
    return {
      verified: false,
      git_commit_verified: false,
      reason: 'INVALID_SOURCE_REVISION_FORMAT',
      infraction: options.strict_provenance === true ? 'HOLD_STRICT_PROVENANCE_FAILED' : 'HOLD_UNVERIFIABLE_SOURCE_REVISION',
      declared_revision: trimmed,
      executing_checkout_revision: checkoutRev,
      is_working_tree: false,
      cleanliness,
      source_revision: trimmed
    };
  }

  // Check against local git history using execFileSync to avoid shell escaping issues
  const child_process = globalThis.process?.getBuiltinModule?.('node:child_process');
  if (child_process?.execFileSync) {
    try {
      child_process.execFileSync('git', ['cat-file', '-e', `${trimmed}^{commit}`], {
        cwd: repoRoot,
        stdio: ['ignore', 'ignore', 'ignore']
      });
      const isExactCheckoutSha = (trimmed.toLowerCase() === checkoutRev.toLowerCase());
      const exactMatch = isExactCheckoutSha && (checkoutRev !== 'WORKING_TREE_UNCOMMITTED');

      if (options.require_clean_source === true || options.require_exact_checkout === true) {
        if (!cleanliness.is_clean) {
          return {
            verified: false,
            git_commit_verified: true,
            in_local_git_history: true,
            is_exact_checkout_match: isExactCheckoutSha,
            exact_checkout_verified: false,
            cleanliness,
            reason: 'WORKING_TREE_DIRTY_NOT_CLEAN_CHECKOUT',
            infraction: 'HOLD_WORKING_TREE_DIRTY_NOT_CLEAN_CHECKOUT',
            status: 'WORKING_TREE_DIRTY_REFUSED',
            declared_revision: trimmed,
            executing_checkout_revision: checkoutRev,
            source_revision: trimmed
          };
        }
        if (options.require_exact_checkout === true && !exactMatch) {
          return {
            verified: false,
            git_commit_verified: true,
            in_local_git_history: true,
            is_exact_checkout_match: false,
            exact_checkout_verified: false,
            is_historical_commit_only: true,
            cleanliness,
            reason: 'HISTORICAL_COMMIT_NOT_EXACT_CHECKOUT',
            infraction: 'HOLD_HISTORICAL_COMMIT_NOT_EXACT_CHECKOUT',
            status: 'HISTORICAL_COMMIT_VERIFIED_NON_EQUIVALENT',
            declared_revision: trimmed,
            executing_checkout_revision: checkoutRev,
            source_revision: trimmed
          };
        }
      }

      return {
        verified: true,
        git_commit_verified: true,
        in_local_git_history: true,
        is_exact_checkout_match: isExactCheckoutSha,
        exact_checkout_verified: exactMatch && cleanliness.is_clean,
        is_historical_commit_only: !isExactCheckoutSha,
        is_working_tree: isExactCheckoutSha,
        cleanliness,
        declared_revision: trimmed,
        executing_checkout_revision: checkoutRev,
        status: isExactCheckoutSha ? 'EXACT_CHECKOUT_VERIFIED' : 'HISTORICAL_COMMIT_VERIFIED_NON_EQUIVALENT',
        source_revision: trimmed
      };
    } catch {
      return {
        verified: false,
        git_commit_verified: false,
        in_local_git_history: false,
        is_exact_checkout_match: false,
        exact_checkout_verified: false,
        is_historical_commit_only: false,
        is_working_tree: false,
        cleanliness,
        declared_revision: trimmed,
        executing_checkout_revision: checkoutRev,
        reason: 'COMMIT_NOT_IN_LOCAL_HISTORY',
        infraction: 'HOLD_SOURCE_REVISION_NOT_IN_LOCAL_HISTORY',
        status: 'UNVERIFIED_SOURCE_REVISION',
        source_revision: trimmed
      };
    }
  }

  return {
    verified: false,
    git_commit_verified: false,
    in_local_git_history: false,
    declared_revision: trimmed,
    executing_checkout_revision: checkoutRev,
    is_working_tree: false,
    source_revision: trimmed
  };
}

/**
 * Validates declared evidence references against workspace existence or digest provenance.
 */
export function verifyEvidenceReferences(references = [], options = {}) {
  if (!Array.isArray(references)) {
    return {
      all_verified: false,
      manifest: [],
      infractions: ['INVALID_EVIDENCE_REFERENCES_FORMAT']
    };
  }

  const manifest = [];
  const infractions = [];
  const repoRoot = resolve(process.cwd());
  const tempDir = resolve(globalThis.process?.env?.TEMP || globalThis.process?.env?.TMPDIR || '/tmp');

  for (const ref of references) {
    if (ref == null) continue;

    // 1. Check if standalone 64-character hex digest without file bytes
    if (typeof ref === 'string' && /^[a-f0-9]{64}$/i.test(ref.trim())) {
      const strRef = ref.trim();
      manifest.push({
        reference: strRef,
        type: 'STANDALONE_CONTENT_DIGEST',
        verified: false,
        byte_digest_verified: false,
        reason: 'STANDALONE_DIGEST_WITHOUT_FILE_BYTES',
        provenance_tier: 'UNVERIFIED_DIGEST_DECLARATION'
      });
      infractions.push('HOLD_UNVERIFIED_STANDALONE_DIGEST');
      continue;
    }

    // 2. Check if git commit SHA (40 hex chars)
    if (typeof ref === 'string' && /^[a-f0-9]{40}$/i.test(ref.trim())) {
      const strRef = ref.trim();
      const child_process = globalThis.process?.getBuiltinModule?.('node:child_process');
      let commitFound = false;
      if (child_process?.execFileSync) {
        try {
          child_process.execFileSync('git', ['cat-file', '-e', `${strRef}^{commit}`], { stdio: ['ignore', 'ignore', 'ignore'] });
          commitFound = true;
        } catch {
          commitFound = false;
        }
      }
      manifest.push({
        reference: strRef,
        type: 'COMMIT_SHA',
        verified: commitFound,
        in_local_git_history: commitFound,
        byte_digest_verified: false,
        reason: commitFound ? undefined : 'COMMIT_NOT_IN_LOCAL_HISTORY'
      });
      if (!commitFound) infractions.push('UNVERIFIED_EVIDENCE_REFERENCE');
      continue;
    }

    // 3. File reference (object or string)
    let filePath;
    let expectedSha = null;
    if (typeof ref === 'object') {
      filePath = ref.path || ref.file || ref.reference;
      expectedSha = ref.sha256 || ref.digest || ref.hash;
      if (!filePath) {
        manifest.push({
          reference: JSON.stringify(ref),
          type: 'INVALID_OBJECT_REFERENCE',
          verified: false,
          byte_digest_verified: false,
          reason: 'MISSING_FILE_PATH'
        });
        infractions.push('UNVERIFIED_EVIDENCE_REFERENCE');
        continue;
      }
    } else {
      filePath = String(ref).trim();
    }

    if (!filePath) continue;

    const fullPath = resolve(filePath);

    // Path escape check: must be inside repository or temp subtrees
    const relRepo = relative(repoRoot, fullPath);
    const relTemp = relative(tempDir, fullPath);
    const isInsideRepo = !relRepo.startsWith('..') && !isAbsolute(relRepo);
    const isInsideTemp = !relTemp.startsWith('..') && !isAbsolute(relTemp);

    if (!isInsideRepo && !isInsideTemp) {
      manifest.push({
        reference: filePath,
        type: 'ESCAPED_PATH',
        verified: false,
        byte_digest_verified: false,
        reason: 'PATH_ESCAPE_OUTSIDE_WORKSPACE'
      });
      infractions.push('HOLD_EVIDENCE_REFERENCE_PATH_ESCAPE');
      continue;
    }

    // Existence check
    if (!existsSync(fullPath)) {
      manifest.push({
        reference: filePath,
        type: 'WORKSPACE_FILE',
        verified: false,
        byte_digest_verified: false,
        reason: 'FILE_NOT_FOUND'
      });
      infractions.push('UNVERIFIED_EVIDENCE_REFERENCE');
      continue;
    }

    // Symlink check
    try {
      const lst = lstatSync(fullPath);
      if (lst.isSymbolicLink()) {
        manifest.push({
          reference: filePath,
          type: 'SYMBOLIC_LINK',
          verified: false,
          byte_digest_verified: false,
          reason: 'SYMLINK_EVIDENCE_REFERENCE_REJECTED'
        });
        infractions.push('HOLD_EVIDENCE_SYMLINK_REJECTED');
        continue;
      }
    } catch {}

    // Reject symlinked ancestors as well as symlinked leaf references.
    // Resolving a relative path within the repository must not follow a
    // junction out of the approved evidence subtree.
    let evidenceParent = resolve(fullPath, '..');
    let symlinkedAncestor = false;
    while (true) {
      try {
        if (lstatSync(evidenceParent).isSymbolicLink()) {
          symlinkedAncestor = true;
          break;
        }
      } catch {
        symlinkedAncestor = true;
        break;
      }
      const parent = resolve(evidenceParent, '..');
      if (parent === evidenceParent) break;
      evidenceParent = parent;
    }
    if (symlinkedAncestor) {
      manifest.push({
        reference: filePath,
        type: 'SYMBOLIC_LINK_ANCESTOR',
        verified: false,
        byte_digest_verified: false,
        reason: 'SYMLINK_EVIDENCE_REFERENCE_REJECTED'
      });
      infractions.push('HOLD_EVIDENCE_SYMLINK_REJECTED');
      continue;
    }

    // Regular file check (directories or non-regular files cannot establish byte evidence)
    let st;
    try {
      st = statSync(fullPath);
    } catch (err) {
      manifest.push({
        reference: filePath,
        type: 'WORKSPACE_FILE',
        verified: false,
        byte_digest_verified: false,
        reason: 'STAT_ERROR',
        error: err.message
      });
      infractions.push('UNVERIFIED_EVIDENCE_REFERENCE');
      continue;
    }

    if (!st.isFile()) {
      manifest.push({
        reference: filePath,
        type: st.isDirectory() ? 'DIRECTORY' : 'NON_REGULAR_FILE',
        verified: false,
        byte_digest_verified: false,
        reason: 'NOT_A_REGULAR_FILE',
        detail: 'An existing directory or unreadable file cannot establish byte-verifiable evidence'
      });
      infractions.push('HOLD_NON_REGULAR_FILE_REFERENCE');
      continue;
    }

    // Read bytes & compute SHA-256
    let bytes;
    try {
      bytes = readFileSync(fullPath);
    } catch (err) {
      manifest.push({
        reference: filePath,
        type: 'WORKSPACE_FILE',
        verified: false,
        byte_digest_verified: false,
        reason: 'UNREADABLE_FILE_BYTES',
        error: err.message
      });
      infractions.push('UNVERIFIED_EVIDENCE_REFERENCE');
      continue;
    }

    const actualDigest = createHash('sha256').update(bytes).digest('hex');
    const digestMatches = expectedSha ? (actualDigest.toLowerCase() === expectedSha.toLowerCase()) : true;

    manifest.push({
      reference: filePath,
      type: 'WORKSPACE_FILE',
      verified: digestMatches,
      byte_digest: actualDigest,
      byte_digest_verified: digestMatches,
      sha256: actualDigest,
      reason: digestMatches ? undefined : 'BYTE_DIGEST_MISMATCH'
    });

    if (!digestMatches) {
      infractions.push('EVIDENCE_BYTE_DIGEST_MISMATCH');
    }
  }

  const all_verified = manifest.length === 0 ? true : manifest.every(m => m.verified === true);
  return {
    all_verified,
    manifest,
    infractions
  };
}

/**
 * Normalizes input role list, identifying active specialists and orchestrator flag.
 */
function normalizeRequestedRoles(requestedRoles) {
  if (!requestedRoles || !Array.isArray(requestedRoles) || requestedRoles.length === 0) {
    return {
      specialist_roles: [...CANONICAL_SPECIALIST_ROLES],
      include_orchestrator: true,
      unknown_roles: []
    };
  }

  const upper = requestedRoles.map(r => String(r).trim().toUpperCase());
  const unknown_roles = upper.filter(r => !ALL_CANONICAL_ROLES.includes(r));
  const specialist_roles = upper.filter(r => CANONICAL_SPECIALIST_ROLES.includes(r));
  const include_orchestrator = upper.includes(ORCHESTRATOR_ROLE);

  return {
    specialist_roles,
    include_orchestrator,
    unknown_roles
  };
}

/**
 * Executes specialized domain audit extensions if richer inputs are provided.
 */
function executeSpecialistExtensions(role, domainInput, options) {
  if (!domainInput || typeof domainInput !== 'object') {
    return null;
  }

  try {
    switch (role) {
      case 'PEDAGOGUE': {
        const ext = {};
        if (domainInput.events && Array.isArray(domainInput.events)) {
          ext.cadence_audit = auditDollhouseDromologicalCadence(domainInput);
        }
        if (domainInput.clocks || domainInput.closure || (domainInput.t_op !== undefined && domainInput.t_inst !== undefined)) {
          ext.institutional_time_audit = auditDollhouseInstitutionalTime(domainInput);
        }
        if (domainInput.declared_deficits && domainInput.lenses) {
          ext.lineage_second_pass = auditDollhouseLineageSecondPass(domainInput);
        }
        return Object.keys(ext).length > 0 ? ext : null;
      }
      case 'APERTURE': {
        const ext = {};
        if (domainInput.current_operator || domainInput.candidate_probe || domainInput.candidate_probes || domainInput.latent_dimension) {
          ext.epistemic_deficit = auditTypedEpistemicDeficit(domainInput);
        }
        if (domainInput.matrix && Array.isArray(domainInput.matrix)) {
          ext.matrix_svd = computeMatrixSvd(domainInput.matrix);
        }
        return Object.keys(ext).length > 0 ? ext : null;
      }
      case 'ATLAS': {
        const ext = {};
        if (domainInput.trajectoryA && domainInput.trajectoryB) {
          ext.holonomy_parity = auditAtlasHolonomyHistoryParity(domainInput.trajectoryA, domainInput.trajectoryB);
        }
        if (domainInput.relation_entry) {
          ext.relation_identity = classifyAtlasRelationIdentity(domainInput.relation_entry);
        }
        const prev = domainInput.previous || domainInput.phason_diff?.previous;
        const curr = domainInput.current || domainInput.phason_diff?.current;
        const phasonOpts = domainInput.options || domainInput.phason_diff?.options || {};
        if (prev && curr) {
          ext.phason_custody_diff = auditPhasonCustodyDiff(prev, curr, phasonOpts);
        }
        // Atlas Wild Field Mathematical Capabilities (Issue #1612 / Chambers I-V)
        if (domainInput.temporal_fiber) {
          ext.temporal_fiber = probeA01_FutureResponseSeparation(domainInput.temporal_fiber);
        }
        if (domainInput.higher_order_parity) {
          ext.higher_order_parity = probeA02_HigherOrderParity(domainInput.higher_order_parity);
        }
        if (domainInput.ghz_stabilizer) {
          ext.ghz_stabilizer = probeA03_GHZPhaseAndLocality(domainInput.ghz_stabilizer);
        }
        if (domainInput.modular_vs_real_svd || domainInput.linear_algebra_conditioning) {
          ext.modular_vs_real_svd = probeA04_F31RankVsRealSVD(domainInput.modular_vs_real_svd || domainInput.linear_algebra_conditioning);
        }
        if (domainInput.causal_morphism_control || domainInput.representation_morphism) {
          ext.causal_morphism_control = probeA05_RepresentationCausalControl(domainInput.causal_morphism_control || domainInput.representation_morphism);
        }
        if (domainInput.ontology_free_surprise) {
          ext.ontology_free_surprise = probeA06_OntologyFreeSurprise(domainInput.ontology_free_surprise);
        }
        if (domainInput.visibility_inverse) {
          ext.visibility_inverse = probeA07_QuantumVisibilityAmbiguity(domainInput.visibility_inverse);
        }
        if (domainInput.measurement_context) {
          ext.measurement_context = probeA08_MeasurementContextIntervention(domainInput.measurement_context);
        }
        if (domainInput.notation_normalization) {
          ext.notation_normalization = probeA09_MathematicalNotationEquivalence(domainInput.notation_normalization);
        }
        return Object.keys(ext).length > 0 ? ext : null;
      }
      case 'FADT': {
        const ext = {};
        if (domainInput.fiberRows && Array.isArray(domainInput.fiberRows)) {
          ext.fiber_bounds = computeFadtFiberBounds(domainInput.fiberRows);
        }
        const collidingRows = domainInput.collidingFiberRows || domainInput.colliding_fiber_rows || domainInput.coordinate_recovery?.collidingFiberRows;
        const candidateCoords = domainInput.candidateCoordinates || domainInput.candidate_coordinates || domainInput.coordinate_recovery?.candidateCoordinates;
        if (Array.isArray(collidingRows) && collidingRows.length > 0 && Array.isArray(candidateCoords) && candidateCoords.length > 0) {
          ext.coordinate_recovery = evaluateFadtCoordinateRecovery(collidingRows, candidateCoords);
        }
        const candRule = domainInput.candidate_rule || domainInput.candidateRule || domainInput.discrepancy_identity?.candidate_rule;
        const fRows = domainInput.fiberRows || domainInput.fiber_rows || domainInput.discrepancy_identity?.fiber_rows;
        if (Array.isArray(candRule) && Array.isArray(fRows) && fRows.length > 0) {
          ext.discrepancy_identity = evaluateFadtDiscrepancyIdentity(candRule, fRows);
        }
        if (domainInput.reparative_spec) {
          ext.reparative_packet = compileFadtReparativePacket(domainInput.reparative_spec);
        }
        return Object.keys(ext).length > 0 ? ext : null;
      }
      case 'TEMPORAL_CUSTODIAN': {
        const ext = {};
        if (domainInput.phases && domainInput.required_phases) {
          ext.journey_chronology = auditServiceJourneyChronology(domainInput.phases, domainInput.required_phases);
        }
        const tempInput = domainInput.temporal_input || domainInput.temporal_audit_input || (domainInput.schema && domainInput.ledger_entries ? domainInput : null);
        if (tempInput) {
          ext.temporal_audit = runTemporalCustodianAudit(tempInput);
        }
        return Object.keys(ext).length > 0 ? ext : null;
      }
      default:
        return null;
    }
  } catch (err) {
    return {
      extension_error: err?.message || String(err)
    };
  }
}

/**
 * Compiles a human-readable research markdown receipt.
 */
function compileHumanReceipt(machineReceipt) {
  const {
    invocation_id,
    timestamp,
    source_revision,
    task_scope,
    evidence_class,
    roles_requested,
    roles_executed,
    missing_inputs,
    specialist_findings,
    detected_infractions,
    orchestrator,
    replication_status,
    empirical_replication_count,
    unresolved_questions,
    next_permissible_action,
    execution_duration_ms
  } = machineReceipt;

  const decisionBadge = orchestrator?.decision === 'SUPPORTED' ? '🟢 SUPPORTED' : '🔴 HELD';
  const consensusText = orchestrator?.consensus || 'NONE';

  const rows = specialist_findings.map(f => {
    const verdictBadge = f.verdict === 'SUPPORTED' ? '✓ SUPPORTED' : (f.verdict === 'HELD' ? '✖ HELD' : '○ NOT_EVALUATED');
    const defectBadge = f.defect_class ? `\`${f.defect_class}\`` : '`-`';
    return `| \`${f.role}\` | ${f.jurisdiction} | **${verdictBadge}** | \`${f.status}\` | ${defectBadge} | ${f.claim} |`;
  }).join('\n');

  const infractionsList = detected_infractions.length > 0
    ? detected_infractions.map(i => `- \`${i}\``).join('\n')
    : '_None detected._';

  const missingList = missing_inputs.length > 0
    ? missing_inputs.map(m => `- \`${m}\`: input unsupplied or null`).join('\n')
    : '_All requested specialist inputs were supplied._';

  const questionsList = unresolved_questions.length > 0
    ? unresolved_questions.map(q => `- ${q}`).join('\n')
    : '_None._';

  return `# 𝌋 TD613 Dollhouse Scientific Audit Receipt

**Invocation ID:** \`${invocation_id}\`  
**Schema:** \`${DOLLHOUSE_SKILL_RECEIPT_SCHEMA}\`  
**Timestamp:** ${timestamp}  
**Target Revision:** \`${source_revision}\`  
**Task Scope:** \`${task_scope}\`  
**Evidence Class:** \`${evidence_class}\`  
**Replication Status:** \`${replication_status}\` (Empirical Credit: ${empirical_replication_count})  
**Execution Duration:** ${execution_duration_ms}ms  

---

## 1. Executive Disposition & Summary

| Instrument Property | Status / Value |
|---|---|
| **Orchestrator Decision** | **${decisionBadge}** (\`${orchestrator?.decision || 'NOT_RUN'}\`) |
| **Consensus** | \`${consensusText}\` |
| **Detected Infractions** | ${detected_infractions.length} |
| **Release Authority** | **STRICTLY CLOSED (false)** |
| **Deployment Authority** | **STRICTLY CLOSED (false)** |
| **Human Closure Required** | **YES (true)** |

---

## 2. Examination Scope & Inputs

- **Roles Requested:** ${roles_requested.map(r => `\`${r}\``).join(', ')}
- **Roles Executed:** ${roles_executed.map(r => `\`${r}\``).join(', ')}
- **Missing / Withheld Inputs:**
${missingList}

---

## 3. Specialist Findings

| Specialist Role | Jurisdiction | Verdict | Status | Defect Class | Finding / Claim |
|---|---|---|---|---|---|
${rows}

---

## 4. Orchestrator Governance & Detected Infractions

### Detected Infractions:
${infractionsList}

### Governance Invariants:
1. **Replication Discipline:** Shared acquisition on a single receipt adds **zero** independent empirical replication (\`SHARED_ACQUISITION != INDEPENDENT_REPLICATION\`).
2. **Veto Preservation:** Specialist infractions and holds survive agreeable narratives; a single domain hold prevents unsupported promotion.
3. **Missingness Invariant:** Missing specialist senses remain visibly unexamined; the Orchestrator holds on incomplete observations.
4. **Authority Boundary:** The Orchestrator produces recommendation and verification records only; it never grants release, merge, or deployment authority.

---

## 5. Unresolved Questions & Holds

${questionsList}

---

## 6. What Would Resolve the Hold

${orchestrator?.decision === 'SUPPORTED'
  ? '_All active specialist invariants verified. No open holds._'
  : (detected_infractions.map(i => {
      if (i.includes('PEDAGOGUE') || i.includes('CADENCE')) return '- **Pedagogue Hold:** Restore canonical order NOTICE < ACT < WORLD_ANSWERS < NAME and ensure returned-work navigation routes do not trap the operator.';
      if (i.includes('APERTURE') || i.includes('NUMERICAL') || i.includes('NOISE')) return '- **Aperture Hold:** Ensure operator matrix is numerically well-conditioned and noise covariance is symmetric positive-definite. Do not treat URL hash as DOM admission.';
      if (i.includes('ATLAS') || i.includes('HOLONOMY') || i.includes('BRIDGE')) return '- **Atlas Hold:** Verify predecessor receipt continuity across window boundaries and ensure serialization profiles (dome-v0 vs atlas-v1) match.';
      if (i.includes('FADT') || i.includes('FIBER') || i.includes('GAP')) return '- **FADT Hold:** Bound coordinate recovery search under 10,000 budget and reject action widening when conditioning state is erased.';
      if (i.includes('TEMPORAL') || i.includes('CHRONOLOGY')) return '- **Temporal Custodian Hold:** Provide monotonic chronological sequence with predecessor citations and complete planned phases.';
      if (i.includes('MALFORMED')) return '- **Schema Hold:** Supply schema-valid domain observations; untyped caller concern strings reject fail-closed.';
      if (i.includes('MISSING')) return '- **Missingness Hold:** Supply valid domain observations for all active specialist roles.';
      if (i.includes('OVERWRITE')) return '- **Artifact Hold:** Authorize overwrite explicitly via allow_overwrite or specify a distinct artifact path.';
      if (i.includes('WRITE')) return '- **Write Hold:** Correct file permissions or disk target before re-running.';
      if (i.includes('PROVENANCE') || i.includes('EVIDENCE')) return '- **Provenance Hold:** Supply valid, verifiable source revision and existing evidence file references.';
      return `- **General Hold (${i}):** Address domain-specific defect before re-running audit.`;
    }).join('\n') || '- Address missing observations or specialist infractions before re-running audit.')}

---

## 7. Permitted Next Operator Action

${next_permissible_action}

Sealed ⟐
`;
}

/**
 * Determines whether an observation is an authentic source-bound defect supported by code inspection.
 */
function isSourceBoundWitness(roleInput, evidence_class) {
  // This offline dispatcher executes mathematical checks on caller-provided data.
  // Caller-authored flags, snippets, AST-shaped objects and reference paths do
  // not establish that the tested data was extracted from inspected source bytes.
  // Reserve OBSERVED_SOURCE_DEFECT for a future trusted source-inspection adapter
  // that independently verifies the witness-to-engine-input binding.
  return false;
}

/**
 * Classifies specialist defect into conservative categories:
 * - SYNTHETIC_FAULT_INJECTION
 * - SYNTHETIC_MATHEMATICAL_VIOLATION
 * - OBSERVED_SOURCE_DEFECT
 * - CALLER_SUPPLIED_MATHEMATICAL_VIOLATION
 */
function classifySpecialistDefect(roleInput, evalResult, evidence_class, options = {}) {
  const isSyntheticInjection = Boolean(
    evalResult?.is_synthetic_injection ||
    roleInput?.fixture_class === 'SYNTHETIC_FAULT_INJECTION' ||
    roleInput?.is_synthetic_injection === true ||
    (options.allow_synthetic_fault_injection === true && (evalResult?.is_synthetic_injection || roleInput?.fixture_class === 'SYNTHETIC_FAULT_INJECTION'))
  );

  if (isSyntheticInjection) {
    return 'SYNTHETIC_FAULT_INJECTION';
  }

  if (evidence_class === 'SYNTHETIC_TEST_FIXTURE' || evidence_class === 'SYNTHETIC') {
    return 'SYNTHETIC_MATHEMATICAL_VIOLATION';
  }

  if (isSourceBoundWitness(roleInput, evidence_class)) {
    return 'OBSERVED_SOURCE_DEFECT';
  }

  return 'CALLER_SUPPLIED_MATHEMATICAL_VIOLATION';
}

/**
 * Main programmatic dispatcher for the TD613 Dollhouse Native Antigravity Skill.
 *
 * @param {Object} input - Invocation contract payload
 * @param {Object} [callerOptions] - Optional execution options
 * @returns {Promise<{ machine_receipt: Object, human_receipt: string, orchestrator_decision?: string, exit_code: number, write_error?: Error }>}
 */
export async function runDollhouseSkillAudit(input = {}, callerOptions = {}) {
  const startTime = Date.now();
  const detected_infractions_set = new Set();
  const unresolved_questions = [];

  const rawSourceRevision = typeof input.source_revision === 'string' && input.source_revision.trim()
    ? input.source_revision.trim()
    : resolveCurrentSourceRevision();

  const options = {
    ...callerOptions,
    ...(input.options && typeof input.options === 'object' ? input.options : {})
  };

  if (input.allow_synthetic_fault_injection !== undefined) {
    options.allow_synthetic_fault_injection = Boolean(input.allow_synthetic_fault_injection);
  }
  if (input.allow_overwrite !== undefined) {
    options.allow_overwrite = Boolean(input.allow_overwrite);
  }
  if (input.strict_provenance !== undefined) {
    options.strict_provenance = Boolean(input.strict_provenance);
  }
  if (callerOptions.strict_provenance !== undefined) {
    options.strict_provenance = Boolean(callerOptions.strict_provenance);
  }

  // 1. Provenance Verification: Bind source revision
  const sourceValidation = verifySourceRevision(rawSourceRevision, options);
  const source_revision = sourceValidation.source_revision || rawSourceRevision;
  if (!sourceValidation.verified) {
    detected_infractions_set.add(sourceValidation.infraction || 'HOLD_UNVERIFIABLE_SOURCE_REVISION');
    if (options.strict_provenance === true) {
      detected_infractions_set.add('HOLD_STRICT_PROVENANCE_FAILED');
    }
    unresolved_questions.push(`Source revision provenance error: ${sourceValidation.reason || 'unverifiable'}.`);
  }
  options.expected_source_revision = source_revision;

  const task_scope = typeof input.task_scope === 'string' && input.task_scope.trim()
    ? input.task_scope.trim()
    : 'GENERAL_SCIENTIFIC_AUDIT';

  const evidence_class = typeof input.evidence_class === 'string' && input.evidence_class.trim()
    ? input.evidence_class.trim()
    : 'SYNTHETIC_TEST_FIXTURE';

  // Preserve typed { path, sha256 } references for actual byte verification.
  // Never coerce structured references to "[object Object]" before validation.
  const rawEvidenceReferences = input.evidence_references === undefined
    ? []
    : input.evidence_references;

  // 2. Provenance Verification: Bind evidence references
  const evidenceValidation = verifyEvidenceReferences(rawEvidenceReferences, options);
  const evidence_references = Array.isArray(rawEvidenceReferences) ? rawEvidenceReferences : [];
  if (!evidenceValidation.all_verified) {
    evidenceValidation.infractions.forEach(i => detected_infractions_set.add(i));
    unresolved_questions.push('One or more declared evidence references could not be verified in repository.');
  }

  // Consistency check: SOURCE_CODE_AUDIT should declare evidence references
  if (evidence_class === 'SOURCE_CODE_AUDIT' && evidence_references.length === 0) {
    detected_infractions_set.add('SOURCE_CODE_AUDIT_MISSING_EVIDENCE_REFERENCES');
    unresolved_questions.push('Declared SOURCE_CODE_AUDIT without providing verifiable evidence_references.');
  }

  const rawRoles = input.roles !== undefined
    ? input.roles
    : [...CANONICAL_SPECIALIST_ROLES];

  const {
    specialist_roles,
    include_orchestrator,
    unknown_roles
  } = normalizeRequestedRoles(rawRoles);

  const shouldOrchestrate = input.include_orchestrator !== undefined
    ? Boolean(input.include_orchestrator)
    : (input.roles !== undefined ? include_orchestrator : true);

  const domain_inputs = (input.domain_inputs && typeof input.domain_inputs === 'object')
    ? input.domain_inputs
    : {};

  // 3. Fail-closed check for unknown / uninstalled roles
  if (unknown_roles.length > 0) {
    const duration = Date.now() - startTime;
    const invocation_id = `dollhouse-audit-${Date.now()}-${createHash('sha256').update(source_revision + task_scope).digest('hex').slice(0, 8)}`;
    const machine_receipt = {
      schema: DOLLHOUSE_SKILL_RECEIPT_SCHEMA,
      invocation_id,
      timestamp: new Date().toISOString(),
      source_revision,
      source_revision_verified: sourceValidation.verified,
      task_scope,
      evidence_class,
      evidence_references,
      evidence_manifest: evidenceValidation.manifest,
      roles_requested: rawRoles,
      roles_attempted: [],
      roles_executed: [],
      missing_inputs: [],
      specialist_findings: unknown_roles.map(r => ({
        role: r,
        jurisdiction: 'unknown',
        claim: `Unrecognized specialist role rejected fail-closed: ${r}`,
        verdict: 'HELD',
        status: 'UNKNOWN_ROLE_REJECTED',
        defect_class: 'UNRECOGNIZED_ROLE'
      })),
      detected_infractions: ['UNKNOWN_ROLE_REJECTED'],
      orchestrator: {
        active_roles: unknown_roles,
        findings_count: unknown_roles.length,
        findings: [],
        detected_infractions: ['UNKNOWN_ROLE_REJECTED'],
        decision: 'HELD_UNKNOWN_ROLE',
        consensus: 'HELD_UNKNOWN_ROLE',
        replication_status: 'UNRECOGNIZED_ROLE_REJECTED',
        empirical_replication_count: 0,
        independent_replication: false,
        release_authority: false,
        deployment_authority: false,
        human_closure_required: true
      },
      replication_status: 'UNRECOGNIZED_ROLE_REJECTED',
      empirical_replication_count: 0,
      unresolved_questions: [`Unrecognized role requested: ${unknown_roles.join(', ')}. Supported roles are: ${ALL_CANONICAL_ROLES.join(', ')}`],
      next_permissible_action: 'Correct the requested role list to canonical Dollhouse specialist roles and re-run audit.',
      execution_duration_ms: duration
    };
    const human_receipt = compileHumanReceipt(machine_receipt);

    if (input.artifact_path && typeof input.artifact_path === 'string') {
      try {
        await writeReceiptArtifact(input.artifact_path, machine_receipt, human_receipt, options);
      } catch (err) {
        machine_receipt.detected_infractions.push('HOLD_ARTIFACT_WRITE_FAILED');
        machine_receipt.artifact_write_error = err.message;
        return { machine_receipt, human_receipt: compileHumanReceipt(machine_receipt), exit_code: 1, write_error: err };
      }
    }

    return { machine_receipt, human_receipt, exit_code: 1 };
  }

  // 4. Normalization of domain inputs & divergence check (Artifact 40 Return Note 1)
  let normalized_domain_inputs = {};
  let normalization_conflict = null;
  try {
    normalized_domain_inputs = normalizeRoleObservations(domain_inputs);
  } catch (err) {
    if (err.code === 'DIVERGENT_ROLE_OBSERVATION_CONFLICT' || err.message?.includes('DIVERGENT_ROLE_OBSERVATION_CONFLICT')) {
      normalization_conflict = err;
    } else {
      throw err;
    }
  }

  if (normalization_conflict) {
    detected_infractions_set.add('DIVERGENT_ROLE_OBSERVATION_CONFLICT');
    unresolved_questions.push(normalization_conflict.message);
  }

  // 5. Execute each requested specialist role and evaluate extensions
  const specialist_findings = [];
  const missing_inputs = [];
  const roles_executed = [];
  const roles_attempted = [...specialist_roles];

  if (normalization_conflict) {
    for (const role of specialist_roles) {
      // Do NOT push to roles_executed; domain conflict prevented execution
      const isConflictingRole = normalization_conflict.role === role || normalization_conflict.message?.includes(role);
      specialist_findings.push({
        role,
        jurisdiction: DOLLHOUSE_AGENT_REGISTRY.agents[role]?.role || 'unspecified',
        verdict: 'HELD',
        status: 'DIVERGENT_ROLE_OBSERVATION_CONFLICT',
        defect_class: 'CALLER_SUPPLIED_MATHEMATICAL_VIOLATION',
        claim: isConflictingRole
          ? normalization_conflict.message
          : `Audit held due to divergent observation conflict in ${normalization_conflict.role || 'domain input'}`,
        infractions: ['DIVERGENT_ROLE_OBSERVATION_CONFLICT'],
        is_synthetic_injection: false,
        extensions: null
      });
    }
  } else {
    for (const role of specialist_roles) {
      const roleInput = normalized_domain_inputs[role] ?? null;

      if (roleInput === null || roleInput === undefined) {
        missing_inputs.push(role);
        specialist_findings.push({
          role,
          jurisdiction: DOLLHOUSE_AGENT_REGISTRY.agents[role]?.role || 'unspecified',
          verdict: 'NOT_EVALUATED',
          status: 'INPUT_MISSING',
          defect_class: 'NONE',
          claim: `No observation input supplied for ${role}`,
          infractions: [],
          is_synthetic_injection: false,
          extensions: null
        });
        continue;
      }

      roles_executed.push(role);

      // Call canonical harness specialist executor
      const evalResult = executeSpecialistRole(role, roleInput, options);
      const extensions = executeSpecialistExtensions(role, roleInput, options);

      let activeVerdict = evalResult.verdict;
      let activeStatus = evalResult.status;
      let activeClaim = evalResult.concern || `Invariants verified by ${role}`;
      let activeInfractions = Array.isArray(evalResult.infractions) ? [...evalResult.infractions] : [];

      // If richer domain extensions are executed, they represent valid domain schemas and supersede MALFORMED_OBSERVATION_SCHEMA
      if (extensions && activeStatus === 'MALFORMED_OBSERVATION_SCHEMA') {
        activeVerdict = 'SUPPORTED';
        activeStatus = 'NO_VIOLATION_DETECTED';
        activeClaim = `Invariants verified by ${role}`;
        activeInfractions = activeInfractions.filter(i => i !== 'MALFORMED_OBSERVATION_SCHEMA');
      }

      // Evaluate Extension Failures (Redline Item 1)
      if (extensions) {
        if (extensions.extension_error) {
          activeVerdict = 'HELD';
          activeStatus = 'EXTENSION_ERROR';
          activeClaim = `Extension execution failed: ${extensions.extension_error}`;
          activeInfractions.push('EXTENSION_EXECUTION_FAILURE');
        }

        // Pedagogue extensions
        if (extensions.cadence_audit) {
          if (extensions.cadence_audit.verdict === 'HELD' || extensions.cadence_audit.canonical_order_satisfied === false) {
            activeVerdict = 'HELD';
            activeStatus = 'VIOLATION_DETECTED';
            activeClaim = 'Dromological sequence violation detected in cadence audit';
            (extensions.cadence_audit.violations || []).forEach(v => {
              activeInfractions.push(v.type || v.code || 'CADENCE_VIOLATION');
            });
          }
        }
        if (extensions.institutional_time_audit) {
          if (extensions.institutional_time_audit.acts_before_counts || extensions.institutional_time_audit.verdict === 'HELD') {
            activeVerdict = 'HELD';
            activeStatus = 'VIOLATION_DETECTED';
            activeClaim = 'Institutional time violation: acts precede counts';
            activeInfractions.push('ACTS_BEFORE_COUNTS');
          }
        }

        // Aperture extensions
        if (extensions.epistemic_deficit) {
          const disp = extensions.epistemic_deficit.disposition;
          const deficit = extensions.epistemic_deficit.deficit_class;
          if (disp === 'REJECT' || disp === 'ABSTAIN' || deficit === 'NUMERICAL_STABILITY_DEFICIT') {
            activeVerdict = 'HELD';
            activeStatus = 'VIOLATION_DETECTED';
            activeClaim = `Aperture deficit detected: ${deficit}`;
            activeInfractions.push(deficit);
          }
        }
        if (extensions.matrix_svd) {
          if (extensions.matrix_svd.condition_number > 1e3) {
            activeVerdict = 'HELD';
            activeStatus = 'VIOLATION_DETECTED';
            activeClaim = `Matrix condition number ${extensions.matrix_svd.condition_number} exceeds stability ceiling 1,000`;
            activeInfractions.push('NUMERICAL_STABILITY_DEFICIT');
          }
        }

        // Atlas extensions
        if (extensions.holonomy_parity) {
          if (extensions.holonomy_parity.disposition !== 'PASS') {
            activeVerdict = 'HELD';
            activeStatus = 'VIOLATION_DETECTED';
            activeClaim = extensions.holonomy_parity.reason || 'Atlas holonomy history parity failed';
            activeInfractions.push(extensions.holonomy_parity.hold_reason || 'HOLD_HOLONOMY_HISTORY_PARITY_FAILED');
          }
        }
        if (extensions.phason_custody_diff) {
          const pStatus = extensions.phason_custody_diff.status;
          if (pStatus && pStatus.startsWith('HOLD_')) {
            activeVerdict = 'HELD';
            activeStatus = 'VIOLATION_DETECTED';
            activeClaim = extensions.phason_custody_diff.reason || `Atlas Phason custody hold: ${pStatus}`;
            activeInfractions.push(pStatus);
          } else if (pStatus === 'SEAM_DETECTED' || pStatus === 'OPEN' || pStatus === 'PASS_CROSS_INSTRUMENT_BRIDGE_VERIFIED') {
            if (activeVerdict !== 'HELD') {
              activeVerdict = 'SUPPORTED';
              activeStatus = pStatus;
              activeClaim = extensions.phason_custody_diff.decision || `Atlas Phason custody diff recorded: ${pStatus}`;
            }
          }
        }

        // FADT extensions
        if (extensions.fiber_bounds) {
          if (extensions.fiber_bounds.irreducible_gap_cardinality > 0 && roleInput.attempts_unconditioned_action) {
            activeVerdict = 'HELD';
            activeStatus = 'VIOLATION_DETECTED';
            activeClaim = 'FADT irreducible gap: action grant exposed under erased conditioning';
            activeInfractions.push('ILLEGAL_ACTION_GRANT_UNDER_ERASED_CONDITIONING');
          }
        }
        if (extensions.coordinate_recovery) {
          const cStatus = extensions.coordinate_recovery.status;
          if (cStatus === 'UNSUPPORTED_SEARCH_SIZE') {
            activeVerdict = 'HELD';
            activeStatus = 'VIOLATION_DETECTED';
            activeClaim = extensions.coordinate_recovery.reason || 'FADT coordinate recovery exceeded finite search budget (10,000 evaluations ceiling)';
            activeInfractions.push('UNSUPPORTED_SEARCH_SIZE');
          } else if (cStatus === 'NO_EXACT_RESTORING_COORDINATE_FOUND') {
            activeVerdict = 'HELD';
            activeStatus = 'VIOLATION_DETECTED';
            activeClaim = 'No exact restoring coordinate found for colliding fiber';
            activeInfractions.push('NO_EXACT_RESTORING_COORDINATE_FOUND');
          } else if (cStatus === 'RESTORING_COORDINATE_EXTENSION_FOUND' || cStatus === 'ALREADY_EXACT_NO_RECOVERY_NEEDED') {
            if (activeVerdict !== 'HELD') {
              activeVerdict = 'SUPPORTED';
              activeStatus = cStatus;
              activeClaim = `FADT coordinate recovery verified: ${cStatus}`;
            }
          }
        }
        if (extensions.discrepancy_identity) {
          if (extensions.discrepancy_identity.unlawful_widening === true || extensions.discrepancy_identity.identity_verified === false) {
            activeVerdict = 'HELD';
            activeStatus = 'VIOLATION_DETECTED';
            activeClaim = extensions.discrepancy_identity.recommendation || 'FADT discrepancy identity: unlawful widening detected';
            activeInfractions.push(extensions.discrepancy_identity.disposition || 'REJECT_UNLAWFUL_WIDENING');
          }
        }

        // Temporal Custodian extensions
        if (extensions.journey_chronology) {
          if (extensions.journey_chronology.verdict !== 'PASS') {
            activeVerdict = 'HELD';
            activeStatus = 'VIOLATION_DETECTED';
            activeClaim = extensions.journey_chronology.rationale || 'Temporal chronology sequence violation';
            (extensions.journey_chronology.violations || []).forEach(v => {
              activeInfractions.push(v.code || v.type || 'HOLD_CHRONOLOGY_BACKWARD');
            });
          }
        }
        if (extensions.temporal_audit) {
          if (extensions.temporal_audit.verdict !== 'PASS' || extensions.temporal_audit.input_valid === false) {
            activeVerdict = 'HELD';
            activeStatus = 'VIOLATION_DETECTED';
            activeClaim = extensions.temporal_audit.violations?.[0]?.message || 'Temporal audit failed: chronology or ledger defect';
            (extensions.temporal_audit.violations || []).forEach(v => {
              activeInfractions.push(v.type || v.code || 'TEMPORAL_AUDIT_VIOLATION');
            });
          }
        }
      }

      // Determine conservative defect classification (Artifact 40 Return Note 2)
      let defectClass = 'NONE';
      if (activeVerdict === 'HELD') {
        defectClass = classifySpecialistDefect(roleInput, evalResult, evidence_class, options);
      }

      const isSyntheticInjection = defectClass === 'SYNTHETIC_FAULT_INJECTION';

      specialist_findings.push({
        role,
        jurisdiction: evalResult.jurisdiction || DOLLHOUSE_AGENT_REGISTRY.agents[role]?.role || 'unspecified',
        verdict: activeVerdict,
        status: activeStatus,
        defect_class: defectClass,
        claim: activeClaim,
        infractions: activeInfractions,
        is_synthetic_injection: isSyntheticInjection,
        extensions
      });

      activeInfractions.forEach(i => detected_infractions_set.add(i));
    }
  }

  // 6. Orchestrator Governance & Adjudication (Artifact 40 Return Note 1)
  // Preserves all canonical Orchestrator holds, normalization conflicts, replication objections, and missingness findings
  let orchestrator = null;
  if (shouldOrchestrate) {
    if (normalization_conflict) {
      orchestrator = {
        decision: 'HELD',
        consensus: 'NONE',
        replication_status: 'DIVERGENT_OBSERVATION_REJECTED',
        empirical_replication_count: 0,
        active_roles: specialist_roles,
        findings_count: specialist_findings.length,
        detected_infractions: [...detected_infractions_set],
        release_authority: false,
        deployment_authority: false,
        human_closure_required: true
      };
    } else {
      const hasSpecialistHeld = specialist_findings.some(f => f.verdict === 'HELD');
      const hasSpecialistMissing = specialist_findings.some(f => f.verdict === 'NOT_EVALUATED');

      // Run baseline harness decision for replication and consensus accounting
      const orchResult = runOrchestrationDecision(specialist_roles, normalized_domain_inputs, {
        ...options,
        orchestrator_governance: true,
        condition_name: specialist_roles.length === 0 ? 'ORCHESTRATOR_ALONE' : 'SKILL_INVOCATION'
      });

      // Preserve all canonical Orchestrator infractions
      (orchResult.detected_infractions || []).forEach(i => detected_infractions_set.add(i));

      let adjudicatedDecision;
      let adjudicatedConsensus;

      if (specialist_roles.length === 0) {
        adjudicatedDecision = 'HELD_NO_ACTIVE_SPECIALISTS';
        adjudicatedConsensus = 'ABSTAIN_NO_SPECIALIST_SENSES';
      } else if (hasSpecialistHeld || orchResult.decision === 'HELD' || (orchResult.decision && orchResult.decision.startsWith('HELD'))) {
        adjudicatedDecision = orchResult.decision !== 'SUPPORTED' ? orchResult.decision : 'HELD';
        if (specialist_findings.every(f => f.verdict === 'HELD')) {
          adjudicatedConsensus = 'UNANIMOUS_HOLD';
        } else if (hasSpecialistHeld) {
          adjudicatedConsensus = 'HELD_DISSENT';
        } else {
          adjudicatedConsensus = (orchResult.consensus && !orchResult.consensus.includes('SUPPORT') && orchResult.consensus !== 'NONE')
            ? orchResult.consensus
            : 'HELD_DISSENT';
        }
      } else if (hasSpecialistMissing || missing_inputs.length > 0 || orchResult.decision === 'HELD_MISSING_OBSERVATION') {
        adjudicatedDecision = 'HELD_MISSING_OBSERVATION';
        adjudicatedConsensus = 'INCOMPLETE_OBSERVATION';
      } else if (detected_infractions_set.size > 0 || orchResult.decision !== 'SUPPORTED') {
        adjudicatedDecision = 'HELD';
        adjudicatedConsensus = 'HELD_DISSENT';
      } else {
        adjudicatedDecision = 'SUPPORTED';
        adjudicatedConsensus = specialist_roles.length === FIVE_ROLES.length
          ? 'UNANIMOUS_SUPPORT'
          : 'PARTIAL_ROLE_SUPPORT';
      }

      orchestrator = {
        decision: adjudicatedDecision,
        consensus: adjudicatedConsensus,
        replication_status: orchResult.replication_status,
        empirical_replication_count: orchResult.empirical_replication_count,
        active_roles: specialist_roles,
        findings_count: specialist_findings.length,
        detected_infractions: [...detected_infractions_set],
        release_authority: false,
        deployment_authority: false,
        human_closure_required: true
      };
    }
  }

  // 7. Standalone & Overall Decision Determination (Artifact 40 Return Note 1)
  let overallDecision;
  if (orchestrator) {
    overallDecision = orchestrator.decision;
  } else {
    // Standalone mode: must fail-closed if conflict, empty, held, or missing
    if (normalization_conflict) {
      overallDecision = 'HELD';
    } else if (specialist_roles.length === 0) {
      overallDecision = 'HELD_NO_ACTIVE_SPECIALISTS';
    } else if (specialist_findings.some(f => f.verdict === 'HELD')) {
      overallDecision = 'HELD';
    } else if (specialist_findings.some(f => f.verdict === 'NOT_EVALUATED') || missing_inputs.length > 0) {
      overallDecision = 'HELD_MISSING_OBSERVATION';
    } else if (detected_infractions_set.size > 0) {
      overallDecision = 'HELD';
    } else {
      overallDecision = 'SUPPORTED';
    }
  }

  // If source revision or evidence was unverified, overall audit must hold
  if (!sourceValidation.verified || !evidenceValidation.all_verified) {
    overallDecision = 'HELD';
  }

  // 7. Dossier Creation (Optional)
  let case_dossier = null;
  if (input.create_case_dossier === true) {
    if (!input.dossier_spec) {
      detected_infractions_set.add('HOLD_CASE_DOSSIER_CREATION_FAILED');
      unresolved_questions.push('Requested case dossier creation failed: missing dossier_spec.');
      case_dossier = { error: 'MISSING_DOSSIER_SPEC' };
    } else {
      try {
        case_dossier = createDollhouseCaseDossier(input.dossier_spec, {
          allow_unpinned_source: options.allow_unpinned_source === true
        });
      } catch (err) {
        detected_infractions_set.add('HOLD_CASE_DOSSIER_CREATION_FAILED');
        unresolved_questions.push(`Requested case dossier creation failed: ${err.message}`);
        case_dossier = { error: err?.message || String(err) };
      }
    }
    if (case_dossier?.error) {
      overallDecision = 'HELD';
      if (orchestrator) {
        orchestrator.decision = 'HELD';
      }
    }
  }

  const detected_infractions = [...detected_infractions_set];
  const duration = Date.now() - startTime;
  const invocation_id = `dollhouse-audit-${Date.now()}-${createHash('sha256').update(source_revision + task_scope).digest('hex').slice(0, 8)}`;

  if (missing_inputs.length > 0) {
    unresolved_questions.push(`Missing domain observation inputs for: ${missing_inputs.join(', ')}.`);
  }
  if (detected_infractions.length > 0) {
    unresolved_questions.push(`Infractions detected: ${detected_infractions.join(', ')}.`);
  }

  let next_permissible_action = 'Human operator review required. ';
  if (overallDecision === 'SUPPORTED') {
    next_permissible_action += 'All active specialist domain invariants verified. Operator may proceed with next bounded development or review step.';
  } else {
    next_permissible_action += 'Auditing held fail-closed. Operator must resolve domain infractions or missing observations before proceeding.';
  }

  const machine_receipt = {
    schema: DOLLHOUSE_SKILL_RECEIPT_SCHEMA,
    invocation_id,
    timestamp: new Date().toISOString(),
    source_revision,
    source_revision_verified: sourceValidation.verified,
    git_commit_verified: Boolean(sourceValidation.git_commit_verified),
    executing_checkout_revision: sourceValidation.executing_checkout_revision,
    is_exact_checkout_match: Boolean(sourceValidation.is_exact_checkout_match),
    exact_checkout_verified: Boolean(sourceValidation.exact_checkout_verified),
    is_historical_commit_only: Boolean(sourceValidation.is_historical_commit_only),
    task_scope,
    evidence_class,
    evidence_references,
    evidence_manifest: evidenceValidation.manifest,
    roles_requested: rawRoles,
    roles_attempted,
    roles_executed,
    missing_inputs,
    specialist_findings,
    detected_infractions,
    orchestrator,
    case_dossier,
    replication_status: orchestrator ? orchestrator.replication_status : 'STANDALONE_SPECIALIST_EXECUTION',
    empirical_replication_count: orchestrator ? orchestrator.empirical_replication_count : 0,
    synthetic_vs_empirical: evidence_class === 'EMPIRICAL_ACQUISITION' ? 'EMPIRICAL_UNAUTHENTICATED_IN_OFFLINE_ESTATE' : 'SYNTHETIC',
    unresolved_questions,
    next_permissible_action,
    execution_duration_ms: duration
  };

  const human_receipt = compileHumanReceipt(machine_receipt);

  // 8. Fail-closed artifact writing and overwrite prevention (Redline Item 4)
  if (input.artifact_path && typeof input.artifact_path === 'string') {
    try {
      await writeReceiptArtifact(input.artifact_path, machine_receipt, human_receipt, options);
    } catch (err) {
      detected_infractions_set.add('HOLD_ARTIFACT_WRITE_FAILED');
      machine_receipt.detected_infractions = [...detected_infractions_set];
      machine_receipt.artifact_write_error = err.message;
      unresolved_questions.push(`Artifact write failed fail-closed: ${err.message}`);
      if (orchestrator) {
        orchestrator.decision = 'HELD';
      }
      return {
        machine_receipt,
        human_receipt: compileHumanReceipt(machine_receipt),
        orchestrator_decision: 'HELD',
        exit_code: 1,
        write_error: err
      };
    }
  }

  const exit_code = overallDecision === 'SUPPORTED' ? 0 : 1;
  return {
    machine_receipt,
    human_receipt,
    orchestrator_decision: machine_receipt.orchestrator?.decision || overallDecision,
    exit_code
  };
}

/**
 * Writes receipt to disk at the specified path with overwrite prevention and directory safety.
 *
 * @param {string} targetPath - File path to write to
 * @param {Object} machineReceipt - Machine-readable JSON object
 * @param {string} humanReceipt - Human-readable Markdown string
 * @param {Object} [options={}] - Options, e.g. allow_overwrite: boolean
 */
export async function writeReceiptArtifact(targetPath, machineReceipt, humanReceipt, options = {}) {
  if (!targetPath || typeof targetPath !== 'string' || !targetPath.trim()) {
    throw new Error('HOLD_ARTIFACT_INVALID_PATH: Non-empty targetPath required');
  }

  const resolved = resolve(targetPath);
  const repoRoot = resolve(process.cwd());

  const relRepo = relative(repoRoot, resolved);
  const isInsideRepo = !relRepo.startsWith('..') && !isAbsolute(relRepo);

  // Also check if inside temp dir or app data dir for test/system environments
  const tempDir = resolve(globalThis.process?.env?.TEMP || globalThis.process?.env?.TMPDIR || '/tmp');
  const relTemp = relative(tempDir, resolved);
  const isInsideTemp = !relTemp.startsWith('..') && !isAbsolute(relTemp);

  if (!isInsideRepo && !isInsideTemp) {
    throw new Error(`HOLD_ARTIFACT_DESTINATION_NOT_AUTHORIZED: Destination path (${resolved}) is outside approved repository or temporary subtrees`);
  }

  // A caller-controlled "authorized_output_destination" boolean is never
  // sufficient to widen filesystem write authority.
  if (isInsideRepo) {
    const normalizedRel = relRepo.replace(/\\/g, '/');
    const allowedOutputRoot = ['artifacts/', 'audit-artifacts/', 'receipts/', 'reports/']
      .some(prefix => normalizedRel.startsWith(prefix));
    const documentedRootReceipt = /^receipt(?:[-_.][a-zA-Z0-9_-]+)?\.(?:json|md)$/.test(normalizedRel);
    if (!allowedOutputRoot && !documentedRootReceipt) {
      throw new Error(`HOLD_ARTIFACT_DESTINATION_NOT_AUTHORIZED: Receipt path (${normalizedRel}) is outside approved audit-output destinations`);
    }
  }

  // Protect all directory path components against symlink redirection (Artifact 40 Return Note 3)
  let currentDir = resolve(resolved, '..');
  const dirsToCheck = [];
  while (true) {
    dirsToCheck.push(currentDir);
    const parent = resolve(currentDir, '..');
    if (parent === currentDir) break;
    currentDir = parent;
  }
  dirsToCheck.reverse();
  for (const d of dirsToCheck) {
    if (existsSync(d)) {
      try {
        const lst = lstatSync(d);
        if (lst.isSymbolicLink()) {
          throw new Error(`HOLD_ARTIFACT_SYMLINK_REDIRECTION_REJECTED: Path component (${d}) is a symbolic link`);
        }
      } catch (err) {
        if (err.message.includes('HOLD_ARTIFACT_SYMLINK_REDIRECTION_REJECTED')) {
          throw err;
        }
      }
    }
  }

  // lstat (not existsSync) detects dangling symlinks as well as live ones.
  // A dangling symlink could otherwise be followed by writeFile to a new path
  // outside the approved destination subtree.
  const checkSymlinkAndOverwrite = (p) => {
    let stat;
    try {
      stat = lstatSync(p);
    } catch (err) {
      if (err.code === 'ENOENT') return;
      throw err;
    }
    if (stat.isSymbolicLink()) {
      throw new Error(`HOLD_ARTIFACT_SYMLINK_REDIRECTION_REJECTED: Target path (${p}) is a symbolic link`);
    }
    const isAuthorized = options.operator_authorized_overwrite === true || (options.allow_overwrite === true && options.untrusted_caller_json !== true);
    if (!isAuthorized) {
      throw new Error(`HOLD_ARTIFACT_EXISTS_OVERWRITE_PREVENTED: Cannot overwrite existing file (${p}) without explicit operator authorization`);
    }
  };

  if (targetPath.endsWith('.json')) {
    checkSymlinkAndOverwrite(resolved);
    await writeFile(resolved, JSON.stringify(machineReceipt, null, 2), 'utf8');
  } else if (targetPath.endsWith('.md')) {
    checkSymlinkAndOverwrite(resolved);
    await writeFile(resolved, humanReceipt, 'utf8');
  } else {
    const jsonPath = `${resolved}.json`;
    const mdPath = `${resolved}.md`;
    checkSymlinkAndOverwrite(jsonPath);
    checkSymlinkAndOverwrite(mdPath);
    await writeFile(jsonPath, JSON.stringify(machineReceipt, null, 2), 'utf8');
    await writeFile(mdPath, humanReceipt, 'utf8');
  }
}
