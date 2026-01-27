
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Cliente } from '../../../../supervisor/services/clientesApi'
import type { Producto, FiltrosState, Category, CartItem } from '../types'

export const useProductos = () => {
    const navigate = useNavigate()
    const [productos, setProductos] = useState<Producto[]>([])
    const [loading, setLoading] = useState(true)
    const [busqueda, setBusqueda] = useState('')
    const [mostrarFiltros, setMostrarFiltros] = useState(false)
    const [categoryId, setCategoryId] = useState<string>('')
    const [filtros, setFiltros] = useState<FiltrosState>({ category: 'all', minPrice: 0, maxPrice: 10000, inStock: true })
    const [categories, setCategories] = useState<Category[]>([])

    const [clientes, setClientes] = useState<Cliente[]>([])
    const [clienteSeleccionado, setClienteSeleccionado] = useState<string>('')
    const [loadingClientes, setLoadingClientes] = useState(true)

    const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)

    const [cart, setCart] = useState<CartItem[]>([])

    const [showToast, setShowToast] = useState(false)
    const [lastAddedProduct, setLastAddedProduct] = useState<Producto | null>(null)

    // Función de mapeo unificada
    const mapProductToFrontend = useCallback((items: any[]): Producto[] => {
        return items.map((p) => {
            const anyP = p as any
            const rawBase = anyP.precio_final ?? anyP.precio_unitario ?? anyP.precio_lista ?? anyP.precio_base ?? anyP.precio ?? anyP.price ?? anyP.precioBase ?? null
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
                image: p.imagen_url || '',
                category: p.categoria?.nombre || '',
                inStock: p.activo,
                rating: 0,
                reviews: 0,
            }
        })
    }, [])

    // Cargar clientes asignados
    useEffect(() => {
        setClientes([])
        setLoadingClientes(false)
    }, [])

    // Cargar productos
    useEffect(() => {
        setLoading(false)
        setProductos([])
    }, [clienteSeleccionado, mapProductToFrontend])

    // Cargar categorías
    useEffect(() => {
        setCategories([])
    }, [])

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
        if (!clienteSeleccionado) {
            alert('Debe seleccionar un cliente primero')
            return
        }

        try {
            const existingItem = cart.find(item => item.producto.id === producto.id)
            const newQuantity = existingItem ? existingItem.cantidad + 1 : 1

            console.log('Adding to cart:', {
                productoId: producto.id,
                existingQuantity: existingItem?.cantidad || 0,
                newQuantity
            })

            // Backend call removed.
            // await httpOrders...

            setCart(prev => {
                const existing = prev.find(item => item.producto.id === producto.id)
                if (existing) {
                    return prev.map(item =>
                        item.producto.id === producto.id
                            ? { ...item, cantidad: item.cantidad + 1 }
                            : item
                    )
                }
                return [...prev, { producto, cantidad: 1 }]
            })

            setLastAddedProduct(producto)
            setShowToast(true)
            setTimeout(() => setShowToast(false), 3000)
        } catch (error) {
            console.error('Error adding to cart:', error)
            alert('Error al agregar producto al carrito')
        }
    }

    const goToCrearPedido = () => {
        localStorage.setItem('vendedor_cart', JSON.stringify(cart))
        localStorage.setItem('vendedor_cliente_seleccionado', clienteSeleccionado)
        navigate('/vendedor/crear-pedido')
    }

    // Cargar/Guardar localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('vendedor_cart')
        const savedCliente = localStorage.getItem('vendedor_cliente_seleccionado')
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart))
            } catch (e) { }
        }
        if (savedCliente) {
            setClienteSeleccionado(savedCliente)
        }
    }, [])

    useEffect(() => {
        if (cart.length > 0) {
            localStorage.setItem('vendedor_cart', JSON.stringify(cart))
        }
    }, [cart])

    useEffect(() => {
        if (clienteSeleccionado) {
            localStorage.setItem('vendedor_cliente_seleccionado', clienteSeleccionado)
        }
    }, [clienteSeleccionado])

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
        clientes,
        clienteSeleccionado,
        setClienteSeleccionado,
        loadingClientes,
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
        goToCrearPedido
    }
}
