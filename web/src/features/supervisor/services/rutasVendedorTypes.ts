// ========================================
// SALES ROUTES TYPES
// ========================================

export interface RutaVendedor {
    id: string
    vendedor_id: string
    vendedor?: {
        id: string
        nombre: string
        email: string
    }
    fecha_programada?: string
    estado: EstadoRuta
    paradas: ParadaRuta[]
    historial?: HistorialEstadoRuta[]
    creado_por_id: string
    creado_en: string
    actualizado_en: string
    publicado_en?: string
    iniciado_en?: string
    completado_en?: string
    cancelado_en?: string
    motivo_cancelacion?: string
}

export interface ParadaRuta {
    id: string
    ruta_id: string
    cliente_id: string
    cliente?: {
        id: string
        razon_social: string
        direccion?: string
        latitud?: number
        longitud?: number
    }
    orden_visita: number
    visitado: boolean
    fecha_visita?: string
    observaciones?: string
}

export interface HistorialEstadoRuta {
    id: string
    ruta_id: string
    estado: EstadoRuta
    usuario_id: string
    usuario?: {
        nombre: string
    }
    observaciones?: string
    creado_en: string
}

export type EstadoRuta = 'borrador' | 'publicado' | 'en_curso' | 'completado' | 'cancelado'

export interface CreateRutaVendedorPayload {
    vendedor_id: string
    fecha_programada?: string
    clientes: {
        cliente_id: string
        orden_visita: number
    }[]
}

export interface UpdateVendedorPayload {
    vendedor_id: string
}

export interface AddClienteToRutaPayload {
    cliente_id: string
    orden_visita: number
}

export interface CancelarRutaPayload {
    motivo: string
}

// Estado colors (same as logistics routes)
export const ESTADO_RUTA_COLORS: Record<EstadoRuta, string> = {
    borrador: 'bg-gray-100 text-gray-700',
    publicado: 'bg-blue-100 text-blue-700',
    en_curso: 'bg-yellow-100 text-yellow-700',
    completado: 'bg-green-100 text-green-700',
    cancelado: 'bg-red-100 text-red-700',
}

export const ESTADO_RUTA_LABELS: Record<EstadoRuta, string> = {
    borrador: 'Borrador',
    publicado: 'Publicado',
    en_curso: 'En Curso',
    completado: 'Completado',
    cancelado: 'Cancelado',
}
