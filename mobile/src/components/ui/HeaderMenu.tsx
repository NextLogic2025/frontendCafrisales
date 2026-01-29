import React from 'react'
import { Modal, Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BRAND_COLORS } from '../../services/shared/types'
import { useStableInsets } from '../../hooks/useStableInsets'

export type HeaderMenuAction = {
  label: string
  onPress: () => void
  icon?: keyof typeof Ionicons.glyphMap
  tone?: 'default' | 'danger'
}

type Props = {
  actions: HeaderMenuAction[]
}

export function HeaderMenu({ actions }: Props) {
  const insets = useStableInsets()
  const [open, setOpen] = React.useState(false)

  const close = () => setOpen(false)
  const openMenu = () => setOpen(true)

  const handleAction = (action: HeaderMenuAction) => {
    close()
    action.onPress()
  }

  const menuTop = insets.top + 64

  return (
    <>
      <Pressable
        onPress={openMenu}
        accessibilityRole="button"
        className="h-10 w-10 bg-white/10 rounded-full items-center justify-center active:bg-white/20"
      >
        <Ionicons name="menu" size={22} color="white" />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
        statusBarTranslucent
      >
        <Pressable className="absolute inset-0" onPress={close} />
        <View className="absolute right-5" style={{ top: menuTop }}>
          <View
            className="bg-white rounded-2xl border border-neutral-200 overflow-hidden"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.12,
              shadowRadius: 12,
              elevation: 12,
              minWidth: 180,
            }}
          >
            <View className="px-4 py-3 bg-brand-cream border-b border-neutral-100">
              <Text className="text-xs font-semibold text-neutral-600">Acciones</Text>
            </View>
            {actions.map((action) => {
              const toneColor = action.tone === 'danger' ? BRAND_COLORS.red : '#111827'
              return (
                <Pressable
                  key={action.label}
                  onPress={() => handleAction(action)}
                  className="flex-row items-center px-4 py-3 active:bg-neutral-50"
                >
                  <View className="w-8 h-8 rounded-full items-center justify-center bg-neutral-100 mr-3">
                    <Ionicons
                      name={action.icon ?? 'options'}
                      size={16}
                      color={action.tone === 'danger' ? BRAND_COLORS.red : BRAND_COLORS.red700}
                    />
                  </View>
                  <Text className="text-sm font-semibold" style={{ color: toneColor }}>
                    {action.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>
      </Modal>
    </>
  )
}
