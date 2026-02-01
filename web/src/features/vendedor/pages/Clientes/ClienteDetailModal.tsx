import { useEffect, useMemo, useState } from 'react'
import { GoogleMap, Polygon, useJsApiLoader } from '@react-google-maps/api'
import AdvancedMarker from '../../../../components/google/AdvancedMarker'

import { Modal } from '../../../../components/ui/Modal'
import type { Cliente } from '../../../supervisor/services/clientesApi'
import { obtenerZonaPorId, type ZonaComercial } from '../../../supervisor/services/zonasApi'

import { GOOGLE_MAP_LIBRARIES, GOOGLE_MAP_SCRIPT_ID, GOOGLE_MAPS_API_KEY } from '../../../../config/googleMaps'

const mapStyle = { width: '100%', height: '320px' }
const defaultCenter: google.maps.LatLngLiteral = { lat: -0.180653, lng: -78.467834 }

interface ClienteDetailModalProps {
  isOpen: boolean
  onClose: () => void
  cliente: Cliente | null
}

export function ClienteDetailModal({ isOpen, onClose, cliente }: ClienteDetailModalProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: GOOGLE_MAP_SCRIPT_ID,
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAP_LIBRARIES
  })

  // State to hold full zone data (with polygon)
  const [fullZona, setFullZona] = useState<ZonaComercial | null>(null)

  useEffect(() => {
    // Clean up or reset when modal closes or client changes
    if (!isOpen || !cliente) {
      setFullZona(null)
      return
    }

    // Fetch full zone if we have an ID
    const fetchZone = async () => {
      if (cliente.zona_comercial_id) {
        try {
          const z = await obtenerZonaPorId(String(cliente.zona_comercial_id))
          setFullZona(z)
        } catch (e) {
        }
      } else {
        setFullZona(null)
      }
    }
    fetchZone()

  }, [isOpen, cliente])

  const modalTitle = getClienteDisplayName(cliente)
  const secondaryName = cliente ? getClienteSecondaryName(cliente, modalTitle) : null

  // Use the fetched full zone for polygon data, or fallback to the one in cliente if available
  const zona = fullZona || (cliente?.zona_comercial as any)

  const zonaPath = useMemo(() => {
    if (!zona || !zona.poligono_geografico) return []
    try {
      return parseGeoPolygon(zona.poligono_geografico)
    } catch (e) {
      return []
    }
  }, [zona])

  const mainLocation = useMemo(() => {
    if (!cliente) return null
    if (cliente.ubicacion_gps?.coordinates) {
      return { lat: cliente.ubicacion_gps.coordinates[1], lng: cliente.ubicacion_gps.coordinates[0] }
    }
    if (cliente.latitud != null && cliente.longitud != null) {
      return { lat: cliente.latitud, lng: cliente.longitud }
    }
    return null
  }, [cliente])

  const mapCenter = mainLocation || (zonaPath.length > 0 ? zonaPath[0] : defaultCenter)

  const listaNombre = cliente?.lista_precios?.nombre ?? (cliente?.lista_precios_id ? `Lista ${cliente.lista_precios_id}` : null)
  const zonaNombre = zona?.nombre ?? (cliente?.zona_comercial_id ? `Zona ${cliente.zona_comercial_id}` : null)

  const creditoDisponible = cliente?.tiene_credito && cliente.limite_credito
    ? (parseFloat(cliente.limite_credito) - parseFloat(cliente.saldo_actual || '0')).toFixed(2)
    : '0.00'

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
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} headerGradient="red" maxWidth="2xl">
      {!cliente && <p className="text-sm text-neutral-600">Selecciona un cliente para ver detalles.</p>}
      {cliente && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-lg font-bold text-neutral-900">{modalTitle}</p>
              {secondaryName && <p className="text-sm text-neutral-600">{secondaryName}</p>}
              <p className="text-sm text-neutral-700">
                {cliente.tipo_identificacion}: {cliente.identificacion}
              </p>
              {cliente.direccion_texto && <p className="text-sm text-neutral-700">Dirección: {cliente.direccion_texto}</p>}
              {zonaNombre && <p className="text-sm text-neutral-700">Zona: {zonaNombre}</p>}
              {listaNombre && <p className="text-sm text-neutral-700">Lista de precios: {listaNombre}</p>}
              <p className="text-xs text-neutral-500">Creado: {new Date(cliente.created_at).toLocaleDateString('es-EC')}</p>
            </div>
            <div className="space-y-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-600">Crédito</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-neutral-500">Límite</p>
                  <p className="font-semibold text-neutral-900">${cliente.limite_credito}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Saldo</p>
                  <p className="font-semibold text-neutral-900">${cliente.saldo_actual}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Disponible</p>
                  <p className="font-semibold text-emerald-600">${creditoDisponible}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Plazo</p>
                  <p className="font-semibold text-neutral-900">{cliente.dias_plazo} días</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-neutral-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-neutral-800">Mapa general</p>
              <span className="text-xs text-neutral-500">Pin rojo: matriz</span>
            </div>
            {!GOOGLE_MAPS_API_KEY && <p className="text-xs text-amber-700">Configura VITE_GOOGLE_MAPS_API_KEY para visualizar el mapa.</p>}
            {loadError && <p className="text-xs text-red-700">No se pudo cargar Google Maps.</p>}
            {!isLoaded && !loadError && (
              <div className="flex h-[320px] items-center justify-center rounded-lg bg-neutral-50 text-sm text-neutral-600">
                Cargando mapa...
              </div>
            )}
            {isLoaded && !loadError && GOOGLE_MAPS_API_KEY && (
              <div className="overflow-hidden rounded-lg border border-neutral-200 shadow-sm">
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
                    <AdvancedMarker position={mainLocation} icon="http://maps.google.com/mapfiles/ms/icons/red-dot.png" title="Matriz" />
                  )}
                </GoogleMap>
              </div>
            )}
            {mainLocation && (
              <div className="flex justify-end">
                <a
                  href={buildDirectionsUrl(mainLocation.lat, mainLocation.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-red transition hover:text-brand-red-dark"
                >
                  Ver ruta en Google Maps
                </a>
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

  if (typeof value === 'string') {
    try {
      return parseGeoPolygon(JSON.parse(value))
    } catch (error) {
      return []
    }
  }

  // Helper to check if an array is a linear ring (Array of [lng, lat])
  const isRing = (arr: any[]) => {
    if (!Array.isArray(arr) || arr.length === 0) return false
    // Check first element
    const first = arr[0]
    return Array.isArray(first) && first.length >= 2 && typeof first[0] === 'number'
  }

  // Helper to find the first ring in a nested structure
  const findRing = (data: any): any[] | null => {
    if (!Array.isArray(data)) return null
    if (isRing(data)) return data

    // DFS to find ring
    for (const item of data) {
      if (Array.isArray(item)) {
        const found = findRing(item)
        if (found) return found
      }
    }
    return null
  }

  let coordinates: any[] | null = null

  if (typeof value === 'object' && 'coordinates' in (value as any)) {
    // GeoJSON object
    coordinates = (value as any).coordinates
  } else if (Array.isArray(value)) {
    // Raw array
    coordinates = value
  }

  if (!coordinates) {
    return []
  }

  const ring = findRing(coordinates)

  if (ring) {
    const path = ring.map((pair: any) => {
      if (!Array.isArray(pair) || pair.length < 2) return null
      return { lat: pair[1], lng: pair[0] } // GeoJSON [lng, lat]
    }).filter(Boolean) as google.maps.LatLngLiteral[]

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

function buildDirectionsUrl(lat: number, lng: number): string {
  const destination = `${lat},${lng}`
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
}

export function getClienteDisplayName(cliente: Cliente | null | undefined): string {
  if (!cliente) return 'Detalle del Cliente'
  const candidates: Array<unknown> = [
    (cliente as any)?.contacto_nombre,
    (cliente as any)?.nombre_cliente,
    cliente.nombre_comercial,
    cliente.razon_social,
  ]
  for (const candidate of candidates) {
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim()
      if (trimmed.length > 0) return trimmed
    }
  }
  return 'Detalle del Cliente'
}

export function getClienteSecondaryName(cliente: Cliente, primary: string): string | null {
  const primaryLower = primary.toLowerCase()
  const candidates: Array<unknown> = [
    cliente.razon_social,
    cliente.nombre_comercial,
    (cliente as any)?.contacto_nombre,
    (cliente as any)?.nombre_cliente,
  ]
  for (const candidate of candidates) {
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim()
      if (trimmed.length > 0 && trimmed.toLowerCase() !== primaryLower) {
        return trimmed
      }
    }
  }
  return null
}
