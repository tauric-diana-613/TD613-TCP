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

const VERSION = 'phase-31.1-dropdown-snap-carousel/v6-single-owner';

export function initHushPhase311(doc = document) {
  upgradeCustomizerFields(doc);
  const result = typeof nativePhase311.initHushPhase311 === 'function'
    ? nativePhase311.initHushPhase311(doc, { externalEditOwner: true })
    : { installed: false };
  exposeNativeCorpusCarousel(doc);
  upgradeCustomizerFields(doc);
  return { ...result, version: VERSION, dropdownSnapCarousel: true, singleEditOwner: true };
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const boot = () => initHushPhase311(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.addEventListener('td613:hush:core-ready', boot, { once: true });
  if (!window.__TD613_HUSH_PHASE31_NATIVE_EDIT_CAROUSEL__) {
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
}
