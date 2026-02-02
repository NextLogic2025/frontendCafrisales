import { env } from '../config/env'
import { getToken as getStoredToken } from './storage/tokenStorage'

const BASE_URL = `${(env.api.notifications || env.api.catalogo || '').replace(/\/$/, '')}/api/v1`

function getAuthHeader(token?: string) {
    const t = token || getStoredToken()
    return {
        'Content-Type': 'application/json',
        'Authorization': t ? (t.startsWith('Bearer ') ? t : `Bearer ${t}`) : ''
    }
}

export interface NotificationParams {
    limit?: number
    page?: number
    isRead?: boolean
    priority?: 'baja' | 'normal' | 'alta' | 'urgente'
    typeId?: string
    fromDate?: string
    toDate?: string
}

export const notificationsApi = {
    getAll: async (params: NotificationParams = {}, token?: string) => {
        const query = new URLSearchParams()
        if (params.limit) query.append('limit', String(params.limit))
        if (params.page) query.append('page', String(params.page))
        if (params.isRead !== undefined) query.append('isRead', String(params.isRead))
        if (params.priority) query.append('priority', params.priority)
        if (params.typeId) query.append('typeId', params.typeId)
        if (params.fromDate) query.append('fromDate', params.fromDate)
        if (params.toDate) query.append('toDate', params.toDate)

        const res = await fetch(`${BASE_URL}/notifications?${query.toString()}`, {
            headers: getAuthHeader(token)
        })
        if (!res.ok) throw new Error(`Error fetching notifications: ${res.statusText}`)
        return res.json()
    },

    getUnreadCount: async (token?: string) => {
        const res = await fetch(`${BASE_URL}/notifications/unread-count`, {
            headers: getAuthHeader(token)
        })
        if (!res.ok) throw new Error(`Error fetching unread count: ${res.statusText}`)
        return res.json()
    },

    markAsRead: async (id: string, token?: string) => {
        const res = await fetch(`${BASE_URL}/notifications/${id}`, {
            method: 'PATCH',
            headers: getAuthHeader(token),
            body: JSON.stringify({ isRead: true })
        })
        if (!res.ok) throw new Error(`Error marking notification as read: ${res.statusText}`)
        return res.json()
    },

    markBatchAsRead: async (ids: string[], token?: string) => {
        const res = await fetch(`${BASE_URL}/notifications/batch`, {
            method: 'PATCH',
            headers: getAuthHeader(token),
            body: JSON.stringify({ ids, isRead: true })
        })
        if (!res.ok) throw new Error(`Error marking batch as read: ${res.statusText}`)
        return res.json()
    },

    markAllAsRead: async (token?: string) => {
        const res = await fetch(`${BASE_URL}/notifications/mark-all-read`, {
            method: 'PATCH',
            headers: getAuthHeader(token)
        })
        if (!res.ok) throw new Error(`Error marking all as read: ${res.statusText}`)
        return res.json()
    }
}
