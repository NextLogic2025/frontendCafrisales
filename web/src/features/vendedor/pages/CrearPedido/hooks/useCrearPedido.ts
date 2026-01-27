
import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Cliente } from '../../../../supervisor/services/clientesApi'
import type { CartItem, ClienteDetalle, SucursalCliente, Producto } from '../types'

export const useCrearPedido = () => {
    const navigate = useNavigate()
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [clienteSeleccionado, setClienteSeleccionado] = useState<string>('')
    const [clienteDetalle, setClienteDetalle] = useState<ClienteDetalle | null>(null)
    const [sucursales, setSucursales] = useState<SucursalCliente[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [isLoadingClientes, setIsLoadingClientes] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Estado para destino del pedido
    const [destinoTipo, setDestinoTipo] = useState<'cliente' | 'sucursal'>('cliente')
    const [selectedSucursalId, setSelectedSucursalId] = useState<string | null>(null)
    const [invalidSucursalMessage, setInvalidSucursalMessage] = useState<string | null>(null)

    // Estado para condición de pago manual
    const [condicionPagoManual, setCondicionPagoManual] = useState<'CONTADO' | 'CREDITO'>('CREDITO')

    const loadCartFromBackend = async (clienteId: string) => {
        // Logic removed
        setCart([])
    }

    const loadClienteDetalle = async (clienteId: string) => {
        // Logic removed
        setClienteDetalle(null)
        setCondicionPagoManual('CONTADO')
    }

    const loadSucursales = async (clienteId: string) => {
        // Logic removed
        setSucursales([])
    }

    // Cargar clientes y carrito desde backend
    useEffect(() => {
        setIsLoadingClientes(false)
        setClientes([])

        // Cargar cliente desde localStorage
        const savedCliente = localStorage.getItem('vendedor_cliente_seleccionado')
        if (savedCliente) {
            setClienteSeleccionado(savedCliente)
            // Cargar carrito desde backend
            loadCartFromBackend(savedCliente)
            // Cargar detalles del cliente (crédito)
            loadClienteDetalle(savedCliente)
            // Cargar sucursales del cliente
            loadSucursales(savedCliente)
        }
    }, [])

    const updateQuantity = async (productoId: string, newQuantity: number) => {
        if (!clienteSeleccionado) return

        if (newQuantity <= 0) {
            removeItem(productoId)
            return
        }

        // Actualizar estado local
        setCart(prev => prev.map(item =>
            item.producto.id === productoId
                ? { ...item, cantidad: newQuantity }
                : item
        ))
    }

    const removeItem = async (productoId: string) => {
        if (!clienteSeleccionado) return
        // Siempre eliminamos del estado local
        setCart(prev => prev.filter(item => item.producto.id !== productoId))
    }

    const clearCart = async () => {
        if (!clienteSeleccionado) return
        // Actualizar estado local
        setCart([])
        localStorage.removeItem('vendedor_cart')
        localStorage.removeItem('vendedor_cliente_seleccionado')
    }

    const goBackToProducts = () => {
        navigate('/vendedor/productos')
    }

    const isUuid = useCallback((value: string | null | undefined) => {
        if (!value) return false
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    }, [])

    const selectedSucursal = useMemo(() => sucursales.find(s => s.id === selectedSucursalId) ?? null, [sucursales, selectedSucursalId])

    const handleDestinoTipoChange = (tipo: 'cliente' | 'sucursal') => {
        setDestinoTipo(tipo)
        if (tipo === 'cliente') {
            setSelectedSucursalId(null)
        }
    }

    const total = cart.reduce((sum, item) => sum + (item.producto.price * item.cantidad), 0)
    const creditoDisponible = 0
    const superaCredito = false // No backend data to check credit limit

    const handleSubmitOrder = async () => {
        if (!clienteSeleccionado) {
            setError('Debe seleccionar un cliente')
            return
        }

        if (cart.length === 0) {
            setError('El carrito está vacío')
            return
        }

        if (superaCredito && condicionPagoManual === 'CREDITO') {
            setError('El total excede el crédito disponible del cliente. Seleccione pago al Contado.')
            return
        }

        const wantsSucursal = destinoTipo === 'sucursal'
        const sucursalIdForApi = wantsSucursal && selectedSucursalId && isUuid(selectedSucursalId) ? selectedSucursalId : undefined

        if (wantsSucursal && !selectedSucursalId) {
            setInvalidSucursalMessage('Selecciona una sucursal para poder enviar el pedido a esa ubicación.')
            return
        }
        if (wantsSucursal && selectedSucursalId && !sucursalIdForApi) {
            setInvalidSucursalMessage('La sucursal seleccionada no tiene un identificador válido.')
            return
        }

        try {
            setIsSubmitting(true)
            setError(null)

            // Logic removed
            const pedido = { id: 'DEMO-123' }

            // Limpiar carrito local
            setCart([])
            localStorage.removeItem('vendedor_cart')
            localStorage.removeItem('vendedor_cliente_seleccionado')

            // Mostrar mensaje de éxito
            alert(`¡Pedido creado exitosamente! ID: ${pedido.id}`)

            // Redirigir a la lista de pedidos o dashboard
            navigate('/vendedor/pedidos')
        } catch (err) {
            console.error('Error creating order:', err)
            setError(err instanceof Error ? err.message : 'Error al crear el pedido')
        } finally {
            setIsSubmitting(false)
        }
    }

    const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0)
    const condicionComercial = superaCredito ? 'Contado' : 'Crédito'

    return {
        clientes,
        clienteSeleccionado,
        setClienteSeleccionado,
        clienteDetalle,
        sucursales,
        cart,
        isLoadingClientes,
        isSubmitting,
        error,
        setError,
        destinoTipo,
        selectedSucursalId,
        setSelectedSucursalId,
        invalidSucursalMessage,
        condicionPagoManual,
        setCondicionPagoManual,
        updateQuantity,
        removeItem,
        clearCart,
        goBackToProducts,
        handleDestinoTipoChange,
        handleSubmitOrder,
        total,
        totalItems,
        creditoDisponible,
        superaCredito,
        condicionComercial,
        selectedSucursal
    }
}
