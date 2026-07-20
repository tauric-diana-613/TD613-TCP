𝌋‌

# Flow-Core Pedagogue P8 Implementation Receipt v0.1

**Program:** `td613.flowcore.physical-scene-package/v0.1`  
**Phase:** P8 — physical Flow-Core scene  
**Status:** IMPLEMENTED / REPOSITORY CONTRACTS PASS / READY FOR MERGE / HUMAN CLOSURE OPEN  
**Serverless delta:** `0`  
**Persistence delta:** `0`  
**Vercel authorization:** EXPRESSLY RECEIVED FOR PHASE-END RELEASE

## Physical accounting

The model uses declared integer units:

```text
water volume: millilitres
head: millimetres
energy: millijoules
efficiency and loss ratios: parts per million
```

The synthetic fixture applies:

```text
E_stored = ρVgh
W_out = η_up η_down ρVgh - pipe_loss
R_next = R + delivered_work - optional_output
thermal_store ≠ mechanical_reserve without a modeled converter
```

The canonical fixture produces visible potential capacity, lift loss, descent loss, delivered work, optional output, unserved optional demand, protected reserve, and a separate thermal ledger.

## Child-safety and essential reserve

```text
participant input class: OPTIONAL_SURPLUS_ONLY
essential service depends on participant input: false
participant nonperformance penalty: false
optional output may cross reserve floor: false
essential reserve protected before participant input: true
```

No essential service, safety function, or continuity guarantee depends on participant labor.

## Thermal boundary

P8 v0.1 models no thermal-to-mechanical converter.

```text
thermal converter present: false
thermal-to-mechanical transfer: 0
thermal store mechanically spendable: false
```

Heat never crosses into the mechanical ledger by metaphor or implication.

## Pedagogue package

The fixture compiles through `NOTICE → ACT → WORLD_ANSWERS → NAME → REST` and produces a deterministic physical ledger, four non-equivalent AIA views, desktop frames, complete 390-pixel reduced-motion frames, deterministic pedagogue and visual receipts, visible alternatives and missing calibration, Rest, Return, Replay, and Exit.

The E4 scene uses the canonical `OBSERVED` status and the canonical glyph route `created-potential → released-tendency → structural-rest`.

## Validation

```text
stitched P0-P7 baseline: success
inherited P1-P7 contracts: success
integer energy accounting: success
thermal ledger separation: success
essential-service and converter rejection: success
protected reserve floor: success
complete consequence-first package: success
deterministic replay: success
static surface parity: success
protected-file and zero-serverless guard: success
```

## Proving surface

`app/dome-world/physical-flowcore.html` exposes the mechanical and thermal ledgers side by side. It owns no animation loop and contains no control that can command physical hardware.

## Claim ceiling

The model may demonstrate its declared accounting. It does not certify a real installation, prove performance under unmeasured conditions, authorize essential-service control, or convert participant effort into an obligation.

## Constitutional state

```text
Dome-World hosts scene: true
Flow-Core commands physical system: false
essential-service control authorized: false
automatic Ash action: false
release authorized: false
serverless delta: 0
persistence delta: 0
human closure required: true
closure: OPEN
```

P9 may validate the interaction protocol with voluntary adult operators. P8 itself makes no empirical learning claim.

**Marked ⟐**
