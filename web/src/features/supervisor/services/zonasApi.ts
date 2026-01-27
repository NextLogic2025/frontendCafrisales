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

// Mobile endpoints use /api/zonas
// Port 3004 verified from docker-compose.yml for zone-service
const ZONES_BASE_URL = 'http://localhost:3004/api'

export async function obtenerZonas(estado: 'activo' | 'inactivo' | 'todos' = 'activo'): Promise<ZonaComercial[]> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const query = estado ? `?estado=${encodeURIComponent(estado)}` : ''
  // Switch to Spanish endpoint to match mobile logic if that's what user requested
  // Mobile: `${ZONES_BASE_URL}/zonas${query}`
  const res = await fetch(`${ZONES_BASE_URL}/zonas${query}`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) return []
  const data = await res.json()
  return data.map((z: any) => ({
    ...z,
    poligono_geografico: z.zonaGeom ?? z.zona_geom ?? null,
    zonaGeom: z.zonaGeom ?? z.zona_geom ?? null
  }))
}

export async function obtenerZonaPorId(id: string | number): Promise<ZonaComercial | null> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const res = await fetch(`${ZONES_BASE_URL}/zonas/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) return null
  const data = await res.json()
  return {
    ...data,
    poligono_geografico: data.zonaGeom ?? data.zona_geom ?? null,
    zonaGeom: data.zonaGeom ?? data.zona_geom ?? null
  }
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

  const res = await fetch(`${ZONES_BASE_URL}/zonas`, {
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

  const res = await fetch(`${ZONES_BASE_URL}/zonas/${zoneId}/horarios`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) return []
  return await res.json()
}

export async function updateZoneSchedules(zoneId: string | number, schedules: ZoneSchedule[]): Promise<ZoneSchedule[]> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const res = await fetch(`${ZONES_BASE_URL}/zonas/${zoneId}/horarios`, {
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

  const res = await fetch(`${ZONES_BASE_URL}/zonas/${id}`, {
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

  const res = await fetch(`${ZONES_BASE_URL}/zonas/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) {
    throw new Error('Error al eliminar zona')
  }
}

