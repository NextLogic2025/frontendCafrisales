import React from 'react'
import { MapPin, CheckCircle, Circle } from 'lucide-react'
import type { ParadaRuta } from '../services/rutasVendedorTypes'

interface ClientesListProps {
    paradas: ParadaRuta[]
    showStatus?: boolean
}

export function ClientesList({ paradas, showStatus = false }: ClientesListProps) {
    if (!paradas || paradas.length === 0) {
        return (
            <div className="text-center py-8 text-neutral-500">
                No hay clientes en esta ruta
            </div>
        )
    }

    // Sort by orden_visita
    const sortedParadas = [...paradas].sort((a, b) => a.orden_visita - b.orden_visita)

    return (
        <div className="space-y-3">
            {sortedParadas.map((parada) => (
                <div
                    key={parada.id}
                    className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200"
                >
                    {/* Orden */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-red text-white flex items-center justify-center font-bold text-sm">
                        {parada.orden_visita}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-neutral-900 truncate">
                            {parada.cliente?.razon_social || 'Cliente'}
                        </h4>
                        {parada.cliente?.direccion && (
                            <div className="flex items-start gap-1.5 mt-1 text-sm text-neutral-600">
                                <MapPin className="h-4 w-4 text-neutral-400 flex-shrink-0 mt-0.5" />
                                <span className="line-clamp-2">{parada.cliente.direccion}</span>
                            </div>
                        )}
                        {parada.observaciones && (
                            <p className="mt-1 text-sm text-neutral-500 italic">
                                {parada.observaciones}
                            </p>
                        )}
                    </div>

                    {/* Status */}
                    {showStatus && (
                        <div className="flex-shrink-0">
                            {parada.visitado ? (
                                <div className="flex items-center gap-1.5 text-green-600">
                                    <CheckCircle className="h-5 w-5" />
                                    <span className="text-sm font-medium">Visitado</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 text-neutral-400">
                                    <Circle className="h-5 w-5" />
                                    <span className="text-sm font-medium">Pendiente</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
