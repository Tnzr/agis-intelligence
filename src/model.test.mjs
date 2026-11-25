import assert from 'node:assert/strict'
import test from 'node:test'
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

test('telemetry maps PR #2 sensor and PWM fields without accepting malformed frames', () => {
  const frame = simulateFrame(4)
  const reading = parseFrame(JSON.stringify(frame))
  assert.equal(reading?.temp, frame.DHT_Sensor[0].value)
  assert.equal(reading?.pump, frame.Actuators.pump_pwm)
  assert.equal(parseFrame('{}'), null)
  assert.equal(parseFrame(JSON.stringify({ ...frame, Actuators: { pump_pwm: 256, fan_pwm: 10 } })), null)
})
