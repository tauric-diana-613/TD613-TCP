const VERSION = 'hush-edit-corpus-helper/native-owned';

function nativeApi() {
  return window.__TD613_HUSH_PHASE31_NATIVE_EDIT_CAROUSEL__ || null;
}

function openModalFallback() {
  return nativeApi()?.openEditCorpusModal?.(document);
}

function readSamples() {
  return nativeApi()?.readStoredSamples?.() || [];
}

function writeSamples(samples = []) {
  return nativeApi()?.writeStoredSamples?.(samples) || [];
}

function saveModal() {
  return nativeApi()?.saveEditCorpusModal?.(document);
}

window.__TD613_HUSH_EDIT_CORPUS_OPEN_FALLBACK__ = {
  version: VERSION,
  nativeOwned: true,
  openModalFallback,
  readSamples,
  writeSamples,
  saveModal
};
