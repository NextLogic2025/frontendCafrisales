import React, { useState } from 'react'
import { Modal } from 'components/ui/Modal'
import { XCircle, FileText } from 'components/ui/Icons'
import { marcarNoEntregado, marcarEnRuta } from 'features/shared/services/deliveryApi'

interface MarcarNoEntregadoModalProps {
    isOpen: boolean
    onClose: () => void
    entregaId: string
    pedidoNumero: string
    estadoActual?: string
    onSuccess: () => void
}

export function MarcarNoEntregadoModal({
    isOpen,
    onClose,
    entregaId,
    pedidoNumero,
    estadoActual,
    onSuccess,
}: MarcarNoEntregadoModalProps) {
    const [motivo, setMotivo] = useState('')
    const [observaciones, setObservaciones] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!motivo.trim()) {
            setError('El motivo es obligatorio')
            return
        }

        setLoading(true)
        setError(null)

        try {

            // If delivery is still 'pendiente', mark it as 'en_ruta' first
            if (estadoActual === 'pendiente') {
                await marcarEnRuta(entregaId)
            }

            await marcarNoEntregado(entregaId, {
                motivo: motivo.trim(),
                observaciones: observaciones.trim() || undefined,
            })

            onSuccess()
            onClose()
            setMotivo('')
            setObservaciones('')
        } catch (err: any) {
            setError(err.message || 'Error al marcar como no entregado')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        if (!loading) {
            setMotivo('')
            setObservaciones('')
            setError(null)
            onClose()
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Marcar como No Entregado"
            headerGradient="red"
            maxWidth="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-800">
                        <XCircle className="h-5 w-5" />
                        <p className="font-semibold">Pedido: {pedidoNumero}</p>
                    </div>
                </div>

                <div>
                    <label htmlFor="motivo" className="block text-sm font-medium text-neutral-700 mb-2">
                        Motivo <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="motivo"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Ej: Cliente ausente, dirección incorrecta..."
                        required
                    />
                </div>

                <div>
                    <label htmlFor="observaciones" className="block text-sm font-medium text-neutral-700 mb-2">
                        Observaciones adicionales (opcional)
                    </label>
                    <textarea
                        id="observaciones"
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        placeholder="Detalles adicionales sobre el motivo..."
                    />
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex gap-3 justify-end pt-4">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="px-6 py-2 border border-neutral-300 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-50 transition-all duration-150 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-150 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Procesando...
                            </>
                        ) : (
                            <>
                                <XCircle className="h-4 w-4" />
                                Confirmar No Entregado
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
