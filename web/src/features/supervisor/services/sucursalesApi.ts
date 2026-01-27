export interface Sucursal {
  id: string
  cliente_id: string
  nombre_sucursal: string
  direccion_entrega: string | null
  ubicacion_gps?: { type: 'Point'; coordinates: [number, number] } | null
  contacto_nombre: string | null
  contacto_telefono: string | null
  activo: boolean
  created_at: string
  updated_at: string
  zona_id?: number | null
  zona_nombre?: string | null
}

export interface CreateSucursalDto {
  cliente_id: string
  nombre_sucursal: string
  direccion_entrega?: string
  ubicacion_gps?: { type: 'Point'; coordinates: [number, number] }
  contacto_nombre?: string
  contacto_telefono?: string
  activo?: boolean
  zona_id?: number
}

export interface UpdateSucursalDto {
  nombre_sucursal?: string
  direccion_entrega?: string
  ubicacion_gps?: { type: 'Point'; coordinates: [number, number] }
  contacto_nombre?: string
  contacto_telefono?: string
  activo?: boolean
  zona_id?: number
}
