import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageHero } from 'components/ui/PageHero'
import { ArrowLeft, MapPin, Truck, User, Calendar, CheckCircle } from 'lucide-react'
import { ParadasList } from '../../../supervisor/components/ParadasList'
import { ZonaMapaGoogle } from '../../../supervisor/components/ZonaMapaGoogle'
import { HistorialModal } from '../../../supervisor/components/HistorialModal'
import type { RuteroLogistico } from '../../../supervisor/services/types'
import { ESTADO_RUTERO_COLORS, ESTADO_RUTERO_LABELS } from '../../../supervisor/services/types'
import { getRuteroLogistico, completarRutero } from '../../services/logisticsApi'

export default function DetalleRuteroPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [rutero, setRutero] = useState<RuteroLogistico | null>(null)
    const [loading, setLoading] = useState(false)
    const [showHistorial, setShowHistorial] = useState(false)
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    useEffect(() => {
        if (id) {
            loadRutero()
        }
    }, [id])

    const loadRutero = async () => {
        if (!id) return
        setLoading(true)
        try {
            const data = await getRuteroLogistico(id)
            setRutero(data)
        } catch (error) {
            console.error('Error al cargar rutero:', error)
            showToast('error', 'Error al cargar rutero')
        } finally {
            setLoading(false)
        }
    }

    const handleComplete = async () => {
        if (!rutero) return
        if (!confirm('¿Estás seguro de completar este rutero? El vehículo quedará disponible.')) return

        try {
            await completarRutero(rutero.id)
            showToast('success', 'Rutero completado exitosamente')
            loadRutero()
        } catch (error: any) {
            showToast('error', error.message || 'Error al completar rutero')
        }
    }

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message })
        setTimeout(() => setToast(null), 3000)
    }

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return 'No definida'
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    // Prepare map data
    const puntosMapa =
        rutero?.paradas
            ?.filter((p) => p.pedido?.ubicacion_gps)
            .map((p, index) => ({
                lat: p.pedido!.ubicacion_gps!.coordinates[1],
                lng: p.pedido!.ubicacion_gps!.coordinates[0],
                nombre: `${index + 1}. ${p.pedido?.cliente_nombre || 'Cliente'}`,
            })) || []

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
                <p className="text-neutral-600">Cargando rutero...</p>
            </div>
        )
    }

    if (!rutero) {
        return (
            <div className="text-center py-12 text-neutral-500">
                <Truck className="mx-auto mb-4 h-16 w-16 text-neutral-400" />
                <h3 className="text-lg font-semibold text-neutral-700">Rutero no encontrado</h3>
                <p className="text-sm text-neutral-500 mt-2">
                    No se pudo cargar la información del rutero.
                </p>
                <button
                    onClick={() => navigate('/transportista/rutas')}
                    className="mt-4 px-6 py-2 bg-brand-red text-white rounded-lg font-semibold hover:bg-brand-red-dark transition-all duration-150"
                >
                    Volver a Rutas
                </button>
            </div>
        )
    }

    const estadoColor = ESTADO_RUTERO_COLORS[rutero.estado]
    const estadoLabel = ESTADO_RUTERO_LABELS[rutero.estado]

    return (
        <div className="space-y-6">
            <PageHero
                title={`Rutero #${rutero.id.slice(0, 8)}`}
                subtitle="Detalle del rutero logístico y paradas"
                chips={['Detalle', 'Paradas', 'Mapa']}
            />

            {/* Back Button */}
            <button
                onClick={() => navigate('/transportista/rutas')}
                className="flex items-center gap-2 text-brand-red hover:text-brand-red-dark font-medium transition-all duration-150"
            >
                <ArrowLeft className="h-4 w-4" />
                Volver a Rutas
            </button>

            {/* Rutero Info Card */}
            <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-800 mb-2">
                            Información del Rutero
                        </h2>
                        <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${estadoColor}`}
                        >
                            {estadoLabel}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowHistorial(true)}
                            className="px-4 py-2 text-sm font-medium text-brand-red border border-brand-red rounded-lg hover:bg-brand-red hover:text-white transition-all duration-150"
                        >
                            Ver Historial
                        </button>

                        {rutero.estado === 'en_curso' && (
                            <button
                                onClick={handleComplete}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all duration-150"
                            >
                                <CheckCircle className="h-4 w-4 inline mr-2" />
                                Completar Rutero
                            </button>
                        )}
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-neutral-400" />
                        <div>
                            <p className="text-sm text-neutral-600">Transportista</p>
                            <p className="font-medium text-neutral-800">
                                {rutero.transportista
                                    ? `${rutero.transportista.nombre} ${rutero.transportista.apellido}`
                                    : 'No asignado'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-neutral-400" />
                        <div>
                            <p className="text-sm text-neutral-600">Vehículo</p>
                            <p className="font-medium text-neutral-800">
                                {rutero.vehiculo?.placa || 'No asignado'}
                                {rutero.vehiculo?.modelo && ` - ${rutero.vehiculo.modelo}`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-neutral-400" />
                        <div>
                            <p className="text-sm text-neutral-600">Número de Paradas</p>
                            <p className="font-medium text-neutral-800">{rutero.paradas?.length || 0}</p>
                        </div>
                    </div>

                    {rutero.fecha_programada && (
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-neutral-400" />
                            <div>
                                <p className="text-sm text-neutral-600">Fecha Programada</p>
                                <p className="font-medium text-neutral-800">
                                    {formatDate(rutero.fecha_programada)}
                                </p>
                            </div>
                        </div>
                    )}

                    {rutero.iniciado_en && (
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-neutral-400" />
                            <div>
                                <p className="text-sm text-neutral-600">Iniciado</p>
                                <p className="font-medium text-neutral-800">{formatDate(rutero.iniciado_en)}</p>
                            </div>
                        </div>
                    )}

                    {rutero.completado_en && (
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-neutral-400" />
                            <div>
                                <p className="text-sm text-neutral-600">Completado</p>
                                <p className="font-medium text-neutral-800">{formatDate(rutero.completado_en)}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Map */}
            {puntosMapa.length > 0 && (
                <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4">Mapa de Paradas</h3>
                    <ZonaMapaGoogle poligono={[]} puntos={puntosMapa} zoom={13} />
                </div>
            )}

            {/* Paradas List */}
            <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                    Paradas ({rutero.paradas?.length || 0})
                </h3>
                <ParadasList
                    paradas={rutero.paradas || []}
                    showEstadoEntrega={rutero.estado === 'en_curso' || rutero.estado === 'completado'}
                />
            </div>

            {/* Historial Modal */}
            <HistorialModal
                isOpen={showHistorial}
                onClose={() => setShowHistorial(false)}
                ruteroId={rutero.id}
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
