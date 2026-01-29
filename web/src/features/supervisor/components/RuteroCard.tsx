import React from 'react'
import { Truck, MapPin, User, Calendar, Package } from 'lucide-react'
import type { RuteroLogistico } from '../services/types'
import { ESTADO_RUTERO_COLORS, ESTADO_RUTERO_LABELS } from '../services/types'

interface RuteroCardProps {
    rutero: RuteroLogistico
    onView?: (rutero: RuteroLogistico) => void
    onPublish?: (rutero: RuteroLogistico) => void
    onCancel?: (rutero: RuteroLogistico) => void
    onEdit?: (rutero: RuteroLogistico) => void
    onStart?: (rutero: RuteroLogistico) => void
    onComplete?: (rutero: RuteroLogistico) => void
    showActions?: boolean
    role?: 'supervisor' | 'transportista'
}

export function RuteroCard({
    rutero,
    onView,
    onPublish,
    onCancel,
    onEdit,
    onStart,
    onComplete,
    showActions = true,
    role = 'supervisor',
}: RuteroCardProps) {
    const numParadas = rutero.paradas?.length || 0
    const estadoColor = ESTADO_RUTERO_COLORS[rutero.estado]
    const estadoLabel = ESTADO_RUTERO_LABELS[rutero.estado]

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return 'No definida'
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Truck className="h-5 w-5 text-brand-red" />
                        <h3 className="font-semibold text-lg text-neutral-800">
                            Rutero #{rutero.id.slice(0, 8)}
                        </h3>
                    </div>
                    <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${estadoColor}`}
                    >
                        {estadoLabel}
                    </span>
                </div>
            </div>

            {/* Info Grid */}
            <div className="space-y-3 mb-4">
                {/* Transportista */}
                <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-neutral-400" />
                    <span className="text-neutral-600">Transportista:</span>
                    <span className="font-medium text-neutral-800">
                        {rutero.transportista
                            ? `${rutero.transportista.nombre} ${rutero.transportista.apellido}`
                            : 'No asignado'}
                    </span>
                </div>

                {/* Vehículo */}
                <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-neutral-400" />
                    <span className="text-neutral-600">Vehículo:</span>
                    <span className="font-medium text-neutral-800">
                        {rutero.vehiculo?.placa || 'No asignado'}
                        {rutero.vehiculo?.modelo && ` - ${rutero.vehiculo.modelo}`}
                    </span>
                </div>

                {/* Paradas */}
                <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-neutral-400" />
                    <span className="text-neutral-600">Paradas:</span>
                    <span className="font-medium text-neutral-800">{numParadas}</span>
                </div>

                {/* Fecha programada */}
                {rutero.fecha_programada && (
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-neutral-400" />
                        <span className="text-neutral-600">Programado:</span>
                        <span className="font-medium text-neutral-800">
                            {formatDate(rutero.fecha_programada)}
                        </span>
                    </div>
                )}

                {/* Fecha de creación */}
                <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-neutral-400" />
                    <span className="text-neutral-600">Creado:</span>
                    <span className="font-medium text-neutral-800">
                        {formatDate(rutero.creado_en)}
                    </span>
                </div>
            </div>

            {/* Actions */}
            {showActions && (
                <div className="flex gap-2 pt-4 border-t border-neutral-100">
                    {/* Ver detalle - siempre disponible */}
                    {onView && (
                        <button
                            onClick={() => onView(rutero)}
                            className="flex-1 px-3 py-2 text-sm font-medium text-brand-red border border-brand-red rounded-lg hover:bg-brand-red hover:text-white transition-all duration-150"
                        >
                            Ver Detalle
                        </button>
                    )}

                    {/* Supervisor actions */}
                    {role === 'supervisor' && (
                        <>
                            {rutero.estado === 'borrador' && onEdit && (
                                <button
                                    onClick={() => onEdit(rutero)}
                                    className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-150"
                                >
                                    Editar
                                </button>
                            )}

                            {rutero.estado === 'borrador' && onPublish && (
                                <button
                                    onClick={() => onPublish(rutero)}
                                    className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all duration-150"
                                >
                                    Publicar
                                </button>
                            )}

                            {(rutero.estado === 'borrador' || rutero.estado === 'publicado') &&
                                onCancel && (
                                    <button
                                        onClick={() => onCancel(rutero)}
                                        className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-150"
                                    >
                                        Cancelar
                                    </button>
                                )}
                        </>
                    )}

                    {/* Transportista actions */}
                    {role === 'transportista' && (
                        <>
                            {rutero.estado === 'publicado' && onStart && (
                                <button
                                    onClick={() => onStart(rutero)}
                                    className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all duration-150"
                                >
                                    Iniciar Rutero
                                </button>
                            )}

                            {rutero.estado === 'en_curso' && onComplete && (
                                <button
                                    onClick={() => onComplete(rutero)}
                                    className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-150"
                                >
                                    Completar
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
