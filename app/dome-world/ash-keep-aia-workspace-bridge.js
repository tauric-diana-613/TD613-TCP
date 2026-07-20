async function bindExactWorkspaceRoute() {
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
