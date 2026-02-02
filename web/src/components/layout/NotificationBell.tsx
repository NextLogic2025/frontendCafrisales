import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react'
import { Bell } from 'components/ui/Icons'
import { Fragment } from 'react'
import { useNotificationsContext } from '../../context/notifications/NotificationsProvider'
import { NotificationList } from '../notifications/NotificationList'

export function NotificationBell() {
    const { unreadCount, isConnected } = useNotificationsContext()
    const count = unreadCount || 0

    return (
        <Popover className="relative">
            <PopoverButton
                className="relative rounded-full p-2 text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-red/20 transition-colors"
                title={isConnected ? 'Notificaciones' : 'Desconectado'}
            >
                <Bell className={`h-6 w-6 ${!isConnected ? 'opacity-50' : ''}`} />
                {count > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-red text-[10px] font-bold text-white ring-2 ring-white">
                        {count > 99 ? '99+' : count}
                    </span>
                )}
                {!isConnected && (
                    <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-neutral-400 ring-2 ring-white" title="Desconectado" />
                )}
            </PopoverButton>
            <PopoverPanel
                transition
                anchor="bottom start"
                className="z-50 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
            >
                <NotificationList />
            </PopoverPanel>
        </Popover>
    )
}
