import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Activity, Droplet, Fan, Gauge, Radio, Thermometer, Waves } from 'lucide-react'
import { parseFrame, simulateFrame, type Reading } from './model.ts'

const signals = [
  { key: 'temp', name: 'Temperature', unit: '°C', icon: Thermometer, max: 40 },
  { key: 'humidity', name: 'Humidity', unit: '%', icon: Waves, max: 100 },
  { key: 'flow', name: 'Water flow', unit: 'L/min', icon: Droplet, max: 4 },
  { key: 'pump', name: 'Pump duty', unit: '%', icon: Gauge, max: 100 },
  { key: 'fan', name: 'Fan duty', unit: '%', icon: Fan, max: 100 },
] as const

const simulatedHistory = () => Array.from({ length: 24 }, (_, i) =>
  parseFrame(JSON.stringify(simulateFrame(i)))!).filter(Boolean)
const display = (reading: Reading, key: typeof signals[number]['key']) =>
  key === 'pump' || key === 'fan' ? reading[key] * 100 / 255 : reading[key]

export function NodeView() {
  const [url, setUrl] = useState('')
  const [mode, setMode] = useState<'simulated' | 'connecting' | 'live' | 'closed'>('simulated')
  const [history, setHistory] = useState(simulatedHistory)
  const [notice, setNotice] = useState('')
  const socket = useRef<WebSocket>(null)
  const tick = useRef(24)

  useEffect(() => {
    if (mode !== 'simulated') return
    const timer = setInterval(() => {
      const reading = parseFrame(JSON.stringify(simulateFrame(tick.current++)))
      if (reading) setHistory(previous => [...previous.slice(-23), reading])
    }, 1600)
    return () => clearInterval(timer)
  }, [mode])
  useEffect(() => () => socket.current?.close(), [])

  function connect(event: FormEvent) {
    event.preventDefault()
    let address: URL
    try {
      address = new URL(url.trim())
      if (!['ws:', 'wss:'].includes(address.protocol) || address.username || address.password || address.hash) throw new Error()
    } catch {
      setNotice('Enter a WebSocket URL, for example ws://192.168.1.50/ws.')
      return
    }
    if (location.protocol === 'https:' && address.protocol === 'ws:') {
      setNotice('This HTTPS demo requires wss://. For a local ESP32 using ws://, run the demo over HTTP on your local network.')
      return
    }
    socket.current?.close()
    try {
      const connection = new WebSocket(address)
      socket.current = connection
      setMode('connecting')
      setHistory([])
      setNotice('')
      connection.onopen = () => {
        if (socket.current === connection) setMode('live')
      }
      connection.onmessage = event => {
        if (socket.current !== connection) return
        const reading = typeof event.data === 'string' ? parseFrame(event.data) : null
        if (reading) {
          setNotice('')
          setHistory(previous => [...previous.slice(-23), reading])
        } else setNotice('Ignored a frame that does not match the AGIS PR #2 telemetry format.')
      }
      connection.onerror = () => {
        if (socket.current === connection) setNotice('Connection failed. Check the URL, certificate and network access.')
      }
      connection.onclose = () => {
        if (socket.current === connection) {
          socket.current = null
          setMode('closed')
        }
      }
    } catch {
      setNotice('Could not start a WebSocket connection.')
    }
  }

  function reset() {
    const current = socket.current
    socket.current = null
    current?.close()
    setHistory(simulatedHistory())
    tick.current = 24
    setMode('simulated')
    setNotice('')
  }

  const latest = history.at(-1)
  const status = { simulated: 'Streaming simulation', connecting: 'Connecting', live: 'Connected to device', closed: 'Disconnected' }[mode]
  return <section className="card detail-card" aria-labelledby="node-title">
    <div className="panel-heading"><div><div className="eyebrow"><Radio size={16} /> Device telemetry</div><h2 id="node-title">Inside an AGIS node</h2><p>Follow temperature, humidity, flow and local pump and fan output.</p></div><span className="badge" role="status"><i /> {status}</span></div>
    <div className="signal-grid">{signals.map(({ key, name, unit, icon: Icon, max }) => {
      const values = history.map(reading => display(reading, key))
      const ceiling = Math.max(max, ...values)
      const floor = Math.min(0, ...values)
      const points = values.map((value, i) => (values.length === 1 ? 70 : i * 140 / (values.length - 1)) + ',' + (36 - (value - floor) / (ceiling - floor) * 32)).join(' ')
      return <article className="signal" key={key}><Icon size={18} /><span>{name}</span><strong>{latest ? display(latest, key).toFixed(key === 'flow' ? 2 : key === 'temp' ? 1 : 0) : '—'} <small>{unit}</small></strong>
        <svg viewBox="0 0 140 40" role="img" aria-label={name + ' recent readings'}><path d="M0 36h140" /><polyline points={points} /></svg>
      </article>
    })}</div>
    <p className="fine">{latest ? 'Flow setpoint: ' + latest.target.toFixed(2) + ' L/min. ' : ''}The simulation uses the firmware JSON shape and illustrative actuator responses. The ESP32 runs the real control loop locally; this viewer never sends commands.</p>
    <form className="connect-form" onSubmit={connect}><label htmlFor="socket">Connect a real AGIS node</label><div className="input-row"><input id="socket" value={url} onChange={event => setUrl(event.target.value)} placeholder="wss://your-node/ws" required /><button className="primary-button" type="submit"><Activity size={16} /> Connect</button></div>
      <p className="fine">Read-only WebSocket · Requires a device running <a href="https://github.com/Tnzr/AGIS/pull/2">AGIS PR #2-compatible firmware</a>.</p>
    </form>
    {mode !== 'simulated' && <button className="quiet-button" onClick={reset}>Return to simulation</button>}
    {notice && <p role="status" className="notice">{notice}</p>}
  </section>
}
