import React from 'react'
import { View, Pressable, Platform, StatusBar } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../../atoms/Text'
import { Avatar } from '../../atoms/Avatar'
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
  variant?: 'default' | 'welcome'
  transparent?: boolean
  greetingName?: string
  roleLabel?: string
  avatarUri?: string
  counter?: number | string
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
  greetingName,
  roleLabel,
  avatarUri,
  counter,
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

  const paddingTop = insets.top || (Platform.OS === 'android' ? StatusBar.currentHeight : 0)

  if (variant === 'welcome') {
    return (
      <View style={{ paddingTop }} className={transparent ? 'bg-transparent' : 'bg-red'}>
        <View className="px-4 pt-2 pb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Avatar
                name={greetingName || title}
                source={avatarUri ? { uri: avatarUri } : undefined}
                size="lg"
                className="bg-white/20 border-2 border-white/40"
              />
              <View className="ml-3 flex-1">
                <Text variant="caption" weight="medium" color="text-white/80">
                  Bienvenido
                </Text>
                <Text variant="h3" weight="bold" color="text-white" numberOfLines={1}>
                  Hola, {greetingName || 'Usuario'}
                </Text>
                {roleLabel && (
                  <View className="self-start mt-1.5 px-3 py-0.5 rounded-full bg-white/20">
                    <Text variant="caption" weight="bold" color="text-white">
                      {roleLabel.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {rightAction ? (
              <View className="flex-row items-center">{rightAction}</View>
            ) : (
              <Pressable className="h-10 w-10 rounded-full bg-white/15 items-center justify-center ml-2">
                <Ionicons name="notifications-outline" size={20} color="#fff" />
              </Pressable>
            )}
          </View>
        </View>
      </View>
    )
  }

  return (
    <View
      style={{ paddingTop }}
      className={`
        ${transparent ? 'bg-transparent' : 'bg-red'}
        pb-2
      `}
    >
      <View className="flex-row items-center justify-between px-4 pt-2">
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
            variant="title"
            weight="bold"
            color="text-white"
            align="left"
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              variant="bodySmall"
              color="text-white"
              align="left"
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
