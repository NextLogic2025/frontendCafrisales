import { useState, useEffect } from 'react'
import { PageHero } from '../../../../components/ui/PageHero'
import { StatusBadge } from '../../../../components/ui/StatusBadge'
import { EmptyContent } from '../../../../components/ui/EmptyContent'
import { ClipboardList, Search, Eye, RefreshCcw } from 'lucide-react'
import { Pedido, EstadoPedido } from '../../../cliente/types'
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner'
import { Modal } from '../../../../components/ui/Modal'

import { formatEstadoPedido } from '../../../../utils/statusHelpers'

// Componente auxiliar para estado
const EstadoBadge = ({ estado }: { estado: EstadoPedido | string }) => {
  const getVariant = (est: string) => {
    const normalized = String(est).toUpperCase()
    if (normalized.includes('PENDING') || normalized.includes('PENDIENTE')) return 'warning'
    if (normalized.includes('APPROVED') || normalized.includes('APROBADO')) return 'success'
    if (normalized.includes('CANCELLED') || normalized.includes('CANCELADO') || normalized.includes('ANULADO')) return 'error'
    if (normalized.includes('TRANSIT') || normalized.includes('RUTA')) return 'info'
    if (normalized.includes('DELIVERED') || normalized.includes('ENTREGADO')) return 'success'
    if (normalized.includes('PREPARATION') || normalized.includes('PREPARACION')) return 'neutral'
    return 'neutral'
  }

  return <StatusBadge variant={getVariant(estado)}>{formatEstadoPedido(estado)}</StatusBadge>
}

import { usePedidos, FilterOrigin } from './hooks/usePedidos'

