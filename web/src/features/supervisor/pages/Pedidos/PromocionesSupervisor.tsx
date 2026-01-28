import { useState, useEffect } from 'react'
import { ListChecks, Check, CheckCircle2, AlertCircle, Eye } from 'lucide-react'
import { PageHero } from 'components/ui/PageHero'
import { SectionHeader } from 'components/ui/SectionHeader'
import { LoadingSpinner } from 'components/ui/LoadingSpinner'
import { Alert } from 'components/ui/Alert'
import { Modal } from 'components/ui/Modal'
import { getPendingPromotions, approvePromotions, type OrderResponse } from '../../../vendedor/services/pedidosApi'

export default function PromocionesSupervisor() {
    const [pedidos, setPedidos] = useState<OrderResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState<OrderResponse | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        cargarPromociones()
    }, [])

    const cargarPromociones = async () => {
        try {
            setIsLoading(true)
            const data = await getPendingPromotions()
            setPedidos(data)
        } catch (err: any) {
            console.error(err)
            setError(err?.message || 'Error al cargar promociones pendientes')
        } finally {
            setIsLoading(false)
        }
    }

    const handleApproveAll = async (orderId: string) => {
        try {
            setIsSubmitting(true)
            await approvePromotions(orderId, { approve_all: true })
            setToast({ type: 'success', message: 'Promociones aprobadas exitosamente' })
            setPedidoSeleccionado(null)
            cargarPromociones()
            setTimeout(() => setToast(null), 3000)
        } catch (err: any) {
            setToast({ type: 'error', message: err?.message || 'Error al aprobar promociones' })
            setTimeout(() => setToast(null), 3000)
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatCurrency = (amount: number = 0) => {
        return new Intl.NumberFormat('es-EC', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return '---'
        return new Date(dateString).toLocaleDateString('es-EC', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <div className="space-y-6">
            <PageHero
                title="Aprobación de Promociones"
                subtitle="Valida y aprueba descuentos y negociaciones especiales"
                chips={['Supervisor', 'Comercial', 'Validación']}
            />

            <SectionHeader
                title="Promociones Pendientes"
                subtitle="Pedidos que contienen ítems marcados para aprobación de descuentos"
            />

            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner />
                </div>
            ) : pedidos.length === 0 ? (
                <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-600 mb-4">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900">Todo al día</h3>
                    <p className="text-neutral-500 max-w-sm mx-auto mt-2">
                        No hay promociones o negociaciones pendientes de aprobación en este momento.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {pedidos.map((pedido) => (
                        <div key={pedido.id} className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm hover:border-brand-red/30 transition-all">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-neutral-50 flex items-center justify-center text-brand-red border border-neutral-100 shrink-0">
                                        <ListChecks className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-neutral-900">{pedido.numero_pedido || `Pedido #${pedido.id.substring(0, 8)}`}</span>
                                            <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase border border-yellow-200">
                                                Pendiente Validación
                                            </span>
                                        </div>
                                        <p className="text-sm text-neutral-700 font-medium mt-0.5">{pedido.cliente_nombre || 'Cliente sin nombre'}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                                            <span>Vendedor: {pedido.vendedor_nombre || '---'}</span>
                                            <span>•</span>
                                            <span>Fecha: {formatDate(pedido.created_at || pedido.creado_en)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-neutral-50 rounded-xl px-4 py-2 border border-neutral-100">
                                    <div className="text-right">
                                        <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Total Pedido</p>
                                        <p className="text-lg font-black text-neutral-900">{formatCurrency(pedido.total)}</p>
                                    </div>
                                    <div className="h-8 w-px bg-neutral-200 mx-2"></div>
                                    <button
                                        onClick={() => setPedidoSeleccionado(pedido)}
                                        className="flex items-center gap-2 bg-white border border-neutral-200 text-neutral-700 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-neutral-50 transition-colors shadow-sm"
                                    >
                                        <Eye className="w-4 h-4 text-brand-red" />
                                        Revisar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Revisión */}
            <Modal
                isOpen={!!pedidoSeleccionado}
                onClose={() => setPedidoSeleccionado(null)}
                title={`Revisión de Promociones: ${pedidoSeleccionado?.numero_pedido || ''}`}
                headerGradient="red"
                maxWidth="2xl"
            >
                {pedidoSeleccionado && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-700">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-xs">
                                Se muestran solo los ítems con negociaciones o descuentos que requieren validación.
                            </p>
                        </div>

                        <div className="border border-neutral-200 rounded-2xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Producto</th>
                                        <th className="px-4 py-3 text-center">Cant.</th>
                                        <th className="px-4 py-3 text-right">Precio Lista</th>
                                        <th className="px-4 py-3 text-right">Descuento</th>
                                        <th className="px-4 py-3 text-right">Precio Final</th>
                                        <th className="px-4 py-3 text-right font-bold text-neutral-900">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {pedidoSeleccionado.items?.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <p className="font-bold text-neutral-900">{item.sku_nombre_snapshot || 'Producto'}</p>
                                                <p className="text-[10px] text-neutral-500 font-mono uppercase">{item.sku_codigo_snapshot || 'SKU-???'}</p>
                                            </td>
                                            <td className="px-4 py-3 text-center font-medium">{item.cantidad_solicitada || 0}</td>
                                            <td className="px-4 py-3 text-right text-neutral-500 line-through">
                                                {formatCurrency(item.precio_unitario_base)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-green-50 text-green-700 text-[10px] font-bold border border-green-100">
                                                    {item.descuento_item_tipo === 'porcentaje' ? `- ${item.descuento_item_valor}%` : `- ${formatCurrency(item.descuento_item_valor)}`}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-brand-red">
                                                {formatCurrency(item.precio_unitario_final)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-black text-neutral-900">
                                                {formatCurrency(item.subtotal)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Global Discount if applies */}
                        {pedidoSeleccionado.descuento_pedido_valor && (
                            <div className="flex justify-end pr-4">
                                <div className="flex items-center gap-2 bg-brand-red/5 px-4 py-2 rounded-xl border border-brand-red/20">
                                    <span className="text-xs font-bold text-brand-red uppercase tracking-tight">Descuento Global:</span>
                                    <span className="text-sm font-black text-brand-red">
                                        {pedidoSeleccionado.descuento_pedido_tipo === 'porcentaje' ? `${pedidoSeleccionado.descuento_pedido_valor}%` : formatCurrency(pedidoSeleccionado.descuento_pedido_valor)}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setPedidoSeleccionado(null)}
                                className="px-6 py-2.5 bg-neutral-100 text-neutral-700 rounded-xl font-bold hover:bg-neutral-200 transition-colors text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleApproveAll(pedidoSeleccionado.id)}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-8 py-2.5 bg-brand-red text-white rounded-xl font-bold hover:bg-brand-red600 transition-all shadow-lg shadow-brand-red/20 disabled:opacity-50 text-sm"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <Check className="w-5 h-5" />
                                )}
                                Aprobar Todo
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Toast Notification */}
            {toast && (
                <div
                    className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[60] border transition-all ${toast.type === 'success' ? 'bg-white border-green-200' : 'bg-white border-red-200'
                        }`}
                    style={{ animation: 'slideIn 0.3s ease-out' }}
                >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${toast.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                        {toast.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                    </div>
                    <div>
                        <p className="font-bold text-neutral-900 text-sm">{toast.type === 'success' ? '¡Éxito!' : 'Error'}</p>
                        <p className="text-xs text-neutral-500">{toast.message}</p>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
        </div>
    )
}
