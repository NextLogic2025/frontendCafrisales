import React, { useState, useEffect } from 'react'
import { PageHero } from 'components/ui/PageHero'
import { Plus, Filter, Truck } from 'lucide-react'
import { RuteroCard } from '../../components/RuteroCard'
import { HistorialModal } from '../../components/HistorialModal'
import { CrearRuteroModal } from './CrearRuteroModal'
import { EditarRuteroModal } from './EditarRuteroModal'
import { DetalleRuteroModal } from './DetalleRuteroModal'
import type { RuteroLogistico, EstadoRutero } from '../../services/types'
import { getRuterosLogisticos, getRuteroLogistico, publicarRutero, cancelarRutero, createRuteroLogistico } from '../../services/logisticsApi'
import { obtenerTransportistas, type Usuario } from '../../services/usuariosApi'
import { getVehicles, type Vehicle } from '../../services/vehiclesApi'
import { Modal } from 'components/ui/Modal'
import { FormField } from 'components/ui/FormField'

export default function RuterosLogisticosPage() {
    const [ruteros, setRuteros] = useState<RuteroLogistico[]>([])
    const [transportistas, setTransportistas] = useState<Usuario[]>([])
    const [vehiculos, setVehiculos] = useState<Vehicle[]>([])
    const [loading, setLoading] = useState(false)
    const [filtroEstado, setFiltroEstado] = useState<EstadoRutero | 'todos'>('todos')
    const [selectedRutero, setSelectedRutero] = useState<RuteroLogistico | null>(null)
    const [showHistorial, setShowHistorial] = useState(false)
    const [historialRuteroId, setHistorialRuteroId] = useState<string>('')
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [cancelRutero, setCancelRutero] = useState<RuteroLogistico | null>(null)
    const [cancelMotivo, setCancelMotivo] = useState('')
    const [showCrearModal, setShowCrearModal] = useState(false)
    const [showEditarModal, setShowEditarModal] = useState(false)
    const [showDetalleModal, setShowDetalleModal] = useState(false)
    const [ruteroEditar, setRuteroEditar] = useState<RuteroLogistico | null>(null)
    const [ruteroDetalle, setRuteroDetalle] = useState<RuteroLogistico | null>(null)
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    useEffect(() => {
        loadRuteros()
    }, [filtroEstado])

    const loadRuteros = async () => {
        setLoading(true)
        try {
            // Load all required data in parallel
            const [ruterosData, transportistasData, vehiculosData] = await Promise.all([
                getRuterosLogisticos(
                    filtroEstado === 'todos' ? undefined : { estado: filtroEstado as EstadoRutero }
                ),
                obtenerTransportistas(),
                getVehicles(),
            ])

            setTransportistas(transportistasData)
            setVehiculos(vehiculosData)

            // Load full details for each rutero to get paradas
            const ruterosConDetalles = await Promise.all(
                ruterosData.map(async (r) => {
                    try {
                        // Get full rutero details including paradas
                        const ruteroCompleto = await getRuteroLogistico(r.id)
                        if (!ruteroCompleto) throw new Error('Rutero not found')
                        
                        const transportista = transportistasData.find((t) => t.id === ruteroCompleto.transportista_id)
                        const vehiculo = vehiculosData.find((v) => v.id === ruteroCompleto.vehiculo_id)

                        return {
                            ...ruteroCompleto,
                            paradas: ruteroCompleto.paradas || [],
                            transportista: ruteroCompleto.transportista || (transportista ? {
                                id: transportista.id,
                                nombre: transportista.nombre || '',
                                apellido: '',
                                email: transportista.email
                            } : undefined),
                            vehiculo: ruteroCompleto.vehiculo || (vehiculo ? {
                                id: vehiculo.id,
                                placa: vehiculo.placa,
                                modelo: vehiculo.modelo,
                                capacidad_kg: vehiculo.capacidad_kg,
                                estado: vehiculo.estado
                            } : undefined)
                        }
                    } catch (error) {
                        // If individual rutero fetch fails, return basic data
                        console.error(`Error loading details for rutero ${r.id}:`, error)
                        const transportista = transportistasData.find((t) => t.id === r.transportista_id)
                        const vehiculo = vehiculosData.find((v) => v.id === r.vehiculo_id)

                        return {
                            ...r,
                            paradas: r.paradas || [],
                            transportista: r.transportista || (transportista ? {
                                id: transportista.id,
                                nombre: transportista.nombre || '',
                                apellido: '',
                                email: transportista.email
                            } : undefined),
                            vehiculo: r.vehiculo || (vehiculo ? {
                                id: vehiculo.id,
                                placa: vehiculo.placa,
                                modelo: vehiculo.modelo,
                                capacidad_kg: vehiculo.capacidad_kg,
                                estado: vehiculo.estado
                            } : undefined)
                        }
                    }
                })
            )

            setRuteros(ruterosConDetalles)
        } catch (error) {
            console.error('Error al cargar ruteros:', error)
            showToast('error', 'Error al cargar ruteros logísticos')
        } finally {
            setLoading(false)
        }
    }

    const handlePublish = async (rutero: RuteroLogistico) => {
        if (!confirm('¿Estás seguro de publicar este rutero? El vehículo será asignado.')) return

        try {
            await publicarRutero(rutero.id)
            showToast('success', 'Rutero publicado exitosamente')
            loadRuteros()
        } catch (error: any) {
            showToast('error', error.message || 'Error al publicar rutero')
        }
    }

    const handleCancelClick = (rutero: RuteroLogistico) => {
        setCancelRutero(rutero)
        setShowCancelModal(true)
    }

    const handleCancelConfirm = async () => {
        if (!cancelRutero || !cancelMotivo.trim()) {
            showToast('error', 'Debes ingresar un motivo de cancelación')
            return
        }

        try {
            await cancelarRutero(cancelRutero.id, { motivo: cancelMotivo })
            showToast('success', 'Rutero cancelado exitosamente')
            setShowCancelModal(false)
            setCancelRutero(null)
            setCancelMotivo('')
            loadRuteros()
        } catch (error: any) {
            showToast('error', error.message || 'Error al cancelar rutero')
        }
    }

    const handleViewHistorial = (rutero: RuteroLogistico) => {
        setHistorialRuteroId(rutero.id)
        setShowHistorial(true)
    }

    const handleViewDetalle = async (rutero: RuteroLogistico) => {
        try {
            // Fetch full rutero details including paradas with pedido data
            const ruteroCompleto = await getRuteroLogistico(rutero.id)
            if (ruteroCompleto) {
                setRuteroDetalle(ruteroCompleto)
            } else {
                setRuteroDetalle(rutero)
            }
            setShowDetalleModal(true)
        } catch (error) {
            console.error('Error loading rutero details:', error)
            showToast('error', 'Error al cargar detalles del rutero')
            // Fallback to the current rutero data
            setRuteroDetalle(rutero)
            setShowDetalleModal(true)
        }
    }

    const handleEditarClick = (rutero: RuteroLogistico) => {
        setRuteroEditar(rutero)
        setShowEditarModal(true)
    }

    const handleCrearRutero = async (payload: any) => {
        try {
            await createRuteroLogistico(payload)
            showToast('success', 'Rutero creado exitosamente')
            loadRuteros()
        } catch (error: any) {
            throw error // Re-throw to let modal handle it
        }
    }

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message })
        setTimeout(() => setToast(null), 3000)
    }

    const estadoOptions = [
        { label: 'Todos', value: 'todos' },
        { label: 'Borrador', value: 'borrador' },
        { label: 'Publicado', value: 'publicado' },
        { label: 'En Curso', value: 'en_curso' },
        { label: 'Completado', value: 'completado' },
        { label: 'Cancelado', value: 'cancelado' },
    ]

    return (
        <div className="space-y-6">
            <PageHero
                title="Ruteros Logísticos"
                subtitle="Gestiona los ruteros de entrega y asignación de vehículos"
                chips={['Logística', 'Entregas', 'Vehículos']}
            />

            {/* Filters and Actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-neutral-200 rounded-xl bg-gradient-to-r from-white via-neutral-50 to-white p-5 shadow-md">
                <div className="flex items-center gap-3">
                    <Filter className="h-5 w-5 text-neutral-600" />
                    <div className="w-48">
                        <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value as EstadoRutero | 'todos')}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                        >
                            {estadoOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    className="flex items-center gap-2 rounded-lg bg-brand-red px-5 py-2 text-sm font-semibold text-white shadow hover:bg-brand-red-dark transition-all duration-150"
                    onClick={() => setShowCrearModal(true)}
                >
                    <Plus className="h-4 w-4" />
                    Crear Rutero
                </button>
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
                    <h3 className="text-lg font-semibold text-neutral-700">Sin ruteros logísticos</h3>
                    <p className="text-sm text-neutral-500 mt-2">
                        No hay ruteros {filtroEstado !== 'todos' && `en estado "${filtroEstado}"`}. Crea uno
                        nuevo para comenzar.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ruteros.map((rutero) => (
                        <RuteroCard
                            key={rutero.id}
                            rutero={rutero}
                            role="supervisor"
                            onView={handleViewDetalle}
                            onPublish={handlePublish}
                            onCancel={handleCancelClick}
                            onEdit={handleEditarClick}
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

            {/* Cancel Modal */}
            <Modal
                isOpen={showCancelModal}
                onClose={() => {
                    setShowCancelModal(false)
                    setCancelRutero(null)
                    setCancelMotivo('')
                }}
                title="Cancelar Rutero"
                headerGradient="red"
                maxWidth="md"
            >
                <div className="space-y-4">
                    <p className="text-neutral-700">
                        ¿Estás seguro de cancelar este rutero? El vehículo volverá a estar disponible.
                    </p>

                    <FormField
                        label="Motivo de cancelación"
                        type="textarea"
                        value={cancelMotivo}
                        onChange={setCancelMotivo}
                        placeholder="Ingresa el motivo de la cancelación..."
                    />

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={handleCancelConfirm}
                            className="flex-1 bg-red-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-all duration-150 shadow-md disabled:opacity-50"
                            disabled={!cancelMotivo.trim()}
                        >
                            Confirmar Cancelación
                        </button>
                        <button
                            onClick={() => {
                                setShowCancelModal(false)
                                setCancelRutero(null)
                                setCancelMotivo('')
                            }}
                            className="flex-1 bg-neutral-200 text-neutral-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-neutral-300 transition-all duration-150"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Crear Rutero Modal */}
            <CrearRuteroModal
                isOpen={showCrearModal}
                onClose={() => setShowCrearModal(false)}
                onSubmit={handleCrearRutero}
            />

            {/* Editar Rutero Modal */}
            <EditarRuteroModal
                isOpen={showEditarModal}
                onClose={() => {
                    setShowEditarModal(false)
                    setRuteroEditar(null)
                }}
                rutero={ruteroEditar}
                onSuccess={() => {
                    loadRuteros()
                    setShowEditarModal(false)
                    setRuteroEditar(null)
                }}
            />

            {/* Detalle Rutero Modal */}
            <DetalleRuteroModal
                isOpen={showDetalleModal}
                onClose={() => {
                    setShowDetalleModal(false)
                    setRuteroDetalle(null)
                }}
                rutero={ruteroDetalle}
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
