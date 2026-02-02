import React, { useState, useEffect } from 'react'
import { Modal } from 'components/ui/Modal'
import { FormField } from 'components/ui/FormField'
import { Plus, X, GripVertical } from 'components/ui/Icons'
import type { CreateRuteroLogisticoPayload } from '../../services/types'
import { obtenerTransportistas, type Usuario } from '../../services/usuariosApi'
import { getVehicles, type Vehicle } from '../../services/vehiclesApi'
import { obtenerPedidos, type Pedido } from '../../services/pedidosApi'
import { obtenerZonas, type ZonaComercial } from '../../services/clientesApi'

interface CrearRuteroModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (payload: CreateRuteroLogisticoPayload) => Promise<void>
}

interface PedidoSeleccionado {
    pedido_id: string
    orden_entrega: number
    pedido?: Pedido
}

export function CrearRuteroModal({ isOpen, onClose, onSubmit }: CrearRuteroModalProps) {
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(false)

    // Form state
    const [transportistaId, setTransportistaId] = useState('')
    const [vehiculoId, setVehiculoId] = useState('')
    const [zonaId, setZonaId] = useState('')
    const [fechaProgramada, setFechaProgramada] = useState('')
    const [pedidosSeleccionados, setPedidosSeleccionados] = useState<PedidoSeleccionado[]>([])

    // Data lists
    const [transportistas, setTransportistas] = useState<Usuario[]>([])
    const [vehiculos, setVehiculos] = useState<Vehicle[]>([])
    const [zonas, setZonas] = useState<ZonaComercial[]>([])
    const [pedidosPendientes, setPedidosPendientes] = useState<Pedido[]>([])
    const [todosPedidos, setTodosPedidos] = useState<Pedido[]>([])

    // UI state
    const [showPedidoSelector, setShowPedidoSelector] = useState(false)
    const [searchPedido, setSearchPedido] = useState('')

    useEffect(() => {
        if (isOpen) {
            loadData()
        } else {
            resetForm()
        }
    }, [isOpen])

    const loadData = async () => {
        setLoadingData(true)
        try {
            const [transportistasData, vehiculosData, zonasData, pedidosData] = await Promise.all([
                obtenerTransportistas(),
                getVehicles('disponible'),
                obtenerZonas(),
                obtenerPedidos({ skipClients: false }),
            ])

            setTransportistas(transportistasData)
            setVehiculos(vehiculosData)
            setZonas(zonasData)

            // Filter pedidos that are in "validado" state (ready for delivery)
            const pedidosValidados = pedidosData.filter(
                p => p.estado === 'validado' || p.estado_actual === 'validado'
            )
            setTodosPedidos(pedidosValidados)
            setPedidosPendientes(pedidosValidados)
        } catch (error) {
        } finally {
            setLoadingData(false)
        }
    }

    const resetForm = () => {
        setTransportistaId('')
        setVehiculoId('')
        setZonaId('')
        setFechaProgramada('')
        setPedidosSeleccionados([])
        setShowPedidoSelector(false)
        setSearchPedido('')
    }

    // Enable zone filtering now that order data includes zone information
    useEffect(() => {
        if (!zonaId) {
            setPedidosPendientes(todosPedidos)
            return
        }

        // Filter valid orders that match the selected zone
        const filtered = todosPedidos.filter(p => String(p.zona_id) === String(zonaId))
        setPedidosPendientes(filtered)

    }, [zonaId, todosPedidos])

    // Clear selected orders if zone changes to avoid cross-zone routes
    useEffect(() => {
        if (pedidosSeleccionados.length > 0) {
            const hasCrossZone = pedidosSeleccionados.some(ps => ps.pedido && String(ps.pedido.zona_id) !== String(zonaId))
            if (hasCrossZone) {
                setPedidosSeleccionados([])
            }
        }
    }, [zonaId])

    const handleAgregarPedido = (pedido: Pedido) => {
        const yaSeleccionado = pedidosSeleccionados.some(p => p.pedido_id === pedido.id)
        if (yaSeleccionado) return

        const nuevoOrden = pedidosSeleccionados.length + 1
        setPedidosSeleccionados([
            ...pedidosSeleccionados,
            {
                pedido_id: pedido.id,
                orden_entrega: nuevoOrden,
                pedido,
            },
        ])
        setShowPedidoSelector(false)
        setSearchPedido('')
    }

    const handleEliminarPedido = (pedidoId: string) => {
        const nuevosSeleccionados = pedidosSeleccionados
            .filter(p => p.pedido_id !== pedidoId)
            .map((p, index) => ({ ...p, orden_entrega: index + 1 }))
        setPedidosSeleccionados(nuevosSeleccionados)
    }

    const handleMoverPedido = (index: number, direccion: 'arriba' | 'abajo') => {
        if (
            (direccion === 'arriba' && index === 0) ||
            (direccion === 'abajo' && index === pedidosSeleccionados.length - 1)
        ) {
            return
        }

        const nuevosSeleccionados = [...pedidosSeleccionados]
        const nuevoIndex = direccion === 'arriba' ? index - 1 : index + 1

            // Swap
            ;[nuevosSeleccionados[index], nuevosSeleccionados[nuevoIndex]] = [
                nuevosSeleccionados[nuevoIndex],
                nuevosSeleccionados[index],
            ]

        // Reorder
        const reordenados = nuevosSeleccionados.map((p, i) => ({
            ...p,
            orden_entrega: i + 1,
        }))

        setPedidosSeleccionados(reordenados)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!transportistaId || !vehiculoId || !zonaId || pedidosSeleccionados.length === 0) {
            alert('Debes seleccionar transportista, vehículo, zona y al menos un pedido')
            return
        }

        setLoading(true)
        try {
            const payload: CreateRuteroLogisticoPayload = {
                fecha_rutero: fechaProgramada || new Date().toISOString().split('T')[0],
                zona_id: zonaId,
                vehiculo_id: vehiculoId,
                transportista_id: transportistaId,
                paradas: pedidosSeleccionados.map(p => ({
                    pedido_id: p.pedido_id,
                    orden_entrega: p.orden_entrega,
                })),
            }

            await onSubmit(payload)
            onClose()
        } catch (error: any) {
            alert(error.message || 'Error al crear rutero')
        } finally {
            setLoading(false)
        }
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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Crear Rutero Logístico"
            headerGradient="red"
            maxWidth="2xl"
        >
            {loadingData ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
                    <p className="text-neutral-600">Cargando datos...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Transportista */}
                    <FormField
                        label="Transportista"
                        type="select"
                        value={transportistaId}
                        onChange={setTransportistaId}
                        options={[
                            { label: 'Seleccionar transportista...', value: '' },
                            ...transportistas.map(t => ({
                                label: `${t.nombre} ${t.nombreCompleto ? `(${t.nombreCompleto})` : ''}`,
                                value: t.id,
                            })),
                        ]}
                    />

                    {/* Vehículo */}
                    <FormField
                        label="Vehículo"
                        type="select"
                        value={vehiculoId}
                        onChange={setVehiculoId}
                        options={[
                            { label: 'Seleccionar vehículo...', value: '' },
                            ...vehiculos.map(v => ({
                                label: `${v.placa}${v.modelo ? ` - ${v.modelo}` : ''}${v.capacidad_kg ? ` (${v.capacidad_kg}kg)` : ''}`,
                                value: v.id,
                            })),
                        ]}
                    />

                    {/* Zona */}
                    <FormField
                        label="Zona Comercial"
                        type="select"
                        value={zonaId}
                        onChange={setZonaId}
                        options={[
                            { label: 'Todas las zonas', value: '' },
                            ...zonas.map(z => ({
                                label: z.nombre,
                                value: String(z.id),
                            })),
                        ]}
                    />

                    {/* Fecha Programada (opcional) */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Fecha Programada (Opcional)
                        </label>
                        <input
                            type="date"
                            value={fechaProgramada}
                            onChange={(e) => setFechaProgramada(e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                        />
                    </div>


                    {/* Pedidos Seleccionados */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Pedidos ({pedidosSeleccionados.length})
                        </label>

                        {pedidosSeleccionados.length === 0 ? (
                            <div className="text-center py-6 border-2 border-dashed border-neutral-300 rounded-lg">
                                <p className="text-neutral-500 text-sm">No hay pedidos seleccionados</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto border border-neutral-200 rounded-lg p-3">
                                {pedidosSeleccionados.map((ps, index) => (
                                    <div
                                        key={ps.pedido_id}
                                        className="flex items-center gap-3 bg-neutral-50 p-3 rounded-lg border border-neutral-200"
                                    >
                                        {/* Orden */}
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-red text-white flex items-center justify-center font-bold text-sm">
                                            {ps.orden_entrega}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-neutral-800 truncate">
                                                {ps.pedido?.cliente?.razon_social || 'Cliente'}
                                            </p>
                                            <p className="text-sm text-neutral-600">
                                                Pedido #{ps.pedido?.numero_pedido || ps.pedido_id.slice(0, 8)} - $
                                                {ps.pedido?.total_final.toFixed(2) || '0.00'}
                                            </p>
                                        </div>

                                        {/* Reorder buttons */}
                                        <div className="flex flex-col gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleMoverPedido(index, 'arriba')}
                                                disabled={index === 0}
                                                className="p-1 text-neutral-600 hover:text-brand-red disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                ▲
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleMoverPedido(index, 'abajo')}
                                                disabled={index === pedidosSeleccionados.length - 1}
                                                className="p-1 text-neutral-600 hover:text-brand-red disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                ▼
                                            </button>
                                        </div>

                                        {/* Delete */}
                                        <button
                                            type="button"
                                            onClick={() => handleEliminarPedido(ps.pedido_id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add Pedido Button */}
                        <button
                            type="button"
                            onClick={() => setShowPedidoSelector(!showPedidoSelector)}
                            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-brand-red text-brand-red rounded-lg hover:bg-red-50 transition-all duration-150"
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
                                            const yaSeleccionado = pedidosSeleccionados.some(
                                                p => p.pedido_id === pedido.id
                                            )
                                            return (
                                                <button
                                                    key={pedido.id}
                                                    type="button"
                                                    onClick={() => handleAgregarPedido(pedido)}
                                                    disabled={yaSeleccionado}
                                                    className={`w-full text-left p-3 rounded-lg border transition-all duration-150 ${yaSeleccionado
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

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-neutral-200">
                        <button
                            type="submit"
                            disabled={loading || !transportistaId || !vehiculoId || pedidosSeleccionados.length === 0}
                            className="flex-1 bg-brand-red text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-brand-red-dark transition-all duration-150 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creando...' : 'Crear Rutero'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-neutral-200 text-neutral-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-neutral-300 transition-all duration-150"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    )
}
