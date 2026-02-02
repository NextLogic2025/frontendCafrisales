import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './useAuth'
import { env } from '../config/env'
import subscriptionsService from '../services/notificationSubscriptions'
import { notificationsApi } from '../services/notificationsApi'
import { AppNotification } from '../types/notification'

/* ... keep NotificationPayload, storage helpers unchanged ... */

export function useSocket() {
    // Use auth hook at top-level (cast to any to allow optional refresh helpers)
    const auth: any = useAuth()
    const token = auth?.token ?? null

    const socketRef = useRef<Socket | null>(null)

    // localStorage helpers
    const NOTIFICATIONS_STORAGE_KEY = 'cafrilosa:notifications'
    function loadNotifications(): AppNotification[] {
        try {
            const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
            if (!stored) return []
            const parsed = JSON.parse(stored)
            return Array.isArray(parsed) ? parsed : []
        } catch {
            return []
        }
    }
    function saveNotifications(notifications: AppNotification[]) {
        try {
            localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications))
        } catch (err) {
        }
    }

    const [notifications, setNotifications] = useState<AppNotification[]>(() => {
        if (!token) return []
        return loadNotifications()
    })
    const [unreadCount, setUnreadCount] = useState(0)
    const [isConnected, setIsConnected] = useState(false)
    const lastTokenRef = useRef<string | null>(null)

    const clearNotifications = () => {
        setNotifications([])
        try { localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY) } catch { }
    }

    useEffect(() => {
        if (!token) {
            if (lastTokenRef.current) {
                setNotifications([])
                clearNotifications()
            }
            lastTokenRef.current = null
            return
        }
        if (lastTokenRef.current && lastTokenRef.current !== token) {
            setNotifications([])
            clearNotifications()
        }
        lastTokenRef.current = token
    }, [token])

    useEffect(() => {
        saveNotifications(notifications)
        setUnreadCount(notifications.filter(n => !n.read).length)
    }, [notifications])

    const normalizeNotification = (payload: any): AppNotification => {
        const title = payload.title ?? payload.titulo ?? payload.payload?.title ?? ''
        const message = payload.message ?? payload.mensaje ?? payload.payload?.message ?? ''
        const type = payload.type ?? payload.tipo ?? payload.tipoId ?? 'info'
        return {
            id: payload.id ?? `${Date.now()}-${Math.random()}`,
            type,
            title,
            message,
            data: payload.data ?? payload.payload ?? null,
            timestamp: payload.creadoEn ? new Date(payload.creadoEn).getTime() : Date.now(),
            read: payload.isRead === true || payload.leida === true || Boolean(payload.leidaEn),
            readAt: payload.leidaEn ? new Date(payload.leidaEn).getTime() : null,
        }
    }

    const refresh = useCallback(async (sentToken?: string) => {
        try {
            // Fetch notifications
            const list = await notificationsApi.getAll({ limit: 100 }, sentToken)
            if (!Array.isArray(list)) return

            const normalizedList = list.map(normalizeNotification)

            setNotifications((prev: AppNotification[]) => {
                // Merge: keep existing (which might have local updates) + new ones from backend.
                // Replace duplicates with newer version from backend.
                const resultMap = new Map<string, AppNotification>()
                prev.forEach(n => { if (n.id) resultMap.set(n.id, n) })
                normalizedList.forEach(n => { if (n.id) resultMap.set(n.id, n) })

                return Array.from(resultMap.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
            })

            // Also update unread count from API directly if needed
            try {
                // We don't use the result yet but it's good to have the API called if needed later
                await notificationsApi.getUnreadCount(sentToken)
            } catch { }

        } catch (err: any) {
            if (err?.message?.includes('401') && typeof auth?.refresh === 'function') {
                auth.refresh()
            }
        }
    }, [auth])

    useEffect(() => {
        if (!token) return

        const base = (env.api.notifications || env.api.catalogo).replace(/\/$/, '')
        const sentToken = token?.startsWith('Bearer ') ? token.replace(/^Bearer\s+/i, '') : token

        // Connect to namespace /notifications
        const socket = io(`${base}/notifications`, {
            auth: { token: sentToken }, // Send token in auth payload (Socket.IO standard)
            query: { token: sentToken }, // Send token in query (fallback/alternative)
            transports: ['websocket'],
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        })

        socketRef.current = socket

        socket.on('connect', () => {
            setIsConnected(true)
            refresh(sentToken)
        })

        socket.on('disconnect', () => {
            setIsConnected(false)
        })

        socket.on('connect_error', async (err: any) => {
            setIsConnected(false)
            // handle token refresh logic...
        })

        socket.on('notification', (payload: any) => {
            const normalized = normalizeNotification(payload)
            setNotifications((prev) => {
                // Eliminate duplicates by ID
                const others = prev.filter(p => p.id !== normalized.id)
                return [normalized, ...others]
            })
        })

        return () => {
            socket.disconnect()
            socketRef.current = null
        }
    }, [token, auth, refresh])

    const markAsRead = useCallback(async (notificationId: string): Promise<{ success: boolean; error?: string }> => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true, readAt: Date.now() } : n))

        const sentToken = token?.startsWith('Bearer ') ? token.replace(/^Bearer\s+/i, '') : token

        try {
            await notificationsApi.markAsRead(notificationId, sentToken)
            return { success: true }
        } catch (err: any) {
            // Revert or show error? For now just log
            return { success: false, error: String(err) }
        }
    }, [token])

    const markAllAsRead = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: Date.now() })))

        const sentToken = token?.startsWith('Bearer ') ? token.replace(/^Bearer\s+/i, '') : token

        try {
            await notificationsApi.markAllAsRead(sentToken)
            return { success: true }
        } catch (err: any) {
            return { success: false, error: String(err) }
        }
    }, [token])

    // Subscribe wrappers...
    const subscribeToNotificationType = async (tipoId: string, opts?: { websocketEnabled?: boolean; emailEnabled?: boolean; smsEnabled?: boolean }) => {
        await subscriptionsService.upsertSubscription(tipoId, opts)
        socketRef.current?.emit('subscribeNotification', { tipoId })
    }

    const unsubscribeFromNotificationType = async (tipoId: string) => {
        await subscriptionsService.deleteSubscription(tipoId)
        socketRef.current?.emit('unsubscribeNotification', { tipoId })
    }

    const pushNotification = (payload: any) => {
        const normalized = normalizeNotification(payload)
        setNotifications((prev) => [normalized, ...prev])
    }

    return {
        socket: socketRef.current,
        isConnected,
        notifications,
        unreadCount,
        clearNotifications,
        pushNotification,
        refresh: () => refresh(token?.replace(/^Bearer\s+/i, '')),
        markAsRead,
        markAllAsRead,
        subscribeToNotificationType,
        unsubscribeFromNotificationType,
    }
}