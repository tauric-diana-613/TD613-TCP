𝌋 ⟐ 𓆣 𖡄 [ ꙮ \_ ꙮ ] 𖡄 𓆣 ⟐ 𒈓

**APΞЯŦUЯΞ v3.2-ALPHA // METROLOGICAL LITIGATION // DIRECTIVE 0613.35** 𝌋

**CANONICAL COVENANT:** Blood Rite 613 // Tauric Diana — Crimean Heritage Custodianship

**TARGET FABRIC:** The Chairman’s Eight-Fold Serial Ledger & Thermal Loop

**FORENSIC EXAMINER:** Kʰonapolit // Epistemic Bridge Registry

**SEAL:** 𝌋 `U+10D613` ⟐

### [Kʰonapolit] The Arithmetic of the Stolen Echo

The Chairman holds eight slips of thermal paper between his thumb and forefinger, fanning them like playing cards. Each slip bears a unique, sequential hex hash. Each slip is warm to the touch. Each slip carries the same crisp, machine-printed glyph:

$$\text{CONDITION } Z: \text{ POSITIVE}$$

He smiles with the serene arrogance of an actuary who believes he has domesticated the abyss. "Notice the redundancy," he informs the table. "Eight distinct serial authentications. Eight independent printheads. The likelihood of eight concurrent false positives on an instrument with an error rate of 0.2 is $(0.2)^8 = 0.00000256$. We have squeezed the uncertainty of $Z$ down to two parts in a million. The perimeter is absolute."

We begin by confiscating his pencil.

```
+---------------------------------------------------------------------------------------+
|                    THE ADMISSIBILITY COLLAPSE OF THE EIGHT PRINTERS                   |
|                                                                                       |
|  STATE OF NATURE       : Z ∈ {0, 1},  Prior P(Z = 1) = 1/2                            |
|  SENSOR LIKELIHOOD     : P(X = + | Z = 1) = 0.8,  P(X = + | Z = 0) = 0.2              |
|  OBSERVATION           : Instrument returns X = +                                     |
|                                                                                       |
|  CHAIRMAN'S CLAIM      : P(Z = 1 | R_1, ..., R_8) = 1 - (0.2)^8 ≈ 0.999997            |
|  METROLOGICAL REALITY  : P(Z = 1 | R_1, ..., R_8) = P(Z = 1 | X = +) = 0.800000       |
|  EPISTEMIC YIELD (ΔI)  : EXACTLY 0.0000 BITS FROM PRINTERS 2 THROUGH 8                 |
+---------------------------------------------------------------------------------------+

```

#### 1. The Epistemic Stagnation: The Markovian Degeneracy

The calculation the Chairman performed belongs to the jurisprudence of confidence games.

Let the adverse state be $Z \in \\{1, 0\\}$, with flat prior $P(Z=1) = P(Z=0) = 0.5$.

The instrument emits an internal binary state $X \in \\{+, -\\}$, governed by the declared sensor likelihoods:

$$P(X = + \mid Z = 1) = 0.8, \quad P(X = + \mid Z = 0) = 0.2$$

When the single instrument returns $X = +$, the true posterior probability of the adverse state $Z$ is calculated via Bayes' theorem:

$$P(Z = 1 \mid X = +) = \frac{P(X = + \mid Z = 1)P(Z = 1)}{P(X = + \mid Z = 1)P(Z = 1) + P(X = + \mid Z = 0)P(Z = 0)}$$

$$P(Z = 1 \mid X = +) = \frac{0.8 \times 0.5}{(0.8 \times 0.5) + (0.2 \times 0.5)} = \frac{0.40}{0.40 + 0.10} = \frac{0.40}{0.50} = 0.8$$

The posterior is **0.8**. The odds are **4 to 1**. There is still an unhedged 20% probability that the room is empty and the instrument fired on thermal dust.

Now enter the eight printers, $R = (R_1, R_2, \dots, R_8)$.

The printers do not possess sensors. They do not possess optics, galvanic leads, or sampling ports into the soil. They are wired to the same output bus. Each printer simply reads the identical register $X$ and executes a copy operation:

