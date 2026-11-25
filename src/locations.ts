import { sites, type Site } from './model.ts'

type SavedLocations = { custom: Site[]; selectedId: string }
const key = 'agis-locations-v1'
const radians = (degrees: number) => degrees * Math.PI / 180

export function nearestSite(candidate: Site, existing: Site[]) {
  const exact = existing.find(site => site.id === candidate.id)
  if (exact) return exact
  let closest: Site | undefined
  let minimum = 5
  for (const site of existing) {
    const a = Math.sin(radians(site.lat - candidate.lat) / 2) ** 2 +
      Math.cos(radians(site.lat)) * Math.cos(radians(candidate.lat)) *
      Math.sin(radians(site.lon - candidate.lon) / 2) ** 2
    const distance = 2 * 6371 * Math.asin(Math.sqrt(Math.min(1, a)))
    if (distance <= minimum) {
      closest = site
      minimum = distance
    }
  }
  return closest
}

function validSite(value: unknown): value is Site {
  if (!value || typeof value !== 'object') return false
  const { id, name, region, lat, lon } = value as Partial<Site>
  return typeof id === 'string' && typeof name === 'string' && typeof region === 'string' &&
    typeof lat === 'number' && Math.abs(lat) <= 90 && typeof lon === 'number' && Math.abs(lon) <= 180
}

export function readLocations(): SavedLocations {
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const stored = JSON.parse(raw)
      const custom: Site[] = []
      if (Array.isArray(stored.custom)) {
        for (const site of stored.custom) {
          if (validSite(site) && !nearestSite(site, [...sites, ...custom])) custom.push(site)
        }
      }
      const selectedId = [...sites, ...custom].find(site => site.id === stored.selectedId)?.id ?? sites[0].id
      return { custom, selectedId }
    }
  } catch {}
  return { custom: [], selectedId: sites[0].id }
}

export function saveLocations(locations: SavedLocations) {
  try {
    localStorage.setItem(key, JSON.stringify(locations))
  } catch {}
}
