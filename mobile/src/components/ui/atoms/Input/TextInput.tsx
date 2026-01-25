import React, { forwardRef, useState } from 'react'
import { TextInput as RNTextInput, View, Pressable } from 'react-native'
import type { TextInputProps as RNTextInputProps } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { Text } from '../Text'

type InputVariant = 'default' | 'filled' | 'outlined'

export interface TextInputProps extends RNTextInputProps {
  label?: string
  error?: string
  helper?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  disabled?: boolean
  variant?: InputVariant
  onRightIconPress?: () => void
}

export const TextInput = forwardRef<RNTextInput, TextInputProps>(
  (
    {
      label,
      error,
      helper,
      leftIcon,
      rightIcon,
      disabled,
      variant = 'default',
      onRightIconPress,
      onFocus,
      onBlur,
      className = '',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const borderScale = useSharedValue(1)

    const isFilled = variant === 'filled'
    const isOutlined = variant === 'outlined'

    const animatedBorderStyle = useAnimatedStyle(() => ({
      borderWidth: borderScale.value,
    }))

    const handleFocus = (e: any) => {
      setIsFocused(true)
      borderScale.value = withTiming(2, { duration: 200 })
      onFocus?.(e)
    }

    const handleBlur = (e: any) => {
      setIsFocused(false)
      borderScale.value = withTiming(1, { duration: 200 })
      onBlur?.(e)
    }

    const getBorderColor = () => {
      if (error) return 'border-red700'
      if (isFocused) return 'border-red'
      return 'border-neutral-200'
    }

    const getBackgroundColor = () => {
      if (error) return 'bg-red/5'
      if (isFilled) return 'bg-neutral-100'
      return 'bg-white'
    }

    return (
      <View className="flex-col gap-1.5">
        {label && (
          <Text variant="label" color="text-neutral-600">
            {label}
          </Text>
        )}

        <Animated.View
          style={isOutlined ? animatedBorderStyle : undefined}
          className={`
            flex-row items-center rounded-xl px-4 py-3
            ${isOutlined || !isFilled ? 'border' : ''}
            ${getBorderColor()}
            ${getBackgroundColor()}
            ${disabled ? 'opacity-50' : ''}
          `}
        >
          {leftIcon && <View className="mr-3">{leftIcon}</View>}

          <RNTextInput
            ref={ref}
            className={`flex-1 text-sm text-neutral-800 ${className}`}
            placeholderTextColor="#9CA3AF"
            editable={!disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{ padding: 0 }}
            {...props}
          />

          {rightIcon && (
            <Pressable onPress={onRightIconPress} className="ml-3">
              {rightIcon}
            </Pressable>
          )}
        </Animated.View>

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
)

TextInput.displayName = 'TextInput'
