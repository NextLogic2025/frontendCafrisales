import { Modal } from 'components/ui/Modal'
import { Vehicle } from '../../services/vehiclesApi'
import { StatusBadge } from 'components/ui/StatusBadge'
import { Truck, Calendar } from 'components/ui/Icons'

interface VehiculoDetailModalProps {
    isOpen: boolean
    onClose: () => void
    vehiculo: Vehicle | null
}

export function VehiculoDetailModal({ isOpen, onClose, vehiculo }: VehiculoDetailModalProps) {
    if (!vehiculo) return null

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Vehículo">
            <div className="space-y-6">
                <div className="flex items-center gap-4 border-b border-neutral-100 pb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <Truck className="h-8 w-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-neutral-900">{vehiculo.placa}</h3>
                        <p className="text-sm text-neutral-500">ID: {vehiculo.id}</p>
                    </div>
                    <div className="ml-auto">
                        <StatusBadge variant={vehiculo.estado === 'disponible' ? 'success' : 'neutral'}>
                            {vehiculo.estado}
                        </StatusBadge>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1 rounded-xl bg-neutral-50 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                            <span className="h-4 w-4 text-neutral-500" />
                            Modelo
                        </div>
                        <p className="text-lg font-medium text-neutral-900">{vehiculo.modelo || 'No registrado'}</p>
                    </div>

                    <div className="space-y-1 rounded-xl bg-neutral-50 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                            <span className="h-4 w-4 text-neutral-500" />
                            Capacidad (kg)
                        </div>
                        <p className="text-lg font-medium text-neutral-900">{vehiculo.capacidad_kg ?? 'N/A'}</p>
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-1 rounded-xl bg-neutral-50 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                            <Calendar className="h-4 w-4 text-neutral-500" />
                            Registrado
                        </div>
                        <p className="text-lg font-medium text-neutral-900">{vehiculo.creado_en ? new Date(vehiculo.creado_en).toLocaleDateString() : '—'}</p>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
