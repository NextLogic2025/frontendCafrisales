import React, { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

type SkeletonVariant = 'line' | 'circle' | 'rect' | 'card'

export interface SkeletonProps {
  variant?: SkeletonVariant
  width?: number | string
  height?: number | string
  className?: string
}

export function Skeleton({
  variant = 'line',
  width = '100%',
  height,
  className = '',
}: SkeletonProps) {
  const opacity = useSharedValue(0.3)

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      false
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  const getDefaultHeight = () => {
    switch (variant) {
      case 'line':
        return 16
      case 'circle':
        return 40
      case 'rect':
        return 80
      case 'card':
        return 200
      default:
        return 16
    }
  }

  const getShape = () => {
    switch (variant) {
      case 'line':
        return 'rounded-md'
      case 'circle':
        return 'rounded-full'
      case 'rect':
      case 'card':
        return 'rounded-xl'
      default:
        return 'rounded-md'
    }
  }

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: typeof width === 'number' ? width : width,
          height: height || getDefaultHeight(),
        },
      ]}
      className={`bg-neutral-200 ${getShape()} ${className}`}
    />
  )
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <View className={`gap-3 p-4 ${className}`}>
      <View className="flex-row gap-3">
        <Skeleton variant="circle" width={48} height={48} />
        <View className="flex-1 gap-2">
          <Skeleton variant="line" width="70%" height={16} />
          <Skeleton variant="line" width="50%" height={12} />
        </View>
      </View>
      <Skeleton variant="rect" height={120} />
      <View className="gap-2">
        <Skeleton variant="line" width="100%" />
        <Skeleton variant="line" width="90%" />
        <Skeleton variant="line" width="80%" />
      </View>
    </View>
  )
}
