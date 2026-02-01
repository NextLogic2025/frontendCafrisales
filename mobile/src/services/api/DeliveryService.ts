import { env } from '../../config/env'
import { ApiService } from './ApiService'
import { createService } from './createService'
import { logErrorForDebugging } from '../../utils/errorMessages'
import { isApiError } from './ApiError'
import { getValidToken } from '../auth/authClient'

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

export type DeliveryEvidence = {
  id: string
  entrega_id: string
  tipo: 'foto' | 'firma' | 'documento' | 'audio' | 'otro'
  url: string
  mime_type?: string | null
  hash_archivo?: string | null
  tamano_bytes?: number | null
  descripcion?: string | null
  creado_en?: string | null
}

export type DeliveryIncident = {
  id: string
  entrega_id: string
  tipo_incidencia: string
  severidad: 'baja' | 'media' | 'alta' | 'critica'
  descripcion: string
  reportado_en?: string | null
  resuelto_en?: string | null
  resolucion?: string | null
}

export type DeliveryDetail = Delivery & {
  evidencias?: DeliveryEvidence[]
  incidencias?: DeliveryIncident[]
}

export type CompleteDeliveryPayload = {
  observaciones?: string
  latitud?: number
  longitud?: number
}

export type EvidencePayload = {
  tipo: 'foto' | 'firma' | 'documento' | 'audio' | 'otro'
  url: string
  mime_type?: string
  hash_archivo?: string
  tamano_bytes?: number
  descripcion?: string
}

export type IncidentPayload = {
  tipo_incidencia: string
  severidad: 'baja' | 'media' | 'alta' | 'critica'
  descripcion: string
}

export type NoDeliveryPayload = {
  motivo_no_entrega: string
  observaciones?: string
  latitud?: number
  longitud?: number
}

const DELIVERY_BASE_URL = env.api.deliveryUrl
const DELIVERY_API_URL =
  DELIVERY_BASE_URL.endsWith('/api/v1')
    ? DELIVERY_BASE_URL
    : DELIVERY_BASE_URL.endsWith('/api')
      ? `${DELIVERY_BASE_URL}/v1`
      : `${DELIVERY_BASE_URL}/api/v1`

const unwrapList = <T>(data: any): T[] => {
  if (!data) return []
  if (Array.isArray(data)) return data as T[]
  if (Array.isArray(data.data)) return data.data as T[]
  return []
}

