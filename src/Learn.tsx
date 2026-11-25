import { useEffect, useState } from 'react'
import { ArrowUpRight, BookOpen, Copy } from 'lucide-react'
import { simulateFrame } from './model.ts'
import modelSource from './model.ts?raw'
import './learn.css'

const repo = 'https://github.com/Tnzr/AGIS'
const firmware = repo + '/blob/521f7de69036bde2093b05bf3afd4e12f38c132c/AGIS/'
const webRepo = 'https://github.com/Tnzr/agis-intelligence'
const chapters = [
  ['system', 'How AGIS works'],
  ['hardware', 'Hardware and wiring'],
  ['sensors', 'Read the sensors'],
  ['control', 'Run the PID loop'],
  ['telemetry', 'Stream telemetry'],
  ['irrigation', 'Estimate irrigation'],
  ['scenarios', 'Model wider coverage'],
  ['run', 'Run it yourself'],
] as const

const tokenPattern = /(\/\/[^\n]*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b(?:const|constexpr|void|float|double|return|if|else|export|function|new|true|false|static)\b|\b\d+(?:\.\d+)?\b)/g
const sourceLine = (prefix: string) => modelSource.split('\n').find(line => line.startsWith(prefix)) ?? ''

function Code({ language, code }: { language: string; code: string }) {
  const [status, setStatus] = useState('')
  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setStatus('Copied')
    } catch {
      setStatus('Select the code to copy it')
    }
  }
  return <div className="tutorial-code"><div className="code-bar"><span>{language}</span><button type="button" onClick={copy}><Copy size={15} /> Copy code</button><span aria-live="polite">{status}</span></div>
    <pre tabIndex={0} aria-label={language + ' example'}><code>{code.split(tokenPattern).map((token, index) =>
      index % 2 ? <span key={index} className={token.startsWith('//') ? 'comment' : /^['"]/.test(token) ? 'string' : /^\d/.test(token) ? 'numeric' : 'keyword'}>{token}</span> : token
    )}</code></pre>
  </div>
}

function Source({ file, lines }: { file: string; lines?: string }) {
  return <a href={firmware + file + (lines ? '#' + lines : '')} target="_blank" rel="noopener noreferrer">{file} <ArrowUpRight size={13} /></a>
}

function WebSource({ file }: { file: string }) {
  return <a href={webRepo + '/blob/main/' + file} target="_blank" rel="noopener noreferrer"><code>{file}</code></a>
}

export function LearnView() {
  useEffect(() => {
    function jumpToChapter() {
      const anchor = window.location.hash.slice(1)
      if (anchor.startsWith('learn-')) document.getElementById(anchor)?.scrollIntoView()
    }
    jumpToChapter()
    window.addEventListener('hashchange', jumpToChapter)
    return () => window.removeEventListener('hashchange', jumpToChapter)
  }, [])
  return <div className="tutorial">
    <section className="card detail-card tutorial-intro" aria-labelledby="tutorial-title">
      <div className="eyebrow"><BookOpen size={16} /> DIY tutorial</div>
      <h1 id="tutorial-title">Learn how AGIS works</h1>
      <p>Trace a greenhouse reading from the ESP32 through the browser, then use the demo to explore irrigation and a larger sensor network. Start in simulation; no hardware or account is needed for the web exercises.</p>
      <p className="fine">Firmware snippets are pinned to the <a href={repo + '/pull/2'} target="_blank" rel="noopener noreferrer">AGIS PR #2 revision</a> used by this telemetry viewer.</p>
      <div className="tutorial-toc" aria-label="Tutorial chapters">{chapters.map(([id, title], index) => <a key={id} href={'#learn-' + id}>{index + 1}. {title}</a>)}</div>
    </section>
    <section className="card detail-card tutorial-chapter" id="learn-system">
      <h2>1. How AGIS works</h2>
      <p>The greenhouse controller reacts to its own sensors. The web app observes messages and models outcomes; it does not send control commands.</p>
      <div className="tutorial-diagram" aria-label="AGIS data and control flows">
        <p><strong>Local control:</strong> DHT11 and flow sensor → ESP32 PID → pump and fan</p>
        <p><strong>Telemetry:</strong> ESP32 sample → WebSocket → browser charts</p>
        <p><strong>Mesh concept:</strong> nodes → relays → cooperative gateway → regional data log. This path is not implemented in the demo.</p>
      </div>
      <p>Start with <a href="#telemetry">Telemetry</a> to watch the simulated actuators, then open <a href="#network">Network</a> for the proposed offline queuing path.</p>
    </section>
    <section className="card detail-card tutorial-chapter" id="learn-hardware">
      <h2>2. Hardware and wiring</h2>
      <p>The firmware targets the ESP32 DOIT DevKit V1, with a DHT11 temperature/humidity sensor and a YF-S201 flow sensor. The table shows firmware defaults, not a complete wiring or parts list.</p>
      <table><thead><tr><th>Connection</th><th>Default GPIO</th></tr></thead><tbody>
        <tr><td>DHT11 signal</td><td>4</td></tr><tr><td>YF-S201 pulse input</td><td>18</td></tr>
        <tr><td>Pump PWM</td><td>5</td></tr><tr><td>Fan PWM (XS2)</td><td>14</td></tr><tr><td>Fan supply polarity control</td><td>12</td></tr>
      </tbody></table>
      <p>Check the <a href={repo + '/blob/main/Schematic_AGIS_GreenPrints_2023-03-31.png'} target="_blank" rel="noopener noreferrer">firmware repository schematic</a> and verify signal levels and drivers before wiring. Do not power a pump or fan from a GPIO. No priced hardware bill of materials was found.</p>
      <p className="tutorial-sources"><Source file="data/config.json" /> · <Source file="src/main.cpp" lines="L13-L18" /> · <Source file="test/README.md" /></p>
    </section>
    <section className="card detail-card tutorial-chapter" id="learn-sensors">
      <h2>3. Read the sensors</h2>
      <p>The DHT11 driver samples temperature and humidity. The flow driver counts rising-edge pulses in an interrupt, then atomically takes and clears the count. The formula converts counts over elapsed milliseconds into L/min at the assumed 450 pulses/L.</p>
      <Code language="C++ · sensor excerpts" code={`DHT_Measurement DHT_driver::sampleRead(){
    stats.temperature = getTemperature();
    stats.humidity = getHumidity();
    return stats;
}

// Excerpt from WaterFlowSensor.cpp
constexpr float pulsesPerLitre = 450.0f;
// ...
++sensor.pulses;
// ...
return count * 60000.0f / (pulsesPerLitre * elapsed);`} />
      <p>Exercise: with 90 pulses in five seconds, the firmware formula gives 2.4 L/min. Confirm pulse calibration with a measured volume before using a physical sensor for estimates.</p>
      <p className="tutorial-sources"><Source file="lib/Sensors/DHT_driver.cpp" lines="L41-L54" /> · <Source file="lib/Sensors/WaterFlowSensor.cpp" /></p>
    </section>
    <section className="card detail-card tutorial-chapter" id="learn-control">
      <h2>4. Run the PID loop</h2>
      <p>Every five seconds, the ESP32 samples inputs, calculates bounded duty commands from error (proportional, integral and derivative terms), and writes PWM. The fan uses the stronger of the temperature and humidity responses. Control keeps running without Wi-Fi.</p>
      <Code language="C++ · main loop excerpt" code={`const float flowLpm = waterFlow.sampleLitresPerMinute(now);
const DHT_Measurement reading = dht.sampleRead();
const auto output = control.step(reading.temperature, reading.humidity, flowLpm,
                                 config.targetFlowLpm, elapsed / 1000.0);
ledcWrite(pumpChannel, output.pumpPwm);
ledcWrite(fanChannel, output.fanPwm);`} />
      <p><strong>Before enabling a pump:</strong> the default flow target is zero. A positive target requests continuous flow, not a watering schedule or dry-run protection. Start with serial and simulated readings; validate the water supply and electrical setup before energizing actuators.</p>
      <p className="tutorial-sources"><Source file="src/main.cpp" lines="L90-L100" /> · <Source file="lib/Algorithms/IrrigationControl.cpp" /> · <Source file="lib/Algorithms/PID.cpp" /></p>
    </section>
    <section className="card detail-card tutorial-chapter" id="learn-telemetry">
      <h2>5. Stream telemetry to the browser</h2>
      <p>The firmware serializes a sample, prints the same JSON to serial at 115200 baud and broadcasts it on <code>/ws</code>. PWM ranges from 0 to 255; the web viewer turns that into percent duty. Here is a sample from the app’s simulator, shaped like a firmware frame.</p>
      <Code language="JSON · simulated sample" code={JSON.stringify(simulateFrame(0), null, 2)} />
      <p>Configure Wi-Fi in the device’s local SPIFFS config. On the same network, open the web app locally over HTTP, select <a href="#telemetry">Telemetry</a>, then use <strong>Connect a real AGIS node</strong> with <code>ws://&lt;device-ip&gt;:8080/ws</code> (8080 is the default; use your configured port). The public HTTPS site only accepts <code>wss://</code>. Do not expose an unencrypted node to the internet.</p>
      <p className="tutorial-sources"><Source file="src/main.cpp" lines="L102-L113" /> · <Source file="lib/Config/config.h" /> · Web: <WebSource file="src/NodeView.tsx" /> and <WebSource file="src/model.ts" /></p>
    </section>
    <section className="card detail-card tutorial-chapter" id="learn-irrigation">
      <h2>6. Estimate irrigation from weather</h2>
      <p><WebSource file="src/weather.ts" /> requests Open-Meteo’s FAO reference evapotranspiration (ET₀). The two functions below are from <WebSource file="src/model.ts" />. One millimeter of water over one m² is one liter. The model adjusts for crop, cover and irrigation efficiency; outdoor rain is not deducted.</p>
      <Code language="TypeScript · src/model.ts" code={[sourceLine('export const demand'), sourceLine('export const pumpMinutes')].join('\n')} />
      <p>Worked example: ET₀ of 4 mm/day gives about 2.83 L/m²/day. Across 100 m² with a 12 L/min pump, that’s about 24 minutes total. It’s a planning example, not an instruction sent to the ESP32.</p>
    </section>
    <section className="card detail-card tutorial-chapter" id="learn-scenarios">
      <h2>7. Model wider coverage</h2>
      <p>The coverage function in <WebSource file="src/model.ts" /> multiplies per-unit impacts by greenhouse count. Forecast error is an illustrative curve, not a prediction model calibrated to farms; it ignores spatial correlation. See <a href="#impact">Impact</a> for the assumptions, including growing days, farmgate price and excluded losses.</p>
      <Code language="TypeScript · src/model.ts" code={'export function coverage' + modelSource.split('export function coverage')[1].split('\ntype DHTEntry')[0].trimEnd()} />
      <p>Exercise: increase 500 units to 5,000. Why does water saved multiply by ten while forecast error does not fall by the same factor?</p>
    </section>
    <section className="card detail-card tutorial-chapter" id="learn-run">
      <h2>8. Run it yourself</h2>
      <p>Install Node.js 22 or newer, clone the <a href={webRepo} target="_blank" rel="noopener noreferrer">web demo</a>, then open the local address printed by Vite.</p>
      <Code language="Shell · web demo" code={`git clone ${webRepo}.git\ncd agis-intelligence\nnpm ci\nnpm run dev\n\n# Verify the model\nnpm test`} />
      <p>To build the ESP32 revision used in this tutorial, install <a href="https://docs.platformio.org/en/latest/core/installation/index.html" target="_blank" rel="noopener noreferrer">PlatformIO Core</a> and check out PR #2 before building. Review the commissioning instructions before uploading to hardware.</p>
      <Code language="Shell · firmware" code={`git clone https://github.com/Tnzr/AGIS.git
cd AGIS
git fetch origin pull/2/head
git switch --detach 521f7de69036bde2093b05bf3afd4e12f38c132c
cd AGIS
pio run -e esp32doit-devkit-v1

# Optional, after commissioning checks:
pio run -e esp32doit-devkit-v1 -t upload
# Prepare data/config.json locally; never commit Wi-Fi credentials.
pio run -e esp32doit-devkit-v1 -t uploadfs
pio device monitor -b 115200`} />
      <p>Try changing locations and comparing ET₀ with the irrigation estimate. Then compare a simulated frame with the serial output before attempting a local WebSocket connection.</p>
      <p className="tutorial-sources"><Source file="platformio.ini" /> · <Source file="test/README.md" /></p>
    </section>
  </div>
}
