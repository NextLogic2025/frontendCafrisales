import React from 'react'
import { io, Socket } from 'socket.io-client'
import { jwtDecode } from 'jwt-decode'
import { NotificationService, AppNotification } from '../services/api/NotificationService'
import { showGlobalToast } from '../utils/toastService'
import { env } from '../config/env'
import { getToken, subscribeToTokenChanges } from '../storage/authStorage'

type NotificationContextValue = {
  notifications: AppNotification[]
  badgeCount: number
  loading: boolean
  isConnected: boolean
  currentUserId: string | null
  refresh: (opts?: { soloNoLeidas?: boolean }) => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
}

const NotificationContext = React.createContext<NotificationContextValue | null>(null)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = React.useState<AppNotification[]>([])
  const [badgeCount, setBadgeCount] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [isConnected, setIsConnected] = React.useState(false)
  const socketRef = React.useRef<Socket | null>(null)
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null)

  const syncBadge = React.useCallback(async () => {
    const token = await getToken()
    if (!token) {
      setBadgeCount(0)
      return
    }
    const count = await NotificationService.getUnreadCount()
    setBadgeCount(count)
  }, [])

  const refresh = React.useCallback(
    async (opts?: { soloNoLeidas?: boolean }) => {
      const token = await getToken()
      if (!token) {
        setNotifications([])
        setBadgeCount(0)
        return
      }
      setLoading(true)
      try {
        const list = await NotificationService.getNotifications({
          soloNoLeidas: opts?.soloNoLeidas,
          limit: 100,
        })
        setNotifications(list)
        await syncBadge()
      } catch {
        showGlobalToast('No se pudieron cargar notificaciones', 'error')
      } finally {
        setLoading(false)
      }
    },
    [syncBadge],
  )

  const markAsRead = React.useCallback(
    async (id: string) => {
      const token = await getToken()
      if (!token) return
      const target = notifications.find((item) => item.id === id)
      if (target?.usuarioId && currentUserId && target.usuarioId !== currentUserId) {
        showGlobalToast('No puedes marcar notificaciones de otros usuarios', 'warning')
        return
      }
      const ok = await NotificationService.markAsRead(id)
      if (!ok) {
        showGlobalToast('No se pudo marcar como leida', 'error')
        return
      }
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, leida: true, leidaEn: new Date().toISOString() } : item,
        ),
      )
      await syncBadge()
    },
    [syncBadge],
  )

  const markAllRead = React.useCallback(async () => {
    const token = await getToken()
    if (!token) return
    const ok = await NotificationService.markAllRead()
    if (!ok) {
      showGlobalToast('No se pudo marcar todo como leido', 'error')
      return
    }
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, leida: true, leidaEn: item.leidaEn ?? new Date().toISOString() })),
    )
    await syncBadge()
  }, [syncBadge])

  React.useEffect(() => {
    syncBadge()
  }, [syncBadge])

  const connectSocket = React.useCallback(async () => {
    const token = await getToken()
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      setCurrentUserId(null)
      setIsConnected(false)
      return
    }

    const base = env.api.notificationsUrl.replace(/\/$/, '')
    const sentToken = token.startsWith('Bearer ') ? token.replace(/^Bearer\s+/i, '') : token
    let decodedUserId: string | null = null
    try {
      const decoded = jwtDecode<{ sub?: string; userId?: string }>(sentToken)
      decodedUserId = decoded.sub || decoded.userId || null
    } catch {
      decodedUserId = null
    }
    setCurrentUserId(decodedUserId)

    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }

    const socket = io(`${base}/notifications`, {
      auth: { token: sentToken },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('connect_error', () => {
      setIsConnected(false)
    })

    socket.on('notification', (payload: any) => {
      const normalized: AppNotification = {
        id: payload.id,
        usuarioId: payload.usuarioId ?? decodedUserId ?? '',
        tipoId: payload.tipoId ?? '',
        titulo: payload.titulo ?? payload.title ?? '',
        mensaje: payload.mensaje ?? payload.message ?? '',
        payload: payload.payload ?? null,
        prioridad: payload.prioridad ?? null,
        requiereAccion: payload.requiereAccion ?? false,
        urlAccion: payload.urlAccion ?? null,
        creadoEn: payload.creadoEn ?? new Date().toISOString(),
        leida: false,
        leidaEn: null,
      }

      setNotifications((prev) => {
        const exists = prev.find((item) => item.id === normalized.id)
        if (exists) {
          return prev.map((item) => (item.id === normalized.id ? { ...item, ...normalized, leida: false } : item))
        }
        return [normalized, ...prev]
      })
      setBadgeCount((prev) => prev + 1)
    })

    socketRef.current = socket
  }, [])

  React.useEffect(() => {
    connectSocket()
    const unsubscribe = subscribeToTokenChanges(() => {
      connectSocket()
      syncBadge()
    })
    return () => {
      unsubscribe()
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [connectSocket])

  const value = React.useMemo(
    () => ({ notifications, badgeCount, loading, isConnected, currentUserId, refresh, markAsRead, markAllRead }),
    [notifications, badgeCount, loading, isConnected, currentUserId, refresh, markAsRead, markAllRead],
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotificationsOptional() {
  return React.useContext(NotificationContext)
}
