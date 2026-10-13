export const FLOWCORE_PROMOTION_CONFIG_SCHEMA = 'td613.flowcore.promotion-config/v0.1';

export const FLOWCORE_PROMOTION_CONFIG = Object.freeze({
  schema: FLOWCORE_PROMOTION_CONFIG_SCHEMA,
  namespace: 'U+10D613',
  feature_gate: Object.freeze({
    id: 'flowcore-pedagogue-presentation-v01',
    default_enabled: false,
    presentation_layer_only: true,
    governed_state_mutation_allowed: false,
    route_promotion_authorized: false,
    server_state_required: false,
    local_learner_state_required: false
  }),
  guarded_surfaces: Object.freeze([
    'information-dome-pedagogue.html',
    'route-burden-observatory.html',
    'ash-custody-pedagogue.html',
    'station-propagation-observatory.html',
    'physical-flowcore.html',
    'flowcore-validation-lab.html',
    'flowcore-promotion-dashboard.html'
  ]),
  fallback: Object.freeze({
    prior_ui_reference: 'Dome-World navigation before Flow-Core promotion',
    disable_action: 'omit guarded presentation routes from promoted navigation',
    data_migration_required: false,
    governed_state_mutation_allowed: false
  }),
  authority: Object.freeze({
    config_can_enable_itself: false,
    config_can_authorize_release: false,
    config_can_mutate_ash: false,
    config_can_close_program: false,
    human_promotion_required: true,
    human_closure_required: true
  }),
  closure: Object.freeze({ status: 'OPEN', closed_by: null })
});
