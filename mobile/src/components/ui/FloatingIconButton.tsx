import React from 'react'
import { Pressable, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BRAND_COLORS } from '../../shared/types'
import { useStableInsets } from '../../hooks/useStableInsets'

type Props = {
  icon: keyof typeof Ionicons.glyphMap
  onPress: () => void
  accessibilityLabel?: string
  style?: ViewStyle
}

export function FloatingIconButton({ icon, onPress, accessibilityLabel, style }: Props) {
  const insets = useStableInsets()
  const bottom = Math.max(insets.bottom, 16) + 24

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={[
        {
          position: 'absolute',
          right: 20,
          bottom,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: BRAND_COLORS.red,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: BRAND_COLORS.red,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 10,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={24} color="white" />
    </Pressable>
  )
}
