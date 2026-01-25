import React from 'react'
import { Pressable, Text, View, ActivityIndicator } from 'react-native'
import type { PressableProps } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate
} from 'react-native-reanimated'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  loadingText?: string
  disabled?: boolean
  fullWidth?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  className?: string
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const sizeStyles = {
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-6 py-4',
  xl: 'px-8 py-5',
}

const textSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
}

const variantStyles = {
  primary: {
    container: 'bg-red active:bg-red700',
    text: 'text-white',
    border: '',
  },
  secondary: {
    container: 'bg-gold active:bg-gold/90',
    text: 'text-neutral-900',
    border: '',
  },
  ghost: {
    container: 'bg-transparent',
    text: 'text-red',
    border: 'border-2 border-red active:border-red700',
  },
  danger: {
    container: 'bg-red-600 active:bg-red-700',
    text: 'text-white',
    border: '',
  },
  success: {
    container: 'bg-green-600 active:bg-green-700',
    text: 'text-white',
    border: '',
  },
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = '',
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)

  const isDisabled = disabled || loading
  const styles = variantStyles[variant]

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  const handlePressIn = (e: any) => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 })
    opacity.value = withTiming(0.8, { duration: 100 })
    onPressIn?.(e)
  }

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 })
    opacity.value = withTiming(1, { duration: 100 })
    onPressOut?.(e)
  }

  const getSpinnerColor = () => {
    if (variant === 'ghost' || variant === 'secondary') return '#F0412D'
    return '#FFFFFF'
  }

  return (
    <AnimatedPressable
      disabled={isDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className={`
        flex-row items-center justify-center rounded-xl
        ${sizeStyles[size]}
        ${styles.container}
        ${styles.border}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <View className="flex-row items-center gap-2">
          <ActivityIndicator size="small" color={getSpinnerColor()} />
          {loadingText && (
            <Text className={`font-semibold ${textSizes[size]} ${styles.text}`}>
              {loadingText}
            </Text>
          )}
        </View>
      ) : (
        <View className="flex-row items-center gap-2">
          {icon && iconPosition === 'left' && icon}
          <Text className={`font-semibold ${textSizes[size]} ${styles.text}`}>
            {children}
          </Text>
          {icon && iconPosition === 'right' && icon}
        </View>
      )}
    </AnimatedPressable>
  )
}
