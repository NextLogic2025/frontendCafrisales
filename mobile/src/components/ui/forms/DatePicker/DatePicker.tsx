import React, { useState } from 'react'
import { View, Pressable, Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../../atoms/Text'

export interface DatePickerProps {
  label?: string
  value: Date
  onChange: (date: Date) => void
  mode?: 'date' | 'time' | 'datetime'
  minimumDate?: Date
  maximumDate?: Date
  error?: string
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function DatePicker({
  label,
  value,
  onChange,
  mode = 'date',
  minimumDate,
  maximumDate,
  error,
  disabled = false,
  placeholder = 'Seleccionar fecha',
  className = '',
}: DatePickerProps) {
  const [show, setShow] = useState(false)

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false)
    }

    if (selectedDate) {
      onChange(selectedDate)
    }
  }

  const formatDate = (date: Date) => {
    if (mode === 'time') {
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    if (mode === 'datetime') {
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const displayValue = value ? formatDate(value) : placeholder

  return (
    <View className={className}>
      {label && (
        <Text variant="label" color="text-neutral-600" className="mb-2">
          {label}
        </Text>
      )}

      <Pressable
        onPress={() => !disabled && setShow(true)}
        className={`
          flex-row items-center justify-between rounded-xl px-4 py-3
          ${error ? 'border-2 border-red700 bg-red/5' : 'border border-neutral-200 bg-white'}
          ${disabled ? 'opacity-50' : ''}
        `}
      >
        <View className="flex-row items-center gap-3 flex-1">
          <Ionicons
            name={mode === 'time' ? 'time-outline' : 'calendar-outline'}
            size={20}
            color={disabled ? '#D1D5DB' : '#9CA3AF'}
          />
          <Text
            variant="body"
            color={value ? 'text-neutral-900' : 'text-neutral-400'}
            numberOfLines={1}
          >
            {displayValue}
          </Text>
        </View>
      </Pressable>

      {error && (
        <Text variant="caption" color="text-red700" className="mt-1">
          {error}
        </Text>
      )}

      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          locale="es-ES"
          textColor="#F0412D"
        />
      )}
    </View>
  )
}
