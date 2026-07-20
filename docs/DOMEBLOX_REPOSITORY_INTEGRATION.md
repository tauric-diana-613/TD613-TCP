# DomeBlox repository integration

Route: `/dome-world/domeblox/`

The station is static and browser-local. It introduces no serverless function and relies on the existing `/dome-world/(.*)` Vercel rewrite. The deployment lock remains unchanged.

The Roblox project is distributed as a separate operator handoff archive whose digest is recorded in `app/dome-world/domeblox/handoff-manifest.json`. Future games register under `games/` and through `domeblox-hooks.js`.
