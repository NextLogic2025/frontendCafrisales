import React, { forwardRef } from 'react'
import { TextInput as RNTextInput, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { TextInput, TextInputProps } from './TextInput'

export interface SearchInputProps extends Omit<TextInputProps, 'leftIcon' | 'rightIcon' | 'onRightIconPress'> {
  onClear?: () => void
  showClearButton?: boolean
}

export const SearchInput = forwardRef<RNTextInput, SearchInputProps>(
  ({ onClear, showClearButton = true, value, ...props }, ref) => {
    const handleClear = () => {
      onClear?.()
    }

    return (
      <TextInput
        ref={ref}
        value={value}
        leftIcon={<Ionicons name="search-outline" size={20} color="#9CA3AF" />}
        rightIcon={
          showClearButton && value ? (
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          ) : undefined
        }
        onRightIconPress={showClearButton && value ? handleClear : undefined}
        {...props}
      />
    )
  }
)

SearchInput.displayName = 'SearchInput'
