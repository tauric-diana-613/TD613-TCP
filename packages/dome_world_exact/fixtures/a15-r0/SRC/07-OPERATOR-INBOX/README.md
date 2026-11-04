# 𝌋 SRC · Operator file-drop inbox (Sync V2)

**New dedicated sync issue:** #1675 · **Parent:** #1674 · **Historical:** #758 (Zenodo-only).

**This is a LOCAL file-drop folder.** Copy new permitted source documents here using Windows File Explorer. This folder's `.gitignore` prevents Git from staging the dropped data. The README and `.gitignore` are the only intended tracked files. Do **not** use GitHub's browser Upload files control here for private material: GitHub storage is not the operator-local vault.

## One authorized sync

Ask your locally connected AI collaborator:

> Sync the newly dropped files in the SRC Atelier inbox under issue #1675, using the TD613 Sync V2 local engine. Use a new operator gesture ID; keep exact originals and the SQLite index in my operator-local out-of-repo custody; verify every source hash and a real text query. Return the sanitized receipt. No publishing or merging.

The collaborating agent must execute on the Windows machine where the files actually exist. The CLI cannot access files merely because GitHub issue #1675 is open.

CLI from repository root (PowerShell, replace the vault path and gesture with an explicit one-run local value):

```powershell
python -B scripts/atelier-operator-inbox-sync-v2.py sync --estate SRC --issue 1675 --vault 'C:\TD613-LOCAL-CUSTODY\atelier-inbox-v2' --gesture 'operator-approved-SRC-20261104-example1' --operator-approved-this-run
python -B scripts/atelier-operator-inbox-sync-v2.py query --estate SRC --vault 'C:\TD613-LOCAL-CUSTODY\atelier-inbox-v2' --phrase 'research'
python -B scripts/atelier-operator-inbox-sync-v2.py verify --estate SRC --vault 'C:\TD613-LOCAL-CUSTODY\atelier-inbox-v2'
```

The vault path is illustrative, **not** proof that the folder exists. Choose an actually writable, operator-controlled absolute path outside any Git repo. The `--operator-approved-this-run` flag records a collaborator's attestation; it is not cryptographic verification of the human's identity. Reusing the same gesture is refused. A new authorization is required for each subsequent run.

Text, Markdown, CSV, HTML, JSON and supported DOCX files can become searchable derivatives. PDF extraction requires local `pypdf`; encrypted or unextractable PDFs and media/ZIP files are preserved as original bytes with an explicit non-searchable status, never invented body text. No automatic cloud embedding, GitHub raw body upload, public provider discovery, scientific promotion or protected Experiment B action is performed.

Zenodo/DOI, Academia, Medium and Substack sources require independently verified provider adapters. Local files do not automatically become SignalRupture works or sealed SRC canon.

**Preserve the original source.** A local upload creates a new operator-local source observation, not a settled claim about author, provider, first publication, copyright permission or experiment admission. Remove or archive source files from this inbox only by a separate deliberate operator action after checking the private vault receipt.

𝄐 Tauric Diana · Khona‌lit-po · Human custody reserved ⟐
