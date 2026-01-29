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
import { obtenerPedidoPorId } from '../../../supervisor/services/pedidosApi'
import { obtenerZonas } from '../../../supervisor/services/clientesApi'
import type { ParadaRutero } from '../../../supervisor/services/types'

export default function DetalleRuteroPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [rutero, setRutero] = useState<RuteroLogistico | null>(null)
    const [loading, setLoading] = useState(false)
    const [showHistorial, setShowHistorial] = useState(false)
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [activeTab, setActiveTab] = useState<'detalle' | 'paradas' | 'mapa'>('detalle')

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
            if (data) {
                // Hydrate Data in Frontend
                const [zonas] = await Promise.all([
                    obtenerZonas().catch(() => [])
                ])

                const zona = zonas.find(z => String(z.id) === String(data.zona_id))

                // Hydrate Paradas
                const hydratedParadas = await Promise.all(
                    (data.paradas || []).map(async (p: ParadaRutero) => {
                        try {
                            const pedidoFull = await obtenerPedidoPorId(p.pedido_id)
                            return {
                                ...p,
                                pedido: pedidoFull ? {
                                    id: pedidoFull.id,
                                    numero_pedido: pedidoFull.codigo_visual || pedidoFull.id,
                                    cliente_id: pedidoFull.cliente_id || '',
                                    cliente_nombre: pedidoFull.cliente?.razon_social || 'Cliente',
                                    direccion_entrega: pedidoFull.cliente?.direccion_texto || pedidoFull.cliente?.identificacion || 'Dirección no disponible',
                                    ubicacion_gps: pedidoFull.cliente?.ubicacion_gps,
                                    total: pedidoFull.total_final,
                                } : p.pedido
                            }
                        } catch (e) {
                            return p
                        }
                    })
                )

                // The obtenerPedidoPorId already hydrates the client info.
                // Let's improve the mapping here to be more precise based on what ParadasList expects.

                setRutero({
                    ...data,
                    zona: zona ? { id: zona.id, nombre: zona.nombre } : undefined,
                    paradas: hydratedParadas
                })
            } else {
                setRutero(null)
            }
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


    const renderTabContent = () => {
        if (!rutero) return null

        switch (activeTab) {
            case 'detalle':
                return (
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

                            {/* Actions moved to tabs or kept here */}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                                <User className="h-6 w-6 text-neutral-400" />
                                <div>
                                    <p className="text-xs text-neutral-500 uppercase font-semibold">Transportista</p>
                                    <p className="font-medium text-neutral-800">
                                        {rutero.transportista
                                            ? `${rutero.transportista.nombre} ${rutero.transportista.apellido}`
                                            : 'No asignado'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                                <Truck className="h-6 w-6 text-neutral-400" />
                                <div>
                                    <p className="text-xs text-neutral-500 uppercase font-semibold">Vehículo</p>
                                    <p className="font-medium text-neutral-800">
                                        {rutero.vehiculo?.placa || 'No asignado'}
                                        {rutero.vehiculo?.modelo && ` - ${rutero.vehiculo.modelo}`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                                <MapPin className="h-6 w-6 text-neutral-400" />
                                <div>
                                    <p className="text-xs text-neutral-500 uppercase font-semibold">Zona de Entrega</p>
                                    <p className="font-medium text-neutral-800">{rutero.zona?.nombre || 'General'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-red/10 text-brand-red flex items-center justify-center font-bold text-xs uppercase">
                                    {(rutero.paradas?.length || 0)}
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-500 uppercase font-semibold">Número de Paradas</p>
                                    <p className="font-medium text-neutral-800">{rutero.paradas?.length || 0} paradas planificadas</p>
                                </div>
                            </div>

                            {rutero.iniciado_en && (
                                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                                    <Calendar className="h-6 w-6 text-neutral-400" />
                                    <div>
                                        <p className="text-xs text-neutral-500 uppercase font-semibold">Iniciado</p>
                                        <p className="font-medium text-neutral-800">{formatDate(rutero.iniciado_en)}</p>
                                    </div>
                                </div>
                            )}

                            {rutero.completado_en && (
                                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                    <div>
                                        <p className="text-xs text-neutral-500 uppercase font-semibold">Completado</p>
                                        <p className="font-medium text-neutral-800">{formatDate(rutero.completado_en)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            case 'paradas':
                return (
                    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-neutral-800">
                                Lista de Paradas ({rutero.paradas?.length || 0})
                            </h3>
                        </div>
                        <ParadasList
                            paradas={rutero.paradas || []}
                            showEstadoEntrega={rutero.estado === 'en_curso' || rutero.estado === 'completado'}
                            onParadaClick={(p) => {
                                // Maybe navigate to a detail or focus map?
                                if (p.pedido?.ubicacion_gps) {
                                    setActiveTab('mapa')
                                }
                            }}
                        />
                    </div>
                )
            case 'mapa':
                return (
                    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-6 h-[500px]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-neutral-800">Mapa de Ruta</h3>
                            <p className="text-sm text-neutral-500">{puntosMapa.length} ubicaciones encontradas</p>
                        </div>
                        {puntosMapa.length > 0 ? (
                            <ZonaMapaGoogle style={{ height: '400px' }} poligono={[]} puntos={puntosMapa} zoom={13} />
                        ) : (
                            <div className="h-[400px] bg-neutral-50 border border-dashed border-neutral-300 rounded-xl flex flex-col items-center justify-center text-neutral-500">
                                <MapPin className="h-12 w-12 mb-2 opacity-20" />
                                <p>No hay coordenadas GPS disponibles para los pedidos de este rutero.</p>
                            </div>
                        )}
                    </div>
                )
            default:
                return null
        }
    }

    const estadoColor = ESTADO_RUTERO_COLORS[rutero.estado]
    const estadoLabel = ESTADO_RUTERO_LABELS[rutero.estado]

    return (
        <div className="space-y-6">
            <PageHero
                title={`Rutero #${rutero.id.slice(0, 8)}`}
                subtitle="Gestión de ruta y paradas logísticas"
            />

            {/* Back Button and Navigation Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <button
                    onClick={() => navigate('/transportista/rutas')}
                    className="flex items-center gap-2 text-neutral-500 hover:text-brand-red font-medium transition-all duration-150"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a Lista de Rutas
                </button>

                <div className="flex p-1 bg-neutral-100 rounded-xl">
                    {(['detalle', 'paradas', 'mapa'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${activeTab === tab
                                ? 'bg-white text-brand-red shadow-sm'
                                : 'text-neutral-500 hover:text-neutral-700'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="transition-all duration-300">
                {renderTabContent()}
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
                    className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-right duration-300 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        {toast.type === 'success' ? (
                            <CheckCircle className="w-6 h-6" />
                        ) : (
                            <ArrowLeft className="w-6 h-6 rotate-45" />
                        )}
                        <span className="font-semibold">{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    )
}
