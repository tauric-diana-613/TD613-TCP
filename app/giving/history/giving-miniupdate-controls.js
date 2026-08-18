const $ = (selector) => document.querySelector(selector);

function centerPrimarySearchActions() {
  const row = $('#runSearchButton')?.closest('.button-row');
  if (!row) return;
  row.classList.add('giving-primary-search-actions');
  row.setAttribute('aria-label', 'Primary search controls');
}

function arrangeContactQueueControls() {
  const panel = $('#contactQueuePanel');
  const topRow = panel?.querySelector('.contact-queue-actions');
  const list = $('#contactQueueList');
  const add = $('#addContactQueueButton');
  const run = $('#runContactQueueButton');
  const stop = $('#stopContactQueueButton');
  const clear = $('#clearContactQueueButton');
  if (!panel || !topRow || !list || !add || !run || !stop || !clear) return;

  topRow.classList.add('contact-queue-top-actions');
  topRow.append(add, clear);

  let runRow = $('#contactQueueRunActions');
  if (!runRow) {
    runRow = document.createElement('div');
    runRow.id = 'contactQueueRunActions';
    runRow.className = 'button-row contact-queue-run-actions';
    list.insertAdjacentElement('afterend', runRow);
  }
  runRow.append(run, stop);
  panel.dataset.queueControlLayout = 'post-scroll-run';
}

centerPrimarySearchActions();
arrangeContactQueueControls();

export const _givingMiniupdateControls = Object.freeze({
  centerPrimarySearchActions,
  arrangeContactQueueControls
});
