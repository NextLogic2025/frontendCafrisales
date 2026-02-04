import { env } from '../../config/env'
import { ApiService } from './ApiService'
import { createService } from './createService'
import { logErrorForDebugging } from '../../utils/errorMessages'

export type OrderStatus =
  | 'pendiente_validacion'
  | 'validado'
  | 'ajustado_bodega'
  | 'aceptado_cliente'
  | 'rechazado_cliente'
  | 'asignado_ruta'
  | 'en_ruta'
  | 'entregado'
  | 'cancelado'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente_validacion: 'Pendiente validacion',
  validado: 'Validado',
  ajustado_bodega: 'Ajustado por bodega',
  aceptado_cliente: 'Aceptado por cliente',
  rechazado_cliente: 'Rechazado por cliente',
  asignado_ruta: 'Asignado a ruta',
  en_ruta: 'En ruta',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pendiente_validacion: '#F59E0B',
  validado: '#10B981',
  ajustado_bodega: '#F97316',
  aceptado_cliente: '#22C55E',
  rechazado_cliente: '#EF4444',
  asignado_ruta: '#0EA5E9',
  en_ruta: '#2563EB',
  entregado: '#16A34A',
  cancelado: '#9CA3AF',
}

export type OrderItemPayload = {
  sku_id: string
  cantidad: number
  precio_unitario_final?: number
  descuento_item_tipo?: 'porcentaje' | 'monto_fijo'
  descuento_item_valor?: number
  requiere_aprobacion?: boolean
  origen_precio?: 'catalogo' | 'negociado'
}

export type CreateOrderPayload = {
  cliente_id?: string
  zona_id?: string
  metodo_pago: 'contado' | 'credito'
  descuento_pedido_tipo?: 'porcentaje' | 'monto_fijo'
  descuento_pedido_valor?: number
  fecha_entrega_sugerida?: string
  notas?: string
  items: OrderItemPayload[]
}

export type OrderResponse = {
  id: string
  numero_pedido?: string
  total?: number
  subtotal?: number
  impuesto?: number
  descuento_pedido_tipo?: 'porcentaje' | 'monto_fijo'
  descuento_pedido_valor?: number
  estado?: OrderStatus | string
  cliente_id?: string
  metodo_pago?: 'contado' | 'credito'
  origen?: string
  creado_por_id?: string
  creado_por?: string
  actualizado_por?: string
  creado_en?: string
  actualizado_en?: string
  fecha_entrega_sugerida?: string
}

export type Order = OrderResponse & {
  estado_actual?: OrderStatus
  created_at?: string
  detalles?: Array<{ id?: string }>
  codigo_visual?: string
  cliente?: { nombre_comercial?: string; razon_social?: string }
  total_final?: number
}

export type OrderFilters = {
  estado?: OrderStatus | string
  fecha_desde?: string
  fecha_hasta?: string
  page?: number
  limit?: number
}

export type OrderItemDetail = {
  id?: string
  sku_id?: string
  sku_nombre_snapshot?: string
  sku_codigo_snapshot?: string
  sku_peso_gramos_snapshot?: number
  sku_tipo_empaque_snapshot?: string
  cantidad_solicitada?: number
  precio_unitario_base?: number
  precio_unitario_final?: number
  descuento_item_tipo?: 'porcentaje' | 'monto_fijo'
  descuento_item_valor?: number
  precio_origen?: 'catalogo' | 'negociado'
  requiere_aprobacion?: boolean
  aprobado_por?: string
  aprobado_en?: string
  subtotal?: number
}

export type OrderDetail = {
  pedido?: OrderResponse
  items?: OrderItemDetail[]
  historial?: OrderHistoryItem[]
}

export type OrderHistoryItem = {
  estado?: string
  cambiado_por_id?: string
  motivo?: string
  creado_en?: string
}

export type OrderListItem = OrderResponse & {
  metodo_pago?: 'contado' | 'credito'
  estado?: string
  items?: OrderItemDetail[]
}

