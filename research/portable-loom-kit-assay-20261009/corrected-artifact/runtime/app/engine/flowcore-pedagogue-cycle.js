import { canonicalJson } from '../dome-world/ash/canonical-json.js';
import { FLOWCORE_AIA_ROUTE_IDS, FLOWCORE_AIA_ROUTES, FLOWCORE_GLYPH_REGISTRY, EVIDENCE_LEVELS, OBSERVATION_STATUSES, PEDAGOGICAL_SCENE_SCHEMA, PEDAGOGICAL_TRANSITION_SCHEMA, PEDAGOGUE_PHASES, SCENE_KINDS, TERMINAL_PHASES, TRANSFER_ENCOUNTER_SCHEMA } from './flowcore-pedagogue-law.js';
import { affordances, ceiling, clone, deterministic, deterministicId, freeze, noForbidden, object, provenance, research, staticEquivalent, strings, text } from './flowcore-pedagogue-utils.js';
import { phaseOrder, validateScene, validateTransition } from './flowcore-pedagogue-validators.js';

export async function compilePedagogicalScene(input = {}, options = {}) {
  noForbidden(input); deterministic(options);
  const source_status = String(input.source_status || '').toUpperCase();
  const observation_status = String(input.observation_status || '').toUpperCase();
  const scene_kind = String(input.scene_kind || 'GENERIC').toUpperCase();
  if (!EVIDENCE_LEVELS.includes(source_status) || !OBSERVATION_STATUSES.includes(observation_status) || !SCENE_KINDS.includes(scene_kind)) throw new Error('Scene kind or status is unsupported.');
  if (input.station_owner && input.station_owner !== 'Dome-World') throw new Error('Dome-World is the scene host.');
  if (input.rest?.available === false || input.rest?.penalty === true || input.exit?.available === false || (input.closure?.status && input.closure.status !== 'OPEN')) throw new Error('Input removes rest, exit, or human closure.');
  if (input.authority && Object.entries(input.authority).some(([key, value]) => key !== 'human_closure_required' && value === true)) throw new Error('Input widens Flow-Core authority.');
  const subject = { scene_kind, source_status, observation_status, world_state_reference: input.world_state_reference ?? null, provenance: provenance(input.provenance), visible_condition: clone(object(input.visible_condition, 'visible_condition')), available_affordances: affordances(input.available_affordances), route_topology: clone(object(input.route_topology, 'route_topology')), causal_structure: clone(object(input.causal_structure, 'causal_structure')), research_frame: research(input.research_frame), missingness: strings(input.missingness || [], 'missingness'), contradictions: strings(input.contradictions || [], 'contradictions'), claim_ceiling: ceiling(input.claim_ceiling), technical_terms_withheld: strings(input.technical_terms_withheld || [], 'technical_terms_withheld') };
  const scene = { schema: PEDAGOGICAL_SCENE_SCHEMA, scene_id: await deterministicId('flowped_scene_', 'TD613:FLOWCORE:PEDAGOGUE-SCENE-ID:v1', subject, options), ...subject, station_owner: 'Dome-World', anisotropic_legibility: { available_routes: [...FLOWCORE_AIA_ROUTE_IDS], route_selection: 'EXPLICIT_OPERATOR_SELECTION_ONLY', route_registry_schema: FLOWCORE_AIA_ROUTES.schema, route_inference_forbidden: true }, authority: { flowcore_commands_station: false, automatic_ash_action: false, release_authorized: false, station_mutation_authorized: false, human_closure_required: true }, rest: { available: true, penalty: false, continuity_preserved: true, new_demands_withheld: true }, exit: { available: true, penalty: false }, closure: { required: true, status: 'OPEN', closed_by: null } };
  validateScene(scene); canonicalJson(scene); return freeze(scene);
}

function sceneAction(scene, action) {
  if (!action) return null;
  const declared = scene.available_affordances.find(item => item.action_id === text(action.action_id, 'action.action_id'));
  if (!declared) throw new Error('Action is not declared by the scene.');
  if (action.authorized_by_station && action.authorized_by_station !== declared.authorized_by_station) throw new Error('Action authority cannot be widened.');
  return { ...declared, operator_selected: true };
}

