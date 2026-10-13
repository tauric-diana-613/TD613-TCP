TD613 Safe Harbor — membrane / sequence / bypass fix v4

Changes:
- Fixed ingress sequence rendering so only the active unresolved question is visible while the membrane is sealed.
- Fixed hidden-card bug: cards 2 and 3 now unhide when unlocked instead of staying permanently hidden from raw HTML defaults.
- Added body.vault-open toggle alongside membrane hidden state for more reliable dissolve behavior.
- Added session-local operator token setup and clear controls in the UI.
- Operator bypass now works without dev-console injection by storing a local token hash in sessionStorage.
- Updated README to reflect session-local bypass setup.
