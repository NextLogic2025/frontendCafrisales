import { env } from '../../config/env'
import { ApiService } from './ApiService'
import { createService } from './createService'
import { logErrorForDebugging } from '../../utils/errorMessages'
import { getValidToken } from '../auth/authClient'

export type LatLng = {
  lat: number
  lon: number
}

export type Zone = {
  id: string
  codigo: string
  nombre: string
  descripcion?: string | null
  activo?: boolean
  zonaGeom?: object | null
  zona_geom?: object | null
}

export type ZoneSchedule = {
  id?: string
  diaSemana: number
  entregasHabilitadas: boolean
  visitasHabilitadas: boolean
}

export type CreateZonePayload = {
  codigo: string
  nombre: string
  descripcion?: string
  zonaGeom?: object
}

export type ZoneStatusFilter = 'activo' | 'inactivo' | 'todos'

export type UpdateZonePayload = Partial<CreateZonePayload> & {
  activo?: boolean
}

const ZONES_BASE_URL = env.api.zoneUrl.endsWith('/api/v1')
  ? env.api.zoneUrl
  : `${env.api.zoneUrl}/api/v1`

const safeParseGeom = (g: any) => {
  if (!g) return null
  if (typeof g === 'string') {
    try {
      return JSON.parse(g)
    } catch {
      return null
    }
  }
  return g
}

const normalizeZone = (zone: Zone): Zone => ({
  ...zone,
  id: String((zone as any).id ?? ''),
  zonaGeom: safeParseGeom(zone.zonaGeom ?? zone.zona_geom ?? null),
})

const unwrapPaginated = <T>(response: any): T[] => {
  if (Array.isArray(response)) return response as T[]
  if (response && Array.isArray(response.data)) return response.data as T[]
  return []
}

const rawService = {
  async getZones(status: ZoneStatusFilter = 'activo'): Promise<Zone[]> {
    try {
      const token = await getValidToken()
      if (!token) return []
      const normalizedStatus = status === 'todos' ? '' : status
      const query = normalizedStatus ? `?status=${encodeURIComponent(normalizedStatus)}` : ''
      const data = await ApiService.get<Zone[]>(`${ZONES_BASE_URL}/zones${query}`)
      return unwrapPaginated<Zone>(data).map(normalizeZone)
    } catch (error) {
      logErrorForDebugging(error, 'ZoneService.getZones')
      return []
    }
  },

  async getZonesMap(status: ZoneStatusFilter = 'activo'): Promise<Zone[]> {
    try {
      const token = await getValidToken()
      if (!token) return []
      const normalizedStatus = status === 'todos' ? '' : status
      const query = normalizedStatus ? `?status=${encodeURIComponent(normalizedStatus)}` : ''
      const data = await ApiService.get<Zone[]>(`${ZONES_BASE_URL}/zones/map${query}`)
      return unwrapPaginated<Zone>(data).map(normalizeZone)
    } catch (error) {
      logErrorForDebugging(error, 'ZoneService.getZonesMap')
      return []
    }
  },

  async getZoneById(id: string): Promise<Zone | null> {
    try {
      const token = await getValidToken()
      if (!token) return null
      const zone = await ApiService.get<Zone>(`${ZONES_BASE_URL}/zones/${id}`)
      return normalizeZone(zone)
    } catch (error) {
      logErrorForDebugging(error, 'ZoneService.getZoneById', { id })
      return null
    }
  },

  async createZone(payload: CreateZonePayload): Promise<Zone | null> {
    try {
      const zone = await ApiService.post<Zone>(`${ZONES_BASE_URL}/zones`, payload)
      return normalizeZone(zone)
    } catch (error) {
      logErrorForDebugging(error, 'ZoneService.createZone')
      return null
    }
  },

  async updateZone(id: string, payload: UpdateZonePayload): Promise<Zone | null> {
    try {
      const zone = await ApiService.patch<Zone>(`${ZONES_BASE_URL}/zones/${id}`, payload)
      return normalizeZone(zone)
    } catch (error) {
      logErrorForDebugging(error, 'ZoneService.updateZone', { id })
      return null
    }
  },

  async getZoneSchedules(zoneId: string): Promise<ZoneSchedule[]> {
    try {
      return await ApiService.get<ZoneSchedule[]>(`${ZONES_BASE_URL}/zones/${zoneId}/horarios`)
    } catch (error) {
      logErrorForDebugging(error, 'ZoneService.getZoneSchedules', { zoneId })
      return []
    }
  },

  async updateZoneSchedules(zoneId: string, schedules: ZoneSchedule[]): Promise<ZoneSchedule[]> {
    try {
      return await ApiService.put<ZoneSchedule[]>(`${ZONES_BASE_URL}/zones/${zoneId}/horarios`, schedules)
    } catch (error) {
      logErrorForDebugging(error, 'ZoneService.updateZoneSchedules', { zoneId })
      return []
    }
  },

  async resolveZoneByPoint(point: LatLng): Promise<Zone | null> {
    try {
      const token = await getValidToken()
      if (!token) return null
      const zone = await ApiService.post<Zone>(`${ZONES_BASE_URL}/zones/resolver`, point)
      return normalizeZone(zone)
    } catch (error) {
      logErrorForDebugging(error, 'ZoneService.resolveZoneByPoint')
      return null
    }
  },
}

export const ZoneService = createService('ZoneService', rawService)

export const ZoneHelpers = {
  getDayLabel(day: number) {
    return ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'][day] || `Dia ${day}`
  },
}

export type ZoneEditState = {
  codigo: string
  nombre: string
  descripcion: string
  activo: boolean
}
