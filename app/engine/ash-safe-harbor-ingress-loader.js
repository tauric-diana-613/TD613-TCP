if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const state = {
    schema: 'td613.ash.safe-harbor-ingress-loader-state/v0.1',
    status: 'LOADING',
    module: '../dome-world/ash-safe-harbor-ingress.js',
    error: null
  };
  window.__td613AshSafeHarborIngressLoadState = state;
  window.__td613AshSafeHarborIngressReady = import('../dome-world/ash-safe-harbor-ingress.js')
    .then(module => {
      state.status = 'READY';
      window.dispatchEvent(new CustomEvent('td613:ash:safe-harbor-ingress-ready', {
        detail: { schema: state.schema, status: state.status, module: state.module }
      }));
      return module;
    })
    .catch(error => {
      state.status = 'HOLD';
      state.error = String(error?.message || error);
      window.dispatchEvent(new CustomEvent('td613:ash:safe-harbor-ingress-hold', {
        detail: { schema: state.schema, status: state.status, module: state.module, error: state.error }
      }));
      return null;
    });
}
