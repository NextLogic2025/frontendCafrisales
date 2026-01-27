import { TextField } from './TextField'
import { GoogleMap, Polygon, Marker, useJsApiLoader } from '@react-google-maps/api'
import { useMemo, useState, useEffect } from 'react'

import { GOOGLE_MAP_LIBRARIES, GOOGLE_MAP_SCRIPT_ID, GOOGLE_MAPS_API_KEY } from '../../config/googleMaps'

export type ClienteFormValues = {
  nombres: string
  apellidos: string
  contacto_email: string
  contacto_telefono: string
  contacto_password: string
  identificacion: string
  tipo_identificacion: string
  razon_social: string
  nombre_comercial: string
  direccion_texto: string
  canal_id: number | null
  zona_comercial_id: number | null
  vendedor_asignado_id?: string | null
  latitud?: number | null
  longitud?: number | null
  ubicacion_gps?: { type: 'Point'; coordinates: [number, number] } | null
}

export type ZonaOption = {
  id: number;
  nombre: string;
  descripcion?: string;
  poligono_geografico?: unknown;
  vendedor_asignado?: {
    id: number
    vendedor_usuario_id: string
    nombre_vendedor_cache: string | null
  } | null
}

export type CanalOption = { id: number; nombre: string; codigo: string }

export const TIPOS_IDENTIFICACION = ['RUC', 'Cédula', 'Pasaporte']

export const CLIENTE_FORM_DEFAULT: ClienteFormValues = {
  nombres: '',
  apellidos: '',
  contacto_email: '',
  contacto_telefono: '',
  contacto_password: '',
  identificacion: '',
  tipo_identificacion: 'RUC',
  razon_social: '',
  nombre_comercial: '',
  direccion_texto: '',
  canal_id: null,
  zona_comercial_id: null,
  vendedor_asignado_id: null,
  latitud: null,
  longitud: null,
  ubicacion_gps: null,
}

export function validateClienteForm(value: ClienteFormValues, mode: 'create' | 'edit'): Record<string, string> {
  const newErrors: Record<string, string> = {}

  // Solo validar datos de acceso en modo crear
  if (mode === 'create') {
    if (!value.nombres.trim()) {
      newErrors.nombres = 'El nombre es requerido'
    }
    if (!value.apellidos.trim()) {
      newErrors.apellidos = 'El apellido es requerido'
    }

    if (!value.contacto_email.trim()) {
      newErrors.contacto_email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.contacto_email)) {
      newErrors.contacto_email = 'Email inválido'
    }

    if (!value.contacto_password) {
      newErrors.contacto_password = 'La contraseña es requerida'
    } else if (value.contacto_password.length < 6) {
      newErrors.contacto_password = 'La contraseña debe tener al menos 8 caracteres'
    }
  }

  if (!value.identificacion.trim()) {
    newErrors.identificacion = 'La identificación es requerida'
  }

  if (!value.razon_social.trim()) {
    newErrors.razon_social = 'La razón social es requerida'
  }

  if (!value.zona_comercial_id) {
    newErrors.zona_comercial_id = 'La zona es requerida'
  }

  return newErrors
}

interface ClienteFormProps {
  value: ClienteFormValues
  errors: Record<string, string>
  mode: 'create' | 'edit'
  isSubmitting: boolean
  isCatalogLoading: boolean
  zonas: ZonaOption[]
  canales: CanalOption[]
  vendedores?: { id: string; nombre: string }[]
  onChange: (next: ClienteFormValues) => void
  step?: 1 | 2 | 3
}

