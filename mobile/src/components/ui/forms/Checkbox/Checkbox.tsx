import React from 'react'
import { Pressable, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { Text } from '../../atoms/Text'

export interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  error?: string
  className?: string
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  error,
  className = '',
}: CheckboxProps) {
  const scale = useSharedValue(1)
  const checkScale = useSharedValue(checked ? 1 : 0)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }))

  const handlePress = () => {
    if (!disabled) {
      const newValue = !checked
      onChange(newValue)
      checkScale.value = withSpring(newValue ? 1 : 0, { damping: 15, stiffness: 400 })
    }
  }

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 })
  }

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 })
  }

  React.useEffect(() => {
    checkScale.value = withSpring(checked ? 1 : 0, { damping: 15, stiffness: 400 })
  }, [checked])

  return (
    <View className={className}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={animatedStyle}
        className="flex-row items-center gap-3"
      >
        <View
          className={`
            w-6 h-6 rounded-md items-center justify-center
            ${checked ? 'bg-red' : 'bg-white border-2 border-neutral-300'}
            ${error ? 'border-red700' : ''}
            ${disabled ? 'opacity-50' : ''}
          `}
        >
          <Animated.View style={checkAnimatedStyle}>
            {checked && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
          </Animated.View>
        </View>

        {label && (
          <Text
            variant="body"
            color={disabled ? 'text-neutral-400' : 'text-neutral-900'}
            className="flex-1"
          >
            {label}
          </Text>
        )}
      </AnimatedPressable>

      {error && (
        <Text variant="caption" color="text-red700" className="mt-1 ml-9">
          {error}
        </Text>
      )}
    </View>
  )
}
