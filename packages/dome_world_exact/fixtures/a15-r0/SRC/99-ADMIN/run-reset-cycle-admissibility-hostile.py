#!/usr/bin/env python3
"""Deterministic synthetic interoperability witness.

This script does not read SignalRupture claims into TD613 admissibility supports.
It only executes the abstract PRE/POST quotient fixture documented in
RESET_CYCLE_ADMISSIBILITY_DESCENT_HOSTILE.md.

No network. No writes. Standard library only.
"""

from __future__ import annotations

import json


Z = {"COMMON", "PRE_ONLY", "POST_ONLY", "NEITHER"}
K_PRE = {"COMMON", "PRE_ONLY"}
K_POST = {"COMMON", "POST_ONLY"}


def sorted_list(values: set[str]) -> list[str]:
    return sorted(values)


def main() -> None:
    U = K_PRE | K_POST
    I = K_PRE & K_POST
    gamma = U - I
    none = Z - U

    assert U == {"COMMON", "PRE_ONLY", "POST_ONLY"}
    assert I == {"COMMON"}
    assert gamma == {"PRE_ONLY", "POST_ONLY"}
    assert none == {"NEITHER"}
    assert len(gamma) == 2

    # Exact finite-descent control: supports differ on the collapsed fiber.
    exact_descent = K_PRE == K_POST
    assert exact_descent is False

    # Child-legible authority partition inherited from the existing TD613 theorem.
    authority = {
        "ALL": sorted_list(I),
        "DEPENDENT": sorted_list(gamma),
        "NONE": sorted_list(none),
    }

    # Zero-false-universal-claim safe presentation must abstain on every gap value.
    minimum_safe_abstention = gamma
    assert minimum_safe_abstention == {"PRE_ONLY", "POST_ONLY"}

    result = {
        "schema_version": "src-reset-cycle-admissibility-hostile/v1",
        "fixture_status": "SYNTHETIC_INTEROPERABILITY_FIXTURE",
        "source_claim_imported": False,
        "state_space": ["PRE", "POST"],
        "quotient": {"PRE": "STAGE", "POST": "STAGE"},
        "claim_universe": sorted_list(Z),
        "supports": {
            "PRE": sorted_list(K_PRE),
            "POST": sorted_list(K_POST),
        },
        "U_STAGE": sorted_list(U),
        "I_STAGE": sorted_list(I),
        "Gamma_STAGE": sorted_list(gamma),
        "Gamma_cardinality": len(gamma),
        "exact_descent": exact_descent,
        "authority_partition": authority,
        "minimum_safe_abstention_surface": sorted_list(minimum_safe_abstention),
        "classification": [
            "ERASING_GENERATION_CAN_CREATE_A_NONEMPTY_ADMISSIBILITY_GAP_WHEN_PRE_AND_POST_SUPPORTS_DIFFER",
            "SAME_STAGE_LABEL_DOES_NOT_IMPLY_SAME_LAWFUL_SUPPORT",
            "COARSE_CYCLE_LEGIBILITY_DOES_NOT_IMPLY_EXACT_DESCENDED_CLAIM_AUTHORITY",
        ],
        "non_claims": [
            "SIGNALRUPTURE_HAS_TD613_ADMISSIBILITY_SUPPORTS",
            "SIGNALRUPTURE_FADT_CONFIRMED",
            "SIGNALRUPTURE_HOLONOMY_CONFIRMED",
            "PHYSICAL_TOMOGRAPHY",
            "PHYSICAL_PHASON_OR_QUASICRYSTAL_CLAIM",
        ],
    }

    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
