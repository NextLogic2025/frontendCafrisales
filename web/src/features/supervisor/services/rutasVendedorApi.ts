import { env } from '../../../config/env'
import { getValidToken } from '../../../services/auth/authClient'
import type {
    RutaVendedor,
    EstadoRuta,
    CreateRutaVendedorPayload,
    UpdateVendedorPayload,
    AddClienteToRutaPayload,
    CancelarRutaPayload,
    HistorialEstadoRuta,
} from './rutasVendedorTypes'

const BASE_URL = `${env.api.routes}/api/rutas-vendedor`

// ========================================
// SUPERVISOR FUNCTIONS
// ========================================

/**
 * Get all sales routes with optional filters
 */
export async function getRutasVendedor(filtros?: {
    estado?: EstadoRuta
    vendedor_id?: string
    fecha_desde?: string
    fecha_hasta?: string
}): Promise<RutaVendedor[]> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const params = new URLSearchParams()
    if (filtros?.estado) params.append('estado', filtros.estado)
    if (filtros?.vendedor_id) params.append('vendedor_id', filtros.vendedor_id)
    if (filtros?.fecha_desde) params.append('fecha_desde', filtros.fecha_desde)
    if (filtros?.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta)

    const url = `${BASE_URL}?${params.toString()}`
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || 'Error al obtener rutas de vendedor')
    }

    return await res.json()
}

/**
 * Get sales route by ID
 */
export async function getRutaVendedorById(id: string): Promise<RutaVendedor> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const url = `${BASE_URL}/${id}`
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || 'Error al obtener ruta')
    }

    return await res.json()
}

/**
 * Create new sales route (draft)
 */
export async function createRutaVendedor(
    payload: CreateRutaVendedorPayload
): Promise<RutaVendedor> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const url = BASE_URL
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || 'Error al crear ruta')
    }

    return await res.json()
}

/**
 * Update vendor assigned to route
 */
export async function updateVendedorRuta(
    rutaId: string,
    payload: UpdateVendedorPayload
): Promise<RutaVendedor> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const url = `${BASE_URL}/${rutaId}`
    const res = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || 'Error al actualizar vendedor')
    }

    return await res.json()
}

/**
 * Add client to route
 */
export async function addClienteToRuta(
    rutaId: string,
    payload: AddClienteToRutaPayload
): Promise<RutaVendedor> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const url = `${BASE_URL}/${rutaId}/clientes`
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || 'Error al agregar cliente')
    }

    return await res.json()
}

/**
 * Remove client from route
 */
export async function removeClienteFromRuta(
    rutaId: string,
    clienteId: string
): Promise<RutaVendedor> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const url = `${BASE_URL}/${rutaId}/clientes/${clienteId}`
    const res = await fetch(url, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || 'Error al quitar cliente')
    }

    return await res.json()
}

/**
 * Publish route
 */
export async function publicarRuta(rutaId: string): Promise<RutaVendedor> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const url = `${BASE_URL}/${rutaId}/publicar`
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || 'Error al publicar ruta')
    }

    return await res.json()
}

/**
 * Cancel route
 */
export async function cancelarRuta(
    rutaId: string,
    payload: CancelarRutaPayload
): Promise<RutaVendedor> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const url = `${BASE_URL}/${rutaId}/cancelar`
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || 'Error al cancelar ruta')
    }

    return await res.json()
}

/**
 * Get route history
 */
export async function getHistorialRuta(rutaId: string): Promise<HistorialEstadoRuta[]> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const url = `${BASE_URL}/${rutaId}/historial`
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || 'Error al obtener historial')
    }

    return await res.json()
}

// ========================================
// VENDOR FUNCTIONS
// ========================================

/**
 * Get vendor's assigned routes
 */
export async function getMisRutas(filtros?: {
    estado?: EstadoRuta
}): Promise<RutaVendedor[]> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const params = new URLSearchParams()
    if (filtros?.estado) params.append('estado', filtros.estado)

    const url = `${BASE_URL}/mis-rutas?${params.toString()}`
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || 'Error al obtener mis rutas')
    }

    return await res.json()
}

/**
 * Start route
 */
export async function iniciarRuta(rutaId: string): Promise<RutaVendedor> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const url = `${BASE_URL}/${rutaId}/iniciar`
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || 'Error al iniciar ruta')
    }

    return await res.json()
}

/**
 * Complete route
 */
export async function completarRuta(rutaId: string): Promise<RutaVendedor> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const url = `${BASE_URL}/${rutaId}/completar`
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || 'Error al completar ruta')
    }

    return await res.json()
}