const rawService = {
  async getDeliveries(params?: {
    transportista_id?: string
    rutero_logistico_id?: string
    pedido_id?: string
    estado?: string
    fecha?: string
    status?: string
    driverId?: string
    routeId?: string
    fromDate?: string
    toDate?: string
    hasIncidents?: boolean
    page?: number
    limit?: number
    silent?: boolean
  }): Promise<Delivery[]> {
    try {
      const search = new URLSearchParams()
      const driverId = params?.driverId || params?.transportista_id
      const routeId = params?.routeId || params?.rutero_logistico_id
      const status = params?.status || params?.estado

      if (driverId) search.set('driverId', driverId)
      if (routeId) search.set('routeId', routeId)
      if (status) search.set('status', status)
      if (params?.fromDate) search.set('fromDate', params.fromDate)
      if (params?.toDate) search.set('toDate', params.toDate)
      if (params?.fecha) {
        search.set('fromDate', params.fecha)
        search.set('toDate', params.fecha)
      }
      if (params?.hasIncidents !== undefined) {
        search.set('hasIncidents', params.hasIncidents ? 'true' : 'false')
      }
      if (params?.page) search.set('page', String(params.page))
      if (params?.limit) {
        const cappedLimit = Math.min(params.limit, 100)
        search.set('limit', String(cappedLimit))
      }
      const query = search.toString()
      const data = await ApiService.get<any>(
        `${DELIVERY_API_URL}/deliveries${query ? `?${query}` : ''}`,
        { silent: params?.silent }
      )
      return unwrapList<Delivery>(data)
    } catch (error) {
      if (isApiError(error) && error.status === 403) {
        return []
      }
      logErrorForDebugging(error, 'DeliveryService.getDeliveries')
      return []
    }
  },

  async getDelivery(id: string): Promise<Delivery | null> {
    try {
      return await ApiService.get<Delivery>(`${DELIVERY_API_URL}/deliveries/${id}`)
    } catch (error) {
      logErrorForDebugging(error, 'DeliveryService.getDelivery', { id })
      return null
    }
  },

  async getDeliveryDetail(id: string): Promise<DeliveryDetail | null> {
    try {
      return await ApiService.get<DeliveryDetail>(`${DELIVERY_API_URL}/deliveries/${id}`)
    } catch (error) {
      logErrorForDebugging(error, 'DeliveryService.getDeliveryDetail', { id })
      return null
    }
  },

  async completeDelivery(id: string, payload: CompleteDeliveryPayload): Promise<Delivery | null> {
    try {
      return await ApiService.post<Delivery>(`${DELIVERY_API_URL}/deliveries/${id}/complete`, payload)
    } catch (error) {
      logErrorForDebugging(error, 'DeliveryService.completeDelivery', { id })
      return null
    }
  },

  async markNoDelivery(id: string, payload: NoDeliveryPayload): Promise<Delivery | null> {
    try {
      return await ApiService.post<Delivery>(`${DELIVERY_API_URL}/deliveries/${id}/fail`, payload)
    } catch (error) {
      logErrorForDebugging(error, 'DeliveryService.markNoDelivery', { id })
      return null
    }
  },

  async addEvidence(id: string, payload: EvidencePayload): Promise<DeliveryEvidence | null> {
    try {
      logErrorForDebugging(
        new Error('addEvidence now requires file upload endpoint'),
        'DeliveryService.addEvidence',
        { id, payload },
      )
      return null
    } catch (error) {
      logErrorForDebugging(error, 'DeliveryService.addEvidence', { id })
      return null
    }
  },

  async uploadEvidenceFile(
    entregaId: string,
    file: { uri: string; name: string; type: string },
    payload: { tipo: EvidencePayload['tipo']; descripcion?: string },
  ): Promise<DeliveryEvidence | null> {
    try {
      const token = await getValidToken()
      const formData = new FormData()
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any)
      formData.append('tipo', payload.tipo)
      if (payload.descripcion) {
        formData.append('descripcion', payload.descripcion)
      }

      const response = await fetch(`${DELIVERY_API_URL}/deliveries/${entregaId}/evidence`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        logErrorForDebugging(new Error(`API ${response.status}`), 'DeliveryService.uploadEvidenceFile', {
          entregaId,
          status: response.status,
          errorText,
        })
        return null
      }

      const data = await response.json().catch(() => null)
      return data as DeliveryEvidence
    } catch (error) {
      logErrorForDebugging(error, 'DeliveryService.uploadEvidenceFile', { entregaId })
      return null
    }
  },

  async reportIncident(id: string, payload: IncidentPayload): Promise<DeliveryIncident | null> {
    try {
      return await ApiService.post<DeliveryIncident>(`${DELIVERY_API_URL}/deliveries/${id}/incidents`, payload)
    } catch (error) {
      logErrorForDebugging(error, 'DeliveryService.reportIncident', { id })
      return null
    }
  },

  async getEvidenceByDelivery(id: string): Promise<DeliveryEvidence[]> {
    try {
      return unwrapList<DeliveryEvidence>(
        await ApiService.get<any>(`${DELIVERY_API_URL}/deliveries/${id}/evidence`),
      )
    } catch (error) {
      logErrorForDebugging(error, 'DeliveryService.getEvidenceByDelivery', { id })
      return []
    }
  },

  async markEnRuta(id: string): Promise<Delivery | null> {
    try {
      return await ApiService.put<Delivery>(`${DELIVERY_API_URL}/deliveries/${id}/start`, {})
    } catch (error) {
      logErrorForDebugging(error, 'DeliveryService.markEnRuta', { id })
      return null
    }
  },

  async completePartial(id: string, payload: {
    motivo_parcial: string
    observaciones?: string
    latitud?: number
    longitud?: number
  }): Promise<Delivery | null> {
    try {
      return await ApiService.post<Delivery>(`${DELIVERY_API_URL}/deliveries/${id}/complete-partial`, payload)
    } catch (error) {
      logErrorForDebugging(error, 'DeliveryService.completePartial', { id })
      return null
    }
  },

  async getHistory(id: string): Promise<Array<{ id: string; estado: string; motivo?: string; creado_en: string }>> {
    try {
      return await ApiService.get(`${DELIVERY_API_URL}/deliveries/${id}/history`)
    } catch (error) {
      logErrorForDebugging(error, 'DeliveryService.getHistory', { id })
      return []
    }
  },

  async cancelDelivery(id: string, motivo: string): Promise<Delivery | null> {
    try {
      return await ApiService.put<Delivery>(`${DELIVERY_API_URL}/deliveries/${id}/cancel`, { motivo })
    } catch (error) {
      logErrorForDebugging(error, 'DeliveryService.cancelDelivery', { id })
      return null
    }
  },

  async getIncidents(params?: { deliveryId?: string }): Promise<DeliveryIncident[] | null> {
    try {
      if (!params?.deliveryId) {
        logErrorForDebugging(new Error('deliveryId required'), 'DeliveryService.getIncidents')
        return []
      }
      const data = await ApiService.get<any>(`${DELIVERY_API_URL}/deliveries/${params.deliveryId}/incidents`)
      return unwrapList<DeliveryIncident>(data)
    } catch (error) {
      logErrorForDebugging(error, 'DeliveryService.getIncidents')
      return null
    }
  },

  async resolveIncident(deliveryId: string, id: string, resolucion: string): Promise<DeliveryIncident | null> {
    try {
      return await ApiService.put<DeliveryIncident>(
        `${DELIVERY_API_URL}/deliveries/${deliveryId}/incidents/${id}/resolve`,
        { resolucion },
      )
    } catch (error) {
      logErrorForDebugging(error, 'DeliveryService.resolveIncident', { id })
      return null
    }
  },
}

export const DeliveryService = createService('DeliveryService', rawService)
