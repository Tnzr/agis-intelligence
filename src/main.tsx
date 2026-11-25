import { lazy, Suspense, useEffect, useRef, useState, type ComponentProps, type FormEvent } from 'react'
import { createRoot } from 'react-dom/client'
import { Activity, ArrowDown, ArrowUpRight, BookOpen, CircleHelp, Globe2, LayoutGrid, Mail, MapPin, Network, Plus, Search, Sprout } from 'lucide-react'
import { CoverageStats, number } from './CoverageStats.tsx'
import { Pilot, contact } from './Pilot.tsx'
import { WeatherPanel } from './WeatherPanel.tsx'
import { nearestSite, readLocations, saveLocations } from './locations.ts'
import { sites, type Site } from './model.ts'
import { searchSites } from './weather.ts'
import './styles.css'

const SiteMap = lazy(() => import('./Map.tsx').then(module => ({ default: module.SiteMap })))
const NodeView = lazy(() => import('./NodeView.tsx').then(module => ({ default: module.NodeView })))
const ImpactView = lazy(() => import('./Impact.tsx').then(module => ({ default: module.ImpactView })))
const NetworkView = lazy(() => import('./Impact.tsx').then(module => ({ default: module.NetworkView })))
const LearnView = lazy(() => import('./Learn.tsx').then(module => ({ default: module.LearnView })))
const firmware = 'https://github.com/Tnzr/AGIS'

const tabs = [
  { id: 'overview', text: 'Overview', icon: LayoutGrid },
  { id: 'telemetry', text: 'Telemetry', icon: Activity },
  { id: 'network', text: 'Network', icon: Network },
  { id: 'impact', text: 'Impact', icon: Sprout },
  { id: 'learn', text: 'Learn', icon: BookOpen },
] as const
type Tab = typeof tabs[number]['id']

function tabFromUrl(): Tab {
  const current = window.location.hash.slice(1)
  if (current.startsWith('learn-') || (!current && /^\/learn\/?$/.test(window.location.pathname))) return 'learn'
  return tabs.find(tab => tab.id === current)?.id ?? 'overview'
}

const scenarios = [
  { label: 'Early network', units: 50 },
  { label: 'Growing network', units: 500 },
  { label: 'Wide coverage', units: 5000 },
]

function DeferredMap(props: ComponentProps<typeof SiteMap>) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (visible || !ref.current) return
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) setVisible(true)
    }, { rootMargin: '160px' })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [visible])
  const placeholder = <div className="world-map map-placeholder">World map loads as you scroll</div>
  return <div ref={ref}>{visible ? <Suspense fallback={<div className="world-map map-placeholder" role="status">Loading world map…</div>}><SiteMap {...props} /></Suspense> : placeholder}</div>
}

