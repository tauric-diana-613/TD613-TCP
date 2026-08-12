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
  trigger.textContent = '🛈︎';

  const popup = document.createElement('span');
  popup.id = 'researchDossierHelpText';
  popup.className = 'research-dossier-help-popup';
  popup.setAttribute('role', 'tooltip');
  popup.textContent = 'A Research Dossier is the custody container for one Giving investigation. It keeps the query, source lineage, retrieved public records, identity decisions, committee totals, Campaign Deputy receipts, and storage history together without turning those pieces into one opaque database row. Local keeps the dossier in this browser. Hosted encrypts it in the browser before remote storage. Hybrid keeps the local working copy plus an encrypted hosted branch. The vault passphrase is separate from the operator login, and conflicting hosted branches are preserved for human reconciliation instead of being silently overwritten.';

  help.append(trigger, popup);
  line.appendChild(help);

  const style = document.createElement('style');
  style.id = 'researchDossierHelpStyle';
  style.textContent = `
    .research-dossier-heading-line{
      position:relative;
      display:flex;
      width:max-content;
      max-width:100%;
      align-items:center;
      gap:4px;
      overflow:visible;
    }
    .research-dossier-heading-line>h2{
      flex:0 1 auto;
      margin:0;
    }
    .research-dossier-help{
      position:relative;
      display:inline-flex;
      flex:0 0 13px;
      width:13px;
      height:13px;
      min-width:13px;
      min-height:13px;
      align-items:center;
      justify-content:center;
      overflow:visible;
      vertical-align:middle;
    }
    .research-dossier-help-trigger{
      display:inline-flex;
      box-sizing:border-box;
      width:13px;
      height:13px;
      min-width:13px;
      min-height:13px;
      align-items:center;
      justify-content:center;
      margin:0;
      padding:0;
      cursor:help;
      color:var(--cyan);
      background:transparent;
      font-family:serif;
      font-size:10px;
      font-style:normal;
      font-weight:600;
      line-height:1;
      letter-spacing:0;
      text-decoration:none;
      text-transform:none;
      opacity:.72;
      user-select:none;
    }
    .research-dossier-help-trigger:hover{opacity:1}
    .research-dossier-help-trigger:focus-visible{
      outline:1px solid var(--cyan);
      outline-offset:1px;
      opacity:1;
    }
    .research-dossier-help-popup{
      position:absolute;
      left:16px;
      top:-4px;
      z-index:120;
      display:block;
      box-sizing:border-box;
      width:224px;
      max-width:min(224px,72vw);
      margin:0;
      padding:7px 8px;
      border:1px solid rgba(118,234,212,.24);
      pointer-events:none;
      visibility:hidden;
      opacity:0;
      transform:translateY(2px);
      color:rgba(218,239,230,.82);
      background:rgba(1,10,8,.985);
      box-shadow:0 10px 30px rgba(0,0,0,.38);
      font-family:var(--sans);
      font-size:7px;
      font-style:normal;
      font-weight:500;
      line-height:1.42;
      letter-spacing:.005em;
      text-align:left;
      text-decoration:none;
      text-transform:none;
      white-space:normal;
      transition:opacity 70ms linear,transform 70ms linear,visibility 0s linear 70ms;
    }
    .research-dossier-help:hover .research-dossier-help-popup,
    .research-dossier-help-trigger:focus-visible + .research-dossier-help-popup{
      visibility:visible;
      opacity:1;
      transform:translateY(0);
      transition-delay:0s;
    }
    @media(max-width:760px){
      .research-dossier-help-popup{
        left:auto;
        right:-12px;
        top:16px;
        width:210px;
        font-size:7px;
      }
    }
  `;
  document.head.append(style);
}
