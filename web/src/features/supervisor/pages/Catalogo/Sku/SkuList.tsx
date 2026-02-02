import { useState, useMemo } from 'react'
import { Package, Search, Pencil, Trash2, Tag } from 'components/ui/Icons'
import { CardGrid } from 'components/ui/CardGrid'
import { type CatalogSku } from '../../../services/skusApi'
import { type Product } from '../../../services/productosApi'

interface SkuListProps {
    skus: CatalogSku[]
    products: Product[]
    onEdit?: (sku: CatalogSku) => void
    onDelete?: (sku: CatalogSku) => void
}

export function SkuList({ skus, products, onEdit, onDelete }: SkuListProps) {
    const [searchTerm, setSearchTerm] = useState('')

    const productNameById = useMemo(() => {
        const map = new Map<string, string>()
        products.forEach((p) => map.set(String(p.id), p.nombre))
        return map
    }, [products])

    const filteredSkus = useMemo(() => {
        return skus.filter((sku) => {
            const productName = productNameById.get(String(sku.producto_id || sku.producto?.id)) || ''
            return (
                sku.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sku.codigo_sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                productName.toLowerCase().includes(searchTerm.toLowerCase())
            )
        })
    }, [skus, searchTerm, productNameById])

    if (skus.length === 0) {
        return (
            <div className="rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-200">
                    <Package className="h-8 w-8 text-neutral-500" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-neutral-900">No hay SKUs configurados</h3>
                <p className="mt-2 text-sm text-neutral-600">Comienza creando tu primer SKU asociado a un producto</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                    type="text"
                    placeholder="Buscar por nombre, SKU o producto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand-red/60 focus:ring-4 focus:ring-brand-red/10"
                />
            </div>

            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-neutral-100 bg-neutral-50/50">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">CÓDIGO SKU</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">NOMBRE PRESENTACIÓN</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">PRODUCTO BASE</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 text-center">PESO (G)</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {filteredSkus.map((sku) => {
                            const productName = productNameById.get(String(sku.producto_id || sku.producto?.id)) || 'Cargando producto...'
                            return (
                                <tr key={sku.id} className="group transition hover:bg-neutral-50/80">
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-bold text-neutral-700">
                                            {sku.codigo_sku}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-neutral-900">{sku.nombre}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                                            <Tag className="h-3.5 w-3.5" />
                                            {productName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm font-medium text-neutral-700">{sku.peso_gramos}g</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 text-red-600">
                                            <button
                                                onClick={() => onEdit?.(sku)}
                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition hover:border-brand-red hover:bg-brand-red hover:text-white"
                                                title="Editar presentación"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => onDelete?.(sku)}
                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white"
                                                title="Eliminar presentación"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