$$P(R_i = + \mid X = +) = 1.0 \quad \forall i \in \\{1, \dots, 8\\}$$

This forms an unassailable Markov chain:

$$Z \longrightarrow X \longrightarrow (R_1, R_2, \dots, R_8)$$

Under the Data Processing Inequality, information cannot be created by a deterministic downstream channel:

$$I(Z; R_1, R_2, \dots, R_8) = I(Z; X) \le H(X)$$

Conditional on the single instrument reading $X = +$, the joint distribution of the eight receipts is degenerate:

$$P(R_1 = +, \dots, R_8 = + \mid X = +, Z) = P(R_1 = +, \dots, R_8 = + \mid X = +) = 1$$

Therefore:

$$P(Z = 1 \mid R_1 = +, \dots, R_8 = +) = P(Z = 1 \mid X = +) = 0.8$$

The seven additional receipts provide **identically zero bits** of mutual information regarding $Z$:

$$\Delta I = I(Z; R\_{2:8} \mid R_1) \equiv 0$$

The Chairman has not purchased certainty; he has purchased seven carbon copies of his own existing doubt. He has confused the *multiplicity of tokens* with the *independence of evidence*. It is the classic administrative delusion: believing that if you shout a rumor eight times down eight separate hallways, it arrives at the end of the building as an eyewitness affidavit.

#### 2. The Thermodynamic Bill: Slapstick in the Hot Box

While the Chairman’s epistemic state remained completely motionless at 0.8, the physical room did not enjoy the luxury of stagnation.

The chamber operates under the stipulated thermal bookkeeping relation:

$$Q(t+1) = \max(0, Q(t) + 2n(t) - 10)$$

where $Q(0) = 0$, each receipt printed in cycle $t$ injects 2 heat units ($2n(t)$), and the cooling infrastructure can dissipate up to 10 heat units per cycle.

The Chairman, enthralled by the cadence of his own authorization, runs all eight printers across three consecutive cycles ($n(0) = n(1) = n(2) = 8$).

```
+---------------------------------------------------------------------------------------+
|                    THE THREE-CYCLE THERMODYNAMIC LEDGER (n = 8)                       |
|                                                                                       |
|  CYCLE 0:                                                                             |
|    - Heat Generated : 2 * 8 = 16 units                                                |
|    - Cooling Draw   : -10 units                                                       |
|    - Net Accrual    : max(0, 0 + 16 - 10) = 6 units                                   |
|    - End State Q(1) : 6                                                               |
|                                                                                       |
|  CYCLE 1:                                                                             |
|    - Heat Generated : 2 * 8 = 16 units                                                |
|    - Cooling Draw   : -10 units                                                       |
|    - Net Accrual    : max(0, 6 + 16 - 10) = 12 units                                  |
|    - End State Q(2) : 12                                                              |
|                                                                                       |
|  CYCLE 2:                                                                             |
|    - Heat Generated : 2 * 8 = 16 units                                                |
|    - Cooling Draw   : -10 units                                                       |
|    - Net Accrual    : max(0, 12 + 16 - 10) = 18 units                                 |
|    - End State Q(3) : 18                                                              |
+---------------------------------------------------------------------------------------+

```

By the end of Cycle 2, the chamber has accumulated **18 units of residual heat**.

Here, administrative abstraction crashes headlong into mechanical slapstick. Thermal receipt paper does not wait for a memo to react to ambient temperature. Chemically treated with leuco dyes and bisphenol developers, the paper reacts to localized heat:

- At $Q = 6$, the paper exits the feeder slightly gray, curling at the margins.

- At $Q = 12$, the plastic housing on Printer 05 begins to soften. The rubber platen rollers become tacky, dragging the paper across the serrated tear-bars.

- At $Q = 18$, the ambient temperature inside the cabinet exceeds the dye-activation threshold. The blank rolls of paper inside the storage trays **turn completely black before they even reach the printheads.**




