import React, { useState } from 'react'
import { Modal } from 'components/ui/Modal'
import { Camera, FileText } from 'components/ui/Icons'
import { uploadDeliveryEvidence } from 'features/shared/services/deliveryApi'
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
    const [archivo, setArchivo] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [descripcion, setDescripcion] = useState('')

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setArchivo(file)
            if (file.type.startsWith('image/')) {
                setPreviewUrl(URL.createObjectURL(file))
            } else {
                setPreviewUrl(null)
            }
        } else {
            setArchivo(null)
            setPreviewUrl(null)
        }
    }

    const handleSubmit = async () => {
        if (!archivo) {
            alert('El archivo de evidencia es requerido')
            return
        }

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('file', archivo)
            formData.append('tipo', tipo)
            if (descripcion.trim()) {
                formData.append('descripcion', descripcion.trim())
            }

            await uploadDeliveryEvidence(entregaId, formData)
            onSuccess()
            onClose()
            setArchivo(null)
            setPreviewUrl(null)
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
                        Sube una foto, firma o documento como evidencia de la entrega.
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

                {/* Archivo */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                        <Camera className="h-4 w-4 inline mr-2" />
                        Archivo de Evidencia <span className="text-red-500">*</span>
                    </label>

                    <div className="flex flex-col gap-3">
                        {previewUrl && (
                            <div className="relative h-48 w-full rounded-xl border border-neutral-200 bg-white p-1 overflow-hidden group">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="h-full w-full object-contain rounded-lg"
                                />
                            </div>
                        )}

                        <div className="relative">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                disabled={loading}
                            />
                            <div className="flex items-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-4 text-sm text-neutral-600 transition hover:border-blue-400 hover:bg-white">
                                <div className="flex-1 truncate">
                                    {archivo ? archivo.name : 'Seleccionar archivo o capturar foto...'}
                                </div>
                                <button type="button" className="text-blue-600 font-bold text-xs uppercase">
                                    Examinar
                                </button>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">
                        Puedes subir imágenes, documentos PDF, audios o videos como evidencia.
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
