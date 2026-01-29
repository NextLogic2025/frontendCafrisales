import { getValidToken } from '../../../services/auth/authClient'
import { env } from '../../../config/env'
import type {
    RuteroLogistico,
    HistorialEstadoRutero,
    EstadoRutero,
} from '../../supervisor/services/types'

const BASE_URL = env.api.transportista || ''

/**
 * Listar ruteros logísticos asignados al transportista actual
 * El backend filtra automáticamente por el transportista_id del usuario autenticado
 */
export async function getRuterosAsignados(params?: {
    estado?: EstadoRutero | EstadoRutero[]
}): Promise<RuteroLogistico[]> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const queryParams = new URLSearchParams()
    if (params?.estado) {
        const estados = Array.isArray(params.estado) ? params.estado : [params.estado]
        queryParams.append('estado', estados.join(','))
    }

    const query = queryParams.toString()
    const url = `${BASE_URL}/api/ruteros-logisticos${query ? `?${query}` : ''}`

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
        console.error('Error al obtener ruteros asignados')
        return []
    }

    return await res.json()
}

/**
 * Obtener detalle de un rutero logístico por ID
 */
export async function getRuteroLogistico(id: string): Promise<RuteroLogistico | null> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${BASE_URL}/api/ruteros-logisticos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
        console.error('Error al obtener rutero logístico')
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

    const res = await fetch(`${BASE_URL}/api/ruteros-logisticos/${id}/historial`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
        console.error('Error al obtener historial del rutero')
        return []
    }

    return await res.json()
}

/**
 * Iniciar un rutero logístico (cambiar de publicado a en_curso)
 */
export async function iniciarRutero(id: string): Promise<RuteroLogistico> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${BASE_URL}/api/ruteros-logisticos/${id}/iniciar`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || 'Error al iniciar rutero')
    }

    return await res.json()
}

/**
 * Completar un rutero logístico (cambiar de en_curso a completado)
 */
export async function completarRutero(id: string): Promise<RuteroLogistico> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${BASE_URL}/api/ruteros-logisticos/${id}/completar`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || 'Error al completar rutero')
    }

    return await res.json()
}
