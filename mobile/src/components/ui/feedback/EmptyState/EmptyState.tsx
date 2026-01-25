import React from 'react'
import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../../atoms/Text'
import { Button } from '../../atoms/Button'

export interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon = 'file-tray-outline',
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <View className={`flex-1 items-center justify-center px-8 py-12 ${className}`}>
      <View className="items-center gap-4">
        <View className="w-20 h-20 items-center justify-center rounded-full bg-neutral-100">
          <Ionicons name={icon} size={40} color="#9CA3AF" />
        </View>

        <View className="items-center gap-2">
          <Text variant="title" weight="semibold" color="text-neutral-900" align="center">
            {title}
          </Text>

          {description && (
            <Text variant="body" color="text-neutral-500" align="center">
              {description}
            </Text>
          )}
        </View>

        {actionLabel && onAction && (
          <Button variant="primary" onPress={onAction} className="mt-4">
            {actionLabel}
          </Button>
        )}
      </View>
    </View>
  )
}
