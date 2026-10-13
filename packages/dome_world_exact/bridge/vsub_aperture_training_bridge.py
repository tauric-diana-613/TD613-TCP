#!/usr/bin/env python3
"""
vsub_aperture_training_bridge.py
--------------------------------
Concrete seam from Ace's verified VECTOR-SUBSTRATE TRAINING ALGOS into the v0.4.2b
Aperture->Flow-Core bridge. It replaces the bridge's float heuristics
(normalizeApertureMetrics -> projection_shift/gluing_obstruction = hand-set floats)
with the substrate's EXACT, MEASURED quantities, and it adds the one thing Aperture
and Dome-World do not have: a learning step.

What it demonstrates (all exact over Q, no float in any decision):

  1. The trace-form Gram  G = (Tr(theta^{i+j}))  of a number field K = Q(theta),
     with det G = disc(f)  (paper Thm 2.13; verified node: probe_vs::test_det_gram_is_discriminant).

  2. The residual learner's CAPTURE test:  an Aperture-scanned artifact is encoded as an
     exact observation v in K; capture  <=>  ||r||^2_G = 0  <=>  v in col(B), the current
     "forced basis" (the admissible custody/knowledge subspace). This is Aperture's
     'projection-residual' capability, made exact.
     (verified: training::test_a_captured_input_zero_residual_no_proposal)

  3. The field-growing step: a persistently out-of-field artifact triggers EXACTLY ONE
     growth of B; the residual then returns to 0 (admitted by construction).
     (verified: training::test_b_persistent_offaxis_exactly_one_growth_after_N)

  4. A COMPUTED grade on Aperture's own lattice
     {FORCED, FORCED_UNDER_CONSTRAINT, CONSTRUCTION, SELECTED, OPEN}
     (apertureV273GradeGateScript) -- replacing the asserted grade with one decided by
     the exact residual + the value-forced/model-forced distinction from the ZFP audit.

Input shape mirrors the v0.4.2b fixture fixtures/aperture_v293_bridge_packet.json.
"""
from __future__ import annotations
import json
import sympy as sp

# ---------------------------------------------------------------- exact field K = Q(theta)
# Paper's worked totally-real field Q(sqrt2+sqrt3): minpoly f = x^4 - 10x^2 + 1.
# Totally real => trace form G is symmetric positive-definite => projection is well posed.
x = sp.symbols('x')
f = x**4 - 10*x**2 + 1
n = sp.degree(f, x)
C = sp.Matrix(sp.Poly(f, x).all_coeffs())  # placeholder; build companion explicitly below

def companion(poly, x):
    c = sp.Poly(poly, x).all_coeffs()         # leading first
    c = [sp.nsimplify(t)/c[0] for t in c]     # monic
    deg = len(c) - 1
    M = sp.zeros(deg)
    for i in range(deg):
        M[i, deg-1] = -c[deg - i]             # last column = -a_i
    for i in range(1, deg):
        M[i, i-1] = 1
    return M

Cm = companion(f, x)
# G_{ij} = Tr(theta^{i+j}) = trace(Cm^{i+j}), i,j = 0..n-1   (exact integers)
powtr = [sp.trace(Cm**k) for k in range(0, 2*n)]
G = sp.Matrix(n, n, lambda i, j: powtr[i + j])
detG = sp.simplify(G.det())
disc_f = sp.discriminant(f, x)

print("=" * 78)
print("  EXACT TRACE-FORM GEOMETRY  K = Q(sqrt2+sqrt3),  f = x^4 - 10x^2 + 1")
print("=" * 78)
print("  trace-form Gram G = (Tr(theta^{i+j})):")
print("   ", str(G).replace("Matrix(", "").replace("])", "]"))
print(f"  det G            = {detG}")
print(f"  disc(f)          = {disc_f}    -> det G == disc(f): {sp.simplify(detG - disc_f) == 0}")
print(f"  G positive-definite (totally real): {all(v > 0 for v in [G[:k,:k].det() for k in range(1, n+1)])}")

