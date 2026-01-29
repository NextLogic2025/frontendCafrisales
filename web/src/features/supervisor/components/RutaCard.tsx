import React from 'react'
import { Calendar, User, MapPin, Clock } from 'lucide-react'
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
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'No definida'
        return new Date(dateString).toLocaleDateString('es-ES', {
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
                        <h3 className="text-lg font-semibold text-neutral-900">
                            Ruta #{ruta.id.slice(0, 8)}
                        </h3>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ESTADO_RUTA_COLORS[ruta.estado]}`}>
                            {ESTADO_RUTA_LABELS[ruta.estado]}
                        </span>
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="space-y-2.5 mb-4">
                {/* Vendedor */}
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <User className="h-4 w-4 text-neutral-400" />
                    <span className="font-medium">Vendedor:</span>
                    <span>{ruta.vendedor?.nombre || 'No asignado'}</span>
                </div>

                {/* Clientes */}
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <MapPin className="h-4 w-4 text-neutral-400" />
                    <span className="font-medium">Clientes:</span>
                    <span>{ruta.paradas?.length || 0} visitas</span>
                </div>

                {/* Fecha */}
                {ruta.fecha_programada && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Calendar className="h-4 w-4 text-neutral-400" />
                        <span className="font-medium">Programada:</span>
                        <span>{formatDate(ruta.fecha_programada)}</span>
                    </div>
                )}

                {/* Fecha creación */}
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Clock className="h-4 w-4 text-neutral-400" />
                    <span className="font-medium">Creada:</span>
                    <span>{formatDate(ruta.creado_en)}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-neutral-100">
                {onView && (
                    <button
                        onClick={() => onView(ruta)}
                        className="px-3 py-1.5 text-sm font-medium text-brand-red hover:bg-red-50 rounded-lg transition-colors"
                    >
                        Ver Detalle
                    </button>
                )}

                {canEdit && onEdit && (
                    <button
                        onClick={() => onEdit(ruta)}
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        Editar
                    </button>
                )}

                {canPublish && onPublish && (
                    <button
                        onClick={() => onPublish(ruta)}
                        className="px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                        Publicar
                    </button>
                )}

                {canCancel && onCancel && (
                    <button
                        onClick={() => onCancel(ruta)}
                        className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                )}

                {canStart && onStart && (
                    <button
                        onClick={() => onStart(ruta)}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                    >
                        Iniciar Ruta
                    </button>
                )}

                {canComplete && onComplete && (
                    <button
                        onClick={() => onComplete(ruta)}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                        Completar Ruta
                    </button>
                )}
            </div>
        </div>
    )
}
