import { EstadoPedido, EstadoFactura, EstadoTicket, PrioridadTicket } from '../features/cliente/types'

// Formateo de estados de pedido
export function formatEstadoPedido(estado: EstadoPedido | string): string {
  const status = String(estado || '').toUpperCase()

  const labels: Record<string, string> = {
    'PENDING': 'Pendiente',
    'PENDIENTE': 'Pendiente',
    'PENDIENTE_VALIDACION': 'Pendiente Validación',
    'PENDING_VALIDATION': 'Pendiente Validación',
    'APPROVED': 'Aprobado',
    'APROBADO': 'Aprobado',
    'In_PREPARATION': 'En preparación',
    'EN_PREPARACION': 'En preparación',
    'IN_TRANSIT': 'En ruta',
    'EN_RUTA': 'En ruta',
    'DELIVERED': 'Entregado',
    'ENTREGADO': 'Entregado',
    'CANCELLED': 'Cancelado',
    'CANCELADO': 'Cancelado',
  }

  return labels[status] || estado.toString().replace(/_/g, ' ')
}

// Colores para estados de pedido
export function getEstadoPedidoColor(estado: EstadoPedido | string): string {
  const status = String(estado || '').toUpperCase()

  // Map common statuses to colors
  if (status === 'PENDIENTE_VALIDACION' || status === 'PENDIENTE' || status === 'PENDING') return '#F59E0B' // Amber/Yellow
  if (status === 'APROBADO' || status === 'APPROVED' || status === 'DELIVERED' || status === 'ENTREGADO') return '#10B981' // Emerald/Green
  if (status === 'CANCELADO' || status === 'CANCELLED') return '#EF4444' // Red
  if (status === 'EN_PREPARACION' || status === 'IN_PREPARATION' || status === 'EN_RUTA' || status === 'IN_TRANSIT') return '#3B82F6' // Blue

  return '#6B7280' // Gray default
}

// Config de estados de factura
export const facturaStatusConfig: Record<EstadoFactura, { label: string; color: string }> = {
  [EstadoFactura.PAID]: { label: 'Pagada', color: 'bg-emerald-100 text-emerald-800' },
  [EstadoFactura.PENDING]: { label: 'Pendiente', color: 'bg-blue-100 text-blue-800' },
  [EstadoFactura.OVERDUE]: { label: 'Vencida', color: 'bg-red-100 text-red-800' },
  [EstadoFactura.CANCELLED]: { label: 'Cancelada', color: 'bg-gray-100 text-gray-800' },
}

// Config de estados de ticket
export const ticketStatusConfig: Record<EstadoTicket, { label: string; color: string }> = {
  [EstadoTicket.OPEN]: { label: 'Abierto', color: 'bg-blue-100 text-blue-800' },
  [EstadoTicket.IN_PROGRESS]: { label: 'En proceso', color: 'bg-yellow-100 text-yellow-800' },
  [EstadoTicket.RESOLVED]: { label: 'Resuelto', color: 'bg-emerald-100 text-emerald-800' },
  [EstadoTicket.CLOSED]: { label: 'Cerrado', color: 'bg-gray-100 text-gray-800' },
}

// Config de prioridad de ticket
export const ticketPriorityConfig: Record<PrioridadTicket, { label: string; color: string; bg: string }> = {
  low: { label: 'Baja', color: 'text-gray-600', bg: 'bg-gray-100' },
  medium: { label: 'Media', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  high: { label: 'Alta', color: 'text-brand-red', bg: 'bg-red-100' },
}
