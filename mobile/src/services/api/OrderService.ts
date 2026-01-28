import { env } from '../../config/env'
import { ApiService } from './ApiService'
import { createService } from './createService'
import { logErrorForDebugging } from '../../utils/errorMessages'

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
  descuento_pedido_valor?: number
  estado?: string
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
const ORDER_API_URL = ORDER_BASE_URL.endsWith('/api') ? ORDER_BASE_URL : `${ORDER_BASE_URL}/api`

const rawService = {
  async createOrder(payload: CreateOrderPayload): Promise<OrderResponse | null> {
    try {
      return await ApiService.post<OrderResponse>(`${ORDER_API_URL}/pedidos`, payload)
    } catch (error) {
      logErrorForDebugging(error, 'OrderService.createOrder')
      return null
    }
  },

  async getOrderById(orderId: string): Promise<OrderResponse | null> {
    try {
      return await ApiService.get<OrderResponse>(`${ORDER_API_URL}/pedidos/${orderId}`)
    } catch (error) {
      logErrorForDebugging(error, 'OrderService.getOrderById', { orderId })
      return null
    }
  },

  async getOrderDetail(orderId: string): Promise<OrderDetail | null> {
    try {
      const data = await ApiService.get<any>(`${ORDER_API_URL}/pedidos/${orderId}`)
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
      return await ApiService.get<OrderListItem[]>(`${ORDER_API_URL}/pedidos`)
    } catch (error) {
      logErrorForDebugging(error, 'OrderService.getOrders')
      return []
    }
  },

  async getMyOrders(): Promise<OrderListItem[]> {
    try {
      return await ApiService.get<OrderListItem[]>(`${ORDER_API_URL}/pedidos/my-orders`)
    } catch (error) {
      logErrorForDebugging(error, 'OrderService.getMyOrders')
      return []
    }
  },

  async cancelOrder(orderId: string, motivo?: string): Promise<boolean> {
    try {
      await ApiService.patch(`${ORDER_API_URL}/pedidos/${orderId}/cancel`, {
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
      await ApiService.patch(`${ORDER_API_URL}/pedidos/${orderId}/metodo-pago`, { metodo_pago })
      return true
    } catch (error) {
      logErrorForDebugging(error, 'OrderService.updatePaymentMethod', { orderId })
      return false
    }
  },

  async getPendingValidationOrders(limit?: number): Promise<OrderListItem[]> {
    try {
      const query = typeof limit === 'number' ? `?limit=${limit}` : ''
      return await ApiService.get<OrderListItem[]>(`${ORDER_API_URL}/pedidos/pending-validation${query}`)
    } catch (error) {
      logErrorForDebugging(error, 'OrderService.getPendingValidationOrders')
      return []
    }
  },

  async validateOrder(orderId: string, payload: OrderValidationPayload): Promise<boolean> {
    try {
      await ApiService.post(`${ORDER_API_URL}/pedidos/${orderId}/validar`, payload)
      return true
    } catch (error) {
      logErrorForDebugging(error, 'OrderService.validateOrder', { orderId })
      return false
    }
  },

  async getPendingPromoApprovals(): Promise<OrderListItem[]> {
    try {
      return await ApiService.get<OrderListItem[]>(`${ORDER_API_URL}/pedidos/promociones-pendientes`)
    } catch (error) {
      logErrorForDebugging(error, 'OrderService.getPendingPromoApprovals')
      return []
    }
  },

  async approvePromotions(orderId: string, payload: { approve_all?: boolean; item_ids?: string[] }): Promise<boolean> {
    try {
      await ApiService.patch(`${ORDER_API_URL}/pedidos/${orderId}/aprobar-promociones`, payload)
      return true
    } catch (error) {
      logErrorForDebugging(error, 'OrderService.approvePromotions', { orderId })
      return false
    }
  },

  async rejectPromotions(orderId: string, payload: { reject_all?: boolean; item_ids?: string[] }): Promise<boolean> {
    try {
      await ApiService.patch(`${ORDER_API_URL}/pedidos/${orderId}/rechazar-promociones`, payload)
      return true
    } catch (error) {
      logErrorForDebugging(error, 'OrderService.rejectPromotions', { orderId })
      return false
    }
  },
}

export const OrderService = createService('OrderService', rawService)