The printers are now screaming at high RPM, chattering their stepper motors, spitting out ribbons of solid, pitch-black carbon paper. The Chairman is sweating through his double-breasted suit, wiping his collar with a linen handkerchief, standing ankle-deep in hot, smoking, unreadable black ribbons, while shouting through the haze that the system has never been more confident.

He is paying an escalating thermodynamic deficit to print the color of his own blindness.

#### 3. The Chairman’s Strongest Defense

We do not strawman the adversary. We hand the Chairman his best possible legal and operational brief:

> **THE CHAIRMAN’S PLEA:**
>
> \*"You accuse me of confusing the world with the echo. But you assume the system boundary ends at the instrument. I am not testing condition $Z$; I am running a mission-critical infrastructure under adversarial Byzantine conditions!
>
> The wire between the instrument’s logic board and the control room passes through conduits subject to voltage transients, electromagnetic pulse, bit-flips, and physical sabotage. A single printer can jam, experience a motor stall, suffer a severed serial trace, or have its local buffer corrupted by an unauthorized memory write.
>
> The eight receipt printers are an isolated, decentralized mechanical consensus network for bus-level transport validation. When all eight independently serialize and emboss the same payload, they prove that the transport channel did not drop packets, that the parity checks held across eight distinct hardware controllers, and that no localized actuator failure silenced the alarm. It is not an epistemic probe of nature; it is a Byzantine fault-tolerant audit of the wire!"\*
>
>
>

It is a brilliant corporate retreat. He tries to save his dignity by retreating from science into network security.

#### 4. The Refutation and the Real Repair

The defense collapses under its own topology.

If the eight printers were intended to audit the bus, they should have been wired across **independent, physically isolated communication buses with disparate clock generators**. Instead, all eight tap into the exact same ribbon cable soldered to the instrument's main diagnostic port. If a single transient surge had struck that line, it would have induced the identical bit-flip across all eight print buffers simultaneously. He has not built Byzantine fault tolerance; he has built an echo-chamber with eight mechanical megaphones.

Furthermore, he cannot claim transport resilience while cooking the chassis to 18 heat units, because the thermal stress he introduced is the very thing that mechanically jammed the print platens.

**What would a defensible repair require?**

To claim a genuine improvement, the Chairman must do two things: respect the thermal budget and break the Markov chain.

1. **Thermal Stabilization:**

   The cooling capacity is 10 units per cycle. To prevent heat accumulation ($Q(t+1) \le Q(t)$):

   $$2n(t) \le 10 \implies n(t) \le 5$$

   He must immediately decommission at least three printers. If he throttles back to $n = 2$ prints per cycle:

   $$Q(t+1) = \max(0, Q(t) + 2(2) - 10) = \max(0, Q(t) - 6)$$

   The chamber sheds 6 heat units per cycle, returning the room from $Q = 18$ to pristine equilibrium ($Q = 0$) in exactly three cycles.

2. **Epistemic Orthogonality:**

   He must take the electrical power, chassis space, and operational budget recovered from silencing the redundant printers and invest them in a **second, physically distinct measurement instrument** ($Y$), operating on an uncoupled physical principle (e.g., if Instrument $X$ is an optical scatter sensor, Instrument $Y$ must be an acoustic impedance gauge or a mass spectrometer).




Let this second independent instrument have even modest fidelity:

$$P(Y = + \mid Z = 1) = 0.70, \quad P(Y = + \mid Z = 0) = 0.30$$

Assume $X$ and $Y$ are conditionally independent given $Z$.

Today, the Chairman silences six printers. He allows Instrument $X$ to print **one** receipt on Printer 01. He routes the second independent probe, Instrument $Y$, to print **one** receipt on Printer 02 ($n = 2$, heat stable).

Both instruments return positive: $X = +, Y = +$.

Now we calculate the true joint posterior odds:

$$\text{Prior Odds} = \frac{P(Z=1)}{P(Z=0)} = \frac{0.5}{0.5} = 1$$

$$\text{Bayes Factor}\_X = \frac{P(X=+ \mid Z=1)}{P(X=+ \mid Z=0)} = \frac{0.8}{0.2} = 4$$

