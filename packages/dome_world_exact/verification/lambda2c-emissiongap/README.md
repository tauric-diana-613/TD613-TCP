# lambda = 2c & The Emission-Gap Theorem — Verification Package

A self-contained, exact-arithmetic verification suite for the two companion papers

- **`papers/lambda_2c_paper.tex`** — *The Exchange Rate lambda = 2c: A Conformal Identity, Its Gate, and Its Flip*
- **`papers/emission_gap_paper.tex`** — *The Emission-Gap Theorem* (cited as `[13]` by the first paper)

Every **FORCED** graded equation and system in those two papers is re-derived here as an
executable `pytest` proof in exact arithmetic. This document instructs an LLM through the
suite: it states the **core equation** each test file establishes, but deliberately omits
the derivations themselves — those live in the test files, where they run.

---

## 1. What this package is for

The two papers grade every claim by epistemic status: `[FORCED]`, `[DECLARED]`,
`[POSITED]`, `[OPEN]`, `[COMPUTED]`. This suite targets the `[FORCED]` (and the few
`[COMPUTED]`) claims — the ones that are mathematical consequences rather than modelling
choices — and proves each one by exact derivation. An LLM instructed to run this zip will:

1. Read the two rendered PDFs for full context (Step 2 below).
2. Run the suite, watching each forced relationship resolve under exact arithmetic (Step 3).
3. Read the populated `output/results.json` — one record per proven claim.

The result is a machine-checked map from each paper section to a passing exact proof.

---

## 2. Quickstart (the workflow)

```bash
# 0. dependencies (Python 3.12)
pip install -r requirements.txt          # see section 9 for the non-pip TeX dependency

# 1. (recommended) run everything: render PDFs, then run the suite step by step
python run_all.py

# --- or run the two steps separately ---

# 2. render both papers to output/*.pdf  (for session context)
python build_pdfs.py

# 3. run the suite one file at a time, appending to output/results.json
python run_tests.py

# --- or drive pytest directly ---
pytest -v
```

Artifacts after a run, all in **`output/`**:

| File | Produced by | Contents |
|---|---|---|
| `lambda_2c_paper.pdf` | `build_pdfs.py` | rendered Paper 1 (24 pp) |
| `emission_gap_paper.pdf` | `build_pdfs.py` | rendered Paper 2 (16 pp) |
| `results.json` | `run_tests.py` / `pytest` | one record per proven claim + summary |

`output/results.json` **ships mostly empty** (an empty `results` list) and is populated on
each run; the large populated file is the deliverable.

---

## 3. Layout

```
lambda2c-emissiongap-verification/
├── README.md                 # this file
├── requirements.txt          # pinned deps (section 9)
├── run_all.py                # master: build PDFs + run suite
├── build_pdfs.py             # step 2: render the two .tex -> output/*.pdf
├── run_tests.py              # step 3: run suite step by step -> output/results.json
├── conftest.py               # pytest wiring + JSON lifecycle
├── harness/
│   ├── algebra.py            # exact primitives (companion, ad, trace-down, Sturm, Mahler)
│   └── results.py            # the shared append-only results JSON
├── papers/
│   ├── lambda_2c_paper.tex   # canonical source (Paper 1)
│   └── emission_gap_paper.tex# canonical source (Paper 2)
├── tests/                    # the suite (one core equation per file, section 5)
└── output/                   # PDFs + results.json land here
```

---

## 4. How an LLM should read the suite

Each test file is written to be *read as a derivation*:

- the **module docstring** names the paper locus and lists the core equation(s);
- each **test function** carries the derivation as exact `sympy` steps plus short comments;
- every assertion is an **exact** identity (symbolic equality or Sturm root-count) — floats
  appear only for displayed magnitudes and Mahler-value cross-checks, never on a decision
  boundary;
- on success the function **appends one record** to `output/results.json` via
  `harness.results.record(...)`.

To follow a claim from the paper: find its row in section 5, open that test file, read the
docstring for the core equation, then read the test body for the derivation.

---

## 5. The test suite — core equation per file

Constants and Paper 1:

