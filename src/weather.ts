import { sampleWeather, type Day, type Site, type Weather } from './model.ts'

type Daily = { time: string[]; et0_fao_evapotranspiration: number[]; precipitation_sum: number[]; temperature_2m_max: number[] }

export async function getWeather(site: Site, signal: AbortSignal): Promise<Weather> {
  const key = 'agis-weather-v1:' + site.lat.toFixed(4) + ',' + site.lon.toFixed(4)
  let cached: { saved: number; days: Day[] } | undefined
  try {
    const raw = localStorage.getItem(key)
    if (raw) cached = JSON.parse(raw)
    if (cached?.days.length === 37 && Date.now() - cached.saved < 60 * 60 * 1000) {
      return { source: 'cache', days: cached.days }
    }
  } catch {
    cached = undefined
  }
  const query = new URLSearchParams({
    latitude: String(site.lat), longitude: String(site.lon), timezone: 'auto',
    past_days: '30', forecast_days: '7',
    daily: 'et0_fao_evapotranspiration,precipitation_sum,temperature_2m_max',
  })
  try {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?' + query, {
      signal: AbortSignal.any([signal, AbortSignal.timeout(8500)]),
    })
    if (!response.ok) throw new Error('Weather unavailable')
    const { daily }: { daily: Daily } = await response.json()
    const days = daily.time.map((date, i) => ({
      date, forecast: i >= 30, et0: daily.et0_fao_evapotranspiration[i],
      rain: daily.precipitation_sum[i], high: daily.temperature_2m_max[i],
    }))
    if (days.length !== 37 || !days.every(day => [day.et0, day.rain, day.high].every(Number.isFinite))) {
      throw new Error('Incomplete weather data')
    }
    try {
      localStorage.setItem(key, JSON.stringify({ saved: Date.now(), days }))
    } catch {
      // Weather remains usable with storage disabled.
    }
    return { source: 'live', days }
  } catch {
    if (cached?.days.length === 37 && Date.now() - cached.saved < 24 * 60 * 60 * 1000) {
      return { source: 'cache', days: cached.days }
    }
    return sampleWeather(site)
  }
}

export async function searchSites(name: string, signal: AbortSignal): Promise<Site[]> {
  const query = new URLSearchParams({ name, count: '6', language: 'en', format: 'json' })
  const response = await fetch('https://geocoding-api.open-meteo.com/v1/search?' + query, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(8500)]),
  })
  if (!response.ok) throw new Error('Search unavailable')
  const { results = [] }: { results?: { id: number; name: string; admin1?: string; country?: string; latitude: number; longitude: number }[] } = await response.json()
  return results.map(result => ({
    id: 'geo-' + result.id, name: result.name,
    region: [...new Set([result.admin1, result.country].filter(Boolean))].join(', '),
    lat: result.latitude, lon: result.longitude,
  }))
}
