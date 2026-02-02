
import React from 'react'
import { Search, User, Check, X } from 'components/ui/Icons'
import type { Cliente } from '../../../../supervisor/services/clientesApi'

interface ClientSelectorProps {
    busqueda: string
    onBusquedaChange: (value: string) => void
    clientesFiltrados: Cliente[]
    clienteSeleccionado: string
    onSelect: (id: string) => void
    isLoading: boolean
}

export function ClientSelector({
    busqueda,
    onBusquedaChange,
    clientesFiltrados,
    clienteSeleccionado,
    onSelect,
    isLoading
}: ClientSelectorProps) {
    const selectedClient = clientesFiltrados.find(c => c.id === clienteSeleccionado)

    return (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-neutral-900">Seleccionar Cliente</h3>
                {clienteSeleccionado && (
                    <button
                        onClick={() => onSelect('')}
                        className="text-xs font-medium text-neutral-500 hover:text-brand-red flex items-center gap-1"
                    >
                        <X size={14} />
                        Cambiar cliente
                    </button>
                )}
            </div>

            {!clienteSeleccionado ? (
                <div className="relative">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o RUC..."
                            value={busqueda}
                            onChange={(e) => onBusquedaChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-200 focus:border-brand-red focus:ring-4 focus:ring-brand-red/10 outline-none transition-all placeholder:text-neutral-400"
                        />
                        {isLoading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-brand-red" />
                            </div>
                        )}
                    </div>

                    {clientesFiltrados.length > 0 && (
                        <div className="absolute left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-xl z-50">
                            <div className="py-2">
                                {clientesFiltrados.map((cliente) => (
                                    <button
                                        key={cliente.id}
                                        onClick={() => onSelect(cliente.id)}
                                        className="w-full px-4 py-3 flex items-start gap-3 hover:bg-neutral-50 transition-colors text-left"
                                    >
                                        <div className="mt-0.5 h-10 w-10 shrink-0 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                                            <User size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-neutral-900 truncate">
                                                {cliente.razon_social}
                                            </p>
                                            <p className="text-sm text-neutral-500">
                                                {cliente.identificacion} {cliente.nombre_comercial ? `· ${cliente.nombre_comercial}` : ''}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {busqueda.trim() !== '' && clientesFiltrados.length === 0 && (
                        <div className="absolute left-0 right-0 mt-2 rounded-lg border border-neutral-200 bg-white shadow-xl z-50 p-4 text-center text-neutral-500 text-sm italic">
                            No se encontraron clientes para "{busqueda}"
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex items-center gap-4 p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                    <div className="h-12 w-12 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <User size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-emerald-900 truncate">
                            {selectedClient?.razon_social || 'Cliente seleccionado'}
                        </p>
                        <p className="text-sm text-emerald-700">
                            {selectedClient?.identificacion}
                        </p>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                        <Check size={14} strokeWidth={3} />
                    </div>
                </div>
            )}
        </div>
    )
}
