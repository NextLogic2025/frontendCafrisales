import { EntityFormModal, type Field } from '../../../../../components/ui/EntityFormModal'
import type { Category, CreateCategoryDto } from '../../../services/catalogApi'

interface CategoriaFormModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: Category
  onSubmit: (data: CreateCategoryDto) => Promise<void>
  isEditing: boolean
}

const fields: Field[] = [
  { name: 'nombre', label: 'Nombre', required: true, placeholder: 'Ej. Bebidas' },
  { name: 'slug', label: 'Slug', required: true, placeholder: 'bebidas' },
  { name: 'descripcion', label: 'Descripcion', type: 'textarea', placeholder: 'Describe la categoria' },
  { name: 'img_url', label: 'Imagen', type: 'file' },
]

export function CategoriaFormModal({ isOpen, onClose, initialData, onSubmit, isEditing }: CategoriaFormModalProps) {
  // Adaptar el objeto recibido (Category) a CreateCategoryDto para evitar problemas de null/undefined
  const handleSubmit = async (data: any) => {
    const dto: CreateCategoryDto = {
      nombre: data.nombre,
      slug: data.slug,
      descripcion: data.descripcion || undefined,
      img_url: data.img_url || undefined,
    }
    await onSubmit(dto)
  }
  return (
    <EntityFormModal<Category>
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Categoría' : 'Crear Categoría'}
      fields={fields}
      initialData={initialData}
      onSubmit={handleSubmit}
      headerGradient="red"
      subtitle="Define el nombre y la descripcion de la categoria."
    />
  )
}
