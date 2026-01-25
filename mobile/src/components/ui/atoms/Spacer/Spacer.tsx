import React from 'react'
import { View } from 'react-native'

type SpacerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export interface SpacerProps {
  size?: SpacerSize
  horizontal?: boolean
}

const sizeMap = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
}

export function Spacer({ size = 'md', horizontal = false }: SpacerProps) {
  const dimension = sizeMap[size]

  return (
    <View
      style={{
        width: horizontal ? dimension : undefined,
        height: !horizontal ? dimension : undefined,
      }}
    />
  )
}
