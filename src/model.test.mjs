import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { onLand } from './land.ts'
import { addLocation, nearestSite, readLocations } from './locations.ts'
import { coverage, demand, parseFrame, pumpMinutes, sampleWeather, simulateFrame, sites } from './model.ts'

test('fallback provides thirty historical days and seven forecast days', () => {
  const weather = sampleWeather(sites[0], new Date('2025-07-01T00:00:00Z'))
  assert.equal(weather.source, 'sample')
  assert.equal(weather.days.filter(day => !day.forecast).length, 30)
  assert.equal(weather.days.filter(day => day.forecast).length, 7)
  assert.equal(weather.days[30].date, '2025-07-01')
  assert.equal(weather.days[36].date, '2025-07-07')
})

test('demand converts outdoor reference ET and pump runtime uses area and capacity', () => {
  assert.equal(demand(0), 0)
  assert.equal(Math.round(demand(4) * 100), 283)
  assert.equal(pumpMinutes(3), 25)
})

test('coverage projects improved forecasts and scales total production and savings', () => {
  const early = coverage(50)
  const late = coverage(5000)
  assert.ok(late.error < early.error && late.error > 6)
  assert.equal(late.water, 100 * early.water)
  assert.ok(late.yieldTonnes > early.yieldTonnes && late.value > early.value)
})

test('wide coverage projects annual drip irrigation, crop, and gross benefit totals', () => {
  const result = coverage(5000)
  assert.equal(result.water, 76500)
  assert.equal(result.yieldTonnes, 10600)
  assert.equal(result.energy, 11475)
  assert.equal(result.co2, 4819.5)
  assert.equal(result.value, 750600)
  assert.equal(result.productivity.toFixed(1), '30.4')
})

test('telemetry maps PR #2 sensor and PWM fields without accepting malformed frames', () => {
  const frame = simulateFrame(4)
  const reading = parseFrame(JSON.stringify(frame))
  assert.equal(reading?.temp, frame.DHT_Sensor[0].value)
  assert.equal(reading?.pump, frame.Actuators.pump_pwm)
  assert.equal(parseFrame('{}'), null)
  assert.equal(parseFrame(JSON.stringify({ ...frame, Actuators: { pump_pwm: 256, fan_pwm: 10 } })), null)
})

test('location lookup reuses nearby built-in sites, not distant points', () => {
  const nairobi = { id: 'geo-nairobi', name: 'Nairobi', region: 'Kenya', lat: -1.286, lon: 36.81 }
  assert.equal(nearestSite(nairobi, sites)?.id, 'nairobi')
  assert.equal(nearestSite({ ...nairobi, lat: -1.4 }, sites), undefined)
})

function withLocationStorage(run) {
  const storage = new Map()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      get length() { return storage.size },
      key: index => [...storage.keys()][index] ?? null,
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
  })
  try {
    run()
  } finally {
    delete globalThis.localStorage
  }
}

const oslo = { id: 'oslo', name: 'Oslo', region: 'Norway', lat: 59.91, lon: 10.75 }
const tokyo = { id: 'tokyo', name: 'Tokyo', region: 'Japan', lat: 35.68, lon: 139.69 }

test('saved locations restore both the custom site and the current selection', () => {
  withLocationStorage(() => {
    const custom = [oslo]
    addLocation(oslo, [])
    assert.deepEqual(readLocations(), { custom, selectedId: 'oslo' })
  })
})

test('additions from two views initialized before either saves both survive a reload', () => {
  withLocationStorage(() => {
    const first = readLocations()
    const second = readLocations()
    addLocation(oslo, first.custom)
    addLocation(tokyo, second.custom)
    assert.deepEqual(readLocations(), { custom: [oslo, tokyo], selectedId: 'tokyo' })
  })
})

test('existing saved locations and selection remain available after the storage change', () => {
  withLocationStorage(() => {
    localStorage.setItem('agis-locations-v1', JSON.stringify({ custom: [oslo], selectedId: 'oslo' }))
    assert.deepEqual(readLocations(), { custom: [oslo], selectedId: 'oslo' })
    addLocation(tokyo, readLocations().custom)
    assert.deepEqual(readLocations(), { custom: [oslo, tokyo], selectedId: 'tokyo' })
  })
})

test('bundled land polygons distinguish a city from an open-ocean pin', () => {
  const land = JSON.parse(readFileSync(new URL('../public/world-land.json', import.meta.url), 'utf8'))
  assert.equal(onLand(6.25, -75.56, land), true)
  assert.equal(onLand(-0.25, 90.71, land), false)
})
