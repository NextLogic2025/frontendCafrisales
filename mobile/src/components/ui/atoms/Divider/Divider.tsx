import React from 'react'
import { View } from 'react-native'
import { Text } from '../Text'

type DividerOrientation = 'horizontal' | 'vertical'

export interface DividerProps {
  orientation?: DividerOrientation
  label?: string
  className?: string
}

export function Divider({
  orientation = 'horizontal',
  label,
  className = '',
}: DividerProps) {
  if (orientation === 'vertical') {
    return <View className={`w-px bg-neutral-200 ${className}`} />
  }

  if (label) {
    return (
      <View className={`flex-row items-center gap-4 ${className}`}>
        <View className="flex-1 h-px bg-neutral-200" />
        <Text variant="caption" color="text-neutral-500">
          {label}
        </Text>
        <View className="flex-1 h-px bg-neutral-200" />
      </View>
    )
  }

  return <View className={`h-px bg-neutral-200 ${className}`} />
}
