import React, { useState } from 'react'
import { Modal } from 'components/ui/Modal'
import { AlertTriangle } from 'lucide-react'
import { reportarIncidencia } from 'features/shared/services/deliveryApi'
import type { SeveridadIncidencia } from 'features/shared/types/deliveryTypes'

interface ReportarIncidenciaModalProps {
    isOpen: boolean
    onClose: () => void
    entregaId: string
    pedidoNumero: string
    onSuccess: () => void
}

export function ReportarIncidenciaModal({
    isOpen,
    onClose,
    entregaId,
    pedidoNumero,
    onSuccess,
}: ReportarIncidenciaModalProps) {
    const [loading, setLoading] = useState(false)
    const [tipoIncidencia, setTipoIncidencia] = useState('')
    const [severidad, setSeveridad] = useState<SeveridadIncidencia>('media')
    const [descripcion, setDescripcion] = useState('')

    const handleSubmit = async () => {
        if (!tipoIncidencia.trim() || !descripcion.trim()) {
            alert('Tipo de incidencia y descripción son requeridos')
            return
        }

        setLoading(true)
        try {
            await reportarIncidencia(entregaId, {
                tipo_incidencia: tipoIncidencia.trim(),
                severidad,
                descripcion: descripcion.trim(),
            })
            onSuccess()
            onClose()
            setTipoIncidencia('')
            setDescripcion('')
            setSeveridad('media')
        } catch (error: any) {
            alert(error.message || 'Error al reportar incidencia')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Reportar Incidencia"
            headerGradient="red"
            maxWidth="lg"
        >
            <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-sm text-orange-800">
                        <strong>Pedido:</strong> {pedidoNumero}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                        Reporta cualquier problema o situación anormal durante la entrega.
                    </p>
                </div>

                {/* Tipo de Incidencia */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Tipo de Incidencia <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={tipoIncidencia}
                        onChange={(e) => setTipoIncidencia(e.target.value)}
                        placeholder="Ej: Producto dañado, cliente insatisfecho..."
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                    />
                </div>

                {/* Severidad */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Severidad <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {(['baja', 'media', 'alta', 'critica'] as SeveridadIncidencia[]).map((sev) => (
                            <button
                                key={sev}
                                onClick={() => setSeveridad(sev)}
                                className={`px-4 py-2 rounded-lg border-2 font-medium transition-all duration-150 capitalize ${severidad === sev
                                    ? sev === 'baja'
                                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                                        : sev === 'media'
                                            ? 'border-yellow-600 bg-yellow-50 text-yellow-700'
                                            : sev === 'alta'
                                                ? 'border-orange-600 bg-orange-50 text-orange-700'
                                                : 'border-red-600 bg-red-50 text-red-700'
                                    : 'border-neutral-300 text-neutral-700 hover:border-neutral-400'
                                    }`}
                            >
                                {sev}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Descripción */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                        <AlertTriangle className="h-4 w-4 inline mr-2" />
                        Descripción <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Describe la incidencia en detalle..."
                        rows={4}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-neutral-200">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-orange-700 transition-all duration-150 disabled:opacity-50"
                    >
                        {loading ? 'Reportando...' : 'Reportar Incidencia'}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 bg-neutral-200 text-neutral-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-neutral-300 transition-all duration-150"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </Modal>
    )
}
