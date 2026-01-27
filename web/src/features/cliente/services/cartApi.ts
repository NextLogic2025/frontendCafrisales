// import { httpOrders } from '../../../services/api/http'

export type BackendCartItem = {
  id?: string
  carrito_id?: string
  producto_id: string
  cantidad: number
  precio_unitario_ref?: number | null
  precio_final?: number | null
  producto_nombre?: string | null
  // SKU fields
  selected_sku_id?: string
  sku_code?: string
  presentacion?: string
}

export type BackendCart = {
  id: string
  usuario_id?: string
  cliente_id?: string | null
  items: BackendCartItem[]
  removed_items?: Array<{ producto_id: string; campania_aplicada_id?: number | null }>
  warnings?: Array<{ issue: string }>
}

type UpdateCartItemDto = {
  producto_id: string
  cantidad: number
  campania_aplicada_id?: number | null
  motivo_descuento?: string | null
  referido_id?: string | null
  precio_unitario_ref?: number | null
  cliente_id?: string | null
  selected_sku_id?: string
  sku_code?: string
  presentacion?: string
}

export async function getCart(clienteId?: string | null): Promise<BackendCart | null> {
  // Mock empty cart
  return {
    id: 'mock-cart-id',
    items: [],
    usuario_id: 'mock-user',
    cliente_id: clienteId
  }
}

export async function upsertCartItem(dto: UpdateCartItemDto): Promise<BackendCart | null> {
  // Mock success
  return {
    id: 'mock-cart-id',
    items: [], // In a real mock this would reflect the added item
    usuario_id: 'mock-user',
    cliente_id: dto.cliente_id
  }
}

export async function clearCartRemote(clienteId?: string | null): Promise<void> {
  // Mock success
  return Promise.resolve()
}

export async function removeFromCart(productId: string, clienteId?: string | null) {
  // Mock success
  return Promise.resolve()
}
