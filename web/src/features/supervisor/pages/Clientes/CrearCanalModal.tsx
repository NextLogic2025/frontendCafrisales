import { useState } from 'react'
import { X, Save, Tag, FileText, Layout } from 'lucide-react'
import { Button } from 'components/ui/Button'
import { channelsApi, type ChannelPayload } from '../../../../services/api/channelsApi'

interface CrearCanalModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function CrearCanalModal({ isOpen, onClose, onSuccess }: CrearCanalModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState<ChannelPayload>({
        codigo: '',
        nombre: '',
        descripcion: '',
        activo: true,
    })
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            await channelsApi.createChannel({
                ...formData,
                codigo: formData.codigo.trim(),
                nombre: formData.nombre.trim(),
                descripcion: formData.descripcion?.trim(),
            })
            onSuccess()
            handleClose()
        } catch (err: any) {
            setError(err.message || 'Error al crear el canal')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        setFormData({
            codigo: '',
            nombre: '',
            descripcion: '',
            activo: true,
        })
        setError(null)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-brand-red p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Layout className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Nuevo Canal</h2>
                            <p className="text-white/80 text-sm">Define nombre, código y descripción</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    <div className="space-y-5">
                        {/* Código */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Tag className="h-4 w-4 text-brand-red" />
                                Código
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all"
                                placeholder="Ej: CANAL-001"
                                value={formData.codigo}
                                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                            />
                        </div>

                        {/* Nombre */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Layout className="h-4 w-4 text-brand-red" />
                                Nombre
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all"
                                placeholder="Ej: Minorista"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </div>

                        {/* Descripción */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-brand-red" />
                                Descripción
                            </label>
                            <textarea
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all h-24 resize-none"
                                placeholder="Describe el canal comercial"
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 py-3 h-auto"
                            onClick={handleClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-3 h-auto bg-brand-red text-white hover:bg-brand-red/90 shadow-lg shadow-brand-red/20"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Guardando...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <Save className="h-5 w-5" />
                                    Crear canal
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
