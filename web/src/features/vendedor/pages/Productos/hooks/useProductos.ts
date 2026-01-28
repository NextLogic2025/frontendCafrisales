
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FiltrosState, Category, CartItem, Producto } from '../types'
import { getAllProducts } from '../../../../supervisor/services/productosApi'
import { getAllCategories } from '../../../../supervisor/services/catalogApi'

export const useProductos = () => {
    const navigate = useNavigate()
    const [productos, setProductos] = useState<Producto[]>([])
    const [loading, setLoading] = useState(true)
    const [busqueda, setBusqueda] = useState('')
    const [mostrarFiltros, setMostrarFiltros] = useState(false)
    const [categoryId, setCategoryId] = useState<string>('')
    const [filtros, setFiltros] = useState<FiltrosState>({ category: 'all', minPrice: 0, maxPrice: 10000, inStock: true })
    const [categories, setCategories] = useState<Category[]>([])

    const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)

    const [cart, setCart] = useState<CartItem[]>([])

    const [showToast, setShowToast] = useState(false)
    const [lastAddedProduct, setLastAddedProduct] = useState<Producto | null>(null)

    const [productForSkuSelection, setProductForSkuSelection] = useState<Producto | null>(null)

    // Función de mapeo unificada
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

    // Cargar productos y categorías
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true)
                const [productsData, categoriesData] = await Promise.all([
                    getAllProducts(),
                    getAllCategories()
                ])
                setProductos(mapProductToFrontend(productsData))
                setCategories(categoriesData as any[])
            } catch (err) {
                console.error('Error cargando catálogo:', err)
            } finally {
                setLoading(false)
            }
        }

        loadInitialData()
    }, [mapProductToFrontend])

    // Filtrado
    const productosFiltrados = useMemo(
        () =>
            productos.filter(producto => {
                const coincideBusqueda =
                    producto.name.toLowerCase().includes(busqueda.toLowerCase()) ||
                    producto.description.toLowerCase().includes(busqueda.toLowerCase())
                const coincideCategoria = filtros.category === 'all' || producto.category === filtros.category
                const coincidePrecio = producto.price >= filtros.minPrice && producto.price <= filtros.maxPrice
                const coincideStock = !filtros.inStock || producto.inStock
                return coincideBusqueda && coincideCategoria && coincidePrecio && coincideStock
            }),
        [busqueda, filtros.category, filtros.inStock, filtros.maxPrice, filtros.minPrice, productos],
    )

    const openDetail = (producto: Producto) => {
        setSelectedProducto(producto)
        setIsDetailOpen(true)
    }

    const closeDetail = () => {
        setIsDetailOpen(false)
        setSelectedProducto(null)
    }

    const addToCart = async (producto: Producto) => {
        if (producto.skus && producto.skus.length > 1) {
            setProductForSkuSelection(producto)
        } else {
            const sku = producto.skus && producto.skus.length === 1 ? producto.skus[0] : null
            confirmSkuSelection(producto, sku)
        }
    }

    const confirmSkuSelection = (producto: Producto, sku: any) => {
        try {
            const cartProduct = { ...producto }
            if (sku) {
                // Determine price from SKU
                const skuPrice = sku.precios && sku.precios.length > 0 ? sku.precios[0].precio : producto.price
                cartProduct.price = Number(skuPrice)
                // Add metadata for presentation
                if (sku.presentacion) {
                    cartProduct.name = `${producto.name} (${sku.presentacion})`
                }
                // Store SKU ID for backend consistency if needed
                ; (cartProduct as any).selectedSkuId = sku.id;
                (cartProduct as any).skuCode = sku.sku
            }

            const existingItem = cart.find(item => {
                const sameProd = item.producto.id === producto.id
                const sameSku = (item.producto as any).selectedSkuId === (cartProduct as any).selectedSkuId
                return sameProd && sameSku
            })

            let updatedCart: CartItem[]
            if (existingItem) {
                updatedCart = cart.map(item => {
                    const sameProd = item.producto.id === producto.id
                    const sameSku = (item.producto as any).selectedSkuId === (cartProduct as any).selectedSkuId
                    return sameProd && sameSku ? { ...item, cantidad: item.cantidad + 1 } : item
                })
            } else {
                updatedCart = [...cart, { producto: cartProduct, cantidad: 1 }]
            }

            setCart(updatedCart)
            localStorage.setItem('vendedor_cart', JSON.stringify(updatedCart))
            setProductForSkuSelection(null)

            // Show toast instead of navigating
            setLastAddedProduct(cartProduct)
            setShowToast(true)

            // navigate('/vendedor/crear-pedido') 
        } catch (error) {
            console.error('Error adding to cart:', error)
            alert('Error al agregar producto al carrito')
        }
    }


    const goToCrearPedido = () => {
        localStorage.setItem('vendedor_cart', JSON.stringify(cart))
        navigate('/vendedor/crear-pedido')
    }

    // Cargar/Guardar localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('vendedor_cart')
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart))
            } catch (e) { }
        }
    }, [])

    useEffect(() => {
        if (cart.length > 0) {
            localStorage.setItem('vendedor_cart', JSON.stringify(cart))
        }
    }, [cart])

    return {
        productos,
        productosFiltrados,
        loading,
        busqueda,
        setBusqueda,
        mostrarFiltros,
        setMostrarFiltros,
        filtros,
        setFiltros,
        categories,
        categoryId,
        setCategoryId,
        selectedProducto,
        isDetailOpen,
        openDetail,
        closeDetail,
        cart,
        setCart,
        showToast,
        setShowToast,
        lastAddedProduct,
        addToCart,
        goToCrearPedido,
        productForSkuSelection,
        setProductForSkuSelection,
        confirmSkuSelection
    }
}
