import { Truck } from 'lucide-react'
import { MetricCard } from 'components/ui/Cards'
import { Vehicle } from '../../services/vehiclesApi'

interface VehiculoStatsProps {
    vehiculos: Vehicle[]
}

export function VehiculoStats({ vehiculos }: VehiculoStatsProps) {
    const total = vehiculos.length
    const disponibles = vehiculos.filter(v => v.estado === 'disponible').length
    const enMantenimiento = vehiculos.filter(v => v.estado === 'mantenimiento').length
    const sinModelo = vehiculos.filter(v => !v.modelo).length

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
                title="Total Vehículos"
                value={total.toString()}
                subtitle="Registrados en el sistema"
                icon={<Truck className="h-5 w-5" />}
                tone="blue"
            />
            <MetricCard
                title="Disponibles"
                value={disponibles.toString()}
                subtitle="Listos para asignar"
                icon={<Truck className="h-5 w-5" />}
                tone="green"
            />
            <MetricCard
                title="En Mantenimiento"
                value={enMantenimiento.toString()}
                subtitle="No asignables"
                icon={<Truck className="h-5 w-5" />}
                tone="red"
            />
            <MetricCard
                title="Sin Modelo"
                value={sinModelo.toString()}
                subtitle="Información incompleta"
                icon={<Truck className="h-5 w-5" />}
                tone="neutral"
            />
        </div>
    )
}
