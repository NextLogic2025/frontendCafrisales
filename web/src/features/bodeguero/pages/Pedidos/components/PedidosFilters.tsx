import { Search, RefreshCcw } from 'components/ui/Icons'
import type { EstadoFiltro } from '../hooks/useBodegueroPedidos'

interface PedidosFiltersProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filtroEstado: EstadoFiltro;
    setFiltroEstado: (estado: EstadoFiltro) => void;
    onRefresh: () => void;
    isLoading: boolean;
}

export function PedidosFilters({
    searchTerm,
    setSearchTerm,
    filtroEstado,
    setFiltroEstado,
    onRefresh,
    isLoading
}: PedidosFiltersProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                {/* Búsqueda */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar por ID, cliente o vendedor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                    />
                </div>

                {/* Botón refrescar */}
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
                >
                    <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Actualizar
                </button>
            </div>

            {/* Filtros de estado */}
            <div className="flex flex-wrap gap-2">
                {(['TODOS', 'PENDIENTE', 'APROBADO', 'ANULADO', 'EN_PREPARACION', 'FACTURADO', 'EN_RUTA', 'ENTREGADO'] as EstadoFiltro[]).map((estado) => (
                    <button
                        key={estado}
                        onClick={() => setFiltroEstado(estado)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filtroEstado === estado
                            ? 'bg-brand-red text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {estado.replace(/_/g, ' ')}
                    </button>
                ))}
            </div>
        </div>
    )
}
