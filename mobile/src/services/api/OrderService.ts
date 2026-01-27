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
}

export const OrderService = createService('OrderService', rawService)
