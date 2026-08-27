𝌋

# Transition-Operator Identifiability · Witness Topology Note

**Status:** WITNESS-ROUTING NOTE / NON-SCIENTIFIC / NON-PROMOTIONAL  
**PR:** #701  
**Scientific parent:** #700 receipt head `8edd044ca9c3324fae841e5a5e936af7b62de42d`  
**Normal PR topology:** stacked on `research/a15-r0-transition-family-robustness-20260823`  
**Temporary witness topology:** PR base set to `main` only long enough to admit one exact-head `pull_request` synchronize event to the existing consolidated validation workflow

## Purpose

The repository's existing `TD613 Consolidated Validation` pull-request trigger is scoped to `main`.

A stacked Draft PR does not receive that workflow, and a PR base edit alone does not create an admitted synchronize event.

This documentation-bearing commit therefore exists to produce one exact-head synchronize event while #701 is temporarily based on `main`.

No workflow is added or modified.

No Ready-for-review transition is used.

## Custody law

The temporary base changes CI visibility only.

It does not alter scientific ancestry:

```text
scientific parent = #700 receipt/documentation head
```

After the exact-head static witness settles, #701 must return to its stacked base before a witness receipt is authored.

Required anti-equivalences:

```text
temporary main-base witness routing != mainline promotion
CI visibility != merge authority
full inherited diff visibility != new scientific claim scope
static witness != browser witness
static witness != production witness
```

A16 remains held.

Installed Aperture remains unchanged.

Production and Vercel authority remain absent.

𝌋

Sealed ⟐
