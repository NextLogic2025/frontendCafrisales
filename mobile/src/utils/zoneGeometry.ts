export type MapPoint = { latitude: number; longitude: number }

type GeoJsonGeometry =
  | { type: 'Feature'; geometry?: GeoJsonGeometry | null }
  | { type: 'Polygon'; coordinates: number[][][] }
  | { type: 'MultiPolygon'; coordinates: number[][][][] }

const EPSILON = 1e-10

const pointsEqual = (a: MapPoint, b: MapPoint) =>
  Math.abs(a.latitude - b.latitude) < EPSILON &&
  Math.abs(a.longitude - b.longitude) < EPSILON

const normalizeRing = (points: MapPoint[]) => {
  if (points.length < 2) return points
  const last = points[points.length - 1]
  const first = points[0]
  return pointsEqual(last, first) ? points.slice(0, -1) : points
}

export const ensureClosedRing = (points: MapPoint[]) => {
  if (points.length === 0) return points
  const ring = normalizeRing(points)
  return pointsEqual(ring[0], ring[ring.length - 1]) ? ring : [...ring, ring[0]]
}

export const toMultiPolygon = (points: MapPoint[]) => {
  if (points.length < 3) return null
  const ring = ensureClosedRing(points).map((point) => [point.longitude, point.latitude])
  return {
    type: 'MultiPolygon' as const,
    coordinates: [[ring]],
  }
}

const coordsToPoints = (coords: number[][]) =>
  coords.map((pair) => ({ longitude: pair[0], latitude: pair[1] }))

export const extractPolygons = (geometry?: GeoJsonGeometry | null): MapPoint[][] => {
  if (!geometry) return []
  if (geometry.type === 'Feature') {
    return geometry.geometry ? extractPolygons(geometry.geometry) : []
  }
  if (geometry.type === 'Polygon') {
    if (!geometry.coordinates?.length) return []
    return [coordsToPoints(geometry.coordinates[0])]
  }
  if (geometry.type === 'MultiPolygon') {
    if (!geometry.coordinates?.length) return []
    return geometry.coordinates
      .map((polygon) => polygon?.[0])
      .filter((ring): ring is number[][] => Array.isArray(ring))
      .map(coordsToPoints)
  }
  return []
}

const cross = (a: MapPoint, b: MapPoint, c: MapPoint) =>
  (b.longitude - a.longitude) * (c.latitude - a.latitude) -
  (b.latitude - a.latitude) * (c.longitude - a.longitude)

const onSegment = (a: MapPoint, b: MapPoint, c: MapPoint) =>
  Math.min(a.longitude, b.longitude) - EPSILON <= c.longitude &&
  c.longitude <= Math.max(a.longitude, b.longitude) + EPSILON &&
  Math.min(a.latitude, b.latitude) - EPSILON <= c.latitude &&
  c.latitude <= Math.max(a.latitude, b.latitude) + EPSILON

const segmentsIntersect = (p1: MapPoint, p2: MapPoint, q1: MapPoint, q2: MapPoint) => {
  const d1 = cross(p1, p2, q1)
  const d2 = cross(p1, p2, q2)
  const d3 = cross(q1, q2, p1)
  const d4 = cross(q1, q2, p2)

  if (((d1 > EPSILON && d2 < -EPSILON) || (d1 < -EPSILON && d2 > EPSILON)) &&
      ((d3 > EPSILON && d4 < -EPSILON) || (d3 < -EPSILON && d4 > EPSILON))) {
    return true
  }

  if (Math.abs(d1) <= EPSILON && onSegment(p1, p2, q1)) return true
  if (Math.abs(d2) <= EPSILON && onSegment(p1, p2, q2)) return true
  if (Math.abs(d3) <= EPSILON && onSegment(q1, q2, p1)) return true
  if (Math.abs(d4) <= EPSILON && onSegment(q1, q2, p2)) return true

  return false
}

const pointInPolygon = (point: MapPoint, polygon: MapPoint[]) => {
  const ring = normalizeRing(polygon)
  if (ring.length < 3) return false
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i].longitude
    const yi = ring[i].latitude
    const xj = ring[j].longitude
    const yj = ring[j].latitude

    const intersect =
      yi > point.latitude !== yj > point.latitude &&
      point.longitude < ((xj - xi) * (point.latitude - yi)) / (yj - yi + EPSILON) + xi
    if (intersect) inside = !inside
  }
  return inside
}

export const polygonsOverlap = (polygonA: MapPoint[], polygonB: MapPoint[]) => {
  const a = normalizeRing(polygonA)
  const b = normalizeRing(polygonB)
  if (a.length < 3 || b.length < 3) return false

  for (let i = 0; i < a.length; i += 1) {
    const a1 = a[i]
    const a2 = a[(i + 1) % a.length]
    for (let j = 0; j < b.length; j += 1) {
      const b1 = b[j]
      const b2 = b[(j + 1) % b.length]
      if (segmentsIntersect(a1, a2, b1, b2)) {
        return true
      }
    }
  }

  if (pointInPolygon(a[0], b) || pointInPolygon(b[0], a)) {
    return true
  }

  return false
}
