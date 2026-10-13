const DIALOG_ID = 'practiceExitConfirm';

function portalDialogToViewportRoot() {
  const dialog = document.getElementById(DIALOG_ID);
  if (!dialog || dialog.parentElement === document.body) return;
  document.body.append(dialog);
  dialog.dataset.practiceViewportPortal = 'true';
}

function removePortaledDialog() {
  const dialog = document.getElementById(DIALOG_ID);
  if (dialog?.dataset.practiceViewportPortal === 'true') dialog.remove();
}

// giving-practice-hydration installs the shared dialog synchronously while
// handling this same load request. This listener is registered later by the
// single practice-runtime entrypoint, so the microtask sees the completed
// membrane and moves only the dialog node to the viewport root.
document.addEventListener('td613:giving-practice-load-request', () => {
  queueMicrotask(portalDialogToViewportRoot);
});

// Registration occurs earlier inside activatePractice than membrane creation;
// keeping this microtask as a second path makes the portal robust if load
// sequencing is refactored later.
document.addEventListener('td613:giving-practice-source-registry', (event) => {
  if (event.detail?.action === 'register') queueMicrotask(portalDialogToViewportRoot);
  if (event.detail?.action === 'remove') removePortaledDialog();
});

export const _givingPracticeDialogPortal = Object.freeze({
  DIALOG_ID,
  portalDialogToViewportRoot,
  removePortaledDialog
});
