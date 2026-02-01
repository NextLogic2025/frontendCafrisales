import React, { useState, useEffect } from 'react'
import { Modal } from 'components/ui/Modal'
import { FormField } from 'components/ui/FormField'
import { Alert } from 'components/ui/Alert'
import { Plus, X } from 'lucide-react'
import type { CreateRutaVendedorPayload } from '../../services/rutasVendedorTypes'
import { obtenerTransportistas, type Usuario } from '../../services/usuariosApi'
import { obtenerVendedores, type Vendedor } from '../../services/usuariosApi'
import { obtenerClientes, type Cliente, obtenerZonas, type ZonaComercial } from '../../services/clientesApi'

interface CrearRutaModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (payload: CreateRutaVendedorPayload) => Promise<void>
}

interface ClienteSeleccionado {
    cliente_id: string
    orden_visita: number
    cliente?: Cliente
}

export function CrearRutaModal({ isOpen, onClose, onSubmit }: CrearRutaModalProps) {
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(false)

    // Form state
    const [vendedorId, setVendedorId] = useState('')
    const [zonaId, setZonaId] = useState('')
    const [fechaProgramada, setFechaProgramada] = useState('')
    const [clientesSeleccionados, setClientesSeleccionados] = useState<ClienteSeleccionado[]>([])

    // Data lists
    const [vendedores, setVendedores] = useState<Vendedor[]>([])
    const [zonas, setZonas] = useState<ZonaComercial[]>([])
    const [clientesDisponibles, setClientesDisponibles] = useState<Cliente[]>([])
    const [todosClientes, setTodosClientes] = useState<Cliente[]>([])

    // UI state
    const [showClienteSelector, setShowClienteSelector] = useState(false)
    const [searchCliente, setSearchCliente] = useState('')
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

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
            const [vendedoresData, zonasData, clientesData] = await Promise.all([
                obtenerVendedores(),
                obtenerZonas(),
                obtenerClientes(),
            ])

            setVendedores(vendedoresData)
            setZonas(zonasData)
            setTodosClientes(clientesData)
            setClientesDisponibles(clientesData)
        } catch (error) {
        } finally {
            setLoadingData(false)
        }
    }

    const resetForm = () => {
        setVendedorId('')
        setZonaId('')
        setFechaProgramada('')
        setClientesSeleccionados([])
        setShowClienteSelector(false)
        setSearchCliente('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitError(null)
        setLoading(true)
        try {
            const payload: CreateRutaVendedorPayload = {
                vendedor_id: vendedorId,
                zona_id: zonaId,
                fecha_rutero: fechaProgramada,
                paradas: clientesSeleccionados.map(c => ({
                    cliente_id: c.cliente_id,
                    orden_visita: c.orden_visita,
                })),
            }

            await onSubmit(payload)
            onClose()
        } catch (error: any) {
            setSubmitError(error.message || 'Error al crear ruta')
        } finally {
            setLoading(false)
        }
    }

    const handleAgregarCliente = (cliente: Cliente) => {
        const yaSeleccionado = clientesSeleccionados.some(c => c.cliente_id === cliente.id)
        if (yaSeleccionado) return

        const nuevoOrden = clientesSeleccionados.length + 1
        setClientesSeleccionados([
            ...clientesSeleccionados,
            {
                cliente_id: cliente.id,
                orden_visita: nuevoOrden,
                cliente,
            },
        ])
        setShowClienteSelector(false)
        setSearchCliente('')
    }

    // Filter clientes by zone
    useEffect(() => {
        if (!zonaId) {
            setClientesDisponibles(todosClientes)
        } else {
            const filtered = todosClientes.filter(c => {
                const zonaCliente = c.zona_comercial_id || (c as any).zona_id || (c.zona_comercial as any)?.id
                return String(zonaCliente) === String(zonaId)
            })
            setClientesDisponibles(filtered)
        }
    }, [zonaId, todosClientes])

    const handleEliminarCliente = (clienteId: string) => {
        const nuevosSeleccionados = clientesSeleccionados
            .filter(c => c.cliente_id !== clienteId)
            .map((c, index) => ({ ...c, orden_visita: index + 1 }))
        setClientesSeleccionados(nuevosSeleccionados)
    }

    const handleMoverCliente = (index: number, direccion: 'arriba' | 'abajo') => {
        if (
            (direccion === 'arriba' && index === 0) ||
            (direccion === 'abajo' && index === clientesSeleccionados.length - 1)
        ) {
            return
        }

        const nuevosSeleccionados = [...clientesSeleccionados]
        const nuevoIndex = direccion === 'arriba' ? index - 1 : index + 1

            // Swap
            ;[nuevosSeleccionados[index], nuevosSeleccionados[nuevoIndex]] = [
                nuevosSeleccionados[nuevoIndex],
                nuevosSeleccionados[index],
            ]

        // Reorder
        const reordenados = nuevosSeleccionados.map((c, i) => ({
            ...c,
            orden_visita: i + 1,
        }))

        setClientesSeleccionados(reordenados)
    }


    const clientesFiltrados = clientesDisponibles.filter(c => {
        if (!searchCliente) return true
        const search = searchCliente.toLowerCase()
        return (
            c.razon_social?.toLowerCase().includes(search) ||
            c.identificacion?.toLowerCase().includes(search) ||
            c.id.toLowerCase().includes(search)
        )
    })

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Crear Ruta de Vendedor"
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
                    {submitError && <Alert type="error" message={submitError} />}

                    {/* Vendedor */}
                    <FormField
                        label="Vendedor"
                        type="select"
                        value={vendedorId}
                        onChange={setVendedorId}
                        options={[
                            { label: 'Seleccionar vendedor...', value: '' },
                            ...vendedores.map(v => ({
                                label: v.nombre,
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
                            { label: 'Seleccionar zona...', value: '' },
                            ...zonas.map(z => ({
                                label: z.nombre,
                                value: String(z.id),
                            })),
                        ]}
                    />

                    {/* Fecha Programada */}
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

                    {/* Clientes Seleccionados */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Clientes ({clientesSeleccionados.length})
                        </label>

                        {clientesSeleccionados.length === 0 ? (
                            <div className="text-center py-6 border-2 border-dashed border-neutral-300 rounded-lg">
                                <p className="text-neutral-500 text-sm">No hay clientes seleccionados</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto border border-neutral-200 rounded-lg p-3">
                                {clientesSeleccionados.map((cs, index) => (
                                    <div
                                        key={cs.cliente_id}
                                        className="flex items-center gap-3 bg-neutral-50 p-3 rounded-lg border border-neutral-200"
                                    >
                                        {/* Orden */}
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-red text-white flex items-center justify-center font-bold text-sm">
                                            {cs.orden_visita}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-neutral-800 truncate">
                                                {cs.cliente?.razon_social || 'Cliente'}
                                            </p>
                                            <p className="text-sm text-neutral-600">
                                                RUC: {cs.cliente?.identificacion || 'N/A'}
                                            </p>
                                        </div>

                                        {/* Reorder buttons */}
                                        <div className="flex flex-col gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleMoverCliente(index, 'arriba')}
                                                disabled={index === 0}
                                                className="p-1 text-neutral-600 hover:text-brand-red disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                ▲
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleMoverCliente(index, 'abajo')}
                                                disabled={index === clientesSeleccionados.length - 1}
                                                className="p-1 text-neutral-600 hover:text-brand-red disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                ▼
                                            </button>
                                        </div>

                                        {/* Delete */}
                                        <button
                                            type="button"
                                            onClick={() => handleEliminarCliente(cs.cliente_id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add Cliente Button */}
                        <button
                            type="button"
                            onClick={() => setShowClienteSelector(!showClienteSelector)}
                            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-brand-red text-brand-red rounded-lg hover:bg-red-50 transition-all duration-150"
                        >
                            <Plus className="h-4 w-4" />
                            Agregar Cliente
                        </button>

                        {/* Cliente Selector */}
                        {showClienteSelector && (
                            <div className="mt-3 border border-neutral-300 rounded-lg p-4 bg-neutral-50">
                                <input
                                    type="text"
                                    placeholder="Buscar por razón social o RUC..."
                                    value={searchCliente}
                                    onChange={(e) => setSearchCliente(e.target.value)}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-brand-red"
                                />

                                <div className="max-h-48 overflow-y-auto space-y-2">
                                    {clientesFiltrados.length === 0 ? (
                                        <p className="text-center text-neutral-500 text-sm py-4">
                                            No hay clientes disponibles
                                        </p>
                                    ) : (
                                        clientesFiltrados.map(cliente => {
                                            const yaSeleccionado = clientesSeleccionados.some(
                                                c => c.cliente_id === cliente.id
                                            )
                                            return (
                                                <button
                                                    key={cliente.id}
                                                    type="button"
                                                    onClick={() => handleAgregarCliente(cliente)}
                                                    disabled={yaSeleccionado}
                                                    className={`w-full text-left p-3 rounded-lg border transition-all duration-150 ${yaSeleccionado
                                                        ? 'bg-neutral-100 border-neutral-300 opacity-50 cursor-not-allowed'
                                                        : 'bg-white border-neutral-200 hover:border-brand-red hover:bg-red-50'
                                                        }`}
                                                >
                                                    <p className="font-medium text-neutral-800">
                                                        {cliente.razon_social}
                                                    </p>
                                                    <p className="text-sm text-neutral-600">
                                                        RUC: {cliente.identificacion || 'N/A'}
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
                            disabled={loading || !vendedorId || clientesSeleccionados.length === 0}
                            className="flex-1 bg-brand-red text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-brand-red-dark transition-all duration-150 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creando...' : 'Crear Ruta'}
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
