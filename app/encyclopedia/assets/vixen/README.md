# 𝌋 Vixen Cybernetics · protected brand-asset intake

This is an **asset interface**, rather than a new Opera or a source-admission
mechanism. OPERAHOUSE ≠ OPERA ≠ PERFORMER. Vixen's research corpus, algebra,
source bodies, human Gates, Podium permissions, and experimental status remain
unchanged by art edits.

## Current installed asset state

The draft PR contains external `frontispiece-desktop.png` and `frontispiece-mobile.png`, together with standalone `fox-arcflash.svg`. Both PNG slots are separately routed, and the mobile <source> correctly declares `image/png`. The desktop is pending the operator's revised artwork; the currently installed mobile image remains accepted and must be preserved. The fox's yellow eye geometry is unchanged. Current file digests and dimensions live in `asset-contract.json`; historic WebP digests remain there for provenance.

### Desktop-only intake · preserve mobile and fox

```bash
python3 scripts/install-vixen-brand-assets.py --check
python3 scripts/install-vixen-brand-assets.py --desktop "/path/to/REVISED_DESKTOP.png" --desktop-only --dry-run
python3 scripts/install-vixen-brand-assets.py --desktop "/path/to/REVISED_DESKTOP.png" --desktop-only
python3 scripts/install-vixen-brand-assets.py --check
node --test tests/vixen-brand-asset-contract.test.mjs
```

This path preflights the existing installed assets and the replacement, then writes only the desktop PNG, manifest, and page's embedded reference metadata. Mobile PNG and fox SVG are never rewritten. Original creative approval and human closure remain RESERVED.

## Three-file operator handoff (full repository checkout)

```bash
python3 scripts/install-vixen-brand-assets.py --check
python3 scripts/install-vixen-brand-assets.py \
  --desktop "/path/to/EM_SELECTED_DESKTOP.png" \
  --mobile "/path/to/EM_SELECTED_MOBILE.png" \
  --fox "/path/to/FINAL_FOX.svg" --dry-run
python3 scripts/install-vixen-brand-assets.py \
  --desktop "/path/to/EM_SELECTED_DESKTOP.png" \
  --mobile "/path/to/EM_SELECTED_MOBILE.png" \
  --fox "/path/to/FINAL_FOX.svg"
python3 scripts/install-vixen-brand-assets.py --check
node --test tests/vixen-brand-asset-contract.test.mjs
```

The installer checks both original fallback digests before retirement, parses
PNG orientation and dimensions (16:9 desktop; 9:16 mobile), checks PNG IHDR
integrity, inspects SVG structure and Arc Flash eye geometry, and prevalidates
all three files before writing. It leaves historical source blobs recoverable
through Git history and records active PNG digests in both the asset manifest
and Vixen's source-embedded reference manifest. Browser navigation and the
research instruments are untouched.

The frontispiece's existing Glinda/Opaline CSS **grayscale and screen blend**
are explicitly bypassed **only** when the operator-selected external PNGs are
installed; otherwise the original render remains unchanged. No extra pearl
glow, recoloring, resampling, invented crystal facets, or added ring geometry
should be applied to Em's selected art.

## Required human-facing acceptance

Review the PR branch on actual desktop and mobile viewports. Confirm:
1. The exact selected images load as separate media files, with white crystal,
   engraved geometry, and intended atmosphere/colors undistorted.
2. The mobile portrait is selected at ≤680px; no sideways crop or horizontal
   overflow; the desktop uses the selected 16:9 image.
3. Fox eyes remain visibly **yellow**, not lavender/pink, at 42px desktop and
   38px mobile on both dark and pink header stages.
4. Header branding, fox nav, Operahouse exclusive-stage masthead, Observatory,
   Works, Salon, Source Folios, 8 human gates, Podium, and native research
   interactions retain their previously qualified behavior.
5. The review is grounded in exact new Git HEAD and CI, not an older Vercel
   deployment or an isolated screenshot.

After the operator has approved those three files and their staging, Work can
commit the change on PR #1730 and create an exact-head preview. **No merge to
`main`, no TD613.com production promotion, no protected Experiment B Flight,
and no scientific or artistic closure by the executing agent.**

Machine-readable interface: [asset-contract.json](./asset-contract.json).
