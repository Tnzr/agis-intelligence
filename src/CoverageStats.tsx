import { Droplet, TrendingUp, Wallet, Wheat } from 'lucide-react'
import { coverage } from './model.ts'

export const number = (value: number, decimals = 0) =>
  new Intl.NumberFormat('en', { maximumFractionDigits: decimals }).format(value)
export const dollars = (value: number) => '$' + number(value)

export function CoverageStats({ units }: { units: number }) {
  const model = coverage(units)
  const metrics = [
    { label: 'Forecast error', value: model.error.toFixed(1) + '%', note: 'Modeled regional yield error', icon: TrendingUp },
    { label: 'Annual water saved', value: number(model.water) + ' m³', note: '18% below the timer-based baseline of 850 L/m²/year', icon: Droplet },
    { label: 'Annual crop supply', value: number(model.yieldTonnes, 1) + ' t', note: '+6% modeled yield uplift', icon: Wheat },
    { label: 'Annual gross benefit', value: dollars(model.value), note: dollars(model.value / units) + ' per unit × ' + number(units) + ' units', icon: Wallet },
  ]
  return <div className="stat-grid">{metrics.map(({ label, value, note, icon: Icon }) => <article key={label} className="card stat"><span className="icon-chip"><Icon size={19} /></span><div><div className="stat-label">{label}</div><strong>{value}</strong><p>{note}</p></div></article>)}</div>
}
