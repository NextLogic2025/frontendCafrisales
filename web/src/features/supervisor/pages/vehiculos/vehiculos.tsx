import { useState, useEffect } from 'react'
import { SectionHeader } from 'components/ui/SectionHeader'
import { PageHero } from 'components/ui/PageHero'
import { Button } from 'components/ui/Button'
import { Truck } from 'components/ui/Icons'
import { VehiculoStats } from './VehiculoStats'
import { VehiculosTable } from './VehiculosTable'
import { VehiculoDetailModal } from './VehiculoDetailModal'
import { CrearVehiculoModal } from './CrearVehiculoModal'
import { type Vehicle, getVehicles } from '../../services/vehiclesApi'

export default function VehiculosPage() {
    const [vehiculos, setVehiculos] = useState<Vehicle[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedVehiculo, setSelectedVehiculo] = useState<Vehicle | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    useEffect(() => {
        loadVehiculos()
    }, [])

    const loadVehiculos = async () => {
        try {
            setIsLoading(true)
            setVehiculos([])
            const items = await getVehicles()
            setVehiculos(items || [])
        } catch (error) {
            setVehiculos([])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <PageHero
                title="Gestión de Vehículos"
                subtitle="Administra la flota de vehículos disponibles para rutas"
                chips={[
                    'Flota de transporte',
                    'Capacidad y estado',
                    'Asignación a ruteros',
                ]}
            />

            <VehiculoStats vehiculos={vehiculos} />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <SectionHeader
                        title="Listado de Vehículos"
                        subtitle="Vista general de la flota"
                    />
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 bg-brand-red text-white hover:bg-brand-red/90"
                    >
                        <Truck className="h-4 w-4" />
                        Crear Vehículo
                    </Button>
                </div>

                <VehiculosTable
                    vehiculos={vehiculos}
                    isLoading={isLoading}
                    onView={setSelectedVehiculo}
                />
            </div>

            <VehiculoDetailModal
                isOpen={!!selectedVehiculo}
                onClose={() => setSelectedVehiculo(null)}
                vehiculo={selectedVehiculo}
            />

            <CrearVehiculoModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={loadVehiculos}
            />
        </div>
    )
}
