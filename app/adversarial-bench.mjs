const ready = true;
const benchState = { iterationPreview: [] };
function initAdversarialBench(documentRef = document) {
  return { documentRef, benchState };
}
export { benchState, initAdversarialBench, ready };
