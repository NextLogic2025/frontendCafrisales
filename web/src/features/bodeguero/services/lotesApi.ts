// import { httpWarehouse } from '../../../services/api/http'

export interface Lote {
    id: string
    productoId: string
    numeroLote: string
    fechaFabricacion: string
    fechaVencimiento: string
    estadoCalidad: string // 'LIBERADO' | 'CUARENTENA' | 'RECHAZADO'
    createdAt: string
    updatedAt: string
}

export interface CreateLoteDto {
    productoId: string
    numeroLote: string
    fechaFabricacion: string // YYYY-MM-DD
    fechaVencimiento: string // YYYY-MM-DD
    estadoCalidad?: string
}

export interface UpdateLoteDto {
    fechaVencimiento?: string
    estadoCalidad?: string
}

export const lotesApi = {
    getAll: async (productoId?: string): Promise<Lote[]> => {
        return []
    },

    getById: async (id: string): Promise<Lote> => {
        return {
            id,
            productoId: 'mock-prod',
            numeroLote: 'L-001',
            fechaFabricacion: new Date().toISOString(),
            fechaVencimiento: new Date().toISOString(),
            estadoCalidad: 'LIBERADO',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    },

    create: async (data: CreateLoteDto): Promise<Lote> => {
        return {
            id: 'mock-id',
            ...data,
            estadoCalidad: data.estadoCalidad || 'LIBERADO',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    },

    update: async (id: string, data: UpdateLoteDto): Promise<Lote> => {
        return {
            id,
            productoId: 'mock-prod',
            numeroLote: 'L-001',
            fechaFabricacion: new Date().toISOString(),
            fechaVencimiento: data.fechaVencimiento || new Date().toISOString(),
            estadoCalidad: data.estadoCalidad || 'LIBERADO',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    },

    delete: async (id: string): Promise<void> => {
        return Promise.resolve()
    },
}
