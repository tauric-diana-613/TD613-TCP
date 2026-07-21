# Ash Keep AIA3 Mass-Eviction Test Matrix

Required before merge:

| Engine | Fresh desktop | Fresh mobile | Stale live-case recovery |
|---|---:|---:|---:|
| Chromium | required | required | required |
| Firefox | required | required | required |
| WebKit | required | required | required |

Every path must preserve IndexedDB and local case continuity, reject retired AIA paint, retain exact workspaces, and report zero clipped controls, duplicate IDs, external requests, write requests, page errors, console errors, and HTTP errors.
