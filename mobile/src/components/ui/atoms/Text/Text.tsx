import React from 'react'
import { Text as RNText, TextProps as RNTextProps } from 'react-native'

type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'bodyLarge'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'overline'

type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold'
type TextAlign = 'left' | 'center' | 'right'

export interface TextProps extends RNTextProps {
  variant?: TextVariant
  weight?: TextWeight
  align?: TextAlign
  color?: string
  className?: string
  children: React.ReactNode
}

const variantStyles = {
  h1: 'text-4xl leading-tight',
  h2: 'text-3xl leading-tight',
  h3: 'text-2xl leading-tight',
  h4: 'text-xl leading-tight',
  title: 'text-lg leading-snug',
  subtitle: 'text-base leading-normal',
  body: 'text-sm leading-relaxed',
  bodyLarge: 'text-base leading-relaxed',
  bodySmall: 'text-xs leading-relaxed',
  caption: 'text-xs leading-snug',
  label: 'text-xs uppercase tracking-wider',
  overline: 'text-xs uppercase tracking-widest',
}

const weightStyles = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
}

const alignStyles = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

const defaultWeights: Record<TextVariant, TextWeight> = {
  h1: 'bold',
  h2: 'bold',
  h3: 'bold',
  h4: 'semibold',
  title: 'semibold',
  subtitle: 'medium',
  body: 'normal',
  bodyLarge: 'normal',
  bodySmall: 'normal',
  caption: 'normal',
  label: 'semibold',
  overline: 'semibold',
}

export function Text({
  variant = 'body',
  weight,
  align = 'left',
  color = 'text-neutral-900',
  className = '',
  children,
  style,
  ...props
}: TextProps) {
  const finalWeight = weight || defaultWeights[variant]

  return (
    <RNText
      className={`
        ${variantStyles[variant]}
        ${weightStyles[finalWeight]}
        ${alignStyles[align]}
        ${color}
        ${className}
      `}
      style={style}
      {...props}
    >
      {children}
    </RNText>
  )
}
