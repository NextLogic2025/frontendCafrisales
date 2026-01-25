import React from 'react'
import { View } from 'react-native'
import { Text } from '../../atoms/Text'

export interface FormFieldProps {
  label?: string
  error?: string
  helper?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export function FormField({
  label,
  error,
  helper,
  required = false,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <View className={`gap-1.5 ${className}`}>
      {label && (
        <Text variant="label" color="text-neutral-600">
          {label}
          {required && <Text color="text-red"> *</Text>}
        </Text>
      )}

      {children}

      {error && (
        <Text variant="caption" color="text-red700">
          {error}
        </Text>
      )}

      {helper && !error && (
        <Text variant="caption" color="text-neutral-500">
          {helper}
        </Text>
      )}
    </View>
  )
}