export function ClienteForm({
  value,
  errors,
  mode,
  isSubmitting,
  isCatalogLoading,
  zonas,
  canales,
  vendedores = [],
  onChange,
  step = 1,
}: ClienteFormProps) {
  const update = <K extends keyof ClienteFormValues>(key: K, val: ClienteFormValues[K]) => {
    onChange({ ...value, [key]: val })
  }

  // Load Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    id: GOOGLE_MAP_SCRIPT_ID,
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAP_LIBRARIES,
  })

  // === STEP 1: Cuenta del cliente ===
  if (step === 1) {
    return (
      <div className="space-y-4">
        {mode === 'create' ? (
          <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
            <p className="text-sm font-semibold text-gray-800">Cuenta del cliente</p>
            <p className="text-xs text-gray-500 -mt-3">Datos del usuario y contacto.</p>

            <TextField
              label="Nombres"
              tone="light"
              placeholder="Ej. Ana Maria"
              value={value.nombres}
              onChange={(e) => update('nombres', e.target.value)}
              error={errors.nombres}
              disabled={isSubmitting}
            />

            <TextField
              label="Apellidos"
              tone="light"
              placeholder="Ej. Gomez"
              value={value.apellidos}
              onChange={(e) => update('apellidos', e.target.value)}
              error={errors.apellidos}
              disabled={isSubmitting}
            />

            <TextField
              label="Email"
              tone="light"
              type="email"
              placeholder="correo@empresa.com"
              value={value.contacto_email}
              onChange={(e) => update('contacto_email', e.target.value)}
              error={errors.contacto_email}
              disabled={isSubmitting}
            />

            <TextField
              label="Teléfono"
              tone="light"
              type="tel"
              placeholder="+593 999 999 999"
              value={value.contacto_telefono}
              onChange={(e) => update('contacto_telefono', e.target.value)}
              error={errors.contacto_telefono}
              disabled={isSubmitting}
            />

            <TextField
              label="Contraseña"
              tone="light"
              type="password"
              placeholder="********"
              value={value.contacto_password}
              onChange={(e) => update('contacto_password', e.target.value)}
              error={errors.contacto_password}
              disabled={isSubmitting}
            />
          </div>
        ) : (
          <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
            <p className="text-sm text-blue-800">En modo edición, los datos de acceso (usuario/contraseña) se gestionan por separado.</p>
          </div>
        )}
      </div>
    )
  }

  // === STEP 2: Datos Comerciales ===
  if (step === 2) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
          <p className="text-sm font-semibold text-gray-800">Datos comerciales</p>
          <p className="text-xs text-gray-500 -mt-3">Información del negocio.</p>

          <TextField
            label="Nombre comercial"
            tone="light"
            placeholder="Ej. Tienda Central"
            value={value.nombre_comercial}
            onChange={(e) => update('nombre_comercial', e.target.value)}
            disabled={isSubmitting}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-xs text-neutral-600">Tipo ID</label>
              <select
                value={value.tipo_identificacion}
                onChange={(e) => update('tipo_identificacion', e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-neutral-900 outline-none transition focus:border-brand-red/60 disabled:opacity-50 text-sm"
                disabled={isSubmitting}
              >
                {TIPOS_IDENTIFICACION.map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            <TextField
              label="RUC / Identificación"
              tone="light"
              placeholder="999999999999"
              value={value.identificacion}
              onChange={(e) => update('identificacion', e.target.value)}
              error={errors.identificacion}
              disabled={isSubmitting}
            />
          </div>

          <TextField
            label="Razón Social"
            tone="light"
            placeholder="Ej. Empresa S.A."
            value={value.razon_social}
            onChange={(e) => update('razon_social', e.target.value)}
            error={errors.razon_social}
            disabled={isSubmitting}
          />

          <TextField
            label="Dirección"
            tone="light"
            placeholder="Av. Principal y Secundaria"
            value={value.direccion_texto}
            onChange={(e) => update('direccion_texto', e.target.value)}
            disabled={isSubmitting}
          />

          {/* Canal Comercial */}
          <div className="grid gap-2">
            <label className="text-xs text-neutral-600">Canal comercial</label>
            <select
              value={value.canal_id ?? ''}
              onChange={(e) => {
                const val = e.target.value
                if (val === '') {
                  update('canal_id', null)
                } else {
                  const num = Number(val)
                  update('canal_id', (isNaN(num) ? val : num) as any)
                }
              }}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-neutral-900 outline-none transition focus:border-brand-red/60 shadow-sm disabled:opacity-50 text-sm"
              disabled={isSubmitting || isCatalogLoading}
            >
              <option value="">Selecciona un canal</option>
              {canales.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {/* Zona Asignada */}
          <div className="grid gap-2">
            <label className="text-xs text-neutral-600">Zona asignada</label>
            <select
              value={value.zona_comercial_id ?? ''}
              onChange={(e) => {
                const val = e.target.value
                if (val === '') {
                  update('zona_comercial_id', null)
                } else {
                  const num = Number(val)
                  update('zona_comercial_id', (isNaN(num) ? val : num) as any)
                }
              }}
              className={`w-full rounded-xl border ${errors.zona_comercial_id ? 'border-red-500' : 'border-neutral-200'} bg-white px-3 py-2.5 text-neutral-900 outline-none transition focus:border-brand-red/60 shadow-sm disabled:opacity-50 text-sm`}
              disabled={isSubmitting || isCatalogLoading}
            >
              <option value="">Selecciona una zona</option>
              {zonas.map((z) => (
                <option key={z.id} value={z.id}>{z.nombre}</option>
              ))}
            </select>
            {errors.zona_comercial_id && <span className="text-xs text-red-500">{errors.zona_comercial_id}</span>}
          </div>

          {/* Vendedor Asignado */}
          <div className="grid gap-2">
            <label className="text-xs text-neutral-600">Vendedor asignado (opcional)</label>
            <select
              value={value.vendedor_asignado_id ?? ''}
              onChange={(e) => update('vendedor_asignado_id', e.target.value || null)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-neutral-900 outline-none transition focus:border-brand-red/60 shadow-sm disabled:opacity-50 text-sm"
              disabled={isSubmitting || isCatalogLoading}
            >
              <option value="">Selecciona un vendedor</option>
              {vendedores.map((v) => (
                <option key={v.id} value={v.id}>{v.nombre}</option>
              ))}
              {/* Fallback to zone vendor if not in list but assigned */}
              {value.vendedor_asignado_id && !vendedores.find(v => v.id === value.vendedor_asignado_id) && (
                <option value={value.vendedor_asignado_id}>
                  {zonas.find(z => z.id === value.zona_comercial_id)?.vendedor_asignado?.nombre_vendedor_cache || 'Vendedor actual'}
                </option>
              )}
            </select>
          </div>
        </div>
      </div>
    )
  }

  // === STEP 3: Ubicación ===
  if (step === 3) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">Ubicación</p>
              <p className="text-xs text-gray-500">Marca la ubicación en el mapa.</p>
            </div>
            {value.latitud && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                {value.latitud.toFixed(4)}, {value.longitud?.toFixed(4)}
              </span>
            )}
          </div>

          {!value.zona_comercial_id && (
            <div className="p-3 bg-yellow-50 text-yellow-800 text-xs rounded-lg">
              Selecciona una zona en el paso anterior para ver su delimitación.
            </div>
          )}

          <LocationPicker
            position={value.latitud && value.longitud ? { lat: value.latitud, lng: value.longitud } : null}
            zonaId={value.zona_comercial_id}
            zonas={zonas}
            isLoaded={isLoaded}
            loadError={loadError}
            onChange={(pos) => {
              onChange({
                ...value,
                latitud: pos.lat,
                longitud: pos.lng,
                ubicacion_gps: {
                  type: 'Point',
                  coordinates: [pos.lng, pos.lat]
                }
              })
            }}
          />

          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Latitud"
              tone="light"
              value={value.latitud?.toString() || ''}
              disabled
            />
            <TextField
              label="Longitud"
              tone="light"
              value={value.longitud?.toString() || ''}
              disabled
            />
          </div>
        </div>
      </div>
    )
  }

  return null
}

