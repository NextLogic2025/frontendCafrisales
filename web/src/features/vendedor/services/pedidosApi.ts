import { env } from '../../../config/env'
import { getValidToken } from '../../../services/auth/authClient'

export type OrderItemPayload = {
    sku_id: string
    cantidad: number
    precio_unitario_final?: number
    descuento_item_tipo?: 'porcentaje' | 'monto_fijo'
    descuento_item_valor?: number
    requiere_aprobacion?: boolean
    origen_precio?: 'catalogo' | 'negociado'
}

export type CreateOrderPayload = {
    cliente_id?: string
    zona_id?: string
    metodo_pago: 'contado' | 'credito'
    descuento_pedido_tipo?: 'porcentaje' | 'monto_fijo'
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
    descuento_pedido_tipo?: 'porcentaje' | 'monto_fijo'
    estado?: string
    cliente_id?: string
    created_at?: string
    creado_en?: string
    items?: any[]
    cliente_nombre?: string
    vendedor_nombre?: string
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

export async function getMyOrders(): Promise<OrderResponse[]> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${ORDERS_API_URL}/pedidos/my-orders`, {
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

export async function getOrderById(id: string): Promise<OrderResponse> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${ORDERS_API_URL}/pedidos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
        throw new Error('Error al obtener el pedido')
    }

    return await res.json()
}

// Supervisor Promotion Endpoints
// Import necessary services
import { obtenerClientes } from '../../supervisor/services/clientesApi' // Assuming path correction if needed, or check existing imports

export async function getPendingPromotions(): Promise<OrderResponse[]> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const [resPromos, resClientes] = await Promise.all([
        fetch(`${ORDERS_API_URL}/pedidos/promociones-pendientes`, {
            headers: { Authorization: `Bearer ${token}` }
        }),
        obtenerClientes('todos').catch(() => [])
    ])

    if (!resPromos.ok) return []

    const dataPromos = await resPromos.json()
    const clientesMap = new Map(resClientes.map(c => [c.id, c]))

    return Array.isArray(dataPromos) ? dataPromos.map((p: any) => {
        const clienteInfo = clientesMap.get(p.cliente_id)
        return {
            ...p,
            cliente_nombre: clienteInfo?.razon_social || p.cliente_nombre || 'Cliente sin nombre',
            vendedor_nombre: p.vendedor_nombre || '---', // Backend might provide this or we might need another fetch, but priority is client name
        }
    }) : []
}

export async function approvePromotions(
    orderId: string,
    options: { approve_all?: boolean; item_ids?: string[] }
): Promise<void> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${ORDERS_API_URL}/pedidos/${orderId}/aprobar-promociones`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(options),
    })

    if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || 'Error al aprobar promociones')
    }
}

export async function respondToAdjustment(
    orderId: string,
    validationId: string,
    action: 'acepta' | 'rechaza',
    comment?: string
): Promise<void> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${ORDERS_API_URL}/pedidos/${orderId}/responder-ajuste`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            pedido_id: orderId,
            validacion_id: validationId,
            accion: action,
            comentario: comment,
            cliente_id: (await parseJwt(token))?.sub // We need client ID, usually in token. But backend service checks if dto.cliente_id === clienteId from token.
            // Wait, ActionsService checks dto.cliente_id.
            // I should decode token here or hope backend extracts it from token?
            // ActionsService: if (dto.cliente_id !== clienteId) throw Forbidden.
            // So we MUST send it.
        }),
    })

    if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || 'Error al responder al ajuste')
    }
}

// Helper to minimal parse
function parseJwt(token: string) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}
