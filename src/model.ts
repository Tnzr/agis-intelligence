export type Site = { id: string; name: string; region: string; lat: number; lon: number }
export type Day = { date: string; et0: number; rain: number; high: number; forecast: boolean }
export type Weather = { days: Day[] } & (
  { source: 'live' | 'cache'; updatedAt: number } | { source: 'sample' }
)

export const sites: Site[] = [
  { id: 'medellin', name: 'Medellín', region: 'Colombia', lat: 6.25, lon: -75.56 },
  { id: 'nairobi', name: 'Nairobi', region: 'Kenya', lat: -1.29, lon: 36.82 },
  { id: 'valencia', name: 'Valencia', region: 'Spain', lat: 39.47, lon: -0.38 },
  { id: 'chiang-mai', name: 'Chiang Mai', region: 'Thailand', lat: 18.79, lon: 98.99 },
  { id: 'adelaide', name: 'Adelaide', region: 'Australia', lat: -34.93, lon: 138.60 },
  { id: 'fresno', name: 'Fresno', region: 'United States', lat: 36.74, lon: -119.79 },
]

const round = (number: number) => Number(number.toFixed(2))
export const demand = (et0: number) => et0 * 0.75 * 0.85 / 0.9
export const pumpMinutes = (litresPerM2: number) => litresPerM2 * 100 / 12

export function sampleWeather(site: Site, today = new Date()): Weather {
  const seed = (Math.abs(site.lat) + Math.abs(site.lon)) / 30
  return {
    source: 'sample',
    days: Array.from({ length: 37 }, (_, index) => {
      const date = new Date(today)
      date.setUTCDate(date.getUTCDate() + index - 30)
      return {
        date: date.toISOString().slice(0, 10),
        forecast: index >= 30,
        et0: round(3.4 + Math.sin(index * 0.43 + seed) * 1.05 + Math.cos(index * 1.1) * 0.35),
        rain: index % 7 < 2 ? round(2 + Math.abs(Math.sin(index + seed)) * 7) : 0,
        high: round(25 + Math.sin(index * 0.32 + seed) * 4),
      }
    }),
  }
}

export function coverage(units: number) {
  const error = Math.hypot(6, 24 / Math.sqrt(1 + units / 35))
  const greenhouseArea = units * 100
  const growingDays = 340
  const irrigationPerGrowingDay = 2.5
  const baselineWater = greenhouseArea * growingDays * irrigationPerGrowingDay / 1000
  const water = baselineWater * 0.18
  const baselineYield = greenhouseArea * 20 / 1000
  const yieldTonnes = baselineYield * 1.06
  const energy = water * 0.15
  const value = (yieldTonnes - baselineYield) * 1000 * 1.2 + water * 0.4
  return { error, water, yieldTonnes, energy, co2: energy * 0.42, value, productivity: yieldTonnes * 1000 / (baselineWater - water) }
}

type DHTEntry = { title: string; id: string; value: number; unit: string }
export type Frame = {
  DHT_Sensor: DHTEntry[]
  Waterflow_Sensor: { flow_lpm: number; target_lpm: number }
  Actuators: { pump_pwm: number; fan_pwm: number }
}
export type Reading = { temp: number; humidity: number; flow: number; target: number; pump: number; fan: number }

export function simulateFrame(tick: number): Frame {
  const temp = round(28.6 + 1.8 * Math.sin(tick / 7))
  const humidity = round(66 - 5 * Math.sin(tick / 7 + 0.6))
  const flow = round(2.4 + 0.18 * Math.sin(tick / 3))
  const pwm = (value: number) => Math.max(0, Math.min(255, Math.round(value)))
  return {
    DHT_Sensor: [
      { title: 'Temperature', id: 'temperature', value: temp, unit: '&deg;C' },
      { title: 'Humidity', id: 'humidity', value: humidity, unit: '&percnt;' },
    ],
    Waterflow_Sensor: { flow_lpm: flow, target_lpm: 2.5 },
    Actuators: { pump_pwm: pwm(137 + 200 * (2.5 - flow)), fan_pwm: pwm(75 + 42 * (temp - 28)) },
  }
}

export function parseFrame(payload: string): Reading | null {
  try {
    const frame: Frame = JSON.parse(payload)
    const temp = frame.DHT_Sensor.find(sensor => sensor.id === 'temperature')?.value
    const humidity = frame.DHT_Sensor.find(sensor => sensor.id === 'humidity')?.value
    const { flow_lpm: flow, target_lpm: target } = frame.Waterflow_Sensor
    const { pump_pwm: pump, fan_pwm: fan } = frame.Actuators
    if (typeof temp !== 'number' || typeof humidity !== 'number' ||
        ![temp, humidity, flow, target, pump, fan].every(Number.isFinite)) return null
    if (humidity < 0 || humidity > 100 || flow < 0 || target < 0 ||
        ![pump, fan].every(value => Number.isInteger(value) && value >= 0 && value <= 255)) return null
    return { temp, humidity, flow, target, pump, fan }
  } catch {
    return null
  }
}
