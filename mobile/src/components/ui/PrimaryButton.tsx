import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import type { PressableProps, StyleProp, ViewStyle } from 'react-native'
import { BRAND_COLORS } from '../../features/shared/types'

type PrimaryButtonProps = {
  title: string
  loading?: boolean
  loadingText?: string
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  style?: StyleProp<ViewStyle>
  className?: string
} & Omit<PressableProps, 'style' | 'disabled'>

const sizeStyles = {
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-6 py-4',
}

const textSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

export function PrimaryButton({
  title,
  loading,
  loadingText = 'Cargando...',
  disabled,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  style,
  className,
  onPress,
  ...props
}: PrimaryButtonProps) {
  const isDisabled = loading || disabled
  const isGhost = variant === 'ghost'
  const isSecondary = variant === 'secondary'

  const bgColor = isGhost
    ? 'bg-white'
    : isSecondary
      ? 'bg-neutral-100'
      : `bg-[${BRAND_COLORS.red}]`

  const textColor = isGhost || isSecondary ? BRAND_COLORS.red : '#fff'
  const borderStyle = isGhost ? `border-2 border-[${BRAND_COLORS.red}]` : ''

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[{ opacity: isDisabled ? 0.6 : 1 }, style]}
      className={`flex-row items-center justify-center rounded-xl ${sizeStyles[size]} ${bgColor} ${borderStyle} ${className ?? ''}`}
      {...props}
    >
      {loading ? (
        <View className="flex-row items-center gap-2">
          <ActivityIndicator size="small" color={textColor} />
          <Text style={{ color: textColor }} className={`font-semibold ${textSizes[size]}`}>
            {loadingText}
          </Text>
        </View>
      ) : (
        <View className="flex-row items-center gap-2">
          {icon && iconPosition === 'left' && icon}
          <Text style={{ color: textColor }} className={`font-semibold ${textSizes[size]}`}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && icon}
        </View>
      )}
    </Pressable>
  )
}
