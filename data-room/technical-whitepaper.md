# AGIS Technical Whitepaper

**Bryan Garcia Rodriguez · Pioneer Innovations Collective LLC · 2026-11-26**

Scope: the ESP32 firmware and hardware in `Tnzr/AGIS` and the intelligence
demo in `Tnzr/agis-intelligence`. This document describes what the code does
today and labels every verification claim.

## 1. System overview

AGIS is a greenhouse monitoring and irrigation controller intended as a
retrofit for existing protected growing structures. The current build targets
the ESP32 DevKit V1 (PlatformIO, `esp32doit-devkit-v1`, Arduino framework,
espressif32 6.12.0).

Data path: sensors (air temperature/humidity via DHT, water flow via pulse
counter) feed a firmware control loop that drives a water pump and a fan over
8-bit PWM, exposes telemetry over WebSocket and a static JSON endpoint, and
persists configuration in SPIFFS. A browser demo visualizes that telemetry
stream and models coverage scenarios.

## 2. Firmware (`Tnzr/AGIS`, `AGIS/` PlatformIO project)

### 2.1 Modules

| Module | Files | Role |
|---|---|---|
| Sensors | `DHT_driver`, `WaterFlowSensor`, `IMU`, `Joystick` | Environmental sensing and flow metering (DHT11 temperature/humidity; hall-effect flow pulses; MPU6050 IMU and joystick for dev/debug) |
| Actuators | `WaterPump`, `Fan` | PWM-driven pump (1 kHz channel) and fan (25 kHz channel, with supply enable pin) |
| Controllers | `MotorDriver` | Motor driver abstraction |
| Algorithms | `IrrigationControl`, `PID`, `ReadingWindow`, `SensorReading`, `FTBDLL`, `Node` | Irrigation control logic, PID routine, reading windows, and a reusable doubly linked list for sensor history |
| Config | `config.h`, `/config.json` in SPIFFS | Wi-Fi credentials (empty-password defaults), network port, runtime settings |
| Web | `main.cpp` | AsyncWebServer + WebSocket `/ws`; `getReadings` text command; static `/sensor_stats.json` |

### 2.2 Control loop

`main.cpp` runs a 5-second sampling loop: it reads the DHT and flow sensors,
advances `IrrigationControl`, and writes PWM duty to the pump and fan
channels. Recent commits stabilized pump control on fast flow response and
added a schematic-defined flow pin. The WebSocket accepts a `getReadings`
command that triggers a telemetry push. The HTTP server serves only a public
`sensor_stats.json` from SPIFFS; credentials are not exposed.

**Verification status:** build- and simulation-verified. The firmware
compiles under PlatformIO and the irrigation control logic is exercised in
`AGIS/test/irrigation_control.cpp`. It has not been flashed to hardware or
run against physical pumps, fans, or sensors. No power, thermal, EMC, or
uptime measurements exist.

### 2.3 Mobile app (`AGIS_App/`)

An Expo/React Native scaffold (`app.json`, `babel.config.js`, TypeScript).
Early stage; not a shippable app. Not part of the pilot-critical path; a
browser client suffices for configuration and monitoring.

### 2.4 Web server (`AGIS_WebServer/`)

A standalone web server directory maintained for reference. The active
telemetry path is the on-device AsyncWebServer described above plus the
`agis-intelligence` browser demo.

### 2.5 Hardware designs

Published images of the GreenPrints PCB (`PCB_PCB_AGIS_GreenPrints_2023-03-31.png`)
and schematic (`Schematic_AGIS_GreenPrints_2023-03-31.png`), licensed
CERN-OHL-P-2.0. Pinout references for the ESP32 DevKit are included in-repo.
A priced bill of materials does not exist yet: the repository's linked parts
sheet shows historical totals of $173.87 (minimal) and $404.85 (complete,
including a Jetson Nano and camera) as US parts totals, not supplier quotes,
installed costs, or current prices.

## 3. Intelligence demo (`Tnzr/agis-intelligence`)

A zero-backend React/Vite/Leaflet browser app deployed to Fly.io
([live demo](https://agis-intelligence.fly.dev), custom domain
[agis.pioneerinnovations.org](https://agis.pioneerinnovations.org)).

- **Device view:** simulates or reads a configured WebSocket telemetry stream
  matching the firmware's message shape (`DHT_Sensor`, `Waterflow_Sensor`,
  `Actuators`, 8-bit PWM duty). It sends no commands and implements no
  control. HTTPS production requires `wss://`; an unencrypted LAN `ws://`
  device stream works when the demo runs over HTTP locally.
- **Weather view:** Open-Meteo historical/forecast data; FAO reference ET0
  with a 0.75 crop coefficient, 0.85 greenhouse factor, and 0.90 irrigation
  efficiency to estimate L/m²/day; illustrative schedule for a 100 m²
  greenhouse and 12 L/min pump. Falls back to a bundled illustrative series
  when offline.
- **Coverage/impact model:** one node per 100 m²; scenarios at 50/500/5,000
  units. Yield forecast error floor of 6% plus a diminishing-returns term,
  18% assumed irrigation saving, 6% assumed yield uplift, published
  energy/emissions factors for avoided pumping. These are illustrative,
  uncalibrated assumptions, explicitly labeled in-app.
- **Learn tutorial:** `/learn` walks through hardware, control, telemetry,
  weather, and the scenario model.

**Verification status:** `npm test` (node:test over `model.ts`) and
`npm run build` (tsc + vite) pass. Every number the demo produces is a model
output; no pilot observations exist. The README states this per section.

## 4. Security and data posture

- Wi-Fi credentials live in SPIFFS `config.json`; the web layer serves only a
  public sensor-stats file, not configuration.
- The demo has no backend, accounts, keys, or LLM calls; it stores locations
  in the browser only.
- No personal data is collected anywhere in the system.

## 5. What a pilot adds

Hardware flashing and bench validation of the integrated loop; flow meter
calibration; uptime measurement under local power and connectivity
conditions; then field comparison metering (Section 2 of
`development-status.md`).

## 6. Licensing

Firmware, app, and web server code: MIT (`LICENSE`). PCB and schematic
designs: CERN-OHL-P-2.0 (`LICENSE-HARDWARE`). The demo repo is private-source
but deployed publicly; it contains no secrets. See `licensing-and-ip.md`.
