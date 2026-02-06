
import { env } from '../../config/env'
import { ApiService } from './ApiService'

export type NotificationPriority = 'baja' | 'normal' | 'alta' | 'urgente'

export type AppNotification = {
    id: string
    usuarioId: string
    tipoId: string
    titulo: string
    mensaje: string
    payload?: Record<string, unknown>
    origenServicio?: string | null
    origenEventoId?: string | null
    prioridad?: NotificationPriority | null
    requiereAccion?: boolean | null
    urlAccion?: string | null
    leida?: boolean | null
    leidaEn?: string | null
    creadoEn?: string | null
}

const NOTIFICATIONS_BASE_URL = env.api.notifications
const NOTIFICATIONS_API_URL =
    NOTIFICATIONS_BASE_URL.endsWith('/api/v1')
        ? NOTIFICATIONS_BASE_URL
        : NOTIFICATIONS_BASE_URL.endsWith('/api')
            ? `${NOTIFICATIONS_BASE_URL}/v1`
            : `${NOTIFICATIONS_BASE_URL}/api/v1`

const unwrapList = <T>(data: any): T[] => {
    if (!data) return []
    if (Array.isArray(data)) return data as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    return []
}

// Simplified version of createService wrapper for web
const createService = <T extends Record<string, any>>(name: string, service: T): T => {
    const wrapped: any = {}
    for (const key in service) {
        if (typeof service[key] === 'function') {
            wrapped[key] = async (...args: any[]) => {
                try {
                    return await service[key](...args)
                } catch (error) {
                    console.error(`Error in ${name}.${key}:`, error)
                    throw error
                }
            }
        } else {
            wrapped[key] = service[key]
        }
    }
    return wrapped as T
}

const rawService = {
    async getNotifications(params?: {
        soloNoLeidas?: boolean
        limit?: number
        typeId?: string
    }): Promise<AppNotification[]> {
        try {
            const search = new URLSearchParams()
            if (params?.soloNoLeidas === true) {
                search.set('soloNoLeidas', 'true')
            }
            if (params?.limit) search.set('limit', String(params.limit))
            if (params?.typeId) search.set('tipoId', params.typeId)
            const query = search.toString()
            const data = await ApiService.get<any>(
                `${NOTIFICATIONS_API_URL}/notifications${query ? `?${query}` : ''}`,
            )
            return unwrapList<AppNotification>(data)
        } catch (error) {
            console.error('NotificationService.getNotifications error', error)
            return []
        }
    },

    async getUnreadCount(): Promise<number> {
        try {
            const data = await ApiService.get<{ count: number }>(`${NOTIFICATIONS_API_URL}/notifications/unread-count`)
            return typeof data?.count === 'number' ? data.count : 0
        } catch (error) {
            console.error('NotificationService.getUnreadCount error', error)
            return 0
        }
    },

    async markAllRead(): Promise<boolean> {
        try {
            await ApiService.patch(`${NOTIFICATIONS_API_URL}/notifications/mark-all-read`, {})
            return true
        } catch (error) {
            console.error('NotificationService.markAllRead error', error)
            return false
        }
    },

    async markAsRead(id: string): Promise<boolean> {
        try {
            await ApiService.patch(`${NOTIFICATIONS_API_URL}/notifications/${id}`, {})
            return true
        } catch (error) {
            console.error('NotificationService.markAsRead error', error)
            return false
        }
    },
}

export const NotificationService = createService('NotificationService', rawService)
