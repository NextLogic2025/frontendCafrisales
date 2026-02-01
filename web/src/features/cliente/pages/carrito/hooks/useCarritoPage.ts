import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../../cart/CartContext'
import { useCliente } from '../../../hooks/useCliente'
import { createOrder } from '../../../../vendedor/services/pedidosApi'

export const useCarritoPage = () => {
    const navigate = useNavigate()
    const { items, total, updateQuantity, removeItem, clearCart, warnings, removedItems } = useCart()
    const { perfil, fetchPerfilCliente } = useCliente()

    const [condicionPagoManual, setCondicionPagoManual] = useState<'CONTADO' | 'CREDITO'>('CREDITO')

    useEffect(() => {
        if (!perfil) fetchPerfilCliente()
    }, [perfil, fetchPerfilCliente])

    const confirmarPedido = async () => {
        if (items.length === 0) return

        try {
            const payload: any = {
                // Mobile app does NOT send cliente_id, backend likely takes it from token
                // cliente_id: perfil?.id, 
                metodo_pago: condicionPagoManual === 'CREDITO' ? 'credito' : 'contado',
                items: items.map(item => ({
                    sku_id: item.selectedSkuId || item.id,
                    cantidad: item.quantity,
                    // Mobile sends only sku_id and quantity. We omit price so backend uses catalog price.
                    // Sending price triggers 'negotiation' check which fails for clients.
                    origen_precio: 'catalogo'
                })),
                // zona_id not sent in mobile
                zona_id: undefined
            }

            // NOTE: Mobile app logic:
            // Client simply creates order with 'metodo_pago': 'credito'.
            // Backend handles outbox_events to create the credit request for the vendor.
            await createOrder(payload)
            clearCart()
            alert('¡Pedido creado exitosamente!')
            try { window.dispatchEvent(new CustomEvent('pedidoCreado', { detail: { message: 'Pedido creado exitosamente' } })) } catch { }
            navigate('/cliente/pedidos', { replace: true })
        } catch (e) {
            alert('No se pudo crear el pedido: ' + (e instanceof Error ? e.message : 'error'))
        }
    }

    return {
        items,
        total,
        updateQuantity,
        removeItem,
        clearCart,
        warnings,
        removedItems,
        confirmarPedido,
        perfil,
        condicionPagoManual,
        setCondicionPagoManual
    }
}
