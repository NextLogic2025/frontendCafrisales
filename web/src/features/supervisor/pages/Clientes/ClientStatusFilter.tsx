import { type Cliente } from '../../services/clientesApi'

interface ClientStatusFilterProps {
    selectedStatus: 'activo' | 'inactivo' | 'todos'
    onStatusChange: (status: 'activo' | 'inactivo' | 'todos') => void
}

export function ClientStatusFilter({ selectedStatus, onStatusChange }: ClientStatusFilterProps) {
    const filters = [
        { id: 'activo', label: 'Activos' },
        { id: 'inactivo', label: 'Inactivos' },
        { id: 'todos', label: 'Todos' },
    ] as const

    return (
        <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
            {filters.map((filter) => (
                <button
                    key={filter.id}
                    onClick={() => onStatusChange(filter.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${selectedStatus === filter.id
                            ? 'bg-white text-brand-red shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                        }`}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    )
}
