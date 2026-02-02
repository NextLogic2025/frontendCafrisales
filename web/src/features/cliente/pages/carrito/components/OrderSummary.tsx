
import { CheckCircle2 } from 'components/ui/Icons'
import { PaymentConditionSelector } from './PaymentConditionSelector'
import type { PerfilCliente } from '../../../types'

interface OrderSummaryProps {
    total: number
    itemsCount: number
    confirmarPedido: () => void
    goToProducts: () => void
    perfil: PerfilCliente | null
    condicionPagoManual: 'CONTADO' | 'CREDITO'
    setCondicionPagoManual: (value: 'CONTADO' | 'CREDITO') => void
}

export function OrderSummary({
    total,
    itemsCount,
    confirmarPedido,
    goToProducts,
    perfil,
    condicionPagoManual,
    setCondicionPagoManual
}: OrderSummaryProps) {
    return (
        <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm lg:col-span-1 lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-700">Total</p>
                <p className="text-xl font-bold text-neutral-900">${total.toFixed(2)}</p>
            </div>
            <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-700">Total</p>
                <p className="text-xl font-bold text-neutral-900">${total.toFixed(2)}</p>
            </div>

            <PaymentConditionSelector
                condicionPagoManual={condicionPagoManual}
                setCondicionPagoManual={setCondicionPagoManual}
                superaCredito={false}
            />

            <div className="rounded-2xl border border-neutral-200 px-3 py-3">
                <p className="text-sm font-semibold text-neutral-900 mb-1">Dirección de Entrega</p>
                <p className="text-sm text-neutral-600">Dirección Principal ({perfil?.direccion || 'Sin dirección registrada'})</p>
            </div>

            <div className="grid gap-2">
                <button
                    type="button"
                    onClick={goToProducts}
                    className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
                >
                    Continuar comprando
                </button>
                <button
                    type="button"
                    disabled={itemsCount === 0}
                    onClick={confirmarPedido}
                    className="rounded-xl bg-brand-red px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Confirmar pedido
                </button>
            </div>
        </div>
    )
}
