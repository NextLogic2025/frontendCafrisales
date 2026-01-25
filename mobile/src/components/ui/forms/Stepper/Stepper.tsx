import React from 'react'
import { View, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { Text } from '../../atoms/Text'

export interface StepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  disabled?: boolean
  className?: string
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  label,
  disabled = false,
  className = '',
}: StepperProps) {
  const minusScale = useSharedValue(1)
  const plusScale = useSharedValue(1)

  const minusAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: minusScale.value }],
  }))

  const plusAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: plusScale.value }],
  }))

  const handleDecrement = () => {
    if (!disabled && value > min) {
      onChange(Math.max(min, value - step))
    }
  }

  const handleIncrement = () => {
    if (!disabled && value < max) {
      onChange(Math.min(max, value + step))
    }
  }

  const handleMinusPressIn = () => {
    minusScale.value = withSpring(0.9, { damping: 15, stiffness: 400 })
  }

  const handleMinusPressOut = () => {
    minusScale.value = withSpring(1, { damping: 15, stiffness: 400 })
  }

  const handlePlusPressIn = () => {
    plusScale.value = withSpring(0.9, { damping: 15, stiffness: 400 })
  }

  const handlePlusPressOut = () => {
    plusScale.value = withSpring(1, { damping: 15, stiffness: 400 })
  }

  const isMinDisabled = disabled || value <= min
  const isMaxDisabled = disabled || value >= max

  return (
    <View className={className}>
      {label && (
        <Text variant="label" color="text-neutral-600" className="mb-2">
          {label}
        </Text>
      )}

      <View className="flex-row items-center gap-3">
        <AnimatedPressable
          onPress={handleDecrement}
          onPressIn={handleMinusPressIn}
          onPressOut={handleMinusPressOut}
          disabled={isMinDisabled}
          style={minusAnimatedStyle}
          className={`
            w-10 h-10 items-center justify-center rounded-lg bg-neutral-100
            ${isMinDisabled ? 'opacity-30' : 'active:bg-neutral-200'}
          `}
        >
          <Ionicons name="remove" size={20} color="#374151" />
        </AnimatedPressable>

        <View className="min-w-[60px] items-center">
          <Text variant="title" weight="bold" color="text-neutral-900">
            {value}
          </Text>
        </View>

        <AnimatedPressable
          onPress={handleIncrement}
          onPressIn={handlePlusPressIn}
          onPressOut={handlePlusPressOut}
          disabled={isMaxDisabled}
          style={plusAnimatedStyle}
          className={`
            w-10 h-10 items-center justify-center rounded-lg bg-red
            ${isMaxDisabled ? 'opacity-30' : 'active:bg-red700'}
          `}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </AnimatedPressable>
      </View>
    </View>
  )
}
