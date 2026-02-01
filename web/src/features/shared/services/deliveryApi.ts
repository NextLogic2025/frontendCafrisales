import { getValidToken } from '../../../services/auth/authClient'
import { env } from '../../../config/env'
import type {
    Entrega,
    CreateEntregasBatchPayload,
    CompletarEntregaPayload,
    CompletarParcialEntregaPayload,
    NoEntregadoPayload,
    AgregarEvidenciaPayload,
    ReportarIncidenciaPayload,
} from '../types/deliveryTypes'

const BASE_URL = env.api.delivery

/**
 * Create deliveries in batch (called when rutero is initiated)
 * Uses internal batch endpoint
 */
export async function createEntregasBatch(payload: CreateEntregasBatchPayload): Promise<Entrega[]> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${BASE_URL}/api/v1/entregas/batch`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || 'Error al crear entregas')
    }

    return await res.json()
}

/**
 * Get deliveries by rutero_logistico_id or transportista_id
 */
export async function getEntregas(params?: {
    rutero_logistico_id?: string
    transportista_id?: string
}): Promise<Entrega[]> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const queryParams = new URLSearchParams()
    if (params?.rutero_logistico_id) {
        queryParams.append('routeId', params.rutero_logistico_id)
    }
    if (params?.transportista_id) {
        queryParams.append('driverId', params.transportista_id)
    }

    const query = queryParams.toString()
    const url = `${BASE_URL}/api/v1/deliveries${query ? `?${query}` : ''}`

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
        if (!res.ok) {
            return []
        }
        return []
    }

    const response = await res.json()
    // Backend returns paginated response { data, meta }
    return response.data || response
}

/**
 * Get delivery by ID
 */
export async function getEntregaById(id: string): Promise<Entrega | null> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${BASE_URL}/api/v1/deliveries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
        if (!res.ok) {
            return null
        }
        return null
    }

    return await res.json()
}

/**
 * Mark delivery as en-ruta
 */
export async function marcarEnRuta(id: string): Promise<Entrega> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${BASE_URL}/api/v1/deliveries/${id}/start`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || 'Error al marcar entrega en ruta')
    }

    return await res.json()
}

/**
 * Mark delivery as completed
 */
export async function completarEntrega(
    id: string,
    payload: CompletarEntregaPayload
): Promise<Entrega> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${BASE_URL}/api/v1/deliveries/${id}/complete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || 'Error al completar entrega')
    }

    return await res.json()
}

/**
 * Mark delivery as partially completed
 */
export async function completarParcialEntrega(
    id: string,
    payload: CompletarParcialEntregaPayload
): Promise<Entrega> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${BASE_URL}/api/v1/deliveries/${id}/complete-partial`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || 'Error al completar parcialmente la entrega')
    }

    return await res.json()
}

/**
 * Mark delivery as not delivered
 */
export async function marcarNoEntregado(
    id: string,
    payload: NoEntregadoPayload
): Promise<Entrega> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${BASE_URL}/api/v1/deliveries/${id}/fail`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => null)
        const errorMessage = err?.message || err?.error || 'Error al marcar como no entregado'
        throw new Error(errorMessage)
    }

    return await res.json()
}


/**
 * Add evidence to delivery (URL-based)
 */
export async function agregarEvidencia(
    id: string,
    payload: AgregarEvidenciaPayload
): Promise<void> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${BASE_URL}/api/v1/deliveries/${id}/evidence`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || 'Error al agregar evidencia')
    }
}

/**
 * Report incident for delivery
 */
export async function reportarIncidencia(
    id: string,
    payload: ReportarIncidenciaPayload
): Promise<void> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${BASE_URL}/api/v1/deliveries/${id}/incidents`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || 'Error al reportar incidencia')
    }
}