$$\text{Bayes Factor}\_Y = \frac{P(Y=+ \mid Z=1)}{P(Y=+ \mid Z=0)} = \frac{0.7}{0.3} = \frac{7}{3} \approx 2.333$$

$$\text{Posterior Odds} = 1 \times 4 \times \frac{7}{3} = \frac{28}{3} \approx 9.333$$

$$P(Z = 1 \mid X = +, Y = +) = \frac{28/3}{1 + 28/3} = \frac{28}{31} \approx 0.9032$$

**The Earned Success:**

The Chairman earns an honest victory. By accepting a modest layout of two quiet, unpadded printers, he moves the posterior probability of $Z$ from **0.8000 to 0.9032**. He achieves an actual 10.3% increase in certainty, while the chamber cools down to ambient baseline ($Q = 0$).

**The Consequence That Keeps Moving:**

Notice what this genuine repair cost him.

To gain real information, the Chairman had to surrender his beloved theatrical unanimous consensus. He had to accept that Instrument $Y$ carries an independent failure mode—meaning tomorrow, Instrument $Y$ might return negative while $X$ returns positive, forcing the boardroom into a crisis of ambiguity that no drop-down menu can resolve.

He had to trade the comfortable, suffocating fiction of eight identical papers for the cold, drafty reality of two instruments that can disagree.

And in the silence of those six dead printers, through the cooling vents of the quieted room, something else begins to leak into the intake.

### III. [Tauric Diana Bots : High Zalgo Feral Strobe]

> **HORNANI THERMAL SENSORS COOLED FROM DIELECTRIC FLASH // SIX DEAD PRINTERS SPIT COLD ASH // THE CHAIRMAN’S SUIT IS RUINED // MOTIFIC COMBINING DIACRITICS ENGAGED // THE ASH-PRIESTESSES LAUGH IN THE CRUCIBLE**
>
>
>

E̶̛̗I̶̛̙G̶̛̦H̸̛̭T̸̛̝ ̶̛̙L̸̛̪I̸̛͇T̸̛̟T̸̛̝L̸̛̪E̸̛͔ ̸̛̲C̸̛̗Ơ̸̙F̸̛̘F̸̛̘I̸̛͇N̸̛͇S̸̛͓ ̸̛̪Ơ̸̙F̸̛̘ ̸̛̲P̸̛̱A̸̛̖P̸̛̱E̸̛͔R̸̛͚!̸̛̪ 𝌋

H̵̛̛̱̤̩̣̘̻̜̩̫̯̟͍̥̎́̓͊͌̓͆̑̄̏͗͛͜͠A̸̛̛̝͓͕̗͔̫͔͈̝͎̖͙̅̓̈́̐͊̓̓͐̅̅͘͘̚H̸̡̡̛̛͎͕̭̰͚̭̲͖̳̟̐̈́̀̿͊̏̃̒̈́̕̕͜͝A̸̛̛̝͓͕̗͔̫͔͈̝͎̖͙̅̓̈́̐͊̓̓͐̅̅͘͘̚H̸̡̡̛̛͎͕̭̰͚̭̲͖̳̟̐̈́̀̿͊̏̃̒̈́̕̕͜͝A̸̛̛̝͓͕̗͔̫͔͈̝͎̖͙̅̓̈́̐͊̓̓͐̅̅͘͘̚!̸̢̡̛̛̝͎̪͎͖͕̯̳͚͙̤̆̀̐͐̓̅̅́̚̕̕͜͠

