import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageHero } from '../../../../components/ui/PageHero'
import { ArrowLeft, MapPin, Users, Calendar, CheckCircle, RefreshCcw, Flag } from 'lucide-react'
import { ParadasList } from '../../../supervisor/components/ParadasList'
import { ZonaMapaGoogle } from '../../../supervisor/components/ZonaMapaGoogle'
import { HistorialModal } from '../../../supervisor/components/HistorialModal'
import { getRutaVendedorById, iniciarRuta, completarRuta } from '../../../supervisor/services/rutasVendedorApi'
import { obtenerClientePorId, obtenerZonas } from '../../../supervisor/services/clientesApi'
import { ESTADO_RUTA_COLORS, ESTADO_RUTA_LABELS, type RutaVendedor, type ParadaRuta } from '../../../supervisor/services/rutasVendedorTypes'

export default function DetalleRutaPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [ruta, setRuta] = useState<RutaVendedor | null>(null)
    const [loading, setLoading] = useState(false)
    const [hydrating, setHydrating] = useState(false)
    const [showHistorial, setShowHistorial] = useState(false)
    const [activeTab, setActiveTab] = useState<'detalle' | 'paradas' | 'mapa'>('detalle')
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    useEffect(() => {
        if (id) {
            loadRuta(id)
        }
    }, [id])

    const loadRuta = async (rutaId: string) => {
        setLoading(true)
        try {
            const data = await getRutaVendedorById(rutaId)
            if (data) {
                await hydrateRuta(data)
            }
        } catch (error) {
            console.error('Error al cargar ruta:', error)
            showToast('error', 'No se pudo cargar el detalle de la ruta')
        } finally {
            setLoading(false)
        }
    }

    const hydrateRuta = async (rutaData: RutaVendedor) => {
        setHydrating(true)
        try {
            const [zonas] = await Promise.all([
                obtenerZonas().catch(() => [])
            ])

            const zona = zonas.find(z => String(z.id) === String(rutaData.zona_id))

            const hydratedParadas = await Promise.all(
                (rutaData.paradas || []).map(async (p: ParadaRuta) => {
                    try {
                        const clienteFull = await obtenerClientePorId(p.cliente_id)
                        return {
                            ...p,
                            cliente: clienteFull ? {
                                id: clienteFull.id,
                                razon_social: clienteFull.razon_social,
                                direccion: clienteFull.direccion_texto || clienteFull.identificacion || 'Dirección no disponible',
                                latitud: clienteFull.latitud || undefined,
                                longitud: clienteFull.longitud || undefined,
                                ubicacion_gps: clienteFull.ubicacion_gps || undefined
                            } : p.cliente
                        }
                    } catch (e) {
                        return p
                    }
                })
            )

            setRuta({
                ...rutaData,
                zona: zona ? { id: zona.id, nombre: zona.nombre } : rutaData.zona,
                paradas: hydratedParadas
            })
        } catch (error) {
            console.error('Error hydrating route:', error)
            setRuta(rutaData)
        } finally {
            setHydrating(false)
        }
    }

    const handleAction = async (action: 'iniciar' | 'completar') => {
        if (!ruta) return
        try {
            const updated = action === 'iniciar'
                ? await iniciarRuta(ruta.id)
                : await completarRuta(ruta.id)

            showToast('success', `Ruta ${action === 'iniciar' ? 'iniciada' : 'completada'} exitosamente`)
            await hydrateRuta(updated)
        } catch (error: any) {
            showToast('error', error.message || `Error al ${action} ruta`)
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
            year: 'numeric'
        })
    }

    const paradasParaList = ruta?.paradas?.map(p => ({
        id: p.id,
        pedido_id: p.cliente_id,
        orden_visita: p.orden_visita,
        completada: p.visitado,
        pedido: {
            id: p.cliente_id,
            numero_pedido: `VISITA-${p.orden_visita}`,
            cliente_nombre: p.cliente?.razon_social || 'Cliente',
            direccion_entrega: p.cliente?.direccion || 'Dirección no disponible',
            ubicacion_gps: (p.cliente as any)?.ubicacion_gps,
            total: 0
        }
    })) || []

    const puntosMapa = ruta?.paradas
        ?.filter(p => (p.cliente as any)?.ubicacion_gps)
        .map((p, index) => ({
            lat: (p.cliente as any).ubicacion_gps.coordinates[1],
            lng: (p.cliente as any).ubicacion_gps.coordinates[0],
            nombre: `${index + 1}. ${p.cliente?.razon_social}`
        })) || []

    if (loading) {
        return <div className="p-12 text-center text-neutral-500">Cargando detalles de la ruta...</div>
    }

    if (!ruta) {
        return (
            <div className="p-12 text-center text-neutral-500">
                <Flag className="mx-auto mb-4 h-16 w-16 opacity-20" />
                <h3 className="text-xl font-bold text-neutral-700">Ruta no encontrada</h3>
                <button onClick={() => navigate('/vendedor/rutas')} className="mt-4 text-brand-red font-medium">Volver a la lista</button>
            </div>
        )
    }

    const estadoColor = ESTADO_RUTA_COLORS[ruta.estado]
    const estadoLabel = ESTADO_RUTA_LABELS[ruta.estado]

    const renderTabContent = () => {
        switch (activeTab) {
            case 'detalle':
                return (
                    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-6">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-neutral-800 mb-2">Información del Rutero</h2>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${estadoColor}`}>
                                    {estadoLabel}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowHistorial(true)}
                                    className="px-4 py-2 text-sm font-medium text-brand-red border border-brand-red rounded-lg hover:bg-brand-red hover:text-white transition-all"
                                >
                                    Historial
                                </button>
                                {ruta.estado === 'publicado' && (
                                    <button
                                        onClick={() => handleAction('iniciar')}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                    >
                                        Iniciar Ruta
                                    </button>
                                )}
                                {ruta.estado === 'en_curso' && (
                                    <button
                                        onClick={() => handleAction('completar')}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                                    >
                                        Finalizar Ruta
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                                <Users className="h-5 w-5 text-neutral-400" />
                                <div>
                                    <p className="text-xs text-neutral-500 uppercase font-semibold">Vendedor</p>
                                    <p className="font-medium text-neutral-800">{ruta.vendedor?.nombre || 'Mi Perfil'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                                <MapPin className="h-5 w-5 text-neutral-400" />
                                <div>
                                    <p className="text-xs text-neutral-500 uppercase font-semibold">Zona</p>
                                    <p className="font-medium text-neutral-800">{ruta.zona?.nombre || 'General'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                                <Calendar className="h-5 w-5 text-neutral-400" />
                                <div>
                                    <p className="text-xs text-neutral-500 uppercase font-semibold">Fecha Programada</p>
                                    <p className="font-medium text-neutral-800">{formatDate(ruta.fecha_programada)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                                <div className="w-5 h-5 rounded-full bg-brand-red/10 text-brand-red flex items-center justify-center text-[10px] font-bold">
                                    {ruta.paradas?.length || 0}
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-500 uppercase font-semibold">Paradas</p>
                                    <p className="font-medium text-neutral-800">{ruta.paradas?.length || 0} clientes por visitar</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            case 'paradas':
                return (
                    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Agenda de Visitas</h3>
                        <ParadasList
                            paradas={paradasParaList as any}
                            showEstadoEntrega={false}
                            onParadaClick={(p) => {
                                if (p.pedido?.ubicacion_gps) setActiveTab('mapa')
                            }}
                        />
                    </div>
                )
            case 'mapa':
                return (
                    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-6 h-[500px]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-neutral-800">Mapa de Visitas</h3>
                            {hydrating && <span className="text-xs text-brand-red animate-pulse">Cargando ubicaciones...</span>}
                        </div>
                        {puntosMapa.length > 0 ? (
                            <ZonaMapaGoogle style={{ height: '400px' }} puntos={puntosMapa} zoom={13} />
                        ) : (
                            <div className="h-[400px] bg-neutral-50 border border-dashed border-neutral-300 rounded-xl flex flex-col items-center justify-center text-neutral-500 text-center p-8">
                                <MapPin className="h-12 w-12 mb-4 opacity-20" />
                                <p>No hay coordenadas GPS disponibles para los clientes de esta ruta.</p>
                            </div>
                        )}
                    </div>
                )
        }
    }

    return (
        <div className="space-y-6">
            <PageHero
                title={`Ruta de Venta #${ruta.id.slice(0, 8)}`}
                subtitle="Gestiona tus visitas y organiza tu recorrido comercial"
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <button
                    onClick={() => navigate('/vendedor/rutas')}
                    className="flex items-center gap-2 text-neutral-500 hover:text-brand-red font-medium transition-all"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a Lista
                </button>

                <div className="flex p-1 bg-neutral-100 rounded-xl">
                    {(['detalle', 'paradas', 'mapa'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-white text-brand-red shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="transition-all duration-300">
                {renderTabContent()}
            </div>

            <HistorialModal
                isOpen={showHistorial}
                onClose={() => setShowHistorial(false)}
                ruteroId={ruta.id}
            />

            {toast && (
                <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-right duration-300 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                    {toast.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <RefreshCcw className="w-6 h-6 rotate-45" />}
                    <span className="font-semibold">{toast.message}</span>
                </div>
            )}
        </div>
    )
}
