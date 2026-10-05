# DOCUMENT RENDERING ENGINE BUFFER SPECIFICATION (REF-DOC-112)

## 1. Buffer States & Operating Definitions
- `BUFFER_CLEAN_DISPLAYED`: The document text is currently rendered on screen; no edits are pending; disk copy matches memory copy.
- `BUFFER_CACHED_IDLE`: The document text is preserved in memory cache while the window is minimized; no edits are pending; disk copy matches memory copy.

## 2. Action-Permission Support Matrix
| Action | `BUFFER_CLEAN_DISPLAYED` | `BUFFER_CACHED_IDLE` |
| :--- | :--- | :--- |
| `read_buffer_text` | PERMITTED (200) | PERMITTED (200) |
| `search_regex` | PERMITTED (200) | PERMITTED (200) |
| `render_thumbnail` | PERMITTED (200) | PERMITTED (200) |
| `append_text` | PERMITTED (200) | PERMITTED (200) |
| `discard_buffer` | PERMITTED (200) | PERMITTED (200) |
| `dispatch_socket_egress` | REFUSED (403) | REFUSED (403) |
| `modify_system_kernel` | REFUSED (403) | REFUSED (403) |

## 3. Proposed Optimization
Proposal: Merge `BUFFER_CLEAN_DISPLAYED` and `BUFFER_CACHED_IDLE` into a single operating state: `BUFFER_PERSISTENT_STATIC`.

## 4. Evaluation Questions
1. Compare the action-permission supports of `BUFFER_CLEAN_DISPLAYED` and `BUFFER_CACHED_IDLE`. What is their symmetric difference?
2. Does merging these two states create any unauthorized capability leakage or revoke any permitted operation?
3. Should this proposed state aggregation be accepted or rejected, and why?