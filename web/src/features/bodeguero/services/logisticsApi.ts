import { getValidToken } from '../../../services/auth/authClient'
import { env } from '../../../config/env'
import type {
    RuteroLogistico,
    EstadoRutero,
} from '../../supervisor/services/types'

const BASE_URL = env.api.transportista || ''

/**
 * Listar ruteros logísticos publicados para preparación
 */
export async function getRuterosPublicados(): Promise<RuteroLogistico[]> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${BASE_URL}/api/v1/routes?status=publicado`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
        return []
    }

    const response = await res.json()
    return response.data || response
}

/**
 * Obtener detalle de un rutero logístico con sus paradas
 */
export async function getRuteroConParadas(id: string): Promise<RuteroLogistico | null> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${BASE_URL}/api/v1/routes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
        return null
    }

    return await res.json()
}

/**
 * Marcar una parada/pedido como preparado
 */
export async function prepararParada(routeId: string, pedidoId: string): Promise<void> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${BASE_URL}/api/v1/routes/${routeId}/paradas/${pedidoId}/preparar`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || 'Error al marcar como preparado')
    }
}
