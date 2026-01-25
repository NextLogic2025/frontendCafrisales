import React from 'react'
import { View, Pressable, PressableProps } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

type CardVariant = 'elevated' | 'outlined' | 'filled'

export interface CardProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode
  variant?: CardVariant
  noPadding?: boolean
  onPress?: () => void
  className?: string
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const variantStyles = {
  elevated: 'bg-white shadow-md',
  outlined: 'bg-white border border-neutral-200',
  filled: 'bg-neutral-50',
}

export function Card({
  children,
  variant = 'elevated',
  noPadding = false,
  onPress,
  className = '',
  ...props
}: CardProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 300 })
    }
  }

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 })
    }
  }

  const Container = onPress ? AnimatedPressable : View

  const containerProps = onPress
    ? {
        onPress,
        onPressIn: handlePressIn,
        onPressOut: handlePressOut,
        style: animatedStyle,
        ...props,
      }
    : {}

  return (
    <Container
      {...containerProps}
      className={`
        rounded-xl
        ${variantStyles[variant]}
        ${noPadding ? '' : 'p-4'}
        ${className}
      `}
    >
      {children}
    </Container>
  )
}
