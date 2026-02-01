import { useEffect, useMemo, useState } from 'react'
import { Modal } from 'components/ui/Modal'
import { Alert } from 'components/ui/Alert'
import { GoogleMap, Marker, Polygon, useJsApiLoader } from '@react-google-maps/api'
import { type Cliente, type ZonaComercial, type ListaPrecio } from '../../services/clientesApi'
import type { ZonaOption } from 'components/ui/ClienteForm'

import { GOOGLE_MAP_LIBRARIES, GOOGLE_MAP_SCRIPT_ID, GOOGLE_MAPS_API_KEY } from '../../../../config/googleMaps'

const mapStyle = { width: '100%', height: '320px' }
const defaultCenter: google.maps.LatLngLiteral = { lat: -0.180653, lng: -78.467834 }

interface ClienteDetailModalProps {
  isOpen: boolean
  onClose: () => void
  cliente: Cliente | null
  zonas: ZonaComercial[]
  listasPrecios: ListaPrecio[]
}

export function ClienteDetailModal({ isOpen, onClose, cliente, zonas, listasPrecios }: ClienteDetailModalProps) {
  const [error, setError] = useState<string | null>(null)

  const { isLoaded, loadError } = useJsApiLoader({
    id: GOOGLE_MAP_SCRIPT_ID,
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAP_LIBRARIES
  })

  const zona = useMemo(() => zonas.find((z) => String(z.id) === String(cliente?.zona_comercial_id || '')) || cliente?.zona_comercial, [cliente, zonas])

  const zonaPath = useMemo(() => {
    if (!zona || !(zona as any)?.poligono_geografico) return []
    return parseGeoPolygon((zona as any).poligono_geografico)
  }, [zona])

  const mainLocation = useMemo(() => {
    if (!cliente) return null
    let lat: number | null = null
    let lng: number | null = null

    if (cliente.ubicacion_gps?.coordinates) {
      lng = cliente.ubicacion_gps.coordinates[0]
      lat = cliente.ubicacion_gps.coordinates[1]
    } else if (cliente.latitud !== null && cliente.longitud !== null &&
      cliente.latitud !== undefined && cliente.longitud !== undefined) {
      lat = Number(cliente.latitud)
      lng = Number(cliente.longitud)
    }

    if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
      return { lat, lng }
    }
    return null
  }, [cliente])

  const mapCenter = mainLocation || zonaPath[0] || defaultCenter

  const listaNombre = cliente?.lista_precios?.nombre || listasPrecios.find(l => l.id === cliente?.lista_precios_id)?.nombre
  const zonaNombre = cliente?.zona_comercial?.nombre || zona?.nombre

  const creditoDisponible = cliente?.tiene_credito && cliente.limite_credito
    ? (parseFloat(cliente.limite_credito) - parseFloat(cliente.saldo_actual || '0')).toFixed(2)
    : '0.00'

  const zonasOptions = useMemo(() => zonas.map((z) => ({ id: z.id, nombre: z.nombre, poligono_geografico: (z as any).poligono_geografico })) as ZonaOption[], [zonas])

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Detalle del Cliente">
        <div className="p-6 text-center text-red-600">
          No se ha configurado la API Key de Google Maps
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalle del Cliente" headerGradient="red" maxWidth="2xl">
      {!cliente && <p className="text-sm text-gray-600">Selecciona un cliente para ver detalles.</p>}
      {cliente && (
        <div className="space-y-4">
          {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-lg font-bold text-gray-900">{cliente.razon_social}</p>
              {cliente.nombre_comercial && <p className="text-sm text-gray-600">{cliente.nombre_comercial}</p>}
              {(cliente.nombres || cliente.apellidos) && (
                <p className="text-sm text-gray-700">
                  Contacto: {[cliente.nombres, cliente.apellidos].filter(Boolean).join(' ')}
                </p>
              )}
              {cliente.email && <p className="text-sm text-gray-700">Email: {cliente.email}</p>}
              <p className="text-sm text-gray-700">{cliente.tipo_identificacion}: {cliente.identificacion}</p>
              {cliente.direccion_texto && <p className="text-sm text-gray-700">Dirección: {cliente.direccion_texto}</p>}
              {zonaNombre && <p className="text-sm text-gray-700">Zona: {zonaNombre}</p>}
              {listaNombre && <p className="text-sm text-gray-700">Lista de precios: {listaNombre}</p>}
              <p className="text-xs text-gray-500">Creado: {new Date(cliente.created_at).toLocaleDateString('es-ES')}</p>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800">Mapa general</p>
              <span className="text-xs text-gray-500">Pin rojo: matriz</span>
            </div>
            {!GOOGLE_MAPS_API_KEY && <p className="text-xs text-yellow-700">Configura VITE_GOOGLE_MAPS_API_KEY para ver el mapa.</p>}
            {loadError && <p className="text-xs text-red-700">No se pudo cargar Google Maps.</p>}
            {!isLoaded && !loadError && (
              <div className="flex h-[320px] items-center justify-center rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600">Cargando mapa...</p>
              </div>
            )}
            {isLoaded && !loadError && GOOGLE_MAPS_API_KEY && (
              <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                <GoogleMap
                  mapContainerStyle={mapStyle}
                  center={mapCenter}
                  zoom={zonaPath.length ? 13 : 12}
                  options={{
                    fullscreenControl: false,
                    mapTypeControl: false,
                    streetViewControl: false,
                    clickableIcons: false,
                  }}
                >
                  {zonaPath.length > 0 && (
                    <Polygon
                      path={zonaPath}
                      options={{
                        fillColor: '#f0412d',
                        fillOpacity: 0.15,
                        strokeColor: '#f0412d',
                        strokeOpacity: 0.7,
                        strokeWeight: 2,
                        clickable: false,
                      }}
                    />
                  )}

                  {mainLocation && (
                    <Marker
                      position={mainLocation}
                      icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' }}
                      title="Matriz"
                    />
                  )}
                </GoogleMap>
              </div>
            )}
          </div>

        </div>
      )}
    </Modal>
  )
}

