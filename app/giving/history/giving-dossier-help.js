const stylesheetId = 'researchDossierHelpStylesheet';

if (!document.getElementById(stylesheetId)) {
  const link = document.createElement('link');
  link.id = stylesheetId;
  link.rel = 'stylesheet';
  link.href = new URL('./giving-dossier-help.css?v=20260812-1', import.meta.url).href;
  document.head.appendChild(link);
}

const heading = document.querySelector('.dossier-control .panel-heading h2');

if (heading && !document.querySelector('#researchDossierHelp')) {
  heading.textContent = 'Research Dossier';

  const headingParent = heading.parentElement;
  const line = document.createElement('div');
  line.className = 'research-dossier-heading-line';
  headingParent.insertBefore(line, heading);
  line.appendChild(heading);

  const help = document.createElement('span');
  help.id = 'researchDossierHelp';
  help.className = 'research-dossier-help';

  const trigger = document.createElement('span');
  trigger.className = 'research-dossier-help-trigger';
  trigger.setAttribute('role', 'button');
  trigger.setAttribute('tabindex', '0');
  trigger.setAttribute('aria-label', 'About Research Dossier');
  trigger.setAttribute('aria-describedby', 'researchDossierHelpText');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.textContent = '🛈︎';

  const popup = document.createElement('span');
  popup.id = 'researchDossierHelpText';
  popup.className = 'research-dossier-help-popup';
  popup.setAttribute('role', 'tooltip');
  popup.setAttribute('aria-hidden', 'true');
  popup.hidden = true;
  popup.textContent = 'A Research Dossier is the custody container for one Giving investigation. It keeps the query, source lineage, retrieved public records, identity decisions, committee totals, Campaign Deputy receipts, and storage history together without turning those pieces into one opaque database row. Local keeps the dossier in this browser. Hosted encrypts it in the browser before remote storage. Hybrid keeps the local working copy plus an encrypted hosted branch. The vault passphrase is separate from the operator login, and conflicting hosted branches are preserved for human reconciliation instead of being silently overwritten.';

  let popupOpen = false;

  const positionPopup = () => {
    if (!popupOpen || popup.hidden) return;
    const triggerRect = trigger.getBoundingClientRect();
    const popupWidth = popup.offsetWidth || 190;
    const popupHeight = popup.offsetHeight || 0;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const rightwardLeft = triggerRect.left - 2;
    const left = Math.max(8, Math.min(rightwardLeft, viewportWidth - popupWidth - 8));
    const preferredTop = triggerRect.bottom + 4;
    const top = Math.max(8, Math.min(preferredTop, viewportHeight - popupHeight - 8));
    popup.style.left = `${Math.round(left)}px`;
    popup.style.top = `${Math.round(top)}px`;
  };

  const setPopupOpen = (open) => {
    popupOpen = open;
    popup.hidden = !open;
    popup.setAttribute('aria-hidden', open ? 'false' : 'true');
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) positionPopup();
  };

  trigger.addEventListener('pointerenter', () => setPopupOpen(true));
  trigger.addEventListener('pointerleave', () => setPopupOpen(false));
  trigger.addEventListener('focus', () => setPopupOpen(true));
  trigger.addEventListener('blur', () => setPopupOpen(false));
  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setPopupOpen(false);
      trigger.blur();
    }
  });
  window.addEventListener('resize', positionPopup);
  window.addEventListener('scroll', positionPopup, true);

  help.append(trigger);
  line.appendChild(help);
  document.body.appendChild(popup);
}
