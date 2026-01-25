import React from 'react'
import { View, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../../atoms/Text'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

export type TabItem = {
  key: string
  label: string
  icon: keyof typeof Ionicons.glyphMap
  iconActive: keyof typeof Ionicons.glyphMap
}

export interface TabBarProps {
  tabs: TabItem[]
  activeTab: string
  onTabPress: (tabKey: string) => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

function TabBarItem({
  tab,
  isActive,
  onPress,
}: {
  tab: TabItem
  isActive: boolean
  onPress: () => void
}) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 })
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className="flex-1 items-center justify-center py-2"
    >
      <Ionicons
        name={isActive ? tab.iconActive : tab.icon}
        size={24}
        color={isActive ? '#F0412D' : '#9CA3AF'}
      />
      <Text
        variant="caption"
        weight={isActive ? 'semibold' : 'normal'}
        color={isActive ? 'text-red' : 'text-neutral-400'}
        className="mt-1"
      >
        {tab.label}
      </Text>
    </AnimatedPressable>
  )
}

export function TabBar({ tabs, activeTab, onTabPress }: TabBarProps) {
  const insets = useSafeAreaInsets()
  const bottomPadding = Math.max(insets.bottom, 12)

  return (
    <View
      style={{ paddingBottom: bottomPadding }}
      className="bg-white border-t border-neutral-200 flex-row"
    >
      {tabs.map((tab) => (
        <TabBarItem
          key={tab.key}
          tab={tab}
          isActive={activeTab === tab.key}
          onPress={() => onTabPress(tab.key)}
        />
      ))}
    </View>
  )
}

// Tabs predefinidas para usar en todos los roles
export const DEFAULT_TABS: TabItem[] = [
  {
    key: 'inicio',
    label: 'Inicio',
    icon: 'home-outline',
    iconActive: 'home',
  },
  {
    key: 'perfil',
    label: 'Perfil',
    icon: 'person-outline',
    iconActive: 'person',
  },
]
