import { extractCadenceProfile } from './engine/stylometry.js';

const ready = true;
const benchState = { iterationPreview: [] };
function initAdversarialBench(documentRef = document) {
  return { documentRef, benchState, extractCadenceProfile };
}
export { benchState, initAdversarialBench, ready };
