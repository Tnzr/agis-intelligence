import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Site } from './model.ts'
import { onLand, type Land } from './land.ts'

export function SiteMap({ sites, active, select, add }: {
  sites: Site[]; active: Site; select: (site: Site) => void; add: (lat: number, lon: number) => void
}) {
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map>(null)
  const markers = useRef<L.LayerGroup>(null)
  const actions = useRef({ select, add })
  const [notice, setNotice] = useState('')
  actions.current = { select, add }

  useEffect(() => {
    if (!container.current) return
    const controller = new AbortController()
    let boundaries: Land | undefined
    let unavailable = false
    const instance = L.map(container.current, {
      minZoom: 0.5, maxZoom: 12, zoomSnap: 0.25, scrollWheelZoom: false,
      maxBounds: [[-85, -180], [85, 180]], attributionControl: false,
    }).setView([15, 9], container.current.clientWidth < 520 ? 0.5 : 1.25)
    L.control.attribution({
      prefix: '<a href="https://leafletjs.com/" target="_blank" rel="noopener noreferrer">Leaflet</a>',
    }).addTo(instance)
    fetch('/world-land.json', { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Land boundaries unavailable')
        return response.json()
      })
      .then((land: Land) => {
        if (controller.signal.aborted) return
        boundaries = land
        L.geoJSON(land, {
          attribution: '<a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth</a>',
          interactive: false,
          style: { color: '#a9bca1', fillColor: '#f1f4e8', weight: 1, fillOpacity: 1 },
        }).addTo(instance)
      })
      .catch(() => {
        unavailable = true
        if (!controller.signal.aborted) setNotice('Land boundaries are unavailable. Search for a location instead.')
      })
    instance.on('click', event => {
      const { lat, lng } = event.latlng.wrap()
      if (!boundaries) {
        setNotice(unavailable ? 'Land boundaries are unavailable. Search for a location instead.' : 'Loading land boundaries. Try again in a moment.')
        return
      }
      if (Math.abs(lat) > 85 || !onLand(lat, lng, boundaries)) {
        setNotice('This point is in open water; pick a location on land.')
        return
      }
      setNotice('')
      actions.current.add(lat, lng)
    })
    markers.current = L.layerGroup().addTo(instance)
    map.current = instance
    const resize = new ResizeObserver(() => instance.invalidateSize({ pan: false }))
    resize.observe(container.current)
    return () => {
      controller.abort()
      resize.disconnect()
      instance.remove()
      map.current = null
      markers.current = null
    }
  }, [])

  useEffect(() => setNotice(''), [active.id])

  useEffect(() => {
    const group = markers.current
    if (!group) return
    group.clearLayers()
    for (const site of sites) {
      const icon = L.divIcon({
        className: site.id === active.id ? 'map-pin selected' : 'map-pin',
        iconSize: [19, 19], iconAnchor: [9, 9],
      })
      const label = document.createElement('span')
      label.textContent = site.name
      L.marker([site.lat, site.lon], { icon, title: site.name, alt: site.name, zIndexOffset: site.id === active.id ? 100 : 0 })
        .bindTooltip(label, { direction: 'top' })
        .on('click', () => {
          setNotice('')
          actions.current.select(site)
        })
        .addTo(group)
    }
    if (map.current && !map.current.getBounds().pad(-0.06).contains([active.lat, active.lon])) {
      map.current.panTo([active.lat, active.lon], { animate: false })
    }
  }, [sites, active])

  return <><div className="world-map" ref={container} aria-label="World map of example sensor locations" />
    {notice && <p className="fine map-note" role="status">{notice}</p>}</>
}
