import React from 'react'
import { View, Modal, Pressable } from 'react-native'
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../../atoms/Text'
import { Button } from '../../atoms/Button'
import { HStack } from '../../layout/Stack'

type AlertVariant = 'default' | 'danger' | 'warning' | 'success'

export interface AlertDialogProps {
  visible: boolean
  onClose: () => void
  title: string
  description?: string
  variant?: AlertVariant
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  onCancel?: () => void
  icon?: keyof typeof Ionicons.glyphMap
}

const variantConfig = {
  default: {
    icon: 'information-circle' as const,
    iconColor: '#3B82F6',
    iconBg: 'bg-blue-100',
  },
  danger: {
    icon: 'alert-circle' as const,
    iconColor: '#F0412D',
    iconBg: 'bg-red-100',
  },
  warning: {
    icon: 'warning' as const,
    iconColor: '#F59E0B',
    iconBg: 'bg-yellow-100',
  },
  success: {
    icon: 'checkmark-circle' as const,
    iconColor: '#10B981',
    iconBg: 'bg-green-100',
  },
}

export function AlertDialog({
  visible,
  onClose,
  title,
  description,
  variant = 'default',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  icon,
}: AlertDialogProps) {
  const config = variantConfig[variant]
  const finalIcon = icon || config.icon

  const handleConfirm = () => {
    onConfirm?.()
    onClose()
  }

  const handleCancel = () => {
    onCancel?.()
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        className="flex-1 items-center justify-center bg-black/50 px-6"
      >
        <Pressable className="absolute inset-0" onPress={onClose} />

        <Animated.View
          entering={SlideInDown.springify().damping(20)}
          exiting={SlideOutDown.springify().damping(20)}
          className="bg-white rounded-2xl p-6 w-full max-w-sm"
        >
          <View className="items-center gap-4">
            <View className={`w-16 h-16 items-center justify-center rounded-full ${config.iconBg}`}>
              <Ionicons name={finalIcon} size={32} color={config.iconColor} />
            </View>

            <View className="items-center gap-2">
              <Text variant="h4" weight="bold" color="text-neutral-900" align="center">
                {title}
              </Text>

              {description && (
                <Text variant="body" color="text-neutral-600" align="center">
                  {description}
                </Text>
              )}
            </View>

            <HStack gap="md" className="w-full mt-2">
              {onCancel !== undefined && (
                <Button variant="ghost" onPress={handleCancel} className="flex-1">
                  {cancelLabel}
                </Button>
              )}
              <Button
                variant={variant === 'danger' ? 'danger' : 'primary'}
                onPress={handleConfirm}
                className="flex-1"
              >
                {confirmLabel}
              </Button>
            </HStack>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}
