import { env } from '../../config/env'
import { ApiService } from './ApiService'
import { createService } from './createService'
import { logErrorForDebugging } from '../../utils/errorMessages'

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

const NOTIFICATIONS_BASE_URL = env.api.notificationsUrl
const NOTIFICATIONS_API_URL = NOTIFICATIONS_BASE_URL.endsWith('/api')
  ? NOTIFICATIONS_BASE_URL
  : `${NOTIFICATIONS_BASE_URL}/api`

const rawService = {
  async getNotifications(params?: { soloNoLeidas?: boolean; limit?: number }): Promise<AppNotification[]> {
    try {
      const search = new URLSearchParams()
      if (typeof params?.soloNoLeidas === 'boolean') {
        search.set('soloNoLeidas', params.soloNoLeidas ? 'true' : 'false')
      }
      if (params?.limit) search.set('limit', String(params.limit))
      const query = search.toString()
      return await ApiService.get<AppNotification[]>(
        `${NOTIFICATIONS_API_URL}/notifications${query ? `?${query}` : ''}`,
      )
    } catch (error) {
      logErrorForDebugging(error, 'NotificationService.getNotifications')
      return []
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      const data = await ApiService.get<{ count: number }>(`${NOTIFICATIONS_API_URL}/notifications/unread/count`)
      return typeof data?.count === 'number' ? data.count : 0
    } catch (error) {
      logErrorForDebugging(error, 'NotificationService.getUnreadCount')
      return 0
    }
  },

  async markAllRead(): Promise<boolean> {
    try {
      await ApiService.patch(`${NOTIFICATIONS_API_URL}/notifications/mark-all-read`, {})
      return true
    } catch (error) {
      logErrorForDebugging(error, 'NotificationService.markAllRead')
      return false
    }
  },

  async markAsRead(id: string): Promise<boolean> {
    try {
      await ApiService.patch(`${NOTIFICATIONS_API_URL}/notifications/${id}/mark-read`, {})
      return true
    } catch (error) {
      logErrorForDebugging(error, 'NotificationService.markAsRead', { id })
      return false
    }
  },
}

export const NotificationService = createService('NotificationService', rawService)
