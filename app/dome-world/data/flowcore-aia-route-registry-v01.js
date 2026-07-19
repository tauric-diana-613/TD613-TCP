export const FLOWCORE_AIA_ROUTE_REGISTRY_SCHEMA = 'td613.flowcore.aia-route-registry/v0.1';

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freeze(child);
  return Object.freeze(value);
}

export const FLOWCORE_AIA_ROUTES = freeze({
  schema: FLOWCORE_AIA_ROUTE_REGISTRY_SCHEMA,
  selection: 'EXPLICIT_OPERATOR_SELECTION_ONLY',
  inference_forbidden: true,
  routes: {
    EXPERIENTIAL: {
      provenance_aliases: ['child'],
      purpose: 'Encounter condition, action, consequence, relation, rest, and transfer through direct participation.',
      priorities: ['visible condition', 'meaningful action', 'causal trace', 'plain consequence', 'rest', 'exit'],
      required_preservations: ['provenance', 'missingness', 'contradiction', 'claim ceiling', 'station ownership', 'authorized actions', 'causal structure']
    },
    CUSTODIAL: {
      provenance_aliases: ['custodian'],
      purpose: 'Inspect source relationship, custody posture, continuity, lawful next action, and downstream consequence.',
      priorities: ['source relationship', 'sensitivity', 'custody posture', 'authorized action', 'continuity', 'rest', 'exit'],
      required_preservations: ['provenance', 'missingness', 'contradiction', 'claim ceiling', 'station ownership', 'authorized actions', 'causal structure']
    },
    AUDIT: {
      provenance_aliases: ['auditor'],
      purpose: 'Inspect evidence basis, transformations, alternatives, residuals, abstention, and replay without custody authority.',
      priorities: ['source status', 'evidence basis', 'transformations', 'alternatives', 'residuals', 'abstention', 'receipt replay'],
      required_preservations: ['provenance', 'missingness', 'contradiction', 'claim ceiling', 'station ownership', 'authorized actions', 'causal structure']
    },
    IMPLEMENTATION: {
      provenance_aliases: ['technical'],
      purpose: 'Inspect schema state, deterministic receipts, calibration, equations, implementation references, and bounded JSON.',
      priorities: ['schemas', 'digests', 'calibration', 'equations', 'implementation references', 'bounded receipt JSON'],
      required_preservations: ['provenance', 'missingness', 'contradiction', 'claim ceiling', 'station ownership', 'authorized actions', 'causal structure']
    }
  },
  non_equivalence_law: 'Routes share governed invariants but remain distinct in purpose, ordering, emphasis, and authorized interpretation.',
  authority_law: 'No AIA route gains station authority. Only the human closes.'
});

export const FLOWCORE_AIA_ROUTE_IDS = Object.freeze(Object.keys(FLOWCORE_AIA_ROUTES.routes));
