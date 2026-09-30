import { FLOWCORE_AIA_ROUTE_IDS, FLOWCORE_AIA_ROUTES } from '../dome-world/data/flowcore-aia-route-registry-v01.js';
import { FLOWCORE_GLYPH_REGISTRY } from '../dome-world/data/flowcore-glyph-semantics-v01.js';

export const PEDAGOGICAL_SCENE_SCHEMA = 'td613.flowcore.pedagogical-scene/v0.1';
export const PEDAGOGICAL_TRANSITION_SCHEMA = 'td613.flowcore.pedagogical-transition/v0.1';
export const TRANSFER_ENCOUNTER_SCHEMA = 'td613.flowcore.transfer-encounter/v0.1';
export const PEDAGOGUE_RECEIPT_SCHEMA = 'td613.flowcore.pedagogue-receipt/v0.1';
export const PEDAGOGUE_PHASES = Object.freeze(['NOTICE', 'ACT', 'WORLD_ANSWERS', 'NAME', 'REST', 'TRANSFER']);
export const EVIDENCE_LEVELS = Object.freeze(['E0', 'E1', 'E2', 'E3', 'E4']);
export const OBSERVATION_STATUSES = Object.freeze(['OBSERVED', 'NULL', 'REJECTED', 'MISSING', 'CONTRADICTORY', 'UNCAPTURED', 'ENCODER_REQUIRED', 'UNRESOLVED', 'ABSTAIN']);
export const TERMINAL_PHASES = Object.freeze(['HELD', 'ABSTAIN']);
export const SCENE_KINDS = Object.freeze(['GLUING_OBSTRUCTION', 'CONTENT_INVARIANT_PHASON', 'PAIR_EMERGENT_MOIRE', 'GENERIC']);
export const STATIONS = new Set(['Dome-World', 'Flow-Core', 'Ash', 'Aperture', 'Phason', 'Hush', 'Safe Harbor', 'EO-RFD', 'ACEDIT', 'KIRA', 'Human']);
export const BASE_NONCLAIMS = Object.freeze(['authorship', 'automatic Ash action', 'automatic release', 'cognition', 'consent inferred from engagement', 'developmental rank', 'identity', 'legal authority', 'mastery', 'psychological interior state', 'truth outside a formally closed proposition']);
export const FORBIDDEN_KEYS = new Set(['age', 'birthdate', 'biometric', 'cognition', 'developmental_rank', 'email', 'emotional_state', 'learner_id', 'mastery', 'psychological_state', 'raw_artifact_content', 'raw_bytes', 'raw_content', 'source_bytes', 'stable_learner_identity', 'user_id']);
export const RECEIPT_DOMAIN = 'TD613:FLOWCORE:PEDAGOGUE-RECEIPT:v1';
export const SEED_DOMAIN = 'TD613:FLOWCORE:PEDAGOGUE-ID-SEED:v1';
export const RFC3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
export { FLOWCORE_AIA_ROUTE_IDS, FLOWCORE_AIA_ROUTES, FLOWCORE_GLYPH_REGISTRY };
