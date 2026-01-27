import { env } from '../../../config/env'
import { getValidToken } from '../../../services/auth/authClient'

export type OrderItemPayload = {
    sku_id: string
    cantidad: number
    precio_unitario_final?: number
    descuento_item_tipo?: 'porcentaje' | 'monto' | 'fijo'
    descuento_item_valor?: number
    requiere_aprobacion?: boolean
    origen_precio?: 'catalogo' | 'negociado'
}

export type CreateOrderPayload = {
    cliente_id?: string
    zona_id?: string
    metodo_pago: 'contado' | 'credito'
    descuento_pedido_tipo?: 'porcentaje' | 'monto' | 'fijo'
    descuento_pedido_valor?: number
    fecha_entrega_sugerida?: string
    notas?: string
    items: OrderItemPayload[]
}

export type OrderResponse = {
    id: string
    numero_pedido?: string
    total?: number
    subtotal?: number
    impuesto?: number
    descuento_pedido_valor?: number
    estado?: string
    cliente_id?: string
}

const ORDERS_BASE_URL = env.api.orders
const ORDERS_API_URL = ORDERS_BASE_URL.endsWith('/api') ? ORDERS_BASE_URL : `${ORDERS_BASE_URL}/api`

export async function createOrder(payload: CreateOrderPayload): Promise<OrderResponse> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${ORDERS_API_URL}/pedidos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || 'Error al crear el pedido')
    }

    return await res.json()
}

export async function getOrders(): Promise<OrderResponse[]> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${ORDERS_API_URL}/pedidos`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return []
    return await res.json()
}

export async function cancelOrder(orderId: string, motivo: string): Promise<void> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${ORDERS_API_URL}/pedidos/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ motivo }),
    })

    if (!res.ok) {
        throw new Error('Error al cancelar el pedido')
    }
}
