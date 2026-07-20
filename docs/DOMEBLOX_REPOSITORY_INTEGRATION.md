# DomeBlox repository integration v1.1

Route: `/dome-world/domeblox/`

The station is static and browser-local. It introduces no serverless function and relies on the existing `/dome-world/(.*)` rewrite. The deployment lock remains unchanged.

The repository stores a handoff metadata manifest and final external archive digest; it does not embed the binary Roblox handoff. The archive is delivered through the operator handoff channel.

Future games register through `games/index.json`, versioned manifests under `games/`, and the bounded interfaces in `domeblox-hooks.js`. Duplicate identifiers are rejected and manifests cannot load remote executable code.

Production behavior remains pending until PR review, merge, authorized deployment, and route observation.
