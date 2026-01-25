import React from 'react'
import { View, Pressable } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { Text } from '../../atoms/Text'

export interface RadioOption {
  label: string
  value: string
  disabled?: boolean
}

export interface RadioGroupProps {
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  label?: string
  error?: string
  disabled?: boolean
  className?: string
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

function RadioButton({
  selected,
  onPress,
  disabled,
}: {
  selected: boolean
  onPress: () => void
  disabled?: boolean
}) {
  const scale = useSharedValue(1)
  const dotScale = useSharedValue(selected ? 1 : 0)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const dotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 })
  }

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 })
  }

  React.useEffect(() => {
    dotScale.value = withSpring(selected ? 1 : 0, { damping: 15, stiffness: 400 })
  }, [selected])

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={animatedStyle}
      className={`
        w-6 h-6 rounded-full items-center justify-center
        ${selected ? 'bg-red' : 'bg-white border-2 border-neutral-300'}
        ${disabled ? 'opacity-50' : ''}
      `}
    >
      <Animated.View
        style={dotAnimatedStyle}
        className="w-3 h-3 rounded-full bg-white"
      />
    </AnimatedPressable>
  )
}

export function RadioGroup({
  options,
  value,
  onChange,
  label,
  error,
  disabled = false,
  className = '',
}: RadioGroupProps) {
  return (
    <View className={className}>
      {label && (
        <Text variant="label" color="text-neutral-600" className="mb-2">
          {label}
        </Text>
      )}

      <View className="gap-3">
        {options.map((option) => {
          const isSelected = option.value === value
          const isDisabled = disabled || option.disabled

          return (
            <Pressable
              key={option.value}
              onPress={() => !isDisabled && onChange(option.value)}
              className="flex-row items-center gap-3"
            >
              <RadioButton
                selected={isSelected}
                onPress={() => !isDisabled && onChange(option.value)}
                disabled={isDisabled}
              />
              <Text
                variant="body"
                color={isDisabled ? 'text-neutral-400' : 'text-neutral-900'}
                className="flex-1"
              >
                {option.label}
              </Text>
            </Pressable>
          )
        })}
      </View>

      {error && (
        <Text variant="caption" color="text-red700" className="mt-1">
          {error}
        </Text>
      )}
    </View>
  )
}
