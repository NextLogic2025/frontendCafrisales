import React from 'react'
import { View, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { Text } from '../../atoms/Text'

export interface ListItemProps {
  title: string
  subtitle?: string
  description?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  rightAccessory?: React.ReactNode
  onPress?: () => void
  showChevron?: boolean
  disabled?: boolean
  className?: string
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function ListItem({
  title,
  subtitle,
  description,
  leftIcon,
  rightIcon,
  rightAccessory,
  onPress,
  showChevron = false,
  disabled = false,
  className = '',
}: ListItemProps) {
  const scale = useSharedValue(1)
  const backgroundColor = useSharedValue(0)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    if (onPress && !disabled) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 300 })
    }
  }

  const handlePressOut = () => {
    if (onPress && !disabled) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 })
    }
  }

  const Container = onPress ? AnimatedPressable : View

  const containerProps = onPress
    ? {
        onPress,
        onPressIn: handlePressIn,
        onPressOut: handlePressOut,
        disabled,
        style: animatedStyle,
      }
    : {}

  return (
    <Container
      {...containerProps}
      className={`
        flex-row items-center gap-3 py-3
        ${disabled ? 'opacity-50' : ''}
        ${className}
      `}
    >
      {leftIcon && <View>{leftIcon}</View>}

      <View className="flex-1 gap-1">
        <Text variant="body" weight="medium" color="text-neutral-900" numberOfLines={1}>
          {title}
        </Text>

        {subtitle && (
          <Text variant="bodySmall" color="text-neutral-600" numberOfLines={1}>
            {subtitle}
          </Text>
        )}

        {description && (
          <Text variant="caption" color="text-neutral-500" numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>

      {rightAccessory && <View>{rightAccessory}</View>}
      {rightIcon && <View>{rightIcon}</View>}
      {showChevron && !rightIcon && !rightAccessory && (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      )}
    </Container>
  )
}
