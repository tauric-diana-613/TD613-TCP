(function () {
  function installSubtitle() {
    if (!document.body || document.body.getAttribute('data-page-kind') !== 'gateway') return;
    var subtitle = document.querySelector('.gateway-preview-subtitle');
    if (!subtitle) return;
    subtitle.textContent = 'Aperture keeps the witness field from flattening into a single answer-surface. It tracks what enters as latent state, what survives projection, what gets registered, and which narrowing operator authored the loss before any route is allowed to call itself clean.';
    subtitle.setAttribute('data-copy-pass', 'repo-governed-exposure');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installSubtitle, { once: true });
  else installSubtitle();
}());
