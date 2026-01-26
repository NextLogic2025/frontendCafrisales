import React from 'react'

type NotificationContextValue = {
    badgeCount: number
    markAllRead: () => void
}

const NotificationContext = React.createContext<NotificationContextValue | null>(null)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [badgeCount, setBadgeCount] = React.useState(0)

    const markAllRead = React.useCallback(() => {
        setBadgeCount(0)
    }, [])

    const value = React.useMemo(() => ({ badgeCount, markAllRead }), [badgeCount, markAllRead])

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotificationsOptional() {
    return React.useContext(NotificationContext)
}
