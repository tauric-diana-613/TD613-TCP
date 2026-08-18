const stylesheetId = 'researchDossierHelpStylesheet';

if (!document.getElementById(stylesheetId)) {
  const link = document.createElement('link');
  link.id = stylesheetId;
  link.rel = 'stylesheet';
  link.href = new URL('./giving-dossier-help.css?v=20260817-2', import.meta.url).href;
  document.head.appendChild(link);
}

function installTooltip({ host, id, label, text }) {
  if (!host || document.getElementById(id)) return;
  const help = document.createElement('span');
  help.id = id;
  help.className = 'research-dossier-help';

  const trigger = document.createElement('span');
  trigger.className = 'research-dossier-help-trigger';
  trigger.setAttribute('role', 'button');
  trigger.setAttribute('tabindex', '0');
  trigger.setAttribute('aria-label', label);
  trigger.setAttribute('aria-expanded', 'false');
  trigger.textContent = 'ⓘ';

  const popup = document.createElement('span');
  popup.id = `${id}Text`;
  popup.className = 'research-dossier-help-popup';
  popup.setAttribute('role', 'tooltip');
  popup.setAttribute('aria-hidden', 'true');
  popup.hidden = true;
  popup.textContent = text;
  trigger.setAttribute('aria-describedby', popup.id);

  let popupOpen = false;
  const positionPopup = () => {
    if (!popupOpen || popup.hidden) return;
    const triggerRect = trigger.getBoundingClientRect();
    const popupWidth = popup.offsetWidth || 220;
    const popupHeight = popup.offsetHeight || 0;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const left = Math.max(8, Math.min(triggerRect.left - 2, viewportWidth - popupWidth - 8));
    const top = Math.max(8, Math.min(triggerRect.bottom + 5, viewportHeight - popupHeight - 8));
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
  host.append(help);
  document.body.appendChild(popup);
}

const heading = document.querySelector('.dossier-control .panel-heading h2');
if (heading && !document.querySelector('#researchDossierHelp')) {
  heading.textContent = 'Contributor research file';
  const headingParent = heading.parentElement;
  const line = document.createElement('div');
  line.className = 'research-dossier-heading-line';
  headingParent.insertBefore(line, heading);
  line.appendChild(heading);
  installTooltip({
    host: line,
    id: 'researchDossierHelp',
    label: 'About the contributor research file',
    text: 'The contributor research file keeps one investigation together: search settings, retrieved public records, identity decisions, committee totals, receipts, and custody history. Giving calls this object a dossier internally. Save only preserves the current file; it never runs another search. Local stays in this browser. Hosted stores only a browser-encrypted copy. Hybrid keeps both. Use Vault when you want an encrypted hosted branch; the Vault passphrase is separate from the operator login and cannot be recovered by TD613.'
  });
}

const custodyPicker = document.querySelector('[data-dossier-picker-for="custodyMode"] > summary');
if (custodyPicker && !document.querySelector('#custodyModeHelp')) {
  const label = custodyPicker.querySelector('span');
  if (label) {
    const line = document.createElement('span');
    line.className = 'research-dossier-field-label-line';
    label.replaceWith(line);
    line.append(label);
    installTooltip({
      host: line,
      id: 'custodyModeHelp',
      label: 'What custody mode changes',
      text: 'NOW: choose where this working file belongs after a custody gesture. WHY: storage location changes the risk and recovery route, not the search results. EXACT: Local keeps readable data only in this browser; Hosted sends only browser-encrypted ciphertext to the Vault and removes the accepted local plaintext; Hybrid keeps the local working file plus an encrypted hosted branch. Changing this menu alone never runs a search.'
    });
  }
}
