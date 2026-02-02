import { Package, RefreshCw } from 'components/ui/Icons'
import { PageHero } from '../../../../components/ui/PageHero'
import { SectionHeader } from '../../../../components/ui/SectionHeader'
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner'
import { Alert } from '../../../../components/ui/Alert'
import { usePreparacion } from './hooks/usePreparacion'
import { RoutesList } from './components/RoutesList'
import { RouteDetails } from './components/RouteDetails'

export default function PreparacionPage() {
    const {
        ruteros,
        selectedRutero,
        setSelectedRutero,
        isLoading,
        error,
        cargarRuteros,
        verDetalleRutero,
        handlePrepararParada
    } = usePreparacion()

    return (
        <div className="space-y-6 pb-20">
            <PageHero
                title="Preparación de Pedidos"
                subtitle="Gestiona el alistamiento de pedidos para rutas publicadas"
                chips={[
                    'Preparación de carga',
                    'Control de bodega',
                ]}
            />

            {!selectedRutero ? (
                <>
                    <div className="flex justify-between items-center">
                        <SectionHeader
                            title="Ruteros Publicados"
                            subtitle="Selecciona un rutero para iniciar la preparación"
                        />
                        <button
                            onClick={cargarRuteros}
                            disabled={isLoading}
                            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Actualizar
                        </button>
                    </div>

                    {error && <Alert type="error" message={error} />}

                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <LoadingSpinner size="md" />
                        </div>
                    ) : ruteros.length === 0 ? (
                        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
                            <Package className="mx-auto h-16 w-16 text-gray-300" />
                            <h3 className="mt-4 text-xl font-bold text-gray-900">No hay rutas publicadas</h3>
                            <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                                En este momento no hay rutas en estado 'Publicado' que requieran preparación en bodega.
                            </p>
                        </div>
                    ) : (
                        <RoutesList
                            ruteros={ruteros}
                            onSelect={verDetalleRutero}
                        />
                    )}
                </>
            ) : (
                <RouteDetails
                    rutero={selectedRutero}
                    onBack={() => setSelectedRutero(null)}
                    onPreparar={handlePrepararParada}
                />
            )}
        </div>
    )
}
