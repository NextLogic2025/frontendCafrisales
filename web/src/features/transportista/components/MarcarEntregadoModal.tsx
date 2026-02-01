import React, { useState } from 'react'
import { Modal } from 'components/ui/Modal'
import { CheckCircle, FileText } from 'lucide-react'
import { completarEntrega, marcarEnRuta } from 'features/shared/services/deliveryApi'

interface MarcarEntregadoModalProps {
    isOpen: boolean
    onClose: () => void
    entregaId: string
    pedidoNumero: string
    estadoActual?: string // Added to check current state
    onSuccess: () => void
}

export function MarcarEntregadoModal({
    isOpen,
    onClose,
    entregaId,
    pedidoNumero,
    estadoActual,
    onSuccess,
}: MarcarEntregadoModalProps) {
    const [observaciones, setObservaciones] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // If delivery is still 'pendiente', mark it as 'en_ruta' first
            if (estadoActual === 'pendiente') {
                await marcarEnRuta(entregaId)
            }

            // Now complete the delivery
            await completarEntrega(entregaId, {
                observaciones: observaciones.trim() || undefined,
            })

            onSuccess()
            onClose()
            setObservaciones('')
        } catch (err: any) {
            setError(err.message || 'Error al marcar como entregado')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        if (!loading) {
            setObservaciones('')
            setError(null)
            onClose()
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Marcar como Entregado"
            headerGradient="green"
            maxWidth="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-5 w-5" />
                        <p className="font-semibold">Pedido: {pedidoNumero}</p>
                    </div>
                </div>

                <div>
                    <label htmlFor="observaciones" className="block text-sm font-medium text-neutral-700 mb-2">
                        Observaciones (opcional)
                    </label>
                    <textarea
                        id="observaciones"
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        placeholder="Agregar observaciones sobre la entrega..."
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
                        className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-150 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Procesando...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4" />
                                Confirmar Entrega
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
