import React, { useState } from 'react'
import { Modal } from 'components/ui/Modal'
import { Image, FileText } from 'lucide-react'
import { agregarEvidencia } from 'features/shared/services/deliveryApi'
import type { TipoEvidencia } from 'features/shared/types/deliveryTypes'

interface AgregarEvidenciaModalProps {
    isOpen: boolean
    onClose: () => void
    entregaId: string
    pedidoNumero: string
    onSuccess: () => void
}

export function AgregarEvidenciaModal({
    isOpen,
    onClose,
    entregaId,
    pedidoNumero,
    onSuccess,
}: AgregarEvidenciaModalProps) {
    const [loading, setLoading] = useState(false)
    const [tipo, setTipo] = useState<TipoEvidencia>('foto')
    const [url, setUrl] = useState('')
    const [descripcion, setDescripcion] = useState('')

    const handleSubmit = async () => {
        if (!url.trim()) {
            alert('La URL de la evidencia es requerida')
            return
        }

        setLoading(true)
        try {
            await agregarEvidencia(entregaId, {
                tipo,
                url: url.trim(),
                descripcion: descripcion.trim() || undefined,
            })
            onSuccess()
            onClose()
            setUrl('')
            setDescripcion('')
            setTipo('foto')
        } catch (error: any) {
            alert(error.message || 'Error al agregar evidencia')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Agregar Evidencia"
            headerGradient="blue"
            maxWidth="lg"
        >
            <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        <strong>Pedido:</strong> {pedidoNumero}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                        Agrega evidencia de la entrega mediante una URL (foto, firma, documento, etc.).
                    </p>
                </div>

                {/* Tipo de Evidencia */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Tipo de Evidencia <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value as TipoEvidencia)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                        <option value="foto">Foto</option>
                        <option value="firma">Firma</option>
                        <option value="documento">Documento</option>
                        <option value="audio">Audio</option>
                        <option value="otro">Otro</option>
                    </select>
                </div>

                {/* URL */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                        <Image className="h-4 w-4 inline mr-2" />
                        URL de la Evidencia <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://ejemplo.com/evidencia.jpg"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                        Por ahora, ingresa la URL pública de la evidencia. La carga de archivos se implementará próximamente.
                    </p>
                </div>

                {/* Descripción */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                        <FileText className="h-4 w-4 inline mr-2" />
                        Descripción (Opcional)
                    </label>
                    <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Descripción de la evidencia..."
                        rows={2}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-neutral-200">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-150 disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Agregar Evidencia'}
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
