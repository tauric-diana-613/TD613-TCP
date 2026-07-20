function installLaunchComposition() {
  if (!document.querySelector('style[data-ash-aia-launch-composition]')) {
    const style = document.createElement('style');
    style.dataset.ashAiaLaunchComposition = 'true';
    style.textContent = `
      body[data-ash-aia-route="EXPERIENTIAL"] > .launch,
      body[data-ash-aia-route="CUSTODIAL"] > .launch { display: none !important; }
    `;
    document.head.append(style);
  }
  document.addEventListener('click', event => {
    const launch = event.target.closest('.ash-aia__launch-button');
    if (!launch) return;
    window.__td613AshLiveAIA?.setRoute?.('AUDIT');
  }, true);
}

async function bindExactWorkspaceRoute() {
  installLaunchComposition();
  for (let attempt = 0; attempt < 240; attempt += 1) {
    const open = window.__td613OpenAshWorkspace;
    const membrane = window.__td613AshLiveAIA;
    if (typeof open === 'function' && membrane?.setRoute && open.__td613AshAiaBound !== true) {
      const governedOpen = function governedOpenAshWorkspace(name) {
        membrane.setRoute('AUDIT');
        return open.call(this, name);
      };
      governedOpen.__td613AshAiaBound = true;
      governedOpen.__td613AshAiaOriginal = open;
      window.__td613OpenAshWorkspace = governedOpen;
      document.documentElement.dataset.ashAiaWorkspaceBridge = 'AUDIT_ON_EXACT_OPEN';
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  console.error('Ash AIA workspace bridge held: exact workspace or presentation API unavailable.');
}

bindExactWorkspaceRoute();
