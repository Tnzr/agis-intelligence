import { ArrowRight, Database, Droplet, Leaf, Radio, Router, Sprout, TrendingUp, Wallet, Wheat } from 'lucide-react'
import { coverage } from './model.ts'

export const number = (value: number, decimals = 0) =>
  new Intl.NumberFormat('en', { maximumFractionDigits: decimals }).format(value)
const dollars = (value: number) => '$' + number(value)

export function CoverageStats({ units }: { units: number }) {
  const model = coverage(units)
  const metrics = [
    { label: 'Forecast error', value: model.error.toFixed(1) + '%', note: 'Modeled regional yield error', icon: TrendingUp },
    { label: 'Annual water saved', value: number(model.water) + ' m³', note: 'Versus timer-based irrigation', icon: Droplet },
    { label: 'Annual crop supply', value: number(model.yieldTonnes, 1) + ' t', note: '+6% modeled yield uplift', icon: Wheat },
    { label: 'Annual gross benefit', value: dollars(model.value), note: 'Extra crop sales + water savings', icon: Wallet },
  ]
  return <div className="stat-grid">{metrics.map(({ label, value, note, icon: Icon }) => <article key={label} className="card stat"><span className="icon-chip"><Icon size={19} /></span><div><div className="stat-label">{label}</div><strong>{value}</strong><p>{note}</p></div></article>)}</div>
}

export function ImpactView({ units }: { units: number }) {
  const model = coverage(units)
  return <section className="card detail-card" aria-labelledby="impact-title">
    <div className="panel-heading"><div><div className="eyebrow"><Leaf size={16} /> Sustainable economy</div><h2 id="impact-title">From sensor readings to impact reporting</h2><p>Illustrative annual results for {number(units)} participating production units. No field outcomes have been measured in this demo.</p></div><span className="badge neutral">Scenario estimates</span></div>
    <div className="impact-grid">
      <article><span className="badge neutral">SDG 2 · Zero hunger</span><h3>{number(model.yieldTonnes, 1)} tonnes</h3><p>Projected supply: {number(model.yieldTonnes * 0.5, 1)} t tomato, {number(model.yieldTonnes * 0.3, 1)} t pepper and {number(model.yieldTonnes * 0.2, 1)} t leafy greens (fixed scenario mix).</p></article>
      <article><span className="badge neutral">SDG 6 · Clean water</span><h3>{number(model.water * 1000)} L saved</h3><p>{number(model.productivity, 1)} kg of output per m³ of irrigation water. A pilot would pair flow totals with weighed harvests and compare with a baseline.</p></article>
      <article><span className="badge neutral">SDG 13 · Climate action</span><h3>{number(model.co2, 1)} kg CO₂e</h3><p>Potential emissions avoided from {number(model.energy, 1)} kWh of pumping energy not used. Verify with power meters and local emissions factors.</p></article>
      <article><span className="badge neutral">Smallholder economics</span><h3>{dollars(model.value / units)} / unit</h3><p>Gross annual benefit per production unit, not net income. Collect farmgate sales, tariffs, equipment, maintenance and labor costs to estimate income.</p></article>
    </div>
    <details className="impact-details"><summary>Scenario assumptions and forecast method</summary><p>Each participating unit is modeled as one sensed 100 m² greenhouse. Annual baseline: 550 L/m² irrigation and 8 kg/m² output. Assume 18% less irrigation and 6% more yield. Pumping intensity: 0.45 kWh/m³; grid emissions: 0.42 kg CO₂e/kWh. Prices: US$1.20/kg extra harvest and US$0.40/m³ saved water.</p><p>Illustrative relative yield forecast error = √(6² + 24² / (1 + units / 35))%. The 6% floor represents error that more sensors cannot remove; the other term assumes diminishing returns and representative coverage. This is not calibrated to farms or linked to the example map sites.</p></details>
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
    <div className="mesh-metrics"><span><strong>2</strong> local radio hops</span><span><strong>~8 s</strong> delivery with backhaul online</span><span><strong>97%</strong> illustrative gateway uptime</span></div>
    <p className="fine">Store-and-forward introduces longer delays during outages. This demo does not implement a mesh, gateway, shared data log or alternate device firmware.</p>
  </section>
}
