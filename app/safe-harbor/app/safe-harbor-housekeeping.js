(function () {
  'use strict';

  function appendScript(src, options) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.async = false;
      if (options && options.type) script.type = options.type;
      script.onload = resolve;
      script.onerror = function () { reject(new Error('Failed to load ' + src)); };
      (document.head || document.documentElement).appendChild(script);
    });
  }

  appendScript('app/safe-harbor-housekeeping-base.js?v=20260716-stretch9')
    .then(function () {
      return appendScript('app/safe-harbor-ash-ingress.js?v=20260716-stretch9', { type: 'module' });
    })
    .catch(function (error) {
      window.__TD613_SAFE_HARBOR_ASH_INGRESS_LOAD_HOLD = {
        schema: 'td613.safe-harbor.ash-ingress-load-hold/v0.1',
        message: String(error && error.message || error || 'unknown load failure')
      };
    });
})();
