// import { httpCatalogo, httpUsuarios, httpOrders } from '../../../services/api/http'
import { env } from '../../../config/env'
import { getToken } from '../../../services/storage/tokenStorage'
import {
  EstadoPedido,
} from '../types'
import type {
  PerfilCliente,
  Pedido,
  Factura,
  Entrega,
  Producto,
  Notificacion,
  Conversacion,
  Ticket,
  SucursalCliente,
} from '../types'

type ClienteContext = {
  usuarioId: string | null
  clienteId: string | null
  listaPreciosId: number | null
  usuario?: Record<string, unknown> | null
}

let cachedContext: ClienteContext | null = null
let contextPromise: Promise<ClienteContext | null> | null = null

export async function getClienteContext(forceRefresh = false): Promise<ClienteContext | null> {
  // Mock context
  return {
    usuarioId: 'mock-user-id',
    clienteId: 'mock-client-id',
    listaPreciosId: 1,
    usuario: { nombreCompleto: 'Usuario Demo' }
  }
}

export function clearClienteContextCache() {
  cachedContext = null
}

async function fetchClienteDetalleByCandidates(candidates: (string | null | undefined)[]): Promise<any | null> {
  return null
}

export async function fetchClienteByUsuarioId(possibleId: string) {
  return null
}

export async function getPerfilCliente(): Promise<PerfilCliente | null> {
  return {
    id: 'mock-client-id',
    contactName: 'Cliente Demo',
    currentDebt: 0,
    creditLimit: 1000,
  }
}

export async function getPedidos(page = 1): Promise<{ items: Pedido[]; page: number; totalPages: number }> {
  return { items: [], page: 1, totalPages: 1 }
}

export async function getPedidoDetalle(pedidoId: string): Promise<Pedido> {
  return {
    id: pedidoId,
    orderNumber: pedidoId,
    createdAt: new Date().toISOString(),
    totalAmount: 0,
    status: EstadoPedido.PENDING,
    items: []
  }
}

export async function deletePedido(orderId: string): Promise<boolean> {
  return true
}

export async function getFacturas(): Promise<Factura[]> {
  return []
}

export async function getEntregas(): Promise<Entrega[]> {
  return []
}

export async function getProductos(options?: { page?: number; per_page?: number; category?: string; categoryId?: number }): Promise<Producto[]> {
  return []
}

export async function getNotificaciones(): Promise<Notificacion[]> {
  return []
}

export async function getConversaciones(): Promise<Conversacion[]> {
  return []
}

export async function getTickets(): Promise<Ticket[]> {
  return []
}

export async function getSucursalesCliente(): Promise<SucursalCliente[]> {
  return []
}

export async function createTicket(_: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'messages'>): Promise<Ticket> {
  throw new Error('La creación de tickets no está disponible en este entorno')
}

export async function createPedido(
  items: { id: string; name: string; unitPrice: number; quantity: number }[],
  total: number,
): Promise<Pedido> {
  return {
    id: 'mock-order-id',
    orderNumber: '1000',
    createdAt: new Date().toISOString(),
    totalAmount: total,
    status: EstadoPedido.PENDING,
    items: items.map(i => ({
      id: i.id,
      productName: i.name,
      quantity: i.quantity,
      unit: 'UN',
      unitPrice: i.unitPrice,
      subtotal: i.unitPrice * i.quantity
    }))
  }
}

type CondicionPago = 'CONTADO' | 'CREDITO' | 'TRANSFERENCIA' | 'CHEQUE'

export async function createPedidoFromCart(options?: { condicionPago?: CondicionPago; sucursalId?: string | null }): Promise<Pedido> {
  return {
    id: 'mock-order-id',
    orderNumber: '1000',
    createdAt: new Date().toISOString(),
    totalAmount: 0,
    status: EstadoPedido.PENDING,
    items: []
  }
}
