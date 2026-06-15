import {
  installNativeCorpusCarousel,
  openEditCorpusModal,
  readStoredSamples,
  saveEditCorpusModal,
  upgradeCustomizerFields,
  writeStoredSamples
} from './hush-phase31-native-edit-carousel-v3.js';

const VERSION = 'hush-edit-corpus-helper/schema-safe-native-owned';

function nativeApi() {
  return window.__TD613_HUSH_PHASE31_NATIVE_EDIT_CAROUSEL__ || null;
}

function openModalFallback() {
  upgradeCustomizerFields(document);
  return nativeApi()?.openEditCorpusModal?.(document) || openEditCorpusModal(document);
}

function readSamples() {
  return nativeApi()?.readStoredSamples?.() || readStoredSamples() || [];
}

function writeSamples(samples = []) {
  return nativeApi()?.writeStoredSamples?.(samples) || writeStoredSamples(samples) || [];
}

function saveModal() {
  return nativeApi()?.saveEditCorpusModal?.(document) || saveEditCorpusModal(document);
}

if (typeof document !== 'undefined') {
  installNativeCorpusCarousel(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => installNativeCorpusCarousel(document), { once: true });
  window.setTimeout(() => installNativeCorpusCarousel(document), 320);
}

window.__TD613_HUSH_EDIT_CORPUS_OPEN_FALLBACK__ = {
  version: VERSION,
  nativeOwned: true,
  schemaSafe: true,
  openModalFallback,
  readSamples,
  writeSamples,
  saveModal
};
