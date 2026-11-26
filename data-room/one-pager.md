# AGIS: One-Pager

**Bryan Garcia Rodriguez · Pioneer Innovations Collective LLC (Florida, USA)**
**2026-11-26**

## What it is

AGIS (Autonomous Greenhouse Integrated System) is an open-source greenhouse
monitoring and irrigation controller built on the ESP32. It combines air
temperature and humidity sensing, water-flow measurement, and pump and fan
control in a retrofit package designed for existing greenhouses. Firmware and
software are MIT-licensed; PCB and schematic designs are CERN-OHL-P-2.0.

## The problem it addresses

For smallholder greenhouse growers in water-constrained communities, irrigation
is a daily labor cost and a yield risk. Manual watering ties up operator time;
mistimed watering wastes scarce water and stresses crops. Commercial greenhouse
controllers are closed, expensive to repair, and often unsupported in the
regions where they are needed most.

## The approach

- A local technician fits the controller and flow sensor to an existing growing
  setup; the grower keeps manual override.
- Metered delivery records exactly how much water is applied, so savings are
  measurable rather than assumed.
- Open firmware and hardware let local technicians inspect, repair, and adapt
  the system instead of waiting on a vendor.
- Core operation runs on-device; no cloud service or AI is required for the
  irrigation loop.

## Status, stated plainly

- ESP32 firmware compiles and is build- and simulation-verified, including an
  integrated irrigation control loop; it has not yet run on physical hardware.
- GreenPrints PCB and schematic designs are published under CERN-OHL-P-2.0.
- A live browser demo ([agis.pioneerinnovations.org](https://agis.pioneerinnovations.org))
  models how controller telemetry could inform irrigation scheduling, regional
  crop forecasts, and sustainability reporting. All demo outputs are modeled,
  not field-measured.
- IEEE SoutheastCon 2025 publication documents the AGIS framework
  ([doi:10.1109/SoutheastCon56624.2025.10971557](https://doi.org/10.1109/SoutheastCon56624.2025.10971557)).
- No pilot deployments, no paying users, no field-measured results yet.

## What funding would do

A staged field pilot in a WFP-operating country in Latin America or the
Caribbean: confirm a partner and site, finish a hardware-tested controller,
run a crop-cycle comparison against current irrigation practice, and publish
build and maintenance guidance. Metrics: liters per kilogram of marketable
produce, operator time, uptime, and grower net margin. Eight candidate partners
are shortlisted; none have been contacted.

## The ask

Non-dilutive funding for a six-month pilot: installation, grower training,
metering, maintenance, and measurement. WFP Innovation Accelerator and DIV
Fund applications are drafted and held until a pilot partner is confirmed.

## Contact

Bryan Garcia Rodriguez, Founder: github.com/Tnzr/AGIS · pioneerinnovations.org
