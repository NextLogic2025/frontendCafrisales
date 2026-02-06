export type EstadoEntrega = 'pendiente' | 'en_ruta' | 'entregado' | 'entregado_completo' | 'entregado_parcial' | 'no_entregado' | 'cancelado'
export type TipoEvidencia = 'foto' | 'firma' | 'documento' | 'audio' | 'otro'
export type SeveridadIncidencia = 'baja' | 'media' | 'alta' | 'critica'

export interface Entrega {
    id: string
    rutero_logistico_id: string
    transportista_id: string
    pedido_id: string
    orden: number
    estado: EstadoEntrega
    fecha_entrega?: string | null
    observaciones?: string | null
    creado_en: string
    actualizado_en: string
    // Populated fields
    pedido?: any
    evidencias?: Evidencia[]
    incidencias?: Incidencia[]
}

export interface Evidencia {
    id: string
    entrega_id: string
    tipo: TipoEvidencia
    url: string
    mime_type?: string | null
    hash_archivo?: string | null
    tamano_bytes?: number | null
    descripcion?: string | null
    creado_en: string
    creado_por: string
}

export interface Incidencia {
    id: string
    entrega_id: string
    tipo_incidencia: string
    severidad: SeveridadIncidencia
    descripcion: string
    resuelto: boolean
    resolucion?: string | null
    reportado_por: string
    reportado_en: string
    resuelto_por?: string | null
    resuelto_en?: string | null
}

// Payloads
export interface CreateEntregasBatchPayload {
    rutero_logistico_id: string
    transportista_id: string
    paradas: Array<{
        pedido_id: string
        orden: number
    }>
}

export interface CompletarEntregaPayload {
    observaciones?: string
}

export interface CompletarParcialEntregaPayload {
    observaciones?: string
    items_entregados?: any[]
}

export interface NoEntregadoPayload {
    motivo: string
    observaciones?: string
}

export interface AgregarEvidenciaPayload {
    tipo: TipoEvidencia
    url: string
    mime_type?: string
    hash_archivo?: string
    tamano_bytes?: number
    descripcion?: string
}

export interface ReportarIncidenciaPayload {
    tipo_incidencia: string
    severidad: SeveridadIncidencia
    descripcion: string
}

export interface ResolverIncidenciaPayload {
    resolucion: string
}

// Color mappings
export const ESTADO_ENTREGA_COLORS: Record<EstadoEntrega, string> = {
    pendiente: 'bg-gray-100 text-gray-800 border-gray-300',
    en_ruta: 'bg-blue-100 text-blue-800 border-blue-300',
    entregado: 'bg-green-100 text-green-800 border-green-300',
    entregado_completo: 'bg-green-100 text-green-800 border-green-300',
    entregado_parcial: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    no_entregado: 'bg-red-100 text-red-800 border-red-300',
    cancelado: 'bg-neutral-100 text-neutral-800 border-neutral-300',
}

export const ESTADO_ENTREGA_LABELS: Record<EstadoEntrega, string> = {
    pendiente: 'Pendiente',
    en_ruta: 'En Ruta',
    entregado: 'Entregado',
    entregado_completo: 'Entregado',
    entregado_parcial: 'Entregado Parcial',
    no_entregado: 'No Entregado',
    cancelado: 'Cancelado',
}

export const SEVERIDAD_COLORS: Record<SeveridadIncidencia, string> = {
    baja: 'bg-blue-100 text-blue-800 border-blue-300',
    media: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    alta: 'bg-orange-100 text-orange-800 border-orange-300',
    critica: 'bg-red-100 text-red-800 border-red-300',
}

export const SEVERIDAD_LABELS: Record<SeveridadIncidencia, string> = {
    baja: 'Baja',
    media: 'Media',
    alta: 'Alta',
    critica: 'Crítica',
}
