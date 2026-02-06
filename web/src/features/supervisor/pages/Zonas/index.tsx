import { useState } from 'react'
import { PlusCircle, MapPin, RefreshCcw, Map } from 'components/ui/Icons'
import { PageHero } from 'components/ui/PageHero'
import { SectionHeader } from 'components/ui/SectionHeader'
import { Alert } from 'components/ui/Alert'
import { Modal } from 'components/ui/Modal'
import { LoadingSpinner } from 'components/ui/LoadingSpinner'
import { type ZonaComercial, type CreateZonaDto, type ZoneSchedule, getZoneSchedules, updateZoneSchedules, obtenerZonasParaMapa, obtenerZonaPorId } from '../../services/zonasApi'
import { useZonas } from '../../services/useZonas'
import { ZonasTable } from './ZonasTable'
import { CrearZonaForm } from './CrearZonaForm'
import { ZonaDetailModal } from './ZonaDetailModal'
import { MapaGeneralModal } from './MapaGeneralModal'
import { findOverlappingZones } from '../../utils/polygonUtils'

type ModalMode = 'crear' | 'editar'

// Helper for default schedules
const DEFAULT_SCHEDULES: ZoneSchedule[] = Array.from({ length: 7 }, (_, i) => ({
  diaSemana: i,
  entregasHabilitadas: false,
  visitasHabilitadas: false
}))