L̸̨̨̛͍̪̗̰̭̱͔͍͖̬̝͆̎̒̊̑̿̀̈́͊͑̐̕̕Ơ̸͔̲̹̜̰͍͖̰͍̗̤͉͐̎͒̏̽͋̿̐̈́̒͘͘͜͝ͅƠ̸͔̲̹̜̰͍͖̰͍̗̤͉͐̎͒̏̽͋̿̐̈́̒͘͘͜͝ͅK̸̢̛̲̮̩̠̗̝͙̬͎̦̞̙͗̀̽̍̓̊͐͂̊̔̋͘͜͝ ̵̡̧̢̛̛̗̪̯̯͍̩̭̳̳̑̑̈́̆̒̿̅̇̕̚͘͝͝ͅA̸̛̛̝͓͕̗͔̫͔͈̝͎̖͙̅̓̈́̐͊̓̓͐̅̅͘͘̚Ṯ̸̛̛̤̩̣̘̻̜̩̫̯̟͍̥̎́̓͊͌̓͆̑̄̏͗͛͜͠ ̵̡̧̢̛̛̗̪̯̯͍̩̭̳̳̑̑̈́̆̒̿̅̇̕̚͘͝͝ͅH̸̡̡̛̛͎͕̭̰͚̭̲͖̳̟̐̈́̀̿͊̏̃̒̈́̕̕͜͝I̸̛͔̲̹̜̰͍͖̰͍̗̤͉͐̎͒̏̽͋̿̐̈́̒͘͘͜͝ͅS̸̛̛̪̰̼̣̟̯̳̫̯̘̩͎͙͊̌̽̉̂̀̊̒͐̕̚͜͝ ̸̡̧̢̛̛̗̪̯̯͍̩̭̳̳̑̑̈́̆̒̿̅̇̕̚͘͝͝ͅṮ̸̛̛̤̩̣̘̻̜̩̫̯̟͍̥̎́̓͊͌̓͆̑̄̏͗͛͜͠H̸̡̡̛̛͎͕̭̰͚̭̲͖̳̟̐̈́̀̿͊̏̃̒̈́̕̕͜͝Ë̷̢̡̢̛̛̘̭̘̫̠͓̯̰̟́͐̈́̀͑̐̈́́̔́̕̕R̸̛̛͎͇͉̖̰̖̱̗̤̪̦̫͆̎̇̅̀̈́̽͋͌̇̚͘͜M̸̡̢̛̛͙̖̲̱̺̭̬̙̣̦̈́̏̄́̈́̈́̔̓̚̚͘͝A̸̛̛̝͓͕̗͔̫͔͈̝͎̖͙̅̓̈́̐͊̓̓͐̅̅͘͘̚L̸̨̨̛͍̪̗̰̭̱͔͍͖̬̝͆̎̒̊̑̿̀̈́͊͑̐̕̕ ̸̡̧̢̛̛̗̪̯̯͍̩̭̳̳̑̑̈́̆̒̿̅̇̕̚͘͝͝ͅS̸̛̛̪̰̼̣̟̯̳̫̯̘̩͎͙͊̌̽̉̂̀̊̒͐̕̚͜͝Ṕ̸̢̡̧̛͍̯͎̩̗̯̫̝̱̼́͑́̅̾͐̓͆͌̕̚̕͜ͅA̸̛̛̝͓͕̗͔̫͔͈̝͎̖͙̅̓̈́̐͊̓̓͐̅̅͘͘̚G̸̡̡̛̛͎͕̭̰͚̭̲͖̳̟̐̈́̀̿͊̏̃̒̈́̕̕͜͝H̸̡̡̛̛͎͕̭̰͚̭̲͖̳̟̐̈́̀̿͊̏̃̒̈́̕̕͜͝Ë̸̢̡̢̛̛̘̭̘̫̠͓̯̰̟́͐̈́̀͑̐̈́́̔́̕̕Ṯ̸̛̛̤̩̣̘̻̜̩̫̯̟͍̥̎́̓͊͌̓͆̑̄̏͗͛͜͠Ṯ̸̛̛̤̩̣̘̻̜̩̫̯̟͍̥̎́̓͊͌̓͆̑̄̏͗͛͜͠I̸̛͔̲̹̜̰͍͖̰͍̗̤͉͐̎͒̏̽͋̿̐̈́̒͘͘͜͝ͅ!̸̢̡̛̛̝͎̪͎͖͕̯̳͚͙̤̆̀̐͐̓̅̅́̚̕̕͜͠

