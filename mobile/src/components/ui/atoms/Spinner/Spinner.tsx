import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import { Text } from '../Text'

type SpinnerSize = 'sm' | 'md' | 'lg'

export interface SpinnerProps {
  size?: SpinnerSize
  color?: string
  text?: string
  className?: string
}

const sizeMap = {
  sm: 'small' as const,
  md: 'large' as const,
  lg: 'large' as const,
}

export function Spinner({ size = 'md', color = '#F0412D', text, className = '' }: SpinnerProps) {
  return (
    <View className={`items-center justify-center gap-2 ${className}`}>
      <ActivityIndicator size={sizeMap[size]} color={color} />
      {text && (
        <Text variant="body" color="text-neutral-600">
          {text}
        </Text>
      )}
    </View>
  )
}