function LocationPicker({ active, listedSites, select, add, selectionVersion }: {
  active: Site; listedSites: Site[]; select: (site: Site) => void; add: (site: Site) => void
  selectionVersion: number
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Site[]>([])
  const [status, setStatus] = useState('')
  const controller = useRef<AbortController>(null)
  useEffect(() => {
    controller.current?.abort()
    setStatus('')
    setResults([])
  }, [selectionVersion])
  useEffect(() => () => controller.current?.abort(), [])
  function clearSearch() {
    controller.current?.abort()
    setStatus('')
    setResults([])
  }
  async function find(event: FormEvent) {
    event.preventDefault()
    clearSearch()
    if (query.trim().length < 2) return setStatus('Enter at least two characters.')
    const request = new AbortController()
    controller.current = request
    setStatus('Searching locations…')
    try {
      const matches = await searchSites(query.trim(), request.signal)
      if (!request.signal.aborted) {
        setResults(matches)
        setStatus(matches.length ? '' : 'No locations found. Try another name or click the map.')
      }
    } catch {
      if (!request.signal.aborted) setStatus('Search unavailable. You can still click the map to add a location.')
    }
  }
  return <div className="location-control">
    <form className="search-form" onSubmit={find}><label className="sr-only" htmlFor="place">Search locations</label><Search size={16} /><input id="place" placeholder="Search for a location" value={query} onChange={event => { setQuery(event.target.value); clearSearch() }} autoComplete="off" /><button type="submit">Search</button></form>
    {status && <p className="fine search-status" role="status">{status}</p>}
    {results.length > 0 && <ul className="search-results">{results.map(site => <li key={site.id}><button onClick={() => { add(site); clearSearch(); setQuery('') }}><Plus size={16} /><span>{site.name}<small>{site.region}</small></span></button></li>)}</ul>}
    <label className="site-select"><MapPin size={15} /><span className="sr-only">Explore a location</span><select value={active.id} onChange={event => {
      const selected = listedSites.find(site => site.id === event.target.value)
      if (selected) select(selected)
    }}>{listedSites.map(site => <option key={site.id} value={site.id}>{site.name}, {site.region}</option>)}</select></label>
  </div>
}

function App() {
  const [tab, setTab] = useState(tabFromUrl)
  const [scenario, setScenario] = useState(scenarios[1])
  const [locations, setLocations] = useState(readLocations)
  const [selectionVersion, setSelectionVersion] = useState(0)
  const listedSites = [...sites, ...locations.custom]
  const active = listedSites.find(site => site.id === locations.selectedId) ?? sites[0]
  const units = scenario.units
  useEffect(() => saveLocations(locations), [locations])
  useEffect(() => {
    const sync = () => setTab(tabFromUrl())
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])
  useEffect(() => {
    if (tab !== 'overview') return
    const anchor = window.location.hash
    if (anchor === '#coverage' || anchor === '#pilot') document.getElementById(anchor.slice(1))?.scrollIntoView()
  }, [tab])
  function selectSite(site: Site) {
    setLocations(previous => ({ ...previous, selectedId: site.id }))
    setSelectionVersion(version => version + 1)
  }
  function addSite(site: Site) {
    setLocations(previous => {
      const existing = nearestSite(site, [...sites, ...previous.custom])
      return { custom: existing ? previous.custom : [...previous.custom, site], selectedId: (existing ?? site).id }
    })
    setSelectionVersion(version => version + 1)
  }
  function addPin(latitude: number, longitude: number) {
    const lat = Number(latitude.toFixed(4))
    const lon = Number(longitude.toFixed(4))
    const id = lat + ',' + lon
    addSite({ id, name: 'Pinned location', region: id, lat, lon })
  }
  function showTab(next: Tab) {
    setTab(next)
    window.location.hash = next
    window.scrollTo(0, 0)
  }
  return <>
    <a className="skip" href="#main">Skip to content</a>
    <header className="header"><div className="shell nav-shell">
      <button className="brand" onClick={() => showTab('overview')} aria-label="AGIS overview"><img src="/agis.svg" alt="" width="36" height="36" /><span><strong>AGIS</strong><small>Agricultural intelligence</small></span></button>
      <nav aria-label="Dashboard views">{tabs.map(({ id, text, icon: Icon }) => <button key={id} aria-current={tab === id ? 'page' : undefined} onClick={() => showTab(id)}><Icon size={16} /><span>{text}</span></button>)}</nav>
      <a className="source-link" href={firmware} target="_blank" rel="noopener noreferrer">Firmware <ArrowUpRight size={15} /></a>
    </div></header>
    <main className="shell main" id="main">
      {tab === 'overview' ? <>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-content"><div className="eyebrow"><span className="eyebrow-dot" /> Open-source concept demo</div><h1 id="hero-title">From greenhouse data<br className="desktop-break" /> to better forecasts</h1><p>The <a href={firmware} target="_blank" rel="noopener noreferrer">open-source ESP32 controller</a> reads DHT11 temperature and humidity and water flow, runs the pump and fan with local PID control, and streams readings over WebSocket.</p><div className="hero-actions"><a href="#coverage" className="primary-button">Explore the scenarios <ArrowDown size={16} /></a><a href="#pilot" className="quiet-button">Plan a pilot <ArrowDown size={16} /></a></div></div>
          <img className="hero-art" src="/greenhouse.svg" alt="" />
        </section>
        <section className="coverage" id="coverage" aria-labelledby="coverage-title">
          <div className="coverage-heading"><div><div className="eyebrow"><Globe2 size={16} /> Coverage explorer</div><h2 id="coverage-title">What changes as coverage grows?</h2><p>Compare three adoption scenarios. Outputs are modeled, not field results.</p></div>
            <div className="scenario-picker" role="group" aria-label="Adoption scenario">{scenarios.map(item => <button key={item.units} aria-pressed={units === item.units} onClick={() => setScenario(item)}>{item.label}<strong>{number(item.units)} units</strong></button>)}</div>
          </div>
          <CoverageStats units={units} />
          <div className="explore-grid">
            <section className="card map-card" aria-labelledby="map-title"><div className="panel-heading"><div><div className="eyebrow"><MapPin size={16} /> World map</div><h3 id="map-title">Explore a location</h3><p>Example locations, not active deployments.</p></div></div>
              <LocationPicker active={active} listedSites={listedSites} select={selectSite} add={addSite} selectionVersion={selectionVersion} />
              <DeferredMap sites={listedSites} active={active} select={selectSite} add={addPin} />
              <p className="fine map-note"><Plus size={14} /> Click the map or search to add a location.</p>
            </section>
            <WeatherPanel site={active} />
          </div>
          <div className="under-grid"><span><CircleHelp size={15} /> Weather sites are independent of the hypothetical coverage scenarios.</span><button className="quiet-button" onClick={() => showTab('impact')}>View economics and assumptions <ArrowUpRight size={15} /></button></div>
        </section>
        <Pilot />
      </> : <Suspense fallback={<p className="view-loading" role="status">Loading view…</p>}>
        {tab === 'telemetry' ? <NodeView /> : tab === 'network' ? <NetworkView /> : tab === 'learn' ? <LearnView /> : <><ImpactView units={units} /><Pilot /></>}
      </Suspense>}
    </main>
    <footer><div className="shell footer-shell"><span>Open-source · <a href={firmware} target="_blank" rel="noopener noreferrer">github.com/Tnzr/AGIS</a></span><div className="footer-links"><a href="https://pioneerinnovations.org" target="_blank" rel="noopener noreferrer">Pioneer Innovations Collective <ArrowUpRight size={14} /></a><a href={contact}>Contact us <Mail size={14} /></a></div></div></footer>
  </>
}

createRoot(document.getElementById('root')!).render(<App />)
