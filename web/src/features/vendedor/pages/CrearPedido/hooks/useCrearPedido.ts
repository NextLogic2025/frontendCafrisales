

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Cliente } from '../../../../supervisor/services/clientesApi'
import type { CartItem, ClienteDetalle, Producto } from '../types'
import { obtenerClientes, obtenerClientePorId, obtenerMisClientes } from '../../../../supervisor/services/clientesApi'
import { createOrder, cancelOrder, type CreateOrderPayload } from '../../../services/pedidosApi'
import { approveCredit } from '../../../services/creditosApi'

export const useCrearPedido = () => {
    const navigate = useNavigate()
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [clienteSeleccionado, setClienteSeleccionado] = useState<string>('')
    const [clienteDetalle, setClienteDetalle] = useState<ClienteDetalle | null>(null)
    const [cart, setCart] = useState<CartItem[]>([])
    const [isLoadingClientes, setIsLoadingClientes] = useState(false)
    const [busquedaCliente, setBusquedaCliente] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Estado para condición de pago manual
    const [condicionPagoManual, setCondicionPagoManual] = useState<'CONTADO' | 'CREDITO'>('CONTADO')
    const [isCreditoModalOpen, setIsCreditoModalOpen] = useState(false)
    const [plazoDias, setPlazoDias] = useState(30)
    const [notasCredito, setNotasCredito] = useState('')

    // Estado para Descuento Global
    const [descuentoPedidoTipo, setDescuentoPedidoTipo] = useState<'porcentaje' | 'monto' | 'fijo'>('porcentaje')
    const [descuentoPedidoValor, setDescuentoPedidoValor] = useState<number | undefined>(undefined)

    const handlePaymentChange = (value: 'CONTADO' | 'CREDITO') => {
        if (value === 'CREDITO') {
            setIsCreditoModalOpen(true)
        } else {
            setCondicionPagoManual('CONTADO')
        }
    }

    const handleConfirmCredito = (plazo: number, notas: string) => {
        setPlazoDias(plazo)
        setNotasCredito(notas)
        setCondicionPagoManual('CREDITO')
        setIsCreditoModalOpen(false)
    }

    const loadClientes = async () => {
        try {
            setIsLoadingClientes(true)
            const items = await obtenerMisClientes()
            setClientes(items)
        } catch (err) {
            console.error('Error loading clientes:', err)
        } finally {
            setIsLoadingClientes(false)
        }
    }

    const loadClienteDetalle = async (clienteId: string) => {
        try {
            const data = await obtenerClientePorId(clienteId)
            if (data) {
                setClienteDetalle({
                    ...data,
                    direccion_texto: data.direccion_texto || '',
                } as any)
            }
        } catch (err) {
            console.error('Error loading cliente detalle:', err)
        }
    }

    // Cargar clientes y carrito local
    useEffect(() => {
        loadClientes()

        // Cargar carrito desde localStorage
        const savedCart = localStorage.getItem('vendedor_cart')
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart))
            } catch (e) {
                console.error('Error parsing cart from localStorage:', e)
            }
        }

        // Cargar cliente desde localStorage
        const savedCliente = localStorage.getItem('vendedor_cliente_seleccionado')
        if (savedCliente) {
            setClienteSeleccionado(savedCliente)
            // Cargar detalles del cliente (crédito)
            loadClienteDetalle(savedCliente)
        }
    }, [])

    // Persistir el carrito cuando cambie
    useEffect(() => {
        if (cart.length > 0) {
            localStorage.setItem('vendedor_cart', JSON.stringify(cart))
        } else {
            localStorage.removeItem('vendedor_cart')
        }
    }, [cart])

    const getItemId = (item: CartItem) => `${item.producto.id}-${(item.producto as any).selectedSkuId || 'default'}`

    const updateQuantity = async (itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeItem(itemId)
            return
        }

        // Actualizar estado local
        setCart(prev => prev.map(item =>
            getItemId(item) === itemId
                ? { ...item, cantidad: newQuantity }
                : item
        ))
    }

    const updateItemNegotiation = (
        itemId: string,
        updates: Partial<{
            descuento_item_tipo: 'porcentaje' | 'monto' | 'fijo',
            descuento_item_valor: number,
            precio_unitario_final: number
        }>
    ) => {
        setCart(prev => prev.map(item =>
            getItemId(item) === itemId
                ? { ...item, ...updates }
                : item
        ))
    }

    const removeItem = async (itemId: string) => {
        // Siempre eliminamos del estado local
        setCart(prev => prev.filter(item => getItemId(item) !== itemId))
    }

    const clearCart = async () => {
        // Actualizar estado local
        setCart([])
        localStorage.removeItem('vendedor_cart')
        localStorage.removeItem('vendedor_cliente_seleccionado')
        setDescuentoPedidoValor(undefined)
    }

    const goBackToProducts = () => {
        navigate('/vendedor/productos')
    }

    // Calculo de total preliminar (sin descuentos globales ni impuestos precisos del backend)
    // El backend calcula el total final, pero aquí aproximamos para mostrar en UI
    const total = cart.reduce((sum, item) => {
        let price = item.precio_unitario_final ?? item.producto.price
        // Aplicar descuento item si existe (solo para visualización aproximada)
        if (item.descuento_item_tipo === 'porcentaje' && item.descuento_item_valor) {
            price = price * (1 - item.descuento_item_valor / 100)
        } else if (item.descuento_item_tipo === 'monto' && item.descuento_item_valor) {
            price = price - item.descuento_item_valor
        }
        return sum + (price * item.cantidad)
    }, 0)

    const handleSubmitOrder = async () => {
        if (!clienteSeleccionado) {
            setError('Debe seleccionar un cliente')
            return
        }

        if (cart.length === 0) {
            setError('El carrito está vacío')
            return
        }

        try {
            setIsSubmitting(true)
            setError(null)

            const payload: CreateOrderPayload = {
                cliente_id: clienteSeleccionado,
                metodo_pago: condicionPagoManual === 'CREDITO' ? 'credito' : 'contado',
                notas: condicionPagoManual === 'CREDITO'
                    ? `[CREDITO: ${plazoDias} dias] ${notasCredito}`.trim()
                    : undefined,
                // Global Discount
                descuento_pedido_tipo: descuentoPedidoValor ? descuentoPedidoTipo : undefined,
                descuento_pedido_valor: descuentoPedidoValor,

                items: cart.map(item => {
                    const hasDiscount = !!(item.descuento_item_tipo && item.descuento_item_valor)
                    const hasPriceOverride = item.precio_unitario_final !== undefined

                    return {
                        sku_id: (item.producto as any).selectedSkuId || item.producto.id,
                        cantidad: item.cantidad,
                        origen_precio: hasDiscount && hasPriceOverride ? 'negociado' : (hasDiscount || hasPriceOverride ? 'negociado' : 'catalogo'),
                        // Send discount fields only if present
                        descuento_item_tipo: item.descuento_item_tipo,
                        descuento_item_valor: item.descuento_item_valor,
                        precio_unitario_final: item.precio_unitario_final,
                        requiere_aprobacion: hasDiscount || hasPriceOverride || (descuentoPedidoValor ? true : false) // Simple logic, backend decides based on rules? No user said backend flags. We can set true if negotiation exists.
                    }
                })
            }

            const pedido = await createOrder(payload)

            // Si es crédito, registrar la aprobación de crédito inmediatamente
            if (condicionPagoManual === 'CREDITO') {
                try {
                    await approveCredit({
                        pedido_id: pedido.id,
                        cliente_id: clienteSeleccionado,
                        monto_aprobado: pedido.total || total, // Use returned total if available
                        plazo_dias: plazoDias,
                        notas: notasCredito
                    })
                } catch (creditErr) {
                    console.error('Error al registrar aprobación de crédito:', creditErr)
                    // REQUISITO: Si falla la aprobación de crédito, NO debe crearse el pedido.
                    // Intentamos cancelar el pedido creado
                    try {
                        await cancelOrder(pedido.id, 'Fallo registro automático de aprobación de crédito')
                    } catch (cancelErr) {
                        console.error('Error al intentar revertir pedido:', cancelErr)
                    }
                    throw new Error('Hubo un error al registrar los términos del crédito. El pedido fue cancelado automáticamente.')
                }
            }

            // Limpiar carrito local
            setCart([])
            localStorage.removeItem('vendedor_cart')
            localStorage.removeItem('vendedor_cliente_seleccionado')
            setDescuentoPedidoValor(undefined)

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

    const handleClienteSeleccion = (id: string) => {
        setClienteSeleccionado(id)
        if (id) {
            localStorage.setItem('vendedor_cliente_seleccionado', id)
            loadClienteDetalle(id)
        } else {
            localStorage.removeItem('vendedor_cliente_seleccionado')
            setClienteDetalle(null)
        }
    }

    const clientesFiltrados = useMemo(() => {
        const query = busquedaCliente.toLowerCase().trim()
        if (!query) return clientes.slice(0, 5) // Mostrar los primeros 5 como sugerencia
        return clientes.filter(c =>
            (c.razon_social || '').toLowerCase().includes(query) ||
            (c.identificacion || '').includes(query) ||
            (c.nombre_comercial || '').toLowerCase().includes(query)
        ).slice(0, 10)
    }, [clientes, busquedaCliente])

    return {
        clientes,
        clienteSeleccionado,
        setClienteSeleccionado: handleClienteSeleccion,
        busquedaCliente,
        setBusquedaCliente,
        clientesFiltrados,
        clienteDetalle,
        cart,
        isLoadingClientes,
        isSubmitting,
        error,
        setError,
        condicionPagoManual,
        setCondicionPagoManual: handlePaymentChange,
        isCreditoModalOpen,
        setIsCreditoModalOpen,
        handleConfirmCredito,
        plazoDias,
        notasCredito,
        updateQuantity,
        updateItemNegotiation,
        removeItem,
        clearCart,
        goBackToProducts,
        handleSubmitOrder,
        total,
        totalItems,
        descuentoPedidoTipo,
        setDescuentoPedidoTipo,
        descuentoPedidoValor,
        setDescuentoPedidoValor,
    }
}
