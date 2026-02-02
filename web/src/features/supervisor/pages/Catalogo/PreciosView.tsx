import { useState, useEffect } from 'react'
import { PlusCircle, Tag } from 'components/ui/Icons'
import { Alert } from 'components/ui/Alert'
import { LoadingSpinner } from 'components/ui/LoadingSpinner'
import { NotificationStack } from 'components/ui/NotificationStack'
import { useModal } from '../../../../hooks/useModal'
import { useNotification } from '../../../../hooks/useNotification'
import { getAllSkus, type CatalogSku } from '../../services/skusApi'
import { createPrice, getCurrentPrice, getPriceHistory, type CatalogSkuPrice } from '../../services/preciosApi'
import { PrecioFormModal } from './precios/PrecioFormModal'
import { PrecioDetailModal } from './precios/PrecioDetailModal'

export function PreciosView() {
  const [skus, setSkus] = useState<any[]>([])
  const [skusWithPrices, setSkusWithPrices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [detailedItem, setDetailedItem] = useState<any | null>(null)
  const [priceHistory, setPriceHistory] = useState<CatalogSkuPrice[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const modal = useModal<CatalogSkuPrice>()
  const { notifications, success, error: notifyError, remove: removeNotification } = useNotification()

  const loadData = async () => {
    try {
      setIsLoading(true)
      const skusData = await getAllSkus()
      setSkus(skusData)

      const prices = await Promise.all(
        skusData.map(async (sku) => {
          try {
            const priceInfo = await getCurrentPrice(sku.id)
            return { ...sku, currentPrice: priceInfo }
          } catch {
            return { ...sku, currentPrice: null }
          }
        })
      )
      setSkusWithPrices(prices)
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos de precios')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    const { skuId, ...payload } = data
    try {
      await createPrice(skuId, payload)
      success('Precio registrado exitosamente')
      modal.close()
      loadData()
    } catch (err: any) {
      notifyError(err.message || 'Error al registrar el precio')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenDetail = async (item: any) => {
    setDetailedItem(item)
    setIsDetailOpen(true)
    setIsLoadingHistory(true)
    try {
      const history = await getPriceHistory(item.id)
      setPriceHistory(history)
    } catch (err) {
    } finally {
      setIsLoadingHistory(false)
    }
  }

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>

  return (
    <div className="space-y-6">
      <NotificationStack notifications={notifications} onRemove={removeNotification} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Precios de Catálogo</h2>
          <p className="mt-1 text-sm text-neutral-600">Administra los precios vigentes de tus presentaciones (SKUs)</p>
        </div>
        <button
          onClick={modal.openCreate}
          className="flex items-center gap-2 bg-brand-red text-white hover:bg-brand-red/90 px-4 py-2 rounded-xl font-semibold transition shadow-md"
        >
          <PlusCircle className="h-4 w-4" />
          Crear precios
        </button>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/50">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">SKU</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">PRESENTACIÓN</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">PRODUCTO BASE</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">PRECIO VIGENTE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {skusWithPrices.map((item) => (
              <tr
                key={item.id}
                onClick={() => handleOpenDetail(item)}
                className="group cursor-pointer transition hover:bg-neutral-50/80"
              >
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-bold text-neutral-700">
                    {item.codigo_sku}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-neutral-900">{item.nombre}</td>
                <td className="px-6 py-4 text-neutral-600 text-sm">
                  <div className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {item.producto?.nombre || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-bold text-brand-red">
                  {item.currentPrice ? `${item.currentPrice.moneda} ${Number(item.currentPrice.precio).toFixed(2)}` : 'No asignado'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PrecioFormModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        onSubmit={handleSubmit}
        editingItem={modal.editingItem}
        isEditing={modal.isEditing}
        skus={skus}
        isSubmitting={isSubmitting}
      />

      <PrecioDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        item={detailedItem}
        history={priceHistory}
        isLoadingHistory={isLoadingHistory}
        onUpdate={(skuId) => {
          // Open the create/update modal for this skuId
          modal.openCreate()
          // Optionally pre-select the SKU in the form modal
          // For now, modal.openCreate doesn't take params but we could adjust it
        }}
      />
    </div>
  )
}