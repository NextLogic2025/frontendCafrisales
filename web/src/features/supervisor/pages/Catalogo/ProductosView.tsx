import { useEffect, useState } from 'react'
import { PlusCircle } from 'components/ui/Icons'
import { Alert } from 'components/ui/Alert'
import { NotificationStack } from 'components/ui/NotificationStack'
import { useModal } from '../../../../hooks/useModal'
import { useNotification } from '../../../../hooks/useNotification'
import { getAllCategories, type Category } from '../../services/catalogApi'
import {
  type Product,
  type CreateProductDto,
  getProductById,
} from '../../services/productosApi'
import { useProductoCrud } from '../../services/useProductoCrud'
import { ProductosList } from './productos/ProductosList'
import { ProductosForm } from './productos/ProductosForm'
import { ProductoDetailModal } from './productos/ProductoDetailModal'

export function ProductosView() {
  const [categories, setCategories] = useState<Category[]>([])
  const { data: products, isLoading, error, create, update } = useProductoCrud()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [detailedProduct, setDetailedProduct] = useState<Product | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const modal = useModal<Product>()
  const { notifications, success, error: notifyError, remove: removeNotification } = useNotification()

  useEffect(() => {
    getAllCategories().then(setCategories).catch(() => { })
  }, [])

  const handleSubmit = async (data: CreateProductDto) => {
    setIsSubmitting(true)
    try {
      if (modal.editingItem) {
        await update(modal.editingItem.id, data)
        success('Producto actualizado exitosamente')
      } else {
        await create(data)
        success('Producto creado exitosamente')
      }
      modal.close()
    } catch (err: any) {
      notifyError(err?.message || 'Error al guardar el producto')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleView = async (product: Product) => {
    try {
      const fullProduct = await getProductById(product.id)
      setDetailedProduct(fullProduct || product)
      setIsDetailModalOpen(true)
    } catch (err: any) {
      notifyError(err?.message || 'Error al cargar detalle del producto')
    }
  }

  return (
    <div className="space-y-6">
      <NotificationStack notifications={notifications} onRemove={removeNotification} />

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Productos</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Administra el catalogo de productos
          </p>
        </div>
        <button
          onClick={modal.openCreate}
          className="flex items-center gap-2 bg-brand-red text-white hover:bg-brand-red/90 px-4 py-2 rounded-lg font-semibold transition"
        >
          <PlusCircle className="h-4 w-4" />
          Nuevo producto
        </button>
      </div>

      {error && <Alert type="error" message={error} />}

      <ProductosList
        products={products}
        categories={categories}
        isLoading={isLoading}
        onEdit={modal.openEdit}
        onView={handleView}
      />

      <ProductosForm
        isOpen={modal.isOpen}
        onClose={modal.close}
        onSubmit={handleSubmit}
        editingItem={modal.editingItem}
        isEditing={modal.isEditing}
        categories={categories}
        isSubmitting={isSubmitting}
      />

      <ProductoDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        product={detailedProduct}
        onEdit={modal.openEdit}
      />
    </div>
  )
}
