import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, Platform } from 'react-native'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'
import { GenericModal } from './GenericModal'
import { BRAND_COLORS } from '../../services/shared/types'

type Props = {
  visible: boolean
  title?: string
  infoText?: string
  initialDate?: string // YYYY-MM-DD
  onSelectDate: (date: string) => void
  onClear?: () => void
  onClose: () => void
}

function parseDate(dateStr?: string): Date {
  if (!dateStr) return new Date()
  const [year, month, day] = dateStr.split('-').map(Number)
  if (!year || !month || !day) return new Date()
  return new Date(year, month - 1, day)
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function DatePickerModal({
  visible,
  title = 'Seleccionar fecha',
  infoText = 'Elige la fecha de vencimiento',
  initialDate,
  onSelectDate,
  onClear,
  onClose,
}: Props) {
  const [selectedDate, setSelectedDate] = useState<Date>(parseDate(initialDate))
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios')

  useEffect(() => {
    if (visible) {
      setSelectedDate(parseDate(initialDate))
      setShowPicker(Platform.OS === 'ios')
    }
  }, [visible, initialDate])

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false)
    }

    if (date && event.type === 'set') {
      setSelectedDate(date)
      const formatted = formatDate(date)
      onSelectDate(formatted)
      if (Platform.OS === 'android') {
        onClose()
      }
    } else if (event.type === 'dismissed') {
      setShowPicker(false)
      if (Platform.OS === 'android') {
        onClose()
      }
    }
  }

  const handleConfirm = () => {
    onSelectDate(formatDate(selectedDate))
    onClose()
  }

  return (
    <GenericModal visible={visible} title={title} onClose={onClose}>
      <View>
        <View className="p-3 rounded-xl mb-4 flex-row items-center" style={{ backgroundColor: BRAND_COLORS.cream }}>
          <Ionicons name="calendar-outline" size={20} color={BRAND_COLORS.gold} />
          <Text className="text-sm ml-2 flex-1" style={{ color: '#92400E' }}>
            {infoText}
          </Text>
        </View>

        {showPicker && (
          <View className="items-center py-4">
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              themeVariant="light"
            />
          </View>
        )}

        {Platform.OS === 'android' && !showPicker && (
          <TouchableOpacity
            onPress={() => setShowPicker(true)}
            className="p-4 rounded-xl items-center border-2 mb-4"
            style={{ borderColor: BRAND_COLORS.red, backgroundColor: '#FEF2F2' }}
          >
            <Text className="font-bold text-lg" style={{ color: BRAND_COLORS.red }}>
              {formatDate(selectedDate)}
            </Text>
            <Text className="text-sm mt-1" style={{ color: BRAND_COLORS.red700 }}>
              Toca para cambiar
            </Text>
          </TouchableOpacity>
        )}

        <View className="flex-row gap-3">
          {onClear && initialDate && (
            <TouchableOpacity
              onPress={() => {
                onClear()
                onClose()
              }}
              className="flex-1 py-3 rounded-xl items-center"
              style={{ backgroundColor: '#F3F4F6' }}
            >
              <Text className="font-medium" style={{ color: '#6B7280' }}>
                Limpiar fecha
              </Text>
            </TouchableOpacity>
          )}

          {Platform.OS === 'ios' && (
            <TouchableOpacity
              onPress={handleConfirm}
              className="flex-1 py-3 rounded-xl items-center"
              style={{ backgroundColor: BRAND_COLORS.red }}
            >
              <Text className="text-white font-bold">Confirmar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </GenericModal>
  )
}
