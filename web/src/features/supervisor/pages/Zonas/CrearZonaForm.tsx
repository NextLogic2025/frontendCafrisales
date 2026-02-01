import { useEffect, useMemo, useState } from 'react'
import { TextField } from 'components/ui/TextField'
import { Alert } from 'components/ui/Alert'
import { type CreateZonaDto, type ZoneSchedule, type ZonaComercial } from '../../services/zonasApi'
import { ZonaMapSelector } from './ZonaMapSelector'

import { ZoneScheduleConfig } from './ZoneScheduleConfig'
import { findOverlappingZones } from '../../utils/polygonUtils'

type LatLngLiteral = google.maps.LatLngLiteral

interface CrearZonaFormProps {
  formData: CreateZonaDto
  setFormData: React.Dispatch<React.SetStateAction<CreateZonaDto>>
  schedules: ZoneSchedule[]
  setSchedules: (schedules: ZoneSchedule[]) => void
  formErrors: Record<string, string>
  submitMessage: { type: 'success' | 'error'; message: string } | null
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  isEditing?: boolean
  zonas: ZonaComercial[]
}

export function CrearZonaForm({
  formData,
  setFormData,
  schedules,
  setSchedules,
  formErrors,
  submitMessage,
  isSubmitting,
  onSubmit,
  onCancel,
  isEditing = false,
  zonas,
}: CrearZonaFormProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [polygonPath, setPolygonPath] = useState<LatLngLiteral[]>([])
  const [mapCenter, setMapCenter] = useState<LatLngLiteral | undefined>(undefined)
  const [selectedProvincia, setSelectedProvincia] = useState<string>('')
  const [overlapWarning, setOverlapWarning] = useState<string | null>(null)

  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined

  const parsedInitialPolygon = useMemo(() => parseGeoPolygon(formData.poligono_geografico), [formData.poligono_geografico])

  useEffect(() => {
    setPolygonPath(parsedInitialPolygon)
  }, [parsedInitialPolygon])


  // Reset step when modal opens/closes (detected by formData changes mostly, or mount)
  useEffect(() => {
    setStep(1)
  }, [isEditing]) // Reset to step 1 on mode change, or usage pattern dependent


  const handlePolygonChange = (path: LatLngLiteral[]) => {
    setPolygonPath(path)
    const geoJson = path.length >= 3 ? toGeoJsonPolygon(path) : null
    setFormData((prev) => ({
      ...prev,
      poligono_geografico: geoJson,
    }))

    // Check for overlaps in real-time
    if (geoJson && path.length >= 3) {
      const overlapping = findOverlappingZones(
        geoJson,
        zonas,
        isEditing ? (formData as any).id : undefined
      )

      if (overlapping.length > 0) {
        const zoneNames = overlapping.map(z => z.nombre).join(', ')
        setOverlapWarning(
          `⚠️ El polígono se superpone con ${overlapping.length === 1 ? 'la zona' : 'las zonas'}: ${zoneNames}`
        )
      } else {
        setOverlapWarning(null)
      }
    } else {
      setOverlapWarning(null)
    }
  }


  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Basic validation before moving to step 2
    if (!formData.codigo || !formData.nombre) {
      if (!formData.codigo || !formData.nombre) {
        alert("Por favor completa los campos obligatorios")
        return
      }
    }
    setStep(2)
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {submitMessage ? <Alert type={submitMessage.type} message={submitMessage.message} /> : null}

      {/* Stepper Indicator */}
      <div className="flex items-center justify-center mb-6">
        <div className={`flex items-center ${step === 1 ? 'text-brand-red' : 'text-gray-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 1 ? 'border-brand-red bg-brand-red text-white' : 'border-gray-300 bg-gray-100'} font-bold`}>1</div>
          <span className="ml-2 text-sm font-medium">Información</span>
        </div>
        <div className="w-12 h-1 bg-gray-200 mx-4" />
        <div className={`flex items-center ${step === 2 ? 'text-brand-red' : 'text-gray-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 2 ? 'border-brand-red bg-brand-red text-white' : 'border-gray-300 bg-gray-100'} font-bold`}>2</div>
          <span className="ml-2 text-sm font-medium">Horarios</span>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Código"
              placeholder="01"
              value={formData.codigo.replace(/^ZN-/, '')}
              onChange={(e) => {
                // Allow only numbers or alphanumeric if desired? User said "pondria el numero".
                // Let's blindly prepend ZN-
                setFormData((prev) => ({ ...prev, codigo: `ZN-${e.target.value}` }))
              }}
              left={<span className="text-gray-500 font-medium select-none">ZN-</span>}
              error={formErrors.codigo}
              tone="light"
              required
              disabled={isEditing}
            />

            <TextField
              label="Nombre"
              placeholder="Zona norte"
              value={formData.nombre}
              onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
              error={formErrors.nombre}
              tone="light"
              required
            />
          </div>

          <div className="grid gap-4">
            <TextField
              label="Descripción"
              placeholder="Descripción opcional de la zona"
              value={(formData as any).descripcion || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value } as any))}
              tone="light"
            />
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-700">Área geográfica (polígono)</label>
              <span className="text-[11px] text-neutral-500">Opcional, ayuda a limitar la zona</span>
            </div>
            <ZonaMapSelector
              polygon={polygonPath}
              onPolygonChange={handlePolygonChange}
              center={mapCenter}
              zonas={zonas}
            />
            {overlapWarning && (
              <div className="rounded-lg border-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-800">
                <div className="flex items-start gap-2">
                  <svg className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="font-medium">{overlapWarning}</span>
                </div>
              </div>
            )}
            {polygonPath.length > 0 ? (
              <p className="text-[11px] text-neutral-600">Vértices: {polygonPath.length} | Se guardará como polígono GeoJSON.</p>
            ) : (
              <p className="text-[11px] text-neutral-500">Dibuja en el mapa para delimitar la zona.</p>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <ZoneScheduleConfig schedules={schedules} onChange={setSchedules} />
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center rounded-xl px-4 py-3 font-extrabold transition bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          Cancelar
        </button>

        {step === 2 && (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="inline-flex items-center justify-center rounded-xl px-4 py-3 font-extrabold transition bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Atrás
          </button>
        )}

        {step === 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center justify-center rounded-xl px-4 py-3 font-extrabold transition bg-brand-red text-white hover:bg-brand-red/90"
          >
            Siguiente
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-xl px-4 py-3 font-extrabold transition bg-brand-red text-white hover:bg-brand-red/90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar zona' : 'Guardar zona'}
          </button>
        )}
      </div>
    </form>
  )
}