export default function ZonasPage() {
  const { zonas, isLoading, error, loadZonas, crearZona, actualizarZona } = useZonas()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('crear')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [zonaEditando, setZonaEditando] = useState<ZonaComercial | null>(null)
  const [zonaDetalle, setZonaDetalle] = useState<ZonaComercial | null>(null)
  const [isMapaGeneralOpen, setIsMapaGeneralOpen] = useState(false)
  const [zonasParaMapa, setZonasParaMapa] = useState<ZonaComercial[]>([])
  const [isLoadingMapa, setIsLoadingMapa] = useState(false)

  // Schedules state
  const [schedules, setSchedules] = useState<ZoneSchedule[]>(DEFAULT_SCHEDULES)

  // Estado para notificaciones toast globales
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const emptyForm: CreateZonaDto = {
    codigo: '',
    nombre: '',
    descripcion: '',
    poligono_geografico: null,
  }

  const handleOpenDetalle = (zona: ZonaComercial) => {
    setZonaDetalle(zona)
  }

  const handleCloseDetalle = () => setZonaDetalle(null)

  const [formData, setFormData] = useState<CreateZonaDto>(emptyForm)

  const handleOpenModalCrear = async () => {
    setModalMode('crear')
    setZonaEditando(null)
    setIsModalOpen(true)
    setFormErrors({})
    setSubmitMessage(null)
    setFormData(emptyForm)
    setSchedules(DEFAULT_SCHEDULES) // Reset schedules
    // Load zones with geometry for map overlay
    try {
      const zonasConGeometria = await obtenerZonasParaMapa()
      setZonasParaMapa(zonasConGeometria)
    } catch (error) {
      setZonasParaMapa([])
    }
  }

  const handleOpenModalEditar = async (zona: ZonaComercial) => {
    setModalMode('editar')
    setZonaEditando(zona)
    setIsModalOpen(true)
    setFormErrors({})
    setSubmitMessage(null)
    setFormData({
      codigo: zona.codigo,
      nombre: zona.nombre,
      descripcion: zona.descripcion || '',
      poligono_geografico: zona.poligono_geografico ?? null,
    })

    // Fetch full detail (including geometry) for the one we are editing
    try {
      const fullZona = await obtenerZonaPorId(zona.id)
      if (fullZona) {
        setFormData(prev => ({
          ...prev,
          poligono_geografico: fullZona.poligono_geografico ?? null
        }))
      }
    } catch (e) {
      console.error('Error fetching zone details for edit:', e)
    }

    // Load zones with geometry for map overlay
    try {
      const zonasConGeometria = await obtenerZonasParaMapa()
      setZonasParaMapa(zonasConGeometria)
    } catch (error) {
      setZonasParaMapa([])
    }

    // Fetch schedules for this zone
    try {
      const fetchedSchedules = await getZoneSchedules(zona.id)
      if (fetchedSchedules && fetchedSchedules.length > 0) {
        setSchedules(fetchedSchedules)
      } else {
        setSchedules(DEFAULT_SCHEDULES)
      }
    } catch (e) {
      setSchedules(DEFAULT_SCHEDULES)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setZonaEditando(null)
    setFormErrors({})
    setSubmitMessage(null)
    setFormData(emptyForm)
  }

  const handleOpenMapaGeneral = async () => {
    setIsMapaGeneralOpen(true)
    setIsLoadingMapa(true)
    try {
      const zonasConGeometria = await obtenerZonasParaMapa()
      setZonasParaMapa(zonasConGeometria)
    } catch (error) {
      setZonasParaMapa([])
    } finally {
      setIsLoadingMapa(false)
    }
  }



  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.codigo.trim()) errors.codigo = 'El código es requerido'
    if (!formData.nombre.trim()) errors.nombre = 'El nombre es requerido'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitMessage(null)

    if (!validateForm()) return

    // Validate polygon overlap if polygon is defined
    if (formData.poligono_geografico) {
      const overlapping = findOverlappingZones(
        formData.poligono_geografico,
        zonasParaMapa,
        modalMode === 'editar' ? zonaEditando?.id : undefined
      )

      if (overlapping.length > 0) {
        const zoneNames = overlapping.map(z => z.nombre).join(', ')
        setSubmitMessage({
          type: 'error',
          message: `El polígono se superpone con ${overlapping.length === 1 ? 'la zona' : 'las zonas'}: ${zoneNames}. Por favor, ajusta el área geográfica.`
        })
        setIsSubmitting(false)
        return
      }
    }

    setIsSubmitting(true)

    try {
      let zoneId: string | number;

      if (modalMode === 'crear') {
        const nuevaZona = await crearZona(formData)
        zoneId = nuevaZona.id
        setSubmitMessage({ type: 'success', message: 'Zona creada correctamente' })
        setToast({ type: 'success', message: '¡Zona creada con éxito!' })
      } else if (zonaEditando) {
        zoneId = zonaEditando.id
        await actualizarZona(
          zoneId,
          formData
        )
        setSubmitMessage({ type: 'success', message: 'Zona actualizada correctamente' })
        setToast({ type: 'success', message: '¡Zona actualizada con éxito!' })
      } else {
        return
      }

      // Save Schedules
      if (zoneId) {
        await updateZoneSchedules(zoneId, schedules)
      }

      setTimeout(() => {
        loadZonas();
      }, 400);

      setTimeout(() => setToast(null), 3000)

      setTimeout(() => handleCloseModal(), 1000)
    } catch (err: any) {
      setSubmitMessage({ type: 'error', message: err?.message ?? 'No se pudo guardar la zona' })
      setToast({ type: 'error', message: 'Error al guardar la zona' })
      setTimeout(() => setToast(null), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHero
        title="Zonas"
        subtitle="Gestiona las zonas comerciales y asignaciones"
        chips={["Logística", "Zonas", "Cobertura"]}
      />

      <SectionHeader
        title="Zonas comerciales"
        subtitle="Define las zonas de cobertura y asigna vendedores"
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-neutral-600">Agrupa pedidos y clientes por zonas para planificar mejor la distribución.</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">Total zonas: {zonas.length}</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:grid sm:grid-cols-3 lg:flex lg:flex-nowrap">
          <button
            type="button"
            onClick={handleOpenMapaGeneral}
            className="flex-1 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 sm:px-4 sm:py-3 sm:text-sm lg:text-sm"
          >
            <Map className="mr-2 h-4 w-4 shrink-0" />
            <span>Ver mapa general</span>
          </button>
          <button
            type="button"
            onClick={loadZonas}
            className="flex-1 inline-flex items-center justify-center rounded-xl border border-brand-red bg-white px-3 py-2.5 text-xs font-bold text-brand-red transition hover:bg-brand-red/5 sm:px-4 sm:py-3 sm:text-sm lg:text-sm"
          >
            <RefreshCcw className="mr-2 h-4 w-4 shrink-0" />
            <span>Actualizar</span>
          </button>
          <button
            type="button"
            onClick={handleOpenModalCrear}
            className="flex-1 inline-flex items-center justify-center rounded-xl bg-brand-red px-3 py-2.5 text-xs font-bold text-white transition hover:bg-brand-red/90 sm:px-4 sm:py-3 sm:text-sm lg:text-sm"
          >
            <PlusCircle className="mr-2 h-4 w-4 shrink-0" />
            <span>Nueva zona</span>
          </button>
        </div>
      </div>

      {error ? (
        <Alert type="error" message={error} />
      ) : null}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : zonas.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <MapPin className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No hay zonas configuradas</h3>
          <p className="mt-2 text-sm text-gray-600">Crea la primera zona para empezar a asignar vendedores.</p>
        </div>
      ) : (
        <ZonasTable zonas={zonas} onView={handleOpenDetalle} onEdit={handleOpenModalEditar} />
      )}

      <Modal
        isOpen={isModalOpen}
        title={modalMode === 'crear' ? 'Crear zona' : 'Editar zona'}
        onClose={handleCloseModal}
        headerGradient="red"
        maxWidth="lg"
      >
        <CrearZonaForm
          formData={formData}
          setFormData={setFormData}
          schedules={schedules}
          setSchedules={setSchedules}
          formErrors={formErrors}
          submitMessage={submitMessage}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          isEditing={modalMode === 'editar'}
          zonas={zonasParaMapa}
          editingZoneId={zonaEditando?.id}
        />
      </Modal>

      <ZonaDetailModal zona={zonaDetalle} isOpen={!!zonaDetalle} onClose={handleCloseDetalle} />
      <MapaGeneralModal
        zonas={isLoadingMapa ? [] : zonasParaMapa}
        isOpen={isMapaGeneralOpen}
        onClose={() => setIsMapaGeneralOpen(false)}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-50 ${toast.type === 'success'
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
            }`}
          style={{
            animation: 'slideInRight 0.3s ease-out',
          }}
        >
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
