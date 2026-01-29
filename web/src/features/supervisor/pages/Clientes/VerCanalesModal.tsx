import { useEffect, useState } from 'react'
import { X, Layout, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { Button } from 'components/ui/Button'
import { channelsApi, type Channel } from '../../../../services/api/channelsApi'

interface VerCanalesModalProps {
    isOpen: boolean
    onClose: () => void
}

export function VerCanalesModal({ isOpen, onClose }: VerCanalesModalProps) {
    const [channels, setChannels] = useState<Channel[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            loadChannels()
        }
    }, [isOpen])

    const loadChannels = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await channelsApi.getChannels()
            setChannels(data)
        } catch (err: any) {
            setError('Error al cargar los canales')
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-slate-800 p-6 text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <Layout className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Canales Comerciales</h2>
                            <p className="text-white/70 text-sm">Listado de canales configurados</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto grow">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
                            <RefreshCw className="h-8 w-8 animate-spin" />
                            <p>Cargando canales...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 p-4 rounded-lg flex items-center justify-center text-red-600 gap-2">
                            <XCircle className="h-5 w-5" />
                            {error}
                            <Button variant="ghost" size="sm" onClick={loadChannels} className="ml-2 underline">
                                Reintentar
                            </Button>
                        </div>
                    ) : channels.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <p>No se encontraron canales registrados</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {channels.map((channel) => (
                                <div
                                    key={channel.id}
                                    className="bg-white border border-slate-200 hover:border-brand-red/30 hover:shadow-md transition-all rounded-xl p-4 group"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-slate-900 text-lg">
                                                    {channel.nombre}
                                                </h3>
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${channel.activo
                                                        ? 'bg-green-50 text-green-700 border-green-200'
                                                        : 'bg-slate-100 text-slate-500 border-slate-200'
                                                    }`}>
                                                    {channel.activo ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                            <p className="text-sm font-mono text-slate-500 bg-slate-50 inline-block px-1.5 rounded">
                                                {channel.codigo}
                                            </p>
                                            {channel.descripcion && (
                                                <p className="text-slate-600 text-sm mt-1">
                                                    {channel.descripcion}
                                                </p>
                                            )}
                                        </div>

                                        <div className="text-xs text-slate-400 font-medium">
                                            {new Date(channel.creado_en || '').toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
                    <Button onClick={onClose} variant="outline" className="px-6">
                        Cerrar
                    </Button>
                </div>
            </div>
        </div>
    )
}
