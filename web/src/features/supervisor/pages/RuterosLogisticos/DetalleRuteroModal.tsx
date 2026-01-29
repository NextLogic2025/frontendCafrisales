import React from 'react'
import { Modal } from 'components/ui/Modal'
import { Truck, User, MapPin, Calendar, Package } from 'lucide-react'
import type { RuteroLogistico } from '../../services/types'
import { ESTADO_RUTERO_COLORS, ESTADO_RUTERO_LABELS } from '../../services/types'
import { ParadasList } from '../../components/ParadasList'
import { ZonaMapaGoogle } from '../../components/ZonaMapaGoogle'

interface DetalleRuteroModalProps {
    isOpen: boolean
    onClose: () => void
    rutero: RuteroLogistico | null
}

export function DetalleRuteroModal({ isOpen, onClose, rutero }: DetalleRuteroModalProps) {
    if (!rutero) return null

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

    // Prepare map data
    const puntosMapa = (rutero.paradas || [])
        .filter((p) => p.pedido?.ubicacion_gps)
        .map((p, index) => ({
            lat: p.pedido!.ubicacion_gps!.coordinates[1],
            lng: p.pedido!.ubicacion_gps!.coordinates[0],
            nombre: `${index + 1}. ${p.pedido?.cliente_nombre || 'Cliente'}`,
        }))

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Detalle Rutero #${rutero.id.slice(0, 8)}`}
            headerGradient="red"
            maxWidth="2xl"
        >
            <div className="space-y-6">
                {/* Header with Status */}
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-neutral-800">Información del Rutero</h3>
                    <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${estadoColor}`}
                    >
                        {estadoLabel}
                    </span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                    <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-neutral-400" />
                        <div>
                            <p className="text-sm text-neutral-600">Transportista</p>
                            <p className="font-medium text-neutral-800">
                                {rutero.transportista
                                    ? `${rutero.transportista.nombre} ${rutero.transportista.apellido}`
                                    : 'No asignado'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-neutral-400" />
                        <div>
                            <p className="text-sm text-neutral-600">Vehículo</p>
                            <p className="font-medium text-neutral-800">
                                {rutero.vehiculo?.placa || 'No asignado'}
                                {rutero.vehiculo?.modelo && ` - ${rutero.vehiculo.modelo}`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-neutral-400" />
                        <div>
                            <p className="text-sm text-neutral-600">Número de Paradas</p>
                            <p className="font-medium text-neutral-800">{rutero.paradas?.length || 0}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-neutral-400" />
                        <div>
                            <p className="text-sm text-neutral-600">Creado</p>
                            <p className="font-medium text-neutral-800">{formatDate(rutero.creado_en)}</p>
                        </div>
                    </div>

                    {rutero.fecha_programada && (
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-neutral-400" />
                            <div>
                                <p className="text-sm text-neutral-600">Fecha Programada</p>
                                <p className="font-medium text-neutral-800">
                                    {formatDate(rutero.fecha_programada)}
                                </p>
                            </div>
                        </div>
                    )}

                    {rutero.publicado_en && (
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-neutral-400" />
                            <div>
                                <p className="text-sm text-neutral-600">Publicado</p>
                                <p className="font-medium text-neutral-800">{formatDate(rutero.publicado_en)}</p>
                            </div>
                        </div>
                    )}

                    {rutero.iniciado_en && (
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-neutral-400" />
                            <div>
                                <p className="text-sm text-neutral-600">Iniciado</p>
                                <p className="font-medium text-neutral-800">{formatDate(rutero.iniciado_en)}</p>
                            </div>
                        </div>
                    )}

                    {rutero.completado_en && (
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-neutral-400" />
                            <div>
                                <p className="text-sm text-neutral-600">Completado</p>
                                <p className="font-medium text-neutral-800">{formatDate(rutero.completado_en)}</p>
                            </div>
                        </div>
                    )}

                    {rutero.cancelado_en && (
                        <>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-neutral-400" />
                                <div>
                                    <p className="text-sm text-neutral-600">Cancelado</p>
                                    <p className="font-medium text-neutral-800">{formatDate(rutero.cancelado_en)}</p>
                                </div>
                            </div>
                            {rutero.cancelado_motivo && (
                                <div className="flex items-center gap-3 col-span-2">
                                    <Package className="h-5 w-5 text-neutral-400" />
                                    <div>
                                        <p className="text-sm text-neutral-600">Motivo de Cancelación</p>
                                        <p className="font-medium text-neutral-800">{rutero.cancelado_motivo}</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Map */}
                {puntosMapa.length > 0 && (
                    <div>
                        <h4 className="text-lg font-semibold text-neutral-800 mb-3">Mapa de Paradas</h4>
                        <div className="border border-neutral-200 rounded-lg overflow-hidden">
                            <ZonaMapaGoogle poligono={[]} puntos={puntosMapa} zoom={13} />
                        </div>
                    </div>
                )}

                {/* Paradas List */}
                <div>
                    <h4 className="text-lg font-semibold text-neutral-800 mb-3">
                        Paradas ({rutero.paradas?.length || 0})
                    </h4>
                    <ParadasList
                        paradas={rutero.paradas || []}
                        showEstadoEntrega={rutero.estado === 'en_curso' || rutero.estado === 'completado'}
                    />
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
