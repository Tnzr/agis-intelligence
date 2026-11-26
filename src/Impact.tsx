import { ArrowRight, Database, Leaf, Radio, Router, Sprout } from 'lucide-react'
import { dollars, number } from './CoverageStats.tsx'
import { coverage } from './model.ts'

export function ImpactView({ units }: { units: number }) {
  const model = coverage(units)
  return <section className="card detail-card" aria-labelledby="impact-title">
    <div className="panel-heading"><div><div className="eyebrow"><Leaf size={16} /> Sustainable economy</div><h2 id="impact-title">From sensor readings to impact reporting</h2><p>Illustrative annual results for {number(units)} participating production units. No field outcomes have been measured in this demo.</p></div><span className="badge neutral">Scenario estimates</span></div>
    <div className="impact-grid">
      <article><span className="badge neutral">SDG 2 · Zero hunger</span><h3>{number(model.yieldTonnes, 1)} tonnes</h3><p>Projected supply: {number(model.yieldTonnes * 0.5, 1)} t tomato, {number(model.yieldTonnes * 0.3, 1)} t pepper and {number(model.yieldTonnes * 0.2, 1)} t leafy greens (fixed scenario mix).</p></article>
      <article><span className="badge neutral">SDG 6 · Clean water</span><h3>{number(model.water * 1000)} L saved</h3><p>{number(model.productivity, 1)} kg of output per m³ of irrigation water. A pilot would pair flow totals with weighed harvests and compare with a baseline.</p></article>
      <article><span className="badge neutral">SDG 13 · Climate action</span><h3>{number(model.co2 / 1000, 2)} t CO₂e</h3><p>Potential emissions avoided from {number(model.energy, 1)} kWh of pumping energy not used. Verify with power meters and local emissions factors.</p></article>
      <article><span className="badge neutral">Smallholder economics</span><h3>{dollars(model.value / units)} / unit</h3><p>Modeled gross annual benefit, not net income. Hardware and installation have not been costed, so no pilot budget or payback is estimated.</p></article>
    </div>
    <details className="impact-details"><summary>Scenario assumptions and forecast method</summary>
      <p>Each unit represents one 100 m² greenhouse with 340 growing days per year across crop cycles. The baseline is 850 L/m²/year (2.5 L/m² per growing day, within the example ET₀-based demand of 2–3 L/m²/day) and 20 kg/m²/year of harvest (the demo’s agricultural-economist review estimated 15–25 kg/m²/year for a low-tech mixed-crop greenhouse). The scenario assumes 18% less irrigation and 6% more yield.</p>
      <p>Small drip pumping uses an assumed 0.15 kWh/m³ and grid electricity an assumed 0.42 kg CO₂e/kWh. Gross benefit uses a blended farmgate price of US$1.20/kg of extra harvest and US$0.40/m³ of water saved. No post-harvest losses or quality rejections are deducted from supply or sales.</p>
      <p>Annual impacts use the same assumptions for every greenhouse: per-unit water savings, harvest, energy and gross benefit are multiplied by unit count. No network effects or economies of scale are assumed for those benefits.</p>
      <p>Relative yield forecast error = √(6² + 24² / (1 + units / 35))%. This illustrative curve is uncalibrated and ignores spatial correlation between sites. The assumed 6% floor represents shocks greenhouse sensors cannot capture, such as extreme weather or market-driven changes in planting. The remaining term assumes diminishing returns from more units.</p>
    </details>
  </section>
}

export function NetworkView() {
  const stages = [
    { icon: Sprout, title: 'Greenhouse nodes', note: 'ESP32 measures conditions and keeps local control even when the uplink goes offline.' },
    { icon: Radio, title: 'Shared mesh relay', note: 'LoRa-style relays pass short, timestamped summaries between neighbors.' },
    { icon: Router, title: 'Cooperative gateway', note: 'Queued records are forwarded when any participating gateway has backhaul.' },
    { icon: Database, title: 'Regional data log', note: 'Deduplicate by node and sequence; aggregate consented data for forecasts and reporting.' },
  ]
  return <section className="card detail-card" aria-labelledby="network-title">
    <div className="panel-heading"><div><div className="eyebrow"><Radio size={16} /> Decentralized connectivity</div><h2 id="network-title">Share readings without relying on one carrier</h2><p>Illustrative architecture: neighboring production units relay data and sync when a connection is available.</p></div><span className="badge neutral">Simulated route</span></div>
    <ol className="mesh-grid">{stages.map(({ icon: Icon, title, note }, index) => <li key={title}><span className="icon-chip"><Icon size={19} /></span><div className="step">Step {index + 1}</div><h3>{title}</h3><p>{note}</p>{index < stages.length - 1 && <ArrowRight className="mesh-arrow" size={16} />}</li>)}</ol>
    <div className="mesh-metrics"><span><strong>2</strong> illustrative local radio hops</span><span><strong>~8 s</strong> illustrative delivery with backhaul online</span><span><strong>97%</strong> illustrative gateway uptime</span></div>
    <p className="fine">Store-and-forward introduces longer delays during outages. This demo does not implement a mesh, gateway, shared data log or alternate device firmware.</p>
  </section>
}
