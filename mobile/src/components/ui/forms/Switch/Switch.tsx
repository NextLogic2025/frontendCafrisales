import React from 'react'
import { Pressable, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated'
import { Text } from '../../atoms/Text'

export interface SwitchProps {
  value: boolean
  onChange: (value: boolean) => void
  label?: string
  disabled?: boolean
  className?: string
}

const AnimatedView = Animated.createAnimatedComponent(View)

export function Switch({
  value,
  onChange,
  label,
  disabled = false,
  className = '',
}: SwitchProps) {
  const translateX = useSharedValue(value ? 20 : 0)
  const colorProgress = useSharedValue(value ? 1 : 0)

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  const trackAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorProgress.value,
      [0, 1],
      ['#E5E7EB', '#F0412D']
    )

    return { backgroundColor }
  })

  const handleToggle = () => {
    if (!disabled) {
      const newValue = !value
      onChange(newValue)

      translateX.value = withSpring(newValue ? 20 : 0, { damping: 15, stiffness: 300 })
      colorProgress.value = withSpring(newValue ? 1 : 0, { damping: 15, stiffness: 300 })
    }
  }

  React.useEffect(() => {
    translateX.value = withSpring(value ? 20 : 0, { damping: 15, stiffness: 300 })
    colorProgress.value = withSpring(value ? 1 : 0, { damping: 15, stiffness: 300 })
  }, [value])

  return (
    <Pressable
      onPress={handleToggle}
      disabled={disabled}
      className={`flex-row items-center gap-3 ${className}`}
    >
      <AnimatedView
        style={trackAnimatedStyle}
        className={`
          w-12 h-7 rounded-full p-1
          ${disabled ? 'opacity-50' : ''}
        `}
      >
        <AnimatedView
          style={thumbAnimatedStyle}
          className="w-5 h-5 rounded-full bg-white shadow-md"
        />
      </AnimatedView>

      {label && (
        <Text
          variant="body"
          color={disabled ? 'text-neutral-400' : 'text-neutral-900'}
          className="flex-1"
        >
          {label}
        </Text>
      )}
    </Pressable>
  )
}
