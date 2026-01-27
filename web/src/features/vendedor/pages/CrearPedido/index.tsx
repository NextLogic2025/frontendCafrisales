
import { PageHero } from '../../../../components/ui/PageHero'
import { SectionHeader } from '../../../../components/ui/SectionHeader'
import { Alert } from '../../../../components/ui/Alert'
import { useCrearPedido } from './hooks/useCrearPedido'
import { CartItemList } from './components/CartItemList'
import { OrderSummary } from './components/OrderSummary'
import { ClientSelector } from './components/ClientSelector'
import { AprobarCreditoModal } from './components/AprobarCreditoModal'

export default function VendedorCrearPedido() {
  const {
    cart,
    error,
    setError,
    clearCart,
    updateQuantity,
    removeItem,
    totalItems,
    total,
    condicionPagoManual,
    setCondicionPagoManual,
    clienteDetalle,
    goBackToProducts,
    handleSubmitOrder,
    isSubmitting,
    busquedaCliente,
    setBusquedaCliente,
    clientesFiltrados,
    clienteSeleccionado,
    setClienteSeleccionado,
    isLoadingClientes,
    isCreditoModalOpen,
    setIsCreditoModalOpen,
    handleConfirmCredito,
    plazoDias,
    notasCredito,
  } = useCrearPedido()

  return (
    <div className="space-y-6">
      <PageHero
        title="Crear Pedido"
        subtitle="Gestión de pedidos para clientes"
        chips={[
          { label: 'Módulo principal', variant: 'red' },
          { label: 'Gestión comercial', variant: 'blue' },
        ]}
      />

      <div className="space-y-4">
        {error && (
          <Alert
            type="error"
            title="Error"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        <ClientSelector
          busqueda={busquedaCliente}
          onBusquedaChange={setBusquedaCliente}
          clientesFiltrados={clientesFiltrados}
          clienteSeleccionado={clienteSeleccionado}
          onSelect={setClienteSeleccionado}
          isLoading={isLoadingClientes}
        />
      </div>

      <div className="space-y-4">
        <SectionHeader
          title="Carrito de compras"
          rightSlot={
            cart.length > 0 ? (
              <button
                type="button"
                onClick={clearCart}
                className="text-sm font-semibold text-brand-red underline-offset-2 hover:underline"
              >
                Vaciar carrito
              </button>
            ) : null
          }
        />

        <div className="grid gap-4 lg:grid-cols-3 items-start">
          <CartItemList
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />

          {cart.length > 0 && (
            <OrderSummary
              totalItems={totalItems}
              total={total}
              condicionPagoManual={condicionPagoManual}
              setCondicionPagoManual={setCondicionPagoManual}
              clienteDetalle={clienteDetalle}
              onGoBack={goBackToProducts}
              onSubmit={handleSubmitOrder}
              isSubmitting={isSubmitting}
              isCartEmpty={cart.length === 0}
            />
          )}
        </div>
      </div>
      <AprobarCreditoModal
        isOpen={isCreditoModalOpen}
        onClose={() => setIsCreditoModalOpen(false)}
        onConfirm={handleConfirmCredito}
        initialPlazo={plazoDias}
        initialNotas={notasCredito}
      />
    </div>
  )
}
