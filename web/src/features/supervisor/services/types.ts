export interface ClienteRutero {
  id: string
  nombre?: string | null
  razon_social: string
  nombre_comercial?: string | null
  zona_comercial_id?: number | null
  zona_comercial?: { id?: number | null; nombre?: string | null } | null
  prioridad?: 'ALTA' | 'MEDIA' | 'BAJA'
  frecuencia?: 'SEMANAL' | 'QUINCENAL' | 'MENSUAL'
  orden?: number
  hora_estimada?: string | null
  activo?: boolean
  ruteroId?: string | null
  fueraDeZona?: boolean
  zonaAsignadaId?: number | null
  zonaAsignadaNombre?: string | null
  ubicacion_gps?: {
    type: 'Point'
    coordinates: [number, number]
  } | null
  sucursales?: SucursalRutero[]
  tipo_direccion?: 'PRINCIPAL' | 'SUCURSAL'
  sucursal_id?: string | null
}

export interface SucursalRutero {
  id: string
  nombre_sucursal: string
  ubicacion_gps?: {
    type: 'Point'
    coordinates: [number, number]
  } | null
  zona_id?: number | null
}

export interface RuteroPlanificado {
  id?: string
  cliente_id: string
  zona_id: number
  dia_semana: DiaSemana
  frecuencia: 'SEMANAL' | 'QUINCENAL' | 'MENSUAL'
  prioridad_visita: 'ALTA' | 'MEDIA' | 'BAJA'
  orden_sugerido: number
  hora_estimada: string | null
  activo: boolean
  created_by?: string
  updated_at?: string
  tipo_direccion?: 'PRINCIPAL' | 'SUCURSAL'
  sucursal_id?: string | null
  sucursal_nombre?: string | null
  ubicacion_gps?: {
    type: 'Point'
    coordinates: [number, number]
  } | null
}

export type DiaSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES'

export const DIAS_SEMANA: DiaSemana[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']

export const PRIORIDAD_COLORS = {
  ALTA: 'bg-red-100 text-red-800 border-red-300',
  MEDIA: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  BAJA: 'bg-green-100 text-green-800 border-green-300',
} as const

// ============================================
// LOGISTICS ROUTE TYPES
// ============================================

export type EstadoRutero = 'borrador' | 'publicado' | 'en_curso' | 'completado' | 'cancelado'

export interface ParadaRutero {
  id: string
  rutero_logistico_id: string
  pedido_id: string
  orden_entrega: number
  estado_entrega?: 'pendiente' | 'entregado' | 'problema'
  creado_en?: string
  actualizado_en?: string
  // Información del pedido (populated)
  pedido?: {
    id: string
    numero_pedido: string
    cliente_id: string
    cliente_nombre?: string
    direccion_entrega?: string
    ubicacion_gps?: {
      type: 'Point'
      coordinates: [number, number]
    }
    total?: number
    estado?: string
    zona_id?: string
  }
}

export interface HistorialEstadoRutero {
  id: string
  rutero_logistico_id: string
  estado: EstadoRutero
  cambiado_por: string
  cambiado_en: string
  observaciones?: string | null
  // Usuario info (populated)
  usuario?: {
    id: string
    nombre: string
    apellido: string
  }
}

export interface RuteroLogistico {
  id: string
  transportista_id: string
  vehiculo_id: string
  zona_id: string
  estado: EstadoRutero
  fecha_programada?: string | null
  creado_en: string
  actualizado_en: string
  creado_por: string
  publicado_en?: string | null
  publicado_por?: string | null
  iniciado_en?: string | null
  iniciado_por?: string | null
  completado_en?: string | null
  completado_por?: string | null
  cancelado_en?: string | null
  cancelado_por?: string | null
  cancelado_motivo?: string | null
  // Populated fields
  transportista?: {
    id: string
    nombre: string
    apellido: string
    email?: string
  }
  vehiculo?: {
    id: string
    placa: string
    modelo?: string | null
    capacidad_kg?: number | null
    estado: string
  }
  zona?: {
    id: string | number
    nombre: string
  }
  paradas?: ParadaRutero[]
  historial?: HistorialEstadoRutero[]
}

export interface CreateRuteroLogisticoPayload {
  fecha_rutero: string
  zona_id: string
  vehiculo_id: string
  transportista_id: string
  paradas: Array<{
    pedido_id: string
    orden_entrega: number
  }>
}

export interface AddOrderToRuteroPayload {
  pedido_id: string
  orden_entrega: number
}

export interface UpdateVehiclePayload {
  vehiculo_id: string
}

export interface CancelRuteroPayload {
  motivo: string
}

export const ESTADO_RUTERO_COLORS: Record<EstadoRutero, string> = {
  borrador: 'bg-gray-100 text-gray-800 border-gray-300',
  publicado: 'bg-blue-100 text-blue-800 border-blue-300',
  en_curso: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  completado: 'bg-green-100 text-green-800 border-green-300',
  cancelado: 'bg-red-100 text-red-800 border-red-300',
}

export const ESTADO_RUTERO_LABELS: Record<EstadoRutero, string> = {
  borrador: 'Borrador',
  publicado: 'Publicado',
  en_curso: 'En Curso',
  completado: 'Completado',
  cancelado: 'Cancelado',
}

