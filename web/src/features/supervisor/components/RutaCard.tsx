import React from 'react'
import { Calendar, User, MapPin, Clock } from 'components/ui/Icons'
import type { RutaVendedor } from '../services/rutasVendedorTypes'
import { ESTADO_RUTA_COLORS, ESTADO_RUTA_LABELS } from '../services/rutasVendedorTypes'

interface RutaCardProps {
    ruta: RutaVendedor
    role: 'supervisor' | 'vendedor'
    onView?: (ruta: RutaVendedor) => void
    onPublish?: (ruta: RutaVendedor) => void
    onCancel?: (ruta: RutaVendedor) => void
    onEdit?: (ruta: RutaVendedor) => void
    onStart?: (ruta: RutaVendedor) => void
    onComplete?: (ruta: RutaVendedor) => void
}

export function RutaCard({
    ruta,
    role,
    onView,
    onPublish,
    onCancel,
    onEdit,
    onStart,
    onComplete,
}: RutaCardProps) {
    const formatDate = (dateString?: string, alternate?: string) => {
        const date = dateString || alternate
        if (!date) return 'No definida'
        return new Date(date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    }

    const canEdit = role === 'supervisor' && ruta.estado === 'borrador'
    const canPublish = role === 'supervisor' && ruta.estado === 'borrador'
    const canCancel = role === 'supervisor' && (ruta.estado === 'borrador' || ruta.estado === 'publicado')
    const canStart = role === 'vendedor' && ruta.estado === 'publicado'
    const canComplete = role === 'vendedor' && ruta.estado === 'en_curso'

    return (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5 hover:shadow-md transition-all duration-200">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-neutral-800">
                            Ruta #{ruta.id.slice(0, 8)}
                        </h3>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${ESTADO_RUTA_COLORS[ruta.estado]}`}>
                        {ESTADO_RUTA_LABELS[ruta.estado]}
                    </span>
                </div>
            </div>

            {/* Info */}
            <div className="space-y-3 mb-4">
                {/* Vendedor */}
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <User className="h-4 w-4 text-neutral-400" />
                    <span className="font-medium">Vendedor:</span>
                    <span>{ruta.vendedor?.nombre || 'No asignado'}</span>
                </div>

                {/* Zona */}
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <MapPin className="h-4 w-4 text-neutral-400" />
                    <span className="font-medium">Zona:</span>
                    <span>{ruta.zona?.nombre || 'General'}</span>
                </div>

                {/* Clientes */}
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <MapPin className="h-4 w-4 text-neutral-400" />
                    <span className="font-medium">Clientes:</span>
                    <span>{ruta.paradas?.length || 0} visitas</span>
                </div>

                {/* Fecha */}
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Calendar className="h-4 w-4 text-neutral-400" />
                    <span className="font-medium">Programada:</span>
                    <span>{formatDate(ruta.fecha_programada, ruta.fecha_rutero)}</span>
                </div>

                {/* Fecha creación */}
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Clock className="h-4 w-4 text-neutral-400" />
                    <span className="font-medium">Creada:</span>
                    <span>{formatDate(ruta.creado_en)}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-neutral-100">
                {onView && (
                    <button
                        onClick={() => onView(ruta)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-brand-red border border-brand-red rounded-lg hover:bg-brand-red hover:text-white transition-all duration-150"
                    >
                        Ver Detalle
                    </button>
                )}

                {canEdit && onEdit && (
                    <button
                        onClick={() => onEdit(ruta)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-150"
                    >
                        Editar
                    </button>
                )}

                {canPublish && onPublish && (
                    <button
                        onClick={() => onPublish(ruta)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all duration-150"
                    >
                        Publicar
                    </button>
                )}

                {canCancel && onCancel && (
                    <button
                        onClick={() => onCancel(ruta)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-150"
                    >
                        Cancelar
                    </button>
                )}

                {canStart && onStart && (
                    <button
                        onClick={() => onStart(ruta)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all duration-150"
                    >
                        Iniciar Ruta
                    </button>
                )}

                {canComplete && onComplete && (
                    <button
                        onClick={() => onComplete(ruta)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-150"
                    >
                        Completar
                    </button>
                )}
            </div>
        </div>
    )
}
