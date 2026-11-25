# AGIS agricultural intelligence

A browser demo of how readings from AGIS greenhouse controllers could inform irrigation, regional crop forecasts, and sustainability reporting. Example cities are for exploration, not proposed or active deployments. The [ESP32 firmware](https://github.com/Tnzr/AGIS) is maintained separately.

## Run

Requires Node.js 22 or newer.

    npm ci
    npm run dev
    npm test
    npm run build
    PORT=4173 npm start

Deploy the contents of `dist/` with any static web host. No backend, accounts, keys, or LLM calls are required. Open-Meteo supplies weather and geocoding. The world basemap bundles [Natural Earth 1:110m land](https://www.naturalearthdata.com/downloads/110m-physical-vectors/110m-land/), public-domain data rounded to three decimal places. If weather cannot load, the app labels and uses a bundled illustrative series. Geocoding requires connectivity; map-click coordinates are an alternative. Added locations last until the page is reloaded.

## Weather and irrigation

The weather view requests 30 modeled historical days and 7 forecast days (including the current local date) from [Open-Meteo](https://open-meteo.com/). The browser reuses a cached response for an hour and may fall back to cached data under 24 hours old when the API is unreachable. FAO reference ET₀ × 0.75 crop coefficient × 0.85 greenhouse factor ÷ 0.90 irrigation efficiency estimates L/m²/day. Outdoor rain is reported but not deducted from covered crops. Runtime is based on a 100 m² greenhouse and 12 L/min pump. All schedules are illustrative and never sent to a node.

## Coverage model

One participating node per modeled 100 m² greenhouse; adoption scenarios use 50, 500, and 5,000 units. Sites on the map are for weather exploration and do not represent or calibrate scenario coverage.

- Projected relative regional yield forecast error: √(6² + 24² / (1 + units / 35))%. The curve is illustrative, uncalibrated, and ignores spatial correlation between sites. The assumed 6% floor represents shocks greenhouse sensors cannot capture, such as extreme weather or market-driven changes in planting. The remaining term assumes diminishing returns from more units.
- Annual totals assume 340 growing days across crop cycles. Baseline irrigation is 2.5 L/m² per growing day (within the example ET₀-based demand of 2–3 L/m²/day), or 850 L/m²/year, with an assumed saving of 18%.
- Baseline crop output: 20 kg/m²/year, within the 15–25 kg/m²/year range estimated for low-tech mixed-crop greenhouses in the demo’s agricultural-economist review. Assumed yield uplift: 6%. The illustrative crop split is 50% tomatoes, 30% peppers, and 20% leafy greens.
- Avoided pumping energy: 0.15 kWh/m³ of water saved. Avoided emissions: 0.42 kg CO₂e/kWh. Water productivity uses projected yield divided by projected applied irrigation.
- Gross annual benefit: US$1.20/kg incremental harvest at a blended farmgate price + US$0.40/m³ water saved. No post-harvest losses or quality rejections are deducted from projected supply or sales. This is not net income, and no pilot observations are implied.

## Device and network

Telemetry follows [firmware PR #2](https://github.com/Tnzr/AGIS/pull/2): `DHT_Sensor`, `Waterflow_Sensor`, and `Actuators`, with 8-bit PWM displayed as percent duty. The browser simulates readings or listens to an explicitly configured WebSocket. It does not write commands or implement PID control. The production HTTPS app requires `wss://`; to read a local unencrypted ESP32 `ws://<device-ip>/ws` stream, run the demo over HTTP on a reachable LAN. The network diagram is a concept for cooperative mesh relays, offline queuing, and gateway synchronization; no radios or shared ledger are deployed.
