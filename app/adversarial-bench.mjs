import basePersonas from './data/personas.js';
import { applyCadenceMod, buildCadenceTransfer, extractCadenceProfile } from './engine/stylometry.js';
import { buildEscapeVector } from './engine/escape-vector.js';
import { buildIngestionFrictionAudit } from './engine/ingestion-friction.js';
import { buildEscapeControllerDecision } from './engine/escape-controller.js';
import { appendAcceptedOutput, createPersonaMemory, derivePersonaField, summarizePersonaMemory } from './engine/persona-memory.js';

const ready = true;
const benchState = { iterationPreview: [] };
function initAdversarialBench(documentRef = document) {
  return { documentRef, basePersonas, buildEscapeVector, buildIngestionFrictionAudit, buildEscapeControllerDecision, appendAcceptedOutput, createPersonaMemory, derivePersonaField, summarizePersonaMemory, applyCadenceMod, buildCadenceTransfer, extractCadenceProfile, benchState };
}
export { benchState, initAdversarialBench, ready };
