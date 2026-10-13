#!/usr/bin/env python3
"""
trainer_demo.py -- a worked training SESSION on the reference Trainer.

Stream over K = Q(sqrt2+sqrt3) (x^4 - 10x^2 + 1), forced basis B0 = span{1, theta}:
  Phase 1  in-field artifacts            -> captured, grade FORCED, no growth
  Phase 2  transient off-axis (jittery)  -> persistence not reached, no growth
  Phase 3  persistent off-axis (theta^2) -> ONE growth by 2sqrt6 (minpoly x^2-24), CONSTRUCTION
  Phase 4  the now-learned direction      -> captured, FORCED, basis dim 3
Then: checkpoint -> resume -> confirm the resumed model still captures what it learned.
"""
from __future__ import annotations
import json, os, sys
from fractions import Fraction

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from trainer import Trainer, TrainerConfig

PHI4 = [1, 0, -10, 0, 1]                       # x^4 - 10x^2 + 1  (K = Q(sqrt2+sqrt3))
B0 = [[1, 0, 0, 0], [0, 1, 0, 0]]              # forced basis = span{1, theta}


def packet(aid, lane, coords):
    return {"schema": "td613.aperture-to-dome.route-weather/v1",
            "artifact_id": aid, "active_lane": lane, "observation_coords": coords}


def make_stream():
    s = []
    # Phase 1: in-field (lie in span{1, theta}) -> captured
    s += [packet("in_field_1", "admissibility_scan", [3, 2, 0, 0]),
          packet("in_field_2", "admissibility_scan", [1, 5, 0, 0])]
    # Phase 2: transient off-axis -- DIRECTION alternates, so the streak keeps resetting -> no growth
    s += [packet("noise_a", "rupture_scan", [0, 0, 1, 0]),
          packet("noise_b", "rupture_scan", [0, 0, 0, 1]),
          packet("noise_c", "rupture_scan", [0, 0, 1, 0])]
    # Phase 3: persistent off-axis -- SAME direction theta^2 held N times -> grows by 2sqrt6
    s += [packet(f"novel_theta2_{i}", "phason_gate_scan", [0, 0, 1, 0]) for i in range(4)]
    # Phase 4: the learned direction is now admissible
    s += [packet("post_growth_check", "admissibility_scan", [0, 0, 1, 0])]
    return s


def main() -> int:
    cfg = TrainerConfig(ambient_min_poly=PHI4, seeds=B0, persistence_N=3)
    tr = Trainer(cfg)

    print("=" * 84)
    print("  TRAINING SESSION  K = Q(sqrt2+sqrt3),  B0 = span{1, theta},  persistence_N = 3")
    print("=" * 84)
    print(f"  {'#':>2}  {'artifact':22} {'grade':13} {'resid_before':>12}  {'dim':>5}  {'streak':>6}  grew")
    print("  " + "-" * 78)
    for i, art in enumerate(make_stream(), 1):
        r = tr.step(art)
        print(f"  {i:>2}  {str(r['artifact_id']):22} {r['grade']:13} {r['projection_residual_before']:>12}"
              f"  {str(r['forced_basis_dim'][1]):>5}  {str(r['streak']):>6}  {'YES' if r['field_grew'] else ''}")

    print("\n  --- training report ---")
    rep = tr.report()
    print("  " + json.dumps(rep, indent=2).replace("\n", "\n  "))

    # checkpoint -> resume -> verify the resumed model captures the learned direction
    ckpt = tr.checkpoint()
    print("\n  --- checkpoint (the model = forced-basis columns) ---")
    print(f"  basis dim = {len(ckpt['seed_coords'])} ; witness_len = {ckpt['witness_len']}")
    tr2 = Trainer.resume(cfg, ckpt)
    chk = tr2.step(packet("resumed_capture_check", "admissibility_scan", [0, 0, 1, 0]))
    print(f"  resumed trainer on theta^2 -> grade {chk['grade']} (captured={chk['captured']}, "
          f"dim={chk['forced_basis_dim'][1]}) -- learned state survived the round-trip")

    ok = rep["growth_events"] == 1 and rep["adjoined_minpolys"] == [[1, 0, -24]] and rep["witness_intact"] \
        and chk["captured"]
    print("\n  SESSION OK:", ok)
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