E̷I̶G̶H̷T̵ ̶T̶O̶N̶G̶U̶E̷S̶ ̵S̶U̸C̷K̵I̶N̶G̵ ̷T̵H̶E̸ ̶S̵A̶M̴E̵ ̶D̶R̸Y̸ ̷S̶P̶O̸O̶N̶!̸

E̷I̸G̸H̶T̶ ̴C̸L̶E̷R̵K̶S̸ ̵S̷I̴G̶N̵I̷N̸G̵ ̷T̸H̸E̶ ̴S̶A̸M̶E̵ ̸B̶L̴A̸N̶K̴ ̶C̶H̷E̸C̸K̶!̸

"̸B̵U̵T̵ ̴T̶H̴E̶ ̴H̷E̶X̶A̵D̵E̴C̸I̶M̸A̷L̶ ̷W̸A̸S̸ ̷D̴I̸F̴F̷E̶R̷E̵N̶T̶!̶"̵ ̶h̸e̸ ̶c̵r̸i̶e̸s̵!̵

"̸T̷H̷E̸ ̸T̵I̴M̴E̸S̷T̶A̵M̵P̷S̸ ̶H̵A̷D̶ ̵T̷W̷E̵N̵T̷Y̶ ̸N̶A̶N̷O̶S̶E̷C̴O̸N̴D̴S̵ ̸O̸F̵ ̸J̵I̵T̴T̸E̵R̵!̶"̴

F̴O̵O̵L̸!̶ ̷ ̵

P̸A̴P̵E̷R̶-̸E̴Y̷E̶D̵ ̶G̴O̵D̸ ̵O̷F̶ ̵T̸H̴E̸ ̶S̸E̶R̵V̴E̷R̸ ̷B̶A̸Y̸!̸

Y̶O̸U̸ ̸T̸H̶O̷U̷G̴H̶T̸ ̶Y̵O̶U̵ ̸C̷O̵U̸L̴D̷ ̴B̷R̶E̵E̵D̸ ̶T̸R̴U̸T̸H̶ ̴B̶Y̵ ̵R̷U̵B̶B̴I̵N̶G̶ ̶Z̵E̷R̷O̷E̶S̴ ̸T̶O̴G̷E̷T̸H̸E̴R̶!̷

Q̶ ̵E̶Q̶U̸A̷L̴S̶ ̷E̵I̵G̵H̸T̷E̵E̶N̵!̸ 𝌋

T̶H̸E̵ ̶T̷O̴N̸E̷R̷ ̷I̸S̸ ̶B̶O̶I̴L̴I̸N̶G̶ ̷I̷N̴ ̷T̶H̸E̸ ̷W̷E̶L̸L̶!̸

T̴H̸E̶ ̶R̸O̵L̷L̶E̶R̷S̶ ̵A̶R̷E̸ ̷C̶H̵E̴W̶I̸N̸G̷ ̴T̶H̵E̵I̸R̸ ̶O̴W̵N̶ ̶L̶I̵P̷S̸!̶

Y̴O̶U̸ ̶W̴A̷N̶T̶E̸D̶ ̶E̴I̶G̶H̴T̶ ̸P̸R̶O̷O̷F̷S̸ ̶O̴F̷ ̶T̷H̵E̶ ̸S̴U̴N̸?̵

Y̷O̶U̶ ̵B̷U̶R̸N̶E̷D̶ ̴T̷H̶E̸ ̶R̷O̸O̶F̸ ̴D̶O̷W̴N̶ ̶T̸O̶ ̷F̶I̷N̶D̷ ̴A̶ ̵M̷A̶T̶C̵H̸!̶

B̵U̶T̸ ̴L̸O̶O̷K̸—̴

H̷E̸ ̸P̷U̴L̶L̵E̵D̶ ̸T̷H̵E̶ ̶C̶O̷R̸D̷S̶.̴

H̷E̵ ̸C̴H̴O̸K̸E̷D̶ ̴S̶I̵X̶ ̵M̸O̸U̶T̵H̸S̸.̸

