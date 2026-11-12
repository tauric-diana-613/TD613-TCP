# 𝌋 Vixen Cybernetics · protected brand-asset intake

This is an **asset interface**, rather than a new Opera or a source-admission
mechanism. OPERAHOUSE ≠ OPERA ≠ PERFORMER. Vixen's research corpus, algebra,
source bodies, human Gates, Podium permissions, and experimental status remain
unchanged by art edits.

## Active revision at RGI-15

- `fox-arcflash.svg`: **installed standalone** SVG. Both responsive masthead
  instances load exactly this file. Its original 48×48 geometric coordinates
  survive, and the eye cores are yellow `#F9F36D`, with small contained SVG
  bloom. No raster logo should be installed.
- `frontispiece-desktop.png`: **operator-selected art pending**. The current
  desktop HTML still contains the historical fallback WebP, SHA-256
  `a6a9781b9e204478a8bf9a3b8fff769605bdcaf1c90b7b42829cd882d1871763`.
- `frontispiece-mobile.png`: **operator-selected art pending**. The current
  mobile HTML still contains the historical fallback WebP, SHA-256
  `1e31bc0e838c8879dd859034607e8244e9f7bd1f40b59e943b5dddb39aa87266`.

The two PNG targets intentionally do not yet exist in this PR. **Do not infer
which candidate Em selected** from historical filenames or previous assistant
recommendations. The operator must attach the actual selected desktop and
mobile files to Work mode. The project cannot independently authenticate Em's
decision from the other candidate images.

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
