import { sites, type Site } from './model.ts'

type SavedLocations = { custom: Site[]; selectedId: string }
const legacyKey = 'agis-locations-v1'
const locationPrefix = 'agis-location-v2:'
const selectedKey = 'agis-selected-location-v2'
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

function readJson(key: string) {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch {}
}

function mergeCustom(existing: Site[], additions: unknown[]) {
  const custom = [...existing]
  for (const site of additions) {
    if (validSite(site) && !nearestSite(site, [...sites, ...custom])) custom.push(site)
  }
  return custom
}

export function readLocations(): SavedLocations {
  try {
    const old = readJson(legacyKey)
    const additions: Site[] = []
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index)
      if (key?.startsWith(locationPrefix)) {
        const site = readJson(key)
        if (validSite(site)) additions.push(site)
      }
    }
    const custom = mergeCustom([], [...(Array.isArray(old?.custom) ? old.custom : []), ...additions])
    const selected = localStorage.getItem(selectedKey) ?? old?.selectedId
    const selectedSite = [...sites, ...custom].find(site => site.id === selected)
    const savedSelection = additions.find(site => site.id === selected)
    const selectedId = selectedSite?.id ?? (savedSelection && nearestSite(savedSelection, [...sites, ...custom])?.id) ?? sites[0].id
    return { custom, selectedId }
  } catch {
    return { custom: [], selectedId: sites[0].id }
  }
}

export function isLocationListChange(key: string | null) {
  return key === null || key === legacyKey || key.startsWith(locationPrefix)
}

export function saveSelection(id: string) {
  try {
    localStorage.setItem(selectedKey, id)
  } catch {}
}

export function addLocation(site: Site, existing: Site[]): SavedLocations {
  const custom = mergeCustom(readLocations().custom, existing)
  const match = nearestSite(site, [...sites, ...custom])
  if (!match) {
    custom.push(site)
    try {
      localStorage.setItem(locationPrefix + site.id, JSON.stringify(site))
    } catch {}
  }
  const selectedId = (match ?? site).id
  saveSelection(selectedId)
  return { custom, selectedId }
}
