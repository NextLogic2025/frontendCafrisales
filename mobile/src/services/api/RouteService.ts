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

export type CommercialStop = {
  id: string
  rutero_id: string
  cliente_id: string
  orden_visita: number
  objetivo?: string | null
  checkin_en?: string | null
  checkout_en?: string | null
  resultado?: string | null
  notas?: string | null
}

export type CommercialRoute = {
  id: string
  fecha_rutero: string
  zona_id: string
  vendedor_id: string
  estado: string
  paradas?: CommercialStop[]
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

export type RouteHistoryEntry = {
  id: number
  tipo: string
  rutero_id: string
  estado: string
  cambiado_por_id: string
  motivo?: string | null
  creado_en: string
}

export type CreateLogisticRoutePayload = {
  fecha_rutero: string
  zona_id: string
  vehiculo_id: string
  transportista_id: string
  paradas: { pedido_id: string; orden_entrega: number }[]
}

export type CreateCommercialRoutePayload = {
  fecha_rutero: string
  zona_id: string
  vendedor_id: string
  paradas: { cliente_id: string; orden_visita: number; objetivo?: string }[]
}

const ROUTE_BASE_URL = env.api.routeUrl
const ROUTE_API_URL = ROUTE_BASE_URL.endsWith('/api/v1') ? ROUTE_BASE_URL : `${ROUTE_BASE_URL}/api/v1`

const unwrapPaginated = <T>(response: any): T[] => {
  if (Array.isArray(response)) return response as T[]
  if (response && Array.isArray(response.data)) return response.data as T[]
  return []
}

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

  async getCommercialRoutes(params?: { vendedor_id?: string; fecha_desde?: string }): Promise<CommercialRoute[]> {
    try {
      const search = new URLSearchParams()
      if (params?.vendedor_id) search.set('vendedor_id', params.vendedor_id)
      if (params?.fecha_desde) search.set('fecha_desde', params.fecha_desde)
      const query = search.toString()
      const data = await ApiService.get<CommercialRoute[]>(`${ROUTE_API_URL}/ruteros-comerciales${query ? `?${query}` : ''}`)
      return unwrapPaginated<CommercialRoute>(data)
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.getCommercialRoutes')
      return []
    }
  },

  async getCommercialRoute(id: string): Promise<CommercialRoute | null> {
    try {
      return await ApiService.get<CommercialRoute>(`${ROUTE_API_URL}/ruteros-comerciales/${id}`)
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.getCommercialRoute', { id })
      return null
    }
  },

  async createCommercialRoute(payload: CreateCommercialRoutePayload): Promise<CommercialRoute | null> {
    try {
      return await ApiService.post<CommercialRoute>(`${ROUTE_API_URL}/ruteros-comerciales`, payload)
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.createCommercialRoute')
      return null
    }
  },

  async addCommercialVisit(id: string, payload: { cliente_id: string; orden_visita: number; objetivo?: string }): Promise<CommercialStop | null> {
    try {
      return await ApiService.post<CommercialStop>(`${ROUTE_API_URL}/ruteros-comerciales/${id}/visits`, payload)
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.addCommercialVisit', { id })
      return null
    }
  },

  async publishCommercialRoute(id: string): Promise<CommercialRoute | null> {
    try {
      return await ApiService.put<CommercialRoute>(`${ROUTE_API_URL}/ruteros-comerciales/${id}/publicar`, {})
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.publishCommercialRoute', { id })
      return null
    }
  },

  async startCommercialRoute(id: string): Promise<CommercialRoute | null> {
    try {
      return await ApiService.put<CommercialRoute>(`${ROUTE_API_URL}/ruteros-comerciales/${id}/iniciar`, {})
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.startCommercialRoute', { id })
      return null
    }
  },

  async completeCommercialRoute(id: string): Promise<CommercialRoute | null> {
    try {
      return await ApiService.put<CommercialRoute>(`${ROUTE_API_URL}/ruteros-comerciales/${id}/completar`, {})
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.completeCommercialRoute', { id })
      return null
    }
  },

  async cancelCommercialRoute(id: string, motivo?: string): Promise<CommercialRoute | null> {
    try {
      return await ApiService.put<CommercialRoute>(`${ROUTE_API_URL}/ruteros-comerciales/${id}/cancelar`, {
        motivo: motivo || undefined,
      })
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.cancelCommercialRoute', { id })
      return null
    }
  },

  async checkinCommercialStop(stopId: string): Promise<CommercialStop | null> {
    try {
      return await ApiService.put<CommercialStop>(`${ROUTE_API_URL}/paradas-comerciales/${stopId}/checkin`, {})
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.checkinCommercialStop', { stopId })
      return null
    }
  },

  async checkoutCommercialStop(stopId: string, payload: { resultado: string; notas?: string }): Promise<CommercialStop | null> {
    try {
      return await ApiService.put<CommercialStop>(`${ROUTE_API_URL}/paradas-comerciales/${stopId}/checkout`, payload)
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.checkoutCommercialStop', { stopId })
      return null
    }
  },

  async getCommercialRouteHistory(id: string): Promise<RouteHistoryEntry[]> {
    try {
      return await ApiService.get<RouteHistoryEntry[]>(`${ROUTE_API_URL}/ruteros-comerciales/${id}/historial`)
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.getCommercialRouteHistory', { id })
      return []
    }
  },

  async getLogisticsRoutes(estado?: string): Promise<LogisticRoute[]> {
    try {
      const search = new URLSearchParams()
      if (estado) search.set('status', estado)
      const query = search.toString()
      const data = await ApiService.get<LogisticRoute[]>(`${ROUTE_API_URL}/routes${query ? `?${query}` : ''}`)
      return unwrapPaginated<LogisticRoute>(data)
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.getLogisticsRoutes')
      return []
    }
  },

  async getLogisticsRoute(id: string): Promise<LogisticRoute | null> {
    try {
      return await ApiService.get<LogisticRoute>(`${ROUTE_API_URL}/routes/${id}`)
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.getLogisticsRoute', { id })
      return null
    }
  },

  async createLogisticsRoute(payload: CreateLogisticRoutePayload): Promise<LogisticRoute | null> {
    try {
      return await ApiService.post<LogisticRoute>(`${ROUTE_API_URL}/routes`, payload)
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.createLogisticsRoute')
      return null
    }
  },

  async getLogisticsRouteHistory(id: string): Promise<RouteHistoryEntry[]> {
    try {
      return await ApiService.get<RouteHistoryEntry[]>(`${ROUTE_API_URL}/routes/${id}/history`)
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.getLogisticsRouteHistory', { id })
      return []
    }
  },

  async addLogisticsRouteOrder(id: string, payload: { pedido_id: string; orden_entrega: number }): Promise<LogisticStop | null> {
    try {
      return await ApiService.post<LogisticStop>(`${ROUTE_API_URL}/routes/${id}/orders`, payload)
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.addLogisticsRouteOrder', { id })
      return null
    }
  },

  async removeLogisticsRouteOrder(id: string, pedidoId: string): Promise<boolean> {
    try {
      await ApiService.delete(`${ROUTE_API_URL}/routes/${id}/orders/${pedidoId}`)
      return true
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.removeLogisticsRouteOrder', { id, pedidoId })
      return false
    }
  },

  async updateLogisticsRouteVehicle(id: string, vehiculo_id: string): Promise<LogisticRoute | null> {
    try {
      return await ApiService.put<LogisticRoute>(`${ROUTE_API_URL}/routes/${id}/vehiculo`, { vehiculo_id })
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.updateLogisticsRouteVehicle', { id })
      return null
    }
  },

  async markLogisticsStopPrepared(routeId: string, pedidoId: string): Promise<LogisticStop | null> {
    try {
      return await ApiService.put<LogisticStop>(
        `${ROUTE_API_URL}/routes/${routeId}/paradas/${pedidoId}/preparar`,
        {},
      )
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.markLogisticsStopPrepared', { routeId, pedidoId })
      return null
    }
  },

  async publishLogisticsRoute(id: string): Promise<LogisticRoute | null> {
    try {
      return await ApiService.put<LogisticRoute>(`${ROUTE_API_URL}/routes/${id}/publicar`, {})
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.publishLogisticsRoute', { id })
      return null
    }
  },

  async startLogisticsRoute(id: string): Promise<LogisticRoute | null> {
    try {
      return await ApiService.put<LogisticRoute>(`${ROUTE_API_URL}/routes/${id}/iniciar`, {})
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.startLogisticsRoute', { id })
      return null
    }
  },

  async completeLogisticsRoute(id: string): Promise<LogisticRoute | null> {
    try {
      return await ApiService.put<LogisticRoute>(`${ROUTE_API_URL}/routes/${id}/completar`, {})
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.completeLogisticsRoute', { id })
      return null
    }
  },

  async cancelLogisticsRoute(id: string, motivo?: string): Promise<LogisticRoute | null> {
    try {
      return await ApiService.put<LogisticRoute>(`${ROUTE_API_URL}/routes/${id}/cancelar`, {
        motivo: motivo || undefined,
      })
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.cancelLogisticsRoute', { id })
      return null
    }
  },
  async getAssignedOrderIds(): Promise<string[]> {
    try {
      const statuses = ['publicado', 'en_curso']
      const routesByStatus = await Promise.all(
        statuses.map((status) =>
          ApiService.get<LogisticRoute[]>(
            `${ROUTE_API_URL}/routes?status=${encodeURIComponent(status)}&limit=200`,
          ),
        ),
      )
      const routes = routesByStatus.flatMap((response) => unwrapPaginated<LogisticRoute>(response))
      const stopsByRoute = await Promise.all(
        routes.map(async (route) => {
          if (route.paradas && route.paradas.length > 0) return route.paradas
          try {
            return await ApiService.get<LogisticStop[]>(`${ROUTE_API_URL}/routes/${route.id}/stops`)
          } catch {
            return []
          }
        }),
      )
      const pedidoIds = new Set<string>()
      stopsByRoute.flat().forEach((stop) => {
        if (stop?.pedido_id) pedidoIds.add(stop.pedido_id)
      })
      return Array.from(pedidoIds)
    } catch (error) {
      logErrorForDebugging(error, 'RouteService.getAssignedOrderIds')
      return []
    }
  },
}

export const RouteService = createService('RouteService', rawService)
