# 𝌋 Private Operator Decisions (local only)

The human operator may place a personally completed §td613.rulefield.operator-decision/v1§ JSON attestation here after reading the complete content-bound dossier. This directory's contents are ignored by Git except this README and .gitignore.

A human may instead authorize in an actual connected conversation, specifying the dossier digest, selected proposals and staged-only scope. Neither a filename, a copied signature nor a passed schema test authenticates authorship. The CLI §decision-check§ validates syntax and hash bindings only. It never authorizes canonical integration or runs candidate synthesis.

Use §node scripts/rulefield-operator.mjs decision-template <dossier_stem>§ to obtain **an unsigned blank JSON form**; the human must explicitly supply the decision content through a channel that actually verifies authorization.

**Do not store private names, secrets or protected experiment sources in public Git.**