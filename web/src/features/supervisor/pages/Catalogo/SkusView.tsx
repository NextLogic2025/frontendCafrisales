import { useState, useEffect } from 'react'
import { PlusCircle, Package } from 'lucide-react'
import { Alert } from 'components/ui/Alert'
import { LoadingSpinner } from 'components/ui/LoadingSpinner'
import { NotificationStack } from 'components/ui/NotificationStack'
import { useModal } from '../../../../hooks/useModal'
import { useNotification } from '../../../../hooks/useNotification'
import { getAllProducts, type Product } from '../../services/productosApi'
import { useSkuCrud, type CatalogSku, type CreateSkuDto } from '../../services/skusApi'
import { SkuList } from './Sku/SkuList'
import { SkuFormModal } from './Sku/SkuFormModal'

export function SkusView() {
    const { data: skus, isLoading, error, create, update, delete: deleteItem, refresh } = useSkuCrud()
    const [products, setProducts] = useState<Product[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const modal = useModal<CatalogSku>()
    const { notifications, success, error: notifyError, remove: removeNotification } = useNotification()

    useEffect(() => {
        getAllProducts().then(setProducts).catch((err) => console.error('Error al cargar productos:', err))
    }, [])

    const handleSubmit = async (data: CreateSkuDto) => {
        setIsSubmitting(true)
        try {
            if (modal.editingItem) {
                await update(modal.editingItem.id, data)
                success('SKU actualizado exitosamente')
            } else {
                await create(data)
                success('SKU creado exitosamente')
            }
            modal.close()
        } catch (err: any) {
            notifyError(err.message || 'Error al guardar el SKU')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (sku: CatalogSku) => {
        if (!confirm('¿Estás seguro de eliminar este SKU?')) return
        try {
            await deleteItem(sku.id)
            success('SKU eliminado exitosamente')
        } catch (err: any) {
            notifyError(err.message || 'Error al eliminar el SKU')
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <NotificationStack notifications={notifications} onRemove={removeNotification} />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Configuración de SKUs</h2>
                    <p className="mt-1 text-sm text-neutral-600">Administra las presentaciones y unidades de venta (SKUs)</p>
                </div>
                <button
                    onClick={modal.openCreate}
                    className="flex items-center gap-2 bg-brand-red text-white hover:bg-brand-red/90 px-4 py-2 rounded-xl font-semibold transition"
                >
                    <PlusCircle className="h-4 w-4" />
                    Nuevo SKU
                </button>
            </div>

            {error && <Alert type="error" message={error} />}

            <SkuList
                skus={skus}
                products={products}
                onEdit={modal.openEdit}
                onDelete={handleDelete}
            />

            <SkuFormModal
                isOpen={modal.isOpen}
                onClose={modal.close}
                onSubmit={handleSubmit}
                editingItem={modal.editingItem}
                isEditing={modal.isEditing}
                products={products}
                isSubmitting={isSubmitting}
            />
        </div>
    )
}
