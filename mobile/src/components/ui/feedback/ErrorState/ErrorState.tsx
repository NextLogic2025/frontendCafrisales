import React from 'react'
import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../../atoms/Text'
import { Button } from '../../atoms/Button'

export interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

export function ErrorState({
  title = 'Algo salió mal',
  message = 'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
  onRetry,
  retryLabel = 'Reintentar',
  className = '',
}: ErrorStateProps) {
  return (
    <View className={`flex-1 items-center justify-center px-8 py-12 ${className}`}>
      <View className="items-center gap-4">
        <View className="w-20 h-20 items-center justify-center rounded-full bg-red/10">
          <Ionicons name="alert-circle-outline" size={40} color="#F0412D" />
        </View>

        <View className="items-center gap-2">
          <Text variant="title" weight="semibold" color="text-neutral-900" align="center">
            {title}
          </Text>

          <Text variant="body" color="text-neutral-500" align="center">
            {message}
          </Text>
        </View>

        {onRetry && (
          <Button
            variant="primary"
            onPress={onRetry}
            icon={<Ionicons name="refresh" size={18} color="#FFFFFF" />}
            className="mt-4"
          >
            {retryLabel}
          </Button>
        )}
      </View>
    </View>
  )
}
