import { Eye, CheckCircle } from 'lucide-react'
import type { Pedido } from '../../../../supervisor/services/pedidosApi'

interface PedidosTableProps {
    pedidos: Pedido[];
    onVerDetalle: (pedido: Pedido) => void;
    onValidar?: (pedido: Pedido) => void;
}

export function getEstadoBadgeColor(estado: string) {
    const normalizedEstado = estado?.toLowerCase().trim() || ''
    switch (normalizedEstado) {
        case 'pendiente':
        case 'pendiente_validacion':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case 'aprobado':
            return 'bg-green-100 text-green-800 border-green-200'
        case 'anulado':
        case 'cancelado':
            return 'bg-red-100 text-red-800 border-red-200'
        case 'en_preparacion':
            return 'bg-blue-100 text-blue-800 border-blue-200'
        case 'facturado':
            return 'bg-purple-100 text-purple-800 border-purple-200'
        case 'en_ruta':
            return 'bg-indigo-100 text-indigo-800 border-indigo-200'
        case 'entregado':
            return 'bg-emerald-100 text-emerald-800 border-emerald-200'
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200'
    }
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency: 'USD'
    }).format(amount)
}

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-EC', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

export function PedidosTable({ pedidos, onVerDetalle, onValidar }: PedidosTableProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                ID Pedido
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Cliente
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Total
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Fecha
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {pedidos.map((pedido) => (
                            <tr key={pedido.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-sm font-mono text-gray-900">
                                    {pedido.id.substring(0, 8)}...
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                    {pedido.cliente?.razon_social || 'Sin cliente'}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getEstadoBadgeColor(pedido.estado_actual || '')}`}>
                                        {pedido.estado_actual?.replace(/_/g, ' ') || 'DESCONOCIDO'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                    {formatCurrency(pedido.total_final)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                    {formatDate(pedido.created_at)}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2 justify-end whitespace-nowrap">
                                        {onValidar && (
                                            ['pendiente_validacion', 'pendiente'].includes(pedido.estado_actual?.toLowerCase() || '')
                                        ) && (
                                            <button
                                                onClick={() => onValidar(pedido)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-red text-white text-xs font-medium rounded-lg hover:bg-brand-red/90 transition-colors"
                                                title="Validar Pedido"
                                            >
                                                <CheckCircle className="w-3 h-3" />
                                                Validar
                                            </button>
                                        )}

                                        <button
                                            onClick={() => onVerDetalle(pedido)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                            title="Ver detalles"
                                        >
                                            <Eye className="w-3 h-3" />
                                            Ver
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
