import { Vehicle } from '../../services/vehiclesApi'
import { GenericDataTable } from 'components/ui/GenericDataTable'
import { StatusBadge } from 'components/ui/StatusBadge'

interface VehiculosTableProps {
    vehiculos: Vehicle[]
    isLoading: boolean
    onView: (vehiculo: Vehicle) => void
}

export function VehiculosTable({ vehiculos, isLoading, onView }: VehiculosTableProps) {
    return (
        <GenericDataTable
            data={vehiculos}
            loading={isLoading}
            searchPlaceholder="Buscar vehículo por placa o modelo..."
            columns={[
                {
                    key: 'placa',
                    label: 'Placa',
                    render: (_, item: Vehicle) => (
                        <div>
                            <p className="font-semibold text-neutral-900">{item.placa}</p>
                            <p className="text-xs text-neutral-500">{item.modelo || 'Sin modelo'}</p>
                        </div>
                    ),
                },
                {
                    key: 'capacidad_kg',
                    label: 'Capacidad (kg)',
                    render: (_, item: Vehicle) => (item.capacidad_kg != null ? String(item.capacidad_kg) : 'N/A'),
                },
                {
                    key: 'estado',
                    label: 'Estado',
                    render: (_, item: Vehicle) => (
                        <StatusBadge variant={item.estado === 'disponible' ? 'success' : 'neutral'}>
                            {item.estado}
                        </StatusBadge>
                    )
                },
            ]}
            actions={(item) => [
                {
                    label: 'Ver detalles',
                    onClick: () => onView(item),
                },
            ]}
        />
    )
}
