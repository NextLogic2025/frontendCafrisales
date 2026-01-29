import React from 'react'
import { useNotification } from '../../hooks/useNotification'
import { useSocket } from '../../hooks/useSocket'
import { NotificationStack } from '../../components/ui/NotificationStack'
import { useAuth } from '../../hooks/useAuth'

// Create a context to share socket notifications across the app
interface NotificationsContextValue {
  notifications: any[]
  isConnected: boolean
  clearNotifications: () => void
  pushNotification: (notification: any) => void
  unreadCount?: number
  markAsRead?: (id: string) => Promise<{ success: boolean; error?: string }>
  markAllAsRead?: () => Promise<{ success: boolean; error?: string }>
  refresh?: (token?: string) => Promise<void>
  subscribeToNotificationType?: (tipoId: string, opts?: { websocketEnabled?: boolean; emailEnabled?: boolean; smsEnabled?: boolean }) => Promise<void>
  unsubscribeFromNotificationType?: (tipoId: string) => Promise<void>
}

const NotificationsContext = React.createContext<NotificationsContextValue | null>(null)

// Hook to use notifications context
export function useNotificationsContext() {
  const context = React.useContext(NotificationsContext)
  if (!context) {
    throw new Error('useNotificationsContext must be used within NotificationsProvider')
  }
  return context
}

// Bridge between socket events and the UI notification stack
export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { notifications: toastNotifications, show, remove } = useNotification()
  const { isAuthenticated } = useAuth()
  const socketData = useSocket() // Solo una llamada a useSocket en toda la app

  // Keep track of seen notifications to avoid duplicates. Prefer backend `id`
  // when provided; otherwise use a composed key.
  const seenRef = React.useRef<Set<string>>(new Set())

  // Track the initial count of notifications to avoid showing old ones as toasts
  const initialCountRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    // Don't show notifications if not authenticated
    if (!isAuthenticated) return
    if (!socketData.notifications || socketData.notifications.length === 0) return

    // On first render, just record the count without showing toasts
    if (initialCountRef.current === null) {
      initialCountRef.current = socketData.notifications.length
      // Mark all initial notifications as "seen" so they don't show as toasts
      socketData.notifications.forEach((n) => {
        const backendId = (n as any).id
        const key = backendId ? String(backendId) : String(n.timestamp ?? JSON.stringify({ title: n.title, message: n.message }))
        seenRef.current.add(key)
      })
      return
    }

    // Only show NEW notifications (ones that arrived after initial load)
    socketData.notifications.forEach((n) => {
      const backendId = (n as any).id
      const key = backendId ? String(backendId) : String(n.timestamp ?? JSON.stringify({ title: n.title, message: n.message }))
      if (seenRef.current.has(key)) return
      seenRef.current.add(key)

      const type = (n.type as any) === 'error' ? 'error' : (n.type as any) === 'success' ? 'success' : (n.type as any) === 'warning' ? 'warning' : 'info'
      const message = String(n.title ?? n.message ?? 'Nueva notificación')

      show(message, type)
    })
  }, [socketData.notifications, show, isAuthenticated])

  // Clear seenRef when authentication changes
  React.useEffect(() => {
    if (!isAuthenticated) {
      seenRef.current.clear()
      initialCountRef.current = null
    }
  }, [isAuthenticated])

  // Build a stable context value for consumers. Expose list, counts and actions.
  const contextValue = React.useMemo(() => ({
    notifications: socketData.notifications,
    isConnected: socketData.isConnected,
    clearNotifications: socketData.clearNotifications,
    pushNotification: socketData.pushNotification,
    unreadCount: socketData.unreadCount,
    markAsRead: socketData.markAsRead,
    markAllAsRead: socketData.markAllAsRead,
    refresh: socketData.refresh,
    subscribeToNotificationType: socketData.subscribeToNotificationType,
    unsubscribeFromNotificationType: socketData.unsubscribeFromNotificationType,
  }), [socketData])

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
      <NotificationStack notifications={toastNotifications} onRemove={remove} />
    </NotificationsContext.Provider>
  )
}

export default NotificationsProvider
