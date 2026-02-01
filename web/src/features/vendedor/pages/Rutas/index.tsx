import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter, Flag, RefreshCcw } from 'lucide-react'
import { PageHero } from '../../../../components/ui/PageHero'
import { RutaVendedorCard } from '../../components/RutaVendedorCard'
import { getMisRutas, getRutaVendedorById, iniciarRuta, completarRuta } from '../../../supervisor/services/rutasVendedorApi'
import type { RutaVendedor, EstadoRuta } from '../../../supervisor/services/rutasVendedorTypes'

export default function RutasPage() {
  const navigate = useNavigate()
  const [rutas, setRutas] = useState<RutaVendedor[]>([])
  const [loading, setLoading] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState<'activos' | 'completados' | 'todos'>('activos')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    loadRutas()
  }, [filtroEstado])

  const loadRutas = async () => {
    setLoading(true)
    try {
      let data: RutaVendedor[] = []
      if (filtroEstado === 'activos') {
        // For simplicity, we filter in JS or if the API supports multiple states
        const allData = await getMisRutas()
        data = allData.filter(r => r.estado === 'publicado' || r.estado === 'en_curso')
      } else if (filtroEstado === 'completados') {
        data = await getMisRutas({ estado: 'completado' })
      } else {
        data = await getMisRutas()
      }

      // Load full details for each ruta to get paradas
      const rutasConDetalles = await Promise.all(
        data.map(async (r) => {
          try {
            // Get full route details including paradas
            const rutaCompleta = await getRutaVendedorById(r.id)
            return {
              ...rutaCompleta,
              paradas: rutaCompleta.paradas || [],
            }
          } catch (error) {
            // If individual route fetch fails, return basic data
            return {
              ...r,
              paradas: r.paradas || [],
            }
          }
        })
      )

      setRutas(rutasConDetalles)
    } catch (error) {
      showToast('error', 'No se pudieron cargar tus rutas')
    } finally {
      setLoading(false)
    }
  }

  const handleStart = async (ruta: RutaVendedor) => {
    if (!confirm('¿Deseas iniciar esta ruta comercial?')) return
    try {
      await iniciarRuta(ruta.id)
      showToast('success', 'Ruta iniciada exitosamente')
      loadRutas()
    } catch (error: any) {
      showToast('error', error.message || 'Error al iniciar ruta')
    }
  }

  const handleComplete = async (ruta: RutaVendedor) => {
    if (!confirm('¿Deseas finalizar esta ruta? Se marcarán las visitas pendientes.')) return
    try {
      await completarRuta(ruta.id)
      showToast('success', 'Ruta completada exitosamente')
      loadRutas()
    } catch (error: any) {
      showToast('error', error.message || 'Error al completar ruta')
    }
  }

  const handleViewDetail = (ruta: RutaVendedor) => {
    navigate(`/vendedor/rutas/${ruta.id}`)
  }

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="space-y-6">
      <PageHero
        title="Mis Rutas"
        subtitle="Gestiona tu agenda comercial y seguimiento de clientes"
        chips={['Ventas', 'Rutas Diarias', 'Productividad']}
      />

      {/* Premium Filters Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white border border-neutral-200 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-neutral-100 rounded-2xl">
            <Filter className="h-6 w-6 text-neutral-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-800 leading-tight">Filtrar Rutas</h3>
            <p className="text-sm text-neutral-500">Organiza tus registros por estado</p>
          </div>
        </div>

        <div className="flex p-1.5 bg-neutral-100 rounded-2xl w-full md:w-auto">
          {(['activos', 'completados', 'todos'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltroEstado(f)}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${filtroEstado === f
                ? 'bg-white text-brand-red shadow-lg shadow-neutral-200/50 scale-[1.02]'
                : 'text-neutral-500 hover:text-neutral-700'
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={loadRutas}
          className="p-3 bg-white border-2 border-neutral-100 rounded-2xl hover:border-brand-red hover:text-brand-red transition-all group"
        >
          <RefreshCcw className={`h-6 w-6 transition-transform group-active:rotate-180 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Grid display */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-neutral-100 rounded-3xl border-2 border-neutral-200" />
          ))}
        </div>
      ) : rutas.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-neutral-200 rounded-[40px] p-20 text-center flex flex-col items-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-brand-red/10 rounded-full blur-2xl animate-pulse" />
            <Flag className="h-24 w-24 text-neutral-300 relative z-10" />
          </div>
          <h3 className="text-2xl font-black text-neutral-800 mb-2">No se encontraron rutas</h3>
          <p className="text-neutral-500 max-w-sm mx-auto">
            No hay rutas que coincidan con el filtro seleccionado en este momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rutas.map(ruta => (
            <RutaVendedorCard
              key={ruta.id}
              ruta={ruta}
              onView={handleViewDetail}
              onStart={handleStart}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-8 right-8 px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-4 z-50 animate-in slide-in-from-right duration-500 ${toast.type === 'success' ? 'bg-neutral-900 text-white' : 'bg-red-600 text-white'
          }`}>
          <div className={`p-1.5 rounded-full ${toast.type === 'success' ? 'bg-green-500' : 'bg-white/20'}`}>
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
          </div>
          <span className="font-bold tracking-tight">{toast.message}</span>
        </div>
      )}
    </div>
  )
}
