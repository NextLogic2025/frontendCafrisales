import { BRAND_COLORS } from '../../theme/brandColors'

export type PrioridadTicket = 'low' | 'medium' | 'high'

export interface PerfilCliente {
  id: string
  contactName: string
  currentDebt: number
  creditLimit: number
  direccion?: string
  direccion_texto?: string
  ciudad?: string
  estado?: string
}

export interface SucursalCliente {
  id: string
  nombre: string
  direccion?: string | null
  ciudad?: string | null
  estado?: string | null
}

export interface Producto {
  id: string
  name: string
  description: string
  // `price` represents the effective unit price the customer will pay
  price: number
  // Optional fields provided by the catalog service when there are promotions
  precio_original?: number | null
  precio_oferta?: number | null
  ahorro?: number | null
  promociones?: any[]
  campania_aplicada_id?: number | null
  image?: string
  category: string
  inStock: boolean
  skus?: any[]
}

export enum EstadoFactura {
  PAID = 'PAID',
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export interface ItemFactura {
  id: string
  productId: string
  quantity: number
  unitPrice: number
}

export interface Factura {
  id: string
  invoiceNumber: string
  date: string
  dueDate: string
  status: EstadoFactura
  total: number
  items: ItemFactura[]
  customerId: string
  notes?: string
}

export type EstadoEntrega = 'pending' | 'in_transit' | 'delivered' | 'issue'

export interface Entrega {
  id: string
  orderId: string
  customerId: string
  address: string
  city: string
  state: string
  zipCode: string
  deliveryDate: string
  estimatedDeliveryDate: string
  currentStatus?: EstadoEntrega
  trackingNumber?: string
  carrier?: string
  notes?: string
}

export enum EstadoPedido {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  IN_PREPARATION = 'IN_PREPARATION',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  // Backend statuses
  PENDIENTE = 'pendiente',
  PENDIENTE_VALIDACION = 'pendiente_validacion',
  VALIDADO = 'validado',
  AJUSTADO_BODEGA = 'ajustado_bodega',
  ACEPTADO_CLIENTE = 'aceptado_cliente',
  RECHAZADO_CLIENTE = 'rechazado_cliente',
  EN_PREPARACION = 'en_preparacion',
  EN_RUTA = 'en_ruta',
  ENTREGADO = 'entregado',
  CANCELADO = 'cancelado',
}

export interface ItemPedido {
  id: string
  productName: string
  quantity: number
  cantidad?: number
  unit: string
  unitPrice: number
  precio_unitario_final?: number
  subtotal: number
  cantidad_solicitada?: number | null
  motivo_ajuste?: string | null
  descuento_item_valor?: number
  descuento_item_tipo?: 'porcentaje' | 'monto' | 'fijo'
  origen_precio?: 'catalogo' | 'negociado'
}

export interface Pedido {
  id: string
  orderNumber: string
  numero_pedido?: string
  createdAt: string
  creado_en?: string
  totalAmount: number
  total?: number
  status: EstadoPedido
  estado?: EstadoPedido | string
  items: ItemPedido[]
  cliente_id?: string
  zona_id?: string
  metodo_pago?: string
  // Global discount
  descuento_pedido_valor?: number
  descuento_pedido_tipo?: 'porcentaje' | 'monto' | 'fijo'
  validaciones?: ValidacionBodega[]
}

export interface ValidacionBodega {
  id: string
  pedido_id: string
  bodeguero_id: string
  items: ItemValidacion[]
  observaciones?: string
  estado_validacion?: string
  requiere_aceptacion_cliente: boolean
  creado_en: string
}

export interface ItemValidacion {
  id: string
  validacion_id: string
  item_pedido_id: string
  estado_resultado: 'aprobado' | 'aprobado_parcial' | 'sustituido' | 'rechazado'
  sku_aprobado_id?: string
  sku_aprobado_nombre_snapshot?: string
  sku_aprobado_codigo_snapshot?: string
  cantidad_aprobada?: number
  motivo: string
}

export enum TipoNotificacion {
  ORDER = 'ORDER',
  INVOICE = 'INVOICE',
  DELIVERY = 'DELIVERY',
  PROMOTIONAL = 'PROMOTIONAL',
  SYSTEM = 'SYSTEM',
  SUPPORT = 'SUPPORT',
}

export interface Notificacion {
  id: string
  customerId: string
  type: TipoNotificacion
  title: string
  message: string
  read: boolean
  createdAt: string
  relatedId?: string | null
}

export interface Conversacion {
  id: string
  vendorName: string
  lastMessage?: string
  unreadCount: number
}

export interface Mensaje {
  id: string
  content: string
  createdAt: string
  isOwn?: boolean
}

export enum EstadoTicket {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export interface MensajeTicket {
  id: string
  ticketId: string
  senderName: string
  message: string
  sentAt: string
  isCustomer: boolean
}

export interface Ticket {
  id: string
  title: string
  description: string
  category: string
  priority: PrioridadTicket
  status: EstadoTicket
  customerId: string
  createdAt: string
  updatedAt: string
  messages: MensajeTicket[]
}

export const COLORES_MARCA = BRAND_COLORS
