// Browser-test fixture only. Registration is performed solely by the AIA3 stale-client witness.
// It never intercepts requests and carries no application authority.
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
