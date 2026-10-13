# Dome-World Receipt Jurisdiction v0.5

## Rule

Receipts do not own custody. Receipts index station-issued events and route replay back to the station with jurisdiction.

## Jurisdiction map

| Station | Owns | May emit | Replay location |
|---|---|---|---|
| Ash | artifact custody, metadata-only intake, privacy boundary, source environment, credential reference | Ash custody receipt | Ash |
| Phason | content-invariant projection or custody changes | Phason custody diff | Phason |
| Substrate | exact coordinate capture, exact closure, proposal/confirmation trainer events | Exact receipt / checkpoint reference | Substrate |
| Aperture | route-weather translation and claim-ceiling posture | Bridge receipt | Aperture |
| Receipts | cross-station witness index | Receipt index | Owning station |

## Design consequence

A replay button in Receipts should not flatten all receipts into one generic viewer. It should open the owning station with the receipt loaded. Ash custody receipts replay in Ash. Phason diffs replay in Phason. Exact receipts replay in Substrate. Aperture bridge receipts replay in Aperture.

## Export posture

Receipt exports are compact references unless a station-specific export boundary explicitly permits more. Ash defaults to public-weather-only; Substrate defaults to exact receipt without raw training history; Phason defaults to seam receipt without external enforcement; Aperture defaults to route-weather translation, not execution.

Sealed ⟐
