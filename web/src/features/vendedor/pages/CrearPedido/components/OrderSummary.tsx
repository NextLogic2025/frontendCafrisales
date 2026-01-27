
import { CheckCircle2 } from 'lucide-react'
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
    isCartEmpty
}: OrderSummaryProps) {
    return (
        <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm lg:col-span-1 lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-700">Total de ítems</p>
                <p className="text-sm font-semibold text-neutral-900">{totalItems}</p>
            </div>
            <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-700">Total</p>
                <p className="text-xl font-bold text-neutral-900">${total.toFixed(2)}</p>
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