export default function VendedorPedidos() {
  const {
    pedidos: filteredPedidos,
    isLoading,
    searchTerm,
    setSearchTerm,
    fetchPedidos,
    filterOrigin,
    setFilterOrigin,
    page,
    setPage,
    totalPages,
    totalPedidos,
    itemsPerPage
  } = usePedidos()

  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <PageHero
        title="Mis Pedidos"
        subtitle="Seguimiento de pedidos creados"
        chips={[
          { label: 'Trazabilidad completa', variant: 'blue' },
          { label: 'Cliente y vendedor', variant: 'green' },
        ]}
      />

      {/* Filtros */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="flex flex-col md:flex-row gap-6 items-end justify-between">
          <div className="flex-1 w-full md:w-auto space-y-4">
            {/* Buscador */}
            <div className="max-w-md">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Buscar Pedido
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Número de pedido..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtros de Origen */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Filtrar por Creador
              </label>
              <div className="inline-flex rounded-lg border border-neutral-200 p-1 bg-neutral-50">
                <button
                  onClick={() => setFilterOrigin('all')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filterOrigin === 'all'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterOrigin('me')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filterOrigin === 'me'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                >
                  Creados por mí
                </button>
                <button
                  onClick={() => setFilterOrigin('client')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filterOrigin === 'client'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                >
                  Del Cliente
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={fetchPedidos}
            disabled={isLoading}
            className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-2 h-10"
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </section>

      {/* Lista de Pedidos */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6">
        <h3 className="text-lg font-bold text-neutral-950 mb-4">Lista de Pedidos ({totalPedidos})</h3>

        {
          isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : filteredPedidos.length === 0 ? (
            <EmptyContent
              icon={<ClipboardList className="h-16 w-16" />}
              title="No hay pedidos registrados"
              description="Los pedidos que crees o que tus clientes generen aparecerán aquí"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Estado</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-600 uppercase">Total</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-600 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredPedidos.map(pedido => (
                    <tr key={pedido.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 text-sm font-mono text-neutral-900">{pedido.orderNumber}</td>
                      <td className="px-4 py-3 text-sm text-neutral-600">{formatDate(pedido.createdAt)}</td>
                      <td className="px-4 py-3">
                        <EstadoBadge estado={pedido.status} />
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-neutral-900 text-right">
                        ${pedido.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedPedido(pedido)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-100 text-neutral-700 text-xs font-medium rounded-lg hover:bg-neutral-200 transition-colors"
                        >
                          <Eye className="h-3 w-3" /> Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </section>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-200 bg-white px-4 py-3 sm:px-6 rounded-xl">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-neutral-700">
                Mostrando <span className="font-medium">{(page - 1) * itemsPerPage + 1}</span> a <span className="font-medium">{Math.min(page * itemsPerPage, totalPedidos)}</span> de <span className="font-medium">{totalPedidos}</span> resultados
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-neutral-400 ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Anterior</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                {/* Simple pagination logic: Show current page */}
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-neutral-900 ring-1 ring-inset ring-neutral-300 focus:outline-offset-0">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-neutral-400 ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Siguiente</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle */}
      < Modal
        isOpen={!!selectedPedido
        }
        onClose={() => setSelectedPedido(null)}
        title={`Detalle Pedido #${selectedPedido?.orderNumber}`}
        maxWidth="2xl"
      >
        {selectedPedido && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-neutral-500">Fecha de Creación</p>
                <p className="font-medium">{formatDate(selectedPedido.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Estado</p>
                <EstadoBadge estado={selectedPedido.status} />
              </div>
              <div>
                <p className="text-xs text-neutral-500">ID Interno</p>
                <p className="font-mono text-xs">{selectedPedido.id}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Items</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-100">
                    <tr>
                      <th className="px-3 py-2 text-left">Producto</th>
                      <th className="px-3 py-2 text-right">Cant.</th>
                      <th className="px-3 py-2 text-right">Precio</th>
                      <th className="px-3 py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedPedido.items.map(item => (
                      <tr key={item.id}>
                        <td className="px-3 py-2">
                          <div>
                            <p className="font-medium text-neutral-900 flex items-center gap-2">
                              {item.productName}
                              {item.origen_precio === 'negociado' && (
                                <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                  NEGOCIADO
                                </span>
                              )}
                            </p>
                            {item.cantidad_solicitada != null && item.cantidad_solicitada !== item.quantity && (
                              <div className="mt-1 flex flex-col gap-0.5">
                                <p className="text-xs text-neutral-500 line-through">
                                  Solicitado: {item.cantidad_solicitada} {item.unit}
                                </p>
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] bg-orange-100 text-orange-700 px-1 py-0.5 rounded font-bold">AJUSTADO</span>
                                  {item.motivo_ajuste && <span className="text-xs text-red-500 italic">({item.motivo_ajuste})</span>}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right align-top">
                          {item.quantity}
                          <span className="text-xs text-neutral-400 block">{item.unit}</span>
                        </td>
                        <td className="px-3 py-2 text-right align-top">
                          {item.descuento_item_valor ? (
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-neutral-400 line-through">${Number(item.unitPrice).toFixed(2)}</span>
                              <span className="text-sm font-semibold text-neutral-900">${Number(item.precio_unitario_final || item.unitPrice).toFixed(2)}</span>
                              <span className="text-[10px] text-green-600 font-medium">
                                -{item.descuento_item_valor}{item.descuento_item_tipo === 'porcentaje' ? '%' : '$'}
                              </span>
                            </div>
                          ) : (
                            <span>${Number(item.unitPrice).toFixed(2)}</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right font-medium align-top">${Number(item.subtotal).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-neutral-50 text-sm">
                    <tr>
                      <td colSpan={3} className="px-3 py-2 text-right text-neutral-600">Subtotal</td>
                      <td className="px-3 py-2 text-right text-neutral-600">
                        {/* Calculate simplistic subtotal from items sum to show correct flow */}
                        ${selectedPedido.items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)}
                      </td>
                    </tr>
                    {selectedPedido.descuento_pedido_valor && (
                      <tr>
                        <td colSpan={3} className="px-3 py-2 text-right text-green-600 font-medium">
                          Descuento Global ({selectedPedido.descuento_pedido_tipo === 'porcentaje' ? `${selectedPedido.descuento_pedido_valor}%` : `$${selectedPedido.descuento_pedido_valor}`})
                        </td>
                        <td className="px-3 py-2 text-right text-green-600 font-medium">
                          -${Number(selectedPedido.descuento_pedido_tipo === 'porcentaje'
                            ? (selectedPedido.items.reduce((sum, i) => sum + Number(i.subtotal), 0) * (Number(selectedPedido.descuento_pedido_valor) / 100))
                            : selectedPedido.descuento_pedido_valor
                          ).toFixed(2)}
                        </td>
                      </tr>
                    )}
                    <tr className="border-t border-neutral-200 font-bold text-neutral-900 bg-neutral-100">
                      <td colSpan={3} className="px-3 py-2 text-right">Total Final</td>
                      <td className="px-3 py-2 text-right">${Number(selectedPedido.totalAmount).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal >


    </div >
  )
}
