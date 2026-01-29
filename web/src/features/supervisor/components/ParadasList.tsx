import React from 'react'
import { MapPin, Package, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import type { ParadaRutero } from '../services/types'

interface ParadasListProps {
    paradas: ParadaRutero[]
    showEstadoEntrega?: boolean
    onParadaClick?: (parada: ParadaRutero) => void
}

export function ParadasList({
    paradas,
    showEstadoEntrega = false,
    onParadaClick,
}: ParadasListProps) {
    const getEstadoIcon = (estado?: 'pendiente' | 'entregado' | 'problema') => {
        switch (estado) {
            case 'entregado':
                return <CheckCircle className="h-5 w-5 text-green-600" />
            case 'problema':
                return <AlertCircle className="h-5 w-5 text-red-600" />
            default:
                return <Clock className="h-5 w-5 text-yellow-600" />
        }
    }

    const getEstadoColor = (estado?: 'pendiente' | 'entregado' | 'problema') => {
        switch (estado) {
            case 'entregado':
                return 'bg-green-50 border-green-200'
            case 'problema':
                return 'bg-red-50 border-red-200'
            default:
                return 'bg-yellow-50 border-yellow-200'
        }
    }

    const getEstadoLabel = (estado?: 'pendiente' | 'entregado' | 'problema') => {
        switch (estado) {
            case 'entregado':
                return 'Entregado'
            case 'problema':
                return 'Problema'
            default:
                return 'Pendiente'
        }
    }

    if (paradas.length === 0) {
        return (
            <div className="text-center py-8 text-neutral-500">
                <MapPin className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
                <h3 className="text-lg font-semibold text-neutral-700">Sin paradas</h3>
                <p className="text-sm text-neutral-500 mt-2">
                    No hay paradas definidas para este rutero.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {paradas.map((parada, index) => (
                <div
                    key={parada.id}
                    onClick={() => onParadaClick?.(parada)}
                    className={`border rounded-lg p-4 transition-all duration-150 ${onParadaClick ? 'cursor-pointer hover:shadow-md' : ''
                        } ${showEstadoEntrega
                            ? getEstadoColor(parada.estado_entrega)
                            : 'bg-white border-neutral-200 hover:border-brand-red'
                        }`}
                >
                    <div className="flex items-start gap-3">
                        {/* Número de orden */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-red text-white flex items-center justify-center font-bold text-sm">
                            {parada.orden_entrega}
                        </div>

                        {/* Información de la parada */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-neutral-800 mb-1">
                                        {parada.pedido?.cliente_nombre || 'Cliente no disponible'}
                                    </h4>
                                    <p className="text-sm text-neutral-600">
                                        Pedido #{parada.pedido?.numero_pedido || parada.pedido_id.slice(0, 8)}
                                    </p>
                                </div>

                                {/* Estado de entrega */}
                                {showEstadoEntrega && (
                                    <div className="flex items-center gap-2">
                                        {getEstadoIcon(parada.estado_entrega)}
                                        <span className="text-sm font-medium text-neutral-700">
                                            {getEstadoLabel(parada.estado_entrega)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Dirección */}
                            {parada.pedido?.direccion_entrega && (
                                <div className="flex items-start gap-2 text-sm text-neutral-600 mb-2">
                                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-neutral-400" />
                                    <span className="line-clamp-2">{parada.pedido.direccion_entrega}</span>
                                </div>
                            )}

                            {/* Total and Actions */}
                            <div className="flex items-center justify-between mt-2">
                                {parada.pedido?.total !== undefined && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Package className="h-4 w-4 text-neutral-400" />
                                        <span className="text-neutral-600">Total:</span>
                                        <span className="font-semibold text-brand-red">
                                            ${parada.pedido.total.toFixed(2)}
                                        </span>
                                    </div>
                                )}

                                {parada.pedido?.ubicacion_gps && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            const [lng, lat] = parada.pedido!.ubicacion_gps!.coordinates
                                            window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank')
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
                                    >
                                        <MapPin className="h-3.5 w-3.5" />
                                        Abrir en Maps
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
