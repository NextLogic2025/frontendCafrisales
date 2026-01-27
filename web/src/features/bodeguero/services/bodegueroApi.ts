// import { httpOrders } from '../../../services/api/http'

// Reuse types from supervisor's pedidosApi
export interface DetallePedido {
    id: string
    pedido_id: string
    producto_id: string
    codigo_sku: string
    nombre_producto: string
    cantidad: string
    unidad_medida: string
    precio_lista: string
    precio_final: string
    es_bonificacion: boolean
    motivo_descuento: string | null
    campania_aplicada_id: number | null
    subtotal_linea: string
    created_at: string
    updated_at: string
}

export interface Pedido {
    id: string
    codigo_visual: number
    cliente_id: string
    vendedor_id: string
    sucursal_id: string | null
    estado_actual: 'PENDIENTE' | 'APROBADO' | 'EN_PREPARACION' | 'FACTURADO' | 'EN_RUTA' | 'ENTREGADO' | 'ANULADO'
    subtotal: string
    descuento_total: string
    impuestos_total: string
    total_final: string
    monto_pagado: string
    estado_pago: 'PENDIENTE' | 'PAGADO' | 'PARCIAL'
    condicion_pago: 'CONTADO' | 'CREDITO'
    fecha_entrega_solicitada: string | null
    origen_pedido: string
    ubicacion_pedido: string | null
    observaciones_entrega: string | null
    created_at: string
    updated_at: string
    deleted_at: string | null
    detalles?: DetallePedido[]
    // Campos adicionales que pueden venir del backend
    cliente?: {
        id: string
        razon_social: string
        identificacion: string
    }
    vendedor?: {
        id: string
        nombreCompleto?: string
        email: string
    }
}

/**
 * Obtiene todos los pedidos del sistema
 */
export async function obtenerPedidos(): Promise<Pedido[]> {
    return []
}

/**
 * Obtiene un pedido específico por ID con sus detalles
 */
export async function obtenerPedidoPorId(id: string): Promise<Pedido> {
    return {
        id,
        codigo_visual: 1000,
        cliente_id: 'mock-client',
        vendedor_id: 'mock-seller',
        sucursal_id: null,
        estado_actual: 'PENDIENTE',
        subtotal: '0',
        descuento_total: '0',
        impuestos_total: '0',
        total_final: '0',
        monto_pagado: '0',
        estado_pago: 'PENDIENTE',
        condicion_pago: 'CONTADO',
        fecha_entrega_solicitada: null,
        origen_pedido: 'PORTAL',
        ubicacion_pedido: null,
        observaciones_entrega: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        detalles: []
    }
}

/**
 * Cambia el estado de un pedido a EN_PREPARACION
 */
export async function iniciarPreparacion(id: string): Promise<Pedido> {
    return obtenerPedidoPorId(id).then(p => ({ ...p, estado_actual: 'EN_PREPARACION' }))
}
