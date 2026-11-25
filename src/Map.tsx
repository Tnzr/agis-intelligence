import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Site } from './model.ts'

export function SiteMap({ sites, active, select, add }: {
  sites: Site[]; active: Site; select: (site: Site) => void; add: (lat: number, lon: number) => void
}) {
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map>(null)
  const markers = useRef<L.LayerGroup>(null)
  const actions = useRef({ select, add })
  actions.current = { select, add }

  useEffect(() => {
    if (!container.current) return
    const controller = new AbortController()
    const instance = L.map(container.current, {
      minZoom: 0.5, maxZoom: 12, zoomSnap: 0.25, scrollWheelZoom: false,
      maxBounds: [[-85, -180], [85, 180]],
    }).setView([15, 9], container.current.clientWidth < 520 ? 0.5 : 1.25)
    fetch('/world-land.json', { signal: controller.signal })
      .then(response => response.json())
      .then(land => {
        if (!controller.signal.aborted) L.geoJSON(land, {
          attribution: '<a href="https://www.naturalearthdata.com/">Natural Earth</a>',
          interactive: false,
          style: { color: '#a9bca1', fillColor: '#f1f4e8', weight: 1, fillOpacity: 1 },
        }).addTo(instance)
      })
      .catch(() => {})
    instance.on('click', event => {
      const { lat, lng } = event.latlng.wrap()
      if (Math.abs(lat) <= 85) actions.current.add(lat, lng)
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
        .on('click', () => actions.current.select(site))
        .addTo(group)
    }
    if (map.current && !map.current.getBounds().pad(-0.06).contains([active.lat, active.lon])) {
      map.current.panTo([active.lat, active.lon], { animate: false })
    }
  }, [sites, active])

  return <div className="world-map" ref={container} aria-label="World map of example sensor locations" />
}
