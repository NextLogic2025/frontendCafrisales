import React from 'react'
import { Modal } from 'components/ui/Modal'
import { X } from 'components/ui/Icons'
import type { RutaVendedor } from '../../services/rutasVendedorTypes'
import { ClientesList } from '../../components/ClientesList'
import { ZonaMapaGoogle } from '../../components/ZonaMapaGoogle'
import { ESTADO_RUTA_LABELS } from '../../services/rutasVendedorTypes'

interface DetalleRutaModalProps {
    isOpen: boolean
    onClose: () => void
    ruta: RutaVendedor | null
}

export function DetalleRutaModal({ isOpen, onClose, ruta }: DetalleRutaModalProps) {
    if (!ruta) return null

    const formatDate = (dateString?: string, alternate?: string) => {
        const date = dateString || alternate
        if (!date) return 'No definida'
        return new Date(date).toLocaleString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    // Prepare markers for map
    const puntos = (ruta.paradas || [])
        .filter(p => p.cliente?.latitud && p.cliente?.longitud)
        .map(p => ({
            lat: p.cliente!.latitud!,
            lng: p.cliente!.longitud!,
            nombre: `${p.orden_visita}. ${p.cliente?.razon_social || 'Cliente'}`,
        }))

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Detalle de Ruta #${ruta.id.slice(0, 8)}`}
            headerGradient="red"
            maxWidth="2xl"
        >
            <div className="space-y-6">
                {/* Info General */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-50 rounded-lg">
                    <div>
                        <p className="text-sm text-neutral-600">Vendedor</p>
                        <p className="font-semibold text-neutral-900">
                            {ruta.vendedor?.nombre || 'No asignado'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-neutral-600">Estado</p>
                        <p className="font-semibold text-neutral-900">
                            {ESTADO_RUTA_LABELS[ruta.estado]}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-neutral-600">Fecha Programada</p>
                        <p className="font-semibold text-neutral-900">
                            {formatDate(ruta.fecha_programada, ruta.fecha_rutero)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-neutral-600">Total Clientes</p>
                        <p className="font-semibold text-neutral-900">
                            {ruta.paradas?.length || 0} visitas
                        </p>
                    </div>
                </div>

                {/* Mapa */}
                {puntos.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                            Mapa de Visitas
                        </h3>
                        <div className="h-80 rounded-lg overflow-hidden border border-neutral-200">
                            <ZonaMapaGoogle puntos={puntos} />
                        </div>
                    </div>
                )}

                {/* Lista de Clientes */}
                <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                        Clientes a Visitar
                    </h3>
                    <ClientesList paradas={ruta.paradas || []} showStatus={ruta.estado === 'en_curso' || ruta.estado === 'completado'} />
                </div>

                {/* Motivo Cancelación */}
                {ruta.estado === 'cancelado' && ruta.motivo_cancelacion && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm font-medium text-red-900 mb-1">
                            Motivo de Cancelación
                        </p>
                        <p className="text-sm text-red-700">{ruta.motivo_cancelacion}</p>
                    </div>
                )}

                {/* Fechas */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-neutral-600">Creada</p>
                        <p className="font-medium text-neutral-900">{formatDate(ruta.creado_en)}</p>
                    </div>
                    {ruta.publicado_en && (
                        <div>
                            <p className="text-neutral-600">Publicada</p>
                            <p className="font-medium text-neutral-900">{formatDate(ruta.publicado_en)}</p>
                        </div>
                    )}
                    {ruta.iniciado_en && (
                        <div>
                            <p className="text-neutral-600">Iniciada</p>
                            <p className="font-medium text-neutral-900">{formatDate(ruta.iniciado_en)}</p>
                        </div>
                    )}
                    {ruta.completado_en && (
                        <div>
                            <p className="text-neutral-600">Completada</p>
                            <p className="font-medium text-neutral-900">{formatDate(ruta.completado_en)}</p>
                        </div>
                    )}
                </div>

                {/* Close Button */}
                <div className="flex justify-end pt-4 border-t border-neutral-200">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-neutral-200 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-300 transition-all duration-150"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </Modal>
    )
}
