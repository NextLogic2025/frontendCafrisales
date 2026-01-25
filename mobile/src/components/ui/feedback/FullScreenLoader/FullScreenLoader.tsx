import React from 'react'
import { View, Modal } from 'react-native'
import { Spinner } from '../../atoms/Spinner'
import { Text } from '../../atoms/Text'

export interface FullScreenLoaderProps {
  visible: boolean
  text?: string
}

export function FullScreenLoader({ visible, text = 'Cargando...' }: FullScreenLoaderProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="bg-white rounded-2xl p-8 items-center gap-4 min-w-[200px]">
          <Spinner size="lg" />
          {text && (
            <Text variant="body" weight="medium" color="text-neutral-700" align="center">
              {text}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  )
}
