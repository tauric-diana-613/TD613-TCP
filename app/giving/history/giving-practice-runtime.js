// One versioned browser entry owns the entire fictional-search wrapper stack.
// Its relative imports resolve to one unversioned module identity each, so
// dependency imports from the practice directory/committee graph hit the same
// ESM cache entries instead of re-running global fetch wrappers or listeners.
import './giving-practice-hydration.js';
import './giving-practice-dialog-portal.js';
import './giving-practice-search-noise.js';
import './giving-practice-discovery-graph.js';
import './giving-practice-referendum-cluster.js';
import './giving-practice-temporal-cluster-extension.js';
import './giving-practice-in-kind.js';
import './giving-practice-local-campaign-rules.js';
import './giving-practice-data-reconciliation.js';
import './giving-practice-krabs-cheapskate.js';
import './giving-practice-local-alignment.js';
import './giving-practice-campaign-history.js';
// Postal normalization is deliberately outermost. Every fictional extension
// resolves first; only then do contribution rows receive one canonical street /
// city-state-ZIP grammar before the UI, dossier, or export layer can observe them.
import './giving-practice-postal-normalization.js';

export const GIVING_PRACTICE_RUNTIME_SCHEMA = 'td613.giving.practice-runtime/v0.1';

export const _givingPracticeRuntime = Object.freeze({
  schema: GIVING_PRACTICE_RUNTIME_SCHEMA,
  module_identity_policy: 'ONE_VERSIONED_ROOT_RELATIVE_DEPENDENCIES',
  fetch_wrapper_reinstallation_forbidden: true,
  duplicate_listener_reinstallation_forbidden: true,
  postal_normalizer_outermost: true
});