// Componente para mostrar el mapa de la zona seleccionada

const defaultCenter: google.maps.LatLngLiteral = { lat: -3.99313, lng: -79.20422 }
const containerStyle = { width: '100%', height: '400px' }



function parseGeoPolygon(value: unknown): google.maps.LatLngLiteral[] {
  if (!value) return []

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return parseGeoPolygon(parsed)
    } catch (e) {
      console.warn('No se pudo parsear polígono desde string', e)
      return []
    }
  }

  if (Array.isArray(value) && value.every((p: any) => typeof p?.lat === 'number' && typeof p?.lng === 'number')) {
    return dedupeClosingPoint(value as google.maps.LatLngLiteral[])
  }

  if (typeof value === 'object' && value !== null && 'coordinates' in (value as any)) {
    const coordinates = (value as any).coordinates?.[0]
    if (Array.isArray(coordinates)) {
      const path = coordinates
        .map((pair: any) => {
          if (!Array.isArray(pair) || pair.length < 2) return null
          const [lng, lat] = pair
          if (typeof lat !== 'number' || typeof lng !== 'number') return null
          return { lat, lng }
        })
        .filter(Boolean) as google.maps.LatLngLiteral[]
      return dedupeClosingPoint(path)
    }
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

// Componente para seleccionar ubicación con pin en el mapa
const locationMapStyle = { width: '100%', height: '400px' }
const defaultLocationCenter: google.maps.LatLngLiteral = { lat: -3.99313, lng: -79.20422 }

interface LocationPickerProps {
  position: google.maps.LatLngLiteral | null
  zonaId: number | null
  zonas: ZonaOption[]
  isLoaded: boolean
  loadError: Error | undefined
  onChange: (position: google.maps.LatLngLiteral) => void
}

function LocationPicker({ position, zonaId, zonas, isLoaded, loadError, onChange }: LocationPickerProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
  const [tempMarker, setTempMarker] = useState<google.maps.LatLngLiteral | null>(position)

  // Obtener el polígono de la zona seleccionada
  const zonaPath = useMemo(() => {
    if (!zonaId) return []
    const zona = zonas.find((z) => z.id === zonaId)
    if (!zona || !('poligono_geografico' in zona)) return []
    return parseGeoPolygon((zona as any).poligono_geografico)
  }, [zonaId, zonas])

  // Calcular el centro del polígono para centrar el mapa
  const mapCenter = useMemo(() => {
    if (tempMarker) return tempMarker
    if (zonaPath.length > 0) return zonaPath[0]
    return defaultLocationCenter
  }, [tempMarker, zonaPath])

  // Actualizar tempMarker cuando position cambie (para edición)
  useEffect(() => {
    setTempMarker(position)
  }, [position])

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() }
      setTempMarker(newPos)
      onChange(newPos)
    }
  }

  if (!apiKey) {
    return (
      <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
        <p className="text-xs text-yellow-800">Configura VITE_GOOGLE_MAPS_API_KEY para ver el mapa.</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-3">
        <p className="text-xs text-red-800">No se pudo cargar Google Maps.</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg bg-gray-50">
        <p className="text-sm text-gray-600">Cargando mapa...</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <GoogleMap
          mapContainerStyle={locationMapStyle}
          center={mapCenter}
          zoom={zonaPath.length > 0 ? 13 : tempMarker ? 15 : 12}
          onClick={handleMapClick}
          options={{
            fullscreenControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            clickableIcons: false,
          }}
        >
          {/* Polígono de la zona */}
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

          {/* Marcador de ubicación */}
          {tempMarker && (
            <Marker
              position={tempMarker}
              animation={google.maps.Animation.DROP}
            />
          )}
        </GoogleMap>
      </div>

      {zonaPath.length > 0 && (
        <p className="text-xs text-gray-600">
          Polígono de la zona comercial visible. Haz clic dentro o cerca del área para marcar la ubicación.
        </p>
      )}
    </div>
  )
}