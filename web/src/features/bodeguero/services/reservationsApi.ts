// import { httpWarehouse } from '../../../services/api/http'

export interface Reservation {
    id: string
    tempId?: string
    status: 'ACTIVE' | 'CANCELLED' | 'CONFIRMED'
    createdAt: string
    items: ReservationItem[]
}

export interface ReservationItem {
    id: string
    productoId: string
    productoNombre?: string
    cantidad: number
    loteId?: string
    ubicacionId?: string
}

export const reservationsApi = {
    async getAll(status?: string): Promise<Reservation[]> {
        return []
    },

    async getById(id: string): Promise<Reservation> {
        return {
            id,
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            items: []
        }
    },

    async cancel(id: string): Promise<void> {
        return Promise.resolve()
    },

    async confirm(id: string, pedidoId: string): Promise<void> {
        return Promise.resolve()
    },
}
