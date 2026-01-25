import React from 'react'
import { User } from 'lucide-react'
import { cn } from '@/utils'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  fallbackIcon?: React.ReactNode
}

const avatarSizes = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-16 w-16 text-xl',
  '2xl': 'h-24 w-24 text-3xl',
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, name, size = 'md', fallbackIcon, className, ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false)

    const showImage = src && !imageError
    const initials = name ? getInitials(name) : null

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center rounded-full bg-red/20 font-semibold text-red700 overflow-hidden',
          avatarSizes[size],
          className
        )}
        {...props}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : initials ? (
          <span>{initials}</span>
        ) : fallbackIcon ? (
          fallbackIcon
        ) : (
          <User className="h-1/2 w-1/2" />
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'
