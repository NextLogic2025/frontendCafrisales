
import { CheckCircle2 } from 'lucide-react'
import { PaymentConditionSelector } from './PaymentConditionSelector'
import { DestinationSelector } from './DestinationSelector'
import type { SucursalCliente, ClienteDetalle } from '../types'

interface OrderSummaryProps {
    totalItems: number
    total: number
    condicionPagoManual: 'CONTADO' | 'CREDITO'
    setCondicionPagoManual: (value: 'CONTADO' | 'CREDITO') => void
    destinoTipo: 'cliente' | 'sucursal'
    onDestinoChange: (tipo: 'cliente' | 'sucursal') => void
    sucursales: SucursalCliente[]
    clienteDetalle: ClienteDetalle | null
    selectedSucursalId: string | null
    onSucursalSelect: (id: string) => void
    invalidSucursalMessage: string | null
    destinoDescripcion: string
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
    destinoTipo,
    onDestinoChange,
    sucursales,
    clienteDetalle,
    selectedSucursalId,
    onSucursalSelect,
    invalidSucursalMessage,
    destinoDescripcion,
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

            <DestinationSelector
                destinoTipo={destinoTipo}
                onDestinoChange={onDestinoChange}
                sucursales={sucursales}
                clienteDetalle={clienteDetalle}
                selectedSucursalId={selectedSucursalId}
                onSucursalSelect={onSucursalSelect}
                invalidSucursalMessage={invalidSucursalMessage}
                destinoDescripcion={destinoDescripcion}
            />

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
