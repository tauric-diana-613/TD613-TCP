import {
  closeEditCorpusModal,
  exposeNativeCorpusCarousel,
  installNativeCorpusCarousel,
  moveEditCorpus,
  openEditCorpusModal,
  pullActiveEditCorpusSample,
  readStoredSamples,
  renderActiveEditCorpusSample,
  saveEditCorpusModal,
  upgradeCustomizerFields,
  writeStoredSamples
} from './hush-phase31-native-edit-carousel-v4.js';
import * as nativePhase311 from './hush-phase31-1-original.js';

const VERSION = 'phase-31.1-simple-edit-context-field';

export function initHushPhase311(doc = document) {
  upgradeCustomizerFields(doc);
  const result = typeof nativePhase311.initHushPhase311 === 'function'
    ? nativePhase311.initHushPhase311(doc)
    : { installed: false };
  exposeNativeCorpusCarousel(doc);
  installNativeCorpusCarousel(doc);
  upgradeCustomizerFields(doc);
  window.setTimeout(() => installNativeCorpusCarousel(doc), 0);
  window.setTimeout(() => installNativeCorpusCarousel(doc), 260);
  window.setTimeout(() => installNativeCorpusCarousel(doc), 900);
  return { ...result, version: VERSION, simpleEditPath: true };
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const boot = () => initHushPhase311(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.addEventListener('td613:hush:core-ready', boot, { once: true });
  window.setTimeout(boot, 320);
  window.__TD613_HUSH_PHASE31_NATIVE_EDIT_CAROUSEL__ = {
    version: VERSION,
    openEditCorpusModal,
    closeEditCorpusModal,
    renderActiveEditCorpusSample,
    moveEditCorpus,
    pullActiveEditCorpusSample,
    saveEditCorpusModal,
    readStoredSamples,
    writeStoredSamples,
    installNativeCorpusCarousel,
    upgradeCustomizerFields
  };
}
