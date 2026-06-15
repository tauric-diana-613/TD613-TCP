const VERSION = 'hush-edit-corpus-carousel/native-owned';

function nativeApi() {
  return window.__TD613_HUSH_PHASE31_NATIVE_EDIT_CAROUSEL__ || null;
}

function open() {
  return nativeApi()?.openEditCorpusModal?.(document);
}

function read() {
  return nativeApi()?.readStoredSamples?.() || [];
}

function write(samples = []) {
  return nativeApi()?.writeStoredSamples?.(samples) || [];
}

function save() {
  return nativeApi()?.saveEditCorpusModal?.(document);
}

function move(delta = 0) {
  return nativeApi()?.moveEditCorpus?.(delta, document);
}

window.__TD613_HUSH_EDIT_CORPUS_CAROUSEL__ = {
  version: VERSION,
  nativeOwned: true,
  open,
  read,
  write,
  save,
  move
};
