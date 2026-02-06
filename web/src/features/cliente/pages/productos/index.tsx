import { useState, useEffect, useMemo, useCallback } from 'react'
import { Search, Filter, Package } from 'components/ui/Icons'
import { useCart } from '../../cart/CartContext'
import { SkeletonCard } from 'components/ui/LoadingSpinner'
import { Alert } from 'components/ui/Alert'
import { SectionHeader } from 'components/ui/SectionHeader'
import { ProductCard } from 'components/ui/ProductCard'
import ProductDetailModal from '../../components/ProductDetailModal'
import { CartQuickAction } from '../../components/CartQuickAction'
import { PageHero } from 'components/ui/PageHero'
import { Producto, SucursalCliente } from '../../types' // Ensure types are correct
import { getAllProducts } from '../../../supervisor/services/productosApi'
import { getAllCategories } from '../../../supervisor/services/catalogApi'
import SkuSelectionModal from '../../components/SkuSelectionModal'
import { EmptyContent } from 'components/ui/EmptyContent'

interface FiltrosProductos {
    category: string
    minPrice: number
    maxPrice: number
    inStock: boolean
}

export default function PaginaProductos() {
    const { addItem } = useCart()
    const [cargando, setCargando] = useState(true)
    const [productos, setProductos] = useState<Producto[]>([])
    const [error, setError] = useState<string | null>(null)

    const [busqueda, setBusqueda] = useState('')
    const [filtros, setFiltros] = useState<FiltrosProductos>({
        category: 'all',
        minPrice: 0,
        maxPrice: 100000,
        inStock: false,
    })
    const [mostrarFiltros, setMostrarFiltros] = useState(false)
    const [categoryId, setCategoryId] = useState('')
    const [categories, setCategories] = useState<{ id: number; nombre: string }[]>([])

    // Modal states
    const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [productForSkuSelection, setProductForSkuSelection] = useState<Producto | null>(null)

    // Map Backend Product to Frontend 
    const mapProductToFrontend = useCallback((items: any[]): Producto[] => {
        return items.map((p) => {
            const anyP = p as any

            // Si el producto tiene SKUs, tomamos el precio del primero como referencia
            const firstSku = p.skus && p.skus.length > 0 ? p.skus[0] : null
            const firstSkuPrice = firstSku?.precios && firstSku.precios.length > 0 ? firstSku.precios[0].precio : null

            const rawBase = firstSkuPrice ?? anyP.precio_final ?? anyP.precio_unitario ?? anyP.precio_lista ?? anyP.precio_base ?? anyP.precio ?? anyP.price ?? anyP.precioBase ?? null
            const rawOferta = anyP.precio_oferta ?? null
            const precioBase = typeof rawBase === 'string' ? Number(rawBase) : rawBase
            const precioOferta = typeof rawOferta === 'string' ? Number(rawOferta) : rawOferta
            const price = (precioOferta ?? precioBase ?? 0) as number

            return {
                id: p.id,
                name: p.nombre,
                description: p.descripcion || '',
                price,
                precio_original: typeof precioBase === 'number' && precioOferta != null ? precioBase : (typeof anyP.precio_original === 'number' ? anyP.precio_original : undefined),
                precio_oferta: typeof precioOferta === 'number' ? precioOferta : undefined,
                promociones: anyP.promociones || undefined,
                image: p.img_url || p.imagen_url || '',
                category: p.categoria?.nombre || '',
                inStock: p.activo !== false,
                skus: (p.skus || []).map((s: any) => ({
                    ...s,
                    sku: s.codigo_sku || s.sku || '',
                    presentacion: s.nombre || s.presentacion || '',
                    precios: s.precios || []
                })),
            }
        })
    }, [])

    useEffect(() => {
        const cargarDatos = async () => {
            setCargando(true)
            setError(null)
            try {
                const [prods, cats] = await Promise.all([
                    getAllProducts(),
                    getAllCategories()
                ])
                setProductos(mapProductToFrontend(prods))
                setCategories(cats.map(c => ({ id: Number(c.id), nombre: c.nombre })))
            } catch (err) {
                setError("No se pudieron cargar los productos. Por favor intente más tarde.")
            } finally {
                setCargando(false)
            }
        }
        cargarDatos()
    }, [mapProductToFrontend])

    const productosFiltrados = useMemo(() => {
        return productos.filter(producto => {
            const coincideBusqueda =
                producto.name?.toLowerCase().includes(busqueda.toLowerCase()) ||
                (producto.description || '').toLowerCase().includes(busqueda.toLowerCase())
            const coincideCategoria = filtros.category === 'all' || producto.category === filtros.category
            const coincidePrecio = producto.price >= filtros.minPrice && producto.price <= filtros.maxPrice
            const coincideStock = !filtros.inStock || producto.inStock

            return coincideBusqueda && coincideCategoria && coincidePrecio && coincideStock
        })
    }, [busqueda, filtros.category, filtros.inStock, filtros.maxPrice, filtros.minPrice, productos])

    const openDetail = (producto: Producto) => {
        setSelectedProducto(producto)
        setIsDetailOpen(true)
    }

    const closeDetail = () => {
        setIsDetailOpen(false)
        setSelectedProducto(null)
    }

    // Add to Cart Logic with SKU handling
    const handleAddToCart = (producto: Producto) => {
        if (!producto.skus || producto.skus.length === 0) {
            alert('Este producto no tiene presentaciones disponibles. Contacta a soporte o verifica el catálogo.')
            return
        }
        if (producto.skus.length > 1) {
            setProductForSkuSelection(producto)
        } else {
            const sku = producto.skus && producto.skus.length === 1 ? producto.skus[0] : null
            confirmSkuSelection(producto, sku)
        }
    }

    const confirmSkuSelection = (producto: Producto, sku: any) => {
        try {
            if (!sku) {
                alert('Debes seleccionar una presentación válida para continuar.')
                return
            }
            const cartProduct = { ...producto }
            let skuId = undefined
            let skuCode = undefined
            let presentacion = undefined

            if (sku) {
                // Determine price from SKU
                const skuPrice = sku.precios && sku.precios.length > 0 ? sku.precios[0].precio : producto.price
                cartProduct.price = Number(skuPrice)

                // Add metadata
                skuId = sku.id
                skuCode = sku.sku
                presentacion = sku.presentacion

                // Update name for display if desired, or let cart list handle it via metadata
                // cartProduct.name = `${producto.name} (${sku.presentacion})`
            }

            addItem({
                id: cartProduct.id,
                name: cartProduct.name,
                unitPrice: cartProduct.price,
                quantity: 1,
                selectedSkuId: skuId,
                skuCode: skuCode,
                presentacion: presentacion
            })
            setProductForSkuSelection(null)
        } catch (error) {
        }
    }

    return (
        <div className="space-y-6">
            <PageHero
                title="Catálogo de Productos"
                subtitle="Explora nuestras opciones, filtra por categoría y agrega productos a tu carrito"
                chips={['Productos disponibles', 'Filtros por categoría', 'Información nutricional']}
            />
            {error && <Alert type="error" title="Error" message={error} />}

            <SectionHeader title="Nuestros Productos" subtitle="Explora nuestro catálogo de embutidos premium" />

            {/* Filters UI */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-red-500"
                    />
                </div>
                <button
                    onClick={() => setMostrarFiltros(!mostrarFiltros)}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 transition hover:bg-gray-50"
                >
                    <Filter size={20} />
                    <span>Filtros</span>
                </button>
            </div>

            {mostrarFiltros && (
                <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Categoría</label>
                        <select
                            value={categoryId || 'all'}
                            onChange={e => {
                                const val = e.target.value
                                if (val === 'all') {
                                    setCategoryId('')
                                    setFiltros({ ...filtros, category: 'all' })
                                    return
                                }
                                setCategoryId(val)
                                const idNum = Number(val)
                                const found = categories.find(c => c.id === idNum)
                                setFiltros({ ...filtros, category: found ? found.nombre : 'all' })
                            }}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-500"
                        >
                            <option value="all">Todas las categorías</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={String(cat.id)}>
                                    {cat.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Precio: ${filtros.minPrice} - ${filtros.maxPrice}
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="500"
                            step="10"
                            value={filtros.maxPrice}
                            onChange={e => setFiltros({ ...filtros, maxPrice: parseInt(e.target.value, 10) })}
                            className="w-full"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="inStock"
                            checked={filtros.inStock}
                            onChange={e => setFiltros({ ...filtros, inStock: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <label htmlFor="inStock" className="text-sm text-gray-700">
                            Solo productos disponibles
                        </label>
                    </div>

                    <button
                        onClick={() => setMostrarFiltros(false)}
                        className="w-full rounded-lg bg-gray-200 px-4 py-2 text-sm transition hover:bg-gray-300"
                    >
                        Cerrar Filtros
                    </button>
                </div>
            )}

            <div className="text-sm text-gray-600">
                Mostrando <span className="font-semibold">{productosFiltrados.length}</span> productos
            </div>

            {cargando ? (
                <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            ) : productosFiltrados.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {productosFiltrados.map(producto => (
                            <ProductCard
                                key={producto.id}
                                producto={producto}
                                onAddToCart={() => handleAddToCart(producto)}
                                onView={openDetail}
                            />
                        ))}
                    </div>
                </>
            ) : (
                <EmptyContent
                    icon={<Package className="h-16 w-16" />}
                    title="No hay productos"
                    description="No se encontraron productos con los filtros seleccionados."
                />
            )}

            <ProductDetailModal
                isOpen={isDetailOpen}
                producto={selectedProducto}
                onClose={closeDetail}
                onAddToCart={() => selectedProducto && handleAddToCart(selectedProducto)}
            />

            {productForSkuSelection && (
                <SkuSelectionModal
                    producto={productForSkuSelection}
                    isOpen={!!productForSkuSelection}
                    onClose={() => setProductForSkuSelection(null)}
                    onConfirm={(sku) => confirmSkuSelection(productForSkuSelection, sku)}
                />
            )}

            <CartQuickAction />
        </div>
    )
}
