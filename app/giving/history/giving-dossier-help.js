const heading = document.querySelector('.dossier-control .panel-heading h2');

if (heading && !document.querySelector('#researchDossierHelp')) {
  heading.textContent = '';
  heading.classList.add('research-dossier-title');

  const label = document.createElement('span');
  label.textContent = 'Research Dossier';

  const help = document.createElement('span');
  help.id = 'researchDossierHelp';
  help.className = 'research-dossier-help';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'research-dossier-help-trigger';
  trigger.setAttribute('aria-label', 'About Research Dossier');
  trigger.setAttribute('aria-describedby', 'researchDossierHelpText');
  trigger.textContent = '🛈︎';

  const popup = document.createElement('span');
  popup.id = 'researchDossierHelpText';
  popup.className = 'research-dossier-help-popup';
  popup.setAttribute('role', 'tooltip');
  popup.textContent = 'A Research Dossier is the custody container for one Giving investigation. It keeps the query, source lineage, retrieved public records, identity decisions, committee totals, Campaign Deputy receipts, and storage history together without turning those pieces into one opaque database row. Local keeps the dossier in this browser. Hosted encrypts it in the browser before remote storage. Hybrid keeps the local working copy plus an encrypted hosted branch. The vault passphrase is separate from the operator login, and conflicting hosted branches are preserved for human reconciliation instead of being silently overwritten.';

  help.append(trigger, popup);
  heading.append(label, help);

  const style = document.createElement('style');
  style.id = 'researchDossierHelpStyle';
  style.textContent = `
    .research-dossier-title{display:flex;align-items:center;gap:5px;overflow:visible}
    .research-dossier-help{position:relative;display:inline-flex;align-items:center;overflow:visible}
    .research-dossier-help-trigger{appearance:none;display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;min-width:15px;min-height:15px;padding:0;border:0;cursor:help;color:var(--cyan);background:transparent;font:600 12px/1 serif;opacity:.82}
    .research-dossier-help-trigger:hover{opacity:1}
    .research-dossier-help-trigger:focus-visible{outline:1px solid var(--cyan);outline-offset:2px;opacity:1}
    .research-dossier-help-popup{position:absolute;left:18px;top:-5px;z-index:120;width:224px;max-width:min(224px,72vw);padding:7px 8px;border:1px solid rgba(118,234,212,.24);pointer-events:none;visibility:hidden;opacity:0;transform:translateY(2px);color:rgba(218,239,230,.82);background:rgba(1,10,8,.985);box-shadow:0 10px 30px rgba(0,0,0,.38);font:500 7px/1.42 var(--sans);letter-spacing:.005em;text-transform:none;transition:opacity 70ms linear,transform 70ms linear,visibility 0s linear 70ms}
    .research-dossier-help:hover .research-dossier-help-popup,.research-dossier-help-trigger:focus-visible + .research-dossier-help-popup{visibility:visible;opacity:1;transform:translateY(0);transition-delay:0s}
    @media(max-width:760px){.research-dossier-help-popup{left:auto;right:-16px;top:19px;width:210px;font-size:7px}}
  `;
  document.head.append(style);
}
