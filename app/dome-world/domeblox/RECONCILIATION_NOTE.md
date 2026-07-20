# DomeBlox pre-release reconciliation

This packet closes the only unique product hardening left on a stale branch:

- a same-origin `return-link` styling hook for the Forward Battery footer;
- a stylesheet rule replacing the removed CSP-blocked inline style;
- static regression gates preventing the unsupported meta `frame-ancestors` directive or inline style from returning.

No game mechanics, save schema, route hierarchy, serverless allocation, deployment lock, or authority boundary changes.
