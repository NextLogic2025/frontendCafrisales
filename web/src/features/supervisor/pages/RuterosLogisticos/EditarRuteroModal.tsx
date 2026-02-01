import React, { useState, useEffect } from 'react'
import { Modal } from 'components/ui/Modal'
import { FormField } from 'components/ui/FormField'
import { Plus, X } from 'lucide-react'
import type { RuteroLogistico, UpdateVehiclePayload, AddOrderToRuteroPayload } from '../../services/types'
import { getVehicles, type Vehicle } from '../../services/vehiclesApi'
import { obtenerPedidos, type Pedido } from '../../services/pedidosApi'
import { addOrderToRutero, removeOrderFromRutero, updateVehicleRutero } from '../../services/logisticsApi'

interface EditarRuteroModalProps {
    isOpen: boolean
    onClose: () => void
    rutero: RuteroLogistico | null
    onSuccess: () => void
}

export function EditarRuteroModal({ isOpen, onClose, rutero, onSuccess }: EditarRuteroModalProps) {
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(false)

    // Form state
    const [vehiculoId, setVehiculoId] = useState('')

    // Data lists
    const [vehiculos, setVehiculos] = useState<Vehicle[]>([])
    const [pedidosPendientes, setPedidosPendientes] = useState<Pedido[]>([])

    // UI state
    const [showPedidoSelector, setShowPedidoSelector] = useState(false)
    const [searchPedido, setSearchPedido] = useState('')
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    useEffect(() => {
        if (isOpen && rutero) {
            setVehiculoId(rutero.vehiculo_id)
            loadData()
        }
    }, [isOpen, rutero])

    const loadData = async () => {
        setLoadingData(true)
        try {
            const [vehiculosData, pedidosData] = await Promise.all([
                getVehicles('disponible'),
                obtenerPedidos({ skipClients: false }),
            ])

            setVehiculos(vehiculosData)

            // Filter pedidos that are in "preparado" state
            const pedidosPreparados = pedidosData.filter(
                p => p.estado === 'preparado' || p.estado_actual === 'preparado'
            )
            setPedidosPendientes(pedidosPreparados)
        } catch (error) {
        } finally {
            setLoadingData(false)
        }
    }

    const handleCambiarVehiculo = async () => {
        if (!rutero || !vehiculoId || vehiculoId === rutero.vehiculo_id) return

        setLoading(true)
        try {
            await updateVehicleRutero(rutero.id, { vehiculo_id: vehiculoId })
            showToast('success', 'Vehículo actualizado exitosamente')
            onSuccess()
        } catch (error: any) {
            showToast('error', error.message || 'Error al cambiar vehículo')
        } finally {
            setLoading(false)
        }
    }

    const handleAgregarPedido = async (pedido: Pedido) => {
        if (!rutero) return

        setLoading(true)
        try {
            const nuevoOrden = (rutero.paradas?.length || 0) + 1
            await addOrderToRutero(rutero.id, {
                pedido_id: pedido.id,
                orden_entrega: nuevoOrden,
            })
            showToast('success', 'Pedido agregado exitosamente')
            setShowPedidoSelector(false)
            setSearchPedido('')
            onSuccess()
        } catch (error: any) {
            showToast('error', error.message || 'Error al agregar pedido')
        } finally {
            setLoading(false)
        }
    }

    const handleEliminarPedido = async (pedidoId: string) => {
        if (!rutero) return
        if (!confirm('¿Estás seguro de eliminar este pedido del rutero?')) return

        setLoading(true)
        try {
            await removeOrderFromRutero(rutero.id, pedidoId)
            showToast('success', 'Pedido eliminado exitosamente')
            onSuccess()
        } catch (error: any) {
            showToast('error', error.message || 'Error al eliminar pedido')
        } finally {
            setLoading(false)
        }
    }

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message })
        setTimeout(() => setToast(null), 3000)
    }

    const pedidosFiltrados = pedidosPendientes.filter(p => {
        if (!searchPedido) return true
        const search = searchPedido.toLowerCase()
        return (
            p.numero_pedido?.toLowerCase().includes(search) ||
            p.cliente?.razon_social?.toLowerCase().includes(search) ||
            p.id.toLowerCase().includes(search)
        )
    })

    if (!rutero) return null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Editar Rutero #${rutero.id.slice(0, 8)}`}
            headerGradient="red"
            maxWidth="2xl"
        >
            {loadingData ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
                    <p className="text-neutral-600">Cargando datos...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Cambiar Vehículo */}
                    <div>
                        <FormField
                            label="Vehículo"
                            type="select"
                            value={vehiculoId}
                            onChange={setVehiculoId}
                            options={[
                                { label: 'Seleccionar vehículo...', value: '' },
                                // Include current vehicle even if not disponible
                                ...(rutero.vehiculo ? [{
                                    label: `${rutero.vehiculo.placa}${rutero.vehiculo.modelo ? ` - ${rutero.vehiculo.modelo}` : ''} (Actual)`,
                                    value: rutero.vehiculo.id,
                                }] : []),
                                ...vehiculos.map(v => ({
                                    label: `${v.placa}${v.modelo ? ` - ${v.modelo}` : ''}${v.capacidad_kg ? ` (${v.capacidad_kg}kg)` : ''}`,
                                    value: v.id,
                                })),
                            ]}
                        />
                        {vehiculoId !== rutero.vehiculo_id && (
                            <button
                                onClick={handleCambiarVehiculo}
                                disabled={loading}
                                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-150 disabled:opacity-50"
                            >
                                {loading ? 'Guardando...' : 'Cambiar Vehículo'}
                            </button>
                        )}
                    </div>

                    {/* Paradas Actuales */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Paradas ({rutero.paradas?.length || 0})
                        </label>

                        {!rutero.paradas || rutero.paradas.length === 0 ? (
                            <div className="text-center py-6 border-2 border-dashed border-neutral-300 rounded-lg">
                                <p className="text-neutral-500 text-sm">No hay paradas en este rutero</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto border border-neutral-200 rounded-lg p-3">
                                {rutero.paradas.map((parada) => (
                                    <div
                                        key={parada.id}
                                        className="flex items-center gap-3 bg-neutral-50 p-3 rounded-lg border border-neutral-200"
                                    >
                                        {/* Orden */}
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-red text-white flex items-center justify-center font-bold text-sm">
                                            {parada.orden_entrega}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-neutral-800 truncate">
                                                {parada.pedido?.cliente_nombre || 'Cliente'}
                                            </p>
                                            <p className="text-sm text-neutral-600">
                                                Pedido #{parada.pedido?.numero_pedido || parada.pedido_id.slice(0, 8)}
                                            </p>
                                        </div>

                                        {/* Delete */}
                                        <button
                                            onClick={() => handleEliminarPedido(parada.pedido_id)}
                                            disabled={loading}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150 disabled:opacity-50"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add Pedido Button */}
                        <button
                            onClick={() => setShowPedidoSelector(!showPedidoSelector)}
                            disabled={loading}
                            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-brand-red text-brand-red rounded-lg hover:bg-red-50 transition-all duration-150 disabled:opacity-50"
                        >
                            <Plus className="h-4 w-4" />
                            Agregar Pedido
                        </button>

                        {/* Pedido Selector */}
                        {showPedidoSelector && (
                            <div className="mt-3 border border-neutral-300 rounded-lg p-4 bg-neutral-50">
                                <input
                                    type="text"
                                    placeholder="Buscar por número de pedido o cliente..."
                                    value={searchPedido}
                                    onChange={(e) => setSearchPedido(e.target.value)}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-brand-red"
                                />

                                <div className="max-h-48 overflow-y-auto space-y-2">
                                    {pedidosFiltrados.length === 0 ? (
                                        <p className="text-center text-neutral-500 text-sm py-4">
                                            No hay pedidos preparados disponibles
                                        </p>
                                    ) : (
                                        pedidosFiltrados.map(pedido => {
                                            const yaEnRutero = rutero.paradas?.some(p => p.pedido_id === pedido.id)
                                            return (
                                                <button
                                                    key={pedido.id}
                                                    onClick={() => handleAgregarPedido(pedido)}
                                                    disabled={yaEnRutero || loading}
                                                    className={`w-full text-left p-3 rounded-lg border transition-all duration-150 ${yaEnRutero
                                                        ? 'bg-neutral-100 border-neutral-300 opacity-50 cursor-not-allowed'
                                                        : 'bg-white border-neutral-200 hover:border-brand-red hover:bg-red-50'
                                                        }`}
                                                >
                                                    <p className="font-medium text-neutral-800">
                                                        {pedido.cliente?.razon_social || 'Cliente'}
                                                    </p>
                                                    <p className="text-sm text-neutral-600">
                                                        Pedido #{pedido.numero_pedido || pedido.id.slice(0, 8)} - $
                                                        {pedido.total_final.toFixed(2)}
                                                    </p>
                                                </button>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Close Button */}
                    <div className="flex justify-end pt-4 border-t border-neutral-200">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-neutral-200 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-300 transition-all duration-150"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div
                    className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-50 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}
                    style={{ animation: 'slideInRight 0.3s ease-out' }}
                >
                    <span className="font-semibold">{toast.message}</span>
                </div>
            )}
        </Modal>
    )
}
