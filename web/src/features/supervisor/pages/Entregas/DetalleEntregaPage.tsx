import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ArrowLeft, MapPin, Truck, User, Calendar, CheckCircle,
    Play, Package, AlertTriangle, Camera, FileText, Info, XCircle
} from 'components/ui/Icons'
import { LoadingSpinner } from 'components/ui/LoadingSpinner'
import { Alert } from 'components/ui/Alert'
import { ZonaMapaGoogle } from '../../components/ZonaMapaGoogle'
import { MarcarEntregadoModal } from '../../../transportista/components/MarcarEntregadoModal'
import { MarcarNoEntregadoModal } from '../../../transportista/components/MarcarNoEntregadoModal'
import { ReportarIncidenciaModal } from '../../../transportista/components/ReportarIncidenciaModal'
import { AgregarEvidenciaModal } from '../../../transportista/components/AgregarEvidenciaModal'
import { getEntregaById, cancelarEntrega, marcarEnRuta } from '../../../shared/services/deliveryApi'
import { obtenerPedidoPorId } from '../../services/pedidosApi'
import { obtenerClientePorId } from '../../services/clientesApi'
import { getUserById } from '../../services/usuariosApi'
import type { Entrega, EstadoEntrega } from '../../../shared/types/deliveryTypes'
import { ESTADO_ENTREGA_COLORS, ESTADO_ENTREGA_LABELS, SEVERIDAD_COLORS, SEVERIDAD_LABELS } from '../../../shared/types/deliveryTypes'

