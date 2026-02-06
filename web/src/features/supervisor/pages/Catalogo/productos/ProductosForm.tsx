import { EntityFormModal, type Field } from '../../../../../components/ui/EntityFormModal'
import { type Product, type CreateProductDto } from '../../../services/productosApi'
import { type Category } from '../../../services/catalogApi'

interface ProductosFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  editingItem?: Product | null
  isEditing: boolean
  categories: Category[]
  isSubmitting: boolean
}

export function ProductosForm({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
  isEditing,
  categories,
}: ProductosFormProps) {
  const fields: Field[] = [
    {
      name: 'categoria_id',
      label: 'Seleccionar categoria',
      type: 'select',
      required: true,
      options: categories.map((c: Category) => ({ value: String(c.id), label: c.nombre })),
      placeholder: 'Elige la categoria base del producto'
    },
    { name: 'nombre', label: 'Nombre', required: true, placeholder: 'Ej. Cola Zero' },
    { name: 'slug', label: 'Slug', required: true, placeholder: 'cola-zero' },
    { name: 'descripcion', label: 'Descripcion', type: 'textarea', placeholder: 'Describe el producto' },
    { name: 'img_url', label: 'Imagen', type: 'file' },
  ]

  const handleSubmit = async (data: any) => {
    const productData: CreateProductDto = {
      categoria_id: String(data.categoria_id),
      nombre: data.nombre,
      slug: data.slug,
      descripcion: data.descripcion || undefined,
      img_url: data.img_url || undefined,
    }
    await onSubmit(productData)
  }

  return (
    <EntityFormModal<Product>
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Producto' : 'Nuevo producto'}
      subtitle="Completa los datos principales del producto."
      fields={fields}
      initialData={
        editingItem
          ? ({
            ...editingItem,
            categoria_id: editingItem.categoria_id || editingItem.categoria?.id || '',
          } as any)
          : undefined
      }
      onSubmit={handleSubmit}
      headerGradient="red"
      submitLabel={isEditing ? 'Actualizar producto' : 'Crear producto'}
    />
  )
}
