import { env } from '../../config/env'
import { ApiService } from './ApiService'
import { createService } from './createService'
import { logErrorForDebugging } from '../../utils/errorMessages'

export type VehicleStatus = 'disponible' | 'asignado' | 'mantenimiento' | 'fuera_servicio'

export type Vehicle = {
  id: string
  placa: string
  modelo?: string | null
  capacidad_kg?: number | null
  estado: VehicleStatus
  creado_en?: string
  actualizado_en?: string
}

export type VehiclePayload = {
  placa: string
  modelo?: string
  capacidad_kg?: number
}

export type RoutePlan = {
  id: string
  fecha_rutero: string
  zona_id: string
  estado: string
}

export type ScheduledVisit = {
  id: string
  rutero_id: string
  cliente_id: string
  orden_visita: number
  resultado?: string | null
}

export type LogisticStop = {
  id?: string
  pedido_id: string
  orden_entrega: number
  preparado_en?: string | null
  preparado_por?: string | null
}

export type LogisticRoute = {
  id: string
  fecha_rutero: string
  zona_id: string
  vehiculo_id: string
  transportista_id: string
  estado: string
  paradas?: LogisticStop[]
  vehiculo?: Vehicle | null
}

export type CreateLogisticRoutePayload = {
  fecha_rutero: string
  zona_id: string
  vehiculo_id: string
  transportista_id: string
  paradas: { pedido_id: string; orden_entrega: number }[]
}

const ROUTE_BASE_URL = env.api.routeUrl
const ROUTE_API_URL = ROUTE_BASE_URL.endsWith('/api') ? ROUTE_BASE_URL : `${ROUTE_BASE_URL}/api`

const rawService = {
  async getVehicles(estado?: string): Promise<Vehicle[]> {
    try {
      const query = estado ? `?estado=${estado}` : ''
      return await ApiService.get<Vehicle[]>(`${ROUTE_API_URL}/vehiculos${query}`)
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.getVehicles')
      return []
    }
  },

  async getVehicle(id: string): Promise<Vehicle | null> {
    try {
      return await ApiService.get<Vehicle>(`${ROUTE_API_URL}/vehiculos/${id}`)
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.getVehicle', { id })
      return null
    }
  },

  async createVehicle(payload: VehiclePayload): Promise<Vehicle | null> {
    try {
      return await ApiService.post<Vehicle>(`${ROUTE_API_URL}/vehiculos`, payload)
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.createVehicle')
      return null
    }
  },

  async updateVehicleStatus(id: string, estado: VehicleStatus): Promise<Vehicle | null> {
    try {
      return await ApiService.put<Vehicle>(`${ROUTE_API_URL}/vehiculos/${id}/estado`, { estado })
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.updateVehicleStatus', { id, estado })
      return null
    }
  },

  async getLogisticsRoutes(estado?: string): Promise<LogisticRoute[]> {
    try {
      const query = estado ? `?estado=${encodeURIComponent(estado)}` : ''
      return await ApiService.get<LogisticRoute[]>(`${ROUTE_API_URL}/ruteros-logisticos${query}`)
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.getLogisticsRoutes')
      return []
    }
  },

  async getLogisticsRoute(id: string): Promise<LogisticRoute | null> {
    try {
      return await ApiService.get<LogisticRoute>(`${ROUTE_API_URL}/ruteros-logisticos/${id}`)
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.getLogisticsRoute', { id })
      return null
    }
  },

  async createLogisticsRoute(payload: CreateLogisticRoutePayload): Promise<LogisticRoute | null> {
    try {
      return await ApiService.post<LogisticRoute>(`${ROUTE_API_URL}/ruteros-logisticos`, payload)
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.createLogisticsRoute')
      return null
    }
  },

  async publishLogisticsRoute(id: string): Promise<LogisticRoute | null> {
    try {
      return await ApiService.put<LogisticRoute>(`${ROUTE_API_URL}/ruteros-logisticos/${id}/publicar`, {})
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.publishLogisticsRoute', { id })
      return null
    }
  },

  async startLogisticsRoute(id: string): Promise<LogisticRoute | null> {
    try {
      return await ApiService.put<LogisticRoute>(`${ROUTE_API_URL}/ruteros-logisticos/${id}/iniciar`, {})
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.startLogisticsRoute', { id })
      return null
    }
  },

  async completeLogisticsRoute(id: string): Promise<LogisticRoute | null> {
    try {
      return await ApiService.put<LogisticRoute>(`${ROUTE_API_URL}/ruteros-logisticos/${id}/completar`, {})
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.completeLogisticsRoute', { id })
      return null
    }
  },

  async cancelLogisticsRoute(id: string, motivo?: string): Promise<LogisticRoute | null> {
    try {
      return await ApiService.put<LogisticRoute>(`${ROUTE_API_URL}/ruteros-logisticos/${id}/cancelar`, {
        motivo: motivo || undefined,
      })
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.cancelLogisticsRoute', { id })
      return null
    }
  },
}

export const RouteService = createService('RouteService', rawService)
