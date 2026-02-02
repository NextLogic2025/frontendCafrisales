import { Modal } from 'components/ui/Modal'
import { Tag, Edit2, Image as ImageIcon, Code } from 'components/ui/Icons'
import type { Category } from '../../../services/catalogApi'

interface CategoriaDetailModalProps {
    isOpen: boolean
    onClose: () => void
    category: Category | null
    onEdit: (cat: Category) => void
}

export function CategoriaDetailModal({ isOpen, onClose, category, onEdit }: CategoriaDetailModalProps) {
    if (!category) return null

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Detalle Categoria">
            <div className="flex flex-col gap-6 p-1 max-h-[85vh] overflow-y-auto">
                {/* Imagen Section */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-neutral-50 border border-neutral-100 shadow-inner">
                    {category.img_url ? (
                        <img
                            src={category.img_url}
                            alt={category.nombre}
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center text-neutral-300">
                            <ImageIcon className="h-16 w-16 opacity-30" />
                            <span className="mt-3 text-sm font-medium text-neutral-400">Sin imagen</span>
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 shadow-sm border border-red-100">
                                <Tag className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-neutral-900 leading-tight">{category.nombre}</h3>
                                <p className="text-sm text-neutral-500 mt-0.5">Categoria del catalogo</p>
                            </div>
                        </div>
                        <div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
                            {category.slug}
                        </div>
                    </div>

                    <div className="pt-2">
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Descripcion</span>
                        <p className="mt-1.5 text-sm font-semibold text-neutral-800">
                            {category.descripcion || 'Sin descripción disponible'}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-neutral-50 border border-neutral-100 p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-neutral-400 uppercase">Slug</span>
                                <p className="text-base font-bold text-neutral-900">{category.slug}</p>
                            </div>
                            <div className="text-neutral-300">
                                <Code className="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action button */}
                <div className="mt-2">
                    <button
                        onClick={() => {
                            onEdit(category)
                            onClose()
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-red py-4 text-base font-bold text-white shadow-lg shadow-red-200 transition-all hover:bg-brand-red/90 active:scale-[0.98]"
                    >
                        <Edit2 className="h-5 w-5" />
                        Editar categoria
                    </button>
                </div>
            </div>
        </Modal>
    )
}
