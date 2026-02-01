import React from 'react'
import { MapPin, User, Calendar, Flag, ArrowRight } from 'lucide-react'
import type { RutaVendedor } from '../../supervisor/services/rutasVendedorTypes'
import { ESTADO_RUTA_COLORS, ESTADO_RUTA_LABELS } from '../../supervisor/services/rutasVendedorTypes'

interface RutaVendedorCardProps {
    ruta: RutaVendedor
    onView?: (ruta: RutaVendedor) => void
    onStart?: (ruta: RutaVendedor) => void
    onComplete?: (ruta: RutaVendedor) => void
}

export function RutaVendedorCard({
    ruta,
    onView,
    onStart,
    onComplete,
}: RutaVendedorCardProps) {
    const numParadas = ruta.paradas?.length || 0
    const estadoColor = ESTADO_RUTA_COLORS[ruta.estado]
    const estadoLabel = ESTADO_RUTA_LABELS[ruta.estado]

    const formatDate = (dateString?: string | null, alternate?: string | null) => {
        const date = dateString || alternate
        if (!date) return 'No definida'
        return new Date(date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    return (
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col h-full group">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-brand-red/5 rounded-lg group-hover:bg-brand-red/10 transition-colors">
                            <Flag className="h-5 w-5 text-brand-red" />
                        </div>
                        <h3 className="font-bold text-xl text-neutral-800">
                            Ruta #{ruta.id.slice(0, 8)}
                        </h3>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border transform transition-all duration-300 ${estadoColor}`}>
                        {estadoLabel}
                    </span>
                </div>
            </div>

            {/* Info Grid */}
            <div className="space-y-4 mb-6 flex-1">
                <div className="flex items-center gap-3 text-sm p-2 rounded-xl bg-neutral-50 border border-transparent group-hover:border-neutral-100 transition-all">
                    <User className="h-4 w-4 text-neutral-400" />
                    <div>
                        <p className="text-[10px] text-neutral-500 uppercase font-black leading-none mb-1">Vendedor</p>
                        <p className="font-semibold text-neutral-800">{ruta.vendedor?.nombre || 'Mi Perfil'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 text-sm p-2 rounded-xl bg-neutral-50 border border-transparent group-hover:border-neutral-100 transition-all">
                        <MapPin className="h-4 w-4 text-neutral-400" />
                        <div>
                            <p className="text-[10px] text-neutral-500 uppercase font-black leading-none mb-1">Zona</p>
                            <p className="font-semibold text-neutral-800 truncate">{ruta.zona?.nombre || 'General'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm p-2 rounded-xl bg-neutral-50 border border-transparent group-hover:border-neutral-100 transition-all">
                        <div className="w-4 h-4 rounded-full bg-brand-red/10 text-brand-red flex items-center justify-center text-[10px] font-black">
                            {numParadas}
                        </div>
                        <div>
                            <p className="text-[10px] text-neutral-500 uppercase font-black leading-none mb-1">Paradas</p>
                            <p className="font-semibold text-neutral-800">{numParadas} clientes</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-sm p-2 rounded-xl bg-neutral-50 border border-transparent group-hover:border-neutral-100 transition-all">
                    <Calendar className="h-4 w-4 text-neutral-400" />
                    <div>
                        <p className="text-[10px] text-neutral-500 uppercase font-black leading-none mb-1">Programado</p>
                        <p className="font-semibold text-neutral-800">{formatDate(ruta.fecha_programada, ruta.fecha_rutero)}</p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
                {onView && (
                    <button
                        onClick={() => onView(ruta)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-brand-red border-2 border-brand-red/10 rounded-xl hover:border-brand-red hover:bg-brand-red hover:text-white transition-all duration-300 group/btn"
                    >
                        Ver Detalles
                        <ArrowRight className="h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                )}

                <div className="flex gap-2">
                    {ruta.estado === 'publicado' && onStart && (
                        <button
                            onClick={() => onStart(ruta)}
                            className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all"
                        >
                            Iniciar
                        </button>
                    )}

                    {ruta.estado === 'en_curso' && onComplete && (
                        <button
                            onClick={() => onComplete(ruta)}
                            className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
                        >
                            Finalizar
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
