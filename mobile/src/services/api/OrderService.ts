import { env } from '../../config/env'
import { ApiService } from './ApiService'
import { createService } from './createService'
import { logErrorForDebugging } from '../../utils/errorMessages'

export type OrderItemPayload = {
  sku_id: string
  cantidad: number
  precio_unitario_final?: number
  descuento_item_tipo?: 'porcentaje' | 'monto' | 'fijo'
  descuento_item_valor?: number
  requiere_aprobacion?: boolean
  origen_precio?: 'catalogo' | 'negociado'
}

export type CreateOrderPayload = {
  cliente_id?: string
  zona_id?: string
  metodo_pago: 'contado' | 'credito'
  descuento_pedido_tipo?: 'porcentaje' | 'monto' | 'fijo'
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
}

export type OrderItemDetail = {
  id?: string
  sku_id?: string
  sku_nombre_snapshot?: string
  sku_codigo_snapshot?: string
  sku_peso_gramos_snapshot?: number
  sku_tipo_empaque_snapshot?: string
  cantidad_solicitada?: number
  precio_unitario_final?: number
  subtotal?: number
}

export type OrderDetail = {
  pedido?: OrderResponse
  items?: OrderItemDetail[]
}

export type OrderListItem = OrderResponse & {
  metodo_pago?: 'contado' | 'credito'
  estado?: string
  items?: OrderItemDetail[]
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
        return { pedido: data as OrderResponse, items: data.items || [] }
      }
      if (Array.isArray(data?.items) && data?.cliente_id) {
        return { pedido: data as OrderResponse, items: data.items || [] }
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
}

export const OrderService = createService('OrderService', rawService)
