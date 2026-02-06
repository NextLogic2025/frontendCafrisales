import { X, Calendar, DollarSign, FileText, History, CheckCircle2, Clock } from 'components/ui/Icons'
import { useEffect, useState } from 'react'
import { type CreditDetail, registerPayment, getCreditDetail } from '../../../services/creditosApi'
import { RegisterPaymentModal } from './RegisterPaymentModal'

interface CreditDetailModalProps {
    isOpen: boolean
    onClose: () => void
    detail: CreditDetail | null
    loading: boolean
    onApprove?: (credit: any) => void
    onReject?: (id: string) => void
}

export function CreditDetailModal({ isOpen, onClose, detail, loading, onApprove, onReject }: CreditDetailModalProps) {
    const [localDetail, setLocalDetail] = useState<CreditDetail | null>(detail)
    const [showPaymentForm, setShowPaymentForm] = useState(false)
    const [payAmount, setPayAmount] = useState<string>('0.00')
    const [payDate, setPayDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [payRef, setPayRef] = useState<string>('')
    const [payNotes, setPayNotes] = useState<string>('')
    const [isPaying, setIsPaying] = useState(false)
    const [payError, setPayError] = useState<string | null>(null)

    useEffect(() => {
        setLocalDetail(detail)
    }, [detail])

    if (!isOpen) return null
    const display = localDetail ?? detail

    const handleConfirmPayment = async () => {
        if (!localDetail) return
        setPayError(null)
        const amount = Number(payAmount)
        if (!amount || amount <= 0) {
            setPayError('Ingresa un monto válido')
            return
        }

        setIsPaying(true)
        try {
            await registerPayment(localDetail.credito.id, {
                monto_pago: amount,
                fecha_pago: payDate,
                referencia: payRef,
                notas: payNotes,
            })

            // Refresh detail
            const refreshed = await getCreditDetail(localDetail.credito.id)
            setLocalDetail(refreshed)
            setShowPaymentForm(false)
        } catch (err: any) {
            setPayError(err?.message || 'Error al registrar pago')
        } finally {
            setIsPaying(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-brand-red/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-brand-red" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-neutral-900">Detalle de Crédito</h2>
                            <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">
                                ID Pedido: {detail?.credito.pedido_id.slice(0, 8)}...
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5 text-neutral-400" />
                    </button>
                </div>

                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="h-8 w-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-neutral-500 font-medium">Cargando detalles...</p>
                        </div>
                    ) : !detail ? (
                        <div className="text-center py-8">
                            <p className="text-neutral-500">No se pudo cargar la información del crédito.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Resumen de Montos */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                                    <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Aprobado</p>
                                    <p className="text-xl font-black text-neutral-900">
                                        ${Number(display?.totales.total_aprobado || 0).toFixed(2)}
                                    </p>
                                </div>
                                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                                    <p className="text-xs font-bold text-green-600 uppercase mb-1">Pagado</p>
                                    <p className="text-xl font-black text-green-700">
                                        ${Number(display?.totales.total_pagado || 0).toFixed(2)}
                                    </p>
                                </div>
                                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                                    <p className="text-xs font-bold text-red-600 uppercase mb-1">Saldo</p>
                                    <p className="text-xl font-black text-red-700">
                                        ${Number(display?.totales.saldo || 0).toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            {/* Información General */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar className="h-4 w-4" /> Temporalidad
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-neutral-500">Fecha Aprobación:</span>
                                            <span className="font-bold text-neutral-900">
                                                {display?.credito.fecha_aprobacion ? new Date(display.credito.fecha_aprobacion).toLocaleDateString() : '-'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-neutral-500">Vencimiento:</span>
                                            <span className="font-bold text-neutral-900">
                                                {display?.credito.fecha_vencimiento ? new Date(display.credito.fecha_vencimiento).toLocaleDateString() : '-'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-neutral-500">Plazo otorgado:</span>
                                            <span className="font-bold text-neutral-900">{display?.credito.plazo_dias ?? '-'} días</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                        <Clock className="h-4 w-4" /> Estado Actual
                                    </h3>
                                    <div className="flex items-center gap-3 p-4 rounded-xl border border-neutral-100 bg-neutral-50/50">
                                        {display?.credito.estado === 'activo' ? (
                                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                                            </div>
                                        ) : display?.credito.estado === 'vencido' ? (
                                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                                <Clock className="h-6 w-6 text-red-600" />
                                            </div>
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <History className="h-6 w-6 text-blue-600" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-bold text-neutral-900 capitalize">{display?.credito.estado}</p>
                                            <p className="text-xs text-neutral-500">Estado del crédito en sistema</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Historial de Pagos */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                    <History className="h-4 w-4" /> Historial de Pagos
                                </h3>

                                {(localDetail?.pagos || []).length === 0 ? (
                                    <div className="p-8 border-2 border-dashed border-neutral-100 rounded-2xl text-center">
                                        <p className="text-neutral-400 text-sm">No se han registrado pagos para este crédito todavía.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {(localDetail?.pagos || []).map((pago) => (
                                            <div key={pago.id} className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 hover:bg-neutral-50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                                                        <DollarSign className="h-5 w-5 text-neutral-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-neutral-900">${Number(pago.monto).toFixed(2)}</p>
                                                        <p className="text-xs text-neutral-500">{String(pago.metodo_pago ?? '').toUpperCase() || 'Manual'} • {pago.referencia || 'Sin ref'}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                        <p className="text-xs font-bold text-neutral-900">
                                                            {new Date(pago.fecha_pago).toLocaleDateString()}
                                                        </p>
                                                    <p className="text-[10px] text-neutral-400 uppercase font-black">Registrado</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-between items-center gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl bg-white border border-neutral-200 text-sm font-bold text-neutral-600 hover:bg-neutral-100 transition-colors"
                    >
                        Cerrar Detalle
                    </button>

                    <div className="flex gap-2 items-center">
                        {/* Registrar pago si hay saldo pendiente */}
                        {Number(localDetail?.totales.saldo || 0) > 0 && (
                            <button
                                onClick={() => setShowPaymentForm(true)}
                                className="px-4 py-2 rounded-xl bg-green-600 text-sm font-bold text-white hover:bg-green-700 transition-colors"
                            >
                                Registrar pago
                            </button>
                        )}

                        {detail?.credito.estado === 'pendiente' && onApprove && onReject && (
                            <div className="flex gap-2">
                                    <button
                                        onClick={() => onReject(display?.credito.id || '')}
                                    className="px-6 py-2 rounded-xl bg-white border border-red-200 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    Rechazar
                                </button>
                                <button
                                        onClick={() => onApprove(display?.credito)}
                                    className="px-6 py-2 rounded-xl bg-brand-red text-sm font-bold text-white hover:bg-brand-red/90 transition-colors shadow-lg shadow-brand-red/20"
                                >
                                    Aprobar Crédito
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <RegisterPaymentModal
                isOpen={showPaymentForm}
                onClose={() => setShowPaymentForm(false)}
                amount={payAmount}
                setAmount={setPayAmount}
                date={payDate}
                setDate={setPayDate}
                reference={payRef}
                setReference={setPayRef}
                notes={payNotes}
                setNotes={setPayNotes}
                onConfirm={handleConfirmPayment}
                loading={isPaying}
                error={payError}
            />
        </div>
    )
}
