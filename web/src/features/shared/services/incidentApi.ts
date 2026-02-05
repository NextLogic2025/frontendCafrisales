import { getValidToken } from '../../../services/auth/authClient'
import { env } from '../../../config/env'
import type {
    Incidencia,
    ResolverIncidenciaPayload,
    SeveridadIncidencia,
} from '../types/deliveryTypes'

const BASE_URL = env.api.delivery

/**
 * Get incidents with filters
 */
export async function getIncidencias(params?: {
    resuelto?: boolean
    severidad?: SeveridadIncidencia | SeveridadIncidencia[]
}): Promise<Incidencia[]> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const queryParams = new URLSearchParams()
    if (params?.resuelto !== undefined) {
        queryParams.append('resuelto', String(params.resuelto))
    }
    if (params?.severidad) {
        const severidades = Array.isArray(params.severidad) ? params.severidad : [params.severidad]
        queryParams.append('severidad', severidades.join(','))
    }

    const query = queryParams.toString()
    const url = `${BASE_URL}/api/incidencias${query ? `?${query}` : ''}`

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, 'X-Authorization': `Bearer ${token}` },
    })

    if (!res.ok) {
        if (!res.ok) {
            return []
        }
        return []
    }

    return await res.json()
}

/**
 * Resolve incident
 */
export async function resolverIncidencia(
    id: string,
    payload: ResolverIncidenciaPayload
): Promise<Incidencia> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${BASE_URL}/api/incidencias/${id}/resolver`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, 'X-Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || 'Error al resolver incidencia')
    }

    return await res.json()
}