# ---------------------------------------------------------------- exact residual learner
def g_residual_sq(v, B):
    """||r||^2_G of v after G-orthogonal projection onto col(B). Exact. 0 <=> v in col(B)."""
    M = (B.T * G * B)
    P = B * M.inv() * (B.T * G)          # G-orthogonal projector onto col(B)
    r = v - P * v
    return sp.simplify((r.T * G * r)[0, 0]), r

def grade_for(captured_in_current, grew, was_choice):
    if captured_in_current:   return "FORCED"               # value-forced: already admissible
    if grew and not was_choice: return "CONSTRUCTION"       # admitted by a forced growth
    if grew and was_choice:   return "SELECTED"             # growth required a choice (policy)
    return "OPEN"                                           # not capturable within capacity

def admit(packet, B):
    """One residual-learner step driven by an Aperture scan packet. Returns (receipt, B')."""
    v = sp.Matrix([sp.nsimplify(c) for c in packet["observation_coords"]])  # exact obs in K
    rsq0, _ = g_residual_sq(v, B)
    captured = (rsq0 == 0)
    grew = False; was_choice = False; B_new = B; rsq1 = rsq0
    if not captured:
        # field-growing step: extend the forced basis by the un-captured direction (exact).
        # (In the engine this is residual->propose->confirm with a capacity/Northcott bound.)
        B_new = B.row_join(v)
        rsq1, _ = g_residual_sq(v, B_new)
        grew = True  # the growth here is determined by the residual, not chosen => CONSTRUCTION
    grade = grade_for(captured, grew, was_choice)
    receipt = {
        "schema": "td613.vsub-aperture.capture/v1",
        "active_lane": packet.get("active_lane"),
        "artifact_id": packet.get("artifact_id"),
        # EXACT replacements for the bridge's hand-set floats:
        "projection_residual_exact": str(rsq0),          # replaces float gluing_obstruction
        "captured": bool(captured),                      # admissibility decided exactly, no threshold
        "field_grew": grew,
        "residual_after_growth": str(rsq1),              # 0 => admitted by construction
        "grade": grade,                                  # COMPUTED on Aperture's grade lattice
        "phason_admissible": bool(captured or rsq1 == 0),
        "decision_basis": "exact-residual-over-Q-no-float-threshold",
        "claim_ceiling": "residual-is-audit-signal-and-grade-not-proof-or-authority",
    }
    return receipt, B_new

# ---------------------------------------------------------------- run it on Aperture packets
# Current admissible/"forced" subspace = span{1, theta}  (what custody currently admits).
B = sp.Matrix.hstack(sp.Matrix([1, 0, 0, 0]), sp.Matrix([0, 1, 0, 0]))

print("\n" + "=" * 78)
print("  TWO APERTURE SCAN PACKETS -> EXACT CAPTURE/GROW DECISIONS")
print("=" * 78)

# Packet A: artifact already inside the admissible subspace  (3*1 + 2*theta)
pktA = {"schema": "td613.aperture-to-dome.route-weather/v1", "artifact_id": "art_in_field",
        "active_lane": "admissibility_scan", "observation_coords": [3, 2, 0, 0]}
recA, B = admit(pktA, B)
print("\n  [A] in-field artifact (admissibility_scan):")
print("  " + json.dumps(recA, indent=2).replace("\n", "\n  "))

# Packet B: artifact with an out-of-field direction (theta^2 component) -> grow the field
pktB = {"schema": "td613.aperture-to-dome.route-weather/v1", "artifact_id": "art_new_generator",
        "active_lane": "phason_gate_scan", "observation_coords": [1, 0, 1, 0]}
recB, B = admit(pktB, B)
print("\n  [B] out-of-field artifact (phason_gate_scan) -> one growth, residual returns to 0:")
print("  " + json.dumps(recB, indent=2).replace("\n", "\n  "))

print("\n  Forced basis grew from 2 to", B.cols, "columns; residual returned to 0 (admitted by construction).")
print("  -> This is the LEARNING step Aperture/Dome lack: lexicon/field growth driven by a")
print("     MEASURED out-of-field residual, decided exactly, graded on Aperture's own lattice.")