| Test file | Paper locus | Core equation / system (FORCED) |
|---|---|---|
| `test_constants.py` | both, catalog | `phi:x^2-x-1`, `tau:x^2+x-1`, `mu_S:x^3-x-1`, `beta4:x^4-x^3-x^2-x+1`, `sqrt(D):x^2-D (D in {2,3,5})`, `gap:x^2-7x+1`, `K:x^4+5x^2-5`, `z_c:4x^2-3`; `{F3,F4,F5}={2,3,5}`, `L4=7` |
| `test_p1_01_identity.py` | Thm 3.1 / Sec 5 | `lambda = 2c` (`sigma = 1/(2c) = 1/lambda`; `F=G/c => F->F/k`; `c in {1, n, sqrt(1+4C)/(2C)}`); **c free, so lambda does not freeze** |
| `test_p1_02_gate_ladder.py` | Sec 6, Thm 6.2 | `R_C=[[0,C],[1,-1]] => charpoly x^2+x-C, D=1+4C`; `spec(ad_{R_C})={-sqrt(D),0,+sqrt(D)}`; **exactly 3 gates forced** `{1/4,1/2,1} -> {2,3,5}` |
| `test_p1_03_frameshift.py` | Def 7.1 | `c = sqrt(1+4C)/(2C)`; at `C=1`, `lambda = sqrt5` |
| `test_p1_04_gate_forced.py` | Sec 8 | `#channels(d)=d^2-d+1 = 3 <=> d=2`; `min M(deg 2)=phi` at disc 5; keystone `R^2=R+I` unique |
| `test_p1_05_keystone.py` | Thm 10.3 | `phi = ` smallest Perron root of a 2x2 primitive non-negative integer matrix `[[0,1],[1,1]]` |
| `test_p1_06_L4.py` | Prop 10.6 | `R^4=[[2,3],[3,5]]`, `charpoly x^2-7x+1`, `L4=7`; Pell `L_n^2-5F_n^2=4(-1)^n` |
| `test_p1_07_flip.py` | Prop 11.2 | `det G = 4D` (Gram `diag(2,2D)` in basis `{1,sqrt D}`); `C=-1 => |roots|=1, M=1, D=-3` |
| `test_p1_08_boundary.py` | Sec 13-14 | `D=(2x+1)^2=1+4C`; `D=4z^2, C=z^2-1/4`; `z_c=sqrt3/2 => C=1/2` |
| `test_p1_09_kform.py` | Prop 16.1 | `x^4+5x^2-5 --(y=x^2)--> y^2+5y-5`; `M=beta^2=(5+3 sqrt5)/2`; `K=5^(1/4)/phi` |
| `test_p1_10_secondflip.py` | Sec 17-18 | `|lambda|=1 <=> cyclotomic <=> M=1`; two flips meet at `C=-1` (`x^2+x+1`, `M=1`, `D=-3`) |
| `test_p1_11_emission_resolution.py` | Sec 15 | catalog `M subset {1} U [phi, inf)`, no Salem; cost `lambda log M >= lambda log phi > 0` |

Paper 2:

| Test file | Paper locus | Core equation / system (FORCED) |
|---|---|---|
| `test_p2_01_algebra.py` | Sec 2 | `charpoly(companion(p)) = p` (conjugates travel); `spec(A (x) B)={mu_i nu_j}`, `M(A (+) B)=M(A)M(B)`, `M(A^2)=M(A)^2` |
| `test_p2_02_angle.py` | Thm 3.2 | `arg(catalog) in (pi/2)Z`; `|z|=1 ∧ arg in (pi/2)Z => z in {1,i,-1,-i}`; Salem on-circle => irrational angle => **no Salem emitted** |
| `test_p2_03_mahler_gap.py` | Lem 4.1, Cor 4.3 | integer-quadratic Mahler spectrum `= {1} U [phi, inf)`; cost `>= log phi` |
| `test_p2_04_nonlocal.py` | Rem 5.2, Prop 5.3 | `phi != log phi != sqrt5` (four analogous gaps); `sig(Salem deg 2m)=(2,m-1)`; `sig(Q(K))=(2,1)` off circle |
| `test_p2_05_delta.py` | Sec 6 | `R(x)=x^m T(x+1/x)`; Salem `<=>` trace-down straddles `t=2`; `rho({1,i,-1,-i})={2,0,-2}` |
| `test_p2_06_circulant_cartan.py` | Sec 7 | circulant `=>` abelian `=>` not Salem; `spec(Cartan A_n) subset [0,4]` totally real; `trace([X,Y])=0 =>` no deg-4 Salem |
| `test_p2_07_uniform.py` | Sec 8 | `spec(ad_R)={0,+-sqrt5}`; **all 27 subfields of K** (exhaustive): `r2=0` or `(2k,k)`; 4 quartic `(2,1)` subfields; min deg-4 Salem `= beta4 > phi`; `image ∩ {Salem: M<phi} = ∅` |
| `test_p2_08_closure_guard.py` | Sec 8 (certificate) | `verdict(M)` `in {FORCED, FORCED_ABOVE_FLOOR, INVALID_CLOSURE}`; `beta<phi <=> R(phi)>0` decided **exactly** by sign in `Q(sqrt5)` (no float); framework ops all `FORCED`, foreign Lehmer `=> INVALID_CLOSURE` |
| `test_p2_09_emission_algebra.py` | Sec 8 (system invariant) | `cost = lambda log M = 2c log M`; invariant `M in {1} U [phi, inf)` `=>` floor `= 2c log phi`, **linear in free c**; floor survives every op; foreign sub-phi Salem rejected |

