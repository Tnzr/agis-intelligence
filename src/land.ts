import type { FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson'

export type Land = FeatureCollection<Polygon | MultiPolygon>

function insideRing(lon: number, lat: number, ring: Position[]) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [x, y] = ring[i]
    const [previousX, previousY] = ring[j]
    if ((y > lat) !== (previousY > lat) && lon < x + (previousX - x) * (lat - y) / (previousY - y)) {
      inside = !inside
    }
  }
  return inside
}

export function onLand(lat: number, lon: number, land: Land) {
  return land.features.some(({ geometry }) => {
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
    return polygons.some(([outline, ...holes]) =>
      insideRing(lon, lat, outline) && !holes.some(hole => insideRing(lon, lat, hole)))
  })
}