function parseGeoPolygon(value: unknown): LatLngLiteral[] {
  if (!value) return []

  if (Array.isArray(value) && value.every((p: any) => typeof p?.lat === 'number' && typeof p?.lng === 'number')) {
    return dedupeClosingPoint(value as LatLngLiteral[])
  }

  if (typeof value === 'object' && value !== null && 'coordinates' in (value as any)) {
    const rawCoords = (value as any).coordinates
    if (!Array.isArray(rawCoords) || rawCoords.length === 0) return []

    // Helper to find the first ring (recursively dig until we find number-number arrays)
    let ring = rawCoords[0]
    while (Array.isArray(ring) && Array.isArray(ring[0]) && typeof ring[0][0] !== 'number') {
      ring = ring[0]
    }

    if (Array.isArray(ring)) {
      const path = ring
        .map((pair: any) => {
          if (!Array.isArray(pair) || pair.length < 2) return null
          const [lng, lat] = pair
          if (typeof lat !== 'number' || typeof lng !== 'number') return null
          return { lat, lng }
        })
        .filter(Boolean) as LatLngLiteral[]
      return dedupeClosingPoint(path)
    }
  }

  return []
}

function dedupeClosingPoint(path: LatLngLiteral[]): LatLngLiteral[] {
  if (path.length < 2) return path
  const first = path[0]
  const last = path[path.length - 1]
  if (first.lat === last.lat && first.lng === last.lng) {
    return path.slice(0, -1)
  }
  return path
}

function toGeoJsonPolygon(path: LatLngLiteral[]) {
  if (!Array.isArray(path) || path.length < 3) return null
  const ring = path.map((point) => [point.lng, point.lat])
  const first = ring[0]
  const last = ring[ring.length - 1]
  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push([...first])
  }
  return {
    type: 'Polygon',
    coordinates: [ring],
  }
}
