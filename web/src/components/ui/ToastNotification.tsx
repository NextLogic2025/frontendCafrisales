import { useEffect, useState } from 'react'
import { FiAlertCircle, FiCheckCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi'
import { BRAND_COLORS } from '../../features/shared/types'

type ToastType = 'error' | 'success' | 'warning' | 'info'

type ToastNotificationProps = {
  message: string
  title?: string
  duration?: number
  type?: ToastType
  position?: 'top' | 'bottom'
  showClose?: boolean
  onHide: () => void
}

const toastConfig: Record<ToastType, { bg: string; text: string; icon: typeof FiAlertCircle }> = {
  error: { bg: '#FEE2E2', text: BRAND_COLORS.red700, icon: FiAlertCircle },
  success: { bg: '#D1FAE5', text: '#059669', icon: FiCheckCircle },
  warning: { bg: '#FEF3C7', text: '#D97706', icon: FiAlertTriangle },
  info: { bg: '#DBEAFE', text: '#2563EB', icon: FiInfo },
}

export function ToastNotification({
  message,
  title,
  duration = 4000,
  type = 'error',
  position = 'top',
  showClose = false,
  onHide,
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const config = toastConfig[type]
  const Icon = config.icon

  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onHide, 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onHide])

  const positionClass = position === 'top' ? 'top-4' : 'bottom-4'
  const translateClass = isVisible
    ? 'translate-y-0 opacity-100'
    : position === 'top'
      ? '-translate-y-full opacity-0'
      : 'translate-y-full opacity-0'

  return (
    <div
      className={`fixed inset-x-4 ${positionClass} z-50 mx-auto max-w-md transform transition-all duration-300 ease-out ${translateClass}`}
      style={{ backgroundColor: config.bg }}
    >
      <div className="flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg">
        <Icon size={22} color={config.text} />
        <div className="flex-1">
          {title && (
            <p style={{ color: config.text }} className="text-sm font-bold">
              {title}
            </p>
          )}
          <p style={{ color: config.text }} className="text-sm">
            {message}
          </p>
        </div>
        {showClose && (
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onHide, 300)
            }}
            className="p-1 transition-opacity hover:opacity-70"
          >
            <FiX size={18} color={config.text} />
          </button>
        )}
      </div>
    </div>
  )
}
