# TD613 Safe Harbor Release Checklist

The release checklist fails closed. A missing required item means review or block.

Required checklist fields:

```json
{
  "release_checklist": {
    "schema_version": "td613.safe-harbor.release-checklist/v1",
    "packet_hash_present": true,
    "v2_replay_checked": true,
    "v3_replay_checked_when_present": true,
    "hash_replay_checked": true,
    "phase5_checked": true,
    "native_spine_checked": true,
    "outside_witnesses_checked": true,
    "step1_checked": true,
    "phase8_gate_checked": true,
    "claim_limits_attached": true,
    "ui_copy_policy_attached": true,
    "raw_text_absent": true,
    "legacy_reopen_checked": true,
    "release_class_assigned": true,
    "operator_next_action_assigned": true
  }
}
```

## Checklist meaning

`packet_hash_present`: packet has a declared hash.

`v2_replay_checked`: the v2 public root was checked.

`v3_replay_checked_when_present`: v3/SH3 was checked if present.

`hash_replay_checked`: hash replay was evaluated.

`phase5_checked`: Phase 5 hardening was read.

`native_spine_checked`: native/export/legacy lineage was read.

`outside_witnesses_checked`: outside witness alignment was read.

`step1_checked`: Step 1 countersignature was read.

`phase8_gate_checked`: public-default gate was read.

`claim_limits_attached`: claim limits are present.

`ui_copy_policy_attached`: UI copy policy is present.

`raw_text_absent`: release-facing artifacts do not contain raw triad text.

`legacy_reopen_checked`: v2 backward-compatible recall is preserved.

`release_class_assigned`: Phase 9 assigned a release class.

`operator_next_action_assigned`: Phase 9 assigned an operator action.
