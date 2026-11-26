# AGIS Licensing and IP

**Bryan Garcia Rodriguez · Pioneer Innovations Collective LLC · 2026-11-26**

## What is open, and under which license

| Asset | License | File |
|---|---|---|
| Firmware (`AGIS/`), mobile app (`AGIS_App/`), web server (`AGIS_WebServer/`), algorithm testbed (`AlgoTestBed/`) | MIT | `LICENSE` in `Tnzr/AGIS` |
| GreenPrints PCB and schematic design files | CERN-OHL-P-2.0 (permissive open hardware) | `LICENSE-HARDWARE` in `Tnzr/AGIS` |
| Intelligence demo (`Tnzr/agis-intelligence`) | Not separately licensed yet |: |

## Why open

AGIS's premise is that a greenhouse controller a local technician can read,
repair, and adapt is more durable in the places it targets than a closed
black box. Open licenses remove permission barriers for partners: an NGO,
university, or cooperative can inspect the design, fabricate the board, and
modify the firmware without a negotiation. CERN-OHL-P-2.0 (permissive) was
chosen over a reciprocal variant so hardware derivatives impose minimal
obligations on adopters.

## What openness does not give away

- **Trademarks and branding.** Licenses cover copyright in code and designs,
  not the AGIS name or Pioneer Innovations marks.
- **Operating capability.** Assembly, installation, training, and
  maintenance are services, not licensed artifacts; they remain the proposed
  revenue line (kit sales plus support) without locking the design.
- **The hosted demo.** The deployed app's models and UI are Pioneer
  Innovations work product regardless of the firmware's license.

## Publication

IEEE SoutheastCon 2025 paper:
[doi:10.1109/SoutheastCon56624.2025.10971557](https://doi.org/10.1109/SoutheastCon56624.2025.10971557),
first author Bryan Garcia Rodriguez. IEEE publication terms apply to the
paper; the implemented system it describes remains MIT/CERN-OHL open.