export type OrderValidationItem = {
  id?: string
  item_pedido_id?: string
  estado_resultado?: 'aprobado' | 'aprobado_parcial' | 'sustituido' | 'rechazado'
  sku_aprobado_id?: string | null
  sku_aprobado_nombre_snapshot?: string | null
  sku_aprobado_codigo_snapshot?: string | null
  cantidad_aprobada?: number | null
  motivo?: string | null
}

export type OrderValidation = {
  id: string
  pedido_id: string
  numero_version?: number
  validado_por_id?: string
  validado_en?: string
  requiere_aceptacion_cliente?: boolean
  items?: OrderValidationItem[]
}

export type OrderAdjustmentPayload = {
  pedido_id: string
  validacion_id: string
  cliente_id: string
  accion: 'acepta' | 'rechaza'
  comentario?: string
}

export type OrderValidationItemResult = {
  item_pedido_id: string
  estado_resultado: 'aprobado' | 'aprobado_parcial' | 'sustituido' | 'rechazado'
  sku_aprobado_id?: string
  cantidad_aprobada?: number
  motivo: string
}

export type OrderValidationPayload = {
  pedido_id?: string
  bodeguero_id: string
  observaciones?: string
  items_resultados: OrderValidationItemResult[]
}

const ORDER_BASE_URL = env.api.orderUrl
const ORDER_API_URL =
  ORDER_BASE_URL.endsWith('/api/v1')
    ? ORDER_BASE_URL
    : ORDER_BASE_URL.endsWith('/api')
      ? `${ORDER_BASE_URL}/v1`
      : `${ORDER_BASE_URL}/api/v1`

const unwrapList = <T>(data: any): T[] => {
  if (!data) return []
  if (Array.isArray(data)) return data as T[]
  if (Array.isArray(data.data)) return data.data as T[]
  return []
}

