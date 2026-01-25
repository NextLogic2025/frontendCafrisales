import React, { useState } from 'react'
import { View, Pressable, Modal, FlatList } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated'
import { Text } from '../../atoms/Text'
import { Divider } from '../../atoms/Divider'

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

export interface SelectProps {
  label?: string
  placeholder?: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  className?: string
}

export function Select({
  label,
  placeholder = 'Seleccionar...',
  value,
  options,
  onChange,
  error,
  disabled = false,
  className = '',
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedOption = options.find((opt) => opt.value === value)
  const displayValue = selectedOption?.label || placeholder

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <View className={className}>
      {label && (
        <Text variant="label" color="text-neutral-600" className="mb-2">
          {label}
        </Text>
      )}

      <Pressable
        onPress={() => !disabled && setIsOpen(true)}
        className={`
          flex-row items-center justify-between rounded-xl px-4 py-3
          ${error ? 'border-2 border-red700 bg-red/5' : 'border border-neutral-200 bg-white'}
          ${disabled ? 'opacity-50' : ''}
        `}
      >
        <Text
          variant="body"
          color={selectedOption ? 'text-neutral-900' : 'text-neutral-400'}
        >
          {displayValue}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={disabled ? '#D1D5DB' : '#9CA3AF'}
        />
      </Pressable>

      {error && (
        <Text variant="caption" color="text-red700" className="mt-1">
          {error}
        </Text>
      )}

      {/* Modal con opciones */}
      <Modal visible={isOpen} transparent animationType="none" onRequestClose={() => setIsOpen(false)}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="flex-1 items-center justify-center bg-black/50 px-6"
        >
          <Pressable className="absolute inset-0" onPress={() => setIsOpen(false)} />

          <Animated.View
            entering={SlideInDown.springify().damping(20)}
            exiting={SlideOutDown.springify().damping(20)}
            className="bg-white rounded-2xl w-full max-w-sm max-h-[70vh]"
          >
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-neutral-200">
              <Text variant="h4" weight="bold">
                {label || 'Seleccionar'}
              </Text>
              <Pressable onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
            </View>

            {/* Opciones */}
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              ItemSeparatorComponent={() => <Divider />}
              renderItem={({ item }) => {
                const isSelected = item.value === value
                const isDisabled = item.disabled

                return (
                  <Pressable
                    onPress={() => !isDisabled && handleSelect(item.value)}
                    className={`
                      flex-row items-center justify-between px-6 py-4
                      ${isDisabled ? 'opacity-50' : 'active:bg-neutral-50'}
                    `}
                  >
                    <Text
                      variant="body"
                      weight={isSelected ? 'semibold' : 'normal'}
                      color={isSelected ? 'text-red' : 'text-neutral-900'}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={24} color="#F0412D" />
                    )}
                  </Pressable>
                )
              }}
            />
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  )
}
