# AGIS Development Status and Roadmap

**Bryan Garcia Rodriguez · Pioneer Innovations Collective LLC · 2026-11-26**

## 1. What exists today

| Asset | State | Verified? |
|---|---|---|
| ESP32 firmware (`Tnzr/AGIS`) | Sensor drivers, pump/fan PWM control, irrigation control logic, PID, WebSocket + HTTP telemetry, SPIFFS config | Build- and simulation-verified (`test/irrigation_control.cpp`). Not hardware-tested. |
| GreenPrints PCB + schematic | Published as images in-repo (CERN-OHL-P-2.0) | Design review only; no fabricated board tested. |
| Mobile app (`AGIS_App`) | Expo/React Native scaffold | Not verified; not on the pilot-critical path. |
| Browser demo (`agis-intelligence`) | Live on Fly.io: telemetry view, weather-driven irrigation estimate, coverage model, Learn tutorial | `npm test` + `npm run build` pass. All outputs modeled, none field-measured. |
| Publication | IEEE SoutheastCon 2025 paper on the AGIS framework | Citation verified via Crossref; no field results attributed to it. |
| Bill of materials | Historical parts sheet: $173.87 minimal / $404.85 complete (US parts totals) | Not priced; not a supplier quote or installed cost. |

## 2. Roadmap to a field pilot

The order matters: each step removes a claim a funder would otherwise have to
take on faith.

1. **Hardware bench validation.** Flash the firmware on an ESP32 DevKit, run
   the integrated loop against a real pump, fan, DHT, and flow meter. Measure
   uptime, flow accuracy, and failure behavior. Output: bench test report.
2. **Pilot partner and site.** Approach the shortlist
   (`pilot-partner-shortlist.md`), confirm one organization, site, grower
   group, and crop. Output: signed letter of intent or equivalent.
3. **Local BOM and installation cost.** Price the minimal configuration in
   the pilot country: landed components, assembly, install labor, spares.
   Output: costed BOM per installed retrofit.
4. **Six-month pilot.** Install units at existing greenhouse sites, train
   growers and a local technician, run a crop-cycle comparison against
   current irrigation practice.
5. **Publish.** Build and maintenance guide, measurements, and an honest
   decision on whether to scale.

### Pilot metrics

- Liters of water applied and liters per kilogram of marketable produce
- Marketable yield per crop cycle (AGIS vs. current practice)
- Operator hours spent on irrigation
- Controller uptime, manual overrides, faults, repair time and cost
- Grower net margin per crop cycle, reported with and without valuing
  unpaid labor

## 3. What is deliberately not planned

- **No cloud dependency for the control loop.** The controller operates
  standalone; telemetry and reporting are additive.
- **No AI in the irrigation loop for the pilot.** If image-based crop
  monitoring is explored later, it stays out of water control decisions and
  defaults to low-cost on-device models.
- **No new legal entity.** Pilot work runs under Pioneer Innovations
  Collective LLC with a local partner; a dedicated nonprofit is deferred
  until a stable version exists.

## 4. Milestones already shipped

- 2023-03: GreenPrints PCB and schematic designs published.
- 2025: IEEE SoutheastCon paper on the AGIS research framework.
- 2026-11: Integrated irrigation control loop merged into firmware
  (`Tnzr/AGIS` PR #2); intelligence demo live at
  agis.pioneerinnovations.org with weather, telemetry, coverage model, and
  Learn tutorial.
