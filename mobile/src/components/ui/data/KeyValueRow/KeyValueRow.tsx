import React from 'react'
import { View } from 'react-native'
import { Text } from '../../atoms/Text'

export interface KeyValueRowProps {
  label: string
  value: string | React.ReactNode
  icon?: React.ReactNode
  variant?: 'default' | 'compact'
  className?: string
}

export function KeyValueRow({
  label,
  value,
  icon,
  variant = 'default',
  className = '',
}: KeyValueRowProps) {
  const isCompact = variant === 'compact'

  return (
    <View className={`flex-row items-center ${isCompact ? 'gap-2' : 'gap-3'} ${className}`}>
      {icon && <View>{icon}</View>}

      <View className="flex-1">
        <Text
          variant={isCompact ? 'caption' : 'bodySmall'}
          color="text-neutral-500"
          className="mb-0.5"
        >
          {label}
        </Text>

        {typeof value === 'string' ? (
          <Text variant={isCompact ? 'body' : 'bodyLarge'} weight="medium" color="text-neutral-900">
            {value}
          </Text>
        ) : (
          value
        )}
      </View>
    </View>
  )
}
