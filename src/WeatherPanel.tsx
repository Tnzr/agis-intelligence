import { useEffect, useState } from 'react'
import { ArrowDownToLine, CloudSun, Droplet } from 'lucide-react'
import { demand, pumpMinutes, type Day, type Site, type Weather } from './model.ts'
import { getWeather } from './weather.ts'

const dateLabel = (date: string) => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(date))
const updateLabel = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

function WeatherChart({ days }: { days: Day[] }) {
  const max = Math.max(1, ...days.map(day => demand(day.et0)))
  return <div className="weather-chart">
    <div className="chart-key"><span><i /> Past 30 days</span><span><i /> Next 7 days</span><span>Demand · L/m²/day</span></div>
    <div className="weather-bars" role="img" aria-label="Greenhouse irrigation demand for the past 30 and next 7 days">
      {days.map(day => <div key={day.date} className={day.forecast ? 'future' : ''} title={dateLabel(day.date) + ': ' + demand(day.et0).toFixed(2) + ' L/m²'}>
        <div style={{ height: 100 * demand(day.et0) / max + '%' }} />
      </div>)}
    </div>
    <div className="chart-dates"><span>{dateLabel(days[0].date)}</span><span>{dateLabel(days[days.length - 7].date)} · forecast</span><span>{dateLabel(days[days.length - 1].date)}</span></div>
  </div>
}

export function WeatherPanel({ site }: { site: Site }) {
  const [loaded, setLoaded] = useState<{ site: Site; weather: Weather }>()
  useEffect(() => {
    const controller = new AbortController()
    getWeather(site, controller.signal).then(result => {
      if (!controller.signal.aborted) setLoaded({ site, weather: result })
    })
    return () => controller.abort()
  }, [site])

  const weather = loaded?.weather
  const loading = loaded?.site.id !== site.id
  const forecast = weather?.days.filter(day => day.forecast) ?? []
  const total = forecast.reduce((sum, day) => sum + demand(day.et0), 0)
  function downloadCsv(days: Day[]) {
    const csv = ['date,period,et0_mm,rain_mm,high_c,irrigation_l_per_m2,pump_minutes_100m2', ...days.map(day =>
      [day.date, day.forecast ? 'forecast' : 'past', day.et0, day.rain, day.high, demand(day.et0).toFixed(2), pumpMinutes(demand(day.et0)).toFixed(1)].join(','),
    )].join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'agis-irrigation.csv'
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return <section className="card weather-card" aria-labelledby="weather-title">
    <div className="panel-heading"><div><div className="eyebrow"><CloudSun size={16} /> Weather and irrigation</div><h3 id="weather-title">{site.name}</h3><p>{site.region} · {Math.abs(site.lat).toFixed(2)}°{site.lat < 0 ? 'S' : 'N'}, {Math.abs(site.lon).toFixed(2)}°{site.lon < 0 ? 'W' : 'E'}</p></div>
      <div role="status" className={'badge weather-status ' + (weather?.source === 'sample' ? 'neutral' : '')}><i className={loading ? 'spinner' : undefined} />{loading ? 'Loading weather' : weather?.source === 'sample' ? 'Sample weather' : 'Weather data'}</div>
    </div>
    {loading ? <p className="fine weather-progress" role="status">{loaded ? 'Showing previous weather for ' + loaded.site.name + ' while ' + site.name + ' loads.' : 'Fetching the forecast and irrigation estimate for ' + site.name + '…'}</p> :
      weather?.source !== 'sample' && weather && <p className="fine weather-progress">Updated <time dateTime={new Date(weather.updatedAt).toISOString()}>{updateLabel.format(weather.updatedAt)}</time></p>}
    {!weather && <div className="weather-skeleton" aria-hidden="true" />}
    {weather && <div className={loading ? 'weather-pending' : undefined} inert={loading}><WeatherChart days={weather.days} />
      <div className="irrigation-callout"><Droplet size={21} /><div><strong>{total.toFixed(1)} L/m² over the next 7 days</strong><p>For a 100 m² greenhouse at 12 L/min: ~{Math.round(pumpMinutes(demand(forecast[0].et0)))} pump minutes today, split into two equal runs. A planning estimate, not a command.</p></div></div>
      <details><summary>Daily irrigation plan</summary>
        <div className="table-wrap"><table><thead><tr><th>Day</th><th>High °C</th><th>Rain mm</th><th>ET₀ mm</th><th>L/m²</th><th>Pump min</th></tr></thead>
          <tbody>{forecast.map(day => <tr key={day.date}><td>{dateLabel(day.date)}</td><td>{day.high.toFixed(1)}</td><td>{day.rain.toFixed(1)}</td><td>{day.et0.toFixed(1)}</td><td>{demand(day.et0).toFixed(2)}</td><td>{Math.round(pumpMinutes(demand(day.et0)))}</td></tr>)}</tbody></table></div>
        <button className="quiet-button" onClick={() => downloadCsv(weather.days)}><ArrowDownToLine size={15} /> Export all 37 days (CSV)</button>
      </details>
      <p className="fine">Data source: {weather.source === 'sample' ? 'bundled illustrative series; Open-Meteo unavailable.' : 'Open-Meteo modeled past and forecast conditions, not local sensor readings.'} Demand = FAO ET₀ × 0.75 crop coefficient × 0.85 greenhouse factor ÷ 0.90 irrigation efficiency. Outdoor rain is not deducted under cover.</p>
    </div>}
  </section>
}
