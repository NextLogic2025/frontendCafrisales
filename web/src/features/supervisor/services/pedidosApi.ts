import { env } from '../../../config/env'
import { getValidToken } from '../../../services/auth/authClient'

// Types mirroring Mobile OrderService.ts
export interface DetallePedido {
    id: string
    codigo_sku?: string
    nombre_producto?: string
    cantidad: number // mobile: number
    unidad_medida?: string // mobile: type unit
    precio_lista?: number // mobile uses precio_unitario_base
    precio_final: number // mobile: precio_unitario_final
    subtotal_linea: number // mobile: subtotal
    motivo_descuento?: string | null
    cantidad_solicitada?: number | null
    motivo_ajuste?: string | null
    // Negotiation fields
    descuento_item_valor?: number
    descuento_item_tipo?: 'porcentaje' | 'monto' | 'fijo'
    origen_precio?: 'catalogo' | 'negociado'
}

export interface Pedido {
    id: string
    numero_pedido?: string // Mobile uses numero_pedido
    codigo_visual?: string // Web UI uses this, mapping to numero_pedido or id
    cliente_id?: string
    zona_id?: string
    cliente?: {
        razon_social: string
        identificacion?: string
        direccion_texto?: string
        ubicacion_gps?: { type: 'Point'; coordinates: [number, number] }
    }
    vendedor?: {
        nombreCompleto?: string
        email?: string
    }
    estado_actual?: string // Mobile: estado
    estado?: string // Mobile field
    total_final: number // Mobile: total
    subtotal: number
    impuestos_total?: number // Mobile: impuesto
    descuento_total?: number // Mobile: descuento_pedido_valor
    descuento_pedido_tipo?: 'porcentaje' | 'monto' | 'fijo'
    descuento_pedido_valor?: number
    created_at: string
    condicion_pago?: 'CONTADO' | 'CREDITO' | string // Mobile: metodo_pago
    detalles?: DetallePedido[] // Mobile: items
    items?: any[]
}

const ORDERS_BASE_URL = env.api.orders
const ORDERS_API_URL = ORDERS_BASE_URL.endsWith('/api') ? ORDERS_BASE_URL : `${ORDERS_BASE_URL}/api`

import { obtenerClientes } from './clientesApi'

export async function obtenerPedidos(options: { skipClients?: boolean } = {}): Promise<Pedido[]> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const resPedidos = await fetch(`${ORDERS_API_URL}/v1/orders`, {
        headers: { Authorization: `Bearer ${token}` }
    })

    const clientesList = options.skipClients ? [] : await (obtenerClientes('todos').catch(() => []))

    if (!resPedidos.ok) {
        throw new Error('Error al obtener pedidos')
    }

    const responseData = await resPedidos.json()
    // Backend returns paginated response { data, meta }
    const dataPedidos = responseData.data || responseData
    const clientesMap = new Map<string, any>(clientesList.map((c: any) => [String(c.id), c]))

    return Array.isArray(dataPedidos) ? dataPedidos.map((p: any) => {
        const mapped = mapMobileToWebPedido(p)
        const clienteInfo = clientesMap.get(String(p.cliente_id))
        if (clienteInfo) {
            mapped.cliente = {
                razon_social: clienteInfo.razon_social || 'Cliente',
                identificacion: clienteInfo.identificacion || 'N/A'
            }
        }
        return mapped
    }) : []
}

import { obtenerClientePorId } from './clientesApi'

export async function obtenerPedidoPorId(id: string): Promise<Pedido | null> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${ORDERS_API_URL}/v1/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    })

    if (!res.ok) return null
    const data = await res.json()
    const rawPedido = data.pedido || data

    // Hydrate client if missing
    if (rawPedido.cliente_id) {
        try {
            const clienteInfo = await obtenerClientePorId(rawPedido.cliente_id)
            if (clienteInfo) {
                rawPedido.cliente = {
                    razon_social: clienteInfo.razon_social,
                    identificacion: clienteInfo.identificacion,
                    direccion_texto: clienteInfo.direccion_texto,
                    ubicacion_gps: clienteInfo.ubicacion_gps
                }
            }
        } catch (e) {
        }
    }

    return mapMobileToWebPedido(rawPedido)
}

// Mapper to adapt Mobile/Backend response to the Web UI expected structure
function mapMobileToWebPedido(raw: any): Pedido {
    return {
        id: raw.id,
        codigo_visual: raw.numero_pedido || raw.id.substring(0, 8),
        cliente_id: raw.cliente_id,
        zona_id: raw.zona_id,
        estado_actual: raw.estado,
        estado: raw.estado,
        total_final: Number(raw.total || 0),
        subtotal: Number(raw.subtotal || 0),
        impuestos_total: Number(raw.impuesto || 0),
        descuento_total: Number(raw.descuento_pedido_valor || 0),
        created_at: raw.creado_en || raw.created_at,
        condicion_pago: raw.metodo_pago ? raw.metodo_pago.toUpperCase() : 'CONTADO',
        // Map nested objects if backend returns them, otherwise they might be missing
        cliente: raw.cliente || { razon_social: 'Cargando...', identificacion: raw.cliente_id },
        vendedor: raw.vendedor || { nombreCompleto: raw.creado_por || 'Sistema', email: '' },
        detalles: (raw.items || []).map((item: any) => ({
            id: item.id || Math.random().toString(),
            codigo_sku: item.sku_codigo_snapshot || item.sku_id,
            nombre_producto: item.sku_nombre_snapshot || 'Producto',
            cantidad: Number(item.cantidad || 0),
            unidad_medida: item.sku_tipo_empaque_snapshot || 'unid',
            precio_final: Number(item.precio_unitario_final || 0),
            precio_lista: Number(item.precio_unitario_base || 0),
            subtotal_linea: Number(item.subtotal || 0),
            cantidad_solicitada: item.cantidad_solicitada,
            motivo_ajuste: item.motivo_ajuste,
            descuento_item_valor: item.descuento_item_valor,
            descuento_item_tipo: item.descuento_item_tipo,
            origen_precio: item.origen_precio
        })),
        descuento_pedido_tipo: raw.descuento_pedido_tipo,
        descuento_pedido_valor: raw.descuento_pedido_valor
    }
}

export async function cambiarEstadoPedido(id: string, nuevoEstado: string): Promise<void> {
    // Mobile logic uses cancelOrder for 'ANULADO'.
    // For Approval, we assume an endpoint exists or we implement generic update if backend supports it.
    // Given user instructions, if mobile only has cancel, maybe we only implement cancel?
    // But UI has 'Aprobar'. I will try a generic patch or specific based on intention.

    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    let url = ''
    let body = {}
    let method = ''

    if (nuevoEstado === 'ANULADO') {
        url = `${ORDERS_API_URL}/v1/orders/${id}/cancel`
        body = { motivo: 'Anulado desde Web Supervisor' }
        method = 'PUT'
    } else {
        // Fallback for approval if supported
        url = `${ORDERS_API_URL}/v1/orders/${id}/status`
        body = { estado: nuevoEstado }
        method = 'POST'
    }

    const res = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
    })

    if (!res.ok) {
        throw new Error('Error al cambiar estado')
    }
}
