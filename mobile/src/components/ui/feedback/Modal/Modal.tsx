import React from 'react'
import { View, Modal as RNModal, Pressable, ScrollView } from 'react-native'
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../../atoms/Text'
import { IconButton } from '../../atoms/Button'

export interface ModalProps {
  visible: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  scrollable?: boolean
  showCloseButton?: boolean
  size?: 'sm' | 'md' | 'lg' | 'full'
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  full: 'w-full h-full',
}

export function Modal({
  visible,
  onClose,
  title,
  children,
  scrollable = true,
  showCloseButton = true,
  size = 'md',
}: ModalProps) {
  const insets = useSafeAreaInsets()
  const isFull = size === 'full'

  const Content = scrollable && !isFull ? ScrollView : View

  return (
    <RNModal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        className={`flex-1 ${isFull ? '' : 'items-center justify-center bg-black/50 px-6'}`}
      >
        {!isFull && <Pressable className="absolute inset-0" onPress={onClose} />}

        <Animated.View
          entering={SlideInDown.springify().damping(20)}
          exiting={SlideOutDown.springify().damping(20)}
          style={isFull ? { paddingTop: insets.top } : undefined}
          className={`bg-white ${isFull ? 'flex-1' : `rounded-2xl ${sizeStyles[size]}`}`}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-neutral-200">
              {title ? (
                <Text variant="h4" weight="bold" color="text-neutral-900" className="flex-1">
                  {title}
                </Text>
              ) : (
                <View className="flex-1" />
              )}

              {showCloseButton && (
                <IconButton
                  icon={<Ionicons name="close" size={24} color="#374151" />}
                  onPress={onClose}
                  variant="ghost"
                />
              )}
            </View>
          )}

          {/* Content */}
          <Content className={scrollable && !isFull ? 'max-h-[70vh]' : 'flex-1'}>
            <View className={`p-6 ${scrollable && !isFull ? '' : 'flex-1'}`}>{children}</View>
          </Content>
        </Animated.View>
      </Animated.View>
    </RNModal>
  )
}
