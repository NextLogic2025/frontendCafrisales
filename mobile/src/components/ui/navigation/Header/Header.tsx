import React from 'react'
import { View, Pressable, Platform, StatusBar } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../../atoms/Text'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

export interface HeaderProps {
  title: string
  subtitle?: string
  showBackButton?: boolean
  onBackPress?: () => void
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
  variant?: 'default' | 'large'
  transparent?: boolean
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function Header({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  leftAction,
  rightAction,
  variant = 'default',
  transparent = false,
}: HeaderProps) {
  const insets = useSafeAreaInsets()
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handleBackPressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 })
  }

  const handleBackPressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 })
  }

  const isLarge = variant === 'large'
  const paddingTop = insets.top || (Platform.OS === 'android' ? StatusBar.currentHeight : 0)

  return (
    <View
      style={{ paddingTop }}
      className={`
        ${transparent ? 'bg-transparent' : 'bg-red'}
        ${isLarge ? 'pb-6' : 'pb-4'}
      `}
    >
      <View className={`flex-row items-center justify-between px-4 ${isLarge ? 'pt-4' : 'pt-3'}`}>
        {/* Left Section */}
        <View className="flex-row items-center gap-3">
          {showBackButton && (
            <AnimatedPressable
              onPress={onBackPress}
              onPressIn={handleBackPressIn}
              onPressOut={handleBackPressOut}
              style={animatedStyle}
              className="w-10 h-10 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </AnimatedPressable>
          )}
          {leftAction}
        </View>

        {/* Title Section */}
        <View className="flex-1 px-2">
          <Text
            variant={isLarge ? 'h3' : 'title'}
            weight="bold"
            color="text-white"
            align={showBackButton || leftAction ? 'left' : 'center'}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              variant="bodySmall"
              color="text-white"
              align={showBackButton || leftAction ? 'left' : 'center'}
              numberOfLines={1}
              className="opacity-90"
            >
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Section */}
        <View className="flex-row items-center gap-2">{rightAction}</View>
      </View>
    </View>
  )
}
