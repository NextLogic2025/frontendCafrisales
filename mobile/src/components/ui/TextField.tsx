import * as React from 'react'
import { Text, TextInput, TextInputProps, View } from 'react-native'

/**
 * Props for TextField component.
 * Extends native TextInput props for full flexibility.
 */
type TextFieldProps = {
  /** Label displayed above the input */
  label: string
  /** Error message displayed below the input */
  error?: string
  /** Element to render on the left side of the input */
  left?: React.ReactNode
  /** Element to render on the right side of the input */
  right?: React.ReactNode
} & Omit<TextInputProps, 'style'>

export const TextField = React.memo(function TextField({
  label,
  error,
  left,
  right,
  ...inputProps
}: TextFieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-xs text-neutral-600">{label}</Text>
      <View
        className={[
          'flex-row items-center gap-2 rounded-2xl border px-4 py-3',
          'bg-neutral-50 border-neutral-200',
          error ? 'border-red-400/60' : '',
        ].join(' ')}
      >
        {left ? <View className="opacity-70">{left}</View> : null}
        <TextInput
          className="flex-1 text-neutral-900"
          placeholderTextColor="rgba(17,24,39,0.45)"
          {...inputProps}
        />
        {right ? <View>{right}</View> : null}
      </View>
      {error ? <Text className="text-xs text-red-700">{error}</Text> : null}
    </View>
  )
})