export async function compilePedagogicalTransition(scene, action = null, worldDelta = null, options = {}) {
  validateScene(scene); deterministic(options);
  const phase = String(options.phase || 'WORLD_ANSWERS').toUpperCase();
  if (![...PEDAGOGUE_PHASES, ...TERMINAL_PHASES].includes(phase)) throw new Error('Unsupported phase.');
  const prior = Array.isArray(options.priorTransitions) ? options.priorTransitions : [];
  prior.forEach(validateTransition); phaseOrder(phase, prior);
  const selected_action = sceneAction(scene, action);
  if (['ACT', 'WORLD_ANSWERS'].includes(phase) && !selected_action) throw new Error(`${phase} requires a declared action.`);
  if (phase === 'NOTICE' && selected_action) throw new Error('NOTICE cannot commit an action.');
  if (phase === 'NAME' && !options.name) throw new Error('NAME requires explicit naming content.');
  const delta = worldDelta == null ? null : clone(object(worldDelta, 'worldDelta'));
  const causal_trace = (delta?.causal_trace || []).map(item => typeof item === 'string' ? { step: item } : clone(item));
  const unresolved_relations = strings(delta?.unresolved_relations || [], 'worldDelta.unresolved_relations');
  if (phase === 'WORLD_ANSWERS' && !causal_trace.length && !unresolved_relations.length) throw new Error('WORLD_ANSWERS requires a causal trace or explicit unresolved relation.');
  if (TERMINAL_PHASES.includes(phase) && !unresolved_relations.length && !(delta?.missingness || []).length) throw new Error(`${phase} requires missingness or an unresolved relation.`);
  const name = options.name ? { plain_language: text(options.name.plain_language, 'name.plain_language'), glyph_relation: options.name.glyph_relation ? String(options.name.glyph_relation) : null, technical_term: options.name.technical_term ? String(options.name.technical_term) : null, non_equivalence: strings(options.name.non_equivalence || [], 'name.non_equivalence') } : null;
  if (name?.glyph_relation && !Object.values(FLOWCORE_GLYPH_REGISTRY.entries).some(item => item.semantic_relation === name.glyph_relation)) throw new Error('NAME references an unregistered glyph relation.');
  const stat = staticEquivalent(options.staticEquivalent || delta?.static_equivalent, `${phase} remains statically inspectable.`);
  const subject = { scene_reference: scene.scene_id, phase, selected_action, world_delta: delta, name, prior_transition_references: prior.map(item => item.transition_id), static_equivalent: stat };
  const tx = { schema: PEDAGOGICAL_TRANSITION_SCHEMA, transition_id: await deterministicId('flowped_tx_', 'TD613:FLOWCORE:PEDAGOGUE-TRANSITION-ID:v1', subject, options), scene_reference: scene.scene_id, phase, selected_action, world_delta: delta, causal_trace, name, static_equivalent: stat, losses: strings(delta?.losses || [], 'worldDelta.losses'), missingness: strings(delta?.missingness || [], 'worldDelta.missingness'), contradictions: strings(delta?.contradictions || [], 'worldDelta.contradictions'), unresolved_relations, glyph_candidates: strings(delta?.glyph_candidates || [], 'worldDelta.glyph_candidates'), station_owner: 'Dome-World', authorized_actions: selected_action ? [`${selected_action.authorized_by_station}:${selected_action.action_id}`] : [], rest_available: true, exit_available: true, authority: { automatic_ash_action: false, station_mutation_authorized: false, human_closure_required: true }, closure: { status: 'OPEN', closed_by: null } };
  validateTransition(tx); canonicalJson(tx); return freeze(tx);
}

export function advancePedagoguePhase(scene, transitions, requestedPhase) {
  validateScene(scene); if (!Array.isArray(transitions)) throw new TypeError('transitions must be an array.'); transitions.forEach(validateTransition);
  const requested_phase = String(requestedPhase || '').toUpperCase(); phaseOrder(requested_phase, transitions);
  return freeze({ scene_reference: scene.scene_id, requested_phase, allowed: true, automatic_advance: false, operator_action_required: true, closure: { required: true, status: 'OPEN' } });
}

export async function compileRestState(scene, transition, options = {}) {
  validateScene(scene); validateTransition(transition);
  if (!['WORLD_ANSWERS', 'NAME', ...TERMINAL_PHASES, 'REST'].includes(transition.phase)) throw new Error('Rest requires a completed answer, name, hold, or abstention.');
  return freeze({ schema: 'td613.flowcore.rest-state/v0.1', rest_id: await deterministicId('flowped_rest_', 'TD613:FLOWCORE:PEDAGOGUE-REST-ID:v1', { scene_reference: scene.scene_id, transition_reference: transition.transition_id }, options), scene_reference: scene.scene_id, transition_reference: transition.transition_id, new_prompts_withheld: true, recent_consequence_visible: true, content_erased: false, continuity_preserved: true, penalty: false, return_available: true, exit_available: true, automatic_next_phase: false, closure: { required: true, status: 'OPEN', closed_by: null } });
}

export async function compileTransferEncounter(originTransition, newContext = {}, options = {}) {
  validateTransition(originTransition);
  if (!['WORLD_ANSWERS', 'NAME', 'REST'].includes(originTransition.phase)) throw new Error('Transfer requires a described relation.');
  const v = object(newContext, 'newContext');
  const subject = { origin_transition_reference: originTransition.transition_id, new_context: clone(object(v.context, 'newContext.context')), shared_relation_candidate: text(v.shared_relation_candidate, 'shared_relation_candidate'), observable_correspondence: strings(v.observable_correspondence, 'observable_correspondence', 1), alternative_explanations: strings(v.alternative_explanations, 'alternative_explanations', 1), abstention_conditions: strings(v.abstention_conditions, 'abstention_conditions', 1) };
  const transfer = { schema: TRANSFER_ENCOUNTER_SCHEMA, transfer_id: await deterministicId('flowped_transfer_', 'TD613:FLOWCORE:PEDAGOGUE-TRANSFER-ID:v1', subject, options), ...subject, system_claim: 'pattern-relation-observed-across-contexts', forbidden_claims: strings(['authorship', 'automatic Ash action', 'cognition', 'identity', 'mastery', 'transfer proves learning', 'transfer proves universal equivalence'], 'forbidden_claims', 1), station_owner: 'Dome-World', authority: { automatic_station_advance: false, automatic_ash_action: false, human_closure_required: true }, closure: { status: 'OPEN', closed_by: null } };
  noForbidden(transfer); canonicalJson(transfer); return freeze(transfer);
}
