import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import type { PressableProps, StyleProp, ViewStyle } from 'react-native'

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

  // Tamaños
  const sizeClasses = {
    sm: 'px-4 py-2.5',
    md: 'px-5 py-3.5',
    lg: 'px-6 py-4',
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[{ opacity: isDisabled ? 0.6 : 1 }, style]}
      className={`
        flex-row items-center justify-center rounded-xl
        ${sizeClasses[size]}
        ${variant === 'primary' ? 'bg-red' : ''}
        ${variant === 'secondary' ? 'bg-neutral-100' : ''}
        ${variant === 'ghost' ? 'bg-white border-2 border-red' : ''}
        ${className ?? ''}
      `}
      {...props}
    >
      {loading ? (
        <View className="flex-row items-center gap-2">
          <ActivityIndicator size="small" color={variant === 'primary' ? '#fff' : '#F0412D'} />
          <Text
            className={`font-semibold ${textSizeClasses[size]} ${variant === 'primary' ? 'text-white' : 'text-red'}`}
          >
            {loadingText}
          </Text>
        </View>
      ) : (
        <View className="flex-row items-center gap-2">
          {icon && iconPosition === 'left' && icon}
          <Text
            className={`font-bold ${textSizeClasses[size]} ${variant === 'primary' ? 'text-white' : 'text-red'}`}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && icon}
        </View>
      )}
    </Pressable>
  )
}
