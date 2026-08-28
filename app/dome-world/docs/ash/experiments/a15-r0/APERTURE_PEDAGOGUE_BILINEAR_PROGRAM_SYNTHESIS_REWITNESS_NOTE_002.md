𝌋

# Bilinear Program Synthesis Re-Witness Note 002

**PR:** #706  
**Scientific parent:** #705 receipt `da115526bdf2932dd0cacc93fc2b5efd879b6b8d`  
**Status:** WITNESS ROUTING / ANTI-RETROACTIVITY

Run 2060 at witnessed head

```text
d8bca72e17ac5003a7d7fb99344ed90fefe2af02
```

passed the prerepair bilinear-program implementation. It remains a valid historical witness of that earlier head only.

A later pre-witness architecture audit found that `programSelector()` traversed `synthesizeProgram()`, which computed synthetic responses using frozen hidden operator `T` even though the selector's score did not consume those responses. That dependency violated the chamber's H6 oracle-isolation membrane.

The repair separated geometry-only program analysis from fixture response execution and requires the declared current null direction explicitly at the selector boundary.

```text
repair_commit = 0dc43a4776db87a2e47ef291c5a91774f5e54f59
hardened_test_commit = e7dc0318ffe90b0329d5285d8452bf52ebdecfdd
```

Therefore:

```text
run_2060_success != witness_of_repaired_selector_architecture
later_repair != retroactive_reclassification_of_run_2060
```

#706 is temporarily based on locked `main` solely to admit one exact-head consolidated static re-witness of the repaired architecture.

```text
temporary base = main @ 4ca8c0600b40d0ea2b38c1e0dd0b2d1e77713aef
scientific parent = #705 receipt @ da115526bdf2932dd0cacc93fc2b5efd879b6b8d
workflow mutation = false
manual rerun = false
browser/full-repository/self-hosted escalation = false
merge/promotion/A16/production/Vercel authority = false
```

After the re-witness settles, restore #706 to #705 and amend the receipt without deleting run 2060 from history.

𝌋

Sealed ⟐
