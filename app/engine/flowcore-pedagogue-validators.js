import { canonicalJson } from '../dome-world/ash/canonical-json.js';
import { EVIDENCE_LEVELS, FLOWCORE_AIA_ROUTE_IDS, OBSERVATION_STATUSES, PEDAGOGICAL_SCENE_SCHEMA, PEDAGOGICAL_TRANSITION_SCHEMA, PEDAGOGUE_PHASES, SCENE_KINDS, TERMINAL_PHASES } from './flowcore-pedagogue-law.js';
import { ceiling, noForbidden, object, research } from './flowcore-pedagogue-utils.js';

export function validateScene(scene) {
  object(scene, 'scene');
  if (scene.schema !== PEDAGOGICAL_SCENE_SCHEMA || !/^flowped_scene_[a-f0-9]{24}$/.test(scene.scene_id || '')) throw new Error('Malformed scene.');
  if (!SCENE_KINDS.includes(scene.scene_kind) || scene.station_owner !== 'Dome-World' || !EVIDENCE_LEVELS.includes(scene.source_status) || !OBSERVATION_STATUSES.includes(scene.observation_status)) throw new Error('Scene jurisdiction or status is invalid.');
  if (canonicalJson(scene.anisotropic_legibility?.available_routes) !== canonicalJson(FLOWCORE_AIA_ROUTE_IDS) || scene.anisotropic_legibility?.route_selection !== 'EXPLICIT_OPERATOR_SELECTION_ONLY') throw new Error('Canonical AIA routes are incomplete.');
  if (scene.rest?.available !== true || scene.rest?.penalty !== false || scene.rest?.continuity_preserved !== true || scene.exit?.available !== true) throw new Error('Rest and exit must remain available.');
  if (scene.closure?.status !== 'OPEN' || scene.closure?.closed_by !== null || scene.authority?.flowcore_commands_station !== false || scene.authority?.automatic_ash_action !== false || scene.authority?.release_authorized !== false || scene.authority?.station_mutation_authorized !== false || scene.authority?.human_closure_required !== true) throw new Error('Scene authority or closure is invalid.');
  research(scene.research_frame); ceiling(scene.claim_ceiling); noForbidden(scene); return true;
}

export function validateTransition(tx) {
  object(tx, 'transition');
  if (tx.schema !== PEDAGOGICAL_TRANSITION_SCHEMA || !/^flowped_tx_[a-f0-9]{24}$/.test(tx.transition_id || '') || ![...PEDAGOGUE_PHASES, ...TERMINAL_PHASES].includes(tx.phase)) throw new Error('Malformed transition.');
  if (tx.station_owner !== 'Dome-World' || tx.rest_available !== true || tx.exit_available !== true || tx.static_equivalent?.claim_ceiling_visible !== true || tx.authority?.automatic_ash_action !== false || tx.authority?.station_mutation_authorized !== false || tx.authority?.human_closure_required !== true || tx.closure?.status !== 'OPEN') throw new Error('Transition authority, static parity, rest, exit, or closure is invalid.');
  noForbidden(tx); return true;
}

export const phases = items => items.map(item => item.phase);
export function phaseOrder(phase, prior = []) {
  const p = phases(prior);
  if (phase === 'NOTICE') return;
  if (!p.includes('NOTICE')) throw new Error(`${phase} requires a prior NOTICE.`);
  if (phase === 'ACT') return;
  if (!p.includes('ACT')) throw new Error(`${phase} requires a prior ACT.`);
  if (['WORLD_ANSWERS', ...TERMINAL_PHASES].includes(phase)) return;
  if (!p.some(item => ['WORLD_ANSWERS', ...TERMINAL_PHASES].includes(item))) throw new Error(`${phase} requires a prior visible world answer, hold, or abstention.`);
  if (phase === 'TRANSFER' && !p.some(item => ['NAME', 'WORLD_ANSWERS'].includes(item))) throw new Error('TRANSFER requires a described relation.');
}

export function validateSequence(transitions) {
  const p = phases(transitions);
  const notice = p.indexOf('NOTICE');
  const act = p.indexOf('ACT');
  const answer = p.findIndex(item => ['WORLD_ANSWERS', ...TERMINAL_PHASES].includes(item));
  const name = p.indexOf('NAME');
  const transfer = p.indexOf('TRANSFER');
  if (notice < 0 || act < notice || answer < act || (name >= 0 && name < answer) || (transfer >= 0 && transfer < answer)) throw new Error('Transition sequence violates consequence-before-ontology.');
}