function parseGeoPolygon(value: unknown): google.maps.LatLngLiteral[] {
  if (!value) return []

  // Si es un string, intentar parsear JSON
  if (typeof value === 'string') {
    if (value.startsWith('{')) {
      try {
        return parseGeoPolygon(JSON.parse(value))
      } catch (e) {
        return []
      }
    }
    return []
  }

  if (typeof value !== 'object' || value === null) return []

  const obj = value as any

  // Manejar tipo Feature de GeoJSON
  if (obj.type === 'Feature' && obj.geometry) {
    return parseGeoPolygon(obj.geometry)
  }

  // Buscar coordenadas recursivamente si es necesario (MultiPolygon o GeometryCollection)
  let coords: any = obj.coordinates || obj.zonaGeom?.coordinates || obj.zona_geom?.coordinates || obj.points

  if (Array.isArray(coords)) {
    // Intentar encontrar el anillo exterior (primer array de puntos)
    // GeoJSON Polygon: [[[lng, lat], ...]]
    // GeoJSON MultiPolygon: [[[[lng, lat], ...]]]
    let ring = coords
    while (Array.isArray(ring[0]) && ring.length > 0 && Array.isArray(ring[0][0])) {
      ring = ring[0]
    }

    const path = ring
      .map((pair: any) => {
        // Formato {lat, lng} o {latitude, longitude}
        if (typeof pair === 'object' && pair !== null) {
          const lat = pair.lat ?? pair.latitude ?? pair.latitud
          const lng = pair.lng ?? pair.longitude ?? pair.longitud ?? pair.lon ?? pair.long
          if (typeof lat === 'number' && typeof lng === 'number') {
            return { lat, lng }
          }
        }
        // Formato [lng, lat] (GeoJSON estándar)
        if (Array.isArray(pair) && pair.length >= 2) {
          const [lng, lat] = pair
          if (typeof lat === 'number' && typeof lng === 'number') {
            return { lat, lng }
          }
        }
        return null
      })
      .filter(Boolean) as google.maps.LatLngLiteral[]

    return dedupeClosingPoint(path)
  }

  return []
}

function dedupeClosingPoint(path: google.maps.LatLngLiteral[]): google.maps.LatLngLiteral[] {
  if (path.length < 2) return path
  const first = path[0]
  const last = path[path.length - 1]
  if (first.lat === last.lat && first.lng === last.lng) {
    return path.slice(0, -1)
  }
  return path
}
