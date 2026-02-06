import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, Search, Filter, Calendar, User, Eye, RefreshCcw, ChevronLeft, ChevronRight } from 'components/ui/Icons'
import { SectionHeader } from 'components/ui/SectionHeader'
import { PageHero } from 'components/ui/PageHero'
import { LoadingSpinner } from 'components/ui/LoadingSpinner'
import { Alert } from 'components/ui/Alert'
import { getEntregas } from '../../../shared/services/deliveryApi'
import { obtenerTransportistas, type Usuario } from '../../services/usuariosApi'
import { ESTADO_ENTREGA_COLORS, ESTADO_ENTREGA_LABELS, type Entrega, type EstadoEntrega } from '../../../shared/types/deliveryTypes'

export default function EntregasPage() {
  const navigate = useNavigate()
  const [entregas, setEntregas] = useState<Entrega[]>([])
  const [transportistas, setTransportistas] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [status, setStatus] = useState<string>('')
  const [driverId, setDriverId] = useState<string>('')
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  // Pagination
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  useEffect(() => {
    cargarInitialData()
  }, [])

  useEffect(() => {
    cargarEntregas()
  }, [page, status, driverId, fromDate, toDate])

  const cargarInitialData = async () => {
    try {
      const drivers = await obtenerTransportistas()
      setTransportistas(drivers)
    } catch (err) {
      console.error('Error al cargar transportistas', err)
    }
  }

  const cargarEntregas = async () => {
    try {
      setLoading(true)
      setError(null)
      const resp = await getEntregas({
        estado: status || undefined,
        transportista_id: driverId || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        page,
        limit
      })
      setEntregas(resp.data)
      setTotal(resp.meta?.totalItems || resp.data.length)
    } catch (err: any) {
      setError(err?.message || 'Error al cargar entregas')
    } finally {
      setLoading(false)
    }
  }

  const filteredEntregas = entregas.filter(e => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      e.id.toLowerCase().includes(term) ||
      e.pedido_id.toLowerCase().includes(term)
    )
  })

  const formatDate = (date: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <PageHero
        title="Supervisión de Entregas"
        subtitle="Monitoreo de la última milla, evidencias y resolución de incidencias en tiempo real."
        chips={[
          { label: 'Trazabilidad total', variant: 'blue' },
          { label: 'Gestión de evidencias', variant: 'green' },
          { label: 'Control de estados', variant: 'gold' },
        ]}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SectionHeader
          title="Listado de Entregas"
          subtitle="Seguimiento de pedidos en curso y finalizados"
        />
        <button
          onClick={() => cargarEntregas()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Sincronizar
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por ID o Pedido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-red/20 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
            <Filter className="text-gray-400 w-4 h-4" />
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="bg-transparent border-none text-sm w-full focus:ring-0 outline-none"
            >
              <option value="">Todos los estados</option>
              {Object.entries(ESTADO_ENTREGA_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
            <User className="text-gray-400 w-4 h-4" />
            <select
              value={driverId}
              onChange={(e) => { setDriverId(e.target.value); setPage(1); }}
              className="bg-transparent border-none text-sm w-full focus:ring-0 outline-none"
            >
              <option value="">Todos los transportistas</option>
              {transportistas.map(t => (
                <option key={t.id} value={t.id}>{t.nombreCompleto || t.nombre}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
            <Calendar className="text-gray-400 w-4 h-4" />
            <input
              type="date"
              title="Desde"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
              className="bg-transparent border-none text-sm w-full focus:ring-0 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
            <Calendar className="text-gray-400 w-4 h-4" />
            <input
              type="date"
              title="Hasta"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPage(1); }}
              className="bg-transparent border-none text-sm w-full focus:ring-0 outline-none"
            />
          </div>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {loading && entregas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <LoadingSpinner />
          <p className="mt-4 text-gray-500 font-medium">Cargando entregas...</p>
        </div>
      ) : filteredEntregas.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 shadow-sm text-center">
          <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No se encontraron entregas</h3>
          <p className="text-gray-500 max-w-xs mx-auto">
            Ajusta los filtros o intenta sincronizar de nuevo.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">ID / Pedido</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Transportista</th>
                  <th className="px-6 py-4">Fecha Asignación</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEntregas.map((entrega) => (
                  <tr key={entrega.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-gray-500 uppercase">#{entrega.id.substring(0, 8)}</div>
                      <div className="font-bold text-gray-900">Pedido #{entrega.pedido?.codigo_visual || entrega.pedido_id.substring(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${ESTADO_ENTREGA_COLORS[entrega.estado as EstadoEntrega] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                        {ESTADO_ENTREGA_LABELS[entrega.estado as EstadoEntrega] || entrega.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">
                      {transportistas.find(t => t.id === entrega.transportista_id)?.nombre || 'Cargando...'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(entrega.creado_en)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/supervisor/entregas/${entrega.id}`)}
                        className="inline-flex items-center gap-1 text-brand-red font-bold hover:underline"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Mostrando <span className="font-bold text-gray-700">{filteredEntregas.length}</span> de <span className="font-bold text-gray-700">{total}</span> entregas
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="p-1 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold text-gray-700">Página {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={loading || filteredEntregas.length < limit}
                className="p-1 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
