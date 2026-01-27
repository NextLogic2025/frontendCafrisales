import { EntityFormModal, type Field } from '../../../../../components/ui/EntityFormModal'
import { type CatalogSkuPrice, type CatalogPriceCreatePayload } from '../../../services/preciosApi'
import { type CatalogSku } from '../../../services/skusApi'

interface PrecioFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: any) => Promise<void>
    editingItem?: CatalogSkuPrice | null
    isEditing: boolean
    skus: CatalogSku[]
    isSubmitting: boolean
}

export function PrecioFormModal({
    isOpen,
    onClose,
    onSubmit,
    editingItem,
    isEditing,
    skus,
    isSubmitting,
}: PrecioFormModalProps) {
    const fields: Field[] = [
        {
            name: 'sku_id',
            label: 'Seleccionar SKU',
            type: 'select',
            required: true,
            options: skus.map((s: CatalogSku) => ({ value: String(s.id), label: `${s.codigo_sku} - ${s.nombre}` })),
            placeholder: 'El precio se guarda por SKU.'
        },
        { name: 'precio', label: 'Precio', type: 'number', required: true, placeholder: '0.00', step: '0.01' },
        { name: 'moneda', label: 'Moneda', disabled: true },
    ]

    const handleSubmit = async (data: any) => {
        const payload: CatalogPriceCreatePayload = {
            precio: Number(data.precio),
            moneda: 'USD',
        }
        // Note: The API expects the sku_id in the URL, but the onSubmit handler in PreciosView 
        // will receive both the payload and the sku_id.
        await onSubmit({ skuId: data.sku_id, ...payload })
    }

    return (
        <EntityFormModal<CatalogSkuPrice>
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Editar Precio' : 'Registrar precio'}
            subtitle="Ingresa el precio vigente para el SKU seleccionado."
            fields={fields}
            initialData={
                editingItem
                    ? ({
                        ...editingItem,
                        sku_id: editingItem.sku_id || '',
                        moneda: editingItem.moneda || 'USD',
                    } as any)
                    : { moneda: 'USD' }
            }
            onSubmit={handleSubmit}
            headerGradient="red"
            submitLabel={isEditing ? 'Actualizar precio' : 'Guardar precio'}
        />
    )
}
