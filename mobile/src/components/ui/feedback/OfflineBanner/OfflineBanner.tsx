import React, { useEffect } from 'react'
import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '../../atoms/Text'

export interface OfflineBannerProps {
  visible: boolean
}

export function OfflineBanner({ visible }: OfflineBannerProps) {
  const insets = useSafeAreaInsets()
  const translateY = useSharedValue(-100)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : -100, { duration: 300 })
  }, [visible])

  return (
    <Animated.View
      style={[animatedStyle, { paddingTop: insets.top }]}
      className="absolute top-0 left-0 right-0 z-50"
    >
      <View className="bg-neutral-900 px-4 py-3">
        <View className="flex-row items-center justify-center gap-2">
          <Ionicons name="cloud-offline-outline" size={20} color="#FFFFFF" />
          <Text variant="bodySmall" weight="medium" color="text-white">
            Sin conexión a internet
          </Text>
        </View>
      </View>
    </Animated.View>
  )
}
