import React, { forwardRef, useState } from 'react'
import { TextInput as RNTextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { TextInput, TextInputProps } from './TextInput'

export type PasswordInputProps = Omit<TextInputProps, 'secureTextEntry' | 'rightIcon' | 'onRightIconPress'>

export const PasswordInput = forwardRef<RNTextInput, PasswordInputProps>(
  (props, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev)
    }

    return (
      <TextInput
        ref={ref}
        secureTextEntry={!showPassword}
        rightIcon={
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#9CA3AF"
          />
        }
        onRightIconPress={togglePasswordVisibility}
        {...props}
      />
    )
  }
)

PasswordInput.displayName = 'PasswordInput'
