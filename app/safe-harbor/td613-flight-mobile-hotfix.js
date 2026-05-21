// TD613 Flight mobile layout hotfix
(function () {
  function patch() {
    const rail = document.querySelector('.mobile-prompt-rail');
    const dev = document.getElementById('devSettingsDrawer');
    if (rail && dev) {
      const divider = dev.previousElementSibling && dev.previousElementSibling.classList && dev.previousElementSibling.classList.contains('dev-divider')
        ? dev.previousElementSibling
        : dev;
      if (rail.compareDocumentPosition(divider) & Node.DOCUMENT_POSITION_PRECEDING) {
        divider.parentNode.insertBefore(rail, divider);
      }
    }
    const copy = document.getElementById('btnCopyFromOutput');
    if (copy) copy.textContent = 'Copy';
    const clear = document.getElementById('btnClearOutput');
    if (clear) clear.textContent = 'Clear';
  }
  document.addEventListener('DOMContentLoaded', function () {
    patch();
    setTimeout(patch, 50);
    setTimeout(patch, 300);
  });
})();
