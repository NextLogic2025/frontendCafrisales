/**
 * DELIVERY TRACKING COMPONENT - PLACEHOLDER FOR FUTURE INTEGRATION
 * 
 * This component will be integrated with the delivery-service to allow transportistas
 * to mark individual deliveries with photos, signatures, and observations.
 * 
 * INTEGRATION REQUIREMENTS:
 * - Backend delivery-service API endpoints for marking deliveries
 * - Photo upload functionality
 * - Signature capture component
 * - Observations/notes field
 * 
 * USAGE:
 * Import and use this component in the DetalleRuteroPage when delivery-service is ready.
 * 
 * Example:
 * <DeliveryTracker
 *   pedidoId={parada.pedido_id}
 *   ruteroId={rutero.id}
 *   onDeliveryMarked={() => loadRutero()}
 * />
 */

import React, { useState } from 'react'
import { Modal } from 'components/ui/Modal'
import { Camera, FileText, CheckCircle } from 'lucide-react'

interface DeliveryTrackerProps {
    pedidoId: string
    ruteroId: string
    onDeliveryMarked: () => void
}

export function DeliveryTracker({ pedidoId, ruteroId, onDeliveryMarked }: DeliveryTrackerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [foto, setFoto] = useState<File | null>(null)
    const [firma, setFirma] = useState<string | null>(null)
    const [observaciones, setObservaciones] = useState('')
    const [estadoEntrega, setEstadoEntrega] = useState<'entregado' | 'problema'>('entregado')

    const handleSubmit = async () => {
        setLoading(true)
        try {
            // TODO: Integrate with delivery-service API
            // const formData = new FormData()
            // formData.append('pedido_id', pedidoId)
            // formData.append('rutero_id', ruteroId)
            // formData.append('estado', estadoEntrega)
            // formData.append('observaciones', observaciones)
            // if (foto) formData.append('foto', foto)
            // if (firma) formData.append('firma', firma)

            // await fetch(`${env.api.delivery}/api/entregas`, {
            //   method: 'POST',
            //   headers: { Authorization: `Bearer ${token}` },
            //   body: formData
            // })

            alert('Funcionalidad de entrega pendiente de integración con delivery-service')
            setIsOpen(false)
            onDeliveryMarked()
        } catch (error) {
            console.error('Error marking delivery:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all duration-150"
            >
                <CheckCircle className="h-4 w-4 inline mr-2" />
                Marcar Entrega
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Marcar Entrega"
                headerGradient="green"
                maxWidth="lg"
            >
                <div className="space-y-4">
                    {/* Estado de Entrega */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Estado de Entrega
                        </label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setEstadoEntrega('entregado')}
                                className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-all duration-150 ${estadoEntrega === 'entregado'
                                        ? 'border-green-600 bg-green-50 text-green-700'
                                        : 'border-neutral-300 text-neutral-700 hover:border-green-600'
                                    }`}
                            >
                                Entregado
                            </button>
                            <button
                                onClick={() => setEstadoEntrega('problema')}
                                className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-all duration-150 ${estadoEntrega === 'problema'
                                        ? 'border-red-600 bg-red-50 text-red-700'
                                        : 'border-neutral-300 text-neutral-700 hover:border-red-600'
                                    }`}
                            >
                                Problema
                            </button>
                        </div>
                    </div>

                    {/* Foto */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            <Camera className="h-4 w-4 inline mr-2" />
                            Foto de Entrega
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => setFoto(e.target.files?.[0] || null)}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                        />
                    </div>

                    {/* Firma (Placeholder) */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Firma del Cliente
                        </label>
                        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
                            <p className="text-neutral-500 text-sm">
                                Componente de firma pendiente de implementación
                            </p>
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            <FileText className="h-4 w-4 inline mr-2" />
                            Observaciones
                        </label>
                        <textarea
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            placeholder="Agregar notas sobre la entrega..."
                            rows={3}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-neutral-200">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-all duration-150 disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Confirmar Entrega'}
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="flex-1 bg-neutral-200 text-neutral-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-neutral-300 transition-all duration-150"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    )
}
