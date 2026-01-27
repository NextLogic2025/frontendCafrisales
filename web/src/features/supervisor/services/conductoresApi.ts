export interface Conductor {
    id: string
    usuario_id: string | null
    nombre_completo: string
    cedula: string
    telefono: string | null
    licencia: string | null
    activo: boolean
    created_at: string
    updated_at: string
}

export interface CreateConductorDto {
    nombre_completo: string
    cedula: string
    telefono?: string
    licencia?: string
    usuario_id?: string
}