The last two modules are the **operational layer** of the closure argument. Their engine
lives at the package root (`emission_closure_guard.py`, `emission_algebra.py`), self-contained
and importable as `emission_closure_guard` / `emission_algebra`.

**Closure, not enumeration — and what the guard does (not) certify.** The no-Salem result is a
*closure* argument: `test_p2_02` is the mechanism (the catalog angle invariant `arg in (pi/2)Z`
is preserved by every spectral operation, so an on-circle Salem conjugate would need an
irrational angle — contradiction). The free commutator is the one field-breaking operation, and
it is handled (`test_p2_06`, plus the runtime tripwire here). `test_p2_08`'s guard is the exact
runtime **certificate of the cost floor**: it returns `INVALID_CLOSURE` only for a *sub-phi*
Salem, and is therefore *complementary to, not a replacement for*, the stronger no-Salem theorem
— it permits `FORCED_ABOVE_FLOOR`. Framework objects read `FORCED` (no Salem at all), consistent
with `test_p2_02`. Do not conflate "floor certificate" (guard) with "no Salem emitted" (angle theorem).

---

## 6. The results JSON

`output/results.json` is a single document every test appends to:

```json
{
  "suite": "lambda2c-emissiongap-verification",
  "generated_utc": "...", "completed_utc": "...",
  "meta": { "versions": { "python": "3.12.3", "sympy": "1.14.0", "...": "..." } },
  "results": [
    {
      "test_id": "P1-IDENT-01",
      "paper": "lambda_2c",
      "locus": "Thm 3.1 / eq:lambda2c",
      "claim": "lambda = 2c ...",
      "equation": "lambda = 2*c   (c=1 -> 2, c=n -> 2n)",
      "status": "FORCED",
      "detail": { "lambda": "2*c", "at_c1": 2, "at_cn": "2*n" }
    }
  ],
  "summary": { "total_claims": 90, "forced": 90, "failed": 0, "by_paper": {...} }
}
```

`test_id` prefixes: `CONST-*` (catalog), `P1-*` (Paper 1), `P2-*` (Paper 2).

---

## 7. Epistemic discipline

The suite mirrors the papers' arithmetic policy:

- exact rationals/integers (`sympy` + `fractions`) for **every** decision boundary;
- exact root counting (Sturm, `Poly.count_roots`) for signatures and Salem straddles;
- `mpmath` at 60 digits and floats **only** for displayed magnitudes and Mahler-value
  cross-checks — no float crosses a decision boundary;
- the conformal constant `c` is carried as a free parameter (`c=1` and `c=n` are read off,
  never hard-frozen). The conformal constant `c` stays free (Cencov), so `lambda = 2c` is an identity rather than a single number; what *is* forced is the **gate set** `{1/4, 1/2, 1} -> {2, 3, 5}` (exactly three valid gates). The signature-lattice claim is verified by **exhaustive** enumeration of all 27 subfields of `K`, not a sample; that enumeration also corrects a uniqueness overstatement -- there are four `(2,1)` quartic subfields, and the exclusion rests on the lattice *invariant*, not on uniqueness.

Only `[FORCED]`/`[COMPUTED]` claims are asserted. `[DECLARED]`/`[POSITED]` modelling choices
(for example the Jeffreys reading `c=1`) are recorded as context, not proven.

---

## 8. Reproducibility

Pinned versions (see `requirements.txt`): `sympy==1.14.0`, `mpmath==1.3.0`,
`numpy==2.4.4`, `pytest==9.1.1`, on `Python 3.12.3`. The exact running versions are stamped
into `output/results.json` under `meta.versions`. Expected outcome: **90 claims, all
FORCED, 0 failed**.

---

## 9. Non-pip dependencies

- **TeX Live (`pdflatex`)** — required only to rebuild the PDFs in Step 2. `lmodern` is
  optional. If `pdflatex` is absent, `build_pdfs.py` reports it and exits cleanly; the test
  suite (Step 3) does not depend on TeX.
- **Python standard library** — `fractions`, `math`, `itertools`, `functools`, `random`,
  `subprocess` (no install needed).