export default function DetalleEntregaPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [delivery, setDelivery] = useState<Entrega | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'detalle' | 'evidencias' | 'incidencias' | 'mapa'>('detalle')
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    // Extra data
    const [cliente, setCliente] = useState<any>(null)
    const [pedido, setPedido] = useState<any>(null)
    const [transportista, setTransportista] = useState<any>(null)

    // Modal states
    const [showEntregadoModal, setShowEntregadoModal] = useState(false)
    const [showNoEntregadoModal, setShowNoEntregadoModal] = useState(false)
    const [showIncidenciaModal, setShowIncidenciaModal] = useState(false)
    const [showEvidenciaModal, setShowEvidenciaModal] = useState(false)

    useEffect(() => {
        if (id) {
            loadData()
        }
    }, [id])

    const loadData = async () => {
        if (!id) return
        try {
            setLoading(true)
            setError(null)
            const data = await getEntregaById(id)
            if (data) {
                setDelivery(data)

                // Fetch Pedido first to get the most accurate cliente_id
                const orderInfo = await obtenerPedidoPorId(data.pedido_id).catch(() => null)
                setPedido(orderInfo)

                const clientId = orderInfo?.cliente_id || data.pedido?.cliente_id

                // Load additional info in parallel
                const [clientInfo, driverInfo] = await Promise.all([
                    clientId ? obtenerClientePorId(clientId).catch(() => null) : null,
                    getUserById(data.transportista_id).catch(() => null)
                ])

                // Merge client data: prefer direct fetch, fallback to pedido's snapshot, fallback to whatever we found
                const mergedClient = clientInfo || orderInfo?.cliente
                setCliente(mergedClient)
                setTransportista(driverInfo)
            } else {
                setError('Entrega no encontrada')
            }
        } catch (err: any) {
            setError(err?.message || 'Error al cargar detalle de entrega')
        } finally {
            setLoading(false)
        }
    }

    const handleIniciarEnRuta = async () => {
        if (!id || !confirm('¿Marcar este pedido como EN RUTA?')) return
        try {
            await marcarEnRuta(id)
            showToast('success', 'Pedido marcado en ruta')
            loadData()
        } catch (err: any) {
            showToast('error', err.message)
        }
    }

    const handleCancelar = async () => {
        if (!id) return
        const motivo = prompt('Ingrese el motivo de cancelación:')
        if (!motivo) return

        try {
            await cancelarEntrega(id, motivo)
            showToast('success', 'Entrega cancelada exitosamente')
            loadData()
        } catch (err: any) {
            showToast('error', err.message)
        }
    }

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message })
        setTimeout(() => setToast(null), 3000)
    }

    const formatDate = (date?: string | null) => {
        if (!date) return '-'
        return new Date(date).toLocaleString('es-EC', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <LoadingSpinner />
                <p className="mt-4 text-gray-500 font-medium">Sincronizando datos de entrega...</p>
            </div>
        )
    }

    if (error || !delivery) {
        return (
            <div className="space-y-6">
                <Alert type="error" message={error || 'No se pudo cargar la entrega'} />
                <button
                    onClick={() => navigate('/supervisor/entregas')}
                    className="flex items-center gap-2 text-brand-red font-bold"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver al listado
                </button>
            </div>
        )
    }

    const isFinalStatus = ['entregado', 'entregado_completo', 'entregado_parcial', 'no_entregado', 'cancelado'].includes(delivery.estado)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <button
                    onClick={() => navigate('/supervisor/entregas')}
                    className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                    title="Regresar"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-gray-900">Entrega #{delivery.id.substring(0, 8).toUpperCase()}</h1>
                    <p className="text-sm text-gray-500">Gestión operativa y revisión de evidencias</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-4 py-1.5 rounded-xl text-xs font-bold border ${ESTADO_ENTREGA_COLORS[delivery.estado as EstadoEntrega]}`}>
                        {ESTADO_ENTREGA_LABELS[delivery.estado as EstadoEntrega]}
                    </span>
                </div>
            </div>

            <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
                {(['detalle', 'evidencias', 'incidencias', 'mapa'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-white text-brand-red shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Principal Content */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'detalle' && (
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-8">
                            <section>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Información del Cliente
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl">
                                    <div>
                                        <label className="text-xs text-gray-500">Razón Social</label>
                                        <p className="font-bold text-gray-900">{cliente?.razon_social || 'No disponible'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Identificación (RUC)</label>
                                        <p className="font-medium text-gray-700">{cliente?.identificacion || 'N/A'}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs text-gray-500">Dirección</label>
                                        <p className="font-medium text-gray-700 flex items-center gap-1">
                                            <MapPin className="w-3 h-3 text-brand-red" />
                                            {cliente?.direccion_texto || cliente?.direccion || 'Sin dirección registrada'}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Package className="w-4 h-4" /> Datos del Pedido
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-100 p-4 rounded-xl">
                                    <div>
                                        <label className="text-xs text-gray-500">Código Visual</label>
                                        <p className="font-bold text-brand-red">#{pedido?.codigo_visual || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Estado Pedido</label>
                                        <p className="font-medium text-gray-700 uppercase italic text-xs">{pedido?.estado_actual || 'Desconocido'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Total a Cobrar</label>
                                        <p className="font-bold text-gray-900 text-lg">
                                            ${pedido?.total_final?.toFixed(2) || '0.00'}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Truck className="w-4 h-4" /> Logística
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
                                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500">Transportista</label>
                                            <p className="font-bold text-gray-900">{transportista?.nombre || 'Sincronizando...'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
                                        <div className="w-10 h-10 bg-gold-50 rounded-full flex items-center justify-center text-gold-600">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500">Asignado en</label>
                                            <p className="font-bold text-gray-900">{formatDate(delivery.creado_en)}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {delivery.observaciones && (
                                <section className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                                    <h3 className="text-xs font-bold text-orange-800 uppercase mb-2 flex items-center gap-2">
                                        <Info className="w-4 h-4" /> Observaciones de Cierre
                                    </h3>
                                    <p className="text-sm text-orange-900">{delivery.observaciones}</p>
                                </section>
                            )}
                        </div>
                    )}

                    {activeTab === 'evidencias' && (
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Camera className="w-5 h-5 text-brand-red" /> Imágenes y Documentos ({delivery.evidencias?.length || 0})
                                </h3>
                                {!isFinalStatus && (
                                    <button
                                        onClick={() => setShowEvidenciaModal(true)}
                                        className="px-4 py-2 bg-brand-red text-white text-xs font-bold rounded-xl hover:bg-brand-red-dark transition-colors shadow-lg shadow-brand-red/20 flex items-center gap-2"
                                    >
                                        <Camera className="w-4 h-4" /> Agregar Evidencia
                                    </button>
                                )}
                            </div>

                            {delivery.evidencias && delivery.evidencias.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {delivery.evidencias.map((evi) => (
                                        <div key={evi.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 shadow-sm">
                                            <img
                                                src={evi.url}
                                                alt={evi.descripcion || 'Evidencia'}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                                <span className="text-[10px] text-white/80 font-bold uppercase">{evi.tipo}</span>
                                                <p className="text-xs text-white line-clamp-2">{evi.descripcion || 'Sin descripción'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                                    <Camera className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                    <p className="text-gray-400 font-medium">No se han registrado evidencias aún</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'incidencias' && (
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-brand-red" /> Incidencias Reportadas ({delivery.incidencias?.length || 0})
                                </h3>
                                {!isFinalStatus && (
                                    <button
                                        onClick={() => setShowIncidenciaModal(true)}
                                        className="px-4 py-2 bg-white border border-brand-red text-brand-red text-xs font-bold rounded-xl hover:bg-brand-red hover:text-white transition-all flex items-center gap-2"
                                    >
                                        <AlertTriangle className="w-4 h-4" /> Reportar Problema
                                    </button>
                                )}
                            </div>

                            {delivery.incidencias && delivery.incidencias.length > 0 ? (
                                <div className="space-y-4">
                                    {delivery.incidencias.map((inc) => (
                                        <div key={inc.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${SEVERIDAD_COLORS[inc.severidad]}`}>
                                                <AlertTriangle className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-[10px] font-bold uppercase ${SEVERIDAD_COLORS[inc.severidad].replace('bg-', 'text-').replace('-100', '-700')}`}>
                                                        Severidad: {SEVERIDAD_LABELS[inc.severidad]}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-medium">{formatDate(inc.reportado_en)}</span>
                                                </div>
                                                <h4 className="font-bold text-gray-900 text-sm mb-1">{inc.tipo_incidencia || 'Incidencia General'}</h4>
                                                <p className="text-sm text-gray-600 leading-relaxed">{inc.descripcion}</p>
                                                {inc.resuelto && (
                                                    <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2 text-xs text-green-600 font-medium">
                                                        <CheckCircle className="w-4 h-4" /> Resuelto: {inc.resolucion}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                                    <CheckCircle className="w-12 h-12 text-green-100 mx-auto mb-4" />
                                    <p className="text-gray-400 font-medium">Sin incidencias. Operación normal.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'mapa' && (
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[500px]">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-brand-red" /> Ubicación del Pedido
                            </h3>
                            {cliente?.latitud || pedido?.cliente?.ubicacion_gps ? (
                                <ZonaMapaGoogle
                                    style={{ height: '400px', borderRadius: '1rem' }}
                                    puntos={[{
                                        lat: Number(cliente?.latitud || pedido?.cliente?.ubicacion_gps?.coordinates[1]),
                                        lng: Number(cliente?.longitud || pedido?.cliente?.ubicacion_gps?.coordinates[0]),
                                        nombre: cliente?.razon_social || 'Ubicación Pedido'
                                    }]}
                                    zoom={15}
                                    poligono={[]}
                                />
                            ) : (
                                <div className="h-[400px] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-400">
                                    <MapPin className="w-12 h-12 opacity-20 mb-2" />
                                    <p className="font-medium text-sm">No hay coordenadas registradas</p>
                                    <p className="text-xs">El cliente no tiene ubicación GPS válida.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Barra Lateral Acciones */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                            <Play className="w-4 h-4 text-brand-red" /> Acciones Disponibles
                        </h3>

                        <div className="space-y-3">
                            {delivery.estado === 'pendiente' && (
                                <button
                                    onClick={handleIniciarEnRuta}
                                    className="w-full flex items-center justify-between p-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-bold text-sm text-left group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Truck className="w-5 h-5 group-hover:animate-bounce" />
                                        <span>Iniciar en Ruta</span>
                                    </div>
                                    <Play className="w-4 h-4" />
                                </button>
                            )}

                            {delivery.estado === 'en_ruta' && (
                                <>
                                    <button
                                        onClick={() => setShowEntregadoModal(true)}
                                        className="w-full flex items-center justify-between p-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors font-bold text-sm text-left group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5" />
                                            <span>Completar Entrega</span>
                                        </div>
                                        <Play className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setShowNoEntregadoModal(true)}
                                        className="w-full flex items-center justify-between p-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors font-bold text-sm text-left group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <XCircle className="w-5 h-5" />
                                            <span>No Entregado</span>
                                        </div>
                                        <AlertTriangle className="w-4 h-4" />
                                    </button>
                                </>
                            )}

                            {!isFinalStatus && (
                                <button
                                    onClick={handleCancelar}
                                    className="w-full flex items-center gap-3 p-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-sm mt-4 border border-transparent hover:border-red-100"
                                >
                                    <XCircle className="w-5 h-5" />
                                    <span>Anular Entrega</span>
                                </button>
                            )}

                            {isFinalStatus && (
                                <div className="py-4 text-center">
                                    <div className="inline-flex p-3 bg-gray-50 rounded-full mb-3">
                                        <FileText className="w-6 h-6 text-gray-300" />
                                    </div>
                                    <p className="text-xs text-gray-400 font-medium">Esta entrega se encuentra en estado final. Las acciones operativas están inhabilitadas.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-900 p-6 rounded-2xl shadow-xl text-white">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Tracking</h4>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-brand-red mt-1.5 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-tight">Estado Actual</p>
                                    <p className="text-sm font-medium text-gray-300">
                                        {ESTADO_ENTREGA_LABELS[delivery.estado as EstadoEntrega]}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-gray-600 mt-1.5" />
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-tight">Última Actividad</p>
                                    <p className="text-sm font-medium text-gray-300">{formatDate(delivery.actualizado_en)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <MarcarEntregadoModal
                isOpen={showEntregadoModal}
                onClose={() => setShowEntregadoModal(false)}
                entregaId={delivery.id}
                pedidoNumero={pedido?.codigo_visual || delivery.pedido_id}
                estadoActual={delivery.estado}
                onSuccess={() => { showToast('success', 'Entrega completada'); loadData(); }}
            />
            <MarcarNoEntregadoModal
                isOpen={showNoEntregadoModal}
                onClose={() => setShowNoEntregadoModal(false)}
                entregaId={delivery.id}
                pedidoNumero={pedido?.codigo_visual || delivery.pedido_id}
                estadoActual={delivery.estado}
                onSuccess={() => { showToast('success', 'Estado fallido registrado'); loadData(); }}
            />
            <ReportarIncidenciaModal
                isOpen={showIncidenciaModal}
                onClose={() => setShowIncidenciaModal(false)}
                entregaId={delivery.id}
                pedidoNumero={pedido?.codigo_visual || delivery.pedido_id}
                onSuccess={() => { showToast('success', 'Incidencia reportada'); loadData(); }}
            />
            <AgregarEvidenciaModal
                isOpen={showEvidenciaModal}
                onClose={() => setShowEvidenciaModal(false)}
                entregaId={delivery.id}
                pedidoNumero={pedido?.codigo_visual || delivery.pedido_id}
                onSuccess={() => { showToast('success', 'Evidencia cargada'); loadData(); }}
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
                            <AlertTriangle className="w-6 h-6" />
                        )}
                        <span className="font-semibold">{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    )
}
