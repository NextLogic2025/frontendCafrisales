
import { Eye, X } from 'lucide-react'
import { EstadoPedido, Pedido } from '../../../types'
import { formatEstadoPedido, getEstadoPedidoColor } from 'utils/statusHelpers'

interface OrdersTableProps {
    pedidos: Pedido[]
    onViewDetail: (pedido: Pedido) => void
    onCancelOrder: (id: string) => void
    onRespondAdjustment?: (pedido: Pedido, action: 'acepta' | 'rechaza') => void
}

export function OrdersTable({ pedidos, onViewDetail, onCancelOrder, onRespondAdjustment }: OrdersTableProps) {
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Número</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {pedidos.map(pedido => (
                        <tr key={pedido.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{pedido.numero_pedido || pedido.orderNumber || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                                {new Date(pedido.creado_en || pedido.createdAt || Date.now()).toLocaleDateString('es-ES')}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                ${Number(pedido.total || pedido.totalAmount || 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                                <span
                                    className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
                                    style={{ backgroundColor: getEstadoPedidoColor((pedido.estado || pedido.status) as EstadoPedido) }}
                                >
                                    {formatEstadoPedido((pedido.estado || pedido.status) as EstadoPedido)}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                                {(() => {
                                    const rawStatus = String(pedido.estado || pedido.status || '').toLowerCase()
                                    const isAjustado = rawStatus === 'ajustado_bodega' || rawStatus === 'ajustado'

                                    if (isAjustado && onRespondAdjustment) {
                                        return (
                                            <>
                                                <button
                                                    onClick={() => onRespondAdjustment(pedido, 'acepta')}
                                                    className="px-2 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                                                    title="Aceptar ajuste"
                                                >
                                                    Aceptar
                                                </button>
                                                <button
                                                    onClick={() => onRespondAdjustment(pedido, 'rechaza')}
                                                    className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                                                    title="Cancelar pedido"
                                                >
                                                    Cancelar
                                                </button>
                                            </>
                                        )
                                    }

                                    // Allow cancellation for 'pending', 'pendiente', and 'pendiente_validacion'
                                    const canCancel = ['pending', 'pendiente', 'pendiente_validacion', 'pending_validation'].includes(rawStatus)

                                    return canCancel && (
                                        <button
                                            onClick={() => onCancelOrder(pedido.id)}
                                            className="text-red-600 transition-colors hover:text-red-700"
                                            title="Cancelar pedido"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    )
                                })()}
                                <button
                                    onClick={() => onViewDetail(pedido)}
                                    className="text-blue-600 transition-colors hover:text-blue-700"
                                    title="Ver detalles"
                                >
                                    <Eye className="h-5 w-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
