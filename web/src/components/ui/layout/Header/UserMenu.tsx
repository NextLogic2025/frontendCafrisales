import React from 'react'
import { ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { Avatar } from '../../atoms/Avatar'
import { cn } from '@/utils'

export interface UserMenuProps {
  user: {
    name: string
    email: string
    avatar?: string
    role?: string
  }
  onLogout?: () => void
  onProfile?: () => void
  onSettings?: () => void
  className?: string
}

export const UserMenu = React.forwardRef<HTMLDivElement, UserMenuProps>(
  ({ user, onLogout, onProfile, onSettings, className }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const menuRef = React.useRef<HTMLDivElement>(null)

    // Close menu when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
      <div ref={ref} className={cn('relative', className)}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2',
            'text-white hover:bg-red700 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-white/20'
          )}
        >
          <Avatar src={user.avatar} name={user.name} size="sm" />
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold">{user.name}</p>
            {user.role && <p className="text-xs opacity-90">{user.role}</p>}
          </div>
          <ChevronDown className="h-4 w-4 opacity-75" />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            ref={menuRef}
            className={cn(
              'absolute right-0 top-full mt-2 w-56 rounded-lg border border-neutral-200 bg-white shadow-lg',
              'animate-in fade-in-0 zoom-in-95'
            )}
          >
            {/* User Info */}
            <div className="border-b border-neutral-100 p-3">
              <p className="text-sm font-semibold text-neutral-900">{user.name}</p>
              <p className="text-xs text-neutral-600">{user.email}</p>
            </div>

            {/* Menu Items */}
            <div className="p-1">
              {onProfile && (
                <button
                  onClick={() => {
                    onProfile()
                    setIsOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm',
                    'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900',
                    'transition-colors'
                  )}
                >
                  <User className="h-4 w-4" />
                  Mi Perfil
                </button>
              )}

              {onSettings && (
                <button
                  onClick={() => {
                    onSettings()
                    setIsOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm',
                    'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900',
                    'transition-colors'
                  )}
                >
                  <Settings className="h-4 w-4" />
                  Configuración
                </button>
              )}

              {onLogout && (
                <>
                  <div className="my-1 h-px bg-neutral-100" />
                  <button
                    onClick={() => {
                      onLogout()
                      setIsOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm',
                      'text-red-600 hover:bg-red-50',
                      'transition-colors'
                    )}
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
)

UserMenu.displayName = 'UserMenu'
