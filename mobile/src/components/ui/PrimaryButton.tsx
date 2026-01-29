import { BRAND_COLORS } from '../../services/shared/types'
import { LinearGradient } from 'expo-linear-gradient'
import * as React from 'react'
import { ActivityIndicator, Pressable, PressableProps, Text, ViewStyle } from 'react-native'

/**
 * Props for PrimaryButton component.
 * Extends native Pressable props for full accessibility and interaction support.
 */
type PrimaryButtonProps = {
  /** Button label text */
  title: string
  /** Show loading spinner instead of title */
  loading?: boolean
  /** Additional container style */
  style?: ViewStyle
} & Omit<PressableProps, 'style' | 'children'>

export const PrimaryButton = React.memo(function PrimaryButton({
  title,
  loading,
  disabled,
  style,
  ...pressableProps
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={['overflow-hidden rounded-2xl', isDisabled ? 'opacity-60' : 'active:opacity-90'].join(' ')}
      style={({ pressed }) => [pressed && !isDisabled ? { transform: [{ translateY: 1 }] } : null, style]}
      {...pressableProps}
    >
      <LinearGradient
        colors={[BRAND_COLORS.red, BRAND_COLORS.red700]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="font-extrabold text-white">{title}</Text>
        )}
      </LinearGradient>
    </Pressable>
  )
})
