# Ash Keep mobile composition

Ash Keep now loads a phone-specific composition through the workspace bridge without mutating the desktop source geometry.

The mobile layer provides:

- a compact four-column, multi-row workspace rail that accommodates lifecycle-added tabs;
- map controls in document flow rather than over the canvas;
- a bounded canvas height suited to browser chrome on small screens;
- a two-column legend below the canvas;
- single-column tools and full-width actions;
- a safe-area-aware case-entry bottom sheet.

The existing lifecycle action gates remain in `ash-workspace-bridge-core.js`. The public bridge re-exports that API and installs the mobile composition as a side effect.
