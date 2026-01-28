
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { EstadoPedido, Pedido, COLORES_MARCA } from '../../../types'
import { formatEstadoPedido, getEstadoPedidoColor } from 'utils/statusHelpers'

interface OrderDetailsModalProps {
    pedido: Pedido
    onClose: () => void
    onCancel: () => void
    fetchDetallePedido: (id: string) => Promise<Pedido>
}

export function OrderDetailsModal({
    pedido,
    onClose,
    onCancel,
    fetchDetallePedido,
}: OrderDetailsModalProps) {
    const [detalle, setDetalle] = useState<Pedido>(pedido)
    const [cargandoDetalle, setCargandoDetalle] = useState(false)
    const [detalleError, setDetalleError] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true
        setDetalle(pedido)
        if (pedido.items.length > 0) {
            setDetalleError(null)
            setCargandoDetalle(false)
            return () => {
                isMounted = false
            }
        }

        setCargandoDetalle(true)
        setDetalleError(null)
        const loadDetalle = async () => {
            try {
                const enriched = await fetchDetallePedido(pedido.id)
                if (!isMounted) return
                setDetalle(enriched)
            } catch (err) {
                if (!isMounted) return
                const message = err instanceof Error ? err.message : 'No se pudo cargar el detalle del pedido'
                setDetalleError(message)
            } finally {
                if (isMounted) setCargandoDetalle(false)
            }
        }
        loadDetalle()
        return () => {
            isMounted = false
        }
    }, [pedido, fetchDetallePedido])

    const puedeCancelar = detalle.status === EstadoPedido.PENDING || String(detalle.status).toUpperCase() === 'PENDIENTE'
    const estadoColor = getEstadoPedidoColor(detalle.status)
    const formattedDate = new Date(detalle.creado_en || detalle.createdAt || Date.now()).toLocaleDateString('es-ES')
    const totalLineas = detalle.items.reduce((acc: number, item: any) => acc + (item.cantidad || item.quantity || 0), 0)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-neutral-200 px-8 py-6">
                    <div>
                        <p className="text-sm font-semibold text-neutral-500">Detalles del Pedido</p>
                        <h2 className="text-2xl font-bold text-neutral-900">#{detalle.numero_pedido || detalle.orderNumber}</h2>
                    </div>
                    <span
                        className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                        style={{ backgroundColor: estadoColor }}
                    >
                        {formatEstadoPedido(detalle.status)}
                    </span>
                    <button onClick={onClose} className="text-neutral-400 transition-colors hover:text-neutral-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="space-y-8 px-8 py-6 overflow-y-auto">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                            <p className="text-xs uppercase tracking-wide text-neutral-500">Fecha</p>
                            <p className="text-lg font-semibold text-neutral-900">{formattedDate}</p>
                        </div>
                        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                            <p className="text-xs uppercase tracking-wide text-neutral-500">Total líneas</p>
                            <p className="text-lg font-semibold text-neutral-900">{totalLineas} unidades</p>
                        </div>
                        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                            <p className="text-xs uppercase tracking-wide text-neutral-500">Monto total</p>
                            <p className="text-xl font-bold" style={{ color: COLORES_MARCA.red }}>${Number(detalle.total || detalle.totalAmount || 0).toFixed(2)}</p>
                        </div>
                    </div>

                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-neutral-900">Productos</h3>
                            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">{detalle.items.length} líneas</span>
                        </div>
                        <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200">
                            {cargandoDetalle ? (
                                <div className="px-4 py-6 text-center text-sm text-neutral-500">Cargando productos...</div>
                            ) : detalleError ? (
                                <div className="px-4 py-6 text-center text-sm text-red-600">{detalleError}</div>
                            ) : detalle.items.length === 0 ? (
                                <div className="px-4 py-6 text-center text-sm text-neutral-500">Este pedido no tiene productos registrados.</div>
                            ) : (
                                detalle.items.map(item => {
                                    const wasAdjusted = item.cantidad_solicitada != null && item.cantidad_solicitada !== item.quantity
                                    const requestedQty = item.cantidad_solicitada ?? item.quantity
                                    const hasDiscount = !!item.descuento_item_valor
                                    const isNegotiated = item.origen_precio === 'negociado'

                                    return (
                                        <div key={item.id} className="grid gap-4 px-4 py-3 md:grid-cols-3">
                                            <div className="md:col-span-2">
                                                <p className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                                                    {item.productName}
                                                    {isNegotiated && (
                                                        <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                                            NEGOCIADO
                                                        </span>
                                                    )}
                                                </p>
                                                <div className="flex flex-col gap-1 mt-1">
                                                    {wasAdjusted ? (
                                                        <>
                                                            <p className="text-xs text-neutral-500 line-through">
                                                                Solicitado: {requestedQty} {item.unit}
                                                            </p>
                                                            <p className="text-xs font-bold text-orange-600">
                                                                Enviado: {item.quantity} {item.unit} × {hasDiscount ? (
                                                                    <span className="text-green-600">
                                                                        ${Number(item.precio_unitario_final || item.unitPrice || 0).toFixed(2)}
                                                                        <span className="ml-1 text-[10px] bg-green-50 px-1 py-0.5 rounded italic">(-{item.descuento_item_valor}{item.descuento_item_tipo === 'porcentaje' ? '%' : '$'})</span>
                                                                    </span>
                                                                ) : (
                                                                    `$${Number(item.precio_unitario_final || item.unitPrice || 0).toFixed(2)}`
                                                                )}
                                                            </p>
                                                            {item.motivo_ajuste && (
                                                                <p className="text-xs text-red-500 italic">
                                                                    * Ajuste: {item.motivo_ajuste}
                                                                </p>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <p className="text-xs text-neutral-500">
                                                            {item.quantity} {item.unit} × {hasDiscount ? (
                                                                <span className="text-green-600 font-semibold">
                                                                    ${Number(item.precio_unitario_final || item.unitPrice || 0).toFixed(2)}
                                                                    <span className="ml-1 text-[10px] bg-green-50 px-1 py-0.5 rounded italic font-normal text-green-700">(-{item.descuento_item_valor}{item.descuento_item_tipo === 'porcentaje' ? '%' : '$'})</span>
                                                                </span>
                                                            ) : (
                                                                `$${Number(item.precio_unitario_final || item.unitPrice || 0).toFixed(2)}`
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-neutral-900">${Number(item.subtotal || 0).toFixed(2)}</p>
                                                {wasAdjusted && (
                                                    <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full">
                                                        MODIFICADO
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        {/* Summary of discounts */}
                        {detalle.descuento_pedido_valor && (
                            <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-green-800">Descuento Global Aplicado</span>
                                    <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                        {detalle.descuento_pedido_tipo === 'porcentaje' ? `${detalle.descuento_pedido_valor}%` : `$${detalle.descuento_pedido_valor}`}
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-green-800">
                                    Total Descontado: -${Number(detalle.descuento_pedido_tipo === 'porcentaje'
                                        ? (detalle.items.reduce((sum: number, i: any) => sum + Number(i.subtotal || 0), 0) * (Number(detalle.descuento_pedido_valor) / 100))
                                        : detalle.descuento_pedido_valor
                                    ).toFixed(2)}
                                    {/* Note: The totalAmount in Pedido usually already reflects the discount. 
                                        If we want to show the 'raw' vs 'discounted', we'd need more logic, 
                                        but showing the global value is what's requested. 
                                    */}
                                </p>
                            </div>
                        )}
                    </div>

                </div>

                <div className="flex flex-col gap-3 border-t border-neutral-200 px-8 py-6 md:flex-row">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-neutral-300 px-4 py-3 text-center text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-50"
                    >
                        Cerrar
                    </button>
                    {puedeCancelar && (
                        <button
                            onClick={onCancel}
                            className="flex-1 rounded-xl px-4 py-3 text-center text-sm font-semibold text-white transition-colors"
                            style={{ backgroundColor: COLORES_MARCA.red }}
                        >
                            Cancelar Pedido
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
