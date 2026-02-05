import { getValidToken } from '../../../services/auth/authClient'
import { env } from '../../../config/env'
import type {
    RuteroLogistico,
    CreateRuteroLogisticoPayload,
    AddOrderToRuteroPayload,
    UpdateVehiclePayload,
    CancelRuteroPayload,
    HistorialEstadoRutero,
    EstadoRutero,
} from './types'

const BASE_URL = env.api.transportista || ''

/**
 * Crear un nuevo rutero logístico en estado borrador
 */
export async function createRuteroLogistico(
    payload: CreateRuteroLogisticoPayload
): Promise<RuteroLogistico> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${BASE_URL}/api/v1/routes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, 'X-Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || 'Error al crear rutero logístico')
    }

    return await res.json()
}

/**
 * Listar ruteros logísticos con filtros opcionales
 */
export async function getRuterosLogisticos(params?: {
    transportista_id?: string
    estado?: EstadoRutero | EstadoRutero[]
}): Promise<RuteroLogistico[]> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const queryParams = new URLSearchParams()
    if (params?.transportista_id) {
        queryParams.append('driverId', params.transportista_id)
    }
    if (params?.estado) {
        const estados = Array.isArray(params.estado) ? params.estado : [params.estado]
        queryParams.append('status', estados.join(','))
    }

    const query = queryParams.toString()
    const url = `${BASE_URL}/api/v1/routes${query ? `?${query}` : ''}`

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, 'X-Authorization': `Bearer ${token}` },
    })

    if (!res.ok) {
        return []
    }

    const response = await res.json()
    // Backend returns paginated response { data, meta }
    return response.data || response
}

/**
 * Obtener detalle de un rutero logístico por ID
 */
export async function getRuteroLogistico(id: string): Promise<RuteroLogistico | null> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${BASE_URL}/api/v1/routes/${id}`, {
        headers: { Authorization: `Bearer ${token}`, 'X-Authorization': `Bearer ${token}` },
    })

    if (!res.ok) {
        return null
    }

    return await res.json()
}

/**
 * Obtener historial de estados de un rutero logístico
 */
export async function getHistorialRutero(id: string): Promise<HistorialEstadoRutero[]> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${BASE_URL}/api/v1/routes/${id}/history`, {
        headers: { Authorization: `Bearer ${token}`, 'X-Authorization': `Bearer ${token}` },
    })

    if (!res.ok) {
        return []
    }

    return await res.json()
}

/**
 * Publicar un rutero logístico (cambiar de borrador a publicado)
 */
export async function publicarRutero(id: string): Promise<RuteroLogistico> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${BASE_URL}/api/v1/routes/${id}/publicar`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, 'X-Authorization': `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || 'Error al publicar rutero')
    }

    return await res.json()
}

/**
 * Cancelar un rutero logístico
 */
export async function cancelarRutero(
    id: string,
    payload: CancelRuteroPayload
): Promise<RuteroLogistico> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${BASE_URL}/api/v1/routes/${id}/cancelar`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, 'X-Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || 'Error al cancelar rutero')
    }

    return await res.json()
}

/**
 * Agregar un pedido a un rutero logístico (solo en estado borrador)
 */
export async function addOrderToRutero(
    id: string,
    payload: AddOrderToRuteroPayload
): Promise<void> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${BASE_URL}/api/v1/routes/${id}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, 'X-Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || 'Error al agregar pedido al rutero')
    }
}

/**
 * Eliminar un pedido de un rutero logístico (solo en estado borrador)
 */
export async function removeOrderFromRutero(id: string, pedidoId: string): Promise<void> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${BASE_URL}/api/v1/routes/${id}/orders/${pedidoId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`, 'X-Authorization': `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || 'Error al eliminar pedido del rutero')
    }
}

/**
 * Actualizar el vehículo de un rutero logístico (solo en estado borrador)
 */
export async function updateVehicleRutero(
    id: string,
    payload: UpdateVehiclePayload
): Promise<RuteroLogistico> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${BASE_URL}/api/v1/routes/${id}/vehiculo`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, 'X-Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || 'Error al actualizar vehículo del rutero')
    }

    return await res.json()
}
