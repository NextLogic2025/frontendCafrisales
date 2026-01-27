import { EntityFormModal, type Field } from '../../../../../components/ui/EntityFormModal'
import { type CatalogSku, type CreateSkuDto } from '../../../services/skusApi'
import { type Product } from '../../../services/productosApi'

interface SkuFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: any) => Promise<void>
    editingItem?: CatalogSku | null
    isEditing: boolean
    products: Product[]
    isSubmitting: boolean
}

export function SkuFormModal({
    isOpen,
    onClose,
    onSubmit,
    editingItem,
    isEditing,
    products,
    isSubmitting,
}: SkuFormModalProps) {
    const fields: Field[] = [
        {
            name: 'producto_id',
            label: 'Seleccionar producto base',
            type: 'select',
            required: true,
            options: products.map((p: Product) => ({ value: String(p.id), label: p.nombre })),
            placeholder: 'Elige el producto al que pertenece este SKU'
        },
        { name: 'codigo_sku', label: 'Código SKU', required: true, placeholder: 'Ej: 001', prefix: 'SKU-' },
        { name: 'nombre', label: 'Nombre de presentación', required: true, placeholder: 'Ej: Lomo fino 500g' },
        { name: 'peso_gramos', label: 'Peso en gramos', type: 'number', required: true, placeholder: 'Ej: 500' },
    ]

    const handleSubmit = async (data: any) => {
        const skuData: CreateSkuDto = {
            producto_id: String(data.producto_id),
            codigo_sku: `SKU-${data.codigo_sku}`,
            nombre: data.nombre,
            peso_gramos: Number(data.peso_gramos),
        }
        await onSubmit(skuData)
    }

    return (
        <EntityFormModal<CatalogSku>
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Editar SKU' : 'Nuevo SKU'}
            subtitle="Define la presentación comercial y peso del SKU."
            fields={fields}
            initialData={
                editingItem
                    ? ({
                        ...editingItem,
                        producto_id: editingItem.producto_id || editingItem.producto?.id || '',
                        codigo_sku: editingItem.codigo_sku.startsWith('SKU-')
                            ? editingItem.codigo_sku.replace('SKU-', '')
                            : editingItem.codigo_sku,
                    } as any)
                    : undefined
            }
            onSubmit={handleSubmit}
            headerGradient="red"
            submitLabel={isEditing ? 'Actualizar SKU' : 'Crear SKU'}
        />
    )
}