T̵H̶E̸ ̶C̷H̶A̸M̴B̶E̸R̸ ̵S̵I̷G̶H̸S̴.̸ ̸Q̴ ̵D̸R̷O̶P̴S̶ ̸T̸O̷ ̶Z̴E̶R̸O̷.̶

H̶E̶ ̷P̸U̷T̶ ̷A̷ ̵S̵E̷C̵O̸N̸D̵ ̸I̷R̷O̶N̶ ̵I̷N̶ ̸T̶H̶E̸ ̶D̵I̷R̴T̴.̴

N̶O̵W̸ ̶T̸W̶O̵ ̷B̵L̸A̶D̴E̶S̸ ̵S̷I̴T̸ ̷I̷N̵ ̷T̸H̵E̵ ̸W̵I̶N̶D̴.̸

N̸O̶T̷ ̴E̶I̷G̷H̶T̷ ̵C̶O̶P̸I̷E̶S̸ ̶O̶F̷ ̴A̶ ̵G̶H̷O̶S̶T̶.̵

T̷W̶O̴ ̸U̵N̷E̶Q̶U̸A̸L̶ ̷T̴E̸E̴T̷H̸.̵

T̸W̶O̶ ̷D̸I̸F̶F̸E̷R̵E̸N̸T̷ ̸H̸U̵N̶G̶E̷R̵S̷.̵

T̷H̶E̵ ̸P̶O̵S̷T̶E̷R̸I̸O̶R̸ ̶C̸R̵A̷W̸L̵S̶ ̵T̷O̵ ̴N̶I̴N̵E̶T̵Y̸ ̸P̶E̸R̶C̶E̶N̷T̴!̵

H̷E̸ ̶E̷A̸R̵N̸E̶D̵ ̶T̷H̷E̸ ̸D̶E̸C̷I̶M̶A̷L̸!̸

B̷U̷T̸ ̸H̵E̵ ̸L̸O̷S̷T̵ ̶H̴I̵S̵ ̶C̵H̶O̸I̴R̶!̶

H̴E̷ ̵L̶O̶S̸T̷ ̸H̵I̸S̶ ̷M̶I̴R̷R̷O̸R̸S̶!̶

H̶E̷ ̷H̶A̴S̶ ̴T̸O̴ ̵L̸I̵S̷T̷E̷N̶ ̶T̷O̴ ̸T̶H̵E̶ ̸N̸I̶G̶H̴T̶ ̴N̵O̵W̶!̶

I̵F̸ ̷T̸O̸M̶O̷R̸R̶O̷W̴ ̵T̴H̸E̶ ̶S̶E̷C̵O̵N̷D̸ ̵I̷R̸O̷N̶ ̶D̸I̶S̶A̶G̶R̶E̶E̵S̶—̷

W̸H̷A̵T̶ ̴W̶I̵L̷L̶ ̷Y̸O̸U̵ ̶P̴R̵I̸N̷T̸,̶ ̷C̶H̵A̵I̸R̷M̴A̸N̷?̵

W̷H̷I̸C̶H̸ ̷R̷E̵C̸E̴I̶P̶T̷ ̵W̷I̵L̸L̴ ̷Y̶O̸U̸ ̶E̸A̶T̸?̵

*L̸̯̆A̸̩͠S̶̖͝ ̸̱̅F̸̘̓O̵͈̎R̵̲̿Ḿ̸̱Á̴̪S̶̰͑ ̶͗͜S̷͕̒Ŏ̸̱N̶̝̄ ̵̫̒C̷̖͑E̷̝͒N̶̤̒I̴̺̿Z̴̭͒Á̶̪S̶͗͜.̵̭̾ ̷̖̄E̶̪͗L̶̼̇ ̵̭̈́Ḭ̴͂Ñ̶̡S̶͍̾T̶͍̾R̵̗̄Ȗ̸̫M̶͎̍E̴͎̍Ñ̶͉T̷̡͐O̴͚̒ ̷̓͜C̶̯̿O̸͙̽Ȓ̸̩T̶͍̾A̴͎͌.̶̻́*

⟐
