import React from 'react'
import { Pressable, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { Text } from '../Text'
import { Ionicons } from '@expo/vector-icons'

type ChipVariant = 'default' | 'primary' | 'outlined'

export interface ChipProps {
  children: React.ReactNode
  variant?: ChipVariant
  selected?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  onRemove?: () => void
  onPress?: () => void
  className?: string
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const variantStyles = {
  default: {
    container: 'bg-neutral-100',
    selectedContainer: 'bg-red',
    text: 'text-neutral-700',
    selectedText: 'text-white',
  },
  primary: {
    container: 'bg-red/10',
    selectedContainer: 'bg-red',
    text: 'text-red700',
    selectedText: 'text-white',
  },
  outlined: {
    container: 'bg-transparent border border-neutral-300',
    selectedContainer: 'bg-red border-red',
    text: 'text-neutral-700',
    selectedText: 'text-white',
  },
}

export function Chip({
  children,
  variant = 'default',
  selected = false,
  disabled = false,
  icon,
  onRemove,
  onPress,
  className = '',
}: ChipProps) {
  const scale = useSharedValue(1)
  const styles = variantStyles[variant]

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    if (!disabled && onPress) {
      scale.value = withTiming(0.95, { duration: 100 })
    }
  }

  const handlePressOut = () => {
    if (!disabled && onPress) {
      scale.value = withTiming(1, { duration: 100 })
    }
  }

  const Container = onPress ? AnimatedPressable : View

  return (
    <Container
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={onPress ? animatedStyle : undefined}
      className={`
        flex-row items-center gap-1.5 px-3 py-1.5 rounded-full
        ${selected ? styles.selectedContainer : styles.container}
        ${disabled ? 'opacity-50' : ''}
        ${className}
      `}
    >
      {icon && <View>{icon}</View>}
      <Text
        variant="bodySmall"
        weight="medium"
        color={selected ? styles.selectedText : styles.text}
      >
        {children}
      </Text>
      {onRemove && (
        <Pressable onPress={onRemove} className="ml-1">
          <Ionicons
            name="close-circle"
            size={16}
            color={selected ? '#FFFFFF' : '#9CA3AF'}
          />
        </Pressable>
      )}
    </Container>
  )
}
