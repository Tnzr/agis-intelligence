# AGIS Data Room

Diligence package for funders, grant reviewers, and pilot partners evaluating
AGIS, the open-source greenhouse controller from Pioneer Innovations Collective LLC.
**Author:** Bryan Garcia Rodriguez · **Updated:** 2026-11-26

This package is written for honesty over polish. Where something is modeled,
proposed, or not yet measured, the document says so. Nothing here claims field
results AGIS does not have.

## Documents

| Document | Contents |
|---|---|
| [one-pager.md](one-pager.md) | Single-page summary for cold outreach and first calls |
| [technical-whitepaper.md](technical-whitepaper.md) | Firmware, hardware, telemetry, and the intelligence demo: architecture, verification status, licensing |
| [development-status.md](development-status.md) | What exists, what is verified, what is not, and the roadmap to a hardware-tested pilot |
| [evidence-and-impact.md](evidence-and-impact.md) | Third-party evidence for the approach and the outcomes a pilot would measure |
| [pilot-partner-shortlist.md](pilot-partner-shortlist.md) | Eight candidate pilot partners in WFP-operating countries; none contacted yet |
| [funding-pipeline.md](funding-pipeline.md) | Grant and crowdfunding path: WFP Innovation Accelerator, DIV Fund, SBIR, open-hardware crowdfunding |
| [licensing-and-ip.md](licensing-and-ip.md) | MIT software, CERN-OHL-P-2.0 hardware, and what openness means for a partner or funder |
| [risks-and-open-questions.md](risks-and-open-questions.md) | Known gaps a diligence reviewer will ask about, stated plainly |

## Linked documents (maintained elsewhere)

| Document | Where |
|---|---|
| Pitch deck | [AGIS_Investor_Deck.pdf](AGIS_Investor_Deck.pdf) · [AGIS_Investor_Deck.pptx](AGIS_Investor_Deck.pptx): 15 slides in DVP order, produced by the Pitch Desk bot ([generator source PR](https://github.com/Tnzr/pioneer-innovations-collective_landingpage/pull/32), not merged). Raise, terms, financials, kit price, and QR still TBD. WFP requires a version trimmed to 10 slides max. |
| WFP Innovation Accelerator application draft | Field-by-field draft with remaining gaps; held until a WFP-country pilot and real-world use exist. |
| DIV Fund Stage 1 application draft | Draft answers to the live form; held for the same reason. |
| Live demo | [agis.pioneerinnovations.org](https://agis.pioneerinnovations.org) / [agis-intelligence.fly.dev](https://agis-intelligence.fly.dev): browser demo of controller telemetry and scenario modeling. All outputs are modeled, not field-measured. |
| Firmware and hardware | [github.com/Tnzr/AGIS](https://github.com/Tnzr/AGIS): ESP32 firmware, GreenPrints PCB and schematic, MIT software + CERN-OHL-P-2.0 hardware licenses. |
| Publication | IEEE SoutheastCon 2025, "AGIS: A Community-Driven Framework for Automated Greenhouse Research and Education" ([doi:10.1109/SoutheastCon56624.2025.10971557](https://doi.org/10.1109/SoutheastCon56624.2025.10971557)). |

## Evidence boundaries

- No pilot organization has been contacted. The shortlist is a shortlist only.
- Every demo output is modeled, not field-measured.
- Firmware is build- and simulation-verified only; it has not run on hardware.
- There is no priced bill of materials. The repository's historical parts sheet
  lists $173.87 (minimal) and $404.85 (complete) as parts totals, not current
  quotes or installed costs.
- The WFP and DIV applications are drafted but deliberately held until a
  WFP-country pilot and real-world use exist.

## Repositories

- `Tnzr/AGIS`: ESP32 firmware, hardware designs, mobile app scaffold.
- `Tnzr/agis-intelligence`: this repo; the live browser demo and this data room.
