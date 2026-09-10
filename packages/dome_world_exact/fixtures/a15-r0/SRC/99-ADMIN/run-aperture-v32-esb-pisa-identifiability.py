#!/usr/bin/env python3
"""TD613-authored Aperture v3.2 calibration over the source-witnessed ESB PISA marginals.

The SR source supplies the marginals and the non-identification boundary. The
8-cell exposure geometry, candidate observation families, conditioning audit,
and claim-conditioned stopping rules are TD613 calibration constructs.
"""

import itertools
import json
import math

STATES = list(itertools.product([0, 1], [0, 1], [0, 1]))  # D, B, F


def row(predicate):
    return [1.0 if predicate(state) else 0.0 for state in STATES]


def transpose(matrix):
    return [list(col) for col in zip(*matrix)]


def matmul(a, b):
    bt = transpose(b)
    return [[sum(x * y for x, y in zip(r, c)) for c in bt] for r in a]


def rank(matrix, tol=1e-10):
    work = [list(map(float, r)) for r in matrix]
    rows = len(work)
    cols = len(work[0]) if rows else 0
    pivot_row = 0

    for col in range(cols):
        if pivot_row >= rows:
            break
        pivot = max(range(pivot_row, rows), key=lambda i: abs(work[i][col]))
        if abs(work[pivot][col]) <= tol:
            continue
        work[pivot_row], work[pivot] = work[pivot], work[pivot_row]
        value = work[pivot_row][col]
        work[pivot_row] = [x / value for x in work[pivot_row]]
        for i in range(rows):
            if i == pivot_row:
                continue
            factor = work[i][col]
            if abs(factor) > tol:
                work[i] = [a - factor * b for a, b in zip(work[i], work[pivot_row])]
        pivot_row += 1

    return pivot_row


def jacobi_eigvals_sym(matrix, tol=1e-13, max_iter=10000):
    work = [r[:] for r in matrix]
    n = len(work)

    for _ in range(max_iter):
        p = q = -1
        max_offdiag = 0.0
        for i in range(n):
            for j in range(i + 1, n):
                value = abs(work[i][j])
                if value > max_offdiag:
                    max_offdiag = value
                    p, q = i, j
        if max_offdiag < tol:
            break

        app, aqq, apq = work[p][p], work[q][q], work[p][q]
        phi = 0.5 * math.atan2(2 * apq, aqq - app)
        c = math.cos(phi)
        s = math.sin(phi)

        for k in range(n):
            if k in (p, q):
                continue
            aik, akq = work[k][p], work[k][q]
            work[k][p] = work[p][k] = c * aik - s * akq
            work[k][q] = work[q][k] = s * aik + c * akq

        work[p][p] = c * c * app - 2 * s * c * apq + s * s * aqq
        work[q][q] = s * s * app + 2 * s * c * apq + c * c * aqq
        work[p][q] = work[q][p] = 0.0

    return sorted((work[i][i] for i in range(n)), reverse=True)


def singular_values(matrix):
    gram = matmul(transpose(matrix), matrix)
    eigenvalues = jacobi_eigvals_sym(gram)
    return [math.sqrt(max(0.0, value)) for value in eigenvalues]


def metrics(matrix, latent_dimension=8):
    current_rank = rank(matrix)
    svals = singular_values(matrix)
    positive = [value for value in svals if value > 1e-10]
    sigma_min = min(positive) if current_rank == latent_dimension else 0.0
    condition = (
        max(positive) / min(positive)
        if current_rank == latent_dimension
        else math.inf
    )
    return {
        "rank": current_rank,
        "nullity": latent_dimension - current_rank,
        "sigma_min": sigma_min,
        "condition_number": "Infinity" if not math.isfinite(condition) else condition,
        "singular_values": svals,
    }


def claim_identifiable(observation_matrix, claim_row):
    """A linear claim is identifiable iff adding its row does not increase row rank."""
    return rank(observation_matrix) == rank(observation_matrix + [list(claim_row)])


NORMALIZATION = [1.0] * 8
D = row(lambda s: s[0] == 1)
B = row(lambda s: s[1] == 1)
F = row(lambda s: s[2] == 1)
DB = row(lambda s: s[0] == 1 and s[1] == 1)
DF = row(lambda s: s[0] == 1 and s[2] == 1)
BF = row(lambda s: s[1] == 1 and s[2] == 1)
DBF = row(lambda s: all(s))
UNION = row(lambda s: any(s))
IDENTITY = [[1.0 if i == j else 0.0 for j in range(8)] for i in range(8)]

H0 = [NORMALIZATION, D, B, F]
H_ONE_PAIR = H0 + [DB]
H_ALL_PAIRS = H0 + [DB, DF, BF]
H_MOMENTS_FULL = H_ALL_PAIRS + [DBF]
H_UNION = H0 + [UNION]

SIGMA_FLOOR = 0.25
CONDITION_CEILING = 10.0


def v32_fixture_classification(result):
    if result["rank"] < 8:
        return ["STRUCTURAL_RANK_DEFICIT", "PROPOSE"]
    condition = float(result["condition_number"])
    if result["sigma_min"] < SIGMA_FLOOR or condition > CONDITION_CEILING:
        return ["NUMERICAL_STABILITY_DEFICIT", "PROPOSE"]
    return ["NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT", "ASK_NOTHING"]


def run():
    families = {
        "MARGINALS_ONLY": H0,
        "PLUS_ONE_PAIRWISE": H_ONE_PAIR,
        "PLUS_ALL_PAIRWISE": H_ALL_PAIRS,
        "PLUS_ALL_PAIRWISE_AND_TRIPLE": H_MOMENTS_FULL,
        "DIRECT_JOINT_CELL_TABLE": IDENTITY,
    }
    results = {name: metrics(matrix) for name, matrix in families.items()}
    results["MARGINALS_ONLY"]["union_claim_identifiable"] = claim_identifiable(H0, UNION)
    results["MARGINALS_PLUS_DIRECT_UNION"] = {
        "rank": rank(H_UNION),
        "nullity": 8 - rank(H_UNION),
        "union_claim_identifiable": claim_identifiable(H_UNION, UNION),
    }

    for name in families:
        results[name]["v32_fixture_classification"] = v32_fixture_classification(results[name])

    return {
        "schema": "td613.aperture.v32-esb-pisa-joint-exposure-calibration/v0.1",
        "latent_state_order": ["000", "001", "010", "011", "100", "101", "110", "111"],
        "source_marginals": {"digital_distraction": 0.30, "bullying": 0.20, "food_insecurity": 0.08},
        "source_frechet_union_bounds": [0.30, 0.58],
        "local_thresholds": {
            "sigma_min_floor": SIGMA_FLOOR,
            "condition_number_ceiling": CONDITION_CEILING,
            "authority": "FIXTURE_DECLARED_LOCAL",
        },
        "families": results,
        "claim_conditioned_stop": {
            "exact_union_from_marginals_only": "NOT_IDENTIFIABLE",
            "exact_union_after_direct_union_observation": "IDENTIFIABLE_WHILE_FULL_JOINT_REMAINS_UNDERDETERMINED",
            "full_joint_from_all_pairwise_without_triple": "NOT_IDENTIFIABLE",
            "full_joint_after_triple": "FULL_RANK_BUT_LOCALLY_FRAGILE",
            "full_joint_direct_cell_table": "IDENTIFIABLE_AND_STABLE_UNDER_FIXTURE",
        },
        "claim_ceiling": [
            "TD613-authored calibration geometry",
            "not SR empirical validation",
            "not proof direct joint-table measurement is feasible or noiseless",
        ],
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2, sort_keys=True, allow_nan=False))
