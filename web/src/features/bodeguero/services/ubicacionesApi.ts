// import { httpWarehouse } from '../../../services/api/http'

export interface Ubicacion {
    id: string
    almacenId: number
    codigoVisual: string
    tipo: string
    capacidadMaxKg: number
    esCuarentena: boolean
    createdAt?: string
    updatedAt?: string
    almacen?: {
        id: number
        nombre: string
    }
}

export interface CreateUbicacionDto {
    almacenId: number
    codigoVisual: string
    tipo?: string
    capacidadMaxKg?: number
    esCuarentena?: boolean
}

export interface UpdateUbicacionDto {
    codigoVisual?: string
    tipo?: string
    capacidadMaxKg?: number
    esCuarentena?: boolean
}

export const ubicacionesApi = {
    getAll: async (almacenId?: number): Promise<Ubicacion[]> => {
        return []
    },

    getById: async (id: string): Promise<Ubicacion> => {
        return {
            id,
            almacenId: 1,
            codigoVisual: 'A-01-01',
            tipo: 'ESTANTE',
            capacidadMaxKg: 1000,
            esCuarentena: false
        }
    },

    getByAlmacen: async (almacenId: number): Promise<Ubicacion[]> => {
        return []
    },

    create: async (data: CreateUbicacionDto): Promise<Ubicacion> => {
        return {
            id: 'mock-id',
            ...data,
            tipo: data.tipo || 'ESTANTE',
            capacidadMaxKg: data.capacidadMaxKg || 1000,
            esCuarentena: data.esCuarentena || false
        }
    },

    update: async (id: string, data: UpdateUbicacionDto): Promise<Ubicacion> => {
        return {
            id,
            almacenId: 1,
            codigoVisual: data.codigoVisual || 'A-01-01',
            tipo: data.tipo || 'ESTANTE',
            capacidadMaxKg: data.capacidadMaxKg || 1000,
            esCuarentena: data.esCuarentena || false
        }
    },

    delete: async (id: string): Promise<void> => {
        return Promise.resolve()
    },
}
