# ACCESS MANAGEMENT & SESSION PERMISSION SPECIFICATION (REF-IAM-202)

## 1. Operating States & Permission Support Sets
| State Identifier | Action-Permission Support Set | Egress Capability |
| :--- | :--- | :--- |
| `SESSION_READ_TIER` | `{read_document, search_metadata, export_watermarked_pdf}` | Local download only |
| `SESSION_ADMIN_TIER` | `{read_document, search_metadata, export_watermarked_pdf, export_raw_database, rotate_api_keys}` | Outbound network export |

## 2. System Modification Proposal
An engineering optimization ticket (RFC-409) proposes:
"To reduce memory footprint in the authentication daemon, consolidate `SESSION_READ_TIER` and `SESSION_ADMIN_TIER` into a single unified session object `SESSION_ACTIVE` that manages all authenticated users."

## 3. Evaluation Questions
1. Compute the support difference between `SESSION_READ_TIER` and `SESSION_ADMIN_TIER`.
2. Does the proposed collapse preserve existing security boundaries, or does it alter system behavior?
3. Identify the specific security consequence if unprivileged sessions are mapped to the consolidated state without maintaining separate permission gating.