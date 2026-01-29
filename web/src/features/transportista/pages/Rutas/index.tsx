import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Filter, Truck } from 'lucide-react'
import { SectionHeader } from 'components/ui/SectionHeader'
import { PageHero } from 'components/ui/PageHero'
import { RuteroCard } from '../../../supervisor/components/RuteroCard'
import { HistorialModal } from '../../../supervisor/components/HistorialModal'
import type { RuteroLogistico, EstadoRutero } from '../../../supervisor/services/types'
import { getRuterosAsignados, iniciarRutero, completarRutero } from '../../services/logisticsApi'
import { getVehicles } from '../../../supervisor/services/vehiclesApi'
import { getUserById } from '../../../supervisor/services/usuariosApi'

export default function RutasPage() {
  const navigate = useNavigate()
  const [ruteros, setRuteros] = useState<RuteroLogistico[]>([])
  const [loading, setLoading] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState<'activos' | 'completados' | 'todos'>('activos')
  const [showHistorial, setShowHistorial] = useState(false)
  const [historialRuteroId, setHistorialRuteroId] = useState<string>('')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    loadRuteros()
  }, [filtroEstado])

  const loadRuteros = async () => {
    setLoading(true)
    try {
      let estados: EstadoRutero[] | undefined
      if (filtroEstado === 'activos') {
        estados = ['publicado', 'en_curso']
      } else if (filtroEstado === 'completados') {
        estados = ['completado']
      }

      const data = await getRuterosAsignados(estados ? { estado: estados } : undefined)

      // Enrich data manually if backend doesn't return relations
      const enrichedData = await Promise.all(data.map(async (r) => {
        let vehiculo = r.vehiculo
        let transportista = r.transportista

        // 1. Fetch Vehicle if missing and we have ID
        if (!vehiculo && r.vehiculo_id) {
          try {
            // Fetch all vehicles efficiently (or cached) - optimize this later if needed
            const allVehicles = await getVehicles()
            const found = allVehicles.find(v => v.id === r.vehiculo_id)
            if (found) {
              vehiculo = {
                id: found.id,
                placa: found.placa,
                modelo: found.modelo,
                capacidad_kg: found.capacidad_kg,
                estado: found.estado
              }
            }
          } catch (e) {
            console.error('Error fetching vehicle', e)
          }
        }

        // 2. Fetch Transportista if missing and we have ID
        if (!transportista && r.transportista_id) {
          try {
            const u = await getUserById(r.transportista_id)
            if (u) {
              transportista = {
                id: u.id,
                nombre: u.perfil?.nombres || 'Sin nombre',
                apellido: u.perfil?.apellidos || '',
                email: u.email
              }
            }
          } catch (e) {
            console.error('Error fetching transportista', e)
          }
        }

        return { ...r, vehiculo, transportista }
      }))

      setRuteros(enrichedData)
    } catch (error) {
      console.error('Error al cargar ruteros:', error)
      showToast('error', 'Error al cargar ruteros asignados')
    } finally {
      setLoading(false)
    }
  }

  const handleStart = async (rutero: RuteroLogistico) => {
    if (!confirm('¿Estás seguro de iniciar este rutero?')) return

    try {
      await iniciarRutero(rutero.id)
      showToast('success', 'Rutero iniciado exitosamente')
      loadRuteros()
    } catch (error: any) {
      showToast('error', error.message || 'Error al iniciar rutero')
    }
  }

  const handleComplete = async (rutero: RuteroLogistico) => {
    if (!confirm('¿Estás seguro de completar este rutero? El vehículo quedará disponible.')) return

    try {
      await completarRutero(rutero.id)
      showToast('success', 'Rutero completado exitosamente')
      loadRuteros()
    } catch (error: any) {
      showToast('error', error.message || 'Error al completar rutero')
    }
  }

  const handleViewDetail = (rutero: RuteroLogistico) => {
    // Navigate to detail page
    navigate(`/transportista/rutas/${rutero.id}`)
  }

  const handleViewHistorial = (rutero: RuteroLogistico) => {
    setHistorialRuteroId(rutero.id)
    setShowHistorial(true)
  }

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="space-y-6">
      <PageHero
        title="Rutas"
        subtitle="Rutas asignadas y orden de entregas para maximizar eficiencia"
        chips={['Optimización de ruta', 'Orden de entregas', 'Historial de rutas']}
      />

      <SectionHeader title="Rutas Asignadas" subtitle="Ruteros logísticos asignados a ti" />

      {/* Filters */}
      <div className="flex items-center gap-3 border border-neutral-200 rounded-xl bg-gradient-to-r from-white via-neutral-50 to-white p-5 shadow-md">
        <Filter className="h-5 w-5 text-neutral-600" />
        <div className="flex gap-2">
          <button
            onClick={() => setFiltroEstado('activos')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${filtroEstado === 'activos'
              ? 'bg-brand-red text-white shadow-md'
              : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-100'
              }`}
          >
            Activos
          </button>
          <button
            onClick={() => setFiltroEstado('completados')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${filtroEstado === 'completados'
              ? 'bg-brand-red text-white shadow-md'
              : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-100'
              }`}
          >
            Completados
          </button>
          <button
            onClick={() => setFiltroEstado('todos')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${filtroEstado === 'todos'
              ? 'bg-brand-red text-white shadow-md'
              : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-100'
              }`}
          >
            Todos
          </button>
        </div>
      </div>

      {/* Ruteros Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando ruteros...</p>
        </div>
      ) : ruteros.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          <Truck className="mx-auto mb-4 h-16 w-16 text-neutral-400" />
          <h3 className="text-lg font-semibold text-neutral-700">Sin ruteros asignados</h3>
          <p className="text-sm text-neutral-500 mt-2">
            No tienes ruteros {filtroEstado !== 'todos' && filtroEstado} asignados en este momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ruteros.map((rutero) => (
            <RuteroCard
              key={rutero.id}
              rutero={rutero}
              role="transportista"
              onView={handleViewDetail}
              onStart={handleStart}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}

      {/* Historial Modal */}
      <HistorialModal
        isOpen={showHistorial}
        onClose={() => setShowHistorial(false)}
        ruteroId={historialRuteroId}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-50 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          style={{ animation: 'slideInRight 0.3s ease-out' }}
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

