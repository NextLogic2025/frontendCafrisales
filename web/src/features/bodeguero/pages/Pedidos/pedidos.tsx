import { useState } from 'react'
import { ClipboardList } from 'components/ui/Icons'
import { SectionHeader } from '../../../../components/ui/SectionHeader'
import { PageHero } from '../../../../components/ui/PageHero'
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner'
import { Alert } from '../../../../components/ui/Alert'
import { useBodegueroPedidos } from './hooks/useBodegueroPedidos'
import { PedidosFilters } from './components/PedidosFilters'
import { PedidosTable } from './components/PedidosTable'
import { PedidoDetailModal } from './components/PedidoDetailModal'
import { ValidationModal } from './components/ValidationModal'
import type { Pedido } from '../../../supervisor/services/pedidosApi'

export default function BodegueroPedidosPage() {
    const {
        isLoading,
        error,
        filtroEstado,
        setFiltroEstado,
        searchTerm,
        setSearchTerm,
        pedidosFiltrados,
        paginatedPedidos,
        currentPage,
        totalPages,
        handlePageChange,
        cargarPedidos
    } = useBodegueroPedidos()

    const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null)
    const [pedidoAValidar, setPedidoAValidar] = useState<Pedido | null>(null)

    return (
        <div className="space-y-6">
            <PageHero
                title="Gestión de Pedidos"
                subtitle="Visualiza y gestiona los pedidos del sistema"
                chips={[
                    'Listado de pedidos',
                    'Detalles de pedido',
                ]}
            />

            <SectionHeader
                title="Pedidos Registrados"
                subtitle="Todos los pedidos disponibles para gestión"
            />

            {/* Filtros y búsqueda */}
            <PedidosFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filtroEstado={filtroEstado}
                setFiltroEstado={setFiltroEstado}
                onRefresh={cargarPedidos}
                isLoading={isLoading}
            />

            {/* Error */}
            {error && <Alert type="error" message={error} />}

            {/* Loading */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner />
                </div>
            ) : pedidosFiltrados.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">No hay pedidos</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        {searchTerm || filtroEstado !== 'TODOS'
                            ? 'No se encontraron pedidos con los filtros aplicados'
                            : 'No hay pedidos en el sistema'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <PedidosTable
                        pedidos={paginatedPedidos}
                        onVerDetalle={setPedidoDetalle}
                        onValidar={setPedidoAValidar}
                    />

                    {/* Resumen y Paginación */}
                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-600">
                            Mostrando <span className="font-semibold">{paginatedPedidos.length}</span> de{' '}
                            <span className="font-semibold">{pedidosFiltrados.length}</span> pedidos
                        </p>

                        {/* Controles de Paginación */}
                        {totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-xs font-medium bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Anterior
                                </button>
                                <div className="text-xs text-gray-600">
                                    Página <span className="font-semibold">{currentPage}</span> de <span className="font-semibold">{totalPages}</span>
                                </div>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 text-xs font-medium bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de Detalles del Pedido */}
            <PedidoDetailModal
                pedido={pedidoDetalle}
                onClose={() => setPedidoDetalle(null)}
                onValidar={(p) => {
                    setPedidoDetalle(null)
                    setPedidoAValidar(p)
                }}
            />

            {/* Modal de Validación */}
            <ValidationModal
                pedido={pedidoAValidar}
                onClose={() => setPedidoAValidar(null)}
                onSuccess={() => {
                    cargarPedidos()
                    setPedidoAValidar(null)
                }}
            />
        </div>
    )
}
