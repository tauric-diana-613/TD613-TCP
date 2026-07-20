function composeLaunchForRoute() {
  const launch = document.querySelector('body > .launch');
  if (!launch) return;
  const route = document.body.dataset.ashAiaRoute;
  if (route === 'EXPERIENTIAL' || route === 'CUSTODIAL') {
    launch.style.setProperty('display', 'none', 'important');
    launch.dataset.ashAiaComposed = 'HIDDEN_BEHIND_CONSEQUENCE_ROUTE';
  } else {
    launch.style.removeProperty('display');
    delete launch.dataset.ashAiaComposed;
  }
}

function installLaunchComposition() {
  composeLaunchForRoute();
  new MutationObserver(composeLaunchForRoute).observe(document.body, {
    attributes: true,
    attributeFilter: ['data-ash-aia-route']
  });
  document.addEventListener('click', event => {
    const launch = event.target.closest('.ash-aia__launch-button');
    if (!launch) return;
    window.__td613AshLiveAIA?.setRoute?.('AUDIT');
    queueMicrotask(composeLaunchForRoute);
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
      composeLaunchForRoute();
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  console.error('Ash AIA workspace bridge held: exact workspace or presentation API unavailable.');
}

bindExactWorkspaceRoute();
