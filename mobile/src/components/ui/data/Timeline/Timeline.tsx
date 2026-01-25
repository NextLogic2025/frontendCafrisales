import React from 'react'
import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../../atoms/Text'

export interface TimelineItem {
  id: string
  title: string
  subtitle?: string
  timestamp?: string
  icon?: keyof typeof Ionicons.glyphMap
  iconColor?: string
  isActive?: boolean
  isCompleted?: boolean
}

export interface TimelineProps {
  items: TimelineItem[]
  className?: string
}

export function Timeline({ items, className = '' }: TimelineProps) {
  return (
    <View className={className}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        const iconName = item.icon || (item.isCompleted ? 'checkmark-circle' : 'radio-button-on')
        const iconColor = item.iconColor || (item.isCompleted ? '#10B981' : item.isActive ? '#F0412D' : '#D1D5DB')

        return (
          <View key={item.id} className="flex-row">
            {/* Timeline track */}
            <View className="items-center mr-3">
              <View className="w-8 h-8 items-center justify-center rounded-full bg-white">
                <Ionicons name={iconName} size={24} color={iconColor} />
              </View>
              {!isLast && <View className="flex-1 w-0.5 bg-neutral-200 my-1" style={{ minHeight: 40 }} />}
            </View>

            {/* Content */}
            <View className={`flex-1 ${isLast ? 'pb-0' : 'pb-6'}`}>
              <Text
                variant="body"
                weight={item.isActive ? 'semibold' : 'medium'}
                color={item.isActive ? 'text-neutral-900' : 'text-neutral-700'}
              >
                {item.title}
              </Text>

              {item.subtitle && (
                <Text variant="bodySmall" color="text-neutral-500" className="mt-0.5">
                  {item.subtitle}
                </Text>
              )}

              {item.timestamp && (
                <Text variant="caption" color="text-neutral-400" className="mt-1">
                  {item.timestamp}
                </Text>
              )}
            </View>
          </View>
        )
      })}
    </View>
  )
}
