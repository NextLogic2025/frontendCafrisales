import { Modal } from '../../../../../components/ui/Modal'
import { getEstadoBadgeColor, formatCurrency } from './PedidosTable'
import type { Pedido, DetallePedido } from '../../../../supervisor/services/pedidosApi'

interface PedidoDetailModalProps {
    pedido: Pedido | null;
    onClose: () => void;
    onValidar?: (pedido: Pedido) => void;
}

export function PedidoDetailModal({ pedido, onClose, onValidar }: PedidoDetailModalProps) {
    const isPendiente = pedido?.estado_actual === 'pendiente_validacion'

    return (
        <Modal
            isOpen={!!pedido}
            title={`Detalles del Pedido #${pedido?.codigo_visual || ''}`}
            onClose={onClose}
            headerGradient="red"
            maxWidth="2xl"
        >
            {pedido && (
                <div className="space-y-6">
                    {/* Información del Pedido */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="text-xs text-gray-600">Cliente</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {pedido.cliente?.razon_social || 'Sin cliente'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Estado</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getEstadoBadgeColor(pedido.estado_actual || '')}`}>
                                {pedido.estado_actual}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Condición de Pago</p>
                            <p className="text-sm font-semibold text-gray-900">{pedido.condicion_pago}</p>
                        </div>
                    </div>

                    {/* Productos */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Productos del Pedido</h3>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">SKU</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Producto</th>
                                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">Cantidad</th>
                                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">Precio Lista</th>
                                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">Precio Final</th>
                                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {pedido.detalles?.map((detalle: DetallePedido) => (
                                        <tr key={detalle.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 text-xs font-mono text-gray-600">{detalle.codigo_sku}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900">
                                                <div className="flex items-center gap-2">
                                                    {detalle.nombre_producto}
                                                    {detalle.origen_precio === 'negociado' && (
                                                        <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                                            NEGOCIADO
                                                        </span>
                                                    )}
                                                </div>
                                                {detalle.motivo_descuento && (
                                                    <p className="text-xs text-green-600">🎁 {detalle.motivo_descuento}</p>
                                                )}
                                                {detalle.cantidad_solicitada != null && detalle.cantidad_solicitada !== detalle.cantidad && (
                                                    <div className="mt-1 flex flex-col gap-0.5">
                                                        <p className="text-xs text-gray-500 line-through">
                                                            Solicitado: {Number(detalle.cantidad_solicitada).toFixed(2)} {detalle.unidad_medida}
                                                        </p>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[10px] bg-orange-100 text-orange-700 px-1 py-0.5 rounded font-bold">AJUSTADO</span>
                                                            {detalle.motivo_ajuste && <span className="text-xs text-red-500 italic">({detalle.motivo_ajuste})</span>}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-right text-gray-900">
                                                {Number(detalle.cantidad).toFixed(2)} {detalle.unidad_medida}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-right text-gray-900">
                                                {detalle.descuento_item_valor ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-xs text-gray-400 line-through">{formatCurrency(detalle.precio_lista || 0)}</span>
                                                        <span className="text-[10px] text-green-600 font-medium">
                                                            -{detalle.descuento_item_valor}{detalle.descuento_item_tipo === 'porcentaje' ? '%' : '$'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    formatCurrency(detalle.precio_lista || 0)
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-right font-semibold text-gray-900">{formatCurrency(detalle.precio_final)}</td>
                                            <td className="px-4 py-2 text-sm text-right font-semibold text-gray-900">{formatCurrency(detalle.subtotal_linea)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totales */}
                    <div className="border-t border-gray-200 pt-4">
                        <div className="flex flex-col gap-2 max-w-xs ml-auto">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-semibold">{formatCurrency(pedido.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Descuentos Aplicados:</span>
                                <span className="font-semibold text-green-600">
                                    {pedido.descuento_pedido_valor ? (
                                        <span className="text-[10px] bg-green-50 px-1 py-0.5 rounded border border-green-200 mr-2">
                                            Global: {pedido.descuento_pedido_tipo === 'porcentaje' ? `${pedido.descuento_pedido_valor}%` : `$${pedido.descuento_pedido_valor}`}
                                        </span>
                                    ) : null}
                                    -{formatCurrency(pedido.descuento_total || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Impuestos:</span>
                                <span className="font-semibold">{formatCurrency(pedido.impuestos_total || 0)}</span>
                            </div>
                            <div className="flex justify-between text-lg border-t border-gray-200 pt-2">
                                <span className="font-bold text-gray-900">Total Final:</span>
                                <span className="font-bold text-brand-red">{formatCurrency(pedido.total_final)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                        <button
                            onClick={onClose}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cerrar
                        </button>
                        {isPendiente && onValidar && (
                            <button
                                onClick={() => onValidar(pedido)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-red text-white text-sm font-medium rounded-lg hover:bg-brand-red/90 transition-colors"
                            >
                                Validar Pedido
                            </button>
                        )}
                    </div>
                </div>
            )}
        </Modal>
    )
}
