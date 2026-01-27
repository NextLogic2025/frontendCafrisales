// import { httpWarehouse } from '../../../services/api/http'

export interface Almacen {
    id: number
    nombre: string
    codigoRef?: string
    requiereFrio: boolean
    direccionFisica?: string
    activo: boolean
    createdAt: string
    updatedAt: string
}

export type CreateAlmacenDto = Omit<Almacen, 'id' | 'createdAt' | 'updatedAt' | 'activo'>
export type UpdateAlmacenDto = Partial<Omit<Almacen, 'id' | 'createdAt' | 'updatedAt'>>

export const almacenesApi = {
    getAll: async (): Promise<Almacen[]> => {
        return []
    },

    getById: async (id: number): Promise<Almacen> => {
        return {
            id,
            nombre: 'Almacen Mock',
            requiereFrio: false,
            activo: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    },

    create: async (data: CreateAlmacenDto): Promise<Almacen> => {
        return {
            id: Math.floor(Math.random() * 1000),
            ...data,
            activo: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    },

    update: async (id: number, data: UpdateAlmacenDto): Promise<Almacen> => {
        return {
            id,
            nombre: data.nombre || 'Almacen Mock',
            requiereFrio: data.requiereFrio ?? false,
            activo: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    },

    delete: async (id: number): Promise<void> => {
        return Promise.resolve()
    },
}
