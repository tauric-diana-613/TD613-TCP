TD613 Safe Harbor — Membrane Boot-Safe Patch Ledger

Changes
- Hid lanes 2 and 3 by default in raw HTML so the user only sees one ingress question until JS boot and lane unlock.
- Disabled bypass and mint controls by default in raw HTML; JS boot now enables them.
- Added body.boot-pending and a noscript boot alert so failed JS boot no longer masquerades as a valid sealed membrane.
- Added global error/unhandled rejection handlers that surface boot and mint errors in the ingress note.
- Kept sequential question logic and explicit mint behavior intact.

Intent
- Prevent the exact false impression that the membrane is frozen when JS never initialized or packet mint failed.
