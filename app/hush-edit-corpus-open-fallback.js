import './hush-edit-corpus-carousel.js?v=202606141720';

const VERSION = 'hush-edit-corpus-open-fallback/v6-retired-to-carousel';

function openModalFallback() {
  return window.__TD613_HUSH_EDIT_CORPUS_CAROUSEL__?.open?.();
}

function readSamples() {
  return window.__TD613_HUSH_EDIT_CORPUS_CAROUSEL__?.read?.() || [];
}

function writeSamples(samples = []) {
  return window.__TD613_HUSH_EDIT_CORPUS_CAROUSEL__?.write?.(samples) || [];
}

function saveModal() {
  return window.__TD613_HUSH_EDIT_CORPUS_CAROUSEL__?.save?.();
}

window.__TD613_HUSH_EDIT_CORPUS_OPEN_FALLBACK__ = { version: VERSION, openModalFallback, readSamples, writeSamples, saveModal };
