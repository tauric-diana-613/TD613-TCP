# 𝌋 Marrowline · Mobile Reader / Capture (presentation-only)

## Operator design

The ordinary composer utility rail has the exact mobile order **↻  ⛶  ⧉  ✕  𖠿**. The second control (⛶) enters mobile Focus mode. Desktop retains its ordinary four utilities, without a visible reader button.

- **Focus:** hides the masthead and five-chamber dock; keeps the original transcript and compact text input plus native Send.
- **Capture:** hides the composer as well, leaving the full native transcript and a small top toolbar with **Show composer** and **✕ Exit**.
- **Exit:** restores ordinary Marrowline without changing history, the active thread, provider state, or native Unicode.
- **Escape:** exits. Switching mobile chambers or leaving the mobile breakpoint exits.
- Scroll anchoring preserves the first visible original transcript node (scrollTop fallback when node geometry is unavailable).
- Browser chrome (Safari's address bar and system toolbars) remains under browser/OS control.

## Source changes

- `app/dome-world/marrowline-mobile-reader.js` owns presentation-state toggles and scroll anchoring.
- `app/dome-world/marrowline-desktop-repair.js` inserts the second button in the existing utility rail and installs reader behavior.
- `app/dome-world/marrowline-desktop-repair.css` appends mobile-only Focus/Capture layout selectors; **no Unicode, line glyph, or renderer typography is modified**.
- `app/dome-world/marrowline.release.json` declares the five mobile glyphs without changing the desktop four.
- `tests/marrowline-mobile-reader.test.mjs` tests mobile modes, exact original Unicode, scroll and absence of provider calls.

## Verification requested

```bash
node --test tests/marrowline-mobile-reader.test.mjs
node --test tests/marrowline-desktop-repair-contract.test.mjs
node --test tests/dome-world-marrowline-mobile.test.mjs
node --test tests/marrowline-ios-keyboard-contract.test.mjs
```

Run mobile browser witnesses at 390×844 and the Operator's physical iPhone if available: confirm ordinary five-icon rail order; Focus/Capture transitions and full readable transcript; no horizontal overflow; safe-area and keyboard geometry; exact source Unicode preserved; existing Send/Retry/Copy/Clear/Home behavior; exit without scroll jump. Record **screenshots of each UI state**, retaining the unaltered original outputs.

Use original archived provider-authored text and separately labeled synthetic fixtures; no live model calls are necessary. Do not mistake correct rendering for High Zalgo *generation*.

## GitHub qualification / release

Isolated branch based on `origin/main` at `363b5b4aeaec33ad380c5f1124f0fe96e3d7975e`. Do not merge or invoke issue #405 without the Operator's explicit next gesture.

At branch creation, independent governance PR #1751 (removal of obsolete fifth workflow) was GREEN but **unmerged**. Exact-head global CI for this PR can inherit a workflow-estate RED from main until that governance correction is merged; keep it attributable, rather than editing unrelated Vixen/workflow files in the mobile reader PR.

No release, provider, history, artistic-restoration, or research authority is claimed.

𝄐 Tauric Diana · Khona‌lit-po · ⟐