const rawService = {
  async createOrder(payload: CreateOrderPayload): Promise<OrderResponse | null> {
    try {
      return await ApiService.post<OrderResponse>(`${ORDER_API_URL}/orders`, payload)
    } catch (error) {
      logErrorForDebugging(error, 'OrderService.createOrder')
      return null
    }
  },

  async getOrderById(orderId: string): Promise<OrderResponse | null> {
    try {
      return await ApiService.get<OrderResponse>(`${ORDER_API_URL}/orders/${orderId}`)
    } catch (error) {
      logErrorForDebugging(error, 'OrderService.getOrderById', { orderId })
      return null
    }
  },

  async getOrderDetail(orderId: string): Promise<OrderDetail | null> {
    try {
      const data = await ApiService.get<any>(`${ORDER_API_URL}/orders/${orderId}`)
      if (data?.pedido) {
        return data as OrderDetail
      }
      if (data?.id) {
        return { pedido: data as OrderResponse, items: data.items || [], historial: data.historial || [] }
      }
      if (Array.isArray(data?.items) && data?.cliente_id) {
        return { pedido: data as OrderResponse, items: data.items || [], historial: data.historial || [] }
      }
      return null
    } catch (error) {
      logErrorForDebugging(error, 'OrderService.getOrderDetail', { orderId })
      return null
    }
  },

  async getOrders(): Promise<OrderListItem[]> {
    try {
      const data = await ApiService.get<any>(`${ORDER_API_URL}/orders`)
      return unwrapList<OrderListItem>(data)
    } catch (error) {
      logErrorForDebugging(error, 'OrderService.getOrders')
      return []
    }
  },

  async getMyOrders(): Promise<OrderListItem[]> {
    try {
      const data = await ApiService.get<any>(`${ORDER_API_URL}/orders/my-orders`)
      return unwrapList<OrderListItem>(data)
    } catch (error) {
      logErrorForDebugging(error, 'OrderService.getMyOrders')
      return []
    }
  },

  async cancelOrder(orderId: string, motivo?: string): Promise<boolean> {
    try {
      await ApiService.put(`${ORDER_API_URL}/orders/${orderId}/cancel`, {
        motivo: motivo || 'Pedido cancelado por rechazo de credito',
      })
      return true
    } catch (error) {
      logErrorForDebugging(error, 'OrderService.cancelOrder', { orderId })
      return false
    }
  },

  async updatePaymentMethod(orderId: string, metodo_pago: 'contado' | 'credito'): Promise<boolean> {
    try {
      await ApiService.patch(`${ORDER_API_URL}/orders/${orderId}/metodo-pago`, { metodo_pago })
      return true
    } catch (error) {
      logErrorForDebugging(error, 'OrderService.updatePaymentMethod', { orderId })
      return false
    }
  },

  async getPendingValidationOrders(limit?: number): Promise<OrderListItem[]> {
    try {
      const query = typeof limit === 'number' ? `?limit=${limit}` : ''
      const data = await ApiService.get<any>(`${ORDER_API_URL}/orders/pending-validation${query}`)
      return unwrapList<OrderListItem>(data)
    } catch (error) {
      logErrorForDebugging(error, 'OrderService.getPendingValidationOrders')
      return []
    }
  },

  async validateOrder(orderId: string, payload: OrderValidationPayload): Promise<boolean> {
    try {
      await ApiService.post(`${ORDER_API_URL}/orders/${orderId}/validar`, payload)
      return true
    } catch (error) {
      logErrorForDebugging(error, 'OrderService.validateOrder', { orderId })
      return false
    }
  },

  async getOrderValidations(orderId: string): Promise<OrderValidation[]> {
    try {
      return await ApiService.get<OrderValidation[]>(`${ORDER_API_URL}/validations/order/${orderId}`)
    } catch (error) {
      logErrorForDebugging(error, 'OrderService.getOrderValidations', { orderId })
      return []
    }
  },

  async respondToAdjustment(orderId: string, payload: OrderAdjustmentPayload): Promise<boolean> {
    try {
      await ApiService.post(`${ORDER_API_URL}/orders/${orderId}/responder-ajuste`, payload)
      return true
    } catch (error) {
      logErrorForDebugging(error, 'OrderService.respondToAdjustment', { orderId })
      return false
    }
  },

  async getPendingPromoApprovals(): Promise<OrderListItem[]> {
    try {
      const data = await ApiService.get<any>(`${ORDER_API_URL}/orders/promociones-pendientes`)
      return unwrapList<OrderListItem>(data)
    } catch (error) {
      logErrorForDebugging(error, 'OrderService.getPendingPromoApprovals')
      return []
    }
  },

  async getOrdersByZoneDate(params: { zona_id: string; fecha_entrega: string; estado?: string; limit?: number }): Promise<OrderListItem[]> {
    try {
      const search = new URLSearchParams()
      search.set('zona_id', params.zona_id)
      search.set('fecha_entrega', params.fecha_entrega)
      if (params.estado) search.set('estado', params.estado)
      if (typeof params.limit === 'number') search.set('limit', String(params.limit))
      const data = await ApiService.get<any>(`${ORDER_API_URL}/orders/zona?${search.toString()}`)
      return unwrapList<OrderListItem>(data)
    } catch (error) {
      logErrorForDebugging(error, 'OrderService.getOrdersByZoneDate')
      return []
    }
  },

  async approvePromotions(orderId: string, payload: { approve_all?: boolean; item_ids?: string[] }): Promise<boolean> {
    try {
      await ApiService.post(`${ORDER_API_URL}/orders/${orderId}/aprobar-promociones`, payload)
      return true
    } catch (error) {
      logErrorForDebugging(error, 'OrderService.approvePromotions', { orderId })
      return false
    }
  },

  async rejectPromotions(orderId: string, payload: { reject_all?: boolean; item_ids?: string[] }): Promise<boolean> {
    try {
      await ApiService.post(`${ORDER_API_URL}/orders/${orderId}/rechazar-promociones`, payload)
      return true
    } catch (error) {
      logErrorForDebugging(error, 'OrderService.rejectPromotions', { orderId })
      return false
    }
  },
}

export const OrderService = createService('OrderService', rawService)
