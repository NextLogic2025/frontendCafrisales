import React from 'react'
import { View, Image, ImageSourcePropType } from 'react-native'
import { Text } from '../Text'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export interface AvatarProps {
  source?: ImageSourcePropType | { uri: string }
  name?: string
  size?: AvatarSize
  className?: string
}

const sizeStyles = {
  xs: { container: 'w-6 h-6', text: 'caption' },
  sm: { container: 'w-8 h-8', text: 'caption' },
  md: { container: 'w-10 h-10', text: 'body' },
  lg: { container: 'w-12 h-12', text: 'body' },
  xl: { container: 'w-16 h-16', text: 'title' },
  '2xl': { container: 'w-24 h-24', text: 'h4' },
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

export function Avatar({ source, name, size = 'md', className = '' }: AvatarProps) {
  const styles = sizeStyles[size]

  return (
    <View
      className={`
        items-center justify-center rounded-full overflow-hidden bg-red/20
        ${styles.container}
        ${className}
      `}
    >
      {source ? (
        <Image source={source} className="w-full h-full" resizeMode="cover" />
      ) : name ? (
        <Text variant={styles.text as any} weight="semibold" color="text-red700">
          {getInitials(name)}
        </Text>
      ) : (
        <View className="w-full h-full bg-neutral-300" />
      )}
    </View>
  )
}
