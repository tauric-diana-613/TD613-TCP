𝌋

# Transition-Family Robustness · Witness Topology Note

**Status:** WITNESS-ROUTING NOTE / NON-SCIENTIFIC / NON-PROMOTIONAL  
**PR:** #700  
**Normal PR topology:** stacked on #699 research branch  
**Temporary witness topology:** PR base set to `main` only long enough to admit one exact-head `pull_request` synchronize event to the existing consolidated validation workflow

## Why this note exists

The repository workflow `TD613 Consolidated Validation` listens to pull requests whose base is `main` and does not trigger for a Draft PR stacked on another research branch.

A base-edit event alone is not in the workflow's admitted pull-request action types.

Therefore one documentation-bearing synchronize commit is used while #700 temporarily targets `main` so the existing workflow can witness the exact research head without:

```text
workflow mutation
manual workflow duplication
new fifth workflow
Ready-for-review browser escalation
merge
promotion
deployment
```

## Custody law

The temporary PR base is witness routing only.

It does not change the scientific parentage of this chamber:

```text
scientific parent = #699 receipt/documentation head
```

It does not authorize #699 or #700 to merge.

It does not convert all #699 diff content into a new #700 scientific claim.

After the exact-head static witness settles, #700 must return to its stacked base before any later evidentiary receipt commit is authored.

Required anti-equivalences:

```text
temporary main-base witness routing != mainline promotion
CI visibility != merge authority
full diff visibility != new claim scope
exact-head static witness != browser witness
exact-head static witness != production witness
```

A16 remains held.

Production and Vercel authority remain absent.

𝌋

Sealed ⟐
