#!/usr/bin/env python3
"""Bounded TD613 Aperture v3.2 × DCF calibration replay.

This is a post-seal TD613-authored fixture. It does not alter the sealed SRC kiln,
claim an SR empirical result, or promote global Aperture replay stability.
"""

import argparse
import json
import math

VERSION = "v3.2-alpha"


def classify(inp):
    """Mirror the uploaded v3.2 typed-deficit branch logic for this fixture."""
    uncertainty = str(inp.get("uncertainty_status", "")).upper()
    if uncertainty in ("", "UNDECLARED"):
        return ("UNDECLARED_OPERATOR_GEOMETRY", "ABSTAIN")

    latent = int(inp["latent_dimension"])
    rank = int(inp["current_rank"])
    sigma = float(inp["sigma_min"])
    condition = float(inp["condition_number"])
    floor = float(inp["sigma_min_floor"])
    ceiling = float(inp["condition_number_ceiling"])

    if not all(math.isfinite(x) for x in (sigma, condition, floor, ceiling)):
        return ("INVALID_DECLARED_OPERATOR_STATE", "REJECT")
    if (
        latent < 1
        or rank < 0
        or rank > latent
        or sigma < 0
        or condition < 1
        or floor < 0
        or ceiling < 1
    ):
        return ("INVALID_DECLARED_OPERATOR_STATE", "REJECT")
    if uncertainty == "INVALID":
        return ("INVALID_NOISE_GEOMETRY", "REJECT")
    if uncertainty == "INCOMPLETE" or uncertainty != "VALID_DECLARED":
        return ("NOISE_GEOMETRY_INCOMPLETE", "ABSTAIN")
    if rank < latent:
        return ("STRUCTURAL_RANK_DEFICIT", "PROPOSE")
    if sigma < floor or condition > ceiling:
        return ("NUMERICAL_STABILITY_DEFICIT", "PROPOSE")
    return ("NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT", "ASK_NOTHING")


def metrics(rows, latent_dimension):
    """Return rank, smallest singular value, and mathematical condition number.

    The fixture only needs latent dimensions one or two and uses a standard-library
    eigendecomposition of H^T H for the two-dimensional case.
    """
    if latent_dimension == 1:
        energy = sum(float(row[0]) ** 2 for row in rows)
        sigma = math.sqrt(energy)
        rank = 1 if sigma > 1e-12 else 0
        condition = 1.0 if rank else math.inf
        return rank, sigma, condition

    if latent_dimension != 2:
        raise ValueError("fixture supports latent dimension 1 or 2")

    a = sum(float(row[0]) ** 2 for row in rows)
    b = sum(float(row[0]) * float(row[1]) for row in rows)
    c = sum(float(row[1]) ** 2 for row in rows)
    discriminant = math.sqrt(max(0.0, (a - c) ** 2 + 4 * b * b))
    lambda_1 = (a + c + discriminant) / 2
    lambda_2 = (a + c - discriminant) / 2
    sigma_1 = math.sqrt(max(0.0, lambda_1))
    sigma_2 = math.sqrt(max(0.0, lambda_2))
    rank = int(sigma_1 > 1e-12) + int(sigma_2 > 1e-12)
    condition = sigma_1 / sigma_2 if sigma_2 > 1e-12 else math.inf
    return rank, sigma_2 if rank == 2 else 0.0, condition


def runtime_input(rows, latent_dimension, floor, ceiling, uncertainty="VALID_DECLARED"):
    rank, sigma_min, mathematical_condition = metrics(rows, latent_dimension)

    # Current v3.2 requires a finite condition_number before the rank branch.
    # Its own rank-deficit self-test uses 2000 as a finite placeholder. We mirror
    # that encoding only to exercise the branch while separately preserving the
    # mathematical condition number as Infinity.
    runtime_condition = 2000.0 if not math.isfinite(mathematical_condition) else mathematical_condition

    return {
        "latent_dimension": latent_dimension,
        "current_rank": rank,
        "sigma_min": sigma_min,
        "condition_number": runtime_condition,
        "mathematical_condition_number": (
            "Infinity" if not math.isfinite(mathematical_condition) else mathematical_condition
        ),
        "uncertainty_status": uncertainty,
        "sigma_min_floor": floor,
        "condition_number_ceiling": ceiling,
    }


