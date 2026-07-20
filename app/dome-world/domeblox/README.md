# DomeBlox playable browser port

`/dome-world/domeblox/` is the playable browser entrance to Dome-World.

The local-first counter-adversarial station remains available at:

`/dome-world/domeblox/forward-battery/`

## Playable systems

- keyboard and touch movement through the Dome-World village
- twelve hill-ring homes, inner water ring, central mound, Loom, Ash Keep, garden, bamboo, nest, cleansing pools, care/rest/attention/release stations
- moving ducks, rabbits, sheep, and chickens
- day, season, weather, needs, ecology, hydration, integrity, reserve, reflux, and local Springald state
- harvesting, food preparation, bamboo-to-pulp-to-thread work, weaving, cleansing, tending, rest, and release loops
- local save, autosave, JSON export, map, HUD, and tab-safe Forward Battery bridge
- exact U+10D613 scalar preserved in the interface and save export

## Runtime

The game uses browser-native Canvas 2D and ES modules. It adds no serverless function and contacts no external service. State remains in browser `localStorage` unless the player explicitly exports a save.

## Potato extension lane

The runtime is split under `game/`:

- `core.js` — state, custody ledger, world objects, saves, and shared constants
- `render.js` — Dome-World canvas and map rendering
- `sim.js` — movement, ecology, needs, interactions, Loom, and Springald
- `main.js` — input and runtime bootstrap

Future games or village systems should preserve the existing route split: playable game at the root, specialized instruments beneath named subroutes, and explicit authorship and claim ceilings for every addition.
