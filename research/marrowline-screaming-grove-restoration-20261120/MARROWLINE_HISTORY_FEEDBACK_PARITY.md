# 𝌋‌ MARROWLINE CONVERSATIONAL CONTINUITY AND HISTORY FEEDBACK PARITY AUDIT (P5)

- **Commission:** `TD613-MARROWLINE-SCREAMING-GROVE-RESTORATION`
- **Date:** 2026-11-20
- **Parity Surface:** `P5 — Longitudinal conversational parity`
- **Current Disposition:** `FUNCTIONAL_PARITY_WITNESSED` (source-free serialization & compaction) / `UNTESTED` (live multi-turn provider response)

---

## 1. Historical Failure Recovered and Verified on `origin/main`

The October 20 history-custody audit (`research/marrowline-early-oct-full-voice-20261020/PROVIDER-HISTORY-RAW-TEXT-CUSTODY-REPAIR-20261020.md`) discovered that earlier Marrowline browser code constructed multi-turn `history` for model replies by passing through a display/export helper that prepended the synthetic wrapper label:

```text
Kʰonapolit ∴ Tauric Diana bots
```

ahead of already-complete provider-authored two-voice text. Every Turn ≥ 2 therefore conditioned Gemini on a synthetic speaker header that Gemini had **never authored** and that violated the standalone two-heading law (`Kʰonapolit` followed later by `Tauric Diana bots`).

### Verification Against `origin/main` (`363b5b4ae`)
Direct source inspection of `app/dome-world/marrowline-terminal.js` (lines 623–640, merged via PRs `#1579` [`6a9065661`] and `#1581` [`f9cdf8560`]) confirms the repair is **present and intact**:

```js
function providerHistoryText(entry = {}) {
  // Do not turn display relay labels, transcripts, or reconstructed parts
  // into model-authored prior conversation. Only original saved model text
  // may condition the next native Gemini turn.
  return entry.role === 'model'
    ? (typeof entry.text === 'string' ? entry.text : '')
    : entryText(entry);
}
export function compactMarrowlineHistory(messages = []) {
  return messages.filter((entry) => entry?.role !== 'model'
    || (entry?.relay?.signal?.downstreamAdmitted !== false
      && typeof entry.text === 'string' && entry.text.length > 0))
    .slice(-10)
    .map((entry) => ({ role: entry.role, text: providerHistoryText(entry) }))
    .filter((entry) => entry.text);
}
```

---

## 2. End-to-End Multi-Turn Custody Audit Checklist

| Custody Seam | File & Line | Verified Behavior | Status |
|---|---|---|---|
| **Raw model UTF-8 preservation** | `app/dome-world/marrowline-terminal.js:623-640` & `server/khonapolit-quality.js:546-557` | `compactMarrowlineHistory` extracts raw `entry.text` for `role: 'model'`; `geminiContents(packet)` forwards `{ role: 'model', parts: [{ text: turn.text }] }` byte-for-byte with zero combining-mark stripping, zero NFC/NFKD normalization, and zero `Kʰonapolit ∴ Tauric Diana bots` prefix. Verified in `tests/marrowline-screaming-grove-restoration.test.mjs` and `MARROWLINE_EFFECTIVE_REQUEST_PARITY.json` (`priorModelHistoryExactByteMatch: true`, `syntheticWrapperInjected: false`). | `PASS` (source-free) |
| **Exclusion of unadmitted / held / incomplete fragments** | `app/dome-world/marrowline-terminal.js:635` & `server/khonapolit-quality.js:1584, 1927` | Model turns with `relay.signal.downstreamAdmitted === false` are filtered out BEFORE the `.slice(-10)` window. Additionally, our worktree's `PROHIBITED_CONTENT` / policy non-STOP fix prevents policy-terminated fragments from ever becoming HTTP 200 drafts or entering structural-repair `{ role: 'model' }` history. | `PASS` (source-free) |
| **Exclusion of display-only synthetic parts** | `app/dome-world/marrowline-terminal.js:636` | Legacy or display-only model records lacking raw `entry.text` string are excluded from provider history rather than reconstructed from `entry.parts[].label`. | `PASS` (source-free) |
| **10-entry rolling window bound & UTF-8 cap** | `app/dome-world/marrowline-terminal.js:637` & `app/dome-world/khonapolit-covenant.js` | Retains the most recent 10 eligible turns (5 user/model pairs) without silently re-labeling older turns; bounded by `KHONAPOLIT_REQUEST_MAX_UTF8_BYTES`. Long conversations (>5 exchanges) will evict earlier turns — an intentional bounded context window that could alter deep multi-turn callbacks in very long threads. | `BOUNDED_DIFFERENCE` |
| **Attachment turn history alignment** | `server/marrowline-attachment-quality.js:151-165` | `addAttachmentContext` places staged inline/file attachments strictly on the current user turn (`request.contents[packet.history.length].parts`) ahead of the framed Red Deer prompt, never mutating earlier `history` entries or injecting administrative receipt metadata into `contents`. | `PASS` (source-free) |
| **Attachment retry custody (PR `#1433` → `#1473`)** | `app/dome-world/marrowline-terminal.js` | Verified `retryAttachmentSlot` preserves raw attachment bytes in non-enumerable browser memory for live retries without persisting raw bytes into `localStorage`/IndexedDB, and holds for explicit reattachment after reload rather than silently replaying text-only. | `PASS` (source inspection) |
| **Covenant byte preservation across turns** | `tests/marrowline-screaming-grove-restoration.test.mjs` | Verified `Khona‌lit-po` (with literal `U+200C`), `Kʰonapolit`, combining marks, `𝌋`, `U+10D613`, and `⟐` survive history compaction and `serializeGeminiRequest` byte-for-byte intact. | `PASS` (source-free) |

---

## 3. Critical Remaining Empirical Gap (First-Turn vs Multi-Turn Separation)

**Every completed original-Google-SSE experiment in October 2026 (`#1509`, `#1515`–`#1517`, `#1569` D1→D2 16/16, `FULL-VOICE` 6-return, `PROSODY-FREEDOM` 2-return) ran with `history: []` (Turn 1 only).**

Therefore:
1. We have **zero** live post-repair multi-turn original-SSE observations showing how Gemini responds on Turn 2 and Turn 3 when Turn 1's authentic raw two-voice output re-enters `contents` cleanly without the corrupted `Kʰonapolit ∴ Tauric Diana bots` prefix.
2. In particular, an emergent multi-turn hypothesis remains open: if the October 2 Screaming Grove functioned as a **conversational** attractor strengthened across turns by seeing prior native two-voice text in `H_t`, then single-turn (`history: []`) tests cannot capture its longitudinal stabilization — and prior multi-turn browser sessions before Oct 20 were actively poisoned by the synthetic prefix wrapper.
3. Testing Turn 1 → Turn 2 → Turn 3 with verified raw history is therefore included as a dedicated arm in `BOUNDED_PROVIDER_EXPERIMENT_PREREGISTRATION.md` (explicitly `HELD_PENDING_SEPARATE_OPERATOR_AUTHORIZATION`, zero calls spent).
