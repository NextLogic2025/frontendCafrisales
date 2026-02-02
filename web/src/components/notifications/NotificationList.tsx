import { Check, MailOpen, Trash2 } from 'lucide-react'
import { useNotificationsContext } from '../../context/notifications/NotificationsProvider'
import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'

export function NotificationList() {
    const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotificationsContext()
    const unreadCount = notifications.filter(n => !n.read).length

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-neutral-500">
                <MailOpen className="mb-2 h-8 w-8 opacity-20" />
                <p className="text-sm">No tienes notificaciones</p>
            </div>
        )
    }

    return (
        <div className="w-full max-w-sm bg-white rounded-xl shadow-lg border border-neutral-100 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-3 border-b border-neutral-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <h3 className="text-sm font-semibold text-neutral-900">Notificaciones</h3>
                <div className="flex gap-1">
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAllAsRead?.()}
                            className="h-7 text-xs px-2 text-brand-red hover:text-brand-red-dark hover:bg-red-50"
                            title="Marcar todas como leídas"
                        >
                            <Check className="mr-1 h-3 w-3" />
                            Leídas
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearNotifications}
                        className="h-7 w-7 p-0 text-neutral-400 hover:text-neutral-600"
                        title="Limpiar"
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        onClick={() => !notification.read && markAsRead?.(notification.id!)}
                        className={cn(
                            "group relative flex gap-3 rounded-lg p-3 transition-colors hover:bg-neutral-50 cursor-pointer",
                            !notification.read ? "bg-red-50/30" : "bg-white"
                        )}
                    >
                        {!notification.read && (
                            <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-brand-red ring-4 ring-white" />
                        )}

                        <div className="flex-1 space-y-1">
                            <p className={cn("text-sm font-medium leading-none", !notification.read ? "text-neutral-900" : "text-neutral-600")}>
                                {notification.title}
                            </p>
                            <p className="text-xs text-neutral-500 line-clamp-2">
                                {notification.message}
                            </p>
                            <p className="text-[10px] text-neutral-400">
                                {new Date(notification.timestamp || Date.now()).toLocaleString('es-ES', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
