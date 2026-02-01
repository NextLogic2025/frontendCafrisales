import { env } from '../../../config/env'
import { getValidToken } from '../../../services/auth/authClient'
import { jwtDecode } from 'jwt-decode'

const ORDERS_BASE_URL = env.api.orders
const ORDERS_API_URL = ORDERS_BASE_URL.endsWith('/api') ? ORDERS_BASE_URL : `${ORDERS_BASE_URL}/api`

export enum EstadoItemResultado {
    APROBADO = 'aprobado',
    APROBADO_PARCIAL = 'aprobado_parcial',
    SUSTITUIDO = 'sustituido',
    RECHAZADO = 'rechazado',
}

export interface ValidacionItemResult {
    item_pedido_id: string
    estado_resultado: EstadoItemResultado
    sku_aprobado_id?: string
    cantidad_aprobada?: number
    motivo: string
}

export interface CreateValidacionDto {
    pedido_id: string
    bodeguero_id: string
    observaciones?: string
    items_resultados: ValidacionItemResult[]
}

export async function validarPedido(id: string, items: ValidacionItemResult[], observaciones?: string): Promise<void> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    // Decode token to get user ID
    interface DecodedToken {
        sub: string
        [key: string]: any
    }

    let userId = ''
    try {
        const decoded = jwtDecode<DecodedToken>(token)
        userId = decoded.sub
    } catch (e) {
        throw new Error('No se pudo identificar al usuario desde el token')
    }

    if (!userId) throw new Error('No se pudo identificar al usuario')

    const dto: CreateValidacionDto = {
        pedido_id: id,
        bodeguero_id: userId,
        observaciones,
        items_resultados: items
    }

    const res = await fetch(`${ORDERS_API_URL}/v1/orders/${id}/validar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(dto)
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Error al validar el pedido')
    }
}
