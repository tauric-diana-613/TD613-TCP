# DomeBlox playable-port claim ceiling

DomeBlox closes the following browser-runtime proposition:

> A player can open `/dome-world/domeblox/` in a standards-compliant browser, enter and move through a rendered Dome-World village, interact with its care, water, food, bamboo, Loom, cleansing, rest, release, Ash Keep, and Springald systems, observe day/weather/needs/ecology state, preserve a local save, and export that save without contacting an external service.

The browser port preserves the game loop and TD613/Dome-World hooks in a web-native implementation. It hydrates partial version-1 saves against the current state shape, treats unavailable browser storage as a bounded abstention rather than a runtime crash, and keeps JSON export available as the operator-controlled fallback.

It does not claim pixel-for-pixel Roblox-engine equivalence, Roblox multiplayer parity, Roblox physics parity, guaranteed browser storage availability, or proof of behavior outside the observed browser runtime.

The Forward Battery retains its separate claim ceiling at `/dome-world/domeblox/forward-battery/`.
