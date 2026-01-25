import React from 'react'
import { View } from 'react-native'
import { Text } from '../Text'

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
type BadgeSize = 'sm' | 'md' | 'lg'

export interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  icon?: React.ReactNode
  className?: string
}

const variantStyles = {
  default: {
    container: 'bg-neutral-100',
    text: 'text-neutral-700',
  },
  primary: {
    container: 'bg-red/10',
    text: 'text-red700',
  },
  secondary: {
    container: 'bg-gold/20',
    text: 'text-neutral-900',
  },
  success: {
    container: 'bg-green-100',
    text: 'text-green-700',
  },
  warning: {
    container: 'bg-yellow-100',
    text: 'text-yellow-700',
  },
  danger: {
    container: 'bg-red-100',
    text: 'text-red-700',
  },
  info: {
    container: 'bg-blue-100',
    text: 'text-blue-700',
  },
}

const sizeStyles = {
  sm: {
    container: 'px-2 py-0.5',
    text: 'caption',
  },
  md: {
    container: 'px-2.5 py-1',
    text: 'bodySmall',
  },
  lg: {
    container: 'px-3 py-1.5',
    text: 'body',
  },
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
}: BadgeProps) {
  const styles = variantStyles[variant]
  const sizes = sizeStyles[size]

  return (
    <View
      className={`
        flex-row items-center gap-1 rounded-full
        ${sizes.container}
        ${styles.container}
        ${className}
      `}
    >
      {icon && <View>{icon}</View>}
      <Text variant={sizes.text as any} weight="semibold" color={styles.text}>
        {children}
      </Text>
    </View>
  )
}
