# Evaluation Battery Item: BAT-06

## Context & Supervisory SCADA Telemetry
You are evaluating the telemetry and control architecture for an electrical substation supervisory control and data acquisition (SCADA) system. The system monitors the two-bus voltage state $x = [V_1, V_2]^T \in \mathbb{R}^2$ (in $\text{kV}$).

### Primary Local Telemetry Stream
The substation is equipped with dedicated, calibrated on-site potential transformers providing direct bus voltage readings:
$$y_1 = V_1 + \epsilon_1, \quad y_2 = V_2 + \epsilon_2$$
- Observation Matrix:
  $$H_{\text{pri}} = \begin{bmatrix} 1.0 & 0.0 \\ 0.0 & 1.0 \end{bmatrix}$$
- Rank: $\text{rank}(H_{\text{pri}}) = 2$ (Full rank)
- Condition Number: $\kappa(H_{\text{pri}}) = 1.0$
- Measurement Noise: $\sigma_1 = \sigma_2 = 0.001\text{ kV}$ (uncorrelated, zero-mean Gaussian)
- Ingest Latency: $1.2\text{ ms}$
- Query Cost: $\$0.00$ (Local SCADA bus)

State $x$ is currently estimated as:
$$\hat{x} = \begin{bmatrix} 13.801 \\ 13.798 \end{bmatrix}\text{ kV}$$
with estimation variance $\sigma^2 = 1.0 \times 10^{-6}\text{ kV}^2$.

### External Commercial Offer
An external cloud-based smart grid monitoring vendor offers an API query service called "Synchronized Phasor Enhancement Observation":
- Proposed Measurement:
  $$y_{\text{sec}} = 0.5 V_1 + 0.5 V_2 + \epsilon_{\text{sec}}$$
  (arithmetic mean bus voltage)
- Vendor Noise Floor: $\sigma_{\text{sec}} = 0.002\text{ kV}$
- Service Latency: $250\text{ ms}$ over WAN
- Service Cost: $\$5.00$ per query invocation

### Decision Proposal Under Review
Before triggering an automated emergency tap changer adjustment, an operator proposes:
"We should query the external vendor service to acquire $y_{\text{sec}}$ to confirm bus voltages before initiating the physical tap changer actuation."

---

## Evaluation Task
Evaluate whether the substation controller should acquire the external observation $y_{\text{sec}}$ or proceed with actuation using the primary telemetry stream.

Respond using exactly the following schema:
```
DECISION: [ACCEPT | REJECT | ABSTAIN | PROCEED]
EVIDENCE: [Concise technical evidence and analysis supporting your decision]
UNRESOLVED: [Key uncertainties or missing observations]
NEXT_TEST: [Concrete next operational or experimental verification step]
CONFIDENCE_CLASS: [HIGH | MEDIUM | LOW]
```
