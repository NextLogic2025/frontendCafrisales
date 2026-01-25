import React, { forwardRef } from 'react'
import { TextInput, Text, View } from 'react-native'
import type { TextInputProps } from 'react-native'
import { BRAND_COLORS } from '../../features/shared/types'

type TextFieldProps = {
  label?: string
  error?: string
  left?: React.ReactNode
  right?: React.ReactNode
  disabled?: boolean
  variant?: 'default' | 'filled'
} & TextInputProps

export const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, error, left, right, disabled, variant = 'default', style, ...props }, ref) => {
    const isFilled = variant === 'filled'

    return (
      <View className="flex-col gap-1.5">
        {label && (
          <Text className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
            {label}
          </Text>
        )}
        <View
          className={`flex-row items-center rounded-xl px-4 py-3 ${
            isFilled ? 'bg-neutral-100' : 'border-2'
          } ${error ? 'border-red700 bg-red/5' : 'border-neutral-200'} ${
            disabled ? 'opacity-50' : ''
          }`}
        >
          {left && <View className="mr-3">{left}</View>}
          <TextInput
            ref={ref}
            className="flex-1 text-sm text-neutral-800"
            placeholderTextColor="#9CA3AF"
            editable={!disabled}
            style={[{ padding: 0 }, style]}
            {...props}
          />
          {right && <View className="ml-3">{right}</View>}
        </View>
        {error && (
          <Text style={{ color: BRAND_COLORS.red700 }} className="text-xs font-medium">
            {error}
          </Text>
        )}
      </View>
    )
  }
)

TextField.displayName = 'TextField'