def run():
    base_floor = 0.25
    base_ceiling = 10.0

    cases = {
        "A_LEVEL_CLAIM_LEVEL_SENSOR": runtime_input([[1]], 1, base_floor, base_ceiling),
        "B_LEVEL_DRIFT_CLAIM_LEVEL_ONLY": runtime_input([[1, 0]], 2, base_floor, base_ceiling),
        "C_LEVEL_DRIFT_NEAR_REDUNDANT": runtime_input(
            [[1, 0], [1, 0.001]], 2, base_floor, base_ceiling
        ),
        "D_LEVEL_DRIFT_INDEPENDENT": runtime_input(
            [[1, 0], [0, 1]], 2, base_floor, base_ceiling
        ),
    }

    case_results = {
        name: {"input": payload, "classification": classify(payload)}
        for name, payload in cases.items()
    }

    floors = [0.125, 0.25, 0.5]
    ceilings = [5.0, 10.0, 20.0]
    epsilons = [0.0005, 0.001, 0.002]
    replay = []

    for floor in floors:
        for ceiling in ceilings:
            a = runtime_input([[1]], 1, floor, ceiling)
            b = runtime_input([[1, 0]], 2, floor, ceiling)
            d = runtime_input([[1, 0], [0, 1]], 2, floor, ceiling)
            replay.extend(
                [
                    {"family": "A", "floor": floor, "ceiling": ceiling, "classification": classify(a)},
                    {"family": "B", "floor": floor, "ceiling": ceiling, "classification": classify(b)},
                    {"family": "D", "floor": floor, "ceiling": ceiling, "classification": classify(d)},
                ]
            )

            for epsilon in epsilons:
                c = runtime_input([[1, 0], [1, epsilon]], 2, floor, ceiling)
                replay.append(
                    {
                        "family": "C",
                        "floor": floor,
                        "ceiling": ceiling,
                        "epsilon": epsilon,
                        "sigma_min": c["sigma_min"],
                        "condition_number": c["condition_number"],
                        "classification": classify(c),
                    }
                )

    expected = {
        "A": ("NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT", "ASK_NOTHING"),
        "B": ("STRUCTURAL_RANK_DEFICIT", "PROPOSE"),
        "C": ("NUMERICAL_STABILITY_DEFICIT", "PROPOSE"),
        "D": ("NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT", "ASK_NOTHING"),
    }

    stable = {
        family: all(tuple(row["classification"]) == expected[family] for row in replay if row["family"] == family)
        for family in expected
    }

    uncertainty_probe = []
    for status in ["VALID_DECLARED", "INCOMPLETE", "INVALID", "UNDECLARED"]:
        payload = runtime_input([[1, 0], [0, 1]], 2, base_floor, base_ceiling, status)
        uncertainty_probe.append(
            {"uncertainty_status": status, "classification": classify(payload)}
        )

    return {
        "schema": "td613.aperture.v32-dcf-claim-conditioned-calibration-replay/v0.1",
        "version": VERSION,
        "cases": case_results,
        "replay_grid": {
            "floors": floors,
            "ceilings": ceilings,
            "epsilons": epsilons,
            "n": len(replay),
        },
        "family_stability": stable,
        "all_fixture_families_stable": all(stable.values()),
        "uncertainty_posture_probe": uncertainty_probe,
        "classification_replay_stability": (
            "WITNESSED_FOR_THIS_PREDECLARED_FIXTURE_ONLY"
            if all(stable.values())
            else "NOT_WITNESSED"
        ),
        "global_aperture_classification_replay_stability": "HELD_NOT_YET_WITNESSED",
        "rank_deficit_condition_encoding_caveat": (
            "mathematical condition is Infinity; runtime-compatible finite sentinel 2000 "
            "is used only to reach the rank branch"
        ),
        "claim_ceiling": [
            "fixture-only",
            "not SR empirical validation",
            "not universal threshold validation",
        ],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pretty", action="store_true")
    args = parser.parse_args()
    print(json.dumps(run(), indent=2 if args.pretty else None, sort_keys=True))


if __name__ == "__main__":
    main()
