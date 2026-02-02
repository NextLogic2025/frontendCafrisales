import { MapPin, Truck, Calendar, ArrowRight } from 'components/ui/Icons'
import type { RuteroLogistico } from '../../../../supervisor/services/types'

interface RoutesListProps {
    ruteros: RuteroLogistico[]
    onSelect: (id: string) => void
}

export function RoutesList({ ruteros, onSelect }: RoutesListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ruteros.map((rutero) => (
                <div
                    key={rutero.id}
                    className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 cursor-pointer flex flex-col justify-between"
                    onClick={() => onSelect(rutero.id)}
                >
                    <div className="space-y-3">
                        <div className="flex justify-between items-start">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                Publicado
                            </span>
                            <span className="text-xs text-gray-500 font-mono">
                                #{rutero.id.slice(-6).toUpperCase()}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                            <MapPin className="h-4 w-4 text-blue-500" />
                            <span>{rutero.zona?.nombre || 'Zona no definida'}</span>
                        </div>

                        <div className="space-y-1.5 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4 text-gray-400" />
                                <span>{rutero.vehiculo?.placa || 'Sin vehículo'} - {rutero.transportista?.nombre} {rutero.transportista?.apellido}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>{rutero.fecha_programada ? new Date(rutero.fecha_programada).toLocaleDateString() : 'Pendiente'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                        <span className="text-gray-500">
                            {rutero.paradas?.length || 0} Paradas / Pedidos
                        </span>
                        <div className="flex items-center text-blue-600 font-medium gap-1">
                            Ver preparación
                            <ArrowRight className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
