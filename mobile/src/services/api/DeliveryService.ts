import { env } from '../../config/env'
import { ApiService } from './ApiService'
import { createService } from './createService'
import { logErrorForDebugging } from '../../utils/errorMessages'

export type DeliveryStatus = 'pendiente' | 'en_ruta' | 'entregado_completo' | 'entregado_parcial' | 'no_entregado' | 'cancelado'

export type Delivery = {
  id: string
  pedido_id: string
  rutero_logistico_id: string
  transportista_id: string
  estado: DeliveryStatus
  asignado_en?: string | null
  salida_ruta_en?: string | null
  entregado_en?: string | null
  motivo_no_entrega?: string | null
  observaciones?: string | null
  latitud?: number | null
  longitud?: number | null
}

export type CompleteDeliveryPayload = {
  observaciones?: string
  latitud?: number
  longitud?: number
}

export type NoDeliveryPayload = {
  motivo_no_entrega: string
  observaciones?: string
  latitud?: number
  longitud?: number
}

const DELIVERY_BASE_URL = env.api.deliveryUrl
const DELIVERY_API_URL = DELIVERY_BASE_URL.endsWith('/api') ? DELIVERY_BASE_URL : `${DELIVERY_BASE_URL}/api`

const rawService = {
  async getDeliveries(params?: {
    transportista_id?: string
    rutero_logistico_id?: string
    pedido_id?: string
    estado?: string
    fecha?: string
  }): Promise<Delivery[]> {
    try {
      const search = new URLSearchParams()
      if (params?.transportista_id) search.set('transportista_id', params.transportista_id)
      if (params?.rutero_logistico_id) search.set('rutero_logistico_id', params.rutero_logistico_id)
      if (params?.pedido_id) search.set('pedido_id', params.pedido_id)
      if (params?.estado) search.set('estado', params.estado)
      if (params?.fecha) search.set('fecha', params.fecha)
      const query = search.toString()
      return await ApiService.get<Delivery[]>(`${DELIVERY_API_URL}/entregas${query ? `?${query}` : ''}`)
    } catch (error) {
      logErrorForDebugging(error, 'DeliveryService.getDeliveries')
      return []
    }
  },

  async getDelivery(id: string): Promise<Delivery | null> {
    try {
      return await ApiService.get<Delivery>(`${DELIVERY_API_URL}/entregas/${id}`)
    } catch (error) {
      logErrorForDebugging(error, 'DeliveryService.getDelivery', { id })
      return null
    }
  },

  async completeDelivery(id: string, payload: CompleteDeliveryPayload): Promise<Delivery | null> {
    try {
      return await ApiService.post<Delivery>(`${DELIVERY_API_URL}/entregas/${id}/completar`, payload)
    } catch (error) {
      logErrorForDebugging(error, 'DeliveryService.completeDelivery', { id })
      return null
    }
  },

  async markNoDelivery(id: string, payload: NoDeliveryPayload): Promise<Delivery | null> {
    try {
      return await ApiService.post<Delivery>(`${DELIVERY_API_URL}/entregas/${id}/no-entregado`, payload)
    } catch (error) {
      logErrorForDebugging(error, 'DeliveryService.markNoDelivery', { id })
      return null
    }
  },
}

export const DeliveryService = createService('DeliveryService', rawService)
