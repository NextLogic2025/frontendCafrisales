// import { httpWarehouse } from '../../../services/api/http'

export interface PickingItem {
    id: number
    pickingId: number
    productoId: number
    cantidadSolicitada: number
    cantidadPickeada: number
    ubicacionOrigenSugerida?: number
    loteSugerido?: number
    loteConfirmado?: number
    estadoLinea: 'PENDIENTE' | 'COMPLETADO' | 'PARCIAL'
    createdAt: string
    updatedAt: string
    // Enriched fields
    nombreProducto?: string
    sku?: string
    ubicacionSugerida?: { id: number; codigoVisual: string } | number // Backend can return object or ID
}

export interface PickingOrden {
    id: number
    pedidoId: number
    estado: 'ASIGNADO' | 'EN_PROCESO' | 'COMPLETADO' | 'PENDIENTE'
    prioridad: number
    bodegueroAsignadoId?: number
    fechaInicio?: string
    fechaFin?: string
    createdAt: string
    updatedAt: string
    items?: PickingItem[]
}

export const pickingApi = {
    getAllOrders: async (estado?: string): Promise<PickingOrden[]> => {
        // Mock data
        return []
    },

    getMyTasks: async (): Promise<PickingOrden[]> => {
        // Mock data
        return []
    },

    getById: async (id: number): Promise<PickingOrden> => {
        // Mock data
        return {
            id,
            pedidoId: 100 + id,
            estado: 'PENDIENTE',
            prioridad: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            items: []
        }
    },

    confirm: async (data: { pedidoId: number, reservationId: number }): Promise<PickingOrden> => {
        // Mock data
        return {
            id: 1,
            pedidoId: data.pedidoId,
            estado: 'ASIGNADO',
            prioridad: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            items: []
        }
    },

    assignToMe: async (id: number): Promise<void> => {
        // Mock success
        return Promise.resolve()
    },

    startPicking: async (id: number): Promise<void> => {
        // Mock success
        return Promise.resolve()
    },

    tomarPedido: async (id: number): Promise<void> => {
        // Mock success
        return Promise.resolve()
    },

    completePicking: async (id: number): Promise<void> => {
        // Mock success
        return Promise.resolve()
    },

    pickItem: async (id: number, itemId: number, data: { cantidadPickeada: number, loteConfirmado?: string, motivo_desviacion?: string, nota_bodeguero?: string, ubicacion_confirmada?: string }): Promise<void> => {
        // Mock success
        return Promise.resolve()
    },

    getStocks: async (productId: number): Promise<{ ubicacion: any, lote: any, cantidadDisponible: number }[]> => {
        // Mock data
        return []
    }
}
