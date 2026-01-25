import { Animated, Text, View, Pressable } from 'react-native'
import { useEffect, useRef } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { BRAND_COLORS } from '../../features/shared/types'

type ToastType = 'error' | 'success' | 'warning' | 'info'

type ToastNotificationProps = {
  message: string
  title?: string
  type?: ToastType
  duration?: number
  position?: 'top' | 'bottom'
  showClose?: boolean
  onHide: () => void
}

const toastConfig: Record<ToastType, { bg: string; text: string; icon: keyof typeof Ionicons.glyphMap }> = {
  error: { bg: '#FEE2E2', text: BRAND_COLORS.red700, icon: 'alert-circle' },
  success: { bg: '#D1FAE5', text: '#059669', icon: 'checkmark-circle' },
  warning: { bg: '#FEF3C7', text: '#D97706', icon: 'warning' },
  info: { bg: '#DBEAFE', text: '#2563EB', icon: 'information-circle' },
}

export function ToastNotification({
  message,
  title,
  type = 'error',
  duration = 3500,
  position = 'top',
  showClose = false,
  onHide,
}: ToastNotificationProps) {
  const translateY = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current
  const config = toastConfig[type]

  useEffect(() => {
    const slideIn = Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
    })

    const slideOut = Animated.spring(translateY, {
      toValue: position === 'top' ? -100 : 100,
      useNativeDriver: true,
    })

    Animated.sequence([
      slideIn,
      Animated.delay(duration),
      slideOut,
    ]).start(() => onHide())

    return () => {
      slideIn.stop()
      slideOut.stop()
    }
  }, [duration, onHide, position, translateY])

  const positionStyle = position === 'top' ? 'top-12' : 'bottom-12'

  return (
    <Animated.View
      style={[
        { transform: [{ translateY }], backgroundColor: config.bg },
      ]}
      className={`absolute inset-x-4 ${positionStyle} z-50 flex-row items-center rounded-2xl px-4 py-3 shadow-lg`}
    >
      <Ionicons name={config.icon} size={24} color={config.text} />
      <View className="ml-3 flex-1">
        {title && (
          <Text style={{ color: config.text }} className="text-sm font-bold">
            {title}
          </Text>
        )}
        <Text style={{ color: config.text }} className="text-sm">
          {message}
        </Text>
      </View>
      {showClose && (
        <Pressable onPress={onHide} hitSlop={10} className="ml-2 p-1">
          <Ionicons name="close" size={20} color={config.text} />
        </Pressable>
      )}
    </Animated.View>
  )
}
