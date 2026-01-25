import React from 'react'
import { Pressable, View } from 'react-native'
import type { PressableProps } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

type IconButtonVariant = 'default' | 'primary' | 'ghost' | 'danger'
type IconButtonSize = 'sm' | 'md' | 'lg'

export interface IconButtonProps extends Omit<PressableProps, 'style'> {
  icon: React.ReactNode
  variant?: IconButtonVariant
  size?: IconButtonSize
  disabled?: boolean
  rounded?: boolean
  className?: string
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const sizeStyles = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
}

const variantStyles = {
  default: 'bg-neutral-100 active:bg-neutral-200',
  primary: 'bg-red active:bg-red700',
  ghost: 'bg-transparent active:bg-neutral-100',
  danger: 'bg-red-100 active:bg-red-200',
}

export function IconButton({
  icon,
  variant = 'default',
  size = 'md',
  disabled = false,
  rounded = true,
  className = '',
  onPressIn,
  onPressOut,
  ...props
}: IconButtonProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = (e: any) => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 })
    onPressIn?.(e)
  }

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 })
    onPressOut?.(e)
  }

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className={`
        items-center justify-center
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${rounded ? 'rounded-full' : 'rounded-lg'}
        ${disabled ? 'opacity-50' : ''}
        ${className}
      `}
      {...props}
    >
      <View>{icon}</View>
    </AnimatedPressable>
  )
}
