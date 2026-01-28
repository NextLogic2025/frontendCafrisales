
import { CheckCircle2, Tag } from 'lucide-react'
import { PaymentConditionSelector } from './PaymentConditionSelector'
import type { ClienteDetalle } from '../types'

interface OrderSummaryProps {
    totalItems: number
    total: number
    condicionPagoManual: 'CONTADO' | 'CREDITO'
    setCondicionPagoManual: (value: 'CONTADO' | 'CREDITO') => void
    clienteDetalle: ClienteDetalle | null
    onGoBack: () => void
    onSubmit: () => void
    isSubmitting: boolean
    isCartEmpty: boolean
    descuentoPedidoTipo: 'porcentaje' | 'monto' | 'fijo'
    setDescuentoPedidoTipo: (value: 'porcentaje' | 'monto' | 'fijo') => void
    descuentoPedidoValor: number | undefined
    setDescuentoPedidoValor: (value: number | undefined) => void
}

export function OrderSummary({
    totalItems,
    total,
    condicionPagoManual,
    setCondicionPagoManual,
    clienteDetalle,
    onGoBack,
    onSubmit,
    isSubmitting,
    isCartEmpty,
    descuentoPedidoTipo,
    setDescuentoPedidoTipo,
    descuentoPedidoValor,
    setDescuentoPedidoValor
}: OrderSummaryProps) {
    const calculateFinalTotal = () => {
        let final = total
        if (descuentoPedidoValor) {
            if (descuentoPedidoTipo === 'porcentaje') {
                final = final * (1 - descuentoPedidoValor / 100)
            } else {
                final = final - descuentoPedidoValor
            }
        }
        return Math.max(final, 0).toFixed(2)
    }

    return (
        <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm lg:col-span-1 lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-700">Total de ítems</p>
                <p className="text-sm font-semibold text-neutral-900">{totalItems}</p>
            </div>

            {/* Global Discount Section */}
            <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                <div className="mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-brand-red" />
                    <p className="text-xs font-semibold text-neutral-700">Descuento Global</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <select
                        className="rounded border border-neutral-200 bg-white px-2 py-1 text-xs"
                        value={descuentoPedidoTipo}
                        onChange={(e) => setDescuentoPedidoTipo(e.target.value as any)}
                    >
                        <option value="porcentaje">% Global</option>
                        <option value="monto">$ Global</option>
                    </select>
                    <input
                        type="number"
                        placeholder="0"
                        className="rounded border border-neutral-200 bg-white px-2 py-1 text-xs"
                        value={descuentoPedidoValor || ''}
                        onChange={(e) => setDescuentoPedidoValor(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
                <p className="text-sm font-bold text-neutral-700">Total a Pagar</p>
                <p className="text-2xl font-bold text-neutral-900">${calculateFinalTotal()}</p>
            </div>

            <PaymentConditionSelector
                condicionPagoManual={condicionPagoManual}
                setCondicionPagoManual={setCondicionPagoManual}
            />

            {clienteDetalle && (
                <div className="rounded-2xl border border-neutral-200 px-3 py-3">
                    <p className="text-sm font-semibold text-neutral-900 mb-1">Destino del pedido</p>
                    <p className="text-sm text-neutral-700">
                        {clienteDetalle?.direccion_texto || clienteDetalle?.direccion || 'Dirección del cliente'}
                    </p>
                    {clienteDetalle?.ciudad && <p className="text-xs text-neutral-500">{clienteDetalle.ciudad}</p>}
                </div>
            )}

            <div className="grid gap-2">
                <button
                    type="button"
                    onClick={onGoBack}
                    className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
                >
                    ← Agregar más productos
                </button>
                <button
                    type="button"
                    disabled={isCartEmpty || isSubmitting}
                    onClick={onSubmit}
                    className="rounded-xl bg-brand-red px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Creando pedido...
                        </>
                    ) : (
                        'Confirmar pedido'
                    )}
                </button>
            </div>
        </div>
    )
}
