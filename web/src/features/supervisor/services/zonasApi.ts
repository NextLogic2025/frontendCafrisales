import { env } from '../../../config/env'
import { getValidToken } from '../../../services/auth/authClient'

export interface ZonaComercial {
  id: string | number
  codigo: string
  nombre: string
  descripcion?: string | null
  poligono_geografico: unknown | null
  activo: boolean
  created_at: string
  deleted_at: string | null
  vendedor_asignado?: {
    id: number
    vendedor_usuario_id: string
    nombre_vendedor_cache: string | null
  } | null
  zonaGeom?: any
  zona_geom?: any
}

export interface CreateZonaDto {
  codigo: string
  nombre: string
  descripcion?: string
  poligono_geografico?: unknown
}

// Backend uses versioned endpoints: /api/v1/zones
// Port 3004 verified from docker-compose.yml for zone-service
const ZONES_BASE_URL = 'http://localhost:3004'

export async function obtenerZonas(estado: 'activo' | 'inactivo' | 'todos' = 'activo'): Promise<ZonaComercial[]> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  // Backend expects 'status' param, and 'todos' means no param at all
  let query = ''
  if (estado !== 'todos') {
    query = `?status=${encodeURIComponent(estado)}`
  }

  const res = await fetch(`${ZONES_BASE_URL}/api/v1/zones${query}`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) return []
  const response = await res.json()
  // Backend returns { data, meta } for paginated responses
  const zones = response.data || response
  if (!Array.isArray(zones)) return []
  return zones.map((z: any) => {
    const geom = z.zonaGeom ?? z.zona_geom ?? z.poligono_geografico ?? null
    return {
      ...z,
      poligono_geografico: geom,
      zonaGeom: geom
    }
  })
}

export async function obtenerZonaPorId(id: string | number): Promise<ZonaComercial | null> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const res = await fetch(`${ZONES_BASE_URL}/api/v1/zones/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) return null
  const data = await res.json()
  const geom = data.zonaGeom ?? data.zona_geom ?? data.poligono_geografico ?? null
  return {
    ...data,
    poligono_geografico: geom,
    zonaGeom: geom
  }
}

/**
 * Get zones with geometry for map display
 * Uses /api/v1/zones/map endpoint which returns zona_geom in GeoJSON format
 */
export async function obtenerZonasParaMapa(estado?: 'activo' | 'inactivo'): Promise<ZonaComercial[]> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  let query = ''
  if (estado) {
    query = `?status=${encodeURIComponent(estado)}`
  }

  const res = await fetch(`${ZONES_BASE_URL}/api/v1/zones/map${query}`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) return []
  const response = await res.json()
  // /map endpoint returns array directly (not paginated)
  const zones = Array.isArray(response) ? response : (response.data || [])
  return zones.map((z: any) => {
    const geom = z.zonaGeom ?? z.zona_geom ?? z.poligono_geografico ?? null
    return {
      ...z,
      poligono_geografico: geom,
      zonaGeom: geom
    }
  })
}

export async function crearZona(data: CreateZonaDto): Promise<ZonaComercial> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  // Map DTO to Backend Payload (matching mobile/Backend structure)
  // Map DTO to Backend Payload (matching mobile/Backend structure)
  const payload = {
    codigo: data.codigo,
    nombre: data.nombre,
    descripcion: data.descripcion || '',
    zonaGeom: data.poligono_geografico,
  }

  const res = await fetch(`${ZONES_BASE_URL}/api/v1/zones`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.message || 'Error al crear la zona')
  }

  return await res.json()
}

export interface ZoneSchedule {
  id?: string
  diaSemana: number
  entregasHabilitadas: boolean
  visitasHabilitadas: boolean
}

export async function getZoneSchedules(zoneId: string | number): Promise<ZoneSchedule[]> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const res = await fetch(`${ZONES_BASE_URL}/api/v1/zones/${zoneId}/horarios`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) return []
  return await res.json()
}

export async function updateZoneSchedules(zoneId: string | number, schedules: ZoneSchedule[]): Promise<ZoneSchedule[]> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const res = await fetch(`${ZONES_BASE_URL}/api/v1/zones/${zoneId}/horarios`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(schedules)
  })

  if (!res.ok) return []
  return await res.json()
}

export async function actualizarZona(id: string | number, data: Partial<CreateZonaDto>): Promise<ZonaComercial> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const payload: any = { ...data }
  if (data.poligono_geografico !== undefined) {
    payload.zonaGeom = data.poligono_geografico
    payload.zona_geom = data.poligono_geografico
    delete payload.poligono_geografico
  }

  const res = await fetch(`${ZONES_BASE_URL}/api/v1/zones/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.message || 'Error al actualizar la zona')
  }

  return await res.json()
}

export async function eliminarZona(id: string | number): Promise<void> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const res = await fetch(`${ZONES_BASE_URL}/api/v1/zones/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) {
    throw new Error('Error al eliminar zona')
  }
}

