import { Modal } from 'components/ui/Modal'
import { Package, Tag, Info, List, Edit2, Image as ImageIcon, ScanBarcode } from 'lucide-react'
import { type Product } from '../../../services/productosApi'
import { StatusBadge } from 'components/ui/StatusBadge'

interface ProductoDetailModalProps {
    isOpen: boolean
    onClose: () => void
    product: Product | null
    onEdit: (product: Product) => void
}

export function ProductoDetailModal({ isOpen, onClose, product, onEdit }: ProductoDetailModalProps) {
    if (!product) return null

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Detalle Producto">
            <div className="flex flex-col gap-6 p-1 max-h-[85vh] overflow-y-auto">
                {/* Imagen Section */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-neutral-50 border border-neutral-100 shadow-inner">
                    {product.img_url ? (
                        <img
                            src={product.img_url}
                            alt={product.nombre}
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center text-neutral-300">
                            <ImageIcon className="h-16 w-16 opacity-30" />
                            <span className="mt-3 text-sm font-medium">Sin imagen</span>
                        </div>
                    )}
                </div>

                {/* Info Card Section */}
                <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 shadow-sm">
                                <Package className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-neutral-900 leading-tight">{product.nombre}</h3>
                                <p className="text-sm text-neutral-500">Producto del catálogo</p>
                            </div>
                        </div>
                        <div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
                            {product.slug}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-neutral-100 pt-4">
                        <div>
                            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Categoría</span>
                            <p className="mt-0.5 font-semibold text-neutral-800">
                                {product.categoria?.nombre || 'General'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Estado</span>
                            <div className="mt-0.5">
                                <StatusBadge variant={product.activo ? 'success' : 'neutral'}>
                                    {product.activo ? 'Activo' : 'Inactivo'}
                                </StatusBadge>
                            </div>
                        </div>
                    </div>

                    <div>
                        <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Descripción</span>
                        <p className="mt-1 text-sm font-semibold text-neutral-800">
                            {product.descripcion || 'Sin descripción disponible'}
                        </p>
                    </div>

                    {/* SKU Summary box */}
                    <div className="flex items-center justify-between rounded-xl bg-neutral-50 border border-neutral-100 p-4">
                        <div className="space-y-0.5">
                            <span className="text-xs font-medium text-neutral-400">SKUs asociados</span>
                            <p className="text-xl font-bold text-neutral-900 leading-none">{product.skus?.length || 0}</p>
                        </div>
                        <div className="text-neutral-300">
                            <ScanBarcode className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                {/* Detalle de SKUs Section */}
                <div className="space-y-3">
                    <h4 className="text-sm font-bold text-neutral-900">Detalle de SKUs</h4>
                    <div className="space-y-3">
                        {product.skus && product.skus.length > 0 ? (
                            product.skus.map((sku) => {
                                const currentPrice = sku.precios?.[0]; // Taking the first one as current for now
                                return (
                                    <div key={sku.id} className="group relative rounded-2xl border border-neutral-200 bg-white p-4 transition-all hover:border-red-200 hover:shadow-sm">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <h5 className="font-bold text-neutral-900">{sku.nombre}</h5>
                                                <p className="text-xs font-medium text-neutral-400"> {sku.codigo_sku}</p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <div className="rounded-lg bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                                                        {sku.nombre}
                                                    </div>
                                                    {currentPrice && (
                                                        <div className="rounded-lg bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">
                                                            {currentPrice.moneda} {Number(currentPrice.precio).toFixed(2)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50 text-neutral-400 transition-colors group-hover:bg-red-50 group-hover:text-red-500">
                                                <ScanBarcode className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="rounded-xl border border-dashed border-neutral-200 py-6 text-center">
                                <p className="text-sm text-neutral-500">No hay SKUs asociados a este producto</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions Section */}
                <div className="mt-4 pt-4 border-t border-neutral-100">
                    <button
                        onClick={() => {
                            onEdit(product)
                            onClose()
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-red py-3.5 text-base font-bold text-white shadow-lg shadow-red-200 transition-all hover:bg-brand-red/90 hover:shadow-red-300 active:scale-[0.98]"
                    >
                        <Edit2 className="h-5 w-5" />
                        Editar producto
                    </button>
                </div>
            </div>
        </Modal>
    )
}
