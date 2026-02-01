import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './useAuth'
import { env } from '../config/env'
import subscriptionsService from '../services/notificationSubscriptions'
import { AppNotification } from '../types/notification'

/* ... keep NotificationPayload, storage helpers unchanged ... */

export function useSocket() {
    // Use auth hook at top-level (cast to any to allow optional refresh helpers)
    const auth: any = useAuth()
    const token = auth?.token ?? null

    const socketRef = useRef<Socket | null>(null)

    // localStorage helpers (kept isolated here so this hook remains self-contained)
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
        // Only load from localStorage if we have a token
        if (!token) return []
        return loadNotifications()
    })
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
    }, [notifications])

    const refresh = useCallback(async (sentToken?: string) => {
        if (!sentToken) return
        try {
            const base = env.api.notifications || env.api.catalogo
            const apiUrl = `${base.replace(/\/$/, '')}/api/v1/notifications`
            const res = await fetch(apiUrl, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': sentToken ? `Bearer ${sentToken}` : '',
                },
            })
            if (!res.ok) {
                if (res.status === 401 && typeof auth?.refresh === 'function') {
                    auth.refresh()
                }
                return
            }
            const list = await res.json()
            if (!Array.isArray(list)) return
            const normalized = list.map((payload: any) => {
                const title = payload.title ?? payload.titulo ?? payload.payload?.title ?? ''
                const message = payload.message ?? payload.mensaje ?? payload.payload?.message ?? ''
                const type = payload.type ?? payload.tipo ?? payload.tipoId ?? 'info'
                return {
                    id: payload.id,
                    type,
                    title,
                    message,
                    data: payload.data ?? payload.payload ?? null,
                    timestamp: payload.creadoEn ? new Date(payload.creadoEn).getTime() : Date.now(),
                    prioridad: payload.prioridad,
                    requiereAccion: payload.requiereAccion,
                    urlAccion: payload.urlAccion,
                    read: payload.leida === true || Boolean(payload.leidaEn),
                    readAt: payload.leidaEn ? new Date(payload.leidaEn).getTime() : null,
                }
            })

            setNotifications((prev: AppNotification[]) => {
                const existingIds = new Set(prev.map(n => n.id).filter(Boolean))
                const newNotifications = normalized.filter(n => !existingIds.has(n.id))
                return [...newNotifications, ...prev]
            })
        } catch (err) {
        }
    }, [])

    useEffect(() => {
        if (!token) return

        const base = (env.api.notifications || env.api.catalogo).replace(/\/$/, '')
        const sentToken = token?.startsWith('Bearer ') ? token.replace(/^Bearer\s+/i, '') : token
        const masked = sentToken ? `${sentToken.substring(0, 6)}...${sentToken.slice(-6)}` : 'null'

        try {
            const parts = (sentToken || '').split('.')
            if (parts.length === 3) {
                const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')))
                const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
                if (payload.exp && typeof payload.exp === 'number') {
                    const expiresAt = new Date(payload.exp * 1000)

                    if (expiresAt.getTime() < Date.now()) {
                        if (typeof auth?.refresh === 'function') {
                            auth.refresh()
                        }
                        return
                    }
                }
            }
        } catch (err) {
        }

        // IMPORTANT: use namespace URL and set auth.token; force websocket transport
        const socket = io(`${base}/notifications`, {
            auth: { token: sentToken },
            transports: ['websocket'],
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        })

        socketRef.current = socket

        socket.on('connect', () => {
            setIsConnected(true)
            refresh(sentToken)
        })

        socket.on('disconnect', (reason) => {
            setIsConnected(false)
        })

        socket.on('connect_error', async (err: any) => {
            const msg = err?.message ?? err
            const extra = (err as any)?.data ?? null
            setIsConnected(false)

            const text = String(msg || '').toLowerCase()
            // If token expired/invalid and auth exposes a refresh, try refresh + reconnect
            if ((text.includes('jwt') || text.includes('token') || text.includes('expired'))) {
                try {
                    if (typeof auth?.refreshToken === 'function') {
                        await auth.refreshToken()
                    } else if (typeof auth?.refresh === 'function') {
                        await auth.refresh()
                    } else {
                        return
                    }
                    // Use new token and reconnect
                    const newToken = auth?.token ? (auth.token.startsWith('Bearer ') ? auth.token.replace(/^Bearer\s+/i, '') : auth.token) : null
                    if (newToken) {
                        socket.auth = { token: newToken }
                        socket.connect()
                    }
                } catch (refreshErr) {
                }
            }
        })

        socket.on('error', (err) => {
            try {
                const errMsg = typeof err === 'object' ? JSON.stringify(err) : String(err)
                if ((errMsg.includes('Token inválido') || errMsg.includes('expired') || errMsg.includes('jwt')) && typeof auth?.refresh === 'function') {
                    auth.refresh()
                }
            } catch (e) {
            }
        })

        socket.on('reconnect_failed', () => {
        })

        socket.on('notification', (payload: any) => {
            const title = payload.title ?? payload.titulo ?? payload.payload?.title ?? payload.payload?.titulo ?? ''
            const message = payload.message ?? payload.mensaje ?? payload.payload?.message ?? payload.payload?.mensaje ?? ''
            const type = payload.type ?? payload.tipo ?? 'info'
            const normalized: AppNotification = {
                id: payload.id,
                type,
                title,
                message,
                data: payload.data ?? payload.payload ?? null,
                timestamp: Date.now(),
                read: payload.leida === true || Boolean(payload.leidaEn),
                readAt: payload.leidaEn ? new Date(payload.leidaEn).getTime() : null,
            }
            setNotifications((prev: AppNotification[]) => {
                const exists = normalized.id && prev.some(n => n.id === normalized.id)
                if (exists) {
                    return prev.map(n => n.id === normalized.id ? { ...n, ...normalized } : n)
                }
                return [normalized, ...prev]
            })
        })

        // Order event handlers
        const handleOrderEvent = (payload: any) => {
            const orderId = payload.id ?? payload.orderId ?? payload.payload?.id ?? null
            const title = payload.title ?? payload.titulo ?? `Nuevo pedido ${orderId ?? ''}`
            const message = payload.message ?? payload.mensaje ?? payload.payload?.message ?? `Pedido ${orderId ?? ''} creado`
            const normalized: AppNotification = {
                id: orderId ?? `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
                type: 'ALERT_SUPERVISOR',
                title,
                message,
                data: payload.data ?? payload.payload ?? { order: payload },
                timestamp: Date.now(),
            }
            setNotifications((prev: AppNotification[]) => [normalized, ...prev])
        }

        socket.on('order.created', handleOrderEvent)
        socket.on('pedido.created', handleOrderEvent)
        socket.on('pedido', handleOrderEvent)

        /* keep order event handlers and other functions unchanged */

        return () => {
            socket.disconnect()
            socketRef.current = null
        }
    }, [token, auth, refresh])

    // Mark a notification as read using WS with ack; fallback to HTTP if no ack in timeout
    const markAsRead = useCallback(async (notificationId: string): Promise<{ success: boolean; error?: string }> => {
        const s = socketRef.current
        const base = env.api.notifications || env.api.catalogo
        const sentToken = token?.startsWith('Bearer ') ? token.replace(/^Bearer\s+/i, '') : token

        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true, readAt: Date.now() } : n))

        if (!s || !s.connected) {
            try {
                const res = await fetch(`${base.replace(/\/$/, '')}/api/v1/notifications/${notificationId}/mark-read`, {
                    method: 'PATCH', headers: { 'Authorization': sentToken ? `Bearer ${sentToken}` : '' }
                })
                return { success: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` }
            } catch (err: any) {
                return { success: false, error: String(err) }
            }
        }

        return await new Promise(resolve => {
            let settled = false
            const t = setTimeout(async () => {
                if (settled) return
                settled = true
                try {
                    const res = await fetch(`${base.replace(/\/$/, '')}/api/v1/notifications/${notificationId}/mark-read`, {
                        method: 'PATCH', headers: { 'Authorization': sentToken ? `Bearer ${sentToken}` : '' }
                    })
                    resolve({ success: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` })
                } catch (err: any) {
                    resolve({ success: false, error: String(err) })
                }
            }, 5000)

            try {
                s.emit('mark_read', { notificationId }, (res: any) => {
                    if (settled) return
                    settled = true
                    clearTimeout(t)
                    if (res && res.success) {
                        resolve({ success: true })
                    } else {
                        resolve({ success: false, error: res?.error ?? 'unknown' })
                    }
                })
            } catch (err: any) {
                if (!settled) {
                    settled = true
                    clearTimeout(t)
                    resolve({ success: false, error: String(err) })
                }
            }
        })
    }, [token])

    const markAllAsRead = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
        const s = socketRef.current
        const base = env.api.notifications || env.api.catalogo
        const sentToken = token?.startsWith('Bearer ') ? token.replace(/^Bearer\s+/i, '') : token

        setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: Date.now() })))

        if (!s || !s.connected) {
            try {
                const res = await fetch(`${base.replace(/\/$/, '')}/api/v1/notifications/mark-all-read`, { method: 'PATCH', headers: { 'Authorization': sentToken ? `Bearer ${sentToken}` : '' } })
                return { success: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` }
            } catch (err: any) {
                return { success: false, error: String(err) }
            }
        }

        return await new Promise(resolve => {
            let settled = false
            const t = setTimeout(async () => {
                if (settled) return
                settled = true
                try {
                    const res = await fetch(`${base.replace(/\/$/, '')}/api/v1/notifications/mark-all-read`, { method: 'PATCH', headers: { 'Authorization': sentToken ? `Bearer ${sentToken}` : '' } })
                    resolve({ success: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` })
                } catch (err: any) {
                    resolve({ success: false, error: String(err) })
                }
            }, 5000)

            try {
                s.emit('mark_all_read', {}, (res: any) => {
                    if (settled) return
                    settled = true
                    clearTimeout(t)
                    if (res && res.success) {
                        resolve({ success: true })
                    } else {
                        resolve({ success: false, error: res?.error ?? 'unknown' })
                    }
                })
            } catch (err: any) {
                if (!settled) {
                    settled = true
                    clearTimeout(t)
                    resolve({ success: false, error: String(err) })
                }
            }
        })
    }, [token])

    const subscribeToPriceList = (listaId: number) => {
        socketRef.current?.emit('subscribePricelist', { listaId })
    }

    const subscribeToNotificationType = async (tipoId: string, opts?: { websocketEnabled?: boolean; emailEnabled?: boolean; smsEnabled?: boolean }) => {
        try {
            await subscriptionsService.upsertSubscription(tipoId, { websocketEnabled: opts?.websocketEnabled ?? true, emailEnabled: opts?.emailEnabled ?? false, smsEnabled: opts?.smsEnabled ?? false })
        } catch (err) {
            throw err
        }
        try {
            socketRef.current?.emit('subscribeNotification', { tipoId })
        } catch (err) { }
    }

    const unsubscribeFromNotificationType = async (tipoId: string) => {
        try {
            await subscriptionsService.deleteSubscription(tipoId)
        } catch (err) {
            throw err
        }
        try { socketRef.current?.emit('unsubscribeNotification', { tipoId }) } catch (err) { }
    }

    const pushNotification = (payload: any) => {
        const orderId = payload.id ?? payload.orderId ?? payload.payload?.id ?? null
        const title = payload.title ?? payload.titulo ?? payload.payload?.title ?? 'Notificación'
        const message = payload.message ?? payload.mensaje ?? payload.payload?.message ?? ''
        const id = orderId ?? `${Date.now()}-${Math.floor(Math.random() * 1e6)}`
        const normalized: AppNotification = { id, type: payload.type ?? payload.tipo ?? 'info', title, message, data: payload.data ?? payload.payload ?? null, timestamp: Date.now() }
        setNotifications((prev: AppNotification[]) => [normalized, ...prev])
    }

    const unreadCount = notifications.filter(n => !n.read).length

    return {
        socket: socketRef.current,
        isConnected,
        notifications,
        unreadCount,
        clearNotifications,
        subscribeToPriceList,
        pushNotification,
        refresh,
        markAsRead,
        markAllAsRead,
        subscribeToNotificationType,
        unsubscribeFromNotificationType,
    }
}