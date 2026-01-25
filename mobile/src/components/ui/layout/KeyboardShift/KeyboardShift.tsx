import React from 'react'
import {
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native'

export interface KeyboardShiftProps extends KeyboardAvoidingViewProps {
  children: React.ReactNode
  dismissOnTap?: boolean
}

export function KeyboardShift({
  children,
  dismissOnTap = true,
  behavior,
  keyboardVerticalOffset = 0,
  ...props
}: KeyboardShiftProps) {
  const defaultBehavior = Platform.OS === 'ios' ? 'padding' : 'height'

  const content = (
    <KeyboardAvoidingView
      behavior={behavior || defaultBehavior}
      keyboardVerticalOffset={keyboardVerticalOffset}
      className="flex-1"
      {...props}
    >
      {children}
    </KeyboardAvoidingView>
  )

  if (dismissOnTap) {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {content}
      </TouchableWithoutFeedback>
    )
  }

  return content
}
