function legacyCaseOpen() {
  const root = document.documentElement;
  try {
    return Boolean(localStorage.getItem('td613.ash-keep.current-case'))
      || root.classList.contains('ash-has-current-case')
      || root.dataset.ashSessionOpen === 'true';
  } catch {
    return root.classList.contains('ash-has-current-case')
      || root.dataset.ashSessionOpen === 'true';
  }
}

function capsuleRecoveryOpen() {
  const workspace = document.getElementById('workspace-save');
  const returnBar = workspace?.querySelector('.capsule-recovery-navigation');
  return Boolean(
    !legacyCaseOpen()
      && workspace?.classList.contains('active')
      && returnBar
      && returnBar.hidden === false
  );
}

function composeLaunchForRoute() {
  const launch = document.querySelector('body > .launch');
  if (!launch) return;
  const explicitLegacy = new URLSearchParams(location.search).get('presentation') === 'legacy';
  const route = document.body.dataset.ashAiaRoute;

  if (explicitLegacy) {
    launch.style.removeProperty('display');
    delete launch.dataset.ashAiaComposed;
    if (!legacyCaseOpen() && !capsuleRecoveryOpen()) launch.classList.remove('hidden');
    return;
  }

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
  new MutationObserver(composeLaunchForRoute).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-ash-session-open']
  });
  window.addEventListener('td613:ash:lifecycle-updated', composeLaunchForRoute);
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
